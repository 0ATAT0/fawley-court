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

# The record of the model this build is struck against. Resolved rather than
# named, so the next re-strike is a new file in Model/docs and not an edit to
# every tool: the highest-numbered vNN-figures.json wins, and FAWLEY_MODEL_RECORD
# overrides it outright.
def _model_record(deal):
    import os, re as _re, pathlib as _p
    override = os.environ.get("FAWLEY_MODEL_RECORD")
    if override:
        return _p.Path(override)
    docs = _p.Path(deal) / "Model" / "docs"
    found = sorted(
        ((int(_re.match(r"v(\d+)-figures\.json$", f.name).group(1)), f)
         for f in docs.glob("v*-figures.json")
         if _re.match(r"v(\d+)-figures\.json$", f.name)),
        key=lambda t: t[0])
    if not found:
        raise SystemExit("no vNN-figures.json in %s" % docs)
    return found[-1][1]



HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEAL = os.environ.get(
    "FAWLEY_DEAL_ROOT",
    r"D:\OneDrive - Strand Labs\2. Clients\Align\2. Live Deals\Fawley Court")
IDX = os.path.join(HERE, "index.html")
REC_PATH = _model_record(DEAL)
REC = json.loads(REC_PATH.read_text(encoding="utf-8"))

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


# == 2. the assumptions sheet =========================================
#   The master sheet of what the model runs on: thirty assumptions, grouped,
#   each with its class, its basis and - where the measurement holds one - what
#   moving it is worth in return terms. The swing settings are the single-lever
#   sensitivities, which used to be a view of their own; they now travel with
#   the assumption they belong to, so nothing is read in isolation.
GROUPS = ["The asset", "Rate and demand", "The revenue engines", "What it earns",
          "The capital cost", "Funding", "The residences", "The exit"]


def sens_irr(key):
    return pct(SENS[key]["irr"], 2)


def worth(keys):
    """Swing in percentage points across the settings measured."""
    dd = [0.0] + [SENS[k]["d_pp"] for k in keys]
    return f"{max(dd) - min(dd):.1f}pp"


def A(group, name, value, cls, basis, settings=None):
    r = {"g": group, "k": name, "v": value, "c": cls, "b": basis}
    if settings:
        r["w"] = worth([t[1] for t in settings])
        r["s"] = [[lab, sens_irr(key)] for lab, key in settings]
    return r


