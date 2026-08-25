# -*- coding: utf-8 -*-
"""Re-strike the underwrite's own figures inside the page's case plates.

The ten written case studies each set a comparable against the subject, in rows
of [what, the comparable, ours]. Only the third cell is ours, and only it is
touched; the comparable's own numbers are never rewritten. The map comes from
`restrike_map`, so it is derived from the records rather than typed.

    python tools/restrike-cases.py

Run it before `node verify.mjs`, which fails on any retired figure that survives
on a model-figure surface, the case plates included.
"""
import os, pathlib, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from restrike_map import F, SWAP, sub_cell, sub_prose

IDX = pathlib.Path(__file__).resolve().parent.parent / "index.html"
Q = r"'(?:[^']|'(?=[a-z]))*'"
# A row is [what, the comparable, ours] and sometimes carries a fourth cell
# reading the difference. Ours is always the third.
ROW = re.compile(r"\[(" + Q + r"), (" + Q + r"), (" + Q + r")(, " + Q + r")?\]")

# The 60-key composition is spelled out on one plate. Twelve of the seventy-two
# are the mirror wing and the three at ground floor in the existing wing, which
# is what the schedule prices, so the sentence says so.
COMPOSITION = {
    "'60: 17 Main House, 43 Stables and Courtyard'":
        "'%s: 17 Main House, 43 Stables and Courtyard, 12 in the mirror and existing wings'"
        % F["keys"],
}


def main():
    s = IDX.read_text(encoding="utf-8")
    a = s.index("const CASES = [")
    b = s.index("const BY_SLUG", a)
    span, moved = s[a:b], []

    def one(m):
        label, comp, subj, tail = m.group(1), m.group(2), m.group(3), m.group(4) or ""
        before = subj
        if subj in COMPOSITION:
            subj = COMPOSITION[subj]
        else:
            inner = subj[1:-1]
            out = sub_cell(inner)
            if label.strip("'").strip().lower() in ("keys", "key count") \
                    and re.fullmatch(r"[\d,]+", out.strip()):
                out = F["keys"]
            subj = "'" + out + "'"
        if subj != before:
            moved.append((label.strip("'"), before, subj))
        return "[%s, %s, %s%s]" % (label, comp, subj, tail)

    span = ROW.sub(one, span)

    # The reading cards name the subject in prose as well. Only a figure a
    # possessive hands to Fawley moves; a comparable's own number in the same
    # sentence is left alone.
    def prose(m):
        out = sub_prose(m.group(0))
        if out != m.group(0):
            moved.append(("card prose", m.group(0)[:40], out[:40]))
        return out
    span = re.sub(r"'(?:[^']|'(?=[a-z]))*'", prose, span)
    IDX.write_text(s[:a] + span + s[b:], encoding="utf-8")
    for label, before, after in moved:
        print("  %-16s %-42s -> %s" % (label[:16], before[:42], after[:52]))
    print("%d case-plate subject cells re-struck onto %s" % (len(moved), F["keys"] + " keys"))

    left = [t for t in SWAP if t in span]
    if left:
        print("  still carrying a retired figure: " + ", ".join(sorted(left)))


if __name__ == "__main__":
    main()
