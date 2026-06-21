# Pookie Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Grow Pookie from 10 to 18 letters, add findability + an interactive finale destination-pick, and land a set of accessibility/perf polish — without breaking the existing 4-state flow.

**Architecture:** Vanilla HTML/CSS/JS, no build, no deps. All blob/finale data stays in the single `BLOBS`/new `DESTINATIONS` arrays in `app.js` (the source of truth). DOM + rAF motion live in `app.js`; pure geometry stays in `motion.js` (untouched this pass). Styling in `styles.css`. Auto-layout already scales to any blob count, so adding letters is data-only.

**Tech Stack:** HTML5, CSS3, ES5-style vanilla JS (IIFE, strict mode), Google Fonts (Fraunces + Nunito), `node:test` for `motion.js` only.

## Global Constraints

- **Copy rule:** all final user-facing copy is **Afrikaans**, written by Christel. Do NOT generate finished Afrikaans note copy. NEW/REWRITE/DEEPEN notes get **English** `[TODO]` placeholders in the `copy` field; KEEP notes retain existing Afrikaans verbatim.
- **No new dependencies, no framework, no build step.** Stay vanilla.
- **Animate `transform`/`opacity` only** where possible; respect `prefers-reduced-motion` for every animation (static fallback).
- **Accessibility:** preserve `role="dialog"`/`aria-modal` on modal + finale, `aria-live="polite"` on counter, Esc-to-close. New interactive elements must be keyboard- and touch-operable.
- **Persistence keys:** `pookie:opened`, `pookie:finale-seen`, and new `pookie:trip-pick`. The reset button must clear **all three**.
- **Counter total** derives from `BLOBS.length` — never hard-code a count.
- **Git:** the agent does NOT run `git add/commit/push`. Each task ends at a checkpoint; **Christel commits.**
- **Verification:** no DOM test harness exists. Verify in-browser via `./serve` (opens `http://localhost:8765`). Keep `node --test` green (motion math is not changed this pass). The Playwright MCP browser is available if the implementer wants to automate a check, but manual is sufficient.

---

## File Structure

- `app.js` — `BLOBS` (18 entries), `icon()` additions, `DESTINATIONS`, finale-cards logic, focus manager, keyboard counter, Phase 4 idle hint, `pookie:trip-pick` persistence, reset update.
- `styles.css` — found-state recession, idle-hint keyframes, destination-card layout, (conditional) glow rework.
- `index.html` — favicon + meta tags, destination-cards DOM inside the finale card.
- `img/` — already holds the 5 destination photos. No change.
- `docs/codebase-summary.md` — updated last to reflect the new state.

---

## Task 1: Expand BLOBS to 18 + add placeholder icons

**Files:**
- Modify: `app.js` (the `BLOBS` array, ~lines 12-88, and the `icon()` map, ~lines 99-114)

**Interfaces:**
- Produces: a `BLOBS` array of 18 entries, each `{ id, label, color, glow, icon, copy }`. New `icon()` keys: `speech`, `spark`, `pin`, `note`, `hands`, `crescents`, `wave`, `mountain`, `box`. Libby/Nala custom art (`ears()` + `libby`/`nala` icon keys) unchanged.

- [ ] **Step 1: Replace the `BLOBS` array** in `app.js` with the 18-entry version below (preserves KEEP copy verbatim; NEW/REWRITE/DEEPEN use English `[TODO]`; original lines preserved as comments).

