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
      copy: "[TODO] The silly origin story of the name \"pookiedooks\" — where it came from, told with a grin.",
    },
    {
      id: "knew", label: "die oomblik",
      color: "#FFD93D", glow: "#FFD93D", icon: "spark",
      copy: "[TODO] The specific moment you *knew* — one concrete image/scene, not \"from the start\".",
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
      copy: "[TODO] Keep the charming image (pizza on the floor, half-empty rooms) but make it about the funny intimacy of the emptying house — not \"you do it all in a week\".",
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
      copy: "[TODO] Deepen — Libby, \"my swartbessie\" (with you ~1 year). The ache of leaving her; Ouma will spoil her rotten.",
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

  // TODO (Christel): refine wording freely. Phrasing kept timeless on purpose so it can't go stale.
  const FINALE_COPY =
    "Pookiedooks,\n\n" +
    "'n Paar maande gelede het ek my naam langs joune geskryf en gesê *vir altyd*. Binnekort verhuis ons na 'n nuwe land. Ons groet binnekort vir Libby en Nala. En tussen al hierdie groot dinge — die move, die troue, die werk, die therapy — is jy steeds die een wat alles bymekaar hou.\n\n" +
    "Jy kla nie. Jy doen net. Jy maak my lag wanneer ek vergeet om te lag. Jy weet wanneer dit 8:57 is sonder om te kyk.\n\n" +
    "Ek's so dankbaar dat jy myne is. Ek's so trots op die mens wat jy is en wie jy elke dag word. En ek kan nie wag om Bangkok saam met jou te ontdek nie.\n\n" +
    "Lief jou. Altyd.";

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
      imgBox.setAttribute("role", "img");
      imgBox.setAttribute("aria-label", d.name);
      // Fill via background-size:cover (bulletproof). Preload so the gradient stays
      // as the fallback if the photo is missing; only swap it in once it loads.
      const probe = new Image();
      probe.onload = function () {
        imgBox.style.backgroundImage = 'url("' + d.img + '")';
      };
      probe.onerror = function () { card.classList.add("img-failed"); };
      probe.src = d.img;

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
      sun:      '<circle cx="0" cy="0" r="4" fill="#1A1B3A"/><g stroke="#1A1B3A" stroke-width="2" stroke-linecap="round"><line x1="0" y1="-7" x2="0" y2="-9"/><line x1="0" y1="7" x2="0" y2="9"/><line x1="-7" y1="0" x2="-9" y2="0"/><line x1="7" y1="0" x2="9" y2="0"/><line x1="-5" y1="-5" x2="-7" y2="-7"/><line x1="5" y1="-5" x2="7" y2="-7"/></g>',
      plane:    '<path d="M-8 0 L8 0 M0 -4 L0 4 M5 -2 L8 0 L5 2" fill="none" stroke="#1A1B3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      speech:    '<rect x="-8" y="-7" width="16" height="11" rx="3" fill="none" stroke="#1A1B3A" stroke-width="2"/><path d="M-3 4 L-3 8 L2 4 Z" fill="#1A1B3A"/>',
      spark:     '<path d="M0 -8 L1.6 -1.6 L8 0 L1.6 1.6 L0 8 L-1.6 1.6 L-8 0 L-1.6 -1.6 Z" fill="#1A1B3A"/>',
      pin:       '<path d="M0 7 C -5 1 -5 -4 0 -7 C 5 -4 5 1 0 7 Z" fill="none" stroke="#1A1B3A" stroke-width="2"/><circle cx="0" cy="-2.5" r="2.2" fill="#1A1B3A"/>',
      note:      '<circle cx="-3" cy="5" r="2.8" fill="#1A1B3A"/><path d="M-0.2 5 L-0.2 -7 L6 -9" stroke="#1A1B3A" stroke-width="2" fill="none" stroke-linecap="round"/>',
      hands:     '<circle cx="-2.5" cy="0" r="5" fill="none" stroke="#1A1B3A" stroke-width="2"/><circle cx="2.5" cy="0" r="5" fill="none" stroke="#1A1B3A" stroke-width="2"/>',
      crescents: '<path d="M0 -5 A6.5 6.5 0 1 0 0 6 A5 5 0 1 1 0 -5 Z" fill="#1A1B3A"/><path d="M4 -8 L8 -8 L4 -4 L8 -4" stroke="#1A1B3A" stroke-width="1.6" fill="none" stroke-linejoin="round"/>',
      wave:      '<path d="M-8 1 Q-4 -4 0 1 T8 1" fill="none" stroke="#1A1B3A" stroke-width="2" stroke-linecap="round"/><path d="M-8 5 Q-4 0 0 5 T8 5" fill="none" stroke="#1A1B3A" stroke-width="2" stroke-linecap="round"/>',
      mountain:  '<path d="M-8 6 L-4 -4 L4 -4 L8 6 Z" fill="none" stroke="#1A1B3A" stroke-width="2" stroke-linejoin="round"/>',
      box:       '<path d="M-7 -2 L0 -6 L7 -2 L0 2 Z" fill="none" stroke="#1A1B3A" stroke-width="1.8" stroke-linejoin="round"/><path d="M-7 -2 L-7 5 L0 9 L0 2 M7 -2 L7 5 L0 9" fill="none" stroke="#1A1B3A" stroke-width="1.8" stroke-linejoin="round"/>',
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
  const LS_TRIP_PICK = "pookie:trip-pick";

  function loadTripPick() {
    try { return localStorage.getItem(LS_TRIP_PICK) || null; }
    catch (e) { return null; }
  }
  function saveTripPick(id) {
    try { localStorage.setItem(LS_TRIP_PICK, id); } catch (e) {}
  }

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

  // ---------- Modal ----------
  const opened = new Set(); // ids of opened blobs (Task 7 persists this)
  let pendingFinale = false; // set when the last blob opens; fires on dismiss

  function openBlob(id) {
    const blob = BLOBS.find(function (b) { return b.id === id; });
    if (!blob) return;
    idleHint.kick();

    document.body.classList.add("modal-open");
    motion.pause();
    const blobEl = document.querySelector('.blob[data-id="' + id + '"]');
    if (blobEl) blobEl.classList.add("is-active");

    document.getElementById("modal-title").textContent = blob.label;
    document.getElementById("modal-body").innerHTML = renderCopy(blob.copy);
    document.getElementById("modal-backdrop").hidden = false;
    focusTrap.activate(document.getElementById("modal-card"));

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
    focusTrap.release();

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
    gotoFinaleStep("letter");                 // always open on the letter (no slide)
    document.getElementById("finale-backdrop").hidden = false;
    focusTrap.activate(document.getElementById("finale-card"));
    spawnConfetti();
    highlightSavedPick();
  }

  // Switch between the two finale steps (letter ↔ picker) inside the one dialog.
  // `dir` ("fwd"/"back") triggers the slide animation + moves focus; omit it for
  // the initial open (focus is handled by the focus trap).
  function gotoFinaleStep(step, dir) {
    const letter = document.getElementById("finale-step-letter");
    const picker = document.getElementById("finale-step-picker");
    const scroll = document.getElementById("finale-scroll");
    if (!letter || !picker) return;
    const toShow = step === "picker" ? picker : letter;
    const toHide = step === "picker" ? letter : picker;
    toHide.hidden = true;
    toShow.hidden = false;
    if (dir) {
      toShow.classList.remove("step-anim");
      void toShow.offsetWidth;               // restart the slide animation
      toShow.setAttribute("data-dir", dir);
      toShow.classList.add("step-anim");
    }
    if (scroll) scroll.scrollTop = 0;         // each step starts at the top
    if (step === "picker") highlightSavedPick();
    if (dir) {
      const focusEl = step === "picker"
        ? (toShow.querySelector(".dest-card") || toShow.querySelector("button"))
        : toShow.querySelector("button");
      if (focusEl) focusEl.focus();
    }
  }

  function closeFinale() {
    document.getElementById("finale-backdrop").hidden = true;
    focusTrap.release();
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
        '<circle class="blob-halo" cx="0" cy="0" r="48" fill="url(#halo-' + blob.id + ')"/>' +
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
      const el = pool[Math.floor(Math.random() * pool.length)];
      el.classList.add("is-hint");
      setTimeout(function () { el.classList.remove("is-hint"); }, 2500);
      timer = setTimeout(nudge, REPEAT_MS);
    }

    function kick() {
      if (motion.reduced) return;                    // respect reduced motion
      if (timer) clearTimeout(timer);
      if (opened.size >= BLOBS.length) return;       // nothing left to find
      timer = setTimeout(nudge, IDLE_MS);
    }

    return { kick: kick, start: kick };
  })();

  // ---------- Init ----------
  function init() {
    normalizeBlobs();
    renderBlobs();
    motion.init();
    restoreState();
    renderStars();
    renderDestinations();

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

    document.getElementById("finale-next").addEventListener("click", function () {
      gotoFinaleStep("picker", "fwd");
    });
    document.getElementById("finale-back").addEventListener("click", function () {
      gotoFinaleStep("letter", "back");
    });

    document.getElementById("dest-cards").addEventListener("click", function (e) {
      const card = e.target.closest(".dest-card");
      if (card) pickDestination(card.dataset.id);
    });

    // Counter becomes a re-trigger button once complete.
    document.getElementById("counter").addEventListener("click", function () {
      if (opened.size === BLOBS.length) showFinale();
    });
    document.getElementById("counter").addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && opened.size === BLOBS.length) {
        e.preventDefault();
        showFinale();
      }
    });

    // Reset: clear persisted state and reload to splash.
    const resetBtn = document.getElementById("reset-button");
    if (resetBtn) resetBtn.addEventListener("click", function () {
      try {
        localStorage.removeItem(LS_OPENED);
        localStorage.removeItem(LS_FINALE_SEEN);
        localStorage.removeItem(LS_TRIP_PICK);
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
    idleHint.start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
