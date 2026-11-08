/* The American Club Singapore: inner pages (hero reel, dining filter, membership finder, tour form). Needs core.js. */
(() => {
  const { $, $$, reduce } = window.AC;

  /* ---------- hero reel: desktop only, the photo stays underneath ---------- */
  const reelMQ = matchMedia('(min-width: 901px) and (prefers-reduced-motion: no-preference)');
  $$('video[data-src]').forEach(v => {
    const sync = on => {
      if (on && reelMQ.matches) {
        if (v.dataset.src) { v.src = v.dataset.src; v.removeAttribute('data-src'); }
        const pr = v.play(); if (pr) pr.catch(() => {});
      } else v.pause();
    };
    v.muted = true;
    v.addEventListener('playing', () => v.classList.add('is-on'), { once: true });
    new IntersectionObserver(([en]) => sync(en.isIntersecting)).observe(v);
  });

  /* ---------- dining: what are you after? ---------- */
  const venues = $$('.vn');
  const count = $('#vnCount');
  $$('[data-vf]').forEach(b => b.addEventListener('click', () => {
    $$('[data-vf]').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
    const f = b.dataset.vf;
    let n = 0;
    venues.forEach(v => {
      const on = f === 'all' || v.dataset.tags.split(' ').includes(f);
      v.hidden = !on;
      if (on) { n++; v.querySelectorAll('.rv, .rv-img').forEach(el => el.classList.add('is-in')); }
    });
    count.textContent = `${n} ${n === 1 ? 'place' : 'places'}`;
  }));

  /* ---------- membership: the arches open as the page moves on ---------- */
  const trio = $('#mhTrio');
  if (trio && !reduce.matches) {
    let raf = 0;
    const spread = () => {
      raf = 0;
      const b = trio.getBoundingClientRect();
      trio.style.setProperty('--s', Math.min(1, Math.max(0, 1 - (b.top - innerHeight * .12) / (innerHeight * .55))).toFixed(3));
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(spread); }, { passive: true });
    spread();
  }

  /* ---------- membership: one arch, a week of days ---------- */
  const days = $$('.wk__day'), pics = $$('.wk__pic');
  if (days.length) {
    const io = new IntersectionObserver(ens => ens.forEach(en => {
      if (!en.isIntersecting) return;
      const i = en.target.dataset.i;
      days.forEach(d => d.classList.toggle('is-on', d === en.target));
      pics.forEach(p => p.classList.toggle('is-on', p.dataset.i === i));
    }), { rootMargin: '-45% 0px -45% 0px' });
    days.forEach(d => io.observe(d));
  }

  if (!$('#tour')) return;

  /* ---------- membership finder: show only what is open to you ---------- */
  const rows = $$('.fees__row'), fitCount = $('#fitCount');
  $$('input[name="who"]').forEach(r => r.addEventListener('change', () => {
    let n = 0;
    rows.forEach(row => {
      const on = r.value === 'all' || row.dataset.for.split(' ').includes(r.value);
      row.hidden = !on;
      if (on) n++;
    });
    fitCount.textContent = `${n} ${n === 1 ? 'membership' : 'memberships'}`;
  }));
  // "Ask about X" carries the choice down to the tour form
  $$('.fees__go').forEach(a => a.addEventListener('click', () => { $('#t-type').value = a.dataset.type; }));

  /* ---------- tour form ---------- */
  const form = $('#tour');
  const rules = {
    first: v => v.trim() ? '' : 'Please add your first name.',
    last: v => v.trim() ? '' : 'Please add your last name.',
    email: v => !v.trim() ? 'Please add your email so we can confirm a time.'
      : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'That email looks incomplete. Check for a missing @ or domain.',
  };
  function check(name) {
    const input = form.elements[name];
    const msg = rules[name](input.value);
    $('#e-' + name).textContent = msg;
    input.closest('.f').classList.toggle('is-err', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) input.setAttribute('aria-describedby', 'e-' + name); else input.removeAttribute('aria-describedby');
    return !msg;
  }
  Object.keys(rules).forEach(n => {
    const input = form.elements[n];
    input.addEventListener('blur', () => { if (input.value) check(n); });
    input.addEventListener('input', () => { if (input.closest('.f').classList.contains('is-err')) check(n); });
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const bad = Object.keys(rules).filter(n => !check(n));
    if (bad.length) { form.elements[bad[0]].focus(); return; }
    const btn = $('.tour__btn', form);
    btn.setAttribute('aria-busy', 'true');
    $('span', btn).textContent = 'Sending…';
    setTimeout(() => {
      $('[data-name]', form).textContent = form.elements.first.value.trim();
      form.classList.add('is-done');
      const ok = $('.tour__ok', form);
      ok.hidden = false;
      ok.focus();
    }, 700);
  });
})();
