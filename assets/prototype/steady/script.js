/* Steady — shared behaviour for the five app screens. Plain JS, works from file://. */
(() => {
  'use strict';
  const doc = document.documentElement;
  doc.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const NS = 'http://www.w3.org/2000/svg';
  const page = document.body.dataset.page || '';

  /* ---------- preloader + page transitions ----------
     Three rings fill at their own pace around a counter while the caption reads the day; at 100 the rings ease
     inward and the layer dissolves, then the page arrives one piece at a time. First visit runs longest, later pages
     are quick, and leaving a page fades the layer back in before the next one loads. Embedded in the portfolio case
     study it stays out of the way on first load. */
  const pre = document.getElementById('pre');
  let preDone = !pre; const afterPre = [];
  const whenReady = fn => preDone ? fn() : afterPre.push(fn);
  const ss = (k, v) => { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch { return null; } };
  const intro = () => ['.rail', '.top', '.main > .moment', '.main > .page-head'].map(q => document.querySelector(q)).filter(Boolean);
  const reveal = () => {
    if (preDone) return; preDone = true;
    intro().forEach((el, n) => el.style.setProperty('--n', n));
    doc.classList.remove('pre-on'); afterPre.splice(0).forEach(f => f());
  };
  if (pre) {
    const rings = [...pre.querySelectorAll('.pr')], num = pre.querySelector('.pre__n'), cap = pre.querySelector('.pre__cap');
    const CAPS = [[0, 'Reading last night'], [34, 'Counting your steps'], [68, 'Settling in']];
    const ease = t => 1 - Math.pow(1 - t, 3);
    let raf = 0, capAt = 0;
    const paint = p => {
      // the outer ring leads, the inner ones catch up, all three close together at 100
      rings.forEach((r, k) => { const q = Math.min(1, Math.max(0, (p - k * .06) / (1 - k * .06))); r.style.strokeDashoffset = 100 - ease(q) * 100; });
      num.textContent = Math.round(p * 100);
      const c = CAPS.filter(([at]) => p * 100 >= at).length - 1;
      if (c !== capAt) { capAt = c; cap.classList.add('is-swap'); setTimeout(() => { cap.textContent = CAPS[c][1]; cap.classList.remove('is-swap'); }, 200); }
    };
    const run = (from, dur, done) => {
      cancelAnimationFrame(raf); const t0 = performance.now();
      const step = now => { const t = Math.min(1, (now - t0) / dur); paint(from + (1 - from) * (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)); if (t < 1) raf = requestAnimationFrame(step); else done?.(); };
      raf = requestAnimationFrame(step);
    };
    const finish = () => { pre.classList.add('is-done'); reveal(); setTimeout(() => pre.classList.add('is-gone'), 600); };
    let embedded = false; try { embedded = window.self !== window.top; } catch { embedded = true; }
    const fromNav = ss('steady:nav') === '1', seen = ss('steady:seen') === '1';
    ss('steady:nav', null); ss('steady:seen', '1');
    if (embedded) doc.classList.add('is-embedded');
    if (embedded && !fromNav) { pre.classList.add('is-gone'); preDone = true; }
    else {
      doc.classList.add('pre-on');
      if (reduce.matches) { paint(1); setTimeout(finish, 120); }
      else run(fromNav ? .55 : 0, fromNav ? 420 : seen ? 900 : 1500, () => setTimeout(finish, 140));
      setTimeout(finish, 4000);
    }
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.protocol !== location.protocol || url.host !== location.host || !/\.html$/.test(url.pathname) || url.pathname === location.pathname) return;
      e.preventDefault(); ss('steady:nav', '1');
      capAt = 0; cap.textContent = CAPS[0][1]; paint(0);
      pre.className = 'pre is-done is-back'; void pre.offsetWidth; pre.classList.remove('is-done');
      if (!reduce.matches) run(0, 520);
      setTimeout(() => { location.href = url.href; }, reduce.matches ? 0 : 300);
    });
    addEventListener('pageshow', e => { if (e.persisted) { cancelAnimationFrame(raf); pre.className = 'pre is-gone'; reveal(); } });
  }

  /* ---------- icons: one sprite, one stroke ---------- */
  const ICONS = {
    today: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    nourish: '<path d="M3 11h18a9 9 0 0 1-18 0Z"/><path d="M9 7c0-1.5 1-2 1-3.5M13 7c0-1.5 1-2 1-3.5"/>',
    sleep: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
    rhythm: '<path d="M2 12h4l2.5-6 4 12 3-9 1.5 3H22"/>',
    circle: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    send: '<path d="m22 2-11 11"/><path d="m22 2-7 20-4-9-9-4z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    wind: '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2"/>',
    walk: '<circle cx="13" cy="4" r="2"/><path d="m9 20 3-6 3 3v4M7 12l3-4 4 1 3 3M10 8l-2 6"/>',
    drop: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z"/>',
    calm: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
    video: '<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    spark: '<path d="M4 12h3l2-5 3 10 2-5h6"/>'
  };
  const sprite = `<svg xmlns="${NS}" style="display:none" aria-hidden="true">${Object.entries(ICONS).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('')}</svg>`;
  document.body.insertAdjacentHTML('afterbegin', sprite);
  const icon = (n, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;

  /* ---------- dates ---------- */
  const now = new Date();
  const fmtLong = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const fmtShort = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
  $$('[data-date]').forEach(el => { el.textContent = fmtLong.format(now); });
  const tq = /^(\d{1,2}):\d{2}$/.exec(new URLSearchParams(location.search).get('t') || '');
  const h = tq ? +tq[1] : now.getHours();
  $$('[data-greet]').forEach(el => { el.textContent = h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening'; });
  const lastDays = n => Array.from({ length: n }, (_, i) => { const d = new Date(now); d.setDate(d.getDate() - (n - 1 - i)); return d; });

  /* ---------- toast ---------- */
  let toastEl, toastT;
  function toast(text) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite');
      document.body.append(toastEl);
    }
    toastEl.innerHTML = icon('check') + '<span></span>';
    toastEl.lastChild.textContent = text;
    toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
  }

  /* ---------- sheets ---------- */
  function openSheet(id) {
    const d = document.getElementById(id);
    if (!d) return null;
    if (!d.open) d.showModal();
    return d;
  }
  document.addEventListener('click', e => {
    const opener = e.target.closest('[data-sheet]');
    if (opener) { e.preventDefault(); openSheet(opener.dataset.sheet); return; }
    const closer = e.target.closest('[data-close]');
    if (closer) closer.closest('dialog')?.close();
  });
  $$('dialog.sheet').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));

  /* ---------- reveal ---------- */
  // cards that come into view together still arrive one after another, in reading order
  let firstBatch = true;
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => {
    const vis = es.filter(en => en.isIntersecting).map(en => en.target);
    vis.forEach((el, k) => { el.style.setProperty('--i', k + (firstBatch ? 4 : 0)); el.classList.add('is-in'); io.unobserve(el); });
    if (vis.length) firstBatch = false;
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  const watch = el => io ? io.observe(el) : el.classList.add('is-in');
  $$('.kpis.rv').forEach(k => { k.classList.remove('rv'); [...k.children].forEach(c => c.classList.add('rv')); });
  whenReady(() => $$('.rv').forEach(watch));
  // fallback: inside a scaled or late-woken iframe the observer can stay silent, so cards in view are also revealed by measuring
  const sweep = () => {
    const vh = innerHeight;
    $$('.rv:not(.is-in)').forEach((el, k) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * .92 && r.bottom > 0) { el.style.setProperty('--i', k); el.classList.add('is-in'); io && io.unobserve(el); }
    });
  };
  whenReady(() => { setTimeout(sweep, 700); addEventListener('scroll', sweep, { passive: true }); addEventListener('resize', sweep, { passive: true }); });

  /* ---------- charts: one line language ---------- */
  const svg = (tag, attrs = {}) => { const el = document.createElementNS(NS, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); return el; };
  function smooth(pts) {
    if (pts.length < 2) return '';
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const t = .18;
      const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
      const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d;
  }
  function tipFor(host) {
    let t = $('.tip', host);
    if (!t) { t = document.createElement('div'); t.className = 'tip'; t.setAttribute('aria-hidden', 'true'); host.append(t); }
    return t;
  }
  function srTable(host, caption, head, rows) {
    const old = $('.sr-t', host); if (old) old.remove();
    const wrap = document.createElement('div'); wrap.className = 'sr sr-t';
    const t = document.createElement('table');
    t.innerHTML = `<caption></caption><thead><tr><th scope="col"></th><th scope="col"></th></tr></thead><tbody></tbody>`;
    t.caption.textContent = caption; const th = t.tHead.rows[0].cells; th[0].textContent = head[0]; th[1].textContent = head[1];
    rows.forEach(r => { const tr = t.tBodies[0].insertRow(); tr.insertCell().textContent = r[0]; tr.insertCell().textContent = r[1]; });
    wrap.append(t); host.append(wrap);
  }

  /* line: values -> smooth (or stepped) line, dashed baseline, end dot, crosshair + tooltip */
  const charts = [];
  const chart = (fn, host, o) => {
    if (!host) return; charts.push(() => fn(host, o)); fn(host, o);
    if (o.fill && 'ResizeObserver' in window) {
      host.classList.add('chart-fill'); let lastH = host.clientHeight, t;
      new ResizeObserver(() => { const hh = host.clientHeight; if (Math.abs(hh - lastH) < 4) return; lastH = hh; clearTimeout(t); t = setTimeout(() => fn(host, o), 60); }).observe(host);
    }
  };
  let rzW = innerWidth, rzT;
  addEventListener('resize', () => { if (innerWidth === rzW) return; rzW = innerWidth; clearTimeout(rzT); rzT = setTimeout(() => charts.forEach(f => f()), 150); });
  function lineChart(host, o) {
    host.innerHTML = '';
    const W = Math.round(host.clientWidth) || 640, H = o.fill && host.clientHeight > 120 ? Math.round(host.clientHeight) : (o.h || 180), padT = o.padT ?? 12, padB = o.labels ? 26 : 8;
    const lo = o.min ?? Math.min(...o.values), hi = o.max ?? Math.max(...o.values);
    const n = o.values.length;
    const x = i => (i / (n - 1)) * (W - 8) + 4;
    const y = v => padT + (1 - (v - lo) / (hi - lo || 1)) * (H - padT - padB);
    const pts = o.values.map((v, i) => [x(i), y(v)]);
    const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'chart', role: 'img', 'aria-label': o.label });
    const defs = svg('defs'); const g = svg('linearGradient', { id: 'fade', x1: 0, x2: 0, y1: 0, y2: 1 });
    g.append(svg('stop', { offset: 0, 'stop-color': o.night ? '#eceef1' : '#17181c', 'stop-opacity': o.night ? .22 : .1 }), svg('stop', { offset: 1, 'stop-color': o.night ? '#eceef1' : '#17181c', 'stop-opacity': 0 }));
    defs.append(g); s.append(defs);
    if (o.base != null) s.append(svg('line', { class: 'base', x1: 0, x2: W, y1: y(o.base), y2: y(o.base) }));
    let d;
    if (o.step) { d = `M${pts[0][0]},${pts[0][1]}`; for (let i = 1; i < n; i++) d += ` H${pts[i][0]} V${pts[i][1]}`; }
    else d = smooth(pts);
    if (o.area) s.append(svg('path', { class: 'area', d: `${d} L${pts[n - 1][0]},${H - padB} L${pts[0][0]},${H - padB} Z` }));
    const ln = svg('path', { class: 'ln', d, 'vector-effect': 'non-scaling-stroke' }); s.append(ln);
    if (o.endDot !== false) s.append(svg('circle', { class: 'dot', cx: pts[n - 1][0], cy: pts[n - 1][1], r: 5, 'vector-effect': 'non-scaling-stroke' }));
    if (o.labels) o.labels.forEach(([i, txt]) => { const t = svg('text', { x: Math.min(Math.max(x(i), 14), W - 14), y: H - 6, 'text-anchor': i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle' }); t.textContent = txt; s.append(t); });
    host.classList.add('chart-host');
    host.prepend(s);
    if (o.base != null && o.baseLabel) { const b = document.createElement('span'); b.className = 'base-lbl'; b.textContent = o.baseLabel; b.style.top = `${(y(o.base) / H) * 100}%`; host.append(b); }
    requestAnimationFrame(() => { try { const L = ln.getTotalLength(); s.style.setProperty('--len', Math.ceil(L * 1.2)); } catch (e) {} host.classList.add('draw'); watch(host); });
    // crosshair
    if (o.tip) {
      const tip = tipFor(host), cross = document.createElement('i'); cross.className = 'cross'; host.append(cross);
      const show = cx => {
        const r = s.getBoundingClientRect(); const rel = Math.min(Math.max((cx - r.left) / r.width, 0), 1);
        const i = Math.round(rel * (n - 1)); const px = (x(i) / W) * r.width, py = (pts[i][1] / H) * r.height;
        cross.style.cssText = `left:${px + s.offsetLeft}px;top:${s.offsetTop + padT}px;height:${r.height - padT - padB}px;opacity:1`;
        tip.innerHTML = o.tip(i); tip.style.cssText = `left:${Math.min(Math.max(px, 60), r.width - 60) + s.offsetLeft}px;top:${py + s.offsetTop}px;opacity:1`;
      };
      const hide = () => { tip.style.opacity = 0; cross.style.opacity = 0; };
      s.addEventListener('pointermove', e => show(e.clientX));
      s.addEventListener('pointerdown', e => show(e.clientX));
      s.addEventListener('pointerleave', hide);
    }
    if (o.table) srTable(host, o.label, o.table.head, o.table.rows);
    return { x, y, W, H };
  }

  /* bars: rounded data-ends on a flat baseline, 2px gaps, per-bar tooltip, optional goal line */
  function barChart(host, o) {
    host.innerHTML = '';
    const W = Math.round(host.clientWidth) || 640, H = o.h || 200, padT = 10, padB = 26, n = o.values.length;
    const max = o.max || Math.max(...o.values, o.goal || 0) * 1.08;
    const slot = W / n, bw = Math.min(slot * .56, 46);
    const y = v => padT + (1 - v / max) * (H - padT - padB);
    const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'chart', role: 'img', 'aria-label': o.label });
    const gB = svg('g', { class: 'bars' });
    o.values.forEach((v, i) => {
      const cx = slot * i + slot / 2, top = y(v), base = H - padB, r = Math.min(6, (base - top) / 2);
      const x0 = cx - bw / 2, x1 = cx + bw / 2;
      const p = svg('path', { d: `M${x0},${base} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x1 - r} Q${x1},${top} ${x1},${top + r} V${base} Z`, 'data-i': i });
      if (o.hi?.(i, v)) p.classList.add(o.night ? 'hit' : 'on');
      gB.append(p);
      const t = svg('text', { x: cx, y: H - 6, 'text-anchor': 'middle' }); t.textContent = o.labels[i]; s.append(t);
    });
    s.append(gB);
    if (o.goal) { s.append(svg('line', { class: 'goal', x1: 0, x2: W, y1: y(o.goal), y2: y(o.goal) })); }
    // hit targets: whole column
    const tip = tipFor(host); host.classList.add('chart-host'); host.prepend(s);
    const hits = svg('g');
    o.values.forEach((v, i) => { const rct = svg('rect', { x: slot * i, y: 0, width: slot, height: H, fill: 'transparent', 'data-i': i }); hits.append(rct); });
    s.append(hits);
    const show = i => {
      const r = s.getBoundingClientRect(); const px = ((slot * i + slot / 2) / W) * r.width, py = (y(o.values[i]) / H) * r.height;
      tip.innerHTML = o.tip(i); tip.style.cssText = `left:${Math.min(Math.max(px, 64), r.width - 64) + s.offsetLeft}px;top:${py + s.offsetTop}px;opacity:1`;
      $$('path', gB).forEach(p => p.classList.toggle('peek', +p.dataset.i === i));
    };
    hits.addEventListener('pointermove', e => { const i = e.target.dataset.i; if (i != null) show(+i); });
    hits.addEventListener('pointerdown', e => { const i = e.target.dataset.i; if (i != null) show(+i); });
    s.addEventListener('pointerleave', () => { tip.style.opacity = 0; $$('path', gB).forEach(p => p.classList.remove('peek')); });
    srTable(host, o.label, o.table.head, o.table.rows);
  }
  const tipHTML = (big, small) => `<b>${big}</b><span>${small}</span>`;
  const fmtN = n => n.toLocaleString('en-GB');

  /* ---------- companion ---------- */
  const ANSWERS = [
    [/sleep|slept|night|tired/i, 'You slept 7h 32m, 45 minutes more than the night before, with 1h 28m of deep sleep. Going to bed around 11 again tonight would keep the streak going.'],
    [/walk|move|steps|exercise|run/i, 'You’re at 8,240 steps, about 1,760 short of 10,000. A 15-minute walk after lunch would close most of the gap. Want me to add it to Up next?'],
    [/eat|lunch|food|meal|hungry|dinner/i, 'Lunch and breakfast came to 1,005 kcal. A dinner around 500–600 kcal with some protein, like the salmon you had on Tuesday, would land you near your goal.'],
    [/heart|bpm|pulse|stress/i, 'Your heart is at 68 bpm, close to your resting 62. Afternoon peaks line up with your meetings; a two-minute pause usually brings it back down.'],
    [/water|drink|hydrat/i, 'Steady doesn’t track water any more, so there’s nothing to log. If you’re thirsty, that’s your cue.']
  ];
  const reply = q => (ANSWERS.find(([re]) => re.test(q)) || [0, 'I can help with sleep, movement, meals and your heart rate. Try asking how you slept, or for a short walk plan.'])[1];
  function companion(root) {
    if (!root) return;
    const list = $('.msgs', root), form = $('form.ask', root), input = $('input', form);
    const add = (text, who) => { const m = document.createElement('p'); m.className = `msg msg--${who}`; m.textContent = text; list.append(m); list.scrollTop = list.scrollHeight; return m; };
    const ask = q => {
      if (!q.trim()) return;
      add(q, 'me'); input.value = '';
      const t = document.createElement('p'); t.className = 'msg msg--bot msg--typing'; t.setAttribute('aria-label', 'Steady is typing'); t.innerHTML = '<i></i><i></i><i></i>'; list.append(t); list.scrollTop = list.scrollHeight;
      setTimeout(() => { t.remove(); add(reply(q), 'bot'); }, reduce.matches ? 100 : 900);
    };
    $$('.suggest button', root).forEach(b => b.addEventListener('click', () => ask(b.textContent)));
    form.addEventListener('submit', e => { e.preventDefault(); ask(input.value); });
  }

  /* ---------- Ask Steady: floating button + panel, on every screen ---------- */
  const fab = $('#askFab'), panel = $('#ai');
  if (fab && panel) {
    companion(panel);
    const open = (on, refocus = true) => {
      panel.hidden = !on; fab.setAttribute('aria-expanded', String(on));
      fab.setAttribute('aria-label', on ? 'Close Ask Steady' : 'Ask Steady');
      if (on) setTimeout(() => $('input', panel).focus({ preventScroll: true }), 60); else if (refocus) fab.focus({ preventScroll: true });
    };
    fab.addEventListener('click', () => open(panel.hidden));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden && !document.querySelector('dialog[open]')) open(false); });
    document.addEventListener('pointerdown', e => { if (!panel.hidden && !panel.contains(e.target) && !fab.contains(e.target)) open(false, false); });
    if (location.hash === '#ai') open(true);
  }

  /* ---------- moment banner: part of day, or the event happening now ---------- */
  const momentEl = $('#moment');
  const pageHead = momentEl && momentEl.nextElementSibling && momentEl.nextElementSibling.classList.contains('page-head') ? momentEl.nextElementSibling : null;
  const BOOK_KEY = 'steady.booking';
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(BOOK_KEY) || 'null'); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(BOOK_KEY, JSON.stringify(v)); } catch (e) {} }
  };
  if (momentEl) {
    // ?t=19:30 previews any time of day
    const q = new URLSearchParams(location.search).get('t');
    const clock = () => {
      const d = new Date();
      if (q && /^\d{1,2}:\d{2}$/.test(q)) { const [H, M] = q.split(':').map(Number); d.setHours(H, M, 0, 0); }
      return d;
    };
    const PERIODS = [
      [0, 'midnight', 'Midnight', 'Late, quiet hours. Sleep is the only goal right now.', 'sleep.html', 'See last night'],
      [5 * 60, 'morning', 'Morning', 'A fresh start. Your routine is there when you are.', 'sleep.html#routine', 'Open routine'],
      [11 * 60, 'lunch', 'Lunch', 'Time for a proper meal. About 760 kcal left today.', 'health.html', 'Log lunch'],
      [14 * 60, 'afternoon', 'Afternoon', 'Energy dips about now. A short walk helps more than coffee.', 'rhythm.html', 'Plan a walk'],
      [17 * 60 + 30, 'dinner', 'Dinner', 'Wind the day down with a good meal.', 'health.html', 'Log dinner'],
      [21 * 60, 'evening', 'Evening', 'Screens down soon. Bed by 11 keeps your streak going.', 'sleep.html', 'Sleep plan']
    ];
    const mins = s2 => { const [H, M] = s2.split(':').map(Number); return H * 60 + M; };
    const fmtT = m => { const H = Math.floor(m / 60) % 24, M = m % 60; return `${(H % 12) || 12}:${String(M).padStart(2, '0')} ${H < 12 ? 'AM' : 'PM'}`; };
    const events = d => {
      const list = [
        { s: '06:30', e: '08:30', title: 'Morning routine', sub: 'Four small steps, at your pace', href: 'sleep.html#routine', ic: 'sleep', cta: 'Open routine', sky: 'morning' },
        { s: '16:30', e: '16:45', title: 'A two-minute pause', sub: 'Your heart usually climbs around now', href: 'index.html', ic: 'wind', cta: 'Start breathing', sky: 'morning' },
        { s: '22:30', e: '23:00', title: 'Wind down', sub: 'Lights low, screens away', href: 'sleep.html', ic: 'sleep', cta: 'Sleep plan', sky: 'midnight' }
      ];
      if (d.getDay() === 0) list.push({ s: '08:00', e: '09:00', title: 'Sunday walk with Sarah K.', sub: '5k loop, meet at the park', href: 'circle.html', ic: 'walk', cta: 'Message Sarah', sky: 'lunch' });
      const b = store.get();
      if (b && b.date === d.toDateString()) list.push({ s: b.t, e: `${String(Math.floor((mins(b.t) + 15) / 60)).padStart(2, '0')}:${String((mins(b.t) + 15) % 60).padStart(2, '0')}`, title: `Video call with ${b.who}`, sub: `${b.role} · 15 minutes`, href: 'circle.html', ic: 'video', cta: 'Join call', sky: 'lunch', prio: 1 });
      return list.map(x => ({ ...x, sm: mins(x.s), em: mins(x.e) })).sort((a, z) => (z.prio || 0) - (a.prio || 0) || a.sm - z.sm);
    };
    // a fixed photo behind the app that follows the moment: the period, or the event happening now
    const skyEl = document.createElement('div');
    skyEl.className = 'sky-bg'; skyEl.setAttribute('aria-hidden', 'true'); skyEl.innerHTML = '<i></i><i></i><b class="sky-mesh"><span></span><span></span><span></span><span></span></b>';
    document.body.prepend(skyEl);
    const layers = [...skyEl.querySelectorAll('i')]; let skyKey = '', front = 0;
    const setSky = k => {
      if (k === skyKey) return; skyKey = k;
      document.body.dataset.sky = k;
      if (document.body.dataset.fx === 'black') return;
      const src = `media/sky-${k}-${innerWidth < 720 ? 960 : 1920}.webp`, img = new Image();
      const show = () => { if (skyKey !== k) return; const nx = layers[1 - front]; nx.style.backgroundImage = `url("${src}")`; nx.classList.add('on'); layers[front].classList.remove('on'); front = 1 - front; };
      img.src = src; (img.decode ? img.decode() : Promise.resolve()).then(show, show);
    };
    // contour lines + grain (after the reference the user picked): traced once per size, drifting slowly via CSS; kept off the side nav
    const tex = document.createElement('div'); tex.className = 'sky-tex'; tex.innerHTML = '<canvas class="sky-flow"></canvas><i class="sky-grain"></i>'; skyEl.append(tex);
    const flow = $('canvas', tex);
    const drawFlow = () => {
      const W = tex.clientWidth * 1.15, H = tex.clientHeight * 1.15, r = Math.min(devicePixelRatio || 1, 2);
      flow.width = W * r; flow.height = H * r; flow.style.width = W + 'px'; flow.style.height = H + 'px';
      const g = flow.getContext('2d'); g.scale(r, r); g.lineWidth = .7; g.strokeStyle = 'rgba(0, 0, 0, .55)';
      const s = Math.max(W, H) / 1400;
      const ang = (x, y) => { x /= s; y /= s; return Math.sin(x * .0019 + Math.cos(y * .0023) * 1.5) * 1.5 + Math.cos(y * .0011 - x * .0007) * 1.4 + Math.sin((x + y) * .0009) * .8; };
      const trace = (x, y, dir) => { g.moveTo(x, y); for (let k = 0; k < 520; k++) { const a = ang(x, y); x += Math.cos(a) * 2.2 * dir; y += Math.sin(a) * 2.2 * dir; if (x < -20 || y < -20 || x > W + 20 || y > H + 20) break; g.lineTo(x, y); } };
      g.beginPath();
      const n = Math.round(Math.min(150, Math.max(70, (W * H) / 9000)));
      for (let i = 0; i < n; i++) { const t = i / n, x = W * (.05 + t * .9) + Math.sin(i * 12.9898) * 40, y = H * (.5 + Math.cos(i * 4.1414) * .45); trace(x, y, 1); trace(x, y, -1); }
      g.stroke();
    };
    // page background: plain black (default); the saved looks stay one switch away: contour lines (?fx=lines), glass horizon (?fx=glass)
    const FXQ = new URLSearchParams(location.search).get('fx'), FX = FXQ === 'glass' || FXQ === 'lines' ? FXQ : 'black';
    document.body.dataset.fx = FX;
    let fT, fW = innerWidth;
    if (FX === 'lines') { drawFlow(); addEventListener('resize', () => { if (innerWidth === fW) return; fW = innerWidth; clearTimeout(fT); fT = setTimeout(drawFlow, 250); }); }
    else tex.remove();

    // glass horizon: a sweeping glass arc, a glowing horizon and tiny squares dissolving upward, with a soft reflection
    if (FX === 'glass') {
      const cv = document.createElement('canvas'); cv.className = 'sky-glass'; skyEl.append(cv);
      const ctx = cv.getContext('2d'), still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const GLOW = { midnight: [183, 194, 255], morning: [255, 214, 196], lunch: [255, 244, 222], afternoon: [255, 226, 178], dinner: [255, 196, 208], evening: [201, 210, 255] };
      let W, H, hz, parts = [], last = 0;
      const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
      const size = () => {
        const r = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; hz = H * (W < 720 ? .86 : .8);
        cv.width = W * r; cv.height = H * r; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.setTransform(r, 0, 0, r, 0, 0);
        const n = W < 720 ? 110 : 230; parts = [];
        for (let i = 0; i < n; i++) {
          const u = Math.pow(rnd(i), .55), x = W * (.4 + u * .6), env = Math.pow((x / W - .4) / .6, 1.6) * H * (W < 720 ? .2 : .32);
          parts.push({ x, env, y: rnd(i + 99) * env, s: 1.4 + rnd(i + 7) * 2.6, sp: 4 + rnd(i + 3) * 10, ph: rnd(i + 5) * 6.28 });
        }
      };
      const frame = t => {
        if (!still) requestAnimationFrame(frame);
        if (t - last < 33 && !still) return; const dt = Math.min(.1, (t - last) / 1000 || 0); last = t;
        const k = document.body.dataset.sky || 'lunch', c = GLOW[k] || GLOW.lunch, night = k === 'midnight' || k === 'evening';
        const ink = night ? '96, 104, 150' : '84, 92, 110';
        ctx.clearRect(0, 0, W, H);
        // the glass sweep: thin concentric arcs rising from the horizon to the top right, breathing slowly
        const br = Math.sin(t / 6000) * .015, ax = W * (W < 720 ? 1.05 : .98), arx = W * (W < 720 ? .9 : .62), ary = hz * .98;
        for (let i = 0; i < 12; i++) {
          ctx.beginPath(); ctx.ellipse(ax, hz, arx * (1 + i * .012 + br), ary * (1 + i * .01), 0, Math.PI * .995, Math.PI * 1.55);
          ctx.strokeStyle = i % 4 === 3 ? `rgba(${ink}, .1)` : `rgba(255, 255, 255, ${.75 - i * .05})`; ctx.lineWidth = i === 0 ? 1.6 : .8; ctx.stroke();
        }
        // horizon glow
        const gx = W * .62, gr = ctx.createRadialGradient(gx, hz, 0, gx, hz, W * .38);
        gr.addColorStop(0, `rgba(${c}, .9)`); gr.addColorStop(.25, `rgba(${c}, .35)`); gr.addColorStop(1, `rgba(${c}, 0)`);
        ctx.fillStyle = gr; ctx.fillRect(0, hz - H * .3, W, H * .6);
        ctx.fillStyle = 'rgba(255, 255, 255, .85)'; ctx.fillRect(0, hz - .5, W, 1);
        // reflection band below the horizon
        const rf = ctx.createLinearGradient(0, hz, 0, H); rf.addColorStop(0, 'rgba(255, 255, 255, .45)'); rf.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = rf; ctx.fillRect(0, hz, W, H - hz);
        // the squares: dense near the horizon on the right, rising and dissolving
        ctx.lineWidth = .8;
        for (const p of parts) {
          if (!still) { p.y += p.sp * dt; if (p.y > p.env) p.y = 0; }
          const f = p.env ? p.y / p.env : 1, a = (1 - f) * (.55 + .45 * Math.sin(t / 900 + p.ph));
          if (a <= .02) continue;
          const y = hz - p.y - p.s, s = p.s * (1 - f * .4);
          ctx.strokeStyle = `rgba(${ink}, ${a * .6})`; ctx.strokeRect(p.x, y, s, s);
          ctx.strokeStyle = `rgba(${ink}, ${a * .16})`; ctx.strokeRect(p.x, hz + (hz - y) * .55, s, s * .6);
        }
      };
      size(); requestAnimationFrame(frame);
      addEventListener('resize', () => { if (innerWidth === fW) return; fW = innerWidth; clearTimeout(fT); fT = setTimeout(() => { size(); if (still) requestAnimationFrame(frame); }, 200); });
      document.addEventListener('visibilitychange', () => { if (!document.hidden) last = 0; });
    }

    let sceneVid = null;
    const render = () => {
      const d = clock(), m = d.getHours() * 60 + d.getMinutes();
      const per = PERIODS.filter(p2 => p2[0] <= m).pop();
      const evs = events(d), now = evs.find(e => m >= e.sm && m < e.em), next = evs.filter(e => e.sm > m && e.sm - m <= 120).sort((a, z) => a.sm - z.sm)[0];
      momentEl.className = `moment moment--${per[1]}`;
      setSky(now && now.sky || per[1]);
      // the sun follows Singapore's real day (6:52 AM to 7:01 PM); the moon takes the night between
      const RISE = 412, SET = 1141, day = m >= RISE && m < SET;
      const f = day ? (m - RISE) / (SET - RISE) : ((m - SET + 1440) % 1440) / (1440 - SET + RISE);
      const left = day ? SET - m : (RISE - m + 1440) % 1440, dur = `${Math.floor(left / 60)}h ${left % 60}m`;
      const ends = day ? [['Sunrise', RISE], ['Sunset', SET]] : [['Sunset', SET], ['Sunrise', RISE]];
      const arcInfo = `<span class="moment__end">${ends[0][0]}<b>${fmtT(ends[0][1])}</b></span><span class="moment__note">${day ? `${dur} of daylight left` : `Sunrise in ${dur}`}</span><span class="moment__end">${ends[1][0]}<b>${fmtT(ends[1][1])}</b></span>`;
      const x = 6 + f * 88, y = 86 - Math.sin(f * Math.PI) * 66;
      // the period's message is the headline: first sentence large, the rest beside the time
      const msg = per[3].match(/^[^.]+\./), lead = msg ? msg[0] : per[3], rest = per[3].slice(lead.length).trim();
      const eyebrow = `<b>${per[2]}</b>${now ? '<em>Now</em>' : '<span>·</span>'}<span>${fmtLong.format(d)}</span><span>·</span><span class="moment__time">${fmtT(m)}</span>`;
      const head = now ? now.title : lead;
      const sub = now ? `Until ${fmtT(now.em)} · ${now.sub}` : rest;
      const scene = now && now.sky || per[1];
      momentEl.innerHTML = `<i class="moment__scene" aria-hidden="true" style="background-image:url('media/poster-${scene}.webp')"></i><i class="moment__stars" aria-hidden="true"></i><div class="moment__in"><div class="moment__txt"><p class="moment__eyebrow">${eyebrow}</p>${pageHead ? '' : `<p class="moment__h">${head}</p>${sub ? `<p class="moment__sub">${sub}</p>` : ''}`}</div><div class="moment__arc" aria-hidden="true"><svg class="moment__sky" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M6 86 Q50 -46 94 86"/></svg><i class="moment__orb" style="--x:${x.toFixed(2)};--y:${y.toFixed(2)}"></i><p class="moment__info">${arcInfo}</p></div></div>`;
      // inner pages: the page's own title and action replace the tagline (the same node is moved back in on every refresh)
      if (pageHead) $('.moment__txt', momentEl).append(pageHead);
      // a slow, muted clip of the same scene plays over its poster; the same element survives each minute's refresh
      if (!reduce.matches) {
        if (!sceneVid) {
          sceneVid = document.createElement('video');
          sceneVid.className = 'moment__video'; sceneVid.muted = true; sceneVid.loop = true; sceneVid.playsInline = true; sceneVid.preload = 'auto';
          sceneVid.setAttribute('aria-hidden', 'true'); sceneVid.setAttribute('muted', ''); sceneVid.setAttribute('playsinline', '');
          sceneVid.addEventListener('playing', () => sceneVid.classList.add('is-on'));
        }
        if (sceneVid.dataset.k !== scene) { sceneVid.dataset.k = scene; sceneVid.classList.remove('is-on'); sceneVid.poster = `media/poster-${scene}.webp`; sceneVid.src = `media/scene-${scene}.mp4`; }
        $('.moment__scene', momentEl).after(sceneVid);
        sceneVid.play().catch(() => {});
      }
      momentEl.setAttribute('aria-label', `${now ? now.title + ', happening now' : per[2]}, ${fmtT(m)}`);
      momentEl.setAttribute('role', 'region');
    };
    render();
    if (!q) setInterval(render, 60000);
  }

  /* ======================= TODAY ======================= */
  if (page === 'today') {
    const heart = [58, 57, 56, 56, 55, 57, 62, 70, 74, 72, 69, 71, 76, 73, 70, 68, 72, 80, 75, 70, 66, 63, 61, 60];
    const hrNow = new Date().getHours();
    const upto = heart.slice(0, Math.max(8, hrNow + 1));
    const hh = i => `${String(i).padStart(2, '0')}:00`;
    chart(lineChart, $('#heartLine'), {
      values: upto, min: 50, max: 84, base: 62, baseLabel: 'Resting 62', area: true, h: 170, fill: true, label: 'Heart rate today, hourly',
      labels: [[0, '00:00'], [Math.floor((upto.length - 1) / 2), hh(Math.floor((upto.length - 1) / 2))], [upto.length - 1, 'Now']],
      tip: i => tipHTML(`${upto[i]} bpm`, i === upto.length - 1 ? 'Now' : hh(i)),
      table: { head: ['Hour', 'Beats per minute'], rows: upto.map((v, i) => [hh(i), v]) }
    });
    $('#hrNow').textContent = upto[upto.length - 1];
    chart(lineChart, $('#heartMini'), { values: upto, min: 50, max: 84, h: 64, endDot: true, label: 'Heart rate trend today', padT: 6 });

    // pause: three patterns, each phase = [cue, seconds, orb scale]
    const pause = $('#pause');
    if (pause) {
      const orb = $('.orb', pause), cue = $('.pause__cue', pause), cnt = $('.orb b', pause), left = $('.pause__left', pause);
      const ring = $('.pause__ring', pause), steps = $$('.pause__steps li', pause), NAMES = { box: 'Box breathing', calm: 'Calm breathing', quick: 'Quick reset' };
      const PZ = {
        box: { total: 120, ph: [['Breathe in', 4, 1], ['Hold', 4, 1], ['Breathe out', 4, .62]] },
        calm: { total: 120, ph: [['Breathe in', 4, 1], ['Hold', 7, 1], ['Breathe out', 8, .62]] },
        quick: { total: 60, ph: [['Breathe in', 4, 1], ['Hold', 4, 1], ['Breathe out', 4, .62]] }
      };
      let pz = PZ.box, timer = 0, t0 = 0;
      const radios = $$('[data-pz]', pause);
      const pick = r => {
        radios.forEach(x => { const on = x === r; x.setAttribute('aria-checked', String(on)); x.tabIndex = on ? 0 : -1; });
        pz = PZ[r.dataset.pz]; $('#pzLen').textContent = `${pz.total / 60} min`;
      };
      radios.forEach((r, i) => {
        r.tabIndex = i ? -1 : 0;
        r.addEventListener('click', () => pick(r));
        r.addEventListener('keydown', e => {
          const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
          if (!d) return;
          e.preventDefault(); const n = radios[(i + d + radios.length) % radios.length]; n.focus(); pick(n);
        });
      });
      const stop = done => {
        clearInterval(timer); timer = 0; pause.classList.remove('is-on'); ring.style.setProperty('--p', 0); orb.style.setProperty('--s', .62);
        $('#pauseStart').focus();
        if (done) toast('Pause done. Nicely steady.');
      };
      $('#pauseStart').addEventListener('click', () => {
        pause.classList.add('is-on'); t0 = Date.now(); let last = -1;
        $('.pause__name', pause).textContent = NAMES[Object.keys(PZ).find(k => PZ[k] === pz)];
        steps.forEach((li, j) => { li.lastChild.textContent = pz.ph[j][1]; });
        const cyc = pz.ph.reduce((a, p) => a + p[1], 0);
        const tick = () => {
          const el = (Date.now() - t0) / 1000;
          if (el >= pz.total) return stop(true);
          let t = el % cyc, i = 0;
          while (t >= pz.ph[i][1]) { t -= pz.ph[i][1]; i++; }
          if (i !== last) { last = i; steps.forEach((li, j) => li.classList.toggle('is-on', j === i)); cue.textContent = pz.ph[i][0]; orb.style.setProperty('--dur', `${pz.ph[i][1]}s`); orb.style.setProperty('--s', pz.ph[i][2]); }
          cnt.textContent = Math.ceil(pz.ph[i][1] - t);
          const r = Math.ceil(pz.total - el);
          left.textContent = `${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')} left`;
          ring.style.setProperty('--p', (el / pz.total * 100).toFixed(2));
        };
        tick(); timer = setInterval(tick, 250);
        $('#pauseStop').focus();
      });
      $('#pauseStop').addEventListener('click', () => stop(false));
    }
    // overview radar: % of goal on five axes, two series, morphs between ranges
    const radarHost = $('#radar');
    if (radarHost) {
      const AX = ['Sleep', 'Steps', 'Nourish', 'Active', 'Pauses'];
      const R = {
        day:   { a: 'Today', b: 'Your usual', A: [94, 82, 62, 107, 50], B: [93, 70, 93, 80, 29],
                 va: ['7h 32m', '8,240', '1,240 kcal', '32 min', '1 of 2'], vb: ['7h 24m', '7,024', '1,860 kcal', '24 min', '0.6'] },
        week:  { a: 'This week', b: 'Last week', A: [93, 70, 91, 80, 29], B: [90, 74, 88, 72, 14],
                 va: ['7h 24m', '7,024', '1,820 kcal', '24 min', '4 pauses'], vb: ['7h 12m', '7,410', '1,760 kcal', '22 min', '2 pauses'] },
        month: { a: 'This month', b: 'Last month', A: [91, 72, 90, 76, 21], B: [86, 68, 87, 70, 9],
                 va: ['7h 18m', '7,180', '1,800 kcal', '23 min', '13 pauses'], vb: ['6h 54m', '6,820', '1,740 kcal', '21 min', '5 pauses'] }
      };
      const S = 400, C = 200, RMAX = 124, MAX = 110, n = AX.length;
      const ang = i => -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const pt = (i, v) => [C + Math.cos(ang(i)) * RMAX * Math.min(v, MAX) / MAX, C + Math.sin(ang(i)) * RMAX * Math.min(v, MAX) / MAX];
      const s = svg('svg', { viewBox: `0 0 ${S} ${S}`, class: 'radar', role: 'img' });
      AX.forEach((_, i) => { const [x, y] = pt(i, MAX); s.append(svg('line', { class: 'spoke', x1: C, y1: C, x2: x, y2: y })); });
      const pb = svg('polygon', { class: 'ser-b' }), pa = svg('polygon', { class: 'ser-a' }); s.append(pb, pa);
      const vb = AX.map(() => svg('circle', { class: 'vx-b', r: 4 })), va = AX.map(() => svg('circle', { class: 'vx', r: 5 }));
      vb.forEach(c => s.append(c)); va.forEach(c => s.append(c));
      const hits = AX.map((_, i) => { const c = svg('circle', { class: 'hit', r: 22, 'data-i': i }); s.append(c); return c; });
      radarHost.append(s);
      const labels = AX.map((name, i) => {
        const d = document.createElement('div'); d.className = 'ax'; d.setAttribute('aria-hidden', 'true');
        const lr = 186 + (Math.sin(ang(i)) > .1 ? 14 : 0), x = C + Math.cos(ang(i)) * lr, y = C + Math.sin(ang(i)) * lr; d.style.left = `${(x / S) * 100}%`; d.style.top = `${(y / S) * 100}%`;
        d.innerHTML = `<small>${name}</small><b></b>`; radarHost.append(d); return d;
      });
      const tip = tipFor(radarHost);
      let cur = { A: R.day.A.slice(), B: R.day.B.slice() }, key = 'day', raf = 0;
      const paint = (A, B) => {
        pa.setAttribute('points', A.map((v, i) => pt(i, v).join(',')).join(' '));
        pb.setAttribute('points', B.map((v, i) => pt(i, v).join(',')).join(' '));
        A.forEach((v, i) => { const [x, y] = pt(i, v); va[i].setAttribute('cx', x); va[i].setAttribute('cy', y); hits[i].setAttribute('cx', x); hits[i].setAttribute('cy', y); });
        B.forEach((v, i) => { const [x, y] = pt(i, v); vb[i].setAttribute('cx', x); vb[i].setAttribute('cy', y); });
      };
      const set = k => {
        const r = R[k]; key = k;
        $('#lgA').textContent = r.a; $('#lgB').textContent = r.b;
        s.setAttribute('aria-label', `${r.a} against ${r.b.toLowerCase()}, as a share of each goal`);
        labels.forEach((l, i) => { $('b', l).textContent = r.va[i]; });
        srTable(radarHost, `${r.a} and ${r.b.toLowerCase()} by goal`, ['Reading', `${r.a} / ${r.b}`], AX.map((a, i) => [a, `${r.va[i]} (${r.A[i]}% of goal) / ${r.vb[i]} (${r.B[i]}%)`]));
        const fromA = cur.A.slice(), fromB = cur.B.slice(), t0 = performance.now(), dur = reduce.matches ? 0 : 700;
        cancelAnimationFrame(raf);
        const step = now => {
          const t = dur ? Math.min(1, (now - t0) / dur) : 1, e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          cur.A = fromA.map((v, i) => v + (r.A[i] - v) * e); cur.B = fromB.map((v, i) => v + (r.B[i] - v) * e);
          paint(cur.A, cur.B); if (t < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      };
      const show = i => {
        const r = R[key], rect = s.getBoundingClientRect(), [x, y] = pt(i, cur.A[i]);
        tip.innerHTML = tipHTML(`${AX[i]}: ${r.va[i]}`, `${r.A[i]}% of goal · ${r.b.toLowerCase()} ${r.vb[i]}`);
        tip.style.cssText = `left:${(x / S) * rect.width}px;top:${(y / S) * rect.height}px;opacity:1`;
      };
      hits.forEach((h, i) => { h.addEventListener('pointerenter', () => show(i)); h.addEventListener('pointerdown', () => show(i)); });
      s.addEventListener('pointerleave', () => { tip.style.opacity = 0; });
      $$('#ovSeg button').forEach(b => b.addEventListener('click', () => { $$('#ovSeg button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); set(b.dataset.r); }));
      paint(cur.A, cur.B); set('day');
    }
  }

  /* ======================= NOURISH ======================= */
  if (page === 'nourish') {
    { const kd = lastDays(7), KW = [1880, 2140, 1960, 1720, 2050, 1990, 1240];
      chart(barChart, $('#kcalWeek'), {
        values: KW, labels: kd.map((d, i) => i === 6 ? 'Today' : fmtShort.format(d)), goal: 2000, max: 2400, h: 250,
        label: 'Calories each day this week, goal 2,000', hi: i => i === 6,
        tip: i => tipHTML(`${fmtN(KW[i])} kcal`, i === 6 ? 'Today so far' : fmtLong.format(kd[i])),
        table: { head: ['Day', 'Calories'], rows: KW.map((v, i) => [fmtLong.format(kd[i]), `${fmtN(v)} kcal`]) }
      }); }
    const GOAL = 2000;
    const meals = {
      Breakfast: { target: 500, items: [['Avocado & sourdough toast', '1 slice sourdough, half an avocado', 280], ['Poached eggs', '2 large eggs, pinch of salt', 140]] },
      Lunch: { target: 600, items: [['Quinoa bowl with roasted beets', '1.5 cups quinoa, kale, goat cheese', 420], ['Grilled herb chicken', '120g chicken breast', 165]] },
      Dinner: { target: 600, items: [['Baked wild salmon', '150g fillet, lemon & dill', 235]] },
      Snacks: { target: 300, items: [] }
    };
    const macros = { carbs: [145, 250], protein: [68, 120], sugar: [42, 65] };
    const FOODS = [
      ['Greek yoghurt & berries', '170g pot, handful of berries', 180, { carbs: 18, protein: 15, sugar: 14 }],
      ['Apple', '1 medium', 95, { carbs: 25, protein: 0, sugar: 19 }],
      ['Almonds', 'A small handful, 28g', 160, { carbs: 6, protein: 6, sugar: 1 }],
      ['Banana', '1 medium', 105, { carbs: 27, protein: 1, sugar: 14 }],
      ['Hummus & carrots', '3 tbsp hummus, 1 carrot', 150, { carbs: 15, protein: 5, sugar: 5 }],
      ['Miso soup', '1 bowl', 80, { carbs: 8, protein: 6, sugar: 2 }],
      ['Brown rice', '1 cup, cooked', 215, { carbs: 45, protein: 5, sugar: 1 }],
      ['Oat flat white', '12oz', 140, { carbs: 16, protein: 3, sugar: 9 }],
      ['Dark chocolate', '2 squares, 20g', 115, { carbs: 9, protein: 2, sugar: 6 }]
    ];
    const listEl = $('#meals');
    const total = () => Object.values(meals).reduce((a, m) => a + m.items.reduce((b, it) => b + it[2], 0), 0);
    function render(newKey) {
      listEl.innerHTML = '';
      Object.entries(meals).forEach(([name, m]) => {
        const sum = m.items.reduce((a, it) => a + it[2], 0);
        const art = document.createElement('article'); art.className = 'card meal';
        art.innerHTML = `<div class="meal__h"><h3></h3><p class="meta num"><b>${fmtN(sum)}</b> / ${fmtN(m.target)} kcal</p></div><div class="kpi__bar meal__bar" aria-hidden="true"><i style="transform:scaleX(${Math.min(1, sum / m.target)})"></i></div>`;
        $('h3', art).textContent = name;
        if (m.items.length) {
          const ul = document.createElement('ul');
          m.items.forEach((it, i) => {
            const li = document.createElement('li'); if (newKey === `${name}:${i}`) li.className = 'is-new';
            li.innerHTML = `<div><b></b><small></small></div><span class="kcal num">${fmtN(it[2])} kcal</span>`;
            $('b', li).textContent = it[0]; $('small', li).textContent = it[1]; ul.append(li);
          });
          art.append(ul);
        } else {
          const e = document.createElement('div'); e.className = 'meal__empty';
          e.innerHTML = `<span>Nothing yet. Fruit or a few nuts count.</span><button class="btn btn--ghost btn--s" type="button" data-meal="${name}">${icon('plus')}Add</button>`;
          art.append(e);
        }
        listEl.append(art);
      });
      const t = total();
      $('#kcal').textContent = fmtN(t);
      $('#kcalLeft').textContent = t <= GOAL ? `${fmtN(GOAL - t)} kcal left today` : `${fmtN(t - GOAL)} kcal over today`;
      $('#kcalBar').style.transform = `scaleX(${Math.min(1, t / GOAL)})`;
      $('#kcalPct').textContent = `${Math.round((t / GOAL) * 100)}%`;
      Object.entries(macros).forEach(([k, [v, g]]) => {
        const row = $(`[data-macro="${k}"]`), p = v / g;
        $('.kpi__bar i', row).style.transform = `scaleX(${Math.min(1, p)})`; $('.kpi__v b', row).textContent = v; $('.kpi__v small', row).textContent = `/ ${g}g`;
        $('.kpi__pct', row).textContent = `${Math.round(p * 100)}%`;
        $('.kpi__s', row).textContent = v >= g ? (k === 'sugar' ? 'At your limit for today' : 'Goal reached') : k === 'sugar' ? `${g - v}g of room left` : `${g - v}g to go${k === 'protein' && p < .6 ? ', a little low' : ''}`;
      });
    }
    render();
    // log food sheet
    let meal = new Date().getHours() < 11 ? 'Breakfast' : new Date().getHours() < 15 ? 'Lunch' : new Date().getHours() < 20 ? 'Dinner' : 'Snacks';
    const segBtns = $$('#mealSeg button');
    const setMeal = m => { meal = m; segBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === m))); };
    setMeal(meal);
    segBtns.forEach(b => b.addEventListener('click', () => setMeal(b.dataset.m)));
    listEl.addEventListener('click', e => { const b = e.target.closest('[data-meal]'); if (b) { setMeal(b.dataset.meal); openSheet('logSheet'); } });
    const picks = $('#picks'), q = $('#foodQ');
    function drawPicks() {
      const term = q.value.trim().toLowerCase();
      const list = FOODS.filter(f => !term || f[0].toLowerCase().includes(term));
      picks.innerHTML = list.length ? '' : '<p class="empty-msg">No match. Try “apple”, “rice” or “soup”.</p>';
      list.forEach(f => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'pick';
        b.innerHTML = `<span class="add">${icon('plus')}</span><span><b></b><small></small></span><span class="kcal num">${f[2]} kcal</span>`;
        $('b', b).textContent = f[0]; $('small', b).textContent = f[1];
        b.setAttribute('aria-label', `Add ${f[0]}, ${f[2]} kcal`);
        b.addEventListener('click', () => {
          meals[meal].items.push([f[0], f[1], f[2]]);
          Object.keys(macros).forEach(k => { macros[k][0] += f[3][k]; });
          render(`${meal}:${meals[meal].items.length - 1}`);
          b.classList.add('is-added'); $('.add', b).innerHTML = icon('check');
          setTimeout(() => { b.classList.remove('is-added'); $('.add', b).innerHTML = icon('plus'); }, 1200);
          toast(`${f[0]} added to ${meal.toLowerCase()}`);
        });
        picks.append(b);
      });
    }
    q.addEventListener('input', drawPicks); drawPicks();
  }

  /* ======================= SLEEP ======================= */
  if (page === 'sleep') {
    // hypnogram, 15-minute samples, 0 awake .. 3 deep (drawn upside down: deep sits lowest)
    const hyp = [0, 1, 2, 3, 3, 3, 2, 1, 1, 2, 2, 3, 3, 2, 1, 1, 0, 1, 2, 2, 3, 2, 2, 1, 1, 2, 2, 1, 1, 2, 1, 1, 0];
    const NAMES = ['Awake', 'REM', 'Light', 'Deep'];
    const t0 = 23 * 60 + 8;
    const tm = i => { const m = (t0 + i * 14) % 1440; const H = Math.floor(m / 60), M = m % 60; return `${(H % 12) || 12}:${String(M).padStart(2, '0')} ${H < 12 ? 'AM' : 'PM'}`; };
    chart(lineChart, $('#hypno'), {
      values: hyp.map(v => 3 - v), min: 0, max: 3, step: true, h: 200, endDot: false, label: 'Sleep stages through last night',
      labels: [[0, '11:08 PM'], [hyp.length - 1, '6:40 AM']],
      tip: i => tipHTML(NAMES[hyp[i]], tm(i)),
      table: { head: ['Time', 'Stage'], rows: hyp.map((v, i) => [tm(i), NAMES[v]]) }
    });
    const days = lastDays(7), hrs = [7.1, 6.8, 7.6, 8.2, 7.0, 7.4, 7.5];
    const hm = v => `${Math.floor(v)}h ${String(Math.round((v % 1) * 60)).padStart(2, '0')}m`;
    chart(barChart, $('#sleepWeek'), {
      values: hrs, labels: days.map(d => fmtShort.format(d).slice(0, 2)), max: 9.4, goal: 8, h: 230, label: 'Hours slept each night this week, goal 8 hours',
      hi: (i, v) => v >= 8, tip: i => tipHTML(hm(hrs[i]), `${fmtShort.format(days[i])}${hrs[i] >= 8 ? ', goal met' : ''}`),
      table: { head: ['Night', 'Hours'], rows: hrs.map((v, i) => [fmtLong.format(days[i]), hm(v)]) }
    });
    // routine
    const steps = $$('.step'), prog = $('#routineProg'), pr = $('.pr', prog), C = 2 * Math.PI * 23;
    pr.style.strokeDasharray = C;
    const update = () => {
      const done = steps.filter(s => s.classList.contains('is-done')).length;
      pr.style.strokeDashoffset = C * (1 - done / steps.length);
      $('b', prog).textContent = `${done}/${steps.length}`;
      $('#routineTxt').textContent = done === steps.length ? 'All four done. Have a steady day.' : `${done} of ${steps.length} done. Go at your own pace.`;
    };
    steps.forEach(st => {
      const name = $('h3 span', st).textContent;
      $('[data-act="done"]', st)?.addEventListener('click', () => { st.classList.add('is-done'); st.classList.remove('is-skip'); $('.step__state em', st).textContent = 'Done'; update(); toast(`${name}: done`); $('.step__state button', st).focus(); });
      $('[data-act="skip"]', st)?.addEventListener('click', () => { st.classList.add('is-skip'); st.classList.remove('is-done'); $('.step__state em', st).textContent = 'Skipped for today'; update(); $('.step__state button', st).focus(); });
      $('.step__state button', st)?.addEventListener('click', () => { st.classList.remove('is-done', 'is-skip'); update(); $('.step__acts button', st)?.focus(); });
    });
    update();
  }

  /* ======================= RHYTHM ======================= */
  if (page === 'rhythm') {
    const days = lastDays(7), week = [6120, 7340, 5980, 8910, 7380, 5200, 8240];
    const monthLbl = ['3 wks ago', '2 wks ago', 'Last week', 'This week'], month = [44210, 51880, 47630, 49170];
    const so = {};
    const draw = mode => {
      const isW = mode === 'week', vals = isW ? week : month;
      Object.assign(so, {
        values: vals, labels: isW ? days.map((d, i) => i === 6 ? 'Today' : fmtShort.format(d)) : monthLbl, goal: isW ? 10000 : 70000, h: 220,
        max: isW ? 11000 : 76000, label: isW ? 'Steps each day this week, goal 10,000' : 'Steps each week this month, goal 70,000',
        hi: (i) => i === vals.length - 1, tip: i => tipHTML(`${fmtN(vals[i])} steps`, isW ? fmtLong.format(days[i]) : monthLbl[i]),
        table: { head: [isW ? 'Day' : 'Week', 'Steps'], rows: vals.map((v, i) => [isW ? fmtLong.format(days[i]) : monthLbl[i], fmtN(v)]) }
      });
      barChart($('#steps'), so);
      const sum = vals.reduce((a, b) => a + b, 0);
      $('#stTotal').textContent = fmtN(sum);
      $('#stTotalL').textContent = isW ? 'steps this week' : 'steps in four weeks';
      $('#stAvg').textContent = fmtN(Math.round(isW ? sum / 7 : sum / 28));
      $('#stKm').textContent = (sum * .000704).toFixed(1);
    };
    $$('#stepsSeg button').forEach(b => b.addEventListener('click', () => { $$('#stepsSeg button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); draw(b.dataset.mode); }));
    draw('week'); charts.push(() => barChart($('#steps'), so));
    // today, by the hour (6 AM to 8 PM)
    const HRS = [80, 420, 960, 1240, 380, 260, 610, 1720, 890, 240, 120, 180, 560, 420, 160];
    const hName = i => { const h = 6 + i; return `${(h % 12) || 12} ${h < 12 ? 'AM' : 'PM'}`; };
    chart(barChart, $('#hours'), {
      values: HRS, labels: HRS.map((_, i) => i % 3 ? '' : hName(i)), h: 190, max: 1900,
      label: 'Steps in each hour today, 6 AM to 8 PM', hi: (i, v) => v === Math.max(...HRS),
      tip: i => tipHTML(`${fmtN(HRS[i])} steps`, `${hName(i)} to ${hName(i + 1)}`),
      table: { head: ['Hour', 'Steps'], rows: HRS.map((v, i) => [`${hName(i)} to ${hName(i + 1)}`, fmtN(v)]) }
    });
    $$('.small-thing').forEach(b => b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on));
      const n = $$('.small-thing[aria-pressed="true"]').length;
      $('#pickedN').textContent = n ? `${n} added to today` : 'One is plenty';
      if (on) toast(`${$('b', b).textContent} added to Up next`);
    }));
  }

  /* ======================= CIRCLE ======================= */
  /* nav: a single pill slides to the hovered or focused item and glides back to the current page */
  $$('.rail nav, .tabs').forEach(nav => {
    const links = $$('a', nav), cur = links.find(l => l.getAttribute('aria-current') === 'page');
    const pill = document.createElement('i'); pill.className = 'nav__pill is-instant'; pill.setAttribute('aria-hidden', 'true');
    nav.prepend(pill); nav.classList.add('has-pill');
    let at = null;
    const go = l => {
      if (!l) { pill.style.opacity = '0'; links.forEach(x => x.classList.remove('is-lit')); at = null; return; }
      pill.style.opacity = '1'; at = l;
      pill.style.width = l.offsetWidth + 'px'; pill.style.height = l.offsetHeight + 'px';
      pill.style.transform = `translate(${l.offsetLeft}px, ${l.offsetTop}px)`;
      links.forEach(x => x.classList.toggle('is-lit', x === l));
    };
    go(cur); requestAnimationFrame(() => requestAnimationFrame(() => pill.classList.remove('is-instant')));
    links.forEach(l => { l.addEventListener('pointerenter', () => go(l)); l.addEventListener('focus', () => go(l)); l.addEventListener('click', () => go(l)); });
    nav.addEventListener('pointerleave', () => go(cur));
    nav.addEventListener('focusout', e => { if (!nav.contains(e.relatedTarget)) go(cur); });
    addEventListener('resize', () => { pill.classList.add('is-instant'); go(at || cur); requestAnimationFrame(() => pill.classList.remove('is-instant')); }, { passive: true });
  });

  /* any button can carry a short confirmation */
  document.addEventListener('click', e => { const b = e.target.closest('[data-toast]'); if (b) toast(b.dataset.toast); });

  if (page === 'profile') {
    const fmtV = (v, f) => f === 'hm' ? `${Math.floor(v / 60)}h${v % 60 ? ' ' + (v % 60) + 'm' : ''}` : f === 't' ? (H => `${(H % 12) || 12}:${String(v % 60).padStart(2, '0')} ${H < 12 ? 'AM' : 'PM'}`)(Math.floor(v / 60) % 24) : v.toLocaleString('en-US');
    $$('.stepper').forEach(s => {
      const out = $('output', s), k = 'steady:goal:' + s.dataset.goal, st = +s.dataset.step, lo = +s.dataset.min, hi = +s.dataset.max;
      let v = +s.dataset.v; try { const sv = localStorage.getItem(k); if (sv) v = +sv; } catch (e) { /* storage blocked */ }
      const draw = () => { out.textContent = fmtV(v, s.dataset.fmt); $$('button', s).forEach(b => { b.disabled = b.dataset.d < 0 ? v <= lo : v >= hi; }); };
      s.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; v = Math.min(hi, Math.max(lo, v + st * b.dataset.d)); draw(); try { localStorage.setItem(k, v); } catch (er) { /* storage blocked */ } });
      draw();
    });
    $$('.switch').forEach(b => b.addEventListener('click', () => {
      const on = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', on);
      toast(`${b.getAttribute('aria-label')} ${on ? 'on' : 'off'}`);
    }));
  }

  if (page === 'circle') {
    $$('[data-connect]').forEach(b => b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('btn--ink', !on); b.classList.toggle('btn--ghost', on);
      $('span', b).textContent = on ? 'Requested' : 'Connect';
      const pend = $('#statPending'); pend.textContent = +pend.textContent + (on ? 1 : -1);
      if (on) toast(`Request sent to ${b.dataset.connect}`);
    }));
    // consult
    let pro = '';
    const slotBtns = $$('#slots button');
    $$('[data-consult]').forEach(b => b.addEventListener('click', () => {
      pro = b.dataset.consult; $('#consultWho').textContent = pro; $('#consultRole').textContent = b.dataset.role;
      slotBtns.forEach(s => s.setAttribute('aria-pressed', 'false')); $('#consultGo').disabled = true; openSheet('consultSheet');
    }));
    slotBtns.forEach(s => s.addEventListener('click', () => { slotBtns.forEach(x => x.setAttribute('aria-pressed', String(x === s))); $('#consultGo').disabled = false; }));
    $('#consultGo').addEventListener('click', () => {
      const s = slotBtns.find(x => x.getAttribute('aria-pressed') === 'true'); $('#consultSheet').close();
      const when = new Date(); when.setDate(when.getDate() + (+s.dataset.d || 0));
      store.set({ who: pro, role: $('#consultRole').textContent, t: s.dataset.t, date: when.toDateString() });
      toast(`Video call with ${pro} booked for ${s.dataset.label}`);
    });
    // peer chat
    const CHATS = {
      'Sarah K.': ['Morning! 5k done before work 🙌', 'Joining the Sunday walk?'],
      'David L.': ['That beetroot salad from Dr. Aris is actually good.'],
      'Emma W.': ['Accepted! When does the sleep challenge start?'],
      'Marcus J.': ['Rest day today. Legs say thanks.']
    };
    let who = '';
    const chat = $('#chatList'), form = $('#chatForm');
    $$('[data-chat]').forEach(b => b.addEventListener('click', () => {
      who = b.dataset.chat; $('#chatWho').textContent = who; chat.innerHTML = '';
      (CHATS[who] || []).forEach(t => { const m = document.createElement('p'); m.className = 'msg msg--them'; m.textContent = t; chat.append(m); });
      openSheet('chatSheet'); setTimeout(() => $('input', form).focus(), 50);
    }));
    form.addEventListener('submit', e => {
      e.preventDefault(); const inp = $('input', form); const v = inp.value.trim(); if (!v) return;
      const m = document.createElement('p'); m.className = 'msg msg--me'; m.textContent = v; chat.append(m); chat.scrollTop = chat.scrollHeight; inp.value = '';
      (CHATS[who] = CHATS[who] || []);
    });
  }

})();
