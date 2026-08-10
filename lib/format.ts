const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const PLACEHOLDER = "--:--";

/** `m:ss`, widening to `h:mm:ss` only when a track actually runs that long. */
export function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return PLACEHOLDER;

  const total = Math.floor(seconds);
  const secs = total % SECONDS_PER_MINUTE;
  const mins = Math.floor(total / SECONDS_PER_MINUTE) % SECONDS_PER_MINUTE;
  const hours = Math.floor(total / SECONDS_PER_HOUR);
  const pad = (value: number) => String(value).padStart(2, "0");

  return hours > 0 ? `${hours}:${pad(mins)}:${pad(secs)}` : `${mins}:${pad(secs)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
