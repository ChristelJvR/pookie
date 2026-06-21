# Pookie Upgrade — Design Spec (2026-06-19)

Scoped, agreed design for the next pass on the Pookie site. Refines and supersedes the
rough `docs/PLAN.md` for the work being done now. Read alongside
`docs/codebase-summary.md` (current-state reference).

> **Copy rule (unchanged):** All final user-facing copy is **Afrikaans**, written by Christel.
> This pass must **not** generate finished Afrikaans note copy. New/rewritten/deepened notes get
> **English** `[TODO]` placeholders in the `copy` field; kept notes retain their existing Afrikaans.

## Scope of this pass

In scope:
1. **Phase 1 — Content & data model:** expand `BLOBS` from 10 → **18**.
2. **Quick UI wins:** focus management, keyboard-accessible replay counter, (conditional) perf-friendly glow, favicon + meta.
3. **Phase 4 — Findability:** stronger found-state recession + idle safety-net hint.
4. **Phase 5 — Finale rework:** love letter → interactive destination-cards pick.

Out of scope:
- **Phase 2 (custom character blob art) — dropped permanently.** Libby & Nala keep their existing
  custom SVGs; all other blobs use the existing simple line-icon style. No new character art.
- **Phase 3 (motion/interactivity overhaul + zone layout) — deferred.** See the
  [Phase 3 handover](#phase-3-handover-deferred) section for what's left.

## Must not break (regression guardrails)

- 4-state flow (Splash → Playground → Modal → Finale) and free-roam, open-in-any-order hunt.
- `role="dialog"`/`aria-modal` on modal + finale; `aria-live="polite"` on counter; Esc closes.
- `prefers-reduced-motion` disables all ambient + new motion (static fallbacks).
- Touch: labels visible on `(hover: none)`; all new tap interactions work on touch, not just hover.
- Persistence: `pookie:opened`, `pookie:finale-seen` keep working; reset clears everything.
- `transform`/`opacity`-only animation; counter total derives from `BLOBS.length` (no hard-coded count).

---

## 1. Phase 1 — The 18 blobs

The final set, balanced across registers. Each is a `BLOBS` data entry; adding/removing later is a
one-object edit. Order below is the array order (affects only entrance-drop stagger; layout is automatic).

| # | id | register | status | icon (placeholder) | accent |
|---|----|----------|--------|------|--------|
| 1 | `wedding` | inside-joke | KEEP copy | ring | marigold |
| 2 | `nine-pm` | inside-joke | KEEP copy | moon | sky |
| 3 | `calendar` | inside-joke | KEEP copy | calendar | coral |
| 4 | `pookiedooks` | inside-joke | NEW | speech | pink |
| 5 | `knew` | our history | NEW | spark | sun |
| 6 | `decision` | our history | NEW | pin | mint |
| 7 | `empty-house` | everyday us | REWRITE | box | pink |
| 8 | `her-laugh` | everyday us | NEW | note | sun |
| 9 | `therapy` | what I see in you | KEEP copy | seedling | mint |
| 10 | `teaching` | what I see in you | REWRITE (was `gr3-smile`) | sun | sun |
| 11 | `closeness` | tender | NEW | hands | pink |
| 12 | `sleep` | tender | NEW | crescents | sky |
| 13 | `libby` | the hard things | DEEPEN | libby (custom) | near-black + white dot |
| 14 | `nala` | the hard things | DEEPEN | nala (custom) | gold |
| 15 | `fear` | the hard things | NEW | wave | deep blue |
| 16 | `leaving` | the hard things | NEW | mountain | sky |
| 17 | `move` | what's coming | REWRITE (warmer, two-of-us) | suitcase | coral |
| 18 | `bangkok` | what's coming | KEEP copy + make-concrete TODO | plane | sky |

**Set aside** (swap-in candidates, documented for later): `squabble`, `our-place`, `house-object`,
`daily-life`, `year-from-now`.

### Copy handling per status

- **KEEP** (`wedding`, `nine-pm`, `calendar`, `therapy`): existing Afrikaans stays verbatim.
- **`bangkok`** (KEEP + concrete): existing Afrikaans stays; add a `// TODO` comment to make it a
  specific image of Bangkok life that bridges to the finale cards.
- **REWRITE** (`empty-house`, `teaching`, `move`): `copy` field = English `[TODO — write Afrikaans: …]`
  describing the new framing. (`move` → warmer/two-of-us, drop the productivity framing. `teaching`
  → about *her* and what Christel loves watching in her with kids, not the kids adoring her.
  `empty-house` → the funny intimacy of the emptying house, drop "does it all in a week".)
- **NEW** (`pookiedooks`, `knew`, `decision`, `her-laugh`, `closeness`, `sleep`, `fear`, `leaving`):
  `copy` field = English `[TODO — write Afrikaans: …]` with the §6 feel description.
- **DEEPEN** (`libby`, `nala`): `copy` field = English `[TODO]` with the **dog context** baked in so the
  direction is captured:
  - Libby: with them ~1 year ("my swartbessie"); Ouma will spoil her.
  - Nala: 10 yrs old, Christel's from the start; loved Nicole on meeting and is now her dog too.
  Original Afrikaans one-liners preserved in a comment so nothing is lost.

### New placeholder icons

Simple line-style SVGs consistent with the existing icon set (not character art): `speech`, `spark`,
`pin`, `note`, `hands`, `crescents`, `wave`, `mountain`, `box`. Each readable at mobile blob size.
Libby/Nala unchanged. New blobs get a thematic `color`/`glow` (see accent column; `fear` deep blue).

### Content constraints (unchanged)

- Every note fully self-contained — no note references another or assumes reading order.
- Italics via `*text*` → `<em>`.

---

## 2. Quick UI wins

### 2.1 Focus management (modal + finale)
On open: store the triggering element, move focus to the dialog (the close button), and **trap Tab**
within the dialog. On close: restore focus to the stored trigger. Applies to blob modal and finale
(and the new destination cards, which live inside the finale dialog).

### 2.2 Keyboard-accessible replay
The counter becomes an activatable control **only once all 18 are found** (`is-complete`). When complete:
focusable (`tabindex`/real button semantics) and triggerable by Enter/Space to replay the finale.
Before completion it stays a passive `aria-live` status. `aria-live="polite"` preserved throughout.

### 2.3 Perf-friendly glow (conditional)
Attempt: replace the `filter: drop-shadow` pulse with an **opacity-animated halo layer** (compositor-only)
to keep 18 blobs smooth on phone. **Acceptance gate:** must visually match the current pulse. If it
can't match, **keep the existing pulse** — the current look is the priority.

### 2.4 Favicon + meta
Add a 💌 favicon (inline SVG or small asset) and `<meta name="description">` + Open Graph tags so a
shared link / home-screen save looks intentional.

---

## 3. Phase 4 — Findability

### 3.1 Stronger found-state recession
Found blobs already dock to the top row + dim to 0.55. Strengthen the recession so unfound blobs are
unmistakably the bright, lively ones: docked/opened blobs go more ghost-like (lower opacity ~0.4 +
slight desaturate, optional minor shrink), while **remaining fully tappable** to re-read. Done via CSS
on `.is-opened`/`.is-docked`; must not fight the JS-computed dock scale/transform.

### 3.2 Idle safety-net hint
Track inactivity. After a quiet period (~12s) with notes still unfound, gently draw the eye to **one
random unfound (non-docked) blob** — a brief extra wiggle + momentary brightening for ~2s, repeating
periodically until more are found. Any blob-open resets the timer. **Reduced-motion:** no wiggle (skip
the hint motion entirely, or at most a static brightening). Never traps her hunting indefinitely.

### 3.3 Counter
Unchanged behaviour; `x / N gevind`, `aria-live` preserved (N already from `BLOBS.length`).

---

## 4. Phase 5 — Finale rework

### 4.1 Flow
1. **Love letter first** (emotional close) — keep the existing unfold animation + confetti.
2. **Then destination cards** — a clear affordance ("kies ons eerste avontuur →", placeholder copy)
   transitions, within the same finale dialog, from the letter to the cards view.

### 4.2 Stale-timing copy (BUG, §7)
The finale letter currently says "Twee weke gelede" / "Drie maande van nou af" — both wrong by read
date. Christel owns the copy, but has authorised a **foundation edit**: this pass makes a minimal,
conservative change swapping only the stale dated phrasing for **timeless wording** ("'n paar maande
gelede", "binnekort") so it can't go stale again, leaving the rest of the letter intact. Christel
refines from there. (Scope-limited: only the time references change — no full rewrite of the Afrikaans.)

### 4.3 Destination cards (interactive pick)
- **Data:** a `DESTINATIONS` array of **5** entries: `{ id, name, img, why }`. Photos already supplied
  in `img/` (jpg/webp mix — both fine, no conversion needed). Exact paths:

  | id | name | img |
  |----|------|-----|
  | `vietnam` | Vietnam | `img/vietnam.jpg` |
  | `japan` | Japan | `img/japan.jpg` |
  | `cambodia` | Cambodia | `img/cambodia.webp` |
  | `philippines` | Philippines | `img/philippines_el_nido.webp` |
  | `indonesia` | Indonesia | `img/indonesia.webp` |

  - `name`: place name (Christel swaps freely).
  - `why`: English `[TODO]` one-line "why this one" in Christel's voice.
- **Image display:** fixed-aspect card image box with `object-fit: cover`, so the differing native sizes
  (1000×750 → 3002×2000) all crop cleanly. Lazy-load (`loading="lazy"`).
- **Image slots / fallback:** if a file is missing/fails to load (`onerror`), the card **degrades
  gracefully** to a tinted gradient + place name, so it still looks intentional. (All 5 exist now; the
  fallback is a safety net + supports later swaps.)
- **Interactive pick:** Nicole taps a card → it's marked chosen, saved to `localStorage`
  (`pookie:trip-pick`), and echoed back ("Okay — [plek] dit is 💛", placeholder copy). She can change
  her pick (re-tap another card; the saved value updates).
- **Re-open:** via the gold counter, like the existing finale — replays letter → cards, with her saved
  pick highlighted.

### 4.4 Accessibility / motion
- Cards live inside the finale dialog (`role="dialog" aria-modal` consistent); cards are real buttons,
  focusable, Enter/Space to pick; focus management from §2.1 applies.
- Touch-friendly: tap-to-pick primary; horizontal layout scrolls/swipes on small screens. No
  hover-only affordances.
- `prefers-reduced-motion`: no card transition animation; static reveal.

### 4.5 Persistence
- New key `pookie:trip-pick` (string destination id, or absent).
- **Reset button must clear all three keys** now: `pookie:opened`, `pookie:finale-seen`, `pookie:trip-pick`.

---

## 5. Phase 3 handover (deferred)

Not built this pass. Captured so a future session can pick it up cleanly. Current state vs. what's left:

**Current state**
- Layout: deterministic scatter (`scatterLayout`) + bounded wander (`wanderVelocity`) + wrapping top
  dock row (`computeDockLayout`), all pure-tested in `motion.js`. Works at 18 on one screen.
- Motion: staggered entrance drop with bounce/squash, gentle drift + sine wobble while wandering.
- No tap/proximity reactions; drift is uniform/gentle.

**Left for Phase 3**
- **Livelier, more playful drift** (varied per-blob drift profiles / speeds) without crowding.
- **Tap/touch reactions:** squish/wobble/scale on tap; gentle reaction to proximity (hover/touch
  nearby). Must work on touch, tasteful not chaotic.
- **Zone-based generated layout:** optional evolution of scatter into loose grid-of-zones (one blob per
  zone + jitter) for guaranteed non-overlap at higher counts — current scatter already non-overlapping,
  so this is a refinement, not a blocker.
- **Performance budget at 18+** on a real phone: watch compositing of blobs + stars + orbs + blur;
  reduce star count / blur radius if needed. (The §2.3 glow change helps here.)
- Keep `prefers-reduced-motion` static for all of the above.

---

## 6. Files touched (this pass)

- `app.js` — `BLOBS` (18 entries + placeholders), new icons, focus mgmt, keyboard counter, Phase 4
  idle-hint + found-state hooks, `DESTINATIONS` + finale cards logic, `pookie:trip-pick` persistence,
  reset clears new key.
- `styles.css` — new found-state recession, idle-hint animation, destination-cards layout, (conditional)
  glow rework.
- `index.html` — favicon + meta, destination-cards DOM scaffold inside finale.
- `img/` — already populated with the 5 destination photos (jpg/webp). No code changes needed here.
- `tests/motion.test.js` — extend only if motion math changes (Phase 4 hint is DOM-side; likely no new
  pure functions, but add tests if any are introduced).
- `docs/codebase-summary.md` — update after implementation.

## 7. Testing & QA

- `node --test` stays green (motion math unchanged unless noted).
- Manual: 18-blob hunt on phone viewport; found-state recession clarity; idle hint fires + resets;
  finale letter → cards → pick → echo → persistence; reopen shows saved pick; reset clears all 3 keys;
  keyboard-only path (Tab/Enter/Esc) through modal, counter replay, and cards; reduced-motion pass.

## 8. Git note

Per project convention, **Christel owns all git operations.** This spec is written to disk but **not
committed** by the agent; commit when ready.
