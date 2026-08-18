# -*- coding: utf-8 -*-
"""Move the content gate off the v16 record and onto the current one.

Four changes, and the third is the point of the exercise:

  1. the measured record it reads becomes v29-figures.json, and the bridge and
     re-strike records become this version's;
  2. the cheat-sheet section checks the shipped block against the pack built
     from the workbook's own tab, leaf for leaf, in place of a spec file and a
     transcribed PDF render;
  3. a retired-figure check fails on any figure from an earlier version of the
     model that is still on a model-figure surface. Without it the gate accepts
     a stale figure, because the old record was itself a registered source;
  4. the module export renames V16 to MODEL.

    python tools/restrike-verify.py
"""
import io, os, re, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = os.path.join(HERE, "verify.mjs")

EDITS = [
    # 1. the sources of record
    ('const csSpec = JSON.parse(fs.readFileSync(DEAL + "Model/cheatsheet-spec-v16.json", "utf8"));\n'
     'const csRender = fs.readFileSync("src/cheatsheet-render-v16.txt", "utf8");\n',
     'const cheatSrc = JSON.parse(fs.readFileSync(DEAL + "Model/docs/cheat-web-data.json", "utf8"));\n'),

    ('const v16Src = JSON.parse(fs.readFileSync(DEAL + "Model/docs/v16-figures.json", "utf8"));',
     'const modelSrc = JSON.parse(fs.readFileSync(DEAL + "Model/docs/v29-figures.json", "utf8"));'),

    ('const bridgeMd16 = fs.readFileSync(DEAL + "Model/docs/embassy-bridge-v16-20260818.md", "utf8");',
     'const bridgeMd29 = fs.readFileSync(DEAL + "Model/docs/embassy-bridge-v29-20260819.md", "utf8");'),

    ('const restrikeMd = fs.readFileSync(DEAL + "Model/docs/v16-restrike-20260818.md", "utf8");',
     'const restrikeMd = fs.readFileSync(DEAL + "Model/docs/v29-portal-restrike-20260819.md", "utf8");'),

    ('const bridgeMd = fs.readFileSync(DEAL + "Model/docs/embassy-bridge-20260816.md", "utf8");\n'
     'const bridgeHtml = fs.readFileSync(DEAL + "Deck/irr-bridge/index.html", "utf8");\n', ''),

    ('const bridgeText = (norm(bridgeMd16) + " \\u00b6 " + norm(bridgeMd) + " \\u00b6 " + norm(bridgeHtml)).toLowerCase();',
     'const bridgeText = norm(bridgeMd29).toLowerCase();'),

    ('const csSpecText = quotes(JSON.stringify(csSpec).replace(/\\\\"/g, \'"\')).replace(/\\s+/g, " ").toLowerCase();\n'
     'const csRenderText = quotes(csRender.replace(/ \\| /g, " ")).replace(/\\s+/g, " ").toLowerCase();\n',
     'const cheatText = quotes(JSON.stringify(cheatSrc).replace(/\\\\"/g, \'"\')).replace(/\\s+/g, " ").toLowerCase();\n'),

    # 2. what counts as registered
    ('walkReg(v16Src.fig); walkReg(v16Src.ladder); walkReg(v16Src.backsolve); walkReg(v16Src.sens);\n'
     'walkReg(v16Src.margin); walkReg(v16Src.cases); walkReg(v16Src.flows); walkReg(v16Src.flow_totals);\n'
     'walkReg(v16Src.pnl_years); walkReg(v16Src.bridge); walkReg(v16Src.bridge_meta);\n'
     'walkReg(v16Src.capex_chain); walkReg(v16Src.capex_groups); walkReg(v16Src.capex_loading);\n'
     'walkReg(v16Src.capex_inflation); walkReg(v16Src.extra); walkReg(v16Src.derived);',
     'walkReg(modelSrc.fig); walkReg(modelSrc.ladder); walkReg(modelSrc.rungs);\n'
     'walkReg(modelSrc.backsolve); walkReg(modelSrc.sens); walkReg(modelSrc.margin);\n'
     'walkReg(modelSrc.cases); walkReg(modelSrc.flows); walkReg(modelSrc.flow_totals);\n'
     'walkReg(modelSrc.pnl_years); walkReg(modelSrc.bridge); walkReg(modelSrc.bridge_meta);\n'
     'walkReg(modelSrc.extra); walkReg(modelSrc.derived); walkReg(cheatSrc);'),

    ('  || csRenderText.includes(t) || csSpecText.includes(t) || pnlRegText.includes(t)',
     '  || cheatText.includes(t) || pnlRegText.includes(t)'),

    # the bridge table now lives in this version's record
    ('const bridgeTable = bridgeMd16.slice(bridgeMd16.indexOf("| # | Lever"), bridgeMd16.indexOf("Net:"));',
     'const bridgeTable = bridgeMd29.slice(bridgeMd29.indexOf("| # | Lever"), bridgeMd29.indexOf("Net:"));'),

    ('const csBase = (parseFloat(v16Src.fig.irr) ).toFixed(1) + "%";',
     'const csBase = (parseFloat(modelSrc.fig.irr)).toFixed(1) + "%";'),

    # 4. the export
    ('"; return { FIGS, V16, CAPEX,', '"; return { FIGS, MODEL, CAPEX,'),
]

