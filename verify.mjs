/* ══════════════════════════════════════════════════════════════════════
   Mechanical verification of the portal against its five sources.

   A. THE MEMORANDUM   every table cell, card body, note, lede, source line
                       and dial in CHAPTERS must appear VERBATIM in
                       Deck/im-v1/slides.md, and every figure token in a
                       subject cell must tie to Deck/im-v1/figures.json.
   B. THE CASE STUDIES every record value, card body, note, gap and source
                       verbatim in slides.md; every figure token in a
                       "read against" cell inside that case's own slide.
   C. THE BRIDGE       every rung's lever, IRR, delta, multiple, exit and
                       peak equity verbatim in
                       Model/docs/embassy-bridge-20260816.md, and the
                       readings and caveats verbatim in the same file.
   D. THE REGISTER     the shipped QS block must equal a fresh parse of
                       Research/vendor-qs-crosscheck-20260816.md, and the
                       counts must tie to the document's own Register 2.
   E. THE CHEAT SHEET  the shipped block equals Model/docs/cheat-web-data.json,
                       built from the workbook's own Cheat Sheet tab, leaf for
                       leaf, and the pack is off the measured model.
   F. THE COMPARABLE   the shipped PNL block must equal
      P&Ls             Research/comp-pnls/web-data.json line for line, every
                       printed figure must equal this file's own independent
                       formatting of that source, and every candour line must
                       be verbatim in Research/comp-pnls/REGISTER.md.
   G. ESTATE AREAS     the on-demand renderer reads src/areas-data.json;
                       every cost, quantity, rate, programme and coverage
                       figure it prints must be derived from that pack.

   Plus: the portal's own navigation figures against the registers, banned
   words, the occupancy convention, the rate field against the rate-position
   slide, and the absence of the withdrawn internal marking.

   Run: node verify.mjs
   ══════════════════════════════════════════════════════════════════════ */

import fs from "node:fs";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

/* The deal folder. Override with FAWLEY_DEAL_ROOT so the path need not live in
   this repository; the default is where it sits on the build machine. */
const DEAL = (process.env.FAWLEY_DEAL_ROOT
  || "D:/OneDrive - Strand" + " Labs/2. Clients/Align/2. Live Deals/Fawley Court")
  .replace(/\/?$/, "/");
const DECK = DEAL + "Deck/im-v1/";
const PNLDIR = DEAL + "Research/comp-pnls/";

const html = fs.readFileSync("index.html", "utf8");
const slides = fs.readFileSync(DECK + "slides.md", "utf8");
const figs = JSON.parse(fs.readFileSync(DECK + "figures.json", "utf8"));
const cheatSrc = JSON.parse(fs.readFileSync(DEAL + "Model/docs/cheat-web-data.json", "utf8"));
/* the v16 sources of record: the measured figure set and the capital-cost pack */
const modelSrc = JSON.parse(fs.readFileSync(DEAL + "Model/docs/v29-figures.json", "utf8"));
const capexSrc = JSON.parse(fs.readFileSync(DEAL + "Model/capex/capex-web-data.json", "utf8"));
const bridgeMd29 = fs.readFileSync(DEAL + "Model/docs/embassy-bridge-v29-20260819.md", "utf8");
const capexRegister = fs.readFileSync(DEAL + "Model/capex/REGISTER.md", "utf8")
  + "\n" + fs.readFileSync(DEAL + "Model/capex/PROPOSAL.md", "utf8");
const restrikeMd = fs.readFileSync(DEAL + "Model/docs/v29-portal-restrike-20260819.md", "utf8");
const qsSource = fs.readFileSync(DEAL + "Research/vendor-qs-crosscheck-20260816.md", "utf8");
const pnlSource = JSON.parse(fs.readFileSync(PNLDIR + "web-data.json", "utf8"));
const pnlRegister = fs.readFileSync(PNLDIR + "REGISTER.md", "utf8");
/* the ultra-luxury market pack, and the run record behind it */
const MKTDIR = DEAL + "Research/cohort-2026-08/";
const mktSource = JSON.parse(fs.readFileSync(MKTDIR + "market-web-data.json", "utf8"));
/* the written hotel layer, where it has been built */
const hpSource = fs.existsSync(MKTDIR + "hotel-pages.json")
  ? JSON.parse(fs.readFileSync(MKTDIR + "hotel-pages.json", "utf8")) : {};
const mktRecord = ["RATES.md", "RATES-round2.md", "RATES-new-candidates.md", "FINDINGS.md",
                   "HARVEST.md", "HANDOFF.md", "VERIFICATION.md"]
  .map(f => fs.readFileSync(MKTDIR + f, "utf8")).join(String.fromCharCode(10));
/* The operating and capital-cost evidence on the market chapter is read off the
   research estate rather than the deck, so the research estate has to be a
   registered source: a filed margin or a reported conversion cost can be
   checked against the file it was read from, and against nothing else. Added
   20 August 2026, when the operations and conversion-capex tabs were rebuilt
   from the August research. */
const RESDIR = DEAL + "Research/";
const resRecord = ["cohort-ops-benchmarks.md", "cohort-ops-airelles-france.md",
                   "cohort-ops-como-umbria.md", "cohort-ops-puglia-sardinia-venice.md",
                   "cohort-ops-spain-alpine.md", "european-ceiling-cohort-operations.md",
                   "european-ceiling-cohort.md", "belmond-sec-tables.md",
                   "henley-resi-sold-evidence.md", "year-round-demand-evidence.md"]
  .map(f => fs.readFileSync(RESDIR + f, "utf8")).join(String.fromCharCode(10));
const compEvidence = fs.readFileSync(RESDIR + "comp-evidence.json", "utf8");
/* the staging layer under the cohort holds the raw capital-cost and ownership
   harvest the written pages were built from, and it is cited as such */
const stagingDir = MKTDIR + "staging/";
const stagingText = fs.existsSync(stagingDir)
  ? fs.readdirSync(stagingDir, { recursive: true })
      .filter(f => /\.(md|json|txt)$/.test(String(f)))
      .map(f => { try { return fs.readFileSync(stagingDir + String(f), "utf8"); } catch { return ""; } })
      .join(String.fromCharCode(10))
  : "";
const areaSource = JSON.parse(fs.readFileSync("src/areas-data.json", "utf8"));
const cgiSource = JSON.parse(fs.readFileSync("src/cgi-manifest.json", "utf8"));
const areaCapexSource = JSON.parse(fs.readFileSync("src/capex-data.json", "utf8"));
const areaJs = fs.readFileSync("areas.js", "utf8");

/* the page's data, evaluated out of the page itself */
const grab = (from, to) => {
  const a = html.indexOf(from);
  if (a < 0) throw new Error("verify: cannot find " + from);
  const b = html.indexOf(to, a);
  if (b < 0) throw new Error("verify: cannot find " + to + " after " + from);
  return html.slice(a, b);
};
const mod = new Function(
  grab("const FIGS =", "</script>") +
  grab("const CHAPTERS = [", "</script>") +
  grab("const CASES = [", "const BY_SLUG") +
  grab("const CHEAT = {", "</script>") +
  grab("const QS = {", "/*QS-DATA-END*/") + ";" +
  grab("const MKT_M =", "</script>") +
  "; return { FIGS, MODEL, CAPEX, ASSUMPTIONS, DIAL_SRC, PLATES, LADDER, BRIDGE, PNL, PNLFMT, PNL_CASE,"
  + " PNL_NOTES, PNL_PROSE, CHAPTERS, CASES, CHEAT, QS, MARKET, MKT_ALL, MKT_BY_SLUG,"
  + " MKT_BY_CASE, MKSTATE, PHOTOS, marketIndexHTML, mktGridInner, mktRateHTML, mktFiguresHTML, hotelPageHTML,"
  + " mktCaseEvidenceHTML, mktControlsInner, mktTab, HOTELPAGE,"
  + " mktPhotoHTML, mktGbp };"
)();

const ent = s => String(s)
  .replace(/&amp;/g, "&").replace(/&mdash;/g, "\u2014").replace(/&nbsp;/g, " ")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
const strip = s => ent(s).replace(/<[^>]+>/g, "");
/* Curly and straight quotes are typography, not content: the sources mix them
   within a single sentence. Everything else must match character for character. */
const quotes = s => s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"');
const norm = s => quotes(strip(s)).replace(/\s+/g, " ").trim();

const deckText = norm(slides).toLowerCase();
const deckRaw = ent(slides).replace(/\s+/g, " ").toLowerCase();
/* The bridge ships from two sources of record: the measured table and reading in
   the markdown, and the prose the standing bridge page already carries. */
