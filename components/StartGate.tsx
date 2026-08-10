"use client";

import { useEffect, useState } from "react";

import { STATION, TRACKS, UI } from "@/lib/constants";
import { useIntro } from "@/components/intro/IntroProvider";
import { useRadioState } from "@/components/radio/RadioProvider";
import { HornIcon } from "@/components/radio/icons";

const SHORTCUTS = [
  ["Space", "play / pause"],
  ["← →", "10 sec"],
  ["N / P", "gaana badlo"],
] as const;

/**
 * Every browser blocks audio until the visitor asks for it, so the unlock has
 * to be a real click. Rather than apologise for that, the gate is the station's
 * front door — and pressing it is what puts playback inside the gesture window
 * the autoplay policy requires.
 */
export function StartGate() {
  const { unlocked, ready, error } = useRadioState();
  const intro = useIntro();
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (!unlocked) return;
    const id = window.setTimeout(() => setMounted(false), UI.GATE_EXIT_MS);
    return () => window.clearTimeout(id);
  }, [unlocked]);

  if (!mounted) return null;

  return (
    <div className="gate" data-open={!unlocked}>
      <div className="gate__panel">
        <p className="gate__eyebrow">{STATION.TAGLINE}</p>

        <h1 className="gate__wordmark">
          {STATION.NAME}
          <em>{STATION.SUFFIX}</em>
        </h1>

        <p className="gate__blurb">
          Highway ke puraane gaane, ek hi dhaara mein. Koi list nahi, koi search nahi — bas agla,
          pichla, aur rok.
        </p>

        <button
          type="button"
          className="gate__button"
          onClick={intro.start}
          disabled={!ready}
          autoFocus
        >
          <HornIcon />
          {/* A hard failure before the player ever came up is almost always an
              ad blocker eating the YouTube frame — say so instead of spinning. */}
          {ready ? "Horn bajao" : error ? "Signal nahi mila" : "Tuning in…"}
        </button>

        <p className="gate__meta tabular">
          {STATION.FREQUENCY} MHz · {TRACKS.length} gaane
        </p>

        <ul className="gate__keys">
          {SHORTCUTS.map(([key, label]) => (
            <li key={key}>
              <kbd>{key}</kbd>
              {label}
            </li>
          ))}
        </ul>

        {error ? <p className="gate__error">{error}</p> : null}
      </div>
    </div>
  );
}
