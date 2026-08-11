"use client";

import { useEffect, useState } from "react";

import { UI } from "@/lib/constants";
import { useIntro } from "@/components/intro/IntroProvider";
import { useRadioState } from "@/components/radio/RadioProvider";

/**
 * The station is already playing behind this — it is muted, because no browser
 * will start audio out loud on a page nobody has touched yet. So this is not a
 * gate: it says what the one missing step is, and disappears the moment
 * anything is clicked.
 *
 * It never shows when the browser did allow sound, because the fade-in is
 * delayed past the point where that verdict lands.
 */
export function AudioHint() {
  const { silenced, released, ready } = useRadioState();
  const intro = useIntro();
  const [mounted, setMounted] = useState(true);

  const showing = ready && silenced && !released && intro.status !== "playing";

  useEffect(() => {
    if (!released) return;
    const id = window.setTimeout(() => setMounted(false), UI.HINT_EXIT_MS);
    return () => window.clearTimeout(id);
  }, [released]);

  if (!mounted) return null;

  return (
    <p className="hint" data-open={showing} aria-live="polite">
      <span className="hint__dot" aria-hidden />
      Click anywhere to start the music
    </p>
  );
}
