# Blob motion & docking — design

Make the playground blobs feel alive: they fall into the screen after the splash, wander organically while loose, and fly up into a left→right row at the top once their letter has been read and dismissed.

## Goals

- After "Open me", the playground shows just the background, then blobs **drop in** from above the top edge with a damped bounce, staggered so they don't all land at once.
- Loose blobs **wander** with slow, organic, meandering motion plus a subtle scale wobble — "alive," not static, not frantic.
- When a blob's letter is read and the modal is **dismissed**, that blob flies up and **docks** into the next slot of a top row, filling left→right in click order. It keeps its current opened look (blurred/dimmed, not pulsing).
- The finale-on-dismiss behaviour added previously stays intact.

## Non-goals

- No new blob copy, icons, palette, or layout of the modal/finale.
- No physics between blobs (no blob-to-blob collision). Bounds-only containment.
- No animation library or new dependency — stays vanilla JS in the existing IIFE.

## Motion model

Each blob gets a runtime state object held in a parallel array/Map keyed by id:

```
{
  el,            // the .blob button element
  x, y,          // current position in px (top-left of blob box), within the stage
  vx, vy,        // velocity in px/frame-second
  phase,         // 'falling' | 'wandering' | 'docking' | 'docked'
  seed,          // per-blob phase offset for wander (derived from index)
  startDelay,    // stagger before this blob begins falling (s)
  slot           // docked slot index, assigned at docking time
}
```

Position is written every frame via `transform: translate3d(x, y, 0)` on the `.blob`. Blobs are positioned `left:0; top:0` so transform fully owns placement (the hand-tuned `position` percentages in `BLOBS` are no longer used for the loose layout; see "Data" below).

A single `requestAnimationFrame` loop advances all blobs. The loop computes `dt` from timestamps passed by rAF (no `Date.now()`), clamped to a max step so a backgrounded tab doesn't explode the integration.

### Phase: falling
- Blob starts at a random x within the stage's horizontal margins, y above the top edge (negative, off-screen).
- Begins moving only after `startDelay` (staggered by index, ~0.08–0.12s apart).
- Gravity accelerates `vy` downward. On reaching its target rest band, it **bounces once** with damping (vy *= -restitution), then settles when |vy| is below a threshold → switches to `wandering` with a small random initial wander velocity.
- A brief CSS squash on landing (scaleY down / scaleX up) sells the bounce.

### Phase: wandering
- Steering velocity from summed sine waves: `vx = A * sin(t*f1 + seed) + ...`, similarly for `vy`, with low frequencies and small amplitude → slow meandering. Each blob's `seed` keeps paths uncorrelated.
- Subtle scale wobble: `scale(1 + w*sin(t*fw + seed))` with small `w`, applied alongside the translate.
- Containment: x clamped to `[margin, stageW - blobW - margin]`, y clamped to `[topReserved, stageH - blobH - margin]`. `topReserved` keeps loose blobs out of the docking row band. On hitting a bound, the relevant velocity component is softly reflected so motion stays smooth (no hard stop).

### Phase: docking
- Triggered when an opened blob's modal is dismissed (see "Integration").
- The blob leaves the rAF sim (loop skips `docking`/`docked` phases for physics) and a CSS transition animates its `transform` to the target slot position. Transition uses a pleasant ease (e.g. `cubic-bezier` with slight overshoot) over ~600ms.
- `transitionend` (or a fallback timeout) flips phase to `docked`.

### Phase: docked
- Blob holds its slot position. Keeps `is-opened` styling (blurred/dimmed). New `is-docked` class disables pointer wandering and marks it parked.
- Stays clickable to re-read its letter (opening a docked blob just shows its modal again; it does not re-enter the sim).

## Docking row layout

- The row is a **centered band** of `BLOBS.length` (10) evenly spaced slot centers across the stage width, sitting in the reserved top strip.
- Slots fill **left→right in click order**: the Nth blob to be docked takes slot index N (0-based from the left). So the visual order reflects discovery order, and a full run produces a centered, evenly spaced row of 10.
- Slot geometry is computed from current stage size; recomputed on resize (see below).

## Reading is calm

- While a modal is open, the wander loop **pauses** (loop continues running but `wandering` blobs hold position — freeze velocities / skip integration) so the moving background isn't distracting behind the card.
- On modal close, loose blobs resume wandering. The just-dismissed opened blob instead begins `docking`.

## Edge cases

- **Returning visitor:** blobs whose ids are in `pookie:opened` start already `docked`, placed into slots in their stored order (the stored array order = click order). Only not-yet-opened blobs go through `falling`. The counter and finale state restore as today.
- **Resize:** recompute stage dimensions, containment bounds, and docked slot centers; reposition docked blobs to their recomputed slots. Loose blobs are re-clamped into the new bounds.
- **`prefers-reduced-motion`:** no rAF physics at all. Blobs render at static positions (reuse the existing hand-tuned `BLOBS[].position` percentages for the loose layout). Opening + dismissing a blob snaps it to its docked slot with no transition. Wobble/pulse already disabled by the existing reduced-motion CSS.
- **Background tab / large dt:** `dt` clamped so integration stays stable.

## Integration with existing code

`app.js`:
- New self-contained **motion engine** section: init state from blob elements, the rAF loop, phase handlers, dock/slot math, resize handler, pause/resume hooks. Reduced-motion guard short-circuits to static placement.
- `renderBlobs()` — blobs get `left:0; top:0`; the old per-blob float/pulse CSS-var stagger that drove drift is no longer needed for position (pulse delay may stay for the glow).
- `openBlob()` — unchanged in its modal/persistence logic; calls the engine's `pause()` so wandering freezes while reading. The `pendingFinale` logic from the prior fix is untouched.
- `closeModal()` — after closing, if the just-closed blob is newly/already opened, tell the engine to `dock(id)`; resume wandering for the rest via `resume()`. Keeps the existing `pendingFinale` → finale trigger.
- `restoreState()` — opened ids are handed to the engine as pre-docked (in stored order) instead of just adding the `is-opened` class.

`styles.css`:
- Retire the `float-blob` drift keyframe / its application (JS owns position now).
- Move `pulse-glow` so it animates the glow/halo layer (e.g. a child or box-shadow) rather than a transform on `.blob`, so it never fights the JS `translate3d`.
- Add `.blob.is-docked` (parked, no pointer wander affordance) and the docking `transition` on `transform`.
- Reduced-motion block: ensure static placement path has no transitions.

## Testing / verification

Manual, in-browser (this is a static site with no test harness):
1. Fresh load → "Open me" → blobs drop in staggered with a bounce, then wander.
2. Open a blob → background motion pauses while reading; dismiss → blob flies to leftmost open slot; others resume.
3. Open several → they fill the top row left→right in click order.
4. Open all 10 → after dismissing the last, finale appears (prior fix); row shows all 10 centered & evenly spaced.
5. Reload mid-progress → already-opened blobs are pre-docked in order; remaining drop in.
6. Resize window → bounds and docked slots adjust, nothing escapes the viewport.
7. `prefers-reduced-motion` on → no drift/drop; opening snaps blobs to slots; everything still reachable.
```
