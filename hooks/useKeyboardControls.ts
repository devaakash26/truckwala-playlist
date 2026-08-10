"use client";

import { useEffect } from "react";

import { KEY_BINDINGS, PLAYER, type KeyIntent } from "@/lib/constants";
import type { RadioActions } from "@/lib/types";
import { useRadioActions } from "@/components/radio/RadioProvider";

const INTENT_HANDLERS: Record<KeyIntent, (actions: RadioActions) => void> = {
  toggle: (actions) => actions.toggle(),
  next: (actions) => actions.next(),
  previous: (actions) => actions.previous(),
  forward: (actions) => actions.seekBy(PLAYER.SEEK_STEP_SECONDS),
  rewind: (actions) => actions.seekBy(-PLAYER.SEEK_STEP_SECONDS),
  volumeUp: (actions) => actions.nudgeVolume(PLAYER.VOLUME_STEP),
  volumeDown: (actions) => actions.nudgeVolume(-PLAYER.VOLUME_STEP),
  mute: (actions) => actions.toggleMute(),
};

const EDITABLE = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return EDITABLE.has(target.tagName) || target.isContentEditable;
}

/**
 * Deck-style shortcuts. Bound once at the app root; `actions` is referentially
 * stable, so this listener is attached exactly once for the session.
 */
export function useKeyboardControls(): void {
  const actions = useRadioActions();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Leave browser and OS shortcuts alone.
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;

      const intent = KEY_BINDINGS[event.code as keyof typeof KEY_BINDINGS];
      if (!intent) return;

      event.preventDefault();
      INTENT_HANDLERS[intent](actions);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actions]);
}
