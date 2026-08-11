"use client";

import { useEffect, useState } from "react";

import { LIVE } from "@/lib/constants";

/**
 * How many people have the station open, straight from the presence stream.
 *
 * `null` until the first frame arrives, and again if the connection drops —
 * the strip shows a dash rather than inventing a number.
 */
export function useLiveListeners(): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let source: EventSource | null = null;
    let retry = 0;
    let attempts = 0;
    let closed = false;

    const connect = () => {
      if (closed) return;
      source = new EventSource(LIVE.ENDPOINT);

      source.onmessage = (event) => {
        try {
          const listeners = Number(JSON.parse(event.data).listeners);
          if (!Number.isFinite(listeners)) return;
          // A frame got through, so whatever went wrong before is behind us.
          attempts = 0;
          setCount(listeners);
        } catch {
          // A malformed frame is not worth tearing the stream down for.
        }
      };

      source.onerror = () => {
        source?.close();
        setCount(null);
        if (attempts >= LIVE.RECONNECT_ATTEMPTS) return;
        const wait = Math.min(
          LIVE.RECONNECT_MS * LIVE.RECONNECT_BACKOFF ** attempts,
          LIVE.RECONNECT_MAX_MS,
        );
        attempts += 1;
        retry = window.setTimeout(connect, wait);
      };
    };

    connect();

    return () => {
      closed = true;
      window.clearTimeout(retry);
      source?.close();
    };
  }, []);

  return count;
}
