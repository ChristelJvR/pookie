# Pookie — What's Next

The Pookie site (a hidden-note discovery experience for Nicole) has been through a big upgrade pass.
This file tracks **only what remains**. For everything already built, see:

- `docs/codebase-summary.md` — current state of the site (the source of truth).
- `docs/superpowers/specs/2026-06-19-pookie-upgrade-design.md` — the design spec for the last pass.
- `docs/superpowers/plans/2026-06-19-pookie-upgrade.md` — the implementation plan for the last pass.

> **Copy rule (still applies):** all user-facing copy is **Afrikaans**, written by Christel.
> Do **not** generate finished Afrikaans. New/rewritten notes carry English `[TODO]` placeholders in
> the code for her to replace.

---

## Already done (do not redo)

- **Phase 1 — Content:** blobs expanded 10 → **18** (data + simple line-icons). New/rewritten/deepened
  notes hold English `[TODO]` placeholders in `BLOBS`.
- **Quick UI wins:** focus trap + restore (modal + finale); keyboard-activatable replay counter;
  glow moved to an opacity-animated `.blob-halo`; favicon + meta.
- **Phase 4 — Findability:** stronger found-state recession; idle "nudge" hint after 12s.
- **Phase 5 — Finale:** love letter → **5 interactive destination cards** (real photos in `img/`,
  graceful fallback); pick saved to `pookie:trip-pick`, echoed + highlighted; reset clears all 3 keys;
  finale phrasing made timeless.
- **Phase 2 — Custom character blob art:** **dropped permanently.** Libby & Nala keep their existing
  custom SVGs; every other blob uses the simple line-icon style. Do not add more character art.

**Still on Christel (not an agent task):** writing the Afrikaans for the `[TODO]` placeholders in
`BLOBS`, the destination `why` lines in `DESTINATIONS`, and refining `FINALE_COPY`.

---

## What's next — Phase 3: Movement, interactivity & playful layout

This is the one remaining build phase. It was deliberately deferred because the current motion already
works fine at 18 blobs; Phase 3 is about making the hunt feel *alive and playful* rather than merely
functional. It's a polish/feel phase — treat it as elevation, not a rewrite.

### Current state (what you're building on)

All blob motion lives in two places:
- **`motion.js`** — pure, unit-tested geometry: `scatterLayout` (deterministic jittered grid for the
  reduced-motion / static layout), `computeDockLayout` (wrapping top "found" row + shared scale),
  `wanderVelocity` (gentle drift), `softReflect`, `clamp`. These have tests in `tests/motion.test.js`
  (`node --test`). **Keep them pure and keep the tests green.**
- **`app.js` → the `motion` IIFE** — owns the DOM + the `requestAnimationFrame` loop. Per-blob runtime
  state has phases: `static` → `falling` (staggered entrance drop with bounce/squash) → `wandering`
  (drift + a small sine scale wobble) → `docking` → `docked`. Positions are written as `translate3d`
  on the `.blob` element; the glow pulse + landing squash animate the inner `.blob-shape`/`.blob-halo`.

So today: blobs drop in, drift uniformly and gently, and fly to a docking row when opened. There are
**no tap/proximity reactions**, and drift is the same calm profile for every blob.

### Goals (in rough priority order)

1. **Tap / touch reactions (highest value).** When a blob is tapped (and on hover for pointer
   devices), give it a satisfying squish/wobble/bounce before the modal opens. There's already a
   landing-squash keyframe (`.blob-shape.is-landing` / `@keyframes blob-land`) you can reuse or echo.
   Must fire on **touch**, not just hover (she's on a phone). Keep it quick so it doesn't delay the
   note opening — consider firing the reaction and opening the modal near-simultaneously, or a very
   short (~150ms) lead.
2. **Livelier, more varied drift.** Right now every blob shares one gentle wander. Give blobs slightly
   varied drift profiles (speed / amplitude / phase) so the field feels organic rather than uniform —
   without becoming busy or nauseating. This is a tuning of `wanderVelocity` usage (and maybe an extra
   pure helper in `motion.js`, with tests).
3. **Gentle proximity reaction (nice-to-have).** Blobs react subtly to the pointer/touch passing near
   — a small scale-up or drift-away. Tasteful, not a physics toy. Skip if it fights performance.
4. **Zone-based layout (refinement, not a blocker).** The current `scatterLayout` already places 18
   without overlap. Optionally evolve it toward a "loose grid of zones, one blob per zone + jitter,
   each drifting within a bounded radius" so lanes never cross even at higher counts. Only worth doing
   if you also raise the blob count later; otherwise leave it.

### Hard constraints (do not break these)

- **`prefers-reduced-motion`:** every new motion must be disabled under reduced motion (the static
  `scatterLayout` placement is the fallback). The existing code gates on `motion.reduced` — follow that.
- **Performance on a phone** is the real risk with 18 animated blobs + stars + orbs + blur. Animate
  **`transform`/`opacity` only**; profile on a real device; if it janks, cut star count or blur radius
  first. (The glow already moved off animated `filter` for this reason.)
- **Touch first.** Labels show on `(hover: none)`; any new interaction must work by tap, not hover.
- **Keep `motion.js` pure and tested.** New geometry → new pure function → new test. Don't move DOM
  work into `motion.js` or math into the rAF loop.
- **Don't regress** the dock/found-row behaviour, the entrance drop, or the modal/finale flow.

### Mobile layout decision (settled)

Keep **everything on one screen** (100dvh stage; blobs surface via motion). Do **not** introduce a
larger-than-viewport pannable stage — panning a moving-blob field is fiddly on touch. Blob count is
**18** (don't change it as part of Phase 3).

### Suggested approach for the next agent

Brainstorm the *feel* first (it's subjective and it's a gift), then write a small plan. Most of the
work is in the `motion` IIFE in `app.js` plus a couple of CSS keyframes; pure geometry changes go in
`motion.js` with tests. Verify in a browser on a phone-sized viewport (and a real phone if possible),
checking both the lively path and the reduced-motion static path.
