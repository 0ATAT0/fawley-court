"""Splice src/qs-data.json into index.html between the QS-DATA markers.

Run after tools/parse-qs.py. The page stays a single self-contained file; this
keeps the register block mechanically identical to the parse of the source
markdown, and verify.mjs re-parses that markdown and compares.
"""
import json, os, re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
data = json.load(open(os.path.join(ROOT, "src", "qs-data.json"), encoding="utf-8"))
path = os.path.join(ROOT, "index.html")
html = open(path, encoding="utf-8").read()

block = "/*QS-DATA-START*/\nconst QS = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n/*QS-DATA-END*/"
new = re.sub(r"/\*QS-DATA-START\*/.*?/\*QS-DATA-END\*/", lambda m: block, html, flags=re.S)
if new == html:
    raise SystemExit("markers not found or content unchanged")
open(path, "w", encoding="utf-8", newline="").write(new)
print("spliced", len(block), "bytes")
