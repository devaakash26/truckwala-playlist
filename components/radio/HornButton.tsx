"use client";

import { useHorn } from "@/hooks/useHorn";
import { HORN } from "@/lib/constants";
import { useRadioActions } from "@/components/radio/RadioProvider";
import { HornIcon } from "@/components/radio/icons";

/**
 * Also the friendliest way to turn the sound on: it is a click like any other,
 * so the wake listener in RadioProvider un-mutes the station on the same press
 * that sounds the horn.
 */
export function HornButton() {
  const blow = useHorn();
  const actions = useRadioActions();

  const sound = () => {
    const seconds = blow();
    // Nothing to duck for if the cooldown ate the press.
    if (seconds > 0) actions.duck(seconds + HORN.RESUME_GAP_SECONDS);
  };

  return (
    <button type="button" className="horn" onClick={sound} aria-label="Horn bajao">
      <HornIcon />
    </button>
  );
}
