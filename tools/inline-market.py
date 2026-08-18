#!/usr/bin/env python3
"""Splice the ultra-luxury market pack into index.html between the MARKET-DATA
markers, and cache a copy at src/market-data.json.

The pack is built deal-side by Research/cohort-2026-08/build_market_pack.py from
the collected rate series; this tool only carries it in. Run it, then
`node verify.mjs`, which checks the shipped block equals the source leaf for leaf.

    python tools/inline-market.py [--deal <path to the deal folder>]
"""
import argparse, json, os, pathlib, sys

DEFAULT_DEAL = r"D:\OneDrive - Strand Labs\2. Clients\Align\2. Live Deals\Fawley Court"
ap = argparse.ArgumentParser()
ap.add_argument("--deal", default=os.environ.get("FAWLEY_DEAL_ROOT", DEFAULT_DEAL))
args = ap.parse_args()

src = pathlib.Path(args.deal) / "Research" / "cohort-2026-08" / "market-web-data.json"
if not src.exists():
    sys.exit("market pack not found: %s" % src)

data = json.loads(src.read_text(encoding="utf-8"))
here = pathlib.Path(__file__).resolve().parent.parent
(here / "src").mkdir(exist_ok=True)
(here / "src" / "market-data.json").write_text(
    json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")

page = (here / "index.html").read_text(encoding="utf-8")
A, B = "/*MARKET-DATA-START*/", "/*MARKET-DATA-END*/"
i, j = page.find(A), page.find(B)
if i < 0 or j < 0:
    sys.exit("the MARKET-DATA markers are not in index.html")

blob = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
page = page[:i] + A + "\nconst MARKET = " + blob + ";\n" + page[j:]
(here / "index.html").write_text(page, encoding="utf-8")

h = data["hotels"]
print("spliced %d hotels (%s bytes) into index.html" % (len(h), format(len(blob), ",")))
print("  UK %d - Europe %d - credible annual series %d - year-round %d" % (
    sum(1 for x in h if x["country"] == "UK"),
    sum(1 for x in h if x["country"] != "UK"),
    sum(1 for x in h if x.get("credible_annual_series")),
    sum(1 for x in h if x.get("year_round"))))
