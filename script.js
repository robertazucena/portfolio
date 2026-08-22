(function initPreloader(){
  var pctEl = document.getElementById('pl-pct');
  var fillEl = document.getElementById('pl-fill');
  var preloader = document.getElementById('preloader');

  var progress = 0;
  var pageLoaded = false;
  var minTimeElapsed = false;
  setTimeout(function(){ minTimeElapsed = true; }, 3000);
  window.addEventListener('load', function(){ pageLoaded = true; });

  function tickProgress(){
    var target = (pageLoaded && minTimeElapsed) ? 100 : 92;
    progress += (target - progress) * 0.08 + (progress < 92 ? 0.35 : 0);
    if (progress > target) progress = target;
    var shown = Math.min(100, Math.round(progress));
    pctEl.textContent = shown + '%';
    fillEl.style.width = shown + '%';

    if (progress >= 99.5){
      setTimeout(function(){
        preloader.classList.add('pl-exit');
        setTimeout(function(){ preloader.remove(); document.body.classList.remove('pl-loading'); document.dispatchEvent(new Event('preloader:done')); }, 640);
      }, 200);
      return;
    }
    requestAnimationFrame(tickProgress);
  }
  requestAnimationFrame(tickProgress);

  /* minimal wireframe polygon: rotates, then shifts to the next platonic solid */
  try{
    if(!window.THREE) throw new Error('three.js unavailable');

    var canvas = document.getElementById('pl-canvas');
    var size = 130;
    var renderer = new THREE.WebGLRenderer({canvas:canvas, alpha:true, antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(size, size, false);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 1, 500);
    camera.position.z = 140;

    /* same purple -> pink -> teal gradient as the .pl-fill progress bar, mapped across each vertex */
    var GRADIENT_STOPS = [[155,126,240],[240,130,196],[44,224,184]]; /* --purple, --pink, --teal */
    function gradientColor(t){
      t = Math.min(1, Math.max(0, t));
      var seg = t * (GRADIENT_STOPS.length - 1);
      var i = Math.min(GRADIENT_STOPS.length - 2, Math.floor(seg));
      var f = seg - i;
      var a = GRADIENT_STOPS[i], b = GRADIENT_STOPS[i + 1];
      return [
        (a[0] + (b[0] - a[0]) * f) / 255,
        (a[1] + (b[1] - a[1]) * f) / 255,
        (a[2] + (b[2] - a[2]) * f) / 255
      ];
    }
    var RADIUS = 43;
    var shapeDefs = [
      function(){ return new THREE.TetrahedronGeometry(RADIUS, 0); },
      function(){ return new THREE.OctahedronGeometry(RADIUS, 0); },
      function(){ return new THREE.IcosahedronGeometry(RADIUS, 0); },
      function(){ return new THREE.DodecahedronGeometry(RADIUS, 0); }
    ];

    function makeShape(idx){
      var geometry = new THREE.EdgesGeometry(shapeDefs[idx]());
      var pos = geometry.attributes.position;
      var colors = new Float32Array(pos.count * 3);
      for(var i = 0; i < pos.count; i++){
        var t = (pos.getX(i) + RADIUS) / (RADIUS * 2); /* left -> right, like the 90deg progress gradient */
        var c = gradientColor(t);
        colors[i*3] = c[0]; colors[i*3+1] = c[1]; colors[i*3+2] = c[2];
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      return new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({vertexColors:true, transparent:true, opacity:0.9, linewidth:2})
      );
    }

    var ptr = 0;
    var current = makeShape(ptr);
    scene.add(current);
    var next = null;
    var STAGE_MS = 1500, SHIFT_MS = 650;
    var stageStart = performance.now();
    var shifting = false, shiftStart = 0;

    function easeInOutCubic(t){ return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }

    var clock = new THREE.Clock();
    function animate(){
      if(!preloader.isConnected) return; // stop once the preloader is gone
      requestAnimationFrame(animate);
      var dt = clock.getDelta();
      var now = performance.now();

      current.rotation.x += dt * 0.4;
      current.rotation.y += dt * 0.6;
      if(next){ next.rotation.x += dt * 0.4; next.rotation.y += dt * 0.6; }

      if(!shifting && now - stageStart > STAGE_MS){
        shifting = true; shiftStart = now;
        ptr = (ptr + 1) % shapeDefs.length;
        next = makeShape(ptr);
        next.scale.setScalar(0.001);
        scene.add(next);
      }

      if(shifting){
        var p = Math.min(1, (now - shiftStart) / SHIFT_MS);
        var e = easeInOutCubic(p);
        current.scale.setScalar(1 - e);
        current.rotation.z += dt * 1.6;
        next.scale.setScalar(Math.max(0.001, e));
        next.rotation.z -= dt * 1.6;

        if(p >= 1){
          scene.remove(current);
          current.geometry.dispose(); current.material.dispose();
          current = next; next = null; shifting = false; stageStart = now;
        }
      }
      renderer.render(scene, camera);
    }
    animate();
  }catch(err){
    document.body.classList.add('pl-no-webgl');
  }
})();


/* ---------------- light / dark theme toggle ---------------- */
(function(){
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  if(!btn) return;
  btn.addEventListener('click', ()=>{
    const isLight = root.getAttribute('data-theme') === 'light';
    if(isLight){
      root.removeAttribute('data-theme');
      try{ localStorage.setItem('ra-theme','dark'); }catch(e){}
    } else {
      root.setAttribute('data-theme','light');
      try{ localStorage.setItem('ra-theme','light'); }catch(e){}
    }
  });
})();

/* ---------------- stars ---------------- */
(function(){
  const s = document.getElementById('stars');
  for(let i=0;i<70;i++){
    const el=document.createElement('span');
    el.style.left=Math.random()*100+'%';
    el.style.top=Math.random()*100+'%';
    el.style.animationDelay=(Math.random()*4)+'s';
    s.appendChild(el);
  }
})();

/* ---------------- clock ---------------- */
function updateClock(){
  const d=new Date();
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let h=d.getHours(); const m=d.getMinutes().toString().padStart(2,'0');
  const ap=h>=12?'PM':'AM'; h=h%12; if(h===0)h=12;
  document.getElementById('clock').textContent=`${days[d.getDay()]} ${h}:${m} ${ap}`;
}
updateClock(); setInterval(updateClock,15000);

/* ---------------- interactive terminal prompt ---------------- */
(function(){
  const win = document.getElementById('win-terminal');
  const body = win.querySelector('.winbody');
  const hiddenInput = document.getElementById('term-hidden-input');
  if(!win || !body || !hiddenInput) return;

  function focusInput(e){
    if(isMobile()) return;
    if(e) e.preventDefault();
    hiddenInput.focus();
  }
  win.addEventListener('pointerdown', focusInput);

  function escapeHtml(str){
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  const TERM_REPLIES = [
    'Awesome right? Almost working lol',
    "command not found, but I respect the confidence",
    "let me check with my manager... jk I don't have one",
    "404: skill issue not found",
    "still faster than my Figma load times",
    "sudo make me a sandwich — permission denied",
    "yeah I have no idea what that does either",
    "compiling... compiling... nah I'm just messing with you",
    "that's between you and the terminal gods now",
    "bold of you to assume this is a real shell"
  ];
  let replyIndex = 0;

  hiddenInput.addEventListener('input', ()=>{
    const typed = document.getElementById('term-typed');
    if(typed) typed.textContent = hiddenInput.value;
  });

  hiddenInput.addEventListener('keydown', e=>{
    if(e.key !== 'Enter') return;
    e.preventDefault();
    const inputLine = document.getElementById('term-input-line');
    const typedText = hiddenInput.value;
    if(inputLine){
      inputLine.removeAttribute('id');
      inputLine.innerHTML = `<span class="term-prompt">~ </span>${escapeHtml(typedText)}`;
    }

    const out = document.createElement('div');
    out.className = 'term-line term-out';
    out.textContent = TERM_REPLIES[replyIndex % TERM_REPLIES.length];
    replyIndex++;
    body.insertBefore(out, hiddenInput);

    const spacer = document.createElement('div');
    spacer.className = 'term-line';
    spacer.innerHTML = '&nbsp;';
    body.insertBefore(spacer, hiddenInput);

    const newLine = document.createElement('div');
    newLine.id = 'term-input-line';
    newLine.className = 'term-line';
    newLine.innerHTML = '<span class="term-prompt">~ </span><span id="term-typed"></span><span class="cursor"></span>';
    body.insertBefore(newLine, hiddenInput);

    hiddenInput.value = '';
    body.scrollTop = body.scrollHeight;
  });
})();

/* ---------------- terminal boot sequence: type effect after preloader finishes ---------------- */
(function(){
  const loginLine = document.getElementById('term-line-login');
  const cmd1 = document.getElementById('term-cmd-1');
  const cursor1 = document.getElementById('term-cursor-1');
  const out1 = document.getElementById('term-out-1');
  const cmd2 = document.getElementById('term-cmd-2');
  const cursor2 = document.getElementById('term-cursor-2');
  const out2 = document.getElementById('term-out-2');
  const inputLine = document.getElementById('term-input-line');
  if(!loginLine || !cmd1 || !cmd2 || !inputLine) return;

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let started = false;

  function typeInto(el, text, speed, cb){
    let i = 0;
    const interval = setInterval(()=>{
      i++;
      el.textContent = text.slice(0, i);
      if(i >= text.length){
        clearInterval(interval);
        if(cb) cb();
      }
    }, speed);
  }

  function fadeIn(el){
    el.style.transition = 'opacity .35s ease';
    requestAnimationFrame(()=>{ el.style.opacity = '1'; });
  }

  function showInstantly(){
    loginLine.style.opacity = '1';
    cmd1.textContent = 'whoami';
    out1.style.opacity = '1';
    cmd2.textContent = 'cat skills.json';
    out2.style.opacity = '1';
    inputLine.style.opacity = '1';
  }

  function runBoot(){
    if(started) return;
    started = true;

    if(reduceMotion){
      showInstantly();
      return;
    }

    fadeIn(loginLine);

    setTimeout(()=>{
      cursor1.style.display = 'inline-block';
      typeInto(cmd1, 'whoami', 70, ()=>{
        cursor1.style.display = 'none';
        setTimeout(()=>{
          fadeIn(out1);
          setTimeout(()=>{
            cursor2.style.display = 'inline-block';
            typeInto(cmd2, 'cat skills.json', 55, ()=>{
              cursor2.style.display = 'none';
              setTimeout(()=>{
                fadeIn(out2);
                setTimeout(()=>{
                  fadeIn(inputLine);
                }, 400);
              }, 300);
            });
          }, 500);
        }, 300);
      });
    }, 500);
  }

  if(!document.body.classList.contains('pl-loading')) runBoot();
  document.addEventListener('preloader:done', runBoot, {once:true});
})();

/* ---------------- sticky-note signature: type on when visible ---------------- */
(function(){
  const link = document.getElementById('sig-link');
  const textEl = document.getElementById('sig-text');
  if(!link || !textEl) return;
  const fullText = link.dataset.text || '';
  textEl.textContent = '';
  let started = false;
  let preloaderDone = !document.body.classList.contains('pl-loading');
  let inView = false;

  function typeText(){
    if(started) return;
    started = true;
    let i = 0;
    const interval = setInterval(()=>{
      i++;
      textEl.textContent = fullText.slice(0, i);
      if(i >= fullText.length) clearInterval(interval);
    }, 85);
  }

  function maybeType(){
    if(preloaderDone && inView) typeText();
  }

  document.addEventListener('preloader:done', function(){
    preloaderDone = true;
    maybeType();
  }, {once:true});

  if('IntersectionObserver' in window){
    const observer = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          inView = true;
          maybeType();
          observer.unobserve(link);
        }
      });
    }, {threshold:0.4});
    observer.observe(link);
  } else {
    inView = true;
    maybeType();
  }

  /* fallback: some mobile browsers don't reliably re-fire IntersectionObserver
     during programmatic/static-flow layout shifts, so also check geometry directly */
  function checkVisibleFallback(){
    if(started) return;
    const r = link.getBoundingClientRect();
    if(r.bottom > 0 && r.top < window.innerHeight){
      inView = true;
      maybeType();
    }
  }
  window.addEventListener('scroll', checkVisibleFallback, {passive:true});
  window.addEventListener('resize', checkVisibleFallback);
  checkVisibleFallback();
})();

