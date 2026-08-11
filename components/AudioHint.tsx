"use client";

import { useEffect, useState } from "react";

import { UI } from "@/lib/constants";
import { useIntro } from "@/components/intro/IntroProvider";
import { useRadioState } from "@/components/radio/RadioProvider";

/**
 * The station starts on its own, but muted — every browser blocks audible
 * autoplay, and no amount of code gets around that. So instead of a door in
 * front of the site, this is a nudge beside it: the music is already running,
 * and the next thing the visitor touches turns it up.
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
      Gaana chal raha hai — kahin bhi click karo, awaaz aa jayegi
    </p>
  );
}
