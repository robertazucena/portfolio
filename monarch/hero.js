/* Monarch Labs — service cycle.
   One service at a time. Every marker of "which one" moves together: the word reel (steps up a row; the
   neighbours above and below are faded by a mask), the description, the counter and the edge ticks. Inside the current word, its three photos take turns (every 2.4s), drifting slowly and crossfading gently. The h1's aria-label carries every service; the descriptions all stay in the DOM.
   Scrolling, swiping or the arrow / Page / space keys step through the services (down = next, up = back).
   Reduced motion: no auto-cycle; scrolling still steps (without the slide).
   The work view (work.js) pauses the cycle through window.MLHero and takes the scroll over while open.
   Warp: each photo melts into the next, like wet paint: a displacement that rises and settles over the fade; moving the
   pointer across the word smears it with the stroke. An SVG displacement filter on the reel, put back inside
   the crisp letter shapes (the unwarped photo fills any gap); it stays on, at zero when still. */
(() => {
  "use strict";
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const q = s => [...document.querySelectorAll(s)];
  const words = q(".reel>span"), groups = [q(".desc span"), q(".ticks i")];
  const count = document.querySelector(".count b");
  const HOLD = 7200, SHOT = 2400, n = words.length;
  /* reel position of word k when service i is current: 0 = middle, 1 = below, -1 = above, 2 = parked
     out of sight below. Forward: the word leaving the top runs on to -2, then jumps (no transition) to park
     at 2. Backward: the parked word jumps to -2 first, then slides in from the top to -1. */
  const pos = (k, i) => { const r = ((k - i) % n + n) % n; return r === n - 1 ? -1 : r; };
  const timers = new Map();
  const place = (el, p, jump) => { el.classList.toggle("jump", !!jump); el.style.setProperty("--p", p); };
  /* the current word's photos take turns inside its letters */
  const layers = words.map(w => [...w.querySelectorAll(".t>b")]);
  /* each photo's drift (Nowhere hero moves): size + position at the start → at the end. Dealt in turn across
     all the layers, so neighbouring photos never move the same way */
  const MOVES = [["118%", "44% 50%", "118%", "56% 50%"], ["108%", "50% 52%", "116%", "50% 46%"],
                 ["118%", "56% 50%", "118%", "44% 50%"], ["116%", "50% 54%", "108%", "50% 50%"]];   /* small, slow drifts */
  layers.flat().forEach((b, k) => {
    const M = MOVES[k % MOVES.length];
    b.style.setProperty("--s0", M[0]); b.style.setProperty("--p0", M[1]);
    b.style.setProperty("--s1", M[2]); b.style.setProperty("--p1", M[3]);
  });
  let i = 0, shot = 0, kick = () => {};
  const light = () => { layers.forEach((L, k) => L.forEach((b, j) => b.classList.toggle("on", k === i && j === shot % L.length))); kick(); };

  /* ---------- smudge ---------- */
  if (!still && words.length) {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true"); svg.setAttribute("width", "0"); svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    svg.innerHTML = `<filter id="ml-smudge" x="-2%" y="-10%" width="104%" height="120%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.002 0.045" numOctaves="2" seed="7" result="n"/>
      <feOffset in="n" dx="0" dy="0" result="o"/>
      <feDisplacementMap in="SourceGraphic" in2="o" scale="0" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feMerge result="m"><feMergeNode in="SourceGraphic"/><feMergeNode in="d"/></feMerge>
      <feComposite in="m" in2="SourceAlpha" operator="in"/></filter>`;
    document.body.appendChild(svg);
    const disp = svg.querySelector("feDisplacementMap"), off = svg.querySelector("feOffset");
    /* the filter stays on the reel all the time (at zero when nothing moves): switching a filter on and off makes
       the browser redraw the letters a different way, which reads as a flicker */
    document.documentElement.classList.add("warp");
    const D = 1600, PEAK = 34;                               /* one warp lasts the 1.6s fade; px of warp at its middle */
    let t0 = -1e9, base = 0, stroke = 0, drift = 0, raf = 0, last = 0;
    const ease = p => p < 0 ? 0 : p > 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * p);
    const frame = now => {
      const dt = Math.min(50, now - (last || now)); last = now;
      const p = (now - t0) / D;
      /* rises from nothing and settles back to nothing, gentlest at both ends: deepest while the photos blend */
      const w = p >= 0 && p <= 1 ? PEAK * (0.5 - 0.5 * Math.cos(2 * Math.PI * p)) : 0;
      stroke *= Math.pow(0.12, dt / 1000);
      const amt = Math.min(80, w + stroke);
      disp.setAttribute("scale", amt.toFixed(2));
      off.setAttribute("dx", (base + 36 * ease(p) + drift).toFixed(2));   /* the paint flows a little as it warps */
      if (p <= 1 || stroke > 0.05) raf = requestAnimationFrame(frame);
      else { if (p > 1) { base += 36; t0 = -1e9; } disp.setAttribute("scale", "0"); raf = 0; last = 0; }
    };
    const run = () => { if (!raf) raf = requestAnimationFrame(frame); };
    kick = () => { const now = performance.now(), p = (now - t0) / D; if (p >= 0 && p <= 1) base += 36 * ease(p); t0 = now; run(); };
    /* the pointer: the faster the stroke, the deeper the smear; the noise is dragged along with it */
    const word = document.querySelector(".word");
    let px = null;
    if (word) {
      word.addEventListener("pointermove", e => {
        if (px !== null) { const dx = e.clientX - px[0], dy = e.clientY - px[1]; stroke = Math.min(30, stroke + Math.hypot(dx, dy) * 0.3); drift -= dx * 0.3; run(); }
        px = [e.clientX, e.clientY];
      });
      word.addEventListener("pointerleave", () => { px = null; });
    }
  }

  const go = dir => {
    i = (i + dir + n) % n; shot = 0; light();
    words.forEach((el, k) => {
      clearTimeout(timers.get(el));
      const was = +el.style.getPropertyValue("--p"), p = pos(k, i);
      if (dir > 0 && was === -1 && p > 0) {
        place(el, -2);
        timers.set(el, setTimeout(() => place(el, p, true), 1050));
      } else if (dir < 0 && was > 1 && p === -1) {
        place(el, -2, true);
        void el.offsetWidth;                                     /* commit the jump before sliding in */
        place(el, -1);
      } else place(el, p);
    });
    groups.forEach(g => g.forEach((el, k) => el.classList.toggle("on", k === i)));
    if (count) count.textContent = String(i + 1).padStart(2, "0");
    document.dispatchEvent(new CustomEvent("ml:service", { detail: i }));
  };
  /* straight to service k without the slide (used when the work view closes on another service) */
  const jump = k => {
    i = k; shot = 0; light();
    words.forEach((el, kk) => { clearTimeout(timers.get(el)); place(el, pos(kk, i), true); });
    groups.forEach(g => g.forEach((el, kk) => el.classList.toggle("on", kk === i)));
    if (count) count.textContent = String(i + 1).padStart(2, "0");
    document.dispatchEvent(new CustomEvent("ml:service", { detail: i }));
  };

  /* one clock: every SHOT the next photo; every HOLD (3 shots) the next service. A scroll restarts it. */
  let clock;
  const start = () => {
    clearInterval(clock);
    if (still) return;
    clock = setInterval(() => {
      shot++;
      if (shot % (HOLD / SHOT)) light(); else go(1);
    }, SHOT);
  };
  jump(2);                                                   /* open on Intelligence */
  /* wait for the preloader to lift (ml:ready from preload.js); a fallback starts it anyway */
  const pre = document.getElementById("pre");
  const loading = () => pre && !pre.classList.contains("done");
  if (loading()) {
    const go1 = () => { clearTimeout(fb); if (!document.documentElement.classList.contains("work-open")) start(); };   /* not under an open work view */
    const fb = setTimeout(go1, 6500);
    document.addEventListener("ml:ready", go1, { once: true });
  } else start();
  /* for work.js: pause while the work view is open, pick up again on the service it closes on */
  window.MLHero = { get i() { return i; }, stop: () => clearInterval(clock), start, jump };

  /* scroll, swipe or keys move the services: down = next, up = previous. One step per gesture (a short
     lock covers the reel's 1s move). */
  let lock = 0, acc = 0, accT;
  const workOpen = () => document.documentElement.classList.contains("work-open");   /* the work view scrolls on its own */
  const step = dir => {
    const now = performance.now();
    if (workOpen() || loading() || now < lock) return;
    lock = now + 1100; go(dir); start();
  };
  addEventListener("wheel", e => {
    if (workOpen()) return;
    e.preventDefault();
    acc += e.deltaY; clearTimeout(accT); accT = setTimeout(() => { acc = 0; }, 180);
    if (Math.abs(acc) > 28) { step(Math.sign(acc)); acc = 0; }
  }, { passive: false });
  let ty = null;
  addEventListener("touchstart", e => { ty = e.touches[0].clientY; }, { passive: true });
  addEventListener("touchend", e => {
    if (ty === null || workOpen()) return;
    const d = ty - e.changedTouches[0].clientY; ty = null;
    if (Math.abs(d) > 40) step(Math.sign(d));
  }, { passive: true });
  addEventListener("keydown", e => {
    if (workOpen() || (e.target.closest && e.target.closest("input,textarea,button"))) return;
    const k = e.key;
    if (k === "ArrowDown" || k === "PageDown" || (k === " " && !e.shiftKey)) { e.preventDefault(); step(1); }
    else if (k === "ArrowUp" || k === "PageUp" || (k === " " && e.shiftKey)) { e.preventDefault(); step(-1); }
  });
})();
