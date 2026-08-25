"use client";

import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { STATION } from "@/lib/constants";
import { getPhase } from "@/lib/phase";
import {
  useCurrentStation,
  useRadioState,
} from "@/components/radio/RadioProvider";

/** Callsign, frequency and the hour of the day, the way a dial would show it. */
export function StationBadge() {
  const phaseId = useTimeOfDay();
  const { status } = useRadioState();
  const station = useCurrentStation();

  return (
    <header className="callsign">
      <h1 className="sr-only">
        {STATION.NAME} {STATION.SUFFIX} — {STATION.TAGLINE}
      </h1>
      <span className="lamp" data-live={status === "playing"} aria-hidden />
      <span className="brand" aria-hidden>
        {STATION.NAME}
        <em>{STATION.SUFFIX}</em>
      </span>
      <span className="freq tabular">{station.frequency}</span>
      {/* Blank until the client has read its own clock — see useTimeOfDay. */}
      <span className="badge">{phaseId ? getPhase(phaseId).label : "—"}</span>
    </header>
  );
}
