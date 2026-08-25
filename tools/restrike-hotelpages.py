# -*- coding: utf-8 -*-
"""Re-strike the underwrite's own figures inside the hotel-pages pack.

Each written hotel page reads a comparable against the subject, and the subject
column is the underwrite's figure. The comparable's own numbers are never
touched; only the subject column and prose that names Fawley move.

This tool used to hold a hand-written list of old-to-new pairs, pinned to one
version of the record. That is the failure the derived retired-figure list in
`verify.mjs` exists to prevent, in a second place: the list was written for
v16 to v29 and matched nothing at all on the next re-strike, while the gate went
on reporting stale cells.

It is derived now. Every `vNN-figures.json` in `Model/docs` except the live one
is a superseded record; for each figure key the two records share, the old value
maps to the live value. So the mapping is by concept -- revenue a key stays
revenue a key -- and a new version needs no edit here.

    python tools/restrike-hotelpages.py

Writes the staging pack in Research/cohort-2026-08/staging/pages, then re-inline
with tools/inline-hotelpages.py.
"""
import json, os, pathlib, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from restrike_map import (DEAL, DOCS, LIVE_PATH, F, SWAP, AMBIGUOUS, KEY_ROWS,
                          PRICE_ROWS, PPK, PPK_LIVE, KEY_PHRASE, sub_cell,
                          sub_prose)

PAGES = DEAL / "Research" / "cohort-2026-08" / "staging" / "pages"

def walk(o):
    if isinstance(o, dict):
        return {k: walk(v) for k, v in o.items()}
    if isinstance(o, list):
        return [walk(v) for v in o]
    return sub_prose(o)


def main():
    print(f"record {LIVE_PATH.name}: {len(SWAP)} retired figures map onto it")
    for old, news in AMBIGUOUS:
        print(f"  ambiguous, left alone: {old} -> {news}")
    hits = files = keyfix = prose = 0
    for path in sorted(PAGES.glob("*.json")):
        rec = json.loads(path.read_text(encoding="utf-8"))
        moved = False
        for row in rec.get("against", []):
            if len(row) < 3 or not isinstance(row[2], str):
                continue
            before = row[2]
            row[2] = sub_cell(row[2])
            if any(k in str(row[0]).strip().lower() for k in PRICE_ROWS):
                row[2] = PPK.sub(PPK_LIVE, row[2])
            if str(row[0]).strip().lower() in KEY_ROWS and row[2].strip() != F["keys"]:
                if re.fullmatch(r"[\d,]+", row[2].strip()):
                    row[2] = F["keys"]
                    keyfix += 1
            if row[2] != before:
                hits += 1
                moved = True
                print(f"  {path.stem:28s} {str(row[0])[:26]:28s} {before[:34]}  ->  {row[2][:34]}")
        prosed = walk(rec)
        if prosed != rec:
            rec, moved = prosed, True
            prose += 1
        if moved:
            path.write_text(json.dumps(rec, ensure_ascii=False, indent=1), encoding="utf-8")
            files += 1
    print(f"{hits} subject cells re-struck ({keyfix} key counts) and prose moved on "
          f"{prose} pages, across {files} staged files in {PAGES}")

    # anything a rule could not reach is named rather than left silent.
    left = 0
    for path in sorted(PAGES.glob("*.json")):
        rec = json.loads(path.read_text(encoding="utf-8"))
        for row in rec.get("against", []):
            if len(row) < 3 or not isinstance(row[2], str):
                continue
            for old in SWAP:
                if old in row[2] or old.replace("£", "GBP ") in row[2]:
                    print(f"  STILL STALE  {path.stem}/{row[0]}: {row[2][:60]}")
                    left += 1
    print(f"{left} subject cells still carry a retired figure")


if __name__ == "__main__":
    main()
