# gsap-website

Website for **Pizza Manch Haifa** (פיצה מאנצ׳ חיפה). Hebrew (RTL) by default, with an English (LTR) switch, a pizza builder, a local cart and GSAP animations.

It's a plain static site: HTML, CSS, JavaScript and images. There is no framework, build step or package to install.

## Project structure

```
index.html                 page markup (all sections, both languages)
assets/
  css/
    builder.css            pizza builder + cart styles
    main.css               all other styles (layout, sections, mobile, accessibility, motion)
  js/
    core.js                navigation, mobile menu, skip link, language switch, no-GSAP reveal fallback
    builder-config.js      builder options: sizes, sauces, toppings, piece placement
    builder.js             builder engine + cart (validation, localStorage, cross-tab sync)
    motion.js              GSAP animations (only runs if GSAP loaded)
  img/
    pizza.jpg              main pizza photo (hero and section backgrounds)
    pizza-base.webp        builder pizza base
    layer-cheese.webp      builder "extra cheese" layer
    layer-no-sauce.webp    builder "no sauce" base
    layer-by-layer.jpg     "layer by layer" section photo
    toppings/*.webp        transparent topping pieces (onion, pepper, mushrooms, pepperoni, olives, corn)
README.md
```

### Load order matters

- **CSS:** `builder.css` is linked **before** `main.css`. That keeps the cascade the same as when everything was in one file (the mobile, accessibility and motion overrides at the end of `main.css` must come after the builder rules).
- **JavaScript:** the scripts at the end of `index.html` run in this order: the GSAP CDN scripts, `core.js`, `builder-config.js`, `builder.js`, `motion.js`. `builder.js` needs `builder-config.js`. `motion.js` does nothing if GSAP didn't load.
- **Kept inline in `index.html`:** the small script in `<head>` that sets the `js`/`mo` classes before the first paint, the JSON-LD structured data, and the `<noscript>` style.

### History

- **Phase 0:** the original single file (`Manch.html`, SHA-256 `90b170fcdb916945328dc5853197a4c8a37801e0b210721d242f62f1f999ba9b`) is preserved unchanged as `index.html` on the `phase-0-baseline` branch.
- **Phase 1:** critical fixes, on the `phase-1-critical-fixes` branch.
- **Phase 2:** this structure. The CSS, JavaScript and images were moved out of the single file unchanged. The image files are byte-identical to the embedded originals.

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

### Internet connection

The page loads these from the internet:

- **Google Fonts**: Frank Ruhl Libre, Heebo, Playfair Display
- **GSAP 3.13.0** from the jsDelivr CDN (`gsap`, `ScrollTrigger`, `SplitText`, `ScrollToPlugin`)

When you're offline, the site still works: fallback fonts are used, animations switch to a simpler CSS reveal, and the builder and cart keep working.

### Testing tips

- **Mobile layout:** use your browser's device toolbar (Chrome DevTools: Ctrl+Shift+M / Cmd+Shift+M). The mobile layout starts at 860 px wide and below.
- **Language:** use the `EN` / `עברית` button in the navigation bar.
- **Reset the cart:** in DevTools, go to Application → Local Storage and delete the `manch.cart.v1` key. Or use the "ריקון הסל" (Empty cart) button.
- **Reduced motion:** turn on "Reduce motion" in your operating system (or emulate it in DevTools → Rendering) to check the no-animation version.
