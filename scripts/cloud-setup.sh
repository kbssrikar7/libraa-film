#!/usr/bin/env bash
# One-time setup for a fresh machine or a Claude cloud agent session.
# Safe to re-run. Run from the libraa-film folder:  bash scripts/cloud-setup.sh
set -euo pipefail
cd "$(dirname "$0")/.."

# 1. ffmpeg / ffprobe - used by scripts/voice.mjs and scripts/master.mjs
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Installing ffmpeg..."
  if command -v apt-get >/dev/null 2>&1; then
    SUDO=""
    if [ "$(id -u)" -ne 0 ] && sudo -n true 2>/dev/null; then SUDO="sudo"; fi
    $SUDO apt-get update -qq && $SUDO apt-get install -y -qq ffmpeg
  else
    echo "Please install ffmpeg with your package manager." >&2; exit 1
  fi
fi

# 2. The website repo must sit next to this one: the film reads company facts
#    (../libraa-website/src/data.ts) and photos (public/site -> its photos).
if [ ! -d ../libraa-website ]; then
  echo "Cloning libraa-website next to libraa-film..."
  git clone --depth 1 https://github.com/kbssrikar7/libraa-website.git ../libraa-website
fi

# 3. Node packages (Remotion downloads its own headless Chrome on first render)
npm install --no-audit --no-fund

# 4. Voice key check - never stored in the repo
if [ -z "${SARVAM_API_KEY:-}" ] && ! grep -q '^SARVAM_API_KEY=' .env 2>/dev/null; then
  echo "NOTE: SARVAM_API_KEY is not set. Rendering works; re-recording voice (npm run voice) needs it."
fi

npm run --silent timeline
echo "Setup complete."
