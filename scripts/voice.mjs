// Generates the voice-over for every scene in src/script.ts with Sarvam AI's
// Bulbul text-to-speech - an Indian English male narrator ("anand").
//
// Only lines whose text (or voice settings) changed are sent to Sarvam;
// everything else is reused from voice-raw/, so editing one line costs one
// line of credits. Writes src/voice.generated.json with each clip's real
// length, which the timing engine uses to size every scene.
//
//   npm run voice            generate missing/changed lines
//   npm run voice -- --force regenerate everything
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = new URL("..", import.meta.url).pathname;
const VOICE_DIR = join(ROOT, "public/voice");
const RAW_DIR = join(ROOT, "voice-raw"); // untouched TTS output (cache)
// Every clip is loudness-normalised to the same broadcast-style level so
// Eric sits at a consistent volume over the music, line to line.
const TARGET_LUFS = -16;
const OUT_JSON = join(ROOT, "src/voice.generated.json");
const FORCE = process.argv.includes("--force");

// Sarvam Bulbul v3, Indian English, male narrator "anand" (chosen by the client)
const VOICE = { provider: "sarvam", model: "bulbul:v3", speaker: "anand", language_code: "en-IN", pace: 1.0, speech_sample_rate: 44100 };

function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

async function loadScript() {
  const outfile = join(tmpdir(), `libraa-script-${process.pid}.mjs`);
  await build({ entryPoints: [join(ROOT, "src/script.ts")], bundle: true, format: "esm", platform: "node", outfile, logLevel: "error" });
  const mod = await import(pathToFileURL(outfile).href);
  rmSync(outfile, { force: true });
  return mod;
}

const seconds = (file) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim());

loadEnv();
const key = process.env.SARVAM_API_KEY;
if (!key) throw new Error("SARVAM_API_KEY missing - add it to libraa-film/.env");

const { SCENES } = await loadScript();
mkdirSync(VOICE_DIR, { recursive: true });
mkdirSync(RAW_DIR, { recursive: true });
const spoken = SCENES.filter((s) => s.line);
const result = {};
let chars = 0;

for (let i = 0; i < spoken.length; i++) {
  const s = spoken[i];
  const text = s.say ?? s.line;
  const hash = createHash("sha1").update(JSON.stringify([VOICE, text])).digest("hex").slice(0, 10);
  const name = `${s.id}-${hash}.mp3`;
  const raw = join(RAW_DIR, name);
  const file = join(VOICE_DIR, name);
  if (FORCE || !existsSync(raw)) {
    const res = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: { "api-subscription-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ text, model: VOICE.model, speaker: VOICE.speaker, language_code: VOICE.language_code, pace: VOICE.pace, speech_sample_rate: VOICE.speech_sample_rate }),
    });
    if (!res.ok) throw new Error(`Sarvam ${res.status} for "${s.id}": ${(await res.text()).slice(0, 300)}`);
    const { audios } = await res.json();
    // Sarvam returns WAV; store it as MP3 in the cache
    const wav = raw.replace(/\.mp3$/, ".wav");
    writeFileSync(wav, Buffer.from(audios[0], "base64"));
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", wav, "-b:a", "192k", raw]);
    rmSync(wav);
    chars += text.length;
    console.log(`  generated  ${s.id.padEnd(10)} ${seconds(raw).toFixed(2)}s`);
  } else {
    console.log(`  reused     ${s.id.padEnd(10)} ${seconds(raw).toFixed(2)}s`);
  }
  if (FORCE || !existsSync(file)) {
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-af", `loudnorm=I=${TARGET_LUFS}:TP=-1.5:LRA=11`, "-ar", "44100", "-b:a", "192k", file]);
  }
  result[s.id] = { file: `voice/${name}`, seconds: Number(seconds(file).toFixed(3)) };
}

// remove clips no scene uses any more
const keep = new Set(Object.values(result).map((r) => r.file.split("/")[1]));
for (const dir of [VOICE_DIR, RAW_DIR]) for (const f of readdirSync(dir)) if (f.endsWith(".mp3") && !keep.has(f)) rmSync(join(dir, f));

writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + "\n");
const total = Object.values(result).reduce((a, r) => a + r.seconds, 0);
console.log(`\n${spoken.length} lines, ${total.toFixed(1)}s of voice-over; ${chars} characters sent to Sarvam this run.`);
