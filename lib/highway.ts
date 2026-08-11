import {
  approachPalette,
  createLivePalette,
  hazed,
  rgba,
  SCENE_PALETTE,
  type LivePalette,
} from "@/lib/palette";
import type { PhaseId } from "@/lib/types";

export const HIGHWAY = {
  HORIZON: 0.545,
  FOCAL: 0.95,
  CAMERA_HEIGHT: 2.75,
  NEAR_Z: 4.6,
  FAR_Z: 300,
  SPEED: 27,

  ROAD_HALF: 5.6,
  SHOULDER: 3.4,
  EDGE_INSET: 0.45,
  EDGE_WIDTH: 0.16,
  LANE_WIDTH: 0.17,
  DASH_LENGTH: 3.4,
  DASH_GAP: 7.4,
  DASH_FAR_Z: 200,

  POLE_COUNT: 7,
  POLE_SPACING: 44,
  POLE_OFFSET: 4.6,
  POLE_HEIGHT: 8.4,
  WIRE_SAG: 1.5,

  PROP_COUNT: 26,
  PROP_SPREAD: 26,
  DUST_COUNT: 44,
  DUST_DRAG: 0.82,

  STUD_SPACING: 14,
  STUD_FAR_Z: 150,
  PLUME_COUNT: 34,
  PLUME_RISE: 1.5,
  PATCH_COUNT: 7,
  CLOUD_COUNT: 7,
  CLOUD_DRIFT: 0.0042,
  TOWN_COUNT: 4,


  ROAD_SEGMENTS: 24,
  CURVE_AMPLITUDE: 2.2e-4,
  CURVE_PERIOD_A: 900,
  CURVE_PERIOD_B: 380,
  HILL_AMPLITUDE: 4e-5,
  HILL_PERIOD_A: 640,
  HILL_PERIOD_B: 260,
  RIDGE_CURVE_GAIN: 26_000,
  DRIFT_METRES: 5,
  DRIFT_MOVE_SECONDS: 3.4,
  DRIFT_HOLD_SECONDS: 5.5,
  DRIFT_EVERY_SECONDS: 46,
  DRIFT_EDGE_MARGIN: 16,
  DRIFT_EDGE_FRACTION: 0.045,

  BRIDGE_MIN_GAP: 700,
  BRIDGE_MAX_GAP: 1600,
  BRIDGE_CLEARANCE: 6.2,
  BRIDGE_THICKNESS: 1.6,
  BRIDGE_SPAN: 16,
  BRIDGE_PILLAR: 11,

  RIDGE_SAMPLES: 72,
  RIDGE_FAR_HEIGHT: 0.115,
  RIDGE_NEAR_HEIGHT: 0.07,
  RIDGE_DRIFT: 4,
  RIDGE_PARALLAX: 2.4,

  TRAFFIC_MIN_GAP: 4.5,
  TRAFFIC_MAX_GAP: 15,
  TRAFFIC_CLOSING_SPEED: 21,

  PALETTE_TAU: 0.7,
  MAX_DPR: 2,
} as const;

export const TRUCK = {
  VIEWBOX_WIDTH: 340,
  VIEWBOX_HEIGHT: 440,
  WIDTH_METRES: 3.03,
  BODY_LENGTH_METRES: 7.5,
  ASPECT: 440 / 340,
  WHEEL_LINE: 419 / 440,
  BOTTOM: 0.14,
  BOTTOM_COMPACT: 0.26,
  COMPACT_MAX_WIDTH: 720,
  MAX_VIEWPORT_FRACTION: 0.78,
  BODY_LEFT: 24,
  BODY_CENTRE: 170,
  BODY_TOP: 80,
  BODY_BOTTOM: 304,
} as const;

const UNITS_PER_METRE = TRUCK.VIEWBOX_WIDTH / TRUCK.WIDTH_METRES;

export function truckWidthRatio(bottom: number = TRUCK.BOTTOM): number {
  let ratio = 0.33;
  for (let i = 0; i < 12; i++) {
    ratio = (TRUCK.WIDTH_METRES * HIGHWAY.FOCAL) / distanceForRatio(ratio, bottom);
  }
  return ratio;
}

function distanceForRatio(ratio: number, bottom: number): number {
  const height = ratio * TRUCK.ASPECT;
  const wheels = 1 - bottom - height * (1 - TRUCK.WHEEL_LINE);
  return (HIGHWAY.CAMERA_HEIGHT * HIGHWAY.FOCAL) / (wheels - HIGHWAY.HORIZON);
}

export const TRUCK_DISTANCE = distanceForRatio(truckWidthRatio(), TRUCK.BOTTOM);
export const TRUCK_DISTANCE_COMPACT = distanceForRatio(
  truckWidthRatio(TRUCK.BOTTOM_COMPACT),
  TRUCK.BOTTOM_COMPACT,
);

export interface View {
  width: number;
  height: number;
  cx: number;
  horizon: number;
  focal: number;
  curve: number;
  hill: number;
  cameraX: number;
}

export function makeView(width: number, height: number): View {
  return {
    width,
    height,
    cx: width / 2,
    horizon: height * HIGHWAY.HORIZON,
    focal: height * HIGHWAY.FOCAL,
    curve: 0,
    hill: 0,
    cameraX: 0,
  };
}

