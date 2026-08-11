import { PLAYER, STORAGE_KEYS, TRACKS } from "@/lib/constants";

export interface Resume {
  /** Track id, not index — reordering the playlist must not move the bookmark. */
  readonly id: string;
  readonly seconds: number;
}

/**
 * Where the listener was last time. Returns null when there is nothing worth
 * restoring: no bookmark, a track that has since left the playlist, or a spot
 * so close to the start that resuming to it would be indistinguishable from
 * beginning the song.
 */
export function readResume(): Resume | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.RESUME);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<Resume>;
    const seconds = Number(parsed.seconds);
    if (typeof parsed.id !== "string" || !Number.isFinite(seconds)) return null;
    if (!TRACKS.some((track) => track.id === parsed.id)) return null;

    return { id: parsed.id, seconds: seconds < PLAYER.RESUME_MIN_SECONDS ? 0 : seconds };
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
