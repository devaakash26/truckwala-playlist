/** Time-of-day buckets. Each one owns a backdrop clip and a colour palette. */
export type PhaseId = "dawn" | "day" | "dusk" | "night";

export interface Phase {
  readonly id: PhaseId;
  /** Shown in the console badge. */
  readonly label: string;
  /** Local-time hour this phase takes over at, inclusive. */
  readonly startHour: number;
  readonly clip: string;
  readonly poster: string;
}

export interface Track {
  readonly id: string;
  readonly title: string;
  readonly artist: string;
  readonly film: string;
  readonly year: number;
  /** Full YouTube URL or a bare 11-character video id — both are accepted. */
  readonly source: string;
  /** Seconds of intro to skip. */
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
  readonly error: string | null;
  /** Consecutive un-playable tracks. Stops auto-skip from looping the playlist. */
  readonly errorStreak: number;
}

export interface RadioActions {
  readonly unlock: () => void;
  readonly toggle: () => void;
  readonly next: () => void;
  readonly previous: () => void;
  readonly seekBy: (seconds: number) => void;
  readonly seekTo: (seconds: number) => void;
  readonly setVolume: (volume: number) => void;
  readonly nudgeVolume: (delta: number) => void;
  readonly toggleMute: () => void;
}