const FLANK_THRESHOLD_METRES = (TRUCK.BODY_CENTRE - TRUCK.BODY_LEFT) / UNITS_PER_METRE;

export function flankOpen(cameraX: number): number {
  const span = HIGHWAY.DRIFT_METRES - FLANK_THRESHOLD_METRES;
  return clamp01((Math.abs(cameraX) - FLANK_THRESHOLD_METRES) / span);
}

const VANISH_X = TRUCK.BODY_CENTRE - HIGHWAY.DRIFT_METRES * UNITS_PER_METRE;
const VANISH_Y = TRUCK.WHEEL_LINE * TRUCK.VIEWBOX_HEIGHT - HIGHWAY.CAMERA_HEIGHT * UNITS_PER_METRE;

export const flankScale = (t: number) =>
  TRUCK_DISTANCE / (TRUCK_DISTANCE + TRUCK.BODY_LENGTH_METRES * t);

export function flankPoint(x: number, y: number, t: number): [number, number] {
  const shrink = flankScale(t);
  return [VANISH_X + shrink * (x - VANISH_X), VANISH_Y + shrink * (y - VANISH_Y)];
}

/* -------------------------------------------------------------------------- */
/* Projection                                                                  */
/* A flat ground plane under a pinhole camera. Straight lines stay straight, so */
/* the road is an exact quad and every prop is one divide.                      */
/* -------------------------------------------------------------------------- */

const scaleAt = (view: View, z: number) => view.focal / z;

/** Quadratic falloff shared by the bend and the gradient. */
function depth2(z: number): number {
  const ahead = z - HIGHWAY.NEAR_Z;
  return ahead * ahead;
}

const projectX = (view: View, x: number, z: number) =>
  view.cx + ((x - view.cameraX + view.curve * depth2(z)) * view.focal) / z;

const projectY = (view: View, z: number) =>
  view.horizon + ((HIGHWAY.CAMERA_HEIGHT - view.hill * depth2(z)) * view.focal) / z;

/** Where the road's centreline has drifted to at a given distance, in metres. */
export const roadOffset = (curve: number, z: number) => curve * depth2(z);
export const roadRise = (hill: number, z: number) => hill * depth2(z);

/* -------------------------------------------------------------------------- */
/* State                                                                       */
/* -------------------------------------------------------------------------- */

type PropKind = "tree" | "slim" | "bush" | "milestone" | "board";

/** One silhouette repeated down the whole road reads as wallpaper, so the
 *  broad neem shape is mixed with a tall thin one. */
const PROP_WEIGHTS: ReadonlyArray<[PropKind, number]> = [
  ["tree", 0.34],
  ["slim", 0.16],
  ["bush", 0.28],
  ["milestone", 0.14],
  ["board", 0.08],
];

interface Prop {
  z: number;
  side: -1 | 1;
  offset: number;
  kind: PropKind;
  scale: number;
}

interface Mote {
  z: number;
  x: number;
  y: number;
  size: number;
}

interface Vehicle {
  z: number;
  x: number;
  width: number;
  height: number;
}

interface Patch {
  z: number;
  x: number;
  length: number;
  width: number;
  tone: number;
}

interface Cloud {
  /** 0–1 across the frame; wraps. */
  x: number;
  /** Height above the horizon, as a fraction of canvas height. */
  y: number;
  width: number;
  squash: number;
  drift: number;
}

interface Town {
  /** 0–1 across the frame; wraps with the ridges. */
  x: number;
  width: number;
  glow: number;
}

export interface HighwayState {
  travel: number;
  /** Current road shape — see the CURVE/HILL constants. */
  curve: number;
  hill: number;
  /** Seconds into the overtake cycle. */
  driftClock: number;
  /** 0 tucked in behind, 1 fully alongside. Metres are applied at draw time,
   *  because how far we can pull out depends on the frame. */
  drift: number;
  /** How far ahead the truck is. Frame-dependent, so the draw pass sets it. */
  truckZ: number;
  /** Distance until the next overpass. */
  nextBridge: number;
  bridges: number[];
  ridgeOffset: number;
  ridgeFar: number[];
  ridgeNear: number[];
  poles: number[];
  props: Prop[];
  dust: Mote[];
  plume: Mote[];
  patches: Patch[];
  clouds: Cloud[];
  towns: Town[];
  traffic: Vehicle[];
  nextVehicle: number;
  palette: LivePalette;
}

const between = (min: number, max: number) => min + Math.random() * (max - min);
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function pickKind(): PropKind {
  let roll = Math.random();
  for (const [kind, weight] of PROP_WEIGHTS) {
    roll -= weight;
    if (roll <= 0) return kind;
  }
  return "bush";
}

function seedProp(prop: Prop, z: number): void {
  prop.z = z;
  prop.side = Math.random() < 0.5 ? -1 : 1;
  prop.offset = between(1.2, HIGHWAY.PROP_SPREAD);
  prop.kind = pickKind();
  prop.scale = between(0.7, 1.45);
}

function seedMote(mote: Mote, z: number): void {
  mote.z = z;
  mote.x = between(-HIGHWAY.ROAD_HALF * 2.4, HIGHWAY.ROAD_HALF * 2.4);
  mote.y = between(0.1, 4.5);
  mote.size = between(0.04, 0.3);
}

