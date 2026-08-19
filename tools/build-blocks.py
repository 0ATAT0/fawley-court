# -*- coding: utf-8 -*-
"""Regenerate the portal's model-figure blocks from the measured record.

The page carries its model figures in six authored blocks: the figures map,
the dial sheet, the dial source line, the entry ladder, the bridge and the equity waterfall. Each was
hand-cut on an earlier version of the model and went stale silently. This
rebuilds all six from `Model/docs/v29-figures.json`, so a re-strike is a rerun
rather than a rewrite. The measured record and the cheat-sheet pack are carried
in separately by inline-model.py and inline-cheat.py.

    python tools/build-blocks.py [--check]

--check rebuilds and reports whether index.html would change, without writing.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEAL = os.environ.get(
    "FAWLEY_DEAL_ROOT",
    r"D:\OneDrive - Strand Labs\2. Clients\Align\2. Live Deals\Fawley Court")
IDX = os.path.join(HERE, "index.html")
REC = json.load(open(os.path.join(DEAL, "Model", "docs", "v29-figures.json"), encoding="utf-8"))

F = REC["fig"]
LAD = {int(r["price"] / 1e6): r for r in REC["ladder"]}
RUNG = {int(r["price"] / 1e6): r for r in REC["rungs"]}
BS = REC["backsolve"]
SENS = REC["sens"]
D = REC["derived"]

MDASH, NDASH, MINUS = "\u2014", "\u2013", "\u2212"
ARROW = "\u2192"


def js(v, indent=0):
    """JSON with the page's own quoting conventions."""
    return json.dumps(v, ensure_ascii=False, indent=indent) if indent else \
        json.dumps(v, ensure_ascii=False)


def pct(x, dp=2):
    return f"{x*100:.{dp}f}%"


def money_m(x, dp=1):
    return f"£{x/1e6:.{dp}f}m"


# ══ 1. FIGS — the readable index of the record ════════════════════════
def figs_block():
    body = ",\n".join(f'  {js(k)}: {js(v)}' for k, v in F.items())
    return "const FIGS = {\n" + body + "\n};"


# ══ 2. the dial sheet ═════════════════════════════════════════════════
def n(x):
    return f"<span class='n'>{x}</span>"


def dials_block():
    rows = [
        ["Keys", f"{n(F['keys'])} {MDASH} 17 Main House, 43 Stables and Courtyard; the courtyard, "
                 f"{n(F['courtyard_keys'])} keys, opening first"],
        ["ADR", f"{n(F['adr_y1'])} {ARROW} {n(F['adr_y7'])}, year-1 money at 2026 prices"],
        ["Occupancy", f"{n('60' + NDASH + '70%')}, stabilised in year 7"],
        ["Season", "Twelve months; underwritten on a year-round calendar"],
        ["Revenue, year 7", f"{n(F['rev_y7'])} = {n(F['rev_per_key_y7'])} a key"],
        ["GOP, year 7", f"{n(F['gop_y7'])} = {n(F['gop_margin_y7'])}"],
        ["Staff cost", f"Index {n(F['staff_index'])} on all seven direct-wage lines; no headcount "
                       "is modelled"],
        ["Cost of works", f"{n(F['capex_works_total'])} {MDASH} hotel {n(F['capex_hotel'])} at "
                          f"{n(F['capex_hotel_per_key'])} a key, residences {n(F['capex_resi'])} "
                          f"at {n(F['capex_resi_per_unit'])} a unit"],
        ["Cost to open", f"{n(F['cost_to_open'])} = {n(F['cost_to_open_key'])} a key"],
        ["Yield on cost", f"{n(F['yield_on_cost'])} in year 7, a spread of {n(F['dev_spread_bp'])} "
                          f"over the {n(F['exit_yield'])} exit"],
        ["Residences", f"{n(F['resi_units'])} at {n(F['resi_psf'])}/sqft, {n(F['resi_sqft'])} sqft "
                       f"average, escalating {n(F['resi_esc'])} a year; absorption "
                       f"{n(F['resi_absorption'])} a year, on 999-year leaseholds"],
        ["Club", f"{n(F['members'])} members at {n(F['member_fee'])} a month, "
                 f"{n(F['founder_cap'])} founders at {n(F['founder_fee'])}"],
        ["Programme", f"{n(F['capex_prog_q'])} quarters of works, opening at T+3.5"],
        ["Debt", f"{n(F['fin_senior_ltc'])} LTC senior; the refinancing at Q{n(F['fin_refi_q'])} "
                 f"draws {n(F['refi_draw'])} on a {n(F['refi_min_icr'])} cover test"],
        ["Exit", f"{n(F['exit_yield'])} on adjusted NOI with {n(F['purch_costs_pct'])} "
                 "purchasers\u2019 costs; hotel alone"],
        ["Price", f"{n(F['entry'])} ruled; returns are outputs at it. Guidance is understood at "
                  f"about {n('£70m')}"],
        ["Returns", f"{n(F['irr'])} levered and {n(F['em'])} on {n(F['peak_equity'])} of peak "
                    "equity"],
    ]
    body = ",\n".join("  " + js(r) for r in rows)
    return "const DIALS = [\n" + body + "\n];"


