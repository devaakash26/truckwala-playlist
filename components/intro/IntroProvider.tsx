"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { INTRO } from "@/lib/constants";
import { introWillPlay } from "@/lib/intro";
import { useRadioActions, useRadioState } from "@/components/radio/RadioProvider";

export type IntroStatus = "idle" | "playing" | "done";

interface IntroValue {
  readonly status: IntroStatus;
  readonly complete: () => void;
}

const IntroContext = createContext<IntroValue | null>(null);

export function useIntro(): IntroValue {
  const value = useContext(IntroContext);
  if (!value) throw new Error("useIntro must be used inside <IntroProvider>");
  return value;
}

/**
 * Runs the opening film, if there is one, between the page loading and the
 * station appearing.
 *
 * Nothing here starts playback — the radio does that muted as soon as it is
 * ready. The film just decides when to hand the sound over, at the beat where
 * the driver reaches for the stereo. `release` is idempotent, so that cue and
 * the visitor's first click can both fire without restarting the song twice.
 */
export function IntroProvider({ children }: { children: ReactNode }) {
  const radio = useRadioActions();
  const { ready } = useRadioState();
  const [finished, setFinished] = useState(false);

  // Decided once, on the client. Safe to settle during render because `ready`
  // is false until the YouTube API has loaded, so the server and the first
  // hydration both render "idle" regardless of what this comes out as.
  const [enabled] = useState(introWillPlay);

  const status: IntroStatus = finished ? "done" : !ready ? "idle" : enabled ? "playing" : "done";

  const value = useMemo<IntroValue>(
    () => ({
      status,
      complete: () => {
        window.sessionStorage.setItem(INTRO.SESSION_KEY, "1");
        setFinished(true);
        radio.release();
      },
    }),
    [radio, status],
  );

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}