/** Plume motes are born under the truck's wheels and blow back at us. */
function seedPlume(mote: Mote, truckZ: number): void {
  mote.z = truckZ - between(0, 0.8);
  mote.x = between(-TRUCK.WIDTH_METRES / 2, TRUCK.WIDTH_METRES / 2);
  mote.y = between(0, 0.3);
  mote.size = between(0.12, 0.5);
}

function seedPatch(patch: Patch, z: number): void {
  patch.z = z;
  patch.x = between(-HIGHWAY.ROAD_HALF * 0.75, HIGHWAY.ROAD_HALF * 0.75);
  patch.length = between(3, 14);
  patch.width = between(1, 3.4);
  patch.tone = between(0.05, 0.16);
}

/**
 * A closed ridge profile. Only integer harmonics are used so the last sample
 * meets the first — that is what lets the silhouette scroll forever without a
 * visible seam.
 */
function makeRidge(roughness: number): number[] {
  const phases = [0, 1, 2, 3].map(() => Math.random() * Math.PI * 2);
  return Array.from({ length: HIGHWAY.RIDGE_SAMPLES }, (_, index) => {
    const t = (index / HIGHWAY.RIDGE_SAMPLES) * Math.PI * 2;
    const value =
      0.52 +
      0.26 * Math.sin(t + phases[0]) +
      0.15 * Math.sin(2 * t + phases[1]) +
      0.09 * Math.sin(3 * t + phases[2]) +
      0.05 * Math.sin(5 * t + phases[3]);
    return Math.max(0.1, value * roughness);
  });
}

export function createHighway(phase: PhaseId): HighwayState {
  const props = Array.from({ length: HIGHWAY.PROP_COUNT }, () => {
    const prop = {} as Prop;
    seedProp(prop, between(HIGHWAY.NEAR_Z, HIGHWAY.FAR_Z));
    return prop;
  });

  const dust = Array.from({ length: HIGHWAY.DUST_COUNT }, () => {
    const mote = {} as Mote;
    seedMote(mote, between(HIGHWAY.NEAR_Z, HIGHWAY.FAR_Z * 0.5));
    return mote;
  });

  const plume = Array.from({ length: HIGHWAY.PLUME_COUNT }, () => {
    const mote = {} as Mote;
    seedPlume(mote, TRUCK_DISTANCE);
    mote.z = between(HIGHWAY.NEAR_Z, TRUCK_DISTANCE);
    return mote;
  });

  const patches = Array.from({ length: HIGHWAY.PATCH_COUNT }, () => {
    const patch = {} as Patch;
    seedPatch(patch, between(HIGHWAY.NEAR_Z, HIGHWAY.DASH_FAR_Z));
    return patch;
  });

  return {
    travel: 0,
    curve: 0,
    hill: 0,
    driftClock: 0,
    drift: 0,
    truckZ: TRUCK_DISTANCE,
    nextBridge: between(HIGHWAY.BRIDGE_MIN_GAP, HIGHWAY.BRIDGE_MAX_GAP),
    bridges: [],
    ridgeOffset: 0,
    ridgeFar: makeRidge(1),
    ridgeNear: makeRidge(0.86),
    poles: Array.from({ length: HIGHWAY.POLE_COUNT }, (_, i) => HIGHWAY.NEAR_Z + i * HIGHWAY.POLE_SPACING),
    props,
    dust,
    plume,
    patches,
    clouds: Array.from({ length: HIGHWAY.CLOUD_COUNT }, () => ({
      x: Math.random(),
      y: between(0.05, 0.3),
      width: between(0.16, 0.42),
      squash: between(0.16, 0.3),
      drift: between(0.6, 1.5),
    })),
    towns: Array.from({ length: HIGHWAY.TOWN_COUNT }, () => ({
      x: Math.random(),
      width: between(0.06, 0.2),
      glow: between(0.5, 1),
    })),
    traffic: [],
    nextVehicle: between(HIGHWAY.TRAFFIC_MIN_GAP, HIGHWAY.TRAFFIC_MAX_GAP),
    palette: createLivePalette(phase),
  };
}

/* -------------------------------------------------------------------------- */
/* Simulation                                                                  */
/* -------------------------------------------------------------------------- */