def dial_src_block():
    t = (f"Source: Align model, {MODEL_NAME}, saved state {SAVED}. Occupancy is an interval of "
         f"60{NDASH}70% in narrative; {F['occ_stab']} is the model input. The cost of works is the "
         "construction number, built line by line in chapter 05; cost to open is the all-in funded "
         "number, and it is the basis that compares with a third party\u2019s all-in cost claim. "
         "The operator\u2019s base and incentive fees sit inside the profit and loss account, so "
         "net operating income is after them. Align funds no equity and earns the "
         f"{F['fee_am']} escalating asset-management fee and a promote over "
         f"{F['promote_h1']} / {F['promote_h2']} / {F['promote_h3']} hurdles carried at nil, so "
         "returns are pre-promote. Preliminary \u2014 subject to confirmatory DD.")
    return "const DIAL_SRC = " + js(t) + ";"


# ══ 3. the entry ladder ═══════════════════════════════════════════════
LADDER_NOTES = {
    30: "The rungs closest to the evidence: a rate {adr} against the {uk_lead} highest UK lead-in "
        "held, an exit of {exit} inside the 5.42{ndash}6.00% every non-London country-house trade "
        "prints, and residences at {psf} below the RG9 median of £1,107",
    40: "A rate a fifth above the highest UK lead-in; an exit of {exit}, tighter than any "
        "country-house trade held and inside the 4.50% index print; residences still below the RG9 "
        "median",
    50: "The ruled price. Every lever column sits inside the dial the model already carries, "
        "because the case clears the 13.00% bar at this price and the bar itself solves at "
        "{bar_price}, {bar_gap} above it",
    60: "A rate a third above the highest UK lead-in and a quarter below Reschio; an exit tighter "
        "than any trade held outside London; residences above the RG9 upper quartile of £1,478",
    70: "The guidance level. A rate half as much again as the highest UK lead-in, year-round "
        "against Reschio\u2019s nine months; residences approaching Savills\u2019 own £1,934",
}


