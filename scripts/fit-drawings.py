# Fits MIT's floor-plan drawings to the map, for the page's optional "MIT drawing" layer. Local only: the drawings
# need MIT Facilities' written permission to copy or display, so they and their fits stay in data/raw (never committed).
#
#   python3 scripts/fit-drawings.py [--again]
#
# For each data/raw/pdfs/<building>_<floor>.pdf (from floorplans.mit.edu/pdfs/<building>_<floor>.pdf) it reads the room
# labels on the drawing (tesseract), matches them to the rooms the floor plan file web/plans/<building>.json places on
# that floor, and fits the drawing to the map by turning, scaling and moving it (never stretching). A fit with at least
# MIN_LABELS matches whose median error is at most MAX_MEDIAN metres is kept: the drawing's lines are written as a
# transparent PNG to data/raw/drawings/<building>_<floor>.png, and data/raw/drawings/index.json records where three of
# its corners land. Needs: tesseract, and python packages pypdfium2, numpy and pillow.
import csv, json, math, re, subprocess, sys, tempfile
from pathlib import Path
import numpy as np
import pypdfium2
from PIL import Image, ImageFilter

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
PDFS, OUT, PLANS = ROOT / "data/raw/pdfs", ROOT / "data/raw/drawings", ROOT / "web/plans"
MIN_LABELS, MAX_MEDIAN = 6, 2.0
OCR_SCALE = 14  # pixels per PDF point when reading labels; room numbers are small
IMAGE_SCALE = 3  # pixels per PDF point in the written drawing (about 0.05-0.1 m per pixel)
DRAWING = 0.86  # the title block takes the bottom of the sheet
K = math.cos(math.radians(42.36))
to_m = lambda lat, lon: np.array([(lon + 71.09) * 111320 * K, (lat - 42.36) * 110540])
to_ll = lambda p: [round(p[1] / 110540 + 42.36, 8), round(p[0] / (111320 * K) - 71.09, 8)]


def read_labels(page):
    """Room-number labels on the drawing: {label: (x, y) in PDF points}, the most confident reading of each."""
    img = page.render(scale=OCR_SCALE).to_pil().convert("L")
    w, h = img.size
    bottom, tile, overlap, labels = int(h * DRAWING), 2400, 200, {}
    with tempfile.TemporaryDirectory() as tmp:
        piece = f"{tmp}/tile.png"
        for y in range(0, bottom, tile - overlap):
            for x in range(0, w, tile - overlap):
                crop = img.crop((x, y, min(x + tile, w), min(y + tile, bottom)))
                if crop.getextrema()[0] > 200:
                    continue  # blank
                crop.save(piece)
                out = subprocess.run(["tesseract", piece, "-", "--psm", "11", "-c", "tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", "tsv"], capture_output=True, text=True).stdout
                for r in csv.DictReader(out.splitlines(), delimiter="\t"):
                    t = (r.get("text") or "").strip()
                    if re.fullmatch(r"[A-Z]?\d{3}[A-Z0-9]{0,4}", t) and float(r["conf"]) > 60:
                        cx = (x + int(r["left"]) + int(r["width"]) / 2) / OCR_SCALE
                        cy = (y + int(r["top"]) + int(r["height"]) / 2) / OCR_SCALE
                        if t not in labels or float(r["conf"]) > labels[t][2]:
                            labels[t] = (cx, cy, float(r["conf"]))
    return {t: (x, y) for t, (x, y, _) in labels.items()}


def fit(pairs):
    """Similarity transform (Umeyama) from PDF points (y down) to metres: returns to_map(x, y) and each pair's error."""
    P = np.array([[x, -y] for (x, y), _ in pairs]); Q = np.array([q for _, q in pairs])
    mp, mq = P.mean(0), Q.mean(0); A, B = P - mp, Q - mq
    U, S, Vt = np.linalg.svd(A.T @ B)
    d = np.sign(np.linalg.det(U @ Vt))  # a reflection is never a fit: a drawing is not mirrored
    D = np.diag([1, d]); R = (U @ D @ Vt).T; s = (S * np.diag(D)).sum() / (A ** 2).sum()
    to_map = lambda x, y: s * (R @ (np.array([x, -y]) - mp)) + mq
    errors = [float(np.linalg.norm(to_map(*p) - q)) for p, q in pairs]
    return to_map, errors


def drawing_png(page, path):
    """The drawing's lines, dark on transparent, cropped to what is drawn; returns the crop's box in PDF points."""
    img = page.render(scale=IMAGE_SCALE).to_pil().convert("L")
    img = img.crop((0, 0, img.size[0], int(img.size[1] * DRAWING)))
    box = img.point(lambda v: 255 if v < 245 else 0).getbbox() or (0, 0, *img.size)
    img = img.crop(box).filter(ImageFilter.MinFilter(3))  # hairlines, thickened so they survive scaling down on screen
    ink = Image.new("RGBA", img.size, (28, 43, 57, 0))
    ink.putalpha(img.point(lambda v: min(255, (255 - v) * 3)))  # thin grey lines, drawn darker so they read on screen
    ink.save(path, optimize=True)
    return [c / IMAGE_SCALE for c in box]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    index_file = OUT / "index.json"
    index = json.loads(index_file.read_text()) if index_file.exists() else {}
    for pdf in sorted(PDFS.glob("*_*.pdf")):
        ref, floor = pdf.stem.split("_", 1)
        if not ("--again" in sys.argv or floor not in index.get(ref, {})):
            continue
        plan_file = PLANS / f"{ref}.json"
        rooms = json.loads(plan_file.read_text())["floors"].get(floor, {}).get("rooms", []) if plan_file.exists() else []
        at = {r["n"]: to_m(*r["at"]) for r in rooms}
        page = pypdfium2.PdfDocument(str(pdf))[0]
        labels = read_labels(page)
        pairs = [(labels[n], at[n]) for n in labels if n in at]
        if len(pairs) < MIN_LABELS:
            print(f"{ref} floor {floor}: only {len(pairs)} labels match the plan; not kept")
            continue
        to_map, errors = fit(pairs)
        median = float(np.median(errors))
        print(f"{ref} floor {floor}: {len(pairs)} labels, median error {median:.1f} m, worst {max(errors):.1f} m", "" if median <= MAX_MEDIAN else "; not kept")
        if median > MAX_MEDIAN:
            continue
        image = f"{ref}_{floor}.png"
        x0, y0, x1, y1 = drawing_png(page, OUT / image)
        corners = [to_ll(to_map(x, y)) for x, y in [(x0, y0), (x1, y0), (x0, y1)]]  # top left, top right, bottom left
        index.setdefault(ref, {})[floor] = {"image": image, "corners": corners, "labels": len(pairs), "median": round(median, 2)}
        index_file.write_text(json.dumps(index, indent=1) + "\n")


if __name__ == "__main__":
    main()