```js
  const BLOBS = [
    {
      id: "wedding", label: "22 April",
      color: "#FFB347", glow: "#FFB347", icon: "ring",
      copy:
        "Twee-en-twintig April. 'n Stil tekening by home affairs, geen blomme, geen toespraak. Maar dis amptelik — jy is my vrou. Ek het nog nie heeltemal gewoond geraak aan daardie woord nie.\n\n*My vrou.*",
    },
    {
      id: "nine-pm", label: "8:57",
      color: "#7FB8E8", glow: "#B8A1E8", icon: "moon",
      copy: "Dis 8:57. Almal — honde ingesluit — weet wat nou gebeur.",
    },
    {
      id: "calendar", label: "vandag se datum",
      color: "#FF7E6B", glow: "#FF7E6B", icon: "calendar",
      copy: "...het jy al vandag se datum afgemerk? 👀",
    },
    {
      id: "pookiedooks", label: "pookiedooks",
      color: "#FF8FA6", glow: "#FF8FA6", icon: "speech",
      copy: "[TODO] The silly origin story of the name “pookiedooks” — where it came from, told with a grin.",
    },
    {
      id: "knew", label: "die oomblik",
      color: "#FFD93D", glow: "#FFD93D", icon: "spark",
      copy: "[TODO] The specific moment you *knew* — one concrete image/scene, not “from the start”.",
    },
    {
      id: "decision", label: "die besluit",
      color: "#6BCBB8", glow: "#6BCBB8", icon: "pin",
      copy: "[TODO] The night/conversation you two decided to actually do all of this — Thailand, the leap.",
    },
    {
      id: "empty-house", label: "die leë huis",
      color: "#FF8FA6", glow: "#FF8FA6", icon: "box",
      // Original: "Update: nog 'n stoel verkoop. Ons sit binnekort op die vloer en eet pizza. Jy is besig om Marie Kondo se werk in 'n week te doen."
      copy: "[TODO] Keep the charming image (pizza on the floor, half-empty rooms) but make it about the funny intimacy of the emptying house — not “you do it all in a week”.",
    },
    {
      id: "her-laugh", label: "jou lag",
      color: "#FFD93D", glow: "#FFD93D", icon: "note",
      copy: "[TODO] A specific sound/face/laugh she makes that you love.",
    },
    {
      id: "therapy", label: "die werk",
      color: "#6BCBB8", glow: "#6BCBB8", icon: "seedling",
      copy:
        "Jy doen die werk wat die meeste mense nooit doen nie. Jy gaan terug, jy vra die moeilike vrae, jy probeer verstaan hoekom jy is wat jy is.\n\nEk sien jou. Ek's so trots op jou.",
    },
    {
      id: "teaching", label: "die kleintjies",
      color: "#FFD93D", glow: "#FFD93D", icon: "sun",
      // Original (gr3-smile): "Geen meer 'n streng gesig nie. Geen meer 'wys hulle wie's baas op dag een' nie.\n\nJy mag glimlag op werk. Daai gr3s gaan jou aanbid."
      copy: "[TODO] Flip it to be about *her* — what you love watching in her when she's with the kids (not the kids adoring her).",
    },
    {
      id: "closeness", label: "naby jou",
      color: "#FF8FA6", glow: "#FF8FA6", icon: "hands",
      copy: "[TODO] The massage night / the comfort of being close to her — the happiest, most relaxed you've seen her.",
    },
    {
      id: "sleep", label: "langs jou",
      color: "#7FB8E8", glow: "#7FB8E8", icon: "crescents",
      copy: "[TODO] Falling asleep / waking up next to her.",
    },
    {
      id: "libby", label: "Libby",
      color: "#1F1F2A", glow: "#7FB8E8", icon: "libby",
      // Original: "My swartbessie. Ouma gaan jou só bederf."
      // Context: Libby has been with you two ~1 year. Ouma will spoil her.
      copy: "[TODO] Deepen — Libby, “my swartbessie” (with you ~1 year). The ache of leaving her; Ouma will spoil her rotten.",
    },
    {
      id: "nala", label: "Nala",
      color: "#E8B85C", glow: "#FFD93D", icon: "nala",
      // Original: "Goue Nala. Jy weet nog nie, maar jy gaan baie cuddles by ouma kry."
      // Context: Nala is 10, Christel's from the start; loved Nicole when they met and is now her dog too.
      copy: "[TODO] Deepen — golden Nala, 10 yrs, yours from the start; she chose Nicole too and is now her dog. Lots of cuddles at Ouma's.",
    },
    {
      id: "fear", label: "die vrees",
      color: "#4E5BA6", glow: "#7FB8E8", icon: "wave",
      copy: "[TODO] A genuine fear about the move, said plainly and vulnerably.",
    },
    {
      id: "leaving", label: "wat ons los",
      color: "#7FB8E8", glow: "#7FB8E8", icon: "mountain",
      copy: "[TODO] What you're actually giving up — Cape Town, family, the life here.",
    },
    {
      id: "move", label: "die move",
      color: "#FF7E6B", glow: "#FF7E6B", icon: "suitcase",
      // Original: "Ek staan in die kombuis en kyk hoe jy 'n nuwe lys afmerk. Polisie clearance, kwalifikasies, die huis se huur, die meubels — jy doen dit alles, en jy kla nie eens nie.\n\nBangkok het g'n idee wat aankom nie."
      copy: "[TODO] Rewrite warmer / two-of-us — the move as something you're doing together, not admiring her doing the lists alone.",
    },
    {
      id: "bangkok", label: "Bangkok",
      color: "#7FB8E8", glow: "#7FB8E8", icon: "plane",
      // TODO (tweak): make it one concrete image of your life there (not "êrens warm"); bridges to the finale cards.
      copy:
        "Ons mini-honeymoon kom nog. Jy en ek, êrens warm, geen to-do lyste, geen koffers nie.\n\nNet ons twee, en die begin van iets nuuts.",
    }
  ];
```

- [ ] **Step 2: Add the new icons** to the `icons` object inside `icon()` in `app.js` (keep all existing keys; add these before the closing `}`). The `heart` fallback stays last.

