# gsap-website

Website for **Pizza Manch Haifa** (פיצה מאנצ׳ חיפה). Hebrew (RTL) by default, with an English (LTR) switch, a visual pizza builder (preview only), ordering on Wolt and GSAP animations.

It's a plain static site: HTML, CSS, JavaScript, images and fonts. There is no framework, build step or package to install, and it loads nothing from third-party servers.

## Project structure

```
index.html                 page markup (all sections, both languages)
assets/
  css/
    builder.css            pizza builder styles
    main.css               self-hosted @font-face rules + all other styles (layout, sections, mobile, accessibility, motion)
  js/
    core.js                navigation, mobile menu, skip link, language switch, no-GSAP reveal fallback, order-click tracking
    builder-config.js      builder options: sizes, sauces, toppings, piece placement
    builder.js             builder preview engine (live summary, topping placement, on-demand builder images)
    motion.js              GSAP animations (only runs if GSAP loaded)
  img/
    pizza-1004.avif        main pizza photo, AVIF: hero <img> and the section backgrounds
    pizza.jpg              the same photo as JPEG (fallback for browsers without AVIF)
    pizza-base.avif/.webp  builder pizza base (AVIF + WebP fallback)
    layer-cheese.avif/.webp     builder "extra cheese" layer
    layer-no-sauce.avif/.webp   builder "no sauce" base
    layer-by-layer.avif/.jpg    "layer by layer" section photo
    toppings/*.webp        transparent topping pieces (onion, pepper, mushrooms, pepperoni, olives, corn)
  fonts/                   WOFF2 files: Frank Ruhl Libre, Heebo, Playfair Display
  img/icons/               favicon PNGs (192 px, Apple touch icon); favicon.ico is in the root
  vendor/gsap/3.13.0/      GSAP 3.13.0: gsap, ScrollTrigger, SplitText, ScrollToPlugin (unmodified)
favicon.ico                site icon (16/32/48 px)
robots.txt                 crawler rules (Sitemap line added by tools/set-site-url.py)
tools/
  asset-versions.py        cache-busting helper (see "Caching and compression"); not part of the website
  set-site-url.py          adds the real domain where absolute URLs are needed (see "Search engines and sharing")
docs/                      phase reports
README.md
```

### Load order matters

