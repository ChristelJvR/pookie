# Pookie — codebase summary

Snapshot of the current state of the site (design, mechanics, copy) for planning further changes.

## Files

| File | Role |
|---|---|
| `index.html` | DOM scaffold: splash, playground, modal, finale, bg layers, reset button. `lang="af"`, theme color `#1A1B3A`, Google Fonts (Fraunces + Nunito) preloaded. |
| `styles.css` | ~440 lines. Tokens, background, splash, state machine, playground, blobs, modal, finale, reset button, mobile breakpoints, reduced-motion. |
| `app.js` | ~376 lines, IIFE strict mode. Blob data + finale copy, SVG icons, localStorage persistence, modal/finale logic, renderer, init. |

## Experience flow (4 states)

1. **Splash** — `💌` envelope (floating), `Vir my pookiedooks` (Fraunces), cream pill button "Open me 💛".
2. **Playground** — blob discovery. Counter top-right (`0 / 10 gevind`), 10 glowing blobs floating around a 100dvh stage.
3. **Modal** — click a blob → backdrop blur + card-rise card, label as title, copy in body. Opened blobs dim & stop pulsing.
4. **Finale** — all 10 opened → modal closes, gradient-title "Pookiedooks" card unfolds, love letter, 24 confetti pieces rise. Counter turns gold; clicking it replays the finale.

## Design system

- **Palette:** midnight twilight (`#1A1B3A` deep + `#3D2B5F` mid radial), cream text `#FFF1D4`. Blob pops: coral `#FF7E6B`, marigold `#FFB347`, mint `#6BCBB8`, pink `#FF8FA6`, sky `#7FB8E8`, sun `#FFD93D`, plus libby near-black + nala golden.
- **Typography:** Fraunces (headings, italics for emphasis), Nunito (body).
- **Background:** radial gradient + 2 blurred purple/coral orbs (`bg-orbs`) + 36 twinkling stars (random size 1–2.6px).
- **Animations:** envelope `float-soft`, blobs `blob-drift-in` + `float-blob` + `pulse-glow` (staggered delays via CSS vars), modal `card-rise`, finale `finale-unfold`, confetti `confetti-rise`, stars `twinkle`. `prefers-reduced-motion` disables all.
- **Persistence:** `pookie:opened` (array of ids), `pookie:finale-seen` (bool). Finale only auto-triggers once per browser.

## The 10 blobs

| # | id | label | icon | Copy (gist) |
|---|---|---|---|---|
| 1 | `wedding` | 22 April | ring | Stil tekening by home affairs — "My vrou." (italic) |
| 2 | `move` | die move | suitcase | Sy merk lyste af in die kombuis — Bangkok het g'n idee nie. |
| 3 | `libby` | Libby | dog ellipse | "My swartbessie. Ouma gaan jou só bederf." |
| 4 | `nala` | Nala | gold ears | "Goue Nala… baie cuddles by ouma." |
| 5 | `therapy` | die werk | seedling | Sien jou doen die werk, trots. |
| 6 | `nine-pm` | 8:57 | moon | "Almal — honde ingesluit — weet wat nou gebeur." |
| 7 | `calendar` | vandag se datum | calendar w/ X | "...het jy al vandag se datum afgemerk? 👀" |
| 8 | `empty-house` | die leë huis | tag | Marie Kondo in 'n week, pizza op die vloer. |
| 9 | `gr3-smile` | die kleintjies | sun | "Jy mag glimlag op werk. Daai gr3s gaan jou aanbid." |
| 10 | `bangkok` | Bangkok | plane | Mini-honeymoon, êrens warm, net ons twee. |

Mix of one-liners (Libby, Nala, 8:57, calendar) and longer reflections (wedding, move, therapy, gr3, bangkok). Italics via `*text*` → `<em>` (Fraunces italic).

### Full blob copy

**1. wedding (22 April)**
> Twee-en-twintig April. 'n Stil tekening by home affairs, geen blomme, geen toespraak. Maar dis amptelik — jy is my vrou. Ek het nog nie heeltemal gewoond geraak aan daardie woord nie.
>
> *My vrou.*

