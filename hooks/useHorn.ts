"use client";

import { useCallback, useEffect, useRef } from "react";

import { HORN } from "@/lib/constants";

/**
 * Sounds the horn.
 *
 * Two paths, same call: if a file exists at `HORN.SRC` it plays that, and if it
 * does not — which is the default, because the site ships without one — it
 * synthesises the blast instead. So the button works out of the box, and drops
 * onto a real recording the moment one is added.
 *
 * The AudioContext is built on first use rather than on mount, because a
 * context created before the visitor has touched anything starts suspended.
 *
 * Returns how long the blast will last, so the caller can hold the music back
 * for exactly that long — 0 means the cooldown swallowed the press.
 */
export function useHorn(): () => number {
  const contextRef = useRef<AudioContext | null>(null);
  const fileRef = useRef<HTMLAudioElement | null>(null);
  const lastRef = useRef(0);

  useEffect(() => {
    const audio = new Audio(HORN.SRC);
    audio.preload = "auto";
    audio.volume = HORN.FILE_VOLUME;
    // Never fires when the file is absent, which is exactly the signal we want.
    const adopt = () => {
      fileRef.current = audio;
    };
    audio.addEventListener("canplaythrough", adopt, { once: true });

    return () => {
      audio.removeEventListener("canplaythrough", adopt);
      fileRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      void contextRef.current?.close();
      contextRef.current = null;
    };
  }, []);

  return useCallback(() => {
    const now = performance.now();
    if (now - lastRef.current < HORN.COOLDOWN_MS) return 0;
    lastRef.current = now;

    const file = fileRef.current;
    if (file) {
      file.currentTime = 0;
      void file.play().catch(() => synthesise(contextRef));
      return Number.isFinite(file.duration) ? file.duration : HORN.DURATION_SECONDS;
    }

    synthesise(contextRef);
    return HORN.DURATION_SECONDS;
  }, []);
}

function synthesise(contextRef: React.RefObject<AudioContext | null>): void {
  const context = (contextRef.current ??= new AudioContext());
  void context.resume();

  const at = context.currentTime;
  const end = at + HORN.DURATION_SECONDS;

  const body = context.createBiquadFilter();
  body.type = "lowpass";
  body.frequency.value = HORN.FILTER_HZ;

  const envelope = context.createGain();
  envelope.gain.setValueAtTime(0.0001, at);
  envelope.gain.linearRampToValueAtTime(HORN.PEAK_GAIN, at + HORN.ATTACK_SECONDS);
  envelope.gain.setValueAtTime(HORN.PEAK_GAIN, end - HORN.RELEASE_SECONDS);
  // Exponential, because a linear fade on a loud chord sounds like a cut.
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);

  body.connect(envelope).connect(context.destination);

  for (const tone of HORN.TONES) {
    const reed = context.createOscillator();
    reed.type = "sawtooth";
    reed.frequency.setValueAtTime(tone * 2 ** (HORN.BEND_SEMITONES / 12), at);
    reed.frequency.exponentialRampToValueAtTime(tone, at + HORN.BEND_SECONDS);

    const voice = context.createGain();
    voice.gain.value = 1 / HORN.TONES.length;
    reed.connect(voice).connect(body);

    reed.start(at);
    reed.stop(end + 0.05);
  }
}