def assumptions_block():
    rows = [
        A("The asset", "Price", n(F["entry"]), "Decision",
          "Ruled, not solved: every return on this page is an output at it. Guidance is understood "
          f"at about £70m, and the 13.00% bar solves at {D['bar_price']}, {D['bar_gap']} above "
          "the ruled price."),
        A("The asset", "Keys", n(F["keys"]), "Decision",
          "17 Main House and 43 Stables and Courtyard, the vendor’s own scheduled scheme. "
          "60 keys is the consensus across three of the four operator forecasts. Fifteen fewer "
          "keys take the revenue and leave the budget, because the capital cost is a schedule of "
          "buildings and estate rather than a price a key.",
          [["45 keys", "keys_45"]]),
        A("The asset", "Courtyard keys", n(F["courtyard_keys"]), "Decision",
          "The courtyard opens first and trades through the works. The consented courtyard count "
          "is 15, against the 43 the design statement schedules.",
          [["24 keys", "courtyard_24"], ["43 keys", "courtyard_43"]]),
        A("The asset", "Programme and hold", f"{n(F['capex_prog_q'])} quarters", "Decision",
          f"Works run {F['capex_prog_q']} quarters and the hotel opens at T+3.5; the hold is "
          f"{F['hold_yrs']} years to a sale in quarter {F['exit_q']}. A longer programme costs a "
          "little, because the schedule spends against its own dates.",
          [["16 quarters", "programme_16"], ["18 quarters", "programme_18"]]),

        A("Rate and demand", "ADR",
          f"{n(F['adr_y1'])} {ARROW} {n(F['adr_y7'])}", "Decision",
          "Year-1 money at 2026 prices, reaching the year-7 figure on general inflation. It sits "
          "above every UK lead-in held and below the four cohort lead-ins of £1,372 and above; "
          "the four operator forecasts average £1,183 at their own stabilised year.",
          [["£850", "adr_850"], ["£1,200", "adr_1200"]]),
        A("Rate and demand", "Occupancy", n("60" + NDASH + "70%"), "Decision",
          f"Stabilised in trading year 7; {F['occ_stab']} is the model input and the narrative "
          "interval is 60–70%. The four operator forecasts average 65.5%.",
          [["0.60", "occ_060"], ["0.67", "occ_067"], ["0.70", "occ_070"]]),
        A("Rate and demand", "Season", "Twelve months", "Decision",
          "Underwritten on a year-round calendar. Of the comparable set, only one demonstrably "
          "year-round European estate hotel clears £1,000, and everything above £1,200 "
          "closes for two to seven months."),

        A("The revenue engines", "The members’ club",
          f"{n(F['members'])} at {n(F['member_fee'])} a month", "Decision",
          f"Plus {F['founder_cap']} founder members at {F['founder_fee']} and a {F['join_fee']} "
          "joining fee. The largest revenue lever in the model, and the fee has no filed "
          "comparable anywhere in the evidence estate.",
          [["Off", "club_off"], ["£490 a month", "club_490"]]),
        A("The revenue engines", "Exclusive-use buyouts",
          f"{n(F['buyouts_y7'])} at {n(F['buyout_premium'])}", "Decision",
          "A premium over the accommodation the buyout displaces. It has no filed comparable "
          "either, and with the club fee it carries about seven points of the return.",
          [["Off", "buyouts_off"]]),
        A("The revenue engines", "Corporate events",
          f"{n(F['corp_y7'])} at {n(F['corp_rev_y1'])}", "Decision",
          "Year-1 money, priced excluding rooms."),
        A("The revenue engines", "Day meetings and private dining",
          f"{n(F['hires_per_day'])} a day at {n(F['hire_rate'])}", "Decision",
          "Twelve delegates a hire, against Beaverbrook’s filed room hire of £491,623 on "
          "56 keys.",
          [["Off", "daymeetings_off"]]),
        A("The revenue engines", "Regatta hospitality",
          f"{n(F['regatta_days'])} days", "Decision",
          f"{F['regatta_covers']} covers a day at {F['regatta_spend']} a head, the vendor’s "
          "own six-day format. It runs from year 1, through the works.",
          [["Off", "regatta_off"]]),

        A("What it earns", "Revenue, year 7", n(F["rev_y7"]), "Output",
          f"{F['rev_per_key_y7']} a key, against an average of £450,300 across the four "
          f"operator forecasts. Rooms {F['rooms_rev_y7']}, food and beverage {F['fb_rev_y7']}, "
          f"spa, club and other {F['other_rev_y7']}."),
        A("What it earns", "GOP, year 7", f"{n(F['gop_y7'])} = {n(F['gop_margin_y7'])}", "Output",
          "The margin is not the outlier in this underwrite; the revenue it is struck on is. The "
          "filed-accounts corpus prints 22.3 / 31.1 / 36.0% at its quartiles."),
        A("What it earns", "NOI, year 7", f"{n(F['noi_y7'])} = {n(F['noi_margin_y7'])}", "Output",
          "After the operator’s base and incentive fees, which are charged inside the profit "
          "and loss account. Only Align’s own asset-management fee sits below it."),
        A("What it earns", "Staff cost index", n(F["staff_index"]), "Decision",
          "Applied to all seven direct-wage lines; undistributed costs are not scaled and no "
          "headcount is modelled. Per key the model spends more on undistributed expenses than all "
          "four operator forecasts.",
          [["1.00", "staff_100"], ["1.10", "staff_110"], ["1.30", "staff_130"]]),

        A("The capital cost", "Cost of works", n(F["capex_works_total"]), "Decision",
          f"Hotel {F['capex_hotel']} and residences {F['capex_resi']}, from a 162-line ground-up "
          "budget priced after the site inspection of 17 August 2026: a quantity and a rate on "
          "every line. Chapter 04 carries every line and its basis."),
        A("The capital cost", "Hotel works a key", n(F["capex_hotel_per_key"]), "Decision",
          f"{F['capex_hotel']} over {F['keys']} keys. Published conversion costs run "
          "£400–900k a key and top out at £1.84m at Le Grand Contrôle, so this "
          "sits above all of them; the buildings alone carry £1.50m a key and the estate adds "
          "£0.60m."),
        A("The capital cost", "Loadings",
          f"{n(F['capex_prelims_pct'])} / {n(F['capex_fees_pct'])} / {n(F['capex_cont_pct'])}",
          "Decision",
          "Preliminaries, fees and contingency on the hotel limb, which are Rocco Forte’s own "
          f"loadings; the residential limb carries {F['capex_resi_prelims_pct']}, "
          f"{F['capex_resi_fees_pct']} and {F['capex_resi_cont_pct']}."),
        A("The capital cost", "Cost to open",
          f"{n(F['cost_to_open'])} = {n(F['cost_to_open_key'])} a key", "Output",
          f"The works spent to opening plus the entry, {F['acq_costs_pct']} acquisition costs, the "
          "arrangement fee, capitalised interest and the pre-opening trading shortfall. It yields "
          f"{F['yield_on_cost']} in year 7, a spread of {F['dev_spread_bp']} over the "
          f"{F['exit_yield']} exit."),

        A("Funding", "Senior debt", f"{n(F['fin_senior_ltc'])} LTC", "Decision",
          f"Base rate {F['base_rate']} plus a {F['fin_senior_margin']} margin, rolling up for "
          f"{F['fin_pik_q']} quarters and peaking at {F['senior_peak']}; the arrangement fee is "
          f"{F['arr_fee_pct']}.",
          [["Base rate 4.5%", "sonia_45"]]),
        A("Funding", "The refinancing", f"Q{n(F['fin_refi_q'])}, {n(F['refi_draw'])}", "Decision",
          f"Sized to the lower of {F['fin_refi_ltv']} loan to value at a {F['fin_refi_yield']} "
          f"yield and {F['refi_min_icr']} post-fee cover, margin {F['fin_refi_margin']}. The cover "
          "test binds. At 1.30x cover the equity requirement does not move.",
          [["1.30x cover", "icr_130"], ["1.40x cover", "icr_140"]]),
        A("Funding", "Equity", n(F["total_equity"]), "Output",
          "Peak equity equals total equity: cash funds the later drawdowns, so nothing is called "
          "after the first distribution. Capital comes back in year 8."),
        A("Funding", "Fees",
          f"{n(F['fee_op_base'])} / {n(F['fee_incentive'])} / {n(F['fee_am'])}", "Decision",
          "Operator base on total revenue and incentive on GOP, both inside the profit and loss "
          "account, plus Align’s escalating asset-management fee. Align funds no equity and "
          f"its promote over {F['promote_h1']} / {F['promote_h2']} / {F['promote_h3']} hurdles is "
          "carried at nil, so returns are pre-promote.",
          [["Incentive 8%", "incentive_8"]]),

        A("The residences", "Product and price",
          f"{n(F['resi_units'])} at {n(F['resi_psf'])}/sqft", "Market",
          f"{F['resi_sqft']} sqft average, the vendor’s advised product. Savills recommends "
          "£1,934/sqft weighted, which it calls a 63% premium over the local top 5%; the RG9 "
          "prime reach prints a £1,107 median.",
          [["£1,100/sqft", "resi_1100"], ["£1,250/sqft", "resi_1250"],
           ["£1,500/sqft", "resi_1500"]]),
        A("The residences", "Price growth", n(F["resi_esc"]), "Decision",
          "Escalating to each sale quarter, above the 2.5% general inflation rate the model "
          "otherwise runs.",
          [["Nil", "resi_esc_0"], ["2.5%", "resi_esc_25"]]),
        A("The residences", "Absorption and tenure", f"{n(F['resi_absorption'])} a year", "Decision",
          f"Sales open in quarter {F['resi_sales_start_q']} on 999-year leaseholds, ruled 18 "
          f"August 2026 following Savills’ own assumption; the limb is net {F['resi_net']} "
          f"after a {F['resi_fee_pct']} sales fee and {F['resi_cost']} of all-in cost."),

        A("The exit", "Exit yield", n(F["exit_yield"]), "Decision",
          f"On adjusted NOI of {F['exit_adjnoi']} with {F['purch_costs_pct']} purchasers’ "
          "costs, hotel alone. Every non-London country-house and resort trade held prints between "
          "5.42% and 6.00%.",
          [["3.50%", "exit_350"], ["3.75%", "exit_375"],
           ["4.25%", "exit_425"], ["4.75%", "exit_475"]]),
        A("The exit", "Exit value",
          f"{n(F['exit_value'])} = {n(F['exit_per_key'])} a key", "Output",
          "Hotel alone. The exit is modelled as a sale of the holding company’s shares; an "
          "asset sale instead costs the return.",
          [["Asset sale", "asset_sale"]]),
        A("The exit", "Returns", f"{n(F['irr'])} / {n(F['em'])}", "Output",
          f"Levered, on {F['total_equity']} of equity, for a levered profit of "
          f"{F['levered_profit']}. Unlevered {F['irr_unlev']} and {F['em_unlev']}."),
    ]
    assert len(rows) == 30, len(rows)
    assert [r["g"] for r in rows] == sorted([r["g"] for r in rows], key=GROUPS.index)
    body = ",\n".join("  " + js(r) for r in rows)
    return "const ASSUMPTIONS = [\n" + body + "\n];"


