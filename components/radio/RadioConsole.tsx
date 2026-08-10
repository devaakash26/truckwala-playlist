"use client";

import { useKeyboardControls } from "@/hooks/useKeyboardControls";
import { useMediaSession } from "@/hooks/useMediaSession";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { STATION } from "@/lib/constants";
import { getPhase } from "@/lib/phase";
import { useRadioState } from "@/components/radio/RadioProvider";
import { SeekBar } from "@/components/radio/SeekBar";
import { SignalMeter } from "@/components/radio/SignalMeter";
import { TrackTicker } from "@/components/radio/TrackTicker";
import { TransportControls } from "@/components/radio/TransportControls";
import { VolumeControl } from "@/components/radio/VolumeControl";

function PhaseBadge() {
  const phaseId = useTimeOfDay();
  // Blank until the client reads its own clock — see useTimeOfDay.
  return <span className="badge">{phaseId ? getPhase(phaseId).label : "—"}</span>;
}

export function RadioConsole() {
  useKeyboardControls();
  useMediaSession();
  const { status } = useRadioState();

  return (
    <section className="console" aria-label={`${STATION.NAME} ${STATION.SUFFIX} player`}>
      <header className="console__head">
        <span className="lamp" data-live={status === "playing"} aria-hidden />
        <span className="brand">
          {STATION.NAME}
          <em>{STATION.SUFFIX}</em>
        </span>
        <span className="freq tabular">{STATION.FREQUENCY}</span>
        <PhaseBadge />
        <SignalMeter />
      </header>

      <TrackTicker />
      <SeekBar />

      <footer className="console__foot">
        <TransportControls />
        <VolumeControl />
      </footer>
    </section>
  );
}
