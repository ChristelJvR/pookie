# Pookie Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page, vanilla HTML/CSS/JS love-letter website for Nicole — discovery playground with 10 glowing blob characters on a midnight background, opening to reveal personalised notes, with a finale when all are found. Deploy to GitHub Pages.

**Architecture:** Three files (`index.html`, `styles.css`, `app.js`). One HTML page, four visual states toggled via classes on `<body>`. Blob data lives in a single array in JS; rendering is pure DOM. State persists to `localStorage`. No build step. No npm. No framework.

**Tech Stack:** HTML5, CSS3 (custom properties + keyframes), vanilla JS (ES2020+), Google Fonts (Fraunces + Nunito), GitHub Pages for hosting.

**Note on git:** The user (Christel) handles all commits and pushes themselves. **Skip every "Commit" step in this plan** — do not run `git add`, `git commit`, or `git push`. Just complete the file changes; the user will commit when they choose to.

---

## File structure

```
pookie/
├── index.html         # markup for splash, playground, blob modal, finale
├── styles.css         # palette, typography, animations, responsive layout
├── app.js             # blob data, rendering, interactions, persistence
├── README.md          # short repo description for GitHub
├── .gitignore         # exists already
└── docs/
    └── superpowers/
        ├── specs/2026-05-09-pookie-website-design.md
        └── plans/2026-05-09-pookie-website.md   (this file)
```

**Why this split:**
- `index.html` is small and mostly empty containers — the playground is dynamically populated.
- `styles.css` holds everything visual (palette, typography, layout, animations).
- `app.js` holds data + behavior. The blob array is the single source of truth.

No file should exceed ~400 lines. If `app.js` grows past that, split blob data into `blobs.js` (loaded via `<script>` tag before `app.js`).

---

## Task 1: Project skeleton + base styles

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `app.js`
- Modify: `README.md`

- [ ] **Step 1: Create `index.html` with full skeleton and font links**

```html
<!DOCTYPE html>
<html lang="af">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#1A1B3A" />
  <title>Vir my pookiedooks</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css" />
</head>
<body class="state-splash">
  <!-- Background layers -->
  <div class="bg-stars" aria-hidden="true"></div>
  <div class="bg-orbs" aria-hidden="true"></div>

  <!-- Splash screen -->
  <section class="splash" aria-label="Splash screen">
    <div class="splash-envelope" aria-hidden="true">💌</div>
    <h1 class="splash-title">Vir my pookiedooks</h1>
    <button class="splash-button" type="button" id="open-button">Open me <span aria-hidden="true">💛</span></button>
  </section>

  <!-- Playground -->
  <main class="playground" aria-label="Playground" hidden>
    <div class="counter" id="counter" role="status" aria-live="polite">
      <span id="counter-found">0</span> / <span id="counter-total">10</span> gevind
    </div>
    <div class="blob-stage" id="blob-stage"></div>
  </main>

  <!-- Blob modal -->
  <div class="modal-backdrop" id="modal-backdrop" hidden>
    <article class="modal-card" id="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button class="modal-close" id="modal-close" aria-label="Close">×</button>
      <h2 class="modal-title" id="modal-title"></h2>
      <div class="modal-body" id="modal-body"></div>
    </article>
  </div>

  <!-- Finale -->
  <div class="finale-backdrop" id="finale-backdrop" hidden>
    <article class="finale-card" id="finale-card">
      <button class="modal-close" id="finale-close" aria-label="Close">×</button>
      <div class="finale-confetti" id="finale-confetti" aria-hidden="true"></div>
      <h2 class="finale-title">Pookiedooks</h2>
      <div class="finale-body" id="finale-body"></div>
    </article>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `styles.css` with reset, custom properties, base typography**

```css
/* ---------- Reset ---------- */
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  min-height: 100dvh;
  font-family: var(--font-body);
  color: var(--cream);
  background: var(--bg-deep);
  overflow: hidden;
}
button { font: inherit; cursor: pointer; }
h1, h2, h3 { margin: 0; }

/* ---------- Tokens ---------- */
:root {
  /* Palette */
  --bg-deep: #1A1B3A;
  --bg-mid: #3D2B5F;
  --cream: #FFF1D4;
  --cream-dim: rgba(255, 241, 212, 0.7);

  --c-coral:    #FF7E6B;
  --c-marigold: #FFB347;
  --c-mint:     #6BCBB8;
  --c-pink:     #FF8FA6;
  --c-sky:      #7FB8E8;
  --c-sun:      #FFD93D;
  --c-libby:    #1F1F2A; /* near-black with white patch added in SVG */
  --c-nala:     #E8B85C;

  /* Typography */
  --font-heading: "Fraunces", Georgia, serif;
  --font-body: "Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  /* Spacing & radius */
  --radius-card: 18px;
  --radius-pill: 999px;
}

/* ---------- Background ---------- */
body {
  background:
    radial-gradient(ellipse at 50% -10%, var(--bg-mid) 0%, var(--bg-deep) 60%);
}

.bg-stars, .bg-orbs {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
}
.bg-orbs::before, .bg-orbs::after {
  content: ""; position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.35;
}
.bg-orbs::before {
  width: 420px; height: 420px;
  background: radial-gradient(circle, rgba(168, 130, 232, 0.6), transparent 70%);
  top: -120px; left: -120px;
}
.bg-orbs::after {
  width: 480px; height: 480px;
  background: radial-gradient(circle, rgba(255, 126, 107, 0.45), transparent 70%);
  bottom: -160px; right: -140px;
}

