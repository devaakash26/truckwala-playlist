"use client";

import { SHAYARI, TAILGATE } from "@/lib/constants";
import { flankPoint, flankScale, truckWidthRatio, TRUCK } from "@/lib/highway";
import { useRadioState } from "@/components/radio/RadioProvider";

/** Solved once from the camera constants — see truckWidthRatio. */
const WIDTH = `${(truckWidthRatio() * 100).toFixed(2)}dvh`;
/** Handed to CSS so the canvas and the stylesheet cap the width identically. */
const MAX_WIDTH = `${TRUCK.MAX_VIEWPORT_FRACTION * 100}vw`;

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
  return Math.min(cap, room / (Math.max(...lines.map(clusters)) * PAINT_ADVANCE));
}

/* --- the flank, and what is painted on it --------------------------------- */

/**
 * Heights on the rear face that get carried down the side. A slab of colour
 * reads as a billboard; what makes it read as a truck is that the canopy, the
 * gold rail, the chassis and the wheels all keep going past the tailgate.
 */
const SIDE = {
  TARP_TOP: 44,
  RAIL_TOP: 62,
  RAIL_BOTTOM: 84,
  PANEL_BOTTOM: 304,
  CHASSIS_BOTTOM: 318,
  WHEEL_Y: 390,
  SHADOW_TOP: 402,
  SHADOW_BOTTOM: 426,
} as const;

/** Rear bogie sits close to the tailgate; the third axle is under the cab. */
const AXLES = [0.085, 0.225, 0.84];
const RIBS = [0.18, 0.36, 0.54, 0.72];

const EDGE = TRUCK.BODY_LEFT;
const corner = (y: number, t: number) => flankPoint(EDGE, y, t).join(",");

/** A band running the full length of the truck, between two heights. */
const strip = (top: number, bottom: number) =>
  `${corner(top, 0)} ${corner(top, 1)} ${corner(bottom, 1)} ${corner(bottom, 0)}`;

const PANEL_POINTS = strip(SIDE.RAIL_BOTTOM, SIDE.PANEL_BOTTOM);

/** Centre line of the side panel — where the lettering runs. */
const LETTER_Y = (SIDE.RAIL_BOTTOM + SIDE.PANEL_BOTTOM) / 2;
const [NEAR_X, NEAR_Y] = flankPoint(EDGE, LETTER_Y, 0);
const [FAR_X, FAR_Y] = flankPoint(EDGE, LETTER_Y, 1);
const FLANK_MID_X = (NEAR_X + FAR_X) / 2;
const FLANK_MID_Y = (NEAR_Y + FAR_Y) / 2;
const FLANK_RUN = Math.hypot(NEAR_X - FAR_X, NEAR_Y - FAR_Y);
const FLANK_ANGLE = (Math.atan2(NEAR_Y - FAR_Y, NEAR_X - FAR_X) * 180) / Math.PI;
const FLANK_SIZE = fit(TAILGATE.FLANK, FLANK_RUN * 0.84, 24);

/** Bulbs along the top rail, chasing left to right after dark. */
const BULB_COUNT = 13;
const BULB_START = 34;
const BULB_END = 306;

/** Chains slung under the chassis, each swinging on its own clock. */
const CHAIN_X = [118, 144, 170, 196, 222];
const CHAIN_LINKS = 4;

