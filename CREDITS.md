# Libraa Group brand film - sources & licences

## Libraa's own material
- Ship, team and yard photos: libraa-website/public/photos (client-supplied)
- Vessel launch clip (public/libraa/vessel-launch.mp4): cut from the client's
  WhatsApp video of 2026-09-12, 1:42-1:53 - no longer used (client found it
  vague), kept as client material
- Facts, names and numbers: libraa-website/src/data.ts

## Stock footage - Pexels License (free for commercial use, no attribution required)
Found through the Pexels API, downloaded at 1080p, trimmed to 12 s and
re-encoded. Clips with readable company names (MSC, Maersk, Evergreen,
Hapag-Lloyd, terminal signage) or landmarks were rejected. Used only on
general lines or with no line at all, never shown as a Libraa vessel.
- public/stock/px-tanker-sunset-aerial.mp4 - https://www.pexels.com/video/an-oil-tanker-in-the-sea-4911815/ (Esteban M)
- public/stock/px-ship-headon-drone.mp4 - https://www.pexels.com/video/drone-video-of-cargo-ships-on-a-river-15148911/ (Stephen Pierce)
- public/stock/px-ship-silhouette-sunset.mp4 - https://www.pexels.com/video/silhouette-of-a-tugboat-towing-a-cargo-ship-at-sunrise-13379259/ (Engin Akyurt)
- public/stock/px-welding-sparks.mp4 - https://www.pexels.com/video/professional-welding-steel-6046358/ (K)
- public/stock/px-sunset-ships-horizon.mp4 - https://www.pexels.com/video/sunset-over-sea-12944866/ (Ahmet Kurt)
- public/stock/px-bulk-carrier-at-sea.mp4 - https://www.pexels.com/video/14888819/ - Ship management beat
- public/stock/px-crew-mooring-line.mp4 - https://www.pexels.com/video/19539768/ - Crew management beat
- public/stock/px-offshore-rig-sunset.mp4 - https://www.pexels.com/video/dramatic-offshore-oil-rig-at-sunset-34294261/ (Dio Hasbi Saniskoro) - Offshore services beat
- public/stock/px-toolbox-talk.mp4 - https://www.pexels.com/video/safety-briefing-for-construction-team-outdoors-36034181/ (Mh Tonmoy) - safety line

## Stock footage - Pixabay Content License (free for commercial use, no attribution required)
Found through the Pixabay API. Every clip tagged "ai generated" was
rejected (the film uses real footage only).
- public/stock/pb-shipyard-ship-dusk.mp4   - https://pixabay.com/videos/id-312839/ (TatianaTz) - new-build supervision beat
- public/stock/pb-shipyard-cranes-dusk.mp4 - https://pixabay.com/videos/id-233388/ (TatianaTz) - behind the certificates

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
