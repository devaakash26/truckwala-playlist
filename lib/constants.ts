import type { Phase, Track } from "@/lib/types";

export const STATION = {
  NAME: "TRUCKWALA",
  SUFFIX: "FM",
  FREQUENCY: "93.5",
  TAGLINE: "Horn OK Please",
} as const;

/**
 * Ordered ascending by `startHour`. The last entry wraps past midnight, so any
 * hour below the first boundary resolves back to it. Keep this sorted — the
 * runtime resolver and the pre-paint boot script are both generated from it.
 */
export const PHASES: readonly Phase[] = [
  { id: "dawn", label: "Bhor", startHour: 5, clip: "/scenes/dawn.mp4", poster: "/scenes/dawn.jpg" },
  { id: "day", label: "Dopahar", startHour: 8, clip: "/scenes/day.mp4", poster: "/scenes/day.jpg" },
  { id: "dusk", label: "Shaam", startHour: 17, clip: "/scenes/dusk.mp4", poster: "/scenes/dusk.jpg" },
  { id: "night", label: "Raat", startHour: 20, clip: "/scenes/night.mp4", poster: "/scenes/night.jpg" },
];

export const DEFAULT_PHASE_ID = PHASES[PHASES.length - 1].id;

/**
 * The station playlist — the 90s Hindi film songs that actually play on a
 * highway. `source` takes a full YouTube URL of any shape or a bare
 * 11-character id, so swapping a track never touches another file.
 */
