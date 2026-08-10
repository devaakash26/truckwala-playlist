import { DEFAULT_PHASE_ID, PHASES } from "@/lib/constants";
import type { Phase, PhaseId } from "@/lib/types";

/**
 * Maps a local wall-clock time onto a phase. Fractional hours keep the
 * rollover smooth right at the boundary minute.
 */
export function resolvePhaseId(date: Date): PhaseId {
  const hour = date.getHours() + date.getMinutes() / 60;
  let resolved: PhaseId = DEFAULT_PHASE_ID;
  for (const phase of PHASES) {
    if (hour >= phase.startHour) resolved = phase.id;
  }
  return resolved;
}

export function getPhase(id: PhaseId): Phase {
  return PHASES.find((phase) => phase.id === id) ?? PHASES[PHASES.length - 1];
}

/**
 * Runs in `<head>` before first paint so the sky gradient is already correct
 * when the page becomes visible — no flash, and no server/client mismatch,
 * because the attribute is written outside React's tree. Generated from PHASES
 * so the boundaries can never drift from the runtime resolver above.
 */
export const PHASE_BOOT_SCRIPT = `(function(){try{var b=${JSON.stringify(
  PHASES.map((phase) => [phase.startHour, phase.id]),
)},d=new Date(),h=d.getHours()+d.getMinutes()/60,p=${JSON.stringify(DEFAULT_PHASE_ID)};for(var i=0;i<b.length;i++){if(h>=b[i][0])p=b[i][1]}document.documentElement.dataset.phase=p}catch(e){}})()`;
