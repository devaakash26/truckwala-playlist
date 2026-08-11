"use client";

import { SHAYARI, TAILGATE } from "@/lib/constants";
import { flankPoint, flankScale, truckWidthRatio, TRUCK } from "@/lib/highway";
import { useRadioState } from "@/components/radio/RadioProvider";

/**
 * Solved once from the camera constants — see truckWidthRatio. Two sizes: a
 * narrow screen parks the truck further up the road, and the width has to
 * follow the distance or it stops sitting on the tarmac.
 */
const WIDTH = `${(truckWidthRatio() * 100).toFixed(2)}dvh`;
const WIDTH_COMPACT = `${(truckWidthRatio(TRUCK.BOTTOM_COMPACT) * 100).toFixed(2)}dvh`;
const BOTTOM = `${(TRUCK.BOTTOM * 100).toFixed(2)}%`;
const BOTTOM_COMPACT = `${(TRUCK.BOTTOM_COMPACT * 100).toFixed(2)}%`;
/** Handed to CSS so the canvas and the stylesheet cap the width identically. */
const MAX_WIDTH = `${TRUCK.MAX_VIEWPORT_FRACTION * 100}vw`;

const LAYOUT = {
  "--truck-width": WIDTH,
  "--truck-width-compact": WIDTH_COMPACT,
  "--truck-bottom": BOTTOM,
  "--truck-bottom-compact": BOTTOM_COMPACT,
  "--truck-max": MAX_WIDTH,
} as React.CSSProperties;

/* --- painted tailgate line ------------------------------------------------ */

/** Usable width across the body, in viewBox units. */
const PAINT_WIDTH = 272;
/** Rough advance per cluster for the display face, as a fraction of em. */
const PAINT_ADVANCE = 0.56;
const PAINT_MAX_SINGLE = 26;
const PAINT_MAX_DOUBLE = 20;
/** The recessed panel, where the slogan goes. */
const PANEL_WIDTH = 236;
const PANEL_MAX = 40;
const PANEL_MID = 178;

/**
 * Matras, anusvara, nukta and virama stack onto the preceding letter rather
 * than advancing the pen, so `.length` badly overcounts Devanagari. Dropping
 * them approximates cluster count, which is what actually sets the width.
 */
const COMBINING = /[ऀ-ःऺ-ॏ॑-ॗॢॣ]/g;
const clusters = (line: string) => line.replace(COMBINING, "").length;

/** Largest type that keeps the longest line inside `room`. */
function fit(lines: readonly string[], room: number, cap: number): number {
  return Math.min(
    cap,
    room / (Math.max(...lines.map(clusters)) * PAINT_ADVANCE),
  );
}

/* --- the flank, and what is painted on it --------------------------------- */

/**
 * Heights on the rear face that get carried down the side. A slab of colour
 * reads as a billboard; what makes it read as a truck is that the canopy, the
 * gold rail, the chassis and the wheels all keep going past the tailgate.
 */
const SIDE = {
  RAIL_TOP: 62,
  RAIL_BOTTOM: 84,
  PANEL_BOTTOM: 304,
  /** Frame, tank and toolbox. Deep enough that the wheels tuck under it rather
   *  than hanging in mid-air, which was what made the side read as a cut-out. */
  CHASSIS_BOTTOM: 356,
  TANK_TOP: 312,
  TANK_BOTTOM: 348,
  WHEEL_Y: 384,
  WHEEL_R: 28,
  SHADOW_TOP: 398,
  SHADOW_BOTTOM: 424,
  CAB_ROOF: 150,
  CAB_START: 1.03,
  CAB_NOSE: 1.34,
  WINDOW_TOP: 172,
  WINDOW_BOTTOM: 236,
  /** Mirror arm, which is most of what makes a cab read as a cab in profile. */
  MIRROR_T: 1.31,
  MIRROR_TOP: 116,
} as const;

/** Rear bogie sits close to the tailgate; the steer axle is under the cab. */
const AXLES = [0.085, 0.225, 1.19];
const RIBS = [0.18, 0.36, 0.54, 0.72];
const TANK = [0.34, 0.56] as const;
const ROPES = [0.28, 0.56, 0.84];

/**
 * The tarpaulin's silhouette across the back, sampled off the same curve the
 * rear face draws. Swept forward it becomes the top of the load — without it
 * the cargo reads as a flat wall rather than something rounded and roped down.
 */
const DOME = [
  [24, 72],
  [45, 44],
  [82, 25.5],
  [126, 15],
  [170, 12],
] as const;

const EDGE = TRUCK.BODY_LEFT;
const corner = (y: number, t: number) => flankPoint(EDGE, y, t).join(",");

