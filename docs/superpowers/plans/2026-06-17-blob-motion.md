# Blob Motion & Docking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make playground blobs drop into the screen after the splash, wander organically while loose, and fly up into a centered top row (left→right in click order) once their letter is read and dismissed.

**Architecture:** A single `requestAnimationFrame` loop in `app.js` owns every blob's on-screen position, written via `transform: translate3d(x,y,0) scale(s)`. Pure, DOM-free math (row-slot layout, wander velocity, bounds reflection) lives in a new `motion.js` module that is unit-tested with Node's built-in test runner. CSS stops driving blob position/drift; it keeps glow pulse and gains a docked state + fly-to-slot transition.

**Tech Stack:** Vanilla ES5-style JS (existing IIFE), plain CSS, no build step, no runtime dependencies. Tests run with `node --test` (built-in `node:test` + `node:assert`).

## Global Constraints

- **Zero runtime dependencies.** No animation libraries, no bundler. `motion.js` is loaded via a plain `<script>` tag before `app.js`.
- **Language style:** match existing `app.js` — ES5-flavored (`var`, `function`), `"use strict"`, no arrow functions / template literals in shipped browser code (Node test files may use modern syntax).
- **Git: the user owns all commits.** Do NOT run `git add`/`commit`/`push`. End each task at a verified checkpoint and let the user commit.
- **Position model:** blobs are positioned by JS via `transform: translate3d(xpx, ypx, 0) scale(s)` where `(x, y)` is the blob box's **top-left corner** in px within `#blob-stage`. CSS sets `left:0; top:0` (no more `translate(-50%,-50%)`).
- **Blob box size is read at runtime** (`el.offsetWidth/offsetHeight`) so the 88/76/70px responsive breakpoints are respected — never hardcode the blob size in physics math.
- **Reduced motion:** when `matchMedia('(prefers-reduced-motion: reduce)').matches`, run NO rAF loop — place loose blobs at their static `BLOBS[i].position` percentages and snap opened blobs to slots with no transition.
- **Existing behavior preserved:** the `pendingFinale`-on-dismiss logic (finale only after the last blob's modal is closed), localStorage persistence, counter, Esc handling, and reset button all keep working unchanged.

**Verification note:** This is a static site with no DOM test harness. Task 1 (pure module) uses automated `node --test`. Tasks 2–6 are verified in a real browser — either by the user opening `index.html`, or via the Playwright MCP tools against `file:///Users/christeljansenvanrensburg/Documents/pookie/index.html` (`browser_navigate`, `browser_click`, `browser_take_screenshot`, `browser_evaluate`). `localStorage.clear()` via `browser_evaluate` resets state between checks.

---

### Task 1: `motion.js` pure math module + tests

Pure, DOM-free helpers used by the engine. This is the only task with automated tests.

**Files:**
- Create: `motion.js`
- Create: `tests/motion.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces a global `PookieMotion` (browser) / module export (Node) with:
  - `clamp(v, min, max) -> number`
  - `computeRowLayout(stageW, count, blobW, opts?) -> { scale: number, scaledW: number, centers: number[] }` — `centers` are slot **center** x-coords, length `count`, ascending, centered on `stageW`. `scale <= 1` (shrinks the row if it would overflow). `opts = { margin=16, gapFactor=1.15 }`.
  - `wanderVelocity(t, seed, opts?) -> { vx: number, vy: number }` — deterministic; `opts = { amp=16, f1=0.13, f2=0.07 }`.
  - `softReflect(pos, vel, min, max, damping?) -> { pos: number, vel: number }` — if `pos<min` clamp to `min` and make `vel` positive·damping; if `pos>max` clamp to `max` and make `vel` negative·damping; else passthrough. `damping=0.6`.

- [ ] **Step 1: Write the failing tests**

Create `tests/motion.test.js`:

```js
"use strict";
const test = require("node:test");
const assert = require("node:assert");
const M = require("../motion.js");

test("clamp bounds a value", () => {
  assert.equal(M.clamp(5, 0, 10), 5);
  assert.equal(M.clamp(-3, 0, 10), 0);
  assert.equal(M.clamp(99, 0, 10), 10);
});

test("computeRowLayout returns `count` ascending centers", () => {
  const r = M.computeRowLayout(1000, 10, 88);
  assert.equal(r.centers.length, 10);
  for (let i = 1; i < r.centers.length; i++) {
    assert.ok(r.centers[i] > r.centers[i - 1], "centers ascend left to right");
  }
});

test("computeRowLayout centers the row on the stage", () => {
  const r = M.computeRowLayout(1000, 10, 88);
  const mid = (r.centers[0] + r.centers[r.centers.length - 1]) / 2;
  assert.ok(Math.abs(mid - 500) < 0.001, "row midpoint is stage center");
});

test("computeRowLayout uses full scale when the row fits", () => {
  const r = M.computeRowLayout(2000, 10, 88);
  assert.equal(r.scale, 1);
  assert.equal(r.scaledW, 88);
});

test("computeRowLayout shrinks to fit a narrow stage", () => {
  const r = M.computeRowLayout(360, 10, 70);
  assert.ok(r.scale < 1, "row scales down");
  assert.ok(r.scaledW < 70, "blobs render smaller in the row");
  // every slot stays within the stage
  assert.ok(r.centers[0] - r.scaledW / 2 >= 0);
  assert.ok(r.centers[9] + r.scaledW / 2 <= 360);
});

test("softReflect passes through inside bounds", () => {
  const r = M.softReflect(5, 3, 0, 10, 0.6);
  assert.deepEqual(r, { pos: 5, vel: 3 });
});

test("softReflect bounces off the low wall", () => {
  const r = M.softReflect(-4, -10, 0, 10, 0.5);
  assert.equal(r.pos, 0);
  assert.ok(r.vel > 0, "velocity points back inward");
  assert.equal(r.vel, 5);
});

test("softReflect bounces off the high wall", () => {
  const r = M.softReflect(14, 10, 0, 10, 0.5);
  assert.equal(r.pos, 10);
  assert.ok(r.vel < 0, "velocity points back inward");
});

test("wanderVelocity is deterministic and bounded", () => {
  const a = M.wanderVelocity(3.2, 1.7, { amp: 16 });
  const b = M.wanderVelocity(3.2, 1.7, { amp: 16 });
  assert.deepEqual(a, b);
  assert.ok(Math.abs(a.vx) <= 16 * 1.5 + 1e-9);
  assert.ok(Math.abs(a.vy) <= 16 * 1.5 + 1e-9);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test`
Expected: FAIL — `Cannot find module '../motion.js'`.

- [ ] **Step 3: Implement `motion.js`**

```js
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.PookieMotion = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function clamp(v, min, max) {
    return v < min ? min : (v > max ? max : v);
  }

  // A single horizontal row of `count` evenly spaced slots, centered on the
  // stage. Shrinks (scale < 1) when the natural row would overflow stageW.
  function computeRowLayout(stageW, count, blobW, opts) {
    opts = opts || {};
    var margin = opts.margin != null ? opts.margin : 16;
    var gapFactor = opts.gapFactor != null ? opts.gapFactor : 1.15;
    var stride = blobW * gapFactor;
    var avail = stageW - 2 * margin;
    var scale = Math.min(1, avail / (stride * count));
    var actualStride = stride * scale;
    var rowWidth = actualStride * count;
    var startX = (stageW - rowWidth) / 2;
    var scaledW = blobW * scale;
    var centers = [];
    for (var i = 0; i < count; i++) {
      centers.push(startX + actualStride * (i + 0.5));
    }
    return { scale: scale, scaledW: scaledW, centers: centers };
  }

  // Smooth organic drift from summed low-frequency sines. Deterministic in
  // (t, seed) so motion is reproducible and unit-testable.
  function wanderVelocity(t, seed, opts) {
    opts = opts || {};
    var amp = opts.amp != null ? opts.amp : 16;
    var f1 = opts.f1 != null ? opts.f1 : 0.13;
    var f2 = opts.f2 != null ? opts.f2 : 0.07;
    var vx = amp * (Math.sin(t * f1 + seed) + 0.5 * Math.sin(t * f2 * 1.7 + seed * 1.3)) / 1.5;
    var vy = amp * (Math.cos(t * f2 + seed * 0.7) + 0.5 * Math.sin(t * f1 * 1.3 + seed)) / 1.5;
    return { vx: vx, vy: vy };
  }

  // Clamp pos into [min,max]; if it hit a wall, send vel back inward, damped.
  function softReflect(pos, vel, min, max, damping) {
    damping = damping != null ? damping : 0.6;
    if (pos < min) return { pos: min, vel: Math.abs(vel) * damping };
    if (pos > max) return { pos: max, vel: -Math.abs(vel) * damping };
    return { pos: pos, vel: vel };
  }

  return {
    clamp: clamp,
    computeRowLayout: computeRowLayout,
    wanderVelocity: wanderVelocity,
    softReflect: softReflect
  };
});
```

Note: `wanderVelocity` divides the summed sines (max magnitude `amp*1.5`) by `1.5`, so each component stays within `±amp`. The test's `amp*1.5` ceiling is a safe upper bound.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test`
Expected: PASS — all tests green.

- [ ] **Step 5: Checkpoint**

Confirm `node --test` is green. Hand off to the user to commit `motion.js` + `tests/motion.test.js`.

---

### Task 2: Switch blob positioning to JS-owned transforms (static placement)

Lay the foundation: load `motion.js`, retire the CSS position/drift animations, and have `app.js` place each blob via `translate3d` at its existing hand-tuned spot. No physics yet — the playground should look essentially as it does today (minus the gentle float), proving the new positioning model works before motion is layered on.

**Files:**
- Modify: `index.html:55` (add the `motion.js` script tag before `app.js`)
- Modify: `styles.css` — `.blob` base rule (`174-189`), retire `blob-drift-in` (`190-193`) and `float-blob` (`233-236`), reduced-motion block (`430-443`)
- Modify: `app.js` — `renderBlobs` (`258-279`), `restoreState` (`281-289`), add a `motion` controller object and call it from `init`/`openPlayground`

**Interfaces:**
- Consumes: `PookieMotion` from Task 1; `BLOBS` (existing, each has `position.left`/`position.top` as `"NN%"`).
- Produces: a `motion` controller (module object inside the IIFE) with — in this task — `motion.init()` that reads blob elements from the DOM, computes each loose blob's static top-left px from its `BLOBS[i].position` percentage, and writes the `transform`. Later tasks extend this object with `start/pause/resume/dock/predock/relayout`.

- [ ] **Step 1: Add the `motion.js` script tag**

In `index.html`, change line 55 from:

```html
  <script src="app.js"></script>
```

to:

```html
  <script src="motion.js"></script>
  <script src="app.js"></script>
```

- [ ] **Step 2: Update CSS to hand position to JS**

In `styles.css`, replace the `.blob` base rule (lines 174-189) with:

```css
.blob {
  position: absolute;
  left: 0; top: 0;
  width: 88px; height: 88px;
  transform: translate3d(0, 0, 0);
  transform-origin: center center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  transition: opacity 400ms ease, filter 400ms ease;
  background: transparent;
  border: none;
  padding: 0;
  will-change: transform;
}
```

Delete the `blob-drift-in` keyframes (lines 190-193) and the `float-blob` keyframes (lines 233-236) entirely — JS now owns entrance and drift.

Because the blob label sits below the 88px box and we no longer center via `translate(-50%,-50%)`, no other change is needed: `(x, y)` is the box's top-left corner.

In the reduced-motion block (lines 430-443), the rule currently force-sets `transform: translate(-50%, -50%) !important` on `.blob`, which would override JS placement. Replace the whole block with:

```css
@media (prefers-reduced-motion: reduce) {
  .splash-envelope,
  .blob-shape,
  .star {
    animation: none !important;
  }
  .modal-card, .finale-card { animation-duration: 200ms; }
  .confetti-piece { display: none; }
}
```

(Note: `.blob` is removed from the `animation: none` list because it no longer has a CSS animation, and the `transform` override is gone so JS can place blobs.)

- [ ] **Step 3: Simplify `renderBlobs` and add the `motion` controller**

In `app.js`, in `renderBlobs` (lines 262-278), remove the now-unused float CSS vars. Replace the `forEach` body so the per-blob setup reads:

```js
    BLOBS.forEach(function (blob, i) {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "blob";
      el.dataset.id = blob.id;
      el.dataset.index = String(i);
      el.style.setProperty("--blob-glow", blob.glow);
      el.style.setProperty("--pulse-delay", (i * 0.27) + "s");
      el.setAttribute("aria-label", blob.label);
      el.innerHTML =
        '<div class="blob-shape">' + buildBlobSvg(blob) + '</div>' +
        '<div class="blob-label">' + blob.label + '</div>';
      stage.appendChild(el);
    });
```

(Removed: `el.style.left/top`, `--float-duration`, `--float-delay`. Added: `data-index` so the engine can map an element back to its `BLOBS` entry.)

Add the `motion` controller. Place it just above `// ---------- Renderer ----------` (before `buildBlobSvg`, around line 240). This task fills in only `init`; later tasks extend it:

```js
  // ---------- Motion engine ----------
  // Owns every blob's on-screen position via transform. Pure math lives in
  // PookieMotion (motion.js); this object owns DOM + the rAF loop.
  const motion = (function () {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stage = null;
    let states = [];          // one runtime state per blob element
    const byId = {};

    function stageDims() {
      const r = stage.getBoundingClientRect();
      return { w: r.width, h: r.height };
    }

    // Top-left px for a blob's hand-tuned percentage position (loose layout).
    function staticPos(blob, el, d) {
      const px = parseFloat(blob.position.left) / 100 * d.w;
      const py = parseFloat(blob.position.top) / 100 * d.h;
      return { x: px - el.offsetWidth / 2, y: py - el.offsetHeight / 2 };
    }

    function writeTransform(s) {
      s.el.style.transform =
        "translate3d(" + s.x.toFixed(2) + "px," + s.y.toFixed(2) + "px,0) scale(" +
        s.scale.toFixed(3) + ")";
    }

    // Build per-blob state and place each blob. In this task everything is
    // placed statically; later tasks introduce falling/wandering/docking.
    function init() {
      stage = document.getElementById("blob-stage");
      if (!stage) return;
      const d = stageDims();
      states = [];
      const els = stage.querySelectorAll(".blob");
      els.forEach(function (el) {
        const i = parseInt(el.dataset.index, 10);
        const blob = BLOBS[i];
        const p = staticPos(blob, el, d);
        const s = {
          id: blob.id, el: el, index: i,
          x: p.x, y: p.y, vx: 0, vy: 0,
          scale: 1, phase: "static", seed: i * 1.7 + 0.5, slot: -1
        };
        states.push(s);
        byId[blob.id] = s;
        writeTransform(s);
      });
    }

    return {
      reduced: reduced,
      init: init,
      _states: function () { return states; },   // exposed for later tasks
      _byId: function () { return byId; },
      _stageDims: stageDims,
      _writeTransform: writeTransform
    };
  })();
```

- [ ] **Step 4: Wire `motion.init` into startup**

In `app.js` `init()` (lines 311-314), after `renderBlobs()` and before/replacing the `restoreState()` call, the order must be: render elements, then init motion, then restore. Change:

```js
  function init() {
    renderBlobs();
    restoreState();
    renderStars();
```

to:

```js
  function init() {
    renderBlobs();
    motion.init();
    restoreState();
    renderStars();
```

In `restoreState` (lines 281-289), stop re-adding `is-opened` via a second DOM query path is fine, but it must not fight motion. For this task leave `restoreState` as-is (it only toggles classes + counter); motion already placed every blob statically. (Task 5 moves opened blobs to docked slots.)

- [ ] **Step 5: Verify in browser**

Open `file:///Users/christeljansenvanrensburg/Documents/pookie/index.html` (or Playwright `browser_navigate`). In the console run `localStorage.clear()` and reload. Click **Open me**.
Expected: all 10 blobs appear at their familiar spread, fully visible, no drift (static is correct for now), glow still pulsing. No console errors. Clicking a blob still opens its modal; dismissing still works; opening all 10 still triggers the finale after the last dismiss.

- [ ] **Step 6: Checkpoint**

Confirm static placement + existing interactions work. Hand off to the user to commit `index.html`, `styles.css`, `app.js`.

---

### Task 3: Drop-in entrance + organic wander loop

Add the `requestAnimationFrame` engine: blobs fall from above the top edge with a damped bounce (staggered), then wander organically with a subtle wobble. Reduced-motion keeps static placement.

**Files:**
- Modify: `app.js` — extend the `motion` controller (add constants, falling/wandering steppers, the rAF loop, `start()`), and call `motion.start()` from `openPlayground`
- Modify: `styles.css` — add a landing squash animation on `.blob-shape`

**Interfaces:**
- Consumes: `PookieMotion.wanderVelocity`, `PookieMotion.softReflect`, `PookieMotion.clamp`; the state objects from Task 2.
- Produces: `motion.start()` — begins the rAF loop, transitioning every non-docked blob into a `falling` entrance. No-op under reduced motion (blobs stay at their static Task-2 positions). Adds `motion.stop()` (cancel loop).

- [ ] **Step 1: Add engine constants and bounds inside the `motion` IIFE**

Inside `motion`, just below `let states = []; const byId = {};`, add:

```js
    let rafId = null;
    let lastT = 0;
    let running = false;

    const MARGIN = 24;        // px gap from stage edges for loose blobs
    const ROW_TOP = 20;       // px: top-left y of the docking row
    const ROW_BAND = 96;      // px: vertical space reserved for the row
    const GRAVITY = 1600;     // px/s^2
    const RESTITUTION = 0.45; // bounce energy retained
    const SETTLE_V = 80;      // px/s: below this on landing, stop bouncing

    function bounds(d, blobW, blobH) {
      return {
        minX: MARGIN,
        maxX: d.w - blobW - MARGIN,
        minY: ROW_TOP + ROW_BAND,
        maxY: d.h - blobH - MARGIN
      };
    }
```

- [ ] **Step 2: Add the falling and wandering steppers + loop**

Inside `motion`, add these functions (above the returned object):

```js
    function squash(s) {
      const shape = s.el.querySelector(".blob-shape");
      if (!shape) return;
      shape.classList.remove("is-landing");
      // reflow so re-adding the class restarts the animation
      void shape.offsetWidth;
      shape.classList.add("is-landing");
    }

    function stepFalling(s, dt, b, now) {
      s.elapsed += dt;
      if (s.elapsed < s.delay) return;        // still waiting to drop
      s.vy += GRAVITY * dt;
      s.y += s.vy * dt;
      s.x += s.vx * dt;
      const rx = PookieMotion.softReflect(s.x, s.vx, b.minX, b.maxX, 0.6);
      s.x = rx.pos; s.vx = rx.vel;
      if (s.y >= s.groundY) {
        if (s.vy > SETTLE_V) {
          s.y = s.groundY;
          s.vy = -s.vy * RESTITUTION;
          squash(s);
        } else {
          s.y = s.groundY;
          s.vy = 0;
          s.phase = "wandering";
          s.wanderT = now;                    // anchor wander time
        }
      }
      s.scale = 1;
    }

    function stepWandering(s, dt, b, now) {
      const wv = PookieMotion.wanderVelocity(now, s.seed, { amp: 18 });
      s.x = PookieMotion.clamp(s.x + wv.vx * dt, b.minX, b.maxX);
      s.y = PookieMotion.clamp(s.y + wv.vy * dt, b.minY, b.maxY);
      s.scale = 1 + 0.045 * Math.sin(now * 1.7 + s.seed);   // gentle wobble
    }

    function frame(ts) {
      if (!running) return;
      if (lastT === 0) lastT = ts;
      const dt = Math.min((ts - lastT) / 1000, 0.05);   // clamp big gaps
      lastT = ts;
      const now = ts / 1000;
      const d = stageDims();
      for (let k = 0; k < states.length; k++) {
        const s = states[k];
        if (s.phase !== "falling" && s.phase !== "wandering") continue;
        const b = bounds(d, s.el.offsetWidth, s.el.offsetHeight);
        if (s.phase === "falling") stepFalling(s, dt, b, now);
        else stepWandering(s, dt, b, now);
        writeTransform(s);
      }
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (reduced || running) return;          // reduced motion: stay static
      const d = stageDims();
      states.forEach(function (s) {
        if (s.phase === "docked" || s.phase === "docking") return;
        const blobW = s.el.offsetWidth, blobH = s.el.offsetHeight;
        const b = bounds(d, blobW, blobH);
        s.phase = "falling";
        s.elapsed = 0;
        s.delay = s.index * 0.1;               // stagger the drops
        s.x = PookieMotion.clamp(b.minX + Math.abs(Math.sin(s.seed * 12.9)) * (b.maxX - b.minX), b.minX, b.maxX);
        s.y = -blobH - 40 - (s.index % 3) * 30; // start above the top edge
        s.vx = (Math.sin(s.seed * 7.1)) * 30;   // slight horizontal drift
        s.vy = 0;
        s.groundY = b.minY + 0.25 * (b.maxY - b.minY) +
                    Math.abs(Math.cos(s.seed * 5.3)) * 0.6 * (b.maxY - b.minY);
        s.scale = 1;
        writeTransform(s);
      });
      running = true;
      lastT = 0;
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }
```

Note: randomness is derived deterministically from each blob's `seed` (via `sin`/`cos`) rather than `Math.random()`, so entrances are varied but reproducible — and it keeps the engine free of `Math.random()`.

Then add `start: start,` and `stop: stop,` to the returned object.

- [ ] **Step 3: Trigger the engine when the playground opens**

In `app.js` `openPlayground` (lines 362-369), after revealing the playground, start the engine:

```js
  function openPlayground() {
    document.body.classList.remove("state-splash");
    document.body.classList.add("state-playground");
    const splash = document.querySelector(".splash");
    const playground = document.querySelector(".playground");
    if (splash) splash.style.display = "none";
    if (playground) playground.hidden = false;
    motion.start();
  }
```

- [ ] **Step 4: Add the landing squash animation**

In `styles.css`, after the `pulse-glow` keyframes (around line 240), add:

```css
/* Squishy bounce on landing (JS toggles .is-landing) */
.blob-shape.is-landing { animation: blob-land 280ms ease-out; }
@keyframes blob-land {
  0%   { transform: scaleY(1) scaleX(1); }
  35%  { transform: scaleY(0.78) scaleX(1.16); }
  70%  { transform: scaleY(1.06) scaleX(0.96); }
  100% { transform: scaleY(1) scaleX(1); }
}
```

This animates `.blob-shape` (transform), independent of the `.blob` translate the engine writes and of the `pulse-glow` filter — no conflict. Under reduced motion `.blob-shape` animations are already disabled by the Task-2 block.

- [ ] **Step 5: Verify in browser**

`localStorage.clear()`, reload, click **Open me**.
Expected: blobs drop from above the top edge in a quick stagger, give a squishy bounce on landing, then settle into slow organic wandering with a faint wobble. Motion stays within the viewport (nothing escapes left/right/bottom; nothing rises into the top ~115px row band). No console errors.
Then emulate reduced motion (Playwright `browser_evaluate` can't set the media feature; use the browser devtools "Emulate prefers-reduced-motion" or load with the OS setting on): blobs appear static at their spread, no drop, no drift.

- [ ] **Step 6: Checkpoint**

Confirm drop+wander feels right and reduced-motion stays static. Hand off to the user to commit `app.js`, `styles.css`.

---

### Task 4: Dock opened blobs into the top row on dismiss

When an opened blob's modal is dismissed, that blob leaves the sim and flies to its top-row slot, keeping the opened (dimmed) look. While a modal is open, wandering pauses so reading is calm.

**Files:**
- Modify: `app.js` — extend `motion` (`pause`, `resume`, `dock`, slot assignment); call `motion.pause()` in `openBlob`, and `motion.dock(...)` + `motion.resume()` in `closeModal`
- Modify: `styles.css` — `.blob.is-docked` + fly-to-slot transition

**Interfaces:**
- Consumes: `PookieMotion.computeRowLayout`; state objects; the existing `opened` Set and `is-active` blob marking.
- Produces:
  - `motion.pause()` / `motion.resume()` — stop/restart the rAF loop (falling+wandering hold while paused).
  - `motion.dock(id)` — assign the next free left→right slot to blob `id`, animate it there via CSS transition, mark it `docked`. No-op if already docking/docked. Under reduced motion, snaps instantly (no transition).
  - `motion.dockedCount()` — number of docked blobs (used for slot assignment + restore).

- [ ] **Step 1: Add docking + pause/resume to the `motion` controller**

Inside `motion`, add a docked counter near the other `let`s:

```js
    let dockedCount = 0;
```

Add these functions (above the returned object):

```js
    // Center x for slot `i` and the row's shared scale, at current stage size.
    function slotLayout() {
      const d = stageDims();
      const sample = states[0] ? states[0].el : null;
      const blobW = sample ? sample.offsetWidth : 88;
      return {
        layout: PookieMotion.computeRowLayout(d.w, states.length, blobW, { margin: 20 }),
        blobW: blobW
      };
    }

    function placeDocked(s) {
      const sl = slotLayout();
      const cx = sl.layout.centers[s.slot];
      const scale = sl.layout.scale;
      s.x = cx - sl.blobW / 2;
      s.y = ROW_TOP;
      s.scale = scale;
      writeTransform(s);
    }

    function dock(id) {
      const s = byId[id];
      if (!s || s.phase === "docking" || s.phase === "docked") return;
      s.slot = dockedCount;
      dockedCount += 1;
      s.phase = reduced ? "docked" : "docking";
      s.el.classList.add("is-docked");
      if (reduced) { placeDocked(s); return; }
      // Enable the CSS transition for the flight, then move.
      s.el.classList.add("is-flying");
      placeDocked(s);
      const onEnd = function () {
        s.el.removeEventListener("transitionend", onEnd);
        s.el.classList.remove("is-flying");
        s.phase = "docked";
      };
      s.el.addEventListener("transitionend", onEnd);
      // Fallback in case transitionend doesn't fire.
      setTimeout(onEnd, 800);
    }

    function pause() {
      if (reduced || !running) return;
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    function resume() {
      if (reduced || running) return;
      running = true;
      lastT = 0;
      rafId = requestAnimationFrame(frame);
    }
```

Add to the returned object: `pause: pause, resume: resume, dock: dock, dockedCount: function () { return dockedCount; }, _placeDocked: placeDocked`.

Note: `dock` writes the final transform immediately; the CSS `transition` on `.blob.is-flying` animates the change. Because the engine loop skips `docking`/`docked` phases, it won't overwrite the docked transform.

- [ ] **Step 2: Add docked + flying CSS**

In `styles.css`, after the `.blob.is-opened` rules (around line 231), add:

```css
/* Docked blobs: parked in the top row, keep the opened (dimmed) look. */
.blob.is-docked { cursor: pointer; z-index: 2; }
.blob.is-flying { transition: transform 600ms cubic-bezier(0.34, 1.2, 0.4, 1); }
```

The slight overshoot in the easing gives the dock a pleasant little arrival pop. (The base `.blob` rule transitions only `opacity`/`filter`, so `transform` is not animated during wandering — only while `.is-flying` is present.)

- [ ] **Step 3: Pause on modal open**

In `app.js` `openBlob` (lines 155-175), after `document.body.classList.add("modal-open");`, add:

```js
    motion.pause();
```

- [ ] **Step 4: Dock + resume on dismiss**

In `app.js` `closeModal` (lines 177-191), capture the active blob before clearing it, dock it if it has been opened, then resume. Replace the body of `closeModal` (keeping the `pendingFinale` logic from the earlier bugfix) with:

```js
  function closeModal() {
    document.body.classList.remove("modal-open");
    const active = document.querySelector(".blob.is-active");
    const activeId = active ? active.dataset.id : null;
    document.querySelectorAll(".blob.is-active").forEach(function (el) {
      el.classList.remove("is-active");
    });
    document.getElementById("modal-backdrop").hidden = true;

    // The dismissed blob (if its letter has been opened) flies up to the row.
    if (activeId && opened.has(activeId)) motion.dock(activeId);
    // Loose blobs resume drifting.
    motion.resume();

    // Only now that the last blob is dismissed do we reveal the finale.
    if (pendingFinale) {
      pendingFinale = false;
      setTimeout(maybeTriggerFinale, 400);
    }
  }
```

Note ordering vs the finale: when the 10th blob is dismissed it docks AND `pendingFinale` fires after 400ms — the dock flight (600ms) overlaps the finale appearing, which is fine (finale is a full-screen overlay). `showFinale` calls `closeModal` again, but by then there is no `.is-active` blob and `motion.resume()` is a safe no-op if already running.

- [ ] **Step 5: Verify in browser**

`localStorage.clear()`, reload, **Open me**. Open a blob → confirm wandering pauses behind the modal. Dismiss → the blob flies up to the leftmost slot and parks (dimmed); the rest resume drifting. Open several more → they fill the row left→right in the order opened. Open all 10 → after dismissing the last, the finale appears and the row shows all 10 centered and evenly spaced. On a narrow window the row shrinks to fit without overlapping the edges.

- [ ] **Step 6: Checkpoint**

Confirm docking, pause/resume, and finale interplay. Hand off to the user to commit `app.js`, `styles.css`.

---

### Task 5: Restore pre-docked blobs + handle resize

Returning visitors should see already-opened blobs parked in the row (in stored order), with only the unopened ones dropping in. And the row/bounds must follow window resizes.

**Files:**
- Modify: `app.js` — extend `motion` with a pre-dock path used at init + a `relayout` handler; update `restoreState`; add a `resize` listener in `init`

**Interfaces:**
- Consumes: `loadOpened()` (ordered array of opened ids = click order); the `dock`/`placeDocked` internals.
- Produces:
  - `motion.predock(orderedOpenedIds)` — marks those blobs `docked` in slot order (no flight animation) and sets `dockedCount`. Called from `restoreState` before the loop runs.
  - `motion.relayout()` — recompute docked-slot positions and re-clamp loose blobs after a stage resize.

- [ ] **Step 1: Add `predock` and `relayout` to `motion`**

Inside `motion`, add:

```js
    // Place already-opened blobs (from storage) straight into the row, in
    // their stored order, with no flight animation.
    function predock(orderedOpenedIds) {
      orderedOpenedIds.forEach(function (id) {
        const s = byId[id];
        if (!s || s.phase === "docked") return;
        s.slot = dockedCount;
        dockedCount += 1;
        s.phase = "docked";
        s.el.classList.add("is-docked");
        placeDocked(s);
      });
    }

    // Recompute positions after a resize: re-place docked blobs into their
    // (possibly re-scaled) slots, and re-clamp loose blobs into new bounds.
    function relayout() {
      if (!stage) return;
      const d = stageDims();
      states.forEach(function (s) {
        if (s.phase === "docked") {
          placeDocked(s);
        } else if (s.phase === "static") {
          const blob = BLOBS[s.index];
          const p = staticPos(blob, s.el, d);
          s.x = p.x; s.y = p.y;
          writeTransform(s);
        } else if (s.phase === "wandering" || s.phase === "falling") {
          const b = bounds(d, s.el.offsetWidth, s.el.offsetHeight);
          s.x = PookieMotion.clamp(s.x, b.minX, b.maxX);
          s.y = PookieMotion.clamp(s.y, b.minY, b.maxY);
          writeTransform(s);
        }
      });
    }
```

Add `predock: predock, relayout: relayout` to the returned object.

- [ ] **Step 2: Use `predock` from `restoreState`**

In `app.js` `restoreState` (lines 281-289), the opened blobs should be parked, not just dimmed. Replace it with:

```js
  function restoreState() {
    const stored = loadOpened();
    stored.forEach(function (id) {
      opened.add(id);
      const el = document.querySelector('.blob[data-id="' + id + '"]');
      if (el) el.classList.add("is-opened");
    });
    motion.predock(stored);   // park opened blobs in the row, in click order
    updateCounter();
  }
```

(Note: `motion.init` in Task 2 already ran before `restoreState` in `init()`, so every blob has a state object by now. Pre-docked blobs are marked `docked`, so when `motion.start()` runs on **Open me**, its `start()` loop skips them — only unopened blobs fall.)

- [ ] **Step 3: Relayout on resize**

In `app.js` `init()`, alongside the other listeners (after the reset-button block, before the `console.log`), add a debounced resize handler:

```js
    let resizeRaf = null;
    window.addEventListener("resize", function () {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(function () { motion.relayout(); });
    });
```

- [ ] **Step 4: Verify in browser**

Open all (or some) blobs, then reload the page (do NOT clear storage).
Expected: the previously opened blobs appear already parked in the top row in the same order, dimmed; the remaining blobs drop in and wander. The counter shows the right count. Resize the window narrower/wider: docked blobs re-center and re-scale to stay in a tidy row within the viewport; loose blobs stay inside the bounds. Clearing storage + reload returns to a full fresh drop-in.

- [ ] **Step 5: Checkpoint**

Confirm restore + resize. Hand off to the user to commit `app.js`.

---

### Task 6: Full verification pass

No new code — confirm the whole experience end-to-end against the spec's scenarios and the preserved bug-fix.

**Files:** none (verification only).

- [ ] **Step 1: Run the unit tests**

Run: `node --test`
Expected: PASS.

- [ ] **Step 2: Walk the scenario matrix in the browser**

Against `file:///Users/christeljansenvanrensburg/Documents/pookie/index.html`, with `localStorage.clear()` between fresh runs:

1. Fresh load → **Open me** → staggered drop-in with bounce, then organic wander. ✅
2. Open a blob → background motion pauses while reading; dismiss → blob flies to the leftmost slot; others resume. ✅
3. Open several → they fill the top row left→right in click order. ✅
4. Open all 10 → after dismissing the **last** one, the finale appears (it must NOT appear before the last blob's modal is dismissed); row shows 10 centered, evenly spaced. ✅
5. Reload mid-progress (no clear) → opened blobs pre-docked in order; remaining drop in. ✅
6. Resize the window → bounds + docked slots adjust; nothing escapes the viewport. ✅
7. `prefers-reduced-motion` on → no drift/drop; opening a blob and dismissing snaps it to its slot; finale-after-last-dismiss still holds; everything reachable. ✅

- [ ] **Step 3: Regression check on the earlier bug fix**

Specifically re-confirm scenario 4's timing: with 9 blobs already opened, open the 10th — the finale must stay hidden until you close the 10th blob's modal (× button, backdrop click, AND Esc all tested). This is the fix from the first change; the docking work must not have reintroduced the early pop-up.

- [ ] **Step 4: Checkpoint**

All scenarios pass. Hand off to the user for the final commit.
