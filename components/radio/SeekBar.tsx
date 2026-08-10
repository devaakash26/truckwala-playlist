"use client";

import { formatClock } from "@/lib/format";
import {
  useRadioActions,
  useRadioProgress,
  useRadioState,
} from "@/components/radio/RadioProvider";

/**
 * The only component that re-renders on a progress tick — everything else in
 * the console reads from the discrete state context instead.
 */
export function SeekBar() {
  const { duration } = useRadioState();
  const actions = useRadioActions();
  const progress = useRadioProgress();

  const seekable = duration > 0;
  const elapsed = seekable ? Math.min(progress, duration) : progress;
  const percent = seekable ? (elapsed / duration) * 100 : 0;

  return (
    <div className="seek">
      <span className="seek__time tabular">{formatClock(elapsed)}</span>

      <input
        type="range"
        className="seek__rail"
        min={0}
        max={seekable ? duration : 1}
        step={0.5}
        value={elapsed}
        disabled={!seekable}
        aria-label="Seek within track"
        style={{ "--seek-progress": `${percent}%` } as React.CSSProperties}
        onChange={(event) => actions.seekTo(Number(event.target.value))}
      />

      <span className="seek__time tabular">{formatClock(duration)}</span>
    </div>
  );
}
