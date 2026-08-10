import {
  approachPalette,
  createLivePalette,
  hazed,
  rgba,
  SCENE_PALETTE,
  type LivePalette,
} from "@/lib/palette";
import type { PhaseId } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* World                                                                       */
/* Distances are metres, so every number below is one you can picture.         */
/* -------------------------------------------------------------------------- */

export const HIGHWAY = {
  /** Eye line, as a fraction of canvas height. */
  HORIZON: 0.545,
  /** Focal length as a fraction of canvas height — the lens. */
  FOCAL: 0.95,
  CAMERA_HEIGHT: 2.75,
  /** Nearest drawn distance; chosen so the tarmac reaches the bottom edge. */
  NEAR_Z: 4.6,
  FAR_Z: 300,
  /** ~97 km/h. */
  SPEED: 27,

  ROAD_HALF: 5.6,
  SHOULDER: 3.4,
  EDGE_INSET: 0.45,
  EDGE_WIDTH: 0.16,
  LANE_WIDTH: 0.17,
  DASH_LENGTH: 3.4,
  DASH_GAP: 7.4,
  /** Past this the dashes are sub-pixel; drawing them is wasted work. */
  DASH_FAR_Z: 200,

  POLE_COUNT: 7,
  POLE_SPACING: 44,
  POLE_OFFSET: 4.6,
  POLE_HEIGHT: 8.4,
  WIRE_SAG: 1.5,

  PROP_COUNT: 26,
  PROP_SPREAD: 26,
  DUST_COUNT: 44,
  /** Motes hang in the air, so they stream past a little slower than the road. */
  DUST_DRAG: 0.82,

  RIDGE_SAMPLES: 72,
  RIDGE_FAR_HEIGHT: 0.115,
  RIDGE_NEAR_HEIGHT: 0.07,
  RIDGE_DRIFT: 4,
  RIDGE_PARALLAX: 2.4,

  TRAFFIC_MIN_GAP: 4.5,
  TRAFFIC_MAX_GAP: 15,
  TRAFFIC_CLOSING_SPEED: 21,

  /** Seconds for the canvas palette to reach a new phase. */
  PALETTE_TAU: 0.7,
  MAX_DPR: 2,
} as const;

/** Measurements of the truck artwork, in its own viewBox units. */
export const TRUCK = {
  /** Metres across the full 340-unit viewBox. */
  WIDTH_METRES: 3.03,
  /** viewBox height ÷ width. */
  ASPECT: 440 / 340,
  /** Where the tyres meet the ground, 0–1 down the viewBox. */
  WHEEL_LINE: 419 / 440,
  /** Element's bottom edge, as a fraction of viewport height off the floor. */
  BOTTOM: 0.14,
} as const;

/**
 * How wide to draw the truck, as a fraction of viewport height, so its tyres
 * land exactly on the tarmac the canvas is painting.
 *
 * Width and distance depend on each other — a wider truck is a nearer truck,
 * and a nearer truck sits lower — so this solves the loop by iteration rather
 * than guessing a number that only looks right on one screen. It is a fraction
 * of *height* because the projection's focal length is, which is why the fit
 * holds on a phone and an ultrawide alike.
 */
export function truckWidthRatio(): number {
  let ratio = 0.33;
  for (let i = 0; i < 12; i++) {
    const height = ratio * TRUCK.ASPECT;
    const wheels = 1 - TRUCK.BOTTOM - height * (1 - TRUCK.WHEEL_LINE);
    const distance = (HIGHWAY.CAMERA_HEIGHT * HIGHWAY.FOCAL) / (wheels - HIGHWAY.HORIZON);
    ratio = (TRUCK.WIDTH_METRES * HIGHWAY.FOCAL) / distance;
  }
  return ratio;
}

export interface View {
  width: number;
  height: number;
  cx: number;
  horizon: number;
  /** Focal length in pixels. */
  focal: number;
}

export function makeView(width: number, height: number): View {
  return {
    width,
    height,
    cx: width / 2,
    horizon: height * HIGHWAY.HORIZON,
    focal: height * HIGHWAY.FOCAL,
  };
}

/* -------------------------------------------------------------------------- */
/* Projection                                                                  */
/* A flat ground plane under a pinhole camera. Straight lines stay straight, so */
/* the road is an exact quad and every prop is one divide.                      */
/* -------------------------------------------------------------------------- */

const scaleAt = (view: View, z: number) => view.focal / z;
const projectX = (view: View, x: number, z: number) => view.cx + (x * view.focal) / z;
const projectY = (view: View, z: number) => view.horizon + (HIGHWAY.CAMERA_HEIGHT * view.focal) / z;

/* -------------------------------------------------------------------------- */
/* State                                                                       */
/* -------------------------------------------------------------------------- */

type PropKind = "tree" | "bush" | "milestone" | "board";