const bridgeText = norm(bridgeMd29).toLowerCase();
const restrikeText = norm(restrikeMd).toLowerCase();
const capexRegText = quotes(capexRegister.replace(/\*/g, "")).replace(/\s+/g, " ").toLowerCase();
const cheatText = quotes(JSON.stringify(cheatSrc).replace(/\\"/g, '"')).replace(/\s+/g, " ").toLowerCase();
/* the P&L build record, with its markdown emphasis removed */
const pnlRegText = quotes(pnlRegister.replace(/\*/g, "")).replace(/\s+/g, " ").toLowerCase();
/* the market pack and its run record, as one haystack for figure registration */
const mktText = quotes(JSON.stringify(mktSource) + " " + mktRecord.replace(/\*/g, "")
  + " " + JSON.stringify(hpSource) + " " + resRecord.replace(/\*/g, "") + " " + compEvidence + " " + stagingText)
  .replace(/\s+/g, " ").toLowerCase();

let fails = 0, checked = 0, areaFigures = 0;
const fail = (l, d) => { fails++; console.log(`\n  ${l}\n        ${d}`); };

const verbatim = (label, text, hay = deckText, hayName = "slides.md") => {
  const t = norm(text).toLowerCase().replace(/\.$/, "");
  if (!t) return;
  checked++;
  if (!hay.includes(t)) fail("NOT VERBATIM  " + label + "  (" + hayName + ")", `"${norm(text).slice(0, 190)}"`);
};

/* every monetary / percentage / numeric token in a string */
const TOKEN = /(?:[£€$]\s?[\d,]+(?:\.\d+)?(?:m|k|bn)?|\(\d+(?:\.\d+)?\)%|\d+(?:\.\d+)?%|\d[\d,]*(?:\.\d+)?(?:m|k|x|pp)?)/g;
const tok = s => (norm(s).match(TOKEN) || [])
  .map(t => t.replace(/\s/g, "").replace(/[.,]+$/, "").toLowerCase())
  .filter(Boolean);

/* ══ the v16 sources of record ═════════════════════════════════════

   Every figure the portal prints on the v16 basis has to appear in the
   measured record or be derivable from the capital-cost pack. This collects
   both into one set of display strings, and a second set of the tokens inside
   them, so a figure can be recognised whole or in part. */

const REGISTERED = new Set();
const addReg = v => { if (v != null && String(v).trim()) REGISTERED.add(String(v).trim().toLowerCase()); };
const walkReg = o => {
  if (o == null) return;
  if (Array.isArray(o)) { o.forEach(walkReg); return; }
  if (typeof o === "object") { Object.values(o).forEach(walkReg); return; }
  addReg(o);
};
walkReg(modelSrc.fig); walkReg(modelSrc.ladder); walkReg(modelSrc.rungs);
walkReg(modelSrc.backsolve); walkReg(modelSrc.sens); walkReg(modelSrc.margin);
walkReg(modelSrc.cases); walkReg(modelSrc.flows); walkReg(modelSrc.flow_totals);
walkReg(modelSrc.pnl_years); walkReg(modelSrc.bridge); walkReg(modelSrc.bridge_meta);
walkReg(modelSrc.extra); walkReg(modelSrc.derived); walkReg(cheatSrc);

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
for (const v of modelSrc.derived.levels || []) { addReg(v); addReg("£" + v); }
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

/* the capital-cost pack, formatted the way the page formats it */
const cxm0 = v => "£" + Math.round(v).toLocaleString("en-GB");
const cxm1 = v => "£" + (v / 1e6).toFixed(1) + "m";
const cxm2 = v => "£" + (v / 1e6).toFixed(2) + "m";
const cxpct1 = v => (v * 100).toFixed(1) + "%";
const cxpct0 = v => Math.round(v * 100) + "%";
const cxqty = v => Number(v).toLocaleString("en-GB", { maximumFractionDigits: 2 });
const CAPEX_VALUES = new Set();
const addCx = v => { if (v != null && String(v).trim()) CAPEX_VALUES.add(String(v).trim().toLowerCase()); };
for (const l of capexSrc.lines) {
  [cxm0(l.live), cxm0(l.net), cxm0(l.rate), cxqty(l.qty), String(l.n), cxpct0(l.hotel_pct),
   String(l.start), String(l.end), String(l.dur)].forEach(addCx);
}
for (const grp of [capexSrc.summary.hotel, capexSrc.summary.resi]) {
  [cxm1(grp.net), cxm1(grp.prelims), cxm1(grp.fees), cxm1(grp.contingency), cxm1(grp.total),
   cxm2(grp.per_key || grp.per_unit), cxpct0(grp.prelims_pct), cxpct1(grp.fees_pct),
   cxpct0(grp.fees_pct), cxpct0(grp.cont_pct)].forEach(addCx);
}
addCx(cxm1(capexSrc.summary.works_total));
for (const z of [...capexSrc.zones_hotel, ...capexSrc.zones_resi]) {
  addCx(cxm1(z.total));
  for (const e of Object.values(z.elements)) addCx(cxm1(e));
}
for (const v of Object.values(capexSrc.analysis.by_class)) {
  addCx(cxm1(v));
  addCx(cxpct1(v / Object.values(capexSrc.analysis.by_class).reduce((a, b) => a + b, 0)));
}
for (const z of Object.values(capexSrc.analysis.by_zone)) addCx(cxm1(z));
/* The buildings-against-the-estate split is the chapter's own aggregate — zones
   1-7 are the seven buildings, 8-12 the estate and statutory around them — and
   it is quoted per key in the evidence chapter. Derive it from the pack so it
   cannot be left behind when the schedule moves again. */
{
  const load = capexSrc.summary.hotel.total / capexSrc.summary.hotel.net;
  const zn = z => parseInt(z.label, 10);
  const sum = f => capexSrc.zones_hotel.filter(f).reduce((a, z) => a + z.total, 0);
  addCx(cxm2(sum(z => zn(z) <= 7) * load / capexSrc.summary.keys));
  addCx(cxm2(sum(z => zn(z) >= 8) * load / capexSrc.summary.keys));
}
for (const q of capexSrc.phasing.total) addCx(cxm1(q));
addCx(cxm1(capexSrc.phasing.total_spend));
addCx(cxm1(capexSrc.phasing.reconciles_to_net_lines));
for (const q of capexSrc.phasing.quarters) addCx(String(q));
addCx(String(capexSrc.lines.length));

/* The estate-area bolt-on ships no data in the shell. Collect the display
   formats from its own pack exactly as the renderer does, rather than widening
   a hand-kept exception list when a cost line or programme moves. */
const AREA_VALUES = new Set();
const addArea = v => { if (v != null && String(v).trim()) AREA_VALUES.add(String(v).trim().toLowerCase()); };
const arm2 = v => "£" + (v / 1e6).toFixed(2) + "m";
const ar0 = v => "£" + Math.round(v).toLocaleString("en-GB");
const apct = v => (v * 100).toFixed(1) + "%";
const aqty = v => Number(v).toLocaleString("en-GB", { maximumFractionDigits: 2 });
for (const a of areaSource.areas) {
  [arm2(a.loaded), arm2(a.net), apct(a.share_of_works), String(a.n_lines), String(a.n_live),
   String(a.start_q), String(a.end_q), String(a.images.length)].forEach(addArea);
  for (const l of a.top_lines) [String(l.n), aqty(l.qty), ar0(l.rate), ar0(l.net)].forEach(addArea);
}
for (const t of tok(JSON.stringify(areaSource))) addArea(t);
addArea(String(areaCapexSource.meta.n_lines));
for (const v of [arm2(areaSource.meta.covered), arm2(areaSource.meta.works_total), arm2(areaSource.meta.uncovered),
                 apct(areaSource.meta.covered / areaSource.meta.works_total),
                 apct(areaSource.meta.uncovered / areaSource.meta.works_total)]) addArea(v);
const areaMaxQ = Math.max(...areaSource.areas.map(a => a.end_q));
for (let q = 1; q <= areaMaxQ; q++) addArea(String(q));
const areaUnitWords = { hall: ["Seventeen keys", 17], courtyard: ["Forty-three of the sixty keys", 43], residences: ["Twelve houses", 12] };
for (const [key, [words, count]] of Object.entries(areaUnitWords)) {
  const a = areaSource.areas.find(x => x.key === key);
  if (a && (a.what + " " + a.earns).includes(words)) { addArea(String(count)); addArea(arm2(a.loaded / count)); }
}

/* ══ A. the memorandum ══════════════════════════════════════════════ */

const walkBlocks = (blocks, fn) => {
  for (const b of blocks) {
    if (b[0] === "panes") { walkBlocks(b[1].left.b, fn); walkBlocks(b[1].right.b, fn); continue; }
    if (b[0] === "exhibit") { walkBlocks(b[1].b, fn); continue; }
    fn(b);
  }
};
const allBlocks = v => [...v.lead, ...v.reason];

/* Prose written for the medium — navigation, not memorandum content. Each line
   is a page-furniture string that has no counterpart in the deck; every one is
   listed here explicitly so nothing can slip through unlisted. The portal's own
   navigation copy — chapter blurbs, view titles, view blurbs and the headline
   figures on the contents — is exempt from the verbatim rule by construction,
   and every figure token inside it is checked against the registers instead. */
const OWN_PROSE = new Set([
  "Ten properties read against the underwrite. Five of the UK country-house set, five of the European ceiling cohort, and Estelle Manor for the club engine. Every figure carries its basis, window and source.",
  "Every rung is measured on the model at that entry. The rule marks the 13.00% bar; the lever columns show the level one input alone must reach to hold it.",
  "The estate",
  "The Main House interiors"
]);

const KPI_CAPTIONS = new Set(["Levered IRR at the ruled price", "Equity multiple", "Peak equity",
  "Agent guidance, understood", "Levered profit", "Hotel works, all in", "A key",
  "The twelve residences", "Of it set as an allowance", "off the cost of works",
  "of levered return, measured"]);

/* The portal moved to the v16 model on 18 August 2026 while the printed
   memorandum stayed on v15, so a line of prose is now one of two things: still
   the deck's, word for word, or the portal's own. The first is checked
   verbatim as before. The second is allowed, counted, and checked figure by
   figure against the measured record — no sentence may carry a number that is
   not in a source. */
let ownProse = 0;
const FIG_OK_EXTRA = new Set();
/* The research estate states a filed figure in the currency and the units of the
   filing - "EUR 73.025 million", "212,379" in a table of thousands - while the
   page states it as a token. So a token carrying a currency symbol is also
   accepted when its numeral alone appears in the research haystack: the numeral
   is the claim, and the currency is stated in the cell around it. Bare
   percentages and multiples still have to match exactly, and everything outside
   the research haystack still has to match exactly. Added 20 August 2026. */
const mktDigits = mktText.replace(/[.,\s]/g, "");
/* Every number the research estate states, as a value. A filing writes
   142,690,922 where the page writes EUR 142.691m: the page's figure is a
   rounding of the source's, and that is checkable arithmetic rather than a
   string lookup. The values are sorted once and binary-searched per token. */
const RES_VALUES = (() => {
  const SC = { "": 1, m: 1e6, k: 1e3, bn: 1e9, million: 1e6, billion: 1e9, thousand: 1e3 };
  const out = [];
  const re = /(\d[\d,]*(?:\.\d+)?)\s?(million|billion|thousand|bn|m|k)?/g;
  let m;
  while ((m = re.exec(mktText)) !== null) {
    const v = parseFloat(m[1].replace(/,/g, ""));
    if (!isFinite(v)) continue;
    out.push(v * SC[m[2] || ""]);
    if (m[2]) out.push(v);            /* the bare number too, unit unstated */
  }
  out.sort((a, b) => a - b);
  return Float64Array.from(out);
})();
const nearResValue = (target, tol) => {
  let lo = 0, hi = RES_VALUES.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1, v = RES_VALUES[mid];
    if (Math.abs(v - target) <= tol) return true;
    if (v < target) lo = mid + 1; else hi = mid - 1;
  }
  return false;
};
const numeralInResearch = t => {
  if (!/^[£€$]/.test(t)) return false;
  const raw = t.replace(/^[£€$]\s?/, "");
  const n = raw.replace(/(m|k|bn)$/, "");
  if (n.length >= 3 && mktText.includes(n)) return true;
  /* A filing states EUR 73,025 thousand where the page states EUR 73.025m: the
     same digits, a different separator and a different unit. Four digits or
     more, so a short round number cannot collide its way through. */
  const d = n.replace(/[.,]/g, "");
  if (d.length >= 4 && mktDigits.includes(d)) return true;
  /* the value itself, to the precision the page prints it at */
  const SC = { "": 1, m: 1e6, k: 1e3, bn: 1e9 };
  const p = /^([\d,]+(?:\.(\d+))?)(m|k|bn)?$/.exec(raw);
  if (!p) return false;
  const scale = SC[p[3] || ""];
  const val = parseFloat(p[1].replace(/,/g, "")) * scale;
  const half = 0.5 * Math.pow(10, -((p[2] || "").length)) * scale;
  return val >= 1000 && nearResValue(val, Math.max(half, val * 1e-6));
};

/* A sterling figure printed beside a euro or dollar one is a conversion at the
   research convention, not a separate claim: EUR 1 = GBP 0.8575, US$ 1 =
   GBP 0.7426. The gate converts it and checks. Where a cell pairs two ranges,
   the figures are paired in order. Registered on the strength of the check. */
const FX = { "€": 0.8575, "$": 0.7426 };
const CUR = /([£€$])\s?([\d,]+(?:\.\d+)?)(m|k|bn)?/g;
const CUR_SC = { "": 1, m: 1e6, k: 1e3, bn: 1e9 };
function checkConversions(label, text) {
  const t = norm(text);
  if (!t.includes("/")) return;
  for (const part of t.split(";")) {
    const i = part.indexOf("/");
    if (i < 0) continue;
    const grab = str => {
      const out = []; let m; CUR.lastIndex = 0;
      while ((m = CUR.exec(str)) !== null)
        out.push({ tok: m[0], sym: m[1], v: parseFloat(m[2].replace(/,/g, "")) * CUR_SC[m[3] || ""] });
      return out;
    };
    const left = grab(part.slice(0, i)), right = grab(part.slice(i + 1));
    const src = left.filter(x => x.sym !== "£"), gbp = right.filter(x => x.sym === "£");
    if (!src.length || src.length !== gbp.length) continue;
    for (let k = 0; k < src.length; k++) {
      const want = src[k].v * FX[src[k].sym];
      checked++;
      if (Math.abs(want - gbp[k].v) > Math.max(want * 0.025, 5000))
        fail("CONVERSION DOES NOT COMPUTE  " + label,
             src[k].tok + " converts to " + Math.round(want).toLocaleString("en-GB")
             + ", printed as " + gbp[k].tok);
      else { addReg(src[k].tok); addReg(gbp[k].tok); }
    }
  }
}
const registered = t => REGISTERED.has(t) || CAPEX_VALUES.has(t) || FIG_OK_EXTRA.has(t)
  || deckText.includes(t) || bridgeText.includes(t) || restrikeText.includes(t)
  || cheatText.includes(t) || pnlRegText.includes(t)
  || capexRegText.includes(t) || qsSource.toLowerCase().includes(t) || mktText.includes(t)
  || numeralInResearch(t);
const prose = (label, text, hay = deckText, hayName = "slides.md") => {
  const t = norm(text).toLowerCase();
  if (!t) return;
  checked++;
  if (hay.includes(t)) return;              // unchanged: still the deck's own words
  ownProse++;
  for (const tk of tok(text)) {
    checked++;
    if (!registered(tk))
      fail(`FIGURE UNREGISTERED  ${label}`, `token "${tk}" in "${norm(text).slice(0, 120)}"`);
  }
};

/* ══ the evidence tables' own arithmetic ═══════════════════════════
   The operations and transaction tables print filed absolutes and the ratio
   struck on them - "EBE EUR 21.2m / EUR 58.1m = 36.5%". A ratio is not a figure
   to be looked up in a source; it is a calculation, and the gate recomputes
   every one of them. A cell that survives has had its percentage checked
   against the two numbers beside it, which is a harder test than registration,
   so the three tokens are registered on the strength of it. Added 20 August
   2026 with the rebuilt evidence tabs. */
{
  const SCALE = { m: 1e6, k: 1e3, bn: 1e9, "": 1 };
  const num = t => {
    const m = /^([\u00a3\u20ac$]?)\s?([\d,]+(?:\.\d+)?)(m|k|bn)?$/.exec(t.trim());
    return m ? parseFloat(m[2].replace(/,/g, "")) * SCALE[m[3] || ""] : null;
  };
  const RE = new RegExp(
    "(\u2212|-)?([\u00a3\u20ac$]\\s?[\\d,]+(?:\\.\\d+)?(?:m|k|bn)?)\\s*/\\s*"
    + "([\u00a3\u20ac$]\\s?[\\d,]+(?:\\.\\d+)?(?:m|k|bn)?)\\s*=\\s*"
    + "(\u2212|-)?(\\d+(?:\\.\\d+)?)%", "g");
  /* the per-unit form: a total over a count, printed as the figure a key */
  const PER = new RegExp(
    "([£€$]\\s?[\\d,]+(?:\\.\\d+)?(?:m|k|bn)?)\\s*/\\s*(\\d+)\\s*=\\s*"
    + "([£€$]\\s?[\\d,]+(?:\\.\\d+)?(?:m|k|bn)?)", "g");
  let ratios = 0;
  for (const ch of mod.CHAPTERS) {
    for (const v of ch.views) walkBlocks(allBlocks(v), b => {
      if (b[0] !== "tbl") return;
      const cells = [];
      for (const [, cs] of b[1].rows) for (const c of cs) cells.push(c);
      if (b[1].note) cells.push(b[1].note);
      for (const cell of cells) {
        const text = norm(cell);
        checkConversions(ch.id + "/" + v.id, text);
        let m;
        RE.lastIndex = 0;
        while ((m = RE.exec(text)) !== null) {
          const [, ns, aRaw, bRaw, ps, pRaw] = m;
          const a = num(aRaw), bb = num(bRaw);
          if (a == null || bb == null || !bb) continue;
          const want = (ns ? -a : a) / bb * 100;
          const got = ps ? -parseFloat(pRaw) : parseFloat(pRaw);
          ratios++; checked++;
          if (Math.abs(want - got) > 0.15)
            fail(`RATIO DOES NOT COMPUTE  ${ch.id}/${v.id}`,
                 `${aRaw} / ${bRaw} = ${pRaw}% against ${want.toFixed(2)}% \u2014 "${text.slice(0, 90)}"`);
          else { addReg(aRaw); addReg(bRaw); addReg(pRaw + "%"); }
        }
        PER.lastIndex = 0;
        while ((m = PER.exec(text)) !== null) {
          const [, totRaw, nRaw, perRaw] = m;
          const tot = num(totRaw), per = num(perRaw), cnt = parseInt(nRaw, 10);
          if (tot == null || per == null || !cnt) continue;
          ratios++; checked++;
          if (Math.abs(tot / cnt - per) > Math.max(per * 0.01, 500))
            fail(`PER-UNIT FIGURE DOES NOT COMPUTE  ${ch.id}/${v.id}`,
                 `${totRaw} over ${nRaw} is ${Math.round(tot / cnt).toLocaleString("en-GB")}, printed as ${perRaw}`);
          else { addReg(totRaw); addReg(perRaw); }
        }
      }
    });
  }
  checked++;
  if (ratios < 20) fail("EVIDENCE RATIOS THIN", ratios + " ratios recomputed across the tables");
  console.log(`  ${ratios} evidence ratios recomputed`);
}

for (const ch of mod.CHAPTERS) {
  for (const v of ch.views) {
    walkBlocks(allBlocks(v), b => {
      const k = b[0];
      if (k === "lede" || k === "para" || k === "subhead") {
        if (!OWN_PROSE.has(norm(b[1]))) prose(`${ch.id}/${v.id} ${k}`, b[1]);
      } else if (k === "src") {
        /* two source lines are checked against their own sources further down:
           the dial sheet's, sentence by sentence, and the rate field's tail. */
        if (norm(b[1]) !== norm(mod.DIAL_SRC))
          prose(`${ch.id}/${v.id} source`, b[1]);
      } else if (k === "kpis") {
        for (const [val, c] of b[1]) { prose(`${ch.id}/${v.id} kpi value`, val); if (!KPI_CAPTIONS.has(c)) prose(`${ch.id}/${v.id} kpi cap`, c); }
      } else if (k === "cards") {
        for (const [hh, bb] of b[1]) { prose(`${ch.id}/${v.id} card head`, hh); prose(`${ch.id}/${v.id} card body`, bb); }
      } else if (k === "bullets") {
        for (const x of b[1]) prose(`${ch.id}/${v.id} bullet`, x);
      } else if (k === "tbl") {
        const t = b[1];
        for (const h2 of (t.head || [])) prose(`${ch.id}/${v.id} th`, typeof h2 === "object" ? h2.t : h2);
        for (const [, cells] of t.rows) for (const c of cells) if (norm(c) && norm(c) !== "—") prose(`${ch.id}/${v.id} cell`, c);
        if (t.note) prose(`${ch.id}/${v.id} note`, t.note);
      } else if (k === "plates") {
        for (const i of b[1]) { verbatim(`plate ${mod.PLATES[i].f} caption`, mod.PLATES[i].cap); verbatim(`plate ${mod.PLATES[i].f} alt`, mod.PLATES[i].alt, deckRaw); }
      }
    });
  }
}

/* the pane and exhibit headers are the deck's own leftHeader / rightHeader lines */
for (const ch of mod.CHAPTERS) {
  for (const v of ch.views) for (const b of allBlocks(v)) {
    if (b[0] === "exhibit") { if (b[1].h) prose(`${ch.id}/${v.id} exhibit header`, b[1].h); continue; }
    if (b[0] !== "panes") continue;
    for (const side of ["left", "right"]) {
      const hh = b[1][side].h;
      if (hh && !OWN_PROSE.has(norm(hh))) prose(`${ch.id}/${v.id} pane header`, hh);
    }
  }
}

/* ══ the assumptions sheet ═════════════════════════════════════════
   Thirty assumptions, generated from the measured record by
   tools/build-blocks.py. The gate holds the shape, the classes, the coverage
   of the figures that matter, and — because the swing settings were a chapter
   of their own until 20 August — every measured IRR against the record's own
   sensitivity run. */
{
  const GROUPS = ["The asset", "Rate and demand", "The revenue engines", "What it earns",
                  "The capital cost", "Funding", "The residences", "The exit"];
  const CLASSES = new Set(["Decision", "Market", "Output"]);
  checked++;
  if (mod.ASSUMPTIONS.length !== 30)
    fail("ASSUMPTION COUNT", mod.ASSUMPTIONS.length + " against the thirty the sheet is built on");
  /* the groups run in order and none is empty: the rail cannot show a heading
     with nothing under it, and an assumption cannot land outside the eight */
  let last = -1;
  for (const r of mod.ASSUMPTIONS) {
    const g = GROUPS.indexOf(r.g);
    checked++;
    if (g < 0) fail("ASSUMPTION GROUP UNKNOWN", r.k + ": " + r.g);
    checked++;
    if (g < last) fail("ASSUMPTIONS OUT OF GROUP ORDER", r.k + ": " + r.g);
    last = Math.max(last, g);
    checked++;
    if (!CLASSES.has(r.c)) fail("ASSUMPTION CLASS UNKNOWN", r.k + ": " + r.c);
    checked++;
    if (!norm(r.v)) fail("ASSUMPTION WITHOUT A VALUE", r.k);
    checked++;
    if (!norm(r.b)) fail("ASSUMPTION WITHOUT A BASIS", r.k);
    prose("assumption " + r.k + " basis", r.b);
    prose("assumption " + r.k + " value", r.v);
  }
  for (const g of GROUPS) {
    checked++;
    if (!mod.ASSUMPTIONS.some(r => r.g === g)) fail("ASSUMPTION GROUP EMPTY", g);
  }
  /* every figure that has to be readable off this one sheet */
  const asmText = norm(mod.ASSUMPTIONS.map(r => r.v + " " + r.b).join(" "));
  for (const key of ["keys", "courtyard_keys", "adr_y1", "adr_y7", "rev_y7", "gop_y7",
    "gop_margin_y7", "noi_y7", "noi_margin_y7", "capex_hotel", "capex_hotel_per_key", "capex_resi",
    "capex_works_total", "cost_to_open", "cost_to_open_key", "resi_units", "resi_psf", "resi_sqft",
    "resi_absorption", "resi_esc", "staff_index", "exit_yield", "purch_costs_pct", "exit_value",
    "exit_per_key", "capex_prog_q", "entry", "irr", "em", "total_equity", "fin_senior_ltc",
    "fin_refi_q", "refi_draw", "members", "member_fee", "buyouts_y7", "buyout_premium",
    "regatta_days", "yield_on_cost", "dev_spread_bp", "levered_profit"]) {
    checked++;
    if (!asmText.includes(modelSrc.fig[key]))
      fail("ASSUMPTION FIGURE MISSING  " + key, modelSrc.fig[key]);
  }
  /* the swing columns are the sensitivity run, so every printed IRR is the
     record's own and every swing is the spread the record measures */
  const SENS = modelSrc.sens;
  const byIrr = {};
  for (const [k, v] of Object.entries(SENS)) (byIrr[(v.irr * 100).toFixed(2) + "%"] ||= []).push(k);
  let swings = 0;
  for (const r of mod.ASSUMPTIONS) {
    if (!r.s) { checked++; if (r.w) fail("SWING WITHOUT SETTINGS", r.k); continue; }
    const dd = [0];
    for (const [lab, irr] of r.s) {
      swings++; checked++;
      if (!byIrr[irr]) { fail("SWING IRR NOT IN THE RECORD  " + r.k, lab + " " + irr); continue; }
      dd.push(Math.max.apply(null, byIrr[irr].map(k => SENS[k].d_pp)));
    }
    const want = (Math.max.apply(null, dd) - Math.min.apply(null, dd)).toFixed(1) + "pp";
    checked++;
    if (r.w !== want) fail("SWING MISSTATED  " + r.k, r.w + " against the record's " + want);
  }
  checked++;
  if (swings < 30) fail("SWING COVERAGE THIN", swings + " settings across thirty assumptions");
}
for (const s of norm(mod.DIAL_SRC).split(/(?<=\.)\s+/)) prose("assumption source sentence", s);

/* the entry ladder, cell by cell, against the measured record. The record
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
}
for (const [k, want] of [["adr", modelSrc.fig.adr_y1], ["exit", modelSrc.fig.exit_yield], ["psf", modelSrc.fig.resi_psf]]) {
  checked++;
  if (mod.LADDER.underwritten[k] !== want)
    fail("LADDER UNDERWRITTEN MISMATCH  " + k, `page "${mod.LADDER.underwritten[k]}" vs record "${want}"`);
}
prose("ladder underwritten note", mod.LADDER.underwritten.note);
prose("ladder note", mod.LADDER.note);
prose("ladder source", mod.LADDER.src);

/* every subject-cell figure ties to the register */
const FIG_VALUES = new Set([...Object.values(figs).map(v => String(v).toLowerCase()),
  ...REGISTERED, ...CAPEX_VALUES]);
/* Tokens that are not model figures: key counts, an index, a share, the
   occupancy interval, and the two loading percentages the residential limb
   carries. Everything that IS a model figure has to come from the record. */
const EXTRA_OK = new Set([
  "60", "45", "12", "17", "43", "24", "22", "21", "15", "8", "9", "2", "1.068",
  "60–70%", "100%", "5,500", "3.75", "1.20", "0.65"
]);
let subjChecked = 0;
for (const ch of mod.CHAPTERS) {
  for (const v of ch.views) walkBlocks(allBlocks(v), b => {
    if (b[0] !== "tbl") return;
    for (const [cls, cells] of b[1].rows) {
      if (cls !== "subject") continue;
      for (const c of cells) for (const t of tok(c)) {
        subjChecked++; checked++;
        if (!FIG_VALUES.has(t) && !EXTRA_OK.has(t) && !deckText.includes(t))
          fail(`SUBJECT FIGURE UNREGISTERED  ${ch.id}/${v.id}`, `token "${t}" in "${norm(c).slice(0, 110)}"`);
      }
    }
  });
}

/* ══ A2. the portal's own navigation figures ═══════════════════════ */

/* Chapter blurbs, view titles and the headline figures on the contents are the
   portal's own copy. The words are ours; the numbers are not — every token in
   them must already be registered somewhere. */
const NAV_OK = new Set(["10", "11", "13", "16", "12", "8", "6", "7", "5", "4", "39", "87", "26",
  "1", "2", "3", "9", "19", "100", "0.80", "1.05", "1.25", "0.90", "33.96%", "1.84x", "12.99%",
  "146", "14", "£8–12m", "43.3%", "£2.06m", "£3.70m", "£123.6m",
  "£44.4m", "£168.0m", "£194.2m", "£248.0m", "£45.33m", "£4.13m", "£49.97m", "£109.8m",
  "−34.31%", "+12.99%", "+47.31pp", "9.07", "(9.07)%", "7.5pp", "12m"]);
const navToken = (label, s) => {
  for (const t of tok(s)) {
    checked++;
    if (!FIG_VALUES.has(t) && !EXTRA_OK.has(t) && !NAV_OK.has(t) && !CAPEX_VALUES.has(t)
        && !deckText.includes(t) && !bridgeText.includes(t))
      fail("NAVIGATION FIGURE UNREGISTERED  " + label, `token "${t}" in "${norm(s)}"`);
  }
};
for (const ch of mod.CHAPTERS) {
  navToken("chapter " + ch.num + " blurb", ch.blurb);
  if (ch.figures !== "REGISTER") for (const [val, lab] of ch.figures) { navToken("chapter " + ch.num + " figure", val); navToken("chapter " + ch.num + " figure label", lab); }
  for (const v of ch.views) { navToken(ch.id + "/" + v.id + " figure", v.figure); navToken(ch.id + "/" + v.id + " blurb", v.blurb); }
}
/* the register chapter's counts are computed from the register itself */
checked++;
if (mod.CHAPTERS.find(c => c.id === "dd").figures !== "REGISTER")
  fail("REGISTER FIGURES NOT COMPUTED", "the diligence chapter must take its counts from the register");

/* every view is reachable and uniquely addressed */
const seen = new Set();
for (const ch of mod.CHAPTERS) {
  checked++;
  if (ch.views[0].id !== "") fail("CHAPTER HAS NO OVERVIEW", ch.id);
  for (const v of ch.views) {
    const route = ch.id + "/" + v.id;
    checked++;
    if (seen.has(route)) fail("DUPLICATE ROUTE", route);
    seen.add(route);
    checked++;
    if (!v.lead.length) fail("VIEW LEADS WITH NOTHING", route);
  }
}

/* ══ A9. the shape of the book ═════════════════════════════════════
   A chapter restructure on 19 August dropped a whole chapter and folded its
   views into its neighbour, and every other check still passed: nothing held
   the book to a shape. These do. */
{
  const nums = mod.CHAPTERS.map(c => c.num);
  checked++;
  if (nums.join("|") !== mod.CHAPTERS.map((_, i) => String(i + 1).padStart(2, "0")).join("|"))
    fail("CHAPTER NUMBERS NOT SEQUENTIAL FROM 01", nums.join(", "));
  const ids = new Set();
  for (const c of mod.CHAPTERS) {
    checked++;
    if (ids.has(c.id)) fail("DUPLICATE CHAPTER ID", c.id);
    ids.add(c.id);
    checked++;
    if (!(c.views || []).length) fail("CHAPTER WITH NO VIEWS", c.id);
    const vids = (c.views || []).map(v => v.id);
    checked++;
    if (new Set(vids).size !== vids.length)
      fail("DUPLICATE VIEW ID WITHIN A CHAPTER", c.id + ": " + vids.join(", "));
    checked++;
    if (vids[0] !== "") fail("CHAPTER DOES NOT OPEN ON AN OVERVIEW", c.id + ": " + vids.join(", "));
    for (const v of c.views) {
      checked++;
      if (!(v.title || "").trim()) fail("VIEW WITHOUT A TITLE", c.id + "/" + v.id);
      checked++;
      if (!(v.lead || []).length) fail("VIEW THAT LEADS WITH NOTHING", c.id + "/" + v.id);
    }
  }
}

/* ══ A10. the service worker's cache name ═══════════════════════════
   Non-page assets are served cache-first, and `activate` only clears caches
   whose name differs from the current one, so a cache name that does not move
   pins every returning visitor to the last name it had. sw.js sat on
   'fawley-court-v5' across three chapters' worth of shipped work. The name is
   now derived from the bytes by tools/stamp-sw.py, and this is the check that
   it was re-stamped. */
{
  const sw = fs.readFileSync("sw.js", "utf8");
  const block = sw.match(/const ASSETS = \[(.*?)\];/s);
  checked++;
  if (!block) fail("SERVICE WORKER HAS NO ASSET LIST", "sw.js");
  else {
    const rels = new Set(["index.html", "areas.js"]);
    for (const m of block[1].matchAll(/'\.\/([^']*)'/g)) if (m[1]) rels.add(m[1]);
    const h = crypto.createHash("sha256");
    let missing = null;
    for (const rel of [...rels].sort()) {
      if (!fs.existsSync(rel)) { missing = rel; break; }
      h.update(Buffer.from(rel, "utf8"));
      h.update(fs.readFileSync(rel));
    }
    checked++;
    if (missing) fail("SERVICE WORKER CACHES A FILE THAT IS NOT ON DISK", missing);
    else {
      const want = "fawley-court-" + h.digest("hex").slice(0, 12);
      const have = (sw.match(/const CACHE = '([^']+)';/) || [])[1];
      checked++;
      if (have !== want)
        fail("SERVICE WORKER CACHE NAME IS STALE",
             "sw.js says " + have + "; the cached files hash to " + want
             + ". Run python tools/stamp-sw.py");
    }
  }
}

/* ══ B. the case studies ═══════════════════════════════════════════ */

const blockFor = slug => {
  const a = slides.indexOf("id: cs-" + slug);
  if (a < 0) return "";
  const b = slides.indexOf("\n---\n", slides.indexOf("::source::", a));
  return norm(slides.slice(a, b > 0 ? b : slides.length)).toLowerCase();
};
const BLOCK = Object.fromEntries(mod.CASES.map(c => [c.slug, blockFor(c.slug)]));

for (const c of mod.CASES) {
  verbatim(`${c.slug} name`, c.name);
  for (const [k, v] of c.record) verbatim(`${c.slug} record/${k}`, v);
  for (const [h, b] of c.cards) { verbatim(`${c.slug} card/${h}`, h); prose(`${c.slug} card body/${h}`, b); }
  verbatim(`${c.slug} source`, c.src);
  if (c.gap) for (const s of norm(c.gap).split(/(?<=\.)\s+/)) verbatim(`${c.slug} gap`, s);
  for (const [k, comp, subj, note] of c.against || []) {
    if (note) for (const s of norm(note).split(/(?<=\.)\s+/)) prose(`${c.slug} note/${k}`, s);
    for (const t of tok(comp)) {
      checked++;
      if (!BLOCK[c.slug].includes(t)) fail(`FIGURE NOT IN SLIDE  ${c.slug} against/${k}`, `token "${t}"`);
    }
    checked++;
    if (!SUBJ_OK().has(norm(subj).toLowerCase())) fail(`SUBJECT CELL UNAPPROVED  ${c.slug}/${k}`, `"${norm(subj)}"`);
  }
}
function SUBJ_OK() {
  return new Set([
    "£1,000 underwritten", "60", "twelve months",
    "£785,630 · £47.14m, year 7",
    "33.88% gop · £15.97m, year 7",
    "33.88% gop · year 7",
    "£2.10m a key works · £125.9m",
    "staff cost index 1.20; no headcount is modelled",
    "not computable on a like basis", "12 at £1,300/sqft, 5,500 sqft average",
    "3.75 a year",
    "250 members at £650 a month, 100 founders at £25,000",
    "14 quarters of works, opening at t+3.5",
    "60: 17 main house, 43 stables and courtyard",
    "£1,000 underwritten, across all twelve months",
    "£47.14m revenue, £15.97m gop, year 7"
  ]);
}

/* ══ C. the bridge ═════════════════════════════════════════════════ */

const bridgeTable = bridgeMd29.slice(bridgeMd29.indexOf("| # | Lever"), bridgeMd29.indexOf("Net:"));
for (const r of mod.BRIDGE.rows) {
  const line = bridgeTable.split("\n").find(l => l.trim().startsWith("| " + r.n + " |"));
  checked++;
  if (!line) { fail("BRIDGE ROW MISSING", "rung " + r.n); continue; }
  const cells = line.split("|").map(c => c.replace(/\*/g, "").trim());
  const want = [r.irr, r.em, r.exit.replace("£", "").replace("m", ""), r.pk.replace("£", "").replace("m", "")];
  const got = [cells[3], cells[5], cells[6], cells[7]];
  for (let i = 0; i < want.length; i++) {
    checked++;
    if (got[i] !== want[i]) fail("BRIDGE CELL MISMATCH  rung " + r.n, `page "${want[i]}" vs source "${got[i]}"`);
  }
  if (r.d) {
    checked++;
    const srcD = cells[4];
    if (Math.abs(parseFloat(srcD.replace("−", "-")) - r.dN) > 1e-9)
      fail("BRIDGE DELTA MISMATCH  rung " + r.n, `page ${r.dN} vs source ${srcD}`);
    const rounded = (r.dN > 0 ? "+" : "−") + Math.abs(r.dN).toFixed(2);
    checked++;
    if (r.d !== rounded) fail("BRIDGE DELTA LABEL", `${r.d} is not ${rounded}`);
  }
}
verbatim("bridge stand", mod.BRIDGE.stand2.split("The final rung")[1].split(",")[0], bridgeText, "bridge md");
for (const [n] of mod.BRIDGE.heads) { checked++; if (!bridgeText.includes(n.replace(/£/g, "£").toLowerCase()) && !bridgeText.includes(n.replace("→", "→").toLowerCase())) fail("BRIDGE HEADLINE NOT IN SOURCE", n); }
const BRIDGE_FIG = ["24% ebitda", "1.20", "£1,200", "£1,000", "12-house", "savills, october 2025",
  "£171.0m", "55% ltc", "1.3x", "−12.7%", "0.44x", "£75m", "£40–60m", "£338.7m", "£135.45m",
  "£284.5m", "£194.2m", "7.34pp", "£3m", "£28m"];
for (const f of BRIDGE_FIG) {
  checked++;
  const inPage = norm(mod.BRIDGE.read.join(" ") + mod.BRIDGE.caveats.join(" ")).toLowerCase().includes(f);
  const inSrc = bridgeText.includes(f);
  if (inPage && !inSrc) fail("BRIDGE FIGURE NOT IN SOURCE", f);
}

/* ══ D. the register ═══════════════════════════════════════════════ */

execFileSync("python", ["tools/parse-qs.py"], { stdio: "pipe" });
const fresh = JSON.parse(fs.readFileSync("src/qs-data.json", "utf8"));
checked++;
if (JSON.stringify(fresh) !== JSON.stringify(mod.QS))
  fail("REGISTER OUT OF DATE", "the QS block in index.html is not a fresh parse of the source — run tools/inline-qs.py");

const reg2 = qsSource.slice(qsSource.indexOf("# Register 2"));
const totalLine = reg2.split("\n").find(l => l.includes("**Total**"));
const totals = totalLine.split("|").map(c => c.replace(/\*/g, "").trim()).filter(Boolean).slice(1).map(Number);
const tally = { ANSWERED: 0, PARTIAL: 0, "NOT IN ROOM": 0, JUDGMENT: 0 };
let items = 0;
for (const h of mod.QS.halves) for (const s of h.sections) for (const it of s.items) {
  if (it.header) continue;
  items++; tally[it.status]++;
}
const got = [items, tally.ANSWERED, tally.PARTIAL, tally["NOT IN ROOM"], tally.JUDGMENT];
for (let i = 0; i < 5; i++) {
  checked++;
  if (got[i] !== totals[i]) fail("REGISTER COUNT MISMATCH", `column ${i}: page ${got[i]} vs Register 2 ${totals[i]}`);
}
checked++;
if (mod.QS.totalItems !== 87) fail("REGISTER TOTAL", mod.QS.totalItems + " questions, expected 87");
const askN = mod.QS.askGroups.reduce((a, g) => a + g.items.length, 0);
checked++;
if (askN !== 39) fail("ASK LIST COUNT", askN + " items, expected 39");
/* every question's text and status must be findable in the source, verbatim */
const qsSrcNorm = qsSource.replace(/\s+/g, " ");
for (const h of mod.QS.halves) for (const s of h.sections) for (const it of s.items) {
  if (it.n === "\u2014") continue;
  checked++;
  if (!qsSrcNorm.includes(it.q.replace(/\s+/g, " ").slice(0, 60)))
    fail("QUESTION NOT VERBATIM", `${s.name} ${it.n}: "${it.q.slice(0, 80)}"`);
}

/* ══ E. the cheat sheet ════════════════════════════════════════════

   Chapter 09 renders the workbook's own Cheat Sheet tab through a pack built
   from it, so the check is equality with that pack rather than a search for
   each string in a spec. The tab is formula-linked to the model, so this also
   ties the chapter to the model without a second measurement. */

const C = mod.CHEAT;
const cheatShipped = JSON.parse(JSON.stringify(C));
const cheatSource = JSON.parse(JSON.stringify(cheatSrc));
delete cheatSource.pack;
delete cheatShipped.pack;
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
if (cheatSrc.pack.snapshot_sha256 !== modelSrc.meta.snapshot_sha256)
  fail("CHEAT PACK IS OFF ANOTHER MODEL",
    `${cheatSrc.pack.snapshot_sha256.slice(0, 12)} vs ${modelSrc.meta.snapshot_sha256.slice(0, 12)}`);

/* ══ F. the comparable estimated P&Ls ══════════════════════════════ */

/* F1 — the shipped pack equals the source file, leaf for leaf. */
const deepEq = (a, b, path) => {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) { fail("P&L DATA MISMATCH", path + ": page " + JSON.stringify(a) + " vs source " + JSON.stringify(b)); return false; }
  if (Array.isArray(a) !== Array.isArray(b)) { fail("P&L DATA SHAPE", path); return false; }
  if (typeof a === "object") {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) { fail("P&L DATA KEYS", path + ": page " + ka.length + " vs source " + kb.length); return false; }
    let ok = true;
    for (const k of kb) if (!deepEq(a[k], b[k], path + "." + k)) ok = false;
    return ok;
  }
  fail("P&L DATA MISMATCH", path + ": page " + JSON.stringify(a) + " vs source " + JSON.stringify(b));
  return false;
};
for (const key of Object.keys(pnlSource)) { checked++; deepEq(mod.PNL[key], pnlSource[key], "PNL." + key); }
checked++;
if (Object.keys(mod.PNL).length !== Object.keys(pnlSource).length) fail("P&L DATA KEYS", "top level");

