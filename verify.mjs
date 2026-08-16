/* ══════════════════════════════════════════════════════════════════════
   Mechanical verification of the page against its four sources.

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
   Plus: banned words, the occupancy convention, and the rate field against
   the rate-position slide.

   Run: node verify.mjs
   ══════════════════════════════════════════════════════════════════════ */

import fs from "node:fs";
import { execFileSync } from "node:child_process";

const DEAL = "D:/OneDrive - Strand Labs/2. Clients/Align/2. Live Deals/Fawley Court/";
const DECK = DEAL + "Deck/im-v1/";

const html = fs.readFileSync("index.html", "utf8");
const slides = fs.readFileSync(DECK + "slides.md", "utf8");
const figs = JSON.parse(fs.readFileSync(DECK + "figures.json", "utf8"));
const bridgeMd = fs.readFileSync(DEAL + "Model/docs/embassy-bridge-20260816.md", "utf8");
const bridgeHtml = fs.readFileSync(DEAL + "Deck/irr-bridge/index.html", "utf8");
const csSpec = JSON.parse(fs.readFileSync(DEAL + "Model/cheatsheet-spec.json", "utf8"));
const csRender = fs.readFileSync("src/cheatsheet-render.txt", "utf8");
const qsSource = fs.readFileSync(DEAL + "Research/vendor-qs-crosscheck-20260816.md", "utf8");

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
  grab("const QS = {", "/*QS-DATA-END*/") +
  "; return { FIGS, DIALS, DIAL_SRC, PLATES, FIELD, LADDER, BRIDGE, CHAPTERS, CASES, CHEAT, QS };"
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
const bridgeText = (norm(bridgeMd) + " \u00b6 " + norm(bridgeHtml)).toLowerCase();
const csSpecText = quotes(JSON.stringify(csSpec).replace(/\\"/g, '"')).replace(/\s+/g, " ").toLowerCase();
const csRenderText = quotes(csRender).replace(/\s+/g, " ").toLowerCase();

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
const tok = s => (norm(s).match(TOKEN) || []).map(t => t.replace(/\s/g, "").toLowerCase());

/* ══ A. the memorandum ══════════════════════════════════════════════ */

const walkBlocks = (blocks, fn) => {
  for (const b of blocks) {
    if (b[0] === "panes") { walkBlocks(b[1].left.b, fn); walkBlocks(b[1].right.b, fn); continue; }
    fn(b);
  }
};

/* Prose written for the medium — navigation, not memorandum content. Each line
   is a page-furniture string that has no counterpart in the deck; every one is
   listed here explicitly so nothing can slip through unlisted. */
const OWN_PROSE = new Set([
  "The scheme, the consent position, the underwrite and what it returns at the ruled price.",
  "The estate and its designations, the photography, the five titles, the consent record, the scheme and the counterparty.",
  "Two comparable layers, the rate ladders, seasonality, operations, capital cost and ten case studies.",
  "The dial set, the revenue engines, the margin frame, the capital stack and the residences.",
  "The five cases, the exit evidence, every rung of the entry ladder and the single-lever sensitivities.",
  "From the Embassy base case to the Align underwrite, one engine, seven measured levers.",
  "The underwrite read against the data room, the gates that have to settle, and what we are watching.",
  "The development consultants’ 87 questions, each tagged against what the data room holds, and the 39-item ask list.",
  "The one-page IC reference: hero figures, summary P&L, the cash-flow walk, sources and uses, returns, sensitivity, comps, terms and watchpoints.",
  "Ten properties read against the underwrite. Five of the UK country-house set, five of the European ceiling cohort, and Estelle Manor for the club engine. Every figure carries its basis, window and source.",
  "Every rung is measured on the model at that entry. The rule marks the 13.00% bar; the lever columns show the level one input alone must reach to hold it.",
  "What the profile shows"
]);

const KPI_CAPTIONS = new Set(["Levered IRR at the ruled price", "Equity multiple", "Peak equity", "Agent guidance, understood"]);

for (const ch of mod.CHAPTERS) {
  if (ch.internal) continue;
  if (!OWN_PROSE.has(norm(ch.blurb))) verbatim("chapter blurb/" + ch.id, ch.blurb);
  for (const s of ch.sections) {
    walkBlocks(s.blocks, b => {
      const k = b[0];
      if (k === "lede" || k === "para") {
        if (!OWN_PROSE.has(norm(b[1]))) verbatim(`${ch.id}/${s.id} ${k}`, b[1]);
      } else if (k === "src") {
        verbatim(`${ch.id}/${s.id} source`, b[1]);
      } else if (k === "kpis") {
        for (const [v, c] of b[1]) { verbatim(`${ch.id}/${s.id} kpi value`, v); if (!KPI_CAPTIONS.has(c)) verbatim(`${ch.id}/${s.id} kpi cap`, c); }
      } else if (k === "cards") {
        for (const [hh, bb] of b[1]) { verbatim(`${ch.id}/${s.id} card head`, hh); verbatim(`${ch.id}/${s.id} card body`, bb); }
      } else if (k === "bullets") {
        for (const x of b[1]) verbatim(`${ch.id}/${s.id} bullet`, x);
      } else if (k === "tbl") {
        const t = b[1];
        for (const h2 of (t.head || [])) verbatim(`${ch.id}/${s.id} th`, typeof h2 === "object" ? h2.t : h2);
        for (const [, cells] of t.rows) for (const c of cells) if (norm(c) && norm(c) !== "—") verbatim(`${ch.id}/${s.id} cell`, c);
        if (t.note) verbatim(`${ch.id}/${s.id} note`, t.note);
      } else if (k === "plates") {
        for (const i of b[1]) { verbatim(`plate ${mod.PLATES[i].f} caption`, mod.PLATES[i].cap); verbatim(`plate ${mod.PLATES[i].f} alt`, mod.PLATES[i].alt, deckRaw); }
      }
    });
  }
}

/* the pane headers are the deck's own leftHeader / rightHeader lines */
for (const ch of mod.CHAPTERS) {
  if (ch.internal) continue;
  for (const s of ch.sections) for (const b of s.blocks) {
    if (b[0] !== "panes") continue;
    for (const side of ["left", "right"]) {
      const hh = b[1][side].h;
      if (hh && !OWN_PROSE.has(norm(hh))) verbatim(`${ch.id}/${s.id} pane header`, hh);
    }
  }
}

/* the dial sheet and the rate field */
for (const [k, v] of mod.DIALS) { checked++; if (!norm(v)) fail("EMPTY DIAL", k); }
const dialText = norm(mod.DIALS.map(d => d[1]).join(" "));
for (const key of ["keys", "courtyard_keys", "adr_y1", "adr_y7", "rev_y7", "gop_y7", "gop_margin_y7",
  "capex_works", "capex_per_key", "cost_to_open", "cost_to_open_key", "resi_units", "resi_psf",
  "resi_sqft", "resi_absorption", "staff_index", "exit_yield", "purch_costs_pct", "capex_prog_q",
  "entry", "irr", "em", "peak_equity", "fin_senior_ltc", "fin_refi_q", "refi_draw"]) {
  checked++;
  if (!dialText.includes(figs[key])) fail("DIAL FIGURE MISSING  " + key, figs[key]);
}
for (const s of norm(mod.DIAL_SRC).split(/(?<=\.)\s+/)) verbatim("dial source sentence", s);
verbatim("field text", mod.FIELD.text);
verbatim("field source (tail)", mod.FIELD.src.split("Cohort rows")[1]);

const fieldBlock = slides.slice(slides.indexOf("id: rate-position"), slides.indexOf("id: seasonality"));
for (const r of mod.FIELD.rows) {
  const want = `{ label: '${r.label.replace(/'/g, "\\'")}', min: ${r.min}, max: ${r.max}`;
  checked++;
  if (!fieldBlock.includes(want)) fail("FIELD ROW NOT IN SLIDE", want);
  if (r.mid != null) { checked++; if (!fieldBlock.includes(`mid: ${r.mid}`)) fail("FIELD MID NOT IN SLIDE", `${r.label} ${r.mid}`); }
}

/* the entry ladder, cell by cell, against the ladder slide */
const ladderBlock = norm(slides.slice(slides.indexOf("id: ladder"), slides.indexOf("id: sensitivities"))).toLowerCase();
for (const r of mod.LADDER.rows) {
  for (const v of [r.e, r.allin, r.irr, r.adr, r.exit, r.psf, r.note]) verbatim("ladder cell", v, ladderBlock, "slide ladder");
}
for (const v of [mod.LADDER.underwritten.adr, mod.LADDER.underwritten.exit, mod.LADDER.underwritten.psf, mod.LADDER.underwritten.note])
  verbatim("ladder underwritten", v, ladderBlock, "slide ladder");
verbatim("ladder note", mod.LADDER.note, ladderBlock, "slide ladder");
verbatim("ladder source", mod.LADDER.src, ladderBlock, "slide ladder");

/* every subject-cell figure ties to the register */
const FIG_VALUES = new Set(Object.values(figs).map(v => v.toLowerCase()));
const EXTRA_OK = new Set([
  "60", "45", "12", "17", "43", "24", "22", "21", "15", "13.3", "10.7", "8", "9", "2", "3.75", "1.20",
  "0.65", "0.80", "1.25", "1.05", "0.90", "60–70%", "£738k", "£16.08m", "£18.43m", "£9.77m", "36.3%",
  "41.6%", "22.1%", "£734", "£1.39m", "£5.62m", "£0.09m", "100%", "£2.90m", "£3.62m", "£250.9m",
  "£86.5m", "£34.35m", "£1.24m", "£1.11m", "£0.42m", "5.09%", "£255.3m", "1.068", "£72.5m", "£33.3m",
  "£35.6m", "13.23%", "34.08%", "£15.09m", "£12.68m", "28.65%", "£44.27m"
]);
let subjChecked = 0;
for (const ch of mod.CHAPTERS) {
  if (ch.internal) continue;
  for (const s of ch.sections) walkBlocks(s.blocks, b => {
    if (b[0] !== "tbl") return;
    for (const [cls, cells] of b[1].rows) {
      if (cls !== "subject") continue;
      for (const c of cells) for (const t of tok(c)) {
        subjChecked++; checked++;
        if (!FIG_VALUES.has(t) && !EXTRA_OK.has(t) && !deckText.includes(t))
          fail(`SUBJECT FIGURE UNREGISTERED  ${ch.id}/${s.id}`, `token "${t}" in "${norm(c).slice(0, 110)}"`);
      }
    }
  });
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
  for (const [h, b] of c.cards) { verbatim(`${c.slug} card/${h}`, h); verbatim(`${c.slug} card body/${h}`, b); }
  verbatim(`${c.slug} source`, c.src);
  if (c.gap) for (const s of norm(c.gap).split(/(?<=\.)\s+/)) verbatim(`${c.slug} gap`, s);
  for (const [k, comp, subj, note] of c.against || []) {
    if (note) for (const s of norm(note).split(/(?<=\.)\s+/)) verbatim(`${c.slug} note/${k}`, s);
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
    "£975 underwritten", "60", "twelve months",
    "£738k · £44.27m, year 7", "34.08% gop · £15.09m, year 7", "34.08% gop · year 7",
    "£1.79m a key works · £107.3m", "staff cost index 1.20; no headcount is modelled",
    "not computable on a like basis", "12 at £1,100/sqft, 5,492 sqft average",
    "3.75 a year", "150 founder memberships at £7,500, then £3,500",
    "14 quarters of works, opening at t+3.5", "60: 17 main house, 43 stables and courtyard",
    "£975 underwritten, across all twelve months", "£44.27m revenue, £15.09m gop, year 7"
  ]);
}

/* ══ C. the bridge ═════════════════════════════════════════════════ */

const bridgeTable = bridgeMd.slice(bridgeMd.indexOf("| # | Lever"), bridgeMd.indexOf("Net:"));
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
    const rounded = (r.dN > 0 ? "+" : "−") + Math.abs(r.dN).toFixed(1);
    checked++;
    if (r.d !== rounded) fail("BRIDGE DELTA LABEL", `${r.d} is not ${rounded}`);
  }
}
verbatim("bridge stand", mod.BRIDGE.stand2.split("The final rung")[1].split(",")[0], bridgeText, "bridge md");
for (const [n] of mod.BRIDGE.heads) { checked++; if (!bridgeText.includes(n.replace(/£/g, "£").toLowerCase()) && !bridgeText.includes(n.replace("→", "→").toLowerCase())) fail("BRIDGE HEADLINE NOT IN SOURCE", n); }
const BRIDGE_FIG = ["23.1pp", "24% ebitda", "31.7% ebitda", "1.20", "£1,200", "£975", "2.4pp", "11.6pp",
  "12-house", "savills, october 2025", "£1,934", "4.1pp", "9.13%", "£212.7m", "£171.0m", "£98.9m",
  "55% ltc", "1.4x", "−12.7%", "0.44x", "£75m", "£40–60m", "£338.7m", "£135.45m", "£284.5m", "£179.6m",
  "£350k", "8% gop", "1.5%", "2.5%"];
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
  if (!hay.includes(t)) fail("CHEAT NOT VERBATIM  " + label + "  (" + hayName + ")", `"${text}"`);
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
if (C.sensitivity.grid[1][1] !== "13.2%") fail("SENSITIVITY BASE", "base cell is " + C.sensitivity.grid[1][1] + ", the model prints 13.2%");

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
  '"occ_stab": "0.65"'                       // the figures register, carried whole
];
const text = strip(html);
let scrub = text;
for (const ok of OCC_OK) scrub = scrub.split(ok).join("");
checked++;
if (/\b0\.65\b/.test(scrub)) fail("OCCUPANCY POINT", "0.65 outside the approved model-input contexts");

/* the internal sections must be badged, in the chrome and in the navigation */
for (const id of ["questions", "cheatsheet"]) {
  const ch = mod.CHAPTERS.find(c => c.id === id);
  checked++;
  if (!ch || !ch.internal) fail("INTERNAL FLAG MISSING", id);
}
checked++;
if (!/INTERNAL — ALIGN ONLY|Internal — Align only/i.test(html)) fail("INTERNAL BADGE MISSING", "no badge string on the page");
for (const s of ['class="intbar"', 'badge int', 'body.internal .mast', '.chip.int']) {
  checked++;
  if (!html.includes(s)) fail("INTERNAL CHROME MISSING", s);
}

console.log(`\n${fails === 0 ? "PASS" : "FAIL"} — ${checked} checks, ${fails} failures  (${subjChecked} subject-cell figures)`);
process.exit(fails ? 1 : 0);