export function stepHighway(state: HighwayState, dt: number, phase: PhaseId): void {
  const advance = HIGHWAY.SPEED * dt;
  const cycle = HIGHWAY.POLE_SPACING * state.poles.length;

  state.travel += advance;

  // Two out-of-step sine waves per axis: enough to read as a road somebody
  // surveyed, and it never repeats on a period you would notice.
  const t = state.travel;
  state.curve =
    HIGHWAY.CURVE_AMPLITUDE *
    (Math.sin(t / HIGHWAY.CURVE_PERIOD_A) + 0.5 * Math.sin(t / HIGHWAY.CURVE_PERIOD_B + 1.7));
  state.hill =
    HIGHWAY.HILL_AMPLITUDE *
    (Math.sin(t / HIGHWAY.HILL_PERIOD_A + 0.6) + 0.6 * Math.sin(t / HIGHWAY.HILL_PERIOD_B + 2.9));

  // Leaning into a bend swings the horizon scenery, which is most of what
  // sells the turn.
  state.ridgeOffset += (HIGHWAY.RIDGE_DRIFT + state.curve * HIGHWAY.RIDGE_CURVE_GAIN) * dt;

  // Pull out, hold alongside, tuck back in, wait. Smoothstepped so the move
  // starts and lands softly rather than snapping into the lane.
  const driftCycle =
    HIGHWAY.DRIFT_MOVE_SECONDS * 2 + HIGHWAY.DRIFT_HOLD_SECONDS + HIGHWAY.DRIFT_EVERY_SECONDS;
  state.driftClock = (state.driftClock + dt) % driftCycle;
  const smooth = (p: number) => p * p * (3 - 2 * p);
  const outEnd = HIGHWAY.DRIFT_MOVE_SECONDS;
  const holdEnd = outEnd + HIGHWAY.DRIFT_HOLD_SECONDS;
  const backEnd = holdEnd + HIGHWAY.DRIFT_MOVE_SECONDS;

  if (state.driftClock < outEnd) state.drift = smooth(state.driftClock / outEnd);
  else if (state.driftClock < holdEnd) state.drift = 1;
  else if (state.driftClock < backEnd) {
    state.drift = smooth(1 - (state.driftClock - holdEnd) / HIGHWAY.DRIFT_MOVE_SECONDS);
  } else state.drift = 0;

  state.nextBridge -= advance;
  if (state.nextBridge <= 0) {
    state.nextBridge = between(HIGHWAY.BRIDGE_MIN_GAP, HIGHWAY.BRIDGE_MAX_GAP);
    state.bridges.push(HIGHWAY.FAR_Z);
  }
  for (let i = 0; i < state.bridges.length; i++) state.bridges[i] -= advance;
  while (state.bridges.length > 0 && state.bridges[0] < HIGHWAY.NEAR_Z) state.bridges.shift();

  for (let i = 0; i < state.poles.length; i++) {
    state.poles[i] -= advance;
    if (state.poles[i] < HIGHWAY.NEAR_Z) state.poles[i] += cycle;
  }

  for (const prop of state.props) {
    prop.z -= advance;
    if (prop.z < HIGHWAY.NEAR_Z) seedProp(prop, HIGHWAY.FAR_Z + between(0, 45));
  }

  for (const mote of state.dust) {
    mote.z -= advance * HIGHWAY.DUST_DRAG;
    if (mote.z < HIGHWAY.NEAR_Z) seedMote(mote, HIGHWAY.FAR_Z * between(0.35, 0.6));
  }

  // The plume drifts back at us and rises; it only ever occupies the gap
  // between the truck's wheels and the camera.
  for (const mote of state.plume) {
    mote.z -= advance * 0.22;
    mote.y += HIGHWAY.PLUME_RISE * dt;
    mote.size += dt * 0.55;
    if (mote.z < HIGHWAY.NEAR_Z) seedPlume(mote, state.truckZ);
  }

  for (const patch of state.patches) {
    patch.z -= advance;
    if (patch.z + patch.length < HIGHWAY.NEAR_Z) {
      seedPatch(patch, HIGHWAY.DASH_FAR_Z + between(0, 60));
    }
  }

  for (const cloud of state.clouds) {
    cloud.x = (cloud.x + HIGHWAY.CLOUD_DRIFT * cloud.drift * dt + 1) % 1;
  }

  // Oncoming traffic keeps the road from feeling abandoned, and at night the
  // approaching headlights are most of the drama.
  state.nextVehicle -= dt;
  if (state.nextVehicle <= 0) {
    state.nextVehicle = between(HIGHWAY.TRAFFIC_MIN_GAP, HIGHWAY.TRAFFIC_MAX_GAP);
    const heavy = Math.random() < 0.4;
    state.traffic.push({
      z: HIGHWAY.FAR_Z,
      // India drives left, so anything coming the other way passes on our right.
      x: between(2.2, 4.4),
      width: heavy ? between(2.5, 3) : between(1.7, 2),
      height: heavy ? between(3.2, 3.9) : between(1.4, 1.7),
    });
  }

  const closing = advance + HIGHWAY.TRAFFIC_CLOSING_SPEED * dt;
  for (const vehicle of state.traffic) vehicle.z -= closing;
  if (state.traffic.length > 0 && state.traffic[0].z < HIGHWAY.NEAR_Z * 0.5) state.traffic.shift();

  approachPalette(state.palette, SCENE_PALETTE[phase], 1 - Math.exp(-dt / HIGHWAY.PALETTE_TAU));
}

/* -------------------------------------------------------------------------- */
/* Drawing                                                                     */
/* -------------------------------------------------------------------------- */

type Ctx = CanvasRenderingContext2D;

/**
 * A strip of ground between two distances, walked in steps so it follows the
 * bend and the gradient. One path with 2×steps points is far cheaper than
 * `steps` separate quads, and leaves no seams between them.
 *
 * Samples are spaced geometrically. Screen y goes as 1/z while the bend's screen
 * x goes as z, so neither even-in-metres nor even-in-1/z samples both ends
 * well — measured against the true curve, even-in-1/z still faceted by 19 px at
 * 20 steps and 2.6 px at 64. Equal *ratios* split the difference and come in
 * under half a pixel at 20.
 */