/** A band running the full length of the truck, between two heights. */
const strip = (top: number, bottom: number, from = 0, to = 1) =>
  `${corner(top, from)} ${corner(top, to)} ${corner(bottom, to)} ${corner(bottom, from)}`;

/** Traces a profile across the back, then back along the same profile at the
 *  front — the surface swept between them. */
const sweep = (profile: readonly (readonly number[])[]) =>
  [
    ...profile.map(([x, y]) => flankPoint(x, y, 0)),
    ...[...profile].reverse().map(([x, y]) => flankPoint(x, y, 1)),
  ]
    .map((point) => point.join(","))
    .join(" ");

const trace = (profile: readonly (readonly number[])[], t: number) =>
  profile.map(([x, y]) => flankPoint(x, y, t).join(",")).join(" ");

const PANEL_POINTS = strip(SIDE.RAIL_BOTTOM, SIDE.PANEL_BOTTOM);

/** Centre line of the side panel — where the lettering runs. */
const LETTER_Y = (SIDE.RAIL_BOTTOM + SIDE.PANEL_BOTTOM) / 2;
const [NEAR_X, NEAR_Y] = flankPoint(EDGE, LETTER_Y, 0);
const [FAR_X, FAR_Y] = flankPoint(EDGE, LETTER_Y, 1);
const FLANK_MID_X = (NEAR_X + FAR_X) / 2;
const FLANK_MID_Y = (NEAR_Y + FAR_Y) / 2;
const FLANK_RUN = Math.hypot(NEAR_X - FAR_X, NEAR_Y - FAR_Y);
const FLANK_ANGLE =
  (Math.atan2(NEAR_Y - FAR_Y, NEAR_X - FAR_X) * 180) / Math.PI;
const FLANK_SIZE = fit(TAILGATE.FLANK, FLANK_RUN * 0.84, 24);

/** Bulbs along the top rail, chasing left to right after dark. */
const BULB_COUNT = 13;
const BULB_START = 34;
const BULB_END = 306;

/** Chains slung under the chassis, each swinging on its own clock. */
const CHAIN_X = [118, 144, 170, 196, 222];
const CHAIN_LINKS = 4;

const PLATE_TEXT = "UP 15 BB 4141";
/** Centres of the two rear tyres, in viewBox units. */
const REAR_AXLE = [72, 268];

function Chain({ x, index }: { x: number; index: number }) {
  return (
    <g className="truck__chain" style={{ "--i": index } as React.CSSProperties}>
      {Array.from({ length: CHAIN_LINKS }, (_, link) => (
        <ellipse
          key={link}
          cx={x}
          cy={364 + link * 11}
          rx={3.6}
          ry={5.4}
          fill="none"
          stroke="#6c6c78"
          strokeWidth={2}
        />
      ))}
    </g>
  );
}

/**
 * The truck you are following, hand-drawn rather than photographed — which is
 * what lets it be lit by the same phase palette as the rest of the scene and
 * scale to any screen without a single byte of video.
 *
 * Everything that moves is CSS: the body breathes on two out-of-phase cycles
 * so the bob never visibly repeats, the chassis shudders on a fast step timing
 * function, and each chain swings on its own duration.
 */
