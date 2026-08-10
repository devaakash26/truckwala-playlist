# Scene clips

Two jobs live in this folder: the **opening film** that plays once when someone
presses the horn, and the **loop** that becomes the permanent backdrop.

Every file is optional. A missing intro shot ends the film early and drops
straight into the station; a missing loop falls back to the hand-drawn canvas
highway. Nothing here can break the site.

## The opening film

| File          | Shot                                       | Length |
| ------------- | ------------------------------------------ | ------ |
| `intro-1.mp4` | Driver walks up to the truck               | ~6 s   |
| `intro-2.mp4` | Climbs in, **switches on the stereo**      | ~6 s   |
| `intro-3.mp4` | Engine fires, truck pulls onto the highway | ~7 s   |

**The one timing that matters:** the music comes up
`INTRO.AUDIO_CUE_LEAD` seconds (1.4 s) before `intro-2.mp4` ends. So cut that
shot to finish about a second and a half *after* his hand reaches the stereo —
the song then lands on the gesture, and shot 3 rolls out under it.

If the moment sits somewhere else in your generated clip, do not re-cut the
video — change `AUDIO_CUE_LEAD` in [`lib/constants.ts`](../../lib/constants.ts).

Add posters (`intro-1.jpg` …) so the first frame is up instantly. Clips play
muted; the song is the only audio (flip `INTRO.MUTED` if you want their sound).

## The loop

Shot 4 — the side tracking shot — is the backdrop. Generate it four times, once
per phase, so the window matches the listener's clock.

| File        | Shown between | Poster      |
| ----------- | ------------- | ----------- |
| `dawn.mp4`  | 05:00 – 07:59 | `dawn.jpg`  |
| `day.mp4`   | 08:00 – 16:59 | `day.jpg`   |
| `dusk.mp4`  | 17:00 – 19:59 | `dusk.jpg`  |
| `night.mp4` | 20:00 – 04:59 | `night.jpg` |

Boundaries live in `PHASES` in `lib/constants.ts` — change them there and this
table, the backdrop and the pre-paint boot script all follow.

Start with `day.mp4` (shot 4 exactly as written). The other three are the same
shot with the light changed; modifiers are at the bottom of this file.

## Prompts

### Shot 1 — driver truck ki taraf aata hai (~6 s) → `intro-1.mp4`

> Cinematic wide shot, golden hour. A middle-aged Indian truck driver with a
> thick moustache, wearing a faded checked shirt and a red-and-white gamcha
> draped around his neck, walks confidently toward a brightly decorated Indian
> cargo truck parked on the shoulder of a dusty highway. He wipes his face with
> the gamcha as he walks. The truck is painted in vivid reds, greens and yellows
> with ornate folk patterns and hand-painted Devanagari lettering. Warm dust
> hanging in the air, low sun flare behind him. Slow tracking shot following him
> from behind at waist height. Shot on 35mm, shallow depth of field, warm
> cinematic color grade.

### Shot 2 — cabin mein chadhna aur gaana on karna (~6 s) → `intro-2.mp4`

> Medium close shot from inside the cabin. The Indian truck driver climbs into
> the driver's seat, pulls the door shut, adjusts the gamcha around his neck, and
> reaches forward to switch on the old dashboard stereo. He taps the steering
> wheel to the rhythm and smiles. The dashboard is decorated with plastic
> flowers, hanging beads and small idols swaying. Warm afternoon light through
> the windshield, dust motes floating. Handheld camera feel, natural film grain,
> cinematic warm grade.

### Shot 3 — truck start hoke highway pe nikalta hai (~7 s) → `intro-3.mp4`

> Low-angle exterior shot. The decorated Indian truck rumbles to life, diesel
> smoke puffing from the vertical exhaust, tyres kicking up dust as it pulls onto
> the highway. Camera pans with the truck as it accelerates. Hand-painted
> lettering and hanging chains visible on the rear. Sunlit rural Indian highway
> with palm trees and distant hills. Dynamic motion, dust particles in golden
> light, cinematic 35mm look.

### Shot 4 — highway driving (~7 s) → `day.mp4` and the three variants

> Tracking side shot moving parallel with the decorated Indian truck cruising
> down a two-lane highway. The driver's arm rests out of the open window, gamcha
> fluttering in the wind, he is singing along. Cars, an auto-rickshaw and another
> colourful truck pass in the opposite lane. Roadside dhaba signs, milestone
> stones and neem trees blur past. Motion blur on the background, steady smooth
> camera, warm afternoon sunlight, cinematic color grade, 24fps film look.

Append **one** of these, and add `seamless loop, no cuts` to all four:

| File        | Append                                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `dawn.mp4`  | Blue hour turning gold. Low mist over the fields, sun cracking the horizon, long cold shadows, headlights still on, dew haze, lavender-to-peach sky.            |
| `day.mp4`   | (the prompt as written)                                                                                                                                        |
| `dusk.mp4`  | Golden hour into deep orange. Sun low and ahead, long lens flare, dust suspended in warm backlight, magenta sky, silhouetted hills, tail lamps starting to glow. |
| `night.mp4` | Full dark. Only headlights, tail lamps and the truck's amber bulb strings. Milky-way sky, cold blue ambient, oncoming headlights flaring, reflective markers.    |

Keep the driver, the truck's paint and the lettering consistent across all seven
clips — same seed or same reference image where your tool supports it.

## Encoding

Aim for files the size of a photo, not a film. The loop sits behind a scrim, a
vignette and a grain layer, so detail you pay bandwidth for is thrown away.

- **Resolution** 1920×1080, `object-fit: cover` — anything wider gets cropped.
- **Target size** ≤ 4 MB per clip. Seven clips ≈ 28 MB, and only two are ever
  fetched on a given visit.
- **Codec** H.264 High, no audio track — the clips are muted, so shipping one is
  pure waste.
- **Loops only** (`dawn`/`day`/`dusk`/`night`) need the last frame to cut back to
  the first. The intro shots must *not* loop.

```bash
# 1080p, no audio, web-optimised — ~3–4 MB for 10 s
ffmpeg -i raw.mp4 -an \
  -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=24" \
  -c:v libx264 -profile:v high -crf 26 -preset slow -pix_fmt yuv420p \
  -movflags +faststart day.mp4

# Loops only: crossfade the tail back over the head (10 s clip, 1 s blend)
ffmpeg -i day.mp4 -filter_complex \
  "[0:v]split[a][b];[a]trim=0:9,setpts=PTS-STARTPTS[main];\
   [b]trim=9:10,setpts=PTS-STARTPTS[tail];\
   [main][tail]xfade=transition=fade:duration=1:offset=8" \
  -an -c:v libx264 -crf 26 -pix_fmt yuv420p -movflags +faststart day-loop.mp4

# Poster from a representative frame
ffmpeg -i day.mp4 -ss 2 -frames:v 1 -q:v 4 day.jpg
```
