# -*- coding: utf-8 -*-
"""The tail of the re-strike: the prose the gate found, and the last two
places the gate still named the previous record.

Everything here was surfaced by running `node verify.mjs` after the chapters
were rewritten — the retired-figure check and the unregistered-figure check
between them named each one.

    python tools/restrike-tail.py
"""
import json, os, pathlib

HERE = pathlib.Path(__file__).resolve().parent.parent
DEAL = pathlib.Path(os.environ.get(
    "FAWLEY_DEAL_ROOT",
    r"D:\OneDrive - Strand Labs\2. Clients\Align\2. Live Deals\Fawley Court"))
IDX = HERE / "index.html"
V = HERE / "verify.mjs"
REC = json.loads((DEAL / "Model" / "docs" / "v29-figures.json").read_text(encoding="utf-8"))
F, S, X = REC["fig"], REC["sens"], REC["extra"]
BS = REC["backsolve"]

p2 = lambda k: f"{S[k]['irr']*100:.2f}%"

PAGE = [
    # chapter 02, the counterparty view
    ("Align has ruled the price at £50m, at which the underwrite returns 12.99%.",
     f"Align has ruled the price at {F['entry']}, at which the underwrite returns {F['irr']}.", 1),

    # chapter 03, the two views that read the subject against the comparables
    ('["subject",["Fawley Court — underwritten","<span class=\'emph\'>33.96%</span>","GOP margin, year 7"]]',
     f'["subject",["Fawley Court — underwritten","<span class=\'emph\'>{F["gop_margin_y7"]}</span>",'
     f'"GOP margin, year 7"]]', 1),
    ('"<span class=\'emph\'>£3.24m</span>","£194.2m: the above plus entry',
     f'"<span class=\'emph\'>{F["cost_to_open_key"]}</span>","{F["cost_to_open"]}: the above plus entry', 1),

    # chapter 08, the gates and the closing statement
    ("worth (1.71)pp as an asset sale; the Q26 refinancing draws £116.9m against the £111.9m of "
     "senior it retires",
     f"worth ({abs(S['asset_sale']['d_pp']):.2f})pp as an asset sale; the Q{F['fin_refi_q']} "
     f"refinancing draws {F['refi_draw']} against the {F['senior_peak']} of senior it retires", 1),
    ("GOP at 28–31% returns 4.62–9.22%, against 12.99%",
     f"A staffing index of 1.30 returns {p2('staff_130')} and 1.00 returns {p2('staff_100')}, "
     f"against {F['irr']}", 1),
    ("and a 13.00% return solves at £49.97m.",
     f"and a 13.00% return solves at {BS['0.13']['fig']}, above it.", 1),
    ('figure: "12.99% at £50m"', f'figure: "{F["irr"]} at {F["entry"]}"', None),

    # the case plates: revenue a key, and the club terms
    ("£756k · ", f"{F['rev_per_key_y7']} · ", None),
    ("150 founder memberships at £7,500, then £3,500",
     f"{F['members']} members at {F['member_fee']} a month, {F['founder_cap']} founders at "
     f"{F['founder_fee']}", None),
]

GATE = [
    ('if (JSON.stringify(mod.V16) !== JSON.stringify(modelSrc))\n'
     '  fail("V16 BLOCK OUT OF DATE", "the V16 block in index.html is not the record in Model/docs — run tools/inline-v16.py");',
     'if (JSON.stringify(mod.MODEL) !== JSON.stringify(modelSrc))\n'
     '  fail("MODEL BLOCK OUT OF DATE", "the MODEL block in index.html is not the record in Model/docs — run tools/inline-model.py");\n'
     'checked++;\n'
     'if (JSON.stringify(mod.CHEAT) !== JSON.stringify(cheatSrc))\n'
     '  fail("CHEAT BLOCK OUT OF DATE", "the CHEAT block in index.html is not the pack in Model/docs — run tools/inline-cheat.py");'),

    ('for (const [a, b] of [["/*V16-DATA-START*/", "/*V16-DATA-END*/"],',
     'for (const [a, b] of [["/*MODEL-DATA-START*/", "/*MODEL-DATA-END*/"],\n'
     '                      ["/*CHEAT-DATA-START*/", "/*CHEAT-DATA-END*/"],'),
]


def main():
    s = IDX.read_text(encoding="utf-8")
    for old, new, want in PAGE:
        n = s.count(old)
        assert n and (want is None or n == want), f"{n} hits for: {old[:70]}"
        s = s.replace(old, new)
        print(f"  page x{n}  {old[:62]}")
    IDX.write_text(s, encoding="utf-8")

    g = V.read_text(encoding="utf-8")
    for old, new in GATE:
        assert g.count(old) == 1, f"gate anchor: {old[:60]}"
        g = g.replace(old, new)
        print(f"  gate  ok  {old.splitlines()[0][:58]}")
    V.write_text(g, encoding="utf-8")
    print("done")


if __name__ == "__main__":
    main()
