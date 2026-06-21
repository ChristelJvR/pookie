# Pookie — codebase summary

Snapshot of the current state of the site (design, mechanics, copy) for planning further changes.

## Files

| File | Role |
|---|---|
| `index.html` | DOM scaffold: splash, playground, modal, finale (with destination-cards section), bg layers, reset button. `lang="af"`, theme color `#1A1B3A`, favicon (💌) + description/OG meta, Google Fonts (Fraunces + Nunito). |
| `styles.css` | Tokens, background, splash, state machine, playground, blobs, modal, finale, destination cards, reset button, mobile breakpoints, reduced-motion. |
| `app.js` | IIFE strict mode. Blob data + finale copy + destinations, SVG icons, localStorage persistence, focus trap, idle hint, modal/finale logic, destination pick, renderer, init. |
| `motion.js` | Pure, unit-tested geometry (dock layout, scatter, wander). Unchanged by the 18-blob upgrade. |
| `img/` | 5 destination photos (jpg/webp): `vietnam.jpg`, `japan.jpg`, `cambodia.webp`, `philippines_el_nido.webp`, `indonesia.webp`. |
| `tests/motion.test.js` | Node built-in test runner coverage for `motion.js` (11 tests). |

## Experience flow (4 states)

1. **Splash** — `💌` envelope (floating), `Vir my pookiedooks` (Fraunces), cream pill button "Open me 💛".
2. **Playground** — blob discovery. Counter top-right (`0 / 18 gevind`), 18 glowing blobs floating around a 100dvh stage. After ~12s idle with notes still unfound, a random unfound blob briefly wiggles/brightens (findability safety-net; reduced-motion safe; stops once all found).
3. **Modal** — click a blob → backdrop blur + card-rise card, label as title, copy in body. Focus moves into the dialog and is trapped; Esc/× restores focus to the blob. Opened blobs recede (dim + desaturate) and dock to a wrapping top row.
4. **Finale** — all 18 opened → a **two-step wizard inside one dialog** (no close/reopen between steps):
   - *Step 1 — the love letter* (gradient title, confetti) with a "kies ons eerste avontuur →" button.
   - *Step 2 — the destination picker* (its own view): a "← terug na die brief" back button, "Waarheen eerste?" heading, and **5 destination cards**. Steps slide in (fwd/back); reduced-motion safe. Tapping a card saves it (`pookie:trip-pick`), highlights it, and echoes "Okay — [plek] dit is 💛".
   The gold counter (keyboard-activatable when complete) replays the finale from step 1, with the saved pick highlighted.

Both the modal and finale cards are **height-capped** (`max-height: calc(100dvh - 48px)`) with an inner scroll region (`.modal-scroll` / `.finale-scroll`) so they never overflow the viewport; the × stays pinned. Cards are a touch wider (modal 500px, finale 580px) and stay inset on mobile.

## Design system

- **Palette:** midnight twilight (`#1A1B3A` deep + `#3D2B5F` mid radial), cream text `#FFF1D4`. Blob pops: coral, marigold, mint, pink, sky, sun, plus libby near-black + nala gold, and a deep-blue `fear`.
- **Typography:** Fraunces (headings, italics), Nunito (body).
- **Background:** radial gradient + 2 blurred orbs + 36 twinkling stars.
- **Glow:** each blob has a soft halo circle (`.blob-halo`) whose **opacity/scale** pulses (compositor-friendly), plus a static drop-shadow on the shape. (Replaced the older `filter`-animated pulse.) `prefers-reduced-motion` disables all ambient animation.
- **Persistence:** `pookie:opened` (array of ids), `pookie:finale-seen` (bool), `pookie:trip-pick` (destination id). Finale auto-triggers once per browser. **Reset clears all three keys.**

## The 18 blobs

Defined in the `BLOBS` array (single source of truth). Each: `id` (keys persistence), `label`, `color`/`glow`/`icon` (optional; rotating palette + heart fallback), `copy`. Italics via `*text*` → `<em>`.

