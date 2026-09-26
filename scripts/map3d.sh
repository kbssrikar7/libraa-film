#!/usr/bin/env bash
# Renders the 3D map shot in Blender and encodes public/render/map3d.mp4.
#   bash scripts/map3d.sh          # half size (previews), ~45 min on 4 CPUs
#   bash scripts/map3d.sh 1        # full 1080p for the master (~4x longer)
# Needs Blender's Python module: python3 -m venv /opt/bpyenv && /opt/bpyenv/bin/pip install bpy==4.2.0
# (or set BLENDER_PY to any Python that can `import bpy`).
set -euo pipefail
cd "$(dirname "$0")/.."
SCALE="${1:-0.5}"
PY="${BLENDER_PY:-/opt/bpyenv/bin/python}"
FFMPEG="$(command -v ffmpeg || echo node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg)"
rm -rf out/map3d
"$PY" scripts/blender/map3d.py --scale "$SCALE"
mkdir -p public/render
"$FFMPEG" -v error -y -framerate 30 -i out/map3d/%04d.png -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p public/render/map3d.mp4
echo "public/render/map3d.mp4 written"