export function TruckRear({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
  // A new song is a new leg of the journey — and a different truck to follow.
  const { index } = useRadioState();
  const lines = SHAYARI[index % SHAYARI.length];
  const paint = fit(
    lines,
    PAINT_WIDTH,
    lines.length > 1 ? PAINT_MAX_DOUBLE : PAINT_MAX_SINGLE,
  );
  const baseline = lines.length > 1 ? 274 : 288;

  const slogan = fit(TAILGATE.SLOGAN, PANEL_WIDTH, PANEL_MAX);
  const sloganTop =
    PANEL_MID -
    ((TAILGATE.SLOGAN.length - 1) * slogan * 1.15) / 2 +
    slogan * 0.34;

  return (
    <div className="truck" aria-hidden ref={ref} style={LAYOUT}>
      <svg className="truck__svg" viewBox="0 0 340 440" role="presentation">
        <defs>
          <linearGradient id="tw-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7a1512" />
            <stop offset="0.28" stopColor="#ad2620" />
            <stop offset="0.72" stopColor="#a3211c" />
            <stop offset="1" stopColor="#6f1210" />
          </linearGradient>
          <linearGradient id="tw-chrome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9ea1ac" />
            <stop offset="0.45" stopColor="#6b6e79" />
            <stop offset="0.5" stopColor="#c9ccd6" />
            <stop offset="1" stopColor="#41434d" />
          </linearGradient>
          {/* The side is turned away from us, so it sits in the body's shadow
              and falls off further toward the nose. */}
          <linearGradient id="tw-flank" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#5f100e" />
            <stop offset="1" stopColor="#320807" />
          </linearGradient>
          <linearGradient id="tw-cab" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#1d6472" />
            <stop offset="1" stopColor="#0e3742" />
          </linearGradient>
          <clipPath id="tw-flank-clip">
            <polygon points={PANEL_POINTS} />
          </clipPath>
          <linearGradient id="tw-tarp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#33405a" />
            <stop offset="1" stopColor="#1d2536" />
          </linearGradient>
          <filter id="tw-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <filter id="tw-lamp" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        <ellipse
          className="truck__shadow"
          cx="170"
          cy="420"
          rx="146"
          ry="15"
          filter="url(#tw-blur)"
        />

        <g className="truck__art">
          {/* Rear duals. From directly behind you are looking at the tread
              face, not at the wheel — so this is a squared-off block with a
              flat contact patch, and there is no rim or hub in view. An ellipse
              here read as an egg, which is what it was. */}
          {REAR_AXLE.map((cx) => (
            <g key={cx}>
              <rect
                x={cx - 33}
                y="356"
                width="66"
                height="66"
                rx="17"
                fill="#0c0c11"
              />
              {/* Shoulder, clear of the bumper that crosses in front. */}
              <rect
                x={cx - 30}
                y="364"
                width="60"
                height="9"
                rx="4.5"
                fill="#1e1e26"
              />
              {/* Seam between the two tyres of the pair. */}
              <rect
                x={cx - 2.5}
                y="366"
                width="5"
                height="52"
                rx="2.5"
                fill="#000"
                opacity="0.5"
              />
            </g>
          ))}

          {/* The left flank. Drawn at full pull-out and revealed by scaling it
              horizontally about the body's edge — see flankGeometry for why
              that single scale is geometrically exact at every angle. Behind
              the body in paint order, so the rear face always wins. */}
          <g className="truck__flank">
            <polygon
              points={strip(SIDE.SHADOW_TOP, SIDE.SHADOW_BOTTOM, 0, SIDE.CAB_NOSE)}
              fill="#000"
              opacity="0.26"
            />

            {/* Cab first — it is the furthest thing away. Painted a different
                colour from the body on purpose: sharing the maroon made it
                read as more slab rather than as the front of a vehicle, which
                is exactly how it looked. Indian cabs are their own colour
                anyway. */}
            <polygon
              points={strip(SIDE.CAB_ROOF, SIDE.CHASSIS_BOTTOM, SIDE.CAB_START, SIDE.CAB_NOSE)}
              fill="url(#tw-cab)"
            />
            <polygon
              points={strip(SIDE.CAB_ROOF, SIDE.CAB_ROOF + 8, SIDE.CAB_START, SIDE.CAB_NOSE)}
              fill="#d9a32a"
            />
            {/* Sun visor over the glass. */}
            <polygon
              points={strip(SIDE.WINDOW_TOP - 9, SIDE.WINDOW_TOP, SIDE.CAB_START + 0.03, SIDE.CAB_NOSE)}
              fill="#8f6417"
            />
            <polygon
              points={strip(
                SIDE.WINDOW_TOP,
                SIDE.WINDOW_BOTTOM,
                SIDE.CAB_START + 0.05,
                SIDE.CAB_NOSE - 0.03,
              )}
              fill="#16233a"
            />
            {/* Door shut line, and the handle beside it. */}
            <line
              x1={flankPoint(EDGE, SIDE.CAB_ROOF, 1.17)[0]}
              y1={flankPoint(EDGE, SIDE.CAB_ROOF, 1.17)[1]}
              x2={flankPoint(EDGE, SIDE.CHASSIS_BOTTOM, 1.17)[0]}
              y2={flankPoint(EDGE, SIDE.CHASSIS_BOTTOM, 1.17)[1]}
              stroke="#0a2229"
              strokeWidth="1.6"
              opacity="0.8"
            />
            <line
              x1={flankPoint(EDGE, 262, 1.2)[0]}
              y1={flankPoint(EDGE, 262, 1.2)[1]}
              x2={flankPoint(EDGE, 262, 1.26)[0]}
              y2={flankPoint(EDGE, 262, 1.26)[1]}
              stroke="#cbb98a"
              strokeWidth="2.6"
              strokeLinecap="round"
              opacity="0.7"
            />
            {/* Mirror on its arm, out past the nose. */}
            <line
              x1={flankPoint(EDGE, SIDE.CAB_ROOF + 20, SIDE.MIRROR_T)[0]}
              y1={flankPoint(EDGE, SIDE.CAB_ROOF + 20, SIDE.MIRROR_T)[1]}
              x2={flankPoint(EDGE, SIDE.MIRROR_TOP, SIDE.MIRROR_T)[0]}
              y2={flankPoint(EDGE, SIDE.MIRROR_TOP, SIDE.MIRROR_T)[1]}
              stroke="#2a2a33"
              strokeWidth="2.4"
            />
            <polygon
              points={strip(SIDE.MIRROR_TOP, SIDE.MIRROR_TOP + 26, SIDE.MIRROR_T - 0.02, SIDE.MIRROR_T + 0.02)}
              fill="#33333d"
            />

            {AXLES.map((t) => {
              const [cx, cy] = flankPoint(EDGE, SIDE.WHEEL_Y, t);
              const size = flankScale(t);
              return (
                <g key={t}>
                  <ellipse
                    cx={cx}
                    cy={cy}
                    rx={SIDE.WHEEL_R * 1.08 * size}
                    ry={SIDE.WHEEL_R * size}
                    fill="#0e0e13"
                  />
                  {/* Rim and hub, so a wheel is not just a hole in the art. */}
                  <ellipse
                    cx={cx}
                    cy={cy}
                    rx={14 * size}
                    ry={13 * size}
                    fill="#26262f"
                  />
                  <ellipse
                    cx={cx}
                    cy={cy}
                    rx={6 * size}
                    ry={5.5 * size}
                    fill="#3d3d48"
                  />
                </g>
              );
            })}

            <polygon
              points={strip(SIDE.PANEL_BOTTOM, SIDE.CHASSIS_BOTTOM)}
              fill="#191920"
            />
            <polygon
              points={strip(SIDE.TANK_TOP, SIDE.TANK_BOTTOM, TANK[0], TANK[1])}
              fill="#4a4a55"
            />
            <polygon points={PANEL_POINTS} fill="url(#tw-flank)" />

            {/* Panel joins, converging with everything else. */}
            <g stroke="#3d0b09" strokeWidth="1.4" opacity="0.55">
              {RIBS.map((t) => (
                <line
                  key={t}
                  x1={flankPoint(EDGE, SIDE.RAIL_BOTTOM, t)[0]}
                  y1={flankPoint(EDGE, SIDE.RAIL_BOTTOM, t)[1]}
                  x2={flankPoint(EDGE, SIDE.PANEL_BOTTOM, t)[0]}
                  y2={flankPoint(EDGE, SIDE.PANEL_BOTTOM, t)[1]}
                />
              ))}
            </g>

            {/* Top of the load, swept forward from the tailgate's own curve. */}
            <polygon points={sweep(DOME)} fill="#2b364d" />
            {ROPES.map((t) => (
              <polyline
                key={t}
                points={trace(DOME, t)}
                fill="none"
                stroke="#c9b07a"
                strokeWidth={1.6 * flankScale(t)}
                opacity="0.38"
              />
            ))}

            <polygon
              points={strip(SIDE.RAIL_TOP, SIDE.RAIL_BOTTOM)}
              fill="#a97c1f"
            />

            <g clipPath="url(#tw-flank-clip)">
              <g
                transform={`translate(${FLANK_MID_X} ${FLANK_MID_Y}) rotate(${-FLANK_ANGLE})`}
                className="truck__text"
                fill="#e8c477"
                textAnchor="middle"
              >
                {TAILGATE.FLANK.map((line, row) => (
                  <text
                    key={line}
                    y={
                      (row - (TAILGATE.FLANK.length - 1) / 2) *
                        FLANK_SIZE *
                        1.2 +
                      FLANK_SIZE * 0.34
                    }
                    fontSize={FLANK_SIZE}
                  >
                    {line}
                  </text>
                ))}
              </g>
            </g>
          </g>

          {/* Tarpaulin over the load, roped down. */}
          <path
            d="M24 72C38 28 116 12 170 12s132 16 146 60Z"
            fill="url(#tw-tarp)"
          />
          <g stroke="#c9b07a" strokeWidth="1.6" opacity="0.5" fill="none">
            <path d="M62 68 96 22M112 66 146 20M170 66V16M198 66 232 20M248 68 282 24" />
          </g>

          <rect x="18" y="62" width="304" height="22" rx="6" fill="#d9a32a" />
          <rect x="18" y="62" width="304" height="7" rx="3" fill="#f0c65b" />

          {/* Body and the recessed painted tailgate. */}
          <rect
            x="24"
            y="80"
            width="292"
            height="224"
            rx="6"
            fill="url(#tw-body)"
          />
          <rect x="42" y="98" width="256" height="160" rx="4" fill="#0f6f66" />
          <rect
            x="42"
            y="98"
            width="256"
            height="160"
            rx="4"
            fill="none"
            stroke="#d9a32a"
            strokeWidth="5"
          />

          {/* Rosettes in the corners, the way the panel beaters paint them. */}
          <g fill="#d9a32a" opacity="0.9">
            {[
              [33, 108],
              [307, 108],
              [33, 244],
              [307, 244],
            ].map(([cx, cy]) => (
              <g key={`${cx}-${cy}`}>
                <circle cx={cx} cy={cy} r="6" />
                <circle
                  cx={cx}
                  cy={cy}
                  r="10"
                  fill="none"
                  stroke="#d9a32a"
                  strokeWidth="1.6"
                />
              </g>
            ))}
          </g>

          <g className="truck__text" fill="#f7efd9" textAnchor="middle">
            {TAILGATE.SLOGAN.map((line, row) => (
              <text
                key={line}
                x="170"
                y={sloganTop + row * slogan * 1.15}
                fontSize={slogan}
              >
                {line}
              </text>
            ))}
          </g>

          {/* Remounted with the track, so the paint fades up as if it were
              lettered on while you were not looking. */}
          <g
            key={index}
            className="truck__shayari"
            fill="#f0c65b"
            textAnchor="middle"
          >
            {lines.map((line, row) => (
              <text
                key={line}
                className="truck__text"
                x="170"
                y={baseline + row * paint * 1.12}
                fontSize={paint}
              >
                {line}
              </text>
            ))}
          </g>

          {/* Chassis, lamps, plate, bumper. */}
          <rect x="18" y="302" width="304" height="14" rx="3" fill="#2c2c34" />

          {[54, 286].map((cx) => (
            <g key={cx}>
              <rect
                x={cx - 22}
                y="306"
                width="44"
                height="36"
                rx="6"
                fill="#33333d"
              />
              <circle cx={cx} cy="318" r="7" fill="#8f1c15" />
              <circle cx={cx} cy="333" r="6" fill="#8a6414" />
            </g>
          ))}

          <rect x="122" y="310" width="96" height="26" rx="3" fill="#efe8d2" />
          <text
            className="truck__plate"
            x="170"
            y="329"
            fontSize="14"
            textAnchor="middle"
            fill="#1b1b20"
          >
            {PLATE_TEXT}
          </text>

          <rect
            x="10"
            y="344"
            width="320"
            height="18"
            rx="9"
            fill="url(#tw-chrome)"
          />

          {CHAIN_X.map((x, index) => (
            <Chain key={x} x={x} index={index} />
          ))}

          {/* Flaps hang in front of the tyres, so they have to be visibly
              lighter than one. Matching the rubber made the two merge into a
              single dark blob with a gold dot floating on it. */}
          {REAR_AXLE.map((cx) => (
            <g key={cx}>
              <rect
                x={cx - 17}
                y="370"
                width="34"
                height="50"
                rx="4"
                fill="#2b2b34"
              />
              <rect
                x={cx - 17}
                y="370"
                width="34"
                height="50"
                rx="4"
                fill="none"
                stroke="#3d3d48"
              />
              <circle
                cx={cx}
                cy="394"
                r="9"
                fill="none"
                stroke="#d9a32a"
                strokeWidth="2.4"
                opacity="0.75"
              />
            </g>
          ))}
        </g>

        {/* Everything that emits light. Kept out of the art group so the phase
            dimming never touches it — a dark truck with live lamps is exactly
            what a highway looks like at night. */}
        <g className="truck__lamps">
          {[54, 286].map((cx) => (
            <g key={cx}>
              <circle
                cx={cx}
                cy="318"
                r="11"
                fill="#ff3b2f"
                filter="url(#tw-lamp)"
              />
              <circle cx={cx} cy="318" r="5" fill="#ffb8ae" />
              <circle
                cx={cx}
                cy="333"
                r="8"
                fill="#ffb020"
                filter="url(#tw-lamp)"
                opacity="0.8"
              />
            </g>
          ))}

          {Array.from({ length: BULB_COUNT }, (_, index) => {
            const x =
              BULB_START + (index * (BULB_END - BULB_START)) / (BULB_COUNT - 1);
            return (
              <circle
                key={index}
                className="truck__bulb"
                style={{ "--i": index } as React.CSSProperties}
                cx={x}
                cy="59"
                r="4"
                fill="#ffe9a8"
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
