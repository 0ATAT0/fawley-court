"""Offline check: register the service worker, take it offline, and confirm
every route still renders from the cache."""
import asyncio
from playwright.async_api import async_playwright
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE = "http://127.0.0.1:8732/"
ROUTES = ["#/", "#/c/summary", "#/c/asset", "#/c/asset/title", "#/c/evidence",
          "#/c/evidence/pnl", "#/c/underwrite", "#/c/underwrite/profile",
          "#/c/capital", "#/c/capital/schedule", "#/c/capital/phasing", "#/c/returns",
          "#/c/bridge", "#/c/dd", "#/c/dd/asks", "#/c/cheatsheet",
          "#/h/cliveden", "#/h/cliveden/pnl", "#/h/passalacqua/pnl"]


async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch()
        ctx = await br.new_context(viewport={"width": 1180, "height": 820})
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))

        await page.goto(BASE, wait_until="networkidle")
        await page.wait_for_function("navigator.serviceWorker.controller !== null", timeout=15000)
        print("service worker in control:", await page.evaluate("!!navigator.serviceWorker.controller"))
        # let the page warm the full-size plates
        await page.wait_for_timeout(9000)
        keys = await page.evaluate(
            "caches.open('fawley-court-v3').then(c => c.keys().then(k => k.map(r => new URL(r.url).pathname)))")
        print("cached entries:", len(keys))
        for k in sorted(keys):
            print("   ", k)

        await ctx.set_offline(True)
        print("\n--- offline ---")
        for r in ROUTES:
            await page.goto(BASE + r, wait_until="load")
            await page.wait_for_timeout(450)
            txt = (await page.locator("#view").inner_text())[:70].replace("\n", " / ")
            n = await page.locator("#view *").count()
            print(f"{r:<22} {n:>5} nodes   {txt}")
        # a full-size plate, offline
        await page.goto(BASE + "#/c/asset", wait_until="load")
        await page.click('[data-plate="0"]')
        await page.wait_for_timeout(900)
        ok = await page.evaluate("() => { const i = document.getElementById('lbimg'); return i.complete && i.naturalWidth > 0; }")
        print("\nlightbox plate loaded offline:", ok)
        print("page errors:", errs or "none")
        await ctx.close()
        await br.close()

asyncio.run(main())
