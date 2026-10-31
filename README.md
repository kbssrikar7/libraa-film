# Libraa Group Films

Source code and production assets for two Libraa Group films, built with React, TypeScript, and Remotion.

| Version | Watch | Composition | Source | Duration |
| --- | --- | --- | --- | --- |
| Brand film | [Watch on YouTube](https://youtu.be/c7UrvW0q9yM) | `LibraaFilm` | [`src/Film.tsx`](src/Film.tsx) | 2 minutes |
| Motion piece | [Watch on YouTube](https://youtu.be/13FCEajRA9A) | `LibraaMotion30` | [`src/motion/Motion30.tsx`](src/motion/Motion30.tsx) | 30 seconds |

The brand film combines vessel and team photography, stock footage, narration, and burned-in subtitles. The motion piece uses animated type, maps, line art, and music, without narration. Both compositions run at 1920 × 1080 and 30 fps. The motion render script exports at 4K by default.

Rendered masters go into `out/` and are excluded from Git. This repository contains the source and assets for both versions, rather than the finished MP4 exports.

## Setup

You need Node.js with npm, FFmpeg and FFprobe on your `PATH`, and access to the [Libraa website repository](https://github.com/kbssrikar7/libraa-website). The film imports company data and map geometry from that repository and serves its photos through the `public/site` symlink.

Clone both repositories into the same parent directory:

```bash
git clone https://github.com/kbssrikar7/libraa-website.git
git clone https://github.com/kbssrikar7/libraa-film.git
cd libraa-film
npm ci
```

The expected layout is:

```text
libraa/
├── libraa-website/
│   ├── src/data.ts
│   ├── src/lib/
│   └── public/photos/
└── libraa-film/
    └── public/site -> ../../libraa-website/public/photos
```

Keep `public/site` as a symlink to the website's photo directory. Both versions require the sibling website repository; this repository is not a standalone copy of that data and photography.

Existing narration and timing files are committed. Previewing and rendering do not require an API key. Remotion may download its browser on the first run. To use an installed browser, set `BROWSER_EXECUTABLE` to its executable path when running either master script.

## Preview and check

```bash
npm run check       # TypeScript check
npm run timeline    # Scene and narration timings for the two-minute film
npm run dev         # Remotion Studio
```

In Studio, select `LibraaFilm` or `LibraaMotion30` to preview either version.

## Render

Run these commands from the repository root. The master scripts render picture and audio separately, then combine them with FFmpeg.

| Version | Command | Output |
| --- | --- | --- |
| Two-minute film, 1080p | `npm run render` | `out/libraa-group-film.mp4` |
| 30-second motion piece, 4K | `node scripts/master30.mjs` | `out/libraa-motion-30s-4k.mp4` |
| 30-second motion piece, 1080p | `SCALE=1 node scripts/master30.mjs` | `out/libraa-motion-30s-1080p.mp4` |

The two-minute master uses H.264 at 20 Mbps with AAC audio. The motion master uses H.264 at 45 Mbps and normalizes audio to −14 LUFS. Both scripts tag the video as BT.709 and set the output length to the composition's duration.

To export the two-minute film through the 4K master script:

```bash
COMP=LibraaFilm SECONDS=120 NAME=libraa-group-film node scripts/master30.mjs
```

This writes `out/libraa-group-film-4k.mp4`. The environment-variable syntax above is for Bash and compatible shells.

## Editing

For the two-minute film, edit narration and pacing in [`src/script.ts`](src/script.ts). Each scene has a line, a lead-in, a tail, and a share of the remaining time. [`src/timing.ts`](src/timing.ts) calculates scene boundaries from the recorded voice lengths, aligns cuts to music beats, and keeps the timeline at 3,600 frames. Scene visuals live in `src/scenes/`.

For the 30-second piece, edit [`src/motion/Motion30.tsx`](src/motion/Motion30.tsx). Its scene timings and animations are defined directly in frames, with a total of 900 frames.

Company facts are imported through [`src/facts.ts`](src/facts.ts). Update the website's data when company details change, then review both films for affected text, narration, and layouts.

### Narration and subtitles

Generating narration or checking it with speech recognition requires a Sarvam API key. Set `SARVAM_API_KEY` in your environment or in a local `.env` file. That file is ignored by Git.

After changing a spoken line:

```bash
npm run voice       # Generate changed lines; reuse existing recordings
npm run transcribe  # Compare recordings with the script and update TRANSCRIPT.md
npm run subtitles  # Rebuild subtitle timings from the recordings
npm run timeline   # Review the resulting scene timings
npm run check
```

Review the preview before rendering, especially where scene visuals are timed to particular words. The voice scripts update the generated JSON files in `src/` and the recordings in `public/voice/`.

## Repository layout

| Path | Contents |
| --- | --- |
| `src/Root.tsx` | Registration and dimensions of both Remotion compositions |
| `src/Film.tsx`, `src/scenes/` | Two-minute film and scene designs |
| `src/script.ts`, `src/timing.ts` | Narration, pacing, and timeline calculation |
| `src/motion/` | 30-second motion piece and map data |
| `src/ui.tsx` | Shared typography, colors, and visual components |
| `public/` | Fonts, logos, narration, music, stock footage, and the website photo symlink |
| `scripts/` | Master exports, voice generation, subtitles, transcription, and media preparation |
| `brag-output-2026-09-26-*/` | Additional Hyperframes compositions and their assets, separate from the two Remotion films |
| `TRANSCRIPT.md` | Generated transcript of the narrated film |
| `CREDITS.md` | Media sources and license notes |

## Media and permissions

See [`CREDITS.md`](CREDITS.md) for stock footage, music, fonts, and narration sources. Company photographs, branding, and third-party assets retain their respective rights. Public access to this repository does not grant permission to reuse those materials.
