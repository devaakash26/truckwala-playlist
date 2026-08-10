"use client";

import { truckWidthRatio } from "@/lib/highway";

/** Solved once from the camera constants — see truckWidthRatio. */
const WIDTH = `${(truckWidthRatio() * 100).toFixed(2)}dvh`;

/** Bulbs along the top rail, chasing left to right after dark. */
const BULB_COUNT = 13;
const BULB_START = 34;
const BULB_END = 306;

/** Chains slung under the chassis, each swinging on its own clock. */
const CHAIN_X = [118, 144, 170, 196, 222];
const CHAIN_LINKS = 4;

const PLATE_TEXT = "HR 38 C 1947";
/** The line every truck on the GT Road carries. */
const BLESSING = "बुरी नज़र वाले तेरा मुँह काला";

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
export function TruckRear() {
  return (
    <div className="truck" aria-hidden style={{ "--truck-width": WIDTH } as React.CSSProperties}>
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

          {/* Tarpaulin over the load, roped down. */}
          <path d="M24 72C38 28 116 12 170 12s132 16 146 60Z" fill="url(#tw-tarp)" />
          <g stroke="#c9b07a" strokeWidth="1.6" opacity="0.5" fill="none">
            <path d="M62 68 96 22M112 66 146 20M170 66V16M198 66 232 20M248 68 282 24" />
          </g>

          <rect x="18" y="62" width="304" height="22" rx="6" fill="#d9a32a" />
          <rect x="18" y="62" width="304" height="7" rx="3" fill="#f0c65b" />

          {/* Body and the recessed painted tailgate. */}
          <rect x="24" y="80" width="292" height="224" rx="6" fill="url(#tw-body)" />
          <rect x="42" y="98" width="256" height="172" rx="4" fill="#0f6f66" />
          <rect
            x="42"
            y="98"
            width="256"
            height="172"
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
              [33, 262],
              [307, 262],
            ].map(([cx, cy]) => (
              <g key={`${cx}-${cy}`}>
                <circle cx={cx} cy={cy} r="6" />
                <circle cx={cx} cy={cy} r="10" fill="none" stroke="#d9a32a" strokeWidth="1.6" />
              </g>
            ))}
          </g>

          <g className="truck__text" fill="#f7efd9" textAnchor="middle">
            <text x="170" y="138" fontSize="34" letterSpacing="4">
              HORN
            </text>
            <text x="170" y="252" fontSize="34" letterSpacing="4">
              PLEASE
            </text>
          </g>

          <circle cx="170" cy="180" r="27" fill="#d9a32a" stroke="#f7efd9" strokeWidth="3" />
          <text
            className="truck__text"
            x="170"
            y="190"
            fontSize="26"
            textAnchor="middle"
            fill="#7a1512"
          >
            OK
          </text>

          <text
            className="truck__text truck__blessing"
            x="170"
            y="292"
            fontSize="15"
            textAnchor="middle"
            fill="#f0c65b"
          >
            {BLESSING}
          </text>

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