```js
      speech:    '<rect x="-8" y="-7" width="16" height="11" rx="3" fill="none" stroke="#1A1B3A" stroke-width="2"/><path d="M-3 4 L-3 8 L2 4 Z" fill="#1A1B3A"/>',
      spark:     '<path d="M0 -8 L1.6 -1.6 L8 0 L1.6 1.6 L0 8 L-1.6 1.6 L-8 0 L-1.6 -1.6 Z" fill="#1A1B3A"/>',
      pin:       '<path d="M0 7 C -5 1 -5 -4 0 -7 C 5 -4 5 1 0 7 Z" fill="none" stroke="#1A1B3A" stroke-width="2"/><circle cx="0" cy="-2.5" r="2.2" fill="#1A1B3A"/>',
      note:      '<circle cx="-3" cy="5" r="2.8" fill="#1A1B3A"/><path d="M-0.2 5 L-0.2 -7 L6 -9" stroke="#1A1B3A" stroke-width="2" fill="none" stroke-linecap="round"/>',
      hands:     '<circle cx="-2.5" cy="0" r="5" fill="none" stroke="#1A1B3A" stroke-width="2"/><circle cx="2.5" cy="0" r="5" fill="none" stroke="#1A1B3A" stroke-width="2"/>',
      crescents: '<path d="M0 -5 A6.5 6.5 0 1 0 0 6 A5 5 0 1 1 0 -5 Z" fill="#1A1B3A"/><path d="M4 -8 L8 -8 L4 -4 L8 -4" stroke="#1A1B3A" stroke-width="1.6" fill="none" stroke-linejoin="round"/>',
      wave:      '<path d="M-8 1 Q-4 -4 0 1 T8 1" fill="none" stroke="#1A1B3A" stroke-width="2" stroke-linecap="round"/><path d="M-8 5 Q-4 0 0 5 T8 5" fill="none" stroke="#1A1B3A" stroke-width="2" stroke-linecap="round"/>',
      mountain:  '<path d="M-8 6 L-4 -4 L4 -4 L8 6 Z" fill="none" stroke="#1A1B3A" stroke-width="2" stroke-linejoin="round"/>',
      box:       '<path d="M-7 -2 L0 -6 L7 -2 L0 2 Z" fill="none" stroke="#1A1B3A" stroke-width="1.8" stroke-linejoin="round"/><path d="M-7 -2 L-7 5 L0 9 L0 2 M7 -2 L7 5 L0 9" fill="none" stroke="#1A1B3A" stroke-width="1.8" stroke-linejoin="round"/>',
```

- [ ] **Step 3: Verify in browser.** Run `./serve`, click "Open me", and confirm:
  - 18 blobs drop in and wander (no overlap; they dock to a wrapping top row when opened).
  - Counter reads `0 / 18 gevind`.
  - Each new blob shows its placeholder icon (not the heart fallback).
  - Opening a NEW/REWRITE/DEEPEN blob shows the English `[TODO]` text; KEEP blobs show Afrikaans.
  - Libby (dark + ears + white chest dot) and Nala (gold + ears) art still render.

- [ ] **Step 4: Sanity-check motion tests.** Run: `node --test`  — Expected: all pass (no math changed).

- [ ] **Step 5: Checkpoint.** Hand to Christel to review + commit (suggested message: `feat: expand to 18 blobs with placeholder copy + icons`).

---

## Task 2: Favicon + meta tags

**Files:**
- Modify: `index.html` (`<head>`, after the `<title>` ~line 7)

**Interfaces:**
- Produces: an inline SVG favicon (💌) + description/Open Graph meta. No JS.

- [ ] **Step 1: Add favicon + meta** to `index.html` `<head>`, immediately after the `<title>` line.

```html
  <meta name="description" content="’n Klein webwerf vol briefies — vir my pookiedooks." />
  <meta property="og:title" content="Vir my pookiedooks" />
  <meta property="og:description" content="’n Klein webwerf vol briefies — vir my pookiedooks." />
  <meta property="og:type" content="website" />
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%92%8C%3C/text%3E%3C/svg%3E" />
  <link rel="apple-touch-icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%92%8C%3C/text%3E%3C/svg%3E" />
```

- [ ] **Step 2: Verify.** Reload via `./serve`; the browser tab shows the 💌 favicon (may need a hard refresh). No console errors.

- [ ] **Step 3: Checkpoint.** Christel commits (suggested: `feat: add favicon and share meta`).

---

## Task 3: Perf-friendly glow (conditional — keep current look)

