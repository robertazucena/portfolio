/* ============ index.html ============ */
(function(){
  "use strict";
  if (!document.getElementById('atmosCanvas')) return; /* only run on index.html */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- PRELOADER ---------- */
  window.addEventListener('load', function(){
    setTimeout(function(){ document.getElementById('preloader').classList.add('hide'); }, 1500);
  });

  /* ---------- NAV SCROLL STATE ---------- */
  var nav = document.getElementById('siteNav');
  function onScrollNav(){
    if(window.scrollY > 40){ nav.classList.add('scrolled'); } else { nav.classList.remove('scrolled'); }
  }
  document.addEventListener('scroll', onScrollNav, {passive:true});
  onScrollNav();

  /* ---------- PARALLAX ---------- */
  if(!reduceMotion){
    var heroCanvasEl = document.getElementById('atmosCanvas');
    var heroTopEl = document.querySelector('.hero-top');
    var parallaxImgs = Array.prototype.slice.call(document.querySelectorAll('.parallax-img'));
    var vh = window.innerHeight;
    var pTicking = false;
    function updateParallax(){
      var y = window.scrollY;
      if(heroCanvasEl && y < vh * 1.4){ heroCanvasEl.style.transform = 'translateY(' + (y * 0.12) + 'px)'; }
      if(heroTopEl && y < vh * 1.4){ heroTopEl.style.transform = 'translateY(' + (y * -0.14) + 'px)'; }
      parallaxImgs.forEach(function(img){
        var rect = img.parentElement.getBoundingClientRect();
        if(rect.bottom < -200 || rect.top > vh + 200) return;
        var speed = parseFloat(img.getAttribute('data-parallax-speed')) || 0.15;
        var delta = (rect.top + rect.height / 2 - vh / 2) * speed;
        img.style.transform = 'translateY(' + delta + 'px)';
      });
      pTicking = false;
    }
    function onScrollParallax(){
      if(!pTicking){ requestAnimationFrame(updateParallax); pTicking = true; }
    }
    window.addEventListener('scroll', onScrollParallax, {passive:true});
    window.addEventListener('resize', function(){ vh = window.innerHeight; updateParallax(); }, {passive:true});
    updateParallax();
  }

  /* ---------- MOBILE MENU ---------- */
  var burger = document.getElementById('burgerBtn');
  var menu = document.getElementById('mobileMenu');
  document.getElementById('menuClose').addEventListener('click', function(){ menu.classList.remove('open'); });
  burger.addEventListener('click', function(){ menu.classList.add('open'); });
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(ev){
      if(a.id==='mobileCartLink'){ ev.preventDefault(); menu.classList.remove('open'); openCart(); }
      else { menu.classList.remove('open'); }
    });
  });

  /* ---------- REVEAL ON SCROLL ---------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); } });
  }, {threshold:0.2, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  /* ---------- AFTER TRAIL (signature motion, used sparingly) ---------- */
  var lagged = window.scrollY;
  var afterEls = [document.getElementById('afterWord')];
  afterEls.forEach(function(el){
    if(!el) return;
    var t = document.createElement('span');
    t.className = 'trail';
    t.textContent = el.textContent;
    t.setAttribute('aria-hidden','true');
    el.appendChild(t);
  });

  function raf(){
    var current = window.scrollY;
    lagged += (current - lagged) * 0.08;
    var diff = current - lagged;
    if(!reduceMotion){
      afterEls.forEach(function(el){
        if(!el) return;
        var trail = el.querySelector('.trail');
        if(!trail) return;
        var stretch = 1 + Math.min(Math.abs(diff)/40, 0.5);
        trail.style.transform = 'translateY(' + (diff*0.9) + 'px) scaleY(' + stretch + ')';
        trail.style.opacity = Math.min(Math.abs(diff)/70, 0.35);
      });
    }
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  /* ---------- ATMOSPHERE CANVAS (hero) ---------- */
  var canvas = document.getElementById('atmosCanvas');
  var ctx = canvas.getContext('2d');
  var W,H,dpr;
  function resize(){
    dpr = Math.min(window.devicePixelRatio||1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W*dpr; canvas.height = H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', resize);
  resize();

  var blobs = [
    {x:.25,y:.35,r:.34,c:'46,65,87',dx:.00012,dy:.00009,phase:0},
    {x:.72,y:.22,r:.28,c:'222,222,222',dx:-.00010,dy:.00013,phase:2},
    {x:.55,y:.68,r:.3,c:'46,65,87',dx:.00008,dy:-.00011,phase:4}
  ];
  var t0 = performance.now();
  function drawAtmos(now){
    var t = (now - t0)/1000;
    ctx.clearRect(0,0,W,H);
    blobs.forEach(function(b){
      var cx = (b.x + Math.sin(t*0.06+b.phase)*0.06) * W;
      var cy = (b.y + Math.cos(t*0.05+b.phase)*0.05) * H;
      var r = b.r * Math.max(W,H);
      var grad = ctx.createRadialGradient(cx,cy,0,cx,cy,r);
      grad.addColorStop(0,'rgba('+b.c+',0.10)');
      grad.addColorStop(1,'rgba('+b.c+',0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
    });
    if(!reduceMotion){ requestAnimationFrame(drawAtmos); }
  }
  requestAnimationFrame(drawAtmos);

  /* ---------- TEE VIEW TABS ---------- */
  var teeTabs = document.querySelectorAll('#teeTabs button');
  var teePhotoFront = document.getElementById('teePhotoFront');
  var teePhotoBack = document.getElementById('teePhotoBack');
  var teeCaption = document.getElementById('teeCaption');
  var teeCurrentView = 'front';
  var teeCurrentColor = 'black';
  var teePhotos = {
    black: { front: teePhotoFront.getAttribute('src'), back: teePhotoBack.getAttribute('src') },
    white: {
      front: 'assets/images/tee-white-front.png',
      back: 'assets/images/tee-white-back.png'
    }
  };
  function applyTeeColor(colorKey){
    teeCurrentColor = colorKey;
    var set = teePhotos[colorKey] || teePhotos.black;
    teePhotoFront.src = set.front;
    teePhotoBack.src = set.back;
  }
  var captions = {
    front:'Front — the mark, screen-printed once',
    back:'Back — the horizon mark, printed low',
    detail:'Detail — ink sits slightly raised on heavyweight cotton'
  };
  teeTabs.forEach(function(btn){
    btn.addEventListener('click', function(){
      teeTabs.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var view = btn.getAttribute('data-view');
      if(view === 'detail'){
        teePhotoFront.classList.toggle('zoomed', teeCurrentView === 'front');
        teePhotoBack.classList.toggle('zoomed', teeCurrentView === 'back');
      } else {
        teeCurrentView = view;
        teePhotoFront.classList.remove('zoomed');
        teePhotoBack.classList.remove('zoomed');
        teePhotoFront.classList.toggle('active', view === 'front');
        teePhotoBack.classList.toggle('active', view === 'back');
      }
      teeCaption.textContent = captions[view] || '';
    });
  });

  /* ---------- SIZE GUIDE TOGGLE ---------- */
  var sizeTable = document.getElementById('sizeTable');
  document.getElementById('sizeGuideBtn').addEventListener('click', function(){
    sizeTable.classList.toggle('show');
  });

  /* ---------- CHAPTERS DATA ---------- */
  var chapterMarkSVG = '<svg viewBox="0 0 180 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<g clip-path="url(#clip0_70_97)">' +
    '<mask id="mask0_70_97" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="130">' +
    '<path d="M180 0H0V130H180V0Z" fill="white"/>' +
    '</mask>' +
    '<g mask="url(#mask0_70_97)">' +
    '<path opacity="0.85" d="M180 78H0V79H180V78Z" fill="#585858"/>' +
    '<mask id="mask1_70_97" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="40" y="0" width="100" height="79">' +
    '<path d="M140 0H40V79H140V0Z" fill="white"/>' +
    '</mask>' +
    '<g mask="url(#mask1_70_97)">' +
    '<path opacity="0.9" d="M90 100C117.614 100 140 77.6142 140 50C140 22.3858 117.614 0 90 0C62.3858 0 40 22.3858 40 50C40 77.6142 62.3858 100 90 100Z" fill="#434343"/>' +
    '</g>' +
    '<path d="M90 76C110.987 76 128 58.9868 128 38C128 17.0132 110.987 0 90 0C69.0132 0 52 17.0132 52 38C52 58.9868 69.0132 76 90 76Z" fill="white"/>' +
    '<path opacity="0.7" d="M166 89H14V90H166V89Z" fill="#494949"/>' +
    '<path opacity="0.55" d="M154 100H26V101H154V100Z" fill="#515151"/>' +
    '<path opacity="0.4" d="M142 110H38V111H142V110Z" fill="#545454"/>' +
    '<path opacity="0.28" d="M128 119H52V120H128V119Z" fill="#525252"/>' +
    '<path opacity="0.16" d="M114 127H66V128H114V127Z" fill="#252525"/>' +
    '</g>' +
    '</g>' +
    '<defs>' +
    '<clipPath id="clip0_70_97"><rect width="180" height="130" fill="white"/></clipPath>' +
    '</defs>' +
  '</svg>';
  /* ------------------------------------------------------------
     Chapter archive data. To add a new chapter once it's ready:
       1. Duplicate chapter-01.html as chapter-0N.html and write it.
       2. Add an entry below with status:'available' and href pointing
          to that file (mark + sizes/total/price only apply if that
          chapter also has its own shirt).
       3. Move the placeholder 'sealed' entry for that number, or add
          a new one at the end for the next sealed chapter.
     ------------------------------------------------------------ */
  /* ---------- OWNERSHIP (persisted per-browser, drives archive thumbnails) ---------- */
  var OWNED_KEY = 'after_owned_chapters';
  function loadOwnedChapters(){
    var raw = localStorage.getItem(OWNED_KEY);
    if(!raw) return {};
    try { return JSON.parse(raw); } catch(e){ return {}; }
  }
  function markChapterOwned(chapterNumber, colorKey){
    var owned = loadOwnedChapters();
    owned[chapterNumber] = colorKey;
    localStorage.setItem(OWNED_KEY, JSON.stringify(owned));
  }

  var chapterData = [
    {
      number:'01', keyword:'The After.', teaser:'What remains once the noise is gone.', status:'available', mark:chapterMarkSVG,
      href:'chapter-01.html',
      sizes:[{s:'S',remain:37},{s:'M',remain:12},{s:'L',remain:42},{s:'XL',remain:18},{s:'XXL',remain:46}],
      total:50, price:'$68'
    },
    { number:'02', keyword:'Anchor', teaser:'The one before this. Not yet ready to be seen.', status:'sealed' },
    { number:'03', keyword:'Distance', teaser:'A place, maybe. Or a decision that felt like one.', status:'sealed' },
    { number:'04', keyword:'Return', teaser:'Still being written by someone who lived it.', status:'sealed' }
  ];

  var archiveGrid = document.getElementById('archiveGrid');
  function renderArchiveGrid(){
    var owned = loadOwnedChapters();
    archiveGrid.innerHTML = '';
    chapterData.forEach(function(ch, idx){
      var card = document.createElement('div');
      var delayClass = idx > 0 ? ' d' + Math.min(idx, 6) : '';
      card.className = 'chapter-card reveal' + delayClass + ' ' + (ch.status==='available' ? 'available' : 'locked');

      var ownedColor = owned[ch.number];
      var ownedBadge = '';
      var thumbHtml = '';
      if(ownedColor){
        var colorName = ownedColor === 'black' ? 'Black' : 'White';
        ownedBadge = '<span class="cowned-badge" data-owned-color="' + ownedColor + '"><span class="dot"></span>Owned — ' + colorName + '</span>';
        if(ch.number === '01' && typeof teePhotos !== 'undefined' && teePhotos[ownedColor]){
          thumbHtml = '<div class="cthumb show"><img src="' + teePhotos[ownedColor].front + '" alt="Your ' + colorName.toLowerCase() + ' The After. — Chapter 01 tee"></div>';
        }
      }

      card.innerHTML =
        '<div class="cheader"><div class="cnum">Chapter ' + ch.number + '</div>' + ownedBadge + '</div>' +
        '<div class="cbody">' +
          (thumbHtml || (ch.mark ? '<div class="cmark">' + ch.mark + '</div>' : '')) +
          '<div class="ctext">' +
            '<div class="ckeyword"' + (ch.status!=='available' ? ' aria-label="Chapter sealed"' : '') + '>' + ch.keyword + '</div>' +
            '<div class="cteaser">' + ch.teaser + '</div>' +
            '<div class="cstatus" style="margin-top:.6rem;">' + (ch.status==='available' ? 'Read the chapter →' : 'Sealed') + '</div>' +
          '</div>' +
        '</div>';
      if(ch.status==='available' && ch.href){
        card.addEventListener('click', function(){
          window.location.href = ch.href;
        });
      }
      archiveGrid.appendChild(card);
      io.observe(card);
    });
  }
  renderArchiveGrid();

  /* ---------- COLOR SELECTOR ---------- */
  var colorGrid = document.getElementById('colorGrid');
  var selectedColorLabel = document.getElementById('selectedColorLabel');
  var currentColor = null;
  var colorOptions = [{ key: 'black', label: 'Black' }, { key: 'white', label: 'White' }];

  colorOptions.forEach(function(c){
    var b = document.createElement('button');
    b.className = 'color-btn';
    b.setAttribute('data-color', c.key);
    b.innerHTML = '<span class="swatch"></span>' + c.label;
    b.addEventListener('click', function(){
      colorGrid.querySelectorAll('.color-btn').forEach(function(x){ x.classList.remove('selected'); });
      b.classList.add('selected');
      currentColor = c;
      selectedColorLabel.textContent = c.label;
      applyTeeColor(c.key);
      updateOwnBtnState();
    });
    colorGrid.appendChild(b);
  });

  /* ---------- SIZE SELECTOR / INVENTORY ---------- */
  var chapter01 = chapterData[0];
  var sizeGrid = document.getElementById('sizeGrid');
  var selectedSizeLabel = document.getElementById('selectedSizeLabel');
  var inventoryLine = document.getElementById('inventoryLine');
  var ownBtn = document.getElementById('ownBtn');
  var ownBtnLabel = ownBtn.querySelector('.btn-label');
  var ownBtnDefaultLabel = ownBtnLabel.textContent;
  var currentSize = null;

  function updateOwnBtnState(){
    ownBtn.disabled = !(currentSize && currentSize.remain > 0 && currentColor);
  }

  chapter01.sizes.forEach(function(sz){
    var b = document.createElement('button');
    b.className = 'size-btn';
    b.textContent = sz.s;
    b.disabled = sz.remain <= 0;
    b.addEventListener('click', function(){
      sizeGrid.querySelectorAll('.size-btn').forEach(function(x){ x.classList.remove('selected'); });
      b.classList.add('selected');
      currentSize = sz;
      selectedSizeLabel.textContent = sz.s;
      var pct = Math.round((sz.remain/chapter01.total)*100);
      inventoryLine.innerHTML = sz.remain + ' / ' + chapter01.total + ' remaining' +
        '<span class="inventory-bar"><i style="width:'+pct+'%"></i></span>';
      updateOwnBtnState();
    });
    sizeGrid.appendChild(b);
  });

  /* ---------- CART STATE (in-memory) ---------- */
  var cart = [];
  var cartCountEl = document.getElementById('cartCount');
  var cartItemsEl = document.getElementById('cartItems');
  var cartFootEl = document.getElementById('cartFoot');
  var cartItemCountEl = document.getElementById('cartItemCount');
  var addedNote = document.getElementById('addedNote');
  var cartOpenBtn = document.getElementById('cartOpenBtn');

  /* retriggerable CSS animation — removes the class, forces a reflow,
     then re-adds it, so the effect replays even on rapid repeat clicks */
  function retrigger(el, cls, duration){
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(function(){ el.classList.remove(cls); }, duration);
  }

  function renderCart(){
    cartCountEl.textContent = cart.length;
    cartItemCountEl.textContent = cart.length;
    if(cart.length===0){
      cartItemsEl.innerHTML = '<div class="cart-empty">Nothing owned yet.<br>The story is still just a story.</div>';
      cartFootEl.style.display = 'none';
      return;
    }
    cartFootEl.style.display = 'block';
    cartItemsEl.innerHTML = '';
    cart.forEach(function(item, idx){
      var row = document.createElement('div');
      row.className = 'cart-item';
      var thumbImg = (typeof teePhotos !== 'undefined' && teePhotos[item.colorKey]) ? teePhotos[item.colorKey].front : '';
      row.innerHTML =
        '<div class="thumb">' + (thumbImg ? '<img src="' + thumbImg + '" alt="' + item.color + ' The After. tee">' : '') + '</div>' +
        '<div class="ci-info">' +
          '<div class="t1">Chapter ' + item.chapter + ' — The After.</div>' +
          '<div class="t2">' + item.color + ' · Size ' + item.size + ' · ' + item.price + '</div>' +
        '</div>' +
        '<button class="remove" data-idx="'+idx+'">Remove</button>';
      cartItemsEl.appendChild(row);
    });
    cartItemsEl.querySelectorAll('.remove').forEach(function(btn){
      btn.addEventListener('click', function(){
        cart.splice(parseInt(btn.getAttribute('data-idx'),10),1);
        renderCart();
      });
    });
  }

  ownBtn.addEventListener('click', function(){
    if(!currentSize || currentSize.remain<=0 || !currentColor) return;
    cart.push({chapter:'01', size:currentSize.s, color:currentColor.label, colorKey:currentColor.key, price: chapter01.price});
    currentSize.remain -= 1;
    var pct = Math.round((currentSize.remain/chapter01.total)*100);
    inventoryLine.innerHTML = currentSize.remain + ' / ' + chapter01.total + ' remaining' +
      '<span class="inventory-bar"><i style="width:'+pct+'%"></i></span>';
    if(currentSize.remain<=0){
      sizeGrid.querySelectorAll('.size-btn').forEach(function(b){
        if(b.classList.contains('selected')){ b.disabled = true; b.classList.remove('selected'); }
      });
      currentSize = null;
    }
    updateOwnBtnState();
    renderCart();

    /* ---- "added to cart" feedback ---- */
    ownBtnLabel.textContent = 'Added ✓';
    retrigger(ownBtn, 'is-added', 550);
    retrigger(cartOpenBtn, 'just-added', 550);
    addedNote.classList.add('show');
    clearTimeout(addedNote._hideTimer);
    addedNote._hideTimer = setTimeout(function(){ addedNote.classList.remove('show'); }, 2200);
    setTimeout(function(){ ownBtnLabel.textContent = ownBtnDefaultLabel; }, 1400);

    /* ---- shop icon -> green check icon, reverts after 5s ---- */
    ownBtn.classList.add('icon-success');
    clearTimeout(ownBtn._iconTimer);
    ownBtn._iconTimer = setTimeout(function(){ ownBtn.classList.remove('icon-success'); }, 5000);
  });

  /* ---------- CART DRAWER OPEN/CLOSE ---------- */
  var overlay = document.getElementById('overlay');
  var drawer = document.getElementById('cartDrawer');
  function openCart(){ drawer.classList.add('open'); overlay.classList.add('show'); }
  function closeCart(){ drawer.classList.remove('open'); overlay.classList.remove('show'); }
  window.openCart = openCart;
  document.getElementById('cartOpenBtn').addEventListener('click', openCart);
  document.getElementById('footerCartLink2').addEventListener('click', function(ev){ ev.preventDefault(); openCart(); });
  document.getElementById('cartCloseBtn').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);

  /* ---------- CHECKOUT (writes a real order the admin panel reads) ---------- */
  var ORDERS_KEY = 'after_admin_orders';
  var EDITION_COUNTER_KEY = 'after_edition_counter';
  var ckError = document.getElementById('ckError');

  function nextEditionNumber(){
    var n = parseInt(localStorage.getItem(EDITION_COUNTER_KEY) || '0', 10) + 1;
    localStorage.setItem(EDITION_COUNTER_KEY, String(n));
    return n;
  }

  function loadStoredOrders(){
    var raw = localStorage.getItem(ORDERS_KEY);
    if(!raw) return [];
    try { return JSON.parse(raw); } catch(e){ return []; }
  }

  function nextOrderId(orders){
    var max = 1000;
    orders.forEach(function(o){
      var m = /AF-(\d+)/.exec(o.id || '');
      if(m) max = Math.max(max, parseInt(m[1], 10));
    });
    return 'AF-' + (max + 1);
  }

  document.getElementById('checkoutBtn').addEventListener('click', function(){
    if(cart.length === 0) return;

    var name = document.getElementById('ckName').value.trim();
    var email = document.getElementById('ckEmail').value.trim();
    var address = document.getElementById('ckAddress').value.trim();
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if(!name || !emailOk || !address){
      ckError.textContent = 'Please fill in your name, a valid email, and shipping address.';
      ckError.classList.add('show');
      return;
    }
    ckError.classList.remove('show');

    var orders = loadStoredOrders();
    var shippingFlat = 8;
    var newOrder = {
      id: nextOrderId(orders),
      customer: name,
      email: email,
      date: new Date().toISOString().slice(0,10),
      status: 'pending',
      items: cart.map(function(item){
        var num = nextEditionNumber();
        var numStr = (num < 10 ? '0' : '') + num;
        return {
          name: 'The After. — Tee',
          meta: 'Size ' + item.size + ' · Edition #' + numStr + '/50',
          price: parseFloat(String(item.price).replace(/[^0-9.]/g,''))
        };
      }),
      shipping: shippingFlat,
      address: address,
      notes: ''
    };
    orders.push(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    cart.forEach(function(item){
      markChapterOwned(item.chapter, item.colorKey);
    });
    renderArchiveGrid();

    cartItemsEl.innerHTML =
      '<div class="cart-confirm">' +
        '<div class="icon">✓</div>' +
        '<p>YOUR CHAPTER HAS BEEN CLAIMED.<br><br>Order ' + newOrder.id + ' confirmed.<br>A confirmation will follow at ' + email + '.</p>' +
      '</div>';
    cartFootEl.style.display = 'none';
    cart = [];
    cartCountEl.textContent = '0';
    document.getElementById('ckName').value = '';
    document.getElementById('ckEmail').value = '';
    document.getElementById('ckAddress').value = '';
  });

  /* ---------- FAQ ACCORDION ---------- */
  document.querySelectorAll('.faq-item').forEach(function(item){
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function(){
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(o){
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = null;
      });
      if(!isOpen){
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------- NEWSLETTER (placeholder) ---------- */
  var nlNote = document.getElementById('nlNote');
  document.getElementById('nlForm').addEventListener('submit', function(ev){
    ev.preventDefault();
    nlNote.classList.add('show');
    this.reset();
  });

})();



/* ============ about.html ============ */
(function(){
  if (!document.querySelector('.about-page-head')) return; /* only run on about.html */

  /* ---- Preloader ---- */
  window.addEventListener('load', function(){
    setTimeout(function(){ document.getElementById('preloader').classList.add('hide'); }, 1200);
  });

  /* ---- Nav scroll shrink ---- */
  var nav = document.getElementById('siteNav');
  function onScrollNav(){
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  document.addEventListener('scroll', onScrollNav, {passive:true});
  onScrollNav();

  /* ---- Mobile menu ---- */
  var menu = document.getElementById('mobileMenu');
  var burger = document.getElementById('burgerBtn');
  document.getElementById('menuClose').addEventListener('click', function(){ menu.classList.remove('open'); });
  burger.addEventListener('click', function(){ menu.classList.add('open'); });
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ menu.classList.remove('open'); });
  });

  /* ---- Reveal on scroll ---- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); } });
  }, {threshold:.15});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  /* ---- Cart drawer (display only — cart is per-session on the shop page) ---- */
  var drawer = document.getElementById('cartDrawer');
  var overlay = document.getElementById('overlay');
  function openCart(){ drawer.classList.add('open'); overlay.classList.add('show'); }
  function closeCart(){ drawer.classList.remove('open'); overlay.classList.remove('show'); }
  document.getElementById('cartOpenBtn').addEventListener('click', openCart);
  document.getElementById('footerCartLink2').addEventListener('click', function(ev){ ev.preventDefault(); openCart(); });
  document.getElementById('mobileCartLink').addEventListener('click', function(ev){ ev.preventDefault(); menu.classList.remove('open'); openCart(); });
  document.getElementById('cartCloseBtn').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);

})();



/* ============ chapter-01.html ============ */
(function(){
  if (!document.querySelector('.pg-cover')) return; /* only run on chapter-01.html */

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Preloader ---- */
  window.addEventListener('load', function(){
    setTimeout(function(){ document.getElementById('preloader').classList.add('hide'); }, 1500);
  });

  /* ---- Nav scroll shrink ---- */
  var nav = document.getElementById('siteNav');
  function onScrollNav(){
    if(window.scrollY > 40){ nav.classList.add('scrolled'); } else { nav.classList.remove('scrolled'); }
  }
  document.addEventListener('scroll', onScrollNav, {passive:true});
  onScrollNav();

  /* ---- Mobile menu ---- */
  var menu = document.getElementById('mobileMenu');
  var burger = document.getElementById('burgerBtn');
  document.getElementById('menuClose').addEventListener('click', function(){ menu.classList.remove('open'); });
  burger.addEventListener('click', function(){ menu.classList.add('open'); });
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ menu.classList.remove('open'); });
  });

  /* ---- Parallax (hero mark + videos) ---- */
  var parallaxImgs = document.querySelectorAll('.parallax-img');
  var vh = window.innerHeight;
  function updateParallax(){
    var sy = window.scrollY;
    parallaxImgs.forEach(function(img){
      var speed = parseFloat(img.getAttribute('data-parallax-speed')) || 0.15;
      var rect = img.getBoundingClientRect();
      var center = rect.top + rect.height/2 - vh/2;
      img.style.transform = 'translateY(' + (center * -speed) + 'px)';
    });
  }
  function onScrollParallax(){ if(!reduceMotion) requestAnimationFrame(updateParallax); }
  window.addEventListener('scroll', onScrollParallax, {passive:true});
  window.addEventListener('resize', function(){ vh = window.innerHeight; updateParallax(); }, {passive:true});
  updateParallax();

  /* ---- Reveal on scroll ---- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); } });
  }, {threshold:0.2, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  /* ---- Story progress dots ---- */
  var storyPages = document.querySelectorAll('.story-pg');
  var progressEl = document.getElementById('storyProgress');
  var dots = progressEl.querySelectorAll('.dot');
  var countEl = document.getElementById('storyCount');
  var storyEl = document.getElementById('story-start');
  var totalPages = storyPages.length;

  var pio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var idx = Array.prototype.indexOf.call(storyPages, e.target);
        dots.forEach(function(d,i){ d.classList.toggle('active', i===idx); });
        countEl.textContent = String(idx+1).padStart(2,'0') + '/' + String(totalPages).padStart(2,'0');
      }
    });
  }, {threshold:0.55});
  storyPages.forEach(function(p){ pio.observe(p); });

  new IntersectionObserver(function(entries){
    entries.forEach(function(e){ progressEl.classList.toggle('show', e.isIntersecting); });
  }, {threshold:0.02}).observe(storyEl);

  /* ---- Before -> Then word swap ---- */
  var wordBefore = document.getElementById('wordBefore');
  if(wordBefore){
    var swapped = false;
    var bt = document.querySelector('.pg-beforethen');
    if(bt){
      new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting && !swapped){
            swapped = true;
            setTimeout(function(){
              wordBefore.style.transition = 'opacity .8s ease, transform .8s ease';
              wordBefore.style.opacity = '0';
              wordBefore.style.transform = 'translate(-50%,calc(-50% - 12px))';
              setTimeout(function(){
                wordBefore.textContent = 'Then';
                wordBefore.style.opacity = '1';
                wordBefore.style.transform = 'translate(-50%,-50%)';
              }, 460);
            }, 850);
          }
        });
      }, {threshold:0.6}).observe(bt);
    }
  }

  /* ---- Cart drawer (display only — cart lives on the shop page) ---- */
  var drawer = document.getElementById('cartDrawer');
  var overlay = document.getElementById('overlay');
  function openCart(){ drawer.classList.add('open'); overlay.classList.add('show'); }
  function closeCart(){ drawer.classList.remove('open'); overlay.classList.remove('show'); }
  document.getElementById('cartOpenBtn').addEventListener('click', openCart);
  document.getElementById('footerCartLink2').addEventListener('click', function(ev){ ev.preventDefault(); openCart(); });
  document.getElementById('mobileCartLink').addEventListener('click', function(ev){ ev.preventDefault(); menu.classList.remove('open'); openCart(); });
  document.getElementById('cartCloseBtn').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);

})();



