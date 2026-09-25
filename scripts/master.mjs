// Renders the delivery master: out/libraa-group-film.mp4
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

run("npx", ["remotion", "render", "LibraaFilm", VIDEO, "--codec=h264", "--crf=18", "--muted", "--log=error"]);
run("npx", ["remotion", "render", "LibraaFilm", AUDIO, "--codec=wav", "--log=error"]);
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
