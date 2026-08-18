#!/usr/bin/env python3
"""Splice the capital-cost pack into index.html between the CAPEX-DATA markers,
and cache a copy at src/capex-data.json.

The pack is built from the model's own Capex tab by the deal-side builder; this
tool only carries it in. Run it, then `node verify.mjs`, which checks the
shipped block equals the source leaf for leaf.

    python tools/inline-capex.py [--deal <path to the deal folder>]
"""
import argparse, json, os, pathlib, sys

DEFAULT_DEAL = r"D:\OneDrive - Strand Labs\2. Clients\Align\2. Live Deals\Fawley Court"
ap = argparse.ArgumentParser()
ap.add_argument("--deal", default=os.environ.get("FAWLEY_DEAL_ROOT", DEFAULT_DEAL))
args = ap.parse_args()

src = pathlib.Path(args.deal) / "Model" / "capex" / "capex-web-data.json"
if not src.exists():
    sys.exit(f"capex pack not found: {src}")

data = json.loads(src.read_text(encoding="utf-8"))
here = pathlib.Path(__file__).resolve().parent.parent
(here / "src").mkdir(exist_ok=True)
(here / "src" / "capex-data.json").write_text(
    json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")

page = (here / "index.html").read_text(encoding="utf-8")
A, B = "/*CAPEX-DATA-START*/", "/*CAPEX-DATA-END*/"
i, j = page.find(A), page.find(B)
if i < 0 or j < 0:
    sys.exit("the CAPEX-DATA markers are not in index.html")

block = A + "\nconst CAPEX = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
page = page[:i] + block + page[j:]
(here / "index.html").write_text(page, encoding="utf-8")

n_lines = len(data["lines"])
print(f"spliced {n_lines} capex lines "
      f"({len(json.dumps(data, ensure_ascii=False, separators=(',', ':'))):,} bytes) into index.html")
print(f"  hotel {data['summary']['hotel']['total']:,.0f} · resi {data['summary']['resi']['total']:,.0f} "
      f"· works {data['summary']['works_total']:,.0f}")