- **CSS:** `builder.css` is linked **before** `main.css`. That keeps the cascade the same as when everything was in one file (the mobile, accessibility and motion overrides at the end of `main.css` must come after the builder rules).
- **JavaScript:** all scripts are in `<head>` with `defer`. They download while the page is parsed and run, in order, once it's parsed: GSAP (`gsap`, `ScrollTrigger`, `SplitText`, `ScrollToPlugin`), `core.js`, `builder-config.js`, `builder.js`, `motion.js`. `builder.js` needs `builder-config.js`. `motion.js` does nothing if GSAP didn't load.
- **Kept inline in `index.html`:** the small script in `<head>` that sets the `js`/`mo` classes before the first paint (it also removes the loader after 3 seconds if the animation layer hasn't taken over), the JSON-LD structured data, and the `<noscript>` style.

### How images and fonts load

- **Hero:** a real `<img>` inside a `<picture>` (AVIF, JPEG fallback) with `fetchpriority="high"`, preloaded in `<head>`. The section backgrounds use the same file, so the photo is downloaded once.
- **Layer-by-layer photo:** `loading="lazy"`.
- **Builder images** (base, cheese and no-sauce layers, topping pieces) are only requested when the builder comes within about 1.5 screens of the viewport. Without JavaScript they load normally, so the CSS-only builder keeps working. While they load, the preview shows a placeholder disc; the pizza appears only once all its images are in, so it never shows half-built.
- **AVIF fallback:** browsers without AVIF get the JPEG/WebP through `<picture>` and `image-set()` type selection. If an AVIF still fails to load or decode, `core.js`/`builder.js` add `no-avif` to `<html>` and every image switches to the original JPEG/WebP.
- **Fonts:** self-hosted copies of the exact Google Fonts files the site used before. `font-display: swap`. The three fonts the first screen needs are preloaded; the others download only if the page uses their characters.

### History

- **Phase 0:** the original single file (`Manch.html`, SHA-256 `90b170fcdb916945328dc5853197a4c8a37801e0b210721d242f62f1f999ba9b`) is preserved unchanged as `index.html` on the `phase-0-baseline` branch.
- **Phase 1:** critical fixes, on the `phase-1-critical-fixes` branch.
- **Phase 2:** the single file split into this structure, on the `phase-2-code-structure` branch.
- **Phase 3:** performance: AVIF images, a real hero image, on-demand builder images, self-hosted fonts and GSAP, deferred scripts, a shorter loader, cache-busting references.
- **Phase 4:** accessibility (WCAG 2.2 AA), on the `phase-4-accessibility` branch.
- **Phase 5:** SEO and local search, Wolt as the ordering platform, the builder made a preview only (its cart removed), on the `phase-5-seo` branch.

## Running the website locally

Run a local web server from the project folder:

```bash
# Python 3
python3 -m http.server 8000

# or Node.js
npx serve .
```

Then open <http://localhost:8000> (for `npx serve`, use the address it prints).

**Use a local server rather than double-clicking `index.html`.** It is closest to how the live site is served.

The site needs no internet connection: fonts, GSAP and all images are in `assets/`.

### Testing tips

- **Mobile layout:** use your browser's device toolbar (Chrome DevTools: Ctrl+Shift+M / Cmd+Shift+M). The mobile layout starts at 860 px wide and below.
- **Language:** use the `EN` / `עברית` button in the navigation bar.
- **Reduced motion:** turn on "Reduce motion" in your operating system (or emulate it in DevTools → Rendering) to check the no-animation version.
- **Slow connection:** DevTools → Network → throttling "Slow 4G".

## Caching and compression (for the future hosting provider)

No host-specific configuration is included yet. Once the host is chosen, set the following.

**Cache-busting.** Every local file referenced from `index.html` and the CSS carries `?v=` plus the first 10 characters of the file's SHA-256 (for example `assets/css/main.css?v=…`). When a file changes, run:

```bash
python3 tools/asset-versions.py          # update the ?v= values
python3 tools/asset-versions.py --check  # verify (exit code 1 if anything is out of date)
```

**Recommended HTTP headers**

| Path | `Cache-Control` | Why |
|---|---|---|
| `/` and `/index.html` | `no-cache` (revalidate with ETag / Last-Modified) | so visitors always get the current page and therefore the current `?v=` URLs |
| `/assets/*` | `public, max-age=31536000, immutable` | safe because every reference has a content hash; a changed file gets a new URL |

- Check that the host or CDN keeps the **query string in its cache key** (the default on Netlify, Vercel, Cloudflare and most others). If it can't, use a short `max-age` (for example 1 hour) for `/assets/` instead of `immutable`.
- **Compression:** Brotli (or gzip) for `text/html`, `text/css`, `application/javascript`, `image/svg+xml` and `application/json`. Do not compress `.avif`, `.webp`, `.jpg` or `.woff2`; they're already compressed.
- **MIME types:** `.avif` → `image/avif`, `.webp` → `image/webp`, `.woff2` → `font/woff2`.
- Serve over **HTTP/2 or HTTP/3**: the builder loads its 26 small images in parallel.
- Don't deploy `tools/` (it's only a helper script).

## Ordering (Wolt)

All ordering goes through **Wolt**, the restaurant's ordering and checkout platform. The website has no checkout of its own. Every order button and link (13 in total: hero, info strip, menu cards, "more than pizza" links, pizza builder, final section, footer, mobile bar) points to the same official page:

```
https://wolt.com/he/isr/haifa/restaurant/pizza-manch-haifa/items/menucategory-6
```

