"""Splice the comparable-P&L pack into index.html between the PNL-DATA markers.

The pack is Research/comp-pnls/web-data.json in the deal folder, carried whole
and unaltered: per hotel the evidence class, currency, every P&L line in native
and sterling, margins, per-key figures, dials and the calibration log. The page
formats it; nothing here re-derives a figure. A copy is kept at
src/pnl-data.json so the repository can be rebuilt without the deal folder, and
verify.mjs compares the page block against the deal folder's own file.

    python tools/inline-pnl.py     # then: node verify.mjs
"""
import json, os, re, shutil

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DEAL = os.environ.get(
    "FAWLEY_DEAL_ROOT",
    r"D:\OneDrive - Strand Labs\2. Clients\Align\2. Live Deals\Fawley Court")
SRC = os.path.join(DEAL, "Research", "comp-pnls", "web-data.json")

data = json.load(open(SRC, encoding="utf-8"))
cache = os.path.join(ROOT, "src", "pnl-data.json")
shutil.copyfile(SRC, cache)

path = os.path.join(ROOT, "index.html")
html = open(path, encoding="utf-8").read()
block = ("/*PNL-DATA-START*/\nconst PNL = "
         + json.dumps(data, ensure_ascii=False, separators=(",", ":"))
         + ";\n/*PNL-DATA-END*/")
new = re.sub(r"/\*PNL-DATA-START\*/.*?/\*PNL-DATA-END\*/", lambda m: block, html, flags=re.S)
if new == html:
    raise SystemExit("markers not found or content unchanged")
open(path, "w", encoding="utf-8", newline="").write(new)
print("spliced", len(block), "bytes ·", len(data["hotels"]), "hotels")
