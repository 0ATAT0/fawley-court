"""Build the estate CGI set from the originals.

    python tools/build-cgi.py [--check]

The originals are generated images and they arrive in three shapes — 3:2, 4:3 and
16:9. A grid of mixed shapes either letterboxes or crops in the browser, and both
read as a mistake, so the crop is made here, once, deliberately, and the published
file is already the shape the page wants.

Every image is published at 3:2 at the largest width its original supports, so
nothing is upscaled and nothing is downscaled further than the crop requires. The
originals top out at 1536px wide; that is the ceiling on this set and no export
setting will raise it.

Writes img/cgi/<key>-<n>.jpg, its -t thumb, and src/cgi-manifest.json.
"""
import io, json, os, sys
from PIL import Image

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEAL = r"D:\OneDrive - Strand Labs\2. Clients\Align\2. Live Deals\Fawley Court"
SRC = os.path.join(DEAL, "CGIs")
OUT = os.path.join(HERE, "img", "cgi")
MANIFEST = os.path.join(HERE, "src", "cgi-manifest.json")

RATIO = 3 / 2
THUMB_W = 640
QUALITY = 88

# the folder each area draws from, and the label the page prints
AREAS = [
    ("hall",       "The Main House",   "Hall"),
    ("courtyard",  "The Courtyards",   "Courtyard"),
    ("riding",     "The Riding School", "Riding"),
    ("spa",        "The Spa",          "Spa"),
    ("riverclub",  "The River Club",   "River Club"),
    ("residences", "The Residences",   "Residences"),
]


def trim_bands(im):
    """Strip any letterbox the generator baked into the original.

    Two of the seventeen arrived with a flat dark band along one edge. Left in,
    they print as a grey stripe across the top or bottom of a card and read as a
    broken image. A band is a run of edge rows that are both dark and flat.
    """
    import statistics as st
    w, h = im.size
    px = im.load()
    def run(rows):
        n = 0
        for y in rows:
            vals = [sum(px[x, y]) / 3 for x in range(0, w, max(1, w // 40))]
            if st.pstdev(vals) < 6 and st.mean(vals) < 70:
                n += 1
            else:
                break
        return n
    top = run(range(h))
    bot = run(range(h - 1, -1, -1))
    if top < 8 and bot < 8:
        return im, 0, 0
    return im.crop((0, top, w, h - bot)), top, bot


def crop_to_ratio(im):
    """Centre-crop to 3:2, taking the excess off whichever axis is long.

    On a taller-than-3:2 original the excess comes off the bottom weighted 1:2,
    because these are buildings under sky: the foreground is the expendable half.
    """
    w, h = im.size
    # exactly 3:2 by construction, so the published set has one shape and no
    # rounding drift: the largest k with 3k <= w and 2k <= h
    k = min(w // 3, h // 2)
    nw, nh = 3 * k, 2 * k
    x = (w - nw) // 2                       # centred left to right
    y = (h - nh) // 3                       # buildings under sky: lose the foreground
    if (nw, nh) == (w, h):
        return im, "none"
    return im.crop((x, y, x + nw, y + nh)), "%dx%d -> %dx%d" % (w, h, nw, nh)


def main():
    check = "--check" in sys.argv
    if not os.path.isdir(SRC):
        sys.exit("the originals are not at %s" % SRC)
    os.makedirs(OUT, exist_ok=True)
    areas, total_bytes, n = [], 0, 0
    for key, label, folder in AREAS:
        d = os.path.join(SRC, folder)
        if not os.path.isdir(d):
            sys.exit("no folder for %s at %s" % (key, d))
        files = sorted(f for f in os.listdir(d) if f.lower().endswith((".png", ".jpg", ".jpeg")))
        if not files:
            sys.exit("no images for %s" % key)
        imgs = []
        for i, f in enumerate(files, 1):
            im = Image.open(os.path.join(d, f)).convert("RGB")
            before = im.size
            im, tb, bb = trim_bands(im)
            if tb or bb:
                print("      trimmed a baked-in band: %d top, %d bottom" % (tb, bb))
            im, how = crop_to_ratio(im)
            w, h = im.size
            full = "img/cgi/%s-%d.jpg" % (key, i)
            thumb = "img/cgi/%s-%d-t.jpg" % (key, i)
            if not check:
                im.save(os.path.join(HERE, full), "JPEG", quality=QUALITY,
                        optimize=True, progressive=True)
                t = im.resize((THUMB_W, int(round(THUMB_W / RATIO))), Image.Resampling.LANCZOS)
                t.save(os.path.join(HERE, thumb), "JPEG", quality=QUALITY,
                       optimize=True, progressive=True)
            b = os.path.getsize(os.path.join(HERE, full)) if not check else 0
            total_bytes += b
            n += 1
            imgs.append({"full": full, "thumb": thumb, "w": w, "h": h, "bytes": b, "src": f})
            print("  %-12s %-2d %sx%s -> %sx%s  crop %s" % (key, i, before[0], before[1], w, h, how))
        areas.append({"key": key, "label": label, "images": imgs})

    ratios = {round(im["w"] / im["h"], 3) for a in areas for im in a["images"]}
    assert ratios == {1.5}, "not every image published at 3:2: %s" % sorted(ratios)
    widths = sorted({im["w"] for a in areas for im in a["images"]})

    if not check:
        io.open(MANIFEST, "w", encoding="utf-8").write(json.dumps(
            {"meta": {"source": "Fawley Court/CGIs", "count": n, "ratio": "3:2",
                      "widths": widths, "generated": "2026-08-19"},
             "areas": areas}, indent=1))
    print("\n%d images, every one 3:2, widths %s, %.2fMB" % (n, widths, total_bytes / 1e6))


if __name__ == "__main__":
    main()