# 3. the retired figures, and section E rebuilt against the pack
STALE_BLOCK = r'''
/* ══ the retired figures ═══════════════════════════════════════════

   The portal was cut on v15, re-struck onto v16 and now onto v29. Each of
   those records was a registered source in its turn, so a figure left behind
   from an earlier one passes every check that asks "is this a real number
   somewhere". These are the headline figures of the retired versions, and none
   of them may appear on a model-figure surface: the chapters, the case plates,
   the cheat sheet, the dial sheet, the ladder, the bridge or the figures map.
   Comparable packs are excluded, where the same string can be another hotel's
   honest number. */

const RETIRED = [
  /* v16 */ "12.99%", "12.9930%", "1.84x", "£109.8m", "£92.5m", "£123.6m", "£44.4m",
  "£168.0m", "£194.2m", "£45.33m", "33.96%", "£248.0m", "£4.13m", "10.87%", "1.76x",
  "£116.9m", "£3.24m", "£2.06m", "£3.70m", "£15.39m", "£10.74m", "23.69%", "£46.7m",
  "£95.9m", "£111.9m", "£95.5m", "£121.5m", "£11.01m", "£10.59m", "£264.8m", "£49.97m",
  "146-line", "143-line", "£755,507", "£19.72m", "£9.12m", "£16.49m", "£282.0m",
  /* v15 */ "£107.3m", "£161.8m",
];
const modelSurface = JSON.stringify([mod.FIGS, mod.CHAPTERS, mod.CASES, mod.CHEAT, mod.DIALS,
  mod.DIAL_SRC, mod.LADDER, mod.BRIDGE, mod.FIELD]);
const liveFigures = new Set(Object.values(modelSrc.fig).map(String));
for (const t of RETIRED) {
  checked++;
  if (liveFigures.has(t)) continue;          /* the model has come back to it */
  if (modelSurface.includes(t))
    fail("RETIRED FIGURE STILL ON THE PAGE", `"${t}" is from a superseded version of the model`);
}
'''

SECTION_E = r'''/* ══ E. the cheat sheet ════════════════════════════════════════════

   Chapter 09 renders the workbook's own Cheat Sheet tab through a pack built
   from it, so the check is equality with that pack rather than a search for
   each string in a spec. The tab is formula-linked to the model, so this also
   ties the chapter to the model without a second measurement. */

const C = mod.CHEAT;
const cheatShipped = JSON.parse(JSON.stringify(C));
const cheatSource = JSON.parse(JSON.stringify(cheatSrc));
delete cheatSource.meta;
delete cheatShipped.meta;
const leafEq = (a, b, path) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    checked++;
    if (a.length !== b.length) { fail("CHEAT PACK LENGTH", `${path}: page ${a.length} vs pack ${b.length}`); return; }
    a.forEach((v, i) => leafEq(v, b[i], `${path}[${i}]`));
    return;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a), kb = Object.keys(b);
    checked++;
    if (ka.join() !== kb.join()) { fail("CHEAT PACK KEYS", `${path}: ${ka.join()} vs ${kb.join()}`); return; }
    for (const k of ka) leafEq(a[k], b[k], `${path}.${k}`);
    return;
  }
  checked++;
  if (String(a ?? "") !== String(b ?? ""))
    fail("CHEAT PACK LEAF", `${path}: page "${a}" vs pack "${b}"`);
};
leafEq(cheatShipped, cheatSource, "CHEAT");

/* the sensitivity grid's own base cell must tie the measured record */
checked++;
const csBase = (parseFloat(modelSrc.fig.irr)).toFixed(1) + "%";
if (C.sensitivity.grid[C.sensitivity.base[0]][C.sensitivity.base[1]] !== csBase)
  fail("SENSITIVITY BASE", "base cell is "
    + C.sensitivity.grid[C.sensitivity.base[0]][C.sensitivity.base[1]]
    + ", the model prints " + csBase);

/* the pack must have been built from the model the record was measured on */
checked++;
if (cheatSrc.meta.snapshot_sha256 !== modelSrc.meta.snapshot_sha256)
  fail("CHEAT PACK IS OFF ANOTHER MODEL",
    `${cheatSrc.meta.snapshot_sha256.slice(0, 12)} vs ${modelSrc.meta.snapshot_sha256.slice(0, 12)}`);
'''


def main():
    s = io.open(V, encoding="utf-8").read()
    before = len(s)
    for old, new in EDITS:
        n = s.count(old)
        assert n == 1, f"{n} hits for: {old[:80]!r}"
        s = s.replace(old, new)
        print(f"  ok  {old.splitlines()[0][:66]}")

    # replace section E wholesale
    a = s.index("/* ══ E. the cheat sheet")
    b = s.index("/* ══ F. the comparable")
    s = s[:a] + SECTION_E + "\n" + s[b:]
    print("  ok  section E rebuilt against the pack")

    # the retired-figure check goes in just before the house rules
    a = s.index("/* ══ house rules")
    s = s[:a] + STALE_BLOCK.lstrip("\n") + "\n" + s[a:]
    print("  ok  retired-figure check added")

    # the doctrine header
    s = s.replace(
        "   E. THE CHEAT SHEET  every label, note and static value verbatim in\n"
        "                       Model/cheatsheet-spec.json; every measured value\n"
        "                       verbatim in the sheet's own render.",
        "   E. THE CHEAT SHEET  the shipped block equals Model/docs/cheat-web-data.json,\n"
        "                       built from the workbook's own Cheat Sheet tab, leaf for\n"
        "                       leaf, and the pack is off the measured model.")
    io.open(V, "w", encoding="utf-8", newline="").write(s)
    print(f"rewrote {V}  ({before:,} -> {len(s):,} bytes)")


if __name__ == "__main__":
    main()
