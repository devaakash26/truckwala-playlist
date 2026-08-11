"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Context,
  type ReactNode,
} from "react";

import { PLAYER, STORAGE_KEYS, TRACKS, YOUTUBE } from "@/lib/constants";
import { clamp } from "@/lib/format";
import { introWillPlay } from "@/lib/intro";
import { readResume, writeResume } from "@/lib/resume";
import type {
  PlaybackStatus,
  RadioActions,
  RadioState,
  Track,
} from "@/lib/types";
import {
  forceLowestQuality,
  loadYouTubeApi,
  parseVideoId,
  PLAYER_ERROR_MESSAGES,
  PLAYER_STATE,
  type YTPlayer,
} from "@/lib/youtube";

/* -------------------------------------------------------------------------- */
/* Store                                                                       */
/* -------------------------------------------------------------------------- */

const STATUS_BY_PLAYER_STATE: Record<number, PlaybackStatus> = {
  [PLAYER_STATE.UNSTARTED]: "cued",
  [PLAYER_STATE.ENDED]: "ended",
  [PLAYER_STATE.PLAYING]: "playing",
  [PLAYER_STATE.PAUSED]: "paused",
  [PLAYER_STATE.BUFFERING]: "buffering",
  [PLAYER_STATE.CUED]: "cued",
};

/** Anything that counts as the visitor showing up. */
const WAKE_EVENTS = ["pointerdown", "keydown", "touchstart"] as const;

const INITIAL_STATE: RadioState = {
  index: 0,
  status: "connecting",
  duration: 0,
  volume: PLAYER.DEFAULT_VOLUME,
  muted: false,
  ready: false,
  unlocked: false,
  silenced: false,
  released: false,
  error: null,
  errorStreak: 0,
};

type Action =
  | { type: "ready" }
  | { type: "unlock"; silent: boolean }
  | { type: "restore"; index: number }
  | { type: "silence" }
  | { type: "release" }
  | { type: "step"; delta: number }
  | { type: "playerState"; playerState: number; duration: number }
  | { type: "error"; message: string }
  | { type: "setVolume"; volume: number }
  | { type: "nudgeVolume"; delta: number }
  | { type: "setMuted"; muted: boolean };

function reducer(state: RadioState, action: Action): RadioState {
  switch (action.type) {
    case "ready":
      return state.ready ? state : { ...state, ready: true, status: "cued" };

    case "unlock":
      return state.unlocked
        ? state
        : {
            ...state,
            unlocked: true,
            silenced: action.silent,
            status: "buffering",
          };

    case "restore":
      return { ...state, index: action.index };

    case "silence":
      return state.silenced ? state : { ...state, silenced: true };

    case "release":
      return state.released ? state : { ...state, silenced: false, released: true };

    case "step": {
      const index =
        (state.index + action.delta + TRACKS.length) % TRACKS.length;
      // Stepping is always a user gesture, so it doubles as the autoplay unlock.
      return {
        ...state,
        index,
        duration: 0,
        error: null,
        unlocked: true,
        status: "buffering",
      };
    }

    case "playerState": {
      const status = STATUS_BY_PLAYER_STATE[action.playerState] ?? state.status;
      const duration = action.duration > 0 ? action.duration : state.duration;
      const errorStreak = status === "playing" ? 0 : state.errorStreak;
      const error = status === "playing" ? null : state.error;
      return { ...state, status, duration, errorStreak, error };
    }

    case "error":
      return {
        ...state,
        status: "error",
        error: action.message,
        errorStreak: state.errorStreak + 1,
      };

    case "setVolume": {
      const volume = clamp(Math.round(action.volume), 0, 100);
      // Nudging the slider up off zero is an implicit un-mute.
      return { ...state, volume, muted: volume === 0 ? state.muted : false };
    }

    case "nudgeVolume":
      return reducer(state, {
        type: "setVolume",
        volume: state.volume + action.delta,
      });

    case "setMuted":
      return { ...state, muted: action.muted };
  }
}

