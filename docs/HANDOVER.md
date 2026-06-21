# Handover — open issues

Two unresolved items for the next agent. Keep changes vanilla (no framework/build); copy is Afrikaans.

---

## 1. Destination card images don't fill their container (UNRESOLVED)

**Symptom (on the owner's real desktop Chrome on macOS, and mobile):** in the finale's destination
picker, the destination photos render *letterboxed/pillarboxed* — the whole image shown shrunk with
card background visible around it — instead of filling the card and cropping the excess. It reproduces
for every photo whose native aspect ratio ≠ the card box (4:3); only `philippines_el_nido.webp` and
`indonesia.webp` (both natively ~4:3) look right. `japan.jpg` (2560×1709) is the most obvious.
**Goal: any image, any dimensions, must fill the box and crop the overflow.**

**Where to look:**
- `styles.css` → `.dest-img` and `.dest-cards` rules.
- `app.js` → `renderDestinations()` (builds the cards; currently sets the photo as a
  `background-image` on the `.dest-img` div).

**What was already tried and did NOT fix it on the owner's machine (don't just repeat these):**
1. `<img>` with `width/height:100%; object-fit: cover` inside an `aspect-ratio: 4/3` box.
2. Same `<img>` but `position: absolute; inset: 0; object-fit: cover`.
3. Current state: removed the `<img>`; `.dest-img` is a div with a CSS `background-image` +
   `background-size: cover; background-position: center` (URL set in JS after an `Image()` preload;
   gradient fallback if it fails).

**CRITICAL CLUE — why the previous agent failed:** all three approaches rendered *correctly* (images
filled, `getComputedStyle` returned `cover`, element box == image box) in **headless Playwright
Chromium (devicePixelRatio 1)**. The bug only appears in the owner's **real browser**. So this is
environment-specific, not a "which cover technique" problem. Do NOT trust a headless screenshot here —
**reproduce in the owner's actual browser with DevTools.**

**Suggested next steps (in the real browser):**
- Inspect a failing `.dest-img` in DevTools: what are its *actual* computed width/height? Is
  `aspect-ratio: 4/3` producing the height you expect, or is the box collapsing / sizing to the image?
  (Strong hypothesis: the box height is wrong, so "cover" has nothing to crop against. Try a fixed
  pixel/`vh` height or padding-top ratio hack instead of `aspect-ratio` to test this.)
- Confirm there's no stale CSS (owner has hard-refreshed and the hover fix is live, so probably fine).
- Test in an Incognito window with extensions disabled (Dark Reader, image/ad optimizers can rewrite
  images/object-fit).
- Check `image-orientation`/EXIF handling and device-pixel-ratio (the owner is on a Retina Mac;
  the previous tests were dpr 1).
- Whatever the fix, verify it by looking at the **owner's** browser, not a headless one, and test with
  a deliberately non-4:3 image.

---

## 2. Missing first-time "instruction" on the playground (NOT IMPLEMENTED)

There is **no upfront on-screen instruction** telling Nicole what to do when she lands on the
playground. Right now she only sees the counter (`0 / 18 gevind`) and, after ~12s of inactivity, a
single blob does a wiggle/brighten "idle hint" (`idleHint` in `app.js`). There is no immediate,
explicit "tap the glowing lights to open each note"-style cue. This was raised early as a UI gap and
never added to scope — it still needs doing.

**What's wanted:** a brief, gentle, one-time instruction shown when the playground first opens (e.g. a
short line like "Tik op die liggies om elke briefie oop te maak" — owner writes the final Afrikaans),
that auto-fades or dismisses on first interaction. Keep it tasteful (it's a gift), and respect
`prefers-reduced-motion`.

**Where to implement:**
- `index.html` → add a hint element inside `.playground` (near the counter / over the stage).
- `app.js` → `openPlayground()` shows it; hide it on the first `openBlob()` (and/or auto-fade after a
  few seconds). Don't re-show on replay.
- `styles.css` → style + fade transition; reduced-motion handling.
- Copy is the owner's to write — use an English `[TODO]`/placeholder.
