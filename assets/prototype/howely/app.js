(function () {
  'use strict';
  var d = document, root = d.documentElement, body = d.body;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var embedded = false; try { embedded = window.self !== window.top; } catch (e) { embedded = true; }
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var smooth = reduce ? 'auto' : 'smooth';

  /* ---------- router (#pagename) ---------- */
  var ROUTES = {
    home: ['Home', 'Howely · Logistics, end to end'],
    about: ['About', 'About · Howely'],
    services: ['Services', 'Services · Howely'],
    resources: ['Resources', 'Resources · Howely'],
    contact: ['Contact', 'Contact · Howely']
  };
  var views = {}; $$('[data-view]').forEach(function (v) { views[v.dataset.view] = v; });
  // every article in articles.js gets its own #slug route, rendered into the one article view
  var ARTS = window.HW_ARTICLES || [], AMAP = {};
  ARTS.forEach(function (x) { AMAP[x.slug] = x; ROUTES[x.slug] = ['Resources', x.title + ' · Howely']; });
  var viewOf = function (n) { return AMAP[n] ? 'article' : n; };
  var navOf = function (n) { return AMAP[n] ? 'resources' : n; };
  var railPage = $('#railPage'), current = null;

  // the orange box in the rail slides to the current page
  var railBox = $('.rail__box');
  function railMark() {
    if (!railBox) return;
    var a = $('.rail__nav a[aria-current="page"]');
    if (!a || !a.offsetHeight) { railBox.classList.remove('is-on'); return; }
    railBox.style.transform = 'translateY(' + (a.offsetTop + a.offsetHeight / 2 - 5) + 'px)';
    railBox.classList.add('is-on');
  }
  addEventListener('resize', function () { railMark(); });
  function routeFromHash() {
    var h = decodeURIComponent(location.hash.slice(1));
    if (!h) return 'home';
    if (ROUTES[h]) return h;
    return d.getElementById(h) ? null : 'home'; // in-page anchors keep the current view
  }
  function swap(name) {
    var v = viewOf(name);
    if (AMAP[name]) renderArticle(AMAP[name]);
    Object.keys(views).forEach(function (k) { views[k].hidden = k !== v; });
    $$('[data-route]').forEach(function (a) {
      if (a.dataset.route === navOf(name)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    d.title = ROUTES[name][1];
    railPage.textContent = ROUTES[name][0];
    body.dataset.route = v; snapNext = true;
    railMark();
    if (name === 'contact') prefillContact();
    window.scrollTo(0, 0);
    current = name;
  }
  function after() { revealScan(); onScroll(); onFlow(); }
  function go(initial) {
    var name = routeFromHash();
    if (!name || name === current) return;
    closeMenu();
    if (initial) {
      swap(name); after();
      if (reduce || embedded) { ld.classList.add('is-gone'); requestAnimationFrame(function () { requestAnimationFrame(ready); }); }
      else load(name, true);
      return;
    }
    if (reduce) { swap(name); after(); $('#main').focus({ preventScroll: true }); return; }
    cover(name);
    setTimeout(function () {
      if (routeFromHash() !== name) return; // a newer click took over
      root.classList.remove('is-ready');
      swap(name); after();
      $('#main').focus({ preventScroll: true });
      load(name, false);
    }, 420);
  }
  addEventListener('hashchange', function () { go(false); });
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var h = a.getAttribute('href').slice(1);
    if (h === 'main') { e.preventDefault(); $('#main').focus(); return; }
    if (h === current) { e.preventDefault(); closeMenu(); window.scrollTo({ top: 0, behavior: smooth }); }
  });
  $$('[data-scroll]').forEach(function (b) {
    b.addEventListener('click', function () { var t = $(b.dataset.scroll); if (t) t.scrollIntoView({ behavior: smooth }); });
  });
  $('#toTop').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: smooth }); });

  /* ---------- preloader ----------
     Every load and route change: a spinning parcel over a progress bar that
     tracks the view's eager images (and fonts on first load). On home the
     parcel then warps into its hero dock and the real one takes over. */
  var ld = $('#loader'), ldFill = $('#ldFill'), ldPct = $('#ldPct'), ldLabel = $('#ldLabel');
  var ldCube = $('#ldCube'), ldParcel = $('#ldParcel');
  var readyDone = false, token = 0, spinA = null;
  function ready() { readyDone = true; root.classList.add('is-ready'); }
  // The spin runs as a Web Animation so it stays on the compositor while the page is
  // busy loading. It starts at the parcel's resting pose (-20, -34), so frame one never jumps.
  var SPIN = 2600, RX = [-20, -34, -20, -6, -20];
  var rot = function (x, y) { return 'rotateX(' + x.toFixed(2) + 'deg) rotateY(' + y.toFixed(2) + 'deg)'; };
  function startSpin() {
    ldParcel.getAnimations().forEach(function (an) { an.cancel(); });
    spinA = ldParcel.animate(RX.map(function (x, i) { return { transform: rot(x, -34 + i * 90) }; }), { duration: SPIN, iterations: Infinity, easing: 'linear' });
  }
  function spinPose() { // where the spin is right now
    var t = spinA ? ((spinA.currentTime || 0) % SPIN) / SPIN : 0, q = t * 4, i = Math.floor(q), f = q - i;
    return { x: RX[i] + (RX[Math.min(i + 1, 4)] - RX[i]) * f, y: -34 + t * 360 };
  }
  function resetLd(name) {
    ldCube.getAnimations().forEach(function (an) { an.cancel(); });
    root.classList.remove('ld-hand'); ldCube.style.visibility = '';
    ld.classList.remove('is-out', 'is-warp', 'is-gone');
    ld.classList.add('is-on');
    ldFill.style.setProperty('--p', 0); ldPct.textContent = '000';
    ldLabel.textContent = 'Loading ' + ROUTES[name][0];
    startSpin();
  }
  function cover(name) { token++; resetLd(name); ld.classList.remove('is-cover'); void ld.offsetWidth; ld.classList.add('is-cover'); }
  function waitFor(name, first) {
    var list = $$('img:not([loading="lazy"])', views[viewOf(name)]).map(function (im) {
      return im.complete ? null : new Promise(function (r) { im.addEventListener('load', r, { once: true }); im.addEventListener('error', r, { once: true }); });
    }).filter(Boolean);
    if (first && d.fonts && d.fonts.ready) list.push(d.fonts.ready);
    $$('video[src]', views[viewOf(name)]).forEach(function (v) {
      if (v.readyState < 3) list.push(new Promise(function (r) { v.addEventListener('canplay', r, { once: true }); v.addEventListener('error', r, { once: true }); }));
    });
    return list;
  }
  function load(name, first) {
    var tok = ++token;
    if (first) resetLd(name);
    var parts = waitFor(name, first), total = parts.length, done = 0;
    parts.forEach(function (p) { p.then(function () { done++; }); });
    var minT = name === 'home' ? (first ? 1700 : 900) : (first ? 950 : 650), t0 = performance.now(), shown = 0;
    function step(now) {
      if (tok !== token) return;
      var el = now - t0, target = Math.min(el / minT, total ? done / total : 1);
      if (el > 4500) target = 1; // never hold the page hostage
      shown += (target - shown) * 0.16;
      if (target >= 1 && shown > 0.996) shown = 1;
      ldFill.style.setProperty('--p', shown.toFixed(4));
      ldPct.textContent = ('00' + Math.round(shown * 100)).slice(-3);
      if (shown < 1) requestAnimationFrame(step); else exit(name, tok);
    }
    requestAnimationFrame(step);
  }
  function fin(tok) {
    if (tok !== token) return;
    ld.classList.add('is-gone'); ld.classList.remove('is-on', 'is-cover', 'is-out', 'is-warp');
    ldCube.getAnimations().forEach(function (an) { an.cancel(); });
    ldParcel.getAnimations().forEach(function (an) { an.cancel(); }); spinA = null;
  }
  function exit(name, tok) {
    var rv = name === 'home' && $('.hero__vid[src]'); if (rv) { try { rv.currentTime = 0; } catch (e) {} } // like Vocanic: the reel starts on its first shot as the page appears
    ld.classList.remove('is-on', 'is-cover'); ld.classList.add('is-out');
    var dock = name === 'home' ? $('.dock--hero') : null, r = dock && dock.getBoundingClientRect();
    if (r && r.width > 0 && r.bottom > 0 && r.top < innerHeight) { warp(r, tok); return; }
    ready();
    setTimeout(function () { fin(tok); }, 800);
  }
  // home only: the real parcel takes over from the loader's box at the identical pose, then flies to the hero dock
  function warp(r, tok) {
    ld.classList.add('is-warp'); ready();
    var c = ldCube.getBoundingClientRect(), p = spinPose();
    if (spinA) spinA.cancel();
    spinA = null;
    root.classList.add('ld-hand');
    ldCube.style.visibility = 'hidden';
    var dur = 1050;
    parcelFly({ x: c.left + c.width / 2, y: c.top + c.height / 2, k: c.width / 200, rx: p.x, ry: p.y, v: 360 / (SPIN / 1000), dur: dur });
    setTimeout(function () {
      if (tok !== token) return;
      fin(tok); root.classList.remove('ld-hand'); ldCube.style.visibility = '';
    }, dur + 60);
  }

  /* ---------- clock ---------- */
  var clock = $('#clock');
  function tick() {
    try { clock.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Singapore' }).format(new Date()); } catch (e) {}
  }
  tick(); setInterval(tick, 20000);

  /* ---------- phone menu (dock) ---------- */
  var menuBtn = $('#menuBtn'), sheet = $('#sheet'), menuT = 0;
  var menuOpen = function () { return sheet.classList.contains('is-open'); };
  function closeMenu() {
    if (!menuOpen()) return;
    sheet.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); $('.rail__menu-t', menuBtn).textContent = 'Menu';
    root.style.overflow = '';
    clearTimeout(menuT); menuT = setTimeout(function () { if (!menuOpen()) sheet.hidden = true; }, reduce ? 0 : 450);
  }
  menuBtn.addEventListener('click', function () {
    if (menuOpen()) { closeMenu(); return; }
    clearTimeout(menuT);
    sheet.hidden = false; void sheet.offsetWidth; // let the closed state paint, then animate open
    sheet.classList.add('is-open'); menuBtn.setAttribute('aria-expanded', 'true'); $('.rail__menu-t', menuBtn).textContent = 'Close';
    root.style.overflow = 'hidden';
    var first = $('a', sheet); if (first) first.focus({ preventScroll: true });
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen()) { closeMenu(); menuBtn.focus(); } });
  addEventListener('resize', function () { if (innerWidth > 900) closeMenu(); });

  /* ---------- reveals + count-up ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in'); io.unobserve(en.target);
      $$('.num', en.target).forEach(countUp);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' }) : null;
  function revealScan() {
    $$('[data-reveal]:not(.is-in)').forEach(function (el) {
      if (!io) { el.classList.add('is-in'); return; }
      var sibs = $$(':scope > [data-reveal]', el.parentElement);
      el.style.transitionDelay = (sibs.length > 1 ? (sibs.indexOf(el) % 4) * 0.08 : 0) + 's';
      io.observe(el);
    });
  }
  function countUp(el) {
    var to = +el.dataset.count; if (reduce || !to) return;
    var t0 = performance.now(), dur = 1600;
    (function step(t) {
      var k = clamp((t - t0) / dur, 0, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- 01 consignment log drives the waybill ---------- */
  var events = $$('#log li'), wbWord = $('#wbWord'), wbImgs = $$('.waybill__media img'), wbBars = $$('.waybill__bar i'), active = -1;
  function setStage(i) {
    if (i === active) return;
    active = i;
    events.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });
    wbImgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
    wbBars.forEach(function (b, k) { b.classList.toggle('is-on', k <= i); });
    wbWord.textContent = events[i].dataset.word;
    if (!reduce && wbWord.animate) wbWord.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      if (current !== 'home' || !events.length) return;
      var line = innerHeight * 0.55, idx = 0;
      events.forEach(function (li, k) { if (li.getBoundingClientRect().top < line) idx = k; });
      setStage(idx);
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  /* ---------- 02 services configurator ---------- */
  var cfg = $('#cfg'), chain = $('#setupChain'), count = $('#setupN'), opts = $$('#cfg input[type="checkbox"]');
  var arrow = '<svg aria-hidden="true"><use href="#arr"/></svg>';
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function picked() { return opts.filter(function (o) { return o.checked; }).map(function (o) { return o.value; }); }
  function renderSetup() {
    var list = picked();
    count.textContent = list.length + ' of ' + opts.length;
    chain.classList.toggle('is-empty', !list.length);
    chain.innerHTML = list.length ? list.map(function (v) { return '<b>' + esc(v) + '</b>'; }).join(arrow) : 'Nothing ticked yet. Pick the services you need above.';
    try { sessionStorage.setItem('hw-setup', JSON.stringify(list)); } catch (e) {}
  }
  cfg.addEventListener('change', renderSetup);
  try {
    var saved = JSON.parse(sessionStorage.getItem('hw-setup') || '[]');
    opts.forEach(function (o) { o.checked = saved.indexOf(o.value) > -1; });
  } catch (e) {}
  renderSetup();
  /* ---------- Resources: manifest of guides ---------- */
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDate(iso) { var p = iso.split('-'); return +p[2] + ' ' + MON[+p[1] - 1] + ' ' + p[0]; }
  function words(x) { var t = x.lead; x.sections.forEach(function (s) { t += ' ' + s.h + ' ' + (s.p || []).join(' ') + ' ' + (s.list || []).join(' '); }); return t.split(/\s+/).length; }
  function mins(x) { return Math.max(2, Math.ceil(words(x) / 200)); }
  var libList = $('#libList'), libFilter = $('#libFilter'), libCount = $('#libCount'), resFeat = $('#resFeat');
  if (libList && ARTS.length) {
    var arrUse = '<svg aria-hidden="true"><use href="#arr"/></svg>';
    libList.innerHTML = ARTS.map(function (x) {
      return '<li data-topic="' + esc(x.topic) + '"><a class="mf__row" href="#' + x.slug + '"><time datetime="' + x.date + '">' + fmtDate(x.date) + '</time><span class="mf__topic">' + esc(x.topic) + '</span><b class="mf__t">' + esc(x.title) + '</b><span class="mf__read">' + mins(x) + ' min</span><span class="mf__go">' + arrUse + '</span></a></li>';
    }).join('');
    var topics = {}; ARTS.forEach(function (x) { topics[x.topic] = (topics[x.topic] || 0) + 1; });
    libFilter.innerHTML = ['All'].concat(Object.keys(topics)).map(function (t, i) {
      return '<button type="button" class="lib__f" data-topic="' + esc(t) + '" aria-pressed="' + (i ? 'false' : 'true') + '">' + esc(t) + '<span>' + (i ? topics[t] : ARTS.length) + '</span></button>';
    }).join('');
    var setCount = function (n) { libCount.textContent = 'Showing ' + n + ' of ' + ARTS.length + ' guides'; };
    setCount(ARTS.length);
    libFilter.addEventListener('click', function (e) {
      var b = e.target.closest('.lib__f'); if (!b) return;
      var t = b.dataset.topic, n = 0;
      $$('.lib__f', libFilter).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      $$('li', libList).forEach(function (li) { var on = t === 'All' || li.dataset.topic === t; li.hidden = !on; if (on) n++; });
      setCount(n);
    });
    var f0 = ARTS[0];
    resFeat.href = '#' + f0.slug;
    resFeat.innerHTML = '<img class="res-feat__img" src="' + f0.img + '" alt="" width="1600" height="1067"><span class="res-feat__in"><span class="foot__k">Latest guide</span><b class="res-feat__t">' + esc(f0.title) + '</b><span class="res-feat__m">' + fmtDate(f0.date) + ' · ' + mins(f0) + ' min read · ' + esc(f0.topic) + '</span><span class="link">Read the guide' + arrUse + '</span></span>';
  }

  /* ---------- Article view ---------- */
  var art = $('#art'), toc = null, tocBox = null, artSecs = [];
  function renderArticle(x) {
    var i = ARTS.indexOf(x), nx = ARTS[(i + 1) % ARTS.length];
    var secs = x.sections.map(function (s, k) {
      return '<section class="art__sec" id="art-s' + (k + 1) + '" data-reveal><h2>' + esc(s.h) + '</h2>' +
        (s.p || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
        (s.list ? '<ul>' + s.list.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>' : '') + '</section>';
    }).join('');
    art.innerHTML =
      '<header class="phero phero--split art__hero"><div class="phero__frame"><div class="phero__copy">' +
        '<nav class="hero__top" aria-label="Breadcrumb" data-in="1"><a class="hero__brand" href="#home">Howely</a><a class="hero__crumb" href="#resources">Resources</a><span class="hero__crumb" aria-current="page">' + esc(x.topic) + '</span></nav>' +
        '<h1 id="art-h" class="art__h" data-in="2">' + esc(x.title) + '</h1>' +
        '<p class="art__meta" data-in="3"><time datetime="' + x.date + '">' + fmtDate(x.date) + '</time><span>' + mins(x) + ' min read</span><span>' + esc(x.topic) + '</span></p>' +
        '<p class="hero__sub" data-in="4">' + esc(x.lead) + '</p>' +
      '</div><figure class="art__img" data-in="6"><img src="' + x.img + '" alt="' + esc(x.alt) + '"></figure></div></header>' +
      '<div class="wrap art__grid"><aside class="art__toc" aria-label="In this guide"><p class="art__toc-k">In this guide</p><ol class="toc">' +
        x.sections.map(function (s, k) { return '<li><button type="button" data-sec="art-s' + (k + 1) + '">' + esc(s.h) + '</button></li>'; }).join('') +
        '</ol><span class="toc__box" aria-hidden="true"></span></aside><div class="art__body">' + secs + '</div></div>' +
      '<nav class="wrap art__next" aria-label="More guides"><a class="next" href="#' + nx.slug + '"><span class="foot__k">Next guide</span><b>' + esc(nx.title) + '</b><span class="next__go">' + '<svg aria-hidden="true"><use href="#arr"/></svg></span></a><a class="link" href="#resources">All guides<svg aria-hidden="true"><use href="#arr"/></svg></a></nav>';
    toc = $('.toc', art); tocBox = $('.toc__box', art); artSecs = $$('.art__sec', art);
  }
  if (art) {
    art.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sec]'); if (!b) return;
      var t = d.getElementById(b.dataset.sec); if (t) t.scrollIntoView({ behavior: smooth, block: 'start' });
    });
    var tocI = -1, tocTick = false;
    var onToc = function () {
      tocTick = false;
      if (current === null || !AMAP[current] || !toc) return;
      var line = innerHeight * 0.4, i = 0;
      artSecs.forEach(function (s, k) { if (s.getBoundingClientRect().top < line) i = k; });
      if (i === tocI) return;
      tocI = i;
      var btns = $$('button', toc);
      btns.forEach(function (b, k) { if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      var li = btns[i].parentNode;
      tocBox.style.transform = 'translateY(' + (li.offsetTop + li.offsetHeight / 2 - 8) + 'px)';
    };
    addEventListener('scroll', function () { if (!tocTick) { tocTick = true; requestAnimationFrame(onToc); } }, { passive: true });
    addEventListener('hashchange', function () { tocI = -1; setTimeout(onToc, 500); });
    setTimeout(onToc, 300);
  }

  /* ---------- Contact: booking docket ---------- */
  var form = $('#bookForm'), done = $('#bookDone'), tkN = $('#tkN');
  function tkCount() { var n = $$('.tk input:checked', form).length; tkN.textContent = n + ' ticked'; }
  function prefillContact() {
    if (!form) return;
    var want = picked();
    if (want.length) $$('.tk input', form).forEach(function (c) { if (want.indexOf(c.value) > -1) c.checked = true; });
    tkCount();
  }
  if (form) {
    $('#docketNo').textContent = 'No. HW-' + String(Math.floor(1000000 + Math.random() * 8999999));
    form.addEventListener('change', function (e) { if (e.target.matches('.tk input')) tkCount(); });
    var rules = {
      'f-name': function (v) { return v.trim() ? '' : 'Tell us your name.'; },
      'f-email': function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter an email like name@company.com.'; },
      'f-tel': function (v) { return v.replace(/\D/g, '').length >= 8 ? '' : 'Enter a number we can call, at least 8 digits.'; }
    };
    var check = function (id) {
      var el = $('#' + id), msg = rules[id](el.value);
      $('#e-' + id.slice(2)).textContent = msg;
      if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
      return !msg;
    };
    Object.keys(rules).forEach(function (id) { $('#' + id).addEventListener('blur', function () { if (this.value) check(id); }); $('#' + id).addEventListener('input', function () { if (this.hasAttribute('aria-invalid')) check(id); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = Object.keys(rules).filter(function (id) { return !check(id); });
      if (bad.length) { $('#' + bad[0]).focus(); return; }
      var first = $('#f-name').value.trim().split(/\s+/)[0], list = $$('.tk input:checked', form).map(function (c) { return c.value; });
      done.innerHTML = '<svg class="docket__tick" aria-hidden="true"><use href="#tick"/></svg><h3>Request logged, ' + esc(first) + '.</h3>' +
        (list.length ? '<p class="docket__chain">' + list.map(esc).join(' → ') + '</p>' : '') +
        '<p>This prototype does not send forms yet, so nothing has left your browser. To book your free consultation now, call <a href="tel:+6590491368">+65 9049 1368</a>.</p>' +
        '<button class="link" type="button" id="bookEdit">Edit request<svg aria-hidden="true"><use href="#arr"/></svg></button>';
      form.classList.add('is-sent'); done.hidden = false; done.focus();
      $('#bookEdit').addEventListener('click', function () { form.classList.remove('is-sent'); done.hidden = true; $('#f-name').focus(); });
    });
  }

  /* ---------- Home hero reel (desktop only; phones and reduced motion keep the photo) ----------
     Same pattern as the Vocanic reel: one muted looping video, plays only while on screen,
     and a pause button the visitor controls. */
  var vid = $('.hero__vid'), vidBtn = $('.hero__play');
  if (vid && !reduce && matchMedia('(min-width:901px)').matches) {
    vid.src = vid.dataset.src; vid.preload = 'auto'; vid.hidden = false; vidBtn.hidden = false;
    vid.parentNode.classList.add('has-reel');
    var vUser = false, vSeen = false;
    var vUi = function () { var off = vid.paused; vidBtn.classList.toggle('is-off', off); vidBtn.setAttribute('aria-label', off ? 'Play the reel' : 'Pause the reel'); };
    var vSync = function () { if (vUser || !vSeen) vid.pause(); else vid.play().catch(function () { vUser = true; vUi(); }); };
    vid.addEventListener('play', vUi); vid.addEventListener('pause', vUi);
    vidBtn.addEventListener('click', function () { vUser = !vid.paused; vSync(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vSeen = es[0].isIntersecting; vSync(); }).observe(vid.parentNode);
    vUi();
  }

  /* ---------- 3D parcel: one box that travels the page ----------
     Every section has an invisible .dock. Inside a section's hold range the
     parcel sits exactly on that dock; between ranges it tumbles to the next. */
  var pstage = $('#pstage'), parcel = $('#parcel'), shadow = $('.parcel-shadow');
  var B = 200;
  var docTop = function (el) { return el.getBoundingClientRect().top + scrollY; };
  var docBot = function (el) { return el.getBoundingClientRect().bottom + scrollY; };
  var around = function (sel, hold) {
    return function (vh) { var r = $(sel).getBoundingClientRect(), c = r.top + scrollY + r.height / 2 - vh * 0.5; return [c - vh * hold, c + vh * hold]; };
  };
  var DOCKS = [
    { el: $('.dock--hero'), rx: -20, ry: -34, rz: 0, sh: 1, hero: true,
      range: function (vh) { return [0, vh * 0.1]; } },
    { el: $('.dock--wb'), rx: -16, ry: -40, rz: 0, sh: 0, spin: true,
      range: function (vh) { return [docTop(events[0]) - vh * 0.62, docTop(events[events.length - 1]) - vh * 0.42]; } },
    { el: $('.dock--setup'), rx: -18, ry: 32, rz: 0, sh: 0,
      range: function (vh) { var f = $('#cfg'); return [docTop(f) - vh * 0.5, docBot(f) - vh * 0.96]; } },
    { el: $('.dock--slip'), rx: -24, ry: -52, rz: 9, sh: 0.7, range: around('.dock--slip', 0.16) },
    { el: $('.dock--case'), rx: -22, ry: 26, rz: -7, sh: 0.45, range: around('.dock--case', 0.14) },
    { get: function () { var m = $('.dock--end'); return m && m.offsetParent ? m : $('.dock--foot'); }, rx: -12, ry: -24, rz: 0, sh: 0.8,
      range: function (vh, max) {
        var end = $('.dock--end');
        if (end && end.offsetParent) return [max - vh * 0.12, max + 1e6];
        return [Math.min(docTop($('.foot')) - vh * 0.35, max - 2), max + 1e6];
      } }
  ];
  var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var px = 0, py = 0, tx = 0, ty = 0, idle = 1, tilt = 1, spin = 0, running = false;
  var soft = function (t) { return 0.5 - Math.cos(Math.PI * t) / 2; }; // sine in-out, no steep middle
  // S = what is drawn. It follows the scroll target with a time-based glide (in page coordinates,
  // so a parked box stays glued to its dock) and never moves faster than the glide allows.
  var S = null, lastT = 0, snapNext = true, GLIDE = 380;
  var KEYS = ['x', 'dy', 'k', 'rx', 'ry', 'rz', 'sh'];

  function pose(dk) {
    var r = (dk.get ? dk.get() : dk.el).getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, k: r.width / B, rx: dk.rx, ry: dk.ry + (dk.spin ? spin : 0), rz: dk.rz, sh: dk.sh };
  }
  // flyIn: on home load the real parcel takes over from the loader's box mid-screen and flies to the hero dock
  var flyIn = null;
  function parcelFly(f) {
    f.t0 = performance.now();
    var D = (((DOCKS[0].ry - f.ry) % 360) + 360) % 360; if (D < 120) D += 360; f.D = D;
    flyIn = f; render(f.t0); startParcel();
  }
  function place(t) {
    if (d.hidden) { running = false; return; }
    render(t);
    requestAnimationFrame(place);
  }
  function render(t) {
    // home tours every dock; other pages park the box in the footer
    var DK = current === 'home' ? DOCKS : DOCKS.slice(-1);
    var vh = innerHeight, y = scrollY, max = root.scrollHeight - vh;
    // hold ranges, forced into order
    var R = [], prev = -Infinity;
    DK.forEach(function (dk) {
      var r = dk.range(vh, max), a = Math.max(r[0], prev), b = Math.max(r[1], a);
      R.push([a, b]); prev = b + 1;
    });
    var i = 0, leg = -1, lt = 0;
    for (var n = 0; n < DK.length; n++) {
      if (y <= R[n][1]) { if (n > 0 && y < R[n][0]) { leg = n - 1; lt = (y - R[n - 1][1]) / Math.max(1, R[n][0] - R[n - 1][1]); } i = n; break; }
      i = n;
    }
    spin = lerp(spin, Math.max(0, active) * 90, reduce ? 1 : 0.1);
    var P;
    if (leg < 0) {
      P = pose(DK[i]);
      idle = lerp(idle, 1, 0.06); tilt = lerp(tilt, DK[i].hero ? 1 : 0, 0.08);
    } else {
      var a = pose(DK[leg]), b = pose(DK[leg + 1]);
      var e = reduce ? (lt < 0.5 ? 0 : 1) : soft(clamp(lt, 0, 1)), arc = reduce ? 0 : Math.sin(Math.PI * e);
      var ry0 = lerp(a.y, b.y, e), half = 100 * lerp(a.k, b.k, e);
      var w = clamp(Math.min(lt, 1 - lt) / 0.08, 0, 1); // stay in view mid-flight
      ry0 = lerp(ry0, clamp(ry0, vh * 0.14 + half, vh * 0.86 - half), w);
      // gentle leg: a soft quarter turn and a small lift, not a full flip
      P = { x: lerp(a.x, b.x, e), y: ry0 - arc * vh * 0.035, k: lerp(a.k, b.k, e) * (1 + arc * 0.1),
            rx: lerp(a.rx, b.rx, e) - arc * 10, ry: lerp(a.ry, b.ry, e) + (reduce ? 0 : 90 * e), rz: lerp(a.rz, b.rz, e) + arc * 5, sh: lerp(a.sh, b.sh, e) * (1 - arc * 0.6) };
      idle = lerp(idle, 0, 0.2); tilt = lerp(tilt, 0, 0.12);
    }
    var m = 1; // how much of the resting life (bob, wobble, pointer tilt) is mixed in
    if (flyIn) {
      var f = flyIn, s = clamp((t - f.t0) / f.dur, 0, 1), fe = ease(s), farc = Math.sin(Math.PI * fe), T = f.v * f.dur / 1000;
      var sm = s * s * (3 - 2 * s);
      P = { x: lerp(f.x, P.x, fe), y: lerp(f.y, P.y, fe) - farc * vh * 0.07, k: lerp(f.k, P.k, fe) * (1 + farc * 0.3),
            // spin keeps the loader's speed at the start, then settles exactly on the dock angle
            rx: lerp(f.rx, P.rx, sm), ry: f.ry + T * s + (3 * f.D - 2 * T) * s * s + (T - 2 * f.D) * s * s * s,
            rz: P.rz * fe, sh: P.sh * fe };
      m = fe;
      if (s >= 1) flyIn = null;
    }
    var T = { x: P.x, dy: P.y + scrollY, k: P.k, rx: P.rx, ry: P.ry, rz: P.rz, sh: P.sh };
    var dt = lastT ? Math.min(64, t - lastT) : 16; lastT = t;
    if (!S || snapNext || flyIn || m < 1 || reduce) { S = T; snapNext = false; }
    else {
      var g = 1 - Math.exp(-dt / GLIDE);
      KEYS.forEach(function (k) {
        var dv = T[k] - S[k];
        if (k === 'rx' || k === 'ry' || k === 'rz') dv = ((dv % 360) + 540) % 360 - 180; // angles take the short way round, never unwind whole turns
        S[k] += dv * g;
      });
    }
    var dyv = S.dy - scrollY, hh = 100 * S.k;
    if (Math.abs(T.dy - S.dy) > 2) { // on a hard fling, keep the gliding box on screen
      dyv = clamp(dyv, Math.min(P.y, vh * 0.1 + hh), Math.max(P.y, vh * 0.9 - hh)); S.dy = dyv + scrollY;
    }
    P = { x: S.x, y: dyv, k: S.k, rx: S.rx, ry: S.ry, rz: S.rz, sh: S.sh };
    px += (tx - px) * 0.08; py += (ty - py) * 0.08;
    var bob = reduce ? 0 : Math.sin(t * 0.0011) * 7 * idle * m;
    var wob = reduce ? 0 : Math.sin(t * 0.00035) * 10 * idle * m;
    pstage.style.transform = 'translate3d(' + (P.x - B / 2).toFixed(1) + 'px,' + (P.y - B / 2).toFixed(1) + 'px,0) scale(' + P.k.toFixed(4) + ')';
    parcel.style.transform = 'translate3d(0,' + bob.toFixed(2) + 'px,0) rotateX(' + (P.rx + Math.cos(t * 0.0003) * 3 * idle * m - py * 14 * tilt * m).toFixed(2) + 'deg) rotateY(' + (P.ry + wob + px * 26 * tilt * m).toFixed(2) + 'deg) rotateZ(' + P.rz.toFixed(2) + 'deg)';
    shadow.style.setProperty('--sh', (1 - bob / 40).toFixed(3));
    shadow.style.setProperty('--sho', P.sh.toFixed(3));
  }
  function startParcel() { if (!running) { running = true; requestAnimationFrame(place); } }
  if (fine && !reduce) addEventListener('pointermove', function (e) { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; }, { passive: true });
  d.addEventListener('visibilitychange', startParcel);
  addEventListener('hashchange', function () { snapNext = true; setTimeout(startParcel, 50); });


  /* ---------- About: duty roster switch ---------- */
  var sw = $('#rosterSwitch'), roster = $('#roster'), rosterSum = $('#rosterSum');
  if (sw) sw.addEventListener('click', function () {
    var on = sw.getAttribute('aria-checked') !== 'true';
    sw.setAttribute('aria-checked', on ? 'true' : 'false');
    sw.setAttribute('aria-label', on ? 'Show the roster in-house' : 'Show the roster with Howely');
    roster.classList.toggle('is-howely', on);
    rosterSum.textContent = on ? 'You: 1 job. The one that matters.' : 'You: 8 of 8 jobs.';
  });

  /* ---------- Services: catalogue tabs ---------- */
  var tabs = $$('.cat__tab');
  // route strip: which of the five stages each service covers
  var STOPS = ['Origin', 'Port & clearance', 'Storage', 'Pick & pack', 'Doorstep'];
  var COVER = { air: [0, 1], sea: [0, 1], courier: [4], door: [0, 4], home: [0, 4], wh: [2], dist: [2, 4], contract: [2, 3], tpl: [2, 3, 4], supply: [0, 1, 2, 3, 4] };
  Object.keys(COVER).forEach(function (k) {
    var pane = $('#pane-' + k), body = pane && $('.cat__body', pane); if (!body) return;
    var on = COVER[k], lo = on[0], hi = on[on.length - 1];
    var r = d.createElement('div'); r.className = 'route';
    r.innerHTML = '<p class="route__k">Where it sits in the chain</p><ol class="route__line" style="--a:' + lo + ';--b:' + hi + '">' +
      STOPS.map(function (s, i) { var lit = on.indexOf(i) > -1; return '<li' + (lit ? ' class="is-on"' : '') + '><i aria-hidden="true"></i>' + s.replace('&', '&amp;') + (lit ? '<span class="sr-only"> (covered)</span>' : '') + '</li>'; }).join('') +
      '<span class="route__box" aria-hidden="true"></span></ol>';
    body.insertBefore(r, $('dl', body));
  });
  function slideRoute(from, to) {
    var a = from && $('.route__line', from), b = to && $('.route__line', to); if (!a || !b || reduce) return;
    var s = getComputedStyle(a), rt = b.parentNode;
    rt.classList.add('is-snap'); b.style.setProperty('--x', s.getPropertyValue('--a')); b.style.setProperty('--y', s.getPropertyValue('--b'));
    void b.offsetWidth; rt.classList.remove('is-snap');
    requestAnimationFrame(function () { b.style.removeProperty('--x'); b.style.removeProperty('--y'); });
  }
  function selectTab(tab, focus) {
    var was = $('.cat__pane:not([hidden])');
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
    slideRoute(was, $('#' + tab.getAttribute('aria-controls')));
    if (focus) tab.focus();
    if (innerWidth <= 900) tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: smooth });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = null;
      if (k === 'ArrowDown' || k === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      else if (k === 'ArrowUp' || k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (k === 'Home') n = tabs[0]; else if (k === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });
  $$('.cat__pair').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = $('#tab-' + b.dataset.go); if (!t) return;
      selectTab(t, true);
      var g = $('.cat__grid'); if (g.getBoundingClientRect().top < 0) g.scrollIntoView({ behavior: smooth });
    });
  });

  /* ---------- Services: conveyor ---------- */
  var flowTrack = $('#flowTrack'), signs = $$('#flowSigns .sign'), signRow = $('#flowSigns'), belt = $('#flowBelt'), flowN = $('#flowN'), flowBox = $('.parcel--belt'), flowOn = -1;
  function onFlow() {
    if (current !== 'services' || !flowTrack || innerWidth <= 900) return;
    var r = flowTrack.getBoundingClientRect(), vh = innerHeight;
    var p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
    var step = signs.length > 1 ? signs[1].offsetLeft - signs[0].offsetLeft : 0;
    var raw = p * (signs.length - 1), fl = Math.floor(raw), fr = raw - fl;
    var hold = clamp((fr - 0.22) / 0.56, 0, 1);
    var travel = Math.min(signs.length - 1, fl + (reduce ? Math.round(fr) : hold * hold * (3 - 2 * hold))); // dwell at each bay
    signRow.style.transform = 'translate3d(' + (-travel * step).toFixed(1) + 'px,0,0)';
    belt.style.setProperty('--bx', (-travel * step).toFixed(1) + 'px');
    var i = Math.round(travel);
    if (i !== flowOn) {
      flowOn = i;
      signs.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
      flowN.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
    }
    var near = Math.abs(travel - i);
    flowBox.style.transform = 'translate3d(0,' + (reduce ? 0 : (-Math.max(0, 0.18 - near) * 40).toFixed(2)) + 'px,0) rotateX(-14deg) rotateY(' + (-32 + (reduce ? 0 : travel * 6)).toFixed(2) + 'deg)';
  }
  addEventListener('scroll', function () { requestAnimationFrame(onFlow); }, { passive: true });
  addEventListener('resize', onFlow);

  /* ---------- Services: warehouse floor plan ---------- */
  var zones = $$('.zone'), planDetail = $('#planDetail');
  function showZone(z) {
    zones.forEach(function (b) { b.setAttribute('aria-pressed', b === z ? 'true' : 'false'); });
    planDetail.innerHTML = '';
    planDetail.appendChild($('#tpl-' + z.dataset.zone).content.cloneNode(true));
  }
  zones.forEach(function (z) { z.addEventListener('click', function () { showZone(z); }); });
  if (zones.length) showZone(zones[0]);

  go(true);
  revealScan();
  onScroll();
  startParcel();
  onFlow();
})();