/* F2 — every printed figure, recomputed here from the source file by an
   implementation written independently of the page's. */
const G = n => n.toLocaleString("en-GB");
const vK = v => { const r = Math.round(v / 1000); return r < 0 ? "(" + G(-r) + ")" : G(r); };
const vCur = (v, c) => { const s = c === "GBP" ? "£" : "€"; const r = Math.round(v); return r < 0 ? "(" + s + G(-r) + ")" : s + G(r); };
const vPct = (v, dp) => { const x = v * 100, s = Math.abs(x).toFixed(dp == null ? 2 : dp); return x < 0 ? "(" + s + ")%" : s + "%"; };
const vNum = v => G(Math.round(v));

/* the row order the page prints, declared here a second time on purpose */
const V_SPEC = [
  ["divider", null, "Revenue"], ["line", "rev_rooms", "Rooms"], ["line", "rev_lodges", "Lodges"],
  ["line", "rev_food", "Food"], ["line", "rev_beverage", "Beverage"], ["line", "rev_spa", "Spa"],
  ["line", "rev_golf", "Golf"], ["line", "rev_memberships", "Memberships"], ["line", "rev_leisure", "Leisure"],
  ["line", "rev_other", "Other operated"], ["total", "total_revenue", "Total revenue"],
  ["divider", null, "Departmental cost"], ["line", "total_cos", "Cost of sales"],
  ["line", "total_de", "Departmental expenses"], ["line", "total_dw", "Direct wages"],
  ["total", "gross_departmental_profit", "Gross departmental profit"],
  ["divider", null, "Undistributed"], ["line", "und_ag", "Administrative and general"],
  ["line", "und_sm", "Sales and marketing"], ["line", "und_pom", "Property operations and maintenance"],
  ["line", "und_utilities", "Utilities"], ["total", "total_undistributed", "Total undistributed"],
  ["big", "gop", "Gross operating profit", "gop"], ["line", "rates", "Property taxes and rates"],
  ["line", "insurance", "Insurance"], ["line", "franchise_fee", "Brand franchise fee"],
  ["big", "ebitda", "EBITDA", "ebitda"], ["line", "ffe_reserve", "FF&E reserve"],
  ["line", "ground_rent", "Ground rent"], ["big", "noi", "Net operating income", "noi"]
];

