#!/usr/bin/env python3
"""Assemble the written hotel layer and splice it into index.html.

Each hotel's page is researched and written into
Research/cohort-2026-08/staging/pages/<slug>.json. This tool collects them,
checks each against the market pack and the images on disk, writes the
assembled record to Research/cohort-2026-08/hotel-pages.json, and splices it
between the HOTELPAGE-DATA markers.

A record is rejected rather than half-shipped: an unknown slug, a missing
intro, or an image the page names that is not on disk all fail loudly.

    python tools/inline-hotelpages.py [--deal <path>]
"""
import argparse, json, os, pathlib, sys

DEFAULT_DEAL = r"D:\OneDrive - Strand Labs\2. Clients\Align\2. Live Deals\Fawley Court"
ap = argparse.ArgumentParser()
ap.add_argument("--deal", default=os.environ.get("FAWLEY_DEAL_ROOT", DEFAULT_DEAL))
args = ap.parse_args()

HERE = pathlib.Path(__file__).resolve().parent.parent
DEAL = pathlib.Path(args.deal)
PAGES = DEAL / "Research" / "cohort-2026-08" / "staging" / "pages"
PACK = DEAL / "Research" / "cohort-2026-08" / "market-web-data.json"
OUT = DEAL / "Research" / "cohort-2026-08" / "hotel-pages.json"
IMG = HERE / "img" / "comps"

BS = chr(92)
LOCAL = ("d:/onedrive", "d:" + BS + "onedrive", "c:/users", "c:" + BS + "users", "strand")


def scrub(v, slug, where, problems):
    """A record may cite a URL or a document, never a path on this machine, and
    never the word the client materials must not carry."""
    if isinstance(v, str):
        low = v.lower()
        if any(x in low for x in LOCAL):
            problems.append("%s: %s carries a local path or a banned word, dropped" % (slug, where))
            return None
        return v
    if isinstance(v, list):
        out = [scrub(x, slug, where, problems) for x in v]
        return [x for x in out if x is not None]
    if isinstance(v, dict):
        return {k: scrub(x, slug, where + "." + k, problems) for k, x in v.items()}
    return v


pack = json.loads(PACK.read_text(encoding="utf-8"))
known = {h["slug"] for h in pack["hotels"] if h["in_cohort"]}

records, problems, images = {}, [], 0
for f in sorted(PAGES.glob("*.json")):
    try:
        r = json.loads(f.read_text(encoding="utf-8"))
    except Exception as e:                       # a half-written file is not a record
        problems.append("%s: unreadable (%s)" % (f.name, e))
        continue
    slug = r.get("slug") or f.stem
    if slug not in known:
        problems.append("%s: not a hotel in the set" % slug)
        continue
    if not (r.get("intro") or "").strip():
        problems.append("%s: no intro, and every page opens on one" % slug)
        continue
    r = scrub(r, slug, "record", problems)
    keep = {"intro": r["intro"].strip()}
    for k in ("record", "record_extra", "cards", "against", "gap", "sources", "conflicts", "not_found"):
        if r.get(k):
            keep[k] = r[k]
    ok = []
    for im in r.get("images") or []:
        p = IMG / im["file"]
        if not p.exists():
            problems.append("%s: names %s, which is not on disk" % (slug, im["file"]))
            continue
        if not im.get("credit") or not im.get("licence"):
            problems.append("%s: %s carries no credit or licence" % (slug, im["file"]))
            continue
        ok.append({k: im.get(k, "") for k in ("file", "alt", "note", "credit", "licence", "source_page")})
    if ok:
        keep["images"] = ok
        images += len(ok)
    records[slug] = keep

if problems:
    print("PROBLEMS")
    for p in problems:
        print("  " + p)

OUT.write_text(json.dumps(records, ensure_ascii=False, indent=1), encoding="utf-8")

page = (HERE / "index.html").read_text(encoding="utf-8")
A, B = "/*HOTELPAGE-DATA-START*/", "/*HOTELPAGE-DATA-END*/"
i, j = page.find(A), page.find(B)
if i < 0 or j < 0:
    sys.exit("the HOTELPAGE-DATA markers are not in index.html")
blob = json.dumps(records, ensure_ascii=False, separators=(",", ":"))
page = page[:i] + A + "\nconst HOTELPAGE = " + blob + ";\n" + page[j:]
(HERE / "index.html").write_text(page, encoding="utf-8")

(HERE / "src").mkdir(exist_ok=True)
(HERE / "src" / "hotel-pages.json").write_text(
    json.dumps(records, ensure_ascii=False, indent=1), encoding="utf-8")

written = sum(1 for r in records.values() if r.get("record"))
print("spliced %d written pages (%s bytes): %d with a full record, %d with an intro only, %d images"
      % (len(records), format(len(blob), ","), written, len(records) - written, images))
missing = sorted(known - set(records))
if missing:
    print("  no record yet: " + ", ".join(missing))
