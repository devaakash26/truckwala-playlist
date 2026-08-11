"use client";

import { useIndiaTime } from "@/hooks/useIndiaTime";

/** The hour where the songs come from, wherever the listener happens to be. */
export function IstClock() {
  const time = useIndiaTime();

  return (
    <div className="corner corner--left">
      <span className="clock tabular">{time}</span>
    </div>
  );
}