def ladder_block():
    rows = []
    for p in (30, 40, 50, 60, 70):
        lad, rung = LAD[p], RUNG[p]
        adr = f"£{rung['adr']['solved']:,.0f}"
        ex = pct(rung["exit_yield"]["solved"])
        psf = f"£{rung['resi_psf']['solved']:,.0f}"
        note = LADDER_NOTES[p].format(adr=adr, exit=ex, psf=psf, ndash=NDASH,
                                      uk_lead="£39 above the" if p == 30 else "",
                                      bar_price=D["bar_price"], bar_gap=D["bar_gap"])
        row = {"e": lad["price_fig"], "allin": lad["all_in_fig"], "irr": lad["irr_fig"],
               "irrN": round(lad["irr"] * 100, 2), "adr": adr, "exit": ex, "psf": psf}
        if p == 50:
            row["ruled"] = True
        row["note"] = re.sub(r"\s+", " ", note).strip()
        rows.append(row)
    two = REC["extra"]["two_lever"]
    note = (f"The price is ruled at <b>{F['entry']}</b>. As analytical reads a 13% return solves at "
            f"<b>{BS['0.13']['fig']}</b>, 14% at {BS['0.14']['fig']} and 15% at "
            f"{BS['0.15']['fig']}. No single lever carries the £70m rung inside the evidence; the "
            f"rate and the exit yield together, at £1,200 and 3.50%, return {two['70']['irr']} "
            "there.")
    src = (f"Source: Align model, {MODEL_NAME}, solved on scratch copies {SAVED} \u2014 the IRR "
           "column by substitution into the price, the lever columns by bisection to a 13.00% "
           "levered IRR with each solved level read back through the model. Residential and rate "
           "evidence as cited in chapters 03 and 04.")
    out = ["const LADDER = {", "  rows: ["]
    for r in rows:
        flag = " ruled: true," if r.pop("ruled", False) else ""
        note = r.pop("note")
        out.append("    { " + ", ".join(f"{k}: {js(v)}" for k, v in r.items()) + ","
                   + flag + "\n      note: " + js(note) + " },")
    out[-1] = out[-1][:-1]
    out.append("  ],")
    out.append("  underwritten: { adr: " + js(F["adr_y1"]) + ", exit: " + js(F["exit_yield"])
               + ", psf: " + js(F["resi_psf"]) + ",")
    out.append("    note: " + js("Each lever column is the level at which the IRR reaches 13.00%, "
                                 "solved independently. A rung needing more than these carries a "
                                 "requirement") + " },")
    out.append("  note: " + js(note) + ",")
    out.append("  src: " + js(src))
    out.append("};")
    return "\n".join(out)


# ══ 4. the bridge ═════════════════════════════════════════════════════
BRIDGE_LEVERS = [
    "Embassy base case, emulated on the Align engine",
    "Entry £75m {arrow} <b>£50m</b>",
    "Works capex £135.45m {arrow} <b>the ground-up schedule</b>",
    "Operating cost base {arrow} <b>ours</b> (staff index {ix} {arrow} 1.20, an engine-built "
    "P&amp;L in place of a flat EBITDA ratio)",
    "ADR £1,200 flat {arrow} <b>£1,000 escalating</b> (we underwrite less rate than they do)",
    "The estate\u2019s demand engines on: Regatta, buyouts and corporate, day meetings, the club, "
    "the River Club",
    "Residences on: the vendor\u2019s own 12-house product, carrying their share of the estate",
    "Exit yield 4.75% {arrow} <b>4.00%</b>",
]
BRIDGE_LABELS = ["Their base case", "Entry", "Works capex", "Operating", "ADR £1,000",
                 "Demand engines", "Residences", "Exit yield"]


