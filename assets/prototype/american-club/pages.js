/* The American Club Singapore: inner pages (hero reel, dining filter, membership finder, tour form). Needs core.js. */
(() => {
  const { $, $$ } = window.AC;

  /* ---------- hero reel: desktop only, the photo stays underneath ---------- */
  const reelMQ = matchMedia('(min-width: 901px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)'); // same rule as the home hero
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
    const btn = $('.tour__btn', form);
    if (btn.getAttribute('aria-busy') === 'true') return;
    const bad = Object.keys(rules).filter(n => !check(n));
    if (bad.length) { form.elements[bad[0]].focus(); return; }
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

/* ---------- demo forms (Talk2Us!): nothing is sent; the page says what would happen ---------- */
(() => {
  const { $$, say } = window.AC;
  $$('form[data-demo]').forEach(form => form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    form.reset();
    say('Thanks.', form.dataset.demo);
  }));
})();

/* ---------- member sign-in: inline checks, show password, Caps Lock, reset step, confirmation. Nothing is sent ---------- */
(() => {
  const box = document.getElementById('sgn');
  if (!box) return;
  const $ = (s, c = box) => c.querySelector(s);
  const views = { in: $('#sgnIn'), reset: $('#sgnReset'), ok: $('#sgnOk') };
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const rules = {
    's-id': v => !v ? 'Enter your Member number or the email on your account.' : v.includes('@') && !EMAIL.test(v) ? 'That email looks incomplete. Check for a missing @ or domain.' : '',
    's-pw': v => v ? '' : 'Enter your password.',
    'r-email': v => !v ? 'Enter the email on your Member account.' : EMAIL.test(v) ? '' : 'That email looks incomplete. Check for a missing @ or domain.',
  };
  function check(input) {
    const msg = rules[input.id](input.value.trim());
    const err = $('#e-' + input.id), f = input.closest('.f');
    err.textContent = msg;
    f.classList.toggle('is-err', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    describe(input);
    return !msg;
  }
  // the error and, on the password, a showing Caps Lock warning
  function describe(input) {
    const err = $('#e-' + input.id);
    const desc = [err.textContent && err.id, input.id === 's-pw' && !$('#s-caps').hidden && 's-caps'].filter(Boolean).join(' ');
    desc ? input.setAttribute('aria-describedby', desc) : input.removeAttribute('aria-describedby');
  }
  Object.keys(rules).forEach(id => {
    const input = $('#' + id);
    input.addEventListener('blur', () => { if (input.value) check(input); });
    input.addEventListener('input', () => { if (input.closest('.f').classList.contains('is-err')) check(input); });
  });
  // show / hide the password
  const pw = $('#s-pw'), eye = $('.sgn__eye');
  const setEye = show => { pw.type = show ? 'text' : 'password'; eye.textContent = show ? 'Hide' : 'Show'; eye.setAttribute('aria-pressed', String(show)); };
  eye.addEventListener('click', () => { setEye(pw.type === 'password'); pw.focus(); });
  // Caps Lock warning while typing the password
  const caps = $('#s-caps');
  const capsOn = e => { if (e.getModifierState) { caps.hidden = !e.getModifierState('CapsLock'); describe(pw); } };
  pw.addEventListener('keydown', capsOn); pw.addEventListener('keyup', capsOn);
  pw.addEventListener('blur', () => { caps.hidden = true; describe(pw); });
  // switching between sign in, reset and the confirmation
  function show(name, focus) {
    Object.entries(views).forEach(([k, v]) => { v.hidden = k !== name; });
    const t = focus || (name === 'in' ? $('#s-id') : name === 'reset' ? $('.sgn__h', views.reset) : $('#sgnOkH'));
    t.focus();
  }
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-go]'); if (!b) return;
    if (b.dataset.go === 'reset' && $('#s-id').value.includes('@')) $('#r-email').value = $('#s-id').value.trim();
    show(b.dataset.go);
  });
  function busy(form, label, done) {
    const btn = $('.sgn__btn', form), span = $('span', btn), was = span.textContent;
    btn.setAttribute('aria-busy', 'true'); span.textContent = label;
    setTimeout(() => { btn.removeAttribute('aria-busy'); span.textContent = was; done(); }, 800);
  }
  views.in.addEventListener('submit', e => {
    e.preventDefault();
    if ($('.sgn__btn', views.in).getAttribute('aria-busy') === 'true') return;
    const bad = [$('#s-id'), pw].filter(i => !check(i));
    if (bad.length) { bad[0].focus(); return; }
    busy(views.in, 'Signing in…', () => {
      $('#sgnOkH').textContent = 'Welcome back';
      $('#sgnOkP').textContent = 'This is a concept, so you are not really signed in. On the real site you would now see your bookings, statements and Club documents.';
      $('#sgnOkGo').hidden = false;
      views.in.reset(); setEye(false); show('ok');
    });
  });
  views.reset.addEventListener('submit', e => {
    e.preventDefault();
    if ($('.sgn__btn', views.reset).getAttribute('aria-busy') === 'true') return;
    const email = $('#r-email');
    if (!check(email)) { email.focus(); return; }
    busy(views.reset, 'Sending…', () => {
      $('#sgnOkH').textContent = 'Check your email';
      $('#sgnOkP').textContent = `If ${email.value.trim()} matches a Member account, a reset link is on its way. In this concept nothing is sent.`;
      $('#sgnOkGo').hidden = true;
      views.reset.reset(); show('ok');
    });
  });
})();
