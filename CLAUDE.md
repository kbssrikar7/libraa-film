# Libraa Group brand film - handover for Claude agents

Read this first. It records what has been built, what the client thinks of it,
and the rules learned the hard way. Setup is in README.md
(`bash scripts/cloud-setup.sh`).

## The project

A 2:00 corporate brand film for **Libraa Group** (Chennai, India, since 2009):
ship management, crew management and marine services, with work in India and
West Africa. Uses: website, trade-show booth loop, sharing.

- Built with **Remotion** (React video). 1920x1080, 30 fps, exactly 120.000 s.
- Company facts and photos come from the sibling repo **libraa-website**
  (`../libraa-website/src/data.ts`, `public/site` -> its `public/photos`).
  That site is live at https://libraa-website.vercel.app.
- Voice-over: **Sarvam AI Bulbul v3, Indian English, speaker "anand"**
  (chosen by the client). Key in the `SARVAM_API_KEY` environment variable -
  never commit it.
- Music: "Cinematic Open Future" (Pixabay licence), ducked ~13 dB under voice.

## CLIENT STATUS: NOT HAPPY - read before touching anything

The latest render (v6) was rejected. The client's complaints, in their words
and ours:

1. **Font** - "the font at many places looks off". Everything uses Plus
   Jakarta Sans (the website font); at huge sizes with wide letter-spacing
   (LIBRAA GROUP, KOUNDINYA, "11 vessels") it looks generic/cramped.
2. **Text placement** - titles and captions sit awkwardly on the footage.
3. **Audio-video sync** - "at some places there is no sync". Voice is placed
   per scene, not per word, so pictures/titles don't land on the words that
   name them (e.g. "Koundinya", "toolbox talk").
4. **Transcript / script** - rejected.
5. **Bluntly following the website** - the old script was website copy read
   aloud (fact after fact). They want a film with a narrative, not the site
   narrated.

Also: "you can still use better stock footage" - only 4 calm-water stock
clips are used; there is no energy (yard, engine room, crew, port at night).

**Do not re-render the old script with small tweaks. The fix is a rebuild on
the new script (below) with new typography, word-level sync, and better
footage.**

## What has been done so far (history)

1. v1 draft - script from website copy, ElevenLabs free voice "Eric".
2. Reviews (external, frame-by-frame) drove fixes: removed a 6.6 s frozen
   certification slide, fixed text overlaps at transitions, removed a repeated
   JHANSI RANI shot, removed blank flash frames, stopped repeating
   "11 vessels" on every fleet shot, bigger ship names, one colour grade for
   all photos, hard cuts into/out of KOUNDINYA, trimmed audio to exactly 2:00,
   BT.709 colour tags.
3. v5 - client demanded an Indian voice. ElevenLabs free API blocks library
   voices; client would not pay. Switched to **Sarvam** free credits; client
   picked **anand**.
4. v6 - ocean sound effects removed entirely (client disliked them), pacing
   tightened, client logos normalised by visual area, contact text enlarged.
5. Client rejected v6 (complaints above).
6. Proposed (not yet decided): four typeface options rendered on the
   KOUNDINYA frame - A Plus Jakarta (current), **B Barlow Condensed + Barlow
   (recommended, industrial/maritime signage)**, C Cormorant Garamond + Inter,
   D Archivo Expanded. The client has not chosen.
7. **New script v2 written - `SCRIPT-v2-draft.md` - currently with the
   company for review.** Wait for their edits before recording.
8. Repo created (private) and prepared for cloud agents.
9. Editing pass (v7 look, on the old v6 voice as a preview): typography
   switched to option B (Barlow Condensed titles, Barlow text); one
   lower-left title-safe grid and one lower-third template for every
   caption (`LowerThird`, `SAFE` in src/ui.tsx); text now eases in with a
   short defocus and eases out before each cut; every montage cut is a
   12-frame dissolve (`FadeIn`, `XF`); names track in (KOUNDINYA, LIBRAA
   GROUP); moving film grain; vessel count removed from the fleet titles;
   end card carries the approved tagline. The "01 / 05" counters are gone.
   Stock B-roll still to come - see STOCK-SHOTLIST.md.
10. Client feedback on v7 preview: logo box must be square (no rounded
    corners - done, client logo tiles too); still unhappy with the font
    (Barlow) - five options are now switchable in src/ui.tsx
    (`TYPE_OPTIONS`; preview with --props='{"type":"montserrat"}'), set
    `TYPE_OPTION` once the client picks; no zoom on the India map (done);
    no vessel count at all - the film shows only some of the many vessels
    Libraa has worked on (fleet line rewritten, kicker "Selected vessels");
    name the Indian Navy properly and add Adani and JSW (clients line
    rewritten; the three logos land on their words, then the full wall,
    no client count). The fleet and clients lines are NOT yet re-recorded:
    run `npm run voice` in a session that has SARVAM_API_KEY, then
    measure `marks` for "Indian Navy", "Adani", "JSW", "port authorities"
    in the clients scene (until then `wordAt` estimates them).