export const TRACKS: readonly Track[] = [
  { id: "tumse-milne-ko-dil", title: "Tumse Milne Ko Dil", artist: "Alka Yagnik & Kumar Sanu", film: "Phool Aur Kaante", year: 1991, source: "5y_TCKNzAMI" },
  { id: "saaton-janam", title: "Saaton Janam Main Tere", artist: "Kumar Sanu & Alka Yagnik", film: "Dilwale", year: 1994, source: "oFxbBeYhLqM" },
  { id: "mujhse-mohabbat", title: "Mujhse Mohabbat Ka Izhaar Karti", artist: "Kumar Sanu & Alka Yagnik", film: "Hum Hain Rahi Pyar Ke", year: 1993, source: "NwTTV_k656Q" },
  { id: "main-duniya-bhula-doonga", title: "Main Duniya Bhula Doonga", artist: "Anuradha Paudwal & Kumar Sanu", film: "Aashiqui", year: 1990, source: "otQmzlm-s7Q" },
  { id: "tere-dard-se-dil", title: "Tere Dard Se Dil", artist: "Kumar Sanu", film: "Deewana", year: 1992, source: "TgHYW8ubFko" },
  { id: "dekha-hai-pehli-baar", title: "Dekha Hai Pehli Baar", artist: "Alka Yagnik & S. P. Balasubrahmanyam", film: "Saajan", year: 1991, source: "WAgJ8KM5AVQ" },
  { id: "jeeta-tha-jiske-liye", title: "Jeeta Tha Jiske Liye", artist: "Kumar Sanu & Alka Yagnik", film: "Dilwale", year: 1994, source: "CTuvMubzXpU" },
  { id: "tumhein-apna-banane-ki-kasam", title: "Tumhein Apna Banane Ki Kasam", artist: "Anuradha Paudwal & Kumar Sanu", film: "Sadak", year: 1991, source: "tPNwGuu_rQ4" },
  { id: "ek-ladki-ko-dekha", title: "Ek Ladki Ko Dekha", artist: "Kumar Sanu", film: "1942: A Love Story", year: 1994, source: "htMvfOfixuM" },
  { id: "tumsa-koi-pyaara", title: "Tumsa Koi Pyaara", artist: "Kumar Sanu & Alka Yagnik", film: "Khuddar", year: 1994, source: "3NWMK2MRqIk" },
  { id: "achha-sila-diya", title: "Achha Sila Diya Toone", film: "Bewafa Sanam", year: 1995, source: "G7AdjVDBLO8" },
  { id: "woh-meri-neend", title: "Woh Meri Neend Mera Chain", artist: "Sadhana Sargam", film: "Hum Hain Rahi Pyar Ke", year: 1993, source: "bga_0ziOOfQ" },
  { id: "tu-meri-zindagi-hai", title: "Tu Meri Zindagi Hai", artist: "Anuradha Paudwal & Kumar Sanu", film: "Aashiqui", year: 1990, source: "oEg_iXEWlt4" },
  { id: "raah-mein-unse", title: "Raah Mein Unse Mulaqat", artist: "Kumar Sanu & Alka Yagnik", film: "Vijaypath", year: 1994, source: "dDR4oiyjUBA" },
  { id: "chhupana-bhi-nahin-aata", title: "Chhupana Bhi Nahin Aata", film: "Baazigar", year: 1993, source: "fg9G1dacXjk" },
  { id: "nahin-yeh-ho-nahin-sakta", title: "Nahin Yeh Ho Nahin Sakta", artist: "Kumar Sanu & Sadhana Sargam", film: "Barsaat", year: 1995, source: "RjJxWRFfG3s" },
  { id: "kitna-haseen-chehra", title: "Kitna Haseen Chehra", artist: "Kumar Sanu", film: "Dilwale", year: 1994, source: "qGOTe3KmCdY" },
  { id: "tere-dar-par-sanam", title: "Tere Dar Par Sanam", artist: "Kumar Sanu", film: "Phir Teri Kahani Yaad Aayee", year: 1993, source: "5dWbn_qER3s" },
  { id: "maine-pyar-tumhi-se-kiya", title: "Maine Pyar Tumhi Se Kiya Hai", artist: "Anuradha Paudwal & Kumar Sanu", film: "Phool Aur Kaante", year: 1991, source: "-N-k56i7M2k" },
  { id: "tum-to-thehre-pardesi", title: "Tum To Thehre Pardesi", artist: "Altaf Raja", year: 1997, source: "lRBIcaSV-Ns" },
  { id: "chehra-kya-dekhte-ho", title: "Chehra Kya Dekhte Ho", artist: "Asha Bhosle & Kumar Sanu", film: "Salaami", year: 1994, source: "9v2bq2JHt4I" },
  { id: "is-tarah-aashiqui-ka", title: "Is Tarah Aashiqui Ka", artist: "Kumar Sanu", film: "Imtihan", year: 1994, source: "Y-o8NQ8Y36A" },
  { id: "kahin-mujhe-pyar-hua", title: "Kahin Mujhe Pyar Hua Toh Nahin", artist: "Alka Yagnik & Kumar Sanu", film: "Rang", year: 1993, source: "2nypvYilIkA" },
  { id: "pehli-pehli-baar", title: "Pehli Pehli Baar Mohabbat Ki Hai", film: "Sirf Tum", year: 1999, source: "cBGDDBHN22U" },
  { id: "tune-dil-mera-toda", title: "Tune Dil Mera Toda", film: "Sanam Bewafa", year: 1991, source: "nG85YFR3o6U" },
  { id: "sab-kuchh-bhula-diya", title: "Sab Kuchh Bhula Diya", artist: "Sonu Nigam & Sapna Awasthi", film: "Hum Tumhare Hain Sanam", year: 2002, source: "xKx_80QM2LU" },
  { id: "aitbaar-nahi-karna", title: "Aitbaar Nahi Karna", artist: "Abhijeet & Sadhana Sargam", film: "Qayamat", year: 2003, source: "HoMSu1iw0Zw" },
  { id: "dil-ka-aalam", title: "Dil Ka Aalam", film: "Aashiqui", year: 1990, source: "BaAoZA0fup0" },
];

/**
 * Lines painted across a tailgate. Anonymous road folklore — the same handful
 * you read off the back of a truck anywhere in India — so they are quoted, not
 * authored. One entry per truck; a second string becomes a second painted line.
 */
export const TAILGATE = {
  /** The slogan across the panel, where HORN OK PLEASE used to sit. */
  SLOGAN: ["सावधानी हटी", "सब्ज़ी-पूड़ी बंटी"],
  /**
   * Painted down the left flank — only legible once the camera pulls out to
   * overtake, which is the whole point of it.
   */
  FLANK: ["लोन भरना बाकी है", "थोड़ा दूरी बनाये रखे"],
} as const;

