"use client";

import { useLiveListeners } from "@/hooks/useLiveListeners";

/** Everyone else with the station open, straight from the presence stream. */
export function Listeners() {
  const listeners = useLiveListeners();

  return (
    <div className="corner corner--right">
      <span className="corner__dot" data-on={listeners !== null} aria-hidden />
      <span className="tabular">{listeners ?? "—"}</span>
      <span className="corner__label">
        {listeners === 1 ? "sun raha hai" : "sun rahe hain"}
      </span>
    </div>
  );
}
