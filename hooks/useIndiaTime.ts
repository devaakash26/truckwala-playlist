"use client";

import { useSyncExternalStore } from "react";

import { LIVE } from "@/lib/constants";

const FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: LIVE.TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const PLACEHOLDER = "--:-- --";

/** Recent ICU builds separate the meridiem with U+202F, which reads as a gap. */
const NARROW_SPACE = / | /g;

function subscribe(onChange: () => void): () => void {
  const id = window.setInterval(onChange, LIVE.CLOCK_TICK_MS);
  return () => window.clearInterval(id);
}

/**
 * Safe to call every tick: the string only changes on the minute, and React
 * bails on an unchanged snapshot.
 */
const getSnapshot = () => FORMATTER.format(new Date()).replace(NARROW_SPACE, " ").toLowerCase();
const getServerSnapshot = () => PLACEHOLDER;

/**
 * Wall-clock time in India, wherever the listener actually is — these songs
 * belong to a timezone.
 *
 * A clock is an external source of truth, so it is subscribed to rather than
 * mirrored into state: no effect, no extra render, and the server renders the
 * placeholder so hydration matches.
 */
export function useIndiaTime(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