/* ---------------- Email Me: sends straight to robertazucena@gmail.com via EmailJS ----------------
   No backend server is involved — EmailJS is a client-side email delivery service.
   To make this live, create a free account at emailjs.com, connect a Gmail service,
   build a template with {{from_name}}, {{from_email}}, {{message}} merge fields, and
   paste your Public Key / Service ID / Template ID into the three constants below. */
(function(){
try{
  const EMAILJS_PUBLIC_KEY = 'e8eHhNt4Pwx3vfdaI';
  const EMAILJS_SERVICE_ID = 'service_t2fioya';
  const EMAILJS_TEMPLATE_ID = 'template_gvo2cen';

  const form = document.getElementById('mail-form');
  const status = document.getElementById('mail-status');
  const submitBtn = document.getElementById('mail-submit');
  const successPanel = document.getElementById('mail-success');
  const successText = document.getElementById('mail-success-text');
  const resetBtn = document.getElementById('mail-reset');
  if(!form || !status || !submitBtn) return;

  function showSuccess(message){
    if(!successPanel) return;
    if(successText) successText.textContent = message;
    successPanel.classList.add('show');
  }
  function hideSuccess(){
    if(!successPanel) return;
    successPanel.classList.remove('show');
  }
  window.hideMailSuccess = hideSuccess;

  if(resetBtn){
    resetBtn.addEventListener('click', ()=>{
      hideSuccess();
      form.reset();
      fields.forEach(clearFieldError);
      status.classList.remove('show','visible','success','error');
    });
  }

  if(window.emailjs){
    try{ window.emailjs.init({publicKey: EMAILJS_PUBLIC_KEY}); }catch(initErr){ console.error('EmailJS init failed', initErr); }
  }

  const fields = [
    {
      input: document.getElementById('mail-name'),
      errorEl: document.getElementById('mail-name-error'),
      validate(v){ return v ? '' : 'Please enter your full name.'; }
    },
    {
      input: document.getElementById('mail-email'),
      errorEl: document.getElementById('mail-email-error'),
      validate(v, input){
        if(!v) return 'Please enter your email.';
        if(!input.checkValidity()) return 'Please enter a valid email address.';
        return '';
      }
    },
    {
      input: document.getElementById('mail-message'),
      errorEl: document.getElementById('mail-message-error'),
      validate(v){ return v ? '' : 'Please enter a message.'; }
    }
  ];

  const winMail = document.getElementById('win-mail');
  const winMailBody = winMail ? winMail.querySelector('.winbody') : null;
  const winMailTitlebar = winMail ? winMail.querySelector('.titlebar') : null;

  function syncMailWindowHeight(){
    if(!winMail || !winMailBody || !winMailTitlebar) return;
    const prevFlex = winMailBody.style.flex;
    const prevHeight = winMailBody.style.height;
    winMailBody.style.flex = 'none';
    winMailBody.style.height = 'auto';
    const natural = winMailBody.scrollHeight;
    winMailBody.style.flex = prevFlex;
    winMailBody.style.height = prevHeight;

    const target = Math.round(natural + winMailTitlebar.getBoundingClientRect().height + 4);
    const current = Math.round(winMail.getBoundingClientRect().height);
    if(Math.abs(target - current) < 4) return;

    winMail.classList.add('animating');
    winMail.style.height = target + 'px';
    setTimeout(()=>winMail.classList.remove('animating'), 420);
  }
  window.syncMailWindowHeight = syncMailWindowHeight;

  function showFieldError(field, message){
    const wrap = field.input.closest('.mail-field');
    field.errorEl.textContent = message;
    field.errorEl.classList.add('show');
    wrap.classList.add('invalid');
  }

  function clearFieldError(field){
    const wrap = field.input.closest('.mail-field');
    field.errorEl.classList.remove('show');
    field.errorEl.textContent = '';
    wrap.classList.remove('invalid');
  }

  function validateFieldNow(field){
    const message = field.validate(field.input.value.trim(), field.input);
    if(message){ showFieldError(field, message); return false; }
    clearFieldError(field);
    return true;
  }

  function validateFieldNow(field){
    const message = field.validate(field.input.value.trim(), field.input);
    if(message){ showFieldError(field, message); }
    else{ clearFieldError(field); }
    syncMailWindowHeight();
    return !message;
  }

  function showStatus(kind, message){
    status.textContent = message;
    status.classList.remove('success','error','visible');
    status.classList.add('show', kind);
    syncMailWindowHeight();
    // let the window grow first, then fade the message in on the next frame
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        status.classList.add('visible');
        status.scrollIntoView({block:'nearest', behavior:'smooth'});
      });
    });
  }

  fields.forEach(field=>{
    field.input.addEventListener('input', ()=>{
      if(field.input.closest('.mail-field').classList.contains('invalid')){
        validateFieldNow(field);
      }
    });
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    e.stopPropagation();
    status.classList.remove('show','visible','success','error');

    let allValid = true;
    let firstInvalidField = null;
    fields.forEach(field=>{
      const ok = validateFieldNow(field);
      if(!ok){
        allValid = false;
        if(!firstInvalidField) firstInvalidField = field;
      }
    });
    if(!allValid){
      if(firstInvalidField){
        firstInvalidField.errorEl.scrollIntoView({block:'nearest', behavior:'smooth'});
      }
      return;
    }

    const fullname = form.elements['fullname'].value.trim();
    const email = form.elements['email'].value.trim();
    const message = form.elements['message'].value.trim();

    if(!window.emailjs){
      showStatus('error', "Sorry, the message service didn't load. Please email me directly at robertazucena@gmail.com.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name: fullname,
      from_email: email,
      message: message
    }).then(function(){
      form.reset();
      fields.forEach(clearFieldError);
      status.classList.remove('show','visible','success','error');
      showSuccess(`Thank you, ${fullname}! Your message has been sent — I'll get back to you soon.`);
    }).catch(function(err){
      console.error('EmailJS send failed', err);
      showStatus('error', "Something went wrong sending your message. Please email me directly at robertazucena@gmail.com.");
    }).finally(function(){
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    });
  });
}catch(err){
  console.error('mail form init failed', err);
}
})();
(function(){
  const hint = document.getElementById('hint');
  const dock = document.getElementById('dock');
  const menubar = document.getElementById('menubar');
  if(!hint) return;
  const hide = ()=> hint.classList.add('hint-hide');
  if(dock) dock.addEventListener('mouseenter', hide);
  if(menubar) menubar.addEventListener('mouseenter', hide);
})();

/* ---------------- windows: show + drag + focus ---------------- */
const isMobile = () => window.innerWidth <= 760;
let zTop = 10;

function focusWin(win){
  zTop++;
  if(win.id === 'win-mail'){
    const backdrop = document.getElementById('mail-backdrop');
    if(backdrop && backdrop.classList.contains('show')){
      win.style.zIndex = 2001;
      return;
    }
  }
  win.style.zIndex = zTop;
}

/* keeps the Email Me window anchored just above its dock icon, whether it's
   being opened fresh, restored from the dock, or snapped back via Reset */
function positionMailNearDock(){
  const w = document.getElementById('win-mail');
  const d = document.querySelector('.dockitem[data-dock="mail"]');
  if(!w || !d || isMobile()) return;
  const desktopRect = document.getElementById('desktop').getBoundingClientRect();
  const iconRect = d.getBoundingClientRect();
  const winWidth = w.offsetWidth || 360;
  const iconCenterX = iconRect.left + iconRect.width / 2 - desktopRect.left;
  const margin = 16;
  let left = iconCenterX - winWidth / 2;
  left = Math.max(margin, Math.min(left, desktopRect.width - winWidth - margin));
  w.style.left = Math.round(left) + 'px';
  w.style.bottom = '130px';
  w.style.top = 'auto';
}

function makeDraggable(win){
  const handle = win.querySelector('[data-drag]');
  if(!handle) return;
  let sx,sy,ox,oy,dragging=false,moved=false;
  handle.addEventListener('pointerdown', e=>{
    if(isMobile() || e.target.closest('[data-close], [data-maximize], [data-minimize]')) return;
    if(win.dataset.maximized==='true') win.dataset.maximized='false';
    dragging=true;
    moved=false;
    sx=e.clientX; sy=e.clientY;
    const r=win.getBoundingClientRect();
    ox=r.left; oy=r.top;
    focusWin(win);
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointermove', e=>{
    if(!dragging) return;
    moved = true;
    const nx = ox + (e.clientX - sx);
    const ny = Math.max(30, oy + (e.clientY - sy));
    win.style.left = nx+'px';
    win.style.top = ny+'px';
    win.style.right='auto';
  });
  ['pointerup','pointercancel'].forEach(ev=>handle.addEventListener(ev,()=>{
    dragging=false;
    if(moved) refreshResetButtonState();
  }));
}

