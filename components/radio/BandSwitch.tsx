"use client";

import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { STATIONS, UI } from "@/lib/constants";
import {
  useRadioActions,
  useRadioState,
} from "@/components/radio/RadioProvider";

const widest = (labels: readonly string[]) =>
  labels.reduce((long, label) => (label.length > long.length ? label : long));

export function BandSwitch() {
  const { stationId } = useRadioState();
  const actions = useRadioActions();
  const stationary = usePrefersReducedMotion();
  const [face, setFace] = useState(0);

  useEffect(() => {
    if (stationary) return;
    const id = window.setInterval(
      () => setFace((shown) => shown + 1),
      UI.BAND_FLIP_MS,
    );
    return () => window.clearInterval(id);
  }, [stationary]);

  const at = STATIONS.findIndex((station) => station.id === stationId);

  return (
    <div
      className="band"
      role="group"
      aria-label="Band (B)"
      style={
        {
          "--band-count": STATIONS.length,
          "--band-at": at,
        } as React.CSSProperties
      }
    >
      {/* Behind the labels, so the lit one is never dimmed by it. */}
      <span className="band__thumb" aria-hidden />
      {STATIONS.map((station) => (
        <button
          key={station.id}
          type="button"
          className="band__option"
          aria-pressed={station.id === stationId}
          aria-label={`${station.name} — ${station.frequency} MHz`}
          onClick={() => actions.selectStation(station.id)}
        >
          <span className="band__slot" aria-hidden>
            {/* Holds the width of the longest spelling open, so the switch
                does not breathe in and out as the faces turn. */}
            <span className="band__ghost">{widest(station.labels)}</span>
            {/* Keyed by face so React remounts it, which is what restarts the
                turn — a CSS animation on a node that merely changed its text
                would never play again. */}
            <span className="band__face" key={face}>
              {station.labels[face % station.labels.length]}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