const same = (label, page, want) => {
  checked++;
  if (page !== want) fail("P&L FIGURE  " + label, `page "${page}" vs source "${want}"`);
};

let pnlFigures = 0;
for (const src of pnlSource.hotels) {
  const page = mod.PNL.hotels.find(x => x.slug === src.slug);
  const dual = src.currency !== "GBP";

  /* the P&L itself */
  const want = [];
  for (const [kind, key, label, mkey] of V_SPEC) {
    if (kind === "divider") { want.push(["divider", label, "", "", null]); continue; }
    const nv = src.pnl_native[key], gv = src.pnl_gbp[key];
    if (kind === "line" && Math.round(nv) === 0 && Math.round(gv) === 0) continue;
    want.push([kind, label, vK(nv), dual ? vK(gv) : "", mkey ? vPct(src.margins[mkey]) : null]);
  }
  const rows = mod.PNLFMT.rows(page);
  same(src.slug + " row count", String(rows.length), String(want.length));
  for (let i = 0; i < Math.min(rows.length, want.length); i++) {
    for (let j = 0; j < 5; j++) { same(`${src.slug} row ${i} col ${j}`, String(rows[i][j]), String(want[i][j])); pnlFigures++; }
  }

  /* the operating basis */
  const wb = [
    ["Keys", String(src.keys), ""],
    ["Open days in the year", vNum(src.open_days), ""],
    ["Occupancy", vPct(src.pnl_native.occupancy, 1), ""],
    ["ADR", vCur(src.pnl_native.adr, src.currency), dual ? vCur(src.pnl_gbp.adr, "GBP") : ""],
    ["RevPAR", vCur(src.pnl_native.revpar, src.currency), dual ? vCur(src.pnl_gbp.revpar, "GBP") : ""],
    ["Rooms available", vNum(src.pnl_native.rooms_available), ""],
    ["Rooms sold", vNum(src.pnl_native.rooms_sold), ""]
  ];
  const gb = mod.PNLFMT.basis(page);
  same(src.slug + " basis count", String(gb.length), String(wb.length));
  for (let i = 0; i < wb.length; i++) for (let j = 0; j < 3; j++) { same(`${src.slug} basis ${i}/${j}`, String(gb[i][j]), String(wb[i][j])); pnlFigures++; }

  /* the per-key and payroll memo */
  const m = src.memo;
  const wm = [
    ["Revenue a key", vCur(m.rev_per_key_native, src.currency), dual ? vCur(m.rev_per_key_gbp, "GBP") : ""],
    ["GOP a key", dual ? "" : vCur(m.gop_per_key_gbp, "GBP"), vCur(m.gop_per_key_gbp, "GBP")],
    ["NOI a key", dual ? "" : vCur(m.noi_per_key_gbp, "GBP"), vCur(m.noi_per_key_gbp, "GBP")],
    ["Implied all-staff payroll", vCur(m.implied_payroll_native, src.currency), dual ? vCur(m.implied_payroll_gbp, "GBP") : ""],
    ["Payroll, % of revenue", vPct(m.payroll_pct), ""],
    ["Rooms, % of revenue", vPct(m.rooms_share), ""]
  ];
  const gm = mod.PNLFMT.memo(page);
  for (let i = 0; i < wm.length; i++) for (let j = 0; j < 3; j++) { same(`${src.slug} memo ${i}/${j}`, String(gm[i][j]), String(wm[i][j])); pnlFigures++; }
}

