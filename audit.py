"""Mechanical polish audit across every route and breakpoint: touch targets,
contrast, horizontal overflow, text-size floor, image alt text, console errors.
Also exercises the register's filters, the ladder and the lightbox."""
import asyncio, json
from playwright.async_api import async_playwright

BASE = "http://127.0.0.1:8732/"
SIZES = {"ipad-land": (1180, 820), "ipad-port": (820, 1180), "phone": (390, 844), "desktop": (1512, 950)}
ROUTES = ["#/", "#/c/asset", "#/c/evidence", "#/c/underwrite", "#/c/returns", "#/c/bridge",
          "#/c/dd", "#/c/questions", "#/c/questions/asks", "#/c/questions/keys", "#/c/cheatsheet",
          "#/h/cliveden", "#/h/estelle", "#/h/rosa-alpina"]

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

  for (const el of document.querySelectorAll('button, a, input, [tabindex="0"]')) {
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
            ctx = await br.new_context(viewport={"width": w, "height": h})
            page = await ctx.new_page()
            errs = []
            page.on("console", lambda m: errs.append(m.type + ": " + m.text) if m.type in ("error", "warning") else None)
            page.on("pageerror", lambda e: errs.append("PAGEERROR " + str(e)))
            page.on("requestfailed", lambda r: errs.append("REQFAIL " + r.url))
            for route in ROUTES:
                await page.goto(BASE + route, wait_until="networkidle")
                await page.wait_for_timeout(420)
                r = await page.evaluate(JS)
                for k, v in r.items():
                    if k == "docScroll":
                        if v[0] > v[1] + 1:
                            findings.setdefault("docScroll", []).append([sname, route, v])
                        continue
                    for item in v:
                        findings.setdefault(k, set()).add(json.dumps([sname, route.replace('#/', '') or 'index'] + list(item)))

            # interaction states: the contents sheet, the dials sheet, a filter, a rung, a plate
            await page.goto(BASE + "#/c/questions", wait_until="networkidle")
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
            n2 = await page.locator(".q").count()
            if n2 == 0:
                findings.setdefault("search", []).append([sname, "asbestos search returned nothing"])
            await page.goto(BASE + "#/c/returns", wait_until="networkidle")
            await page.click('[data-lad="4"]'); await page.wait_for_timeout(300)
            txt = await page.locator("#laddetail").inner_text()
            if "8.91%" not in txt:
                findings.setdefault("ladder", []).append([sname, "rung detail did not update: " + txt[:60]])
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
