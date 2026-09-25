// Turns the script + measured voice-over lengths into exact frame timings.
// Nobody edits this file to change pacing - edit script.ts instead.
//
// 1. Each scene's natural length = lead + voice-over + tail.
// 2. Spare time up to 2:00 is shared between scenes by their `flex`.
// 3. Every scene boundary snaps to the nearest music beat, so cuts land on
//    the beat - but never so far that a scene's own line gets cut off.
// 4. The last scene ends on exactly 2:00. If the script needs more than
//    2:00, this throws and says by how much, instead of silently overrunning.
import voice from "./voice.generated.json";
import { FILM_SECONDS, FPS, MUSIC, SCENES, type Scene } from "./script";

export type TimedScene = Scene & {
  from: number; // first frame
  durationInFrames: number;
  voice?: { file: string; from: number; durationInFrames: number };
};

type VoiceMap = Record<string, { file: string; seconds: number }>;
const VOICE = voice as VoiceMap;

export const TOTAL_FRAMES = FILM_SECONDS * FPS;
const beatSec = 60 / MUSIC.bpm;

function snapToBeat(t: number) {
  const n = Math.round((t - MUSIC.firstBeat) / beatSec);
  return MUSIC.firstBeat + n * beatSec;
}

export function timeline(): TimedScene[] {
  const voiced = SCENES.map((s) => {
    const v = s.line ? VOICE[s.id] : undefined;
    if (s.line && !v) throw new Error(`No voice-over for scene "${s.id}" - run \`npm run voice\`.`);
    return { s, v, natural: s.lead + (v?.seconds ?? 0) + s.tail };
  });

  const natural = voiced.reduce((a, x) => a + x.natural, 0);
  const spare = FILM_SECONDS - natural;
  if (spare < 0) {
    throw new Error(
      `The script runs ${(-spare).toFixed(1)}s over ${FILM_SECONDS}s. Shorten a line, or reduce a lead/tail in src/script.ts.`
    );
  }
  const flexTotal = voiced.reduce((a, x) => a + x.s.flex, 0) || 1;

  // ideal boundaries in seconds, then snapped to the beat grid
  const out: TimedScene[] = [];
  let ideal = 0;
  let prevEnd = 0;
  voiced.forEach((x, i) => {
    ideal += x.natural + (spare * x.s.flex) / flexTotal;
    const last = i === voiced.length - 1;
    const min = prevEnd + x.s.lead + (x.v?.seconds ?? 0) + 0.3; // never clip the line
    let end = last ? FILM_SECONDS : snapToBeat(ideal);
    if (!last && end < min) end = snapToBeat(min + beatSec / 2);
    const from = Math.round(prevEnd * FPS);
    const to = last ? TOTAL_FRAMES : Math.round(end * FPS);
    out.push({
      ...x.s,
      from,
      durationInFrames: to - from,
      voice: x.v
        ? { file: x.v.file, from: from + Math.round(x.s.lead * FPS), durationInFrames: Math.ceil(x.v.seconds * FPS) }
        : undefined,
    });
    prevEnd = to / FPS;
  });

  const sum = out.reduce((a, s) => a + s.durationInFrames, 0);
  if (sum !== TOTAL_FRAMES) throw new Error(`Timeline is ${sum} frames, expected ${TOTAL_FRAMES}.`);
  const tail = out[out.length - 1];
  if (tail.voice && tail.voice.from + tail.voice.durationInFrames > TOTAL_FRAMES) {
    throw new Error(`The final line runs past ${FILM_SECONDS}s - shorten it or reduce earlier scenes' flex.`);
  }
  return out;
}

/** Beat times (in frames) inside a range - used to cut montages on the beat. */
export function beatsBetween(fromFrame: number, toFrame: number, every = 1): number[] {
  const out: number[] = [];
  for (let n = 0; ; n++) {
    const f = Math.round((MUSIC.firstBeat + n * beatSec) * FPS);
    if (f >= toFrame) break;
    if (f >= fromFrame && n % every === 0) out.push(f);
  }
  return out;
}
