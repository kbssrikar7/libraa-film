// Prints the film's calculated timeline: each scene's start/end and where its
// voice-over line sits. Handy after editing src/script.ts or re-recording
// lines, before a full render.
//
//   npm run timeline
import { build } from "esbuild";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "libraa-timeline-"));
const out = join(dir, "timing.mjs");
await build({ entryPoints: ["src/timing.ts"], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error" });
const { timeline } = await import(out);
rmSync(dir, { recursive: true, force: true });

const t = (frames) => {
  const s = frames / 30;
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, "0")}`;
};
for (const s of timeline()) {
  const voice = s.voice ? `${t(s.voice.from)}-${t(s.voice.from + s.voice.durationInFrames)}` : "-";
  console.log(`${s.id.padEnd(10)} ${t(s.from)} - ${t(s.from + s.durationInFrames)}  (${(s.durationInFrames / 30).toFixed(2)}s)  voice ${voice}`);
}
