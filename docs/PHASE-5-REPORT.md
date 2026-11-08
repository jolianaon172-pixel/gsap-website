# Pizza Manch Haifa: Phase 5 report (SEO, local search, Wolt ordering, preview-only builder)

Status: **approved and complete.** Branch `phase-5-seo`, created from `phase-4-accessibility` @ `5b0b41e`. `main` (`a9a01f2`) and all earlier phase branches are unchanged. Part C (the builder made a preview only) was done after the approval of Parts A and B, as you asked.

## Part A: SEO and local search

### Audit (Phase 4, before)
Lighthouse SEO already scored 100, but that is a shallow check. The real gaps:
1. **No canonical, `og:url`, `og:image`, `sitemap.xml` or `robots.txt` (404).** All of these except `robots.txt` need absolute URLs, and the real domain is not known.
2. **No favicon** (404 on every crawl; Google shows favicons in results).
3. **No image in link previews.**
4. **Minimal JSON-LD:** no description, no map, no `url`/`image`/`@id`.
5. **English** is a JavaScript language switch on the same URL, so `hreflang` cannot be used correctly.
6. **The layer-by-layer photo** had an empty `alt`.

Already good: Hebrew title and description; `lang`/`dir`, title and description switch for English; one h1 and a clean heading outline; descriptive link text; crawlable links; no `noindex`.

### SEO changes
| File | Change |
|---|---|
| `index.html` | `<meta name="robots" content="index,follow,max-image-preview:large">`. Favicon links. A marked block (`SITE-URL:START/END`) that `tools/set-site-url.py` fills in. JSON-LD adds `description` (the site's own copy) and `hasMap` (the site's own Directions link). Hebrew/English `alt` on the layer-by-layer photo. |
| `robots.txt` (new) | Allows everything except `/tools/` and `/docs/`. The helper adds the Sitemap line. |
| `favicon.ico`, `assets/img/icons/icon-192.png`, `apple-touch-icon.png` (new) | Made from the site's own seal (מאנצ׳): 16/32/48 px ICO. |
| `tools/set-site-url.py` (new) | One command once the domain is known. Adds the canonical link, `og:url`, `og:image` (with type, size and alt), `twitter:image` and JSON-LD `@id`/`url`/`image`, and writes `sitemap.xml` and the robots Sitemap line. Safe to run again. Refuses non-https addresses and Wolt/BiteTech addresses. |
| `tools/asset-versions.py` | Also versions `.png`. |

**Deliberately not added** (no verified source): opening hours, prices or price range, menu items, coordinates, rating or reviews (the on-page 4.2 is not marked up), reservations, social profiles. Also no `hreflang` and no placeholder domain.

## Part B: Wolt as the primary ordering platform

### What changed
- **All 13 order links** point to exactly `https://wolt.com/he/isr/haifa/restaurant/pizza-manch-haifa/items/menucategory-6`. They used to point to `order.bitetech.co.il`, which is now gone from the site, JS and README; only the committed Phase 4 report keeps a historical mention.
- **JSON-LD `OrderAction`** target is now the Wolt URL.
- **Each link has `data-order`** naming its place: `hero`, `strip`, `menu-pizzas`, `menu-pastas`, `menu-salads`, `menu-sides`, `more-pizza`, `more-pasta`, `more-salad`, `builder` (was `cart` before Part C), `final`, `footer`, `mobile-bar`.
- **Links open in the same tab**, as before.

| Place | Hebrew | English |
|---|---|---|
| Hero (primary CTA) | הזמינו ב-Wolt | Order on Wolt |
| Info strip | הזמנה ב-Wolt · משלוח ואיסוף | ORDER ON Wolt · Delivery & pickup |
| Menu intro | כל המנות והמחירים המלאים נמצאים ב-Wolt. | The full dishes and prices are on Wolt. |
| Menu cards (4) | להזמנה ב-Wolt ← | Order on Wolt → |
| "More than pizza" links (3) | פיצה / פסטה / סלט + hidden "– להזמנה ב-Wolt" for screen readers | Pizza / Pasta / Salad + hidden "– order on Wolt" |
| Pizza builder (Part C; replaces the cart button) | הזמינו ב-Wolt | Order on Wolt |
| Final section | הזמינו עכשיו ב-Wolt | Order now on Wolt |
| Footer | הזמנה ב-Wolt | Order on Wolt |
| Mobile bar | הזמינו ב-Wolt (+ call button) | Order on Wolt (+ call button) |
| Meta / OG description (HE + EN switch) | הזמינו ב-Wolt מפיצה מאנצ׳ חיפה… | Order on Wolt from Pizza Manch Haifa… |

- **Phone stays secondary**, unchanged: the info strip, the final section, the footer and the call button in the mobile bar (until Part C the cart also had a call link; the builder note now gives the number).
- **No new products, prices, availability or promotions.** No checkout was created.
- **"Wolt" is marked `lang="en"`** inside Hebrew text, so screen readers pronounce it correctly (WCAG 3.1.2).

