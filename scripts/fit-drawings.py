# Fits MIT's floor-plan drawings to the map, for the page's optional "MIT drawing" layer. Local only: the drawings
# need MIT Facilities' written permission to copy or display, so they and their fits stay in data/raw (never committed).
#
#   python3 scripts/fit-drawings.py [--again] [building ...]   (only those buildings when named)
#
# For each data/raw/pdfs/<building>_<floor>.pdf (from floorplans.mit.edu/pdfs/<building>_<floor>.pdf) it reads the room
# labels on the drawing (tesseract), matches them to the rooms the floor plan file web/plans/<building>.json places on
# that floor, and fits the drawing to the map by turning, scaling and moving it (never stretching). A fit with at least
# MIN_LABELS matches whose median error is at most MAX_MEDIAN metres is kept: the drawing's lines are written as a
# transparent PNG to data/raw/drawings/<building>_<floor>.png, and data/raw/drawings/index.json records where three of
# its corners land. It also traces room outlines from the drawing (the open floor inside its walls around each room's
# position; see design/compositions/Campus.md) into data/raw/drawings/outlines/<building>.json, which the campus
# converter adds to the plan files: only these shapes leave this machine. Needs: tesseract, and python packages
# pypdfium2, numpy, pillow and opencv-python.
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


TRACE_SCALE = 4  # pixels per PDF point when tracing rooms
INK = 170  # grey level below which a pixel is part of a line
MARK = 0.9  # metres: ink smaller than this across is text or a symbol, not a wall
DOORWAY = 0.45  # metres each wall grows by, so doorways up to about a metre close
NEAR_LABEL = (1.0, 0.7)  # metres: half-size of the ring around a label that decides its room's space
MIN_POCKET = 1.0  # m²: pockets smaller than this (inside letters) are never a room
UNCHECKED = 3.0  # m²: inventory areas smaller than this (or missing) are not trusted for the size check
NEVER_TRACED = {"ELEVATOR", "STAIRWAY"}
FOOTPRINT_MARGIN = 1.0  # metres beyond the building outline still counted as inside


