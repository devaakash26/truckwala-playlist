"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  createHighway,
  drawHighway,
  HIGHWAY,
  makeView,
  stepHighway,
  type HighwayState,
  type View,
} from "@/lib/highway";
import { DEFAULT_PHASE_ID } from "@/lib/constants";
import type { PhaseId } from "@/lib/types";

/** Above this the loop assumes the tab was parked and skips the gap. */
const MAX_FRAME_SECONDS = 1 / 15;
/** One still frame, so a reduced-motion visitor still gets the scene. */
const STILL_FRAME_SECONDS = 1 / 60;

interface HighwayProps {
  phase: PhaseId | null;
}

/**
 * The infinite drive. A flat ground plane under a pinhole camera, redrawn each
 * frame — nothing here is a video, and nothing repeats: props, oncoming
 * traffic and dust are recycled with fresh randomness as they pass the camera.
 *
 * The whole thing lives outside React. The component mounts a canvas and hands
 * it to a rAF loop; phase changes arrive through a ref, so a rollover never
 * costs a re-render.
 */
export function Highway({ phase }: HighwayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<PhaseId>(phase ?? DEFAULT_PHASE_ID);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (phase) phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    const state: HighwayState = createHighway(phaseRef.current);
    let view: View = makeView(canvas.clientWidth || 1, canvas.clientHeight || 1);
    let frame = 0;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, HIGHWAY.MAX_DPR);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) return;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      view = makeView(width, height);
    };

    const render = (time: number) => {
      // A dropped frame should not teleport the road forward.
      const dt = last === 0 ? STILL_FRAME_SECONDS : Math.min((time - last) / 1000, MAX_FRAME_SECONDS);
      last = time;
      stepHighway(state, dt, phaseRef.current);
      drawHighway(ctx, state, view);
      frame = requestAnimationFrame(render);
    };

    const start = () => {
      if (frame !== 0) return;
      last = 0;
      frame = requestAnimationFrame(render);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    if (reducedMotion) {
      // Settle the palette and paint a single frame, then leave it alone.
      stepHighway(state, STILL_FRAME_SECONDS, phaseRef.current);
      drawHighway(ctx, state, view);
    } else {
      // A backgrounded tab still fires rAF in some browsers; stopping outright
      // is cheaper and means we never integrate a multi-minute delta.
      const onVisibility = () => (document.hidden ? stop() : start());
      document.addEventListener("visibilitychange", onVisibility);
      start();
      return () => {
        document.removeEventListener("visibilitychange", onVisibility);
        observer.disconnect();
        stop();
      };
    }

    return () => observer.disconnect();
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="highway" />;
}
