/* Dump the page's own data structures as readable text, for inventory work.
   Not a gate: a working tool. `node tools/dump.mjs <what>` where <what> is
   chapters | figs | ladder | bridge | cheat | dials | field | cases. */
import fs from "fs";
const html = fs.readFileSync("index.html", "utf8");
const grab = (from, to) => {
  const a = html.indexOf(from); const b = html.indexOf(to, a);
  return html.slice(a, b);
};
const mod = new Function(
  grab("const FIGS =", "</script>") +
  grab("const CHAPTERS = [", "</script>") +
  grab("const CASES = [", "const BY_SLUG") +
  grab("const CHEAT = {", "</script>") +
  grab("const QS = {", "/*QS-DATA-END*/") +
  "; return { FIGS, DIALS, DIAL_SRC, PLATES, FIELD, LADDER, BRIDGE, PNL, PNL_CASE,"
  + " PNL_NOTES, PNL_PROSE, CHAPTERS, CASES, CHEAT, QS };"
)();

const what = process.argv[2] || "chapters";
const only = process.argv[3];

const line = s => String(s).replace(/\s+/g, " ").trim();
const walk = (b, depth, out) => {
  if (!Array.isArray(b)) { out.push("  ".repeat(depth) + JSON.stringify(b)); return; }
  const [kind, payload] = b;
  out.push("  ".repeat(depth) + "[" + kind + "] " + (payload === undefined ? "" : line(JSON.stringify(payload))));
};

if (what === "chapters") {
  for (const c of mod.CHAPTERS) {
    if (only && c.id !== only) continue;
    console.log(`\n═══ ${c.num} ${c.title} (id=${c.id}) — ${c.blurb}`);
    console.log(`    figures: ${JSON.stringify(c.figures)}`);
    for (const v of c.views) {
      console.log(`\n  ── view "${v.id}" — ${v.title} | figure: ${v.figure} | ${v.blurb || ""}`);
      for (const b of v.lead) walk(b, 2, { push: s => console.log(s) });
      console.log("    ---- reason ----");
      for (const b of v.reason) walk(b, 2, { push: s => console.log(s) });
    }
  }
} else {
  console.log(JSON.stringify(mod[what.toUpperCase()], null, 1));
}
