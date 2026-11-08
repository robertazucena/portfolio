/* The American Club Singapore: shared by every page (clocks, toast, Club Index, scroll reveals). Plain JS, works from file://. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

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
    say(a.dataset.soon, 'is coming soon. This concept covers the homepage, Dining, Fitness, Kids, Events and Membership.');
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
