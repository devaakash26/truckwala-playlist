"use client";

import { useEffect } from "react";

import { PLAYER, STATION } from "@/lib/constants";
import { useCurrentTrack, useRadioActions, useRadioState } from "@/components/radio/RadioProvider";

/**
 * Publishes the station to the OS — lock screen, media keys, the macOS Now
 * Playing widget.
 *
 * Best-effort by nature: the audio really lives in a cross-origin YouTube
 * iframe, and some browsers let that frame claim the session and overwrite this
 * metadata. Where the top document wins (desktop Chrome, Edge) it works; where
 * it does not, nothing breaks.
 */
export function useMediaSession(): void {
  const { status } = useRadioState();
  const actions = useRadioActions();
  const track = useCurrentTrack();

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: `${track.film} · ${track.year} — ${STATION.NAME} ${STATION.SUFFIX}`,
    });
  }, [track]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const handlers: ReadonlyArray<[MediaSessionAction, MediaSessionActionHandler]> = [
      ["play", () => actions.toggle()],
      ["pause", () => actions.toggle()],
      ["previoustrack", () => actions.previous()],
      ["nexttrack", () => actions.next()],
      ["seekbackward", () => actions.seekBy(-PLAYER.SEEK_STEP_SECONDS)],
      ["seekforward", () => actions.seekBy(PLAYER.SEEK_STEP_SECONDS)],
    ];

    for (const [action, handler] of handlers) {
      // Unsupported actions throw rather than no-op in some engines.
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        /* not supported here */
      }
    }

    return () => {
      for (const [action] of handlers) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          /* not supported here */
        }
      }
    };
  }, [actions]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState =
      status === "playing" ? "playing" : status === "paused" ? "paused" : "none";
  }, [status]);
}
