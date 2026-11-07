# Pizza Manch Haifa: Phase 4 report (accessibility and user experience)

Status: **complete. Not committed, not pushed, not merged.**
Branch `phase-4-accessibility`, created from `phase-3-performance` @ `11c5d8e` (clean, unchanged).

## 1. Audit findings (Phase 3, before)
How I checked:
- axe-core 4.14, WCAG 2.0/2.1/2.2 A+AA tags: 22 scans (Hebrew + English × 390/768/1440 px × page / mobile menu / builder + cart + editing / builder image error).
- My own measurements of what axe can't judge: pixel contrast of text over photos, a Tab walk with focus visibility and obscuring, target sizes, 200%/400% zoom, text spacing, the loader, moving content.
- A keyboard-only ordering journey.

### Confirmed WCAG 2.2 AA failures
| # | Finding | Criterion |
|---|---|---|
| F1 | Language button shows "EN" but is named "Switch to English" (in Hebrew mode). In English mode it shows "עברית", named "החלפה לעברית" (the word isn't contained as a word). | 2.5.3 Label in Name |
| F2 | Text over the pizza photo below contrast: orange 12–13 px eyebrows (signature, layer-by-layer, "why"); signature heading and paragraph; menu-card titles; layer heading; English nav links over the hero pizza (2.0–3.9:1). 32 below-threshold text elements across the 4 measured configurations. | 1.4.3 Contrast |
| F3 | **Keyboard users could not reach the cart on phones** (and other revealed content such as the reviews link, final CTA buttons and footer links) while GSAP reveals were pending: they were hidden with `visibility:hidden`, which Tab skips. The menu cards were focusable but invisible (clipped). | 2.1.1 Keyboard, 2.4.3 Focus Order, 2.4.7 Focus Visible |
| F4 | 390 px: five focused links (final CTA, footer links, "פסטה"/"סלט") were completely hidden behind the fixed mobile ordering bar. | 2.4.11 Focus Not Obscured |
| F5 | Builder: focusing a later topping option scrolled its hidden input into view, but its visible label could be off-screen (the hidden input sits at the start of its group). | 2.4.11 |
| F6 | While the loader covers the page, Tab moved focus to the skip link, logo and nav behind it. | 2.4.11, 2.4.3 |
| F7 | The seal's ring of text rotated forever (auto-moving content > 5 s, no pause). | 2.2.2 Pause, Stop, Hide |
| F8 | Text spacing (1.4.12) at desktop: the hero heading ran up behind the nav, and the paragraph and order buttons disappeared behind the info strip. | 1.4.12 Text Spacing |
| F9 | English text in the Hebrew page (address in the chips and footer) and Hebrew in the English page (footer name) not marked with `lang`. | 3.1.2 Language of Parts |
| F10 | "Still loading" builder state was visible but not announced. | 4.1.3 Status Messages |

### Usability and best-practice findings
- U1: the reviews section had no heading (every other section has one).
- U2: the "4.2" rating counts up from 0.0 by changing its text, so screen readers could read changing numbers.
- U3: at 200–400% zoom or on landscape phones, the sticky builder preview filled 84–88% of the screen height and covered the controls.

### Checked and found OK (no change needed)
- Skip link; landmarks (nav, main, aside, footer); single h1; builder radio and checkbox groups named; checked states exposed.
- Live summary (`aria-live`); cart status (`role=status`); quantity `<output aria-live>`.
- Mobile menu: `aria-expanded`, focus trap, Escape, `inert`.
- Focus indicators present on every stop.
- No target under 24×24.
- No horizontal overflow at 320 px.
- Reduced motion respected.
- Images: hero has `alt`, decorative images have `alt=""`, decorative SVGs are `aria-hidden`.

### axe "needs review" items, checked by hand
- **color-contrast:** text over images and gradients; measured by pixels (F2).
- **form-field-multiple-labels:** each topping checkbox has a second `<label>` (the removable chip, inside an `aria-hidden` container). Its accessible name comes from `aria-label`, so it's announced correctly (confirmed in the accessibility tree: `checkbox "פפרוני"`).
- **label-content-name-mismatch on the cart − / + buttons:** their visible text is a symbol; their names are "Decrease/Increase quantity: Large pizza". Acceptable for symbol-only buttons.

## 2. Fixes and locations
| Fix | Where |
|---|---|
| F1: names "EN – Switch to English" / "עברית – החלפה לעברית" | `index.html` (initial), `assets/js/core.js` (`setLang`) |
| F2: soft dark halo (`text-shadow`) on text over the photo (signature, menu cards, layer section, "why", hero eyebrow, nav links/logo/language); slightly stronger overlays for "why" (.55→.8), menu cards and the mobile signature; photo eyebrows use the palette's lighter orange `#F5A25F` with a tight dark outline | `assets/css/main.css` |
| F3: reveals hide with `opacity` (stay focusable); when keyboard focus enters unrevealed or still-animating content, that content is shown at once (blocks, menu cards, "more than pizza" words) | `assets/js/motion.js` (`reveal`, `cascade`, `lines`, card batch, `focusin` handler) |
| F4: `scroll-padding-top` (nav) and `scroll-padding-bottom` (mobile bar) | `assets/css/main.css` |
| F5: on focus, the builder option's visible label is scrolled into view (JS); CSS scroll margin fallback without JS | `assets/js/builder.js`, `assets/css/builder.css` |
| F6: page behind the loader is `inert` until the reveal starts (also lifted by the 3 s safety net and when the loader is dropped) | `index.html` (tiny inline script after the footer; safety net in the head bootstrap), `assets/js/motion.js` (`unInert`) |
| F7: ring makes one slow 4.8 s quarter-turn, then stops | `assets/js/motion.js` |
| F8: desktop hero text in the flow (grid: nav-safe top row, centred above the strip, hero grows if needed); identical position at 1440×900, 1280×800, 1024×768, 1920×1080 and 880×1000 | `assets/css/main.css` |
| F9: `lang="en"` / `lang="he"` on the mixed-language parts | `index.html` |
| F10: "still loading" announced once via the existing status region | `assets/js/builder.js` (`pvUpdate`) |
| U1: reviews eyebrow `role="heading" aria-level="2"`, section labelled by it | `index.html` |
| U2: animated number `aria-hidden`, plus a steady visually hidden "4.2 מתוך 5" / "4.2 out of 5" | `index.html` |
| U3: below 600 px height (single-column layout) the builder preview is no longer sticky | `assets/css/builder.css` |

## 3. WCAG criteria addressed
1.4.3, 1.4.10, 1.4.12, 2.1.1, 2.2.2, 2.4.3, 2.4.7, 2.4.11, 2.5.3, 3.1.2, 4.1.3; also 1.3.1 and 2.4.6 for the headings.

## 4. Automated results
| Check | Phase 3 | Phase 4 |
|---|---|---|
| axe WCAG 2.2 AA violations (22 scans) | 13 (`label-content-name-mismatch`) | **0** |
| Text below contrast (pixel measure, worst 5% of glyph pixels, 4 configurations) | 32 | **0** |
| Focused controls hidden or covered (Tab walk, reduced motion, 390/1440) | 5 | **0** |
| Focused while invisible, motion on (390/1440) | 3 / 1 | **0 / 0** |
| Distinct tab stops reached, motion on (390/1440) | 25 / 31 | **30 / 36** (all except unchecked radios, reached with arrows) |
| Focus behind the loader | yes | **no** |
| Seal still moving after 6–9 s | yes | **no** |
| Text spacing: hero content hidden (1440/1280) | eyebrow, heading, buttons | **none** (only the decorative seal and watermark are clipped) |
| Targets < 24 px | 0 | 0 |
| Horizontal overflow at 320 px (400%) and 720 px (200%) | 0 | 0 |
| Keyboard ordering journey (102 checks: skip link, menu, builder with arrows/Space, add, quantity, edit, update, remove, language, English, image errors) | 97/102 (cart unreachable on phones with motion; reviews section without heading) | **102/102** |

## 5. Regression
- **Existing suite:** 169/169.
- **Phase 3 checks:** 54/54.
- **Builder readiness:** 32/32.
- **AVIF fallback / fast scroll:** 45/51. Every functional fallback check passes. The 6 failures are its "pixel-identical to Phase 2" check, which now differs by design: Phase 4 deliberately changed the photo sections (halos, overlays, eyebrow colour) and the nav-link halos. SSIM 0.94–1.00.
- **Lighthouse (median of 3):**

| Configuration | LCP | CLS | TBT | Weight / requests |
|---|---|---|---|---|
| Mobile 390 | 3.45 s | 0.002 | 72 ms | 487 KB / 21 |
| Tablet 768 | 3.53 s | 0.001 | 34 ms | 487 KB / 21 |
| Desktop 1440 | 0.72 s | 0.005 | 0 | 487 KB / 21 |
| Real slow 4G | 3.32 s | 0.000 | 98 ms | 487 KB / 21 |

These are in line with Phase 3 (Phase 2: 5.55 s, 1186 KB / 48).

## 6. Manual testing and limitations
- **Screen readers: NOT tested.** No NVDA or VoiceOver is available in this environment, so I make no claim of screen-reader testing. What I checked instead:
  - Chromium's accessibility tree (names, roles, states)
  - live-region contents after each action
  - the language attributes
- **Real devices and touch:** not tested; mobile was emulated in Chromium.
- **Browsers:** Chromium only. Firefox, Safari and Windows High Contrast / forced colours were not tested.
- **Zoom:** emulated with viewport sizes equivalent to 200% and 400%, not with real browser zoom.

## 7. Remaining issues
1. The outlined "more than pizza" words are a stylistic choice that is legible but thin. They measured above 3:1 (large text). At desktop with motion, their focus ring loses a sliver on one edge because the row clips the drifting words.
2. On short desktop windows (e.g. 1280×720) the hero text now starts just below the nav instead of 6 px under it, and the hero is 47 px taller. Every other tested desktop size is pixel-identical.
3. Seal ring: no longer turns continuously (one 4.8 s turn), a visible design change required by 2.2.2. It could be restored behind a pause button if preferred.
4. An extra tiny inline script (setting `inert` behind the loader) joins the existing inline head bootstrap. Relevant for a future strict CSP.
5. Topping checkboxes keep a second `<label>` (the chips); the name is correct via `aria-label`. Converting the chips to buttons would remove axe's "needs review".
6. During the ~2 s hero intro (motion on), the hero CTA and nav are briefly not focusable, after the loader. Low impact.
7. Not addressed (outside this phase): the generic `order.bitetech.co.il` ordering link; SEO; CSP and hosting headers.

## 8. Changed files and Git
Modified (all existing Phase 3 files; no new files):
- `index.html`
- `assets/css/main.css`
- `assets/css/builder.css`
- `assets/js/core.js`
- `assets/js/builder.js`
- `assets/js/motion.js`

`?v=` hashes updated; `tools/asset-versions.py --check` is clean. Branch `phase-4-accessibility`, not committed.