/* corner grip: drag to resize a window, macOS-style. Sizes captured here are
   what "Reset Windows" restores, same as position. */
function makeResizable(win){
  const handle = document.createElement('div');
  handle.className = 'win-resize-handle';
  handle.setAttribute('aria-hidden', 'true');
  win.appendChild(handle);

  const MIN_W = 260, MIN_H = 160;
  let sx, sy, ow, oh, resizing = false, resized = false;

  handle.addEventListener('pointerdown', e=>{
    if(isMobile() || win.dataset.maximized==='true') return;
    resizing = true;
    resized = false;
    sx = e.clientX; sy = e.clientY;
    const r = win.getBoundingClientRect();
    ow = r.width; oh = r.height;
    focusWin(win);
    handle.setPointerCapture(e.pointerId);
    e.stopPropagation();
  });
  handle.addEventListener('pointermove', e=>{
    if(!resizing) return;
    resized = true;
    const nw = Math.max(MIN_W, ow + (e.clientX - sx));
    const nh = Math.max(MIN_H, oh + (e.clientY - sy));
    win.style.width = nw + 'px';
    win.style.height = nh + 'px';
    win.style.right = 'auto';
  });
  ['pointerup','pointercancel'].forEach(ev=>handle.addEventListener(ev,()=>{
    if(!resizing) return;
    resizing = false;
    if(resized) refreshResetButtonState();
  }));
}

/* green dot: expand the window to fill the desktop, click again to restore */
function toggleMaximize(win){
  if(isMobile()) return;
  win.classList.add('animating');
  win.addEventListener('transitionend', function handler(e){
    if(e.propertyName==='width'){
      win.classList.remove('animating');
      win.removeEventListener('transitionend', handler);
    }
  });

  if(win.dataset.maximized==='true'){
    win.style.left = win.dataset.prevLeft;
    win.style.top = win.dataset.prevTop;
    win.style.width = win.dataset.prevWidth;
    win.style.height = win.dataset.prevHeight;
    win.dataset.maximized = 'false';
  } else {
    const r = win.getBoundingClientRect();
    win.dataset.prevLeft = win.style.left || (r.left+'px');
    win.dataset.prevTop = win.style.top || (r.top+'px');
    win.dataset.prevWidth = win.style.width || (r.width+'px');
    win.dataset.prevHeight = win.style.height || (r.height+'px');

    /* maximize caps out at 1140px and stays centered instead of filling the whole desktop */
    const desktopEl = document.getElementById('desktop');
    const desktopWidth = desktopEl ? desktopEl.clientWidth : window.innerWidth;
    const margin = 18;
    const maxWidth = 1140;
    const targetWidth = Math.min(maxWidth, desktopWidth - margin*2);
    const left = Math.max(margin, (desktopWidth - targetWidth) / 2);

    win.style.left = Math.round(left) + 'px';
    win.style.top = '42px';
    win.style.width = Math.round(targetWidth) + 'px';
    win.style.height = 'calc(100vh - 100px)';
    win.dataset.maximized = 'true';
  }
  if(win.id !== 'win-mail') refreshResetButtonState();
  focusWin(win);
}

/* red dot: close the window (animates out, can be reopened from the dock) */
function closeWin(win){
  if(win.classList.contains('hidden-win')) return;
  if(win.dataset.maximized==='true'){
    win.style.left = win.dataset.prevLeft;
    win.style.top = win.dataset.prevTop;
    win.style.width = win.dataset.prevWidth;
    win.style.height = win.dataset.prevHeight;
    win.dataset.maximized = 'false';
  }
  win.classList.add('closing');
  win.classList.remove('show');
  win.addEventListener('transitionend', function handler(e){
    if(e.propertyName==='opacity'){
      win.classList.add('hidden-win');
      win.classList.remove('closing');
      win.removeEventListener('transitionend', handler);
      if(win.id !== 'win-mail') refreshResetButtonState();
    }
  });
}

function openWin(win){
  win.classList.remove('hidden-win','closing');
  requestAnimationFrame(()=>win.classList.add('show'));
  focusWin(win);
  if(win.id !== 'win-mail') refreshResetButtonState();
}

/* yellow dot: genie-minimize into the dock, same idea as macOS — click the dock
   thumbnail to bring the window back out */
const MINIMIZE_META = {
  'win-terminal': {icon:'💻', label:'Terminal'},
  'win-about': {icon:'📁', label:'Finder'},
  'win-autonomous': {icon:'🗄️', label:'Oracle AD'},
  'win-grab': {icon:'🚗', label:'Grab'},
  'win-sticky': {icon:'📝', label:'Sticky Note'},
  'win-mail': {icon:'✉️', label:'New Message'}
};
const dockEl = document.getElementById('dock');
const minimizedThumbs = {};

function ensureDockSep(){
  let sep = dockEl.querySelector('.dock-sep');
  if(!sep){
    sep = document.createElement('div');
    sep.className = 'dock-sep';
    dockEl.appendChild(sep);
  }
  return sep;
}
function removeDockSepIfEmpty(){
  if(!dockEl.querySelector('.dock-min-item')){
    const sep = dockEl.querySelector('.dock-sep');
    if(sep) sep.remove();
  }
}
function getDockThumb(win){
  if(minimizedThumbs[win.id]) return minimizedThumbs[win.id];
  const meta = MINIMIZE_META[win.id] || {icon:'🗔', label:win.id};
  ensureDockSep();
  const thumb = document.createElement('div');
  thumb.className = 'dock-min-item';
  thumb.innerHTML = `${meta.icon}<span class="dock-tip">${meta.label}</span>`;
  thumb.addEventListener('click', ()=>restoreWin(win));
  dockEl.appendChild(thumb);
  minimizedThumbs[win.id] = thumb;
  return thumb;
}

function minimizeWin(win){
  if(isMobile() || win.classList.contains('hidden-win') || win.classList.contains('minimizing')) return;
  const thumb = getDockThumb(win);
  const winRect = win.getBoundingClientRect();

  win.style.transformOrigin = 'center center';
  win.classList.add('minimizing');
  requestAnimationFrame(()=>{
    const thumbRect = thumb.getBoundingClientRect();
    const dx = (thumbRect.left + thumbRect.width/2) - (winRect.left + winRect.width/2);
    const dy = (thumbRect.top + thumbRect.height/2) - (winRect.top + winRect.height/2);
    const sx = Math.max(0.04, thumbRect.width / winRect.width);
    const sy = Math.max(0.04, thumbRect.height / winRect.height);
    win.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    win.style.opacity = '0';
  });

  win.addEventListener('transitionend', function handler(e){
    if(e.propertyName !== 'transform') return;
    win.removeEventListener('transitionend', handler);
    win.classList.remove('minimizing','show');
    win.classList.add('hidden-win');
    win.style.transform = '';
    win.style.opacity = '';
    win.style.transformOrigin = '';
    requestAnimationFrame(()=>thumb.classList.add('visible'));
    if(win.id !== 'win-mail') refreshResetButtonState();
  });
}

function restoreWin(win){
  const thumb = minimizedThumbs[win.id];
  if(!thumb || !win.classList.contains('hidden-win')) return;
  thumb.classList.remove('visible');

  if(win.id === 'win-mail'){
    const backdrop = document.getElementById('mail-backdrop');
    if(backdrop) backdrop.classList.add('show');
  }

  win.classList.remove('hidden-win');
  win.classList.add('show');
  focusWin(win);
  if(win.id !== 'win-mail') refreshResetButtonState();

  const winRect = win.getBoundingClientRect();
  const thumbRect = thumb.getBoundingClientRect();
  const dx = (thumbRect.left + thumbRect.width/2) - (winRect.left + winRect.width/2);
  const dy = (thumbRect.top + thumbRect.height/2) - (winRect.top + winRect.height/2);
  const sx = Math.max(0.04, thumbRect.width / winRect.width);
  const sy = Math.max(0.04, thumbRect.height / winRect.height);

  win.style.transformOrigin = 'center center';
  win.style.transition = 'none';
  win.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
  win.style.opacity = '0';
  void win.offsetWidth; /* force reflow so the transition below actually animates */
  win.classList.add('minimizing');
  requestAnimationFrame(()=>{
    win.style.transition = '';
    win.style.transform = '';
    win.style.opacity = '';
  });

  win.addEventListener('transitionend', function handler(e){
    if(e.propertyName !== 'transform') return;
    win.removeEventListener('transitionend', handler);
    win.classList.remove('minimizing');
    win.style.transformOrigin = '';
    thumb.remove();
    delete minimizedThumbs[win.id];
    removeDockSepIfEmpty();
  });
}

/* dock reset button: stays disabled until a window is moved, resized (maximize/
   restore), closed, or minimized -- then it snaps every window back to its
   default position/size and reopens anything closed or tucked in the dock */
const initialLayout = {};
document.querySelectorAll('.win').forEach(win=>{
  initialLayout[win.id] = {
    left: win.style.left, top: win.style.top,
    width: win.style.width, height: win.style.height
  };
});
const dockResetBtn = document.getElementById('dock-reset');
/* recomputes whether any window differs from its initial layout/visibility,
   so restoring a window (unmaximizing, reopening, un-minimizing) with no other
   changes correctly turns Reset back off instead of leaving it stuck on */
function windowsAreDirty(){
  let dirty = false;
  document.querySelectorAll('.win').forEach(win=>{
    if(win.id === 'win-mail') return; /* Email Me is excluded from dirty tracking */
    if(win.classList.contains('hidden-win')){ dirty = true; return; }
    if(win.dataset.maximized === 'true'){ dirty = true; return; }
    const layout = initialLayout[win.id];
    if(!layout) return;
    if(win.style.left !== layout.left || win.style.top !== layout.top ||
       win.style.width !== layout.width || win.style.height !== layout.height){
      dirty = true;
    }
  });
  return dirty;
}
function refreshResetButtonState(){
  if(!dockResetBtn) return;
  if(windowsAreDirty()){
    dockResetBtn.classList.add('enabled');
    dockResetBtn.removeAttribute('aria-disabled');
  } else {
    dockResetBtn.classList.remove('enabled');
    dockResetBtn.setAttribute('aria-disabled', 'true');
  }
}
function resetAllWindows(){
  document.querySelectorAll('.win').forEach(win=>{
    if(win.id === 'win-mail') return; /* Email Me stays as-is — Reset never opens or repositions it */
    if(win.classList.contains('hidden-win')){
      if(minimizedThumbs[win.id]) restoreWin(win);
      else openWin(win);
    }
    const layout = initialLayout[win.id];
    if(layout){
      win.style.left = layout.left;
      win.style.top = layout.top;
      win.style.width = layout.width;
      win.style.height = layout.height;
    }
    win.dataset.maximized = 'false';
  });
  if(dockResetBtn){
    dockResetBtn.classList.remove('enabled');
    dockResetBtn.setAttribute('aria-disabled', 'true');
  }
}
if(dockResetBtn){
  dockResetBtn.addEventListener('click', ()=>{
    if(!dockResetBtn.classList.contains('enabled')) return;
    resetAllWindows();
  });
}

