"""Mechanical polish audit across every route and breakpoint: touch targets,
contrast, horizontal overflow, text-size floor, image alt text, console errors.
Also exercises the finder, the register's filters, the disclosures, the ladder,
the tab strips and the lightbox."""
import asyncio, json
from playwright.async_api import async_playwright
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE = "http://127.0.0.1:8732/"
SIZES = {"ipad-land": (1180, 820), "ipad-port": (820, 1180), "phone": (390, 844), "desktop": (1512, 950)}

CHAPTERS = {
    "summary": [""],
    "asset": ["", "photography", "title", "planning", "scheme", "counterparty"],
    "evidence": ["", "layers", "cohort-rate", "uk-rate", "seasonality", "cohort-ops", "uk-ops", "capex", "pnl"],
    "underwrite": ["", "dial-set", "engines", "margin", "capital", "profile", "residences", "residences-evidence"],
    "capital": ["", "schedule", "zones", "phasing", "residences", "excluded"],
    "returns": ["", "cases", "sensitivities", "exit"],
    "bridge": [""],
    "dd": ["", "asks", "keys", "room", "gates", "closing"],
    "cheatsheet": [""],
    "market": [""],
}
ROUTES = ["#/"]
for _c, _vs in CHAPTERS.items():
    ROUTES += ["#/c/" + _c + ("/" + _v if _v else "") for _v in _vs]
ROUTES += ["#/h/cliveden", "#/h/cliveden/pnl", "#/h/estelle", "#/h/rosa-alpina/pnl",
           "#/h/grand-controle/pnl", "#/h/borgo-egnazia/pnl"]

# chapter 10's destinations, read off the pack so the list cannot drift from it:
# a rate record on each written case, and a property page for the rest
_MKT = json.load(open("src/market-data.json", encoding="utf-8"))["hotels"]
ROUTES += ["#/h/" + h["case_slug"] + "/rate" for h in _MKT if h.get("case_slug")]
ROUTES += ["#/m/" + h["slug"] for h in _MKT
           if h.get("in_cohort") and not h.get("case_slug")]
CARDS = ["ledger", "calendar", "plate"]
# the subject rides at the head of both tabs, so a tab is its hotels plus one
_COH = [h for h in _MKT if h.get("in_cohort")]
MKT_CARDS = {"eu": 29, "uk": 9}

JS = r"""
() => {
  const out = {tap: [], small: [], overflow: [], noalt: [], contrast: []};
  const vw = document.documentElement.clientWidth;
  const lum = c => { const s = c.map(v => { v /= 255; return v <= .03928 ? v/12.92 : Math.pow((v+.055)/1.055, 2.4); });
                     return .2126*s[0] + .7152*s[1] + .0722*s[2]; };
  const rgb = s => (s.match(/\d+(\.\d+)?/g) || [0,0,0]).slice(0,3).map(Number);
  const bgOf = el => { let n = el; while (n && n !== document.documentElement) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return rgb(c);
      n = n.parentElement; } return [252,252,251]; };

  for (const el of document.querySelectorAll('button, a, input, summary, [tabindex="0"]')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (el.closest('svg')) continue;
    if (r.height < 44 || r.width < 40) out.tap.push([el.className.baseVal ?? el.className ?? el.tagName, Math.round(r.width), Math.round(r.height), (el.textContent||'').trim().slice(0,34)]);
  }
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('svg')) continue;
    const direct = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!direct) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
    const px = parseFloat(cs.fontSize);
    if (px < 11.5) out.small.push([el.className || el.tagName, px, (el.textContent||'').trim().slice(0,34)]);
    const fg = rgb(cs.color), bg = bgOf(el);
    const L1 = lum(fg), L2 = lum(bg);
    const ratio = (Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
    const big = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight) >= 700);
    const need = big ? 3 : 4.5;
    if (ratio < need) out.contrast.push([el.className || el.tagName, cs.color, +ratio.toFixed(2), need, (el.textContent||'').trim().slice(0,34)]);
  }
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0) continue;
    if (r.right > vw + 1.5 || r.left < -1.5) {
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed') continue;
      let n = el, clipped = false;
      while (n && n !== document.body) { const o = getComputedStyle(n); if (/auto|scroll|hidden/.test(o.overflowX)) { clipped = true; break; } n = n.parentElement; }
      if (clipped) continue;
      out.overflow.push([el.className || el.tagName, Math.round(r.left), Math.round(r.right), vw]);
    }
  }
  for (const im of document.querySelectorAll('img')) if (!im.hasAttribute('alt')) out.noalt.push(im.src);
  out.docScroll = [document.documentElement.scrollWidth, vw];
  return out;
}
"""


