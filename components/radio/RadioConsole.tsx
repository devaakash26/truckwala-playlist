"use client";

import { useKeyboardControls } from "@/hooks/useKeyboardControls";
import { useMediaSession } from "@/hooks/useMediaSession";
import { STATION } from "@/lib/constants";
import { AudioHint } from "@/components/AudioHint";
import { useIntro } from "@/components/intro/IntroProvider";
import { Disc } from "@/components/radio/Disc";
import { HornButton } from "@/components/radio/HornButton";
import { useCurrentTrack, useRadioState } from "@/components/radio/RadioProvider";
import { SeekBar } from "@/components/radio/SeekBar";
import { TransportControls } from "@/components/radio/TransportControls";
import { VolumeControl } from "@/components/radio/VolumeControl";

export function RadioConsole() {
  const intro = useIntro();
  // The film owns the keyboard while it runs — Space skips it rather than
  // pausing a track nobody can hear yet.
  useKeyboardControls(intro.status !== "playing");
  useMediaSession();

  const track = useCurrentTrack();
  const { error } = useRadioState();
  const credits = [track.artist, track.film, track.year].filter(Boolean).join("  ·  ");

  return (
    <section className="deck" aria-label={`${STATION.NAME} ${STATION.SUFFIX} player`}>
      {/* Inside the deck, because that is what it is anchored against — from
          the stage it resolved to the full stage height and floated off the top
          of the page, which is why it was invisible the first time round. */}
      <AudioHint />
      <Disc />

      <div className="deck__body">
        <h2 className="deck__title" title={track.title}>
          {track.title}
        </h2>
        <p className="deck__credits" data-error={error !== null}>
          {error ?? credits}
        </p>

        <SeekBar />

        <div className="deck__row">
          <TransportControls />
          <div className="deck__aux">
            <HornButton />
            <VolumeControl />
          </div>
        </div>
      </div>
    </section>
  );
}
