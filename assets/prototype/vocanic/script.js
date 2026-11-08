/* Vocanic concept: one page, one scroll engine. Native scrolling; only the layers are smoothed. */
(() => {
  const d = document, root = d.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const io = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const tween = (ms, fn) => new Promise(done => {
    const t0 = performance.now();
    const step = now => {
      const p = clamp((now - t0) / ms);
      fn(io(p), p);
      p < 1 ? requestAnimationFrame(step) : done();
    };
    requestAnimationFrame(step);
  });
  if (reduce) root.classList.add('flat');

  /* ---------- Section transition: a pale circle closes, the page jumps, the Ö's mouth opens ---------- */
  const veil = $('.veil'), canvas = $('canvas', veil), label = $('.veil-label', veil), mark = $('.veil-o', veil);
  const ctx = canvas.getContext('2d');
  const VEIL = '#EEEFF1';
  let vW = 0, vH = 0, busy = false;
  const fitVeil = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    vW = innerWidth; vH = innerHeight;
    canvas.width = vW * dpr; canvas.height = vH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const jump = async (target, text, x, y) => {
    if (reduce) { target.scrollIntoView(); target.focus({ preventScroll: true }); return; }
    if (busy) return;
    busy = true;
    label.textContent = text;
    mark.classList.add('off'); label.classList.add('off');
    veil.classList.add('on');
    fitVeil();
    const far = Math.max(Math.hypot(x, y), Math.hypot(vW - x, y), Math.hypot(x, vH - y), Math.hypot(vW - x, vH - y));
    await tween(520, (e, p) => {
      ctx.clearRect(0, 0, vW, vH);
      ctx.fillStyle = VEIL;
      ctx.beginPath(); ctx.arc(x, y, far * e, 0, 7); ctx.fill();
      if (p > .72) { mark.classList.remove('off'); label.classList.remove('off'); }
    });
    await wait(130);
    scrollTo(0, target === hero ? 0 : target.getBoundingClientRect().top + scrollY);
    target.focus({ preventScroll: true });
    measure(); smooth = scrollY; render(true);
    mark.classList.add('off'); label.classList.add('off');
    const open = Math.hypot(vW, vH) / 2 + 4;
    await tween(760, e => {
      ctx.clearRect(0, 0, vW, vH);
      ctx.fillStyle = VEIL; ctx.fillRect(0, 0, vW, vH);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath(); ctx.arc(vW / 2, vH / 2, open * e, 0, 7); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    });
    veil.classList.remove('on');
    busy = false;
  };
  const hero = $('.hero');
  d.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('skip')) return;
    const target = d.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    target.tabIndex = -1;
    const text = a.dataset.label || a.textContent.trim() || 'Contact';
    jump(target, a.classList.contains('rl-say') ? 'Contact' : text, e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
  });

  /* ---------- Preloader: three typing dots until the video can play, a reply, then the bubble becomes the page ---------- */
  const remember = () => {
    try { sessionStorage.setItem('vc-seen', '1'); } catch (e) {}
    if (!window.name.includes('vc-seen;')) window.name += 'vc-seen;';
  };
  const preload = async () => {
    const box = $('.loader'), bubble = $('.lb', box), fill = $('.lb-fill', box), video = $('.reel video');
    box.style.animation = 'none';
    requestAnimationFrame(() => requestAnimationFrame(() => { box.style.background = 'transparent'; }));
    let skip = false; const hurry = () => { skip = true; };
    addEventListener('pointerdown', hurry, { once: true }); addEventListener('keydown', hurry, { once: true });
    const pause = async (ms, until) => { const t = performance.now(); while (!skip && performance.now() - t < ms && !(until && until(performance.now() - t))) await wait(20); };
    await pause(2400, t => t > 1100 && video.readyState >= 3);
    bubble.classList.add('said');
    await pause(620);
    removeEventListener('pointerdown', hurry); removeEventListener('keydown', hurry);
    bubble.style.opacity = 0;
    const cover = Math.hypot(innerWidth, innerHeight) / 64 * 1.05;
    await fill.animate([{ transform: 'scale(.9)' }, { transform: `scale(${cover})` }], { duration: 620, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }).finished;
    video.currentTime = 0;
    root.classList.add('go');
    await box.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: 'ease-out', fill: 'forwards' }).finished;
    root.classList.remove('loading');
    box.remove();
    remember();
  };

  /* ---------- Reveals ---------- */
  const seen = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); seen.unobserve(e.target); }
  }), { rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(el => seen.observe(el));

  /* ---------- Eyes ---------- */
  const eyes = $$('.oo').map(el => ({ el, em: parseFloat(getComputedStyle(el).fontSize) }));
  const logoEyes = $$('.nav .eye');
  let pointerX = innerWidth / 2, pointerY = innerHeight / 2;
  if (!reduce) {
    let queued = false;
    const look = () => {
      queued = false;
      eyes.forEach(({ el, em }) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -40 || r.top > innerHeight + 40) return;
        const a = Math.atan2(pointerY - r.top, pointerX - (r.left + r.width / 2));
        el.style.setProperty('--ex', Math.cos(a) * em * .018 + 'px');
        el.style.setProperty('--ey', Math.sin(a) * em * .012 + 'px');
      });
      logoEyes.forEach(e => {
        const r = e.getBoundingClientRect();
        const a = Math.atan2(pointerY - r.top, pointerX - r.left);
        e.style.setProperty('--ex', Math.cos(a) * .7 + 'px');
        e.style.setProperty('--ey', Math.sin(a) * .5 + 'px');
      });
    };
    addEventListener('pointermove', e => {
      pointerX = e.clientX; pointerY = e.clientY;
      if (!queued) { queued = true; requestAnimationFrame(look); }
    }, { passive: true });
    const blink = () => {
      const all = [...eyes.map(e => e.el), ...logoEyes];
      all.forEach(e => e.style.setProperty('--blink', .1));
      setTimeout(() => all.forEach(e => e.style.setProperty('--blink', 1)), 120);
      setTimeout(blink, 4000 + Math.random() * 5000);
    };
    setTimeout(blink, 4000);
  }

  /* ---------- What we do: runs by itself, the next card opening into the whole banner. The bar's animation is the timer ---------- */
  const morph = $('.morph'), svcs = $$('.svc'), cards = $$('.dcard'), showN = $('.show-n'), fill = $('.bar i'), arrows = $$('.arw[data-step]'), pauseBtn = $('.arw-pause'), slides = $('.svcs');
  let cur = 0, clipT;
  const deck = i => cards.forEach((c, k) => c.setAttribute('aria-current', k === i));
  const showSvc = i => {
    if (i === cur) return;
    const prev = cur, f = svcs[i].firstElementChild, card = cards[i];
    const old = svcs[prev].firstElementChild;
    old.style.transition = 'none'; old.style.clipPath = '';
    if (!reduce) {
      const r = f.getBoundingClientRect(), q = card.getBoundingClientRect();
      if (q.width) f.style.clipPath = `inset(${q.top - r.top}px ${r.right - q.right}px ${r.bottom - q.bottom}px ${q.left - r.left}px)`;
    }
    cur = i;
    svcs.forEach((s, k) => { s.classList.toggle('was', k === prev); if (k !== i) s.classList.remove('on'); });
    f.style.transition = 'none';
    svcs[i].classList.add('on');
    f.offsetWidth;
    f.style.transition = '';
    f.style.clipPath = 'inset(0px)';
    clearTimeout(clipT); clipT = setTimeout(() => { f.style.clipPath = ''; old.style.transition = ''; svcs[prev].classList.remove('was'); }, 1000);
    deck(i);
    showN.textContent = `0${i + 1} / 05`;
  };
  const goSvc = i => {
    showSvc((i + cards.length) % cards.length);
    fill.style.animation = 'none'; fill.offsetWidth; fill.style.animation = '';
  };
  deck(0);
  cards.forEach((c, k) => c.addEventListener('click', () => goSvc(k)));
  arrows.forEach(a => a.addEventListener('click', () => goSvc(cur + +a.dataset.step)));
  fill.addEventListener('animationend', () => goSvc(cur + 1));
  /* Holds: the pause button, a pointer on the controls, keyboard focus inside, or the banner being off screen */
  const held = { user: false, hover: false, focus: false, away: true };
  const hold = (why, on) => {
    held[why] = on;
    const stop = Object.values(held).some(Boolean);
    morph.classList.toggle('held', stop);
    slides.setAttribute('aria-live', stop ? 'polite' : 'off');
  };
  hold('away', true);
  pauseBtn.addEventListener('click', () => {
    hold('user', !held.user);
    pauseBtn.classList.toggle('is-off', held.user);
    pauseBtn.setAttribute('aria-label', held.user ? 'Play' : 'Pause');
  });
  [$('.deck'), $('.show-ctl')].forEach(el => {
    el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hold('hover', true); });
    el.addEventListener('pointerleave', () => hold('hover', false));
  });
  morph.addEventListener('focusin', e => hold('focus', e.target.matches(':focus-visible')));
  morph.addEventListener('focusout', () => hold('focus', false));
  new IntersectionObserver(([e]) => hold('away', !e.isIntersecting), { threshold: .4 }).observe(morph);

  /* ---------- Talk: same question, two answers ---------- */
  const SCENES = [
    ['It\u2019s 11pm and this is my third wrong order. Anyone there?', 'We value your feedback. Please visit our FAQ page.', 'Yes, I\u2019m here. Three is too many. Send me the order number and I\u2019ll fix it tonight.'],
    ['Nice ad, I guess. So what\u2019s actually new?', 'Discover the all-new experience today! #Innovation', 'Honestly? The battery. Two days, not one. Want to try it before you decide?'],
    ['Heard you\u2019re pulling out of Jakarta. True?', 'We do not comment on speculation.', 'No, we\u2019re staying. Thanks for asking us first, and tell us if you hear it again.'],
    ['Best lunch I\u2019ve had all week.', 'Thank you for choosing us. Terms and conditions apply.', 'You\u2019ve just made the kitchen\u2019s day. What did you have? We\u2019ll tell them.'],
  ];
  const bubs = $$('.bub'), sceneBtns = $$('.scene-tabs button');
  let sceneRun = 0;
  const playScene = async i => {
    const run = ++sceneRun;
    sceneBtns.forEach((b, k) => b.setAttribute('aria-pressed', k === i));
    bubs.forEach(b => b.classList.remove('show'));
    if (!reduce) await wait(180);
    if (run !== sceneRun) return;
    for (let k = 0; k < bubs.length; k++) {
      if (run !== sceneRun) return;
      $('p', bubs[k]).textContent = SCENES[i][k];
      bubs[k].classList.add('show');
      if (!reduce) await wait(k === 0 ? 800 : 1100);
    }
  };
  sceneBtns.forEach((b, k) => b.addEventListener('click', () => playScene(k)));
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); playScene(0); } }, { threshold: .3 }).observe($('.thread'));

  /* ---------- Wrapper: orange spotlights wander at random and the field warps around them ---------- */
  {
    const cv = document.createElement('canvas'), W = 120, H = 75;
    cv.className = 'mesh'; cv.width = W; cv.height = H; cv.setAttribute('aria-hidden', 'true');
    document.body.prepend(cv);
    const ctx = cv.getContext('2d'), img = ctx.createImageData(W, H), px = img.data;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const base = [242, 106, 0];
    const spots = [[255, 214, 178, .36], [255, 185, 138, .42], [255, 138, 43, .46], [217, 83, 0, .4], [255, 214, 178, .26]]
      .map(([r, g, b, s]) => ({ c: [r, g, b], s, x: rnd(0, 1), y: rnd(0, 1), vx: 0, vy: 0, tx: rnd(0, 1), ty: rnd(0, 1), next: 0 }));
    const ph = [rnd(0, 6.3), rnd(0, 6.3), rnd(0, 6.3), rnd(0, 6.3)];
    let amp = .2, ampT = .2, ampNext = 0, last = 0;
    const draw = t => {
      for (const s of spots) {
        if (t > s.next) { s.tx = rnd(-.1, 1.1); s.ty = rnd(-.1, 1.1); s.next = t + rnd(2.5, 7); }
        s.vx += (s.tx - s.x) * .004; s.vy += (s.ty - s.y) * .004;
        s.vx *= .94; s.vy *= .94;
        s.x += s.vx; s.y += s.vy;
      }
      if (t > ampNext) { ampT = rnd(.08, .42); ampNext = t + rnd(3, 8); }
      amp += (ampT - amp) * .02;
      let i = 0;
      for (let y = 0; y < H; y++) {
        const v = y / (H - 1);
        for (let x = 0; x < W; x++) {
          const u = x / (W - 1);
          const wu = u + amp * Math.sin(v * 3.1 + t * .41 + ph[0]) + amp * .5 * Math.sin(v * 6.7 - t * .33 + ph[1]);
          const wv = v + amp * Math.sin(u * 2.7 - t * .37 + ph[2]) + amp * .5 * Math.sin(u * 5.9 + t * .29 + ph[3]);
          let r = base[0], g = base[1], b = base[2];
          for (const s of spots) {
            const dx = wu - s.x, dy = wv - s.y, k = Math.exp(-(dx * dx + dy * dy) / (s.s * s.s));
            r += (s.c[0] - r) * k; g += (s.c[1] - g) * k; b += (s.c[2] - b) * k;
          }
          px[i++] = r; px[i++] = g; px[i++] = b; px[i++] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    };
    if (reduce) { for (let n = 0; n < 200; n++) draw(0); }
    else {
      const loop = now => {
        requestAnimationFrame(loop);
        if (now - last < 40) return;
        last = now;
        draw(now / 1000);
      };
      requestAnimationFrame(loop);
    }
  }

  /* ---------- Hero reel: a real video, with the comments timed to it ---------- */
  const reel = $('.reel'), rlVideo = $('video', reel), rlThread = $('.rl-thread', reel), rlMsgs = $$('.rl-m', reel), rlBtn = $('.rl-p', reel);
  {
    let rlUser = reduce, rlSeen = false, rlPlayed = false;
    if (reduce) rlMsgs.forEach(m => m.classList.add('on'));
    const rlUi = () => {
      const off = rlVideo.paused;
      rlBtn.classList.toggle('is-off', off);
      rlBtn.setAttribute('aria-label', off ? 'Play the reel' : 'Pause the reel');
    };
    const rlSync = () => {
      if (rlUser || !rlSeen) rlVideo.pause();
      else rlVideo.play().catch(() => { rlUser = true; rlUi(); });
    };
    rlVideo.addEventListener('play', () => { rlPlayed = true; rlUi(); });
    rlVideo.addEventListener('pause', rlUi);
    rlVideo.addEventListener('timeupdate', () => {
      if (reduce && !rlPlayed) return;
      const t = rlVideo.currentTime;
      let last = null;
      rlMsgs.forEach(m => {
        const at = +m.dataset.at, from = +m.dataset.ty || at, on = t >= from && t < rlVideo.duration - .4;
        m.classList.toggle('on', on);
        m.classList.toggle('typing', on && t < at);
        if (on) last = m;
      });
      const y = last ? rlThread.offsetHeight - last.offsetTop - last.offsetHeight : rlThread.offsetHeight;
      rlThread.style.transform = `translateY(${y}px)`;
    });
    rlBtn.addEventListener('click', () => { rlUser = !rlVideo.paused; rlSync(); });
    new IntersectionObserver(([e]) => { rlSeen = e.isIntersecting; rlSync(); }).observe(reel);
    rlUi();
  }

  /* ---------- Podcast: a silent read-along that runs on its own clock ---------- */
  {
    const pod = $('.pod'), bars = $('.pod-bars', pod), seek = $('.pod-seek', pod), script = $('.pod-script', pod), playBtn = $('.pod-play', pod), speedBtn = $('.pod-speed', pod);
    const lists = $$('.pod-lines', pod), rows = $$('.pod-ep', pod), N = 64;
    const speeds = [1, 1.5, 2];
    const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
    let ep = 0, t = 0, dur = +lists[0].dataset.dur, playing = false, last = 0, sp = 0, lineI = -1, lit = -1;
    for (let i = 0; i < N; i++) bars.append(d.createElement('i'));
    const barEls = $$('i', bars);
    const shape = n => {
      let s = (n + 1) * 9973;
      const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      barEls.forEach((b, i) => {
        const env = .45 + .55 * Math.abs(Math.sin(i / N * Math.PI * (3 + n)));
        b.style.setProperty('--h', Math.round(14 + 86 * env * (.35 + .65 * rnd())) + '%');
      });
    };
    const draw = follow => {
      const on = Math.round(t / dur * N);
      if (on !== lit) { barEls.forEach((b, i) => b.classList.toggle('on', i < on)); lit = on; }
      $('.pod-cur', pod).textContent = fmt(t);
      seek.value = Math.floor(t);
      seek.setAttribute('aria-valuetext', fmt(t) + ' of ' + fmt(dur));
      const lines = $$('li', lists[ep]);
      let k = 0;
      lines.forEach((l, i) => { if (t >= +l.dataset.t) k = i; });
      if (k !== lineI) {
        lineI = k;
        lines.forEach((l, i) => l.classList.toggle('on', i === k));
        if (follow) script.scrollTo({ top: lines[k].offsetTop - script.clientHeight * .24, behavior: reduce ? 'auto' : 'smooth' });
      }
    };
    const setPlaying = on => {
      playing = on;
      pod.classList.toggle('playing', on);
      playBtn.setAttribute('aria-label', on ? 'Pause the read-along' : 'Play the read-along');
      if (on) { last = performance.now(); requestAnimationFrame(tick); }
    };
    const tick = now => {
      if (!playing) return;
      t += (now - last) / 1000 * speeds[sp];
      last = now;
      if (t >= dur) { t = dur; draw(true); setPlaying(false); return; }
      draw(true);
      requestAnimationFrame(tick);
    };
    const load = n => {
      ep = n; t = 0; lineI = -1; lit = -1;
      dur = +lists[n].dataset.dur;
      lists.forEach((l, i) => { l.hidden = i !== n; });
      rows.forEach((r, i) => { if (i === n) r.setAttribute('aria-current', 'true'); else r.removeAttribute('aria-current'); });
      $('.pod-num', pod).textContent = String(n + 1).padStart(2, '0');
      $('.pod-title', pod).textContent = lists[n].dataset.title;
      $('.pod-who', pod).textContent = lists[n].dataset.who;
      $('.pod-dur', pod).textContent = fmt(dur);
      seek.max = dur;
      script.scrollTop = 0;
      shape(n);
      draw(false);
    };
    const jump = to => {
      t = clamp(to, 0, dur);
      if (t >= dur) t = 0;
      draw(true);
    };
    playBtn.addEventListener('click', () => {
      if (!playing && t >= dur) jump(0);
      setPlaying(!playing);
    });
    $$('[data-skip]', pod).forEach(b => b.addEventListener('click', () => jump(t + +b.dataset.skip)));
    speedBtn.addEventListener('click', () => {
      sp = (sp + 1) % speeds.length;
      speedBtn.textContent = speeds[sp] + '×';
      speedBtn.setAttribute('aria-label', 'Playback speed, ' + speeds[sp] + ' times');
    });
    seek.addEventListener('input', () => { t = +seek.value; draw(true); });
    script.addEventListener('click', e => {
      const b = e.target.closest('.pod-line');
      if (b) jump(+b.parentElement.dataset.t);
    });
    const anchor = () => {
      /* offsetTop, so a reveal still running on the player can't skew the target */
      let top = -$('.nav').offsetHeight - 12;
      for (let el = $('.pod-cover', pod); el; el = el.offsetParent) top += el.offsetTop;
      scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
      playBtn.focus({ preventScroll: true });
    };
    rows.forEach((r, i) => r.addEventListener('click', () => {
      if (i === ep) {
        if (!playing && t >= dur) jump(0);
        setPlaying(!playing);
        if (!playing) return;
      } else {
        load(i);
        setPlaying(true);
      }
      anchor();
    }));
    new IntersectionObserver(([e]) => { if (!e.isIntersecting && playing) setPlaying(false); }).observe(pod);
    load(0);
  }

  /* ---------- Tools: one task, one readable screen. Mei's points are shared by both products ---------- */
  const tk = $('.tk'), tkBody = $('.tk-body'), tkStage = $('.tk-stage'), tkSr = $('.tk-sr');
  const tkLast = { vsocial: 'inbox', idx: 'vote' }, tkNarrow = matchMedia('(max-width:1100px)');
  const tkPlace = () => {
    const open = $('.tk-list:not([hidden]) .tk-btn[aria-current="true"]', tk);
    if (tkNarrow.matches) open.parentElement.append(tkStage);
    else tkBody.append(tkStage);
  };
  const tkGo = (target, fromList, fromCard) => {
    const [prod, asked] = target.split(':'), view = asked || tkLast[prod], id = `${prod}:${view}`;
    tkLast[prod] = view;
    $$('.tk-prods button', tk).forEach(b => b.dataset.tk === prod ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'));
    $$('.tk-list', tk).forEach(l => { l.hidden = l.dataset.list !== prod; });
    let name = '';
    $$('.tk-btn', tk).forEach(b => {
      const on = b.dataset.tk === id;
      if (on) { b.setAttribute('aria-current', 'true'); name = $('b', b).textContent; } else b.removeAttribute('aria-current');
    });
    $$('.sc', tk).forEach(s => s.classList.toggle('on', s.dataset.s === id));
    tkPlace();
    tkSr.textContent = `Showing ${name}`;
    const tkOpen = $(`.tk-btn[data-tk="${id}"]`, tk);
    if (fromCard) tkOpen.focus({ preventScroll: true });
    if (fromList && tkNarrow.matches) tkOpen.scrollIntoView({ block: 'start' });
    dispatchEvent(new Event('resize'));
  };
  const tkPts = { mei: 1040 };
  tk.addEventListener('click', e => {
    const go = e.target.closest('[data-tk]');
    if (go) return tkGo(go.dataset.tk, !!go.closest('.tk-list, .sc'), !!go.closest('.sc'));
    const sw = e.target.closest('.sc-sw');
    if (sw) return sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
    const vote = e.target.closest('.sc-vote');
    if (vote) {
      const on = vote.getAttribute('aria-pressed') !== 'true';
      vote.setAttribute('aria-pressed', on);
      $('span', vote).textContent = (+vote.dataset.votes + (on ? 1 : 0)).toLocaleString('en-US');
      vote.lastChild.textContent = on ? 'Voted' : 'Vote';
      return;
    }
    const add = e.target.closest('[data-add]');
    if (add) {
      const who = add.dataset.add;
      add.disabled = true;
      if (add.classList.contains('sc-ghost')) add.textContent = 'Thanked';
      else add.textContent = '200 points added';
      if (who === 'mei') {
        tkPts.mei += 200;
        $$('[data-pts="mei"]', tk).forEach(n => { n.textContent = tkPts.mei.toLocaleString('en-US'); });
      } else {
        const n = $('.sc-p span', add.parentElement);
        n.textContent = (+n.textContent.replace(',', '') + 200).toLocaleString('en-US');
      }
      const done = $('[data-done]', add.parentElement);
      if (done) done.hidden = false;
    }
  });
  tkNarrow.addEventListener('change', () => { tkPlace(); dispatchEvent(new Event('resize')); });
  tkPlace();

  /* ---------- Line drawings: the scroll holds the pen ---------- */
  const inks = reduce ? [] : $$('.trace').map(el => {
    const svg = $('svg', el);
    let total = 0;
    const paths = $$('path', svg).map(p => { const L = p.getTotalLength(), o = total; total += L; return { el: p, L, o, key: '' }; });
    return { el, paths, total, pen: $('.pen', svg), y: 0, h: 0, last: -1 };
  });
  const trace = (dr, b) => {
    const to = b * dr.total;
    let tip = null;
    dr.paths.forEach(p => {
      const e = clamp(to - p.o, 0, p.L);
      const key = e < .01 ? 'off' : e.toFixed(1);
      if (to > p.o && to < p.o + p.L) tip = p.el.getPointAtLength(to - p.o);
      if (key === p.key) return;
      p.key = key;
      if (key === 'off') { p.el.style.visibility = 'hidden'; return; }
      p.el.style.visibility = 'visible';
      p.el.style.strokeDasharray = `${e.toFixed(1)} ${(p.L + 2).toFixed(1)}`;
    });
    if (tip) { dr.pen.style.visibility = 'visible'; dr.pen.setAttribute('cx', tip.x); dr.pen.setAttribute('cy', tip.y); }
    else dr.pen.style.visibility = 'hidden';
  };

  /* ---------- Statement frames: each slot shifts at random to another photo or drawing ---------- */
  const sayPills = $$('.say-i').map(el => ({ el, frames: $$('.sf', el), cur: 0 }));
  if (!reduce && sayPills.length) {
    let sayOn = false;
    const swap = p => {
      let j = Math.floor(Math.random() * (p.frames.length - 1)); if (j >= p.cur) j++; // any frame but the one showing
      const old = p.frames[p.cur], next = p.frames[j];
      p.frames.forEach(f => f.classList.toggle('was', false));
      old.classList.replace('on', 'was');
      next.classList.add('on');
      p.cur = j;
      setTimeout(() => old.classList.toggle('was', false), 800);
    };
    // slots never change together: each waits its own 1.8 to 3.6s, and only while its word is lit on screen
    const plan = p => setTimeout(() => { if (sayOn && !d.hidden && p.el.classList.contains('lit')) swap(p); plan(p); }, 1800 + Math.random() * 1800);
    new IntersectionObserver(([en]) => { sayOn = en.isIntersecting; }).observe($('.say-big'));
    sayPills.forEach((p, i) => setTimeout(() => plan(p), i * 650));
  }

  /* ---------- One scroll engine ---------- */
  const layers = $$('[data-p]').map(el => ({ el, speed: parseFloat(el.dataset.p), y: 0, h: 0 }));
  const lnA = $('.ln-a'), lnB = $('.ln-b'), photo = $('.hero-photo'), copy = $('.hero-copy');
  const sayPin = $('.say'), sayStage = $('.stage', sayPin), sayBig = $('.say-big'), sayWords = $$('span', sayBig), irisSoft = $('[data-iris="soft"]');
  const hPin = $('.hpin'), track = $('.track'), cityImgs = $$('.city-img img');
  const sections = [];
  const box = { say: {}, h: {} };
  let smooth = scrollY, vh = innerHeight, vw = innerWidth, heroH = 1, trackMax = 0;
  const top = el => el.getBoundingClientRect().top + scrollY;

  const measure = () => {
    vh = innerHeight; vw = innerWidth;
    heroH = hero.offsetHeight || 1;
    if (reduce) return;
    trackMax = Math.max(0, track.scrollWidth - hPin.clientWidth);
    hPin.style.height = trackMax + $('.stage', hPin).clientHeight + 'px';
    box.say = { t: top(sayPin), r: sayPin.offsetHeight - sayStage.offsetHeight };
    box.h = { t: top(hPin), r: trackMax };
    inks.forEach(k => { const r = k.el.getBoundingClientRect(); k.y = r.top + scrollY; k.h = r.height; });
    layers.forEach(l => {
      l.el.style.translate = 'none';
      const r = l.el.getBoundingClientRect();
      l.y = r.top + scrollY; l.h = r.height;
      l.el.style.translate = '';
    });
  };
  const hyp = () => Math.hypot(sayStage.clientWidth, sayStage.clientHeight) / 2 + 4;

  let running = false;
  const render = force => {
    const y = smooth, narrow = vw <= 760 ? .55 : 1;
    /* Parallax layers */
    layers.forEach(l => {
      const c = l.y + l.h / 2 - (y + vh / 2);
      if (Math.abs(c) > vh * 1.6 + l.h) return;
      l.el.style.translate = `0 ${(c * l.speed * narrow).toFixed(1)}px`;
    });
    /* Hero: the two lines part, the reel recedes */
    const hp = clamp(y / heroH);
    if (hp < 1 || force) {
      lnA.style.translate = `${(-9 * hp * narrow).toFixed(2)}vw 0`;
      lnB.style.translate = `${(5 * hp * narrow).toFixed(2)}vw 0`;
      photo.style.scale = (1 - .1 * hp).toFixed(4);
      copy.style.opacity = (1 - clamp((hp - .55) / .45)).toFixed(3);
    }
    /* Statement: words light up, then the circle opens into the next section */
    const sp = clamp((y - box.say.t) / (box.say.r || 1));
    const lit = Math.round(clamp(sp / .56) * sayWords.length);
    sayWords.forEach((w, i) => w.classList.toggle('lit', i < lit));
    const irisP = io(clamp((sp - .62) / .38));
    irisSoft.style.clipPath = `circle(${(irisP * hyp()).toFixed(1)}px at 50% 50%)`;
    sayBig.style.opacity = (1 - clamp((sp - .74) / .2)).toFixed(3);
    sayBig.style.transform = `scale(${(1 - .06 * clamp((sp - .62) / .38)).toFixed(4)})`;
    /* Line drawings */
    inks.forEach(k => {
      const b = clamp((y + vh * .9 - k.y) / (k.h + vh * .34));
      if (Math.abs(b - k.last) < .002) return;
      k.last = b; trace(k, b);
    });
    /* Cities: sideways, each photo drifting inside its frame */
    const hx = clamp((y - box.h.t) / (box.h.r || 1)) * trackMax;
    track.style.transform = `translate3d(${(-hx).toFixed(1)}px,0,0)`;
    cityImgs.forEach(im => {
      const r = im.parentElement.getBoundingClientRect();
      const o = (r.left + r.width / 2 - vw / 2) / vw;
      if (Math.abs(o) < 1.2) im.style.transform = `translate3d(${(o * -9).toFixed(2)}%,0,0)`;
    });
  };
  const loop = () => {
    const target = scrollY;
    smooth += (target - smooth) * .14;
    if (Math.abs(target - smooth) < .2) smooth = target;
    render();
    if (smooth === target) { running = false; return; }
    requestAnimationFrame(loop);
  };
  const kick = () => { if (!running) { running = true; requestAnimationFrame(loop); } };

  if (reduce) {
    sayWords.forEach(w => w.classList.add('lit'));
  } else {
    measure();
    render(true);
    addEventListener('scroll', kick, { passive: true });
    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); smooth = scrollY; render(true); }, 120); });
    addEventListener('load', () => { measure(); render(true); });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(() => { measure(); render(true); });
  }

  /* ---------- Nav: mark the section in view ---------- */
  const navLinks = $$('.nav-links a');
  const marks = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'));
  }), { rootMargin: '-50% 0px -50% 0px' });
  ['top', 'services', 'brands', 'agency', 'podcast', 'contact'].forEach(id => marks.observe(d.getElementById(id)));

  /* ---------- Form, clocks, menu ---------- */
  $('.form').addEventListener('submit', e => {
    e.preventDefault();
    $('.form-note').textContent = "Thanks. This is a concept site, so your message wasn't sent anywhere.";
  });
  const clocks = $$('[data-tz]');
  const tick = () => clocks.forEach(c => {
    c.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: c.dataset.tz }).format(new Date());
  });
  tick(); setInterval(tick, 20000);
  const menuBtn = $('.menu-btn'), menu = $('.menu'), sheet = $('.sheet');
  function setMenu(o) {
    menu.classList.toggle('open', o);
    menuBtn.setAttribute('aria-expanded', o);
    menuBtn.textContent = o ? 'Close' : 'Menu';
    [...sheet.children].forEach(el => { if (!el.classList.contains('nav')) el.toggleAttribute('inert', o); });
    d.body.style.overflow = o ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- Start ---------- */
  if (root.classList.contains('loading')) preload();
  else { root.classList.add('go'); remember(); }
})();
