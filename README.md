# Libraa Group - 2-minute brand film (Remotion)

Everything about the film lives in **src/script.ts**: each scene's voice-over
line and timing padding. Timing is calculated, never typed - edit a line and
the whole film re-flows; the build refuses to produce anything but exactly 2:00.

## Setup

This project reads the company's facts and photos from the website repo, so
clone both side by side:

    libraa/
      libraa-film/       <- this repo
      libraa-website/    <- github.com/kbssrikar7/libraa-website

Then, in libraa-film:

    npm install
    echo "SARVAM_API_KEY=..." > .env     # never committed

## Running with Claude cloud agents

Agents read **CLAUDE.md** first: full history, the client's feedback (they
are not happy with v6), the rules, and next steps.

Environment settings for the cloud agent:

- **Setup script:** `bash scripts/cloud-setup.sh` (installs ffmpeg, clones
  libraa-website next to this repo, runs `npm install`). The agent needs
  GitHub access to both private repos: kbssrikar7/libraa-film and
  kbssrikar7/libraa-website.
- **Environment variable (secret):** `SARVAM_API_KEY=<your key>` - set it in
  the environment's settings, never in the repo. Only `npm run voice` needs
  it; previews and renders work without it.
- **Network access:** api.sarvam.ai (voice), github.com, registry.npmjs.org,
  and Remotion's headless-Chrome download on the first render; pexels.com /
  pixabay.com if the agent is sourcing stock footage.

## Commands

    npm run voice      # record new/changed lines with Sarvam "anand" (reuses the rest)
    npm run timeline   # print each scene's start/end and voice placement
    npm run dev        # Remotion Studio preview
    npm run render     # out/libraa-group-film.mp4, 1920x1080, 30fps, exactly 2:00

## Where things live

- src/script.ts - voice-over lines, per-scene timing, music
- src/scenes/ - the scene designs; src/ui.tsx - shared building blocks
- src/facts.ts - fleet, clients, offices, certificates, read from
  ../libraa-website/src/data.ts (update the website data and re-render)
- public/voice/ - recorded voice-over lines; public/stock/, public/music/ -
  licensed stock media; public/site -> ../../libraa-website/public/photos
- SCRIPT-v2-draft.md - the next script, out for company review
- CREDITS.md - every stock clip, track and voice, with licences
