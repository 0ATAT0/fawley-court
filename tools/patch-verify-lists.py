# -*- coding: utf-8 -*-
"""Re-point the gate's two hand-kept lists and its ladder check.

Three things carried the previous version of the model rather than deriving
from it:

  1. `EXTRA_OK`, the subject-figure allowlist, held sixty of v16's own figures,
     which is how a retired figure kept passing. It now holds only tokens that
     are not model figures at all — counts, indices and an interval — and the
     capital-cost pack joins the registered set instead;
  2. `SUBJ_OK`, the approved subject cells on the case plates, is re-struck on
     this version;
  3. the ladder check read a record shape the harness no longer writes: the
     rungs and their solved lever columns are now separate sections.

    python tools/patch-verify-lists.py
"""
import json, os, pathlib, re

HERE = pathlib.Path(__file__).resolve().parent.parent
DEAL = pathlib.Path(os.environ.get(
    "FAWLEY_DEAL_ROOT",
    r"D:\OneDrive - Strand Labs\2. Clients\Align\2. Live Deals\Fawley Court"))
V = HERE / "verify.mjs"
REC = json.loads((DEAL / "Model" / "docs" / "v29-figures.json").read_text(encoding="utf-8"))
F = REC["fig"]

NEW_EXTRA = '''const FIG_VALUES = new Set([...Object.values(figs).map(v => String(v).toLowerCase()),
  ...REGISTERED, ...CAPEX_VALUES]);
/* Tokens that are not model figures: key counts, an index, a share, the
   occupancy interval, and the two loading percentages the residential limb
   carries. Everything that IS a model figure has to come from the record. */
const EXTRA_OK = new Set([
  "60", "45", "12", "17", "43", "24", "22", "21", "15", "8", "9", "2", "1.068",
  "60–70%", "100%", "5,500", "3.75", "1.20", "0.65"
]);'''

SUBJ_OK = f'''function SUBJ_OK() {{
  return new Set([
    "£1,000 underwritten", "60", "twelve months",
    "{F['rev_per_key_y7'].lower()} · {F['rev_y7'].lower()}, year 7",
    "{F['gop_margin_y7'].lower()} gop · {F['gop_y7'].lower()}, year 7",
    "{F['gop_margin_y7'].lower()} gop · year 7",
    "{F['capex_hotel_per_key'].lower()} a key works · {F['capex_hotel'].lower()}",
    "staff cost index {F['staff_index']}; no headcount is modelled",
    "not computable on a like basis", "12 at {F['resi_psf'].lower()}/sqft, {F['resi_sqft']} sqft average",
    "{F['resi_absorption']} a year",
    "{F['members']} members at {F['member_fee'].lower()} a month, {F['founder_cap']} founders at {F['founder_fee'].lower()}",
    "{F['capex_prog_q']} quarters of works, opening at t+3.5",
    "60: 17 main house, 43 stables and courtyard",
    "£1,000 underwritten, across all twelve months",
    "{F['rev_y7'].lower()} revenue, {F['gop_y7'].lower()} gop, year 7"
  ]);
}}'''

LADDER = '''/* the entry ladder, cell by cell, against the measured record. The record
   holds the thirteen measured entries and, separately, the five rungs whose
   lever columns were solved, so the page's five rows read from both. */
const LAD_SRC = Object.fromEntries(modelSrc.ladder.map(r => [r.price_fig, r]));
const RUNG_SRC = Object.fromEntries(modelSrc.rungs.map(r => [r.price_fig, r]));
const solvedFig = (r, k) => k === "exit_yield"
  ? (r[k].solved * 100).toFixed(2) + "%"
  : "£" + Math.round(r[k].solved).toLocaleString("en-GB");
for (const r of mod.LADDER.rows) {
  const src = LAD_SRC[r.e], rung = RUNG_SRC[r.e];
  checked++;
  if (!src || !rung) { fail("LADDER RUNG NOT MEASURED", r.e); continue; }
  for (const [k, want] of [["allin", src.all_in_fig], ["irr", src.irr_fig],
                           ["adr", solvedFig(rung, "adr")],
                           ["exit", solvedFig(rung, "exit_yield")],
                           ["psf", solvedFig(rung, "resi_psf")]]) {
    checked++;
    if (r[k] !== want) fail("LADDER CELL MISMATCH  " + r.e + "/" + k, `page "${r[k]}" vs record "${want}"`);
  }
  checked++;
  if (Math.abs(r.irrN - src.irr * 100) > 0.005) fail("LADDER BAR MISMATCH  " + r.e, `${r.irrN} vs ${src.irr * 100}`);
  /* every solved lever must reach the bar it is solved to */
  for (const k of ["adr", "exit_yield", "resi_psf"]) {
    checked++;
    if (Math.abs(rung[k].achieved - 0.13) > 1e-4)
      fail("LADDER LEVER OFF THE BAR  " + r.e + "/" + k, String(rung[k].achieved));
  }
  prose("ladder note " + r.e, r.note);
}'''


def main():
    s = V.read_text(encoding="utf-8")

    a = s.index("const FIG_VALUES = new Set([")
    b = s.index("]);", s.index("const EXTRA_OK", a)) + 3
    s = s[:a] + NEW_EXTRA + s[b:]
    print("  ok  the subject-figure allowlist no longer holds model figures")

    a = s.index("function SUBJ_OK() {")
    b = s.index("\n}", s.index("]);", a)) + 2
    s = s[:a] + SUBJ_OK + s[b:]
    print("  ok  approved subject cells re-struck")

    a = s.index("/* the entry ladder, cell by cell")
    b = s.index("for (const [k, want] of [[\"adr\", modelSrc.fig.adr_y1]", a)
    s = s[:a] + LADDER + "\n" + s[b:]
    print("  ok  ladder check reads the current record shape")

    # money levels print with their sign on the page
    s = s.replace(
        "for (const v of modelSrc.derived.levels || []) addReg(v);",
        "")
    anchor = "Object.values(modelSrc.sens).forEach(regOut);"
    add = ('for (const v of modelSrc.derived.levels || []) { addReg(v); addReg("£" + v); }\n'
           + anchor)
    s = s.replace(anchor, add, 1)
    print("  ok  sensitivity levels registered")

    V.write_text(s, encoding="utf-8")
    print(f"rewrote {V}")


if __name__ == "__main__":
    main()
