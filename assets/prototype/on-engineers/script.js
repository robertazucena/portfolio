/* When framed (e.g. a portfolio preview whose frame is stretched to the full page height),
   size "screen-height" sections against a normal screen (16:10 desktop, 390x844 phone) instead of the stretched frame. */
(function(){
  var framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
  function setVh(){
    var w = window.innerWidth, h = framed ? Math.min(window.innerHeight, w < 760 ? w * 844 / 390 : w * 0.625) : window.innerHeight;
    document.documentElement.style.setProperty('--vh', (h / 100) + 'px');
  }
  setVh(); window.addEventListener('resize', setVh);
})();
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var firstVisit = !sessionStorage.getItem('oe_visited');

  /* ---------- preloader ---------- */
  var pl = document.getElementById('preloader');
  function finishPreload(){
    if(!pl) return;
    document.body.classList.add('pl-done');
    pl.style.transition = 'transform .75s var(--ease)';
    pl.style.transform = 'translateY(-100%)';
    setTimeout(function(){ pl.style.display='none'; runEntrance(); }, 780);
  }
  if(pl){
    if(!reduced){
      var count = pl.querySelector('.pl-count b');
      var bar = pl.querySelector('.pl-bar i');
      var n = 0;
      var t = setInterval(function(){
        n += Math.random()*20; /* fast, natural preloader speed */
        if(n >= 100){
          n = 100;
          clearInterval(t);
          setTimeout(finishPreload, 260);
        }
        if(count) count.textContent = Math.floor(n) + '%';
        if(bar) bar.style.width = n + '%';
      }, 110);
    } else {
      pl.style.display = 'none';
      document.body.classList.add('pl-done');
    }
  }

  /* ---------- hero / section entrance ---------- */
  function runEntrance(){
    document.querySelectorAll('.entrance').forEach(function(el, i){
      setTimeout(function(){ el.classList.add('in'); }, i*90);
    });
  }
  if(!pl || pl.style.display === 'none'){ runEntrance(); }

  /* ---------- page wipe transition ---------- */
  var wipe = document.getElementById('pagewipe');
  if(wipe){
    if(!firstVisit || sessionStorage.getItem('oe_wiping')){
      wipe.classList.add('enter');
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          wipe.classList.remove('enter');
          wipe.classList.add('leave');
        });
      });
      sessionStorage.removeItem('oe_wiping');
    }
    document.querySelectorAll('a[href$=".html"]').forEach(function(a){
      var href = a.getAttribute('href');
      if(!href || href.indexOf('http') === 0 || a.target === '_blank') return;
      a.addEventListener('click', function(e){
        e.preventDefault();
        sessionStorage.setItem('oe_visited','1');
        sessionStorage.setItem('oe_wiping','1');
        wipe.classList.remove('leave');
        wipe.classList.add('enter');
        setTimeout(function(){ window.location.href = href; }, 620);
      });
    });
  }

  /* ---------- custom cursor: diagnostic targeting reticle ---------- */
  var cur = document.getElementById('cur'), ring = document.getElementById('curring'), label = document.getElementById('curlabel');
  if(cur && ring && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    var mx=0,my=0,rx=0,ry=0;
    window.addEventListener('mousemove', function(e){
      mx=e.clientX; my=e.clientY;
      cur.style.left=mx+'px'; cur.style.top=my+'px';
      if(label){ label.style.left=mx+'px'; label.style.top=my+'px'; }
    });
    function loop(){ rx += (mx-rx)*0.24; ry += (my-ry)*0.24; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(loop); }
    loop();
    document.querySelectorAll('a,button,.xrow,.cf').forEach(function(el){
      el.addEventListener('mouseenter', function(){
        ring.classList.add('hovered');
        cur.classList.add('hovered');
        if(label){
          var txt = (el.textContent||'').trim().replace(/\s+/g,' ');
          if(txt.length > 28) txt = txt.slice(0,26)+'\u2026';
          label.textContent = txt ? ('\u2192 ' + txt.toUpperCase()) : 'READY TO TURN';
          label.classList.add('show');
        }
      });
      el.addEventListener('mouseleave', function(){
        ring.classList.remove('hovered');
        cur.classList.remove('hovered');
        if(label) label.classList.remove('show');
      });
      el.addEventListener('click', function(){
        ring.classList.remove('clank');
        void ring.offsetWidth; /* restart the animation on repeat clicks */
        ring.classList.add('clank');
        setTimeout(function(){ ring.classList.remove('clank'); }, 420);
      });
    });
  }

  /* ---------- mobile nav: hamburger + slide-in menu ---------- */
  var navburger = document.getElementById('navburger');
  var mobilemenu = document.getElementById('mobilemenu');
  if(navburger && mobilemenu){
    function closeMenu(){
      navburger.setAttribute('aria-expanded','false');
      mobilemenu.classList.remove('open');
      document.body.classList.remove('menu-open');
    }
    function toggleMenu(){
      var isOpen = mobilemenu.classList.toggle('open');
      navburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.classList.toggle('menu-open', isOpen);
    }
    navburger.addEventListener('click', toggleMenu);
    mobilemenu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', closeMenu);
    });
    window.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeMenu(); });
  }

  /* ---------- nav scroll state ---------- */
  var navEl = document.querySelector('nav');
  var darkzone = document.getElementById('darkzone');
  function onScroll(){
    if(!navEl) return;
    if(window.scrollY > 12) navEl.classList.add('scrolled'); else navEl.classList.remove('scrolled');
    if(darkzone){
      var r = darkzone.getBoundingClientRect();
      if(r.bottom > 130) navEl.classList.add('on-dark'); else navEl.classList.remove('on-dark');
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---------- hero content depth layer: main homepage hero only ---------- */
  var mainHero = document.querySelector('header.hero');
  var mainHeroContent = mainHero ? mainHero.querySelector('.hero-inner') : null;
  if(mainHero && mainHeroContent && !reduced){
    function updateHeroContent(){
      var rect = mainHero.getBoundingClientRect();
      if(rect.bottom < 0){ return; }
      var progress = Math.min(1, Math.max(0, -rect.top / rect.height));
      var shift = progress * 90;
      var fade = 1 - progress * 1.35;
      mainHeroContent.style.transform = 'translateY(' + shift.toFixed(1) + 'px)';
      mainHeroContent.style.opacity = Math.max(0, fade).toFixed(2);
    }
    window.addEventListener('scroll', updateHeroContent, {passive:true});
    updateHeroContent();
  }

  /* ---------- scroll reveals ---------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  }, {threshold:0.16});
  document.querySelectorAll('.reveal, .reveal-scale').forEach(function(el){ io.observe(el); });

  /* ---------- expertise row image peek ---------- */
  var peek = document.getElementById('xpeek');
  var xlist = document.querySelector('.xlist');
  if(peek && xlist && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    xlist.querySelectorAll('.xrow').forEach(function(row){
      row.addEventListener('mouseenter', function(){
        var src = row.getAttribute('data-img');
        if(src){ peek.querySelector('img').src = src; peek.classList.add('show'); }
      });
      row.addEventListener('mouseleave', function(){ peek.classList.remove('show'); });
    });
    xlist.addEventListener('mousemove', function(e){ peek.style.left = e.clientX + 'px'; peek.style.top = e.clientY + 'px'; });
  }

  /* ---------- case study chip filter ---------- */
  var caseGrid = document.querySelector('.case-grid');
  if(caseGrid){
    var caseChips = document.querySelectorAll('.chip-filter .cf');
    var caseCards = caseGrid.querySelectorAll('.case-card');
    caseChips.forEach(function(chip){
      chip.addEventListener('click', function(){
        caseChips.forEach(function(c){ c.classList.remove('active'); });
        chip.classList.add('active');
        var key = chip.getAttribute('data-filter') || 'all';
        caseCards.forEach(function(card){
          var show = key === 'all' || card.getAttribute('data-cat') === key;
          card.classList.toggle('hide', !show);
        });
      });
    });
  }

  /* ---------- ASA video gallery: click a technique, swap the video ---------- */
  var vgList = document.getElementById('vgList');
  if(vgList){
    var vgVideo = document.getElementById('vgVideo');
    var vgSource = document.getElementById('vgSource');
    vgList.querySelectorAll('.vg-row').forEach(function(row){
      row.addEventListener('click', function(){
        var src = row.getAttribute('data-video');
        if(!src || !vgVideo || !vgSource) return;
        vgList.querySelectorAll('.vg-row').forEach(function(r){ r.classList.remove('active'); });
        row.classList.add('active');
        if(vgSource.getAttribute('src') !== src){
          vgSource.setAttribute('src', src);
          vgVideo.load();
          vgVideo.play().catch(function(){});
        }
      });
    });
  }
})();

/* Photo fallback: if an image can't load (offline, blocked host), show a neutral placeholder instead of a broken icon */
(function () {
  var PH = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#EEF1F3"/><g fill="none" stroke="#B9C2C9" stroke-width="10" stroke-linejoin="round"><rect x="140" y="105" width="120" height="90" rx="12"/><path d="M150 185l35-38 28 26 20-18 27 30"/></g><circle cx="228" cy="132" r="9" fill="#B9C2C9"/></svg>');
  function swap(img) { if (img.dataset.ph) return; img.dataset.ph = "1"; img.src = PH; img.style.objectFit = "cover"; }
  document.addEventListener("error", function (e) { var t = e.target; if (t && t.tagName === "IMG") swap(t); }, true);
  function sweep() { Array.prototype.forEach.call(document.images, function (img) { if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) swap(img); }); }
  if (document.readyState === "complete") sweep(); else window.addEventListener("load", sweep);
})();
