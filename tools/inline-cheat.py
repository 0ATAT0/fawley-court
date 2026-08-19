#!/usr/bin/env python3
"""Splice the cheat-sheet pack into index.html between the CHEAT-DATA markers,
and cache a copy at src/cheat-data.json.

The pack is built from the model's own Cheat Sheet tab by the deal-side builder,
which reads every printed value as the sheet renders it and takes every note
from the sheet's own off-page register. This tool only carries it in;
verify.mjs checks the shipped block equals the source leaf for leaf.

    python tools/inline-cheat.py [--deal <path to the deal folder>]
"""
import argparse, json, os, pathlib, sys

DEFAULT_DEAL = r"D:\OneDrive - Strand Labs\2. Clients\Align\2. Live Deals\Fawley Court"
ap = argparse.ArgumentParser()
ap.add_argument("--deal", default=os.environ.get("FAWLEY_DEAL_ROOT", DEFAULT_DEAL))
args = ap.parse_args()

src = pathlib.Path(args.deal) / "Model" / "docs" / "cheat-web-data.json"
if not src.exists():
    sys.exit(f"cheat pack not found: {src}")

data = json.loads(src.read_text(encoding="utf-8"))
here = pathlib.Path(__file__).resolve().parent.parent
(here / "src").mkdir(exist_ok=True)
(here / "src" / "cheat-data.json").write_text(
    json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")

page = (here / "index.html").read_text(encoding="utf-8")
A, B = "/*CHEAT-DATA-START*/", "/*CHEAT-DATA-END*/"
i, j = page.find(A), page.find(B)
if i < 0 or j < 0:
    sys.exit("the CHEAT-DATA markers are not in index.html")

block = A + "\nconst CHEAT = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
page = page[:i] + block + page[j:]
(here / "index.html").write_text(page, encoding="utf-8")

print(f"spliced the cheat sheet: {len(data['kpis'])} hero figures, "
      f"{len(data['operating']['rows'])} P&L rows, {len(data['cashflow']['rows'])} cash-flow rows, "
      f"{len(data['watchpoints'])} watchpoints, off {data['pack']['source']}")