/* "Let's connect" sticky-note button: opens the standalone chat panel
   (slides in from the left, blurred backdrop). Wiring for the actual
   AI chat conversation comes later — this just gets the shell in place. */
(function(){
  const connectBtn = document.getElementById('connect-btn');
  const chatPanel = document.getElementById('connect-chat-panel');
  const chatBackdrop = document.getElementById('connect-chat-backdrop');
  const chatClose = document.getElementById('connect-chat-close');
  if(!connectBtn || !chatPanel || !chatBackdrop) return;

  function openChat(){
    chatBackdrop.classList.add('show');
    chatPanel.classList.add('show');
    chatPanel.setAttribute('aria-hidden', 'false');
  }
  function closeChat(){
    chatBackdrop.classList.remove('show');
    chatPanel.classList.remove('show');
    chatPanel.setAttribute('aria-hidden', 'true');
  }

  connectBtn.addEventListener('click', openChat);
  if(chatClose) chatClose.addEventListener('click', closeChat);
  chatBackdrop.addEventListener('click', closeChat);
  document.addEventListener('keydown', e=>{
    if(e.key === 'Escape' && chatPanel.classList.contains('show')) closeChat();
  });

  /* ---- Chat: sends questions to our own backend endpoint, which holds
     the Anthropic API key and Robert's bio/CV context server-side.
     NEVER call api.anthropic.com directly from this page — that would
     require putting a secret key in public JS. See /api/chat (backend)
     for the server-side piece. */
  const CHAT_ENDPOINT = '/api/chat'; // <-- after deploying the Cloudflare Worker (see portfolio-chat-backend/README.md), set this to your Worker URL, e.g. 'https://robert-portfolio-chat.YOUR-SUBDOMAIN.workers.dev'

  const chatInput = document.getElementById('connect-chat-input');
  const chatSendBtn = document.getElementById('connect-chat-send');
  const chatMessages = document.getElementById('connect-chat-messages');
  const chatPlaceholder = document.getElementById('connect-chat-placeholder');

  let chatHistory = []; // [{role:'user'|'assistant', content:'...'}, ...]
  let chatBusy = false;

  function addBubble(role, text){
    if(chatPlaceholder) chatPlaceholder.style.display = 'none';
    const el = document.createElement('div');
    el.className = 'chat-msg ' + role;
    el.textContent = text;
    chatMessages.appendChild(el);
    chatMessages.parentElement.scrollTop = chatMessages.parentElement.scrollHeight;
    return el;
  }

  async function sendChatMessage(){
    const text = chatInput.value.trim();
    if(!text || chatBusy) return;

    chatBusy = true;
    chatInput.disabled = true;
    chatSendBtn.disabled = true;
    chatInput.value = '';

    addBubble('user', text);
    chatHistory.push({role:'user', content:text});
    const pending = addBubble('pending', 'Thinking…');

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ messages: chatHistory })
      });
      if(!res.ok) throw new Error('Request failed (' + res.status + ')');
      const data = await res.json();
      const reply = data.reply || "Sorry, I didn't get a response — try again.";
      pending.remove();
      addBubble('assistant', reply);
      chatHistory.push({role:'assistant', content:reply});
    } catch (err) {
      pending.remove();
      addBubble('error', "Couldn't reach the chat right now. Please try again in a moment, or use the Email Me option.");
      console.error('Chat error:', err);
    } finally {
      chatBusy = false;
      chatInput.disabled = false;
      chatSendBtn.disabled = false;
      chatInput.focus();
    }
  }

  chatSendBtn.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keydown', e=>{
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      sendChatMessage();
    }
  });
})();

document.querySelectorAll('.win').forEach((win,i)=>{
  makeDraggable(win);
  makeResizable(win);
  win.addEventListener('pointerdown', ()=>focusWin(win));
  if(!win.classList.contains('hidden-win')){
    setTimeout(()=>win.classList.add('show'), 120 + i*110);
  }
  const closeBtn = win.querySelector('[data-close]');
  if(closeBtn){
    closeBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      closeWin(win);
      if(win.id === 'win-mail'){
        const backdrop = document.getElementById('mail-backdrop');
        if(backdrop) backdrop.classList.remove('show');
        if(window.hideMailSuccess) window.hideMailSuccess();
      }
    });
  }
  const maxBtn = win.querySelector('[data-maximize]');
  if(maxBtn){
    maxBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      /* featured case-study windows (Oracle AD, Grab, ...): green dot opens the full
         case study page instead of just expanding the desktop window */
      if(win.classList.contains('case-win')){
        const cta = win.querySelector('[data-open-project]');
        if(cta){ openProject(cta.dataset.openProject); return; }
      }
      toggleMaximize(win);
    });
  }
  const minBtn = win.querySelector('[data-minimize]');
  if(minBtn){
    minBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      minimizeWin(win);
      if(win.id === 'win-mail'){
        const backdrop = document.getElementById('mail-backdrop');
        if(backdrop) backdrop.classList.remove('show');
      }
    });
  }
});

/* clicking the blurred backdrop closes the Email Me window, like a modal */
(function(){
  const backdrop = document.getElementById('mail-backdrop');
  const winMail = document.getElementById('win-mail');
  if(!backdrop || !winMail) return;
  backdrop.addEventListener('click', ()=>{
    closeWin(winMail);
    backdrop.classList.remove('show');
    if(window.hideMailSuccess) window.hideMailSuccess();
  });
})();

/* ---------------- Courtly screenshots (embedded) ---------------- */
const COURTLY_IMG = {
  mobile:'assets/images/courtly/mobile.jpg',
  dashboard:'assets/images/courtly/dashboard.jpg',
  details:'assets/images/courtly/details.jpg',
  confirm:'assets/images/courtly/confirm.jpg',
  community:'assets/images/courtly/community.jpg',
};

const STEADY_IMG = {
  dashboard:'assets/images/steady/dashboard.jpg',
  food:'assets/images/steady/food.jpg',
  morning:'assets/images/steady/morning.jpg',
  network:'assets/images/steady/network.jpg',
  mobile:'assets/images/steady/mobile.jpg',
};

const MUFG_IMG = {
  mobile:'assets/images/mufg/mobile.jpg',
  landing:'assets/images/mufg/landing.jpg',
  sustainability:'assets/images/mufg/sustainability.jpg',
  inner:'assets/images/mufg/inner.jpg',
  about:'assets/images/mufg/about.jpg',
};

const AUTONOMOUS_IMG = {
  vigilant:'assets/images/autonomous/vigilant.jpg',
  autopilot:'assets/images/autonomous/autopilot.jpg',
  features:'assets/images/autonomous/features.jpg',
  cta:'assets/images/autonomous/cta.jpg'
};

const ORACLE_EGEN_IMG = {
  home:'assets/images/oracle-egen/home.jpg',
  editor:'assets/images/oracle-egen/editor.jpg',
  templates:'assets/images/oracle-egen/templates.jpg',
  analytics:'assets/images/oracle-egen/analytics.jpg',
  mobile:'assets/images/oracle-egen/mobile.jpg',
};

const CHANGI_IMG = {
  pricing:'assets/images/changi/pricing.jpg',
  roi:'assets/images/changi/roi.jpg',
  configure:'assets/images/changi/configure.jpg',
  dashboard:'assets/images/changi/dashboard.jpg',
  mobile:'assets/images/changi/mobile.jpg',
};

const CV_PDF = 'assets/cv/RA_CV.pdf';

const GRAB_IMG = {
  landing:'assets/images/grab/landing.jpg',
  analytics:'assets/images/grab/analytics.jpg',
  team:'assets/images/grab/team.jpg',
  resources:'assets/images/grab/resources.jpg',
  mobile:'assets/images/grab/mobile.jpg',
};
const GE_IMG = {
  dashboard:'assets/images/ge/dashboard.jpg',
  worklist:'assets/images/ge/worklist.jpg',
  detail:'assets/images/ge/detail.jpg',
  report:'assets/images/ge/report.jpg',
  mobile:'assets/images/ge/mobile.jpg',
};
const AVATAR_IMG = 'assets/images/avatar.jpg';

/* set the small preview window's thumbnail from the embedded screenshot */
document.getElementById('autonomous-thumb-1').src = AUTONOMOUS_IMG.vigilant;
document.getElementById('autonomous-thumb-2').src = AUTONOMOUS_IMG.autopilot;
document.getElementById('autonomous-thumb-3').src = AUTONOMOUS_IMG.features;
document.getElementById('autonomous-thumb-4').src = AUTONOMOUS_IMG.cta;
document.getElementById('grab-thumb-img').src = GRAB_IMG.landing;

/* compute the exact top-to-bottom scroll distance for the Grab auto-scroll screenshot,
   so the animation travels precisely from the top to the true bottom of the image */
(function(){
  const img = document.getElementById('grab-thumb-img');
  if(!img) return;
  function setScrollDistance(){
    const frame = img.parentElement; // .mac-screen
    if(!frame || !img.naturalWidth || !img.naturalHeight) return;
    const renderedHeight = frame.clientWidth * (img.naturalHeight / img.naturalWidth);
    const overflow = renderedHeight - frame.clientHeight;
    img.style.setProperty('--scroll-end', (overflow > 0 ? -overflow : 0) + 'px');
  }
  /* embedded/base64 images can finish decoding before a 'load' listener is even
     attached (the event fires and gets missed), so poll a couple of frames
     instead of relying on 'load' alone */
  function trySetScrollDistance(attemptsLeft){
    if(img.naturalWidth && img.naturalHeight){
      setScrollDistance();
      return;
    }
    if(attemptsLeft > 0){
      requestAnimationFrame(()=>trySetScrollDistance(attemptsLeft - 1));
    }
  }
  trySetScrollDistance(30);
  img.addEventListener('load', setScrollDistance);
  window.addEventListener('resize', setScrollDistance);
})();

