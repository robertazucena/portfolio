/* =====================================================================
   MUFG Asia Pacific — behaviour
   Small, dependency-free. Every effect is progressive enhancement:
   with JS off the page is fully visible and navigable.
   ===================================================================== */
(() => {
  const doc = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- Header: condense on scroll ------------------------------------ */
  const header = $('.site-header');
  if (header) {
    let ticking = false;
    const update = () => { header.classList.toggle('is-scrolled', scrollY > 12); ticking = false; };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---- Nav: sliding underline indicator ------------------------------ */
  const nav = $('.main-nav');
  const indicator = $('.nav-indicator');
  if (nav && indicator) {
    const links = $$('a', nav);
    const current = links.find(a => a.getAttribute('aria-current') === 'page') || null;
    const BASE = 100; // indicator's intrinsic width in CSS
    const place = (link) => {
      if (!link) { indicator.style.opacity = '0'; return; }
      const x = link.offsetLeft + 16;                 // align with text, not the pill padding
      const w = Math.max(link.offsetWidth - 32, 8);
      indicator.style.opacity = '1';
      indicator.style.transform = `translateX(${x}px) scaleX(${w / BASE})`;
    };
    const rest = () => place(current);
    place(current);
    requestAnimationFrame(() => requestAnimationFrame(() => indicator.classList.add('is-ready')));
    if (finePointer) {
      links.forEach(a => {
        a.addEventListener('pointerenter', () => place(a));
        a.addEventListener('focus', () => place(a));
      });
      nav.addEventListener('pointerleave', rest);
      links.forEach(a => a.addEventListener('blur', rest));
    }
    addEventListener('resize', rest);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rest);
  }

  /* ---- Menu sheet ---------------------------------------------------- */
  const menuBtn = $('.menu-btn');
  const sheet = $('#menu-sheet');
  if (menuBtn && sheet) {
    const label = $('.menu-label', menuBtn);
    let lastFocus = null;
    const setOpen = (open) => {
      doc.classList.toggle('menu-open', open);
      document.body.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      sheet.setAttribute('aria-hidden', String(!open));
      sheet.toggleAttribute('inert', !open);
      if (label) label.textContent = open ? 'CLOSE' : 'MENU';
      if (open) { lastFocus = document.activeElement; setTimeout(() => $('a', sheet)?.focus({ preventScroll: true }), 80); }
      else if (lastFocus) lastFocus.focus({ preventScroll: true });
    };
    setOpen(false);
    menuBtn.addEventListener('click', () => setOpen(!doc.classList.contains('menu-open')));
    sheet.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && doc.classList.contains('menu-open')) setOpen(false); });
  }

  /* ---- Rails: snap-scroll sliders with real controls ------------------ */
  $$('[data-rail]').forEach(rail => {
    const track = $('.rail-track', rail);
    const dotsEl = $('.dots', rail);
    const prev = $('[data-prev]', rail);
    const next = $('[data-next]', rail);
    if (!track) return;
    let pages = 1, page = 0, step = 0, perView = 1;

    const measure = () => {
      const slides = [...track.children];
      if (!slides.length) return;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      step = slides[0].getBoundingClientRect().width + gap;
      perView = Math.max(1, Math.round((track.clientWidth + gap) / step));
      pages = Math.max(1, Math.ceil(slides.length / perView));
      if (dotsEl) {
        dotsEl.innerHTML = '';
        for (let i = 0; i < pages; i++) {
          const b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-label', `Go to slide ${i + 1}`);
          b.addEventListener('click', () => go(i));
          dotsEl.appendChild(b);
        }
        dotsEl.hidden = pages < 2;
      }
      sync();
    };
    const go = (i) => {
      const target = Math.min(Math.max(i, 0), pages - 1);
      track.scrollTo({ left: target * perView * step, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth;
      const atEnd = track.scrollLeft >= max - 4;
      page = atEnd ? pages - 1 : Math.min(pages - 1, Math.round(track.scrollLeft / (perView * step)));
      if (dotsEl) [...dotsEl.children].forEach((d, i) => d.classList.toggle('is-active', i === page));
      if (prev) prev.setAttribute('aria-disabled', String(track.scrollLeft <= 4));
      if (next) next.setAttribute('aria-disabled', String(atEnd));
    };
    let raf = 0;
    track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); }, { passive: true });
    prev?.addEventListener('click', () => go(page - 1));
    next?.addEventListener('click', () => go(page + 1));
    addEventListener('resize', measure);
    measure();
  });

  /* ---- Count-up numbers ----------------------------------------------- */
  const easeOut = (t) => 1 - Math.pow(1 - t, 4);
  const countUp = (el) => {
    const end = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const group = el.dataset.group !== 'false';
    const dec = (el.dataset.count.split('.')[1] || '').length;
    const fmt = (n) => prefix + (group
      ? n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
      : n.toFixed(dec)) + suffix;
    if (reduceMotion) { el.textContent = fmt(end); return; }
    const dur = 1500;
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      el.textContent = fmt(end * easeOut(t));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ---- Reveal on scroll (staggered) ------------------------------------ */
  const targets = $$('[data-reveal]');
  const counters = $$('[data-count]');
  const seen = new WeakSet();

  if ('IntersectionObserver' in window && !reduceMotion) {
    // Stagger siblings that sit inside the same [data-stagger] parent.
    $$('[data-stagger]').forEach(p => {
      $$('[data-reveal]', p).forEach((el, i) => { if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', `${Math.min(i, 6) * 70}ms`); });
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);
        el.classList.add('is-in');
        // Hand the element back to its own transitions once the entrance is done,
        // so hover states on cards are never throttled by the reveal timing.
        const d = parseFloat(el.style.getPropertyValue('--d')) || 0;
        setTimeout(() => { el.removeAttribute('data-reveal'); el.classList.remove('is-in'); el.style.removeProperty('--d'); }, 650 + d + 60);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(el => io.observe(el));

    const cio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || seen.has(entry.target)) return;
        seen.add(entry.target); cio.unobserve(entry.target); countUp(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => cio.observe(el));
  } else {
    targets.forEach(el => el.removeAttribute('data-reveal'));
    counters.forEach(el => countUp(el));
  }

  /* ---- Cursor spotlight on cards (fine pointers only) ------------------- */
  if (finePointer && !reduceMotion) {
    $$('.spot').forEach(card => {
      let raf = 0;
      card.addEventListener('pointermove', (e) => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--mx', `${e.clientX - r.left}px`);
          card.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
      });
    });
  }

  /* =====================================================================
     v2 — interactive layer
     ===================================================================== */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const vh = () => innerHeight;

  /* ---- Hero entrance: words rise out of a mask ------------------------ */
  $$('[data-split]').forEach(h => h.querySelectorAll('.w').forEach((w, i) => w.style.setProperty('--k', i)));
  const enter = () => {
    $$('[data-split],[data-hero]').forEach(el => el.classList.add('is-in'));
  };
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]).then(() => requestAnimationFrame(enter));
  else enter();

  /* ---- Auto-cycling helper (stops for good once the user takes over) -- */
  const cycle = (host, n, ms, set) => {
    let i = 0, t = 0, running = false, stopped = false;
    const tick = () => { i = (i + 1) % n; set(i); t = setTimeout(tick, ms); };
    const start = () => { if (stopped || reduceMotion || running) return; running = true; t = setTimeout(tick, ms); };
    const pause = () => { running = false; clearTimeout(t); };
    if ('IntersectionObserver' in window)
      new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? start() : pause())), { threshold: 0.4 }).observe(host);
    return { stop() { stopped = true; pause(); host.classList.add('paused'); }, at(j) { i = j; } };
  };

  /* ---- Service spotlight ------------------------------------------------ */
  $$('[data-spot]').forEach(root => {
    const tabs = $$('.sp__tab', root), panels = $$('.sp__panel', root);
    const set = (i) => {
      tabs.forEach((t, j) => { t.classList.toggle('is-active', i === j); t.setAttribute('aria-selected', String(i === j)); });
      panels.forEach((p, j) => { p.classList.toggle('is-active', i === j); p.setAttribute('aria-hidden', String(i !== j)); });
    };
    const auto = cycle(root, tabs.length, 6000, set);
    const pick = (i) => { auto.stop(); auto.at(i); set(i); };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => pick(i));
      if (finePointer) t.addEventListener('pointerenter', () => pick(i));
    });
    root.addEventListener('keydown', (e) => {
      const cur = tabs.findIndex(t => t.classList.contains('is-active'));
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); pick((cur + 1) % tabs.length); tabs[(cur + 1) % tabs.length].focus(); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); const k = (cur - 1 + tabs.length) % tabs.length; pick(k); tabs[k].focus(); }
    });
  });

  /* ---- Leadership voices ------------------------------------------------ */
  $$('[data-voices]').forEach(root => {
    const who = $$('.who', root), quotes = $$('.voice', root);
    const set = (i) => {
      who.forEach((w, j) => { w.classList.toggle('is-active', i === j); w.setAttribute('aria-selected', String(i === j)); });
      quotes.forEach((q, j) => { q.classList.toggle('is-active', i === j); q.setAttribute('aria-hidden', String(i !== j)); });
    };
    const auto = cycle(root, who.length, 7000, set);
    who.forEach((w, i) => w.addEventListener('click', () => { auto.stop(); auto.at(i); set(i); }));
  });

  /* ---- Services accordion ----------------------------------------------- */
  $$('[data-acc]').forEach(root => {
    const items = $$('.acc__item', root);
    const open = (it) => items.forEach(x => { const on = x === it; x.classList.toggle('is-active', on); x.setAttribute('aria-expanded', String(on)); });
    items.forEach(it => {
      it.addEventListener('click', () => open(it));
      it.addEventListener('focus', () => open(it));
      if (finePointer) it.addEventListener('pointerenter', () => open(it));
    });
  });

  /* ---- Newsroom filter ---------------------------------------------------- */
  $$('.nr').forEach(root => {
    const chips = $$('.chip', root), items = $$('.nr__item', root), empty = $('.nr__empty', root);
    chips.forEach(c => c.addEventListener('click', () => {
      const f = c.dataset.f;
      chips.forEach(x => { x.classList.toggle('is-active', x === c); x.setAttribute('aria-pressed', String(x === c)); });
      let shown = 0;
      $('.nr__grid', root).classList.toggle('filtered', f !== 'all');
      items.forEach(it => {
        const show = f === 'all' || it.dataset.cat === f;
        it.hidden = !show;
        it.classList.remove('in');
        if (show) { it.style.setProperty('--k', shown++); void it.offsetWidth; it.classList.add('in'); }
      });
      if (empty) empty.hidden = shown > 0;
    }));
  });

  /* ---- Pillar story: the sticky visual follows the active step ---------- */
  $$('[data-story]').forEach(root => {
    const steps = $$('.story__step', root), imgs = $$('.story__img', root);
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const i = steps.indexOf(e.target);
      steps.forEach((s, j) => s.classList.toggle('is-active', i === j));
      imgs.forEach((m, j) => m.classList.toggle('is-active', i === j));
    }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(s => io.observe(s));
  });

  /* ---- Offices atlas ------------------------------------------------------- */
  $$('[data-atlas]').forEach(root => {
    const tabs = $$('.rg', root), els = $$('.atlas__svg [data-r]', root);
    const set = (r) => {
      root.dataset.active = r;
      tabs.forEach(t => { const on = t.dataset.r === r; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', String(on)); });
      let k = 0;
      els.forEach(el => {
        const on = el.dataset.r === r || (r === 'global' && el.dataset.g === 'global');
        if (el.classList.contains('arc')) el.style.transitionDelay = on ? `${k++ * 140}ms` : '0ms';
        el.classList.toggle('on', on);
      });
    };
    tabs.forEach(t => {
      t.addEventListener('click', () => set(t.dataset.r));
      if (finePointer) t.addEventListener('pointerenter', () => set(t.dataset.r));
    });
    set(root.dataset.active || tabs[0].dataset.r);
  });

  /* ---- Scroll-linked effects (one rAF-throttled loop) -------------------- */
  const lits = $$('[data-lit]').map(el => ({ el, ws: $$('.lw', el) }));
  const bars = $('.progress i');
  const bg = $('.stage__bg');
  const pars = $$('[data-parallax]');
  const deck = $$('.deck__item');
  const tl = $('[data-tl]');
  const mqSmall = matchMedia('(max-width: 680px)');
  let queued = false;
  const frame = () => {
    queued = false;
    const H = vh();
    if (bars) {
      const max = document.documentElement.scrollHeight - H;
      bars.style.setProperty('--sp', max > 0 ? (scrollY / max).toFixed(4) : 0);
    }
    if (bg && !reduceMotion && scrollY < H * 1.4) bg.style.transform = `translate3d(0,${(scrollY * 0.14).toFixed(1)}px,0)`;
    pars.forEach(p => {
      if (reduceMotion) return;
      const r = p.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > H + 100) return;
      const off = (r.top + r.height / 2 - H / 2) * parseFloat(p.dataset.parallax);
      p.style.transform = `translate3d(0,${off.toFixed(1)}px,0)`;
    });
    lits.forEach(({ el, ws }) => {
      const r = el.getBoundingClientRect();
      const p = clamp((H * 0.86 - r.top) / (H * 0.5 + r.height * 0.4));
      const n = Math.round(p * ws.length);
      ws.forEach((w, i) => w.classList.toggle('on', i < n));
    });
    if (deck.length) {
      deck.forEach((it, i) => {
        const card = it.firstElementChild;
        if (mqSmall.matches || reduceMotion || i === deck.length - 1) { card.style.transform = ''; card.style.filter = ''; return; }
        const top = parseFloat(getComputedStyle(it).top) || 0;
        const nextTop = deck[i + 1].getBoundingClientRect().top;
        const h = card.offsetHeight;
        const p = clamp(1 - (nextTop - (top + 22)) / (h - 22));
        card.style.transform = `scale(${(1 - 0.06 * p).toFixed(4)})`;
        card.style.filter = p > 0 ? `brightness(${(1 - 0.22 * p).toFixed(3)})` : '';
      });
    }
    if (tl) {
      const r = tl.getBoundingClientRect();
      tl.style.setProperty('--tp', clamp((H * 0.6 - r.top) / r.height).toFixed(4));
      $$('.tl__item', tl).forEach(it => it.classList.toggle('lit', it.getBoundingClientRect().top < H * 0.6));
    }
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  frame();

  /* =====================================================================
     Heroes v3
     ===================================================================== */
  /* ---- Home: which offices are open, on one Singapore-time day ---------- */
  $$('[data-clock]').forEach(root => {
    const rows = $$('.clock__row', root);
    const overlay = $('.clock__overlay', root);
    const nowEl = $('.clock__now', root), scrubEl = $('.clock__scrub', root);
    const countEl = $('[data-open]', root);
    const SGT = 8 * 60;
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const offsets = new Map();
    const offsetOf = (tz, at) => {
      try {
        const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' }).formatToParts(new Date(at)).find(x => x.type === 'timeZoneName').value;
        const m = /GMT([+-])(\d{2}):?(\d{2})?/.exec(p);
        return m ? (m[1] === '-' ? -1 : 1) * (parseInt(m[2], 10) * 60 + parseInt(m[3] || '0', 10)) : 0;
      } catch (e) { return 0; }
    };
    const dayStartUTC = (t) => Math.floor((t + SGT * 60000) / 864e5) * 864e5 - SGT * 60000;
    const hm = (mins) => `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
    const span = (m) => { const h = Math.floor(m / 60), mm = m % 60; return h ? `${h}h ${mm}m` : `${mm}m`; };
    let scrub = null; // fraction 0..1 or null for live

    const layout = () => {
      const base = Date.now();
      rows.forEach(r => {
        const off = offsets.get(r.dataset.tz) ?? offsetOf(r.dataset.tz, base);
        offsets.set(r.dataset.tz, off);
        const start = ((540 - off + SGT) % 1440 + 1440) % 1440;       // 09:00 local, on the SGT axis
        const bars = $$('.clock__bar', r);
        const w1 = Math.min(480, 1440 - start);
        bars[0].style.setProperty('--s', (start / 14.4) + '%'); bars[0].style.setProperty('--w', (w1 / 14.4) + '%');
        bars[1].style.setProperty('--s', '0%'); bars[1].style.setProperty('--w', ((480 - w1) / 14.4) + '%');
      });
    };
    const render = () => {
      const live = Date.now();
      const t = scrub == null ? live : dayStartUTC(live) + scrub * 864e5;
      let open = 0;
      rows.forEach(r => {
        const off = offsets.get(r.dataset.tz) ?? 0;
        const d = new Date(t + off * 60000);
        const day = d.getUTCDay(), mins = d.getUTCHours() * 60 + d.getUTCMinutes();
        const isOpen = day >= 1 && day <= 5 && mins >= 540 && mins < 1020;
        let state;
        if (isOpen) { open++; state = `Open, closes in ${span(1020 - mins)}`; }
        else {
          let until = null, label = '';
          for (let k = 0; k <= 7; k++) {
            const dk = (day + k) % 7;
            if (dk >= 1 && dk <= 5 && (k > 0 || mins < 540)) { until = k * 1440 + 540 - mins; label = names[dk]; break; }
          }
          state = until != null && until < 1440 ? `Opens in ${span(until)}` : `Opens ${label}`;
        }
        r.dataset.open = isOpen ? '1' : '0';
        $('.clock__local', r).textContent = hm(mins);
        $('.clock__state', r).textContent = state;
      });
      if (countEl) countEl.textContent = String(open);
      $$('[data-open-mirror]').forEach(el => { el.textContent = String(open); });
      const nowMins = ((new Date(live).getUTCHours() * 60 + new Date(live).getUTCMinutes()) + SGT) % 1440;
      root.style.setProperty('--nx', (nowMins / 14.4) + '%');
      nowEl.firstElementChild.textContent = `Now ${hm(nowMins)}`;
      overlay.setAttribute('aria-valuenow', String(Math.round((scrub == null ? nowMins / 1440 : scrub) * 1439)));
      overlay.setAttribute('aria-valuetext', scrub == null ? `Now, ${open} offices open` : `${hm(Math.round(scrub * 1440))} Singapore time, ${open} offices open`);
      if (scrub != null) {
        const sm = Math.round(scrub * 1440);
        root.style.setProperty('--sx', (scrub * 100) + '%');
        scrubEl.firstElementChild.textContent = `${hm(sm === 1440 ? 1439 : sm)} SGT`;
      }
    };
    const setScrub = (f) => {
      scrub = f;
      root.classList.toggle('is-scrubbing', f != null);
      scrubEl.hidden = f == null;
      render();
    };
    const fromEvent = (e) => { const r = overlay.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width); };
    overlay.addEventListener('pointermove', e => setScrub(fromEvent(e)));
    overlay.addEventListener('pointerdown', e => setScrub(fromEvent(e)));
    overlay.addEventListener('pointerleave', () => setScrub(null));
    overlay.addEventListener('keydown', e => {
      const cur = scrub == null ? (((new Date().getUTCHours() * 60 + new Date().getUTCMinutes()) + SGT) % 1440) / 1440 : scrub;
      if (e.key === 'ArrowRight') { e.preventDefault(); setScrub(clamp(cur + 30 / 1440)); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); setScrub(clamp(cur - 30 / 1440)); }
      if (e.key === 'Escape') setScrub(null);
    });
    overlay.addEventListener('blur', () => setScrub(null));
    layout(); render();
    setInterval(() => { if (scrub == null) render(); }, 15000);
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-in')));
  });

  /* ---- Services: one transaction, followed through the suite ------------ */
  $$('[data-journey]').forEach(root => {
    const svg = $('svg', root); if (!svg) return;
    const run = $('.jpath--run', svg), pulse = $('.jpulse', svg);
    const nodes = $$('.jnode', root), caps = $$('.jx__cap-item', root), items = $$('.jlist li', root);
    const len = run.getTotalLength();
    run.style.setProperty('--len', len);
    // Where each stop sits along the path
    const at = nodes.map(n => {
      const x = parseFloat(n.dataset.x), y = parseFloat(n.dataset.y);
      let best = 0, bd = 1e9;
      for (let l = 0; l <= len; l += 4) { const p = run.getPointAtLength(l); const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = l; } }
      return best;
    });
    let active = 0, pinned = false, progress = 0;
    const show = (i, upto) => {
      active = i;
      nodes.forEach((n, j) => { n.classList.toggle('is-active', j === i); n.classList.toggle('is-done', j <= upto); });
      caps.forEach((c, j) => c.classList.toggle('is-active', j === i));
      items.forEach((c, j) => c.classList.toggle('is-active', j === i));
    };
    const place = (l) => {
      const p = run.getPointAtLength(l);
      if (pulse) { pulse.setAttribute('cx', p.x); pulse.setAttribute('cy', p.y); }
      run.style.setProperty('--off', len - l);
    };
    const nearest = (l) => { let k = 0; at.forEach((a, j) => { if (l >= a - 2) k = j; }); return k; };
    const link = $('[data-goto]', root);
    nodes.forEach((n, i) => {
      const pin = () => { pinned = true; progress = at[i] / len; place(at[i]); show(i, i); if (link) link.dataset.goto = i; };
      n.addEventListener('pointerenter', pin);
      n.addEventListener('focus', pin);
      n.addEventListener('click', pin);
    });
    root.addEventListener('pointerleave', () => { pinned = false; });
    $('.jx__plot', root).addEventListener('pointerleave', () => { pinned = false; });
    if (link) link.addEventListener('click', () => {
      const i = parseInt(link.dataset.goto || active, 10);
      const acc = $$('.acc__item')[i]; if (acc) setTimeout(() => acc.dispatchEvent(new Event('focus')), 400);
    });
    items.forEach((li, i) => li.addEventListener('click', () => show(i, i)));
    place(at[0]); show(0, 0);
  });

  /* ---- Silk wave (canvas) ---------------------------------------------- */
  $$('canvas[data-wave]').forEach(cv => {
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const red = cv.dataset.wave === 'red';
    let W = 0, H = 0, dpr = 1, raf = 0, visible = true;
    const N = 70;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (t) => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);
      if (red) {
        const g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, '#B80000'); g.addColorStop(.55, '#E60000'); g.addColorStop(1, '#F21212');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      const base = red ? .78 : .68, spread = red ? .26 : .4, amp = H * (red ? .07 : .1);
      const step = Math.max(6, W / 160);
      for (let pass = 0; pass < (red ? 2 : 1); pass++) {
        const dark = red && pass === 0;
        ctx.globalCompositeOperation = dark ? 'source-over' : 'lighter';
        const g = ctx.createLinearGradient(0, 0, W, 0);
        if (dark) { g.addColorStop(0, 'rgba(70,0,0,0)'); g.addColorStop(.5, 'rgba(70,0,0,.55)'); g.addColorStop(1, 'rgba(40,0,0,.8)'); }
        else if (red) { g.addColorStop(0, 'rgba(255,150,150,0)'); g.addColorStop(.55, 'rgba(255,170,170,.5)'); g.addColorStop(1, 'rgba(255,255,255,.95)'); }
        else { g.addColorStop(0, 'rgba(150,0,0,0)'); g.addColorStop(.3, 'rgba(230,0,0,.8)'); g.addColorStop(.62, 'rgba(255,40,35,1)'); g.addColorStop(.85, 'rgba(255,170,150,1)'); g.addColorStop(1, 'rgba(255,236,230,1)'); }
        ctx.strokeStyle = g; ctx.fillStyle = g; ctx.lineWidth = dark ? 1.6 : 1.4;
        const yAt = (x, s, k) => {
          const u = x / W;
          const c = H * base + Math.sin(u * 2.3 + t * .22) * amp + Math.sin(u * 5.1 + t * .37 + 1.3) * amp * .35 - u * H * .16;
          const open = .35 + .65 * Math.pow(Math.sin(u * 3.2 + t * .3 + (dark ? 0 : 1.7)) * .5 + .5, 1.5);
          return c + s * H * spread * open + Math.sin(u * 4.2 + k * .11 + t * .5) * H * .018 * (.5 + Math.abs(s));
        };
        if (!dark) {
          ctx.globalAlpha = red ? .22 : .38; ctx.beginPath();
          for (let x = -step; x <= W + step; x += step) { const y = yAt(x, -.42, 0); x <= -step + .1 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
          for (let x = W + step; x >= -step; x -= step) ctx.lineTo(x, yAt(x, .42, N));
          ctx.closePath(); ctx.fill();
        }
        for (let k = 0; k < N; k++) {
          const s = k / (N - 1) - .5;
          ctx.globalAlpha = (dark ? .4 : .3) * (1 - Math.abs(s) * 1.1);
          ctx.beginPath();
          for (let x = -step; x <= W + step; x += step) { const y = yAt(x, s, k); x <= -step + .1 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    };
    const loop = (now) => { raf = 0; if (!visible) return; draw(now / 1000); raf = requestAnimationFrame(loop); };
    size(); draw(2.5);
    new ResizeObserver(() => { size(); draw(2.5); }).observe(cv);
    if (reduceMotion) return;
    new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }), { threshold: 0 }).observe(cv);
  });

  /* ---- Background videos: appear only once playable (no loader/spinner) --- */
  $$('video[data-vid]').forEach(v => {
    const ready = () => v.classList.add('is-ready');
    if (v.readyState >= 3) ready(); else v.addEventListener('canplay', ready, { once: true });
    v.addEventListener('error', () => v.remove());
    if (reduceMotion) v.pause();
  });

  /* ---- Institutional suite -------------------------------------------- */
  $$('[data-suite]').forEach(root => {
    const tabs = $$('.su__tab', root), panels = $$('.su__panel', root), MS = 7000;
    root.style.setProperty('--dur', MS + 'ms');
    const set = (i) => {
      tabs.forEach((t, j) => {
        t.classList.remove('is-active'); if (j === i) { void t.offsetWidth; t.classList.add('is-active'); }
        t.setAttribute('aria-selected', String(i === j));
      });
      panels.forEach((p, j) => { p.classList.toggle('is-active', i === j); p.setAttribute('aria-hidden', String(i !== j)); });
    };
    const auto = cycle(root, tabs.length, MS, set);
    const pick = (i) => { auto.stop(); auto.at(i); set(i); root.classList.add('paused'); };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => pick(i));
      if (finePointer) t.addEventListener('pointerenter', () => pick(i));
    });
  });

  /* ---- Spotlight on dark surfaces ------------------------------------- */
  $$('.jx,.wv,.cta,.section--ink').forEach(host => {
    const g = document.createElement('i'); g.className = 'glow'; g.setAttribute('aria-hidden', 'true'); host.appendChild(g);
    if (!finePointer || reduceMotion) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, on = false;
    const frame = () => {
      x += (tx - x) * 0.14; y += (ty - y) * 0.14;
      g.style.setProperty('--lx', x + 'px'); g.style.setProperty('--ly', y + 'px');
      raf = (Math.abs(tx - x) + Math.abs(ty - y) > 0.5) ? requestAnimationFrame(frame) : 0;
    };
    host.addEventListener('pointermove', e => {
      const r = host.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top;
      if (!on) { x = tx; y = ty; on = true; }
      if (!raf) raf = requestAnimationFrame(frame);
    });
  });

  /* ---- Locations: live office hours + contact form -------------------- */
  const offs = $$('.off[data-tz]');
  if (offs.length) {
    const upd = () => {
      const now = new Date();
      offs.forEach(o => {
        const parts = new Intl.DateTimeFormat('en-GB', { timeZone: o.dataset.tz, hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short' }).formatToParts(now);
        const g = t => parts.find(p => p.type === t).value;
        const mins = (parseInt(g('hour'), 10) % 24) * 60 + parseInt(g('minute'), 10), wk = g('weekday');
        const open = !['Sat', 'Sun'].includes(wk) && mins >= 540 && mins < 1020;
        $('[data-time]', o).textContent = g('hour') + ':' + g('minute');
        $('[data-state]', o).textContent = open ? 'Open now' : (['Sat', 'Sun'].includes(wk) ? 'Closed for the weekend' : 'Closed now');
        o.classList.toggle('is-open', open);
      });
    };
    upd(); setInterval(upd, 30000);
  }
  const cf = $('#cform');
  if (cf) cf.addEventListener('submit', e => {
    e.preventDefault();
    const st = $('#cf-status'); const req = $$('[required]', cf); let bad = null;
    req.forEach(f => { const ok = f.value.trim() && (f.type !== 'email' || /^\S+@\S+\.\S+$/.test(f.value)); f.classList.toggle('is-bad', !ok); if (!ok && !bad) bad = f; });
    if (bad) { st.textContent = bad.type === 'email' ? 'Enter a valid work email, like name@company.com.' : 'Fill in the highlighted fields to continue.'; bad.focus(); return; }
    st.textContent = 'Demo form: it is not connected to a mailbox yet, so nothing was sent.';
  });
})();