function band(
  ctx: Ctx,
  view: View,
  left: number,
  right: number,
  zNear: number,
  zFar: number,
  steps = 1,
) {
  const ratio = zFar / zNear;
  const at = (i: number) => zNear * ratio ** (i / steps);

  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const z = at(i);
    const y = projectY(view, z);
    const x = projectX(view, left, z);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let i = steps; i >= 0; i--) {
    const z = at(i);
    ctx.lineTo(projectX(view, right, z), projectY(view, z));
  }
  ctx.closePath();
  ctx.fill();
}

function drawRidge(
  ctx: Ctx,
  view: View,
  profile: number[],
  offset: number,
  height: number,
  fill: string,
) {
  const span = view.width;
  const base = view.horizon + 2;
  const shift = -(offset % span);

  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(shift, base);
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i <= profile.length; i++) {
      const x = shift + pass * span + (i / profile.length) * span;
      ctx.lineTo(x, base - profile[i % profile.length] * height);
    }
  }
  ctx.lineTo(shift + span * 2, base);
  ctx.closePath();
  ctx.fill();
}

function drawGround(ctx: Ctx, state: HighwayState, view: View) {
  const p = state.palette;
  const { NEAR_Z, FAR_Z, ROAD_HALF, SHOULDER } = HIGHWAY;
  const yNear = projectY(view, NEAR_Z);
  const yFar = projectY(view, FAR_Z);

  const steps = HIGHWAY.ROAD_SEGMENTS;

  ctx.fillStyle = hazed(p.shoulder, p.fog, p.aerial * 0.55);
  band(ctx, view, -(ROAD_HALF + SHOULDER), ROAD_HALF + SHOULDER, NEAR_Z, FAR_Z, steps);

  const tarmac = ctx.createLinearGradient(0, yFar, 0, yNear);
  tarmac.addColorStop(0, hazed(p.road, p.fog, p.aerial * 0.85));
  tarmac.addColorStop(0.4, rgba(p.road));
  tarmac.addColorStop(1, rgba(p.roadNear));
  ctx.fillStyle = tarmac;
  band(ctx, view, -ROAD_HALF, ROAD_HALF, NEAR_Z, FAR_Z, steps);

  // Resurfaced strips. Cheap, but they are what stops the tarmac reading as a
  // flat gradient once it is moving.
  for (const patch of state.patches) {
    const start = Math.max(patch.z, NEAR_Z);
    const end = patch.z + patch.length;
    if (end <= NEAR_Z) continue;
    ctx.fillStyle = rgba(p.roadNear, patch.tone * (1 - start / HIGHWAY.DASH_FAR_Z));
    band(ctx, view, patch.x - patch.width / 2, patch.x + patch.width / 2, start, end, 3);
  }

  // Continuous edge lines.
  const edge = ROAD_HALF - HIGHWAY.EDGE_INSET;
  ctx.fillStyle = rgba(p.lane, 0.5);
  band(ctx, view, -edge - HIGHWAY.EDGE_WIDTH, -edge, NEAR_Z, HIGHWAY.DASH_FAR_Z, steps);
  band(ctx, view, edge, edge + HIGHWAY.EDGE_WIDTH, NEAR_Z, HIGHWAY.DASH_FAR_Z, steps);

  // Centre dashes, fixed in the world — the camera moves through them.
  const period = HIGHWAY.DASH_LENGTH + HIGHWAY.DASH_GAP;
  const half = HIGHWAY.LANE_WIDTH / 2;
  for (let z = NEAR_Z - (state.travel % period); z < HIGHWAY.DASH_FAR_Z; z += period) {
    const start = Math.max(z, NEAR_Z);
    const end = z + HIGHWAY.DASH_LENGTH;
    if (end <= NEAR_Z) continue;
    ctx.fillStyle = rgba(p.lane, 0.85 * (1 - start / HIGHWAY.DASH_FAR_Z));
    band(ctx, view, -half, half, start, end, 2);
  }
}

/** Fills an ellipse with a radial gradient that is squashed along with it. */
function bloom(ctx: Ctx, x: number, y: number, radius: number, squash: number, stops: [number, string][]) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  for (const [offset, colour] of stops) gradient.addColorStop(offset, colour);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, squash);
  ctx.translate(-x, -y);
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}

function drawClouds(ctx: Ctx, state: HighwayState, view: View) {
  const p = state.palette;
  if (p.cloudOpacity <= 0.02) return;
  for (const cloud of state.clouds) {
    // Overshoot the frame so a cloud drifts in rather than popping in.
    const x = (cloud.x * 1.3 - 0.15) * view.width;
    const y = view.horizon - cloud.y * view.height;
    const radius = cloud.width * view.width;
    bloom(ctx, x, y, radius, cloud.squash, [
      [0, rgba(p.cloud, p.cloudOpacity * 0.7)],
      [0.45, rgba(p.cloud, p.cloudOpacity * 0.28)],
      [1, rgba(p.cloud, 0)],
    ]);
  }
}

