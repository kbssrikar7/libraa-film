// YouTube master. Default: the 30 s motion piece -> out/libraa-motion-30s-4k.mp4
// 2-minute film:  COMP=LibraaFilm SECONDS=120 NAME=libraa-group-film node scripts/master30.mjs
// 3840x2160 (YouTube gives 4K uploads its best encode), H.264 High at 45 Mbps,
// BT.709 tags, AAC 320k / 48 kHz normalised to -14 LUFS (YouTube's reference),
// moov atom up front (+faststart). Set SCALE=1 for a 1080p file instead.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

const SCALE = process.env.SCALE ?? "2";
const COMP = process.env.COMP ?? "LibraaMotion30";
const SECONDS = process.env.SECONDS ?? "30";
const NAME = process.env.NAME ?? "libraa-motion-30s";
const OUT = `out/${NAME}-${SCALE === "1" ? "1080p" : "4k"}.mp4`;
const VIDEO = "out/.m30-video.mp4";
const AUDIO = "out/.m30-audio.wav";
const run = (cmd, args, opt = {}) => execFileSync(cmd, args, { stdio: "inherit", ...opt });
const browser = process.env.BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.BROWSER_EXECUTABLE}`] : [];

// REUSE=1 skips the (slow) renders when the intermediates are already in out/
const reuse = process.env.REUSE === "1" && existsSync(VIDEO) && existsSync(AUDIO);
if (!reuse) run("npx", ["remotion", "render", COMP, VIDEO, "--codec=h264", `--scale=${SCALE}`, "--video-bitrate=45M", "--x264-preset=slow", "--muted", "--log=error", ...browser]);
if (!reuse) run("npx", ["remotion", "render", COMP, AUDIO, "--codec=wav", "--log=error", ...browser]);

// two-pass loudnorm to -14 LUFS / -1.5 dBTP
const probe = spawnSync("ffmpeg", ["-hide_banner", "-i", AUDIO, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], { encoding: "utf8" }).stderr;
const m = JSON.parse(probe.slice(probe.lastIndexOf("{"), probe.lastIndexOf("}") + 1));
const ln = `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;

run("ffmpeg", [
  "-v", "error", "-y", "-i", VIDEO, "-i", AUDIO,
  "-map", "0:v", "-map", "1:a",
  "-c:v", "copy",
  "-bsf:v", "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1",
  "-af", ln, "-ar", "48000", "-c:a", "aac", "-b:a", "320k",
  "-t", SECONDS, "-movflags", "+faststart", OUT,
]);
rmSync(VIDEO, { force: true });
rmSync(AUDIO, { force: true });
console.log("wrote", OUT);
