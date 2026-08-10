"use client";

import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { SCENE } from "@/lib/constants";
import { getPhase } from "@/lib/phase";
import type { PhaseId } from "@/lib/types";

interface SceneVideoProps {
  phaseId: PhaseId;
  active: boolean;
  autoPlay: boolean;
  onUnavailable: () => void;
}

function SceneVideo({ phaseId, active, autoPlay, onUnavailable }: SceneVideoProps) {
  const phase = getPhase(phaseId);
  const [decoded, setDecoded] = useState(false);

  return (
    <video
      className="scene-video"
      data-visible={active && decoded ? "true" : "false"}
      src={phase.clip}
      poster={phase.poster}
      autoPlay={autoPlay}
      loop
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      tabIndex={-1}
      aria-hidden
      onCanPlay={() => setDecoded(true)}
      onError={onUnavailable}
    />
  );
}

/**
 * The window the whole site is watched through: a CSS-composited highway that
 * always renders, with the user-supplied clip for the current phase layered on
 * top once it has decoded.
 *
 * Two clips are only ever mounted at once — the outgoing one lingers for a
 * single crossfade and is then dropped, so a session that runs from afternoon
 * into the night never accumulates video elements.
 */
export function Backdrop() {
  const phase = useTimeOfDay();
  const reducedMotion = usePrefersReducedMotion();
  const [slots, setSlots] = useState<{ current: PhaseId | null; previous: PhaseId | null }>({
    current: null,
    previous: null,
  });
  const [missing, setMissing] = useState<readonly PhaseId[]>([]);

  // Promote the new phase during render so the fade starts on the same frame
  // the clock rolls over.
  if (phase && phase !== slots.current) {
    setSlots({ current: phase, previous: slots.current });
  }

  useEffect(() => {
    if (!slots.previous) return;
    const id = window.setTimeout(
      () => setSlots((current) => ({ ...current, previous: null })),
      SCENE.CROSSFADE_MS,
    );
    return () => window.clearTimeout(id);
  }, [slots.previous]);

  const playable = [slots.previous, slots.current].filter(
    (id): id is PhaseId => id !== null && !missing.includes(id),
  );

  return (
    <div
      className="backdrop"
      aria-hidden
      style={{ "--crossfade": `${SCENE.CROSSFADE_MS}ms` } as React.CSSProperties}
    >
      {/* Hand-built scene. Carries the site on its own until a clip decodes and
          stays as the permanent fallback for any phase without one. Once a clip
          is visible the stylesheet hides this group, which parks its animations. */}
      <div className="terrain">
        <div className="sky" />
        <div className="celestial" />
        <div className="stars" />
        <div className="ridge ridge--far" />
        <div className="ridge ridge--near" />
        <div className="road">
          <div className="road-lane" />
        </div>
        <div className="beams" />
        <div className="dust" />
      </div>

      {playable.map((phaseId) => (
        <SceneVideo
          key={phaseId}
          phaseId={phaseId}
          active={phaseId === slots.current}
          autoPlay={!reducedMotion}
          onUnavailable={() =>
            setMissing((current) => (current.includes(phaseId) ? current : [...current, phaseId]))
          }
        />
      ))}

      {/* Graded over whatever is underneath, so a clip and the CSS scene end up
          sharing the same look. */}
      <div className="vignette" />
      <div className="scrim" />
      <div className="grain" />
    </div>
  );
}