/* crossfade between the Oracle AD campaign screens inside the mac screen */
(function(){
  const fadeImgs = document.querySelectorAll('#win-autonomous .mac-fade img');
  if(!fadeImgs.length) return;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion) return;
  let i = 0;
  setInterval(()=>{
    fadeImgs[i].classList.remove('is-active');
    i = (i + 1) % fadeImgs.length;
    fadeImgs[i].classList.add('is-active');
  }, 3200);
})();

/* ---------------- Finder panes ---------------- */
const projects = {
  'great-eastern':{
    name:'Great Eastern', slug:'great-eastern', category:'Web App · AI Insurance Claims Platform',
    accent:'#d90429', icon:'🦁', folderBg:'linear-gradient(150deg,#ff6b5c,#a30f1f)',
    lead:'AI-Powered Claims Control Center for Faster, Smarter Insurance Processing',
    role:'Lead Product Designer', timeline:'Shipped — 2026',
    tools:['Modern Dashboard','Design System','Prototypes'],
    metaLabels:{role:'Role', timeline:'Status', tools:'Deliverables'},
    gallery:'great-eastern',
    detail:"This web app is an AI-powered insurance claims management dashboard that centralizes claim intake, review, and resolution workflows. It provides real-time insights into claim volumes, processing status, and AI-assisted outcomes, enabling claims teams to prioritize cases and improve operational efficiency. The interface also includes a submission queue for tracking claim progress and streamlining case management."
  },
  courtly:{
    name:'Courtly', slug:'courtly', category:'Product Design · Sports Court Booking',
    accent:'#22c07a', icon:'🏀', folderBg:'linear-gradient(150deg,#34d399,#0f9d63)',
    lead:'Your all-in-one platform for sports court bookings.',
    role:'Lead Product Designer', timeline:'Shipped — 2025',
    tools:['Product Design','Design System','Prototypes'],
    metaLabels:{role:'Role', timeline:'Status', tools:'Deliverables'},
    gallery:'courtly',
    detail:"Courtly is a modern sports court booking platform that helps users discover nearby venues, reserve courts, and manage their bookings in one place. The dashboard provides personalized recommendations, upcoming schedules, booking history, and activity streaks to encourage regular play. With a clean, intuitive interface, users can quickly find courts, join community matches, and stay active."
  },
  'oracle-egen':{
    name:'Oracle EG', pageTitle:'Oracle Email Generator AI', slug:'oracle-egen', category:'Web &amp; Mobile · AI Email Platform',
    accent:'#ff6b4a', icon:'✉️', folderBg:'linear-gradient(150deg,#ff8a5c,#c1391f)',
    lead:'Create personalized email templates effortlessly.',
    role:'Lead Product Designer', timeline:'Shipped — 2024',
    tools:['Design System','Prototypes','Modern Dashboard'],
    metaLabels:{role:'Role', timeline:'Status', tools:'Deliverables'},
    gallery:'oracle-egen',
    detail:"Oracle AI Email Generator is an AI-powered platform that transforms simple prompts into professional, ready-to-send HTML email templates. Users can customize tone, add contextual data, and generate personalized email content in seconds. Built for enterprise teams, it streamlines email creation while ensuring consistency, efficiency, and brand alignment."
  },
  'changi':{
    name:'Changi', pageTitle:'Changi Airport Group', slug:'changi', category:'Web App · Cloud Pricing Comparison Dashboard',
    accent:'#7c56e0', icon:'✈️', folderBg:'linear-gradient(150deg,#9b7ef0,#5a3fc0)',
    lead:'Compare Cloud Infrastructure Costs Across Leading Providers',
    role:'Lead Product Designer', timeline:'Shipped — 2025',
    tools:['Calculator Dashboard','Design System','Prototypes'],
    metaLabels:{role:'Role', timeline:'Status', tools:'Deliverables'},
    gallery:'changi',
    detail:"This web app is a cloud pricing comparison dashboard that helps organizations evaluate infrastructure costs across leading cloud providers. It presents side-by-side comparisons of compute, storage, and other services, highlighting cost differences and potential savings. The platform enables users to make informed cloud adoption and optimization decisions with clear, data-driven insights."
  },
  'oracle-ad':{
    name:'Oracle AD', pageTitle:'Oracle Autonomous Database', slug:'oracle-ad', category:'Web Experience · Enterprise Software Campaign',
    accent:'#ff6b4a', icon:'🗄️', folderBg:'linear-gradient(150deg,#ff8a5c,#c1391f)',
    lead:'Experience the Power of Autonomous Innovation.',
    role:'Creative Technologist', timeline:'Live — 2023',
    tools:['Web Experience','Motion 3D Experience'],
    metaLabels:{role:'Role', timeline:'Status', tools:'Deliverables'},
    gallery:'oracle-ad',
    detail:"This interactive campaign showcases how Oracle Autonomous Database transforms database management with intelligent automation, self-healing, and always-on security. I had the opportunity to collaborate with Larry Ellison's team, leading the UI/UX design and delivering the campaign web application from concept to launch with a polished, engaging user experience. Inspired by autonomous driving, the experience simplifies complex technology into an intuitive story that highlights Oracle's innovation."
  },
  steady:{
    name:'Steady', slug:'steady', category:'Product Design · Health & Wellness',
    accent:'var(--orange)', icon:'🫀', folderBg:'linear-gradient(150deg,#ffab6b,#e2632c)',
    lead:'A calmer, smarter way to stay on top of your wellbeing.',
    role:'Lead Product Designer', timeline:'Shipped — 2026',
    tools:['Product Design','Design System','Prototypes'],
    metaLabels:{role:'Role', timeline:'Status', tools:'Deliverables'},
    gallery:'steady',
    detail:'A thoughtfully designed wellness dashboard that brings your daily health habits into one clear, calming space. Track heart rate, sleep, steps, nutrition, and hydration at a glance. Personalized insights and gentle reminders help turn everyday actions into steady, sustainable habits. The warm visual language makes health tracking feel simple, approachable, and motivating.'
  },
  mufg:{
    name:'MUFG', slug:'mufg', category:'Web App · Financial Services',
    accent:'var(--red)', icon:'🏦', folderBg:'linear-gradient(150deg,#ff5f57,#a30f0f)',
    lead:'Creating an intuitive and trustworthy user experience.',
    role:'UI/UX Designer and Creative Technologist', timeline:'Beta — 2023',
    tools:['Web App','Mobile Responsive'],
    metaLabels:{role:'Role', timeline:'Status', tools:'Deliverables'},
    gallery:'mufg',
    detail:'The MUFG UI features a modern, professional design with a prominent hero banner that highlights key business initiatives alongside strong visual imagery. A clean navigation bar and card-based layout showcase financial services with clear icons, concise descriptions, and bold red accents, creating an intuitive and trustworthy user experience.'
  },
  grab:{
    name:'Grab', slug:'grab', category:'Product Design · Employee Portal',
    accent:'#00B14F', icon:'🚗', folderBg:'linear-gradient(150deg,#3fd977,#00893a)',
    lead:'A spatial intelligence dashboard.',
    role:'Lead Designer', timeline:'Shipped — 2024',
    tools:['Design System','Prototypes','Motion'],
    metaLabels:{role:'Role', timeline:'Status', tools:'Deliverables'},
    gallery:'grab',
    detail:"The Grab employee portal features a clean, modern, and user-friendly interface that prioritizes accessibility and efficiency. Its card-based layout organizes personalized tasks, announcements, company news, and workplace resources into clear, easy-to-navigate sections. Combined with Grab's signature green branding and intuitive navigation, the design creates a seamless experience that helps employees stay informed, productive, and connected."
  }
};

function renderFinderPane(pane){
  const c = document.getElementById('finder-content');
  document.querySelectorAll('.finder-item').forEach(it=>it.classList.toggle('active', it.dataset.pane===pane));

  if(pane==='about'){
    c.innerHTML = `
      <div class="about-header">
        <div class="avatar"><img src="${AVATAR_IMG}" alt="Robert Azucena"></div>
        <div>
          <h2>Robert Azucena</h2>
          <p>UX/UI Architect &amp; Creative Strategist</p>
        </div>
      </div>
      <p class="about-bio">I design at the intersection of AI and function — where systems thinking meets thoughtful craft and human experience.<br><br>Based in Singapore. previously at <strong>Oracle</strong>, and various early‑stage ventures.</p>
      <div class="tag-row">
        <span class="tag">UX Research</span><span class="tag">UI Architecture</span><span class="tag">Figma Enthusiast</span>
        <span class="tag">Creative Direction</span><span class="tag">User Interface</span>
        <span class="tag">Design Systems</span><span class="tag">Information Architecture</span>
        <span class="tag">Interaction Design</span><span class="tag">Prototyping</span>
        <span class="tag">Accessibility (a11y)</span><span class="tag">Motion Design</span>
      </div>`;
  } else if(pane==='projects'){
    let grid = '<div class="proj-grid">';
    Object.values(projects).forEach(p=>{
      grid += `<div class="proj-folder" data-open-project="${p.slug}">
        <div class="folder-icon" style="background:${p.folderBg};">${p.icon}</div>
        <span>${p.name}</span>
      </div>`;
    });
    grid += '</div>';
    c.innerHTML = grid;
  } else if(pane==='documents'){
    c.innerHTML = `<div class="proj-grid">
      <a class="proj-folder" href="${CV_PDF}" target="_blank" rel="noopener" style="text-decoration:none;">
        <div class="folder-icon" style="background:linear-gradient(150deg,#ff6f6b,#c23636);">📄</div>
        <span>RA_CV.pdf</span>
      </a>
    </div>`;
  } else {
    c.innerHTML = `<div class="empty-state">⬇ No downloads yet.</div>`;
  }
}
document.querySelectorAll('.finder-item').forEach(it=>{
  it.addEventListener('click', ()=>renderFinderPane(it.dataset.pane));
});
renderFinderPane('about');

