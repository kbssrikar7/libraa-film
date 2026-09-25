# Libraa Group brand film - sources & licences

## Libraa's own material
- Ship, team and yard photos: libraa-website/public/photos (client-supplied)
- Vessel launch clip (public/libraa/vessel-launch.mp4): cut from the client's
  WhatsApp video of 2026-09-12, 1:42-1:53
- Facts, names and numbers: libraa-website/src/data.ts

## Stock footage - Pexels License (free for commercial use, no attribution required)
Used only as atmosphere, never presented as a Libraa vessel or operation.
- public/stock/sunrise-sea.mp4 - https://www.pexels.com/video/34971572/
- public/stock/bow-water.mp4   - https://www.pexels.com/video/33887296/
- public/stock/dark-water.mp4  - https://www.pexels.com/video/2711110/
- public/stock/dusk-sea.mp4    - https://www.pexels.com/video/8303108/

## Stock footage - Mixkit Stock Video Free License (free for commercial use, no attribution required)
Each clip checked on its page for the free licence (not "Restricted,
personal use only"), downloaded at 1080p, trimmed to 12 s and re-encoded.
Used only on general lines or with no line at all, never as a Libraa vessel.
- public/stock/mk-sunrise-sea-flyover.mp4  - https://mixkit.co/free-stock-video/sunset-in-an-aerial-shot-over-the-sea-44373/
- public/stock/mk-sea-flyover-dawn.mp4     - https://mixkit.co/free-stock-video/flying-over-the-sea-during-sunset-44370/
- public/stock/mk-tanker-berth-aerial.mp4  - https://mixkit.co/free-stock-video/empty-cargo-ship-waiting-at-the-port-4209/
- public/stock/mk-port-cranes-wide.mp4     - https://mixkit.co/free-stock-video/cranes-working-on-unloading-dock-4012/
- public/stock/mk-port-cranes-ship.mp4     - https://mixkit.co/free-stock-video/workers-moving-containers-from-a-cargo-ship-4450/
- public/stock/mk-container-port-aerial.mp4 - https://mixkit.co/free-stock-video/top-view-of-tokyo-cargo-port-4445/
- public/stock/mk-ships-in-haze.mp4        - https://mixkit.co/free-stock-video/ferry-boat-and-cargo-ships-4316/
- public/stock/mk-welder-safety.mp4        - https://mixkit.co/free-stock-video/welder-working-at-a-construction-4125/
- public/stock/mk-sunset-sea.mp4           - https://mixkit.co/free-stock-video/stunning-sunset-seen-from-the-sea-4119/

## Music - Pixabay Content License (free for commercial use, no attribution required)
- "Cinematic Open Future" by RoyaltyFreeMusicStudio
  https://pixabay.com/music/epic-classical-cinematic-open-future-527597/

## Voice-over - Sarvam AI Bulbul v3, Indian English, voice "anand"
- Generated with `npm run voice` (scripts/voice.mjs), key in .env (SARVAM_API_KEY).
- Check Sarvam's current commercial-licensing terms before public release.

## Fonts - SIL Open Font License 1.1 (free for commercial use)
- Barlow Condensed and Barlow by The Barlow Project Authors
  (https://github.com/jpt/barlow), woff2 files from fontsource on npm
  (public/fonts/barlow-*.woff2). Plus Jakarta Sans files are no longer used.
- Computer Modern (CMU Serif), SIL OFL, from the `computer-modern` npm
  package (public/fonts/cmu-*.woff2) - the film's current font.
- Montserrat, Cormorant Garamond, Inter, Inter Tight, Archivo (SIL OFL,
  fontsource) - kept as switchable alternatives in src/ui.tsx.
