"""Trim the built-in padding off every client logo of the website.

Reads public/site/logos/** (the website's own logos), writes the trimmed
copies to public/logos-trim/** and their sizes to src/logo-dims.json, which
the clients scene uses to size every logo by visual area. Re-run whenever
the website's logos change:  python3 scripts/trim-logos.py
"""
import json, os, sys
from PIL import Image, ImageChops

SRC, DST = "public/site/logos", "public/logos-trim"
dims = {}
for root, _, files in os.walk(SRC):
    for name in sorted(files):
        if not name.endswith(".webp"):
            continue
        src = os.path.join(root, name)
        rel = os.path.relpath(src, SRC)
        im = Image.open(src).convert("RGBA")
        flat = Image.new("RGBA", im.size, (255, 255, 255, 255))
        flat.alpha_composite(im)
        rgb = flat.convert("RGB")
        # anything that is not (near) white is content
        diff = ImageChops.difference(rgb, Image.new("RGB", rgb.size, (255, 255, 255))).convert("L").point(lambda v: 255 if v > 12 else 0)
        box = diff.getbbox() or (0, 0) + im.size
        out = rgb.crop(box)
        dst = os.path.join(DST, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        out.save(dst, "WEBP", quality=95)
        dims[f"logos-trim/{rel}"] = list(out.size)
json.dump(dims, open("src/logo-dims.json", "w"), indent=1, sort_keys=True)
print(len(dims), "logos trimmed")
