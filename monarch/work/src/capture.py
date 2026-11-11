"""Monarch Labs — capture the product screens in screens.html to WebP (../<name>.webp).
Renders each screen at its native size at 2x, then saves desktop views 2000px wide and phones at 780px (2x),
WebP quality 82. Usage: python3 capture.py [name ...]   (no names = every screen)"""
import asyncio, io, pathlib, sys
from playwright.async_api import async_playwright
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
URL = (HERE / "screens.html").as_uri()

async def main(names):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1400, "height": 900}, device_scale_factor=2)
        await pg.goto(URL); await pg.wait_for_timeout(1200)
        allnames = await pg.evaluate("Object.keys(SCREENS)")
        for n in names or allnames:
            await pg.goto(URL + "#" + n); await pg.reload(); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(400)
            png = await (await pg.query_selector("#stage > .ui")).screenshot(type="png")
            im = Image.open(io.BytesIO(png)).convert("RGB")
            w = 2000 if im.width >= 2000 else im.width
            if im.width != w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            out = HERE.parent / (n + ".webp"); im.save(out, "WEBP", quality=82, method=6)
            print(n, im.size, out.stat().st_size // 1024, "KB")
        await b.close()

asyncio.run(main(sys.argv[1:]))
