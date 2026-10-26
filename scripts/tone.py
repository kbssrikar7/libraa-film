# Measures every fleet photo and writes src/photo-tone.json: brightness,
# contrast and saturation factors per ship that bring each photo to one
# common level (mean 140, contrast/sd 55, saturation 95), so the fleet
# montage cuts together as one set - the flat, grey overcast photos no
# longer drop out next to the bright ones. Factors are clamped (+/-25%,
# saturation 0.85-1.35) so no photo is pushed into looking processed.
# Re-run when the website's fleet photos change:  python3 scripts/tone.py
import json, re
from PIL import Image, ImageStat

src = open("../libraa-website/src/data.ts").read()
ships = re.findall(r'id: "([a-z0-9-]+)",\s*name: "[^"]+",\s*flagName: "[^"]+",\s*(?:status: "[^"]+",\s*)?photo: "([^"]+)"', src)
clamp = lambda v, lo=0.75, hi=1.25: round(max(lo, min(hi, v)), 3)
out = {}
for sid, photo in ships:
    rgb = Image.open("public/site/" + photo.split("/photos/")[1]).convert("RGB")
    rgb.thumbnail((400, 400))
    st = ImageStat.Stat(rgb.convert("L"))
    sat = ImageStat.Stat(rgb.convert("HSV").split()[1]).mean[0]
    out[sid] = {
        "brightness": clamp(140 / st.mean[0]),
        "contrast": clamp(55 / st.stddev[0]),
        "saturate": clamp(95 / max(sat, 1), 0.85, 1.35),
    }
json.dump(out, open("src/photo-tone.json", "w"), indent=1)
print(json.dumps(out, indent=1))
