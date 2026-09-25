# Measures every fleet photo and writes src/photo-tone.json: a brightness and
# a contrast factor per ship that moves each photo halfway towards one common
# level (mean 140, contrast/sd 55), so the fleet montage cuts together as one
# set. Gentle by design - factors are clamped to +/-20%. Re-run when the
# website's fleet photos change:  python3 scripts/tone.py
import json, re
from PIL import Image, ImageStat

src = open("../libraa-website/src/data.ts").read()
ships = re.findall(r'id: "([a-z0-9-]+)",\s*name: "[^"]+",\s*flagName: "[^"]+",\s*(?:status: "[^"]+",\s*)?photo: "([^"]+)"', src)
clamp = lambda v: round(max(0.8, min(1.2, v)), 3)
out = {}
for sid, photo in ships:
    im = Image.open("public/site/" + photo.split("/photos/")[1]).convert("L")
    im.thumbnail((400, 400))
    st = ImageStat.Stat(im)
    out[sid] = {"brightness": clamp((140 / st.mean[0]) ** 0.5), "contrast": clamp((55 / st.stddev[0]) ** 0.5)}
json.dump(out, open("src/photo-tone.json", "w"), indent=1)
print(json.dumps(out, indent=1))
