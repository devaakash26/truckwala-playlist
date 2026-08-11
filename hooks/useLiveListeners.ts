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
    let closed = false;

    const connect = () => {
      if (closed) return;
      source = new EventSource(LIVE.ENDPOINT);

      source.onmessage = (event) => {
        try {
          const listeners = Number(JSON.parse(event.data).listeners);
          if (Number.isFinite(listeners)) setCount(listeners);
        } catch {
          // A malformed frame is not worth tearing the stream down for.
        }
      };

      source.onerror = () => {
        source?.close();
        setCount(null);
        retry = window.setTimeout(connect, LIVE.RECONNECT_MS);
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
