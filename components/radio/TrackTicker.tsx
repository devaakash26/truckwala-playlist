"use client";

import { TRACKS } from "@/lib/constants";
import { useCurrentTrack, useRadioState } from "@/components/radio/RadioProvider";

/** Seconds of scroll per character — tuned so long and short titles read alike. */
const SECONDS_PER_CHAR = 0.34;
const MIN_DURATION_SECONDS = 16;

export function TrackTicker() {
  const { index, status, error } = useRadioState();
  const track = useCurrentTrack();
  const upNext = TRACKS[(index + 1) % TRACKS.length];

  const headline = error
    ? `${error} — agla gaana lagta hoon`
    : `${track.title}  ·  ${track.artist}  ·  ${track.film} (${track.year})`;

  const marquee = `${headline}      ✦      Aage: ${upNext.title}      ✦      `;
  const duration = Math.max(MIN_DURATION_SECONDS, marquee.length * SECONDS_PER_CHAR);

  return (
    <div className="ticker" data-status={status}>
      {/* Screen readers get the title once; the duplicated copy below only
          exists so the visual loop has no seam. */}
      <p className="sr-only" aria-live="polite">
        {headline}
      </p>
      <div
        className="ticker__rail"
        aria-hidden
        style={{ "--ticker-duration": `${duration}s` } as React.CSSProperties}
      >
        <span>{marquee}</span>
        <span>{marquee}</span>
      </div>
    </div>
  );
}