### Layout fix found by the tests
At 320–360 px the longer "להזמנה ב-Wolt" label was **clipped** in the two small menu cards, and on two-line buttons "ב-" could end up alone at the end of a line. Fixes:
- `.mc span` gets `max-width:100%`, so the card label wraps inside its card.
- A new `.nw{white-space:nowrap}` keeps "ב-Wolt" / "on Wolt" (and the menu-card arrow) together.

Nothing else in the design changed.

### Order-click tracking (analytics-ready, no account invented)
In `core.js`, about 10 lines. It records left clicks, keyboard Enter and middle clicks on `a[data-order]`:
- `dataLayer.push({event:'order_click', order_platform:'wolt', order_location, page_language})`. It reuses an existing `dataLayer` (for example GTM's).
- If `gtag` exists: `gtag('event','order_click',{…, transport_type:'beacon'})`.
- Always: a `manch:order-click` browser event.

It never calls `preventDefault` and never delays navigation. Nothing is sent anywhere until someone installs an analytics tool. README: use either a GTM trigger or gtag.js for a GA4 property, not both, or each click counts twice; a consent notice may be needed.

### The pizza builder
Assessment given before the decision: the visual preview is the site's most distinctive feature, but its cart was a second, parallel ordering flow. The cart was not sent to Wolt, had no prices, and its options were not verified against the Wolt menu. Your decision: keep the visual builder and remove the cart. See Part C.

## Part C: the builder is a preview only (cart and checkout removed)

**What was removed**
- The "Add to cart" button, the whole cart panel (list, quantities, edit, remove, order summary, "Copy order details", "Empty cart"), the cart's Wolt button and note, and the cart's no-JavaScript note.
- From `builder.js` (about 23 KB → 10 KB): the cart code, `localStorage`, cross-tab sync, saved-cart validation and canvas thumbnails.
- The unused `prices` option from `builder-config.js`.
- The cart's reveal animation from `motion.js`.
- The cart and thumbnail styles from `builder.css`.

**What changed**
- **Builder copy:** "השראה לפיצה / PIZZA INSPIRATION", "שחקו עם התוספות. / Play with the toppings.", and the intro ends with "תצוגה להשראה בלבד, לא הזמנה. / A preview for inspiration only, not an order."
- **Summary:** now labelled "בתצוגה: / Preview: …". No prices.
- **One clear "הזמינו ב-Wolt / Order on Wolt" button** (`data-order="builder"`, tracked like the other order links). Right below it: "זו תצוגה בלבד. את הפיצה שבניתם כאן אי אפשר להזמין כמו שהיא, והיא לא מועברת ל-Wolt. מזמינים מהתפריט ב-Wolt או בטלפון 04-810-2091." / "This is a preview only. The pizza you made here cannot be ordered as it is and is not sent to Wolt. Order from the menu on Wolt, or call 04-810-2091."
- **Remaining tools:** "התחלה מחדש / Start over" (was "Start a new pizza") and "פיזור מחדש של התוספות / Rearrange toppings".
- **Error text:** if the preview images fail, the message now points to ordering on Wolt (it used to mention the cart).
- **Layout:** two columns, controls and preview, on wide screens (was three with the cart). The tablet and phone layouts are unchanged.
- **No storage:** the site no longer stores anything. A cart saved by the earlier version (`manch.cart.v1`) is deleted when the page loads.
- **Unchanged:** the preview itself, image readiness, accessibility, keyboard use and the CSS-only fallback without JavaScript.
- **README** updated: ordering, builder, structure, testing tips, history.

**Part C tests**
- **Builder checks: 46/46.**
  - In both languages:
    - no cart elements and no cart, price, add-to-order or checkout wording in the builder
    - one visible Wolt button with the exact URL and the right accessible name
    - the note says preview only, cannot be ordered, not sent to Wolt
    - the summary is labelled as a preview
    - only the two preview tools remain
    - 13 order links on the page
  - The preview works: toppings, size and sauce, "Rearrange", "Start over", the language switch, and keyboard (arrows, Space). Nothing is written to `localStorage`.
  - The builder's Wolt click is tracked as `builder` and goes to Wolt. An old saved cart is deleted on load.
  - Without JavaScript: the button and note are visible, the JavaScript-only tools are hidden, and the CSS-only preview works.
  - Scrolling the whole page with GSAP and with reduced motion: no errors.
  - 320–1440 px in both languages: no overflow, no overlap, and the button stays inside the layout.
- **Wolt checks: 108/108** (location `builder` in place of `cart`).
- **Regression, cart-free versions of the earlier suites:** the cart checks were removed because there is no cart; every other check is unchanged.
  - Core functional and security suite: 77/77. This includes 6 old or malicious saved carts (and the same arriving from another tab) that are now ignored, deleted and never injected; plus `localStorage` that throws and the older-Safari simulation.
  - Phase 3 checks: 54/54. The undecodable-AVIF case now checks that the preview is shown from the WebP fallback.
  - Keyboard journey: 90/90. The cart steps were replaced by the builder's Wolt link and "Start over" by keyboard.
  - Builder readiness: 26/26.
  - axe: 0 violations in 22 scans.
- **Lighthouse:** SEO 100. Mobile LCP 3.15 s, desktop 0.70 s, CLS ≤ 0.005. 489 KB / 21 requests, 6 KB less than before Part C.

## Tests for Parts A and B (run before Part C)
- **Wolt checks: 106/106.**
  - Hebrew and English: 13 links, each exactly the official URL. No other Wolt links. Zero BiteTech in the live DOM. JSON-LD target is Wolt. Same-tab behaviour. Every label names Wolt. 5 phone links remain.
  - The accessible name of every visible order link contains its visible label (checked from the browser's accessibility tree).
  - Tracking, desktop and mobile, in both languages:
    - all 13 locations push the right `order_location` and `page_language`
    - the gtag stub is called 13 times with `transport_type:'beacon'`
    - `manch:order-click` fires 13 times
    - `preventDefault` is never called
    - an existing dataLayer is kept
    - phone, menu and language links send nothing
    - a click on the arrow icon counts
  - Real navigation reaches Wolt (stubbed) with and without gtag: mouse on the hero, the mobile bar and a menu card, plus keyboard Enter. Middle click is counted once; right click is not counted. No console errors.
  - Layout at 320/390/768/1440, Hebrew and English: no horizontal overflow, buttons inside the viewport, menu-card labels inside their cards, "ב-Wolt" never split. At 320 px the (then) cart button and the final button wrap to two lines; Phase 4 also wrapped there.
- **Structured data:** valid JSON. Checked against the schema.org vocabulary (schema-dts 2.1.0; schema.org itself is blocked here): 0 errors in the repo version and with a domain filled in by the helper. No unverifiable claims. The earlier negative control (invented property, wrong type, invented hours) was caught.
- **Helper:** tested on a scratch copy:
  - Run twice: one canonical, one og:image, one twitter:image, one JSON-LD `@id`, one Sitemap line.
  - The resulting `sitemap.xml` is valid XML.
  - After `asset-versions.py`, the version check is clean, and stays clean after another helper run.
  - A Wolt address and an `http://` address are refused.
- **Lighthouse SEO: 100.** robots-txt passing; canonical and structured data are "not applicable" until the domain is set.
- **Requests:** `robots.txt` 200, `favicon.ico` 200; `sitemap.xml` 404 until the domain is set.
- **Regression:** 169/169 (Phase 1–3 suite), 54/54 Phase 3 checks, 102/102 keyboard journey, 32/32 builder readiness. axe-core: 0 violations in 22 scans.
- **Visual vs Phase 4:** at 1440 px only the CTA text areas differ. At 390/768 px, the shorter English menu intro removes one line, so everything below moves up 28 px. Once the 28 px shift is removed, only the new labels differ (checked side by side). No other visual changes.
- **Performance:** same as Phase 4 within noise. Six interleaved Lighthouse mobile runs each: Phase 4 median LCP 3.49 s, now 3.57 s; both range from 2.85 to 3.6 s run to run. This machine measures slower today than at the earlier Phase 5 run (3.00 s), for both versions. Desktop LCP 0.70 s; CLS ≤ 0.005. 495 KB / 21 requests: +8 KB vs Phase 4, which is the favicon (it used to 404) plus the slightly longer HTML.

## Remaining limitations
1. **The real domain is needed** for the canonical link, social image, sitemap and JSON-LD `url`. One command once it is known (README).
2. **One Wolt URL for everything:** the Hebrew page (`/he/`) and category `menucategory-6` are used for both languages and all menu cards. An English Wolt URL or per-category links were not given, so they were not guessed. No UTM parameters were added; Wolt's own reports may not show them anyway.
3. **The builder's options are not verified against the Wolt menu.** Now that the builder is clearly a preview only, this matters less. If the restaurant wants it to match the menu, change `builder-config.js` and the controls in `index.html`.
4. **English SEO:** English is only reachable through the language button on the same URL. Ranking in English needs a separate `/en/` page with `hreflang` (future phase).
5. **Local ranking** depends mostly on the Google Business Profile. The reviews and directions links are Google Maps searches, because no verified place ID exists in the project.
6. **The h1 is the slogan.** The brand and city are in the title, the description and the eyebrow. Left unchanged to avoid a design change.
7. **Not tested:** the real wolt.com page (blocked here, so it was stubbed in tests), Google's Rich Results Test, Search Console, social preview tools, and a real analytics account. Real devices and screen readers were not used; accessibility checks were automated.

## Git
- **Parts A and B:** commit `5c9c900` on `phase-5-seo`, pushed.
  - Modified: `index.html`, `README.md`, `assets/css/main.css`, `assets/js/core.js`, `assets/js/builder.js`, `tools/asset-versions.py`.
  - New: `robots.txt`, `favicon.ico`, the two icons, `tools/set-site-url.py`, this report.
- **Part C:** a second commit on `phase-5-seo`, pushed.
  - Modified: `index.html`, `README.md`, `assets/css/builder.css`, `assets/js/builder.js`, `assets/js/builder-config.js`, `assets/js/motion.js`, this report.
- `git diff --check` is clean and asset versions are up to date. `main` was not modified and nothing was merged.