def bridge_block():
    B, BM = REC["bridge"], REC["bridge_meta"]
    subs = ["(emulated)", "£75m " + ARROW + " £50m",
            "£135m " + ARROW + " " + money_m(REC["raw"]["capex_hotel"]["v"]).replace("£", "£"),
            "cost base", "escalating", "on", "12 × " + F["resi_psf"] + "/sqft",
            "4.75% " + ARROW + " 4.00%"]
    out = ["const BRIDGE = {", "  rows: ["]
    for r in B:
        lever = BRIDGE_LEVERS[r["n"]].format(arrow=ARROW, ix=BM["staff_index_emulated"])
        bits = [f'n: {r["n"]}', f'lever: {js(lever)}', f'irr: {js(r["irr"])}',
                f'irrN: {r["irr_n"]:.2f}',
                'd: ' + ("null" if r["d"] is None else js(r["d"].replace("-", MINUS))),
                'dN: ' + ("0" if r["d_n"] is None else f'{r["d_n"]:.2f}'),
                f'em: {js(r["em"])}', f'exit: {js(r["exit"])}', f'pk: {js(r["peak"])}']
        if r["n"] in (0, 7):
            bits.append("end: true")
        if r["d_n"] is not None and r["d_n"] < 0:
            bits.append("neg: true")
        out.append("    { " + ", ".join(bits) + " },")
    out[-1] = out[-1][:-1]
    out.append("  ],")
    out.append("  labels: " + js(BRIDGE_LABELS) + ",")
    out.append("  sublabels: " + js(subs) + ",")

    d = {r["n"]: r for r in B}
    stand1 = ("Both cases are priced on one engine. Embassy Capital\u2019s base case \u2014 their "
              "August 2026 pack \u2014 was reproduced dial for dial on the Align model, then each "
              "assumption was walked to the Align setting with the levered return measured at "
              "every rung. Between the two end states there is no unexplained residual.")
    stand2 = ("The final rung reproduces the saved Align model exactly, to the last digit of the "
              "levered IRR. That reproduction is what licenses the numbers in between.")
    heads = [[BM["net_pp"] + "pp", "from their base case to the Align underwrite, across seven "
                                   "measured levers"],
             [d[0]["peak"] + " " + ARROW + " " + d[7]["peak"],
              "peak equity requirement over the same walk"]]
    tnote = ("Each rung is cumulative on the one before it, in the order shown. The walk is "
             "path-dependent: a different order redistributes percentage points between steps "
             "while the two end states stay fixed. The order shown is the argument\u2019s order: "
             "price, then cost, then operations and rate, then the engines, the residences and "
             "the exit.")
    read = [
        f"<b>The capital cost is no longer the argument; the operating cost base is.</b> Replacing "
        f"their £135.45m works number with the Align schedule is worth {d[2]['d']}pp, because the "
        f"ground-up budget lands close to theirs. On the version that carried a five-input capital "
        f"lump £28m below Embassy\u2019s, the same lever was worth 7.3pp. The lever was lost to a "
        f"more honest number, and the case keeps the number.",
        f"<b>The operating line is where the two cases separate</b>: {d[3]['d']}pp. Their 24% "
        f"EBITDA is a flat ratio applied to revenue; the Align P&amp;L builds its margin from "
        f"covers, treatments, payroll lines and USALI cost ratios, and reaches {F['gop_margin_y7']} "
        f"GOP with the staffing index held at a deliberately heavy {F['staff_index']}.",
        f"<b>The Align case underwrites less rate than they do.</b> Giving back their £1,200 flat "
        f"rate for {F['adr_y1']} escalating costs {d[4]['d']}pp. The revenue case rests on the "
        f"estate\u2019s own demand engines \u2014 Regatta hospitality, exclusive-use buyouts and "
        f"corporate events, day meetings, the members\u2019 club and the River Club \u2014 "
        f"together worth {d[5]['d']}pp. Each is a dial that vendor trading actuals will refine, and "
        f"none of the four operator forecasts held for this asset carries a membership line at all.",
        f"<b>The residences are the vendor\u2019s own product</b> (Savills for Cherrilow, October "
        f"2025), and they carry their own share of the estate\u2019s infrastructure rather than "
        f"leaving it with the hotel. Net of that, step six is worth {d[6]['d']}pp.",
        f"<b>Exit conviction enters last and is the smallest judgment lever</b> \u2014 "
        f"{d[7]['d']}pp, after the costing, the operating engine and the residences are in place. "
        f"At the pack\u2019s own 4.75% exit yield the case still prints {d[6]['irr']}.",
        f"<b>The equity ask falls by nearly half.</b> The pack\u2019s asset case requires "
        f"{d[0]['peak']} of peak equity on these financing terms (their own pack states £171.0m on "
        f"theirs); the Align case requires {d[7]['peak']}.",
    ]
    caveats = [
        f"<b>Financing is held at the Align structure throughout</b> \u2014 "
        f"{F['fin_senior_ltc']} loan-to-cost senior, interest rolled up for {F['fin_pik_q']} "
        f"quarters, and a refinancing at quarter {F['fin_refi_q']} sized to the lower of "
        f"{F['fin_refi_ltv']} loan-to-value and {F['refi_min_icr']} post-fee cover. Embassy\u2019s "
        f"pack prints \u221212.7% a year and 0.44x at £75m on their financing and their full cost "
        f"stack; the {d[0]['irr']} start here is their asset case under this engine\u2019s "
        f"leverage.",
        f"<b>Their cost stack is only partly derivable.</b> The pack\u2019s revenue and "
        f"development-cost sheets were never shared, and roughly £40\u201360m of its £338.7m all-in "
        f"cost cannot be reconstructed. The emulation matches their works capex of £135.45m exactly "
        f"by scaling every hotel line of the Align schedule by {BM['capex_scalar']}, with the "
        f"residences off and the hotel carrying the whole estate.",
        f"<b>Two proxies.</b> Their £1,200 rate is flat and ours escalates, so the emulation sets "
        f"year one to {BM['embassy_adr_y1']} and matches them at the stabilised year. Their 24% "
        f"EBITDA is reproduced with a single staffing lever bisected to "
        f"{BM['staff_index_emulated']}, struck on EBITDA before the operator\u2019s base and "
        f"incentive fees, which achieves {BM['ebitda_margin_achieved']}.",
        "<b>Their base case carries no demand engines and no residences.</b> Their separate "
        "\u201cenhanced\u201d case adds weddings, Regatta and membership; the residential treatment "
        "in their base is not determinable from the sheets shared, and it is assumed off.",
        "<b>The walk is path-dependent.</b> Each step is measured cumulatively in the order shown "
        "\u2014 price, then cost, then operations and rate, then the engines, the residences and "
        "the exit. A different order moves points between the steps while the two ends stay where "
        "they are.",
        f"All analysis is preliminary and subject to confirmatory due diligence. Measured {SAVED} "
        f"on {MODEL_NAME} at the ruled {F['entry']} entry, the baseline reproduced at "
        f"{BM['reproduces']} with all checks {BM['checks_after']} after the walk; the full "
        "mechanics record sits with the model build record.",
    ]
    out.append("  stand1: " + js(stand1) + ",")
    out.append("  stand2: " + js(stand2) + ",")
    out.append("  heads: " + js(heads) + ",")
    out.append("  tnote: " + js(tnote) + ",")
    out.append("  read: [\n    " + ",\n    ".join(js(r) for r in read) + "\n  ],")
    out.append("  caveats: [\n    " + ",\n    ".join(js(c) for c in caveats) + "\n  ]")
    out.append("};")
    return "\n".join(out)