const PROP_WEIGHTS: ReadonlyArray<[PropKind, number]> = [
  ["tree", 0.46],
  ["bush", 0.32],
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

export interface HighwayState {
  travel: number;
  ridgeOffset: number;
  ridgeFar: number[];
  ridgeNear: number[];
  poles: number[];
  props: Prop[];
  dust: Mote[];
  traffic: Vehicle[];
  nextVehicle: number;
  palette: LivePalette;
}

const between = (min: number, max: number) => min + Math.random() * (max - min);

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

  return {
    travel: 0,
    ridgeOffset: 0,
    ridgeFar: makeRidge(1),
    ridgeNear: makeRidge(0.86),
    poles: Array.from({ length: HIGHWAY.POLE_COUNT }, (_, i) => HIGHWAY.NEAR_Z + i * HIGHWAY.POLE_SPACING),
    props,
    dust,
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
  state.ridgeOffset += HIGHWAY.RIDGE_DRIFT * dt;

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

/** A quad on the ground plane between two distances. */
function ground(ctx: Ctx, view: View, left: number, right: number, zNear: number, zFar: number) {
  const yNear = projectY(view, zNear);
  const yFar = projectY(view, zFar);
  ctx.beginPath();
  ctx.moveTo(projectX(view, left, zNear), yNear);
  ctx.lineTo(projectX(view, right, zNear), yNear);
  ctx.lineTo(projectX(view, right, zFar), yFar);
  ctx.lineTo(projectX(view, left, zFar), yFar);
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

  ctx.fillStyle = hazed(p.shoulder, p.fog, p.aerial * 0.55);
  ground(ctx, view, -(ROAD_HALF + SHOULDER), ROAD_HALF + SHOULDER, NEAR_Z, FAR_Z);

  const tarmac = ctx.createLinearGradient(0, yFar, 0, yNear);
  tarmac.addColorStop(0, hazed(p.road, p.fog, p.aerial * 0.85));
  tarmac.addColorStop(0.4, rgba(p.road));
  tarmac.addColorStop(1, rgba(p.roadNear));
  ctx.fillStyle = tarmac;
  ground(ctx, view, -ROAD_HALF, ROAD_HALF, NEAR_Z, FAR_Z);

  // Continuous edge lines.
  const edge = ROAD_HALF - HIGHWAY.EDGE_INSET;
  ctx.fillStyle = rgba(p.lane, 0.5);
  ground(ctx, view, -edge - HIGHWAY.EDGE_WIDTH, -edge, NEAR_Z, HIGHWAY.DASH_FAR_Z);
  ground(ctx, view, edge, edge + HIGHWAY.EDGE_WIDTH, NEAR_Z, HIGHWAY.DASH_FAR_Z);

  // Centre dashes, fixed in the world — the camera moves through them.
  const period = HIGHWAY.DASH_LENGTH + HIGHWAY.DASH_GAP;
  const half = HIGHWAY.LANE_WIDTH / 2;
  for (let z = NEAR_Z - (state.travel % period); z < HIGHWAY.DASH_FAR_Z; z += period) {
    const start = Math.max(z, NEAR_Z);
    const end = z + HIGHWAY.DASH_LENGTH;
    if (end <= NEAR_Z) continue;
    ctx.fillStyle = rgba(p.lane, 0.85 * (1 - start / HIGHWAY.DASH_FAR_Z));
    ground(ctx, view, -half, half, start, end);
  }
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
    case "bush": {
      ctx.beginPath();
      ctx.ellipse(x, y - 0.35 * k * s, 1.1 * k * s, 0.6 * k * s, 0, 0, Math.PI * 2);
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
      ctx.fillRect(x - 0.14 * s, top, 0.28 * s, 4.6 * k * s);
      ctx.fillRect(x + 1.5 * k * s, top, 0.28 * s, 4.6 * k * s);
      ctx.fillRect(x - 0.5 * s, top - 1.7 * k * s, 2.7 * k * s, 1.8 * k * s);
      break;
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

function drawDust(ctx: Ctx, state: HighwayState, view: View) {
  const p = state.palette;
  ctx.fillStyle = rgba(p.dust);
  for (const mote of state.dust) {
    const s = scaleAt(view, mote.z);
    const radius = mote.size * s;
    if (radius < 0.35) continue;
    ctx.globalAlpha = p.dustOpacity * (1 - mote.z / HIGHWAY.FAR_Z);
    ctx.beginPath();
    ctx.arc(projectX(view, mote.x, mote.z), projectY(view, mote.z) - mote.y * s, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawHighway(ctx: Ctx, state: HighwayState, view: View): void {
  const p = state.palette;
  ctx.clearRect(0, 0, view.width, view.height);

  drawRidge(
    ctx,
    view,
    state.ridgeFar,
    state.ridgeOffset,
    view.height * HIGHWAY.RIDGE_FAR_HEIGHT,
    hazed(p.ridgeFar, p.fog, p.aerial * 0.4),
  );
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

  drawGround(ctx, state, view);
  drawBeam(ctx, state, view);
  drawPoles(ctx, state, view);

  // Painter's order: distant things first so near ones overlap them.
  for (const prop of [...state.props].sort((a, b) => b.z - a.z)) drawProp(ctx, state, view, prop);

  drawTraffic(ctx, state, view);
  drawDust(ctx, state, view);
}
