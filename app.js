(function () {
  "use strict";

  // ---------- Data ----------
  // To add a letter, append an entry. Only `id`, `label`, and `copy` are
  // required (`id` must be unique — it keys persistence). `color`, `glow`, and
  // `icon` are optional and fall back to a rotating palette + heart icon (see
  // normalizeBlobs). Layout is fully automatic: blobs scatter on drop, wander,
  // and dock into a wrapping top row — no per-blob coordinates to tune.
  // Optional `position: { left: "x%", top: "y%" }` manually overrides only the
  // reduced-motion static placement.
  const BLOBS = [
    {
      id: "wedding",
      label: "22 April",
      color: "#FFB347", glow: "#FFB347",
      icon: "ring",
      copy:
        "Twee-en-twintig April. 'n Stil tekening by home affairs, geen blomme, geen toespraak. Maar dis amptelik — jy is my vrou. Ek het nog nie heeltemal gewoond geraak aan daardie woord nie.\n\n*My vrou.*",
    },
    {
      id: "move",
      label: "die move",
      color: "#FF7E6B", glow: "#FF7E6B",
      icon: "suitcase",
      copy:
        "Ek staan in die kombuis en kyk hoe jy 'n nuwe lys afmerk. Polisie clearance, kwalifikasies, die huis se huur, die meubels — jy doen dit alles, en jy kla nie eens nie.\n\nBangkok het g'n idee wat aankom nie.",
    },
    {
      id: "libby",
      label: "Libby",
      color: "#1F1F2A", glow: "#7FB8E8",
      icon: "libby",
      copy: "My swartbessie. Ouma gaan jou só bederf.",
    },
    {
      id: "nala",
      label: "Nala",
      color: "#E8B85C", glow: "#FFD93D",
      icon: "nala",
      copy: "Goue Nala. Jy weet nog nie, maar jy gaan baie cuddles by ouma kry.",
    },
    {
      id: "therapy",
      label: "die werk",
      color: "#6BCBB8", glow: "#6BCBB8",
      icon: "seedling",
      copy:
        "Jy doen die werk wat die meeste mense nooit doen nie. Jy gaan terug, jy vra die moeilike vrae, jy probeer verstaan hoekom jy is wat jy is.\n\nEk sien jou. Ek's so trots op jou.",
    },
    {
      id: "nine-pm",
      label: "8:57",
      color: "#7FB8E8", glow: "#B8A1E8",
      icon: "moon",
      copy: "Dis 8:57. Almal — honde ingesluit — weet wat nou gebeur.",
    },
    {
      id: "calendar",
      label: "vandag se datum",
      color: "#FF7E6B", glow: "#FF7E6B",
      icon: "calendar",
      copy: "...het jy al vandag se datum afgemerk? 👀",
    },
    {
      id: "empty-house",
      label: "die leë huis",
      color: "#FF8FA6", glow: "#FF8FA6",
      icon: "tag",
      copy: "Update: nog 'n stoel verkoop. Ons sit binnekort op die vloer en eet pizza. Jy is besig om Marie Kondo se werk in 'n week te doen.",
    },
    {
      id: "gr3-smile",
      label: "die kleintjies",
      color: "#FFD93D", glow: "#FFD93D",
      icon: "sun",
      copy:
        "Geen meer 'n streng gesig nie. Geen meer 'wys hulle wie's baas op dag een' nie.\n\nJy mag glimlag op werk. Daai gr3s gaan jou aanbid.",
    },
    {
      id: "bangkok",
      label: "Bangkok",
      color: "#7FB8E8", glow: "#7FB8E8",
      icon: "plane",
      copy:
        "Ons mini-honeymoon kom nog. Jy en ek, êrens warm, geen to-do lyste, geen koffers nie.\n\nNet ons twee, en die begin van iets nuuts.",
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
      libby:    '<ellipse cx="0" cy="20" rx="6" ry="5" fill="#FFFFFF"/>', // chest patch, low on the body
      nala:     '', // ears drawn by ears() behind the head; face left plain
      seedling: '<path d="M0 6 L0 -2 M-4 0 Q-4 -4 0 -3 M4 0 Q4 -4 0 -3" stroke="#1A1B3A" stroke-width="2" fill="none" stroke-linecap="round"/>',
      moon:     '<path d="M3 -5 A8 8 0 1 0 3 5 A6 6 0 1 1 3 -5 Z" fill="#1A1B3A"/>',
      calendar: '<rect x="-7" y="-6" width="14" height="13" rx="1.5" fill="none" stroke="#1A1B3A" stroke-width="2"/><line x1="-7" y1="-2" x2="7" y2="-2" stroke="#1A1B3A" stroke-width="2"/><path d="M-3 2 L3 6 M3 2 L-3 6" stroke="#FF7E6B" stroke-width="2.5" stroke-linecap="round"/>',
      tag:      '<path d="M-7 -7 L0 -7 L7 0 L0 7 L-7 7 Z" fill="none" stroke="#1A1B3A" stroke-width="2"/><circle cx="-4" cy="-4" r="1.5" fill="#1A1B3A"/>',
      sun:      '<circle cx="0" cy="0" r="4" fill="#1A1B3A"/><g stroke="#1A1B3A" stroke-width="2" stroke-linecap="round"><line x1="0" y1="-7" x2="0" y2="-9"/><line x1="0" y1="7" x2="0" y2="9"/><line x1="-7" y1="0" x2="-9" y2="0"/><line x1="7" y1="0" x2="9" y2="0"/><line x1="-5" y1="-5" x2="-7" y2="-7"/><line x1="5" y1="-5" x2="7" y2="-7"/></g>',
      plane:    '<path d="M-8 0 L8 0 M0 -4 L0 4 M5 -2 L8 0 L5 2" fill="none" stroke="#1A1B3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      heart:    '<path d="M0 7 C -7 1 -8 -5 -3.5 -7 C -1 -8 0 -5.5 0 -4 C 0 -5.5 1 -8 3.5 -7 C 8 -5 7 1 0 7 Z" fill="#1A1B3A"/>'
    };
    return icons[name] || "";
  }

  // Default palette for blobs that don't specify their own colour.
  var PALETTE = ["#FFB347", "#FF7E6B", "#6BCBB8", "#FF8FA6", "#7FB8E8", "#FFD93D"];

  // Fill in optional fields so the rest of the code can assume every blob has a
  // colour, glow, and icon. Adding a letter only requires id/label/copy.
  function normalizeBlobs() {
    BLOBS.forEach(function (b, i) {
      if (!b.color) b.color = PALETTE[i % PALETTE.length];
      if (!b.glow) b.glow = b.color;
      if (!b.icon) b.icon = "heart";
    });
  }

  // Dog ears for the two pup blobs, drawn BEHIND the body path so their bases
  // tuck under the head and they read as part of the silhouette.
  function ears(blob) {
    if (blob.icon === "libby") {
      // Upright pointy ears in the same near-black as the body, with a subtle
      // lighter inner ear for depth.
      return (
        '<path d="M-37 -24 L-31 -54 L-12 -34 Z" fill="' + blob.color + '"/>' +
        '<path d="M37 -24 L31 -54 L12 -34 Z" fill="' + blob.color + '"/>' +
        '<path d="M-32 -28 L-28 -48 L-18 -34 Z" fill="#34324A"/>' +
        '<path d="M32 -28 L28 -48 L18 -34 Z" fill="#34324A"/>'
      );
    }
    if (blob.icon === "nala") {
      // Long floppy labrador ears in a deeper gold than the body so they show.
      return (
        '<path d="M-24 -34 C -46 -33 -51 -9 -45 9 C -42 21 -31 20 -28 6 C -26 -9 -19 -24 -24 -34 Z" fill="#CE9B43"/>' +
        '<path d="M24 -34 C 46 -33 51 -9 45 9 C 42 21 31 20 28 6 C 26 -9 19 -24 24 -34 Z" fill="#CE9B43"/>'
      );
    }
    return "";
  }

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

  // ---------- Modal ----------
  const opened = new Set(); // ids of opened blobs (Task 7 persists this)
  let pendingFinale = false; // set when the last blob opens; fires on dismiss

  function openBlob(id) {
    const blob = BLOBS.find(function (b) { return b.id === id; });
    if (!blob) return;

    document.body.classList.add("modal-open");
    motion.pause();
    const blobEl = document.querySelector('.blob[data-id="' + id + '"]');
    if (blobEl) blobEl.classList.add("is-active");

    document.getElementById("modal-title").textContent = blob.label;
    document.getElementById("modal-body").innerHTML = renderCopy(blob.copy);
    document.getElementById("modal-backdrop").hidden = false;

    if (!opened.has(id)) {
      opened.add(id);
      saveOpened();
      if (blobEl) blobEl.classList.add("is-opened");
      updateCounter();
      // Last blob: wait for the user to dismiss this modal before the finale.
      if (opened.size === BLOBS.length) pendingFinale = true;
    }
  }

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

  // ---------- Finale ----------
  function maybeTriggerFinale() {
    if (opened.size < BLOBS.length) return;
    if (loadFinaleSeen()) return; // already played this session/refresh chain
    saveFinaleSeen();
    showFinale();
  }

  function showFinale() {
    closeModal();
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

  // ---------- Motion engine ----------
  // Owns every blob's on-screen position via transform. Pure math lives in
  // PookieMotion (motion.js); this object owns DOM + the rAF loop.
  const motion = (function () {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stage = null;
    let states = [];          // one runtime state per blob element
    const byId = {};

    let rafId = null;
    let lastT = 0;
    let running = false;
    let dockedCount = 0;

    const MARGIN = 24;        // px gap from stage edges for loose blobs
    const ROW_TOP = 20;       // px: top-left y of the docking strip
    const GRAVITY = 1600;     // px/s^2
    const RESTITUTION = 0.45; // bounce energy retained
    const SETTLE_V = 80;      // px/s: below this on landing, stop bouncing

    // Bottom y of the reserved docking strip. Sized for the FULL blob count
    // (every blob may eventually dock), so the strip can grow to extra rows and
    // wandering blobs still never overlap it.
    function dockBandBottom(d, blobW) {
      const dl = PookieMotion.computeDockLayout(d.w, states.length, blobW, { margin: 20 });
      return ROW_TOP + dl.height + 16;
    }

    function bounds(d, blobW, blobH) {
      return {
        minX: MARGIN,
        maxX: d.w - blobW - MARGIN,
        minY: dockBandBottom(d, blobW),
        maxY: d.h - blobH - MARGIN
      };
    }

    function stageDims() {
      const r = stage.getBoundingClientRect();
      return { w: r.width, h: r.height };
    }

    function writeTransform(s) {
      s.el.style.transform =
        "translate3d(" + s.x.toFixed(2) + "px," + s.y.toFixed(2) + "px,0) scale(" +
        s.scale.toFixed(3) + ")";
    }

    // Build per-blob state. Positions are NOT written here because the stage
    // may be hidden (0×0) at load time. Call place() once the stage is visible.
    function init() {
      stage = document.getElementById("blob-stage");
      if (!stage) return;
      states = [];
      const els = stage.querySelectorAll(".blob");
      els.forEach(function (el) {
        const i = parseInt(el.dataset.index, 10);
        const blob = BLOBS[i];
        const s = {
          id: blob.id, el: el, index: i,
          x: 0, y: 0, vx: 0, vy: 0,
          scale: 1, phase: "static", seed: i * 1.7 + 0.5, slot: -1
        };
        states.push(s);
        byId[blob.id] = s;
      });
    }

    // Position every still-static blob using the deterministic scatter layout
    // (or its optional manual `position` override), kept below the dock strip.
    // Static placement is the reduced-motion path; the animated path computes
    // its own scatter inside start(). Must run when the stage is visible.
    function scatterStatic(d) {
      const blobW = states[0] ? states[0].el.offsetWidth : 88;
      const blobH = states[0] ? states[0].el.offsetHeight : 88;
      const top = dockBandBottom(d, blobW);
      const pts = PookieMotion.scatterLayout(d.w, d.h, states.length, blobW, blobH, { margin: MARGIN, top: top });
      states.forEach(function (s) {
        if (s.phase !== "static") return;
        const blob = BLOBS[s.index];
        let p;
        if (blob.position) {
          p = {
            x: parseFloat(blob.position.left) / 100 * d.w - s.el.offsetWidth / 2,
            y: parseFloat(blob.position.top) / 100 * d.h - s.el.offsetHeight / 2
          };
        } else {
          p = pts[s.index];
        }
        s.x = p.x;
        s.y = p.y;
        writeTransform(s);
      });
    }

    function place() {
      if (!stage) return;
      scatterStatic(stageDims());
    }

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
      if (running) return;
      if (reduced) { place(); return; }   // reduced motion: static placement, no physics
      const d = stageDims();
      states.forEach(function (s) {
        if (s.phase === "docked" || s.phase === "docking") return;
        const blobW = s.el.offsetWidth, blobH = s.el.offsetHeight;
        const b = bounds(d, blobW, blobH);
        s.phase = "falling";
        s.elapsed = 0;
        s.delay = s.index * 0.1;               // stagger the drops
        // Spread the drops evenly across the width (one column per blob) with a
        // small seed jitter, so they start scattered instead of clustering.
        var frac = (s.index + 0.5) / states.length + Math.sin(s.seed * 12.9) * 0.05;
        s.x = PookieMotion.clamp(b.minX + frac * (b.maxX - b.minX), b.minX, b.maxX);
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

    // Slot geometry (wrapping rows) and shared scale, at current stage size.
    function slotLayout() {
      const d = stageDims();
      const sample = states[0] ? states[0].el : null;
      const blobW = sample ? sample.offsetWidth : 88;
      return {
        layout: PookieMotion.computeDockLayout(d.w, states.length, blobW, { margin: 20 }),
        blobW: blobW
      };
    }

    function placeDocked(s) {
      const sl = slotLayout();
      const slot = sl.layout.slots[s.slot];
      s.x = slot.cx - sl.blobW / 2;
      s.y = ROW_TOP + slot.cy;            // cy steps down for wrapped rows
      s.scale = sl.layout.scale;
      writeTransform(s);
    }

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
        if (s.phase === "docked" || s.phase === "docking") {
          // Re-target docked blobs (and any mid-flight one) to the rescaled slot.
          placeDocked(s);
        } else if (s.phase === "wandering" || s.phase === "falling") {
          const b = bounds(d, s.el.offsetWidth, s.el.offsetHeight);
          s.x = PookieMotion.clamp(s.x, b.minX, b.maxX);
          s.y = PookieMotion.clamp(s.y, b.minY, b.maxY);
          writeTransform(s);
        }
      });
      scatterStatic(d);   // re-place any still-static blobs (reduced motion)
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
      var settled = false;
      function onEnd(e) {
        if (e && e.target !== s.el) return;            // ignore transitions bubbling up from .blob-shape child
        if (e && e.propertyName && e.propertyName !== "transform") return; // ignore opacity/filter transitions
        if (settled) return;
        settled = true;
        s.el.removeEventListener("transitionend", onEnd);
        s.el.classList.remove("is-flying");
        s.phase = "docked";
      }
      s.el.addEventListener("transitionend", onEnd);
      // Fallback in case transitionend doesn't fire; called with no event arg, so it passes the propertyName guard.
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

    return {
      reduced: reduced,
      init: init,
      place: place,
      start: start,
      stop: stop,
      pause: pause,
      resume: resume,
      dock: dock,
      predock: predock,
      relayout: relayout,
      dockedCount: function () { return dockedCount; },
      _placeDocked: placeDocked,
      _states: function () { return states; },   // exposed for later tasks
      _byId: function () { return byId; },
      _stageDims: stageDims,
      _writeTransform: writeTransform
    };
  })();

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
        ears(blob) +
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
      el.dataset.index = String(i);
      el.style.setProperty("--blob-glow", blob.glow);
      el.style.setProperty("--pulse-delay", (i * 0.27) + "s");
      el.setAttribute("aria-label", blob.label);
      el.innerHTML =
        '<div class="blob-shape">' + buildBlobSvg(blob) + '</div>' +
        '<div class="blob-label">' + blob.label + '</div>';
      stage.appendChild(el);
    });
  }

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

  // ---------- Init ----------
  function init() {
    normalizeBlobs();
    renderBlobs();
    motion.init();
    restoreState();
    renderStars();

    // Counter total reflects however many letters exist (no hard-coded number).
    const total = document.getElementById("counter-total");
    if (total) total.textContent = String(BLOBS.length);

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

    // Esc closes modal or finale.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeModal();
        closeFinale();
      }
    });

    document.getElementById("finale-close").addEventListener("click", closeFinale);
    document.getElementById("finale-backdrop").addEventListener("click", function (e) {
      if (e.target.id === "finale-backdrop") closeFinale();
    });

    // Counter becomes a re-trigger button once complete.
    document.getElementById("counter").addEventListener("click", function () {
      if (opened.size === BLOBS.length) showFinale();
    });

    // Reset: clear persisted state and reload to splash.
    const resetBtn = document.getElementById("reset-button");
    if (resetBtn) resetBtn.addEventListener("click", function () {
      try {
        localStorage.removeItem(LS_OPENED);
        localStorage.removeItem(LS_FINALE_SEEN);
      } catch (e) {}
      window.location.reload();
    });

    let resizeRaf = null;
    window.addEventListener("resize", function () {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(function () { motion.relayout(); });
    });

    console.log("pookie: ready", { blobs: BLOBS.length });
  }

  function openPlayground() {
    document.body.classList.remove("state-splash");
    document.body.classList.add("state-playground");
    const splash = document.querySelector(".splash");
    const playground = document.querySelector(".playground");
    if (splash) splash.style.display = "none";
    if (playground) playground.hidden = false;
    // Re-place docked blobs now that the stage has real dimensions (at load
    // the playground is hidden so stageDims() returns 0×0; predock wrote
    // placeholder transforms then). Non-docked blobs get correct positions
    // via start() below.
    motion.relayout();
    motion.start(); // stage now has real dims; begin entrance drop or static placement
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