11. "Looks vibe coded": removed every web-design ornament (accent lines,
    tracked eyebrow labels, lines around "Since 2009", cards, glows,
    shadows, pulsing pins); plain fade titles.
12. Font set to Computer Modern (CMU Serif, client's pick), titles in
    sentence case; ship names and LIBRAA GROUP stay in capitals.
    Map labels every port (client asked for all port names). Separate
    "three clients" screen removed - the wall leads with Indian Navy,
    Adani, JSW. New Mixkit footage (see CREDITS.md): opening reel,
    behind the brand, a music-only port interlude before the fleet, a
    welder on the safety line, behind the certificates, and the end card.
    Fleet montage trimmed to 10 ships with no repeats.

The website side (separate repo) has also moved on since the film's last
render: 16 vessels (was 11), hero is now the client's own ANTIGOON photo,
tagline "Ship Management, Crew Management and Marine Services since 2009.",
Leadership is three people (MD, GM, CFO). The film's current facts are
therefore out of date.

## Rules (from the client - follow them)

- **No vessel count** anywhere in the film (the fleet keeps changing).
- **No list of cities/offices** as a tagline or summary - the company works
  worldwide (Gabon, Cameroon, Singapore...). Do not box it into
  Chennai/Kakinada/Port Blair.
- Closing line / tagline: **"Ship Management, Crew Management and Marine
  Services."** (website: "...since 2009.").
- **No ocean / sound-effect ambience.**
- **Indian voice only** - Sarvam "anand".
- **No paid services.** The client will not spend money. Free tiers and
  open-source tools only.
- Only claim facts that are on the website or that the client supplied.
  Stock footage may only illustrate general lines - never pass stock off as
  a Libraa vessel, yard or crew.
- Never use AI upscaling/editing on photos of people (it alters faces).
- Show work locally first; the user approves before anything is published.
- Raise inconsistencies immediately when you spot them, not at the end.
- Writing style: never use the em dash character; use a plain hyphen.

## Next steps (in order)

1. Get the company's edits to `SCRIPT-v2-draft.md` (the user will relay
   them). Confirm the open points listed at the bottom of that file.
2. Put the approved lines into `src/script.ts`; `npm run voice` records only
   changed lines with anand (Sarvam credits are limited - don't re-record
   unchanged lines).
3. **Word-level sync**: Sarvam speech-to-text (`saarika:v2.5`,
   `with_timestamps`) returns only segment-level times. The working method
   so far: find natural pauses with ffmpeg `silencedetect`, split the clip at
   them, transcribe each piece, and store the offsets as `cues` in
   `src/script.ts` (see the services scene). Extend this so every key word
   (names, "toolbox talk", certificates) triggers its picture/title.
4. New typography (get the client's pick from options A-D; B recommended).
5. Better stock footage for the general lines only (Pexels/Pixabay, free
   licences; record each in CREDITS.md).
6. Update facts from the website (fleet photos incl. new vessels).
7. `npm run render`, then check: exactly 3600 frames, no freezes
   (`ffmpeg -vf freezedetect`), loudness about -18 LUFS, no text overlaps at
   transitions (render stills at each cut).

## Cloud environment notes

- Network is now open, but Pexels and Pixabay sit behind a Cloudflare
  bot check (403 "Just a moment") for curl and headless browsers - do not
  try to get around it; use their free API keys (PEXELS_API_KEY /
  PIXABAY_API_KEY as environment secrets) instead. Mixkit works directly:
  check each clip page says free licence, not "personal use only";
  files are at https://assets.mixkit.co/videos/<id>/<id>-1080.mp4.
- Environment secrets (SARVAM_API_KEY) only reach sessions started after
  they were saved.
- ffmpeg is not installable with apt here. Remotion ships a minimal
  ffmpeg/ffprobe in node_modules/@remotion/compositor-linux-x64-gnu/ (no
  xstack; check for silencedetect before relying on it).
- Remotion's own Chrome download is blocked; pass
  `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`
  to `remotion still` / `remotion render`.

## Useful commands

    npm run timeline   # scene start/end + voice placement, without rendering
    npm run dev        # Remotion Studio preview
    npx remotion still LibraaFilm out/f.jpg --frame=1300 --scale=0.5
    npm run render     # final master -> out/libraa-group-film.mp4
