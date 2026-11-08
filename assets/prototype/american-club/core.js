/* The American Club Singapore: shared by every page (clocks, toast, Club Index, scroll reveals). Plain JS, works from file://. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- preloader: every load. The line and % follow the fonts and hero photos, never faster than the name can spell (1.7s) or slower than 3.5s; between pages it is quicker ---------- */
  const root = document.documentElement, pl = $('.pl'), plName = $('#plName');
  const NAMES = { index: 'The Club', dining: 'Dining', fitness: 'Fitness', events: 'Private Events', kids: 'Kids', membership: 'Membership', about: 'About the Club', 'whats-on': 'What’s On', news: 'News', gallery: 'Gallery', contact: 'Contact', login: 'Member Login', privacy: 'Privacy' };
  const store = (k, v) => { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) {} };
  if (pl && root.classList.contains('is-pl')) {
    const nav = root.classList.contains('pl-nav');
    const MIN = reduce.matches ? 300 : nav ? 500 : 1700, MAX = nav ? 2200 : 3500, t0 = performance.now();
    const bar = $('#plBar'), pct = $('#plPct');
    const jobs = [document.fonts ? document.fonts.ready : 0, ...$$('img[fetchpriority="high"]').map(im => im.complete ? 0 : new Promise(r => { im.addEventListener('load', r, { once: true }); im.addEventListener('error', r, { once: true }); }))];
    let loaded = 0, shown = 0, lifted = false;
    jobs.forEach(j => Promise.resolve(j).then(() => loaded++, () => loaded++));
    const step = () => {
      const now = performance.now();
      // half the line is time (so it never jumps), half is what has actually arrived
      let target = now - t0 >= MAX ? 1 : .5 * Math.min(1, now / MIN) + .5 * (loaded / jobs.length);
      shown = reduce.matches ? target : shown + (target - shown) * .12;
      if (target - shown < .004) shown = target;
      bar.style.transform = `scaleX(${shown.toFixed(4)})`;
      pct.textContent = Math.round(shown * 100) + '%';
      if (shown < 1) return requestAnimationFrame(step);
      if (lifted) return; lifted = true;
      setTimeout(() => {
        root.classList.add('pl-out');
        store('acNext', null);
        setTimeout(() => root.classList.remove('is-pl', 'pl-out', 'pl-nav'), reduce.matches ? 320 : 1100);
      }, reduce.matches ? 0 : 180);
    };
    requestAnimationFrame(step);
  }
  // leaving for another page of the Club: bring the curtain up, spell the page, then go
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!pl || !a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download') || a.hasAttribute('data-soon')) return;
    const url = new URL(a.href, location.href);
    if (url.protocol !== location.protocol || url.host !== location.host || !/\.html$/.test(url.pathname)) return;
    if (url.pathname === location.pathname) return; // same page: let the anchor scroll
    const key = url.pathname.split('/').pop().replace('.html', '');
    const name = NAMES[key]; if (!name) return;
    e.preventDefault();
    store('acNext', name);
    if (reduce.matches) { location.href = url.href; return; }
    let k = 0;
    plName.innerHTML = name.split(' ').map(w => `<span class="w">${[...w].map(ch => `<span style="--i:${k++}">${ch}</span>`).join('')}</span>`).join(' ');
    $('#plBar').style.transform = 'scaleX(0)'; $('#plPct').textContent = '0%';
    root.classList.remove('is-pl', 'pl-out'); root.classList.add('pl-nav', 'pl-go');
    setTimeout(() => { location.href = url.href; }, 300 + name.length * 28 + 350);
  });
  // coming back through the history cache: put the page back as it was
  addEventListener('pageshow', e => { if (e.persisted) { root.classList.remove('pl-go', 'pl-nav', 'is-pl', 'pl-out'); store('acNext', null); } });

  /* ---------- clocks ---------- */
  const fmt = {};
  const clocks = $$('[data-tz]');
  function tick() {
    const now = new Date();
    clocks.forEach(dd => {
      const tz = dd.dataset.tz;
      fmt[tz] ||= new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true });
      const parts = fmt[tz].formatToParts(now);
      const get = t => (parts.find(p => p.type === t) || {}).value || '';
      dd.innerHTML = `${get('hour')}:${get('minute')}<small>${get('dayPeriod')}</small>`;
      dd.setAttribute('aria-label', `${get('hour')}:${get('minute')} ${get('dayPeriod')}`);
    });
  }
  tick();
  setInterval(tick, 15000);
  /* ---------- toast ---------- */
  const toast = $('#toast'), toastP = $('p', toast);
  let toastT = 0;
  function say(bold, rest) {
    const b = document.createElement('b');
    b.textContent = bold;
    toastP.replaceChildren(b, ' ' + rest);
    toast.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('is-on'), 3200);
  }
  // pages that are not built yet stay put and say so
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-soon]');
    if (!a) return;
    e.preventDefault();
    say(a.dataset.soon, 'is not part of this concept yet.');
  });

  /* ---------- the Club Index (full-screen menu) ---------- */
  const ix = $('#ix'), ixClose = $('#ixClose');
  const secs = $$('.ix__secs > li', ix);
  const figs = $$('.ix__fig img', ix);
  const narrow = matchMedia('(max-width: 900px)');
  let ixOpen = false, ixTrigger = null, ixT = 0, curK = null;

  secs.forEach((li, i) => $('.ix__sec', li).style.setProperty('--i', i));

  function setSec(k, { toggle = false } = {}) {
    if (toggle && narrow.matches && curK === k) k = null;
    curK = k;
    secs.forEach(li => {
      const on = li.dataset.k === k;
      li.classList.toggle('is-on', on);
      const b = $('button.ix__sec', li);
      if (b) b.setAttribute('aria-expanded', String(on));
    });
    const next = figs.find(img => img.dataset.k === k);
    if (!next || next.classList.contains('is-on')) return;
    figs.forEach(img => img.classList.remove('is-prev'));
    const prev = figs.find(img => img.classList.contains('is-on'));
    if (prev) { prev.classList.remove('is-on'); prev.classList.add('is-prev'); }
    void next.offsetWidth;
    next.classList.add('is-on');
  }

  function openIx(k, trigger) {
    clearTimeout(ixT);
    ixTrigger = trigger || null;
    ixOpen = true;
    ix.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    $$('[data-ix]').forEach(b => b.setAttribute('aria-expanded', String(b === trigger)));
    figs.forEach(img => img.classList.remove('is-on', 'is-prev'));
    curK = null;
    setSec(k || 'club');
    requestAnimationFrame(() => requestAnimationFrame(() => ix.classList.add('is-open')));
    ($(`li[data-k="${k || 'club'}"] .ix__sec`, ix) || ixClose).focus({ preventScroll: true });
  }
  function closeIx({ restore = true } = {}) {
    if (!ixOpen) return;
    ixOpen = false;
    ix.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    $$('[data-ix]').forEach(b => b.setAttribute('aria-expanded', 'false'));
    ixT = setTimeout(() => { if (!ixOpen) ix.hidden = true; }, reduce.matches ? 0 : 520);
    if (restore && ixTrigger && !ixTrigger.closest('[inert]')) ixTrigger.focus({ preventScroll: true });
  }

  $$('[data-ix]').forEach(b => {
    b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', () => openIx(b.dataset.ix, b));
  });
  ixClose.addEventListener('click', () => closeIx());
  secs.forEach(li => {
    const el = $('.ix__sec', li), k = li.dataset.k;
    if (el.tagName === 'BUTTON') el.addEventListener('click', () => setSec(k, { toggle: true }));
    el.addEventListener('focus', () => { if (!narrow.matches) setSec(k); });
    el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && !narrow.matches) setSec(k); });
  });
  ix.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (a) closeIx({ restore: !a.getAttribute('href').startsWith('#') });
  });
  ix.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); closeIx(); return; }
    if (e.key !== 'Tab') return;
    const f = $$('a[href], button', ix).filter(el => el.getClientRects().length);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- scroll reveals ---------- */
  const rvs = $$('.rv, .rv-img');
  if (!reduce.matches) {
    const io = new IntersectionObserver(ens => ens.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    rvs.forEach(el => io.observe(el));
  } else rvs.forEach(el => el.classList.add('is-in'));

  window.AC = { $, $$, reduce, say };
})();