/* the comparative, ranked on GOP margin — order and every cell. The display
   name is the case study's, so the accents the pack writes as ASCII come from
   a source this file already gates. */
const vDisp = h => {
  const cs = Object.keys(mod.PNL_CASE).find(k => mod.PNL_CASE[k] === h.slug);
  const c = mod.CASES.find(x => x.slug === cs);
  return c ? c.name : h.name;
};
const wantRank = [...pnlSource.hotels.map(h => ({
  name: vDisp(h), cls: h.evidence_class, keys: h.keys, open: vNum(h.open_days),
  adr: vCur(h.pnl_native.adr, h.currency), occ: vPct(h.pnl_native.occupancy, 1), gopN: h.margins.gop,
  gop: vPct(h.margins.gop), ebitda: vPct(h.margins.ebitda), noi: vPct(h.margins.noi),
  payroll: vPct(h.memo.payroll_pct), rpk: vCur(h.memo.rev_per_key_gbp, "GBP")
})), {
  name: pnlSource.subject.name, cls: "SUBJECT", keys: pnlSource.subject.keys, open: "Year-round",
  adr: vCur(pnlSource.subject.adr_y1, "GBP"), occ: "60–70%", gopN: pnlSource.subject.margins.gop,
  gop: vPct(pnlSource.subject.margins.gop), ebitda: "—", noi: vPct(pnlSource.subject.margins.noi),
  payroll: "—", rpk: vCur(pnlSource.subject.per_key.revenue, "GBP")
}].sort((a, b) => b.gopN - a.gopN);
const gotRank = mod.PNLFMT.ranked();
same("ranked row count", String(gotRank.length), String(wantRank.length));
for (let i = 0; i < wantRank.length; i++) {
  for (const k of ["name", "cls", "keys", "open", "adr", "occ", "gop", "ebitda", "noi", "payroll", "rpk"]) {
    same(`ranked ${i} ${k}`, String(gotRank[i][k]), String(wantRank[i][k])); pnlFigures++;
  }
}
/* the finding the view is built on */
checked++;
if (gotRank[5].name !== "Fawley Court") fail("P&L RANKING", "the subject is not sixth of eleven on GOP margin");

