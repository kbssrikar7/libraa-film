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
13. Client still unhappy with CMU: font is now Plus Jakarta Sans set the
    way the website sets it (semibold, -0.02em, sentence case; option
    "jakarta" in src/ui.tsx). Stock replaced with Pexels footage via the
    API (see CREDITS.md): opening reel, brand, interlude, certificates,
    end card. Unused stock files removed from public/stock.
14. Pixabay footage added (API; "ai generated" tags rejected): a shipyard
    at dusk replaces the vague vessel-launch clip on "New-build
    supervision", and a dusk shipyard sits behind the certificates.
    Voice re-recorded with anand for four lines: map (no office list -
    "Our teams work out of ports along both of India's coasts, and far
    beyond them."), fleet (no count), clients (Indian Navy, Adani Ports,
    JSW) and end (approved tagline). Transcribed back with saarika to
    confirm every word. Mix measures -18.6 LUFS integrated, -3.5 dBTP.
    scripts/voice.mjs now reuses finished clips in public/voice, so a
    fresh clone only records changed lines. Node needs
    NODE_USE_ENV_PROXY=1 to reach Sarvam through the session proxy, and
    ffmpeg/ffprobe from node_modules/@remotion/compositor-linux-x64-gnu
    on PATH.
15. Client: don't show ships in Services and then leave them out of the
    fleet. Services now all stock (bulk carrier at sea, welding sparks,
    shipyard at dusk, offshore rig at sunset, crew on a mooring line). The
    old 0:37 stock interlude became a ship spotlight: ANTIGOON (the
    biggest vessel Libraa works on, held longest with type and length),
    KANGO, SEJAL, JHANSI RANI (`Spotlight` in scenes/Fleet.tsx). The
    original map recording naming Chennai, Kakinada and Port Blair is back
    (restored from git). Cameroon photos captioned "Libraa's team at the
    port in Cameroon" / "at a shipyard in Cameroon".
16. The spotlight was merged into the fleet scene so the fleet line starts
    on ANTIGOON (client: the words belong with the ships they introduce).
    The fleet now opens ANTIGOON, KANGO, SEJAL, JHANSI RANI, then the rest.
17. External review of v14 (frame and audio analysis) - acted on:
    - BUG fixed: the first frame of every hard-cut scene was solid navy
      (Film.tsx faded non-dissolve scenes in over 1 frame). Verified by
      rendering and measuring the first frame of every scene.
    - Certificates -> clients is now a 12-frame dissolve straight into
      cream (no navy stage); certificate text clears first.
    - Tails trimmed where a scene sat still after its line (logo 6.3 ->
      4.5 s, map, certificates, clients 13.5 -> 9.9 s); time moved to the
      opening, KOUNDINYA and the end card.
    - Opening cut to three shots. KOUNDINYA now a clean hard cut at full
      brightness (it used to open from dark).
    - Map: each office pin appears as it is named (measured `marks`), the
      other ports on "locations"; labels larger.
    - Safety line shows a real toolbox talk (stock briefing clip).
    - One grade across the fleet: scripts/tone.py writes
      src/photo-tone.json (per-photo brightness/contrast, halfway to a
      common level); Photo takes `tone`.
    - Bigger text for large screens: SAFE bottom 180, cert names, heading
      "Four certifications & licences", client logos, libraa.com/email.
    - master.mjs takes BROWSER_EXECUTABLE for cloud sessions.
    Deliberately NOT done (conflicts with client rules/requests): ambient
    sound design (no SFX rule), featured three-client screen (client asked
    to remove it), a fleet title/count (no-count rule), replacing service
    stock with Libraa ships (client asked for stock there). Open: KOUNDINYA
    "Kakinada" wording needs the company's approval; weakest fleet photos
    and real Libraa service footage can only come from the client.
18. Second external review (of v15) - acted on: fleet reordered so each
    hard cut joins related shots (quay close-ups, aerial ferries, ships at
    sea, slipways -> KOUNDINYA); ship names larger; KOUNDINYA framed
    tighter; service titles arrive after their picture dissolves in;
    Cameroon captions "Cameroon" + "Libraa's team at the port/shipyard";
    icon-only client logos (JSW, V.O.C. Port, NIOT, Chandra Shipping) get
    their names; end card holds to the last frame (booth loop) with a
    larger libraa.com/email; music ducks ~2.8 dB deeper (0.16); fleet
    ~25 s, spare time on moving footage rather than static screens.
    QC: every frame scanned for flat/blank frames and single-frame spikes.
    The review claimed the voice says "eleven vessels" - it does not (the
    fleet line was re-recorded, item 14); its "16 VESSELS" title idea
    breaks the no-count rule, so no count was added.
