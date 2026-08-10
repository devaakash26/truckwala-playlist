# Truckwala FM

A one-station radio. Old Indian highway songs play in order over a cinematic
truck-on-the-highway backdrop that follows the listener's own clock — dawn, day,
dusk, night. There is no track list and no search, on purpose: the only controls
are previous, rewind, play/pause, forward, next.

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
to a canvas: a flat ground plane under a pinhole camera, with roadside props,
oncoming traffic and dust recycled with fresh randomness as they pass, and a
hand-drawn SVG truck bobbing ahead of you on two out-of-phase cycles. Above it,
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
  (`watch`, `youtu.be`, `embed`, `shorts`) or a bare 11-character id. Add
  `startAt` to skip an intro. A video with embedding disabled is detected and
  skipped automatically.
- **Clips** — see [`public/scenes/README.md`](public/scenes/README.md) for the
  shot list, the generation prompts and encoding specs. Drop the files in and
  they are picked up with no code change.
- **Phase boundaries** — `PHASES`. The resolver and the pre-paint boot script
  are both generated from it.
- **The film** — `INTRO`: shot order, which shot carries the audio cue and how
  early it fires, skip delay.
- **The drive** — `HIGHWAY` in [`lib/highway.ts`](lib/highway.ts) is all in
  metres and seconds: camera height, speed, road width, how far apart the poles
  stand. `SCENE_PALETTE` in [`lib/palette.ts`](lib/palette.ts) colours it.
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

## Two honest limits

- **No real spectrum analyser.** The audio lives in a cross-origin iframe, so the
  Web Audio API can never reach the samples. The meter is a VU-style dial that
  moves while the station is live — see the comment in `SignalMeter`.
- **YouTube is the upstream.** A video that gets taken down or has embedding
  turned off stops working; the player detects it, says so in the ticker, and
  moves to the next track.
