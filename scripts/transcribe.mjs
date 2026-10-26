// Transcribes every voice-over clip back with Sarvam's Saaras v4
// speech-to-text and checks it against the script, so a re-recorded line is
// confirmed word for word before it goes into a cut. Also writes the film's
// transcript (TRANSCRIPT.md) with the time each line is heard.
//
// Only clips that changed since the last run are sent to Sarvam; the rest are
// reused from src/transcript.generated.json. Run after `npm run voice`.
//
//   npm run transcribe            transcribe new/changed clips, then check
//   npm run transcribe -- --force transcribe every clip again
//
// Saaras v4 returns chunk-level timestamps only (one chunk per short clip),
// so word timing for `marks` still has to be measured separately.
import { build } from "esbuild";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = new URL("..", import.meta.url).pathname;
const CACHE = join(ROOT, "src/transcript.generated.json");
const OUT_MD = join(ROOT, "TRANSCRIPT.md");
const FORCE = process.argv.includes("--force");
const MODEL = "saaras:v4";
// names the model should expect (Saaras v4 `keyterms`, up to 50)
const KEYTERMS = ["Libraa", "Koundinya", "Chennai", "Kakinada", "Port Blair", "Adani", "JSW", "Gabonese", "Indian Navy"];

function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

async function loadFilm() {
  const dir = mkdtempSync(join(tmpdir(), "libraa-transcribe-"));
  const outfile = join(dir, "film.mjs");
  await build({
    stdin: { contents: 'export { SCENES } from "./src/script"; export { timeline } from "./src/timing";', resolveDir: ROOT, loader: "ts" },
    bundle: true, format: "esm", platform: "node", outfile, logLevel: "error",
  });
  const mod = await import(pathToFileURL(outfile).href);
  rmSync(dir, { recursive: true, force: true });
  return mod;
}

// Spelling differences that are not reading mistakes: the model writes
// numbers as digits, US spellings, and "Libra" for how anand says Libraa.
const SAME = { libra: "libraa", licenses: "licences", 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten" };
const words = (text) =>
  text.toLowerCase().replace(/[-–]/g, " ").replace(/[^a-z0-9' ]/g, " ").split(/\s+/).filter(Boolean).map((w) => SAME[w] ?? w);

// word-level diff (LCS) -> list of "- missing" / "+ extra" words
function diff(expected, heard) {
  const a = words(expected), b = words(heard);
  const L = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) { i++; j++; }
    else if (j < b.length && (i === a.length || L[i][j + 1] >= L[i + 1][j])) out.push(`+${b[j++]}`);
    else out.push(`-${a[i++]}`);
  }
  return out;
}

loadEnv();
const { SCENES, timeline } = await loadFilm();
const voice = JSON.parse(readFileSync(join(ROOT, "src/voice.generated.json"), "utf8"));
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, "utf8")) : {};
const starts = Object.fromEntries(timeline().filter((s) => s.voice).map((s) => [s.id, s.voice.from / 30]));

const result = {};
let sent = 0, bad = 0;
for (const s of SCENES.filter((s) => s.line)) {
  const clip = voice[s.id];
  if (!clip) throw new Error(`no recording for "${s.id}" - run npm run voice first`);
  let heard = cache[s.id];
  if (FORCE || !heard || heard.file !== clip.file || heard.model !== MODEL) {
    const key = process.env.SARVAM_API_KEY;
    if (!key) throw new Error("SARVAM_API_KEY missing - set it as an environment variable or put it in libraa-film/.env");
    const form = new FormData();
    form.append("file", new Blob([readFileSync(join(ROOT, "public", clip.file))], { type: "audio/mpeg" }), clip.file.split("/")[1]);
    form.append("model", MODEL);
    form.append("language_code", "en-IN");
    form.append("keyterms", JSON.stringify(KEYTERMS));
    const res = await fetch("https://api.sarvam.ai/speech-to-text", { method: "POST", headers: { "api-subscription-key": key }, body: form });
    if (!res.ok) throw new Error(`Sarvam ${res.status} for "${s.id}": ${(await res.text()).slice(0, 300)}`);
    heard = { file: clip.file, model: MODEL, transcript: (await res.json()).transcript };
    sent++;
  }
  result[s.id] = heard;
  const d = diff(s.say ?? s.line, heard.transcript);
  if (d.length) bad++;
  console.log(`${d.length ? "  MISMATCH" : "  ok      "} ${s.id.padEnd(10)} ${heard.transcript}${d.length ? `\n             ${d.join(" ")}` : ""}`);
}

writeFileSync(CACHE, JSON.stringify(result, null, 2) + "\n");

const tc = (sec) => `${Math.floor(sec / 60)}:${(sec % 60).toFixed(1).padStart(4, "0")}`;
const md = [
  "# Libraa Group film - transcript",
  `Generated by \`npm run transcribe\`: the script lines, each checked against its recording with Sarvam ${MODEL}. Do not edit by hand. Times are when each line starts in the film.`,
  ...SCENES.filter((s) => s.line).map((s) => `**${tc(starts[s.id] ?? 0)}** ${s.line}${diff(s.say ?? s.line, result[s.id].transcript).length ? `\n\n> Heard: ${result[s.id].transcript}` : ""}`),
].join("\n\n");
writeFileSync(OUT_MD, md + "\n");

console.log(`\n${Object.keys(result).length} lines checked, ${bad} mismatched; ${sent} clips sent to Sarvam this run. Wrote TRANSCRIPT.md.`);
if (bad) process.exitCode = 1;
