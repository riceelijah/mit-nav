# Fits MIT's floor-plan drawings to the map, for the page's optional "MIT drawing" layer. Local only: the drawings
# need MIT Facilities' written permission to copy or display, so they and their fits stay in data/raw (never committed).
#
#   python3 scripts/fit-drawings.py [--again] [--hallways] [building[_floor] ...]   (only those when named)
#
# --hallways (an experiment, local only) also traces each fitted floor's hallways by flooding from its corridors and
# lobbies (see trace_hallways) into keys "hall", "~hall" and "hall-open" of the outline file, leaving the room-first
# keys as they are, and writes data/raw/drawings/debug/<building>_<floor>.png to look at.
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


# a room-number label as the drawings print it
LABEL = r"[A-Z]?\d{3}[A-Z0-9]{0,4}"
# letters tesseract reads in place of digits, mapped back to them
DIGITS = str.maketrans("OQDSILBZGT", "0005118267")


def read_labels(page, scale=OCR_SCALE):
    """Room-number labels on the drawing: {label: (x, y) in PDF points}, the most confident reading of each."""
    img = page.render(scale=scale).to_pil().convert("L")
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
                    # a basement's leading 0 reads as O or Q, a 3 as S
                    if not re.fullmatch(LABEL, t):
                        t = t[:3].translate(DIGITS) + t[3:]
                    if re.fullmatch(LABEL, t) and float(r["conf"]) > 60:
                        cx = (x + int(r["left"]) + int(r["width"]) / 2) / scale
                        cy = (y + int(r["top"]) + int(r["height"]) / 2) / scale
                        if t not in labels or float(r["conf"]) > labels[t][2]:
                            labels[t] = (cx, cy, float(r["conf"]))
    return {t: (x, y) for t, (x, y, _) in labels.items()}


# characters tesseract mixes up in these drawings' labels (3 for 5 above all), read as one when matching.
FOLD = str.maketrans("358BSODQ01IL7TZ2G6", "333330000111112266")


def matches(labels, at):
    """Returns (drawing position, map position) pairs, one for each label that names a room or reads the same as exactly one unmatched room."""
    pairs = [(labels[n], at[n]) for n in labels if n in at]
    folded = {}
    for n in at:
        if n not in labels:
            folded.setdefault(n.translate(FOLD), []).append(n)
    for t in labels:
        if t not in at and len(folded.get(t.translate(FOLD), [])) == 1:
            pairs.append((labels[t], at[folded[t.translate(FOLD)][0]]))
    return pairs


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


def drawing_box(page):
    """The drawing rendered at IMAGE_SCALE above the title block, and the box of what is drawn (pixels)."""
    img = page.render(scale=IMAGE_SCALE).to_pil().convert("L")
    img = img.crop((0, 0, img.size[0], int(img.size[1] * DRAWING)))
    return img, img.point(lambda v: 255 if v < 245 else 0).getbbox() or (0, 0, *img.size)


def drawing_png(page, path):
    """The drawing's lines, dark on transparent, cropped to what is drawn; returns the crop's box in PDF points."""
    img, box = drawing_box(page)
    img = img.crop(box).filter(ImageFilter.MinFilter(3))  # hairlines, thickened so they survive scaling down on screen
    ink = Image.new("RGBA", img.size, (28, 43, 57, 0))
    ink.putalpha(img.point(lambda v: min(255, (255 - v) * 3)))  # thin grey lines, drawn darker so they read on screen
    ink.save(path, optimize=True)
    return [c / IMAGE_SCALE for c in box]


TRACE_SCALE = 4  # pixels per PDF point when tracing rooms
INK = 170  # grey level below which a pixel is part of a line
MARK = 0.9  # metres: ink smaller than this across is text or a symbol, not a wall
DOORWAY = 0.45  # metres each wall grows by (then shrinks back), so doorways up to about 0.9 m close
NEAR_LABEL = (1.0, 0.7)  # metres: half-size of the ring around a label that decides its room's space
MIN_POCKET = 1.0  # m²: pockets smaller than this (inside letters) are never a room
UNCHECKED = 3.0  # m²: inventory areas smaller than this (or missing) are not trusted for the size check
SERVICE = {"SHAFT SPACE", "ELECTRIC CLOSET", "TELECOM CLOSET", "UTILITY/MECH RM", "CUSTODIAL CLOSET"}  # never drawn either
NEVER_TRACED = {"ELEVATOR", "STAIRWAY"}
CIRCULATION = {"CORRIDOR", "LOBBY", "BRIDGE/TUNNEL"}
UNCLAIMED_MIN = 4.0  # m²: unlabelled open floor smaller than this is a closet or a gap, not a corridor
FOOTPRINT_MARGIN = 1.0  # metres beyond the building outline still counted as inside
OUTER_WALL = 0.3  # metres: a space leaking into that margin is cut back to the outline plus this
HALL_LINE = 0.1  # metres: spaces this close across a line are rows of one seated hall when its own space is too small
SEATING = 1.0  # metres: ink thicker than this throughout (no wall is) is a hall's seating, drawn too densely to trace


