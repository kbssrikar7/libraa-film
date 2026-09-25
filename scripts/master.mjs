// Renders the delivery master: out/libraa-group-film.mp4 (1080p, H.264 at a
// fixed 20 Mbps - a large office TV / booth screen needs the headroom; the
// film has long calm shots a quality-based encode would starve)
//
// Picture and sound are rendered separately (sound as uncompressed WAV), then
// muxed with the audio cut to exactly the film length - Remotion's own AAC
// encode pads ~43ms past the video - and the H.264 stream tagged BT.709 so
// every display interprets its colour the same way.
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";

const OUT = "out/libraa-group-film.mp4";
const VIDEO = "out/.master-video.mp4";
const AUDIO = "out/.master-audio.wav";
const SECONDS = "120";

const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit" });
// cloud sessions can't download Remotion's Chrome - point at a local one:
//   BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell npm run render
const browser = process.env.BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.BROWSER_EXECUTABLE}`] : [];

run("npx", ["remotion", "render", "LibraaFilm", VIDEO, "--codec=h264", "--video-bitrate=20M", "--x264-preset=slow", "--muted", "--log=error", ...browser]);
run("npx", ["remotion", "render", "LibraaFilm", AUDIO, "--codec=wav", "--log=error", ...browser]);
run("ffmpeg", [
  "-v", "error", "-y",
  "-i", VIDEO, "-i", AUDIO,
  "-map", "0:v", "-map", "1:a",
  "-c:v", "copy",
  "-bsf:v", "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1",
  "-c:a", "aac", "-b:a", "320k",
  "-t", SECONDS,
  "-movflags", "+faststart",
  OUT,
]);
rmSync(VIDEO, { force: true });
rmSync(AUDIO, { force: true });
console.log(`\nMaster written: ${OUT}`);
