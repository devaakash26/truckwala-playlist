# Truckwala FM

A one-station radio. 90s Hindi film songs play in order over a cinematic
truck-on-the-highway backdrop that follows the listener's own clock — dawn, day,
dusk, night. There is no track list and no search, on purpose: the only controls
are previous, rewind, play/pause, forward, next, and a record that turns while
the station is live.

```bash
npm run dev     # http://localhost:3000
npm run build
npm start
```

## How it works

**Audio** comes from a YouTube IFrame player parked offscreen at 160×90. That
size is the point — YouTube's adaptive bitrate ladder keys off the rendered
player size, so a small surface pins playback near 144p and we effectively pay
for audio only. `forceLowestQuality` re-asserts this whenever YouTube tries to
re-ladder.

**The gate** exists because every browser blocks audio until a real click. The
player is created and the first track *cued* on load; pressing the horn flips
`unlocked`, which re-runs the load effect as `loadVideoById` inside the gesture
window. That is why the gate is a door rather than an apology.

**The opening film** runs between the two — driver walks up, climbs in, reaches
for the stereo, rolls out. The song comes up on that reach, 1.4 s before the
cabin shot ends. Playback still *starts* on the gate click, because sticky user
activation is the only thing Safari reliably honours; it is simply held muted
(`silenced`) and rewound to the top when the cue fires. Skippable from the first
second and a half, and remembered per tab, so a reload goes straight to the
radio. No clips on disk means no film — the station opens immediately.

**The backdrop** is three things stacked. Underneath, an infinite drive rendered
to a canvas: a ground plane under a pinhole camera, with roadside props,
oncoming traffic, overpasses and dust recycled with fresh randomness as they
pass, and a hand-drawn SVG truck bobbing ahead of you on two out-of-phase
cycles. The road bends and climbs — both are `amount × (z − NEAR_Z)²`, driven off
distance travelled, so the offset vanishes at the bumper and piles up toward the
horizon the way a real bend does. That means the road is no longer a quad, so
each band is walked in 24 geometrically-spaced steps; screen y goes as `1/z`
while the bend's screen x goes as `z`, and equal ratios are the spacing that
keeps both ends under half a pixel of faceting. Above it,
the clip for the current phase fades in once it decodes. Only two clips are ever
mounted (the outgoing one lingers for a single crossfade), and once one is
visible the whole drawn scene is set to `visibility: hidden`, which parks the rAF
loop's output and every CSS animation with it.

Nothing about that drive is a video. It costs no bandwidth, covers every phase
whether or not a clip exists, and scales to any screen — which is why it is the
fallback rather than a placeholder.

**Time of day** is resolved before first paint by a small inline script that
writes `data-phase` onto `<html>` — no flash, and no hydration mismatch, since
the attribute is written outside React. Every colour in the app is a custom
property keyed off that attribute, and the properties are registered with
`@property`, so 20:00 arriving morphs the entire site from dusk to night over a
couple of seconds rather than snapping.

## Changing the station

Everything tunable lives in [`lib/constants.ts`](lib/constants.ts).

- **Playlist** — edit `TRACKS`. `source` takes a full YouTube URL of any shape
  (`watch`, `youtu.be`, `embed`, `shorts`) or a bare 11-character id. `artist`,
  `film` and `year` are optional and simply omitted from the credit line when
  absent — a missing credit beats a wrong one. Add `startAt` to skip an intro. A
  video with embedding disabled is detected and skipped automatically.
- **Clips** — see [`public/scenes/README.md`](public/scenes/README.md) for the
  shot list, the generation prompts and encoding specs. Drop the files in and
  they are picked up with no code change.
- **Phase boundaries** — `PHASES`. The resolver and the pre-paint boot script
  are both generated from it.
- **The film** — `INTRO`: shot order, which shot carries the audio cue and how
  early it fires, skip delay.
- **The drive** — `HIGHWAY` in [`lib/highway.ts`](lib/highway.ts) is all in
  metres and seconds: camera height, speed, road width, how far apart the poles
  stand, how sharply the road bends. `SCENE_PALETTE` in
  [`lib/palette.ts`](lib/palette.ts) colours it.
- **The tailgate** — `TAILGATE.SLOGAN` is the big line across the panel and
  `TAILGATE.FLANK` is painted down the truck's left side. `SHAYARI` is the small
  band under the panel: one entry per truck, picked by track index, so a new song
  brings a differently-lettered truck. Type size is solved from the cluster
  count everywhere — Devanagari matras stack rather than advance, so `.length`
  badly overcounts.
- **The overtake** — `DRIFT_*`. Every 46 s the camera really does pull into the
  next lane, hold, and tuck back in. The whole scene parallaxes because
  `cameraX` is part of the projection, the truck slides the other way, and its
  flank swings into view. How far it can go is set by the frame rather than the
  road: the truck must not run off the edge, which on a phone leaves almost no
  room, so the move degrades to a gentle parallax with no flank — which is what
  being stuck behind a truck actually looks like.
- **Feel** — `PLAYER` (seek step, tick rate) and `SCENE` (crossfade, meter).

## Controls

| | |
| --- | --- |
| `Space` / `K` | play / pause |
| `←` `→` / `J` `L` | rewind / forward 10 s |
| `P` `N` (or `,` `.`) | previous / next track |
| `↑` `↓` | volume |
| `M` | mute |

Media keys and the lock screen work too, where the browser lets the top document
own the media session.

**The deck** is a record and five buttons. Cover art is the track's own YouTube
thumbnail (`mqdefault` — the largest size YouTube guarantees without letterbox
bars, which matters inside a circular crop), so adding a song needs no asset.
Pausing sets `animation-play-state: paused` rather than stopping the animation,
so the record holds its angle and picks up mid-turn on the next play.

**The live strip** in the bottom-left is real presence, not a number on a timer:
`/api/live` is an SSE endpoint holding one connection per open tab and
broadcasting the count on every join and leave. Beside it is the wall clock in
Asia/Kolkata, subscribed through `useSyncExternalStore` rather than mirrored into
state — a clock is an external source of truth, and this way it costs no effect
and no extra render.

## Three honest limits

- **Presence is per process.** The listener set lives in server memory, so it is
  correct behind `next start` or any single container, and on a serverless
  platform each instance would only count its own share. Going wider needs Redis
  or a hosted presence service — not more code in the route.
- **YouTube is the upstream.** A video that gets taken down or has embedding
  turned off stops working; the player detects it, says so under the title, and
  moves to the next track.
- **No spectrum analyser is possible.** The audio lives in a cross-origin
  iframe, so the Web Audio API can never reach the samples. The turning record
  is the playing indicator instead — it is honest, because it is driven by the
  actual player state.