/* ---------------- Project overlay ---------------- */
function galleryHTML(p){
  const t = (icon,label,grad)=>`<div class="placeholder-tile" style="background:${grad};"><span class="icon">${icon}</span><span class="label">${label}</span></div>`;
  if(p.gallery==='phones'){
    return `<div class="gallery g2">
      ${t('📱','Home feed — placeholder','linear-gradient(160deg,rgba(255,122,69,.25),rgba(255,95,109,.12))')}
      ${t('🧾','Checkout flow — placeholder','linear-gradient(160deg,rgba(255,95,109,.22),rgba(155,126,240,.12))')}
    </div>`;
  }
  if(p.gallery==='web'){
    return `<div class="gallery g3">
      ${t('🖥️','Homepage rebuild — placeholder','linear-gradient(160deg,rgba(44,224,184,.22),rgba(26,168,138,.1))')}
      ${t('🧩','Component library — placeholder','linear-gradient(160deg,rgba(44,224,184,.16),rgba(155,126,240,.12))')}
    </div>`;
  }
  if(p.gallery==='steady'){
    return `<div class="gallery g1">
      <div class="shot-tile wide"><img src="${STEADY_IMG.dashboard}" alt="Steady dashboard — heart rate, sleep, steps, food, and hydration at a glance" loading="lazy"></div>
    </div>
    <div class="gallery g1">
      <div class="shot-tile wide"><img src="${STEADY_IMG.food}" alt="Steady food and nutrition log" loading="lazy"></div>
    </div>
    <div class="gallery g2 real-shots">
      <div class="shot-tile"><img src="${STEADY_IMG.morning}" alt="Steady morning routine checklist" loading="lazy"></div>
      <div class="shot-tile"><img src="${STEADY_IMG.network}" alt="Steady wellness circle — friends, pros, and community" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${STEADY_IMG.mobile}" alt="Steady mobile flow — today, health, sleep, and rhythm screens" loading="lazy"></div>
    </div>`;
  }
  if(p.gallery==='grab'){
    return `<div class="gallery g1">
      <div class="shot-tile wide"><img src="${GRAB_IMG.landing}" alt="Grab employee portal home — welcome banner, top actions, and newsroom" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${GRAB_IMG.analytics}" alt="Grab analytics and insights dashboard — revenue trend and regional performance" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${GRAB_IMG.team}" alt="Grab My Team directory page" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${GRAB_IMG.resources}" alt="Grab resources page — quick shortcuts and knowledge base" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${GRAB_IMG.mobile}" alt="Grab mobile flow — home, analytics, my team, and resources screens" loading="lazy"></div>
    </div>`;
  }
  if(p.gallery==='mufg'){
    return `<div class="gallery g1">
      <div class="shot-tile wide"><img src="${MUFG_IMG.landing}" alt="MUFG landing page — hero banner and financial service cards" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${MUFG_IMG.sustainability}" alt="MUFG sustainability and ESG pillars page" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${MUFG_IMG.inner}" alt="MUFG inner services page — core transactional and commercial solutions" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${MUFG_IMG.about}" alt="MUFG about us page — company stats and leadership" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${MUFG_IMG.mobile}" alt="MUFG mobile flow — home, sustainability, about, and services screens" loading="lazy"></div>
    </div>`;
  }
  if(p.gallery==='oracle-ad'){
    return `<div class="gallery g1">
      <div class="shot-tile wide"><img src="${AUTONOMOUS_IMG.vigilant}" alt="Oracle AD — Ever Vigilant, hyperattentive intrusion detection and security" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${AUTONOMOUS_IMG.autopilot}" alt="Oracle AD — No Human Error, zero-operation autopilot" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${AUTONOMOUS_IMG.features}" alt="Oracle AD — Engineered for Autonomy capabilities brief" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${AUTONOMOUS_IMG.cta}" alt="Oracle AD — closing call to action, It Adds Up to the Greatest Gift of All: Time" loading="lazy"></div>
    </div>`;
  }
  if(p.gallery==='changi'){
    return `<div class="gallery g1">
      <div class="shot-tile wide"><img src="${CHANGI_IMG.pricing}" alt="Changi Cloud Optimizer pricing comparison — Oracle vs AWS, Azure, and Google Cloud" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${CHANGI_IMG.roi}" alt="Changi Cloud Optimizer ROI summary — annual savings, TCO reduction, and payback period" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${CHANGI_IMG.configure}" alt="Changi Cloud Optimizer configure your stack — compute, storage, network, and database requirements" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${CHANGI_IMG.dashboard}" alt="Changi Cloud Optimizer full dashboard — multi-cloud cost comparison and savings trend" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${CHANGI_IMG.mobile}" alt="Changi Cloud Optimizer mobile flow — dashboard, pricing, ROI, and cost breakdown screens" loading="lazy"></div>
    </div>`;
  }
  if(p.gallery==='oracle-egen'){
    return `<div class="gallery g1">
      <div class="shot-tile wide"><img src="${ORACLE_EGEN_IMG.home}" alt="Oracle AI Email Generator home — AI prompt editor and suggested starting points" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${ORACLE_EGEN_IMG.editor}" alt="Oracle AI Email Generator email editor — live preview, recipients, schedule, and performance prediction" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${ORACLE_EGEN_IMG.templates}" alt="Oracle AI Email Generator templates gallery" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${ORACLE_EGEN_IMG.analytics}" alt="Oracle AI Email Generator analytics dashboard — delivery and engagement over time" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${ORACLE_EGEN_IMG.mobile}" alt="Oracle AI Email Generator mobile flow — home, editor, templates, and analytics screens" loading="lazy"></div>
    </div>`;
  }
  if(p.gallery==='courtly'){
    return `<div class="gallery g1">
      <div class="shot-tile wide"><img src="${COURTLY_IMG.dashboard}" alt="Courtly dashboard — nearby courts, upcoming bookings, activity streak" loading="lazy"></div>
    </div>
    <div class="gallery g1">
      <div class="shot-tile wide"><img src="${COURTLY_IMG.details}" alt="Courtly court details and booking flow" loading="lazy"></div>
    </div>
    <div class="gallery g2 real-shots">
      <div class="shot-tile"><img src="${COURTLY_IMG.confirm}" alt="Courtly booking confirmation and payment screen" loading="lazy"></div>
      <div class="shot-tile"><img src="${COURTLY_IMG.community}" alt="Courtly community games listing" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${COURTLY_IMG.mobile}" alt="Courtly mobile flow — home, court details, confirm booking, and community games" loading="lazy"></div>
    </div>`;
  }
  if(p.gallery==='great-eastern'){
    return `<div class="gallery g1">
      <div class="shot-tile wide"><img src="${GE_IMG.dashboard}" alt="Great Eastern claims control room — payload totals, AI success rate, and recent submissions queue" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${GE_IMG.worklist}" alt="Great Eastern auto claims worklist — searchable, filterable claim cards" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${GE_IMG.detail}" alt="Great Eastern claim detail — claimant specifications and evidence photos" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${GE_IMG.report}" alt="Great Eastern final report — itemized AI findings and adjuster verification" loading="lazy"></div>
    </div>
    <div class="gallery g1" style="margin-top:16px;">
      <div class="shot-tile wide"><img src="${GE_IMG.mobile}" alt="Great Eastern mobile flow — dashboard, worklist, claim detail, and final report screens" loading="lazy"></div>
    </div>`;
  }
  return `<div class="gallery g2">
    ${t('🅰️','Logotype system — placeholder','linear-gradient(160deg,rgba(240,182,103,.24),rgba(217,122,63,.12))')}
    ${t('🖼️','Collateral suite — placeholder','linear-gradient(160deg,rgba(240,182,103,.18),rgba(155,126,240,.1))')}
  </div>`;
}

