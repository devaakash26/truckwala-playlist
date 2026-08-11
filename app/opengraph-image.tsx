import { ImageResponse } from "next/og";

import { STATION } from "@/lib/constants";
import { SEO, STATION_NAME } from "@/lib/seo";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = SEO.TITLE;

/**
 * The card that shows up when the link is pasted into WhatsApp, Twitter or
 * Slack. Generated at build time rather than shipped as a file, so it can never
 * drift out of step with the station's name or palette.
 *
 * Text is left to the renderer's own font stack and kept to Latin; the truck is
 * an inline SVG with no text in it, so nothing here depends on a font being
 * fetched at build time.
 */
const TRUCK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 110">
  <g fill="#ffc247">
    <rect x="8" y="20" width="104" height="62" rx="6"/>
    <path d="M112 38h28a10 10 0 0 1 7.6 3.5l20 23.4a10 10 0 0 1 2.4 6.5V82h-58z"/>
    <rect x="4" y="82" width="176" height="9" rx="4.5"/>
  </g>
  <g fill="#14101b">
    <circle cx="44" cy="92" r="17"/><circle cx="146" cy="92" r="17"/>
  </g>
  <g fill="#ffc247">
    <circle cx="44" cy="92" r="6"/><circle cx="146" cy="92" r="6"/>
  </g>
</svg>`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(160deg, #05070f 0%, #101a35 55%, #23335f 100%)",
          color: "#f7f1e6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#ffc247" }} />
          <div style={{ fontSize: 26, letterSpacing: 6, color: "#b9c3d8" }}>
            {STATION.FREQUENCY} MHz · {STATION.TAGLINE.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>
            {STATION_NAME}
          </div>
          <div style={{ fontSize: 34, color: "#c8d0e2", maxWidth: 820, lineHeight: 1.35 }}>
            Old Hindi truck driver songs, non-stop — Kishore Kumar, Kumar Sanu, Alka Yagnik,
            Udit Narayan.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ fontSize: 24, letterSpacing: 3, color: "#8e9ab5" }}>
            No playlist to pick. Press play and drive.
          </div>
          <img src={`data:image/svg+xml;base64,${btoa(TRUCK)}`} width={260} height={143} alt="" />
        </div>
      </div>
    ),
    size,
  );
}
