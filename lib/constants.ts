import type { Phase, Track } from "@/lib/types";

export const STATION = {
  NAME: "TRUCKWALA",
  SUFFIX: "FM",
  FREQUENCY: "93.5",
  TAGLINE: "Horn OK Please",
} as const;

export const PHASES: readonly Phase[] = [
  {
    id: "dawn",
    label: "Bhor",
    startHour: 5,
    clip: "/scenes/dawn.mp4",
    poster: "/scenes/dawn.jpg",
  },
  {
    id: "day",
    label: "Dopahar",
    startHour: 8,
    clip: "/scenes/day.mp4",
    poster: "/scenes/day.jpg",
  },
  {
    id: "dusk",
    label: "Shaam",
    startHour: 17,
    clip: "/scenes/dusk.mp4",
    poster: "/scenes/dusk.jpg",
  },
  {
    id: "night",
    label: "Raat",
    startHour: 20,
    clip: "/scenes/night.mp4",
    poster: "/scenes/night.jpg",
  },
];

export const DEFAULT_PHASE_ID = PHASES[PHASES.length - 1].id;

/**
 * The station playlist. `source` accepts a full YouTube URL of any shape
 * (watch / youtu.be / embed / shorts) or a bare 11-character id — swap these
 * freely without touching another file.
 */
export const TRACKS: readonly Track[] = [
  {
    id: "chalte-chalte",
    title: "Chalte Chalte Mere Yeh Geet",
    artist: "Kishore Kumar",
    film: "Chalte Chalte",
    year: 1976,
    source: "https://www.youtube.com/watch?v=I9_IkQIFEl0",
  },
  {
    id: "gaadi-bula-rahi-hai",
    title: "Gaadi Bula Rahi Hai",
    artist: "Kishore Kumar",
    film: "Dost",
    year: 1974,
    source: "https://www.youtube.com/watch?v=3V8Y8GGnLvk",
  },
  {
    id: "musafir-hoon-yaaron",
    title: "Musafir Hoon Yaaron",
    artist: "Kishore Kumar",
    film: "Parichay",
    year: 1972,
    source: "https://www.youtube.com/watch?v=DgKTvq29Li0",
  },
  {
    id: "mujhse-mohabbat",
    title: "Mujhse Mohabbat Ka Izhaar Karti",
    artist: "Kumar Sanu & Alka Yagnik",
    film: "Hum Hain Rahi Pyar Ke",
    year: 1993,
    source: "https://www.youtube.com/watch?v=NwTTV_k656Q",
  },
  {
    id: "zindagi-ka-safar",
    title: "Zindagi Ka Safar",
    artist: "Kishore Kumar",
    film: "Safar",
    year: 1970,
    source: "https://www.youtube.com/watch?v=mA1CM_UpLss",
  },
  {
    id: "chala-jata-hoon",
    title: "Chala Jata Hoon",
    artist: "Kishore Kumar",
    film: "Mere Jeevan Saathi",
    year: 1972,
    source: "https://www.youtube.com/watch?v=UNjhqT_hlbg",
  },
  {
    id: "ek-ajnabee-haseena-se",
    title: "Ek Ajnabee Haseena Se",
    artist: "Kishore Kumar",
    film: "Ajnabee",
    year: 1974,
    source: "https://www.youtube.com/watch?v=0HqHruwzusM",
  },
  {
    id: "ruk-jana-nahin",
    title: "Ruk Jana Nahin",
    artist: "Kishore Kumar",
    film: "Imtihan",
    year: 1974,
    source: "https://www.youtube.com/watch?v=LvVIz1pkQ1k",
  },
  {
    id: "pal-pal-dil-ke-paas",
    title: "Pal Pal Dil Ke Paas",
    artist: "Kishore Kumar",
    film: "Blackmail",
    year: 1973,
    source: "https://www.youtube.com/watch?v=QwLQ4_gkvsE",
  },
];