async def main():
    findings = {}
    async with async_playwright() as p:
        br = await p.chromium.launch()
        for sname, (w, h) in SIZES.items():
            ctx = await br.new_context(viewport={"width": w, "height": h}, service_workers="block")
            page = await ctx.new_page()
            errs = []
            page.on("console", lambda m: errs.append(m.type + ": " + m.text)
                    if m.type in ("error", "warning")
                    and "Service Worker registration blocked" not in m.text else None)
            page.on("pageerror", lambda e: errs.append("PAGEERROR " + str(e)))
            page.on("requestfailed", lambda r: errs.append("REQFAIL " + r.url))
            for route in ROUTES:
                await page.goto(BASE + route, wait_until="networkidle")
                await page.wait_for_timeout(400)
                # open every disclosure on the route: the argument must audit too
                n_open = await page.evaluate("() => { const d=[...document.querySelectorAll('details.reason')]; d.forEach(x=>x.open=true); return d.length; }")
                await page.wait_for_timeout(200)
                r = await page.evaluate(JS)
                for k, v in r.items():
                    if k == "docScroll":
                        if v[0] > v[1] + 1:
                            findings.setdefault("docScroll", []).append([sname, route, v])
                        continue
                    for item in v:
                        findings.setdefault(k, set()).add(json.dumps([sname, route.replace('#/', '') or 'index'] + list(item)))

            # the finder: open it, type, land on a question
            await page.goto(BASE + "#/", wait_until="networkidle")
            await page.click("#findbtn"); await page.wait_for_timeout(350)
            await page.fill("#findinput", "parking"); await page.wait_for_timeout(350)
            hits = await page.locator(".hit").count()
            if hits == 0:
                findings.setdefault("finder", []).append([sname, "searching 'parking' returned nothing"])
            elif await page.locator(".hit[data-qkey]").count() == 0:
                findings.setdefault("finder", []).append([sname, "searching 'parking' found no register question"])
            else:
                await page.locator(".hit[data-qkey]").first.click()
                await page.wait_for_timeout(600)
                if "#/c/dd" not in page.url:
                    findings.setdefault("finder", []).append([sname, "a question hit did not land on the register: " + page.url])
                elif await page.locator(".q.open").count() == 0:
                    findings.setdefault("finder", []).append([sname, "the question did not open"])
            await page.goto(BASE + "#/", wait_until="networkidle")
            await page.click("#findbtn"); await page.wait_for_timeout(300)
            await page.fill("#findinput", "Reschio"); await page.wait_for_timeout(350)
            await page.locator(".hit").first.click(); await page.wait_for_timeout(500)
            if "reschio" not in page.url:
                findings.setdefault("finder", []).append([sname, "a hotel hit did not land on its case: " + page.url])

            # the sheets, the register filters, a rung, a plate
            await page.goto(BASE + "#/c/dd", wait_until="networkidle")
            await page.click("#tocbtn"); await page.wait_for_timeout(500)
            await page.click("#dialbtn"); await page.wait_for_timeout(500)
            await page.click("#dialbtn"); await page.wait_for_timeout(300)
            await page.click('[data-qstatus="NOT IN ROOM"]'); await page.wait_for_timeout(350)
            n = await page.locator(".q").count()
            if n != 26:
                findings.setdefault("filter", []).append([sname, "NOT IN ROOM filter showed %d, expected 26" % n])
            await page.click(".q-h"); await page.wait_for_timeout(400)
            await page.click('[data-qstatus=""]'); await page.wait_for_timeout(300)
            await page.fill("#qsearch", "asbestos"); await page.wait_for_timeout(500)
            if await page.locator(".q").count() == 0:
                findings.setdefault("search", []).append([sname, "asbestos search returned nothing"])

            # the capital-cost schedule: a filter, a search and a line disclosure
            await page.goto(BASE + "#/c/capital/schedule", wait_until="networkidle")
            await page.click('[data-cxlimb="resi"]'); await page.wait_for_timeout(350)
            if await page.locator(".cxl").count() != 8:
                findings.setdefault("capex filter", []).append(
                    [sname, "the residential limb showed %d lines, expected 8" % await page.locator(".cxl").count()])
            await page.click('[data-cxlimb=""]'); await page.wait_for_timeout(300)
            await page.fill("#cxsearch", "sewage"); await page.wait_for_timeout(500)
            if await page.locator(".cxl").count() == 0:
                findings.setdefault("capex search", []).append([sname, "sewage returned nothing"])
            await page.click(".cxl-h"); await page.wait_for_timeout(400)
            if not await page.locator(".cxl.open").count():
                findings.setdefault("capex line", []).append([sname, "a line did not open"])
            await page.fill("#cxsearch", ""); await page.wait_for_timeout(400)

            await page.goto(BASE + "#/c/returns", wait_until="networkidle")
            await page.click('[data-lad="4"]'); await page.wait_for_timeout(300)
            txt = await page.locator("#laddetail").inner_text()
            if "8.88%" not in txt:          # the £70m rung on the v16 ladder
                findings.setdefault("ladder", []).append([sname, "rung detail did not update: " + txt[:60]])

            # the comparative ranking opens the hotel's own estimated P&L
            await page.goto(BASE + "#/c/evidence/pnl", wait_until="networkidle")
            await page.click(".rankrow.link"); await page.wait_for_timeout(500)
            if "/pnl" not in page.url:
                findings.setdefault("ranking", []).append([sname, "a ranking row did not open its P&L: " + page.url])

            # chapter 10: every card treatment, both tabs, and the tab switch itself
            for card in CARDS:
                for tab in ("eu", "uk"):
                    await page.goto(BASE + "?variants=1&card=" + card + "#/c/market", wait_until="networkidle")
                    await page.wait_for_timeout(350)
                    if tab == "uk":
                        await page.click('[data-mktab="uk"]')
                        await page.wait_for_timeout(300)
                    n = await page.locator(".mk").count()
                    want = MKT_CARDS[tab]
                    if n != want:
                        findings.setdefault("market grid", []).append(
                            [sname, card, tab, "showed %d cards, expected %d" % (n, want)])
                    r = await page.evaluate(JS)
                    for k, v in r.items():
                        if k == "docScroll":
                            if v[0] > v[1] + 1:
                                findings.setdefault("docScroll", []).append([sname, "market/" + card + "/" + tab, v])
                            continue
                        for item in v:
                            findings.setdefault(k, set()).add(json.dumps([sname, "market/" + card + "/" + tab] + list(item)))
            # a card leads to its property page
            await page.goto(BASE + "#/c/market", wait_until="networkidle")
            await page.wait_for_timeout(300)
            await page.click('.mk[data-hash^="#/m/"]')
            await page.wait_for_timeout(500)
            if "#/m/" not in page.url:
                findings.setdefault("market card", []).append([sname, "a card did not open its page: " + page.url])

            await page.goto(BASE + "#/c/asset", wait_until="networkidle")
            await page.click('[data-plate="0"]'); await page.wait_for_timeout(600)
            if not await page.locator(".lb.on").count():
                findings.setdefault("lightbox", []).append([sname, "did not open"])
            await page.keyboard.press("Escape"); await page.wait_for_timeout(300)

            if errs:
                findings.setdefault("console", []).append([sname, errs[:8]])
            await ctx.close()
        await br.close()

    for k, v in findings.items():
        items = sorted(v) if isinstance(v, set) else v
        print(f"\n=== {k}  ({len(items)}) ===")
        for i in items[:40]:
            print("  ", i)
    if not findings:
        print("clean")

asyncio.run(main())