export const SHAYARI: ReadonlyArray<readonly string[]> = [
  ["बुरी नज़र वाले", "तेरा मुँह काला"],
  ["देखो मगर प्यार से"],
  ["धीरे चल प्यारे", "जीवन अनमोल है"],
  ["दम है तो क्रॉस कर", "नहीं तो बर्दाश्त कर"],
  ["मालिक की गाड़ी", "ड्राइवर का पसीना"],
  ["धीरे चलोगे तो बार-बार मिलोगे", "तेज़ चलोगे तो हरिद्वार मिलोगे"],
  ["ओके टाटा", "फिर मिलेंगे"],
  ["मैं भी बड़ा होकर", "ट्रक बनूँगा"],
  ["सर कटा सकते हैं", "लेकिन सर झुका सकते नहीं"],
  ["गंगा तेरा पानी अमृत"],
  ["जय माता दी"],
];

export const PLAYER = {
  /** How far ⏪ / ⏩ jump. */
  SEEK_STEP_SECONDS: 10,
  /** Press ⏮ past this point and it restarts the track instead of going back. */
  RESTART_THRESHOLD_SECONDS: 3,
  /** Seek-bar refresh rate. Only the progress subtree re-renders on a tick. */
  PROGRESS_TICK_MS: 250,
  VOLUME_STEP: 5,
  DEFAULT_VOLUME: 80,
  /** Grace period before auto-skipping a track YouTube refused to serve. */
  ERROR_SKIP_DELAY_MS: 1500,
  /** One turn of the disc. */
  DISC_SPIN_SECONDS: 7,
} as const;

export const YOUTUBE = {
  IFRAME_API_SRC: "https://www.youtube.com/iframe_api",
  /**
   * Deliberately tiny and parked offscreen. YouTube's adaptive bitrate ladder
   * keys off the player's rendered size, so a small surface pins us near 144p —
   * we throw the frames away and keep only the audio, which makes this the
   * single biggest bandwidth lever the iframe API exposes.
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
} as const;

/** Who else is on the road right now, and what time it is where the songs are from. */
export const LIVE = {
  ENDPOINT: "/api/live",
  /** Keeps proxies from culling an idle stream. */
  HEARTBEAT_MS: 25_000,
  RECONNECT_MS: 4000,
  TIMEZONE: "Asia/Kolkata",
  CLOCK_TICK_MS: 1000,
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
  CUT_MS: 260,
  OUTRO_MS: 1200,
  SKIP_AFTER_MS: 1400,
  /** Per tab, not per visit: a reload goes straight to the radio. */
  SESSION_KEY: "truckwala:intro-played",
} as const;

/**
 * The horn.
 *
 * Synthesised by default, so it works with no asset at all: an Indian musical
 * horn is a chord of reeds, which is three detuned saws through a lowpass with
 * a short pitch bend at the front. Drop a file at `SRC` and it takes over.
 */
export const HORN = {
  SRC: "/audio/horn.mp3",
  /** Roughly the chord a three-trumpet air horn actually sounds. */
  TONES: [233.08, 293.66, 349.23],
  DURATION_SECONDS: 0.9,
  ATTACK_SECONDS: 0.05,
  RELEASE_SECONDS: 0.3,
  PEAK_GAIN: 0.24,
  FILE_VOLUME: 0.85,
  /** Air-horn wind-up: start a shade flat and settle onto the note. */
  BEND_SEMITONES: -0.7,
  BEND_SECONDS: 0.1,
  FILTER_HZ: 2400,
  /** Stops a held key or a rapid double-tap from stacking blasts. */
  COOLDOWN_MS: 340,
  /** Beat of silence after the blast before the music comes back. */
  RESUME_GAP_SECONDS: 0.14,
} as const;

export const UI = {
  /** How long the "click anywhere" nudge lingers after the sound comes on. */
  HINT_EXIT_MS: 700,
} as const;

export const STORAGE_KEYS = {
  VOLUME: "truckwala:volume",
  MUTED: "truckwala:muted",
} as const;

/** Keyboard map. Values are intents resolved in useKeyboardControls. */
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
