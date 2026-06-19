# CLAUDE.md

Guidance for working in this repo.

## What this is

**Pookie** — a single-page love-letter website for Nicole (the user's wife), written in
Afrikaans (`lang="af"`). Vanilla HTML/CSS/JS, **no build step, no framework, no dependencies.**
The experience: a splash → a "playground" where you discover floating blobs → each blob opens
a modal with a little letter → opening all of them unlocks a finale letter + confetti.

**Read [`docs/codebase-summary.md`](docs/codebase-summary.md) first.** It is the source of
truth for the design system, the full experience flow, every blob's copy, the finale letter,
and the editing mechanics. Keep it updated when you change behavior or copy.

## Files

| File | Role |
|---|---|
| `index.html` | DOM scaffold (splash, playground, modal, finale, background layers, reset button). |
| `styles.css` | All styling: tokens, animations, state machine, responsive + reduced-motion. |
| `app.js` | IIFE. Blob data (`BLOBS`), finale copy, icons, localStorage persistence, render + modal/finale logic. |
| `motion.js` | Pure, unit-tested geometry helpers (dock layout, scatter, wander). Dual export: browser global + CommonJS. |
| `tests/motion.test.js` | Node built-in test runner coverage for `motion.js`. |
| `docs/superpowers/` | Plans + design specs from past feature work. |

## Running it

```
./serve          # starts a local server (port 8765) and opens the browser
./serve 3000     # custom port
```

(`./serve` just wraps `python3 -m http.server`. Ctrl+C to stop.)

## Tests

```
node --test
```

Only `motion.js` is tested (it holds the pure geometry). When you change layout/motion math,
update or add tests there.

## Editing letters (the common task)

Adding a letter = **append one object to the `BLOBS` array in `app.js`.** Only `id` (unique —
it keys localStorage persistence), `label`, and `copy` are required; `color`/`glow`/`icon` are
optional (auto-assigned). Layout is fully automatic at any blob count — no coordinates to tune.
Use `*italics*` in copy → renders as `<em>` (Fraunces italic). The counter total derives from
`BLOBS.length`; never hard-code a count. See the codebase summary's "Mechanics worth knowing"
section before editing.

## Conventions

- Match the existing vanilla style — no introducing frameworks, bundlers, or npm deps.
- Copy is **Afrikaans** and personal. Preserve tone; don't "correct" it to English or formalize it.
- Keep `prefers-reduced-motion` working — every animation has a reduced-motion fallback.
- Persistence keys: `pookie:opened`, `pookie:finale-seen`.

## Git

**Do not run `git add`/`commit`/`push`.** The user owns all git state changes.
