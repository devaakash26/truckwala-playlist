"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { HORN } from "@/lib/constants";

export interface Horn {
  /** True while a blast is actually sounding. */
  readonly sounding: boolean;
  /** Starts one. Returns its length in seconds, or 0 if it was ignored. */
  readonly start: () => number;
  readonly stop: () => void;
}

interface Voice {
  envelope: GainNode;
  reeds: OscillatorNode[];
}

/**
 * Sounds the horn, and lets go of it again.
 *
 * Two paths, one API: if a file exists at `HORN.SRC` it plays that, and if it
 * does not — which is the default, because the site ships without one — it
 * synthesises the blast instead. So the button works out of the box, and drops
 * onto a real recording the moment one is added.
 *
 * The AudioContext is built on first use rather than on mount, because a
 * context created before the visitor has touched anything starts suspended.
 */
export function useHorn(): Horn {
  const contextRef = useRef<AudioContext | null>(null);
  const fileRef = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<Voice | null>(null);
  const endTimer = useRef(0);
  const lastStart = useRef(0);
  const [sounding, setSounding] = useState(false);

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

  const stop = useCallback(() => {
    window.clearTimeout(endTimer.current);
    setSounding(false);

    const file = fileRef.current;
    if (file && !file.paused) {
      file.pause();
      file.currentTime = 0;
    }

    const voice = voiceRef.current;
    const context = contextRef.current;
    voiceRef.current = null;
    if (!voice || !context) return;

    // Cut on a short ramp rather than at once: killing a loud chord dead puts
    // a click through the speakers.
    const now = context.currentTime;
    voice.envelope.gain.cancelScheduledValues(now);
    voice.envelope.gain.setValueAtTime(Math.max(voice.envelope.gain.value, 0.0001), now);
    voice.envelope.gain.exponentialRampToValueAtTime(0.0001, now + HORN.CUT_SECONDS);
    for (const reed of voice.reeds) reed.stop(now + HORN.CUT_SECONDS + 0.02);
  }, []);

  useEffect(() => stop, [stop]);

  useEffect(() => {
    return () => {
      void contextRef.current?.close();
      contextRef.current = null;
    };
  }, []);

  const start = useCallback((): number => {
    const now = performance.now();
    if (now - lastStart.current < HORN.COOLDOWN_MS) return 0;
    lastStart.current = now;

    const file = fileRef.current;
    const seconds = file && Number.isFinite(file.duration) ? file.duration : HORN.DURATION_SECONDS;

    if (file) {
      file.currentTime = 0;
      void file.play().catch(() => synthesise(contextRef, voiceRef));
    } else {
      synthesise(contextRef, voiceRef);
    }

    setSounding(true);
    window.clearTimeout(endTimer.current);
    endTimer.current = window.setTimeout(() => setSounding(false), seconds * 1000);
    return seconds;
  }, []);

  return { sounding, start, stop };
}

function synthesise(
  contextRef: React.RefObject<AudioContext | null>,
  voiceRef: React.RefObject<Voice | null>,
): void {
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

  const reeds = HORN.TONES.map((tone) => {
    const reed = context.createOscillator();
    reed.type = "sawtooth";
    reed.frequency.setValueAtTime(tone * 2 ** (HORN.BEND_SEMITONES / 12), at);
    reed.frequency.exponentialRampToValueAtTime(tone, at + HORN.BEND_SECONDS);

    const voice = context.createGain();
    voice.gain.value = 1 / HORN.TONES.length;
    reed.connect(voice).connect(body);

    reed.start(at);
    reed.stop(end + 0.05);
    return reed;
  });

  voiceRef.current = { envelope, reeds };
}
