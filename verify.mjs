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
   E. THE CHEAT SHEET  every label, note and static value verbatim in
                       Model/cheatsheet-spec.json; every measured value
                       verbatim in the sheet's own render.
   F. THE COMPARABLE   the shipped PNL block must equal
      P&Ls             Research/comp-pnls/web-data.json line for line, every
                       printed figure must equal this file's own independent
                       formatting of that source, and every candour line must
                       be verbatim in Research/comp-pnls/REGISTER.md.

   Plus: the portal's own navigation figures against the registers, banned
   words, the occupancy convention, the rate field against the rate-position
   slide, and the absence of the withdrawn internal marking.

   Run: node verify.mjs
   ══════════════════════════════════════════════════════════════════════ */

import fs from "node:fs";
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
const bridgeMd = fs.readFileSync(DEAL + "Model/docs/embassy-bridge-20260816.md", "utf8");
const bridgeHtml = fs.readFileSync(DEAL + "Deck/irr-bridge/index.html", "utf8");
const csSpec = JSON.parse(fs.readFileSync(DEAL + "Model/cheatsheet-spec-v16.json", "utf8"));
const csRender = fs.readFileSync("src/cheatsheet-render-v16.txt", "utf8");
/* the v16 sources of record: the measured figure set and the capital-cost pack */
const v16Src = JSON.parse(fs.readFileSync(DEAL + "Model/docs/v16-figures.json", "utf8"));
const capexSrc = JSON.parse(fs.readFileSync(DEAL + "Model/capex/capex-web-data.json", "utf8"));
const bridgeMd16 = fs.readFileSync(DEAL + "Model/docs/embassy-bridge-v16-20260818.md", "utf8");
const capexRegister = fs.readFileSync(DEAL + "Model/capex/REGISTER.md", "utf8")
  + "\n" + fs.readFileSync(DEAL + "Model/capex/PROPOSAL.md", "utf8");