# ══ 6. the equity waterfall ═══════════════════════════════════════════
EQ_NOTES = {
    "Close": "{v} of equity drawn at the September 2026 completion quarter",
    "Y1": "{v} drawn against the works programme",
    "Y2": "{v} drawn; the residential build starts",
    "Y3": "{v} drawn — the peak equity quarter, {peak} cumulative",
    "Y4": "{v} distributed, dominated by residence completions",
    "Y5": "{v} distributed",
    "Y6": "{v} distributed",
    "Y7": "{v} distributed; the refinancing draws {refi} against {senior} of senior",
    "Y8": "{v} distributed at exit, clearing the {cum} cumulative outstanding",
}


def eq_block():
    rows = []
    for f in REC["flows"]:
        n = f["net"]
        money = f"£{abs(n):.1f}m"
        note = EQ_NOTES[f["period"]].format(
            v=money, peak=F["peak_equity"], refi=F["refi_draw"], senior=F["senior_peak"],
            cum=D["cum_equity_y7"])
        rows.append("  { l: " + js(f["period"]) + ", v: " + f"{n:.2f}"
                    + ", d: " + js(f"({abs(n):.1f})" if n < 0 else f"{n:.1f}")
                    + ", t: " + js(note) + " },")
    rows[-1] = rows[-1][:-1]
    return "const EQ = [\n" + "\n".join(rows) + "\n];"


# ══ splice ════════════════════════════════════════════════════════════
BLOCKS = [
    ("const FIGS = {", "};", figs_block),
    ("const DIALS = [", "];", dials_block),
    ("const DIAL_SRC = ", None, dial_src_block),
    ("const LADDER = {", "};", ladder_block),
    ("const BRIDGE = {", "};", bridge_block),
    ("const EQ = [", "];", eq_block),
]

MODEL_NAME = "Financial Model v29"
SAVED = "19 August 2026"


def splice(src, start, end, text):
    i = src.index(start)
    if end is None:
        j = src.index("\n", i)
    else:
        j = src.index("\n" + end, i) + len(end) + 1
    return src[:i] + text + src[j:]


def main():
    s = open(IDX, encoding="utf-8").read()
    before = s
    for start, end, fn in BLOCKS:
        if start not in s:
            print(f"  ! block not found, skipped: {start.strip()}")
            continue
        s = splice(s, start, end, fn())
    if "--check" in sys.argv:
        print("index.html would change" if s != before else "index.html unchanged")
        return
    open(IDX, "w", encoding="utf-8", newline="").write(s)
    print(f"rewrote {IDX}  ({len(before):,} -> {len(s):,} bytes)")


if __name__ == "__main__":
    main()
