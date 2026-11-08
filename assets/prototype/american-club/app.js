/* The American Club Singapore: homepage interactions (hero, this week, club index, heritage). Needs core.js. Plain JS, works from file://. */
(() => {
  const { $, $$, reduce, say } = window.AC;
  const SG = 'Asia/Singapore';

  const sgDay = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: SG, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

  const mast = $('#mast');

  /* ---------- hero: each room enters on the right, takes the centre, leaves left ---------- */
  const hx = $('#top'), hxPin = $('.hr__pin', hx), hxStage = $('.hr__stage', hx), hxSay = $('.hr__say', hx);
  const ROOMS = [
    ['media/clubhouse-720.webp', '42%', '62%'], ['media/rooms/dining.webp', '62%', '40%'], ['media/rooms/pool.webp', '50%', '55%'],
    ['media/rooms/spa.webp', '50%', '42%'], ['media/rooms/kids.webp', '42%', '45%'], ['media/rooms/ballroom.webp', '50%', '42%'], ['media/rooms/family.webp', '48%', '30%']
  ];
  const N = ROOMS.length, wrapI = i => ((i % N) + N) % N;
  // silent stock loops for the centre arch, one per room; desktop only, the photo stays underneath
  const REELS = ['club', 'dining', 'aquatics', 'spa', 'kids', 'events', 'membership'].map(n => `media/reels/${n}.mp4`);
  const reelMQ = matchMedia('(min-width: 901px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)');
  const clamp01 = v => Math.min(1, Math.max(0, v));
  const span = (p, a, b) => clamp01((p - a) / (b - a));
  const eio = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const capsNow = $$('#hrCaps .hr__cap'), capsNext = $('#hrNext');
  capsNow.forEach(cap => {
    const c = cap.cloneNode(true);
    c.classList.remove('is-on');
    $('button', c).remove();
    c.querySelector('h2').outerHTML = `<p class="hr__name">${c.querySelector('h2').textContent}</p>`;
    capsNext.append(c);
  });
  const capsN = $$('.hr__cap', capsNext);
  // the entrance order runs right to left, so a room seems to walk across the rules
  const arches = $$('.hr__arch', hx).map((el, b) => ({
    el, off: +el.dataset.off, from: [.32, .16, 0][b], drift: [24, -16, 24][b],
    imgs: ROOMS.map((r, i) => {
      const keep = wrapI(+el.dataset.off) === i ? $('img', el) : null;
      if (keep) return keep;
      const im = new Image();
      im.alt = ''; im.decoding = 'async'; im.dataset.src = r[0];
      im.style.setProperty('--x', r[1]); im.style.setProperty('--y', r[2]); im.style.visibility = 'hidden';
      el.append(im);
      return im;
    })
  }));
  const loadRooms = () => $$('img[data-src]', hx).forEach(im => { im.src = im.dataset.src; im.removeAttribute('data-src'); });
  const centre = arches[1];
  centre.vids = REELS.map(src => {
    const v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.dataset.src = src;
    v.setAttribute('aria-hidden', 'true'); v.style.visibility = 'hidden';
    v.addEventListener('playing', () => v.classList.add('is-on'), { once: true });
    centre.el.append(v);
    return v;
  });
  const setReel = (v, on) => {
    if (on && reelMQ.matches) {
      if (v.dataset.src) { v.src = v.dataset.src; v.removeAttribute('data-src'); }
      if (v.paused) { const pr = v.play(); if (pr) pr.catch(() => {}); }
    } else if (!v.paused) v.pause();
  };
  if (document.readyState === 'complete') loadRooms(); else addEventListener('load', loadRooms, { once: true });

  /* the rooms advance on their own: hold, then wipe the next one up; ticks jump, the button pauses */
  const HOLD = 5200, WIPE = 1500;
  let curRoom = -1, cur = 0, to = 0, phase = 'hold', held = 0, wipeT = 0, last = 0, raf = 0, paused = false, inView = true;
  function setRoom(i) {
    if (i === curRoom) return;
    curRoom = i;
    capsNow.forEach((c, k) => c.classList.toggle('is-on', k === i));
    capsN.forEach((c, k) => c.classList.toggle('is-on', k === wrapI(i + 1)));
    hxTicks.forEach((t, k) => t.setAttribute('aria-current', k === i ? 'true' : 'false'));
    hxNum.textContent = String(i + 1).padStart(2, '0');
  }
  const hxTicks = $$('.hr__tick', hx), hxNum = $('#hrNum'), hxRail = $('.hr__rail', hx), hxPlay = $('#hrPlay');
  function render(from, dest, f) {
    arches.forEach(({ el, off, from: st, imgs, vids }) => {
      const t = from === dest ? 0 : eio(span(f, st + .04, st + .62));
      const base = wrapI(from + off), next = from === dest ? -1 : wrapI(dest + off), soon = wrapI(from + 1 + off);
      imgs.forEach((im, i) => {
        const show = i === base || (i === next && t > 0);
        im.style.visibility = show ? 'visible' : 'hidden';
        im.style.zIndex = i === next ? 1 : 0;
        if (i === next && t > 0) {
          im.style.clipPath = t < 1 ? `inset(${((1 - t) * 100).toFixed(2)}% 0 0 0)` : '';
          im.style.transform = `scale(${(1.14 - .14 * t).toFixed(4)})`;
        } else { im.style.clipPath = ''; im.style.transform = ''; }
        if (vids) {
          const v = vids[i];
          v.style.visibility = im.style.visibility; v.style.zIndex = im.style.zIndex; v.style.clipPath = im.style.clipPath; v.style.transform = im.style.transform;
          // the coming room buffers during the hold; only what shows actually plays
          if ((i === next || i === soon) && reelMQ.matches && v.dataset.src) { v.src = v.dataset.src; v.removeAttribute('data-src'); }
          setReel(v, inView && show && !(i === base && t >= 1));
        }
      });
    });
  }
  const playing = () => !reduce.matches && !paused && inView && !document.hidden;
  function frame(now) {
    raf = 0;
    const dt = last ? Math.min(64, now - last) : 0;
    last = now;
    if (phase === 'wipe') {
      wipeT += dt;
      const f = clamp01(wipeT / WIPE);
      render(cur, to, f);
      setRoom(wrapI(f > .5 ? to : cur));
      if (f >= 1) { cur = to; phase = 'hold'; held = 0; render(cur, cur, 0); }
    } else if (playing()) {
      held += dt;
      if (held >= HOLD) go(cur + 1);
    }
    hxRail.style.setProperty('--hold', reduce.matches ? 1 : clamp01(held / HOLD).toFixed(3));
    if (phase === 'wipe' || playing()) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
  function go(n) {
    if (phase === 'wipe') cur = to;
    to = n; held = 0; wipeT = 0;
    if (reduce.matches) { cur = to; phase = 'hold'; render(cur, cur, 0); setRoom(wrapI(cur)); return; }
    phase = 'wipe';
    kick();
  }
  // a tick always walks forward, so rooms keep entering from the right
  hxTicks.forEach(t => t.addEventListener('click', () => {
    const base = phase === 'wipe' ? to : cur, step = wrapI(+t.dataset.room - wrapI(base));
    if (step) go(base + step);
  }));
  function setPaused(p) {
    paused = p;
    hxPlay.setAttribute('aria-label', p ? 'Play the rooms' : 'Pause the rooms');
    hxPlay.classList.toggle('is-paused', p);
    kick();
  }
  hxPlay.addEventListener('click', () => setPaused(!paused));
  new IntersectionObserver(([en]) => {
    inView = en.isIntersecting;
    render(cur, phase === 'wipe' ? to : cur, phase === 'wipe' ? clamp01(wipeT / WIPE) : 0);
    kick();
  }, { threshold: .25 }).observe(hx);
  document.addEventListener('visibilitychange', kick);
  reduce.addEventListener('change', kick);
  function measureHero() {
    hxPin.style.setProperty('--say', Math.ceil(hxSay.getBoundingClientRect().bottom - hxPin.getBoundingClientRect().top + 10) + 'px');
  }
  const heroMast = () => mast.classList.toggle('is-solid', hx.getBoundingClientRect().bottom <= 68);
  render(0, 0, 0);
  setRoom(0);
  measureHero();
  heroMast();
  kick();

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
      <figure class="pc__img"><img src="media/ev/${ev.img}.webp" alt="" width="1000" height="666" loading="lazy" draggable="false">${ev.d === today ? '<span class="pc__tag">Today</span>' : ''}</figure>
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
    // the spoken name starts with what is on the button, then spells the date out
    b.innerHTML = `<span>${ds === today ? 'Today' : fWd.format(date)}</span> <b>${date.getUTCDate()}</b><span class="sr">, ${fLong.format(date)}</span>`;
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
    sRaf = requestAnimationFrame(() => { sRaf = 0; heroMast(); updateFromScroll(); });
  }, { passive: true });
})();