export const PLAYER = {
  /** How far ⏪ / ⏩ jump. */
  SEEK_STEP_SECONDS: 10,
  /** Press ⏮ past this point and it restarts the track instead of going back. */
  RESTART_THRESHOLD_SECONDS: 3,
  /** Seek-bar refresh rate. Only the progress subtree re-renders on each tick. */
  PROGRESS_TICK_MS: 250,
  VOLUME_STEP: 5,
  DEFAULT_VOLUME: 80,
  /** Grace period before auto-skipping a track YouTube refused to serve. */
  ERROR_SKIP_DELAY_MS: 1500,
} as const;

export const YOUTUBE = {
  IFRAME_API_SRC: "https://www.youtube.com/iframe_api",
  /**
   * Deliberately tiny and parked offscreen. YouTube's adaptive bitrate ladder
   * keys off the player's rendered size, so a small surface pins us near 144p —
   * we throw the frames away and keep only the audio, so this is the single
   * biggest bandwidth lever available through the iframe API.
   */
  PLAYER_WIDTH: 160,
  PLAYER_HEIGHT: 90,
  /** Lowest first. We take the first level YouTube actually offers. */
  QUALITY_PREFERENCE: ["tiny", "small", "medium", "large"],
  PLAYER_VARS: {
    autoplay: 0,
    controls: 0,
    disablekb: 1,
    enablejsapi: 1,
    fs: 0,
    iv_load_policy: 3,
    modestbranding: 1,
    playsinline: 1,
    rel: 0,
  },
} as const;

export const SCENE = {
  /** Re-check the wall clock this often so the backdrop rolls over on its own. */
  PHASE_POLL_MS: 60_000,
  /** Old and new clips overlap for this long on a phase change. */
  CROSSFADE_MS: 2000,
  /** Signal-meter refresh. Cosmetic only — see SignalMeter for why. */
  METER_TICK_MS: 90,
  METER_BARS: 14,
} as const;

/**
 * The opening film: driver walks up, climbs in, reaches for the stereo, rolls
 * out. Shots play in order and every file is optional — a missing one ends the
 * sequence and drops straight into the station, so the site works before a
 * single frame has been generated.
 */
export const INTRO = {
  SHOTS: [
    { id: "approach", src: "/scenes/intro-1.mp4", poster: "/scenes/intro-1.jpg" },
    { id: "cabin", src: "/scenes/intro-2.mp4", poster: "/scenes/intro-2.jpg" },
    { id: "rollout", src: "/scenes/intro-3.mp4", poster: "/scenes/intro-3.jpg" },
  ],
  /** Index of the shot where the driver switches the stereo on. */
  AUDIO_CUE_SHOT: 1,
  /** Bring the music up this many seconds before that shot ends. */
  AUDIO_CUE_LEAD: 1.4,
  /** Clips are silent by default so nothing fights the song. */
  MUTED: true,
  /** Cross-cut between shots, and the dissolve into the live scene. */
  CUT_MS: 260,
  OUTRO_MS: 1200,
  /** Skip appears after this — long enough not to invite an instant skip. */
  SKIP_AFTER_MS: 1400,
  /** Per tab, not per visit: a reload goes straight to the radio. */
  SESSION_KEY: "truckwala:intro-played",
} as const;

export const UI = {
  /** Keep the gate mounted this long after unlock so it can fade out. */
  GATE_EXIT_MS: 900,
} as const;

export const STORAGE_KEYS = {
  VOLUME: "truckwala:volume",
  MUTED: "truckwala:muted",
} as const;

/** Keyboard map. Values are `RadioActions` intents resolved in useKeyboardControls. */
export const KEY_BINDINGS = {
  Space: "toggle",
  KeyK: "toggle",
  ArrowRight: "forward",
  KeyL: "forward",
  ArrowLeft: "rewind",
  KeyJ: "rewind",
  ArrowUp: "volumeUp",
  ArrowDown: "volumeDown",
  KeyN: "next",
  Period: "next",
  KeyP: "previous",
  Comma: "previous",
  KeyM: "mute",
} as const;

export type KeyIntent = (typeof KEY_BINDINGS)[keyof typeof KEY_BINDINGS];
