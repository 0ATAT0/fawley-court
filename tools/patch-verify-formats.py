# -*- coding: utf-8 -*-
"""Register the measured record's values in the formats the page prints them in.

The record carries raw numbers for the sensitivities, the cases and the flows;
the page prints them as "13.19%", "1.86x", "£110.9m". Deriving those here, the
way the capital-cost pack is already handled, is what keeps a figure from
needing an allowlist entry — and what makes a figure that is not in the record
fail.

    python tools/patch-verify-formats.py
"""
import os, pathlib

HERE = pathlib.Path(__file__).resolve().parent.parent
V = HERE / "verify.mjs"

BLOCK = r'''
/* the measured record, in the formats the page prints. The record holds raw
   numbers; the page holds "13.19%" and "£110.9m". Derived here rather than
   allowlisted, so a figure the model no longer produces stops being valid. */
const mpct = (v, dp = 2) => (v * 100).toFixed(dp) + "%";
const mneg = v => "(" + Math.abs(v * 100).toFixed(2) + ")%";
const mem = v => v.toFixed(2) + "x";
const mm1 = v => "£" + (v / 1e6).toFixed(1) + "m";
const mm2 = v => "£" + (v / 1e6).toFixed(2) + "m";
const mpp = v => (v > 0 ? "+" : "−") + Math.abs(v).toFixed(2) + "pp";
const MONEY_KEYS = ["profit", "peak_equity", "total_equity", "peak_debt", "exit_price",
  "resi_gross", "resi_net", "resi_cost", "capex", "cost_to_open", "all_in_to_exit",
  "works_total", "y7_rev", "y7_gop", "y7_noi", "exit_noi", "exit_adjnoi", "refi_draw",
  "senior_drawn", "senior_repaid", "cum_equity_y7"];
const regOut = o => {
  if (!o || typeof o !== "object") return;
  if (typeof o.irr === "number") {
    [mpct(o.irr), mpct(o.irr, 1), mpct(o.irr, 4), mneg(o.irr)].forEach(addReg);
  }
  if (typeof o.em === "number") addReg(mem(o.em));
  if (typeof o.irr_unlev === "number") addReg(mpct(o.irr_unlev));
  if (typeof o.d_pp === "number") {
    [mpp(o.d_pp), Math.abs(o.d_pp).toFixed(1) + "pp", Math.abs(o.d_pp).toFixed(2) + "pp"]
      .forEach(addReg);
  }
  for (const k of MONEY_KEYS) {
    if (typeof o[k] === "number") { addReg(mm1(o[k])); addReg(mm2(o[k])); }
  }
  if (typeof o.y7_gop === "number" && typeof o.y7_rev === "number")
    addReg(mpct(o.y7_gop / o.y7_rev));
  if (typeof o.y7_noi === "number" && typeof o.y7_rev === "number")
    addReg(mpct(o.y7_noi / o.y7_rev));
};
Object.values(modelSrc.sens).forEach(regOut);
Object.values(modelSrc.cases).forEach(regOut);
modelSrc.ladder.forEach(regOut);
modelSrc.bridge.forEach(regOut);
for (const r of modelSrc.rungs) {
  regOut(r);
  for (const k of ["adr", "exit_yield", "resi_psf"]) {
    const s = r[k] && r[k].solved;
    if (typeof s !== "number") continue;
    addReg(k === "exit_yield" ? mpct(s) : "£" + Math.round(s).toLocaleString("en-GB"));
  }
}
/* swings between two settings, quoted as a band on the sensitivity table */
for (const a of Object.values(modelSrc.sens)) {
  for (const b of Object.values(modelSrc.sens)) {
    if (typeof a.d_pp === "number" && typeof b.d_pp === "number")
      addReg(Math.abs(a.d_pp - b.d_pp).toFixed(1) + "pp");
  }
}
'''


def main():
    s = V.read_text(encoding="utf-8")
    anchor = "/* the capital-cost pack, formatted the way the page formats it */"
    assert anchor in s, "anchor not found"
    assert "const mpct = " not in s, "already patched"
    s = s.replace(anchor, BLOCK.strip("\n") + "\n\n" + anchor, 1)
    V.write_text(s, encoding="utf-8")
    print(f"patched {V}")


if __name__ == "__main__":
    main()