def dial_src_block():
    t = (f"Source: Align model, {MODEL_NAME}, saved state {SAVED}. Occupancy is an interval of "
         f"60{NDASH}70% in narrative; {F['occ_stab']} is the model input. The cost of works is the "
         "construction number, built line by line in chapter 04; cost to open is the all-in funded "
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


# ══ 7. the Capital view ═══════════════════════════════════════════════
# Both funding tables, the annual flows and the three readings under them.
# Every cell of this view was typed by hand on an earlier version and every one
# of them went stale in the next re-strike. All of it is in the record, so the
# view is generated like the other blocks.
MIDDOT, RSQUO, POUND = "\u00b7", "\u2019", "\u00a3"
emph = lambda s: "<span class='emph'>" + s + "</span>"
wrap_neg = lambda s: ("<span class='neg'>" + s + "</span>") if s.startswith("(") else s

CAP_BULLETS = [
    "<b>Peak equity {peak}</b> at the trough of the drawdown, and equal to the total "
    "drawn: cash funds later drawdowns, so nothing is called after the first "
    "distribution. That equality holds only at the {icr} cover test the refinancing is "
    "sized on.",
    "<b>Capital comes back in year 8</b>: cumulative net equity is {cum} at the end of "
    "year 7, and the {y8} distributed in year 8 clears it.",
    "<b>The refinancing more than clears the senior</b> {dash} {refi} drawn against the "
    "{senior} balance it repays. The cover test that sizes it is set at {icr}.",
]


def capital_block():
    left = [
        [None, ["Purchase price", F["entry"]]],
        [None, ["Acquisition costs at " + F["acq_costs_pct"], D["acq_costs_amount"]]],
        [None, ["Hotel works spent to opening", F["co_capex"]]],
        [None, ["Arrangement fee", F["co_arrfee"]]],
        [None, ["Capitalised interest, to opening", F["co_interest"]]],
        [None, ["Pre-opening operating shortfall", F["co_shortfall"]]],
        ["total key", ["Cost to open", emph(F["cost_to_open"])]],
        ["total key", ["Hotel cost to exit", emph(F["all_in_to_exit"])]],
        [None, ["Residential build, all in", F["capex_resi"]]],
        [None, ["Residential sales fee, " + F["resi_fee_pct"] + " of gross proceeds",
                F["resi_sales_fee"]]],
        ["total key", ["Total project cost through exit", emph(D["total_project_cost"])]],
    ]
    right = [
        [None, ["Equity drawn over the hold, which is also peak equity", F["total_equity"]]],
        [None, ["Senior drawn over the works, cumulative", F["senior_drawn_total"]]],
        [None, ["Peak senior balance, at opening", F["senior_peak"]]],
        ["key", ["Refinancing drawn at Q" + F["fin_refi_q"], emph(F["refi_draw"])]],
        [None, ["Exit-year NOI, after the operator" + RSQUO + "s fees", F["exit_noi"]]],
        [None, ["Less Align" + RSQUO + "s asset-management fee",
                "<span class='neg'>(" + F["exit_am_fee"] + ")</span>"]],
        ["subtotal", ["Adjusted NOI at exit", F["exit_adjnoi"]]],
        [None, ["Exit yield / purchasers" + RSQUO + " costs",
                F["exit_yield"] + " / " + F["purch_costs_pct"]]],
        ["total key", ["Exit value, hotel alone", emph(F["exit_value"])]],
        [None, ["Per key " + MIDDOT + " unadjusted NOI on the gross value",
                F["exit_per_key"] + " " + MIDDOT + " " + F["exit_noi_on_gross"]]],
    ]
    flows = [[None, [f["period"], f["equity_in"], f["distributed"],
                     wrap_neg(f["senior"]), wrap_neg(f["refi"])]] for f in REC["flows"]]
    T = REC["flow_totals"]
    flows.append(["total", ["Drawn over the hold", emph(T["equity_in"]), MDASH,
                            T["senior"], T["refi"]]])
    flows.append([None, ["Returned over the hold", MDASH, T["distributed"],
                         wrap_neg(T["senior_repaid"]), wrap_neg(T["refi_repaid"])]])

    y8 = next(f["distributed"] for f in REC["flows"] if f["period"] == "Y8")
    bullets = [b.format(peak=F["peak_equity"], icr=F["refi_min_icr"], cum=D["cum_equity_y7"],
                        y8=POUND + y8 + "m", refi=F["refi_draw"], senior=F["senior_peak"],
                        dash=MDASH) for b in CAP_BULLETS]

    tbl = lambda rows: ('[["tbl",{"cls":"num","head":["Line",{"t":"Amount","a":"r"}],"rows":['
                        + ",".join(js(r) for r in rows) + ']}]]')
    ftbl = ('[["tbl",{"cls":"num","head":["Period",{"t":"Equity in","a":"r"},'
            '{"t":"Distributed","a":"r"},{"t":"Senior","a":"r"},{"t":"Refi","a":"r"}],"rows":['
            + ",".join(js(r) for r in flows) + ']}]]')

    out = ["/*CAPITAL-VIEW-START*/",
           '  { id: "capital", title: "Capital", kicker: "Capital",',
           "    figure: " + js(F["cost_to_open"] + " to open " + MIDDOT + " "
                               + F["total_equity"] + " of equity") + ",",
           '    blurb: "What it costs to open and to exit, how it is funded, and the year '
           'the capital comes back.",',
           "    lead: [",
           '      ["panes",{"split":"50fr 50fr","left":{"h":"Hotel cost to open and exit","b":'
           + tbl(left) + '},"right":{"h":"How it is funded, and the exit","b":'
           + tbl(right) + "}}],",
           '      ["wf","equity"],',
           '      ["exhibit",{"h":"Annual flows, ' + POUND + 'm","b":' + ftbl + "}],",
           "    ],",
           "    reason: [",
           '      ["bullets",' + js(bullets) + "],",
           "    ] },",
           "/*CAPITAL-VIEW-END*/"]
    return chr(10).join(out)


# ══ splice ════════════════════════════════════════════════════════════
BLOCKS = [
    ("const FIGS = {", "};", figs_block),
    ("const ASSUMPTIONS = [", "];", assumptions_block),
    ("const DIAL_SRC = ", None, dial_src_block),
    ("const LADDER = {", "};", ladder_block),
    ("const BRIDGE = {", "};", bridge_block),
    ("const EQ = [", "];", eq_block),
    ("/*CAPITAL-VIEW-START*/", "/*CAPITAL-VIEW-END*/", capital_block),
]

MODEL_NAME = REC["meta"]["model"].split(" - ", 1)[-1].replace(".xlsx", "")
# The saved state the record was measured on, from the record rather than typed:
# it was still saying 19 August three versions later.
_MONTHS = ["January", "February", "March", "April", "May", "June", "July",
           "August", "September", "October", "November", "December"]
_y, _m, _d = (int(x) for x in REC["meta"]["measured"].split("-"))
SAVED = "%d %s %d" % (_d, _MONTHS[_m - 1], _y)


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
