#!/usr/bin/env python3
"""Splice the measured figure record into index.html between the MODEL-DATA
markers, and cache a copy at src/model-figures.json.

The record is Model/docs/v29-figures.json — every figure the portal prints on
the v16 basis, as struck on the model, with its raw value and its provenance.
This tool only carries it in; verify.mjs checks the shipped block equals the
source leaf for leaf and that no model-figure surface prints a figure that
is not in it.

    python tools/inline-model.py [--deal <path to the deal folder>]
"""
import argparse, json, os, pathlib, sys

DEFAULT_DEAL = r"D:\OneDrive - Strand Labs\2. Clients\Align\2. Live Deals\Fawley Court"
ap = argparse.ArgumentParser()
ap.add_argument("--deal", default=os.environ.get("FAWLEY_DEAL_ROOT", DEFAULT_DEAL))
args = ap.parse_args()

src = pathlib.Path(args.deal) / "Model" / "docs" / "v29-figures.json"
if not src.exists():
    sys.exit(f"figure record not found: {src}")

data = json.loads(src.read_text(encoding="utf-8"))
here = pathlib.Path(__file__).resolve().parent.parent
(here / "src").mkdir(exist_ok=True)
(here / "src" / "model-figures.json").write_text(
    json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")

page = (here / "index.html").read_text(encoding="utf-8")
A, B = "/*MODEL-DATA-START*/", "/*MODEL-DATA-END*/"
i, j = page.find(A), page.find(B)
if i < 0 or j < 0:
    sys.exit("the MODEL-DATA markers are not in index.html")

block = A + "\nconst MODEL = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
page = page[:i] + block + page[j:]
(here / "index.html").write_text(page, encoding="utf-8")

print(f"spliced {len(data['fig'])} figures, {len(data['ladder'])} ladder rungs, "
      f"{len(data['bridge'])} bridge rungs into index.html")
print(f"  {data['fig']['irr']} / {data['fig']['em']} at {data['fig']['entry']} · "
      f"model {data['meta']['model']}")