| # | id | label | copy status |
|---|----|----|----|
| 1 | `wedding` | 22 April | Afrikaans (kept) |
| 2 | `nine-pm` | 8:57 | Afrikaans (kept) |
| 3 | `calendar` | vandag se datum | Afrikaans (kept) |
| 4 | `pookiedooks` | pookiedooks | `[TODO]` placeholder |
| 5 | `knew` | die oomblik | `[TODO]` placeholder |
| 6 | `decision` | die besluit | `[TODO]` placeholder |
| 7 | `empty-house` | die leë huis | `[TODO]` (rewrite; original in comment) |
| 8 | `her-laugh` | jou lag | `[TODO]` placeholder |
| 9 | `therapy` | die werk | Afrikaans (kept) |
| 10 | `teaching` | die kleintjies | `[TODO]` (rewrite of gr3-smile; original in comment) |
| 11 | `closeness` | naby jou | `[TODO]` placeholder |
| 12 | `sleep` | langs jou | `[TODO]` placeholder |
| 13 | `libby` | Libby | `[TODO]` (deepen; original + dog context in comment) |
| 14 | `nala` | Nala | `[TODO]` (deepen; original + dog context in comment) |
| 15 | `fear` | die vrees | `[TODO]` placeholder |
| 16 | `leaving` | wat ons los | `[TODO]` placeholder |
| 17 | `move` | die move | `[TODO]` (rewrite warmer; original in comment) |
| 18 | `bangkok` | Bangkok | Afrikaans (kept; `// TODO` make concrete) |

Kept notes (wedding, nine-pm, calendar, therapy, bangkok) hold final Afrikaans; the rest hold **English `[TODO]` placeholders** that Christel replaces with Afrikaans. Libby/Nala keep their custom SVG art (ears + Libby's white chest dot); all other blobs use simple line-icons. Icons available: ring, suitcase, libby, nala, seedling, moon, calendar, sun, plane, speech, spark, pin, note, hands, crescents, wave, mountain, box, heart (fallback).

## Finale letter (`FINALE_COPY`)

~110 words, opens "Pookiedooks,". Timeless phrasing ("'n Paar maande gelede", "Binnekort") so it can't go stale; flagged with a `// TODO` for Christel to refine. Names the pillars (wedding / move / dogs / work / therapy), gratitude, Bangkok closer, "Lief jou. Altyd."

## Destination cards (`DESTINATIONS`)

5 entries `{ id, name, img, why }`: Vietnam, Japan, Cambodja, Filippyne, Indonesië. `name` is Afrikaans; `why` is an English `[TODO]` one-liner for Christel to write. `img` points into `img/` (jpg/webp). Cards live on the finale's **step 2** (`#finale-step-picker`) and render as `<button>`s in a horizontal scroll/snap strip. Each photo fills its box as a **CSS `background-image` with `background-size: cover`** on the `aspect-ratio: 4/3` `.dest-img` div (set in JS after an `Image()` preload) — this always fills + crops regardless of the photo's native size/EXIF, independent of `<img>`/`object-fit` quirks. The `.dest-img` gradient is the fallback shown until/unless the photo loads (preload `onerror` keeps it + flags `.img-failed`). Tapping picks (interactive, saved + echoed). Reduced-motion + mobile breakpoints handled.

## Mechanics worth knowing for edits

- **Adding/removing a letter is a one-object edit** to `BLOBS` — only `id`/`label`/`copy` required; layout is automatic at any count (scatter → wander → wrapping dock row). Counter total renders from `BLOBS.length`.
- Geometry lives in `motion.js` as pure, unit-tested functions (`computeDockLayout`, `scatterLayout`, `wanderVelocity`, `softReflect`, `clamp`). The dock band sizes to the full blob count.
- **Accessibility:** modal + finale are `role="dialog" aria-modal` with a focus trap (`focusTrap.activate/release`) and focus restore; counter `aria-live="polite"`, becomes keyboard-activatable (Enter/Space) only when complete; Esc closes both.
- **Idle hint** (`idleHint`): 12s idle → nudge a random unfound blob, repeat ~9s, reset on any open, off under reduced-motion, stops when all found.
- On `(hover: none)` labels show at 0.85 opacity; on hover-capable they appear on hover.
- Opening the final blob waits 400ms after dismissal then auto-launches the finale (once). Reopening anytime after requires the gold counter.
- Reset button (`↻ replay`, bottom-left) clears all three localStorage keys and reloads to splash.
- **Note:** `python3 -m http.server` does not send cache headers, so browsers may serve a stale `styles.css`/`app.js` — hard-refresh after edits. (`./serve` wraps the same server.)