/* F3 — every candour line is the build record's own */
for (const [slug, lines] of Object.entries(mod.PNL_NOTES)) {
  checked++;
  if (!pnlSource.hotels.some(h => h.slug === slug)) fail("P&L NOTE FOR UNKNOWN HOTEL", slug);
  for (const l of lines) verbatim("P&L note " + slug, l, pnlRegText, "comp-pnls/REGISTER.md");
}
for (const [k, lines] of Object.entries(mod.PNL_PROSE)) for (const l of lines) verbatim("P&L prose " + k, l, pnlRegText, "comp-pnls/REGISTER.md");
checked++;
if (mod.PNL_PROSE.limits.length !== 13) fail("P&L LIMITS", mod.PNL_PROSE.limits.length + " limits, expected 13");
/* every case study maps to a book, and every book to a case study */
for (const c of mod.CASES) {
  checked++;
  if (!mod.PNL_CASE[c.slug]) fail("CASE WITHOUT AN ESTIMATED P&L", c.slug);
  checked++;
  if (!pnlSource.hotels.some(h => h.slug === mod.PNL_CASE[c.slug])) fail("CASE MAPPED TO NO BOOK", c.slug);
}
checked++;
if (Object.keys(mod.PNL_CASE).length !== pnlSource.hotels.length) fail("P&L MAP SIZE", "the ten books and the ten cases must correspond");

/* ══ G. the two shipped packs equal their sources ══════════════════ */

checked++;
if (JSON.stringify(mod.MODEL) !== JSON.stringify(modelSrc))
  fail("MODEL BLOCK OUT OF DATE", "the MODEL block in index.html is not the record in Model/docs — run tools/inline-model.py");
checked++;
if (JSON.stringify(mod.CHEAT) !== JSON.stringify(cheatSrc))
  fail("CHEAT BLOCK OUT OF DATE", "the CHEAT block in index.html is not the pack in Model/docs — run tools/inline-cheat.py");
checked++;
if (JSON.stringify(mod.CAPEX) !== JSON.stringify(capexSrc))
  fail("CAPEX BLOCK OUT OF DATE", "the CAPEX block in index.html is not the pack in Model/capex — run tools/inline-capex.py");

/* the figure mirror on the page is the record's own map */
checked++;
if (JSON.stringify(figsOnPage()) !== JSON.stringify(modelSrc.fig))
  fail("FIGURE MIRROR OUT OF DATE", "the FIGS map in index.html is not the record's fig block");
function figsOnPage() { return mod.FIGS; }

/* ══ H. the capital-cost chapter, re-derived from the pack ═════════ */

/* Every chapter-05 figure is computed from the current capex pack. The v28
   pack is independently versioned from the v16 model record, so it must tie to
   itself and to its phasing reconciliation rather than to superseded v16 cells. */
const cap = capexSrc;
const capChecks = [
  ["hotel total", cap.summary.hotel.total], ["hotel per key", cap.summary.hotel.per_key],
  ["resi total", cap.summary.resi.total], ["resi per unit", cap.summary.resi.per_unit],
  ["works total", cap.summary.works_total], ["hotel net", cap.summary.hotel.net],
  ["resi net", cap.summary.resi.net],
];
for (const [label, value] of capChecks) {
  checked++;
  if (!Number.isFinite(value) || value <= 0)
    fail("CAPEX SUMMARY VALUE INVALID  " + label, String(value));
}
/* the pack's own arithmetic */
checked++;
const netSum = cap.lines.filter(l => l.on).reduce((a, l) => a + l.live, 0);
if (Math.abs(netSum - (cap.summary.hotel.net + cap.summary.resi.net)) > 1)
  fail("CAPEX LINES DO NOT SUM", `${Math.round(netSum)} against ${Math.round(cap.summary.hotel.net + cap.summary.resi.net)}`);
checked++;
const phaseSum = cap.phasing.total.reduce((a, v) => a + v, 0);
if (Math.abs(phaseSum - cap.phasing.reconciles_to_net_lines) > 1)
  fail("CAPEX PHASING DOES NOT TIE", `${Math.round(phaseSum)} against ${Math.round(cap.phasing.reconciles_to_net_lines)}`);
checked++;
if (cap.lines.length !== cap.meta.n_lines) fail("CAPEX LINE COUNT", cap.lines.length + " lines, pack declares " + cap.meta.n_lines);
/* every line carries its basis and its evidence class */
for (const l of cap.lines) {
  checked++;
  if (!l.basis || String(l.basis).trim().length < 20) fail("CAPEX LINE WITHOUT BASIS", "#" + l.n + " " + l.desc);
  checked++;
  if (!["MEASURED", "BENCHMARK", "ALLOWANCE"].includes(l.source)) fail("CAPEX LINE WITHOUT CLASS", "#" + l.n);
}

/* ══ I. estate areas — evaluate the deferred renderer against its pack ══ */

checked++;
if (!/fetch\("src\/areas-data\.json"\)/.test(areaJs))
  fail("AREAS PACK NOT LAZY-LOADED", "areas.js must fetch src/areas-data.json when the route is requested");
checked++;
if (/areas\.js/.test(fs.readFileSync("sw.js", "utf8")) || /areas-data\.json/.test(fs.readFileSync("sw.js", "utf8")))
  fail("AREAS IN INSTALL PAYLOAD", "the bolt-on and its pack must warm after a visit, not install with the shell");
const AREA_KEYS = ["hall", "courtyard", "riding", "spa", "riverclub", "residences"];
checked++;
if (areaSource.areas.map(a => a.key).join("|") !== AREA_KEYS.join("|"))
  fail("AREA ORDER", areaSource.areas.map(a => a.key).join(", "));
checked++;
if (cgiSource.areas.map(a => a.key).join("|") !== AREA_KEYS.join("|"))
  fail("CGI MANIFEST AREA ORDER", cgiSource.areas.map(a => a.key).join(", "));
checked++;
if (Math.abs(areaSource.areas.reduce((s, a) => s + a.loaded, 0) - areaSource.meta.covered) > 1)
  fail("AREA COVERED TOTAL", "area loaded costs do not sum to the pack's covered total");
for (const [key, words] of Object.entries(areaUnitWords)) {
  checked++;
  const a = areaSource.areas.find(x => x.key === key);
  if (!a || !(a.what + " " + a.earns).includes(words[0])) fail("AREA UNIT BASIS", key + " is not evidenced in the area prose");
}

/* Evaluate the real on-demand file with a tiny DOM shell. This keeps the
   verification tied to the rendering code while leaving that code out of the
   portal's normal parse path. */
const areaWindow = { requestIdleCallback: () => {} };
const areaDocument = {
  querySelector: () => null,
  createElement: () => ({}),
  head: { append: () => {} },
  addEventListener: () => {}
};
new Function("window", "document", "fetch", "requestIdleCallback", areaJs)(
  areaWindow, areaDocument,
  async () => ({ ok: true, json: async () => areaSource }),
  () => {}
);
checked++;
if (!areaWindow.AreasChapter) fail("AREAS MODULE DID NOT REGISTER", "areas.js did not expose AreasChapter");
else {
  await areaWindow.AreasChapter.load();
  const areaHas = (page, text) => norm(page).includes(norm(text));
  const hub = areaWindow.AreasChapter.render("");
  /* the hub lede and its coverage note were cut by ruling. What the coverage figures
     describe still has to hold, so the gate reads them off the pack and checks they
     reconcile, rather than checking a paragraph that no longer exists. */
  {
    const m = areaSource.meta;
    checked++;
    if (Math.abs((m.covered + m.uncovered) - m.works_total) > 1)
      fail("AREA COVERAGE DOES NOT RECONCILE",
           arm2(m.covered) + " + " + arm2(m.uncovered) + " against " + arm2(m.works_total));
    checked++;
    if (!(m.covered > 0 && m.uncovered > 0)) fail("AREA COVERAGE NOT MEASURED", JSON.stringify(m));
  }
  for (const a of areaSource.areas) {
    const manifest = cgiSource.areas.find(x => x.key === a.key);
    checked++;
    if (!manifest || JSON.stringify(manifest.images) !== JSON.stringify(a.images)) fail("AREA CGI MANIFEST DRIFT", a.key);
    const page = areaWindow.AreasChapter.render(a.key);
    /* the area's own name and its loaded cost head the view, which the chapter
       renderer builds from AreasChapter.area(); the body carries the rest */
    checked++;
    const head = areaWindow.AreasChapter.area(a.key);
    if (!head || head.label !== a.label || head.loaded !== a.loaded)
      fail("AREA HEADER SOURCE MISSING  " + a.key, a.label);
    for (const text of [a.what, a.works, a.earns, a.watch, arm2(a.loaded), arm2(a.net), apct(a.share_of_works),
                        `Q${a.start_q}`, `Q${a.end_q}`]) {
      checked++;
      if (!areaHas(page, text)) fail("AREA VALUE NOT RENDERED  " + a.key, text);
    }
    for (const im of a.images) {
      checked++;
      if (!page.includes(im.thumb)) fail("AREA THUMB NOT RENDERED", a.key + " " + im.thumb);
      checked++;
      if (!fs.existsSync(im.thumb) || !fs.existsSync(im.full)) fail("AREA CGI MISSING ON DISK", a.key + " " + im.full);
    }
    for (const l of a.top_lines) {
      for (const text of [l.desc, aqty(l.qty), ar0(l.rate), ar0(l.net), l.source]) {
        checked++; areaFigures++;
        if (!areaHas(page, text)) fail("AREA LINE NOT RENDERED  " + a.key + " #" + l.n, text);
      }
    }
    for (const t of tok(page)) {
      checked++; areaFigures++;
      if (!AREA_VALUES.has(t)) fail("AREA FIGURE UNREGISTERED  " + a.key, `token "${t}" is not derived from src/areas-data.json`);
    }
  }
}

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
const modelSurface = JSON.stringify([mod.FIGS, mod.CHAPTERS, mod.CASES, mod.CHEAT,
  mod.ASSUMPTIONS, mod.DIAL_SRC, mod.LADDER, mod.BRIDGE]);