function openProject(slug){
  const p = projects[slug];
  if(!p) return;
  document.getElementById('proj-body').className = 'proj-body' + (slug==='courtly' ? ' proj-courtly' : '');
  document.getElementById('proj-url').textContent = `🔒 featured-work/${p.slug}`;
  const labels = p.metaLabels || {role:'Role', timeline:'Timeline', tools:'Tools'};
  const extra = p.gallery==='brand' ? `
    <div class="section">
      <h5>Palette</h5>
      <div class="swatch-row">
        <div class="swatch" style="background:#f0b667;"></div>
        <div class="swatch" style="background:#241a12;"></div>
        <div class="swatch" style="background:#d97a3f;"></div>
        <div class="swatch" style="background:#efe6d8;"></div>
      </div>
    </div>` : (p.gallery==='oracle-ad' ? `
    <div class="section">
      <h5>Design System</h5>
      <p style="color:var(--text-mid); font-size:13.5px; line-height:1.8; margin:0 0 18px;">The campaign runs on a dark, near-black canvas so each section's signal color — cyan for security, magenta for self-healing, amber for autopilot — can glow against it. A consistent grid-horizon backdrop and wireframe hexagon motifs tie the "autonomous driving" concept together across every screen.</p>
      <div class="swatch-row" style="margin-bottom:18px;">
        <div class="swatch" style="background:#10141f;" title="Deep Space Navy — base background"></div>
        <div class="swatch" style="background:#dd5a3f;" title="Ignition Coral — logomark & primary CTA"></div>
        <div class="swatch" style="background:#00f2fe;" title="Sentinel Cyan — security / vigilance accent"></div>
        <div class="swatch" style="background:#ff00ff;" title="Neural Magenta — self-healing / ML accent"></div>
        <div class="swatch" style="background:#ff7a45;" title="Autopilot Amber — zero-ops accent"></div>
        <div class="swatch" style="background:#181f2f;" title="Surface Panel — cards & nav pills"></div>
      </div>
      <div class="meta-row" style="margin-bottom:0; padding-bottom:0; border-bottom:none;">
        <div class="meta-col"><h6>Typography</h6><div>Oracle Sans — Bold headlines, Regular body, tracked uppercase eyebrow labels</div></div>
        <div class="meta-col"><h6>Components</h6><div class="meta-tags">${['Pill buttons','Bordered eyebrow badges','Floating tab nav','Glowing wireframe motifs','Grid-horizon backdrop','Section accent rotation'].map(t=>`<span class="tag">${t}</span>`).join('')}</div></div>
      </div>
    </div>` : (p.gallery==='grab' ? `
    <div class="section">
      <h5>Design System</h5>
      <p style="color:var(--text-mid); font-size:13.5px; line-height:1.8; margin:0 0 18px;">The portal runs on a bright, neutral canvas so Grab's signature green can carry all primary actions and status without competing for attention. A consistent card grid organizes tasks, news, and resources into scannable modules, with generous whitespace and soft shadows keeping a dense employee tool feeling calm and approachable.</p>
      <div class="swatch-row" style="margin-bottom:18px;">
        <div class="swatch" style="background:#ffffff;" title="Surface White — base background & cards"></div>
        <div class="swatch" style="background:#00B14F;" title="Grab Green — primary actions & brand accent"></div>
        <div class="swatch" style="background:#00893a;" title="Deep Green — hover & emphasis states"></div>
        <div class="swatch" style="background:#f4f6f5;" title="Mist Grey — section & page background"></div>
        <div class="swatch" style="background:#1c1f1e;" title="Ink — primary text"></div>
        <div class="swatch" style="background:#7c8683;" title="Slate — secondary text & metadata"></div>
      </div>
      <div class="meta-row" style="margin-bottom:0; padding-bottom:0; border-bottom:none;">
        <div class="meta-col"><h6>Typography</h6><div>Inter — Semibold headings, Regular body, uppercase micro-labels for card categories</div></div>
        <div class="meta-col"><h6>Components</h6><div class="meta-tags">${['Card grid layout','Task modules','Status pills','Top nav + search','Icon-led shortcuts','Responsive mobile stack'].map(t=>`<span class="tag">${t}</span>`).join('')}</div></div>
      </div>
    </div>` : (p.gallery==='oracle-egen' ? `
    <div class="section">
      <h5>Design System</h5>
      <p style="color:var(--text-mid); font-size:13.5px; line-height:1.8; margin:0 0 18px;">The generator pairs a light, focused workspace with a warm coral accent that marks every AI-driven action — generate, customize, send — so the automation always feels visible rather than hidden behind the interface. A split-pane editor keeps the prompt, live preview, and controls in constant view, reducing context-switching during rapid iteration.</p>
      <div class="swatch-row" style="margin-bottom:18px;">
        <div class="swatch" style="background:#ffffff;" title="Canvas White — editor & panel background"></div>
        <div class="swatch" style="background:#ff6b4a;" title="Prompt Coral — primary CTA & AI accent"></div>
        <div class="swatch" style="background:#c1391f;" title="Ember — hover & active states"></div>
        <div class="swatch" style="background:#f7f5f3;" title="Warm Grey — surrounding surface"></div>
        <div class="swatch" style="background:#221b18;" title="Charcoal — primary text"></div>
        <div class="swatch" style="background:#8a7f7a;" title="Taupe — secondary text & labels"></div>
      </div>
      <div class="meta-row" style="margin-bottom:0; padding-bottom:0; border-bottom:none;">
        <div class="meta-col"><h6>Typography</h6><div>Oracle Sans — Semibold headings, Regular body, JetBrains Mono for the prompt input</div></div>
        <div class="meta-col"><h6>Components</h6><div class="meta-tags">${['Split-pane editor','Live email preview','Prompt input field','Template gallery cards','Analytics charts','Mobile editor flow'].map(t=>`<span class="tag">${t}</span>`).join('')}</div></div>
      </div>
    </div>` : (p.gallery==='changi' ? `
    <div class="section">
      <h5>Design System</h5>
      <p style="color:var(--text-mid); font-size:13.5px; line-height:1.8; margin:0 0 18px;">The dashboard leans on a cool violet accent against a light, data-dense canvas to keep multi-provider comparisons legible without visual fatigue. Consistent chart styling and color-coded provider tags let users scan cost differences at a glance, while a clear card hierarchy separates configuration from results.</p>
      <div class="swatch-row" style="margin-bottom:18px;">
        <div class="swatch" style="background:#ffffff;" title="Base White — dashboard background"></div>
        <div class="swatch" style="background:#7c56e0;" title="Cloud Violet — primary CTA & highlights"></div>
        <div class="swatch" style="background:#5a3fc0;" title="Deep Violet — hover & emphasis states"></div>
        <div class="swatch" style="background:#f5f3fb;" title="Panel Lilac — card & section background"></div>
        <div class="swatch" style="background:#1e1b29;" title="Ink Navy — primary text"></div>
        <div class="swatch" style="background:#847e99;" title="Muted Violet — secondary text & metadata"></div>
      </div>
      <div class="meta-row" style="margin-bottom:0; padding-bottom:0; border-bottom:none;">
        <div class="meta-col"><h6>Typography</h6><div>IBM Plex Sans — Bold headline figures for cost stats, Regular body, tabular numerals for pricing tables</div></div>
        <div class="meta-col"><h6>Components</h6><div class="meta-tags">${['Provider comparison table','Cost calculator sliders','ROI summary cards','Multi-cloud stacked charts','Configuration form','Mobile comparison flow'].map(t=>`<span class="tag">${t}</span>`).join('')}</div></div>
      </div>
    </div>` : (p.gallery==='mufg' ? `
    <div class="section">
      <h5>Design System</h5>
      <p style="color:var(--text-mid); font-size:13.5px; line-height:1.8; margin:0 0 18px;">The site pairs a clean white canvas with a confident red accent to project institutional trust while staying approachable. Full-bleed hero imagery and a structured card grid organize dense financial and ESG content into clear, scannable sections, with generous spacing keeping the tone professional rather than corporate-heavy.</p>
      <div class="swatch-row" style="margin-bottom:18px;">
        <div class="swatch" style="background:#ffffff;" title="Base White — page & card background"></div>
        <div class="swatch" style="background:#ff5f57;" title="MUFG Red — primary accent & CTAs"></div>
        <div class="swatch" style="background:#a30f0f;" title="Deep Red — hover & emphasis states"></div>
        <div class="swatch" style="background:#f6f6f7;" title="Cool Grey — section background"></div>
        <div class="swatch" style="background:#1a1a1a;" title="Near-Black — primary text"></div>
        <div class="swatch" style="background:#767676;" title="Steel Grey — secondary text & captions"></div>
      </div>
      <div class="meta-row" style="margin-bottom:0; padding-bottom:0; border-bottom:none;">
        <div class="meta-col"><h6>Typography</h6><div>Noto Sans — Bold headlines, Regular body, condensed labels for service categories</div></div>
        <div class="meta-col"><h6>Components</h6><div class="meta-tags">${['Full-bleed hero banner','Service card grid','Icon-led navigation','ESG pillar sections','Bordered CTA buttons','Mobile stacked layout'].map(t=>`<span class="tag">${t}</span>`).join('')}</div></div>
      </div>
    </div>` : (p.gallery==='steady' ? `
    <div class="section">
      <h5>Design System</h5>
      <p style="color:var(--text-mid); font-size:13.5px; line-height:1.8; margin:0 0 18px;">Steady leans on a warm, sunlit palette to keep health tracking feeling calming rather than clinical. A soft coral-orange accent marks progress rings and key actions, while gentle warm neutrals let dense metrics — heart rate, sleep, nutrition, hydration — stay legible without feeling like a medical chart.</p>
      <div class="swatch-row" style="margin-bottom:18px;">
        <div class="swatch" style="background:#fdfaf6;" title="Warm Ivory — base background & cards"></div>
        <div class="swatch" style="background:#ff7a45;" title="Steady Orange — primary accent & progress rings"></div>
        <div class="swatch" style="background:#e2632c;" title="Deep Amber — hover & emphasis states"></div>
        <div class="swatch" style="background:#fff1e6;" title="Soft Peach — section background"></div>
        <div class="swatch" style="background:#2b211c;" title="Ink — primary text"></div>
        <div class="swatch" style="background:#8f7d72;" title="Warm Taupe — secondary text & metadata"></div>
      </div>
      <div class="meta-row" style="margin-bottom:0; padding-bottom:0; border-bottom:none;">
        <div class="meta-col"><h6>Typography</h6><div>Nunito Sans — Rounded, friendly headlines, Regular body, tabular numerals for health metrics</div></div>
        <div class="meta-col"><h6>Components</h6><div class="meta-tags">${['Progress rings','Habit streak cards','Health metric tiles','Gentle reminder toasts','Rounded pill buttons','Mobile stacked dashboard'].map(t=>`<span class="tag">${t}</span>`).join('')}</div></div>
      </div>
    </div>` : (p.gallery==='courtly' ? `
    <div class="section">
      <h5>Design System</h5>
      <p style="color:var(--text-mid); font-size:13.5px; line-height:1.8; margin:0 0 18px;">Courtly pairs a fresh, energetic green with a clean white canvas to keep court discovery and booking fast and confident. Card-based listings and bold availability badges make open courts easy to scan at a glance, while a consistent icon system carries the sporty, community feel across web and mobile.</p>
      <div class="swatch-row" style="margin-bottom:18px;">
        <div class="swatch" style="background:#ffffff;" title="Surface White — base background & cards"></div>
        <div class="swatch" style="background:#22c07a;" title="Courtly Green — primary actions & brand accent"></div>
        <div class="swatch" style="background:#0f9d63;" title="Deep Green — hover & emphasis states"></div>
        <div class="swatch" style="background:#f5f7f6;" title="Mist Grey — section & page background"></div>
        <div class="swatch" style="background:#1c2420;" title="Ink — primary text"></div>
        <div class="swatch" style="background:#7c8983;" title="Slate — secondary text & metadata"></div>
      </div>
      <div class="meta-row" style="margin-bottom:0; padding-bottom:0; border-bottom:none;">
        <div class="meta-col"><h6>Typography</h6><div>Inter — Bold headlines, Regular body, uppercase micro-labels for court categories</div></div>
        <div class="meta-col"><h6>Components</h6><div class="meta-tags">${['Court listing cards','Availability badges','Booking confirmation flow','Community match cards','Activity streak tracker','Mobile booking flow'].map(t=>`<span class="tag">${t}</span>`).join('')}</div></div>
      </div>
    </div>` : (p.gallery==='great-eastern' ? `
    <div class="section">
      <h5>Design System</h5>
      <p style="color:var(--text-mid); font-size:13.5px; line-height:1.8; margin:0 0 18px;">The claims dashboard runs on a bright, data-dense canvas so a confident brand blue and red can anchor navigation and primary actions, while a dedicated amber/blue/green status language lets adjusters read claim states — pending, processing, resolved — at a glance across dense tables and queues.</p>
      <div class="swatch-row" style="margin-bottom:18px;">
        <div class="swatch" style="background:#013CA4;" title="Primary Blue — primary actions & navigation"></div>
        <div class="swatch" style="background:#E41B25;" title="Brand Red — brand accent & critical alerts"></div>
        <div class="swatch" style="background:#F49E0B;" title="Pending Amber — pending status indicator"></div>
        <div class="swatch" style="background:#4F90F8;" title="Processing Blue — processing status indicator"></div>
        <div class="swatch" style="background:#34D399;" title="Resolved Green — resolved status indicator"></div>
        <div class="swatch" style="background:#F4F5F7;" title="Neutral Surface — card & section background"></div>
      </div>
      <div class="meta-row" style="margin-bottom:0; padding-bottom:0; border-bottom:none;">
        <div class="meta-col"><h6>Typography</h6><div>IBM Plex Sans — Bold headlines, Regular body, tabular numerals for claim figures</div></div>
        <div class="meta-col"><h6>Components</h6><div class="meta-tags">${['Status pills','Claims submission queue','AI insight cards','Priority badges','Data-dense tables','Mobile claims tracker'].map(t=>`<span class="tag">${t}</span>`).join('')}</div></div>
      </div>
    </div>` : ''))))))));
  const statRow = p.stats ? `
    <div class="stat-row">
      ${p.stats.map(s=>`<div class="stat-card"><b style="color:${p.accent};">${s[0]}</b><span>${s[1]}</span></div>`).join('')}
    </div>` : '';
  document.getElementById('proj-body').innerHTML = `
    <div class="back-btn" id="proj-back">← Back to desktop</div>
    <div class="proj-hero-eyebrow" style="color:${p.accent};">${p.category}</div>
    <h1>${p.pageTitle || p.name}</h1>
    <p class="lead">${p.lead}</p>
    <div class="section">
      <h5>Approach</h5>
      <p style="color:var(--text-mid); font-size:13.5px; line-height:1.8;">${p.detail}</p>
    </div>
    <div class="meta-row">
      <div class="meta-col"><h6>${labels.role}</h6><div>${p.role}</div></div>
      <div class="meta-col"><h6>${labels.timeline}</h6><div>${p.timeline}</div></div>
      <div class="meta-col"><h6>${labels.tools}</h6><div class="meta-tags">${p.tools.map(t=>`<span class="tag">${t}</span>`).join('')}</div></div>
    </div>
    ${galleryHTML(p)}
    ${statRow}
    ${extra}
  `;
  document.getElementById('proj-back').addEventListener('click', closeProject);
  document.getElementById('project-overlay').classList.add('open');
  initShotPreloaders();
  const bodyEl = document.getElementById('proj-body');
  bodyEl.scrollTop = 0; /* always land on the top of the case study, even when switching straight from another project */
  bodyEl.classList.remove('proj-anim-in');
  void bodyEl.offsetWidth; /* force reflow so the entrance animation replays every open */
  bodyEl.classList.add('proj-anim-in');
}
function initShotPreloaders(){
  document.querySelectorAll('#proj-body .shot-tile img').forEach(img=>{
    const tile = img.closest('.shot-tile');
    const markLoaded = ()=> tile.classList.add('loaded');
    if(img.complete && img.naturalWidth > 0){
      markLoaded();
    } else {
      img.addEventListener('load', markLoaded, {once:true});
      img.addEventListener('error', markLoaded, {once:true});
    }
  });
}
function closeProject(){
  document.getElementById('project-overlay').classList.remove('open');
}
document.getElementById('proj-close-dot').addEventListener('click', closeProject);
document.getElementById('project-overlay').addEventListener('click', (e)=>{
  if(e.target.id==='project-overlay') closeProject();
});

