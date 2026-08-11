import { YOUTUBE } from "@/lib/constants";

/* -------------------------------------------------------------------------- */
/* Minimal IFrame API surface                                                  */
/* Hand-written instead of pulling @types/youtube: we touch ~15 methods and    */
/* this keeps the dependency count at zero.                                    */
/* -------------------------------------------------------------------------- */

export const PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

/** 101 and 150 are the same thing: the uploader disabled embedding. */
export const PLAYER_ERROR_MESSAGES: Record<number, string> = {
  2: "Invalid video id in the playlist",
  5: "This video cannot play in the HTML5 player",
  100: "Video removed or made private",
  101: "Embedding disabled by the uploader",
  150: "Embedding disabled by the uploader",
};

export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  loadVideoById(args: { videoId: string; startSeconds?: number }): void;
  cueVideoById(args: { videoId: string; startSeconds?: number }): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setPlaybackQuality(quality: string): void;
  getAvailableQualityLevels(): string[];
  destroy(): void;
}

interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

export interface YTPlayerOptions {
  width: number;
  height: number;
  playerVars: Record<string, number>;
  events: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTPlayerEvent) => void;
    onError?: (event: YTPlayerEvent) => void;
    onPlaybackQualityChange?: (event: YTPlayerEvent) => void;
  };
}

interface YTNamespace {
  Player: new (element: HTMLElement, options: YTPlayerOptions) => YTPlayer;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/* -------------------------------------------------------------------------- */
/* API loader                                                                  */
/* -------------------------------------------------------------------------- */

let apiPromise: Promise<YTNamespace> | null = null;

/**
 * Injects the IFrame API exactly once per document and resolves when it is
 * usable. Memoised so React Strict Mode's double-mount — and any future second
 * player — share a single script tag.
 */
export function loadYouTubeApi(): Promise<YTNamespace> {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }

    // The API calls this global on load; chain rather than clobber.
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YouTube API loaded without a Player constructor"));
    };

    const script = document.createElement("script");
    script.src = YOUTUBE.IFRAME_API_SRC;
    script.async = true;
    script.onerror = () => {
      apiPromise = null; // allow a retry on the next mount
      reject(new Error("Could not reach YouTube — check the network or an ad blocker"));
    };
    document.head.appendChild(script);
  });

  return apiPromise;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

const BARE_ID = /^[\w-]{11}$/;
const URL_ID =
  /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/;

/** Accepts any common YouTube URL shape or a bare video id. */
export function parseVideoId(source: string): string | null {
  const trimmed = source.trim();
  if (BARE_ID.test(trimmed)) return trimmed;
  return URL_ID.exec(trimmed)?.[1] ?? null;
}

/**
 * Cover art for the disc.
 *
 * `mqdefault` is the largest thumbnail YouTube guarantees for every video that
 * is *not* letterboxed — `hqdefault` pads 16:9 uploads with black bars, which
 * is exactly what you cannot have inside a circular crop.
 */
export function artworkUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

/**
 * Pins playback to the cheapest rendition YouTube is willing to serve. The API
 * treats this as a hint rather than a command, which is why the player element
 * is also kept tiny — together they reliably keep us at the bottom of the
 * bitrate ladder.
 */
export function forceLowestQuality(player: YTPlayer): void {
  const available = player.getAvailableQualityLevels?.() ?? [];
  const target = YOUTUBE.QUALITY_PREFERENCE.find((level) => available.includes(level));
  player.setPlaybackQuality(target ?? YOUTUBE.QUALITY_PREFERENCE[0]);
}
