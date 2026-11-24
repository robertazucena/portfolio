/* Helio Energy: router, preloader, nav, entrances, sunrise-to-sunset steps, roof peel, savings estimate.
   Works from file:// (no fetch). */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, body = doc.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* ---------- preloader: identical on first load and every route change ---------- */
  var loader = $('#loader');
  var LOAD_MS = reduce ? 150 : 1400;
  /* sequence, identical on first load and every route: the mesh gradient shows as one field, the sun and count play,
     then the boxes animate as they release, then the content reveals one by one. Entrances wait for the release. */
  function cover(cb, instant) {
    if (io) io.disconnect();
    loader.classList.remove('is-on'); void loader.offsetWidth;
    /* from the open menu the mesh is already on screen, so the loader takes over at full strength (no fade, no gap) */
    loader.classList.add('is-on'); if (instant) loader.classList.add('is-first');
    setTimeout(cb, LOAD_MS);
  }
  function uncover() { loader.classList.remove('is-on', 'is-first'); setTimeout(reveal, reduce ? 0 : 380); }

  /* ---------- router: #pagename, one data-view per page ---------- */
  var views = $$('[data-view]');
  var names = views.map(function (v) { return v.getAttribute('data-view'); });
  var current = null;
  function routeName() { var h = (location.hash || '#home').slice(1).split('/')[0]; return names.indexOf(h) > -1 ? h : 'home'; }
  function routeParam() { return (location.hash || '').slice(1).split('/')[1] || ''; }
  function show(name, first) {
    views.forEach(function (v) { v.hidden = v.getAttribute('data-view') !== name; });
    $$('.menu__links a').forEach(function (a) {
      if (a.getAttribute('href') === '#' + name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    doc.title = name === 'home' ? 'Helio Energy · Solar energy for homes and businesses'
      : (($('[data-view="' + name + '"] h1') || {}).textContent || 'Helio Energy') + ' · Helio Energy';
    current = name;
    body.classList.toggle('is-sub', name !== 'home');
    if (!first) window.scrollTo(0, 0);
    onScroll();
    if (typeof drawArc === 'function') drawArc();
    enter(name);
  }
  function go(first) {
    var name = routeName();
    var fromMenu = root.classList.contains('menu-on');
    if (!fromMenu || first || name === current) closeMenu();
    if (first) { show(name, true); setTimeout(uncover, LOAD_MS); return; }
    if (name === current && routeParam()) { enter(name); return; }
    if (name === current) { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
    cover(function () { show(name); uncover(); $('#main').focus({ preventScroll: true }); }, fromMenu);
    if (fromMenu) menuState(false); /* swaps underneath the loader, out of sight */
  }
  window.addEventListener('hashchange', function () { go(false); });

  /* in-page jumps on home that must not change the route */
  doc.addEventListener('click', function (e) {
    var t = e.target.closest('[data-scroll]');
    if (!t) return;
    var el = doc.getElementById(t.getAttribute('data-scroll'));
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });

  /* ---------- menu (tablet and phone) ---------- */
  var menuBtn = $('#menu-btn'), menu = $('#menu'), nav = $('#nav');
  var root = doc.documentElement, menuBg = $$('.menu__bg img'), menuBusy = false;
  function bg(name) { menuBg.forEach(function (im) { im.classList.toggle('on', im.getAttribute('data-bg') === name); }); }
  /* instant state swap, only ever done while the loader covers the screen */
  function menuState(on) {
    menuBtn.setAttribute('aria-expanded', String(on));
    $('.nav__menu-label', menuBtn).textContent = on ? 'Close' : 'Menu';
    menu.hidden = !on; menu.classList.toggle('on', on); root.classList.toggle('menu-on', on);
    if (on) bg(current);
    onScroll();
  }
  /* opening and closing the menu run the very same preloader as page loads: mesh, sun and count in the middle, boxes release, contents reveal */
  function setMenu(on) {
    if (menuBusy || on === root.classList.contains('menu-on')) return;
    menuBusy = true;
    $('.nav__menu-label', menuBtn).textContent = on ? 'Close' : 'Menu';
    cover(function () {
      menuState(on); uncover(); menuBusy = false;
      if (on) menu.focus({ preventScroll: true }); else menuBtn.focus({ preventScroll: true });
    });
  }
  function closeMenu() { setMenu(false); }
  menuBtn.addEventListener('click', function () { setMenu(!root.classList.contains('menu-on')); });
  $$('.menu__links a').forEach(function (a) {
    a.addEventListener('pointerenter', function () { bg(a.getAttribute('data-go')); });
    a.addEventListener('focus', function () { bg(a.getAttribute('data-go')); });
  });
  $('.menu__links').addEventListener('pointerleave', function () { bg(current); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-on')) { closeMenu(); menuBtn.focus(); } });
  /* a link to another page leaves the menu up; the router hands it to the loader so the mesh never breaks */
  menu.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a) return;
    var h = a.getAttribute('href') || '', r = h.charAt(0) === '#' ? h.slice(1).split('/')[0] : '';
    if (r && names.indexOf(r) > -1 && r !== current) return;
    closeMenu();
  });

  /* ---------- entrances: heading, then text, then picture ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    /* whatever enters together comes in one by one, top to bottom, left to right */
    var vis = entries.filter(function (en) { return en.isIntersecting; }).sort(function (a, b) {
      var ra = a.boundingClientRect, rb = b.boundingClientRect;
      return (Math.round(ra.top / 24) - Math.round(rb.top / 24)) || (ra.left - rb.left);
    });
    vis.forEach(function (en, i) { io.unobserve(en.target); rise(en.target, Math.min(i, 8)); });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  /* play the entrance, then hand the element back to its own hover/press transitions:
     the entrance's slow, staggered transition must never linger on a button, card or link */
  function rise(el, d) {
    el.style.setProperty('--d', d); el.classList.add('in');
    setTimeout(function () { el.removeAttribute('data-rise'); el.style.removeProperty('--d'); }, reduce ? 0 : 950 + d * 110);
  }
  function reveal() {
    /* the first fold (hero headline, text, buttons and the five-item bar) always plays, in order, even where it sits under the observer's bottom margin */
    var heroIdx = 0;
    $$('[data-rise]:not(.in)').forEach(function (el) {
      if (el.closest('[data-view][hidden]')) return;
      if (el.closest('.hero') && window.scrollY < window.innerHeight * .5) { rise(el, Math.min(heroIdx++, 9)); return; }
      if (io) io.observe(el); else rise(el, 0);
    });
  }


  /* ---------- hero video slot: shows only if media/hero.mp4 exists and plays ---------- */
  var vid = $('.hero__video');
  if (vid && !reduce) {
    vid.addEventListener('playing', function () { vid.classList.add('is-playing'); });
    vid.addEventListener('error', function () { vid.remove(); }, true);
    var src = doc.createElement('source'); src.src = vid.getAttribute('data-src'); src.type = 'video/mp4';
    src.addEventListener('error', function () { vid.remove(); });
    vid.appendChild(src);
    var p = vid.play && vid.play(); if (p && p.catch) p.catch(function () {});
  }

  /* ---------- scroll: solid nav, giant line, closing photo ---------- */
  var lastY = window.scrollY, giant = $('.giant'), why = $('.why'), close = $('.close'), ticking = false;
  function progress(el) {
    var r = el.getBoundingClientRect(), vh = window.innerHeight;
    return Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
  }
  function frame() {
    ticking = false;
    kick();
    var y = window.scrollY;
    nav.classList.toggle('is-solid', current !== 'home' || y > 40);
    /* scrolling down hides the header anywhere on the page; the slightest scroll up brings it back, 20% smaller */
    nav.classList.toggle('is-compact', y > 40);
    if (root.classList.contains('menu-on') || y <= 40) nav.classList.remove('is-hidden');
    else if (y > lastY) nav.classList.add('is-hidden');
    else if (y < lastY) nav.classList.remove('is-hidden');
    lastY = y;
    if (reduce || current !== 'home') return;
    if (why) giant.style.setProperty('--p', progress(why).toFixed(4));
    if (close) close.style.setProperty('--p', progress(close).toFixed(4));
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- parallax: a smoothed scroll value drives layered depth ---------- */
  var layers = $$('[data-parallax]').map(function (el) { return { el: el, k: parseFloat(el.getAttribute('data-parallax')) || 0, box: el.closest('figure, section') || el }; });
  var heroMedia = $('.hero__media'), heroBody = $('.hero__body'), sy = window.scrollY, pxRaf = 0;
  function parallax() {
    pxRaf = 0;
    if (reduce || current !== 'home') return;
    var y = window.scrollY, vh = window.innerHeight;
    sy += (y - sy) * 0.11;                      // ease toward the real scroll: things glide and settle
    if (Math.abs(y - sy) < 0.1) sy = y;
    var lag = y - sy;                            // how far the smoothed view trails the real one
    if (heroMedia && sy < vh * 1.2) {
      heroMedia.style.translate = '0 ' + (sy * 0.38).toFixed(1) + 'px';
      heroBody.style.translate = '0 ' + (sy * -0.16).toFixed(1) + 'px';
      heroBody.style.opacity = Math.max(0, 1 - sy / (vh * 0.62)).toFixed(3);
    }
    layers.forEach(function (l) {
      var r = l.box.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var off = (r.top + lag + r.height / 2) - vh / 2;   // distance of the layer's frame from mid-screen
      l.el.style.translate = '0 ' + (-off * l.k).toFixed(1) + 'px';
    });
    if (sy !== y) pxRaf = requestAnimationFrame(parallax);
  }
  function kick() { if (!pxRaf) pxRaf = requestAnimationFrame(parallax); }
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  kick();

  /* ---------- E. how it works: the sun crosses the sky step by step ---------- */
  var steps = $$('.step'), shots = $$('.steps__stage img'), arcPath = $('#arc-path'), sun = $('#arc-sun');
  var clock = $('#clock'), clockName = $('#clock-name'), tint = $('.steps__tint'), active = -1;
  var WARM = [.1, .05, 0, .06, .12];
  /* a true circular arc drawn at the real pixel size, so the sun stays round */
  var arcSvg = $('.arc'), sunAt = 0, sunRaf = 0;
  function drawArc() {
    if (!arcSvg || !arcPath) return;
    var w = arcSvg.clientWidth, h = arcSvg.clientHeight, pad = Math.min(40, w * .04);
    if (!w || !h) return;
    var c = w - pad * 2, s = h - pad, r = (c * c / 4 + s * s) / (2 * s);
    arcSvg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    arcPath.setAttribute('d', 'M' + pad + ' ' + h + ' A' + r + ' ' + r + ' 0 0 1 ' + (w - pad) + ' ' + h);
    placeSun(sunAt);
  }
  function placeSun(t) {
    if (!sun || !arcPath.getTotalLength) return;
    var pt = arcPath.getPointAtLength(arcPath.getTotalLength() * t);
    sun.setAttribute('cx', pt.x); sun.setAttribute('cy', pt.y);
  }
  function moveSun(to) {
    if (!arcPath) return;
    cancelAnimationFrame(sunRaf);
    var from = sunAt, t0 = null;
    if (reduce) { sunAt = to; placeSun(to); return; }
    (function tick(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - k, 3);
      sunAt = from + (to - from) * e; placeSun(sunAt);
      if (k < 1) sunRaf = requestAnimationFrame(tick);
    })(performance.now());
  }
  drawArc();
  window.addEventListener('resize', drawArc);
  function setStep(i) {
    if (i === active) return; active = i;
    steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
    shots.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
    moveSun(i / (steps.length - 1));
    clock.textContent = steps[i].getAttribute('data-time');
    clockName.textContent = steps[i].getAttribute('data-name');
    tint.style.setProperty('--warm', WARM[i]);
  }
  if (steps.length) {
    setStep(0);
    if ('IntersectionObserver' in window) {
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) setStep(+en.target.getAttribute('data-step')); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      steps.forEach(function (s) { so.observe(s); });
    } else steps.forEach(function (s) { s.classList.add('is-on'); });
  }

  /* ---------- F. peel the roof back ---------- */
  var peel = $('.peel'), range = $('#peel');
  if (peel && range) {
    var setX = function (v) { peel.style.setProperty('--x', v + '%'); };
    range.addEventListener('input', function () { setX(range.value); });
    if (!reduce && io) {
      new IntersectionObserver(function (en, ob) {
        if (!en[0].isIntersecting) return; ob.disconnect();
        var t0 = null, from = 92, to = +range.value;
        (function tickPeel(t) {
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 3);
          setX(from + (to - from) * e);
          if (k < 1) requestAnimationFrame(tickPeel);
        })(performance.now());
      }, { threshold: .4 }).observe(peel);
    }
  }

  /* ---------- G. savings estimate (illustrative) ---------- */
  var A = { rate: 12, psh: 4.5, pr: 0.8, cover: { home: 0.7, commercial: 0.8, industrial: 0.85 } };
  var YIELD = A.psh * 30 * A.pr; // kWh per kWp per month
  var form = $('#calc');
  var peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });
  function setErr(input, msg) {
    doc.getElementById(input.id + '-err').textContent = msg || '';
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    return !msg;
  }
  function put(id, text) {
    var el = doc.getElementById(id);
    if (el.textContent === text) return;
    el.textContent = text;
    el.classList.remove('is-tick'); void el.offsetWidth; el.classList.add('is-tick');
  }
  function calc(strict) {
    var bill = parseFloat(form.bill.value), kwhIn = parseFloat(form.kwh.value), type = form.ptype.value, ok = true;
    if (!(bill >= 500)) { setErr(form.bill, strict || form.bill.value ? 'Enter a monthly bill of ₱500 or more.' : ''); ok = false; }
    else setErr(form.bill, '');
    if (form.kwh.value && !(kwhIn > 0)) { setErr(form.kwh, 'Enter kWh as a number above 0, or leave it blank.'); ok = false; }
    else setErr(form.kwh, '');
    if (!ok) return false;
    var kwh = kwhIn > 0 ? kwhIn : bill / A.rate, rate = bill / kwh, share = A.cover[type];
    var size = Math.max(1, Math.round((kwh * share / YIELD) * 10) / 10);
    var save = Math.min(size * YIELD * rate, bill * share);
    put('out-save', peso.format(Math.round(save / 10) * 10));
    put('out-size', size.toFixed(1) + ' kWp');
    put('out-year', peso.format(Math.round(save * 12 / 100) * 100));
    doc.getElementById('out-assume').textContent =
      'Assumes ' + (kwhIn > 0 ? 'your rate of ' + peso.format(rate) + ' per kWh' : 'an average rate of ₱' + A.rate + ' per kWh') +
      ', ' + A.psh + ' peak sun hours a day, 80% system performance, and solar covering about ' +
      Math.round(share * 100) + '% of the ' + form.ptype.options[form.ptype.selectedIndex].text.toLowerCase() + '’s use.';
    return true;
  }
  if (form) {
    form.addEventListener('input', function () { calc(false); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (calc(true)) $('#out-save').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      else (form.querySelector('[aria-invalid="true"]') || form.bill).focus();
    });
    form.bill.addEventListener('blur', function () { calc(true); });
    calc(false);
  }


  /* =================== INNER PAGES =================== */
  var hooks = {};
  function enter(name) { if (hooks[name]) hooks[name](routeParam()); }

  /* ABOUT: mission / vision switch */
  var sw = $('.switch');
  if (sw) {
    var swTabs = $$('.switch__opt', sw);
    var swSet = function (i, focus) {
      sw.setAttribute('data-on', i);
      swTabs.forEach(function (t, k) {
        t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1;
        var p = doc.getElementById(t.getAttribute('aria-controls'));
        p.hidden = k !== i; if (k === i) { p.style.animation = 'none'; void p.offsetWidth; p.style.animation = ''; }
      });
      if (focus) swTabs[i].focus();
    };
    swTabs.forEach(function (t, k) { t.addEventListener('click', function () { swSet(k); }); });
    sw.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); swSet(+(sw.getAttribute('data-on') || 0) ? 0 : 1, true); } });
  }
  /* ABOUT: values charge like solar cells */
  $$('.cell').forEach(function (c) { c.addEventListener('click', function () { c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true')); }); });

  /* SOLUTIONS: tabs light up the energy-flow diagram */
  var SV = {
    residential: { t: 'Residential solar', l: 'Panel systems designed around your household’s energy use, with room for a battery later.', inc: ['Roof survey and bill review', 'Panels, inverter and mounting', 'Net-metering paperwork', 'Handover and monitoring app'], f: 'Families paying ₱3,000 or more a month, with a roof that sees the sun from mid-morning to mid-afternoon.', nodes: ['sun', 'pv', 'inv', 'load', 'grid'], links: ['sun-pv', 'pv-inv', 'inv-load', 'inv-grid'], load: 'Home' },
    commercial: { t: 'Commercial solar', l: 'Rooftop systems for offices, shops and warehouses, sized from a consumption assessment.', inc: ['Energy audit of your daytime load', 'Custom system and roof layout', 'Installation planned around opening hours', 'Long-term cost planning'], f: 'Businesses that use most of their power in daylight: offices, clinics, malls, cold storage.', nodes: ['sun', 'pv', 'inv', 'load', 'grid'], links: ['sun-pv', 'pv-inv', 'inv-load', 'inv-grid'], load: 'Business' },
    industrial: { t: 'Industrial solar', l: 'Large-scale rooftop and ground systems for plants and facilities, planned as part of your infrastructure.', inc: ['Load profiling across shifts', 'Rooftop or ground-mounted arrays', 'Grid connection studies', 'Energy optimisation'], f: 'Plants, mills and processing sites with heavy daytime demand and space for a large array.', nodes: ['sun', 'pv', 'inv', 'load', 'grid'], links: ['sun-pv', 'pv-inv', 'inv-load', 'inv-grid'], load: 'Plant' },
    battery: { t: 'Battery storage', l: 'Keep the daytime sun for evenings and outages, and decide when to draw on the grid.', inc: ['Battery sizing from your evening use', 'Hybrid inverter set-up', 'Backup circuits for essentials', 'Energy management settings'], f: 'Homes and businesses with evening demand or frequent brownouts.', nodes: ['sun', 'pv', 'inv', 'bat', 'load'], links: ['sun-pv', 'pv-inv', 'inv-bat', 'inv-load'], load: 'Home' },
    design: { t: 'Design and consultation', l: 'Site assessment and usage analysis before any recommendation is made.', inc: ['Twelve months of bills reviewed', 'Shading and roof structure check', 'System options with costs and payback', 'Project plan and permit timeline'], f: 'Anyone who wants clear numbers before deciding, including owners comparing quotes.', nodes: ['sun', 'pv', 'inv', 'bat', 'load', 'grid'], links: [], load: 'Building' },
    care: { t: 'Maintenance and support', l: 'Inspections and monitoring that keep a system producing as designed.', inc: ['Scheduled inspections and cleaning', 'Performance monitoring and alerts', 'Inverter and wiring checks', 'Post-typhoon inspections'], f: 'Existing system owners, including systems we did not install.', nodes: ['sun', 'pv', 'inv', 'bat', 'load', 'grid'], links: ['sun-pv', 'pv-inv', 'inv-bat', 'inv-load', 'inv-grid'], load: 'Building' }
  };
  var svTabs = $$('.explorer__tab'), svPanel = $('#sv-panel'), svKey = 'residential';
  function svSelect(key, focus) {
    if (!SV[key] || !svPanel) return;
    var d = SV[key], idx = 0;
    svTabs.forEach(function (t, k) { var on = t.getAttribute('data-key') === key; if (on) idx = k; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    $('.explorer__list').style.setProperty('--i', idx);
    svPanel.setAttribute('aria-labelledby', 'sv-' + key);
    if (focus) svTabs[idx].focus();
    $('[data-f="title"]', svPanel).textContent = d.t;
    $('[data-f="lede"]', svPanel).textContent = d.l;
    $('[data-f="for"]', svPanel).textContent = d.f;
    $('[data-f="inc"]', svPanel).innerHTML = d.inc.map(function (x) { return '<li>' + x + '</li>'; }).join('');
    $$('.flow__node').forEach(function (n) { n.classList.toggle('is-on', d.nodes.indexOf(n.getAttribute('data-node')) > -1); });
    $$('.flow__line').forEach(function (l) { l.classList.toggle('is-on', d.links.indexOf(l.getAttribute('data-link')) > -1); });
    $('[data-load]').textContent = d.load;
    if (key !== svKey) { svPanel.classList.remove('is-swap'); void svPanel.offsetWidth; svPanel.classList.add('is-swap'); }
    svKey = key;
  }
  svTabs.forEach(function (t, k) {
    t.addEventListener('click', function () { svSelect(t.getAttribute('data-key')); history.replaceState(null, '', '#solutions/' + t.getAttribute('data-key')); });
    t.addEventListener('keydown', function (e) {
      var dir = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 0;
      if (!dir) return; e.preventDefault();
      var n = svTabs[(k + dir + svTabs.length) % svTabs.length]; svSelect(n.getAttribute('data-key'), true);
    });
  });
  svSelect('residential');
  hooks.solutions = function (p) {
    if (SV[p]) { svSelect(p); if (window.scrollY > 0 || current === 'solutions') $('.explorer').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  };

  /* SOLUTIONS: FAQ opens and closes smoothly */
  $$('.qa').forEach(function (q) {
    $('summary', q).addEventListener('click', function (e) {
      e.preventDefault();
      if (q.open) { q.classList.remove('is-open'); setTimeout(function () { if (!q.classList.contains('is-open')) q.open = false; }, reduce ? 0 : 480); }
      else { q.open = true; requestAnimationFrame(function () { q.classList.add('is-open'); }); }
    });
  });

  /* PROJECTS: filter with a sliding underline */
  var fl = $('.filter'), flLine = $('.filter__line'), flTabs = $$('.filter__opt');
  function flPlace() { var t = $('.filter__opt[aria-selected="true"]'); if (!t || !t.offsetWidth) return; flLine.style.setProperty('--l', t.offsetLeft + 'px'); flLine.style.setProperty('--w', t.offsetWidth + 'px'); }
  function flSet(btn, focus) {
    flTabs.forEach(function (t) { var on = t === btn; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    if (focus) btn.focus(); flPlace();
    var f = btn.getAttribute('data-filter');
    $$('.case').forEach(function (c) {
      var show = f === 'all' || c.getAttribute('data-type') === f;
      if (show) { c.hidden = false; requestAnimationFrame(function () { c.classList.remove('is-out'); }); }
      else { c.classList.add('is-out'); setTimeout(function () { if (c.classList.contains('is-out')) c.hidden = true; }, reduce ? 0 : 450); }
    });
  }
  flTabs.forEach(function (t, k) {
    t.addEventListener('click', function () { flSet(t); });
    t.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { e.preventDefault(); flSet(flTabs[(k + d + flTabs.length) % flTabs.length], true); } });
  });
  window.addEventListener('resize', flPlace);
  /* PROJECTS: each case draws its day of production */
  $$('.day').forEach(function (fig) {
    var peak = parseFloat(fig.getAttribute('data-peak')) * 0.8, pts = [], area;
    for (var i = 0; i <= 48; i++) { var t = i / 48, y = 100 - 88 * Math.pow(Math.sin(Math.PI * t), 1.6); pts.push((t * 400).toFixed(1) + ' ' + y.toFixed(1)); }
    var line = 'M' + pts.join(' L'); area = line + ' L400 100 L0 100Z';
    $('.day__line', fig).setAttribute('d', line); $('.day__area', fig).setAttribute('d', area);
    $('.day__peak', fig).textContent = 'Peak about ' + (peak >= 10 ? Math.round(peak) : peak.toFixed(1)) + ' kW';
  });
  function drawDays() {
    $$('.day:not(.in)').forEach(function (fig) {
      var l = $('.day__line', fig); if (!l.getTotalLength) return;
      var len = l.getTotalLength(); l.style.strokeDasharray = len; l.style.strokeDashoffset = reduce ? 0 : len;
      var run = function () { fig.classList.add('in'); l.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.22,1,.36,1)'; l.style.strokeDashoffset = 0; };
      if (io && !reduce) new IntersectionObserver(function (en, ob) { if (en[0].isIntersecting) { ob.disconnect(); run(); } }, { threshold: .5 }).observe(fig); else run();
    });
  }
  hooks.projects = function () { requestAnimationFrame(function () { flPlace(); drawDays(); }); };

  /* CALCULATOR: live estimate, cost range and a 25-year payback runway */
  var lab = $('#lab');
  if (lab) {
    var LC = { rate: 12, yield: 4.5 * 30 * 0.8, panel: 0.55, degr: 0.005, co2: 0.7,
      cover: { home: 0.7, commercial: 0.8, industrial: 0.85 },
      cost: { home: [60000, 75000], commercial: [50000, 62000], industrial: [42000, 52000] }, bat: [30000, 38000] };
    var run = $('#runway');
    run.innerHTML = Array.apply(null, Array(25)).map(function (_, k) { return '<i style="--k:' + k + ';--h:0%"></i>'; }).join('') + '<span class="runway__cost" style="--c:0%"><span>System cost</span></span>';
    var bars = $$('i', run), costLine = $('.runway__cost', run);
    var short = function (v) { return v >= 1e6 ? '₱' + (v / 1e6).toFixed(v >= 1e7 ? 0 : 1) + 'M' : peso.format(Math.round(v / 1000) * 1000); };
    var labCalc = function () {
      var bill = +lab.bill.value, type = lab.querySelector('[name=ptype]:checked').value, bat = lab.battery.checked;
      lab.bill.style.setProperty('--p', ((bill - lab.bill.min) / (lab.bill.max - lab.bill.min) * 100).toFixed(1) + '%');
      $('#lab-bill-out').textContent = peso.format(bill);
      var kwh = bill / LC.rate, size = Math.max(1, Math.round(kwh * LC.cover[type] / LC.yield * 10) / 10);
      var panels = Math.ceil(size / LC.panel), save = Math.min(size * LC.yield * LC.rate, bill * LC.cover[type]);
      var batKwh = bat ? Math.max(5, Math.round(size * 1.2 / 5) * 5) : 0;
      var lo = size * LC.cost[type][0] + batKwh * LC.bat[0], hi = size * LC.cost[type][1] + batKwh * LC.bat[1], mid = (lo + hi) / 2;
      var cum = 0, series = [], payYear = 0;
      for (var y = 0; y < 25; y++) { cum += save * 12 * Math.pow(1 - LC.degr, y); series.push(cum); if (!payYear && cum >= mid) payYear = y + 1; }
      var top = Math.max(cum, mid) * 1.05;
      bars.forEach(function (b, k) { b.style.setProperty('--h', (series[k] / top * 100).toFixed(1) + '%'); b.classList.toggle('is-paid', series[k] >= mid); });
      costLine.style.setProperty('--c', (mid / top * 100).toFixed(1) + '%');
      put('lb-save', peso.format(Math.round(save / 10) * 10));
      put('lb-size', size.toFixed(1) + ' kWp');
      put('lb-panels', String(panels));
      put('lb-cost', short(lo) + ' to ' + short(hi));
      put('lb-pay', payYear ? 'about ' + payYear + (payYear === 1 ? ' year' : ' years') : 'over 25 years');
      put('lb-total', short(cum));
      put('lb-co2', Math.round(size * LC.yield * 12 * 25 * (1 - .06) * LC.co2 / 1000) + ' t');
      $('#lb-notes').textContent = 'Illustrative only, not a quotation. Assumes ₱' + LC.rate + ' per kWh, ' + LC.yield + ' kWh per kWp a month, solar covering about ' + Math.round(LC.cover[type] * 100) +
        '% of use, 550 W panels, 0.5% panel ageing a year and no change in electricity prices' + (bat ? ', plus a ' + batKwh + ' kWh battery' : '') + '. A site assessment gives you real figures.';
    };
    lab.addEventListener('input', labCalc);
    lab.addEventListener('change', labCalc);
    lab.addEventListener('submit', function (e) { e.preventDefault(); });
    labCalc();
  }

  /* CONTACT: three steps, the sun charges two cells per step */
  var wz = $('#wizard');
  if (wz) {
    var step = 1, sets = $$('.wz', wz), suns = $$('.wizard__sun i', wz), back = $('#wz-back'), next = $('#wz-next');
    var err = function (input, msg) {
      var el = doc.getElementById(input.id + '-err'); if (el) el.textContent = msg || '';
      if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); return !msg;
    };
    var check = function (n) {
      if (n === 1) { var ok = !!wz.querySelector('[name=kind]:checked'); $('#kind-err').textContent = ok ? '' : 'Choose what you would like to power.'; return ok; }
      if (n === 2) {
        var a = err(wz.city, wz.city.value.trim().length > 1 ? '' : 'Enter your city or municipality.');
        var b = err(wz.bill, +wz.bill.value >= 500 ? '' : 'Enter a monthly bill of ₱500 or more.'); return a && b;
      }
      var c = err(wz.name, wz.name.value.trim().length > 1 ? '' : 'Enter your full name.');
      var d = err(wz.phone, /^(\+?63|0)9\d{9}$/.test(wz.phone.value.replace(/[\s-]/g, '')) ? '' : 'Enter a mobile number like 0917 123 4567.');
      var f = err(wz.email, !wz.email.value || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(wz.email.value) ? '' : 'Check the email address, or leave it blank.');
      return c && d && f;
    };
    var go2 = function (n, dir) {
      step = n;
      sets.forEach(function (s) { var on = +s.getAttribute('data-step') === n; s.hidden = !on; s.classList.toggle('is-back', on && dir < 0); });
      suns.forEach(function (s, k) { s.classList.toggle('is-on', k < (n - 1) * 3); });
      back.hidden = n === 1; next.textContent = n === 3 ? 'Send my request' : 'Next';
      $('#wz-count').textContent = 'Step ' + n + ' of 3';
      var first = sets[n - 1].querySelector('input:not([type=radio]),select'); if (first && dir) first.focus({ preventScroll: true });
    };
    wz.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!check(step)) { var bad = wz.querySelector('.wz:not([hidden]) [aria-invalid="true"]') || wz.querySelector('.wz:not([hidden]) input'); if (bad) bad.focus(); return; }
      if (step < 3) { go2(step + 1, 1); return; }
      /* prototype: no backend yet, the request is summarised on screen */
      suns.forEach(function (s) { s.classList.add('is-on'); });
      $('#wz-who').textContent = wz.name.value.trim().split(' ')[0];
      $('#wz-sum').textContent = 'We have your request for ' + wz.querySelector('[name=kind]:checked').value.toLowerCase() + ' in ' + wz.city.value.trim() + '. A specialist will reach you by ' + wz.querySelector('[name=via]:checked').value + ' to book your free site assessment.';
      wz.classList.add('is-done'); var done = $('#wz-done'); done.hidden = false; done.focus();
    });
    back.addEventListener('click', function () { go2(step - 1, -1); });
    wz.addEventListener('change', function (e) { if (e.target.name === 'kind') { $('#kind-err').textContent = ''; } });
    wz.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid')) err(e.target, ''); });
    go2(1, 0);
  }

  go(true);
})();

