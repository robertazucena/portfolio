/* ON Engineers: immersive layer. Loaded after script.js on every page.
   1. Home hero scope: an illustrative phase-resolved partial discharge (PRPD) plot.
   2. Interior page headers: a 50 Hz trace with discharge ticks along the bottom edge.
   3. Nav colour follows whichever dark band sits under it. */
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ORANGE = '245,140,30', TEAL = '31,174,142';

  function fit(cv){
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(cv.clientWidth * dpr);
    cv.height = Math.round(cv.clientHeight * dpr);
    return dpr;
  }
  function gauss(){ return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }
  /* run a draw loop only while the canvas is on screen and the tab is visible */
  function whenVisible(el, start, stop){
    var on = false, seen = false;
    function sync(){ var want = seen && !document.hidden; if(want && !on){ on = true; start(); } else if(!want && on){ on = false; stop(); } }
    new IntersectionObserver(function(e){ seen = e[0].isIntersecting; sync(); }).observe(el);
    document.addEventListener('visibilitychange', sync);
  }

  /* ---------- 1. PRPD scope ---------- */
  /* clusters: [phase centre (0-1 of the cycle), phase spread, min amp, max amp, polarity] */
  var TECH = {
    uhf:      { asset: '22kV GIS busbar',          rate: 5, clusters: [[.17,.07,.12,.42, 1],[.67,.07,.12,.42,-1]] },
    hfct:     { asset: '22kV XLPE cable',          rate: 4, clusters: [[.12,.1,.06,.3, 1],[.62,.1,.06,.3,-1],[.3,.05,.04,.12, 1]] },
    acoustic: { asset: 'Switchgear busbar chamber', rate: 3, clusters: [[.25,.11,.08,.3, 1],[.75,.11,.08,.3, 1]] },
    tev:      { asset: '22kV cable termination',   rate: 6, clusters: [[.2,.06,.2,.46, 1],[.7,.06,.2,.46,-1]], noise: .25 }
  };
  var scope = document.getElementById('oeScope');
  if(scope){
    var cv = scope.querySelector('.oe-prpd'), x = cv.getContext('2d');
    var countEl = scope.querySelector('[data-count]'), assetEl = scope.querySelector('[data-asset]');
    var tabs = scope.querySelectorAll('[data-tech]');
    var pts = [], count = 0, tech = TECH.uhf, raf = 0, dpr = fit(cv), start = 0;

    function emit(n, t){
      for(var i = 0; i < n; i++){
        var p, a;
        if(tech.noise && Math.random() < tech.noise){ p = Math.random(); a = (Math.random() - .5) * .1; }
        else {
          var c = tech.clusters[Math.floor(Math.random() * tech.clusters.length)];
          p = c[0] + gauss() * c[1];
          a = c[4] * (c[2] + Math.abs(gauss()) * (c[3] - c[2]));
        }
        pts.push({ p: (p + 1) % 1, a: a, t: t });
        count++;
      }
      if(pts.length > 1600) pts.splice(0, pts.length - 1600);
    }
    function draw(t){
      var W = cv.width, H = cv.height, m = H / 2;
      x.clearRect(0, 0, W, H);
      x.strokeStyle = 'rgba(255,255,255,.06)'; x.lineWidth = 1;
      for(var i = 1; i < 4; i++){ x.beginPath(); x.moveTo(W * i / 4, 0); x.lineTo(W * i / 4, H); x.stroke(); }
      x.beginPath(); x.moveTo(0, m); x.lineTo(W, m); x.stroke();
      x.strokeStyle = 'rgba(154,164,179,.55)'; x.lineWidth = 1.5 * dpr; x.beginPath();
      for(var k = 0; k <= W; k += 2){ var y = m - Math.sin(k / W * Math.PI * 2) * H * .36; if(k) x.lineTo(k, y); else x.moveTo(k, y); }
      x.stroke();
      var s = 2 * dpr;
      for(var j = 0; j < pts.length; j++){
        var q = pts[j], al = Math.max(.18, 1 - (t - q.t) / 9000);
        x.fillStyle = 'rgba(' + ORANGE + ',' + al.toFixed(2) + ')';
        x.fillRect(q.p * W, m - q.a * H, s, s);
      }
      if(!reduced){ x.fillStyle = 'rgba(' + TEAL + ',.9)'; x.fillRect(((t - start) / 2000 % 1) * W, 0, 1.5 * dpr, H); }
      countEl.textContent = count.toLocaleString('en-SG');
    }
    function loop(t){ emit(tech.rate, t); draw(t); raf = requestAnimationFrame(loop); }
    function prefill(){ var now = performance.now(); for(var i = 0; i < 220; i++) emit(tech.rate, now - (220 - i) * 16); draw(now); }

    cv.id = 'oePrpd';
    tabs.forEach(function(b, i){
      b.setAttribute('aria-controls', 'oePrpd');
      b.tabIndex = i ? -1 : 0;
      /* arrow keys move between techniques (WAI-ARIA tabs pattern) */
      b.addEventListener('keydown', function(e){
        var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if(!dir) return;
        e.preventDefault();
        var next = tabs[(i + dir + tabs.length) % tabs.length];
        next.focus(); next.click();
      });
      b.addEventListener('click', function(){
        tabs.forEach(function(o){ o.setAttribute('aria-selected', o === b ? 'true' : 'false'); o.tabIndex = o === b ? 0 : -1; });
        tech = TECH[b.getAttribute('data-tech')];
        assetEl.textContent = tech.asset;
        pts = []; count = 0;
        if(reduced) prefill();
      });
    });
    window.addEventListener('resize', function(){ dpr = fit(cv); if(reduced) draw(performance.now()); });
    if(reduced) prefill();
    else whenVisible(cv, function(){ start = start || performance.now(); raf = requestAnimationFrame(loop); }, function(){ cancelAnimationFrame(raf); });
  }

  /* ---------- 2. pagehead trace ---------- */
  document.querySelectorAll('.pagehead').forEach(function(head){
    var tc = document.createElement('canvas');
    tc.className = 'oe-trace'; tc.setAttribute('aria-hidden', 'true');
    head.appendChild(tc);
    var g = tc.getContext('2d'), d = fit(tc), raf = 0, ticks = [];
    function frame(t){
      var W = tc.width, H = tc.height, m = H * .55, amp = H * .26, per = W / 3.2, off = (t / 24) * d;
      g.clearRect(0, 0, W, H);
      g.strokeStyle = 'rgba(154,164,179,.35)'; g.lineWidth = 1.2 * d; g.beginPath();
      for(var i = 0; i <= W; i += 2){ var y = m - Math.sin((i + off) / per * Math.PI * 2) * amp; if(i) g.lineTo(i, y); else g.moveTo(i, y); }
      g.stroke();
      /* discharges ride the rising slopes, like the scope on Home */
      if(!reduced && Math.random() < .35){
        var cyc = Math.floor((W + off) / per) - Math.floor(Math.random() * 3);
        var ph = (Math.random() < .5 ? .1 : .6) + Math.random() * .12;
        ticks.push({ x: (cyc + ph) * per, h: (.25 + Math.random() * .7) * amp * (ph < .5 ? 1 : -1), t: t });
      }
      ticks = ticks.filter(function(k){ return t - k.t < 2400; });
      ticks.forEach(function(k){
        var px = k.x - off, al = 1 - (t - k.t) / 2400;
        var base = m - Math.sin((px + off) / per * Math.PI * 2) * amp;
        g.strokeStyle = 'rgba(' + ORANGE + ',' + (al * .85).toFixed(2) + ')'; g.lineWidth = 1.4 * d;
        g.beginPath(); g.moveTo(px, base); g.lineTo(px, base - k.h); g.stroke();
      });
    }
    function loop(t){ frame(t); raf = requestAnimationFrame(loop); }
    window.addEventListener('resize', function(){ d = fit(tc); if(reduced) frame(0); });
    if(reduced) frame(0);
    else whenVisible(tc, function(){ raf = requestAnimationFrame(loop); }, function(){ cancelAnimationFrame(raf); });
  });

  /* ---------- 3. nav over dark bands ---------- */
  var nav = document.querySelector('nav');
  var bands = document.querySelectorAll('.hero, .pagehead, .dark, footer');
  if(nav && bands.length){
    function navTone(){
      var y = nav.getBoundingClientRect().bottom - 8, dark = false;
      for(var i = 0; i < bands.length; i++){ var r = bands[i].getBoundingClientRect(); if(r.top <= y && r.bottom > y){ dark = true; break; } }
      nav.classList.toggle('on-dark', dark);
    }
    window.addEventListener('scroll', navTone, { passive: true });
    window.addEventListener('resize', navTone);
    navTone();
  }
})();
