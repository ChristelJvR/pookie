# Pookie — A little website for Nicole

**Date:** 2026-05-09
**Author:** Christel
**Recipient:** Nicole (wife, married 2026-04-22)
**Goal:** Ship a personal, animated, single-page website as a love-gesture, deployed to GitHub Pages, shareable tomorrow.

---

## Purpose

A cute, fun, personalised website that lets Nicole discover ten little notes from her husband — a mix of tender beats (the wedding, her therapy work, the dogs, the move she's carried) and silly ones (the 9pm shutdown ritual, the daily fridge calendar tick, the empty house with three months still to go). Designed to feel alive: chunky glowing blob characters drift around a deep midnight background; she clicks each to open a note. A finale plays once she finds all ten.

Tone: mostly Afrikaans, naturally code-switched the way they actually speak. First person — Christel speaking to Nicole, not narrating about her.

---

## Constraints

- **Ship by:** 2026-05-10 (tomorrow)
- **Deploy to:** GitHub Pages, repo name `pookie`
- **Tech ceiling:** vanilla HTML/CSS/JS — no build step, no framework
- **Devices:** mobile + desktop (primary use likely mobile, since Nicole will open the link on her phone)
- **Audio:** none (she may open it in public)

---

## Experience flow

Four states, all in `index.html`. JS toggles classes on `<body>` to switch.

### 1. Splash
- Dark sky, subtle starfield, soft glowing envelope (or heart) in centre.
- Headline: **"Vir my pookiedooks"**
- Single button: **"Open me 💛"**
- One tap → splash fades, playground takes over.

### 2. Playground
- Ten blob characters drift in over ~3 seconds, staggered (not all at once).
- Each blob has a small text label below it. On touch devices the label is always visible; on hover-capable devices it's hidden by default and fades in on hover (less visual noise on desktop).
- Unclicked blobs do a gentle 4-second `pulse-glow` to invite attention.
- Counter top-right: **"0 / 10 gevind"** — updates as she opens blobs.
- Soft starfield + a few large blurred glow orbs in the background give depth.

### 3. Blob open
- Tap a blob: other blobs fade to ~30% opacity and slow their drift.
- Tapped blob smoothly translates to the centre and scales slightly.
- A modal card slides up from below, containing the note.
- Close button (×) and tap-outside both close. Tapped blob is now "calm" — no more pulse, slightly dimmed glow — to signal "opened."
- Counter increments. Persists to `localStorage`.

### 4. Finale
- Triggers automatically when she opens the 10th blob (first time only).
- All 10 blobs animate to fixed positions around the edges of the viewport and pulse together.
- A larger card unfolds from the centre with a longer love-letter (~150 words).
- Soft confetti / sparkle particles via SVG.
- Close button returns her to the playground; she can re-open any blob to re-read.
- Re-visiting after finale (refresh): blobs render pre-opened, finale is NOT auto-replayed. The counter shows "10 / 10 ✨" and is clickable — clicking it re-opens the finale card on demand.

---

## The 10 blobs

Each blob is a JS object:

```js
{ id, name, color, glowColor, label, copy, copyType, svgIcon, position }
```

| # | id | Visual | Length | Copy direction (placeholder) |
|---|---|---|---|---|
| 1 | `wedding` | Marigold blob, tiny gold ring icon | Long | 22 April. Stil tekening by home affairs. *My vrou.* — newlywed gratitude. |
| 2 | `move` | Coral blob, suitcase icon | Long | Awe at how she's carried the move logistics single-handed. |
| 3 | `libby` | Black blob, white chest patch, pointy triangle ears | Short | Tender one-liner to Libby specifically. "My swartbessie." |
| 4 | `nala` | Golden blob, floppy ears | Short | Tender one-liner to Nala specifically. "Goue Nala." |
| 5 | `therapy` | Mint blob, tiny seedling | Long | Quiet pride about her therapy work. "Jy doen die werk wat die meeste mense nooit doen nie." |
| 6 | `nine-pm` | Indigo blob, crescent moon + zzz | Short | Funny: "Dis 8:57. Almal — honde ingesluit — weet wat nou gebeur." |
| 7 | `calendar` | Coral blob, calendar with X | Short | Eyeroll-funny: "...het jy al vandag se datum afgemerk?" |
| 8 | `empty-house` | Pink blob, "for sale" tag | Short | Funny: "Update: nog 'n stoel verkoop. Ons sit binnekort op die vloer en eet pizza." |
| 9 | `gr3-smile` | Marigold blob, smiling sun | Long | About the new chapter — she gets to smile at work in Bangkok with gr3s. |
| 10 | `bangkok` | Sky-blue blob, tiny plane | Long | About the minimoon and what's ahead together. |

**Finale card:** ~150-word love letter that pulls threads together — newlywed gratitude, awe at her, the move, the dogs, who she is. Signed off in Christel's voice. Mentions Libby and Nala by name (final pass — Christel will revise after first impl).

---

## Visual system

### Palette
- BG primary: `#1A1B3A` (deep midnight)
- BG secondary: `#3D2B5F` (lighter midnight, used in radial gradient at top)
- Text: `#FFF1D4` (warm cream)
- Blob colors (rotated): coral `#FF7E6B`, marigold `#FFB347`, mint `#6BCBB8`, pink `#FF8FA6`, sky `#7FB8E8`, sunshine `#FFD93D`
- Each blob has a `radial-gradient` glow halo in its own color, ~40% opacity

### Typography
- Headings: **Fraunces** (Google Fonts) — warm, slightly chunky serif
- Body: **Nunito** (Google Fonts) — rounded sans

### Background details
- Starfield: ~30 small white dots with `twinkle` keyframe at staggered delays
- 2-3 larger soft glow orbs slowly drifting in deep background for depth

---

## Animation spec

| Animation | Element | Timing | Notes |
|---|---|---|---|
| `float` | Every blob | 3-5s, randomised per blob | Vertical drift; randomised so they never sync |
| `pulse-glow` | Unclicked blobs | 4s | Glow swell to invite clicks; stops once opened |
| `hover-grow` | Blob on hover | 200ms | `scale(1.08)` + label fade-in |
| `open-blob` | Tapped blob | 400ms | Translate to centre + scale up; ease-out |
| `modal-slide` | Note card | 300ms | Slides up from below with opacity |
| `finale-scatter` | All blobs | 600ms | Animate to fixed edge positions |
| `finale-unfold` | Finale card | 500ms | Scales from a tiny dot to full card |
| `confetti` | Particle SVGs | 2.5s | Soft sparkle particles drifting up + fading |
| `twinkle` | Background stars | 3s | Opacity pulse, staggered delays |

All animations use `transform` + `opacity` only — GPU-friendly, smooth on mobile. `prefers-reduced-motion` disables float/pulse/twinkle (open/close transitions remain but shorter).

---

## Mobile / responsive

- Blob positions use `clamp()` + `vw/vh` so they reflow without overlap on narrow screens.
- Below 600px viewport width: blobs sit closer together; modal goes near-fullscreen with margin.
- Counter shrinks but stays top-right.
- Touch targets: blobs are minimum 56px tap area (chunky enough to be friendly on touch).
- Tested mental model: iPhone SE (375px) up to desktop monitor — should look good across all.

---

## State + persistence

- `localStorage['pookie:opened']` — JSON array of blob ids she's opened
- `localStorage['pookie:finale-seen']` — boolean, prevents auto-replay of finale on refresh after completion
- On page load: read both, render blobs in correct state, set counter
- Reset: not exposed in UI (only via devtools — she shouldn't need it)

---

## File structure

```
pookie/
├── index.html         # markup for splash, playground, modal, finale
├── styles.css         # palette, typography, animations, responsive
├── app.js             # blob data, state, interactions, persistence
├── README.md          # short repo description
├── .gitignore         # already exists
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-05-09-pookie-website-design.md   # this file
```

No build step. No npm. Open `index.html` locally to test.

---

## Deployment

1. Create a new public GitHub repo named `pookie` under Christel's account.
2. Push the local repo (already initialised).
3. Repo Settings → Pages → Source: `main` branch, root folder.
4. Live URL: `https://<github-username>.github.io/pookie/` (~30s after enabling).
5. Share with Nicole 💛.

Christel's GitHub username will be confirmed during implementation.

---

## Out of scope (explicitly)

- Audio / music
- Sharing buttons
- Analytics
- Animated photos / video
- Multi-page navigation
- Backend / server / database
- Authentication (link is unguessable enough; security isn't the concern)
- Custom domain (can be added later)
- Internationalisation framework (Afrikaans/English mix is hardcoded)

---

## Risks & open questions

- **Copy quality:** Christel will revise the placeholder copy after first deploy. Spec assumes one revision pass before sharing with Nicole.
- **Afrikaans phrasing:** initial pass will be plausible but Christel must do final pass for native idiom.
- **GitHub Pages auth:** if Christel's local git isn't authenticated to push to a new GitHub repo, implementation will pause to confirm credentials/auth method.
- **Performance with 10 animated blobs on low-end mobile:** mitigated by `transform`/`opacity`-only animations and `prefers-reduced-motion` fallback.

---

## Success criteria

- Loads in < 2s on a phone
- All ten blobs are discoverable (visible label or hover state) and openable
- Counter accurately reflects opened blobs
- Finale plays exactly once on first completion of the session, then accessible by re-tapping
- Looks polished on iPhone SE width and 1440px desktop
- Copy is in Christel's voice and feels like Nicole would smile reading it
- Deployed to GitHub Pages with a working public URL by 2026-05-10
