// Builds burned-in subtitle timings from the actual recordings:
// src/subtitles.generated.json  { sceneId: [{ text, start, end }] }  (seconds
// from the start of that scene's voice clip).
//
// Each line is split into short readable chunks at sentence ends, and at
// commas only when a chunk would get too long. Chunk times come from the
// recording itself: ffmpeg silencedetect finds the pauses, and each chunk's
// words are placed by their share of the speech between them, then snapped
// to a nearby pause - so a subtitle changes when anand actually pauses.
//
//   npm run subtitles      re-run after `npm run voice` re-records a line
import { build } from "esbuild";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = new URL("..", import.meta.url).pathname;
const MAX_CHARS = 56; // one comfortable line at 1080p
const SNAP = 0.35; // seconds: how far a chunk edge may move to meet a pause

// ffmpeg from PATH, else the copy Remotion ships (cloud sessions)
const bundled = join(ROOT, "node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg");
const FFMPEG = spawnSync("ffmpeg", ["-version"]).status === 0 ? "ffmpeg" : bundled;

async function loadScenes() {
  const outfile = join(tmpdir(), `libraa-subs-${process.pid}.mjs`);
  await build({ entryPoints: [join(ROOT, "src/script.ts")], bundle: true, format: "esm", platform: "node", outfile, logLevel: "error" });
  const mod = await import(pathToFileURL(outfile).href);
  rmSync(outfile, { force: true });
  return mod.SCENES;
}

/** Speech intervals [start, end] in seconds, from the pauses ffmpeg finds. */
function speech(file, duration) {
  const r = spawnSync(FFMPEG, ["-hide_banner", "-i", file, "-af", "silencedetect=noise=-35dB:d=0.1", "-f", "null", "-"], { encoding: "utf8" });
  const log = r.stderr;
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  const silences = starts.map((s, i) => [s, ends[i] ?? duration]);
  const out = [];
  let t = 0;
  for (const [s, e] of silences) {
    if (s > t + 0.02) out.push([t, s]);
    t = e;
  }
  if (duration > t + 0.02) out.push([t, duration]);
  return { speech: out, pauses: silences };
}

/** A clause too long for one line splits at the " and " nearest its middle
 *  (else the middle space), so it breaks where a reader would pause. */
function splitLong(c) {
  if (c.length <= MAX_CHARS) return [c];
  const mid = c.length / 2;
  const ands = [...c.matchAll(/ and /g)].map((m) => m.index);
  const at = ands.length ? ands.reduce((a, b) => (Math.abs(b - mid) < Math.abs(a - mid) ? b : a)) : c.lastIndexOf(" ", mid);
  return [c.slice(0, at).trim(), c.slice(at).trim()];
}

/** Split a line into subtitle chunks. */
function chunks(line) {
  const clauses = line.match(/[^,.:;]+[,.:;]?/g).map((c) => c.trim()).filter(Boolean).flatMap(splitLong);
  const out = [];
  let cur = "";
  for (const c of clauses) {
    const next = cur ? `${cur} ${c}` : c;
    const sentenceDone = /[.:]$/.test(cur) && cur.length >= 12;
    if (cur && (sentenceDone || next.length > MAX_CHARS)) {
      out.push(cur);
      cur = c;
    } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
}

const scenes = await loadScenes();
const voice = JSON.parse(readFileSync(join(ROOT, "src/voice.generated.json"), "utf8"));
const result = {};

// the end card prints every word the narrator says there - no subtitle
const SKIP = new Set(["end"]);

for (const s of scenes) {
  if (!s.line || !voice[s.id] || SKIP.has(s.id)) continue;
  const file = join(ROOT, "public", voice[s.id].file);
  if (!existsSync(file)) throw new Error(`missing ${file}`);
  const duration = voice[s.id].seconds;
  const { speech: sp, pauses } = speech(file, duration);
  const total = sp.reduce((a, [x, y]) => a + (y - x), 0);
  // time at which character `i` of the line is spoken
  const at = (i) => {
    let left = (total * i) / s.line.length;
    for (const [x, y] of sp) {
      if (left <= y - x) return x + left;
      left -= y - x;
    }
    return sp.at(-1)[1];
  };
  const parts = chunks(s.line);
  let pos = 0;
  const cues = parts.map((text) => {
    const i = s.line.indexOf(text, pos);
    pos = i + text.length;
    return { text, start: at(i), end: at(pos) };
  });
  // snap each boundary between chunks into the nearest pause, if one is close
  for (let k = 1; k < cues.length; k++) {
    const b = cues[k].start;
    const p = pauses.find(([x, y]) => b >= x - SNAP && b <= y + SNAP);
    if (p) {
      cues[k - 1].end = p[0];
      cues[k].start = p[1];
    }
  }
  cues[0].start = Math.min(cues[0].start, sp[0][0]);
  cues.at(-1).end = sp.at(-1)[1] + 0.3; // linger a moment after the last word
  // hold each subtitle until the next one starts, so the screen never blinks
  for (let k = 0; k < cues.length - 1; k++) cues[k].end = cues[k + 1].start;
  result[s.id] = cues.map((c) => ({ text: c.text, start: +c.start.toFixed(3), end: +c.end.toFixed(3) }));
  console.log(`${s.id.padEnd(10)} ${cues.map((c) => `[${c.start.toFixed(2)}-${c.end.toFixed(2)}] ${c.text}`).join("\n           ")}`);
}

writeFileSync(join(ROOT, "src/subtitles.generated.json"), JSON.stringify(result, null, 2) + "\n");
