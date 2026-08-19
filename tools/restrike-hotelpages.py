# -*- coding: utf-8 -*-
"""Re-strike the underwrite's own figures inside the hotel-pages pack.

Each written hotel page reads a comparable against the subject, and the subject
column is the underwrite's figure. Twenty of those cells were cut on v16 and
were still printing the earlier revenue, margin and capital cost beside
thirty-four comparables. The comparable's own numbers are untouched; only the
subject column moves.

    python tools/restrike-hotelpages.py

Writes the pack in Research/cohort-2026-08/, then re-inline with
tools/inline-hotelpages.py.
"""
import json, os, pathlib, re

DEAL = pathlib.Path(os.environ.get(
    "FAWLEY_DEAL_ROOT",
    r"D:\OneDrive - Strand Labs\2. Clients\Align\2. Live Deals\Fawley Court"))
PAGES = DEAL / "Research" / "cohort-2026-08" / "staging" / "pages"
REC = json.loads((DEAL / "Model" / "docs" / "v29-figures.json").read_text(encoding="utf-8"))
F = REC["fig"]

# the subject figures, old to new
SWAP = [
    ("£45.33m", F["rev_y7"]),
    ("£15.39m", F["gop_y7"]),
    ("£123.6m", F["capex_hotel"]),
    ("£194.2m", F["cost_to_open"]),
    ("£248.0m", F["exit_value"]),
    ("£109.8m", F["peak_equity"]),
    ("33.96%", F["gop_margin_y7"]),
    ("12.99%", F["irr"]),
    ("£2.06m", F["capex_hotel_per_key"]),
    ("£756k", F["rev_per_key_y7"]),
    ("£785,630 · ", F["rev_per_key_y7"] + " · "),   # an earlier pass wrote the long form
    ("v16 hotel works", "hotel works"),
    # some cells write the currency as GBP rather than a symbol
    ("GBP 2.06m", "GBP " + F["capex_hotel_per_key"].replace("£", "")),
    ("GBP 123.6m", "GBP " + F["capex_hotel"].replace("£", "")),
    ("GBP 45.33m", "GBP " + F["rev_y7"].replace("£", "")),
    ("GBP 15.39m", "GBP " + F["gop_y7"].replace("£", "")),
    ("GBP 194.2m", "GBP " + F["cost_to_open"].replace("£", "")),
    ("GBP 756,000", "GBP " + F["rev_per_key_y7"].replace("£", "")),
    ("GBP 756k", "GBP " + F["rev_per_key_y7"].replace("£", "")),
]


# The written prose names the subject too. Only phrases that name Fawley are
# touched, so a comparable's own figure can never be rewritten by accident.
PROSE_SWAP = [
    ("Fawley's 33.96% GOP", "Fawley's {gop}" + " GOP"),
    ("Fawley Court's 33.96% GOP", "Fawley Court's {gop}" + " GOP"),
    ("Fawley's £756k Year 7 revenue a key", "Fawley's {rk} Year 7 revenue a key"),
    ("Fawley's £756k", "Fawley's {rk}"),
    ("Fawley's £1,000 underwriting figure", "Fawley's £1,000 underwriting figure"),
    ("Year 7 revenue a key or 33.96% GOP", "Year 7 revenue a key or {gop} GOP"),
    ("Fawley's underwritten 33.96% GOP", "Fawley's underwritten {gop} GOP"),
    ("against Fawley's underwritten £756k", "against Fawley's underwritten {rk}"),
]


def swap_prose(v):
    if not isinstance(v, str) or "Fawley" not in v:
        return v
    for old, new in PROSE_SWAP:
        v = v.replace(old, new.format(gop=F["gop_margin_y7"], rk=F["rev_per_key_y7"]))
    return v


def walk(o):
    if isinstance(o, dict):
        return {k: walk(x) for k, x in o.items()}
    if isinstance(o, list):
        return [walk(x) for x in o]
    return swap_prose(o)


def main():
    """The assembled pack is rebuilt from these staging files every time the
    inline tool runs, so the subject figures have to be corrected here."""
    hits = files = 0
    for path in sorted(PAGES.glob("*.json")):
        rec = json.loads(path.read_text(encoding="utf-8"))
        moved = False
        for row in rec.get("against", []):
            if len(row) < 3 or not isinstance(row[2], str):
                continue
            before = row[2]
            for old, new in SWAP:
                row[2] = row[2].replace(old, new)
            if row[2] != before:
                hits += 1
                moved = True
                print(f"  {path.stem:28s} {str(row[0])[:30]:32s} {before[:40]}  ->  {row[2][:40]}")
        prosed = walk(rec)
        if prosed != rec:
            moved = True
            rec = prosed
        if moved:
            path.write_text(json.dumps(rec, ensure_ascii=False, indent=1), encoding="utf-8")
            files += 1
    print(f"{hits} subject cells re-struck across {files} staged pages in {PAGES}")


if __name__ == "__main__":
    main()