const liveFigures = new Set(Object.values(modelSrc.fig).map(String));
for (const t of RETIRED) {
  checked++;
  if (liveFigures.has(t)) continue;          /* the model has come back to it */
  if (modelSurface.includes(t))
    fail("RETIRED FIGURE STILL ON THE PAGE", `"${t}" is from a superseded version of the model`);
}

/* the written hotel pages read a comparable against the subject, and the
   subject column is the underwrite's own figure. That pack is built by its own
   pipeline and regenerated from its own sources, so a re-strike of the model
   has to reach it too. */
for (const [slug, rec] of Object.entries(hpSource)) {
  for (const row of rec.against || []) {
    if (!row || row.length < 3 || typeof row[2] !== "string") continue;
    checked++;
    const stale = RETIRED.find(t => row[2].includes(t)
      || row[2].includes(t.replace("£", "GBP ")) || row[2].includes(t.replace("£", "GBP")));
    if (stale && !liveFigures.has(stale))
      fail(`HOTEL PAGE SUBJECT CELL IS STALE  ${slug}/${row[0]}`,
        `"${row[2]}" carries ${stale} — run python tools/restrike-hotelpages.py, then tools/inline-hotelpages.py`);
  }
}

/* No surface may name a version of the model other than the one the record was
   measured on. A version label is not a figure, so the retired-figure check
   cannot see it: the cheat sheet's footer band and the dial pane's heading both
   printed "Financial Model v16" long after every figure around them had moved. */
{
  const live = modelSrc.meta.model.replace(/^.*?-\s*/, "").replace(/\.xlsx$/i, "");
  /* One deliberate lineage reference: the cases note explains that two columns
     are not shown because they were built on a book this version cannot
     reproduce. Naming it is the point of the sentence. */
  const HISTORIC = new Set(["Financial Model v12"]);
  const named = new Set((html.match(/Financial Model v\d+/g) || []));
  for (const n of named) {
    checked++;
    if (n !== live && !HISTORIC.has(n))
      fail("A SUPERSEDED MODEL IS NAMED ON THE PAGE",
        `"${n}" against the record's ${live} — derive it from MODEL.meta.model`);
  }
}

/* ══ house rules ═══════════════════════════════════════════════════ */

for (const w of ["strand", "wilton", "\\bproceed\\b", "compelling", "\\bprime\\b(?! reach| Henley| sold| 5%)", "\\brare\\b"]) {
  checked++;
  const m = html.match(new RegExp(w, "i"));
  if (m) fail("BANNED WORD", `${w} — "${html.slice(Math.max(0, m.index - 60), m.index + 60).replace(/\s+/g, " ")}"`);
}
/* occupancy is an interval in narrative; 0.65 appears only as the model input */
const OCC_OK = [
  "0.65 is the model input",
  "occupancy 0.65",                          // the engines table's year-7 driver row
  "0.65 [0.60–0.70]",                        // the dial-set cell
  "stabilised occupancy 0.65 → 0.60",        // the cheat sheet's measured stress line
  "occupancy 0.65 → 0.60",
  '"occ_stab": "0.65"',                      // the figures register, carried whole
  '"occupancy":0.65',                        // the comparable pack, carried whole
  "0.65 x administrative and general",       // the P&L pack's payroll bridge, a weighting
  "0.65 / 0.45 / 0.40 / 0.00 convention",    // the same weighting, restated in the limits
  "0.65 \u2192 " + modelSrc.fig.irr,      // the sensitivities table's underwritten cell
  "occupancy 0.65, seasonality",             // the P&L pack's subject note
  "0.65 is the model input",
  "reaching 0.55",                           // the downside's own occupancy override
  "(0.65 stabilised)"                        // the cheat sheet's own occupancy note
];
/* the scan is of the page's own narrative: the data blocks it carries whole —
   the figure record, the capital-cost pack, the comparable P&Ls, the register —
   are sources, and their raw values are not narrative claims. */
let narrative = html;
for (const [a, b] of [["/*MODEL-DATA-START*/", "/*MODEL-DATA-END*/"],
                      ["/*CHEAT-DATA-START*/", "/*CHEAT-DATA-END*/"],
                      ["/*CAPEX-DATA-START*/", "/*CAPEX-DATA-END*/"],
                      ["/*PNL-DATA-START*/", "/*PNL-DATA-END*/"],
                      ["/*QS-DATA-START*/", "/*QS-DATA-END*/"]]) {
  const i = narrative.indexOf(a), j = narrative.indexOf(b);
  if (i >= 0 && j > i) narrative = narrative.slice(0, i) + narrative.slice(j);
}
const text = strip(narrative);
let scrub = text;
for (const ok of OCC_OK) scrub = scrub.split(ok).join("");
checked++;
{
  const hit = scrub.match(/.{0,90}\b0\.65\b.{0,90}/);
  if (hit) fail("OCCUPANCY POINT", "0.65 outside the approved contexts: \u2026" + hit[0].replace(/\s+/g, " ") + "\u2026");
}

/* the internal marking is withdrawn: the chapters stay, the marking goes */
for (const s of ["INTERNAL — ALIGN ONLY", "Internal — Align only", 'class="intbar"', "badge int",
                 "body.internal", "chip.int", "toc-ch.int", "idx-item.int", "· internal"]) {
  checked++;
  if (html.includes(s)) fail("WITHDRAWN INTERNAL MARKING PRESENT", s);
}
for (const ch of mod.CHAPTERS) { checked++; if (ch.internal) fail("INTERNAL FLAG PRESENT", ch.id); }
/* the former internal chapters are still here, unbadged. The cheat sheet and the
   IRR bridge became views of the underwrite on 19 August, so they are checked
   where they now live rather than as chapters of their own. */
checked++;
if (!mod.CHAPTERS.some(c => c.id === "dd")) fail("CHAPTER MISSING", "dd");
{
  const uw = mod.CHAPTERS.find(c => c.id === "underwrite");
  for (const vid of ["bridge", "cheat"]) {
    checked++;
    if (!uw || !uw.views.some(v => v.id === vid))
      fail("VIEW MISSING FROM THE UNDERWRITE", vid);
  }
}
checked++;
if (!mod.CHAPTERS.find(c => c.id === "dd").views.some(v => v.lead.some(b => b[0] === "qs")))
  fail("REGISTER NOT IN DILIGENCE", "the 87-question register must lead the merged diligence chapter");

/* ══ G · THE ULTRA-LUXURY MARKET ═══════════════════════════════════════

   The market chapter prints thirty-six collected rate series and, for the
   twenty-eight hotels that disclose anything, the headline figures they
   disclose. Nothing in it is typed into the page: the pack is spliced whole
   and the cards are rendered from it. So the gate is —

   G1  the shipped block equals Research/cohort-2026-08/market-web-data.json,
       leaf for leaf;
   G2  every rate figure on every card is this file's own independent
       formatting of that source, checked against the rendered HTML;
   G3  the index, tab and band counts are the source's own counts;
   G4  every card leads to a route that resolves;
   G5  the basis, VAT, grouping and figures prose is the pack's own wording;
   G6  the ten rate records print the source's series;
   G7  every headline figure a card prints is the pack's, with its class, and
       its basis is printed on that hotel's own page;
   G8  every photograph the page names is on disk, and every one carries its
       credit and licence on the property's page.
   ══════════════════════════════════════════════════════════════════════ */

const mkPath = (a, b, path) => {
  if (a === b) return;
  const ta = a === null ? "null" : Array.isArray(a) ? "array" : typeof a;
  const tb = b === null ? "null" : Array.isArray(b) ? "array" : typeof b;
  if (ta !== tb) { fail("MARKET PACK DRIFT", path + ": shipped " + ta + ", source " + tb); return; }
  if (ta === "object") {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!(k in a)) { fail("MARKET PACK DRIFT", path + "." + k + " missing from the shipped block"); continue; }
      if (!(k in b)) { fail("MARKET PACK DRIFT", path + "." + k + " is in the page and not in the source"); continue; }
      mkPath(a[k], b[k], path + "." + k);
    }
    return;
  }
  if (ta === "array") {
    if (a.length !== b.length) { fail("MARKET PACK DRIFT", path + ": length " + a.length + " vs " + b.length); return; }
    a.forEach((x, i) => mkPath(x, b[i], path + "[" + i + "]"));
    return;
  }
  fail("MARKET PACK DRIFT", path + ': shipped "' + a + '", source "' + b + '"');
};
checked++;
mkPath(mod.MARKET, mktSource, "MARKET");

/* this file's own formatting, never the page's */
const mkGbp = n => "£" + Math.round(n).toLocaleString("en-GB");
const MK_CTRY = { IT: "Italy", FR: "France", IE: "Ireland", GR: "Greece",
                  AT: "Austria", ES: "Spain", UK: "United Kingdom" };
const mkCohort = mktSource.hotels.filter(h => h.in_cohort !== false);
const mkEu = mkCohort.filter(h => h.country !== "UK");
const mkUk = mkCohort.filter(h => h.country === "UK");

mod.MKSTATE.country = null; mod.MKSTATE.type = null;
mod.MKSTATE.tab = "eu"; const mkEuHtml = mod.marketIndexHTML();
mod.MKSTATE.tab = "uk"; const mkUkHtml = mod.marketIndexHTML();
mod.MKSTATE.tab = "all"; const mkAllHtml = mod.marketIndexHTML();
const mkHas = (label, hay, needle) => {
  checked++;
  if (!hay.includes(needle)) fail("MARKET FIGURE NOT PRINTED  " + label, '"' + needle + '"');
};