def share(whole, claimants, mpp, step=4):
    """Splits one open space among the rooms whose labels lie in it: each room that is not a corridor, lobby or bridge
    grows from its label through the open space (never across walls) until it reaches its inventory area; corridors,
    lobbies and bridges take what is left, each the part nearest its label (with none, it stays unclaimed).
    Returns, for each pixel of `whole`, the index of its claimant (-1 outside the space or unclaimed)."""
    import cv2
    small = whole[::step, ::step].astype(np.uint8)
    cell = (mpp * step) ** 2
    owner = np.full(small.shape, -1, np.int32)
    seeds = [(min(small.shape[1] - 1, x // step), min(small.shape[0] - 1, y // step)) for x, y, _ in claimants]
    # A label point on its own text: start from the nearest open cell instead.
    open_y, open_x = np.nonzero(small)
    seeds = [(x, y) if small[y, x] else tuple(int(v) for v in min(zip(open_x, open_y), key=lambda c: (c[0] - x) ** 2 + (c[1] - y) ** 2)) for x, y in seeds]
    rooms = [i for i, (_, _, r) in enumerate(claimants) if r["u"] not in CIRCULATION]
    quota = {i: max(claimants[i][2].get("a") or 0, UNCHECKED) / cell for i in rooms}
    grown = {i: np.zeros(small.shape, np.uint8) for i in rooms}
    for i in rooms:
        x, y = seeds[i]
        if small[y, x] and owner[y, x] < 0:
            grown[i][y, x] = 1; owner[y, x] = i
    cross = cv2.getStructuringElement(cv2.MORPH_CROSS, (3, 3))
    active = [i for i in rooms if grown[i].any()]
    while active:
        still = []
        for i in active:
            ring = cv2.dilate(grown[i], cross) & small & (owner < 0)
            if not ring.any():
                continue
            grown[i] |= ring; owner[ring == 1] = i
            if grown[i].sum() < quota[i]:
                still.append(i)
        active = still
    # The rest goes to corridors, lobbies and bridges by nearest label; with none, it stays unclaimed open floor.
    rest = [i for i in range(len(claimants)) if i not in rooms]
    if rest:
        yy, xx = np.mgrid[0:small.shape[0], 0:small.shape[1]]
        nearest = np.array(rest)[np.argmin([(xx - seeds[i][0]) ** 2 + (yy - seeds[i][1]) ** 2 for i in rest], axis=0)]
        owner = np.where((owner < 0) & (small == 1), nearest, owner)
    full = np.kron(owner, np.ones((step, step), np.int32))[: whole.shape[0], : whole.shape[1]]
    return np.where(whole, full, -1)


def prepare(page, to_map, footprint):
    """The setup trace() and trace_hallways() share. Returns the drawing rendered for tracing, its ink, its walls closed
    across doorways, the footprint masks and the into_doorways() grower."""
    import cv2  # only needed for tracing
    from types import SimpleNamespace
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
    line_width = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    # Closing (grow, then shrink back) shuts doorways without thickening walls or door swings into the rooms.
    shut = cv2.morphologyEx(wall[blob].astype(np.uint8), cv2.MORPH_CLOSE, square)
    closed = shut | ink
    # Beyond the building's footprint (plus a margin for where its outline and the drawing disagree) is never open
    # floor, so open entrance doors do not join lobbies and corridors to the outdoors.
    if footprint:
        inside = np.zeros((h, w), np.uint8)
        for ring in footprint:
            cv2.fillPoly(inside, [np.array([to_pdf(to_m(*p)) * TRACE_SCALE for p in ring]).round().astype(np.int32)], 1)
        margin = round(FOOTPRINT_MARGIN / mpp)
        beyond = 1 - cv2.dilate(inside, cv2.getStructuringElement(cv2.MORPH_RECT, (2 * margin + 1, 2 * margin + 1)))
        closed |= beyond
        # The outline itself, plus the outer wall's thickness: what a space in the margin is cut back to (below).
        wall_in = round(OUTER_WALL / mpp)
        outline_mask = cv2.dilate(inside, cv2.getStructuringElement(cv2.MORPH_RECT, (2 * wall_in + 1, 2 * wall_in + 1))).astype(bool)
    else:
        beyond = np.zeros((h, w), np.uint8)
        outline_mask = None
    cross = cv2.getStructuringElement(cv2.MORPH_CROSS, (3, 3))

    def into_doorways(region):
        """A space grown back through what closing doorways took, without crossing a drawn line, then out to the middle
        of the lines around it: spaces on either side of a door meet in the doorway, never through a wall."""
        ys, xs = np.nonzero(region)
        if not len(ys):
            return region
        y0, y1, x0, x1 = max(0, ys.min() - grow - 3), ys.max() + grow + 4, max(0, xs.min() - grow - 3), xs.max() + grow + 4
        part, free = region[y0:y1, x0:x1], 1 - ink[y0:y1, x0:x1]
        for _ in range(grow):
            part = cv2.dilate(part, cross) & free
        out = np.zeros_like(region)
        out[y0:y1, x0:x1] = cv2.dilate(part | region[y0:y1, x0:x1], line_width)
        return out
    return SimpleNamespace(img=img, h=h, w=w, mpp=mpp, to_pdf=to_pdf, ink=ink, walls=wall[blob].astype(np.uint8), shut=shut, closed=closed, beyond=beyond,
                           outline_mask=outline_mask, grow=grow, cross=cross, line_width=line_width, into_doorways=into_doorways)


def trace(page, to_map, rooms, footprint):
    """Outlines of the rooms the drawing encloses: {room number: [[lat, lon], ...]}, only those that pass the size check."""
    # only needed for tracing
    import cv2
    f = prepare(page, to_map, footprint)
    img, h, w, mpp, to_pdf, ink, closed, beyond = f.img, f.h, f.w, f.mpp, f.to_pdf, f.ink, f.closed, f.beyond
    outline_mask, grow, cross, line_width, into_doorways = f.outline_mask, f.grow, f.cross, f.line_width, f.into_doorways
    _, space, stats, middles = cv2.connectedComponentsWithStats(1 - closed, connectivity=4)
    # spaces reaching the margin's outer edge are cut back to the outline. A corridor open at a building's end (where
    # the next building carries it on) runs out into the margin strip around the whole outside.
    leaky = set(np.unique(space[(cv2.dilate(beyond, cross) == 1) & (beyond == 0)]).tolist()) - {0}
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
    def box(ks):
        """The bounding box (left, top, width, height) of spaces ks."""
        x0 = min(stats[k, cv2.CC_STAT_LEFT] for k in ks); y0 = min(stats[k, cv2.CC_STAT_TOP] for k in ks)
        x1 = max(stats[k, cv2.CC_STAT_LEFT] + stats[k, cv2.CC_STAT_WIDTH] for k in ks)
        y1 = max(stats[k, cv2.CC_STAT_TOP] + stats[k, cv2.CC_STAT_HEIGHT] for k in ks)
        return x0, y0, x1 - x0, y1 - y0

    absorbed = set()
    reach = max(2, round(HALL_LINE / mpp))
    near_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2 * reach + 1, 2 * reach + 1))

    def hall(k, r, x, y):
        """The spaces of a room whose own space is under half its inventory area (a seated hall, split into rows by the
        drawing's lines): it takes in the unlabelled spaces just across a thin line from it, nearest its position first,
        while it stays under 1.3 times its area, until it has 0.85 of it. Rooms that do not reach half keep their own."""
        own = r.get("a") or 0
        members, total, skip = {k}, area(k), set()
        if r["u"] in CIRCULATION or own < UNCHECKED or total >= 0.5 * own:
            return members, None
        while total < 0.85 * own:
            left, top, width, height = box(members)
            x0, y0 = max(0, left - reach), max(0, top - reach)
            crop = space[y0:top + height + reach, x0:left + width + reach]
            mine = np.isin(crop, list(members)).astype(np.uint8)
            ring = cv2.dilate(mine, near_kernel) & (1 - mine)
            near = [int(c) for c in np.unique(crop[ring == 1]) if c > 0 and c not in members | skip | absorbed | outside and c not in claims and area(c) >= MIN_POCKET]
            if not near:
                break
            c = min(near, key=lambda c: (middles[c][0] - x) ** 2 + (middles[c][1] - y) ** 2)
            if total + area(c) > 1.3 * own:
                skip.add(c)
                continue
            members.add(c)
            total += area(c)
        if total < 0.5 * own:
            # Rows drawn so densely that closing doorways filled them: the solid ink beside the hall's own space.
            seating = solid_beside(k)
            if seating is not None and 0.5 * own <= area(k) + seating.sum() * mpp * mpp <= 1.3 * own:
                return {k}, seating
            return {k}, None
        absorbed.update(members - {k})
        return members, None

    solid = []
    def solid_beside(k):
        """The largest piece of ink thicker than SEATING throughout that touches space k, as a full-size mask."""
        # ponytail: one bincount over the page per hall; cache sizes if a floor has many halls.
        if not solid:
            thick = cv2.morphologyEx(closed, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (round(SEATING / mpp),) * 2))
            solid.extend(cv2.connectedComponents(thick, connectivity=8))
        _, pieces = solid
        left, top, width, height = box({k})
        pad = round(SEATING / mpp)
        y0, x0 = max(0, top - pad), max(0, left - pad)
        crop = pieces[y0:top + height + pad, x0:left + width + pad]
        mine = (space[y0:top + height + pad, x0:left + width + pad] == k).astype(np.uint8)
        touching = crop[cv2.dilate(mine, near_kernel) == 1]
        touching = touching[touching > 0]
        if not touching.size:
            return None
        sizes = np.bincount(pieces.ravel())
        return (pieces == max(np.unique(touching), key=lambda c: sizes[c])).astype(np.uint8)

    def ring_of(mask):
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        ring_px = cv2.approxPolyDP(max(contours, key=cv2.contourArea), 0.25 / mpp, True)[:, 0, :]
        return [to_ll(to_map(px / TRACE_SCALE, py / TRACE_SCALE)) for px, py in ring_px]

    # Corridors and open floor are also kept as drawn: bounded by their walls and closed doorways, without the notches
    # growing through doorways leaves (key "~", and "~open" alongside ""); route lines use the grown outlines.
    outlines, spare, drawn = {}, [], {}
    for k, claimants in claims.items():
        if k in outside:
            continue  # open to the edge of the sheet: outdoors, or a doorway too wide to close
        # A service room (closet, shaft) keeps a space of its own from being open floor but is never drawn, and takes
        # no part of a space it shares: most closets' labels sit in the corridor outside them.
        if all(r["u"] in SERVICE for r, _, _ in claimants):
            continue
        claimants = [c for c in claimants if c[0]["u"] not in SERVICE]
        # The largest room whose label lies here may be a hall the drawing split (shared spaces are then split as usual).
        members, seating = hall(k, *max(claimants, key=lambda c: c[0].get("a") or 0))
        left, top, width, height = box(members)
        if seating is not None:
            ys, xs = np.nonzero(seating)
            right, bottom = max(left + width, xs.max() + 1), max(top + height, ys.max() + 1)
            left, top = min(left, xs.min()), min(top, ys.min())
            width, height = right - left, bottom - top
        whole = np.isin(space[top:top + height, left:left + width], list(members))
        if seating is not None:
            whole |= seating[top:top + height, left:left + width].astype(bool)
        if outline_mask is not None and members & leaky:
            whole &= outline_mask[top:top + height, left:left + width]
        yy, xx = np.mgrid[top:top + height, left:left + width]
        # One room has its whole space; several share it (see share()), and what none takes is unlabelled open floor.
        nearest = np.zeros(whole.shape, np.int32) if len(claimants) == 1 else share(whole, [(x - left, y - top, r) for r, x, y in claimants], mpp)
        leftover = np.zeros((h, w), np.uint8)
        leftover[top:top + height, left:left + width] = whole & (nearest < 0)
        if leftover.sum() * mpp * mpp >= UNCLAIMED_MIN:
            spare.append(leftover)
        together = sum(r.get("a") or 0 for r, _, _ in claimants)  # known areas only
        cut = outline_mask is not None and bool(members & leaky)
        for i, (r, cx, cy) in enumerate(claimants):
            region = np.zeros((h, w), np.uint8)
            part = (whole & (nearest == i)).astype(np.uint8)
            if cut:  # cutting can leave the strip outside the walls as a piece of its own: keep the one at the label
                n, pieces = cv2.connectedComponents(part, connectivity=4)
                if n > 2:
                    ys, xs = np.nonzero(part)
                    at = np.argmin((xs - (cx - left)) ** 2 + (ys - (cy - top)) ** 2)
                    part = (pieces == pieces[ys[at], xs[at]]).astype(np.uint8)
            region[top:top + height, left:left + width] = part
            plain = cv2.dilate(region, line_width)
            region = into_doorways(region)
            traced = region.sum() * mpp * mpp
            own = r.get("a") or 0
            fits = own < UNCHECKED or 0.5 <= traced / own <= 2
            shared_fits = len(claimants) > 1 and (together < UNCHECKED or 0.5 <= whole.sum() * mpp * mpp / together <= 2)
            if not (fits or shared_fits):
                continue
            contours, _ = cv2.findContours(region, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if not contours:
                continue  # nearer labels took all of a shared space
            ring_px = cv2.approxPolyDP(max(contours, key=cv2.contourArea), 0.25 / mpp, True)[:, 0, :]
            outlines[r["n"]] = [to_ll(to_map(px / TRACE_SCALE, py / TRACE_SCALE)) for px, py in ring_px]
            if r["u"] in CIRCULATION:
                drawn[r["n"]] = ring_of(plain)
    # Open floor no room's label claims (unlabelled stretches of corridor), for drawing route lines through; never
    # what is open to the outdoors, and not pockets smaller than a room could be.
    dark = cv2.erode(img, np.ones((2 * round(0.15 / mpp) + 1,) * 2, np.uint8)) < 200  # ink within 0.15 m, faint lines included

    def triangle(raw_region):
        """A box the drawing crosses out (an opening to below, or a shaft), not a corridor: a three-cornered quarter of
        one whose X is drawn as walls, or a whole one whose X is drawn too faintly to split it (both diagonals inked)."""
        contours, _ = cv2.findContours(raw_region, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        outline = max(contours, key=cv2.contourArea)
        if len(cv2.approxPolyDP(outline, 0.6 / mpp, True)) <= 3:  # a corner clipped by less than this still counts
            return True
        corners = cv2.boxPoints(cv2.minAreaRect(outline))
        def inked(a, b):
            t = np.linspace(0.1, 0.9, 60)
            xs, ys = (a[0] + (b[0] - a[0]) * t).astype(int), (a[1] + (b[1] - a[1]) * t).astype(int)
            ok = (xs >= 0) & (xs < w) & (ys >= 0) & (ys < h)
            return ok.all() and dark[ys, xs].mean() > 0.7
        return inked(corners[0], corners[2]) and inked(corners[1], corners[3])

    unclaimed, unclaimed_drawn = [], []
    for raw_region in spare:
        if not (cv2.dilate(raw_region, cross) & beyond).any() and not triangle(raw_region):
            unclaimed.append(ring_of(into_doorways(raw_region)))
            unclaimed_drawn.append(ring_of(cv2.dilate(raw_region, line_width)))
    for k in range(1, len(stats)):
        if k in claims or k in outside or k in absorbed or area(k) < UNCLAIMED_MIN:
            continue
        raw_region = (space == k).astype(np.uint8)
        if (cv2.dilate(raw_region, cross) & beyond).any():
            continue  # reaches the footprint's edge: the strip outside the building's walls, not a corridor
        if triangle(raw_region):
            continue
        unclaimed.append(ring_of(into_doorways(raw_region)))
        unclaimed_drawn.append(ring_of(cv2.dilate(raw_region, line_width)))
    outlines[""], outlines["~open"], outlines["~"] = unclaimed, unclaimed_drawn, drawn
    return outlines

SHARED_WALL = 0.15  # neighbouring outlines meet inside the wall between them; more overlap than this share is not that

# for --hallways (experiment), the hallways are flooded from the corridors and lobbies themselves, not from what rooms leave over
DOOR_LEAK = 1.2  # metres the flood is shrunk then regrown by, cutting leaks narrower than a corridor (open doors, hairline gaps)
SMOOTH = 0.3  # metres the hallway is opened then closed by, so text notches, recesses and pixel steps go
HALL_HOLE = 4.0  # m² under which holes in the hallway (columns, symbols) are filled, while stair blocks stay holes
ELONGATED = 3.0  # how many times longer than wide an unlabelled open space must be to count as shaped like a corridor
DOORS = 2  # closed doorways into labelled rooms that let a corridor-shaped space seed the flood (railings and aisles have no rooms)
HALL_TYPES = {"LECTURE HALL", "CLASSROOM"}  # rooms the flood takes through their double doors, carved out again by their outlines
DOOR_STUB = 0.15  # m² from which a piece of the grown hallway beyond the hallway as drawn is a doorway off it
LINK = 25.0  # m² under which an unlabelled space meeting two flooded spaces across closed doorways joins them (fire doors)


def trace_hallways(f, rooms, carve=None, hints=()):
    """Floods one floor's hallway from its corridors, lobbies and bridges (and corridor-shaped open floor) through open
    floor whose only barriers are walls. Ink smaller than MARK across is dropped, so a lounge open to the hallway floods
    with it and a walled one stays out. Returns the hallway grown into doorways, the hallway as drawn, the seeds, the
    rooms open to it, its doorways (pixel points) and a sanity report. `carve` is a mask taken out of the hallway, and
    `hints` are pixel points of unlabelled open floor that can seed the space they lie in on label-poor floors."""
    import cv2
    mpp, h, w = f.mpp, f.h, f.w
    barrier = f.shut | f.beyond
    _, space, stats, _ = cv2.connectedComponentsWithStats(1 - barrier, connectivity=4)
    area = lambda k: stats[k, cv2.CC_STAT_AREA] * mpp * mpp
    # spaces next to the margin's outer edge are the strip between the walls and the footprint margin, or a leak into it
    edge = (cv2.dilate(f.beyond, f.cross) == 1) & (f.beyond == 0)
    leaky = set(np.unique(space[edge]).tolist()) - {0}
    at = {}
    for r in rooms:
        x, y = (f.to_pdf(to_m(*r["at"])) * TRACE_SCALE).round().astype(int)
        if 0 <= y < h and 0 <= x < w:
            at[r["n"]] = (int(x), int(y))
    use = {r["n"]: r["u"] for r in rooms}

    def snap(x, y):
        """The nearest open pixel to (x, y), within a metre; the point itself when it is open."""
        if not barrier[y, x]:
            return x, y
        rr = round(1.0 / mpp)
        y0, x0 = max(0, y - rr), max(0, x - rr)
        ys, xs = np.nonzero(1 - barrier[y0:y + rr + 1, x0:x + rr + 1])
        if not len(ys):
            return x, y
        i = np.argmin((xs + x0 - x) ** 2 + (ys + y0 - y) ** 2)
        return int(xs[i] + x0), int(ys[i] + y0)
    seeds = [(*snap(*at[n]), n) for n in at if use[n] in CIRCULATION]
    # stairs and elevators label their spaces too, but closet labels sit in corridors and label nothing
    labelled = {space[y, x] for n, (x, y) in at.items() if use[n] not in CIRCULATION | SERVICE} - {0}
    comps = {space[y, x] for x, y, _ in seeds} - {0}
    leak = cv2.getStructuringElement(cv2.MORPH_RECT, (2 * round(DOOR_LEAK / mpp / 2) + 1,) * 2)
    # what closing the walls across doorways added
    doors = f.shut & (1 - f.walls)
    # reaches across a closed doorway
    span = cv2.getStructuringElement(cv2.MORPH_RECT, (2 * f.grow + 3,) * 2)

    def corridor_shaped(region):
        """Whether a space mostly survives opening by DOOR_LEAK and is ELONGATED times longer than wide. A lecture
        hall's seat rows are long too, but too narrow to survive the opening."""
        contours, _ = cv2.findContours(region, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            return False
        (_, (rw, rh), _) = cv2.minAreaRect(max(contours, key=cv2.contourArea))
        wide = cv2.morphologyEx(region, cv2.MORPH_OPEN, leak).sum() >= 0.5 * region.sum()
        return bool(wide and min(rw, rh) > 0 and max(rw, rh) / min(rw, rh) >= ELONGATED)

    def filled(mask):
        """The mask with holes under HALL_HOLE (columns, stair arrows, text) filled; a core or stair block stays a hole."""
        n_holes, holes, hstats, _ = cv2.connectedComponentsWithStats(1 - mask, connectivity=4)
        border = set(np.unique(np.concatenate([holes[0], holes[-1], holes[:, 0], holes[:, -1]])).tolist())
        small = [k for k in range(1, n_holes) if k not in border and hstats[k, cv2.CC_STAT_AREA] * mpp * mpp < HALL_HOLE]
        return mask | np.isin(holes, small).astype(np.uint8)
    # unlabelled spaces wide enough for a corridor, as k -> (a seed pixel, corridor-shaped, doorways into rooms)
    shaped = {}
    for k in range(1, len(stats)):
        if k in comps or k in labelled or k in leaky or area(k) < UNCLAIMED_MIN:
            continue
        left, top, bw, bh = (stats[k, c] for c in (cv2.CC_STAT_LEFT, cv2.CC_STAT_TOP, cv2.CC_STAT_WIDTH, cv2.CC_STAT_HEIGHT))
        pad = f.grow + 3
        y0, x0, y1, x1 = max(0, top - pad), max(0, left - pad), top + bh + pad, left + bw + pad
        region = (space[y0:y1, x0:x1] == k).astype(np.uint8)
        if cv2.morphologyEx(region, cv2.MORPH_OPEN, leak).sum() < 0.5 * region.sum():
            continue
        ys, xs = np.nonzero(region)
        # a pixel of the space nearest its middle
        i = np.argmin((xs - xs.mean()) ** 2 + (ys - ys.mean()) ** 2)
        n_doors, door = cv2.connectedComponents((cv2.dilate(region, f.cross) & doors[y0:y1, x0:x1]).astype(np.uint8), connectivity=8)
        into_rooms = 0
        for d in range(1, n_doors):
            # the spaces past the door leaf
            beside = set(np.unique(space[y0:y1, x0:x1][cv2.dilate((door == d).astype(np.uint8), span) == 1]).tolist())
            # a labelled room, not a seeded hallway an open lounge's label lies in
            into_rooms += bool(beside & labelled - comps)
        shaped[k] = ((int(xs[i] + x0), int(ys[i] + y0)), corridor_shaped(region), into_rooms)
    for k, (seed, shape, into_rooms) in shaped.items():
        if shape and into_rooms >= DOORS:
            seeds.append((*seed, f"open{k}"))
            comps.add(k)
    for hx, hy in hints:
        if 0 <= hy < h and 0 <= hx < w:
            k = space[hy, hx]
            # wide, with a door into a room, and of any shape
            if k in shaped and k not in comps and shaped[k][2]:
                seeds.append((*shaped[k][0], f"open{k}"))
                comps.add(k)
    flood = np.isin(space, list(comps)).astype(np.uint8)
    # corridor-shaped spaces that meet the flood across a closed doorway carry the corridor on past its fire doors.
    waiting = {k: (seed, 1 if shape and into_rooms else 2) for k, (seed, shape, into_rooms) in shaped.items() if k not in comps and ((shape and into_rooms) or area(k) < LINK)}

    def meets(k):
        """The flooded spaces space k touches across a closed doorway."""
        left, top, bw, bh = (stats[k, c] for c in (cv2.CC_STAT_LEFT, cv2.CC_STAT_TOP, cv2.CC_STAT_WIDTH, cv2.CC_STAT_HEIGHT))
        pad = f.grow + 3
        y0, x0 = max(0, top - pad), max(0, left - pad)
        crop = space[y0:top + bh + pad, x0:left + bw + pad]
        return set(np.unique(crop[cv2.dilate((crop == k).astype(np.uint8), span) == 1]).tolist()) & comps
    while waiting:
        near = set(np.unique(space[cv2.dilate(flood, span) == 1]).tolist()) & set(waiting)
        near = {k for k in near if len(meets(k)) >= waiting[k][1]}
        if not near:
            break
        for k in near:
            seeds.append((*waiting.pop(k)[0], f"open{k}"))
            comps.add(k)
        flood = np.isin(space, list(comps)).astype(np.uint8)
    reaches_margin = bool(comps & leaky)
    if reaches_margin and f.outline_mask is not None:
        # a lobby open to the outdoors is cut back to the outline, as trace() does
        flood &= f.outline_mask
    opened = cv2.morphologyEx(flood, cv2.MORPH_OPEN, leak)
    _, pieces = cv2.connectedComponents(opened, connectivity=4)
    near_seed = np.zeros((h, w), np.uint8)
    for x, y, _ in seeds:
        near_seed[y, x] = 1
    hit = set(np.unique(pieces[(cv2.dilate(near_seed, leak) == 1) & (opened == 1)]).tolist()) - {0}
    # opening also splits a corridor at its fire doors, so the seedless piece beyond them is kept by its shape
    n_pieces, pieces, pstats, _ = cv2.connectedComponentsWithStats(opened, connectivity=4)
    for k in range(1, n_pieces):
        if k not in hit and pstats[k, cv2.CC_STAT_AREA] * mpp * mpp >= UNCLAIMED_MIN:
            left, top, bw, bh = (pstats[k, c] for c in (cv2.CC_STAT_LEFT, cv2.CC_STAT_TOP, cv2.CC_STAT_WIDTH, cv2.CC_STAT_HEIGHT))
            if corridor_shaped((pieces[top:top + bh, left:left + bw] == k).astype(np.uint8)):
                hit.add(k)
    kept = np.isin(pieces, list(hit)).astype(np.uint8)
    # what the opening cut off around a seed (a small stair lobby) goes back in, unless it is a room-sized leak
    _, lost, lstats, _ = cv2.connectedComponentsWithStats(flood & (1 - kept), connectivity=4)
    for x, y, _ in seeds:
        k = lost[y, x]
        if not kept[y, x] and k and lstats[k, cv2.CC_STAT_AREA] * mpp * mpp < LINK:
            kept |= (lost == k).astype(np.uint8)
    if carve is not None:
        kept &= 1 - carve
    kept = filled(kept)
    smooth_k = cv2.getStructuringElement(cv2.MORPH_RECT, (2 * round(SMOOTH / mpp) + 1,) * 2)
    smooth = cv2.morphologyEx(cv2.morphologyEx(kept, cv2.MORPH_OPEN, smooth_k), cv2.MORPH_CLOSE, smooth_k)
    drawn = filled(cv2.dilate(smooth, f.line_width))
    # growing stops at every drawn line, so text inside comes back as holes
    grown = filled(f.into_doorways(smooth))
    open_rooms = sorted(n for n, (x, y) in at.items() if use[n] not in CIRCULATION | SERVICE | NEVER_TRACED and grown[y, x])
    # the doorways off the hallway are where growing into doorways reached beyond the hallway as drawn
    n_stubs, _, sstats, scen = cv2.connectedComponentsWithStats(grown & (1 - drawn), connectivity=8)
    doors = [(float(scen[k][0]), float(scen[k][1])) for k in range(1, n_stubs) if sstats[k, cv2.CC_STAT_AREA] * mpp * mpp >= DOOR_STUB]
    report = {
        "hall_m2": round(float(smooth.sum()) * mpp * mpp),
        "circulation_m2": sum(r.get("a") or 0 for r in rooms if r["u"] in CIRCULATION),
        "seeds": len(seeds),
        "seeds_outside": [n for x, y, n in seeds if not grown[y, x]],
        "open": [f"{n} {use[n]}" for n in open_rooms],
        "doors": len(doors),
        "reaches_margin": reaches_margin,
    }
    return grown, drawn, seeds, open_rooms, doors, report


def slit(mask):
    """The mask with each hole (a core or stair block the hallway rings) cut open to the outside along the shortest
    line. Rings carry no holes, so without the cut the block inside would be walkable. The shortest cut crosses only the
    arm of the hallway between the hole and the outside, never another."""
    import cv2
    mask = mask.copy()
    n, holes, _, _ = cv2.connectedComponentsWithStats(1 - mask, connectivity=4)
    border = set(np.unique(np.concatenate([holes[0], holes[-1], holes[:, 0], holes[:, -1]])).tolist())
    outside = np.isin(holes, list(border))
    if n <= len(border) + 1:
        # no holes
        return mask
    # every pixel's distance to the nearest outside pixel, and which one (labels number the outside pixels).
    dist, labels = cv2.distanceTransformWithLabels((~outside).astype(np.uint8), cv2.DIST_L2, 3, labelType=cv2.DIST_LABEL_PIXEL)
    ys, xs = np.nonzero(outside)
    where = np.zeros((labels.max() + 1, 2), np.int32)
    where[labels[ys, xs]] = np.column_stack([ys, xs])
    for k in range(1, n):
        if k in border:
            continue
        hy, hx = np.nonzero(holes == k)
        i = np.argmin(dist[hy, hx])
        y0, x0 = int(hy[i]), int(hx[i])
        y1, x1 = (int(v) for v in where[labels[y0, x0]])
        # two pixels wide, since a one-pixel diagonal leaves the 8-connected sides joined
        cv2.line(mask, (x0, y0), (x1, y1), 0, 2)
    return mask


def rings_of(mask, f, to_map):
    """Every piece of a mask at least UNCLAIMED_MIN in area, as [lat, lon] rings simplified to 0.25 m; a piece that
    rings a hole is slit open first (see slit)."""
    import cv2
    contours, _ = cv2.findContours(slit(mask), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    rings = []
    for c in contours:
        if cv2.contourArea(c) * f.mpp * f.mpp < UNCLAIMED_MIN:
            continue
        ring_px = cv2.approxPolyDP(c, 0.25 / f.mpp, True)[:, 0, :]
        rings.append([to_ll(to_map(px / TRACE_SCALE, py / TRACE_SCALE)) for px, py in ring_px])
    return rings


def hallways_floor(pdf, to_map, rooms, footprint, current, debug_png):
    """The --hallways keys for one floor, cut to the footprint, and its sanity report. Also writes a debug image with the
    drawing in grey, the room-first corridors and open floor (`current`, the floor's outline file entry) in blue, the
    hallway in orange, seeds as green dots and rooms found open in magenta."""
    import cv2
    f = prepare(pypdfium2.PdfDocument(str(pdf))[0], to_map, footprint)
    px = lambda ring: np.array([f.to_pdf(to_m(*p)) * TRACE_SCALE for p in ring]).round().astype(np.int32)
    use = {r["n"]: r["u"] for r in rooms}
    carve = np.zeros((f.h, f.w), np.uint8)
    for n, ring in current.items():
        if use.get(n) in HALL_TYPES and len(ring) >= 3:
            cv2.fillPoly(carve, [px(ring)], 1)
    hints = []
    for ring in current.get("", []):
        pts = px(ring)
        hints.append(tuple(int(v) for v in pts.mean(axis=0).round()))
    grown, drawn, seeds, open_rooms, doors, report = trace_hallways(f, rooms, carve, hints)
    building = building_shape(footprint)
    out = {"hall": [c for ring in rings_of(grown, f, to_map) if (c := cut_to(building, ring))],
           "~hall": [c for ring in rings_of(drawn, f, to_map) if (c := cut_to(building, ring))],
           "hall-open": open_rooms,
           "hall-doors": [to_ll(to_map(px / TRACE_SCALE, py / TRACE_SCALE)) for px, py in doors]}
    # the debug image, at half the tracing scale
    base = 255 - (255 - f.img) // 2
    img = cv2.cvtColor(base, cv2.COLOR_GRAY2BGR)
    tint = img.copy()
    tint[grown == 1] = (60, 140, 255)
    img = cv2.addWeighted(img, 0.65, tint, 0.35, 0)
    for n, ring in current.items():
        if n == "" or n in ("~", "~open", "!", "hall", "~hall", "hall-open", "hall-doors"):
            continue
        if use.get(n) in CIRCULATION:
            cv2.polylines(img, [px(ring)], True, (200, 90, 0), 3)
    for ring in current.get("", []):
        cv2.polylines(img, [px(ring)], True, (200, 90, 0), 3)
    for ring in out["hall"]:
        cv2.polylines(img, [px(ring)], True, (0, 90, 230), 3)
    for x, y, n in seeds:
        cv2.circle(img, (x, y), 12, (0, 170, 0), -1)
    for x, y in doors:
        cv2.circle(img, (int(x), int(y)), 6, (255, 120, 0), -1)
    at = {r["n"]: r["at"] for r in rooms}
    for n in open_rooms:
        x, y = (f.to_pdf(to_m(*at[n])) * TRACE_SCALE).round().astype(int)
        cv2.circle(img, (int(x), int(y)), 30, (200, 0, 200), 4)
        cv2.putText(img, n, (int(x) + 32, int(y) + 10), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (200, 0, 200), 3)
    debug_png.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(debug_png), cv2.resize(img, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA))
    return out, report


def building_shape(footprint):
    """The building's outline as one shape, or None without a footprint."""
    from shapely.geometry import Polygon
    from shapely.ops import unary_union
    return unary_union([Polygon(ring).buffer(0) for ring in footprint]) if footprint else None


def cut_to(building, ring):
    """The ring cut to the building's outline (its largest piece), or None when nothing is left."""
    from shapely.geometry import Polygon
    # simplified away to a line
    if len(ring) < 3:
        return None
    shape = Polygon(ring).buffer(0)
    if building is None:
        return ring
    piece = shape.intersection(building)
    if piece.is_empty:
        return None
    piece = max(getattr(piece, "geoms", [piece]), key=lambda g: g.area)
    return [[round(x, 8), round(y, 8)] for x, y in piece.exterior.coords] if piece.geom_type == "Polygon" else None


def traced_floor(pdf, to_map, rooms, footprint):
    """One floor's outlines: the footprint-bounded tracing and its unlabelled open floor (key ""), each cut to the
    building's outline itself; plus, for a room the bounding cut off, its unbounded outline (listed under "!" as
    recovered, and not cut) when that is not circulation and overlaps no bounded outline beyond a shared wall."""
    from shapely.geometry import Polygon
    building = building_shape(footprint)
    cut = lambda ring: cut_to(building, ring)
    bounded = trace(pypdfium2.PdfDocument(str(pdf))[0], to_map, rooms, footprint)
    unbounded = trace(pypdfium2.PdfDocument(str(pdf))[0], to_map, rooms, [])
    out = {n: c for n, ring in bounded.items() if n and n not in ("~", "~open") and (c := cut(ring))}
    pairs = [(c, cut(d) or c) for ring, d in zip(bounded[""], bounded["~open"]) if (c := cut(ring))]
    out[""], out["~open"] = [c for c, _ in pairs], [d for _, d in pairs]
    out["~"] = {n: c for n, ring in bounded["~"].items() if n in out and (c := cut(ring))}
    use = {r["n"]: r["u"] for r in rooms}
    kept = [Polygon(ring).buffer(0) for n, ring in out.items() if n and n not in ("~", "~open")]
    out["!"] = []
    for n, ring in unbounded.items():
        if not n or n in ("~", "~open") or n in out or len(ring) < 3 or use.get(n) in CIRCULATION:
            continue
        shape = Polygon(ring).buffer(0)
        if all(shape.intersection(k).area <= SHARED_WALL * min(shape.area, k.area) for k in kept):
            out[n] = ring
            out["!"].append(n)
            kept.append(shape)
    return out

def main():
    """Fits each drawing not fitted yet (all with --again), or with --hallways traces the hallways of fitted floors."""
    OUT.mkdir(parents=True, exist_ok=True)
    index_file = OUT / "index.json"
    index = json.loads(index_file.read_text()) if index_file.exists() else {}
    for pdf in sorted(PDFS.glob("*_*.pdf")):
        ref, floor = pdf.stem.split("_", 1)
        named = [a for a in sys.argv[1:] if not a.startswith("--")]
        hallways = "--hallways" in sys.argv
        fitted = floor in index.get(ref, {})
        if (named and ref not in named and pdf.stem not in named) or not ("--again" in sys.argv or hallways or not fitted):
            continue
        plan_file = PLANS / f"{ref}.json"
        plan = json.loads(plan_file.read_text()) if plan_file.exists() else {"outline": [], "floors": {}}
        rooms = plan["floors"].get(floor, {}).get("rooms", [])
        at = {r["n"]: to_m(*r["at"]) for r in rooms}
        page = pypdfium2.PdfDocument(str(pdf))[0]
        outline_file = OUT / "outlines" / f"{ref}.json"
        if hallways and fitted and "--again" not in sys.argv:
            # rebuild the stored fit from where the drawing's corners landed, with no OCR, and keep the room-first keys
            _, (x0, y0, x1, y1) = drawing_box(page)
            corners = index[ref][floor]["corners"]
            to_map, _ = fit([((x / IMAGE_SCALE, y / IMAGE_SCALE), to_m(*c)) for (x, y), c in zip([(x0, y0), (x1, y0), (x0, y1)], corners)])
            outlines = json.loads(outline_file.read_text()) if outline_file.exists() else {}
            footprint = [r for r in plan["outline"] if len(r) >= 3]
            keys, report = hallways_floor(pdf, to_map, rooms, footprint, outlines.get(floor, {}), OUT / "debug" / f"{pdf.stem}.png")
            outlines.setdefault(floor, {}).update(keys)
            outline_file.write_text(json.dumps(outlines) + "\n")
            ratio = report["hall_m2"] / report["circulation_m2"] if report["circulation_m2"] else float("nan")
            print(f"{ref} floor {floor}: hallway {report['hall_m2']} m² vs {report['circulation_m2']} m² of corridors and lobbies ({ratio:.2f}); "
                  f"{report['seeds']} seeds, {len(report['seeds_outside'])} outside {report['seeds_outside']}; {report['doors']} doors; open rooms {report['open']}"
                  + ("; REACHES MARGIN" if report["reaches_margin"] else ""))
            continue
        labels = read_labels(page)
        pairs = matches(labels, at)
        # a drawing at twice the usual scale (1/8" to the foot) has labels too big to read, so try again at half the scale
        if len(pairs) < MIN_LABELS:
            labels = read_labels(page, OCR_SCALE / 2)
            pairs = matches(labels, at)
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
        outline_file.parent.mkdir(exist_ok=True)
        outlines = json.loads(outline_file.read_text()) if outline_file.exists() else {}
        outlines[floor] = traced_floor(pdf, to_map, rooms, [r for r in plan["outline"] if len(r) >= 3])
        outline_file.write_text(json.dumps(outlines) + "\n")
        print(f"  traced {len(outlines[floor]) - 4} of {len(rooms)} rooms ({len(outlines[floor]['!'])} recovered), {len(outlines[floor][''])} unlabelled open areas")


if __name__ == "__main__":
    main()
