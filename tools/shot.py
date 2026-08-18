"""Viewport shots of one route, for reading a region at full scale.

    python tools/shot.py "#/c/capital/schedule" out.png [scrollY] [width] [height]
"""
import sys, os, asyncio
from playwright.async_api import async_playwright

BASE = "http://127.0.0.1:8732/"
route = sys.argv[1]
out = sys.argv[2]
scroll = int(sys.argv[3]) if len(sys.argv) > 3 else 0
w = int(sys.argv[4]) if len(sys.argv) > 4 else 1512
h = int(sys.argv[5]) if len(sys.argv) > 5 else 950
js = os.environ.get("JS", "")


async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch()
        ctx = await br.new_context(viewport={"width": w, "height": h}, service_workers="block",
                                   device_scale_factor=2, reduced_motion="reduce")
        page = await ctx.new_page()
        errs = []
        page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errs.append(str(e)))
        await page.goto(BASE, wait_until="networkidle")
        await page.evaluate(f"location.hash = {route!r}")
        await page.wait_for_timeout(700)
        print("  route:", await page.evaluate("location.hash"),
              "| h1:", await page.evaluate("document.querySelector('#view h1')?.textContent"))
        if js:
            await page.evaluate(js)
            await page.wait_for_timeout(400)
        if scroll:
            await page.evaluate(f"window.scrollTo(0,{scroll})")
            await page.wait_for_timeout(300)
        await page.screenshot(path=out)
        print("saved", out, "| console errors:", errs[:5] if errs else "none")
        await br.close()

asyncio.run(main())