/* -------------------------------------------------------------------------- */
/* Contexts                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Split three ways on purpose. `progress` ticks four times a second, so it is
 * isolated from the discrete state and from the action bag (which never
 * changes identity) — only the seek bar re-renders on a tick.
 */
const StateContext = createContext<RadioState | null>(null);
const ActionsContext = createContext<RadioActions | null>(null);
const ProgressContext = createContext(0);

function useRequiredContext<T>(context: Context<T | null>, name: string): T {
  const value = useContext(context);
  if (value === null)
    throw new Error(`${name} must be used inside <RadioProvider>`);
  return value;
}

export const useRadioState = () =>
  useRequiredContext(StateContext, "useRadioState");
export const useRadioActions = () =>
  useRequiredContext(ActionsContext, "useRadioActions");
export const useRadioProgress = () => useContext(ProgressContext);

export function useCurrentTrack(): Track {
  return TRACKS[useRadioState().index];
}

/* -------------------------------------------------------------------------- */
/* Provider                                                                    */
/* -------------------------------------------------------------------------- */

export function RadioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [progress, setProgress] = useState(0);
  const [progressOwner, setProgressOwner] = useState(state.index);
  const playerRef = useRef<YTPlayer | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  /** Seconds to drop into on the first load only, from the saved bookmark. */
  const pendingResume = useRef(0);

  // Snap the read-out back to zero the instant the track changes, rather than
  // waiting for the next poll to notice. React's documented "adjust state while
  // rendering" pattern — no effect, no extra commit.
  if (progressOwner !== state.index) {
    setProgressOwner(state.index);
    setProgress(TRACKS[state.index].startAt ?? 0);
  }

  /* --- player lifecycle -------------------------------------------------- */

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let player: YTPlayer | null = null;

    // YT.Player *replaces* the node it is given with an <iframe>, so hand it a
    // detached div React knows nothing about — otherwise unmount throws.
    const mount = document.createElement("div");
    host.appendChild(mount);

    loadYouTubeApi()
      .then((YT) => {
        if (disposed) return;
        player = new YT.Player(mount, {
          width: YOUTUBE.PLAYER_WIDTH,
          height: YOUTUBE.PLAYER_HEIGHT,
          playerVars: { ...YOUTUBE.PLAYER_VARS },
          events: {
            onReady: (event) => {
              playerRef.current = event.target;
              dispatch({ type: "ready" });

              // Pick up wherever they left off, before anything loads.
              const resume = readResume();
              if (resume) {
                const index = TRACKS.findIndex((track) => track.id === resume.id);
                if (index >= 0) {
                  pendingResume.current = resume.seconds;
                  dispatch({ type: "restore", index });
                }
              }

              // Start muted, always. That is the one form of autoplay no
              // browser refuses, so the station is definitely rolling before we
              // ask for anything else — no dead silent window while we find
              // out. Sound is requested immediately afterwards, and the probe
              // below settles whether it was granted.
              event.target.mute();
              dispatch({ type: "unlock", silent: true });
            },
            onStateChange: (event) => {
              if (event.data === PLAYER_STATE.PLAYING)
                forceLowestQuality(event.target);
              dispatch({
                type: "playerState",
                playerState: event.data,
                duration: event.target.getDuration(),
              });
              if (event.data === PLAYER_STATE.ENDED)
                dispatch({ type: "step", delta: 1 });
            },
            // YouTube silently re-ladders on network changes; pull it back down.
            onPlaybackQualityChange: (event) =>
              forceLowestQuality(event.target),
            onError: (event) =>
              dispatch({
                type: "error",
                message:
                  PLAYER_ERROR_MESSAGES[event.data] ??
                  `Playback error ${event.data}`,
              }),
          },
        });
        playerRef.current = player;

        // A cross-origin frame does not inherit the page's autoplay permission
        // unless it is granted one. The API normally sets this itself; doing it
        // here too costs nothing and closes the case where it has not, which
        // would block playback no matter what we ask for.
        const frame = host.querySelector("iframe");
        if (frame && !frame.allow.includes("autoplay")) {
          frame.allow = `autoplay; ${frame.allow}`.trim();
        }
      })
      .catch((cause: Error) => {
        if (!disposed) dispatch({ type: "error", message: cause.message });
      });

    return () => {
      disposed = true;
      playerRef.current = null;
      try {
        player?.destroy();
      } catch {
        // destroy() throws if the iframe is already gone — nothing to clean up.
      }
      host.replaceChildren();
    };
  }, []);

  /* --- track loading ----------------------------------------------------- */

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !state.ready) return;

    const track = TRACKS[state.index];
    const videoId = parseVideoId(track.source);
    if (!videoId) {
      dispatch({
        type: "error",
        message: `“${track.title}” has an unreadable YouTube link`,
      });
      return;
    }

    // The bookmark applies to the first load only; every later track change
    // starts where the track itself says to.
    const startSeconds = pendingResume.current || track.startAt || 0;
    pendingResume.current = 0;
    // Same reason as in onReady: the mute has to land before the load.
    if (state.silenced) player.mute();
    // Before the gate is opened we only *cue*, which fetches metadata without
    // streaming; `unlocked` flipping true re-runs this and starts playback
    // inside the user-gesture window.
    if (state.unlocked) player.loadVideoById({ videoId, startSeconds });
    else player.cueVideoById({ videoId, startSeconds });
    // `silenced` is deliberately not a dependency: it is set in the same
    // reducer action as `unlocked`, so it is already true the one time this
    // effect needs it. Listing it would reload the video the instant the sound
    // is turned on, stalling playback right at the moment you start listening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.index, state.ready, state.unlocked]);

  /* --- volume ------------------------------------------------------------ */

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEYS.VOLUME);
    if (stored !== null)
      dispatch({ type: "setVolume", volume: Number(stored) });
    if (window.localStorage.getItem(STORAGE_KEYS.MUTED) === "true") {
      dispatch({ type: "setMuted", muted: true });
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.VOLUME, String(state.volume));
    window.localStorage.setItem(STORAGE_KEYS.MUTED, String(state.muted));

    const player = playerRef.current;
    if (!player || !state.ready) return;
    player.setVolume(state.volume);
    if (state.muted || state.silenced) player.mute();
    else player.unMute();
  }, [state.volume, state.muted, state.silenced, state.ready]);

  /* --- progress ---------------------------------------------------------- */

  useEffect(() => {
    if (state.status !== "playing") return;

    const trackId = TRACKS[state.index].id;
    const bookmark = () => {
      const player = playerRef.current;
      if (player) writeResume({ id: trackId, seconds: player.getCurrentTime() });
    };

    let sinceSave = 0;
    const id = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setProgress(player.getCurrentTime());

      // Bookmark now and then rather than on every tick — a reload should land
      // back on the same song at roughly the same line.
      sinceSave += PLAYER.PROGRESS_TICK_MS;
      if (sinceSave < PLAYER.RESUME_SAVE_MS) return;
      sinceSave = 0;
      bookmark();
    }, PLAYER.PROGRESS_TICK_MS);

    // Closing the tab is the likeliest way to leave, and it never gives us
    // another tick.
    window.addEventListener("pagehide", bookmark);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("pagehide", bookmark);
      bookmark();
    };
  }, [state.status, state.index]);

  /* --- skip past dead tracks --------------------------------------------- */

  useEffect(() => {
    // Once every track has failed in a row, stop — the network or an extension
    // is the problem, and looping the playlist just hammers it.
    if (!state.error || state.errorStreak >= TRACKS.length) return;
    const id = window.setTimeout(
      () => dispatch({ type: "step", delta: 1 }),
      PLAYER.ERROR_SKIP_DELAY_MS,
    );
    return () => window.clearTimeout(id);
  }, [state.error, state.errorStreak, state.index]);

  /* --- actions ----------------------------------------------------------- */

  // Lets `toggleMute` read the latest state without becoming a dependency,
  // which keeps the whole `actions` bag referentially stable for the app's life.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // A duck in progress owns the transport. Any deliberate press cancels it, so
  // the horn can never restart something the listener just stopped.
  const duckTimer = useRef(0);
  const ducking = useRef(false);
  const released = useRef(false);
  /** The out-loud attempt is made once per load, not once per state change. */
  const asked = useRef(false);
  /** When we actually un-muted, so the same press is not read as a command. */
  const wokeAt = useRef(0);
  const cancelDuck = useCallback(() => {
    window.clearTimeout(duckTimer.current);
    ducking.current = false;
  }, []);

  useEffect(() => cancelDuck, [cancelDuck]);

  const seekTo = useCallback((seconds: number) => {
    const player = playerRef.current;
    if (!player) return;
    const target = Math.max(0, seconds);
    player.seekTo(target, true);
    setProgress(target);
  }, []);

  const actions = useMemo<RadioActions>(
    () => ({
      unlock: (silent = false) => dispatch({ type: "unlock", silent }),

      release: () => {
        // Guarded by a ref rather than by state: this runs inside a raw DOM
        // event, and state has not necessarily caught up yet. A ref is set the
        // instant it is read, so the timed cue and a click can race safely.
        if (released.current) return;
        released.current = true;
        dispatch({ type: "release" });

        const player = playerRef.current;
        if (!player) return;

        // Read before un-muting. If any of it has already been audible — the
        // browser allowed the out-loud start — this is just a stray click, and
        // it must not yank the track back to the beginning.
        if (!stateRef.current.silenced && !player.isMuted()) return;

        wokeAt.current = performance.now();
        if (!stateRef.current.muted) player.unMute();
        // It has only been running silently; rewind so it is heard from the top.
        const start = TRACKS[stateRef.current.index].startAt ?? 0;
        player.seekTo(start, true);
        setProgress(start);
        if (player.getPlayerState() !== PLAYER_STATE.PLAYING)
          player.playVideo();
      },

      duck: (seconds: number) => {
        const player = playerRef.current;
        if (!player) return;
        window.clearTimeout(duckTimer.current);
        // Only take the music away if it was actually playing — a horn should
        // not start a paused station.
        if (player.getPlayerState() === PLAYER_STATE.PLAYING) {
          ducking.current = true;
          player.pauseVideo();
        }
        duckTimer.current = window.setTimeout(() => {
          if (!ducking.current) return;
          ducking.current = false;
          playerRef.current?.playVideo();
        }, seconds * 1000);
      },

      unduck: () => {
        window.clearTimeout(duckTimer.current);
        if (!ducking.current) return;
        ducking.current = false;
        playerRef.current?.playVideo();
      },

      toggle: () => {
        cancelDuck();
        const player = playerRef.current;
        if (!player) return;
        // Pressing play is also the gesture that woke the audio, and the
        // pointerdown that did so fires first. Without this the very same press
        // would un-mute the station and then immediately pause it again.
        if (performance.now() - wokeAt.current < PLAYER.WAKE_GRACE_MS)
          return;
        const playerState = player.getPlayerState();
        // Still cued means the gate was never opened; unlocking loads and plays.
        if (
          playerState === PLAYER_STATE.CUED ||
          playerState === PLAYER_STATE.UNSTARTED
        ) {
          dispatch({ type: "unlock", silent: false });
        } else if (
          playerState === PLAYER_STATE.PLAYING ||
          playerState === PLAYER_STATE.BUFFERING
        ) {
          player.pauseVideo();
        } else {
          player.playVideo();
        }
      },

      next: () => {
        cancelDuck();
        dispatch({ type: "step", delta: 1 });
      },

      previous: () => {
        cancelDuck();
        const player = playerRef.current;
        // Same as an FM deck: a late ⏮ restarts the track, an early one goes back.
        if (
          player &&
          player.getCurrentTime() > PLAYER.RESTART_THRESHOLD_SECONDS
        )
          seekTo(0);
        else dispatch({ type: "step", delta: -1 });
      },

      seekBy: (seconds: number) => {
        const player = playerRef.current;
        if (player) seekTo(player.getCurrentTime() + seconds);
      },

      seekTo,

      setVolume: (volume: number) => dispatch({ type: "setVolume", volume }),

      nudgeVolume: (delta: number) => dispatch({ type: "nudgeVolume", delta }),

      toggleMute: () => {
        // Same guard as `toggle`: the press that turned the sound on must not
        // then be read as a request to mute it again.
        if (performance.now() - wokeAt.current < PLAYER.WAKE_GRACE_MS) return;
        dispatch({ type: "setMuted", muted: !stateRef.current.muted });
      },
    }),
    [seekTo, cancelDuck],
  );

  /* --- turning the sound on ---------------------------------------------- */

  /**
   * Did the out-loud start actually take?
   *
   * `playVideo()` reports nothing back, so this reads the player a moment
   * later. Buffering counts as well as playing — both mean permission was
   * granted — but only if the player is still un-muted, because a blocked
   * embed will sometimes mute itself and carry on rather than stopping.
   */
  useEffect(() => {
    if (!state.ready || !state.unlocked || !state.silenced || state.released) return;
    // The film does its own handover, on the beat where the driver reaches for
    // the stereo.
    if (introWillPlay() || asked.current) return;
    asked.current = true;

    // Ask only once the muted start is genuinely under way. Asking any earlier
    // is worse than useless: the request lands before the load, the load then
    // re-applies the mute over the top of it, and the out-loud attempt never
    // actually happens — which is what was going on here.
    const ask = window.setTimeout(() => {
      playerRef.current?.unMute();
    }, PLAYER.AUTOPLAY_ASK_MS);

    const verdict = window.setTimeout(
      () => {
        const player = playerRef.current;
        if (!player) return;

        const running =
          player.getPlayerState() === PLAYER_STATE.PLAYING ||
          player.getPlayerState() === PLAYER_STATE.BUFFERING;
        // Still running and still un-muted means it was granted.
        if (running && !player.isMuted()) {
          released.current = true;
          dispatch({ type: "release" });
          return;
        }

        // Refused. Back to the silent start, which is never refused, and the
        // wake listener below hands the sound over on the first touch.
        player.mute();
        player.playVideo();
      },
      PLAYER.AUTOPLAY_ASK_MS + PLAYER.AUTOPLAY_PROBE_MS,
    );

    return () => {
      window.clearTimeout(ask);
      window.clearTimeout(verdict);
    };
  }, [state.ready, state.unlocked, state.silenced, state.released]);

  // Bound only while the station is still silent, and torn down by that flag
  // flipping rather than by the handler deciding it is finished. An earlier
  // version detached itself the moment `isMuted()` read false, which could
  // happen on a press that landed before `silenced` had even been committed —
  // the listener went away, the mute was then re-applied, and the station
  // stayed silent with nothing left to wake it.
  useEffect(() => {
    // Bound from the moment there is something to play until the sound has
    // actually been handed over — NOT merely while `silenced`. Between asking
    // to play out loud and finding out whether that was refused, the audio is
    // in neither state, and that gap is exactly when a visitor clicks. Waiting
    // for `silenced` meant the very first press was swallowed and they had to
    // click a second time, which on a brand-new domain — where the browser has
    // no history with the site and always refuses — read as "no sound at all".
    if (!state.unlocked || state.released) return;

    const wake = () => {
      if (playerRef.current) actions.release();
    };

    for (const type of WAKE_EVENTS) {
      window.addEventListener(type, wake, { passive: true });
    }
    return () => {
      for (const type of WAKE_EVENTS) window.removeEventListener(type, wake);
    };
  }, [state.unlocked, state.released, actions]);

  return (
    <ActionsContext.Provider value={actions}>
      <StateContext.Provider value={state}>
        <ProgressContext.Provider value={progress}>
          {children}
          {/* The real audio source: a player kept small enough that YouTube
              never bothers streaming a large rendition. */}
          <div
            ref={hostRef}
            aria-hidden
            className="yt-host"
            style={{
              width: YOUTUBE.PLAYER_WIDTH,
              height: YOUTUBE.PLAYER_HEIGHT,
            }}
          />
        </ProgressContext.Provider>
      </StateContext.Provider>
    </ActionsContext.Provider>
  );
}
