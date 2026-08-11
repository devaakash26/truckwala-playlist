/** Time-of-day buckets. Each one owns a backdrop clip and a colour palette. */
export type PhaseId = "dawn" | "day" | "dusk" | "night";

export interface Phase {
  readonly id: PhaseId;
  readonly label: string;
  readonly startHour: number;
  readonly clip: string;
  readonly poster: string;
}

export interface Track {
  readonly id: string;
  readonly title: string;
  readonly artist?: string;
  readonly film?: string;
  readonly year?: number;
  readonly source: string;
  readonly startAt?: number;
}

export type PlaybackStatus =
  | "connecting"
  | "cued"
  | "buffering"
  | "playing"
  | "paused"
  | "ended"
  | "error";

export interface RadioState {
  readonly index: number;
  readonly status: PlaybackStatus;
  readonly duration: number;
  readonly volume: number;
  readonly muted: boolean;
  readonly ready: boolean;
  readonly unlocked: boolean;
  readonly silenced: boolean;
  readonly released: boolean;
  readonly error: string | null;
  readonly errorStreak: number;
}

export interface RadioActions {
  readonly unlock: (silent?: boolean) => void;
  readonly release: () => void;
  readonly toggle: () => void;
  readonly duck: (seconds: number) => void;
  readonly unduck: () => void;
  readonly next: () => void;
  readonly previous: () => void;
  readonly seekBy: (seconds: number) => void;
  readonly seekTo: (seconds: number) => void;
  readonly setVolume: (volume: number) => void;
  readonly nudgeVolume: (delta: number) => void;
  readonly toggleMute: () => void;
}