def trace(page, to_map, rooms, footprint):
    """Outlines of the rooms the drawing encloses: {room number: [[lat, lon], ...]}, only those that pass the size check."""
    import cv2  # only needed for tracing
    origin, ex, ey = to_map(0, 0), to_map(1, 0) - to_map(0, 0), to_map(0, 1) - to_map(0, 0)
    to_pdf = lambda q: np.linalg.solve(np.column_stack([ex, ey]), np.asarray(q) - origin)
    img = np.array(page.render(scale=TRACE_SCALE).to_pil().convert("L"))
    h, w = int(img.shape[0] * DRAWING), img.shape[1]
    img = img[:h]
    mpp = float(np.linalg.norm(ex)) / TRACE_SCALE  # metres per pixel
    ink = (img < INK).astype(np.uint8)
    # Grow only long ink (walls) to close doorways; text and small marks stay as drawn.
    _, blob, bstats, _ = cv2.connectedComponentsWithStats(ink, connectivity=8)
    wall = np.maximum(bstats[:, cv2.CC_STAT_WIDTH], bstats[:, cv2.CC_STAT_HEIGHT]) * mpp >= MARK
    wall[0] = False
    grow = max(1, round(DOORWAY / mpp))
    square = cv2.getStructuringElement(cv2.MORPH_RECT, (2 * grow + 1, 2 * grow + 1))
    closed = cv2.dilate(wall[blob].astype(np.uint8), square) | ink
    # Beyond the building's footprint (plus a margin for where its outline and the drawing disagree) is never open
    # floor, so open entrance doors do not join lobbies and corridors to the outdoors.
    inside = np.zeros((h, w), np.uint8)
    for ring in footprint:
        cv2.fillPoly(inside, [np.array([to_pdf(to_m(*p)) * TRACE_SCALE for p in ring]).round().astype(np.int32)], 1)
    margin = round(FOOTPRINT_MARGIN / mpp)
    closed |= 1 - cv2.dilate(inside, cv2.getStructuringElement(cv2.MORPH_RECT, (2 * margin + 1, 2 * margin + 1)))
    _, space, stats, _ = cv2.connectedComponentsWithStats(1 - closed, connectivity=4)
    outside = set(np.unique(np.concatenate([space[0], space[-1], space[:, 0], space[:, -1]])))
    area = lambda k: stats[k, cv2.CC_STAT_AREA] * mpp * mpp
    # Each room's space: the open area most of a ring just outside its label text lies in.
    rx, ry = round(NEAR_LABEL[0] / mpp), round(NEAR_LABEL[1] / mpp)
    claims = {}
    for r in rooms:
        if r["u"] in NEVER_TRACED:
            continue
        x, y = (to_pdf(to_m(*r["at"])) * TRACE_SCALE).round().astype(int)
        if not (0 <= y < h and 0 <= x < w):
            continue
        x0, x1, y0, y1 = max(0, x - rx), min(w - 1, x + rx), max(0, y - ry), min(h - 1, y + ry)
        ring = np.concatenate([space[y0, x0:x1], space[y1, x0:x1], space[y0:y1, x0], space[y0:y1, x1]])
        ring = ring[(ring > 0) & (np.vectorize(area)(ring) >= MIN_POCKET)] if ring.size else ring
        if ring.size:
            claims.setdefault(int(np.bincount(ring).argmax()), []).append((r, x, y))
    outlines = {}
    for k, claimants in claims.items():
        if k in outside:
            continue  # open to the edge of the sheet: outdoors, or a doorway too wide to close
        left, top, width, height = (stats[k, c] for c in (cv2.CC_STAT_LEFT, cv2.CC_STAT_TOP, cv2.CC_STAT_WIDTH, cv2.CC_STAT_HEIGHT))
        whole = space[top:top + height, left:left + width] == k
        yy, xx = np.mgrid[top:top + height, left:left + width]
        nearest = np.argmin([(xx - x) ** 2 + (yy - y) ** 2 for _, x, y in claimants], axis=0)  # shared space: nearest label
        together = sum(r.get("a") or 0 for r, _, _ in claimants)  # known areas only
        for i, (r, _, _) in enumerate(claimants):
            region = np.zeros((h, w), np.uint8)
            region[top:top + height, left:left + width] = whole & (nearest == i)
            region = cv2.dilate(region, square)  # give back the wall growth
            traced = region.sum() * mpp * mpp
            own = r.get("a") or 0
            fits = own < UNCHECKED or 0.5 <= traced / own <= 2
            shared_fits = len(claimants) > 1 and (together < UNCHECKED or 0.5 <= area(k) / together <= 2)
            if not (fits or shared_fits):
                continue
            contours, _ = cv2.findContours(region, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if not contours:
                continue  # nearer labels took all of a shared space
            ring_px = cv2.approxPolyDP(max(contours, key=cv2.contourArea), 0.25 / mpp, True)[:, 0, :]
            outlines[r["n"]] = [to_ll(to_map(px / TRACE_SCALE, py / TRACE_SCALE)) for px, py in ring_px]
    return outlines


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    index_file = OUT / "index.json"
    index = json.loads(index_file.read_text()) if index_file.exists() else {}
    for pdf in sorted(PDFS.glob("*_*.pdf")):
        ref, floor = pdf.stem.split("_", 1)
        named = [a for a in sys.argv[1:] if not a.startswith("--")]
        if (named and ref not in named) or not ("--again" in sys.argv or floor not in index.get(ref, {})):
            continue
        plan_file = PLANS / f"{ref}.json"
        plan = json.loads(plan_file.read_text()) if plan_file.exists() else {"outline": [], "floors": {}}
        rooms = plan["floors"].get(floor, {}).get("rooms", [])
        at = {r["n"]: to_m(*r["at"]) for r in rooms}
        page = pypdfium2.PdfDocument(str(pdf))[0]
        labels = read_labels(page)
        pairs = [(labels[n], at[n]) for n in labels if n in at]
        if len(pairs) < MIN_LABELS:
            print(f"{ref} floor {floor}: only {len(pairs)} labels match the plan; not kept")
            continue
        to_map, errors = fit(pairs)
        # A misread label can match the wrong room: refit once without matches far off the first fit.
        close = [p for p, e in zip(pairs, errors) if e <= max(2.0, 3 * float(np.median(errors)))]
        if MIN_LABELS <= len(close) < len(pairs):
            pairs = close
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
        # Room outlines traced from the drawing (shapes only), replacing this floor's earlier ones.
        outline_file = OUT / "outlines" / f"{ref}.json"
        outline_file.parent.mkdir(exist_ok=True)
        outlines = json.loads(outline_file.read_text()) if outline_file.exists() else {}
        outlines[floor] = trace(pypdfium2.PdfDocument(str(pdf))[0], to_map, rooms, plan["outline"])
        outline_file.write_text(json.dumps(outlines) + "\n")
        print(f"  traced {len(outlines[floor])} of {len(rooms)} rooms")


if __name__ == "__main__":
    main()
