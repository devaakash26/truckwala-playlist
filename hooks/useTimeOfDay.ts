"use client";

import { useEffect, useState } from "react";

import { SCENE } from "@/lib/constants";
import { resolvePhaseId } from "@/lib/phase";
import type { PhaseId } from "@/lib/types";

export function useTimeOfDay(): PhaseId | null {
  const [phase, setPhase] = useState<PhaseId | null>(null);

  useEffect(() => {
    const sync = () => {
      const next = resolvePhaseId(new Date());
      document.documentElement.dataset.phase = next;
      setPhase((current) => (current === next ? current : next));
    };

    sync();
    const id = window.setInterval(sync, SCENE.PHASE_POLL_MS);
    return () => window.clearInterval(id);
  }, []);

  return phase;
}
