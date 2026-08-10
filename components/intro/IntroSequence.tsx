"use client";

import { useEffect, useRef, useState } from "react";

import { INTRO } from "@/lib/constants";
import { useIntro } from "@/components/intro/IntroProvider";
import { useRadioActions } from "@/components/radio/RadioProvider";

const SKIP_KEYS = new Set(["Escape", "Space", "Enter"]);

/**
 * The opening film. Shots are cut back to back, the music comes up on the beat
 * where the driver reaches for the stereo, and the last frame dissolves into
 * the live scene.
 *
 * Only the running shot and the one after it are mounted, so the browser is
 * always a clip ahead and a cut never stalls. Any missing file simply ends the
 * film early — the station is never blocked on an asset.
 */
export function IntroSequence() {
  const { status, complete } = useIntro();
  const radio = useRadioActions();
  const videoRef = useRef<HTMLVideoElement>(null);
  const releasedRef = useRef(false);
  const [shot, setShot] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mount on the first frame of playback and stay mounted through the dissolve.
  if (status === "playing" && !mounted) setMounted(true);

  useEffect(() => {
    if (status !== "done" || !mounted) return;
    const id = window.setTimeout(() => setMounted(false), INTRO.OUTRO_MS);
    return () => window.clearTimeout(id);
  }, [status, mounted]);

  useEffect(() => {
    if (status !== "playing") return;
    const id = window.setTimeout(() => setShowSkip(true), INTRO.SKIP_AFTER_MS);
    return () => window.clearTimeout(id);
  }, [status]);

  useEffect(() => {
    if (status !== "playing") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!SKIP_KEYS.has(event.code)) return;
      event.preventDefault();
      complete();
    };
    // Captured at the window so it wins over the deck shortcuts underneath.
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [status, complete]);

  if (!mounted) return null;

  const current = INTRO.SHOTS[shot];
  const next = INTRO.SHOTS[shot + 1];

  const advance = () => {
    if (next) setShot(shot + 1);
    else complete();
  };

  const handleTimeUpdate = () => {
    if (releasedRef.current || shot !== INTRO.AUDIO_CUE_SHOT) return;
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    if (video.duration - video.currentTime > INTRO.AUDIO_CUE_LEAD) return;
    releasedRef.current = true;
    radio.release();
  };

  return (
    <div
      className="intro"
      data-open={status === "playing"}
      style={
        {
          "--intro-cut": `${INTRO.CUT_MS}ms`,
          "--intro-outro": `${INTRO.OUTRO_MS}ms`,
        } as React.CSSProperties
      }
    >
      <video
        key={current.id}
        ref={videoRef}
        className="intro__video"
        src={current.src}
        poster={current.poster}
        autoPlay
        muted={INTRO.MUTED}
        playsInline
        preload="auto"
        disablePictureInPicture
        tabIndex={-1}
        onEnded={advance}
        onTimeUpdate={handleTimeUpdate}
        // A missing clip, a codec the browser will not take, or a blocked
        // autoplay all mean the same thing: get out of the way.
        onError={complete}
        onCanPlay={(event) => void event.currentTarget.play().catch(complete)}
      />

      {next ? (
        <video
          key={`${next.id}-preload`}
          className="intro__preload"
          src={next.src}
          preload="auto"
          muted
          playsInline
          tabIndex={-1}
          aria-hidden
        />
      ) : null}

      <button
        type="button"
        className="intro__skip"
        data-visible={showSkip}
        onClick={complete}
        tabIndex={showSkip ? 0 : -1}
      >
        Chhodo <kbd>Esc</kbd>
      </button>
    </div>
  );
}
