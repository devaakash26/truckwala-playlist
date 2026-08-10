"use client";

import { useRadioActions, useRadioState } from "@/components/radio/RadioProvider";
import { SpeakerIcon } from "@/components/radio/icons";

export function VolumeControl() {
  const actions = useRadioActions();
  const { volume, muted } = useRadioState();
  const level = muted ? 0 : volume;

  return (
    <div className="volume">
      <button
        type="button"
        className="volume__toggle"
        onClick={actions.toggleMute}
        aria-label={muted ? "Unmute (M)" : "Mute (M)"}
        aria-pressed={muted}
      >
        <SpeakerIcon muted={muted} />
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