**Goal:** Move the pulse off the compositor-unfriendly `filter` animation onto an opacity/transform-animated halo, ONLY if it visually matches. **Acceptance gate:** if the new look differs noticeably from the current pulse, **revert this task entirely** and keep the existing pulse (per Christel's instruction the current look is the priority).

**Files:**
- Modify: `app.js` (`buildBlobSvg`, ~lines 591-607)
- Modify: `styles.css` (`.blob-shape` + `pulse-glow`, ~lines 189-231)

- [ ] **Step 1: Add a class to the halo circle** in `buildBlobSvg` in `app.js`. Change:

```js
        '<circle cx="0" cy="0" r="48" fill="url(#halo-' + blob.id + ')"/>' +
```

to:

```js
        '<circle class="blob-halo" cx="0" cy="0" r="48" fill="url(#halo-' + blob.id + ')"/>' +
```

- [ ] **Step 2: Replace the filter-pulse CSS** in `styles.css`. Change `.blob-shape` to a static drop-shadow + animate the halo instead:

```css
.blob-shape {
  width: 72px; height: 72px;
  position: relative;
  filter: drop-shadow(0 0 16px var(--blob-glow, white));
  transition: transform 200ms ease, filter 400ms ease;
}
.blob-shape svg { width: 100%; height: 100%; display: block; }
.blob-halo {
  transform-box: fill-box;
  transform-origin: center;
  animation: halo-pulse 4s ease-in-out infinite;
  animation-delay: var(--pulse-delay, 0s);
}
@keyframes halo-pulse {
  0%, 100% { opacity: 0.45; transform: scale(0.92); }
  50%      { opacity: 0.85; transform: scale(1.08); }
}
```

And delete the old `@keyframes pulse-glow` block (now unused). In `.blob.is-opened .blob-shape`, remove the `animation: none;` line (there's no longer a shape animation) — leave its `filter`/`opacity` (Task 6 revises this rule anyway). For opened blobs also stop the halo: add `.blob.is-opened .blob-halo { animation: none; opacity: 0.25; }`.

- [ ] **Step 3: Update reduced-motion.** In the `@media (prefers-reduced-motion: reduce)` block, the `.blob-shape` entry no longer animates; add `.blob-halo` to the `animation: none !important;` selector list.

- [ ] **Step 4: A/B verify.** Run `./serve`. Compare against the pre-change look (git stash or the committed version in another tab). **Decision:**
  - If the halo pulse looks equivalent → keep it.
  - If it looks worse/different → `git checkout -- app.js styles.css` to revert this task and keep the original pulse. Record the decision in the checkpoint note.

- [ ] **Step 5: Checkpoint.** Christel commits (suggested: `perf: opacity-animated glow halo` OR a note "kept original pulse — halo didn't match").

---

## Task 4: Focus management for modal + finale

**Files:**
- Modify: `app.js` (add a focus-trap helper; hook into `openBlob`/`closeModal`/`showFinale`/`closeFinale`)

**Interfaces:**
- Produces: `focusTrap.activate(container)` and `focusTrap.release()`; called on open/close of modal and finale. Restores focus to the element that was focused before opening.

- [ ] **Step 1: Add the focus-trap helper** in `app.js`, just above the `// ---------- Modal ----------` section (~line 184).

```js
  // ---------- Focus management ----------
  // Moves focus into a dialog, traps Tab inside it, restores focus on release.
  const focusTrap = (function () {
    let container = null;
    let lastFocused = null;

    function focusable() {
      if (!container) return [];
      const sel = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      return Array.prototype.slice.call(container.querySelectorAll(sel))
        .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
    }

    function onKeydown(e) {
      if (e.key !== "Tab" || !container) return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }

    function activate(el) {
      release();                       // ensure only one trap at a time
      container = el;
      lastFocused = document.activeElement;
      document.addEventListener("keydown", onKeydown, true);
      const items = focusable();
      if (items.length) items[0].focus();
    }

    function release() {
      if (!container) return;
      document.removeEventListener("keydown", onKeydown, true);
      container = null;
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
      lastFocused = null;
    }

    return { activate: activate, release: release };
  })();
```

- [ ] **Step 2: Activate the trap when the modal opens.** In `openBlob`, after the line `document.getElementById("modal-backdrop").hidden = false;` add:

```js
    focusTrap.activate(document.getElementById("modal-card"));
```

- [ ] **Step 3: Release on modal close.** In `closeModal`, after the line `document.getElementById("modal-backdrop").hidden = true;` add:

```js
    focusTrap.release();
```

- [ ] **Step 4: Activate/release for the finale.** In `showFinale`, after `document.getElementById("finale-backdrop").hidden = false;` add `focusTrap.activate(document.getElementById("finale-card"));`. In `closeFinale`, after `document.getElementById("finale-backdrop").hidden = true;` add `focusTrap.release();`.

  Note: `showFinale` calls `closeModal()` first, which releases the modal trap and (harmlessly) restores focus; the subsequent `focusTrap.activate` for the finale overrides it. That's correct.

- [ ] **Step 5: Verify (keyboard).** Run `./serve`. With keyboard only: open a blob (Enter on a focused blob), confirm focus lands on the × button, Tab cycles only within the card (never reaches background blobs), Esc closes and focus returns to the blob you opened. Repeat for the finale (find all 18, or use the gold counter once complete).

- [ ] **Step 6: Checkpoint.** Christel commits (suggested: `feat: focus trap + restore for modal and finale`).

---

## Task 5: Keyboard-accessible replay counter (only when complete)

**Files:**
- Modify: `app.js` (`updateCounter`, ~lines 241-249; counter listener in `init`, ~line 700)

**Interfaces:**
- Consumes: `opened`, `BLOBS.length`, `showFinale()`.
- Produces: when (and only when) all blobs are found, the counter becomes focusable + Enter/Space activatable to replay the finale.

- [ ] **Step 1: Toggle focusability in `updateCounter`.** Replace the `is-complete` branch so it also manages `tabindex`/`aria-label`:

```js
  function updateCounter() {
    const found = document.getElementById("counter-found");
    const counter = document.getElementById("counter");
    if (found) found.textContent = String(opened.size);
    if (counter) {
      if (opened.size === BLOBS.length) {
        counter.classList.add("is-complete");
        counter.setAttribute("tabindex", "0");
        counter.setAttribute("aria-label", "Speel die finale weer");
      } else {
        counter.classList.remove("is-complete");
        counter.removeAttribute("tabindex");
        counter.removeAttribute("aria-label");
      }
    }
  }
```

- [ ] **Step 2: Add keyboard activation** in `init`, right after the existing counter `click` listener:

```js
    document.getElementById("counter").addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && opened.size === BLOBS.length) {
        e.preventDefault();
        showFinale();
      }
    });
```

- [ ] **Step 3: Verify.** Run `./serve`. Before completion: the counter is not Tab-focusable. After finding all 18: Tab reaches the counter, Enter/Space replays the finale; mouse click still works.

- [ ] **Step 4: Checkpoint.** Christel commits (suggested: `feat: keyboard-activatable replay counter when complete`).

---

## Task 6: Phase 4 — stronger found-state recession

**Files:**
- Modify: `styles.css` (`.blob.is-opened .blob-shape` + label, ~lines 220-226)

**Interfaces:**
- Produces: opened/docked blobs recede further (lower opacity + desaturation) so unfound blobs are clearly the bright, lively ones. Blobs stay tappable (re-readable).

- [ ] **Step 1: Strengthen the opened state.** Replace the `.blob.is-opened .blob-shape` and `.blob.is-opened .blob-label` rules in `styles.css` with:

```css
/* Opened blobs recede strongly: dim + desaturate so unfound ones pop. Still tappable. */
.blob.is-opened .blob-shape {
  filter: drop-shadow(0 0 6px var(--blob-glow, white)) grayscale(0.55) brightness(0.85);
  opacity: 0.38;
}
.blob.is-opened .blob-label { opacity: 0.4; }
.blob.is-opened:hover .blob-shape { opacity: 0.6; }
```

  (If Task 3 was kept, the `.blob.is-opened .blob-halo { animation: none; opacity: 0.25; }` rule from Task 3 already handles the halo. If Task 3 was reverted, also add `animation: none;` back into `.blob.is-opened .blob-shape` since the reverted `pulse-glow` lives on `.blob-shape`.)

- [ ] **Step 2: Verify.** Run `./serve`. Open a few blobs; confirm found ones visibly recede (faded/greyer) in the top dock row while unfound ones stay bright and pulsing. Confirm a found blob is still clickable and re-opens its letter, and brightens slightly on hover.

- [ ] **Step 3: Checkpoint.** Christel commits (suggested: `feat: stronger found-state recession`).

---

## Task 7: Phase 4 — idle safety-net hint

**Files:**
- Modify: `styles.css` (add hint keyframes near the blob animations, ~line 231)
- Modify: `app.js` (add idle-hint controller; start it in `openPlayground`; reset it in `openBlob`)

**Interfaces:**
- Consumes: `motion.reduced`, `opened`, `BLOBS.length`.
- Produces: `idleHint.kick()` (reset the timer) and `idleHint.start()` (begin watching). After ~12s with unfound blobs and no opens, one random unfound blob wiggles + brightens; repeats until none remain.

- [ ] **Step 1: Add the hint animation** to `styles.css` (after the `.blob-shape.is-landing` block ~line 244):

```css
/* Findability safety-net: briefly draw the eye to an unfound blob after idle. */
.blob.is-hint .blob-shape {
  animation: blob-hint 1.1s ease-in-out 2;
}
@keyframes blob-hint {
  0%, 100% { transform: scale(1) rotate(0deg);   filter: drop-shadow(0 0 12px var(--blob-glow, white)); }
  25%      { transform: scale(1.12) rotate(-7deg); filter: drop-shadow(0 0 32px var(--blob-glow, white)); }
  75%      { transform: scale(1.12) rotate(7deg);  filter: drop-shadow(0 0 32px var(--blob-glow, white)); }
}
```

- [ ] **Step 2: Add the controller** in `app.js`, just above `// ---------- Init ----------` (~line 659):

```js
  // ---------- Idle findability hint ----------
  const idleHint = (function () {
    const IDLE_MS = 12000;     // quiet time before a nudge
    const REPEAT_MS = 9000;    // gap between nudges while still idle
    let timer = null;

    function unfoundBlobs() {
      return Array.prototype.slice.call(
        document.querySelectorAll(".blob:not(.is-opened)")
      );
    }

    function nudge() {
      const pool = unfoundBlobs();
      if (pool.length === 0) return;                 // all found — stop nudging
      const el = pool[Math.floor(seededRandom() * pool.length)];
      el.classList.add("is-hint");
      setTimeout(function () { el.classList.remove("is-hint"); }, 2500);
      timer = setTimeout(nudge, REPEAT_MS);
    }

    // Deterministic-ish randomness without Math.random monoculture isn't needed
    // here; Math.random is fine for a visual nudge.
    function seededRandom() { return Math.random(); }

    function kick() {
      if (motion.reduced) return;                    // respect reduced motion
      if (timer) clearTimeout(timer);
      if (opened.size >= BLOBS.length) return;       // nothing left to find
      timer = setTimeout(nudge, IDLE_MS);
    }

    return { kick: kick, start: kick };
  })();
```

- [ ] **Step 2b: Move the `idleHint` block AFTER the `motion` IIFE and after `openBlob`/`opened` are defined.** `idleHint` references `motion.reduced`, `opened`, and `BLOBS` — all defined earlier in the file (the `motion` object ends ~line 588, `opened` is declared ~line 185). Placing `idleHint` just above `// ---------- Init ----------` satisfies all references. No forward-reference issues since it's only *called* at runtime.

- [ ] **Step 3: Start the hint when the playground opens.** In `openPlayground`, after `motion.start();` add:

```js
    idleHint.start();
```

- [ ] **Step 4: Reset the hint on every blob open.** In `openBlob`, at the very top of the function (after `const blob = ...; if (!blob) return;`) add:

```js
    idleHint.kick();
```

- [ ] **Step 5: Verify.** Run `./serve`, enter the playground, open one blob then wait ~12s without interacting → a random unfound blob wiggles/brightens, repeating every ~9s. Opening a blob resets the wait. Find all 18 → nudges stop. Then test reduced motion (macOS: System Settings → Accessibility → Display → Reduce motion) → no wiggle occurs.

- [ ] **Step 6: Checkpoint.** Christel commits (suggested: `feat: idle findability hint`).

---

## Task 8: Finale copy — timeless foundation edit

**Files:**
- Modify: `app.js` (`FINALE_COPY`, ~lines 90-95)

**Interfaces:**
- Produces: `FINALE_COPY` with the two stale dated phrases swapped for timeless wording. Christel refines the rest.

- [ ] **Step 1: Edit only the stale time references** in `FINALE_COPY`. Change `"Twee weke gelede het ek my naam..."` → `"'n Paar maande gelede het ek my naam..."` and `"Drie maande van nou af verhuis ons..."` → `"Binnekort verhuis ons..."`. The full second paragraph line becomes:

```js
    "'n Paar maande gelede het ek my naam langs joune geskryf en gesê *vir altyd*. Binnekort verhuis ons na 'n nuwe land. Ons groet binnekort vir Libby en Nala. En tussen al hierdie groot dinge — die move, die troue, die werk, die therapy — is jy steeds die een wat alles bymekaar hou.\n\n" +
```

- [ ] **Step 2: Add a tweak marker** as a comment directly above `const FINALE_COPY =`:

```js
  // TODO (Christel): refine wording freely. Phrasing kept timeless on purpose so it can't go stale.
```

- [ ] **Step 3: Verify.** Run `./serve`, trigger the finale (find all 18 or use the gold counter after completing once), confirm the letter reads with the timeless phrasing and no longer says "Twee weke"/"Drie maande".

- [ ] **Step 4: Checkpoint.** Christel commits (suggested: `fix: timeless finale phrasing`).

---

## Task 9: Phase 5 — destination cards DOM + data + render

**Files:**
- Modify: `index.html` (finale card, ~lines 43-50)
- Modify: `app.js` (add `DESTINATIONS`, `renderDestinations()`)
- Modify: `styles.css` (destination card styles)

**Interfaces:**
- Produces: `DESTINATIONS` array `[{ id, name, img, why }]`; `renderDestinations()` that fills `#finale-destinations`. Cards are `<button class="dest-card" data-id>`. Consumed by Task 10 (flow) and Task 11 (pick).

- [ ] **Step 1: Add the destinations DOM** inside the finale card in `index.html`, after the `<div class="finale-body" id="finale-body"></div>` line and before `</article>`:

```html
      <button class="finale-next" id="finale-next" type="button">kies ons eerste avontuur →</button>
      <section class="finale-destinations" id="finale-destinations" hidden aria-label="Bestemmings">
        <h3 class="dest-heading" id="dest-heading">Waarheen eerste?</h3>
        <div class="dest-cards" id="dest-cards"></div>
        <p class="dest-echo" id="dest-echo" aria-live="polite"></p>
      </section>
```

- [ ] **Step 2: Add the `DESTINATIONS` array** in `app.js`, immediately after the `FINALE_COPY` definition (~line 95):

```js
  // Finale destination cards. `img` files live in img/ (jpg/webp mix is fine).
  // `why` is an English [TODO] placeholder — Christel writes the Afrikaans.
  const DESTINATIONS = [
    { id: "vietnam",     name: "Vietnam",     img: "img/vietnam.jpg",
      why: "[TODO] Why Vietnam — one line in your voice." },
    { id: "japan",       name: "Japan",       img: "img/japan.jpg",
      why: "[TODO] Why Japan — one line in your voice." },
    { id: "cambodia",    name: "Cambodja",    img: "img/cambodia.webp",
      why: "[TODO] Why Cambodia — one line in your voice." },
    { id: "philippines", name: "Filippyne",   img: "img/philippines_el_nido.webp",
      why: "[TODO] Why the Philippines — one line in your voice." },
    { id: "indonesia",   name: "Indonesië",   img: "img/indonesia.webp",
      why: "[TODO] Why Indonesia — one line in your voice." }
  ];
```

- [ ] **Step 3: Add `renderDestinations()`** in `app.js`, just below the `DESTINATIONS` array. Image-load failure is handled by attaching an `error` listener (no inline handlers), which flips the card to a gradient fallback.

```js
  function renderDestinations() {
    const wrap = document.getElementById("dest-cards");
    if (!wrap) return;
    wrap.innerHTML = "";
    DESTINATIONS.forEach(function (d) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "dest-card";
      card.dataset.id = d.id;
      card.setAttribute("aria-label", d.name);

      const imgBox = document.createElement("div");
      imgBox.className = "dest-img";
      const img = document.createElement("img");
      img.src = d.img;
      img.alt = "";
      img.loading = "lazy";
      img.addEventListener("error", function () { card.classList.add("img-failed"); });
      imgBox.appendChild(img);

      const name = document.createElement("div");
      name.className = "dest-name";
      name.textContent = d.name;

      const why = document.createElement("div");
      why.className = "dest-why";
      why.textContent = d.why;

      card.appendChild(imgBox);
      card.appendChild(name);
      card.appendChild(why);
      wrap.appendChild(card);
    });
  }
```

- [ ] **Step 4: Call `renderDestinations()` once** at the end of `init()` (after `renderStars();`):

```js
    renderDestinations();
```

- [ ] **Step 5: Add the card styles** to `styles.css` (after the `.finale-body` rules, ~line 364):

```css
.finale-next {
  margin-top: 22px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 15px;
  color: var(--bg-deep);
  background: var(--c-sun);
  border: none;
  padding: 11px 22px;
  border-radius: var(--radius-pill);
  transition: transform 200ms ease, box-shadow 300ms ease;
}
.finale-next:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255, 217, 61, 0.35); }

.finale-destinations { margin-top: 22px; }
.finale-destinations[hidden] { display: none; }
.dest-heading {
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 20px;
  margin-bottom: 14px;
  color: var(--cream);
}
.dest-cards {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}
.dest-card {
  flex: 0 0 150px;
  scroll-snap-align: start;
  background: rgba(255, 241, 212, 0.08);
  border: 2px solid rgba(255, 241, 212, 0.15);
  border-radius: 14px;
  padding: 0;
  overflow: hidden;
  text-align: left;
  color: var(--cream);
  transition: transform 200ms ease, border-color 200ms ease;
}
.dest-card:hover { transform: translateY(-3px); }
.dest-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, var(--bg-mid), var(--bg-deep));
  overflow: hidden;
}
.dest-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.dest-card.img-failed .dest-img img { display: none; }
.dest-name {
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 16px;
  padding: 8px 10px 2px;
}
.dest-why {
  font-family: var(--font-body);
  font-size: 12px;
  line-height: 1.4;
  color: var(--cream-dim);
  padding: 0 10px 10px;
}
.dest-card.is-picked {
  border-color: var(--c-sun);
  box-shadow: 0 0 0 2px var(--c-sun), 0 8px 24px rgba(255, 217, 61, 0.3);
}
.dest-echo {
  margin-top: 14px;
  min-height: 1.2em;
  font-family: var(--font-heading);
  font-style: italic;
  font-size: 16px;
  color: var(--c-sun);
}
```

- [ ] **Step 6: Reduced-motion + mobile.** Add to the `@media (prefers-reduced-motion: reduce)` block: `.finale-next, .dest-card { transition: none; }`. Add to the `@media (max-width: 600px)` block: `.dest-card { flex-basis: 132px; }`.

- [ ] **Step 7: Verify (render only).** Run `./serve`. Temporarily force the finale: in the browser console run `document.getElementById('finale-destinations').hidden = false; document.getElementById('finale-backdrop').hidden = false;` after completing the hunt — confirm 5 cards render with photos, horizontal scroll/snap works, and the `[TODO]` why-lines show. (Full flow is wired in Task 10.) Confirm a card with a renamed/broken `img` shows the gradient fallback (test by temporarily mistyping one path, then restore).

- [ ] **Step 8: Checkpoint.** Christel commits (suggested: `feat: destination cards render + data`).

---

## Task 10: Phase 5 — finale flow (letter → cards)

**Files:**
- Modify: `app.js` (`showFinale`, `init` listeners)

**Interfaces:**
- Consumes: `renderDestinations()` (Task 9), `#finale-next`, `#finale-destinations`.
- Produces: a two-step finale — letter first, then cards revealed on `#finale-next`. `showFinale` resets to the letter step each time it's opened.

- [ ] **Step 1: Reset to the letter step in `showFinale`.** Replace `showFinale` with:

```js
  function showFinale() {
    closeModal();
    const body = document.getElementById("finale-body");
    if (body) body.innerHTML = renderCopy(FINALE_COPY);
    // Always start on the letter; the cards are revealed via #finale-next.
    const dest = document.getElementById("finale-destinations");
    const next = document.getElementById("finale-next");
    if (dest) dest.hidden = true;
    if (next) next.hidden = false;
    document.getElementById("finale-backdrop").hidden = false;
    focusTrap.activate(document.getElementById("finale-card"));
    spawnConfetti();
    highlightSavedPick();   // defined in Task 11
  }
```

  Note: this supersedes the `focusTrap.activate` you added to `showFinale` in Task 4 Step 4 (it's now inside this replacement — don't double-add).

- [ ] **Step 2: Wire the "next" button** in `init`, after the finale-close listener:

```js
    document.getElementById("finale-next").addEventListener("click", function () {
      document.getElementById("finale-next").hidden = true;
      document.getElementById("finale-destinations").hidden = false;
    });
```

- [ ] **Step 3: Verify.** Run `./serve`, complete the hunt; finale shows the letter + a "kies ons eerste avontuur →" button; clicking it hides the button and reveals the cards within the same dialog. Re-open via the gold counter → it starts again on the letter step. Esc/× closes; focus is trapped throughout (Task 4).

- [ ] **Step 4: Checkpoint.** Christel commits (suggested: `feat: finale letter → cards flow`).

---

## Task 11: Phase 5 — interactive pick, persistence, echo, reset

**Files:**
- Modify: `app.js` (persistence helpers, pick handler, `highlightSavedPick`, reset handler, card click listener)

**Interfaces:**
- Consumes: `DESTINATIONS`, `#dest-cards`, `#dest-echo`, `LS_TRIP_PICK`.
- Produces: `pookie:trip-pick` persistence; tapping a card saves + echoes; reset clears it; reopening highlights the saved pick.

- [ ] **Step 1: Add the persistence key + helpers** in `app.js`, next to the other `LS_*` constants (~lines 153-154):

```js
  const LS_TRIP_PICK = "pookie:trip-pick";

  function loadTripPick() {
    try { return localStorage.getItem(LS_TRIP_PICK) || null; }
    catch (e) { return null; }
  }
  function saveTripPick(id) {
    try { localStorage.setItem(LS_TRIP_PICK, id); } catch (e) {}
  }
```

- [ ] **Step 2: Add the pick handler + highlighter** in `app.js`, just below `renderDestinations()`:

```js
  function pickDestination(id) {
    const dest = DESTINATIONS.find(function (d) { return d.id === id; });
    if (!dest) return;
    saveTripPick(id);
    highlightSavedPick();
    const echo = document.getElementById("dest-echo");
    if (echo) echo.textContent = "Okay — " + dest.name + " dit is 💛";
  }

  function highlightSavedPick() {
    const picked = loadTripPick();
    const echo = document.getElementById("dest-echo");
    document.querySelectorAll(".dest-card").forEach(function (card) {
      card.classList.toggle("is-picked", card.dataset.id === picked);
    });
    if (picked && echo) {
      const dest = DESTINATIONS.find(function (d) { return d.id === picked; });
      echo.textContent = dest ? ("Okay — " + dest.name + " dit is 💛") : "";
    } else if (echo) {
      echo.textContent = "";
    }
  }
```

- [ ] **Step 3: Wire card taps** in `init`, after the finale-next listener:

```js
    document.getElementById("dest-cards").addEventListener("click", function (e) {
      const card = e.target.closest(".dest-card");
      if (card) pickDestination(card.dataset.id);
    });
```

- [ ] **Step 4: Clear the pick on reset.** In the reset-button handler in `init`, add `localStorage.removeItem(LS_TRIP_PICK);` alongside the existing two `removeItem` calls:

```js
      try {
        localStorage.removeItem(LS_OPENED);
        localStorage.removeItem(LS_FINALE_SEEN);
        localStorage.removeItem(LS_TRIP_PICK);
      } catch (e) {}
```

- [ ] **Step 5: Verify the full loop.** Run `./serve`:
  - Complete the hunt → finale → "kies…" → tap a card. It gets the gold `is-picked` ring and the echo reads `Okay — [Naam] dit is 💛`.
  - Tap another card → pick + echo update.
  - Close and re-open via the gold counter → after pressing "kies…", the previously picked card is still highlighted and the echo shows it (persisted).
  - Keyboard: Tab to a card, Enter picks it (cards are `<button>`s, so Enter fires `click`).
  - Press the reset button → reload to splash. Re-complete → no card is pre-picked, echo empty (confirms `pookie:trip-pick` was cleared).

- [ ] **Step 6: Checkpoint.** Christel commits (suggested: `feat: interactive destination pick + persistence`).

---

## Task 12: Update codebase summary docs

**Files:**
- Modify: `docs/codebase-summary.md`

- [ ] **Step 1: Update the summary** to reflect: 18 blobs (replace the "10 blobs" table + counts), the new finale flow (letter → 5 destination cards, interactive pick), the `pookie:trip-pick` key (and that reset clears all three), the new icons, focus management, the idle hint, the found-state recession, and (if kept) the glow-halo change. Update the "Experience flow" section's finale step and the persistence bullet.

- [ ] **Step 2: Verify.** Re-read `docs/codebase-summary.md` against the running site; ensure no stale "10" counts or old finale description remain.

- [ ] **Step 3: Checkpoint.** Christel commits (suggested: `docs: update codebase summary for 18-blob + finale rework`).

---

## Self-Review (completed by plan author)

**Spec coverage:**
- Phase 1 (18 blobs, copy handling, new icons) → Task 1. ✓
- Quick wins: favicon/meta → Task 2; perf glow (conditional) → Task 3; focus mgmt → Task 4; keyboard counter (only-when-complete) → Task 5. ✓
- Phase 4: found-state recession → Task 6; idle hint → Task 7. ✓
- Phase 5: timeless copy → Task 8; cards render/data → Task 9; flow → Task 10; pick/persistence/echo/reset → Task 11. ✓
- Phase 3 handover, Phase 2 dropped → documented in spec; no tasks needed (out of scope). ✓
- Docs update → Task 12. ✓

**Type/name consistency:** `focusTrap.activate/release`, `idleHint.start/kick`, `renderDestinations`, `pickDestination`, `highlightSavedPick`, `loadTripPick`/`saveTripPick`, `LS_TRIP_PICK`, card class `dest-card`/`is-picked`/`img-failed`, ids `finale-next`/`finale-destinations`/`dest-cards`/`dest-echo` — all defined where first used and referenced consistently across tasks. `showFinale` is fully replaced in Task 10 (supersedes the Task 4 edit; noted inline to avoid a double-add). ✓

**Placeholder scan:** the only `[TODO]`s are intentional Afrikaans copy placeholders (per the Global Constraints copy rule), not plan gaps. ✓
