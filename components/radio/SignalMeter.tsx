"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SCENE } from "@/lib/constants";
import { useRadioState } from "@/components/radio/RadioProvider";

const IDLE_LEVEL = 0.06;
const RESTING_LEVEL = 0.45;
/** How fast a bar chases its new target. Lower = more sluggish needle. */
const SMOOTHING = 0.42;

/**
 * A dial, not an analyser.
 *
 * The audio is inside a cross-origin YouTube iframe, so the Web Audio API can
 * never see the samples — a real spectrum is not on the table. This is an
 * honest VU-style needle: it moves while the station is live and rests when it
 * is not. Bar heights are written straight to CSS custom properties from an
 * interval, so a meter running at ~11 fps costs React nothing.
 */
const ENVELOPE = Array.from({ length: SCENE.METER_BARS }, (_, index) => {
  const position = index / (SCENE.METER_BARS - 1);
  return 0.4 + 0.6 * Math.sin(Math.PI * position ** 0.85);
});

export function SignalMeter() {
  const { status } = useRadioState();
  const reducedMotion = usePrefersReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const bars = Array.from(rail.children) as HTMLElement[];
    const setLevels = (next: (index: number) => number) => {
      bars.forEach((bar, index) => bar.style.setProperty("--level", next(index).toFixed(3)));
    };

    if (status !== "playing") {
      setLevels(() => IDLE_LEVEL);
      return;
    }
    if (reducedMotion) {
      setLevels((index) => ENVELOPE[index] * RESTING_LEVEL);
      return;
    }

    const levels = new Float32Array(bars.length);
    const id = window.setInterval(() => {
      setLevels((index) => {
        const target = ENVELOPE[index] * (0.25 + Math.random() ** 1.6);
        levels[index] += (target - levels[index]) * SMOOTHING;
        return levels[index];
      });
    }, SCENE.METER_TICK_MS);

    return () => window.clearInterval(id);
  }, [status, reducedMotion]);

  return (
    <div className="meter" role="presentation">
      <div
        className="meter__rail"
        ref={railRef}
        style={{ "--meter-tick": `${SCENE.METER_TICK_MS}ms` } as React.CSSProperties}
      >
        {ENVELOPE.map((_, index) => (
          <span key={index} className="meter__bar" />
        ))}
      </div>
    </div>
  );
}
