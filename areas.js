/* Fawley Court — estate areas bolt-on. Loaded only for #/areas routes. */
(() => {
  "use strict";

  const AREA_ROUTE = "#/c/capital/areas";   /* the chapter-05 tab */
  let pack = null, loadPromise = null, warmed = false;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const money = n => "£" + (n / 1e6).toFixed(2) + "m";
  const money0 = n => "£" + Math.round(n).toLocaleString("en-GB");
  const pct = n => (n * 100).toFixed(1) + "%";
  const qty = n => Number(n).toLocaleString("en-GB", { maximumFractionDigits: 2 });
  const unit = u => u === "m2" ? "m²" : u;
  const words = { "seventeen": 17, "forty-three": 43, "twelve": 12 };

  function areaUnit(a) {
    const text = (a.what + " " + a.earns).toLowerCase();
    if (a.key === "hall") return [words.seventeen, "key"];
    if (a.key === "courtyard") return [words["forty-three"], "key"];
    if (a.key === "residences") return [words.twelve, "unit"];
    return null;
  }

  function injectStyles() {
    if ($( "#areas-styles")) return;
    const css = `
      .areas-status { min-height: 260px; display:grid; place-items:center; color:var(--muted); }
      .areas-status p { font-size:var(--fs-sm); }
      .area-exhibit { margin-top:clamp(20px,2.8vw,34px); }
      .area-exhibit button { display:block; width:100%; background:var(--surface-3); border:1px solid var(--line); border-radius:var(--radius); overflow:hidden; }
      .area-exhibit img { width:100%; height:auto; max-height:min(68vh,760px); object-fit:contain; margin:auto; }
      .area-cap { display:flex; gap:12px; justify-content:space-between; margin-top:8px; font-size:var(--fs-cap); color:var(--muted); }
      .area-strip { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,168px),1fr)); gap:10px; margin-top:12px; }
      .area-strip button { min-height:44px; background:var(--surface-3); border:1px solid var(--line); border-radius:var(--radius); overflow:hidden; aspect-ratio:3 / 2; }
      .area-strip img { width:100%; height:100%; object-fit:cover; }
      .area-section { margin-top:clamp(42px,5.5vw,72px); }
      .area-section > h2 { font-size:var(--fs-h2); line-height:1.2; padding-bottom:9px; border-bottom:1px solid var(--line-strong); margin-bottom:16px; }
      .area-copy { max-width:72ch; line-height:var(--lh-relaxed); }
      .area-numbers { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); border-top:1px solid var(--line-strong); border-bottom:1px solid var(--line-strong); }
      .area-numbers > div { min-width:0; padding:14px 14px 15px 0; }
      .area-numbers > div + div { padding-left:14px; border-left:1px solid var(--line); }
      .area-numbers .v { display:block; color:var(--accent); font-weight:700; font-size:var(--fs-h3); font-variant-numeric:tabular-nums; }
      .area-numbers .l { display:block; color:var(--muted); font-size:var(--fs-cap); line-height:1.4; margin-top:4px; }
      .area-lines { border-top:1px solid var(--line-strong); }
      .area-line { display:grid; grid-template-columns:minmax(0,1fr) 94px 118px; gap:10px 18px; align-items:baseline; padding:13px 0; border-bottom:1px solid var(--line); }
      .area-line .d { font-size:var(--fs-sm); line-height:1.45; }
      .area-line .m { color:var(--muted); font-size:var(--fs-cap); margin-top:4px; }
      .area-line .q, .area-line .r { text-align:right; font-size:var(--fs-sm); font-variant-numeric:tabular-nums; white-space:nowrap; }
      .area-line .r { color:var(--accent); font-weight:700; }
      .area-source { font-size:var(--fs-micro); color:var(--muted); letter-spacing:.08em; text-transform:uppercase; }
      .area-programme { border-top:1px solid var(--line-strong); padding-top:14px; }
      .area-qaxis, .area-qbar { display:grid; grid-template-columns:repeat(17,minmax(0,1fr)); gap:2px; }
      .area-qaxis span { font-size:var(--fs-micro); color:var(--muted); text-align:center; }
      .area-qbar { margin-top:8px; min-height:30px; background:repeating-linear-gradient(90deg,transparent 0,transparent calc((100% - 32px)/17),var(--line) calc((100% - 32px)/17),var(--line) calc((100% - 30px)/17)); }
      .area-qbar .fill { grid-row:1; background:var(--accent); border-radius:2px; min-height:30px; }
      /* namespaced: the shell's own .bar is the fixed bottom chapter bar */
      .area-qnote { margin-top:9px; font-size:var(--fs-sm); color:var(--muted); }
      .area-earns { background:var(--accent-tint); border-left:3px solid var(--accent); padding:clamp(17px,2.2vw,25px); }
      .area-earns h2 { font-size:var(--fs-h2); line-height:1.2; margin-bottom:9px; }
      .area-earns p { max-width:72ch; font-size:clamp(1rem,.94rem + .24vw,1.08rem); font-weight:700; line-height:var(--lh-relaxed); }
      .area-watch { border-left:3px solid var(--neg); padding-left:16px; }
      .area-watch p { max-width:72ch; line-height:var(--lh-relaxed); }
      .area-split { border-left:3px solid var(--neg); padding:14px 0 14px 16px; font-size:var(--fs-sm); line-height:var(--lh-relaxed); }
      .area-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:clamp(18px,2.7vw,34px); margin-top:clamp(28px,4vw,52px); }
      .area-card { min-width:0; border-top:1px solid var(--line-strong); padding-top:10px; text-align:left; }
      .area-card button { display:block; width:100%; min-height:44px; text-align:left; }
      .area-card .im { display:block; background:var(--surface-3); aspect-ratio:3 / 2; overflow:hidden; border-radius:var(--radius); }
      .area-card .im img { width:100%; height:100%; object-fit:cover; }
      .area-card h2 { font-size:var(--fs-h2); margin-top:12px; color:var(--ink); }
      .area-card button:hover h2, .area-card button:focus-visible h2 { color:var(--accent); }
      .area-card .d { color:var(--muted); font-size:var(--fs-sm); line-height:1.48; margin-top:6px; }
      .area-card .f { color:var(--accent); font-size:var(--fs-sm); font-weight:700; margin-top:10px; font-variant-numeric:tabular-nums; }
      @media (max-width:700px) { .area-numbers{grid-template-columns:repeat(2,minmax(0,1fr));}.area-numbers>div:nth-child(3){border-left:0;border-top:1px solid var(--line);}.area-numbers>div:nth-child(4){border-top:1px solid var(--line);}.area-line{grid-template-columns:minmax(0,1fr) 92px;}.area-line .r{grid-column:2;}.area-hub-intro{grid-template-columns:1fr;}.area-grid{grid-template-columns:1fr;}.area-qaxis span{font-size:11.5px;letter-spacing:-.06em;} }
    `;
    const style = document.createElement("style");
    style.id = "areas-styles"; style.textContent = css; document.head.append(style);
  }

  function image(a, im, n, lead) {
    const label = `${a.label} · CGI view ${n + 1}`;
    return lead
      ? `<section class="area-exhibit st" style="--i:1"><button data-areaimg="${n}" aria-label="Open ${esc(label)}"><img src="${esc(im.thumb)}" alt="${esc(label)}" loading="eager" width="${im.w}" height="${im.h}"></button><p class="area-cap"><span>Indicative CGI · view ${n + 1} of ${a.images.length}</span><span>Open full size</span></p></section>`
      : `<button data-areaimg="${n}" aria-label="Open ${esc(label)}"><img src="${esc(im.thumb)}" alt="${esc(label)}" loading="lazy" width="${im.w}" height="${im.h}"></button>`;
  }

  function numbers(a) {
    const per = areaUnit(a);
    const cells = [[money(a.loaded), "Loaded cost"], [money(a.net), "Net works"], [pct(a.share_of_works), "Of total works"]];
    if (per) cells.push([money(a.loaded / per[0]), `Per ${per[1]} · ${per[0]} ${per[1]}${per[0] === 1 ? "" : "s"}`]);
    else cells.push([`${a.n_live} live`, `${a.n_lines} schedule lines`]);
    return `<div class="area-numbers">${cells.map(([v, l]) => `<div><span class="v">${v}</span><span class="l">${l}</span></div>`).join("")}</div>`;
  }

  function lines(a) {
    return `<div class="area-lines">${a.top_lines.map(l => `<div class="area-line"><div><div class="d">${esc(l.desc)}</div><div class="m">Line ${l.n} · <span class="area-source">${esc(l.source)}</span> · ${esc(l.risk)}</div></div><div class="q">${qty(l.qty)} ${unit(l.unit)}<br>@ ${money0(l.rate)}</div><div class="r">${money0(l.net)}</div></div>`).join("")}</div>`;
  }

  function programme(a) {
    const q = Array.from({ length: 17 }, (_, i) => `<span>Q${i + 1}</span>`).join("");
    return `<div class="area-programme"><div class="area-qaxis" aria-hidden="true">${q}</div><div class="area-qbar" aria-label="Programme Q${a.start_q} to Q${a.end_q}"><span class="fill" style="grid-column:${a.start_q} / ${a.end_q + 1}"></span></div><p class="area-qnote">Built from Q${a.start_q} to Q${a.end_q}.</p></div>`;
  }


  function page(a) {
    const extra = a.images.slice(1).map((im, i) => image(a, im, i + 1, false)).join("");
    const gallery = extra ? `<div class="area-strip" aria-label="More CGI views">${extra}</div>` : "";
    return `${image(a, a.images[0], 0, true)}${gallery}<section class="area-section st" style="--i:2"><h2>What it is</h2><p class="area-copy">${esc(a.what)}</p></section><section class="area-section st" style="--i:3"><h2>Its number</h2>${numbers(a)}</section><section class="area-section st" style="--i:4"><h2>The works</h2><p class="area-copy" style="margin-bottom:18px">${esc(a.works)}</p>${lines(a)}</section><section class="area-section st" style="--i:5"><h2>When it is built</h2>${programme(a)}</section><section class="area-section area-earns st" style="--i:6"><h2>What it earns</h2><p>${esc(a.earns)}</p></section><section class="area-section area-watch st" style="--i:7"><h2>What to watch</h2><p>${esc(a.watch)}</p></section><p class="src">Source: area pack derived from the 162-line capital-cost schedule. ${esc(pack.meta.note)}</p><nav class="pager"><button data-area="${a.key}" data-area-step="-1"><span class="pg-l">‹ Previous</span><span class="nm">Previous area</span></button><button class="r" data-area="${a.key}" data-area-step="1"><span class="pg-l">Next ›</span><span class="nm">Next area</span></button></nav>`;
  }

  function hub() {
    const p = pack.meta;
    return `<section class="area-grid st" style="--i:1">${pack.areas.map(a => `<article class="area-card"><button data-area="${a.key}"><span class="im"><img src="${esc(a.images[0].thumb)}" alt="${esc(a.label)} CGI" loading="lazy" width="${a.images[0].w}" height="${a.images[0].h}"></span><h2>${esc(a.label)}</h2><p class="d">${esc(a.what)}</p><p class="f">${money(a.loaded)} loaded · ${a.images.length} CGI view${a.images.length === 1 ? "" : "s"} <span aria-hidden="true">›</span></p></button></article>`).join("")}</section>`;
  }

  function warm() {
    if (warmed || !pack) return;
    warmed = true;
    const files = pack.areas.flatMap(a => a.images.flatMap(im => [im.thumb, im.full]));
    const go = () => files.forEach((file, i) => setTimeout(() => fetch(file).catch(() => {}), i * 240));
    if ("requestIdleCallback" in window) requestIdleCallback(go, { timeout: 5000 }); else setTimeout(go, 1200);
  }

  function load() {
    if (pack) return Promise.resolve(pack);
    if (!loadPromise) loadPromise = fetch("src/areas-data.json").then(r => {
      if (!r.ok) throw new Error("The estate areas pack could not be loaded.");
      return r.json();
    }).then(x => { pack = x; injectStyles(); warm(); return pack; });
    return loadPromise;
  }

  function render(key) {
    if (!pack) return `<div class="areas-status"><p>Loading estate areas…</p></div>`;
    const a = pack.areas.find(x => x.key === key);
    return a ? page(a) : hub();
  }

  document.addEventListener("click", e => {
    const imageButton = e.target.closest("[data-areaimg]");
    if (imageButton && pack) {
      const a = pack.areas.find(x => location.hash.endsWith("/" + x.key));
      if (a && window.openLB) {
        const images = a.images.map((im, i) => Object.assign({}, im, { cap: `${a.label} · CGI view ${i + 1}`, alt: `${a.label} · CGI view ${i + 1}`, source: "Indicative CGI" }));
        window.openLB(+imageButton.dataset.areaimg, images);
      }
      return;
    }
    const area = e.target.closest("[data-area]");
    if (!area || !pack) return;
    const i = pack.areas.findIndex(a => a.key === area.dataset.area);
    const next = area.dataset.areaStep ? pack.areas[(i + +area.dataset.areaStep + pack.areas.length) % pack.areas.length] : pack.areas[i];
    if (next) location.hash = AREA_ROUTE + "/" + next.key;
  });

  window.AreasChapter = { load, render, ready: () => !!pack, warm,
    area: k => pack ? pack.areas.find(a => a.key === k) : null,
    meta: () => pack ? pack.meta : null };
})();