Phone (04-810-2091) stays as the secondary option: the info strip, the final section, the footer and the call button in the mobile bar (the builder's note also gives the number).

To change the Wolt address, replace that URL everywhere in `index.html` (all order links and the JSON-LD `OrderAction`). Each order link has a `data-order="…"` attribute naming its place on the page; keep it, because the click tracking uses it.

**The pizza builder is a preview for inspiration only.** It has no cart, no prices and no checkout, saves nothing and sends nothing. Its combinations are not something a customer can order as such; the note next to its "Order on Wolt" button says so and points to the Wolt menu (or the phone). The site removes the cart that the earlier version kept in the browser (`localStorage` key `manch.cart.v1`). Don't add prices or an "add to order" step to the builder unless Wolt itself can take that exact pizza.

### Order-click tracking (analytics-ready, nothing installed)

No analytics account or script is included, and nothing is sent anywhere by default. `assets/js/core.js` only records clicks on order links (left click, keyboard Enter, middle click) in a way any analytics tool can pick up:

- `window.dataLayer.push({event:'order_click', order_platform:'wolt', order_location:'<data-order value>', page_language:'he'|'en'})`. It reuses an existing `dataLayer` (for example Google Tag Manager's) or creates one.
- If `gtag()` (GA4) is on the page, it also calls `gtag('event','order_click',{order_platform, order_location, page_language, transport_type:'beacon'})`.
- It always fires a `manch:order-click` browser event (`event.detail` has the same fields), for any other tool.

It never delays or blocks the link. When you add analytics, use **either** a Google Tag Manager trigger on the `order_click` event **or** gtag.js, not both for the same GA4 property, or each click is counted twice. Add a cookie/consent notice if the analytics you choose needs one.

## Search engines and sharing (SEO)

What is already in place:
- **Title and description:** Hebrew by default, switched to English with the language button. `<html lang>`/`dir` switch too.
- **`robots.txt`:** everything allowed except `/tools/` and `/docs/`. `<meta name="robots">` allows large image previews.
- **Favicon:** `favicon.ico` (16/32/48 px) and `assets/img/icons/` (192 px, Apple touch icon), made from the site's own seal (מאנצ׳).
- **Structured data (JSON-LD `Restaurant`):** name (English + Hebrew), description, cuisine, phone, address, map link and the Wolt ordering action, all taken from what the site already says. It deliberately has no opening hours, prices, rating, menu or location coordinates, because none of these are verified yet. Add them only from confirmed information. Don't mark up the Google rating: Google ignores self-published ratings and can penalise them.
- **Open Graph / Twitter:** title, description, locale and card type.

What needs the real domain. These all need absolute URLs, so they are not published with placeholders. Once the site's address is known, run:

```bash
python3 tools/set-site-url.py https://www.example.co.il/   # use the real address
python3 tools/asset-versions.py
```

This adds the canonical link, `og:url`, `og:image`/`twitter:image` (the existing pizza photo, 1004×1004) and the JSON-LD `url`/`image`/`@id`, writes `sitemap.xml`, and adds the `Sitemap:` line to `robots.txt`. It is safe to run again.

Not done, and why:
- **No `hreflang`:** the English version is a language switch on the same URL, not a separate page. `hreflang` needs one URL per language, for example a future `/en/` page.

## Replacing the photos

- **Main pizza photo:** replace `assets/img/pizza.jpg` and `assets/img/pizza-1004.avif`. Keep them square, or adjust the `width`/`height` on the hero `<img>`. If the new photo is larger than 1004 px, add wider versions to the hero `srcset` (for example `pizza-1600.avif 1600w`).
- **Builder layers:** replace both the `.avif` and the `.webp`.

Then run `python3 tools/asset-versions.py`.

## Licences of bundled third-party files

- **GSAP 3.13.0** (`assets/vendor/gsap/`): GreenSock "Standard no-charge licence", <https://gsap.com/standard-license>. The files are the unmodified npm release.
- **Fonts** (`assets/fonts/`): Frank Ruhl Libre, Heebo and Playfair Display are licensed under the SIL Open Font License 1.1.