/** Sun or moon spilling onto the horizon, positioned to match --sun-x in CSS. */
function drawGlare(ctx: Ctx, state: HighwayState, view: View) {
  const p = state.palette;
  if (p.glareStrength <= 0.02) return;
  const radius = view.height * 0.4;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  bloom(ctx, p.glareX * view.width, view.horizon - view.height * 0.02, radius, 0.62, [
    [0, rgba(p.glare, 0.4 * p.glareStrength)],
    [0.35, rgba(p.glare, 0.13 * p.glareStrength)],
    [1, rgba(p.glare, 0)],
  ]);
  ctx.restore();
}

/** Distant settlements, awake only after dark. */
function drawTowns(ctx: Ctx, state: HighwayState, view: View) {
  const p = state.palette;
  if (p.townGlow <= 0.03) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const town of state.towns) {
    const drift = state.ridgeOffset / (view.width * 6);
    const x = ((town.x + drift) % 1) * view.width;
    const radius = town.width * view.width;
    bloom(ctx, x, view.horizon, radius, 0.22, [
      [0, rgba(p.beam, 0.24 * p.townGlow * town.glow)],
      [1, rgba(p.beam, 0)],
    ]);
  }
  ctx.restore();
}

/** Catseyes. Almost invisible by day, and most of the road after dark. */
function drawStuds(ctx: Ctx, state: HighwayState, view: View) {
  const p = state.palette;
  if (p.studGlint <= 0.03) return;
  const edge = HIGHWAY.ROAD_HALF - HIGHWAY.EDGE_INSET;
  const offset = state.travel % HIGHWAY.STUD_SPACING;

  ctx.fillStyle = rgba(p.beam);
  for (let z = HIGHWAY.NEAR_Z - offset; z < HIGHWAY.STUD_FAR_Z; z += HIGHWAY.STUD_SPACING) {
    if (z < HIGHWAY.NEAR_Z) continue;
    const size = Math.max(0.9, 0.22 * scaleAt(view, z));
    const y = projectY(view, z) - size / 2;
    ctx.globalAlpha = p.studGlint * (1 - z / HIGHWAY.STUD_FAR_Z);
    ctx.fillRect(projectX(view, -edge, z) - size / 2, y, size, size);
    ctx.fillRect(projectX(view, edge, z) - size / 2, y, size, size);
  }
  ctx.globalAlpha = 1;
}

