"use client";

import Image from "next/image";

import { PLAYER } from "@/lib/constants";
import { artworkUrl, parseVideoId } from "@/lib/youtube";
import { useCurrentTrack, useRadioState } from "@/components/radio/RadioProvider";

/**
 * The record on the deck. It turns while the station is live and freezes where
 * it stopped when you pause — `animation-play-state` holds the angle, so
 * pressing play again picks the rotation back up mid-turn instead of snapping
 * to the top.
 *
 * Cover art is the video's own thumbnail, so a new track needs no asset.
 */
export function Disc() {
  const track = useCurrentTrack();
  const { status } = useRadioState();
  const videoId = parseVideoId(track.source);

  return (
    <div
      className="disc"
      data-spinning={status === "playing"}
      style={{ "--spin": `${PLAYER.DISC_SPIN_SECONDS}s` } as React.CSSProperties}
    >
      <div className="disc__plate">
        {videoId ? (
          <Image
            key={videoId}
            className="disc__art"
            src={artworkUrl(videoId)}
            alt=""
            fill
            sizes="200px"
            priority
          />
        ) : null}
        <div className="disc__grooves" />
        <div className="disc__hole" />
      </div>
      {/* Outside the turning plate, so the highlight stays put like real glare. */}
      <div className="disc__shine" />
    </div>
  );
}
