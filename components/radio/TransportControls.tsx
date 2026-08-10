"use client";

import { PLAYER } from "@/lib/constants";
import { useRadioActions, useRadioState } from "@/components/radio/RadioProvider";
import {
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SpinnerIcon,
} from "@/components/radio/icons";

const STEP = PLAYER.SEEK_STEP_SECONDS;

export function TransportControls() {
  const actions = useRadioActions();
  const { status, ready } = useRadioState();

  const isPlaying = status === "playing";
  const isBusy = status === "connecting" || status === "buffering";

  return (
    <div className="deck" role="group" aria-label="Playback controls">
      <button
        type="button"
        className="deck-btn"
        onClick={actions.previous}
        disabled={!ready}
        aria-label="Previous track (P)"
      >
        <SkipBackIcon />
      </button>

      <button
        type="button"
        className="deck-btn deck-btn--seek"
        onClick={() => actions.seekBy(-STEP)}
        disabled={!ready}
        aria-label={`Rewind ${STEP} seconds (left arrow)`}
      >
        <RewindIcon />
        <span className="deck-btn__step">{STEP}</span>
      </button>

      <button
        type="button"
        className="deck-btn deck-btn--primary"
        onClick={actions.toggle}
        disabled={!ready}
        aria-label={isPlaying ? "Pause (space)" : "Play (space)"}
      >
        {isBusy ? <SpinnerIcon /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      <button
        type="button"
        className="deck-btn deck-btn--seek"
        onClick={() => actions.seekBy(STEP)}
        disabled={!ready}
        aria-label={`Forward ${STEP} seconds (right arrow)`}
      >
        <FastForwardIcon />
        <span className="deck-btn__step">{STEP}</span>
      </button>

      <button
        type="button"
        className="deck-btn"
        onClick={actions.next}
        disabled={!ready}
        aria-label="Next track (N)"
      >
        <SkipForwardIcon />
      </button>
    </div>
  );
}
