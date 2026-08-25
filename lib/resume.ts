import { PLAYER, STORAGE_KEYS } from "@/lib/constants";
import { stationTracks } from "@/lib/station";
import type { StationId } from "@/lib/types";

export interface Resume {
  readonly station: StationId;
  readonly id: string;
  readonly seconds: number;
}

export function readResume(): Resume | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.RESUME);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<Resume>;
    const seconds = Number(parsed.seconds);
    if (typeof parsed.id !== "string" || !Number.isFinite(seconds)) return null;
    // A bookmark written before the dial had two bands names no band at all.
    // Those were all Hindi, so read them that way rather than discarding them.
    const station = (parsed.station ?? "hindi") as StationId;
    if (!stationTracks(station).some((track) => track.id === parsed.id)) return null;

    return {
      station,
      id: parsed.id,
      seconds: seconds < PLAYER.RESUME_MIN_SECONDS ? 0 : seconds,
    };
  } catch {
    // Corrupt or unavailable storage is not a reason to fail to start.
    return null;
  }
}

export function writeResume(entry: Resume): void {
  try {
    window.localStorage.setItem(STORAGE_KEYS.RESUME, JSON.stringify(entry));
  } catch {
    // Private mode, quota, whatever — losing the bookmark is survivable.
  }
}