19. Third external review (of v16) - acted on:
    - Fleet reconciled with the website: BITAM was only an unnamed photo
      in the safety scene; it now sits in the fleet (slipway group) with
      its name, so all 16 website vessels appear once, named (15 in the
      montage + KOUNDINYA). Fleet.tsx throws at build time if the list
      and the website ever disagree.
    - Safety scene ends on the toolbox talk (no unrelated hull after it).
    - Opening cut to two shots; services start at 12.7 s (was 18.1 s).
    - beatCuts takes a minimum shot length (fleet: 1.2 s) - no shot
      flashes past; fleet shots measure 1.8 s each, ANTIGOON 2.7 s.
    - Clients: "31 clients" (the website's own count - the no-count rule
      is about vessels); Indian Navy, Adani, JSW get double-width tiles in
      the top row, each arriving on its word (measured `marks`); the rest
      cascade on "port authorities"; the five logo-less clients named
      beneath ("Plus ..."); a slow push keeps the wall moving.
    - End: sunset plays alone ~4.6 s, card lands with "Libraa Group...".
    - Music eases ~2.5 dB under KOUNDINYA (existing track, no effects).
    - Larger KOUNDINYA subtitle, certificate names, closing tagline.
    Still open: Kakinada wording (needs company approval); real Libraa
    service footage; better originals for the weakest fleet photos.
20. Fourth review (of v17) - acted on: certificates -> clients now an
    18-frame S-curve dissolve onto a slightly softer cream (#ebe6d9) -
    measured: eases out of the dark and settles, no abrupt start/stop
    (the only way to remove the brightness rise entirely would be a dark
    client wall); AWALA framed tight / BITAM wide so their cut reads as a
    scale change; ANTIGOON settles from a deeper grade over 0.5 s after
    the dark map; two-line captions (title + sub) rise as one block.
    Map can't be shorter: it already ends on the first beat after its
    line (edges snap to beats). Client name timing, 16-vessel fleet and
    KOUNDINYA untouched, as the review asked.
21. Burned-in subtitles (src/Subtitles.tsx), in the film font, bottom
    centre on a square dark band below the lower-third titles. Timings
    come from the recordings: `npm run subtitles` (scripts/subtitles.mjs)
    finds the pauses with silencedetect, splits each line into short
    chunks and places them by their share of the speech, snapped to the
    pauses; output src/subtitles.generated.json. **Re-run it whenever a
    line is re-recorded.** No subtitles on the end card (its words are
    printed there). The clients "Plus ..." line now appears after the
    narration so it never meets a subtitle. Clean version for the booth:
    --props='{"subtitles":false}'.

The website side (separate repo) has also moved on since the film's last
render: 16 vessels (was 11), hero is now the client's own ANTIGOON photo,
tagline "Ship Management, Crew Management and Marine Services since 2009.",
Leadership is three people (MD, GM, CFO). The film's current facts are
therefore out of date.

## Rules (from the client - follow them)

- **No vessel count** anywhere in the film (the fleet keeps changing).
- **No list of cities/offices** as a tagline or summary - the company works
  worldwide (Gabon, Cameroon, Singapore...). Do not box it into
  Chennai/Kakinada/Port Blair. Exception the user asked for (Sept 2026):
  the map scene keeps the original voice line naming the three offices,
  and the map labels every port.
- **Every ship is shown once, in the fleet.** Services beats use stock
  footage of the kind of work; Libraa's own ships are not used there.
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
- **Send previews at half size** (`--scale=0.5`). Only render the full
  1080p master (`npm run render`, 20 Mbps) once the user approves a cut.

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
  try to get around it; use the Pexels API (needs PEXELS_API_KEY - ask
  the user to store it as an environment secret, never commit it).
  Reject clips showing shipping-line names or terminal signage. Mixkit works directly:
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