const PLATE_TEXT = "HR 38 C 1947";

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
  const paint = fit(lines, PAINT_WIDTH, lines.length > 1 ? PAINT_MAX_DOUBLE : PAINT_MAX_SINGLE);
  const baseline = lines.length > 1 ? 274 : 288;

  const slogan = fit(TAILGATE.SLOGAN, PANEL_WIDTH, PANEL_MAX);
  const sloganTop = PANEL_MID - ((TAILGATE.SLOGAN.length - 1) * slogan * 1.15) / 2 + slogan * 0.34;

  return (
    <div
      className="truck"
      aria-hidden
      ref={ref}
      style={{ "--truck-width": WIDTH, "--truck-max": MAX_WIDTH } as React.CSSProperties}
    >
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

        <ellipse className="truck__shadow" cx="170" cy="420" rx="146" ry="15" filter="url(#tw-blur)" />

        <g className="truck__art">
          {/* Rear axle, mostly hidden behind the flaps. */}
          <ellipse cx="74" cy="392" rx="33" ry="27" fill="#121218" />
          <ellipse cx="266" cy="392" rx="33" ry="27" fill="#121218" />

          {/* The left flank. Drawn at full pull-out and revealed by scaling it
              horizontally about the body's edge — see flankGeometry for why
              that single scale is geometrically exact at every angle. Behind
              the body in paint order, so the rear face always wins. */}
          <g className="truck__flank">
            <polygon
              points={strip(SIDE.SHADOW_TOP, SIDE.SHADOW_BOTTOM)}
              fill="#000"
              opacity="0.4"
            />

            {AXLES.map((t) => {
              const [cx, cy] = flankPoint(EDGE, SIDE.WHEEL_Y, t);
              const size = flankScale(t);
              return (
                <ellipse key={t} cx={cx} cy={cy} rx={30 * size} ry={27 * size} fill="#0e0e13" />
              );
            })}

            <polygon points={strip(SIDE.PANEL_BOTTOM, SIDE.CHASSIS_BOTTOM)} fill="#1d1d24" />
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

            <polygon points={strip(SIDE.RAIL_TOP, SIDE.RAIL_BOTTOM)} fill="#a97c1f" />
            <polygon points={strip(SIDE.TARP_TOP, SIDE.RAIL_TOP)} fill="#222b3d" />

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
                    y={(row - (TAILGATE.FLANK.length - 1) / 2) * FLANK_SIZE * 1.2 + FLANK_SIZE * 0.34}
                    fontSize={FLANK_SIZE}
                  >
                    {line}
                  </text>
                ))}
              </g>
            </g>
          </g>

          {/* Tarpaulin over the load, roped down. */}
          <path d="M24 72C38 28 116 12 170 12s132 16 146 60Z" fill="url(#tw-tarp)" />
          <g stroke="#c9b07a" strokeWidth="1.6" opacity="0.5" fill="none">
            <path d="M62 68 96 22M112 66 146 20M170 66V16M198 66 232 20M248 68 282 24" />
          </g>

          <rect x="18" y="62" width="304" height="22" rx="6" fill="#d9a32a" />
          <rect x="18" y="62" width="304" height="7" rx="3" fill="#f0c65b" />

          {/* Body and the recessed painted tailgate. */}
          <rect x="24" y="80" width="292" height="224" rx="6" fill="url(#tw-body)" />
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
                <circle cx={cx} cy={cy} r="10" fill="none" stroke="#d9a32a" strokeWidth="1.6" />
              </g>
            ))}
          </g>

          <g className="truck__text" fill="#f7efd9" textAnchor="middle">
            {TAILGATE.SLOGAN.map((line, row) => (
              <text key={line} x="170" y={sloganTop + row * slogan * 1.15} fontSize={slogan}>
                {line}
              </text>
            ))}
          </g>

          {/* Remounted with the track, so the paint fades up as if it were
              lettered on while you were not looking. */}
          <g key={index} className="truck__shayari" fill="#f0c65b" textAnchor="middle">
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
              <rect x={cx - 22} y="306" width="44" height="36" rx="6" fill="#33333d" />
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

          <rect x="10" y="344" width="320" height="18" rx="9" fill="url(#tw-chrome)" />

          {CHAIN_X.map((x, index) => (
            <Chain key={x} x={x} index={index} />
          ))}

          <rect x="42" y="362" width="62" height="48" rx="3" fill="#17171d" />
          <rect x="236" y="362" width="62" height="48" rx="3" fill="#17171d" />
          <g fill="#d9a32a" opacity="0.7">
            <circle cx="73" cy="386" r="9" />
            <circle cx="267" cy="386" r="9" />
          </g>
        </g>

        {/* Everything that emits light. Kept out of the art group so the phase
            dimming never touches it — a dark truck with live lamps is exactly
            what a highway looks like at night. */}
        <g className="truck__lamps">
          {[54, 286].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="318" r="11" fill="#ff3b2f" filter="url(#tw-lamp)" />
              <circle cx={cx} cy="318" r="5" fill="#ffb8ae" />
              <circle cx={cx} cy="333" r="8" fill="#ffb020" filter="url(#tw-lamp)" opacity="0.8" />
            </g>
          ))}

          {Array.from({ length: BULB_COUNT }, (_, index) => {
            const x = BULB_START + (index * (BULB_END - BULB_START)) / (BULB_COUNT - 1);
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