/* Stars are injected as inline divs by JS in Task 7; placeholder rule */
.star {
  position: absolute;
  width: 2px; height: 2px;
  background: white; border-radius: 50%;
  opacity: 0.6;
  animation: twinkle 3s ease-in-out infinite;
}
@keyframes twinkle {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.85; }
}

/* ---------- Layout containers ---------- */
.splash, .playground, .modal-backdrop, .finale-backdrop {
  position: relative; z-index: 1;
}
```

- [ ] **Step 3: Create `app.js` with module-level guard and DOM-ready bootstrap**

```js
(function () {
  "use strict";

  // App entry. Each subsequent task wires more functionality in here.
  function init() {
    console.log("pookie: ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
```

- [ ] **Step 4: Replace `README.md` content**

```markdown
# pookie

A little website for my wife.

Built with vanilla HTML/CSS/JS. Open `index.html` in a browser.
```

- [ ] **Step 5: Verify the page loads with no errors**

Open `index.html` in a browser (double-click or `open index.html` on macOS).

Expected:
- Page loads. Background is deep midnight with a subtle radial highlight at top.
- Splash section is visible: 💌 envelope, "Vir my pookiedooks" heading, "Open me 💛" button.
- Devtools console shows `pookie: ready` and no errors.
- Fonts (Fraunces serif heading, Nunito body) load — confirm by inspecting the heading and seeing it's not the default browser serif.

- [ ] **Step 6: Commit (skip — user handles)**

---

## Task 2: Splash screen styling

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add splash styles below the existing layout containers rule**

```css
/* ---------- Splash ---------- */
.splash {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 100dvh;
  text-align: center;
  padding: 24px;
  gap: 28px;
  animation: fade-in 600ms ease-out;
}
.splash-envelope {
  font-size: clamp(64px, 12vw, 96px);
  filter: drop-shadow(0 0 24px rgba(255, 217, 61, 0.5)) drop-shadow(0 0 60px rgba(255, 126, 107, 0.4));
  animation: float-soft 4s ease-in-out infinite;
}
.splash-title {
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: clamp(32px, 6vw, 48px);
  color: var(--cream);
  letter-spacing: -0.01em;
}
.splash-button {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 18px;
  color: var(--bg-deep);
  background: var(--cream);
  border: none;
  padding: 14px 32px;
  border-radius: var(--radius-pill);
  box-shadow: 0 0 0 0 rgba(255, 241, 212, 0.6);
  transition: transform 200ms ease, box-shadow 400ms ease;
}
.splash-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 0 8px rgba(255, 241, 212, 0.15);
}
.splash-button:active { transform: translateY(0); }

@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes float-soft {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* State machine — only one screen visible at a time */
body.state-splash .playground { display: none; }
body.state-playground .splash { display: none; }
body.state-playground .playground { display: block; }
```

- [ ] **Step 2: Verify the splash looks right**

Reload `index.html`.

Expected:
- Envelope gently floats up and down (4s loop).
- "Vir my pookiedooks" heading is in the warm Fraunces serif.
- Button is a cream pill with deep navy text. Hovering shows a soft glow ring.
- Layout is vertically centered. Try resizing the window — it stays centered, font sizes scale.

- [ ] **Step 3: Commit (skip — user handles)**

---

## Task 3: Blob data + SVG icons

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add the 10-blob array and helper functions above `init`**

Replace the IIFE body so it looks like this. (Position values use percentages of the playground area; finale positions are added in Task 8.)

```js
(function () {
  "use strict";

  // ---------- Data ----------
  // Position values are percentages of the playground container (left, top).
  // They're hand-tuned so blobs don't overlap on common viewport sizes.
  const BLOBS = [
    {
      id: "wedding",
      label: "22 April",
      color: "#FFB347", glow: "#FFB347",
      icon: "ring",
      copy:
        "Twee-en-twintig April. 'n Stil tekening by home affairs, geen blomme, geen toespraak. Maar dis amptelik — jy is my vrou. Ek het nog nie heeltemal gewoond geraak aan daardie woord nie.\n\n*My vrou.*",
      position: { left: "18%", top: "28%" }
    },
    {
      id: "move",
      label: "die move",
      color: "#FF7E6B", glow: "#FF7E6B",
      icon: "suitcase",
      copy:
        "Ek staan in die kombuis en kyk hoe jy 'n nuwe lys afmerk. Polisie clearance, kwalifikasies, die huis se huur, die meubels — jy doen dit alles, en jy kla nie eens nie.\n\nBangkok het g'n idee wat aankom nie.",
      position: { left: "62%", top: "20%" }
    },
    {
      id: "libby",
      label: "Libby",
      color: "#1F1F2A", glow: "#7FB8E8",
      icon: "libby",
      copy: "My swartbessie. Ouma gaan jou só bederf.",
      position: { left: "78%", top: "44%" }
    },
    {
      id: "nala",
      label: "Nala",
      color: "#E8B85C", glow: "#FFD93D",
      icon: "nala",
      copy: "Goue Nala. Jy weet nog nie, maar jy gaan baie cuddles by ouma kry.",
      position: { left: "85%", top: "68%" }
    },
    {
      id: "therapy",
      label: "die werk",
      color: "#6BCBB8", glow: "#6BCBB8",
      icon: "seedling",
      copy:
        "Jy doen die werk wat die meeste mense nooit doen nie. Jy gaan terug, jy vra die moeilike vrae, jy probeer verstaan hoekom jy is wat jy is.\n\nEk sien jou. Ek's so trots op jou.",
      position: { left: "8%", top: "58%" }
    },
    {
      id: "nine-pm",
      label: "8:57",
      color: "#7FB8E8", glow: "#B8A1E8",
      icon: "moon",
      copy: "Dis 8:57. Almal — honde ingesluit — weet wat nou gebeur.",
      position: { left: "44%", top: "52%" }
    },
    {
      id: "calendar",
      label: "vandag se datum",
      color: "#FF7E6B", glow: "#FF7E6B",
      icon: "calendar",
      copy: "...het jy al vandag se datum afgemerk? 👀",
      position: { left: "30%", top: "76%" }
    },
    {
      id: "empty-house",
      label: "die leë huis",
      color: "#FF8FA6", glow: "#FF8FA6",
      icon: "tag",
      copy: "Update: nog 'n stoel verkoop. Ons sit binnekort op die vloer en eet pizza. Jy is besig om Marie Kondo se werk in 'n week te doen.",
      position: { left: "70%", top: "82%" }
    },
    {
      id: "gr3-smile",
      label: "die kleintjies",
      color: "#FFD93D", glow: "#FFD93D",
      icon: "sun",
      copy:
        "Geen meer 'n streng gesig nie. Geen meer 'wys hulle wie's baas op dag een' nie.\n\nJy mag glimlag op werk. Daai gr3s gaan jou aanbid.",
      position: { left: "12%", top: "12%" }
    },
    {
      id: "bangkok",
      label: "Bangkok",
      color: "#7FB8E8", glow: "#7FB8E8",
      icon: "plane",
      copy:
        "Ons mini-honeymoon kom nog. Jy en ek, êrens warm, geen to-do lyste, geen koffers nie.\n\nNet ons twee, en die begin van iets nuuts.",
      position: { left: "52%", top: "8%" }
    }
  ];

  const FINALE_COPY =
    "Pookiedooks,\n\n" +
    "Twee weke gelede het ek my naam langs joune geskryf en gesê *vir altyd*. Drie maande van nou af verhuis ons na 'n nuwe land. Ons groet binnekort vir Libby en Nala. En tussen al hierdie groot dinge — die move, die troue, die werk, die therapy — is jy steeds die een wat alles bymekaar hou.\n\n" +
    "Jy kla nie. Jy doen net. Jy maak my lag wanneer ek vergeet om te lag. Jy weet wanneer dit 8:57 is sonder om te kyk.\n\n" +
    "Ek's so dankbaar dat jy myne is. Ek's so trots op die mens wat jy is en wie jy elke dag word. En ek kan nie wag om Bangkok saam met jou te ontdek nie.\n\n" +
    "Lief jou. Altyd.";

  // ---------- SVG icons ----------
  // Each icon is a small inline SVG pasted inside the blob. Returns a string.
  function icon(name) {
    const icons = {
      ring:     '<circle cx="0" cy="2" r="6" fill="none" stroke="#1A1B3A" stroke-width="2.5"/><path d="M-3 -5 L0 -2 L3 -5" stroke="#1A1B3A" stroke-width="2" fill="#FFD93D"/>',
      suitcase: '<rect x="-7" y="-3" width="14" height="10" rx="1.5" fill="none" stroke="#1A1B3A" stroke-width="2"/><rect x="-3" y="-6" width="6" height="3" fill="none" stroke="#1A1B3A" stroke-width="2"/>',
      libby:    '<ellipse cx="0" cy="3" rx="6" ry="4" fill="#FFFFFF"/>', // white chest patch
      nala:     '<ellipse cx="-6" cy="-2" rx="3" ry="5" fill="#C99745"/><ellipse cx="6" cy="-2" rx="3" ry="5" fill="#C99745"/>', // floppy ears
      seedling: '<path d="M0 6 L0 -2 M-4 0 Q-4 -4 0 -3 M4 0 Q4 -4 0 -3" stroke="#1A1B3A" stroke-width="2" fill="none" stroke-linecap="round"/>',
      moon:     '<path d="M3 -5 A8 8 0 1 0 3 5 A6 6 0 1 1 3 -5 Z" fill="#1A1B3A"/>',
      calendar: '<rect x="-7" y="-6" width="14" height="13" rx="1.5" fill="none" stroke="#1A1B3A" stroke-width="2"/><line x1="-7" y1="-2" x2="7" y2="-2" stroke="#1A1B3A" stroke-width="2"/><path d="M-3 2 L3 6 M3 2 L-3 6" stroke="#FF7E6B" stroke-width="2.5" stroke-linecap="round"/>',
      tag:      '<path d="M-7 -7 L0 -7 L7 0 L0 7 L-7 7 Z" fill="none" stroke="#1A1B3A" stroke-width="2"/><circle cx="-4" cy="-4" r="1.5" fill="#1A1B3A"/>',
      sun:      '<circle cx="0" cy="0" r="4" fill="#1A1B3A"/><g stroke="#1A1B3A" stroke-width="2" stroke-linecap="round"><line x1="0" y1="-7" x2="0" y2="-9"/><line x1="0" y1="7" x2="0" y2="9"/><line x1="-7" y1="0" x2="-9" y2="0"/><line x1="7" y1="0" x2="9" y2="0"/><line x1="-5" y1="-5" x2="-7" y2="-7"/><line x1="5" y1="-5" x2="7" y2="-7"/></g>',
      plane:    '<path d="M-8 0 L8 0 M0 -4 L0 4 M5 -2 L8 0 L5 2" fill="none" stroke="#1A1B3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    };
    return icons[name] || "";
  }

  // ---------- Init ----------
  function init() {
    console.log("pookie: ready", { blobs: BLOBS.length });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
```

- [ ] **Step 2: Verify the data loads**

Reload `index.html`. Open devtools console.

Expected:
- Console shows `pookie: ready { blobs: 10 }`
- No errors.

- [ ] **Step 3: Commit (skip — user handles)**

---

## Task 4: Render blobs into the playground

**Files:**
- Modify: `app.js`
- Modify: `styles.css`

- [ ] **Step 1: Add blob/playground/counter styles to `styles.css`**

```css
/* ---------- Playground ---------- */
.playground {
  position: relative;
  min-height: 100dvh;
  width: 100vw;
  overflow: hidden;
  animation: fade-in 700ms ease-out 200ms both;
}

.counter {
  position: fixed;
  top: 18px; right: 18px;
  background: rgba(255, 241, 212, 0.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--cream);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 13px;
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255, 241, 212, 0.18);
  z-index: 50;
  cursor: default;
  user-select: none;
  transition: background 200ms ease;
}
.counter.is-complete {
  background: rgba(255, 217, 61, 0.18);
  border-color: rgba(255, 217, 61, 0.4);
  cursor: pointer;
}
.counter.is-complete:hover { background: rgba(255, 217, 61, 0.28); }

.blob-stage {
  position: relative;
  width: 100%;
  height: 100dvh;
}

/* ---------- Blobs ---------- */
.blob {
  position: absolute;
  width: 88px; height: 88px;
  transform: translate(-50%, -50%);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  animation: float-blob var(--float-duration, 4s) ease-in-out infinite;
  animation-delay: var(--float-delay, 0s);
  transition: opacity 400ms ease, filter 400ms ease;
}
.blob-shape {
  width: 72px; height: 72px;
  position: relative;
  filter: drop-shadow(0 0 18px var(--blob-glow, white));
  animation: pulse-glow 4s ease-in-out infinite;
  animation-delay: var(--pulse-delay, 0s);
  transition: transform 200ms ease, filter 400ms ease;
}
.blob-shape svg { width: 100%; height: 100%; display: block; }
.blob-label {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 12px;
  color: var(--cream);
  opacity: 0;
  transition: opacity 200ms ease;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  pointer-events: none;
  white-space: nowrap;
}

/* On touch devices: labels are always visible */
@media (hover: none) {
  .blob-label { opacity: 0.85; }
}
/* On hover-capable devices: only on hover */
@media (hover: hover) {
  .blob:hover .blob-label { opacity: 1; }
  .blob:hover .blob-shape { transform: scale(1.08); }
}

/* Opened blobs: stop pulsing, dim slightly */
.blob.is-opened .blob-shape {
  animation: none;
  filter: drop-shadow(0 0 8px var(--blob-glow, white));
  opacity: 0.55;
}
.blob.is-opened .blob-label { opacity: 0.5; }

@keyframes float-blob {
  0%, 100% { transform: translate(-50%, -50%) translateY(0); }
  50%      { transform: translate(-50%, -50%) translateY(-10px); }
}
@keyframes pulse-glow {
  0%, 100% { filter: drop-shadow(0 0 12px var(--blob-glow, white)); }
  50%      { filter: drop-shadow(0 0 28px var(--blob-glow, white)); }
}
```

- [ ] **Step 2: Add the renderer to `app.js`**

Add these functions inside the IIFE, above `init`. Then call `renderBlobs()` from `init`.

```js
  // ---------- Renderer ----------
  function buildBlobSvg(blob) {
    // Chunky rounded blob shape, slightly squashed circle, with glow halo + icon.
    return (
      '<svg viewBox="-50 -50 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<radialGradient id="halo-' + blob.id + '">' +
            '<stop offset="0%" stop-color="' + blob.glow + '" stop-opacity="0.55"/>' +
            '<stop offset="100%" stop-color="' + blob.glow + '" stop-opacity="0"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<circle cx="0" cy="0" r="48" fill="url(#halo-' + blob.id + ')"/>' +
        '<path d="M0 -38 C 28 -38 40 -20 38 4 C 36 26 22 36 0 36 C -22 36 -36 26 -38 4 C -40 -20 -28 -38 0 -38 Z" fill="' + blob.color + '"/>' +
        '<g transform="translate(0 0)">' + icon(blob.icon) + '</g>' +
      '</svg>'
    );
  }

  function renderBlobs() {
    const stage = document.getElementById("blob-stage");
    if (!stage) return;
    stage.innerHTML = "";
    BLOBS.forEach(function (blob, i) {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "blob";
      el.dataset.id = blob.id;
      el.style.left = blob.position.left;
      el.style.top = blob.position.top;
      el.style.setProperty("--blob-glow", blob.glow);
      el.style.setProperty("--float-duration", (3.4 + (i % 4) * 0.35) + "s");
      el.style.setProperty("--float-delay",    (i * 0.18) + "s");
      el.style.setProperty("--pulse-delay",    (i * 0.27) + "s");
      el.setAttribute("aria-label", blob.label);
      el.innerHTML =
        '<div class="blob-shape">' + buildBlobSvg(blob) + '</div>' +
        '<div class="blob-label">' + blob.label + '</div>';
      stage.appendChild(el);
    });
  }
```

- [ ] **Step 3: Update `init` to render blobs and switch to playground state for testing**

Temporarily set the body to playground state so we can see blobs without the splash. We'll wire the splash button properly in Task 5.

```js
  function init() {
    renderBlobs();
    // Temporary for testing — Task 5 wires this to the splash button instead.
    document.body.classList.remove("state-splash");
    document.body.classList.add("state-playground");
    document.querySelector(".playground").hidden = false;
    console.log("pookie: ready", { blobs: BLOBS.length });
  }
```

- [ ] **Step 4: Verify blobs render and animate**

Reload the page.

Expected:
- Splash is hidden, playground is visible.
- 10 colored chunky blobs are scattered across the screen, each with a glow halo and an icon (ring, suitcase, dog patches, leaf, moon, calendar X, tag, sun, plane).
- Each blob floats up and down at its own pace (no two synced).
- Each blob's glow swells and shrinks (pulse).
- On desktop: hovering a blob enlarges it slightly and shows the label below it.
- On mobile/touch: labels are visible by default.
- Counter top-right: "0 / 10 gevind".
- No console errors.

- [ ] **Step 5: Commit (skip — user handles)**

---

## Task 5: Splash → playground transition

**Files:**
- Modify: `app.js`
- Modify: `styles.css`

- [ ] **Step 1: Remove the temporary playground-state forcing in `init` and wire the button**

Replace `init` with:

```js
  function init() {
    renderBlobs();
    const openBtn = document.getElementById("open-button");
    if (openBtn) openBtn.addEventListener("click", openPlayground);
    console.log("pookie: ready", { blobs: BLOBS.length });
  }

  function openPlayground() {
    document.body.classList.remove("state-splash");
    document.body.classList.add("state-playground");
    const splash = document.querySelector(".splash");
    const playground = document.querySelector(".playground");
    if (splash) splash.style.display = "none";
    if (playground) playground.hidden = false;
  }
```

- [ ] **Step 2: Add a brief blob-drift-in animation**

Add to `styles.css` (anywhere in the playground section):

```css
.blob {
  opacity: 0;
  animation:
    blob-drift-in 600ms ease-out forwards,
    float-blob var(--float-duration, 4s) ease-in-out infinite var(--float-delay, 0s);
}
@keyframes blob-drift-in {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
```

(Note: this combines two animations — we use the staggered `--float-delay` for the entrance feel too. The float keyframe also begins applying its translate immediately because of `forwards`, but the float's own keyframes always start from `translate(-50%, -50%)`, so they pick up cleanly after the entrance finishes.)

- [ ] **Step 3: Verify the transition**

Reload the page.

Expected:
- Splash appears first (envelope, title, "Open me 💛" button).
- Tap the button — splash hides, playground appears.
- Blobs drift in over a couple of seconds, staggered (not all at once).
- Counter is visible.
- After entrance, blobs continue to float and pulse normally.

- [ ] **Step 4: Commit (skip — user handles)**

---

## Task 6: Click-to-open modal

**Files:**
- Modify: `app.js`
- Modify: `styles.css`

- [ ] **Step 1: Add modal styles to `styles.css`**

```css
/* ---------- Modal ---------- */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(26, 27, 58, 0.78);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  animation: fade-in 250ms ease-out;
}
.modal-backdrop[hidden] { display: none; }

.modal-card {
  position: relative;
  background: linear-gradient(180deg, #2A2654, #1F1D44);
  border: 1px solid rgba(255, 241, 212, 0.15);
  color: var(--cream);
  border-radius: var(--radius-card);
  padding: 32px 28px 28px;
  max-width: 460px;
  width: 100%;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4), 0 0 80px rgba(168, 130, 232, 0.15);
  animation: card-rise 350ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes card-rise {
  from { opacity: 0; transform: translateY(24px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-title {
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 24px;
  margin-bottom: 16px;
  color: var(--cream);
}
.modal-body {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.55;
  color: var(--cream);
  white-space: pre-wrap;
}
.modal-body em {
  font-family: var(--font-heading);
  font-style: italic;
  font-weight: 500;
}

.modal-close {
  position: absolute; top: 12px; right: 12px;
  width: 36px; height: 36px;
  background: rgba(255, 241, 212, 0.1);
  border: none; border-radius: 50%;
  color: var(--cream);
  font-size: 22px; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  transition: background 200ms ease;
}
.modal-close:hover { background: rgba(255, 241, 212, 0.22); }

/* When modal is open, dim the unfocused blobs */
body.modal-open .blob:not(.is-active) { opacity: 0.25; }
body.modal-open .blob.is-active .blob-shape {
  filter: drop-shadow(0 0 36px var(--blob-glow, white));
  transform: scale(1.15);
}
```

- [ ] **Step 2: Add open/close logic to `app.js`**

Add inside the IIFE, above `init`:

```js
  // ---------- Modal ----------
  const opened = new Set(); // ids of opened blobs (Task 7 persists this)

  function openBlob(id) {
    const blob = BLOBS.find(function (b) { return b.id === id; });
    if (!blob) return;

    document.body.classList.add("modal-open");
    const blobEl = document.querySelector('.blob[data-id="' + id + '"]');
    if (blobEl) blobEl.classList.add("is-active");

    document.getElementById("modal-title").textContent = blob.label;
    document.getElementById("modal-body").innerHTML = renderCopy(blob.copy);
    document.getElementById("modal-backdrop").hidden = false;

    if (!opened.has(id)) {
      opened.add(id);
      // Mark blob as opened (visually). Persistence comes in Task 7.
      if (blobEl) blobEl.classList.add("is-opened");
      updateCounter();
    }
  }

  function closeModal() {
    document.body.classList.remove("modal-open");
    document.querySelectorAll(".blob.is-active").forEach(function (el) {
      el.classList.remove("is-active");
    });
    document.getElementById("modal-backdrop").hidden = true;
  }

  function renderCopy(text) {
    // Convert *italic* → <em>italic</em>, escape other HTML.
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return escaped.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }

  function updateCounter() {
    const found = document.getElementById("counter-found");
    const counter = document.getElementById("counter");
    if (found) found.textContent = String(opened.size);
    if (counter) {
      if (opened.size === BLOBS.length) counter.classList.add("is-complete");
      else counter.classList.remove("is-complete");
    }
  }
```

- [ ] **Step 3: Wire up event handlers in `init`**

Update `init` to:

```js
  function init() {
    renderBlobs();

    const openBtn = document.getElementById("open-button");
    if (openBtn) openBtn.addEventListener("click", openPlayground);

    // Click any blob to open it.
    document.getElementById("blob-stage").addEventListener("click", function (e) {
      const blobEl = e.target.closest(".blob");
      if (blobEl) openBlob(blobEl.dataset.id);
    });

    // Close modal: × button or backdrop click.
    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("modal-backdrop").addEventListener("click", function (e) {
      if (e.target.id === "modal-backdrop") closeModal();
    });

    // Esc closes modal.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });

    console.log("pookie: ready", { blobs: BLOBS.length });
  }
```

- [ ] **Step 4: Verify modal flow**

Reload, click "Open me 💛", then click each blob in turn.

Expected:
- Clicking a blob darkens the background, dims other blobs, brings the tapped blob to higher glow + scale.
- A card slides up from below with the blob's label as title and the Afrikaans copy as body. Italics render correctly (e.g., *My vrou.* in the wedding blob).
- Counter increments by 1 on first open; doesn't double-count on re-open.
- Opened blobs are visibly dimmed and stop pulsing.
- × button closes modal. Clicking outside the card closes modal. Esc closes modal.
- After all 10 are opened, counter shows "10 / 10 gevind" and the counter pill goes gold/gets a subtle highlight.

- [ ] **Step 5: Commit (skip — user handles)**

---

## Task 7: Persistence + background stars

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add localStorage helpers and call them**

Add inside the IIFE, above the modal section:

```js
  // ---------- Persistence ----------
  const LS_OPENED = "pookie:opened";
  const LS_FINALE_SEEN = "pookie:finale-seen";

  function loadOpened() {
    try {
      const raw = localStorage.getItem(LS_OPENED);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveOpened() {
    try {
      localStorage.setItem(LS_OPENED, JSON.stringify(Array.from(opened)));
    } catch (e) {
      // Quota / private mode — fail silently, just don't persist.
    }
  }

  function loadFinaleSeen() {
    try { return localStorage.getItem(LS_FINALE_SEEN) === "true"; }
    catch (e) { return false; }
  }

  function saveFinaleSeen() {
    try { localStorage.setItem(LS_FINALE_SEEN, "true"); } catch (e) {}
  }
```

- [ ] **Step 2: Wire persistence into `openBlob` and on init**

Update `openBlob` so the new-open branch also persists:

```js
    if (!opened.has(id)) {
      opened.add(id);
      saveOpened();
      if (blobEl) blobEl.classList.add("is-opened");
      updateCounter();
    }
```

Add a `restoreState` function above `init` and call it from `init` (after `renderBlobs`):

```js
  function restoreState() {
    const stored = loadOpened();
    stored.forEach(function (id) {
      opened.add(id);
      const el = document.querySelector('.blob[data-id="' + id + '"]');
      if (el) el.classList.add("is-opened");
    });
    updateCounter();
  }
```

In `init`, after `renderBlobs();` add:

```js
    restoreState();
```

- [ ] **Step 3: Add starfield generator**

Add above `init`:

```js
  function renderStars() {
    const layer = document.querySelector(".bg-stars");
    if (!layer) return;
    const count = 36;
    let html = "";
    for (let i = 0; i < count; i++) {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const size = (Math.random() * 1.6 + 1).toFixed(2); // 1.0 - 2.6 px
      const delay = (Math.random() * 3).toFixed(2);
      const duration = (2.5 + Math.random() * 2.5).toFixed(2);
      html +=
        '<div class="star" style="left:' + left.toFixed(2) + '%;top:' + top.toFixed(2) +
        '%;width:' + size + 'px;height:' + size + 'px;animation-delay:' + delay +
        's;animation-duration:' + duration + 's"></div>';
    }
    layer.innerHTML = html;
  }
```

In `init`, after `restoreState();` add:

```js
    renderStars();
```

- [ ] **Step 4: Verify persistence and stars**

Reload. Open 3 blobs. Reload again.

Expected:
- The 3 previously-opened blobs are pre-marked as opened (dimmed, no pulse).
- Counter shows "3 / 10 gevind" without any clicks.
- ~36 small twinkling stars are visible across the dark background.
- Try clearing localStorage in devtools (`localStorage.clear()`) and reloading — counter back to 0, no blobs pre-opened.

- [ ] **Step 5: Commit (skip — user handles)**

---

## Task 8: Finale

**Files:**
- Modify: `app.js`
- Modify: `styles.css`

- [ ] **Step 1: Add finale styles**

```css
/* ---------- Finale ---------- */
.finale-backdrop {
  position: fixed; inset: 0; z-index: 200;
  background: radial-gradient(ellipse at center, rgba(61, 43, 95, 0.85), rgba(26, 27, 58, 0.95));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  animation: fade-in 400ms ease-out;
}
.finale-backdrop[hidden] { display: none; }

.finale-card {
  position: relative;
  background: linear-gradient(180deg, #322B5C, #1F1D44);
  border: 1px solid rgba(255, 217, 61, 0.3);
  border-radius: var(--radius-card);
  padding: 36px 30px 30px;
  max-width: 520px;
  width: 100%;
  color: var(--cream);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5), 0 0 100px rgba(255, 179, 71, 0.25);
  animation: finale-unfold 600ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes finale-unfold {
  from { opacity: 0; transform: scale(0.4); }
  to   { opacity: 1; transform: scale(1); }
}

.finale-title {
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 32px;
  margin-bottom: 18px;
  background: linear-gradient(90deg, #FFD93D, #FF7E6B, #FF8FA6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.finale-body {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.65;
  color: var(--cream);
  white-space: pre-wrap;
}
.finale-body em {
  font-family: var(--font-heading);
  font-style: italic;
  font-weight: 500;
}

.finale-confetti {
  position: absolute; inset: 0; overflow: visible; pointer-events: none;
}
.confetti-piece {
  position: absolute;
  width: 8px; height: 8px;
  border-radius: 50%;
  opacity: 0;
  animation: confetti-rise 2.6s ease-out forwards;
}
@keyframes confetti-rise {
  0%   { opacity: 0; transform: translateY(20px) scale(0.5); }
  20%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-160px) scale(1.1) rotate(180deg); }
}
```

- [ ] **Step 2: Add finale logic to `app.js`**

Add inside the IIFE, above `init`:

```js
  // ---------- Finale ----------
  function maybeTriggerFinale() {
    if (opened.size < BLOBS.length) return;
    if (loadFinaleSeen()) return; // already played this session/refresh chain
    saveFinaleSeen();
    showFinale();
  }

  function showFinale() {
    const body = document.getElementById("finale-body");
    if (body) body.innerHTML = renderCopy(FINALE_COPY);
    document.getElementById("finale-backdrop").hidden = false;
    spawnConfetti();
  }

  function closeFinale() {
    document.getElementById("finale-backdrop").hidden = true;
  }

  function spawnConfetti() {
    const layer = document.getElementById("finale-confetti");
    if (!layer) return;
    layer.innerHTML = "";
    const colors = ["#FFD93D", "#FF7E6B", "#6BCBB8", "#FF8FA6", "#7FB8E8", "#FFB347"];
    for (let i = 0; i < 24; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = (5 + Math.random() * 90).toFixed(1) + "%";
      piece.style.bottom = "-12px";
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = (Math.random() * 0.6).toFixed(2) + "s";
      layer.appendChild(piece);
    }
  }
```

- [ ] **Step 3: Trigger finale from `openBlob` and wire close/replay**

In `openBlob`, after `updateCounter();`, add:

```js
      // Defer slightly so the modal's open animation finishes first.
      setTimeout(maybeTriggerFinale, 600);
```

In `init`, add:

```js
    document.getElementById("finale-close").addEventListener("click", closeFinale);
    document.getElementById("finale-backdrop").addEventListener("click", function (e) {
      if (e.target.id === "finale-backdrop") closeFinale();
    });

    // Counter becomes a re-trigger button once complete.
    document.getElementById("counter").addEventListener("click", function () {
      if (opened.size === BLOBS.length) showFinale();
    });
```

- [ ] **Step 4: Verify finale**

Open all 10 blobs in succession. After opening the 10th and closing its modal (or even before — the timeout fires regardless), the finale should appear.

Expected:
- After 10/10, the finale backdrop fades in. A larger card unfolds in the centre with the long love-letter copy. Confetti pieces float up from the bottom.
- Tap × or click backdrop to close.
- After closing, you can click the gold-highlighted counter to re-open the finale on demand.
- Reload the page — counter shows 10/10 ✨, finale does NOT auto-replay. Clicking the counter still re-opens it.
- Clear localStorage and reload — back to 0/10, full re-discovery flow available.

- [ ] **Step 5: Commit (skip — user handles)**

---

## Task 9: Mobile responsive adjustments

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add mobile-tuned overrides at the bottom of `styles.css`**

```css
/* ---------- Mobile ---------- */
@media (max-width: 600px) {
  .counter {
    top: 12px; right: 12px;
    font-size: 12px;
    padding: 7px 12px;
  }
  .blob { width: 76px; height: 76px; }
  .blob-shape { width: 64px; height: 64px; }
  .blob-label { font-size: 11px; }

  .modal-card { padding: 28px 22px 24px; }
  .modal-title { font-size: 20px; }
  .modal-body { font-size: 15px; }

  .finale-card { padding: 30px 22px 24px; }
  .finale-title { font-size: 26px; }
  .finale-body { font-size: 15px; }
}

/* Even tighter spacing for very small phones */
@media (max-width: 380px) {
  .blob { width: 70px; height: 70px; }
  .blob-shape { width: 58px; height: 58px; }
}

/* Reduced motion: disable ambient animations, keep transitions short */
@media (prefers-reduced-motion: reduce) {
  .splash-envelope,
  .blob,
  .blob-shape,
  .star {
    animation: none !important;
  }
  .blob {
    opacity: 1 !important;
    transform: translate(-50%, -50%) !important;
  }
  .modal-card, .finale-card { animation-duration: 200ms; }
  .confetti-piece { display: none; }
}
```

- [ ] **Step 2: Verify on multiple viewport sizes**

Open devtools → toggle device toolbar.

Expected:
- iPhone SE (375 × 667): all 10 blobs are visible without overlap, counter fits, modal feels comfortable.
- iPhone 14 Pro Max (430 × 932): blobs spread well, generous spacing.
- iPad (768 × 1024): blobs scale up gracefully.
- Desktop (1440 × 900): blobs occupy full width without feeling sparse.
- Toggle "prefers-reduced-motion" in devtools (Rendering tab → Emulate CSS prefers-reduced-motion: reduce). Reload — blobs are static, no float/pulse, but modal/finale still open. Interactions still work.

- [ ] **Step 3: Commit (skip — user handles)**

---

## Task 10: Cross-browser smoke + final QA pass

**Files:** none (testing only)

- [ ] **Step 1: Test the full flow in two browsers**

In each of (Chrome / Safari) — Firefox if available too:

1. Hard-reload (`Cmd+Shift+R`) to bust any cache.
2. Land on splash. Tap "Open me 💛".
3. Watch blobs drift in.
4. Hover a blob (desktop) → label appears, blob enlarges.
5. Tap each of the 10 blobs in any order. For each:
   - Modal appears with correct title (label) and copy.
   - Counter increments.
   - Close via ×, backdrop tap, or Esc.
   - Blob is now dimmed and not pulsing.
6. After 10/10: finale auto-plays with confetti.
7. Close finale.
8. Reload — pre-restored to 10/10, no auto finale, counter is gold/clickable, click reopens finale.
9. Clear `localStorage.clear()` in console, reload — fresh start.

- [ ] **Step 2: Mobile real-device smoke (if possible)**

Open the local file via a phone — easiest is to start a quick local server and connect over LAN:

```bash
cd /Users/christeljansenvanrensburg/Documents/pookie
python3 -m http.server 8000
# then on the phone, visit http://<your-mac-IP>:8000
```

Verify:
- Splash button is comfortably tappable.
- Blobs are tappable (no missed taps from animations).
- Labels visible by default on the phone.
- Modal close × is reachable with thumb.
- No horizontal scroll.

- [ ] **Step 3: Visual checklist**

- [ ] No layout overflow at any breakpoint.
- [ ] All Afrikaans text renders correctly (no garbled characters).
- [ ] Italic markers (`*word*`) render as italic, not literal asterisks.
- [ ] Counter is readable on the dark background.
- [ ] Glow halos are visible on every blob.
- [ ] Confetti doesn't get stuck on screen after finale closes (re-opens are clean).

- [ ] **Step 4: Commit (skip — user handles)**

---

## Task 11: Deploy to GitHub Pages

**Files:** none (deployment only)

- [ ] **Step 1: User: create GitHub repo named `pookie`**

The user (Christel) will:
1. Go to https://github.com/new
2. Name: `pookie`
3. Public visibility (required for free GitHub Pages on personal accounts)
4. Do NOT initialise with a README/license/gitignore (those exist locally already).
5. Create the repo.

- [ ] **Step 2: User: push the local repo**

GitHub will show the exact commands. Typically:

```bash
git remote add origin git@github.com:<USERNAME>/pookie.git
# OR
git remote add origin https://github.com/<USERNAME>/pookie.git

git branch -M main
git push -u origin main
```

- [ ] **Step 3: User: enable GitHub Pages**

1. Repo → Settings → Pages.
2. Source: "Deploy from a branch".
3. Branch: `main`, folder: `/ (root)`. Save.
4. Wait ~30 seconds.
5. The page section will show: "Your site is live at https://<username>.github.io/pookie/".

- [ ] **Step 4: User: open the live URL on phone + desktop, share with Nicole**

- [ ] **Step 5: Done 💛**

---

## After completion

Open follow-ups for the user (not blocking ship):

- Final copy revision pass on each blob and the finale (copy is placeholder-vibe).
- Optional: add a custom domain.
- Optional: optional audio toggle (skip unless requested).

---

## Self-review (post-write check)

**Spec coverage:**
- Splash → playground → blob open → finale: covered (Tasks 2, 4, 6, 8).
- 10 blobs with the exact list from the spec: covered (Task 3 data array).
- Midnight + pop palette: covered (Tasks 1, 4, 8).
- Float + pulse + hover + open + finale + confetti animations: covered (Tasks 4, 6, 8).
- localStorage persistence: covered (Task 7).
- Counter clickable after completion: covered (Task 8 init wiring).
- Mobile + responsive + prefers-reduced-motion: covered (Task 9).
- GitHub Pages deployment: covered (Task 11).
- Audio: explicitly out of scope, no task added — correct.
- Mention dogs by name in finale: present in `FINALE_COPY` (Task 3).

**Placeholder scan:** No TBDs, no "implement later," no "similar to Task N" handwaving. All code blocks are complete.

**Type / name consistency:**
- `BLOBS` array, `opened` Set, `loadOpened`/`saveOpened`, `LS_OPENED`/`LS_FINALE_SEEN`, `openBlob`/`closeModal`, `showFinale`/`closeFinale`/`maybeTriggerFinale`, `renderCopy`, `updateCounter`, `renderStars`, `restoreState`, `spawnConfetti` — all referenced consistently across tasks.
- DOM IDs match between HTML (Task 1) and JS (Tasks 4, 6, 7, 8): `open-button`, `counter`, `counter-found`, `counter-total`, `blob-stage`, `modal-backdrop`, `modal-card`, `modal-close`, `modal-title`, `modal-body`, `finale-backdrop`, `finale-close`, `finale-confetti`, `finale-body`. All consistent.
- CSS custom properties (`--blob-glow`, `--float-duration`, `--float-delay`, `--pulse-delay`) declared in JS, consumed in CSS — consistent.

**Scope check:** Single page, vanilla, ~3 source files, deployable to GH Pages — focused and shippable in one session.

Plan looks complete and consistent.