/* ============ admin.html ============ */
(function(){
  if (!document.getElementById('loginScreen')) return; /* only run on admin.html */

  /* ============================================================
     AUTH
     ============================================================ */
  const CREDENTIALS = { email: 'robertazucena@gmail.com', password: '123456' };
  const SESSION_KEY = 'after_admin_session';

  const loginScreen = document.getElementById('loginScreen');
  const app = document.getElementById('app');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');

  function showApp(){
    loginScreen.style.display = 'none';
    app.classList.add('active');
    renderAll();
  }

  function tryLogin(email, password){
    if(email.trim().toLowerCase() === CREDENTIALS.email && password === CREDENTIALS.password){
      localStorage.setItem(SESSION_KEY, '1');
      showApp();
    } else {
      loginError.classList.add('show');
    }
  }

  loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    loginError.classList.remove('show');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    tryLogin(email, password);
  });

  document.getElementById('logoutBtn').addEventListener('click', function(){
    localStorage.removeItem(SESSION_KEY);
    location.reload();
  });

  if(localStorage.getItem(SESSION_KEY) === '1'){
    showApp();
  }

  /* ============================================================
     SAMPLE / SEED DATA
     ============================================================ */
  const ORDERS_KEY = 'after_admin_orders';

  function seedOrders(){
    return [
      { id:'AF-1042', customer:'Maya Lindqvist', email:'maya.l@proton.me', date:'2026-08-29', status:'pending',
        items:[{name:'The After. — Tee', meta:'Size M · Edition #14/50', price:68}],
        shipping:8, address:'214 Alder St, Portland, OR 97209, US', notes:'' },
      { id:'AF-1041', customer:'Kenji Osei', email:'kenji.osei@gmail.com', date:'2026-08-29', status:'paid',
        items:[{name:'The After. — Tee', meta:'Size L · Edition #22/50', price:68}],
        shipping:12, address:'88 Camden High St, London NW1, UK', notes:'' },
      { id:'AF-1040', customer:'Ines Duarte', email:'ines.duarte@outlook.com', date:'2026-08-28', status:'shipped',
        items:[{name:'The After. — Tee', meta:'Size S · Edition #07/50', price:68}],
        shipping:8, address:'Rua das Flores 120, Porto 4050, PT', notes:'Requested no plastic packaging.' },
      { id:'AF-1039', customer:'Theo Marchetti', email:'theo.m@icloud.com', date:'2026-08-27', status:'delivered',
        items:[{name:'The After. — Tee', meta:'Size XL · Edition #31/50', price:68}],
        shipping:8, address:'Via dei Gracchi 45, Roma 00192, IT', notes:'' },
      { id:'AF-1038', customer:'Priya Nair', email:'priya.nair@gmail.com', date:'2026-08-27', status:'shipped',
        items:[{name:'The After. — Tee', meta:'Size M · Edition #03/50', price:68}],
        shipping:14, address:'42 MG Road, Bengaluru 560001, IN', notes:'' },
      { id:'AF-1037', customer:'Owen Fischer', email:'owen.fischer@yahoo.com', date:'2026-08-26', status:'cancelled',
        items:[{name:'The After. — Tee', meta:'Size L · Edition #19/50', price:68}],
        shipping:8, address:'900 Elm Ave, Austin, TX 78701, US', notes:'Customer requested cancellation — sizing.' },
      { id:'AF-1036', customer:'Saoirse Byrne', email:'saoirse.byrne@gmail.com', date:'2026-08-25', status:'delivered',
        items:[{name:'The After. — Tee', meta:'Size S · Edition #11/50', price:68}],
        shipping:8, address:'12 Grafton St, Dublin D02, IE', notes:'' },
      { id:'AF-1035', customer:'Noah Kessler', email:'noah.kessler@gmail.com', date:'2026-08-25', status:'paid',
        items:[{name:'The After. — Tee', meta:'Size M · Edition #26/50', price:68}],
        shipping:8, address:'77 Birch Ln, Denver, CO 80203, US', notes:'' },
      { id:'AF-1034', customer:'Aiko Tanaka', email:'aiko.tanaka@gmail.com', date:'2026-08-24', status:'delivered',
        items:[{name:'The After. — Tee', meta:'Size L · Edition #05/50', price:68}],
        shipping:16, address:'2-14 Sakura-cho, Shibuya, Tokyo, JP', notes:'' },
      { id:'AF-1033', customer:'Lucas Bergmann', email:'lucas.bergmann@web.de', date:'2026-08-23', status:'pending',
        items:[{name:'The After. — Tee', meta:'Size XL · Edition #38/50', price:68}],
        shipping:11, address:'Kastanienallee 9, Berlin 10435, DE', notes:'' }
    ];
  }

  function loadOrders(){
    const raw = localStorage.getItem(ORDERS_KEY);
    if(raw){
      try { return JSON.parse(raw); } catch(e){ /* fall through */ }
    }
    const seeded = seedOrders();
    saveOrders(seeded);
    return seeded;
  }

  function saveOrders(orders){
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }

  let orders = loadOrders();
  let activeOrderId = null;

  document.getElementById('resetDataBtn').addEventListener('click', function(){
    if(confirm('Reset all orders back to the sample data? This clears any edits you made.')){
      orders = seedOrders();
      saveOrders(orders);
      renderAll();
      showToast('Sample data restored');
    }
  });

  /* ============================================================
     HELPERS
     ============================================================ */
  const STATUS_LABEL = { pending:'Pending', paid:'Paid', shipped:'Shipped', delivered:'Delivered', cancelled:'Cancelled' };
  const STATUS_ORDER = ['pending','paid','shipped','delivered','cancelled'];

  function money(n){ return '$' + n.toFixed(2).replace(/\.00$/, ''); }
  function orderTotal(o){ return o.items.reduce((s,i)=>s+i.price,0) + o.shipping; }
  function fmtDate(d){
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' });
  }

  function showToast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(()=>t.classList.remove('show'), 2200);
  }

  /* ============================================================
     RENDER: STATS
     ============================================================ */
  function renderStats(){
    const total = orders.length;
    const pending = orders.filter(o=>o.status==='pending'||o.status==='paid').length;
    const shipped = orders.filter(o=>o.status==='shipped'||o.status==='delivered').length;
    const revenue = orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+orderTotal(o),0);

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statShipped').textContent = shipped;
    document.getElementById('statRevenue').textContent = money(revenue);
  }

  /* ============================================================
     RENDER: LIST (table + mobile cards)
     ============================================================ */
  function getFilteredSorted(){
    const q = document.getElementById('searchInput').value.trim().toLowerCase();
    const statusF = document.getElementById('statusFilter').value;
    const sortV = document.getElementById('sortSelect').value;

    let list = orders.filter(o=>{
      const matchesQ = !q ||
        o.customer.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q);
      const matchesStatus = statusF === 'all' || o.status === statusF;
      return matchesQ && matchesStatus;
    });

    list.sort((a,b)=>{
      if(sortV === 'date-desc') return new Date(b.date) - new Date(a.date);
      if(sortV === 'date-asc') return new Date(a.date) - new Date(b.date);
      if(sortV === 'total-desc') return orderTotal(b) - orderTotal(a);
      if(sortV === 'total-asc') return orderTotal(a) - orderTotal(b);
      return 0;
    });

    return list;
  }

  function renderList(){
    const list = getFilteredSorted();
    const tbody = document.getElementById('ordersTbody');
    const cards = document.getElementById('orderCards');
    const empty = document.getElementById('emptyState');

    tbody.innerHTML = '';
    cards.innerHTML = '';

    if(list.length === 0){
      empty.classList.remove('hidden');
    } else {
      empty.classList.add('hidden');
    }

    list.forEach(o=>{
      const itemSummary = o.items.map(i=>i.name).join(', ');
      const itemMeta = o.items.map(i=>i.meta).join(' · ');

      // table row
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td class="order-id">' + o.id + '</td>' +
        '<td>' + escapeHtml(o.customer) + '</td>' +
        '<td class="order-item-cell">' + escapeHtml(itemSummary) + '<div class="ed">' + escapeHtml(itemMeta) + '</div></td>' +
        '<td class="order-date">' + fmtDate(o.date) + '</td>' +
        '<td><span class="status-pill status-' + o.status + '">' + STATUS_LABEL[o.status] + '</span></td>' +
        '<td class="order-total">' + money(orderTotal(o)) + '</td>' +
        '<td><div class="row-actions"><button class="icon-btn" title="Open"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 6l6 6-6 6"/></svg></button></div></td>';
      tr.addEventListener('click', ()=>openDrawer(o.id));
      tbody.appendChild(tr);

      // mobile card
      const card = document.createElement('div');
      card.className = 'order-card';
      card.innerHTML =
        '<div class="order-card-top">' +
          '<span class="order-id">' + o.id + '</span>' +
          '<span class="status-pill status-' + o.status + '">' + STATUS_LABEL[o.status] + '</span>' +
        '</div>' +
        '<div class="order-card-cust">' + escapeHtml(o.customer) + '</div>' +
        '<div class="ed" style="font-family:var(--mono);font-size:.7rem;color:var(--ink-faint);">' + escapeHtml(itemMeta) + '</div>' +
        '<div class="order-card-meta">' +
          '<span class="order-date">' + fmtDate(o.date) + '</span>' +
          '<span class="order-total">' + money(orderTotal(o)) + '</span>' +
        '</div>';
      card.addEventListener('click', ()=>openDrawer(o.id));
      cards.appendChild(card);
    });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  ['searchInput'].forEach(id=>{
    document.getElementById(id).addEventListener('input', renderList);
  });
  ['statusFilter','sortSelect'].forEach(id=>{
    document.getElementById(id).addEventListener('change', renderList);
  });

  /* ============================================================
     DETAIL DRAWER
     ============================================================ */
  const drawer = document.getElementById('drawer');
  const drawerOverlay = document.getElementById('drawerOverlay');

  function openDrawer(orderId){
    activeOrderId = orderId;
    const o = orders.find(x=>x.id===orderId);
    if(!o) return;

    document.getElementById('drawerOid').textContent = o.id;
    document.getElementById('drawerCustomer').textContent = o.customer;
    document.getElementById('custEmail').textContent = o.email;
    document.getElementById('custDate').textContent = fmtDate(o.date);
    document.getElementById('custAddress').textContent = o.address;
    document.getElementById('orderNotes').value = o.notes || '';

    // status pills
    const statusRow = document.getElementById('statusRow');
    statusRow.innerHTML = '';
    STATUS_ORDER.forEach(s=>{
      const btn = document.createElement('button');
      btn.className = 'status-opt' + (s === o.status ? ' active' : '');
      btn.textContent = STATUS_LABEL[s];
      btn.type = 'button';
      btn.addEventListener('click', ()=>{
        o.status = s;
        Array.from(statusRow.children).forEach(c=>c.classList.remove('active'));
        btn.classList.add('active');
      });
      statusRow.appendChild(btn);
    });

    // items
    const itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = '';
    o.items.forEach(i=>{
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML =
        '<div class="item-thumb"></div>' +
        '<div class="item-info"><div class="t">' + escapeHtml(i.name) + '</div><div class="m">' + escapeHtml(i.meta) + '</div></div>' +
        '<div class="item-price">' + money(i.price) + '</div>';
      itemsList.appendChild(row);
    });

    const subtotal = o.items.reduce((s,i)=>s+i.price,0);
    document.getElementById('sumSubtotal').textContent = money(subtotal);
    document.getElementById('sumShipping').textContent = money(o.shipping);
    document.getElementById('sumTotal').textContent = money(subtotal + o.shipping);

    drawer.classList.add('show');
    drawerOverlay.classList.add('show');
  }

  function closeDrawer(){
    drawer.classList.remove('show');
    drawerOverlay.classList.remove('show');
    activeOrderId = null;
  }

  document.getElementById('drawerClose').addEventListener('click', closeDrawer);
  drawerOverlay.addEventListener('click', closeDrawer);

  document.getElementById('saveOrderBtn').addEventListener('click', function(){
    if(!activeOrderId) return;
    const o = orders.find(x=>x.id===activeOrderId);
    if(!o) return;
    o.notes = document.getElementById('orderNotes').value;
    saveOrders(orders);
    renderAll();
    closeDrawer();
    showToast('Order ' + o.id + ' updated');
  });

  document.getElementById('deleteOrderBtn').addEventListener('click', function(){
    if(!activeOrderId) return;
    if(!confirm('Delete this order? This can\'t be undone.')) return;
    orders = orders.filter(x=>x.id!==activeOrderId);
    saveOrders(orders);
    renderAll();
    closeDrawer();
    showToast('Order deleted');
  });

  /* ============================================================
     NEW ORDER (quick add)
     ============================================================ */
  document.getElementById('newOrderBtn').addEventListener('click', function(){
    const name = prompt('Customer name?');
    if(!name) return;
    const email = prompt('Customer email?') || '';
    const size = prompt('Size? (S / M / L / XL)', 'M') || 'M';
    const edition = prompt('Edition number? (e.g. 15)', String(Math.floor(Math.random()*50)+1));
    const nextNum = orders.reduce((max,o)=>{
      const n = parseInt(o.id.split('-')[1], 10);
      return n > max ? n : max;
    }, 1000) + 1;

    const newOrder = {
      id: 'AF-' + nextNum,
      customer: name,
      email: email,
      date: new Date().toISOString().slice(0,10),
      status: 'pending',
      items: [{ name:'The After. — Tee', meta:'Size ' + size.toUpperCase() + ' · Edition #' + edition + '/50', price:68 }],
      shipping: 8,
      address: 'Address not yet provided',
      notes: ''
    };
    orders.unshift(newOrder);
    saveOrders(orders);
    renderAll();
    showToast('Order ' + newOrder.id + ' created');
  });

  /* ============================================================
     MOBILE SIDEBAR
     ============================================================ */
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  document.getElementById('hamburgerBtn').addEventListener('click', function(){
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('show');
  });
  sidebarOverlay.addEventListener('click', function(){
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
  });

  /* ============================================================
     INIT
     ============================================================ */
  function renderAll(){
    renderStats();
    renderList();
    renderOverview();
    renderCustomers();
    renderStock();
  }

  /* ============================================================
     NAV / PAGE SWITCHING
     ============================================================ */
  const PAGE_TITLE = { orders:'Orders', overview:'Overview', customers:'Customers', stock:'Chapter 01 stock' };
  document.querySelectorAll('.nav-item[data-page]').forEach(function(item){
    item.addEventListener('click', function(){
      const page = item.getAttribute('data-page');
      document.querySelectorAll('.nav-item[data-page]').forEach(function(n){ n.classList.remove('active'); });
      item.classList.add('active');
      document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
      document.getElementById('page-' + page).classList.add('active');
      document.querySelector('.topbar h1').textContent = PAGE_TITLE[page];
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('show');
    });
  });

  /* ============================================================
     RENDER: OVERVIEW
     ============================================================ */
  function renderOverview(){
    // orders per day, last 10 distinct dates with activity
    const byDate = {};
    orders.forEach(function(o){ byDate[o.date] = (byDate[o.date]||0) + 1; });
    const dates = Object.keys(byDate).sort().slice(-10);
    const maxCt = Math.max.apply(null, dates.map(function(d){ return byDate[d]; }).concat([1]));
    const barsEl = document.getElementById('ovBars');
    barsEl.innerHTML = '';
    dates.forEach(function(d){
      const ct = byDate[d];
      const h = Math.max(6, Math.round((ct/maxCt)*110));
      const col = document.createElement('div');
      col.className = 'bar-col';
      const dt = new Date(d + 'T00:00:00');
      col.innerHTML = '<div class="bar-val">' + ct + '</div><div class="bar" style="height:' + h + 'px;"></div>' +
        '<div class="bar-label">' + dt.toLocaleDateString(undefined,{month:'short',day:'numeric'}) + '</div>';
      barsEl.appendChild(col);
    });

    // status breakdown
    const statusList = document.getElementById('ovStatusList');
    statusList.innerHTML = '';
    STATUS_ORDER.forEach(function(s){
      const ct = orders.filter(function(o){ return o.status===s; }).length;
      const pct = orders.length ? Math.round((ct/orders.length)*100) : 0;
      const row = document.createElement('div');
      row.className = 'size-row';
      row.innerHTML = '<span class="sz" style="width:76px;"><span class="status-pill status-'+s+'" style="padding:.2rem .5rem;">'+STATUS_LABEL[s]+'</span></span>' +
        '<div class="size-track"><div class="size-fill" style="width:'+pct+'%;"></div></div>' +
        '<span class="ct">'+ct+' · '+pct+'%</span>';
      statusList.appendChild(row);
    });

    // sizes sold (reuses stock size counts)
    document.getElementById('ovSizeList').innerHTML = sizeListHtml();
  }

  function getSizeCounts(){
    const counts = { S:0, M:0, L:0, XL:0 };
    orders.forEach(function(o){
      if(o.status === 'cancelled') return;
      o.items.forEach(function(i){
        const m = i.meta.match(/Size\s+(S|M|L|XL)/);
        if(m && counts.hasOwnProperty(m[1])) counts[m[1]]++;
      });
    });
    return counts;
  }

  function sizeListHtml(){
    const counts = getSizeCounts();
    const total = Object.values(counts).reduce(function(a,b){return a+b;},0) || 1;
    return Object.keys(counts).map(function(sz){
      const ct = counts[sz];
      const pct = Math.round((ct/total)*100);
      return '<div class="size-row"><span class="sz">'+sz+'</span>' +
        '<div class="size-track"><div class="size-fill" style="width:'+pct+'%;"></div></div>' +
        '<span class="ct">'+ct+' sold</span></div>';
    }).join('');
  }

  /* ============================================================
     RENDER: CUSTOMERS
     ============================================================ */
  function renderCustomers(){
    const map = {};
    orders.forEach(function(o){
      const key = o.email || o.customer;
      if(!map[key]) map[key] = { customer:o.customer, email:o.email, count:0, spent:0, last:o.date };
      map[key].count++;
      if(o.status !== 'cancelled') map[key].spent += orderTotal(o);
      if(new Date(o.date) > new Date(map[key].last)) map[key].last = o.date;
    });
    const list = Object.values(map).sort(function(a,b){ return b.spent - a.spent; });
    const tbody = document.getElementById('custTbody');
    tbody.innerHTML = '';
    if(list.length === 0){
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--ink-faint);">No customers yet</td></tr>';
      return;
    }
    list.forEach(function(c){
      const tr = document.createElement('tr');
      tr.className = 'cust-row';
      tr.innerHTML = '<td>' + escapeHtml(c.customer) + '</td>' +
        '<td>' + escapeHtml(c.email || '') + '</td>' +
        '<td>' + c.count + (c.count > 1 ? '' : ' <span class="na">(first order)</span>') + '</td>' +
        '<td class="order-total">' + money(c.spent) + '</td>' +
        '<td class="order-date">' + fmtDate(c.last) + '</td>';
      tr.addEventListener('click', function(){
        document.querySelector('.nav-item[data-page="orders"]').click();
        document.getElementById('searchInput').value = c.customer;
        renderList();
      });
      tbody.appendChild(tr);
    });
  }

  /* ============================================================
     RENDER: CHAPTER 01 STOCK
     ============================================================ */
  const TOTAL_EDITIONS = 50;

  function renderStock(){
    const sold = orders.filter(function(o){ return o.status !== 'cancelled'; }).length;
    const remaining = Math.max(0, TOTAL_EDITIONS - sold);
    const pctSold = Math.min(100, Math.round((sold/TOTAL_EDITIONS)*100));

    document.getElementById('stockRemaining').textContent = remaining;
    document.getElementById('stockBarFill').style.width = pctSold + '%';
    document.getElementById('stockNote').textContent = sold + ' of ' + TOTAL_EDITIONS + ' editions accounted for by non-cancelled orders (' + pctSold + '%).';

    document.getElementById('stockSizeList').innerHTML = sizeListHtml();

    // detect duplicate edition numbers
    const editionMap = {};
    orders.forEach(function(o){
      if(o.status === 'cancelled') return;
      o.items.forEach(function(i){
        const m = i.meta.match(/Edition #(\d+)\/50/);
        if(m){
          const num = m[1];
          if(!editionMap[num]) editionMap[num] = [];
          editionMap[num].push(o.id);
        }
      });
    });
    const dupes = Object.keys(editionMap).filter(function(n){ return editionMap[n].length > 1; });
    const noteEl = document.getElementById('stockEditionNote');
    if(dupes.length === 0){
      noteEl.textContent = 'No duplicate edition numbers found across current orders.';
    } else {
      noteEl.innerHTML = 'Duplicate edition numbers found: ' + dupes.map(function(n){
        return '#' + n + ' (' + editionMap[n].join(', ') + ')';
      }).join(' · ');
    }
  }

  const todayChip = document.getElementById('todayChip');
  todayChip.textContent = new Date().toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric', year:'numeric' });

})();
