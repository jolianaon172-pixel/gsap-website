# gsap-website

Website for **Pizza Manch Haifa** (פיצה מאנצ׳ חיפה). Hebrew (RTL) by default, with an English (LTR) switch, a pizza builder, a local cart and GSAP animations.

It's a plain static site: HTML, CSS, JavaScript, images and fonts. There is no framework, build step or package to install, and it loads nothing from third-party servers.

## Project structure

```
index.html                 page markup (all sections, both languages)
assets/
  css/
    builder.css            pizza builder + cart styles
    main.css               self-hosted @font-face rules + all other styles (layout, sections, mobile, accessibility, motion)
  js/
    core.js                navigation, mobile menu, skip link, language switch, no-GSAP reveal fallback
    builder-config.js      builder options: sizes, sauces, toppings, piece placement
    builder.js             builder engine + cart (validation, localStorage, cross-tab sync, on-demand builder images)
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
  vendor/gsap/3.13.0/      GSAP 3.13.0: gsap, ScrollTrigger, SplitText, ScrollToPlugin (unmodified)
tools/
  asset-versions.py        cache-busting helper (see "Caching and compression"); not part of the website
README.md
```

### Load order matters

- **CSS:** `builder.css` is linked **before** `main.css`. That keeps the cascade the same as when everything was in one file (the mobile, accessibility and motion overrides at the end of `main.css` must come after the builder rules).
- **JavaScript:** all scripts are in `<head>` with `defer`. They download while the page is parsed and run, in order, once it's parsed: GSAP (`gsap`, `ScrollTrigger`, `SplitText`, `ScrollToPlugin`), `core.js`, `builder-config.js`, `builder.js`, `motion.js`. `builder.js` needs `builder-config.js`. `motion.js` does nothing if GSAP didn't load.
- **Kept inline in `index.html`:** the small script in `<head>` that sets the `js`/`mo` classes before the first paint (it also removes the loader after 3 seconds if the animation layer hasn't taken over), the JSON-LD structured data, and the `<noscript>` style.

### How images and fonts load

- **Hero:** a real `<img>` inside a `<picture>` (AVIF, JPEG fallback) with `fetchpriority="high"`, preloaded in `<head>`. The section backgrounds use the same file, so the photo is downloaded once.
- **Layer-by-layer photo:** `loading="lazy"`.
- **Builder images** (base, cheese and no-sauce layers, topping pieces) are only requested when the builder comes within about 1.5 screens of the viewport, or when the cart needs to draw a thumbnail. Without JavaScript they load normally, so the CSS-only builder keeps working. While they load, the preview shows a placeholder disc; the pizza appears only once all its images are in, so it never shows half-built.
- **AVIF fallback:** browsers without AVIF get the JPEG/WebP through `<picture>` and `image-set()` type selection. If an AVIF still fails to load or decode, `core.js`/`builder.js` add `no-avif` to `<html>` and every image switches to the original JPEG/WebP.
- **Fonts:** self-hosted copies of the exact Google Fonts files the site used before. `font-display: swap`. The three fonts the first screen needs are preloaded; the others download only if the page uses their characters.

### History

- **Phase 0:** the original single file (`Manch.html`, SHA-256 `90b170fcdb916945328dc5853197a4c8a37801e0b210721d242f62f1f999ba9b`) is preserved unchanged as `index.html` on the `phase-0-baseline` branch.
- **Phase 1:** critical fixes, on the `phase-1-critical-fixes` branch.
- **Phase 2:** the single file split into this structure, on the `phase-2-code-structure` branch.
- **Phase 3:** performance: AVIF images, a real hero image, on-demand builder images, self-hosted fonts and GSAP, deferred scripts, a shorter loader, cache-busting references.

## Running the website locally

Run a local web server from the project folder:

```bash
# Python 3
python3 -m http.server 8000

# or Node.js
npx serve .
```

Then open <http://localhost:8000> (for `npx serve`, use the address it prints).

**Use a local server rather than double-clicking `index.html`.** When the page is opened straight from disk (`file://`), browsers block the canvas from reading the image files. Everything else works, but the cart can't draw its pizza thumbnails, so they appear blank. On a web server (local or live) thumbnails work normally.

The site needs no internet connection: fonts, GSAP and all images are in `assets/`.

### Testing tips

- **Mobile layout:** use your browser's device toolbar (Chrome DevTools: Ctrl+Shift+M / Cmd+Shift+M). The mobile layout starts at 860 px wide and below.
- **Language:** use the `EN` / `עברית` button in the navigation bar.
- **Reset the cart:** in DevTools, go to Application → Local Storage and delete the `manch.cart.v1` key. Or use the "ריקון הסל" (Empty cart) button.
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

## Replacing the photos

- **Main pizza photo:** replace `assets/img/pizza.jpg` and `assets/img/pizza-1004.avif`. Keep them square, or adjust the `width`/`height` on the hero `<img>`. If the new photo is larger than 1004 px, add wider versions to the hero `srcset` (for example `pizza-1600.avif 1600w`).
- **Builder layers:** replace both the `.avif` and the `.webp`.

Then run `python3 tools/asset-versions.py`.

## Licences of bundled third-party files

- **GSAP 3.13.0** (`assets/vendor/gsap/`): GreenSock "Standard no-charge licence", <https://gsap.com/standard-license>. The files are the unmodified npm release.
- **Fonts** (`assets/fonts/`): Frank Ruhl Libre, Heebo and Playfair Display are licensed under the SIL Open Font License 1.1.
