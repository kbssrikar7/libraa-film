# Libraa Group brand film - sources & licences

## Libraa's own material
- Ship, team and yard photos: libraa-website/public/photos (client-supplied)
- Vessel launch clip (public/libraa/vessel-launch.mp4): cut from the client's
  WhatsApp video of 2026-09-12, 1:42-1:53
- Facts, names and numbers: libraa-website/src/data.ts

## Stock footage - Pexels License (free for commercial use, no attribution required)
Found through the Pexels API, downloaded at 1080p, trimmed to 12 s and
re-encoded. Clips with readable company names (MSC, Maersk, Evergreen,
Hapag-Lloyd, terminal signage) or landmarks were rejected. Used only on
general lines or with no line at all, never shown as a Libraa vessel.
- public/stock/px-tanker-sunset-aerial.mp4 - https://www.pexels.com/video/an-oil-tanker-in-the-sea-4911815/ (Esteban M)
- public/stock/px-tanker-bow-at-sea.mp4 - https://www.pexels.com/video/an-oil-tanker-traveling-across-the-sea-9654558/ (Zahid Nisar)
- public/stock/px-ship-headon-drone.mp4 - https://www.pexels.com/video/drone-video-of-cargo-ships-on-a-river-15148911/ (Stephen Pierce)
- public/stock/px-red-cargo-ship-aerial.mp4 - https://www.pexels.com/video/red-and-black-ship-sailing-3226072/ (Alexander Bobrov)
- public/stock/px-ship-silhouette-sunset.mp4 - https://www.pexels.com/video/silhouette-of-a-tugboat-towing-a-cargo-ship-at-sunrise-13379259/ (Engin Akyurt)
- public/stock/px-ship-port-night.mp4 - https://www.pexels.com/video/aerial-view-of-cargo-ship-at-night-in-busy-port-35907892/ (willy one)
- public/stock/px-mooring-rope-waves.mp4 - https://www.pexels.com/video/a-rope-is-tied-to-a-boat-in-the-water-18120390/ (Seven Seil)
- public/stock/px-tug-wake-aerial.mp4 - https://www.pexels.com/video/aerial-view-of-tugboat-navigating-river-course-36839328/ (willy one)
- public/stock/px-welding-sparks.mp4 - https://www.pexels.com/video/professional-welding-steel-6046358/ (K)
- public/stock/px-sunset-ships-horizon.mp4 - https://www.pexels.com/video/sunset-over-sea-12944866/ (Ahmet Kurt)
- public/stock/px-ship-quay-night.mp4 - https://www.pexels.com/video/nighttime-cargo-ship-at-port-aerial-view-30086734/ (Reginaldo Fiuza)

## Stock footage - Mixkit Stock Video Free License (free for commercial use, no attribution required)
Each clip checked on its page for the free licence (not "Restricted,
personal use only"), downloaded at 1080p, trimmed to 12 s and re-encoded.
Used only on general lines or with no line at all, never as a Libraa vessel.
- public/stock/mk-welder-safety.mp4        - https://mixkit.co/free-stock-video/welder-working-at-a-construction-4125/

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
