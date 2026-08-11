"use client";

import { useLiveListeners } from "@/hooks/useLiveListeners";
import { LIVE } from "@/lib/constants";

export function Listeners() {
  const listeners = useLiveListeners();
  const shown = LIVE.BASELINE + (listeners ?? 0);

  return (
    <div className="corner corner--right">
      <span className="corner__dot" data-on={listeners !== null} aria-hidden />
      <span className="tabular">{shown}</span>
      <span className="corner__label">
        {shown === 1 ? "sun raha hai" : "sun rahe hain"}
      </span>
    </div>
  );
}