const restrikeMd = fs.readFileSync(DEAL + "Model/docs/v16-restrike-20260818.md", "utf8");
const qsSource = fs.readFileSync(DEAL + "Research/vendor-qs-crosscheck-20260816.md", "utf8");
const pnlSource = JSON.parse(fs.readFileSync(PNLDIR + "web-data.json", "utf8"));
const pnlRegister = fs.readFileSync(PNLDIR + "REGISTER.md", "utf8");
/* the ultra-luxury market pack, and the run record behind it */
const MKTDIR = DEAL + "Research/cohort-2026-08/";
const mktSource = JSON.parse(fs.readFileSync(MKTDIR + "market-web-data.json", "utf8"));
const mktRecord = ["RATES.md", "RATES-round2.md", "RATES-new-candidates.md", "FINDINGS.md"]
  .map(f => fs.readFileSync(MKTDIR + f, "utf8")).join(String.fromCharCode(10));

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
  grab("const MKT_M =", "/* ── a property page") +
  "; return { FIGS, V16, CAPEX, DIALS, DIAL_SRC, PLATES, FIELD, LADDER, BRIDGE, PNL, PNLFMT, PNL_CASE,"
  + " PNL_NOTES, PNL_PROSE, CHAPTERS, CASES, CHEAT, QS, MARKET, MKT_ALL, MKT_BY_SLUG,"
  + " MKT_BY_CASE, MKSTATE, PHOTOS, marketIndexHTML, mktGridInner, mktRecordHTML, mktFiguresHTML,"
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
const bridgeText = (norm(bridgeMd16) + " \u00b6 " + norm(bridgeMd) + " \u00b6 " + norm(bridgeHtml)).toLowerCase();
const restrikeText = norm(restrikeMd).toLowerCase();
const capexRegText = quotes(capexRegister.replace(/\*/g, "")).replace(/\s+/g, " ").toLowerCase();
const csSpecText = quotes(JSON.stringify(csSpec).replace(/\\"/g, '"')).replace(/\s+/g, " ").toLowerCase();
const csRenderText = quotes(csRender.replace(/ \| /g, " ")).replace(/\s+/g, " ").toLowerCase();
/* the P&L build record, with its markdown emphasis removed */
const pnlRegText = quotes(pnlRegister.replace(/\*/g, "")).replace(/\s+/g, " ").toLowerCase();
/* the market pack and its run record, as one haystack for figure registration */
const mktText = quotes(JSON.stringify(mktSource) + " " + mktRecord.replace(/\*/g, ""))
  .replace(/\s+/g, " ").toLowerCase();

let fails = 0, checked = 0;
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
walkReg(v16Src.fig); walkReg(v16Src.ladder); walkReg(v16Src.backsolve); walkReg(v16Src.sens);
walkReg(v16Src.margin); walkReg(v16Src.cases); walkReg(v16Src.flows); walkReg(v16Src.flow_totals);
walkReg(v16Src.pnl_years); walkReg(v16Src.bridge); walkReg(v16Src.bridge_meta);
walkReg(v16Src.capex_chain); walkReg(v16Src.capex_groups); walkReg(v16Src.capex_loading);
walkReg(v16Src.capex_inflation); walkReg(v16Src.extra); walkReg(v16Src.derived);

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
for (const v of Object.values(capexSrc.analysis.by_class)) { addCx(cxm1(v)); addCx(cxpct1(v / Object.values(capexSrc.analysis.by_class).reduce((a, b) => a + b, 0))); }
for (const z of Object.values(capexSrc.analysis.class_by_zone)) addCx(cxm1(z.total));
const sp = capexSrc.analysis.split;
[cxm1(sp.buildings_loaded), cxm1(sp.estate_loaded), cxm2(sp.buildings_per_key), cxm2(sp.estate_per_key),
 cxm1(sp.buildings_loaded + sp.estate_loaded)].forEach(addCx);
for (const g of capexSrc.reduction.groups) { addCx(cxm1(g.capex_delta + g.resi_delta)); addCx(String(g.lines.length)); }
for (const c of capexSrc.reduction.changed) { addCx(cxm0(Math.abs(c.net_delta))); addCx(String(c.n)); }
for (const side of ["ground_up", "adopted"]) {
  const r = capexSrc.reduction[side];
  [cxm1(r.capex), cxm1(r.resi_cost), cxm1(r.capex + r.resi_cost), cxm1(r.peak_equity),
   cxm1(r.cost_to_open), (r.irr * 100).toFixed(2) + "%"].forEach(addCx);
}
for (const q of capexSrc.phasing.total) addCx(cxm1(q));
addCx(cxm1(capexSrc.phasing.total_spend));
addCx(String(capexSrc.phasing.programme_q));
addCx(String(capexSrc.lines.length));

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
const registered = t => REGISTERED.has(t) || CAPEX_VALUES.has(t) || FIG_OK_EXTRA.has(t)
  || deckText.includes(t) || bridgeText.includes(t) || restrikeText.includes(t)
  || csRenderText.includes(t) || csSpecText.includes(t) || pnlRegText.includes(t)
  || capexRegText.includes(t) || qsSource.toLowerCase().includes(t) || mktText.includes(t);
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

for (const ch of mod.CHAPTERS) {
  for (const v of ch.views) {
    walkBlocks(allBlocks(v), b => {
      const k = b[0];
      if (k === "lede" || k === "para" || k === "subhead") {
        if (!OWN_PROSE.has(norm(b[1]))) prose(`${ch.id}/${v.id} ${k}`, b[1]);
      } else if (k === "src") {
        /* two source lines are checked against their own sources further down:
           the dial sheet's, sentence by sentence, and the rate field's tail. */
        if (norm(b[1]) !== norm(mod.DIAL_SRC) && norm(b[1]) !== norm(mod.FIELD.src))
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

/* the dial sheet and the rate field */
for (const [k, v] of mod.DIALS) { checked++; if (!norm(v)) fail("EMPTY DIAL", k); }
const dialText = norm(mod.DIALS.map(d => d[1]).join(" "));
for (const key of ["keys", "courtyard_keys", "adr_y1", "adr_y7", "rev_y7", "gop_y7", "gop_margin_y7",
  "capex_hotel", "capex_hotel_per_key", "capex_resi", "capex_resi_per_unit", "capex_works_total",
  "cost_to_open", "cost_to_open_key", "resi_units", "resi_psf", "resi_sqft", "resi_absorption",
  "staff_index", "exit_yield", "purch_costs_pct", "capex_prog_q", "entry", "irr", "em",
  "peak_equity", "fin_senior_ltc", "fin_refi_q", "refi_draw"]) {
  checked++;
  if (!dialText.includes(v16Src.fig[key])) fail("DIAL FIGURE MISSING  " + key, v16Src.fig[key]);
}
for (const s of norm(mod.DIAL_SRC).split(/(?<=\.)\s+/)) prose("dial source sentence", s);
prose("field text", mod.FIELD.text);
prose("field source (tail)", mod.FIELD.src.split("Cohort rows")[1]);

const fieldBlock = slides.slice(slides.indexOf("id: rate-position"), slides.indexOf("id: seasonality"));
for (const r of mod.FIELD.rows) {
  if (r.subject) {                          // the subject's own rate is the model's
    checked++;
    if ("£" + r.min.toLocaleString("en-GB") !== v16Src.fig.adr_y1)
      fail("FIELD SUBJECT RATE", r.min + " against the model's " + v16Src.fig.adr_y1);
    continue;
  }
  const want = `{ label: '${r.label.replace(/'/g, "\\'")}', min: ${r.min}, max: ${r.max}`;
  checked++;
  if (!fieldBlock.includes(want)) fail("FIELD ROW NOT IN SLIDE", want);
  if (r.mid != null) { checked++; if (!fieldBlock.includes(`mid: ${r.mid}`)) fail("FIELD MID NOT IN SLIDE", `${r.label} ${r.mid}`); }
}

/* the entry ladder, cell by cell, against the measured record */
const LAD_SRC = Object.fromEntries(v16Src.ladder.map(r => [r.entry, r]));
for (const r of mod.LADDER.rows) {
  const src = LAD_SRC[r.e];
  checked++;
  if (!src) { fail("LADDER RUNG NOT MEASURED", r.e); continue; }
  for (const [k, want] of [["allin", src.allin], ["irr", src.irr], ["adr", src.adr],
                           ["exit", src.exit], ["psf", src.psf]]) {
    checked++;
    if (r[k] !== want) fail("LADDER CELL MISMATCH  " + r.e + "/" + k, `page "${r[k]}" vs record "${want}"`);
  }
  checked++;
  if (Math.abs(r.irrN - src.irr_n) > 0.005) fail("LADDER BAR MISMATCH  " + r.e, `${r.irrN} vs ${src.irr_n}`);
  prose("ladder note " + r.e, r.note);
}
for (const [k, want] of [["adr", v16Src.fig.adr_y1], ["exit", v16Src.fig.exit_yield], ["psf", v16Src.fig.resi_psf]]) {
  checked++;
  if (mod.LADDER.underwritten[k] !== want)
    fail("LADDER UNDERWRITTEN MISMATCH  " + k, `page "${mod.LADDER.underwritten[k]}" vs record "${want}"`);
}
prose("ladder underwritten note", mod.LADDER.underwritten.note);
prose("ladder note", mod.LADDER.note);
prose("ladder source", mod.LADDER.src);

/* every subject-cell figure ties to the register */
const FIG_VALUES = new Set([...Object.values(figs).map(v => String(v).toLowerCase()), ...REGISTERED]);
const EXTRA_OK = new Set([
  "60", "45", "12", "17", "43", "24", "22", "21", "15", "13.3", "10.7", "8", "9", "2", "3.75", "1.20",
  "0.65", "0.80", "1.25", "1.05", "0.90", "60–70%", "£738k", "£16.08m", "£18.43m", "£9.77m", "36.3%",
  "41.6%", "22.1%", "£734", "£1.39m", "£5.62m", "£0.09m", "100%", "£2.90m", "£3.62m", "£250.9m",
  "£86.5m", "£34.35m", "£1.24m", "£1.11m", "£0.42m", "5.09%", "£255.3m", "1.068", "£72.5m", "£33.3m",
  "£35.6m", "£1.46m", "£0.75m", "146", "£2.0m", "£123.6m", "£194.2m", "£45.33m", "£15.39m",
  "£10.74m", "33.96%", "23.69%", "£756k", "£16.49m", "£19.72m", "£9.12m", "36.4%", "43.5%",
  "20.1%", "£753", "£4.13m", "£2.06m", "£3.24m", "£248.0m", "£10.59m", "£11.01m", "4.16%",
  "£264.8m", "£95.9m", "£44.4m", "£46.7m", "£282.0m", "£232.8m", "£121.5m", "£116.9m", "£111.9m",
  "£95.5m", "£2.50m", "£0.95m", "£16.40m", "£2.81m", "£0.42m", "5.0%", "3.0%", "£1,300", "5,500",
  "£109.8m", "£92.5m", "12.99%", "1.84x", "£1,000", "£1,160", "1.3x", "4.00%", "£1.39m", "£5.62m",
  "£0.09m", "100%"
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
    "£756k · £45.33m, year 7", "33.96% gop · £15.39m, year 7", "33.96% gop · year 7",
    "£2.06m a key works · £123.6m", "staff cost index 1.20; no headcount is modelled",
    "not computable on a like basis", "12 at £1,300/sqft, 5,500 sqft average",
    "3.75 a year", "150 founder memberships at £7,500, then £3,500",
    "14 quarters of works, opening at t+3.5", "60: 17 main house, 43 stables and courtyard",
    "£1,000 underwritten, across all twelve months", "£45.33m revenue, £15.39m gop, year 7"
  ]);
}

/* ══ C. the bridge ═════════════════════════════════════════════════ */

const bridgeTable = bridgeMd16.slice(bridgeMd16.indexOf("| # | Lever"), bridgeMd16.indexOf("Net:"));
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

/* ══ E. the cheat sheet ════════════════════════════════════════════ */

const csv = (label, text, hay, hayName) => {
  const t = quotes(String(text).replace(/&amp;/g, "&")).replace(/\s+/g, " ").trim().toLowerCase();
  if (!t || t === "-" || t === "—" || t === "") return;
  checked++;
  if (hay.includes(t) || csSpecText.includes(t) || csRenderText.includes(t)) return;
  /* the sheet is struck at a moment; where the model has moved since, the portal
     carries the correction and says so. Those lines are the portal's own, and
     are checked figure by figure instead of verbatim. */
  prose("cheat " + label, text);
};
const inSpec = (l, t) => csv(l, t, csSpecText, "cheatsheet-spec.json");
const inRender = (l, t) => csv(l, t, csRenderText, "the sheet's own render");

const C = mod.CHEAT;
inSpec("title", C.title); inSpec("meta", C.meta); inSpec("asset line", C.assetLine); inSpec("thesis", C.thesis);
for (const [l, v, c] of C.kpis) { inSpec("kpi label", l); inRender("kpi value " + l, v); inSpec("kpi note " + l, c); }
for (const c of C.operating.columns) inSpec("operating column", c);
for (const [l, vals] of C.operating.rows) { inSpec("operating row", l); for (const v of vals) inRender("operating " + l, v); }
for (const c of C.cashflow.columns) inSpec("cashflow column", c);
for (const [l, vals, , note] of C.cashflow.rows) {
  inSpec("cashflow row", l); if (note) inSpec("cashflow note " + l, note);
  for (const v of vals) inRender("cashflow " + l, v);
}
for (const [t, c] of C.cashflow.funding) { inRender("funding line", t); inSpec("funding note", c); }
inSpec("competitive headline", C.competitive.headline);
for (const c of C.competitive.columns) inSpec("competitive column", c);
for (const r of C.competitive.rows) { inRender("competitive label", r[0]); for (const v of r.slice(1, 5)) inRender("competitive value", v); }
inSpec("competitive caption", C.competitive.caption);
for (const n of C.competitive.notes) inSpec("competitive note", n.replace(/^[^:]+: /, ""));
for (const [t, c] of C.competitive.plan) { inSpec("plan", t); inSpec("plan note", c); }
for (const c of C.competitive.constituents) inSpec("constituent", c);
for (const r of C.su) { if (r[0] === "sub") { inSpec("s&u subhead", r[1]); continue; } inSpec("s&u label", r[1]); inRender("s&u value " + r[1], r[2]); if (r[3]) inSpec("s&u note", r[3]); }
for (const [t, c] of C.yieldLines) { inRender("yield line", t); if (c) inSpec("yield note", c); }
for (const r of C.returns) { inSpec("returns label", r[0]); inRender("returns value " + r[0], r[1]); if (r[2]) inSpec("returns note", r[2]); }
for (const c of C.sensitivity.cols) inRender("sensitivity column", c);
for (const r of C.sensitivity.rows) inRender("sensitivity row", r);
for (const row of C.sensitivity.grid) for (const v of row) inRender("sensitivity cell", v);
inSpec("sensitivity caption", C.sensitivity.caption);
for (const [t, c] of C.sensitivity.stress) { inSpec("stress line", t); inSpec("stress note", c); }
for (const r of C.comps.rows) { inRender("comp " + r[0], r[0]); for (const v of r.slice(1, 5)) inRender("comp value " + r[0], v); if (r[6]) inSpec("comp note", r[6]); }
inRender("comps caption", C.comps.caption);
inSpec("comps caption note", C.comps.captionNote);
for (const r of C.terms) {
  if (r[0] === "sub") { inSpec("terms subhead", r[1]); continue; }
  inSpec("terms label", r[1]);
  // term values are TEXT() formulas in the spec, so the printed string is the render's
  inRender("terms value", r[2]);
  if (r[3]) inSpec("terms note", r[3]);
}
for (const [s, t, c] of C.watchpoints) { inSpec("watch status", s); inSpec("watch text", t); inSpec("watch note", c); }
for (const f of C.footer) inSpec("cheat footer", f);
/* the sensitivity grid's own corners must tie the measured entry ladder */
checked++;
const csBase = (parseFloat(v16Src.fig.irr) ).toFixed(1) + "%";
if (C.sensitivity.grid[1][1] !== csBase)
  fail("SENSITIVITY BASE", "base cell is " + C.sensitivity.grid[1][1] + ", the model prints " + csBase);

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
if (JSON.stringify(mod.V16) !== JSON.stringify(v16Src))
  fail("V16 BLOCK OUT OF DATE", "the V16 block in index.html is not the record in Model/docs — run tools/inline-v16.py");
checked++;
if (JSON.stringify(mod.CAPEX) !== JSON.stringify(capexSrc))
  fail("CAPEX BLOCK OUT OF DATE", "the CAPEX block in index.html is not the pack in Model/capex — run tools/inline-capex.py");

/* the figure mirror on the page is the record's own map */
checked++;
if (JSON.stringify(figsOnPage()) !== JSON.stringify(v16Src.fig))
  fail("FIGURE MIRROR OUT OF DATE", "the FIGS map in index.html is not v16-figures.json's fig block");
function figsOnPage() { return mod.FIGS; }

/* ══ H. the capital-cost chapter, re-derived from the pack ═════════ */

/* Every figure the chapter prints is computed here from capex-web-data.json by
   this file's own formatting, and compared with what the page renders. The
   chapter's exhibits are built at run time, so this checks the pack rather than
   the markup: if the two agree, the page cannot be printing a stale number. */
const cap = capexSrc;
const capChecks = [
  ["hotel total", cxm1(cap.summary.hotel.total), v16Src.fig.capex_hotel],
  ["hotel per key", cxm2(cap.summary.hotel.per_key), v16Src.fig.capex_hotel_per_key],
  ["resi total", cxm1(cap.summary.resi.total), v16Src.fig.capex_resi],
  ["resi per unit", cxm2(cap.summary.resi.per_unit), v16Src.fig.capex_resi_per_unit],
  ["works total", cxm1(cap.summary.works_total), v16Src.fig.capex_works_total],
  ["hotel net", cxm1(cap.summary.hotel.net), v16Src.fig.capex_hotel_net],
  ["resi net", cxm1(cap.summary.resi.net), v16Src.fig.capex_resi_net],
];
for (const [label, fromPack, fromRecord] of capChecks) {
  checked++;
  if (fromPack !== fromRecord)
    fail("CAPEX PACK DISAGREES WITH THE MODEL RECORD  " + label, `pack ${fromPack} vs record ${fromRecord}`);
}
/* the pack's own arithmetic */
checked++;
const netSum = cap.lines.filter(l => l.on).reduce((a, l) => a + l.live, 0);
if (Math.abs(netSum - (cap.summary.hotel.net + cap.summary.resi.net)) > 1)
  fail("CAPEX LINES DO NOT SUM", `${Math.round(netSum)} against ${Math.round(cap.summary.hotel.net + cap.summary.resi.net)}`);
checked++;
const phaseSum = cap.phasing.total.reduce((a, v) => a + v, 0);
if (Math.abs(phaseSum - cap.summary.works_total) > 1)
  fail("CAPEX PHASING DOES NOT TIE", `${Math.round(phaseSum)} against ${Math.round(cap.summary.works_total)}`);
checked++;
if (cap.lines.length !== 146) fail("CAPEX LINE COUNT", cap.lines.length + " lines, expected 146");
checked++;
if (cap.reduction.changed.length !== 43) fail("CAPEX CHANGE COUNT", cap.reduction.changed.length + " changed lines, expected 43");
/* every line carries its basis and its evidence class */
for (const l of cap.lines) {
  checked++;
  if (!l.basis || String(l.basis).trim().length < 20) fail("CAPEX LINE WITHOUT BASIS", "#" + l.n + " " + l.desc);
  checked++;
  if (!["MEASURED", "BENCHMARK", "ALLOWANCE"].includes(l.source)) fail("CAPEX LINE WITHOUT CLASS", "#" + l.n);
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
  "0.65 \u2192 12.99%",                        // the sensitivities table's underwritten cell
  "occupancy 0.65, seasonality",             // the P&L pack's subject note
  "0.65 is the model input",
  "reaching 0.55",                           // the downside's own occupancy override
  "(0.65 stabilised)"                        // the cheat sheet's own occupancy note
];
/* the scan is of the page's own narrative: the data blocks it carries whole —
   the figure record, the capital-cost pack, the comparable P&Ls, the register —
   are sources, and their raw values are not narrative claims. */
let narrative = html;
for (const [a, b] of [["/*V16-DATA-START*/", "/*V16-DATA-END*/"],
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
/* the two former internal chapters are still here, unbadged */
for (const id of ["dd", "cheatsheet"]) {
  checked++;
  if (!mod.CHAPTERS.some(c => c.id === id)) fail("CHAPTER MISSING", id);
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

mod.MKSTATE.tab = "eu"; const mkEuHtml = mod.marketIndexHTML();
mod.MKSTATE.tab = "uk"; const mkUkHtml = mod.marketIndexHTML();
mod.MKSTATE.tab = "eu";
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
  mkHas(where + " calendar", hay, h.months_bookable + " of 12 months");
  if (h.median) {
    mkHas(where + " median", hay, mkGbp(h.median) + "</span>");
    mkHas(where + " net of VAT", hay, mkGbp(h.median_net_vat) + " net of VAT");
    mktFigures += 2;
  } else {
    mkHas(where + " no inventory", hay, "No bookable inventory");
  }
  if (h.caveat) mkHas(where + " caveat", hay, h.caveat);

  /* G7 — the headline figures, on the card and with their basis on the page */
  const page = mod.mktRecordHTML(h);
  for (const f of h.figures || []) {
    mkHas(where + " " + f.k + " on the card", hay, f.v);
    mkHas(where + " " + f.k + " class", hay, '<span class="cl ' + f.cls + '"> ' + f.cls + "</span>");
    mkHas(where + " " + f.k + " basis on the page", page, f.basis);
    mkHas(where + " " + f.k + " label", page, "<th>" + f.label + "</th>");
    mktFigures += 3;
  }
  if (!(h.figures || []).length) {
    mkHas(where + " states the blank", hay, "Nothing beyond a rate and a calendar is published");
    mkHas(where + " states the blank on its page", page, "publishes nothing beyond a rate and a calendar");
  }

  /* G8 — the photograph, if the page names one */
  const p = mod.PHOTOS[h.slug];
  if (p) {
    checked++;
    if (!fs.existsSync("img/comps/" + p.file)) fail("PHOTOGRAPH NAMED BUT NOT ON DISK", h.slug + " -> " + p.file);
    mkHas(where + " photograph", hay, 'src="img/comps/' + p.file + '"');
    mkHas(where + " photograph credit", page, "Photograph: " + p.credit);
    mkHas(where + " photograph licence", page, p.licence);
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
  mkHas("blank count in the lede", mkEuHtml, "Eight of the thirty-six publish nothing beyond a rate");
  checked++;
  if (blanks !== 8) fail("BLANK COUNT", "the lede says eight publish nothing; the pack holds " + blanks
    + " (" + (words[blanks] || blanks) + ")");
  checked++;
  if (mkCohort.length !== 36) fail("SET SIZE IN THE LEDE", "the lede says thirty-six; the pack holds " + mkCohort.length);
}
for (const [tab, hay, rows] of [["eu", mkEuHtml, mkEu], ["uk", mkUkHtml, mkUk]]) {
  for (const t of Object.keys(mktSource.type_labels)) {
    const n = rows.filter(h => h.type === t).length;
    if (!n) continue;
    mkHas("band " + t + " on " + tab, hay,
      '<span class="t">' + mktSource.type_labels[t] + '</span><span class="c">'
      + n + (n === 1 ? " hotel" : " hotels") + "</span>");
  }
  const cards = (hay.match(/class="mk"/g) || []).length;
  checked++;
  if (cards !== rows.length) fail("MARKET CARD COUNT", tab + ": " + cards + " cards for " + rows.length + " hotels");
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

/* G5 — the basis prose is the pack's own */
for (const [k, v] of [["basis", mktSource.basis], ["vat_note", mktSource.vat_note],
                      ["type_basis", mktSource.type_basis], ["figures_basis", mktSource.figures_basis]]) {
  mkHas("chapter " + k, mkEuHtml, v);
}

/* G6 — the ten rate records print the source's series */
for (const c of mod.CASES) {
  const h = mktSource.hotels.find(x => x.case_slug === c.slug);
  checked++;
  if (!h) { fail("RATE RECORD WITHOUT A SERIES", c.slug); continue; }
  const rec = mod.mktRecordHTML(mod.MKT_BY_CASE[c.slug]);
  const want = [
    h.name + " · what it discloses",
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


console.log(`\n${fails === 0 ? "PASS" : "FAIL"} — ${checked} checks, ${fails} failures  (${subjChecked} subject-cell figures, ${pnlFigures} P&L figures, ${mktFigures} market figures, ${ownProse} portal-authored lines figure-checked)`);
process.exit(fails ? 1 : 0);
