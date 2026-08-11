"use client";

import { useRadioActions, useRadioState } from "@/components/radio/RadioProvider";
import { SpeakerIcon } from "@/components/radio/icons";

export function VolumeControl() {
  const actions = useRadioActions();
  const { volume, muted, silenced } = useRadioState();
  const level = muted ? 0 : volume;
  // While the browser is holding the sound back, the station really is muted —
  // so say so here rather than in a banner. Any click turns it on, this one
  // included.
  const quiet = muted || silenced;

  return (
    <div className="volume">
      <button
        type="button"
        className="volume__toggle"
        data-quiet={quiet}
        onClick={actions.toggleMute}
        aria-label={quiet ? "Unmute (M)" : "Mute (M)"}
        aria-pressed={quiet}
      >
        <SpeakerIcon muted={quiet} />
      </button>

      <input
        type="range"
        className="volume__rail"
        min={0}
        max={100}
        step={1}
        value={level}
        aria-label="Volume"
        style={{ "--seek-progress": `${level}%` } as React.CSSProperties}
        onChange={(event) => actions.setVolume(Number(event.target.value))}
      />
    </div>
  );
}
