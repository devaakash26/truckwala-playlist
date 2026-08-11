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
  const horn = useHorn();
  const actions = useRadioActions();

  const press = () => {
    // A second press lets go of it, and hands the music straight back rather
    // than leaving it paused for the rest of the blast that is no longer there.
    if (horn.sounding) {
      horn.stop();
      actions.unduck();
      return;
    }

    const seconds = horn.start();
    // Nothing to duck for if the cooldown ate the press.
    if (seconds > 0) actions.duck(seconds + HORN.RESUME_GAP_SECONDS);
  };

  return (
    <button
      type="button"
      className="horn"
      data-sounding={horn.sounding}
      onClick={press}
      aria-label={horn.sounding ? "Horn band karo" : "Horn bajao"}
      aria-pressed={horn.sounding}
    >
      <HornIcon />
    </button>
  );
}
