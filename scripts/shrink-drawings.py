"""Shrink the fitted drawings for upload: keep only the ink (the alpha channel), in 16 shades of the drawing's colour.

The fit is by the drawing's corners, so the image's size and format do not matter to it.
Usage: python3 scripts/shrink-drawings.py data/raw/drawings data/raw/drawings-small
"""
import json, shutil, sys
from pathlib import Path
from PIL import Image

source, target = Path(sys.argv[1]), Path(sys.argv[2])
target.mkdir(parents=True, exist_ok=True)
index = json.loads((source / "index.json").read_text())
names = {f["image"] for floors in index.values() for f in floors.values()}
for name in sorted(names):
    image = Image.open(source / name)
    colour = image.convert("RGB").getpixel((0, 0))  # the drawings are one colour throughout; only the ink varies
    shades = image.getchannel("A").point(lambda v: (v * 15 + 127) // 255).convert("P")
    shades.putpalette(list(colour) * 16)
    shades.save(target / name, optimize=True, transparency=bytes(i * 17 for i in range(16)))
shutil.copy(source / "index.json", target / "index.json")
print(f"Shrank {len(names)} drawings into {target}")