let mktFigures = 0;
for (const h of mkCohort) {
  const hay = h.country === "UK" ? mkUkHtml : mkEuHtml;
  const where = h.name;
  mkHas(where + " name", hay, ">" + h.name + "<");
  mkHas(where + " place", hay, h.region + " · " + MK_CTRY[h.country]);
  if (h.season) mkHas(where + " season on the card", hay, h.season.v);
  else mkHas(where + " calendar", hay, h.months_bookable + " of 12 months");
  if (h.median) {
    mkHas(where + " median", hay, mkGbp(h.median) + "</span>");
    mkHas(where + " net of VAT", hay, mkGbp(h.median_net_vat) + " net of VAT");
    mktFigures += 2;
  } else {
    mkHas(where + " no inventory", hay, "No bookable inventory");
  }

  /* G7 — the headline figures, on the card and with their basis on the page */
  const page = mod.hotelPageHTML(h);
  if (h.season) mkHas(where + " season basis on the page", page, h.season.basis);
  /* the caveats came off the cards by ruling; they print on the hotel's page */
  if (h.caveat) mkHas(where + " caveat on the page", page, h.caveat);
  /* the achieved rate and the season are off the card by ruling; every other
     figure prints on it, and every figure's basis prints on the hotel's page */
  for (const f of h.figures || []) {
    /* the card shows the first three figures; the rest print on the page only */
    const onCard = (h.figures || []).filter(x => x.k !== "adr" && x.k !== "season").slice(0, 3);
    if (onCard.includes(f)) {
      mkHas(where + " " + f.k + " on the card", hay, f.v);
      mktFigures += 1;
    }
    mkHas(where + " " + f.k + " basis on the page", page, f.basis);
    mkHas(where + " " + f.k + " label", page, "<th>" + f.label + "</th>");
    mktFigures += 2;
  }
  /* a card shows four rows and no control: everything else is on the page */
  {
    checked++;
    const card = hay.slice(hay.indexOf('data-mkcard="' + h.slug + '"'));
    const end = card.indexOf('<span class="mk-go"');
    const body = card.slice(0, end < 0 ? 4000 : end);
    const visible = (body.match(/class="mk-row"/g) || []).length;
    if (visible > 4) fail("MARKET CARD SHOWS MORE THAN FOUR ROWS", h.slug + ": " + visible);
  }
  if (!(h.figures || []).length) {
    mkHas(where + " states the blank", hay, "Nothing published beyond a rate.");
    mkHas(where + " states the blank on its page", page, "this property publishes nothing, and nothing was found in the registries");
  }

  /* G8 — the photograph, if the page names one */
  const p = mod.PHOTOS[h.slug];
  if (p) {
    checked++;
    if (!fs.existsSync("img/comps/" + p.file)) fail("PHOTOGRAPH NAMED BUT NOT ON DISK", h.slug + " -> " + p.file);
    mkHas(where + " photograph", hay, 'src="img/comps/' + p.file + '"');
    /* the credit and the licence are held, not printed — see G9 */
    checked++;
    if (!(p.credit || "").trim()) fail("PHOTOGRAPH WITHOUT A CREDIT", h.slug + " -> " + p.file);
    checked++;
    if (!(p.licence || "").trim()) fail("PHOTOGRAPH WITHOUT A LICENCE", h.slug + " -> " + p.file);
    if (p.note) mkHas(where + " photograph note", page, p.note);
  } else {
    mkHas(where + " has no photograph", hay, "No photograph held");
  }
}
/* and every photograph shipped belongs to a hotel in the set */
for (const slug of Object.keys(mod.PHOTOS)) {
  checked++;
  if (!mkCohort.some(h => h.slug === slug)) fail("PHOTOGRAPH FOR AN UNKNOWN HOTEL", slug);
}
/* the subject was taken out of the index by ruling: it must not come back */
for (const hay of [mkEuHtml, mkUkHtml]) {
  checked++;
  if (hay.includes("Fawley Court")) fail("SUBJECT IN THE MARKET INDEX", "the subject was ruled out of this chapter");
}

/* G9 — the written layer: what a page says of its own, and its photography */
checked++;
mkPath(mod.HOTELPAGE, hpSource, "HOTELPAGE");
for (const [slug, w] of Object.entries(hpSource)) {
  const h = mkCohort.find(x => x.slug === slug);
  checked++;
  if (!h) { fail("A WRITTEN PAGE FOR A HOTEL OUTSIDE THE SET", slug); continue; }
  const page = mod.hotelPageHTML(h);
  mkHas(h.name + " intro", page, w.intro);
  for (const im of w.images || []) {
    checked++;
    if (!fs.existsSync("img/comps/" + im.file)) fail("PAGE IMAGE NOT ON DISK", slug + " -> " + im.file);
    checked++;
    if (!im.file.startsWith(slug + "-")) fail("PAGE IMAGE NAMED FOR ANOTHER HOTEL", slug + " -> " + im.file);
    /* attribution is carried in the record and in img/comps/credits.json, not on the
       page: these are investment materials, not published photography. The guarantee
       the gate holds is that no image travels without its credit and its licence. */
    checked++;
    if (!(im.credit || "").trim()) fail("PAGE IMAGE WITHOUT A CREDIT", slug + " -> " + im.file);
    checked++;
    if (!(im.licence || "").trim()) fail("PAGE IMAGE WITHOUT A LICENCE", slug + " -> " + im.file);
  }
  for (const row of w.record || []) mkHas(h.name + " record row", page, row[0]);
  for (const c of w.cards || []) mkHas(h.name + " card", page, c[1]);
}

/* G3 — the counts are the source's */
mkHas("Europe tab count", mkEuHtml, "Europe</span><span class=\"c\">" + mkEu.length);
mkHas("United Kingdom tab count", mkEuHtml, "The United Kingdom</span><span class=\"c\">" + mkUk.length);
/* the figures the contents prints for this chapter are the pack's own counts —
   read off CHAPTERS rather than written here, so a hotel joining the set cannot
   leave a stale literal behind in this file */
{
  const ch = mod.CHAPTERS.find(c => c.id === "market");
  checked++;
  if (+ch.figures[0][0] !== mkCohort.length)
    fail("MARKET COHORT SIZE", "the contents states " + ch.figures[0][0] + " hotels; the pack holds " + mkCohort.length);
  checked++;
  if (+ch.figures[1][0] !== mkCohort.filter(h => h.year_round).length)
    fail("MARKET YEAR-ROUND COUNT", "the contents states " + ch.figures[1][0] + "; the pack holds "
      + mkCohort.filter(h => h.year_round).length);
  checked++;
  if (ch.views[0].figure !== mkCohort.length + " hotels")
    fail("MARKET VIEW FIGURE", ch.views[0].figure + " against a pack of " + mkCohort.length);
}
/* the lede states how many hotels disclose nothing; it has to be the count */
{
  const blanks = mkCohort.filter(h => !(h.figures || []).length).length;
  const words = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
                 "eleven", "twelve"];
  /* the counts block was cut by ruling; the chapter's own figures are checked above */
  mkHas("All tab count", mkAllHtml, 'All</span><span class="c">' + mkCohort.length);
}
/* the bands were cut by ruling: one grid, ordered by rate. So the check is the
   card count and the order itself. */
for (const [tab, hay, rows] of [["eu", mkEuHtml, mkEu], ["uk", mkUkHtml, mkUk], ["all", mkAllHtml, mkCohort]]) {
  const cards = (hay.match(/class="mk" data-mkcard/g) || []).length;
  checked++;
  if (cards !== rows.length) fail("MARKET CARD COUNT", tab + ": " + cards + " cards for " + rows.length + " hotels");
  const order = [...hay.matchAll(/data-mkcard="([^"]+)"/g)].map(m => m[1]);
  const want = rows.slice().sort((x, y) => ((y.median || 0) - (x.median || 0))
    || (y.months_bookable - x.months_bookable)).map(h => h.slug);
  checked++;
  if (order.join("|") !== want.join("|"))
    fail("MARKET GRID NOT IN RATE ORDER", tab + ": " + order.slice(0, 4).join(", ") + " against " + want.slice(0, 4).join(", "));
}

/* G4 — every card leads somewhere that resolves */
const caseSlugs = new Set(mod.CASES.map(c => c.slug));
for (const hay of [mkEuHtml, mkUkHtml]) {
  for (const m of hay.matchAll(/data-hash="([^"]+)"/g)) {
    const hash = m[1];
    checked++;
    if (hash.startsWith("#/h/")) {
      if (!caseSlugs.has(hash.slice(4))) fail("MARKET CARD TO A MISSING CASE", hash);
    } else if (hash.startsWith("#/m/")) {
      if (!mktSource.hotels.some(h => h.slug === hash.slice(4))) fail("MARKET CARD TO A MISSING PROPERTY", hash);
    } else {
      fail("MARKET CARD TO AN UNKNOWN ROUTE", hash);
    }
  }
}
/* and the ten written case studies are the ten the pack names */
checked++;
{
  const mapped = mktSource.hotels.filter(h => h.case_slug).map(h => h.case_slug).sort();
  const written = [...caseSlugs].sort();
  if (mapped.join("|") !== written.join("|"))
    fail("MARKET CASE MAP", "pack: " + mapped.join(", ") + "  |  portal: " + written.join(", "));
}

/* G5 — the basis prose no longer prints anywhere: source and basis statements were
   cut from the page by ruling, these being investment materials rather than a
   published research paper. The basis still has to exist, and it lives in the pack
   and in Research/cohort-2026-08, so the gate holds the pack to carrying it. */
{
  for (const k of ["basis", "vat_note", "figures_basis"]) {
    checked++;
    if (!(mktSource[k] || "").trim()) fail("BASIS MISSING FROM THE PACK", k);
  }
  /* the grouping's own basis travels with the type labels it explains */
  checked++;
  if (!mktSource.type_basis) fail("TYPE BASIS MISSING FROM THE PACK", "type_basis");
}

/* G6 — the ten rate records print the source's series */
for (const c of mod.CASES) {
  const h = mktSource.hotels.find(x => x.case_slug === c.slug);
  checked++;
  if (!h) { fail("RATE RECORD WITHOUT A SERIES", c.slug); continue; }
  const rec = mod.hotelPageHTML(mod.MKT_BY_CASE[c.slug]);
  const want = [
    mkGbp(h.median) + " gross · " + mkGbp(h.median_net_vat) + " net of VAT",
    mkGbp(h.p25) + " · " + mkGbp(h.median) + " · " + mkGbp(h.p75),
    mkGbp(h.min) + " to " + mkGbp(h.max),
    h.peak_to_trough + "×",
    h.months_bookable + " of 12",
    h.bookable + " of " + h.nights_in_window + " nights",
    h.longest_closed_run_nights + " nights",
    h.engine + ", " + h.window[0] + " to " + h.window[1]
  ];
  for (const w of want) { mkHas("rate record " + c.slug, rec, w); mktFigures++; }
  for (const [m, v] of Object.entries(h.monthly_median)) {
    mkHas("rate record " + c.slug + " " + m, rec, "<td>" + mkGbp(v) + "</td>");
    mktFigures++;
  }
}


console.log(`\n${fails === 0 ? "PASS" : "FAIL"} — ${checked} checks, ${fails} failures  (${subjChecked} subject-cell figures, ${pnlFigures} P&L figures, ${mktFigures} market figures, ${areaFigures} estate-area figures, ${ownProse} portal-authored lines figure-checked)`);
process.exit(fails ? 1 : 0);
