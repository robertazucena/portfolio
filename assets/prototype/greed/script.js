/* Greed: hero film, telemetry, drag-to-turn studio, scroll light sweep, tech deck, finish compare, command bar */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var pad = function (n, w) { n = String(n); while (n.length < w) n = "0" + n; return n; };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var go = function (el) { el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); };

  /* the car renders carry alpha and the rooms sit behind them in CSS, so a new paint is a new folder here */
  var M = function () { return "media/"; };
  var V = "?v=3";   /* the render set: bump it when the car is re-rendered, so cached frames refresh */

  /* ---------- hero film ---------- */
  var film = $(".hero-film"), filmBtn = $("[data-film-toggle]");
  function setFilm(play) {
    if (!film) return;
    if (play) { var p = film.play(); if (p && p.catch) p.catch(function () {}); } else film.pause();
    filmBtn.setAttribute("aria-pressed", String(!play));
    filmBtn.setAttribute("aria-label", play ? "Pause the film" : "Play the film");
    filmBtn.querySelector("i").textContent = play ? "❙❙" : "▶";
  }
  if (reduce) setFilm(false);
  filmBtn.addEventListener("click", function () { setFilm(film.paused); });

  /* ---------- landing: the hero stands alone until you enter, and the page then starts at the studio ---------- */
  var html = document.documentElement, gated = function () { return html.classList.contains("gate"); };
  var scrollTo0 = go;
  function enter(el) {
    var land = function () {
      html.classList.remove("gate", "gate-out"); html.classList.add("entered");
      if (film) film.pause();
      dispatchEvent(new Event("resize"));   // the cockpit and the hotspots measure themselves now they are on screen
      scrollTo(0, el.getBoundingClientRect().top + scrollY);
      if (el.id && location.hash !== "#" + el.id) history.pushState(null, "", "#" + el.id);
      if (!reduce) arrive(el);
    };
    if (reduce) land(); else { preloadTurn(); html.classList.add("gate-out"); driveOff(land); }
  }
  /* leaving the landing: the film runs on to the next moment the car is side-on, nose left, stops there, and the car
     pulls away to the left, blurring as it gathers speed. The orbit passes that profile twice a loop (out and back) */
  var prof = $(".hero-profile");
  if (prof && prof.decode) prof.decode().catch(function () {});   // decoded ahead, so the swap is instant
  function driveOff(done) {
    if (!film || !prof || film.readyState < 2 || !film.offsetWidth) { setTimeout(done, 800); return; }
    var D = film.duration || 22.6, A = 5.65 / 22.6 * D, B = 16.95 / 22.6 * D;
    var now = film.currentTime, target = now <= A ? A : now <= B ? B : A + D, base = 0, last = now, t0 = performance.now();
    film.playbackRate = Math.min(6, Math.max(1, (target - now) / .9)); film.play();   // faster than ~6x the alpha film can't decode
    (function turnTo() {
      var t = film.currentTime; if (t + 1 < last) base += D; last = t;
      if (base + t < target - .03 && performance.now() - t0 < 1200) { requestAnimationFrame(turnTo); return; }
      film.pause(); film.playbackRate = 1;
      // swap to the profile still and drive that off: the frame is exact, where a seek can still be landing as the car leaves
      prof.hidden = false; film.style.visibility = "hidden";
      var blur = $("#mblur feGaussianBlur"), DUR = 800;
      prof.style.filter = "url(#mblur)";
      var run = prof.animate([{ transform: "translateX(0)" }, { transform: "translateX(-115vw)" }], { duration: DUR, easing: "cubic-bezier(.5,0,.85,.4)", fill: "forwards" });
      (function streak() {
        var k = Math.min(1, (run.currentTime || 0) / DUR); blur.setAttribute("stdDeviation", (30 * k * k).toFixed(1) + " 0");
        if (k < 1 && run.playState === "running") requestAnimationFrame(streak);
      })();
      run.onfinish = function () {
        done(); run.cancel(); prof.style.filter = ""; prof.hidden = true; blur.setAttribute("stdDeviation", "0 0");
        film.currentTime = target % D; film.style.visibility = "";   // back on the landing, the film picks up from the profile
      };
    })();
  }
  /* arriving in a section: its text rises in one piece at a time, and in the studio the car turns into place */
  function arrive(el) {
    var parts = $$(".stage-head > *, .studio-side > *, .lines, .scrub, .turn-hud", el);
    parts.forEach(function (p, i) { p.style.setProperty("--i", i); });
    el.classList.remove("arrive"); void el.offsetWidth; el.classList.add("arrive");
    setTimeout(function () { el.classList.remove("arrive"); }, 1800);
    if (el.id === "studio") spinIn();
  }
  function toLanding(push) {
    html.classList.remove("entered"); html.classList.add("gate"); scrollTo(0, 0);
    if (film && !reduce) setFilm(true);
    if (push) history.pushState(null, "", location.pathname + location.search);
  }
  var replayBoot = null;   // set by the boot below
  go = function (el) {
    if (el.id === "top" || el.classList.contains("hero")) {   // home: the loader plays again, then the landing
      if (replayBoot && !reduce) replayBoot(function () { if (!gated()) toLanding(true); else scrollTo(0, 0); if (film) film.pause(); });
      else if (!gated()) toLanding(true);
      return;
    }
    if (gated()) enter(el); else scrollTo0(el);
  };
  document.addEventListener("click", function (e) {   // every in-page link goes through the landing
    var a = e.target.closest('a[href^="#"]'), el = a && document.getElementById(a.getAttribute("href").slice(1));
    if (el) { e.preventDefault(); go(el); }
  });
  addEventListener("popstate", function () {   // back from the studio returns to the landing
    var el = location.hash && document.getElementById(location.hash.slice(1));
    if (!el || el.id === "top") { if (!gated()) toLanding(false); } else if (gated()) enter(el);
  });

  /* ---------- telemetry count-up ---------- */
  function startCount() {
    $$("[data-count]").forEach(function (b) {
      var to = parseFloat(b.dataset.count), dec = +b.dataset.dec;
      var fmt = function (v) { return v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
      if (reduce) { b.textContent = fmt(to); return; }
      var t0 = null;
      function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1400); b.textContent = fmt(to * easeOut(k)); if (k < 1) requestAnimationFrame(step); }
      setTimeout(function () { requestAnimationFrame(step); }, 450);
    });
  }

  /* ---------- studio: drag to turn (72 rendered frames, 5 degrees apart) ---------- */
  var FR = 72, turn = $(".turn"), turnImg = $(".turn-img"), angleEl = $("[data-angle]"), angleBar = $("[data-angle-bar]");
  var frames = [], cur = 0;
  function src(i) { return M() + "turn/tt_" + pad(i + 1, 2) + ".webp" + V; }
  function preloadTurn() {
    if (frames.length) return;
    for (var i = 0; i < FR; i++) { var im = new Image(); im.decoding = "async"; im.src = src(i); frames.push(im); }
  }
  function show(i) {
    cur = ((Math.round(i) % FR) + FR) % FR;
    turnImg.src = src(cur);
    var deg = cur * 5;
    angleEl.textContent = pad(deg, 3) + "°";
    angleBar.style.left = (cur / FR * 92) + "%";
    turn.setAttribute("aria-valuenow", deg); turn.setAttribute("aria-valuetext", deg + " degrees");
    placeHs();
  }
  var drag = null, vel = 0, pos = 0, spin = null;
  turn.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".hs, .hs-card")) return;
    preloadTurn(); cancelAnimationFrame(spin);
    drag = { x: e.clientX, p: pos, t: e.timeStamp, lx: e.clientX }; vel = 0;
    turn.setPointerCapture(e.pointerId);
  });
  turn.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var perPx = FR / Math.max(600, turn.clientWidth);        // one full drag across = one turn
    pos = drag.p - (e.clientX - drag.x) * perPx;
    var dt = Math.max(1, e.timeStamp - drag.t);
    vel = -(e.clientX - drag.lx) * perPx / dt * 16;
    drag.t = e.timeStamp; drag.lx = e.clientX;
    show(pos);
  });
  function release() {
    if (!drag) return; drag = null;
    if (reduce) return;
    (function coast() {                                       // momentum, then settle
      vel *= 0.93; pos += vel; show(pos);
      if (Math.abs(vel) > 0.02) spin = requestAnimationFrame(coast);
    })();
  }
  turn.addEventListener("pointerup", release);
  turn.addEventListener("pointercancel", release);
  turn.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); preloadTurn(); pos += e.key === "ArrowRight" ? 1 : -1; show(pos); }
  });
  function spinIn() {   // a third of a turn back, easing into the first frame; frames still loading are skipped
    preloadTurn(); cancelAnimationFrame(spin);
    var from = -24, t0 = null; pos = from;
    spin = requestAnimationFrame(function step(t) {
      if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1500), p = from * (1 - easeOut(k));
      var f = frames[((Math.round(p) % FR) + FR) % FR];
      if (k === 1 || (f && f.complete && f.naturalWidth)) { pos = p; show(pos); }
      if (k < 1) spin = requestAnimationFrame(step);
    });
  }
  function spinOnce() {
    preloadTurn(); cancelAnimationFrame(spin);
    if (reduce) { pos = 18; show(pos); return; }
    var from = pos, t0 = null;
    spin = requestAnimationFrame(function step(t) {
      if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 2600);
      pos = from + FR * (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2); show(pos);
      if (k < 1) spin = requestAnimationFrame(step);
    });
  }

  /* ---------- studio info points: positions projected from the 3D model for every frame ---------- */
  var HS = {
    light:  { t: "Light signature", d: "A single LED filament, 0.8 mm fine. It reads 600 m of road and dims pixel by pixel for oncoming traffic.", v: "600", u: "m of road ahead" },
    wheel:  { t: "Aero wheels", d: "Forged carbon, 21 inches. At speed the blades close, so air slips clean along the flank.", v: "21", u: "in, forged carbon" },
    intake: { t: "Breathing flank", d: "It opens only when the core asks for air, then seals flush, as if it were never there.", v: "0.21", u: "Cd when sealed" },
    cabin:  { t: "A cabin for two", d: "Two seats in a carbon tub, and a windscreen that sees heat and depth.", v: "2", u: "seats, carbon tub" },
    rear:   { t: "Tri-motor rear", d: "Three motors share torque wheel by wheel. It steers with power as much as with the wheel.", v: "1,480", u: "hp" }
  };
  var hsKeys = Object.keys(HS), hsPts = null, hsBtns = {}, hsIdx = {}, hsOpen = null;
  var hsLayer = $("[data-hs-layer]"), hsCard = $("[data-hs-card]"), hsList = $("[data-hs-index]");
  hsKeys.forEach(function (k, i) {
    var b = hsLayer.appendChild(document.createElement("button"));
    b.type = "button"; b.className = "hs off"; b.tabIndex = -1; b.dataset.hs = k; b.setAttribute("aria-label", HS[k].t);
    b.innerHTML = "<span>" + pad(i + 1, 2) + "<em>" + HS[k].t + "</em></span>";
    hsBtns[k] = b;
    var ib = hsList.appendChild(document.createElement("li")).appendChild(document.createElement("button"));
    ib.type = "button"; ib.setAttribute("aria-pressed", "false");
    ib.innerHTML = '<span class="mono">' + pad(i + 1, 2) + "</span>" + HS[k].t;
    ib.addEventListener("click", function () { tour(k); });
    hsIdx[k] = ib;
  });
  function mapX(x) {                 // frames are 16:9; on phones the studio crops them to 4:3
    var k = (turnImg.clientWidth / turnImg.clientHeight) / (16 / 9);
    return k < 1 ? (x - (1 - k) / 2) / k : x;
  }
  function placeHs() {
    if (!hsPts) return;
    hsKeys.forEach(function (k) {
      var p = hsPts[k].f[cur], x = mapX(p[0]), on = p[2] && x > .03 && x < .97, b = hsBtns[k];
      b.style.left = (x * 100) + "%"; b.style.top = (p[1] * 100) + "%";
      b.classList.toggle("off", !on); b.classList.toggle("flip", x > .72); b.tabIndex = on ? 0 : -1;
    });
    if (hsOpen) placeCard();
  }
  function placeCard() {
    var b = hsBtns[hsOpen], x = parseFloat(b.style.left) / 100, y = parseFloat(b.style.top) / 100;
    var W = hsLayer.clientWidth, H = hsLayer.clientHeight, cw = hsCard.offsetWidth, ch = hsCard.offsetHeight;
    hsCard.classList.toggle("away", b.classList.contains("off"));
    hsCard.style.left = (8 + x * W + (x > .58 ? -cw - 34 : 34)) + "px";
    hsCard.style.top = (8 + Math.min(Math.max(12, y * H - ch / 2), H - ch - 56)) + "px";
  }
  function openHs(k) {
    var h = HS[k]; hsOpen = k;
    $("[data-hs-n]").textContent = pad(hsKeys.indexOf(k) + 1, 2) + " / " + pad(hsKeys.length, 2);
    $("[data-hs-t]").textContent = h.t; $("[data-hs-d]").textContent = h.d;
    $("[data-hs-v]").textContent = h.v; $("[data-hs-u]").textContent = h.u;
    hsCard.hidden = false;
    hsKeys.forEach(function (j) { hsBtns[j].classList.toggle("on", j === k); hsIdx[j].setAttribute("aria-pressed", String(j === k)); });
    placeCard();
  }
  function closeHs() {
    hsOpen = null; hsCard.hidden = true;
    hsKeys.forEach(function (j) { hsBtns[j].classList.remove("on"); hsIdx[j].setAttribute("aria-pressed", "false"); });
  }
  function tour(k) {                 // turn the short way round to the angle that shows this part best
    preloadTurn(); cancelAnimationFrame(spin);
    if (!hsPts) return openHs(k);
    var from = pos, d = ((hsPts[k].best - cur) % FR + FR + FR / 2) % FR - FR / 2;
    if (reduce || !d) { pos = from + d; show(pos); return openHs(k); }
    closeHs();
    var t0 = null, dur = 500 + Math.abs(d) * 18;
    spin = requestAnimationFrame(function step(t) {
      if (!t0) t0 = t; var q = Math.min(1, (t - t0) / dur);
      pos = from + d * (q < .5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2); show(pos);
      if (q < 1) spin = requestAnimationFrame(step); else openHs(k);
    });
  }
  hsLayer.addEventListener("click", function (e) {
    var b = e.target.closest(".hs"); if (!b) return;
    if (hsOpen === b.dataset.hs) closeHs(); else openHs(b.dataset.hs);
  });
  $("[data-hs-close]").addEventListener("click", closeHs);
  addEventListener("keydown", function (e) { if (e.key === "Escape" && hsOpen) closeHs(); });
  addEventListener("resize", placeHs);
  hsPts = window.GREED_POINTS || null; placeHs();   // loaded as a script so it also works when the page is opened from disk

  /* ---------- light sweep: scroll-scrubbed canvas ---------- */
  var SW = 90, sweep = $(".sweep"), cv = $(".sweep-canvas"), ctx = cv.getContext("2d");
  var swImgs = [], swLast = -1, pctEl = $("[data-sweep-pct]"), barEl = $("[data-sweep-bar]");
  function loadSweep() {
    swImgs = [];
    for (var s = 0; s < SW; s++) { var si = new Image(); si.decoding = "async"; si.src = M() + "sweep/sw_" + pad(s + 1, 2) + ".webp" + V; swImgs.push(si); }
  }
  loadSweep();
  function drawSweep(i) {
    var im = swImgs[i];
    if (!im.complete || !im.naturalWidth) { im.onload = function () { if (swLast === i) drawSweep(i); }; return; }
    ctx.clearRect(0, 0, cv.width, cv.height); ctx.drawImage(im, 0, 0, cv.width, cv.height);   // the lit frames carry alpha
  }
  function onSweep() {
    var r = sweep.getBoundingClientRect(), span = sweep.offsetHeight - innerHeight;
    var k = Math.min(1, Math.max(0, -r.top / Math.max(1, span)));
    var i = Math.round(k * (SW - 1));
    if (i !== swLast) { swLast = i; drawSweep(i); }
    pctEl.textContent = Math.round(k * 100) + "%"; barEl.style.width = (k * 100) + "%";
    lineAt(k);
  }
  /* the lines list follows the beam: passed lines stay lit, the newest one carries the note */
  var lineEls = $$(".lines li"), lineNote = $("[data-line-note]"), lineNow = -1;
  var NOTES = ["The nose folds to a blade, so air splits before it reaches the arches.",
    "The front arch rises clear of the bonnet and pulls the wheel into the body.",
    "One fold runs from the mirror to the intake, cut to feed the side radiators.",
    "The intake breathes for the rear motors and the battery under the floor.",
    "The rear haunch swells over the drive wheels, the widest point of the car.",
    "The diffuser lifts the floor away at the tail and pulls the car down."];
  function lineAt(k) {
    var n = -1;
    lineEls.forEach(function (li, i) { var on = k >= +li.dataset.at; li.classList.toggle("lit", on); if (on) n = i; });
    if (n === lineNow) return;
    lineNow = n; lineEls.forEach(function (li, i) { li.classList.toggle("now", i === n); });
    lineNote.textContent = n < 0 ? "Hold still. The light begins at the nose." : NOTES[n];
  }
  if (reduce) { swLast = 50; drawSweep(50); pctEl.textContent = "100%"; barEl.style.width = "100%"; lineAt(1); }
  else {
    var swQueued = false;   // one redraw per frame, however many scroll events arrive
    addEventListener("scroll", function () { if (!swQueued) { swQueued = true; requestAnimationFrame(function () { swQueued = false; onSweep(); }); } }, { passive: true });
    onSweep();
  }

  /* the film has alpha: VP9 for Chrome and Firefox, HEVC for Safari (WebKit plays VP9 but drops its alpha) */
  var srcs = film ? $$("source", film) : [];
  if (srcs.length > 1 && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) { film.insertBefore(srcs[1], srcs[0]); film.load(); }

  /* ---------- drive test: a simulated 1:52 lap, read out about ten times a second while the studio is on screen ---------- */
  var tele = $(".drive");
  if (tele) {
    var T = {}; $$("[data-t]", tele).forEach(function (el) { T[el.dataset.t] = el; });
    var LAP = 112, TAU = Math.PI * 2, teleOn = false, teleLast = 0, teleT = 0;
    var vAt = function (t) {   // km/h: long straights, hard braking into the corners, 60 to 312
      return Math.max(60, Math.min(312, 178 + 96 * Math.sin(TAU * t / 23) + 38 * Math.sin(TAU * t / 9.1 + 1)));
    };
    var readout = function (t) {
      var v = vAt(t), dv = (vAt(t + .1) - v) / .1;   // km/h per second: + accelerating, - braking
      var g = (1 - (v - 60) / 252) * 2.15 * Math.abs(Math.sin(TAU * t / 7.3)) + .04 * Math.sin(t * 13);
      var kw = dv > 0 ? Math.min(1120, 140 + v * 1.6 + dv * 9) : Math.max(-420, dv * 6);   // negative: braking puts charge back
      var lt = t % LAP, m = Math.floor(lt / 60), s = lt - m * 60;
      T.lap.textContent = m + ":" + (s < 10 ? "0" : "") + s.toFixed(1);
      T.speed.textContent = Math.round(v);
      T.bar.style.setProperty("--v", (v / 312).toFixed(3));
      T.rpm.textContent = (Math.round(v * 58 / 10) * 10).toLocaleString("en");
      T.g.textContent = Math.max(0, g).toFixed(2);
      T.kw.textContent = (kw < 0 ? "\u2212" : "") + Math.abs(Math.round(kw)).toLocaleString("en");
      T.kw.classList.toggle("regen", kw < 0);
      T.temp.textContent = (38 + 7 * lt / LAP + .3 * Math.sin(t / 3)).toFixed(1);
    };
    var teleTick = function (now) {
      if (!teleOn) return;
      if (now - teleLast > 95) { teleT += Math.min(.2, (now - teleLast) / 1000); teleLast = now; readout(teleT); }
      requestAnimationFrame(teleTick);
    };
    teleT = 31; readout(teleT);   // a mid-lap moment, also the still reading for reduced motion
    if (!reduce && "IntersectionObserver" in window) new IntersectionObserver(function (es) {
      var vis = es[0].isIntersecting;
      if (vis && !teleOn) { teleOn = true; teleLast = performance.now(); requestAnimationFrame(teleTick); }
      if (!vis) teleOn = false;
    }).observe(tele);
  }

  /* ---------- boot: a beam of light sweeps the car as real load progress ---------- */
  var root = document.documentElement, boot = $(".boot");
  if (!boot) startCount();
  else {
    var seq = swImgs, need = seq.slice();   // the sweep frames, so the pinned section is ready when you reach it
    var bRoom = new Image(); bRoom.src = M() + "room-boot.webp" + V;   // the frame shows the car in the Light showroom (the centre of room-side-wide)
    bRoom.onload = function () { lastF = -1; };
    var bcv = $(".boot-cv"), bctx = bcv.getContext("2d"), bPct = $("[data-boot-pct]"), bBar = $("[data-boot-bar]"), bLetters = $$(".boot-word span");
    [M() + "film-poster.webp" + V, M() + "turn/tt_01.webp" + V].forEach(function (u) { var im = new Image(); im.src = u; need.push(im); });
    var filmReady = !film || film.readyState >= 3;
    if (!filmReady) film.addEventListener("canplay", function () { filmReady = true; }, { once: true });
    var seen = false; try { seen = sessionStorage.getItem("greed-booted") === "1"; } catch (e) {}
    var t0 = performance.now(), MIN = reduce ? 0 : seen ? 700 : 1900, MAX = 9000, shown = 0, lastF = -1, total = need.length + 1, imgsAt = 0;
    var bootTick = function (now) {
      var loaded = 0;
      for (var n = 0; n < need.length; n++) if (need[n].complete) loaded++;
      if (loaded === need.length && !imgsAt) imgsAt = now;
      if (filmReady || (imgsAt && now - imgsAt > 600)) loaded++;   // the poster covers the hero, so the film never holds the loader long
      var el = Math.max(0, now - t0), real = el > MAX ? 1 : loaded / total;
      var target = Math.min(real, MIN ? Math.min(1, el / MIN) : 1);
      shown += (target - shown) * (reduce ? 1 : .12);
      if (target === 1 && shown > .996) shown = 1;
      var f = Math.min(seq.length - 1, Math.max(0, Math.round(shown * (seq.length - 1))));
      if (f !== lastF && seq[f].complete && seq[f].naturalWidth) {
        bctx.clearRect(0, 0, bcv.width, bcv.height);
        if (bRoom.complete && bRoom.naturalWidth) bctx.drawImage(bRoom, 0, 0, bcv.width, bcv.height);
        bctx.drawImage(seq[f], 0, 0, bcv.width, bcv.height); lastF = f;
      }
      bPct.textContent = pad(Math.round(shown * 100), 3);
      bBar.parentNode.style.setProperty("--p", shown.toFixed(4));
      bLetters.forEach(function (l, i) { l.classList.toggle("on", shown >= (i + .5) / bLetters.length); });
      if (shown < 1) requestAnimationFrame(bootTick); else bootDone();
    };
    var bootDone = function () {
      try { sessionStorage.setItem("greed-booted", "1"); } catch (e) {}
      setTimeout(bootOpen, reduce ? 0 : 260);
    };
    var bootOpen = function () {
      root.classList.add("boot-out"); root.classList.remove("boot-on");
      $("[data-boot-status]").textContent = "Greed is ready";
      if (film && !reduce && gated()) { film.currentTime = 0; setFilm(true); }
      startCount();   // the hero figures count up again on a replay too
      setTimeout(function () { root.classList.remove("boot-out"); }, reduce ? 250 : 1600);   // the loader itself is kept, so the logo can play it again
    };
    requestAnimationFrame(bootTick);
    /* the logo and every link home play the loader again over the page, and the landing is set up behind it */
    replayBoot = function (behind) {
      if (root.classList.contains("boot-on")) return;
      root.classList.remove("boot-out"); root.classList.add("boot-on");
      $("[data-boot-status]").textContent = "Loading Greed";
      t0 = performance.now(); MIN = 1500; shown = 0; lastF = -1; imgsAt = 0;
      bLetters.forEach(function (l) { l.classList.remove("on"); });
      setTimeout(function () { behind(); }, 120);   // once the loader covers the page
      requestAnimationFrame(bootTick);
    };
  }

  /* ---------- technologies deck ---------- */
  var cards = $$(".card");
  function openCard(c) { cards.forEach(function (x) { x.classList.toggle("is-open", x === c); }); }
  cards.forEach(function (c) {
    c.addEventListener("mouseenter", function () { if (matchMedia("(hover: hover)").matches) openCard(c); });
    c.addEventListener("focus", function () { openCard(c); });
    c.addEventListener("click", function () { openCard(c); });
  });
  var morph = $("[data-morph]");
  if (!reduce) setInterval(function () { morph.textContent = 11 + Math.round(Math.random() * 6); }, 1600);

  /* ---------- finish: black / white compare ---------- */
  var stage = $(".finish-stage"), range = $(".finish-range"), finishLabel = $("[data-finish-label]");
  function setFinish(v) {
    range.value = v; stage.style.setProperty("--x", v + "%"); stage.style.setProperty("--xf", v / 100);
    finishLabel.textContent = v < 50 ? "Gloss white" : "Metallic black";
    swatches.forEach(function (b) { b.setAttribute("aria-pressed", String((+b.dataset.finish >= 50) === (v >= 50))); });
  }
  var swatches = $$("[data-finish]");
  swatches.forEach(function (b) { b.addEventListener("click", function () { animateFinish(+b.dataset.finish); }); });
  range.addEventListener("input", function () { setFinish(+range.value); });
  function animateFinish(to) {
    if (reduce) return setFinish(to);
    var from = +range.value, t0 = null;
    requestAnimationFrame(function step(t) {
      if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 900), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      setFinish(Math.round(from + (to - from) * e)); if (k < 1) requestAnimationFrame(step);
    });
  }

  /* ---------- command bar: answers by moving the page ---------- */
  var form = $(".cmd-shell"), input = $("#ask"), answer = $(".answer"), mic = $("[data-mic]");
  /* phones hide the "Ask Greed" prefix, so the placeholder carries it there */
  function askHint() { return matchMedia("(max-width: 760px)").matches ? "Ask Greed anything" : "anything"; }
  input.placeholder = askHint();
  var toPart = function (k) { return function () { go($("#studio")); setTimeout(function () { tour(k); }, reduce ? 0 : 600); }; };
  var INTENTS = [
    { re: /headlight|lamp|\bled\b/, say: "The <b>light signature</b>: one LED filament that reads 600 m ahead.", act: toPart("light") },
    { re: /wheel|rim|tyre|tire/, say: "<b>Aero wheels</b>, 21-inch forged carbon.", act: toPart("wheel") },
    { re: /intake|vent|cool/, say: "The <b>breathing flank</b> opens only when the core needs air.", act: toPart("intake") },
    { re: /cabin|seat|interior|inside/, say: "Two seats in a <b>carbon tub</b>.", act: toPart("cabin") },
    { re: /motor|rear|horse ?power|\bhp\b|power/, say: "<b>Three motors</b>, 1,480 hp, torque split wheel by wheel.", act: toPart("rear") },
    { re: /parts?|details?|points?|spec/, say: "Here are the <b>details</b>. Tap any point on the car.", act: toPart("light") },
    { re: /range|charge|battery|km|far|solid|core/, say: "<b>1,040 km</b> on one charge, and ten minutes to 80% from the solid-state core in the floor.", act: function () { go($("#tech")); openCard(cards[1]); } },
    { re: /white/, say: "Here it is in <b>gloss white</b>: ceramic clear, self-healing, and every bit as wicked.", act: function () { go($("#finish")); setTimeout(function () { animateFinish(0); }, reduce ? 0 : 500); } },
    { re: /black|paint|finish|colou?r/, say: "<b>Metallic black</b>: a fine flake under a clear coat, trimmed in red. Drag the handle to compare it with white.", act: function () { go($("#finish")); setTimeout(function () { animateFinish(100); }, reduce ? 0 : 500); } },
    { re: /turn|rotate|spin|360|angle|studio|look/, say: "Turning it for you. <b>Drag</b> to take over.", act: function () { go($("#studio")); setTimeout(spinOnce, reduce ? 0 : 600); } },
    { re: /aero|shape|morph|panel|drag coef|cd/, say: "<b>Active shape</b> moves the panels up to 16 mm at speed for a drag coefficient of 0.21.", act: function () { go($("#tech")); openCard(cards[0]); } },
    { re: /night|dark|vision|sight|heat|windscreen/, say: "<b>Night sight</b> turns the windscreen into a display that sees heat and depth.", act: function () { go($("#tech")); openCard(cards[2]); } },
    { re: /hive|network|hazard|share|other cars/, say: "<b>Hive</b> lets cars share what they see, so hazards reach you first.", act: function () { go($("#tech")); openCard(cards[3]); } },
    { re: /light|sweep|line|crease/, say: "Scroll slowly. <b>One beam</b> draws the body.", act: function () { go($("#sweep")); } },
    { re: /fast|speed|0 to|100|accel|quick/, say: "<b>0 to 100 in 1.9 s</b>. It is a concept, so the numbers are targets.", act: function () { go($("#top")); } },
    { re: /reserve|book|view|see|buy|price|cost/, say: "Twelve cars, three cities. Private viewings in <b>Singapore, Manila and Tokyo</b>.", act: function () { go($("#reserve")); } }
  ];
  function ask(q) {
    q = (q || "").toLowerCase().trim();
    if (!q) return;
    var hit = INTENTS.filter(function (x) { return x.re.test(q); })[0];
    answer.hidden = false;
    answer.innerHTML = hit ? hit.say : "I can turn the car, change its finish, or walk you through the four technologies. Try <b>how far on one charge</b>.";
    if (hit) hit.act();
    clearTimeout(ask.t); ask.t = setTimeout(function () { answer.hidden = true; }, 7000);
  }
  form.addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); input.value = ""; input.blur(); });
  $$(".chip").forEach(function (c) { c.addEventListener("click", function () { ask(c.textContent); }); });
  addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && (e.key || "").toLowerCase() === "k") { e.preventDefault(); input.focus(); }   // autofill sends keydowns with no key
    else if (e.key === "Escape" && document.activeElement === input) { input.blur(); answer.hidden = true; }
  });
  var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  mic.addEventListener("click", function () {
    if (!Rec) { answer.hidden = false; answer.innerHTML = "Voice is not available in this browser. Type your question instead."; input.focus(); return; }
    var r = new Rec(); r.lang = "en-US"; r.interimResults = false;
    mic.classList.add("listening"); input.placeholder = "Listening…";
    r.onresult = function (e) { var t = e.results[0][0].transcript; input.value = t; ask(t); };
    r.onend = function () { mic.classList.remove("listening"); input.placeholder = askHint(); input.value = ""; };
    r.start();
  });

  /* ---------- cockpit display: the reservation lives on the dash ---------- */
  var dsp = $("[data-display]");
  var cities = {   // placeholder viewings
    sgp: { name: "Singapore", tz: "Asia/Singapore", when: "14 Nov, 7:00 pm", at: "2026-11-14T19:00:00+08:00" },
    mnl: { name: "Manila", tz: "Asia/Manila", when: "21 Nov, 7:00 pm", at: "2026-11-21T19:00:00+08:00" },
    tyo: { name: "Tokyo", tz: "Asia/Tokyo", when: "28 Nov, 7:00 pm", at: "2026-11-28T19:00:00+09:00" }
  };
  var city = cities.sgp, dspOn = false;
  function hhmm(tz) { try { return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz }); } catch (e) { return "--:--"; } }
  function daysTo(c) { return Math.max(0, Math.ceil((new Date(c.at) - new Date()) / 864e5)); }
  function tickClock() { $("[data-dsp-clock]").textContent = hhmm(); $("[data-dsp-local]").textContent = hhmm(city.tz); }
  function countDays(to) {
    var el = $("[data-dsp-days]");
    if (reduce || !dspOn) { el.textContent = String(to).padStart(2, "0"); return; }
    var from = +el.textContent || 0, t0 = performance.now();
    (function step(t) { var k = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - k, 3);
      el.textContent = String(Math.round(from + (to - from) * e)).padStart(2, "0"); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  function setCity(key) {
    city = cities[key];
    $$("[data-city]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.city === key)); });
    $("[data-dsp-city]").textContent = city.name; $("[data-dsp-when]").textContent = city.when;
    $("[data-dsp-cta]").href = "mailto:hello@robertazucena.com?subject=" + encodeURIComponent("Greed viewing - " + city.name);
    tickClock(); countDays(daysTo(city));
  }
  $$("[data-city]").forEach(function (b) { b.addEventListener("click", function () { setCity(b.dataset.city); }); });
  $$("[data-ask]").forEach(function (b) { b.addEventListener("click", function () { ask(b.dataset.ask); }); });
  setCity("sgp"); setInterval(tickClock, 20000);

  /* ---------- reservation console: opens out of the button, asks one thing at a time, and builds the pass as you answer ---------- */
  var rsv = $("[data-rsv]");
  if (rsv && rsv.showModal) {
    var rForm = $("[data-rsv-form]", rsv), rQs = $$(".rsv-q", rsv), rSteps = $$(".rsv-steps li", rsv), rErr = $("[data-rsv-err]", rsv);
    var rPass = $("[data-rsv-pass]", rsv), P = {}, rAt = 0, rCity = "sgp", rTime = "", rFrom = null;
    $$("[data-pass]", rsv).forEach(function (el) { P[el.dataset.pass] = el; });
    var TIMES = ["5:00 pm", "7:00 pm", "9:00 pm"];
    var passSet = function (k, v) {
      var el = P[k], t = v || "\u2014";
      if (el.textContent === t) return;
      el.textContent = t; el.classList.toggle("blank", !v);
      if (v && !reduce) { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); }
    };
    var opt = function (box, key, title, sub, on, pick) {
      var b = document.createElement("button"); b.type = "button"; b.className = "rsv-opt"; b.dataset.key = key;
      b.setAttribute("aria-pressed", String(on)); b.innerHTML = "<b></b><span></span>";
      b.firstChild.textContent = title; b.lastChild.textContent = sub;
      b.addEventListener("click", function () { pick(key); $$(".rsv-opt", box).forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); }); });
      box.appendChild(b);
    };
    var cityBox = $("[data-rsv-cities]", rsv), timeBox = $("[data-rsv-times]", rsv);
    var pickTime = function (t) { rTime = t; passSet("time", t); rErr.textContent = ""; $("[data-rsv-next]", rsv).focus(); };   // then Confirm is one Enter away
    var pickCity = function (k) {
      rCity = k; var c = cities[k];
      passSet("city", c.name); passSet("date", c.when.split(",")[0]);
      passSet("bay", ({ sgp: "Marina 04", mnl: "BGC 02", tyo: "Ginza 07" })[k]);
      timeBox.innerHTML = ""; rTime = ""; passSet("time", "");
      if (rAt === 2) setTimeout(function () { rShow(3); }, reduce ? 0 : 320);   // picking a city moves on by itself
      TIMES.forEach(function (t) { opt(timeBox, t, t, c.when.split(",")[0] + ", local time", false, pickTime); });
    };
    var rShow = function (i) {
      rAt = i; rForm.dataset.at = i; rErr.textContent = "";
      rQs.forEach(function (q, n) { q.classList.toggle("on", n === i); });
      rSteps.forEach(function (li, n) { li.classList.toggle("on", n <= i); });
      $("[data-rsv-next]", rsv).firstChild.textContent = i === 3 ? "Confirm viewing" : "Next";
      var inp = $("input", rQs[i]) || $(".rsv-opt[aria-pressed=true]", rQs[i]) || $(".rsv-opt, .btn", rQs[i]);
      if (inp) setTimeout(function () { inp.focus({ preventScroll: true }); }, reduce ? 0 : 60);
    };
    var check = function () {   // one plain sentence when something is missing
      var f = rForm.elements;
      if (rAt === 0 && !f.name.value.trim()) return "Your name, so we know whom to expect.";
      if (rAt === 1 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())) return "That email doesn't look complete yet.";
      if (rAt === 3 && !rTime) return "Choose one of the three evenings.";
      return "";
    };
    var seal = function () {
      var ref = "GRD-" + rCity.toUpperCase() + "-" + String(Math.floor(1000 + Math.random() * 9000));
      passSet("ref", ref); P.ref.classList.remove("blank");
      $("[data-pass-state]", rsv).textContent = "Confirmed"; rPass.classList.add("sealed");
      var c = cities[rCity], h = { "5:00 pm": 17, "7:00 pm": 19, "9:00 pm": 21 }[rTime];
      var off = c.at.slice(-6), day = c.at.slice(0, 10), start = new Date(day + "T" + pad(h, 2) + ":00:00" + off), end = new Date(+start + 36e5);
      var z = function (t) { return t.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, ""); };
      var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Greed//Viewing//EN", "BEGIN:VEVENT", "UID:" + ref + "@greed", "DTSTAMP:" + z(new Date()),
        "DTSTART:" + z(start), "DTEND:" + z(end), "SUMMARY:Greed private viewing, " + c.name, "DESCRIPTION:Pass " + ref + ". Bay " + P.bay.textContent + ".", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
      $("[data-rsv-ics]", rsv).href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
    };
    rForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = check(); if (msg) { rErr.textContent = msg; return; }
      if (rAt === 3) seal();
      rShow(rAt + 1);
    });
    $("[data-rsv-back]", rsv).addEventListener("click", function () { if (rAt > 0) rShow(rAt - 1); });
    rForm.elements.name.addEventListener("input", function () { passSet("name", this.value.trim()); });
    var rect = function (el) {   // the clip-path insets that make the console exactly the size of el
      var r = el.getBoundingClientRect();
      rsv.style.setProperty("--ct", r.top + "px"); rsv.style.setProperty("--cl", r.left + "px");
      rsv.style.setProperty("--cr", (innerWidth - r.right) + "px"); rsv.style.setProperty("--cb", (innerHeight - r.bottom) + "px");
      rsv.style.setProperty("--cround", r.height / 2 + "px");
    };
    var full = function () { ["--ct", "--cl", "--cr", "--cb", "--cround"].forEach(function (k) { rsv.style.setProperty(k, "0px"); }); };
    var openRsv = function (from) {
      rFrom = from; rForm.reset(); rPass.classList.remove("sealed"); $("[data-pass-state]", rsv).textContent = "Drafting";
      ["name", "city", "date", "time", "bay"].forEach(function (k) { passSet(k, ""); }); P.ref.textContent = "GRD-\u2014\u2014\u2014-0000";
      var picked = Object.keys(cities).filter(function (k) { return cities[k] === city; })[0];   // starts on the city picked on the dash
      cityBox.innerHTML = "";
      Object.keys(cities).forEach(function (k) { opt(cityBox, k, cities[k].name, cities[k].when, k === picked, pickCity); });
      pickCity(picked);
      rShow(0); rsv.classList.remove("lit");
      if (reduce || !from) { full(); rsv.showModal(); rsv.classList.add("lit"); return; }
      rsv.classList.remove("anim"); rect(from); rsv.showModal();
      requestAnimationFrame(function () { requestAnimationFrame(function () { rsv.classList.add("anim", "lit"); full(); }); });
    };
    var closeRsv = function () {
      if (!rsv.open) return;
      if (reduce || !rFrom) { rsv.close(); return; }
      rsv.classList.remove("lit"); rect(rFrom);
      setTimeout(function () { rsv.close(); rsv.classList.remove("anim"); }, 750);
    };
    $$("[data-rsv-close]", rsv).forEach(function (b) { b.addEventListener("click", closeRsv); });
    rsv.addEventListener("cancel", function (e) { e.preventDefault(); closeRsv(); });   // Esc closes it the same way
    $("[data-dsp-cta]").addEventListener("click", function (e) { e.preventDefault(); openRsv(e.currentTarget); });
  }
  /* the photo is framed on the dash screen, then the display (laid out at the screen's own 1744x210 photo pixels)
     is mapped onto the screen's corners, measured in the 2752x1536 photo: TL, TR, BR, BL. The shot is straight-on,
     so the matrix is a plain scale and move, but it would carry perspective if the photo ever changes */
  var cabin = $("[data-cabin]"), sky = $("[data-sky]"), sec = $("#reserve");
  var CW = 2752, CH = 1536, QUAD = [505, 748, 2249, 748, 2249, 958, 505, 958], SCR = [1377, 853];
  function quadMatrix(w, h, p) {   // unit square -> quad (Heckbert), scaled to a w x h element, as a CSS matrix3d
    var x0 = p[0], y0 = p[1], x1 = p[2], y1 = p[3], x2 = p[4], y2 = p[5], x3 = p[6], y3 = p[7];
    var sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3, dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2;
    var den = dx1 * dy2 - dx2 * dy1, g = (sx * dy2 - dx2 * sy) / den, k = (dx1 * sy - sx * dy1) / den;
    var a = x1 - x0 + g * x1, b = x3 - x0 + k * x3, d = y1 - y0 + g * y1, e = y3 - y0 + k * y3;
    return "matrix3d(" + [a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, x0, y0, 0, 1].join(",") + ")";
  }
  function mapCabin() {
    if (matchMedia("(max-width: 760px)").matches) {   // phones: the photo is a band in the flow, and the view sits on it
      cabin.removeAttribute("style"); dsp.style.transform = "";
      sky.style.cssText = "width:" + cabin.offsetWidth + "px;height:" + cabin.offsetHeight + "px;left:" + cabin.offsetLeft + "px;top:" + cabin.offsetTop + "px"; return;
    }
    var W = sec.clientWidth, H = sec.clientHeight, sc = Math.max(W / CW, H / CH) * 1.12;
    var ox = Math.min(0, Math.max(W - CW * sc, W * .5 - SCR[0] * sc)), oy = Math.min(0, Math.max(H - CH * sc, H * .5 - SCR[1] * sc));
    cabin.style.cssText = sky.style.cssText = "width:" + CW * sc + "px;height:" + CH * sc + "px;left:" + ox + "px;top:" + oy + "px";
    dsp.style.transform = quadMatrix(1744, 210, QUAD.map(function (v, i) { return i % 2 ? oy + v * sc : ox + v * sc; }));
    dsp.classList.add("mapped");
  }
  mapCabin(); addEventListener("resize", mapCabin); addEventListener("load", mapCabin);
  if (document.fonts) document.fonts.ready.then(mapCabin);   // the title above the band can reflow when fonts land

  /* the screen powers on the first time it comes into view */
  if (reduce || !("IntersectionObserver" in window)) { dsp.classList.add("on"); }
  else {
    var dio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { dspOn = true; dsp.classList.add("on"); $("[data-dsp-days]").textContent = "00"; countDays(daysTo(city)); dio.disconnect(); } }, { threshold: .45 });
    dio.observe(dsp);
  }

  /* ---------- reveal on scroll ---------- */
  var rv = $$(".stage-head, .deck, .swatches").filter(function (el) { return !el.closest(".hero"); });   // never the blended car layers
  if (!reduce && "IntersectionObserver" in window) {
    rv.forEach(function (el) { el.classList.add("reveal"); });
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -12% 0px" });
    rv.forEach(function (el) { io.observe(el); });
  }
  /* ---------- nav: the link for the section crossing the middle of the screen is marked current ---------- */
  var navLinks = $$(".nav a[href^='#']");   // the reel link goes to its own page
  if ("IntersectionObserver" in window) {
    var navIo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          if (a.getAttribute("href") === "#" + e.target.id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-49% 0px -50% 0px" });
    navLinks.forEach(function (a) { var sec = $(a.getAttribute("href")); if (sec) navIo.observe(sec); });
    navIo.observe($(".hero"));   // back on the landing, no link is current
  }

  /* warm the studio frames once the hero has settled */
  if ("requestIdleCallback" in window) requestIdleCallback(preloadTurn, { timeout: 4000 }); else setTimeout(preloadTurn, 3000);
})();