function drawBeam(ctx: Ctx, state: HighwayState, view: View) {
  const p = state.palette;
  if (p.beamStrength <= 0.02) return;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const side of [-1, 1]) {
    const z = 17;
    const x = projectX(view, side * 1.7, z);
    const y = projectY(view, z);
    const radius = scaleAt(view, z) * 11;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, rgba(p.beam, 0.2 * p.beamStrength));
    glow.addColorStop(1, rgba(p.beam, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  ctx.restore();
}

function drawPoles(ctx: Ctx, state: HighwayState, view: View) {
  const p = state.palette;
  const lineX = HIGHWAY.ROAD_HALF + HIGHWAY.SHOULDER + HIGHWAY.POLE_OFFSET;
  const sorted = [...state.poles].sort((a, b) => b - a);

  // Wires first, so the poles sit on top of them.
  ctx.lineCap = "round";
  for (let i = 0; i < sorted.length - 1; i++) {
    const [zFar, zNear] = [sorted[i], sorted[i + 1]];
    const sFar = scaleAt(view, zFar);
    const sNear = scaleAt(view, zNear);
    const xFar = projectX(view, -lineX, zFar);
    const xNear = projectX(view, -lineX, zNear);
    const yFar = projectY(view, zFar) - HIGHWAY.POLE_HEIGHT * sFar * 0.92;
    const yNear = projectY(view, zNear) - HIGHWAY.POLE_HEIGHT * sNear * 0.92;

    ctx.strokeStyle = hazed(p.prop, p.fog, Math.min(1, zNear / HIGHWAY.FAR_Z) * p.aerial, 0.75);
    ctx.lineWidth = Math.max(0.6, sNear * 0.06);
    ctx.beginPath();
    ctx.moveTo(xFar, yFar);
    ctx.quadraticCurveTo(
      (xFar + xNear) / 2,
      (yFar + yNear) / 2 + HIGHWAY.WIRE_SAG * sNear * 0.5,
      xNear,
      yNear,
    );
    ctx.stroke();
  }

  for (const z of sorted) {
    const s = scaleAt(view, z);
    const x = projectX(view, -lineX, z);
    const y = projectY(view, z);
    const height = HIGHWAY.POLE_HEIGHT * s;
    ctx.fillStyle = hazed(p.prop, p.fog, Math.min(1, z / HIGHWAY.FAR_Z) * p.aerial);
    ctx.fillRect(x - 0.16 * s, y - height, 0.32 * s, height);
    ctx.fillRect(x - 1.2 * s, y - height + 0.55 * s, 2.4 * s, 0.16 * s);
  }
}

function drawProp(ctx: Ctx, state: HighwayState, view: View, prop: Prop) {
  const p = state.palette;
  const s = scaleAt(view, prop.z);
  const x = projectX(view, prop.side * (HIGHWAY.ROAD_HALF + prop.offset), prop.z);
  const y = projectY(view, prop.z);
  const k = prop.scale;
  ctx.fillStyle = hazed(p.prop, p.fog, Math.min(1, prop.z / HIGHWAY.FAR_Z) * p.aerial);

  switch (prop.kind) {
    case "tree": {
      const height = 6.4 * k * s;
      ctx.fillRect(x - 0.16 * k * s, y - height * 0.52, 0.32 * k * s, height * 0.52);
      const crown = y - height * 0.66;
      const radius = 1.9 * k * s;
      ctx.beginPath();
      ctx.arc(x, crown, radius, 0, Math.PI * 2);
      ctx.arc(x - radius * 0.8, crown + radius * 0.42, radius * 0.72, 0, Math.PI * 2);
      ctx.arc(x + radius * 0.78, crown + radius * 0.36, radius * 0.66, 0, Math.PI * 2);
      ctx.arc(x + radius * 0.12, crown - radius * 0.68, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "slim": {
      // Eucalyptus: a bare trunk with the canopy right at the top.
      const height = 9.5 * k * s;
      ctx.fillRect(x - 0.13 * k * s, y - height, 0.26 * k * s, height);
      const crown = y - height * 0.86;
      ctx.beginPath();
      ctx.ellipse(x, crown, 0.85 * k * s, 1.9 * k * s, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "bush": {
      // Three lumps sitting on the ground. A single flat ellipse read as a
      // puddle rather than as scrub.
      const radius = 0.62 * k * s;
      ctx.beginPath();
      ctx.arc(x, y - radius * 0.8, radius, 0, Math.PI * 2);
      ctx.arc(x - radius * 1.1, y - radius * 0.5, radius * 0.75, 0, Math.PI * 2);
      ctx.arc(x + radius * 1.05, y - radius * 0.45, radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "milestone": {
      const height = 1.15 * s;
      ctx.fillRect(x - 0.24 * s, y - height, 0.48 * s, height);
      ctx.fillStyle = rgba(p.lane, 0.55);
      ctx.fillRect(x - 0.24 * s, y - height, 0.48 * s, height * 0.34);
      break;
    }
    case "board": {
      const top = y - 4.6 * k * s;
      const panelY = top - 1.7 * k * s;
      const panelW = 2.7 * k * s;
      const panelH = 1.8 * k * s;
      ctx.fillRect(x - 0.14 * s, top, 0.28 * s, 4.6 * k * s);
      ctx.fillRect(x + 1.5 * k * s, top, 0.28 * s, 4.6 * k * s);
      ctx.fillRect(x - 0.5 * s, panelY, panelW, panelH);
      // After dark the dhaba boards are lit from behind, and they are the only
      // warm thing on the roadside for kilometres.
      if (p.townGlow > 0.1) {
        ctx.fillStyle = rgba(p.beam, 0.5 * p.townGlow * (1 - Math.min(1, prop.z / HIGHWAY.FAR_Z)));
        ctx.fillRect(x - 0.5 * s + panelW * 0.1, panelY + panelH * 0.16, panelW * 0.8, panelH * 0.68);
      }
      break;
    }
  }
}

/** Overpasses. Rare enough that one arriving is an event. */
function drawBridges(ctx: Ctx, state: HighwayState, view: View) {
  const p = state.palette;
  for (const z of state.bridges) {
    if (z > HIGHWAY.FAR_Z) continue;
    const scale = scaleAt(view, z);
    const road = projectY(view, z);
    const deckBottom = road - HIGHWAY.BRIDGE_CLEARANCE * scale;
    const deckTop = deckBottom - HIGHWAY.BRIDGE_THICKNESS * scale;
    const left = projectX(view, -HIGHWAY.BRIDGE_SPAN, z);
    const right = projectX(view, HIGHWAY.BRIDGE_SPAN, z);

    ctx.fillStyle = hazed(p.prop, p.fog, Math.min(1, z / HIGHWAY.FAR_Z) * p.aerial * 0.7);
    ctx.fillRect(left, deckTop, right - left, deckBottom - deckTop);

    for (const side of [-1, 1]) {
      const x = projectX(view, side * HIGHWAY.BRIDGE_PILLAR, z);
      ctx.fillRect(x - 0.55 * scale, deckBottom, 1.1 * scale, road - deckBottom);
    }
  }
}

function drawTraffic(ctx: Ctx, state: HighwayState, view: View) {
  const p = state.palette;
  const lampGlow = 1 - p.beamStrength * 0.15;

  for (const vehicle of state.traffic) {
    if (vehicle.z > HIGHWAY.FAR_Z) continue;
    const s = scaleAt(view, vehicle.z);
    const x = projectX(view, vehicle.x, vehicle.z);
    const y = projectY(view, vehicle.z);
    const width = vehicle.width * s;
    const height = vehicle.height * s;
    const depth = Math.min(1, vehicle.z / HIGHWAY.FAR_Z) * p.aerial;

    ctx.fillStyle = hazed(p.prop, p.fog, depth);
    ctx.fillRect(x - width / 2, y - height, width, height);

    if (p.beamStrength <= 0.05) continue;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const side of [-1, 1]) {
      const lx = x + side * width * 0.32;
      const ly = y - height * 0.32;
      const radius = Math.max(2, width * 0.85);
      const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, radius);
      glow.addColorStop(0, rgba(p.beam, 0.85 * p.beamStrength * lampGlow));
      glow.addColorStop(0.35, rgba(p.beam, 0.3 * p.beamStrength));
      glow.addColorStop(1, rgba(p.beam, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(lx - radius, ly - radius, radius * 2, radius * 2);
    }
    ctx.restore();
  }
}

/** Dust off the truck's wheels — born under it, blown back past the camera. */
function drawPlume(ctx: Ctx, state: HighwayState, view: View) {
  const p = state.palette;
  const span = state.truckZ - HIGHWAY.NEAR_Z;
  ctx.fillStyle = rgba(p.dust);
  for (const mote of state.plume) {
    const scale = scaleAt(view, mote.z);
    const radius = mote.size * scale;
    if (radius < 0.5) continue;
    // Swells behind the truck, thins out again as it reaches us.
    const life = clamp01((state.truckZ - mote.z) / span);
    ctx.globalAlpha = p.dustOpacity * 0.85 * Math.sin(Math.PI * life);
    ctx.beginPath();
    ctx.arc(
      projectX(view, mote.x, mote.z),
      projectY(view, mote.z) - mote.y * scale,
      radius,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawDust(ctx: Ctx, state: HighwayState, view: View) {
  const p = state.palette;
  ctx.fillStyle = rgba(p.dust);
  for (const mote of state.dust) {
    const s = scaleAt(view, mote.z);
    const radius = mote.size * s;
    if (radius < 0.35) continue;
    // Big motes get thinner. Equal alpha at every size turned these into a row
    // of grey discs instead of haze.
    const body = 0.3 + 0.7 * (1 - mote.size / 0.3);
    ctx.globalAlpha = p.dustOpacity * body * (1 - mote.z / HIGHWAY.FAR_Z);
    ctx.beginPath();
    ctx.arc(projectX(view, mote.x, mote.z), projectY(view, mote.z) - mote.y * s, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawHighway(ctx: Ctx, state: HighwayState, view: View): void {
  const p = state.palette;

  // The road's shape is part of the projection, so publish it onto the view
  // before anything is projected this frame.
  view.curve = state.curve;
  view.hill = state.hill;
  // How far we can pull out is set by the frame, not the road: the truck slides
  // the other way as we go, and it must not run off the edge. On a phone that
  // leaves almost no room, so the overtake becomes a gentle parallax and the
  // flank never comes into view — which is exactly what being tucked in behind
  // a truck looks like.
  state.truckZ =
    view.width <= TRUCK.COMPACT_MAX_WIDTH ? TRUCK_DISTANCE_COMPACT : TRUCK_DISTANCE;
  const truckWidth = Math.min(
    (TRUCK.WIDTH_METRES * view.focal) / state.truckZ,
    TRUCK.MAX_VIEWPORT_FRACTION * view.width,
  );
  const margin = Math.max(HIGHWAY.DRIFT_EDGE_MARGIN, view.width * HIGHWAY.DRIFT_EDGE_FRACTION);
  const room = Math.max(0, (view.width - truckWidth) / 2 - margin);
  const reach = Math.min(HIGHWAY.DRIFT_METRES, (room * state.truckZ) / view.focal);
  view.cameraX = -state.drift * reach;

  ctx.clearRect(0, 0, view.width, view.height);

  // Everything above the horizon first, back to front: clouds, far ridge, the
  // towns behind the near ridge, then the near ridge occluding them.
  drawClouds(ctx, state, view);
  drawRidge(
    ctx,
    view,
    state.ridgeFar,
    state.ridgeOffset,
    view.height * HIGHWAY.RIDGE_FAR_HEIGHT,
    hazed(p.ridgeFar, p.fog, p.aerial * 0.4),
  );
  drawTowns(ctx, state, view);
  drawRidge(
    ctx,
    view,
    state.ridgeNear,
    state.ridgeOffset * HIGHWAY.RIDGE_PARALLAX,
    view.height * HIGHWAY.RIDGE_NEAR_HEIGHT,
    hazed(p.ridgeNear, p.fog, p.aerial * 0.18),
  );

  // Soft band where the ground meets the sky; sells the distance more than the
  // ridges themselves do.
  const fogBand = ctx.createLinearGradient(0, view.horizon - view.height * 0.06, 0, view.horizon + view.height * 0.05);
  fogBand.addColorStop(0, rgba(p.fog, 0));
  fogBand.addColorStop(0.55, rgba(p.fog, 0.5));
  fogBand.addColorStop(1, rgba(p.fog, 0));
  ctx.fillStyle = fogBand;
  ctx.fillRect(0, view.horizon - view.height * 0.06, view.width, view.height * 0.11);

  drawGlare(ctx, state, view);
  drawGround(ctx, state, view);
  drawStuds(ctx, state, view);
  drawBeam(ctx, state, view);
  drawPoles(ctx, state, view);
  drawBridges(ctx, state, view);

  // Painter's order: distant things first so near ones overlap them.
  for (const prop of [...state.props].sort((a, b) => b.z - a.z)) drawProp(ctx, state, view, prop);

  drawTraffic(ctx, state, view);
  drawDust(ctx, state, view);
  // Nearest of all — it sits between the truck and the lens.
  drawPlume(ctx, state, view);
}
