import type { PhaseId } from "@/lib/types";

export type RGB = readonly [number, number, number];

/**
 * Everything the canvas paints, per phase.
 *
 * The split with `globals.css` is deliberate rather than duplicated: the
 * stylesheet owns what CSS draws (sky, sun, stars, grade, chrome), this owns
 * what the 2D context draws (ground, ridges, props, light). Nothing lives in
 * both places.
 */
export interface ScenePalette {
  readonly ridgeFar: RGB;
  readonly ridgeNear: RGB;
  readonly fog: RGB;
  readonly shoulder: RGB;
  readonly road: RGB;
  readonly roadNear: RGB;
  readonly lane: RGB;
  readonly prop: RGB;
  readonly dust: RGB;
  readonly beam: RGB;
  /** How much of our own headlight wash reaches the tarmac. */
  readonly beamStrength: number;
  readonly dustOpacity: number;
  /** Drives how hard distant objects wash out into the haze. */
  readonly aerial: number;
}

export const SCENE_PALETTE: Record<PhaseId, ScenePalette> = {
  dawn: {
    ridgeFar: [74, 74, 108],
    ridgeNear: [40, 38, 60],
    fog: [214, 150, 120],
    shoulder: [72, 55, 50],
    road: [36, 33, 43],
    roadNear: [26, 24, 32],
    lane: [255, 226, 180],
    prop: [26, 24, 38],
    dust: [240, 190, 150],
    beam: [255, 214, 160],
    beamStrength: 0.45,
    dustOpacity: 0.3,
    aerial: 0.72,
  },
  day: {
    ridgeFar: [142, 168, 188],
    ridgeNear: [92, 118, 136],
    fog: [202, 224, 240],
    shoulder: [124, 106, 84],
    road: [66, 66, 74],
    roadNear: [49, 49, 57],
    lane: [246, 246, 240],
    prop: [46, 58, 52],
    dust: [228, 216, 192],
    beam: [255, 240, 200],
    beamStrength: 0,
    dustOpacity: 0.3,
    aerial: 0.82,
  },
  dusk: {
    ridgeFar: [88, 54, 88],
    ridgeNear: [40, 24, 44],
    fog: [226, 110, 70],
    shoulder: [64, 41, 40],
    road: [33, 25, 33],
    roadNear: [24, 18, 24],
    lane: [255, 214, 160],
    prop: [24, 14, 26],
    dust: [255, 160, 100],
    beam: [255, 180, 110],
    beamStrength: 0.62,
    dustOpacity: 0.34,
    aerial: 0.76,
  },
  night: {
    ridgeFar: [16, 24, 48],
    ridgeNear: [8, 12, 26],
    fog: [30, 44, 86],
    shoulder: [23, 21, 27],
    road: [15, 15, 21],
    roadNear: [10, 10, 15],
    lane: [255, 236, 190],
    prop: [6, 8, 18],
    dust: [120, 150, 220],
    beam: [255, 226, 170],
    beamStrength: 1,
    dustOpacity: 0.22,
    aerial: 0.6,
  },
};

/** A mutable mirror of `ScenePalette` that is eased toward the target phase. */
export type LivePalette = {
  -readonly [K in keyof ScenePalette]: ScenePalette[K] extends RGB ? number[] : number;
};

export function createLivePalette(phase: PhaseId): LivePalette {
  return Object.fromEntries(
    Object.entries(SCENE_PALETTE[phase]).map(([key, value]) => [
      key,
      Array.isArray(value) ? [...value] : value,
    ]),
  ) as LivePalette;
}

export function approachPalette(live: LivePalette, target: ScenePalette, alpha: number): void {
  for (const key of Object.keys(target) as (keyof ScenePalette)[]) {
    const goal = target[key];
    if (typeof goal === "number") {
      const current = live[key] as number;
      (live[key] as number) = current + (goal - current) * alpha;
      continue;
    }
    const channels = live[key] as number[];
    for (let i = 0; i < 3; i++) channels[i] += (goal[i] - channels[i]) * alpha;
  }
}

export function rgba(channels: readonly number[], alpha = 1): string {
  return `rgba(${channels[0] | 0},${channels[1] | 0},${channels[2] | 0},${alpha})`;
}

/** Blends a colour toward the haze — cheap aerial perspective. */
export function hazed(channels: readonly number[], fog: readonly number[], amount: number, alpha = 1) {
  const r = channels[0] + (fog[0] - channels[0]) * amount;
  const g = channels[1] + (fog[1] - channels[1]) * amount;
  const b = channels[2] + (fog[2] - channels[2]) * amount;
  return `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
}