document.body.addEventListener('click', (e)=>{
  const t = e.target.closest('[data-open-project]');
  if(t) openProject(t.dataset.openProject);
});

/* ---------------- Dock actions ---------------- */
document.querySelectorAll('.dockitem').forEach(d=>{
  d.addEventListener('click', ()=>{
    document.querySelectorAll('.dockitem').forEach(x=>x.classList.remove('active'));
    d.classList.add('active');
    const action = d.dataset.dock;
    if(action==='about'){
      const w=document.getElementById('win-about'); openWin(w); renderFinderPane('about');
    } else if(action==='safari'){
      const w=document.getElementById('win-about'); openWin(w); renderFinderPane('projects');
    } else if(action==='documents'){
      const w=document.getElementById('win-about'); openWin(w); renderFinderPane('documents');
    } else if(action==='mail'){
      const w=document.getElementById('win-mail');
      const backdrop=document.getElementById('mail-backdrop');
      positionMailNearDock();
      if(backdrop) backdrop.classList.add('show');
      if(minimizedThumbs[w.id]) restoreWin(w);
      else openWin(w);
      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{ if(window.syncMailWindowHeight) window.syncMailWindowHeight(); });
      });
    } else if(action==='linkedin'){
      window.open('https://www.linkedin.com/in/robertazucena/','_blank');
    }
  });
});


/* ---------------- 3D interactive background ---------------- */
(function initBG3D(){
  try{
    if(!window.THREE) throw new Error('three.js failed to load');

    const canvas = document.getElementById('bg3d');
    const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, window.innerWidth/window.innerHeight, 1, 3000);
    camera.position.z = 560;

    const group = new THREE.Group();
    scene.add(group);

    function isLightTheme(){ return document.documentElement.getAttribute('data-theme') === 'light'; }

    const PALETTES = {
      dark:  [[155,126,240],[240,130,196],[57,213,242],[255,122,69],[240,182,103]],
      light: [[103,62,214],[196,42,132],[8,132,104],[6,118,152],[163,98,4]]
    };
    const pick = ()=> {
      const p = isLightTheme() ? PALETTES.light : PALETTES.dark;
      return p[(Math.random()*p.length)|0];
    };

    /* ambient particle field, spread in a soft sphere behind the desktop */
    const COUNT = 1500;
    const positions = new Float32Array(COUNT*3);
    const colors = new Float32Array(COUNT*3);
    for(let i=0;i<COUNT;i++){
      const r = 260 + Math.random()*950;
      const theta = Math.random()*Math.PI*2;
      const phi = Math.acos(Math.random()*2-1);
      positions[i*3]   = r*Math.sin(phi)*Math.cos(theta);
      positions[i*3+1] = r*Math.sin(phi)*Math.sin(theta)*0.62;
      positions[i*3+2] = r*Math.cos(phi) - 380;
      const c = pick();
      colors[i*3]=c[0]/255; colors[i*3+1]=c[1]/255; colors[i*3+2]=c[2]/255;
    }
    const fieldGeo = new THREE.BufferGeometry();
    fieldGeo.setAttribute('position', new THREE.BufferAttribute(positions,3));
    fieldGeo.setAttribute('color', new THREE.BufferAttribute(colors,3));
    const fieldMat = new THREE.PointsMaterial({
      size: isLightTheme() ? 3.6 : 2.4,
      vertexColors:true, transparent:true, opacity: isLightTheme() ? 0.92 : 0.8,
      depthWrite:false, blending: isLightTheme() ? THREE.NormalBlending : THREE.AdditiveBlending
    });
    const field = new THREE.Points(fieldGeo, fieldMat);
    group.add(field);

    /* re-tint and re-blend the field whenever the light/dark theme is toggled */
    function applyThemeToField(){
      const light = isLightTheme();
      fieldMat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      fieldMat.opacity = light ? 0.92 : 0.8;
      fieldMat.size = light ? 3.6 : 2.4;
      fieldMat.needsUpdate = true;
      const colorArr = fieldGeo.attributes.color.array;
      for(let i=0;i<COUNT;i++){
        const c = pick();
        colorArr[i*3]=c[0]/255; colorArr[i*3+1]=c[1]/255; colorArr[i*3+2]=c[2]/255;
      }
      fieldGeo.attributes.color.needsUpdate = true;
    }
    const themeObserver = new MutationObserver(applyThemeToField);
    themeObserver.observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});

    /* pointer parallax: the whole scene tilts gently toward the cursor/finger */
    let mouseX=0, mouseY=0, tiltX=0, tiltY=0;
    window.addEventListener('pointermove', e=>{
      mouseX = (e.clientX/window.innerWidth) - 0.5;
      mouseY = (e.clientY/window.innerHeight) - 0.5;
    }, {passive:true});

    /* click / tap on empty desktop space spawns a particle burst */
    const bursts = [];
    function spawnBurst(clientX, clientY){
      const ndcX = (clientX/window.innerWidth)*2-1;
      const ndcY = -(clientY/window.innerHeight)*2+1;
      const dir = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera).sub(camera.position).normalize();
      const dist = (-300 - camera.position.z)/dir.z;
      const origin = camera.position.clone().add(dir.multiplyScalar(dist));

      const n = 30;
      const bpos = new Float32Array(n*3);
      const bcol = new Float32Array(n*3);
      const vel = [];
      const c = pick();
      for(let i=0;i<n;i++){
        bpos[i*3]=origin.x; bpos[i*3+1]=origin.y; bpos[i*3+2]=origin.z;
        bcol[i*3]=c[0]/255; bcol[i*3+1]=c[1]/255; bcol[i*3+2]=c[2]/255;
        const a = Math.random()*Math.PI*2, sp = 1.2+Math.random()*3.2;
        vel.push([Math.cos(a)*sp, Math.sin(a)*sp, (Math.random()-0.5)*sp]);
      }
      const bgeo = new THREE.BufferGeometry();
      bgeo.setAttribute('position', new THREE.BufferAttribute(bpos,3));
      bgeo.setAttribute('color', new THREE.BufferAttribute(bcol,3));
      const bmat = new THREE.PointsMaterial({size: isLightTheme() ? 5.5 : 5.5, vertexColors:true, transparent:true, opacity: isLightTheme() ? 0.95 : 1, depthWrite:false, blending: isLightTheme() ? THREE.NormalBlending : THREE.AdditiveBlending});
      const points = new THREE.Points(bgeo, bmat);
      scene.add(points);
      bursts.push({obj:points, vel, life:0});
    }
    window.addEventListener('pointerdown', e=>{
      if(e.target.closest('.win, #dock, #shortcuts, #project-overlay, #menubar')) return;
      spawnBurst(e.clientX, e.clientY);
    });

    function onResize(){
      camera.aspect = window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let t = 0;
    function animate(){
      requestAnimationFrame(animate);
      t += 0.01;
      tiltX += (mouseX-tiltX)*0.045;
      tiltY += (mouseY-tiltY)*0.045;

      if(!reduceMotion){
        group.rotation.y = tiltX*0.6;
        group.rotation.x = tiltY*0.35;
        field.rotation.y += 0.0007;
      } else {
        group.rotation.y = tiltX*0.25;
      }

      for(let i=bursts.length-1;i>=0;i--){
        const b = bursts[i];
        b.life++;
        const arr = b.obj.geometry.attributes.position.array;
        for(let j=0;j<b.vel.length;j++){
          arr[j*3]   += b.vel[j][0];
          arr[j*3+1] += b.vel[j][1];
          arr[j*3+2] += b.vel[j][2];
        }
        b.obj.geometry.attributes.position.needsUpdate = true;
        b.obj.material.opacity = Math.max(0, 1 - b.life/52);
        if(b.life > 52){
          scene.remove(b.obj);
          b.obj.geometry.dispose();
          b.obj.material.dispose();
          bursts.splice(i,1);
        }
      }

      renderer.render(scene, camera);
    }
    animate();
  }catch(err){
    document.body.classList.add('no-webgl');
  }
})();