**2. move (die move)**
> Ek staan in die kombuis en kyk hoe jy 'n nuwe lys afmerk. Polisie clearance, kwalifikasies, die huis se huur, die meubels — jy doen dit alles, en jy kla nie eens nie.
>
> Bangkok het g'n idee wat aankom nie.

**3. libby (Libby)**
> My swartbessie. Ouma gaan jou só bederf.

**4. nala (Nala)**
> Goue Nala. Jy weet nog nie, maar jy gaan baie cuddles by ouma kry.

**5. therapy (die werk)**
> Jy doen die werk wat die meeste mense nooit doen nie. Jy gaan terug, jy vra die moeilike vrae, jy probeer verstaan hoekom jy is wat jy is.
>
> Ek sien jou. Ek's so trots op jou.

**6. nine-pm (8:57)**
> Dis 8:57. Almal — honde ingesluit — weet wat nou gebeur.

**7. calendar (vandag se datum)**
> ...het jy al vandag se datum afgemerk? 👀

**8. empty-house (die leë huis)**
> Update: nog 'n stoel verkoop. Ons sit binnekort op die vloer en eet pizza. Jy is besig om Marie Kondo se werk in 'n week te doen.

**9. gr3-smile (die kleintjies)**
> Geen meer 'n streng gesig nie. Geen meer 'wys hulle wie's baas op dag een' nie.
>
> Jy mag glimlag op werk. Daai gr3s gaan jou aanbid.

**10. bangkok (Bangkok)**
> Ons mini-honeymoon kom nog. Jy en ek, êrens warm, geen to-do lyste, geen koffers nie.
>
> Net ons twee, en die begin van iets nuuts.

## Finale letter (`FINALE_COPY`)

> Pookiedooks,
>
> Twee weke gelede het ek my naam langs joune geskryf en gesê *vir altyd*. Drie maande van nou af verhuis ons na 'n nuwe land. Ons groet binnekort vir Libby en Nala. En tussen al hierdie groot dinge — die move, die troue, die werk, die therapy — is jy steeds die een wat alles bymekaar hou.
>
> Jy kla nie. Jy doen net. Jy maak my lag wanneer ek vergeet om te lag. Jy weet wanneer dit 8:57 is sonder om te kyk.
>
> Ek's so dankbaar dat jy myne is. Ek's so trots op die mens wat jy is en wie jy elke dag word. En ek kan nie wag om Bangkok saam met jou te ontdek nie.
>
> Lief jou. Altyd.

(~110 words. Opens with "Pookiedooks,", recaps the three pillars — 2 weeks since wedding / 3 months to move / soon-saying-goodbye to dogs — names what she does, gratitude + Bangkok closer, "Lief jou. Altyd.")

## Mechanics worth knowing for edits

- **Adding a letter is just appending to the `BLOBS` array** in `app.js` — only `id` (unique, keys persistence), `label`, and `copy` are required. `color`/`glow`/`icon` are optional (rotating palette + heart-icon defaults via `normalizeBlobs`). Layout is fully automatic at any count: column-scattered drop, organic wander, and a top **docking strip that wraps to extra centered rows** when one row would overflow. No per-blob coordinates to tune. (Optional `position: { left, top }` overrides only the reduced-motion static placement.)
- Geometry lives in `motion.js` as pure, unit-tested functions: `computeDockLayout` (wrapping rows + shared scale), `scatterLayout` (deterministic jittered-grid static layout), `wanderVelocity`, `softReflect`, `clamp`. The dock band reserved at the top sizes itself to the full blob count, so wandering blobs never overlap docked rows. The counter total renders from `BLOBS.length` (no hard-coded number).
- Counter `aria-live="polite"`, modal + finale are proper `role="dialog" aria-modal`, Esc closes both.
- On `(hover: none)` (touch) labels are always shown at 0.85 opacity; on hover-capable they appear on hover only.
- Hidden chained behaviour: opening the final blob waits 400ms after dismissal then auto-launches finale (once). Reopening anytime after that requires clicking the gold counter.
- Reset button (`↻ replay`, bottom-left) clears `pookie:opened` + `pookie:finale-seen` and reloads — for replaying from splash.
