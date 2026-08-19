# -*- coding: utf-8 -*-
"""Take the version label off the rendered surfaces and derive it from the record.

Two surfaces printed "Financial Model v16" as a literal — the cheat sheet's
footer band and the dial pane's heading — and the retired-figure check could not
see them, because a version label is not a figure. They now read the model name
out of the record the build was struck against.

    python tools/derive-model-name.py
"""
import pathlib, re

HERE = pathlib.Path(__file__).resolve().parent.parent
IDX = HERE / "index.html"

HELPER = (
    "/* The model this build was struck on, taken from the record rather than typed, so a\n"
    "   re-strike cannot leave a version label behind on a rendered surface. */\n"
    'const MODEL_NAME = MODEL.meta.model.replace(/^.*?-\\s*/, "").replace(/\\.xlsx$/i, "");\n'
)
ANCHOR = "const $ = s => document.querySelector(s);"

SUBS = [
    ("'<span>Financial Model v16 · the ruled £50m</span>",
     "'<span>' + MODEL_NAME + ' · the ruled £50m</span>"),
    ('\'<p class="pane-h">The underwrite · Financial Model v16 at the ruled £50m</p>\'',
     '\'<p class="pane-h">The underwrite · \' + MODEL_NAME + \' at the ruled £50m</p>\''),
]


def main():
    s = IDX.read_text(encoding="utf-8")
    if "const MODEL_NAME =" not in s:
        assert s.count(ANCHOR) == 1
        s = s.replace(ANCHOR, HELPER + ANCHOR, 1)
        print("  ok  the model name is derived from the record")
    for old, new in SUBS:
        n = s.count(old)
        if not n:
            print(f"  --  already done: {old[:52]}")
            continue
        assert n == 1, f"{n} hits: {old[:60]}"
        s = s.replace(old, new)
        print(f"  ok  {old[:58]}")

    # the comment above the cheat block describes a source that no longer applies
    s = re.sub(r"its own render \(Fawley Court - v16 Cheat Sheet \(working\)\.pdf, built 17 Aug 2026\s*\n\s*from Financial Model v16\)\. No workbook was opened and nothing is recomputed here\.",
               "the workbook's own Cheat Sheet tab, read by Model/docs/build-cheat-data.py:\n"
               "   every printed value as the sheet renders it, every note from its own register.",
               s)
    IDX.write_text(s, encoding="utf-8")
    left = s.count("Financial Model v16")
    print(f'"Financial Model v16" left in the page: {left}')


if __name__ == "__main__":
    main()
