// ============================================================================
// THE SCRIPT - the one file that controls the film.
//
// Each scene lists its voice-over line and what's on screen. Nothing here
// holds a frame number: every scene lasts as long as its voice-over plus
// its `lead` (silence before the line) and `tail` (breathing room after),
// and any time left over in the 2:00 is shared out by `flex`. Change a
// line, reorder scenes, add or remove one - the timing re-flows by itself.
//
//   npm run voice    re-records only the lines whose text changed
//   npm run dev      opens Remotion Studio to preview
//   npm run render   renders out/libraa-group-film.mp4 (exactly 2:00)
//
// `say` (optional) is what the narrator reads, if it needs to differ from
// `line` - e.g. a phonetic spelling. The Indian narrator (Sarvam "anand")
// reads Libraa, Koundinya and 2009 correctly as written, so none is used.
// `line` is the plain-English version, for reading and review.
// Numbers and names come from facts.ts (the website's data), not typed in.
// ============================================================================
import {
  CERT_COUNT,
  COMPANY,
  COMPANY_COUNT,
  LOCATION_COUNT,
  FLAGS_ADJ,
  numberWord,
} from "./facts";

export type SceneKind =
  | "open"
  | "brand"
  | "services"
  | "map"
  | "fleet"
  | "hero"
  | "field"
  | "companies"
  | "clients"
  | "end";

export type Scene = {
  id: string;
  kind: SceneKind;
  /** Plain version of the voice-over, as the viewer hears it. */
  line?: string;
  /** Exactly what the narrator reads. Defaults to `line`. */
  say?: string;
  /** Seconds of picture before the voice-over starts. */
  lead: number;
  /** Seconds of picture after the voice-over ends. */
  tail: number;
  /** Share of any spare time in the 2:00 this scene absorbs (0 = none). */
  flex: number;
  /** Seconds into this scene's voice-over where each visual beat should land
   *  (services only). Measured from the recording: split at Anand's natural
   *  pauses, each piece transcribed to see which words it holds. Re-measure
   *  if the services line is re-recorded. */
  cues?: number[];
  /** Seconds into this scene's voice-over where a named word is spoken,
   *  e.g. { "Indian Navy": 1.2 }. Measured from the recording; until it is
   *  measured, `wordAt` estimates from the word's place in the line. */
  marks?: Record<string, number>;
};

/** When `phrase` is spoken, in seconds from the start of the scene's line. */
export function wordAt(scene: Scene, phrase: string, lineSeconds: number): number {
  const m = scene.marks?.[phrase];
  if (m !== undefined) return m;
  const text = scene.say ?? scene.line ?? "";
  const i = text.indexOf(phrase);
  if (i < 0) throw new Error(`"${phrase}" is not in the ${scene.id} line`);
  return (lineSeconds * i) / text.length;
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const and = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

export const FILM_SECONDS = 120;
export const FPS = 30;

export const SCENES: Scene[] = [
  {
    id: "open",
    kind: "open",
    line: "A reliable voyage begins long before a vessel leaves port.",
    lead: 1.6,
    tail: 0.6,
    flex: 0.2,
  },
  {
    id: "brand",
    kind: "brand",
    line: `For Libraa, that work has been our business since ${COMPANY.founded}.`,
    lead: 0.4,
    tail: 0.6,
    flex: 0,
  },
  {
    id: "services",
    kind: "services",
    line: "From ship management and surveys to repairs, new-build supervision and offshore services, we support vessels from shore to sea, and recruit the seafarers who operate them.",
    //     "ship management" 0.0 | "surveys to repairs" ~1.0 | "new-build supervision" 2.26
    //     | "offshore services ... shore to sea" ~3.4 | "recruit the seafarers" 6.63
    cues: [0, 1.0, 2.26, 3.41, 6.63],
    lead: 0.8,
    tail: 1.4,
    flex: 0,
  },
  {
    id: "map",
    kind: "map",
    // the original recording, brought back at the client's request - it
    // names the three offices; the map names every office and port
    line: `From our head office in Chennai and offices in Kakinada and Port Blair, we work across ${numberWord(LOCATION_COUNT)} locations around India's coasts.`,
    // measured on the recording: one pause (3.84-4.22s) after "Port Blair,";
    // words placed by speaking rate either side of it
    marks: { Chennai: 1.3, Kakinada: 2.6, "Port Blair": 3.25, locations: 5.6 },
    lead: 0.6,
    tail: 0.2,
    flex: 0,
  },
  {
    id: "fleet",
    kind: "fleet",
    // no vessel count (client): the fleet keeps changing and the film shows
    // only some of the many vessels Libraa has worked on
    line: `We have managed and worked on vessels of every kind: tugs, dredgers and passenger ferries, under ${and(FLAGS_ADJ)} flags. Here are just a few.`,
    lead: 0.8,
    // the line starts on ANTIGOON, the first ship, and the montage runs on
    // under the music after it
    tail: 5.5,
    flex: 0.95,
  },
  {
    id: "hero",
    kind: "hero",
    line: "And one of them, Koundinya, we built from scratch, in our own yard.",
    lead: 1.2,
    tail: 2.2,
    flex: 0.2,
  },
  {
    id: "field",
    kind: "field",
    line: "From Indian ports to West Africa, every job starts the same way: a toolbox talk, and the right safety gear for everyone.",
    lead: 0.6,
    tail: 1.2,
    flex: 0.2,
  },
  {
    id: "companies",
    kind: "companies",
    line: `${cap(numberWord(COMPANY_COUNT))} group companies, each responsible for its own part of the business, backed by ${numberWord(CERT_COUNT)} certifications and licences.`,
    lead: 0.6,
    tail: 1.4,
    flex: 0,
  },
  {
    id: "clients",
    kind: "clients",
    // the Indian Navy, Adani and JSW are named first, each logo landing on
    // its name (client, Sept 2026); no client count
    line: "We are proud to serve the Indian Navy, Adani Ports and JSW, alongside port authorities, energy groups and shipping houses.",
    // measured on the recording: pauses after "Navy," (1.68s), "JSW," (3.73s)
    // and "authorities," (5.45s); words placed by speaking rate between them
    marks: { "Indian Navy": 0.95, Adani: 1.95, JSW: 3.3, "port authorities": 4.55 },
    lead: 0.6,
    tail: 1.8,
    flex: 0.05,
  },
  {
    id: "end",
    kind: "end",
    // the approved closing line, word for word
    line: "Libraa Group. Ship Management, Crew Management and Marine Services.",
    lead: 4.6,
    tail: 5.0,
    flex: 0.2,
  },
];

/** Music: "Cinematic Open Future" by RoyaltyFreeMusicStudio (Pixabay Content
 *  License - free for commercial use, no attribution required). Measured
 *  66.66 BPM, first beat at 0.145s; montage cuts snap to this grid. */
export const MUSIC = {
  // loudness-normalised to -16 LUFS, the same level as the voice-over
  file: "music/cinematic-open-future-16lufs.mp3",
  bpm: 66.66,
  firstBeat: 0.145,
  /** Music on its own: ~3 dB under the voice level. */
  volume: 0.7,
  /** Music while the narrator speaks: ~13 dB below its own level, so every
   *  word is clear on a noisy show floor. */
  duckedVolume: 0.16,
};
