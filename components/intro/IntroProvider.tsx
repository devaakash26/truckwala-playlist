"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { INTRO } from "@/lib/constants";
import { useRadioActions } from "@/components/radio/RadioProvider";

export type IntroStatus = "idle" | "playing" | "done";

interface IntroValue {
  readonly status: IntroStatus;
  /** Called by the gate. Decides whether there is a film to play at all. */
  readonly start: () => void;
  /** Ends the film — by reaching the last frame, by skipping, or by a 404. */
  readonly complete: () => void;
}

const IntroContext = createContext<IntroValue | null>(null);

export function useIntro(): IntroValue {
  const value = useContext(IntroContext);
  if (!value) throw new Error("useIntro must be used inside <IntroProvider>");
  return value;
}

/**
 * Owns the handover between the opening film and the station.
 *
 * The gate press is the only real user gesture we get, so it always starts
 * playback — silently when a film is about to run. Whoever finishes the film
 * hands the audio over with `release`, which is idempotent, so the timed cue
 * and the end-of-film call can both fire without restarting the song twice.
 */
export function IntroProvider({ children }: { children: ReactNode }) {
  const radio = useRadioActions();
  const [status, setStatus] = useState<IntroStatus>("idle");
  const enabledRef = useRef(false);

  useEffect(() => {
    enabledRef.current =
      INTRO.SHOTS.length > 0 &&
      window.sessionStorage.getItem(INTRO.SESSION_KEY) === null &&
      // A three-shot film is exactly what someone asking for less motion does
      // not want between them and the music.
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const value = useMemo<IntroValue>(
    () => ({
      status,
      start: () => {
        const withFilm = enabledRef.current;
        radio.unlock(withFilm);
        setStatus(withFilm ? "playing" : "done");
      },
      complete: () => {
        window.sessionStorage.setItem(INTRO.SESSION_KEY, "1");
        setStatus("done");
        radio.release();
      },
    }),
    [radio, status],
  );

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}
