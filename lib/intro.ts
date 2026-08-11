import { INTRO } from "@/lib/constants";

/**
 * Whether the opening film is about to run.
 *
 * Lives outside the provider because two places need the answer and neither can
 * import the other: the intro decides whether to render itself, and the radio
 * decides whether to reach for sound on arrival or hold it back for the cue.
 */
export function introWillPlay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    INTRO.SHOTS.length > 0 &&
    window.sessionStorage.getItem(INTRO.SESSION_KEY) === null &&
    // A three-shot film is exactly what someone asking for less motion does not
    // want between them and the music.
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
