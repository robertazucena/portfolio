/* The American Club Singapore: concept interactions, v2. Plain JS, works from file://. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const SG = 'Asia/Singapore';

  /* ---------- clocks + masthead date ---------- */
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
  const todayEl = $('[data-today]');
  if (todayEl) {
    const now = new Date();
    const long = new Intl.DateTimeFormat('en-GB', { timeZone: SG, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    const short = new Intl.DateTimeFormat('en-GB', { timeZone: SG, weekday: 'short', day: 'numeric', month: 'short' }).format(now);
    todayEl.innerHTML = `<span class="d-l">${long}</span><span class="d-s">${short}</span>`;
  }
  const sgDay = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: SG, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

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
  // inner pages are not built yet: keep visitors on the homepage
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-soon]');
    if (!a) return;
    e.preventDefault();
    say(a.dataset.soon, 'is coming soon. This concept covers the homepage.');
  });

  /* ---------- compact bar ---------- */
  const mast = $('#mast'), bar = $('#bar');
  new IntersectionObserver(([en]) => {
    const on = !en.isIntersecting;
    bar.classList.toggle('is-on', on);
    bar.inert = !on;
  }, { rootMargin: '-40px 0px 0px 0px' }).observe(mast);

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

  /* ---------- hero: the banner steps back into a fan of portraits ---------- */
  const hx = $('#top'), hxPin = $('.hx__pin', hx), banner = $('.hx__banner', hx), bImg = $('img', banner);
  const hxA = $('.hx__a', hx), hxH = $('.hx__h', hx), hxDeck = $('.hx__deck', hx), slot = $('.hx__slot', hx), lbC = $('.hx__lb--c', hx);
  const fan = $$('.hx__card', hx).map(el => ({ el, n: +el.dataset.n }));
  const hxMQ = matchMedia('(min-height: 560px) and (prefers-reduced-motion: no-preference)');
  const clamp01 = v => Math.min(1, Math.max(0, v));
  const span = (p, a, b) => clamp01((p - a) / (b - a));
  const eio = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const eout = t => 1 - Math.pow(1 - t, 3);
  let G = null, hxStatic = false;
  fan.forEach(c => $('.hx__lb', c.el).style.setProperty('--k', Math.abs(c.n)));

  function measureHero() {
    hx.style.setProperty('--mh', $('#mast').offsetHeight + 'px');
    hxStatic = !hxMQ.matches;
    hx.classList.toggle('is-static', hxStatic);
    const W = hxPin.clientWidth, H = hxPin.clientHeight;
    const s = slot.getBoundingClientRect(), top = s.top - hxPin.getBoundingClientRect().top;
    let h = Math.min(s.height, 520), w = h * .75;
    const maxW = W < 700 ? W * .52 : Math.min(W * .19, 300);
    if (w > maxW) { w = maxW; h = w / .75; }
    const cx = W / 2, cy = top + s.height / 2;
    // keep the family, not the wall, in the centre portrait
    const iw = 1500, ih = 1000, sc = Math.max(W / iw, H / ih), rw = iw * sc, rh = ih * sc;
    const ox = (W - rw) * .5, oy = (H - rh) * .45;
    const dx = Math.min(cx - w / 2 - ox, Math.max(cx + w / 2 - ox - rw, cx - (ox + .155 * rw)));
    const dy = Math.min(cy - h / 2 - oy, Math.max(cy + h / 2 - oy - rh, cy - (oy + .6 * rh)));
    G = { W, H, w, h, cx, cy, dx, dy, gap: W < 700 ? w * .78 : w * .92 };
    fan.forEach(c => { c.el.style.width = w + 'px'; c.el.style.height = h + 'px'; });
    lbC.style.left = cx + 'px';
    lbC.style.top = cy + h / 2 + 14 + 'px';
    hero();
  }
  function reveal(el, v, d) {
    el.style.opacity = v;
    el.style.visibility = v > 0 ? 'visible' : 'hidden';
    el.style.transform = v < 1 ? `translate3d(0, ${(1 - eout(v)) * d}px, 0)` : '';
  }
  function hero() {
    if (!G) return;
    const dist = hx.offsetHeight - hxPin.offsetHeight;
    const p = hxStatic ? 1 : clamp01(-hx.getBoundingClientRect().top / (dist || 1));
    const { W, H, w, h, cx, cy, dx, dy, gap } = G;
    // 1. the banner headline leaves, then the banner shrinks into the centre portrait
    const a = span(p, .02, .24);
    hxA.style.opacity = 1 - a;
    hxA.style.transform = `translate3d(0, ${-48 * eout(a)}px, 0)`;
    const k = eio(span(p, .04, .62));
    banner.style.clipPath = `inset(${(cy - h / 2) * k}px ${(W - cx - w / 2) * k}px ${(H - cy - h / 2) * k}px ${(cx - w / 2) * k}px round ${10 * k}px)`;
    bImg.style.scale = String(1.1 - .1 * k);
    // the navy cover lifts as the banner becomes a portrait, so the card ends in full colour
    banner.style.setProperty('--img-o', String(.5 + .5 * k));
    banner.style.setProperty('--cov', String(1 - k));
    bImg.style.translate = `${dx * k}px ${dy * k}px`;
    // 2. the portraits fan out from behind it
    const f = eout(span(p, .4, .86));
    fan.forEach(({ el, n }) => {
      const x = cx - w / 2 + n * gap * f;
      const y = cy - h / 2 + Math.pow(Math.abs(n), 1.5) * h * .045 * f;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${n * 2.4 * f}deg) scale(${.92 + .08 * f})`;
    });
    // 3. the headline and the invitation arrive around them
    reveal(hxH, span(p, .5, .74), 28);
    reveal(hxDeck, span(p, .66, .9), 20);
    hx.classList.toggle('is-set', p > .9);
  }
  hxMQ.addEventListener('change', measureHero);
  measureHero();

  /* ---------- this week: poster reel ---------- */
  const CAT = { engage: 'Member engagement', dining: 'Dining', fitness: 'Fitness & wellness', kids: 'Kids' };
  const EVENTS = [
    { d: '2026-11-04', c: 'engage', t: 'Pre-annual General Meeting sharing session', img: 'pre-agm' },
    { d: '2026-11-05', c: 'fitness', t: 'Diwali dance night with henna session', img: 'diwali' },
    { d: '2026-11-05', c: 'dining', t: 'Unwind into the evening @ Union Bar', img: 'union-bar' },
    { d: '2026-11-05', c: 'kids', t: 'Tiny Art Explorers, November 2026', img: 'tiny-art' },
    { d: '2026-11-06', c: 'kids', t: 'EnrichTots, November 2026', img: 'enrichtots' },
    { d: '2026-11-07', c: 'engage', t: 'Sip, Shop and be Merry: a Christmas market', img: 'christmas-market' },
    { d: '2026-11-08', c: 'dining', t: 'Deepavali special @ Tradewinds', img: 'deepavali' },
    { d: '2026-11-09', c: 'fitness', t: 'Sound bath healing by Master Sasti', img: 'sound-bath' },
    { d: '2026-11-10', c: 'engage', t: 'The Speaker Series. The connected body: brain, gut, mental and whole-person health', img: 'speaker-series' },
  ];
  const reel = $('#reel'), daysEl = $('#days'), dBar = $('.days__bar', daysEl), rProg = $('#reelProg');
  const [rPrev, rNext] = $$('.rbtn');
  const today = sgDay();
  const asDate = s => new Date(s + 'T12:00:00Z');
  const fWd = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' });
  const fLong = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

  const posters = EVENTS.map((ev, i) => {
    const date = asDate(ev.d);
    const li = document.createElement('li');
    li.className = 'pc';
    li.dataset.c = ev.c;
    li.dataset.d = ev.d;
    li.style.setProperty('--d', i);
    li.innerHTML = `<article aria-labelledby="pc-${i}">
      <figure class="pc__img"><img src="media/ev/${ev.img}.jpg" alt="" width="1000" height="666" loading="lazy" draggable="false">${ev.d === today ? '<span class="pc__tag">Today</span>' : ''}</figure>
      <div class="pc__meta">
        <p class="pc__date"><span class="sr">${fLong.format(date)}</span><b aria-hidden="true">${date.getUTCDate()}</b><span aria-hidden="true">${fWd.format(date)}</span></p>
        <div><p class="pc__cat"></p><h3 class="pc__t" id="pc-${i}"></h3>
          <div class="pc__acts"><button class="pc__ics" type="button"><svg class="ic"><use href="#i-cal"/></svg>Add to calendar</button><a class="lnk" href="pages/whats-on.html" data-soon="Event booking">Reserve</a></div>
        </div>
      </div></article>`;
    $('.pc__cat', li).textContent = CAT[ev.c];
    $('.pc__t', li).textContent = ev.t;
    $('.pc__ics', li).setAttribute('aria-label', `Add ${ev.t} to my calendar`);
    $('.pc__ics', li).addEventListener('click', () => downloadIcs(ev));
    reel.append(li);
    return li;
  });

  const dayBtns = [...new Set(EVENTS.map(e => e.d))].sort().map(ds => {
    const date = asDate(ds);
    const b = document.createElement('button');
    b.className = 'dy' + (ds === today ? ' is-today' : '');
    b.type = 'button';
    b.dataset.d = ds;
    b.setAttribute('aria-label', fLong.format(date) + (ds === today ? ', today' : ''));
    b.innerHTML = `<span>${ds === today ? 'Today' : fWd.format(date)}</span><b>${date.getUTCDate()}</b>`;
    b.addEventListener('click', () => {
      wantDay = ds;
      const first = posters.find(p => p.dataset.d === ds && !p.hidden);
      if (first) reel.scrollTo({ left: first.offsetLeft - padL(), behavior: reduce.matches ? 'auto' : 'smooth' });
    });
    daysEl.append(b);
    return b;
  });

  const padL = () => parseFloat(getComputedStyle(reel).paddingLeft) || 0;
  let curDay = '', wantDay = '';
  function syncReel() {
    const max = reel.scrollWidth - reel.clientWidth;
    rProg.style.transform = `scaleX(${max > 0 ? reel.scrollLeft / max : 1})`;
    rPrev.disabled = reel.scrollLeft < 4;
    rNext.disabled = reel.scrollLeft > max - 4;
    const edge = reel.scrollLeft + padL();
    const vis = posters.filter(p => !p.hidden);
    let cur = vis[0];
    for (const p of vis) if (p.offsetLeft - 8 <= edge) cur = p;
    if (reel.scrollLeft > max - 4 && vis.length) cur = vis.find(p => p.dataset.d === wantDay) || vis[vis.length - 1];
    if (!cur || cur.dataset.d === curDay) return;
    curDay = cur.dataset.d;
    dayBtns.forEach(b => b.setAttribute('aria-current', String(b.dataset.d === curDay)));
    const on = dayBtns.find(b => b.dataset.d === curDay);
    dBar.style.width = on.offsetWidth - 16 + 'px';
    dBar.style.transform = `translateX(${on.offsetLeft}px)`;
  }
  let rRaf = 0;
  reel.addEventListener('scroll', () => { if (!rRaf) rRaf = requestAnimationFrame(() => { rRaf = 0; syncReel(); }); }, { passive: true });
  [rPrev, rNext].forEach(b => b.addEventListener('click', () => { wantDay = ''; }));
  // aligning is done here rather than with CSS snap, so trackpad scrolling stays free
  const stops = () => posters.filter(p => !p.hidden).map(p => Math.min(p.offsetLeft - padL(), reel.scrollWidth - reel.clientWidth));
  const goTo = left => reel.scrollTo({ left, behavior: reduce.matches ? 'auto' : 'smooth' });
  const nearest = () => stops().reduce((a, b) => Math.abs(b - reel.scrollLeft) < Math.abs(a - reel.scrollLeft) ? b : a, 0);
  const nextStop = dir => {
    const x = reel.scrollLeft, list = stops();
    return dir > 0 ? (list.find(v => v > x + 4) ?? list[list.length - 1]) : ([...list].reverse().find(v => v < x - 4) ?? 0);
  };
  rPrev.addEventListener('click', () => goTo(nextStop(-1)));
  rNext.addEventListener('click', () => goTo(nextStop(1)));
  reel.addEventListener('keydown', e => {
    if (e.target !== reel || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    e.preventDefault();
    wantDay = '';
    goTo(nextStop(e.key === 'ArrowRight' ? 1 : -1));
  });

  // drag to browse with a mouse; a drag never counts as a click
  let drag = null, dragged = false;
  reel.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { x: e.clientX, left: reel.scrollLeft, id: e.pointerId };
    wantDay = '';
    dragged = false;
  });
  reel.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!dragged && Math.abs(dx) > 5) { dragged = true; reel.classList.add('is-drag'); reel.setPointerCapture(drag.id); }
    if (dragged) reel.scrollLeft = drag.left - dx;
  });
  const endDrag = () => {
    if (!drag) return;
    drag = null;
    if (!dragged) return;
    reel.classList.remove('is-drag');
    goTo(nearest());
  };
  reel.addEventListener('pointerup', endDrag);
  reel.addEventListener('pointercancel', endDrag);
  reel.addEventListener('click', e => { if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; } }, true);

  // start loading every poster well before the reel arrives, so none pops in mid-scroll
  new IntersectionObserver(([en], ob) => {
    if (!en.isIntersecting) return;
    ob.disconnect();
    posters.forEach(p => { const im = $('img', p); im.loading = 'eager'; });
  }, { rootMargin: '1200px 0px' }).observe(reel);

  // posters slide in once the reel is on screen
  new IntersectionObserver(([en], ob) => {
    if (!en.isIntersecting) return;
    ob.disconnect();
    reel.classList.add('is-in');
    setTimeout(() => posters.forEach(p => p.classList.add('is-settled')), 1100 + posters.length * 70);
  }, { threshold: .15 }).observe(reel);

  // filters
  const chips = $$('.chip');
  chips.forEach(c => {
    const f = c.dataset.f;
    $('.chip__n', c).textContent = f === 'all' ? EVENTS.length : EVENTS.filter(e => e.c === f).length;
    c.addEventListener('click', () => {
      chips.forEach(x => x.setAttribute('aria-pressed', String(x === c)));
      posters.forEach(p => {
        const show = f === 'all' || p.dataset.c === f;
        const was = !p.hidden;
        p.hidden = !show;
        if (show && !was && !reduce.matches) { p.classList.remove('is-back'); void p.offsetWidth; p.classList.add('is-back'); }
      });
      dayBtns.forEach(b => { b.disabled = !posters.some(p => p.dataset.d === b.dataset.d && !p.hidden); });
      reel.scrollTo({ left: 0 });
      curDay = '';
      syncReel();
    });
  });
  syncReel();

  // add to calendar: all-day, because the Club lists dates rather than times
  function downloadIcs(ev) {
    const start = ev.d.replace(/-/g, '');
    const end = new Date(asDate(ev.d).getTime() + 864e5).toISOString().slice(0, 10).replace(/-/g, '');
    const esc = s => s.replace(/[\\,;]/g, m => '\\' + m);
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//The American Club Singapore//Concept//EN', 'BEGIN:VEVENT',
      `UID:${start}-${ev.img}@amclub.org.sg`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
      `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`, `SUMMARY:${esc(ev.t)}`,
      'LOCATION:The American Club\\, 10 Claymore Hill\\, Singapore 229573', 'URL:https://amclub.org.sg/whats-on',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `amclub-${ev.img}.ics` });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    say('Saved.', 'Open the downloaded file to add it to your calendar.');
  }

  /* ---------- scroll reveals ---------- */
  const rvs = $$('.rv, .rv-img');
  if (!reduce.matches) {
    const io = new IntersectionObserver(ens => ens.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    rvs.forEach(el => io.observe(el));
  } else rvs.forEach(el => el.classList.add('is-in'));

  /* ---------- club index tabs ---------- */
  const tabs = $$('.idx__tab');
  function selectTab(tab, focus) {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const p = $('#' + t.getAttribute('aria-controls'));
      p.hidden = !on;
      p.classList.remove('is-in');
      if (on) { void p.offsetWidth; p.classList.add('is-in'); }
    });
    if (focus) tab.focus();
    if (innerWidth <= 960) tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce.matches ? 'auto' : 'smooth' });
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', e => {
      const k = e.key;
      let n = null;
      if (k === 'ArrowDown' || k === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (k === 'ArrowUp' || k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (k === 'Home') n = tabs[0];
      if (k === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });

  /* ---------- heritage: pinned horizontal archive ---------- */
  const her = $('#heritage'), track = $('#track'), rail = $('#rail'), prog = $('#prog'), yrNow = $('#yrNow');
  const years = $$('.yr:not(.yr--img)', rail);
  const pinMQ = matchMedia('(min-width: 961px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)');
  let dist = 0, pinned = false, lastYr = '';

  function setYear(x) {
    let cur = years[0];
    for (const y of years) if (y.offsetLeft <= x) cur = y;
    const label = $('.yr__n', cur).textContent;
    if (label === lastYr) return;
    lastYr = label;
    yrNow.textContent = label;
    yrNow.classList.remove('is-tick'); void yrNow.offsetWidth; yrNow.classList.add('is-tick');
    years.forEach(y => y.classList.toggle('is-past', y.offsetLeft <= cur.offsetLeft));
  }
  function layoutHer() {
    pinned = pinMQ.matches;
    her.classList.toggle('is-pinned', pinned);
    rail.style.transform = '';
    her.style.height = '';
    if (!pinned) { updateFromTrack(); return; }
    dist = Math.max(0, rail.scrollWidth - track.clientWidth);
    her.style.height = `${$('.her__pin', her).offsetHeight + dist}px`;
    updateFromScroll();
  }
  function updateFromScroll() {
    if (!pinned) return;
    const p = Math.min(1, Math.max(0, -her.getBoundingClientRect().top / (dist || 1)));
    rail.style.transform = `translate3d(${-p * dist}px, 0, 0)`;
    prog.style.transform = `scaleX(${p})`;
    setYear(p * dist + track.clientWidth * (0.2 + 0.77 * p));
  }
  function updateFromTrack() {
    const max = track.scrollWidth - track.clientWidth;
    const p = max > 0 ? track.scrollLeft / max : 0;
    prog.style.transform = `scaleX(${p})`;
    setYear(track.scrollLeft + track.clientWidth * (0.2 + 0.77 * p));
  }
  track.addEventListener('scroll', () => { if (!pinned) updateFromTrack(); }, { passive: true });
  track.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const step = (years[1].offsetLeft - years[0].offsetLeft) * (e.key === 'ArrowRight' ? 1 : -1);
    if (pinned) scrollBy({ top: step, behavior: 'smooth' });
    else track.scrollBy({ left: step, behavior: 'smooth' });
  });
  pinMQ.addEventListener('change', layoutHer);
  let rT = 0;
  addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { measureHero(); layoutHer(); curDay = ''; syncReel(); }, 120); });
  layoutHer();
  addEventListener('load', layoutHer);
  document.fonts && document.fonts.ready.then(() => { measureHero(); layoutHer(); curDay = ''; syncReel(); });

  // one rAF-throttled scroll handler for the drift and the pin
  let sRaf = 0;
  addEventListener('scroll', () => {
    if (sRaf) return;
    sRaf = requestAnimationFrame(() => { sRaf = 0; hero(); updateFromScroll(); });
  }, { passive: true });

  /* ---------- membership finder ---------- */
  const fees = $('#fees');
  $$('input[name="who"]').forEach(r => r.addEventListener('change', () => {
    const v = r.value;
    fees.classList.toggle('is-filtered', v !== 'all');
    $$('.fees__row[data-for]', fees).forEach(row => row.classList.toggle('is-match', row.dataset.for.split(' ').includes(v)));
  }));

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
