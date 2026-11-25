/* Aztec: site behaviour. No dependencies, works from file://. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const LOAD_MS = reduced ? 0 : 1250;
  const SVGNS = 'http://www.w3.org/2000/svg';

  /* ── preloader (one style: first load + every page change) ── */
  const loader = $('.loader');
  const runLoader = window.AztecLoader.run;   // the shared dial loader (core.js)

  /* ── router: #home + section anchors, and #privacy / #terms / #contact ── */
  const views = Object.fromEntries($$('[data-view]').map(v => [v.dataset.view, v]));
  const sections = ['about', 'products', 'security', 'why', 'fees', 'learn', 'vision', 'waitlist'];
  let current = null;
  const showView = name => {
    Object.entries(views).forEach(([k, v]) => { v.hidden = k !== name; });
    const v = views[name]; v.classList.remove('is-entering'); void v.offsetWidth; v.classList.add('is-entering');
    current = name;
  };
  const scrollToHash = (id, smooth) => {
    const el = id && id !== 'home' && document.getElementById(id);
    const behavior = smooth && !reduced ? 'smooth' : 'auto';
    if (!el) return scrollTo({ top: 0, behavior });
    el.scrollIntoView({ behavior, block: 'start' });
  };
  const route = (first = false) => {
    const id = decodeURIComponent(location.hash.slice(1)) || 'home';
    const view = views[id] && id !== 'home' ? id : 'home';
    const section = sections.includes(id) ? id : null;
    if (first) { showView(view); requestAnimationFrame(() => section && scrollToHash(section, false)); return; }
    closeMenu();
    if (view === current) return scrollToHash(section || 'home', true);
    loader.classList.add('is-swap'); runLoader();
    setTimeout(() => {
      showView(view); scrollTo(0, 0);
      if (section) requestAnimationFrame(() => scrollToHash(section, false));
      if (view === 'home') root.classList.add('is-in');
      onScroll();
      setTimeout(() => { loader.classList.add('is-done'); loader.classList.remove('is-swap'); }, reduced ? 0 : 200);
    }, reduced ? 0 : 1050);
  };
  addEventListener('hashchange', () => route());
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const h = a.getAttribute('href');
    if (h === location.hash || (h === '#home' && !location.hash)) { e.preventDefault(); route(); }
  });

  /* ── mobile menu ── */
  const burger = $('[data-menu-toggle]');
  const menu = $('#menu');
  const menuOpen = () => burger.getAttribute('aria-expanded') === 'true';
  function closeMenu() { burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu'); menu.hidden = true; document.body.style.overflow = ''; }
  burger.addEventListener('click', () => {
    const open = !menuOpen();
    burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open; document.body.style.overflow = open ? 'hidden' : '';
    nav.classList.remove('is-hidden'); nav.classList.add('is-solid');
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen()) { closeMenu(); burger.focus(); } });

  /* ── hero dial ticks ── */
  const ticks = $('[data-ticks]');
  if (ticks) {
    for (let i = 0; i < 120; i++) {
      const a = (i / 120) * Math.PI * 2, major = i % 10 === 0;
      const r1 = 262, r2 = major ? 286 : 274;
      const l = document.createElementNS(SVGNS, 'line');
      l.setAttribute('x1', 300 + r1 * Math.cos(a)); l.setAttribute('y1', 300 + r1 * Math.sin(a));
      l.setAttribute('x2', 300 + r2 * Math.cos(a)); l.setAttribute('y2', 300 + r2 * Math.sin(a));
      if (major) l.setAttribute('class', 'is-major');
      ticks.append(l);
    }
  }
  const dialTicks = $('[data-dial-ticks]');
  if (dialTicks) {
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2, r1 = 182, r2 = i % 12 === 0 ? 196 : 188;
      const l = document.createElementNS(SVGNS, 'line');
      l.setAttribute('x1', 200 + r1 * Math.cos(a)); l.setAttribute('y1', 200 + r1 * Math.sin(a));
      l.setAttribute('x2', 200 + r2 * Math.cos(a)); l.setAttribute('y2', 200 + r2 * Math.sin(a));
      dialTicks.append(l);
    }
    // five detents, one per value
    [-90, -18, 54, 126, 198].forEach(d => {
      const a = d * Math.PI / 180, c = document.createElementNS(SVGNS, 'circle');
      c.setAttribute('cx', 200 + 170 * Math.cos(a)); c.setAttribute('cy', 200 + 170 * Math.sin(a)); c.setAttribute('r', 5); c.setAttribute('class', 'detent');
      dialTicks.append(c);
    });
  }

  /* ── hero: phone follows the pointer a little ── */
  const heroDevice = $('.hero__device');
  const heroPhone = $('.phone--hero');
  if (heroDevice && !reduced && matchMedia('(pointer: fine)').matches) {
    $('.hero').addEventListener('pointermove', e => {
      const r = heroDevice.getBoundingClientRect();
      const x = clamp((e.clientX - (r.left + r.width / 2)) / innerWidth, -.5, .5);
      const y = clamp((e.clientY - (r.top + r.height / 2)) / innerHeight, -.5, .5);
      heroPhone.style.setProperty('--ry', (-12 + x * 18).toFixed(2) + 'deg');
      heroPhone.style.setProperty('--rx', (4 - y * 12).toFixed(2) + 'deg');
    });
  }

  /* ── values coin: flat at rest; tilts toward the pointer only while you hover it ── */
  if (!reduced && matchMedia('(pointer: fine)').matches) $$('.coin').forEach(coin => {
    const area = coin;
    area.addEventListener('pointermove', e => {
      const r = coin.getBoundingClientRect();
      const x = clamp((e.clientX - (r.left + r.width / 2)) / r.width, -.5, .5);
      const y = clamp((e.clientY - (r.top + r.height / 2)) / r.height, -.5, .5);
      coin.style.setProperty('--ry', (x * 28).toFixed(2) + 'deg');
      coin.style.setProperty('--rx', (-y * 22).toFixed(2) + 'deg');
    });
    area.addEventListener('pointerleave', () => { coin.style.removeProperty('--ry'); coin.style.removeProperty('--rx'); });
  });

  /* ── about: the statement lights up word by word ── */
  const statement = $('[data-words]');
  let words = [];
  if (statement) {
    const text = statement.textContent.trim();
    statement.setAttribute('aria-label', text);
    statement.innerHTML = text.split(' ').map(w => `<span class="w${/everyone/.test(w) ? ' hl' : ''}" aria-hidden="true">${w}</span>`).join(' ');
    words = $$('.w', statement);
  }

  /* ── values dial ── */
  const VALUES = [
    ['Simplicity', 'Fewer steps, fewer screens, and nothing on the page that doesn’t need to be there.'],
    ['Accessibility', 'Built for every level of experience, every screen size and every way people use a device.'],
    ['Transparency', 'Costs, risks and terms shown up front, in words you don’t need to look up.'],
    ['Innovation', 'New technology used where it makes money easier, not just to sound new.'],
    ['Trust', 'We’ll launch only when security, licensing and safeguards are properly in place.']
  ];
  const dial = $('[data-dial]');
  if (dial) {
    const stops = $$('[role="radio"]', dial);
    const center = $('.dial__center', dial);
    const angles = [-90, -18, 54, 126, 198];
    let idx = 0, turns = 0, auto = null, prevAngle = 0;
    const set = (i, focus) => {
      const prev = idx; idx = (i + 5) % 5;
      stops.forEach((b, k) => { const on = k === idx; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; });
      if (focus) stops[idx].focus();
      // always turn clockwise, like a real dial
      let target = angles[idx] + 90 + turns * 360;
      if (target < prevAngle) { turns++; target += 360; }
      prevAngle = target;
      dial.style.setProperty('--k', target + 'deg');
      dial.style.setProperty('--fill', ((idx + 1) / 5) * 100);
      if (prev === idx && !focus) return;
      center.classList.add('is-swap');
      setTimeout(() => {
        $('[data-dial-num]').textContent = `0${idx + 1} / 05`;
        $('[data-dial-name]').textContent = VALUES[idx][0];
        $('[data-dial-text]').textContent = VALUES[idx][1];
        center.classList.remove('is-swap');
      }, reduced ? 0 : 280);
    };
    const stopAuto = () => { clearInterval(auto); auto = null; };
    stops.forEach((b, k) => {
      b.addEventListener('click', () => { stopAuto(); set(k); });
      b.addEventListener('keydown', e => {
        const d = ['ArrowRight', 'ArrowDown'].includes(e.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(e.key) ? -1 : 0;
        if (d) { e.preventDefault(); stopAuto(); set(idx + d, true); }
      });
    });
    set(0);
    if (!reduced) {
      new IntersectionObserver(([en]) => {
        if (en.isIntersecting && auto === null) auto = setInterval(() => set(idx + 1), 3800);
        else if (!en.isIntersecting && auto) stopAuto();
      }, { threshold: .4 }).observe(dial);
      dial.addEventListener('pointerenter', stopAuto);
    }
  }

  /* ── build: pinned phone turns through four screens ── */
  const build = $('[data-build]');
  const buildPhone = $('[data-build-phone]');
  const steps = $$('.step');
  const screens = $$('[data-scr]');
  const buildCount = $('[data-build-count]');
  let buildIdx = 0, turning = null;
  const showScreen = i => { screens.forEach((s, k) => s.classList.toggle('is-on', k === i)); };
  const turnTo = i => {
    if (i === buildIdx) return;
    buildIdx = i;
    steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
    buildCount.textContent = String(i + 1).padStart(2, '0');
    $$('[data-tabbar] span').forEach((t, k) => t.classList.toggle('is-on', k === [1, 3, 2, 4][i]));
    buildPhone.querySelector('.app').classList.toggle('is-flow', i === 2);   // Send is a full-screen flow: the tab bar steps aside
    if (reduced || !buildPhone.animate) return showScreen(i);
    if (turning) turning.cancel();
    const half = { duration: 280, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' };
    turning = buildPhone.animate([{ rotate: 'y 0deg' }, { rotate: 'y 90deg' }], half);
    turning.onfinish = () => {
      showScreen(buildIdx);
      turning = buildPhone.animate([{ rotate: 'y -90deg' }, { rotate: 'y 0deg' }], { ...half, easing: 'cubic-bezier(.22,1,.36,1)', duration: 520 });
    };
  };
  const fitBuildPhone = () => {
    if (!buildPhone) return;
    const stage = $('.build__stage');
    const h = stage.clientHeight;
    buildPhone.style.setProperty('--ps', clamp((h - 8) / buildPhone.offsetHeight, .45, 1).toFixed(3));
  };
  addEventListener('resize', fitBuildPhone);

  /* ── translator ── */
  const TERMS = [
    ['Gas fee', 'Network gas fee: variable, denominated in gwei.', 'A small cost paid to the network to process your transfer. Aztec shows it before you confirm.'],
    ['Private key', 'Your private key controls the wallet. Never share it.', 'The master password to a crypto wallet. Aztec will never ask you for it.'],
    ['Stablecoin', 'Fiat-pegged token with reserve-backed redemption.', 'A digital coin designed to stay worth the same as a normal currency, like one US dollar.'],
    ['Volatility', '30-day realised volatility: 62% annualised.', 'How much and how fast a price goes up and down. Higher means riskier.'],
    ['FX spread', 'Mid-market rate plus a 1.2% FX spread.', 'The hidden extra cost when changing currencies. Aztec will show the total, not a percentage.'],
    ['Settlement', 'T+2 settlement, business days only.', 'When the money actually arrives: here, about two working days.'],
    ['KYC', 'KYC pending: submit documents for verification.', 'We’re checking it’s really you, which keeps your account safe.'],
    ['IBAN', 'Enter beneficiary IBAN and BIC/SWIFT code.', 'Their bank account number and their bank’s code.']
  ];
  const tr = $('[data-translator]');
  if (tr) {
    const box = $('.terms', tr), J = $('[data-tr-j]'), P = $('[data-tr-p]');
    // dictionary page: the entry fades out, the page changes, and fades back in
    const POS = ['noun', 'noun', 'noun', 'noun', 'noun', 'noun', 'abbreviation', 'abbreviation'];
    const word = $('[data-dict-word]', tr), pos = $('[data-dict-pos]', tr), no = $('[data-dict-no]', tr), nextB = $('[data-dict-next]', tr), nextW = $('[data-dict-next-word]', tr);
    let fadeT, cur = 0, first = true;
    const fill = i => {
      word.textContent = TERMS[i][0]; pos.textContent = POS[i]; no.textContent = 'p. ' + (i + 1) + ' of ' + TERMS.length;
      J.textContent = TERMS[i][1]; P.textContent = TERMS[i][2]; nextW.textContent = TERMS[(i + 1) % TERMS.length][0];
    };
    const pick = i => {
      cur = i;
      $$('button', box).forEach((b, k) => b.setAttribute('aria-pressed', k === i));
      clearTimeout(fadeT);
      if (first || reduced) { first = false; fill(i); return; }
      tr.classList.add('is-fade');
      fadeT = setTimeout(() => { fill(i); tr.classList.remove('is-fade'); }, 220);
    };
    nextB.addEventListener('click', () => pick((cur + 1) % TERMS.length));
    TERMS.forEach(([t], i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = t; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => pick(i));
      box.append(b);
    });
    pick(0);
  }

  /* ── vision ruler ── */
  const ruler = $('[data-ruler]');
  const YEARS = [2023, 2024, 2025, 2026, 2027, 2028];
  const YW = 360;
  let yrs = [];
  if (ruler) {
    ruler.innerHTML = YEARS.map(y => `<span class="yr${y === 2027 ? ' yr--target' : ''}"><b>${y}</b></span>`).join('');
    yrs = $$('.yr', ruler);
  }
  const stages = $$('[data-stage]');

  /* ── stats count up ── */
  const counters = $$('[data-count]');
  const countIO = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    countIO.unobserve(en.target);
    const el = en.target, to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
    if (reduced) { el.textContent = to.toFixed(dec); return; }
    const t0 = performance.now(), dur = 1600;
    const tick = t => { const p = clamp((t - t0) / dur); el.textContent = (to * (1 - Math.pow(1 - p, 4))).toFixed(dec); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: .6 });
  counters.forEach(c => { c.textContent = '0'; countIO.observe(c); });

  /* ── nav: each item steps in after the loader (shared aIn, core.css) ── */
  $$('.nav__logo, .nav__links a, .nav__cta, .nav__burger').forEach((el, i) => { el.setAttribute('data-chrome', ''); el.style.setProperty('--c', i); });

  /* ── security bento: small working pieces of the app ── */
  const fz = $('[data-bx-freeze]');
  if (fz) fz.addEventListener('click', () => {
    const on = fz.getAttribute('aria-checked') !== 'true';
    fz.setAttribute('aria-checked', on);
    $('[data-mini-card]').classList.toggle('is-frozen', on);
    $('[data-fz-note]').textContent = on ? 'Frozen. New card payments are declined.' : 'New card payments are allowed.';
  });
  const alertBox = $('[data-alert]');
  if (alertBox) {
    const res = $('[data-alert-res]');
    $('[data-alert-ok]').addEventListener('click', () => { alertBox.classList.add('is-done'); res.textContent = 'Thanks. Nothing else to do.'; });
    $('[data-alert-no]').addEventListener('click', () => { alertBox.classList.add('is-done'); res.textContent = 'iPhone 15 is signed out and your card is frozen. We’ll help you check the rest.'; });
  }
  const code = $('[data-code]');
  if (code) {
    const boxes = $$('i', code), digits = '482916'; let t = [];
    const play = () => {
      t.forEach(clearTimeout); t = [];
      code.classList.remove('is-ok'); boxes.forEach(b => { b.textContent = ''; b.classList.remove('is-on'); });
      boxes.forEach((b, k) => t.push(setTimeout(() => { b.textContent = digits[k]; b.classList.add('is-on'); }, reduced ? 0 : 300 + k * 180)));
      t.push(setTimeout(() => code.classList.add('is-ok'), reduced ? 0 : 300 + 6 * 180 + 200));
    };
    code.addEventListener('click', play);
    new IntersectionObserver(([en], ob) => { if (en.isIntersecting) { play(); ob.disconnect(); } }, { threshold: .6 }).observe(code);
  }

  /* ── fees calculator: sliding pill + sliding numbers ── */
  const calc = $('[data-calc]');
  if (calc) {
    let how = 'send';
    const RATE = { send: 0, card: .015, buy: .01 }, GETS = { send: 'They get', card: 'You get', buy: 'You buy' };
    const amt = $('[data-calc-amt]'), feeEl = $('[data-calc-fee]'), getEl = $('[data-calc-get]'), getL = $('[data-calc-get-l]');
    const inEl = $('[data-calc-in]'), inL = $('[data-calc-in-l]'), paper = $('[data-tape]'), tapeNo = $('[data-tape-no]');
    const INS = { send: 'You send', card: 'You pay', buy: 'You pay' };
    let prints = 1, feedT;
    const print = cls => { if (reduced) return; paper.classList.remove('is-print', 'is-feed'); void paper.offsetWidth; paper.classList.add(cls); };
    const thumb = $('.calc__thumb', calc), opts = $$('[data-calc-how]', calc);
    const fmt = n => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const place = still => {
      const b = opts.find(x => x.dataset.calcHow === how);
      thumb.classList.toggle('is-still', !!still);
      thumb.style.setProperty('--tw', b.offsetWidth + 'px');
      thumb.style.setProperty('--tx', b.offsetLeft + 'px');
    };
    // swap the text inside an element so it slides in; dir 1 = up (bigger), -1 = down
    const slide = (el, text, dir) => {
      const old = el.textContent;
      if (old === text) return;
      el.innerHTML = '';
      const sp = document.createElement('span'); sp.textContent = text;
      if (!reduced && dir) sp.className = dir > 0 ? 'is-up' : 'is-down';
      el.appendChild(sp);
      el.classList.add('is-bump'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('is-bump'), 380);
    };
    let last = { fee: 0, get: 0 };
    const draw = () => {
      const v = Math.min(1e7, +amt.value || 0), fee = Math.round(v * RATE[how] * 100) / 100, get = how === 'card' ? v : v - fee;
      slide(feeEl, fmt(fee), Math.sign(fee - last.fee));
      slide(getEl, fmt(get), Math.sign(get - last.get));
      slide(getL, GETS[how], 1);
      const pay = how === 'card' ? v + fee : v;
      slide(inEl, fmt(pay), Math.sign(pay - (last.pay || 0)));
      slide(inL, INS[how], 1);
      last = { fee, get, pay };
    };
    amt.addEventListener('input', () => { const c = amt.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'); if (c !== amt.value) amt.value = c; draw(); clearTimeout(feedT); feedT = setTimeout(() => print('is-feed'), 500); });
    opts.forEach(b => b.addEventListener('click', () => {
      if (how === b.dataset.calcHow) return;
      how = b.dataset.calcHow; opts.forEach(x => x.setAttribute('aria-checked', x === b)); place(); draw();
      tapeNo.textContent = 'No. ' + String(++prints).padStart(4, '0'); print('is-print');
    }));
    // arrow keys move along the options, like a native radio group
    calc.querySelector('.calc__how').addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      e.preventDefault(); const k = (opts.findIndex(x => x.dataset.calcHow === how) + d + opts.length) % opts.length;
      opts[k].focus(); opts[k].click();
    });
    window.addEventListener('resize', () => place(true));
    document.fonts && document.fonts.ready.then(() => place(true));
    place(true); draw();
  }

  /* ── learn carousel ── */
  const gl = $('[data-guides]');
  if (gl) {
    const cards = $$('.guide', gl), prev = $('[data-gl-prev]'), next = $('[data-gl-next]'), count = $('[data-gl-count]');
    const at = () => { const x = gl.scrollLeft; let k = 0, best = Infinity; cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft - cards[0].offsetLeft - x); if (d < best) { best = d; k = i; } }); return k; };
    const sync = () => { const k = at(), end = gl.scrollLeft + gl.clientWidth >= gl.scrollWidth - 4; count.textContent = `${end ? cards.length : k + 1} of ${cards.length}`; prev.disabled = gl.scrollLeft < 4; next.disabled = end; };
    const go = d => { const k = Math.max(0, Math.min(cards.length - 1, at() + d)); gl.scrollTo({ left: cards[k].offsetLeft - cards[0].offsetLeft, behavior: reduced ? 'auto' : 'smooth' }); };
    prev.addEventListener('click', () => go(-1)); next.addEventListener('click', () => go(1));
    gl.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    gl.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } });
    sync();
  }

  /* ── reveals ── */
  const revealSel = '.head > *, .story__item, .values__copy, .values__list > *, .dial, .steps > li, .person, .stat, .principles li, .translator, .stages li, .promises > li, .join__copy > *, .flip, .foot__brand > *, .foot__cols > div, .foot__legal, .foot__base, .doc > *, .bento > *, .fees__list li, .calc, .guide, .next > *';
  $$(revealSel).forEach(el => el.setAttribute('data-reveal', ''));
  const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px', threshold: .06 });
  $$('[data-reveal]').forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
    if (sibs.length > 1) el.style.setProperty('--d', `calc(var(--in-step) * ${sibs.indexOf(el)})`);
    io.observe(el);
  });

  /* ── one scroll loop for everything scroll-driven ── */
  const nav = $('[data-nav]');
  const navLinks = $$('.nav__links a');
  const turn = $('.turn');
  let lastY = scrollY, ticking = false;
  const progressIn = el => { const r = el.getBoundingClientRect(); return clamp((innerHeight - r.top) / (r.height + innerHeight)); };

  function onScroll() {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    // nav
    nav.classList.toggle('is-solid', y > 40);
    if (!menuOpen()) nav.classList.toggle('is-hidden', y > lastY && y > vh * .6);
    lastY = y;
    if (current !== 'home') return;

    // hero: the dial turns, the arc fills
    if (y < vh * 1.4) {
      const p = clamp(y / vh);
      if (!reduced) {
        turn.style.setProperty('--rot', (y * .09).toFixed(2) + 'deg');
      }
      turn.style.setProperty('--arc', (64 - p * 54).toFixed(2));
    }

    // statement words
    if (words.length) {
      const r = statement.getBoundingClientRect();
      const p = clamp((vh * .85 - r.top) / (r.height + vh * .35));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('lit', i < n));
    }

    // build (pinned)
    if (build) {
      const r = build.getBoundingClientRect();
      const total = r.height - vh;
      const p = clamp(-r.top / total);
      build.style.setProperty('--bp', p.toFixed(4));
      const i = Math.min(3, Math.floor(p * 4));
      steps.forEach((s, k) => s.style.setProperty('--sp', k < i ? 1 : k === i ? (p * 4 - i).toFixed(3) : 0));
      if (r.top < vh && r.bottom > 0) turnTo(i);
    }

    // vision ruler: slides so 2027 reaches the needle
    if (ruler) {
      const p = clamp(progressIn(ruler.parentElement) * 1.5 - .15);
      const pos = p * (YEARS.indexOf(2027) * YW);   // px travelled
      if (!reduced) ruler.style.setProperty('--rx', (-pos).toFixed(1) + 'px');
      else ruler.style.setProperty('--rx', -(YEARS.indexOf(2027) * YW) + 'px');
      const yearAt = reduced ? 2027 : YEARS[0] + Math.round(pos / YW);
      yrs.forEach((el, k) => el.classList.toggle('is-on', YEARS[k] === yearAt));
      const st = yearAt >= 2027 ? 2 : yearAt === 2026 ? 1 : 0;
      stages.forEach((s, k) => s.classList.toggle('is-on', k === st));
    }

    // active nav link
    let on = null;
    for (const id of sections) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < vh * .45) on = id; }
    navLinks.forEach(a => a.classList.toggle('is-on', a.getAttribute('href') === '#' + on));
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', () => requestAnimationFrame(onScroll));

  /* ── waitlist ── */
  const ISO = 'AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE PH PL PT PR QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW'.split(' ');
  const sel = $('#f-country');
  let countryName = c => c;
  if (sel) {
    try { const dn = new Intl.DisplayNames(['en'], { type: 'region' }); countryName = c => dn.of(c); } catch (e) {}
    const names = ISO.map(c => [c, countryName(c)]).sort((a, b) => a[1].localeCompare(b[1]));
    const frag = document.createDocumentFragment();
    names.forEach(([c, n]) => frag.append(new Option(n, c)));
    sel.append(frag);
  }

  const form = $('[data-waitlist]');
  const flip = $('[data-flip]');
  const back = $('[data-done]');
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const rules = {
    name: v => v.trim().length < 2 ? 'Please enter your full name.' : '',
    email: v => !v.trim() ? 'Please enter your email address.' : !EMAIL.test(v.trim()) ? 'That email doesn’t look right. Check for typos.' : '',
    country: v => !v ? 'Please choose your country.' : '',
    consent: (v, el) => !el.checked ? 'Please agree so we can email you about early access.' : ''
  };
  const check = el => {
    const msg = rules[el.name](el.value, el);
    const field = el.closest('.field');
    field.classList.toggle('is-bad', !!msg);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    $('.err', field).textContent = msg;
    return !msg;
  };
  if (form) {
    // step by step: one question per step, Enter moves on, Back keeps answers
    const steps = $$('.wz__step', form), bars = $$('.wz-bar i', form);
    const backBtn = $('[data-wz-back]', form), nextLabel = $('[data-wz-label]', form);
    const live = $('[data-wz-live]', form), count = $('[data-wz-count]', form);
    const NAMES = ['Your name', 'Your email', 'Your country', 'Check your details'];
    const inputs = $$('input, select', form);
    let at = 0;
    const stepInputs = i => $$('input, select', steps[i]);
    const go = (i, focus = true) => {
      at = i;
      steps.forEach((s, k) => { s.classList.toggle('is-on', k === i); s.classList.toggle('is-past', k < i); s.inert = k !== i; });
      bars.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.classList.toggle('is-done', k < i); });
      backBtn.hidden = i === 0;
      nextLabel.textContent = i === steps.length - 1 ? 'Join the Aztec Waitlist' : 'Continue';
      count.textContent = 'Step ' + (i + 1) + ' of ' + steps.length;
      live.textContent = count.textContent + ': ' + NAMES[i];
      if (i === 1) { const first = $('#f-name').value.trim().split(/\s+/)[0]; $('[data-wz-first]').textContent = first ? ', ' + first : ''; }
      if (i === 3) {
        $('[data-rv="name"]').textContent = $('#f-name').value.trim();
        $('[data-rv="email"]').textContent = $('#f-email').value.trim();
        $('[data-rv="country"]').textContent = countryName($('#f-country').value);
      }
      if (focus) setTimeout(() => { const el = stepInputs(i)[0]; el && el.focus({ preventScroll: true }); }, reduced ? 0 : 260);
    };
    // guess the country from the browser's language, still editable
    try { const reg = (new Intl.Locale(navigator.language).maximize().region || '').toUpperCase(); if (ISO.includes(reg)) sel.value = reg; } catch (e) {}

    inputs.forEach(el => {
      el.addEventListener('blur', () => { if (el.value && el.type !== 'checkbox') check(el); });
      ['input', 'change'].forEach(t => el.addEventListener(t, () => { if (el.closest('.field').classList.contains('is-bad')) check(el); }));
    });
    backBtn.addEventListener('click', () => go(Math.max(0, at - 1)));
    $$('[data-goto]', form).forEach(b => b.addEventListener('click', () => go(+b.dataset.goto)));

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const here = stepInputs(at), ok = here.map(check), bad = here[ok.indexOf(false)];
      if (bad) { bad.focus(); return; }
      if (at < steps.length - 1) return go(at + 1);
      const data = {
        name: $('#f-name').value.trim(),
        email: $('#f-email').value.trim().toLowerCase(),
        country: $('#f-country').value,
        consent: true,
        consentText: $('label[for="f-consent"]').textContent.trim(),
        submittedAt: new Date().toISOString()
      };
      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      try {
        const endpoint = (window.AZTEC_CONFIG || {}).waitlistEndpoint;
        if (endpoint) {
          const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (!res.ok) throw new Error('HTTP ' + res.status);
        } else {
          await new Promise(r => setTimeout(r, reduced ? 0 : 500));
          const list = JSON.parse(localStorage.getItem('aztec.waitlist') || '[]');
          if (!list.some(x => x.email === data.email)) list.push(data);
          localStorage.setItem('aztec.waitlist', JSON.stringify(list));
        }
        $('[data-done-name]').textContent = data.name;
        $('[data-done-country]').textContent = countryName(data.country);
        $('[data-done-email]').textContent = data.email;
        flip.classList.add('is-flipped');
        form.setAttribute('aria-hidden', 'true'); form.inert = true;
        back.setAttribute('aria-hidden', 'false'); back.inert = false;
        setTimeout(() => back.focus(), reduced ? 0 : 600);
      } catch (err) {
        const ec = $('#e-consent'); ec.textContent = 'We couldn’t add you just now. Please try again in a moment.';
      } finally { btn.disabled = false; }
    });
    back.inert = true;
    go(0, false);
    $('[data-reset]').addEventListener('click', () => {
      form.reset();
      $$('.field', form).forEach(f => { f.classList.remove('is-bad'); $('.err', f).textContent = ''; });
      flip.classList.remove('is-flipped');
      form.removeAttribute('aria-hidden'); form.inert = false;
      back.setAttribute('aria-hidden', 'true'); back.inert = true;
      go(0, false);
      setTimeout(() => $('#f-name').focus(), reduced ? 0 : 600);
    });
  }

  /* ── boot ── */
  route(true);
  fitBuildPhone();
  onScroll();
  runLoader();
  setTimeout(() => { loader.classList.add('is-done'); root.classList.add('is-in'); }, LOAD_MS);
})();
