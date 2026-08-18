"""Full-page shots of chapter 10 in each card treatment, on each tab.

    python tools/mktshot.py [tag]        writes snaps/<tag>-<card>-<tab>-<size>.png

Only the market chapter, and only while the three treatments are live behind
?variants=1; it goes when the treatment is chosen.
"""
import sys, os, asyncio
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
BASE = "http://127.0.0.1:8732/"
TAG = sys.argv[1] if len(sys.argv) > 1 else "mk"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "snaps")
SIZES = {"desktop": (1512, 950), "ipad-land": (1180, 820), "ipad-port": (820, 1180), "phone": (390, 844)}
CARDS = ["ledger", "calendar", "plate"]
TABS = ["eu", "uk"]
ONLY_SIZE = os.environ.get("SIZE", "")
ONLY_CARD = os.environ.get("CARD", "")


async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch()
        for sname, (w, h) in SIZES.items():
            if ONLY_SIZE and ONLY_SIZE != sname:
                continue
            ctx = await br.new_context(viewport={"width": w, "height": h}, service_workers="block",
                                       device_scale_factor=2, reduced_motion="reduce")
            page = await ctx.new_page()
            errs = []
            page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: errs.append(str(e)))
            for card in CARDS:
                if ONLY_CARD and ONLY_CARD != card:
                    continue
                for tab in TABS:
                    await page.goto(BASE + "?variants=1&card=" + card + "#/c/market", wait_until="networkidle")
                    await page.wait_for_timeout(500)
                    if tab == "uk":
                        await page.click('[data-mktab="uk"]')
                        await page.wait_for_timeout(400)
                    await page.evaluate("document.querySelector('.bar').style.display='none';"
                                        "document.querySelector('#mkvar').style.display='none'")
                    fp = os.path.join(OUT, f"{TAG}-{card}-{tab}-{sname}.png")
                    await page.screenshot(path=fp, full_page=True)
                    print("saved", os.path.basename(fp))
            if errs:
                print(f"  !! console errors [{sname}]:", errs[:6])
            await ctx.close()
        await br.close()

asyncio.run(main())
