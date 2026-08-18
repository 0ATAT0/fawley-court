#!/usr/bin/env python3
"""Build the comparable-hotel photography manifest and splice it into index.html.

The images live in img/comps/<slug>.jpg and their provenance in
img/comps/credits.json — one record a photograph, carrying the page it came
from, who took it, under what licence and when it was collected. This tool
checks every record against the file on disk, drops any record whose image is
missing, and writes the manifest between the PHOTOS-DATA markers.

    python tools/inline-photos.py
"""
import json, pathlib, sys

HERE = pathlib.Path(__file__).resolve().parent.parent
IMG = HERE / "img" / "comps"
SRC = IMG / "credits.json"

BASIS = ("Each photograph is the hotel's own or a Creative Commons image, collected from the "
         "page named on that property's own page here, with its credit and licence. Rights for "
         "onward publication are not cleared: this is a private portal and the photographs are "
         "here to identify the property, not to be republished.")

if not SRC.exists():
    sys.exit("no credits file: %s" % SRC)

recs = json.loads(SRC.read_text(encoding="utf-8"))
out, dropped = {}, []
for r in recs:
    f = IMG / (r["slug"] + ".jpg")
    if not r.get("saved") or not f.exists():
        dropped.append(r["slug"])
        continue
    out[r["slug"]] = {"file": r["slug"] + ".jpg", "credit": r["credit"],
                      "licence": r["licence"], "source": r["source_page"],
                      "note": (r.get("note") or "").strip()}

page = (HERE / "index.html").read_text(encoding="utf-8")
A, B = "/*PHOTOS-DATA-START*/", "/*PHOTOS-DATA-END*/"
i, j = page.find(A), page.find(B)
if i < 0 or j < 0:
    sys.exit("the PHOTOS-DATA markers are not in index.html")
blob = ("\nconst PHOTOS = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n"
        + "const PHOTOS_BASIS = " + json.dumps(BASIS, ensure_ascii=False) + ";\n")
page = page[:i] + A + blob + page[j:]
(HERE / "index.html").write_text(page, encoding="utf-8")

(HERE / "src").mkdir(exist_ok=True)
(HERE / "src" / "photos.json").write_text(
    json.dumps({"basis": BASIS, "photos": out}, ensure_ascii=False, indent=1), encoding="utf-8")

print("spliced %d photographs" % len(out))
if dropped:
    print("  no image on disk, dropped: " + ", ".join(sorted(dropped)))
