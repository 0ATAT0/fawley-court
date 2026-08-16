"""Render every route at every breakpoint and save to snaps/.
Usage:  python snap.py [tag]      tag defaults to 'v'
        ONLY=phone python snap.py     filters by route or size name
"""
import sys, os, asyncio
from playwright.async_api import async_playwright

BASE = "http://127.0.0.1:8732/"
TAG = sys.argv[1] if len(sys.argv) > 1 else "v"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "snaps")
os.makedirs(OUT, exist_ok=True)

SIZES = {
    "ipad-land": (1180, 820),
    "ipad-port": (820, 1180),
    "phone":     (390, 844),
    "desktop":   (1512, 950),
}

CHAPTERS = ["asset", "evidence", "underwrite", "returns", "bridge", "dd", "questions", "cheatsheet"]
SLUGS = ["cliveden", "beaverbrook", "heckfield", "estelle", "grand-controle",
         "reschio", "passalacqua", "messardiere", "borgo-egnazia", "rosa-alpina"]

ROUTES = ([("index", "#/")]
          + [(c, "#/c/" + c) for c in CHAPTERS]
          + [("questions-asks", "#/c/questions/asks"), ("questions-keys", "#/c/questions/keys")]
          + [("case-" + s, "#/h/" + s) for s in SLUGS])

ONLY = os.environ.get("ONLY", "")


async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch()
        for sname, (w, h) in SIZES.items():
            ctx = await br.new_context(viewport={"width": w, "height": h},
                                       device_scale_factor=2, reduced_motion="reduce")
            page = await ctx.new_page()
            errs = []
            page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: errs.append(str(e)))
            for rname, rhash in ROUTES:
                if ONLY and ONLY not in rname and ONLY not in sname:
                    continue
                await page.goto(BASE + rhash, wait_until="networkidle")
                await page.wait_for_timeout(650)
                await page.evaluate("document.querySelector('.bar').style.display='none'")
                fp = os.path.join(OUT, f"{TAG}-{sname}-{rname}.png")
                await page.screenshot(path=fp, full_page=True)
                print("saved", os.path.basename(fp))
                await page.evaluate("document.querySelector('.bar').style.display=''")
            if errs:
                print(f"  !! console errors [{sname}]:", errs[:6])
            await ctx.close()
        await br.close()

asyncio.run(main())
