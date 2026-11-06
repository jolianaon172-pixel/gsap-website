# gsap-website

Website for **Pizza Manch Haifa** (פיצה מאנצ׳ חיפה). Hebrew (RTL) by default, with an English (LTR) switch, a pizza builder, a local cart and GSAP animations.

## Project status

`index.html` is a byte-for-byte copy of the original `Manch.html`. It is the unchanged reference version of the site (Phase 0 baseline).

SHA-256 of `index.html`:

```
90b170fcdb916945328dc5853197a4c8a37801e0b210721d242f62f1f999ba9b
```

To check that the file is still unchanged:

```bash
sha256sum index.html          # Linux
shasum -a 256 index.html      # macOS
```

The whole site is one self-contained file (about 1.3 MB). All CSS and JavaScript are inline, and the images are embedded as Base64.

## Running the website locally

There is no build step and nothing to install.

### Option 1: open the file directly

Double-click `index.html`, or open it from your browser's **File → Open** menu.

### Option 2: run a local web server (recommended)

A local server behaves more like the real website. For example, the cart is saved in `localStorage`, and some browsers limit that for `file://` pages.

Run one of these from the project folder:

```bash
# Python 3
python3 -m http.server 8000

# or Node.js
npx serve .
```

Then open <http://localhost:8000> (for `npx serve`, use the address it prints).

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
