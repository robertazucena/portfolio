(function(){
"use strict";

/* ============================================================
   Slide definitions
   ============================================================ */
const COLORS = {
  red:[0.91,0.29,0.18], cyan:[0.25,0.85,0.91], magenta:[0.76,0.31,0.88], orange:[0.95,0.64,0.25], mint:[0.36,0.90,0.62]
};
const SLIDES = [
  {
    key:'patch', type:'split', colorVar:'--red', color:COLORS.red,
    badge:'AUTOMATED CYBER PROTECTION',
    title:'Self-Patching',
    desc:"Oracle eliminates critical database downtime by automatically applying updates, patches, and security hotfixes without taking systems offline. Absolute resilience built into core infrastructure.",
    tag:{text:'ACTIVE PATCH REPAIR', c:'cyan'},
    graphic:'patch',
    tab:{label:'Self-Patching', icon:'refresh'}
  },
  {
    key:'vigilant', type:'split', colorVar:'--cyan', color:COLORS.cyan,
    badge:'HYPERVIGILANT DEFENSE',
    title:'Ever Vigilant',
    desc:"Guarding your critical datastores continuously. Oracle's hyperattentive security systems instantly detect intrusion patterns, automatically contain malicious attempts, and mitigate complex threats 24/7.",
    tag:{text:'SECURE SENTINEL', c:'cyan'},
    graphic:'hex',
    tab:{label:'Ever Vigilant', icon:'shield'}
  },
  {
    key:'noerror', type:'split', colorVar:'--magenta', color:COLORS.magenta,
    badge:'ZERO-OPERATION AUTOPILOT',
    title:'No Human Error.<br>No Human Labor.',
    desc:"Zero administration overhead. Automate resource provisioning, security tuning, query indexing, and backups. Minimize human operations to eliminate human error entirely.",
    tag:null,
    graphic:'rings',
    tab:{label:'No Human Error', icon:'cpu'}
  },
  {
    key:'ml', type:'split', colorVar:'--mint', color:COLORS.mint,
    badge:'INTELLIGENT ADAPTATION',
    title:'Machine Learning',
    desc:"Integrated real-time telemetry algorithms proactively analyze workloads and automatically optimize configuration parameters on the fly, delivering unparalleled database performance and efficiency.",
    tag:null,
    graphic:'steps',
    tab:{label:'Machine Learning', icon:'brain'}
  },
  {
    key:'time', type:'center', colorVar:'--magenta', color:COLORS.magenta,
    badge:null,
    title:'It Adds Up to the Greatest Gift of All: <span class="accent" style="color:var(--magenta)">Time</span>',
    desc:"Time to extract more value from your data. Time to create rather than administrate. Complete autonomy starts here.",
    cta:true,
    tab:{label:'Watch Video', icon:'play'}
  }
];

/* "Engineered for Autonomy" is no longer one of the swipeable slides — it now
   opens as its own panel when the header's "Explore Database" button is clicked. */
const EXPLORE_DATA = {
  badge:'CAPABILITIES BRIEF',
  title:'Engineered for Autonomy',
  desc:"Deploy, secure, and scale your workloads globally with the world's first fully self-driving database architecture. Eliminate operational complexity entirely.",
  color:COLORS.cyan,
  cards:[
    {icon:'heal', c:'magenta', title:'Self-Healing Infrastructure', text:'Automatically detects, isolates, and resolves hardware and software failures. Continuous telemetry ensures fail-safes trigger instantly without service disruption.'},
    {icon:'patch', c:'cyan', title:'Zero-Downtime Patching', text:'Deploys critical security updates and firmware patches live. Online structural rolling updates keep your transactional systems online and performing at full throughput.'},
    {icon:'scale', c:'cyan', title:'Automated Scaling', text:'Instantly scales compute and storage resources up or down in response to demand spikes. Pay only for what you run with granular micro-billing active.'},
    {icon:'brain', c:'magenta', title:'Predictive Analytics', text:'Uses integrated machine learning to model query execution patterns. Proactively indexes datasets and allocates cache space before performance bottlenecks occur.'}
  ]
};

const ICONS = {
  refresh:'<path d="M3 12a9 9 0 0115.4-6.3M21 12a9 9 0 01-15.4 6.3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M18 3v5h-5M6 21v-5h5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  shield:'<path d="M12 2l8 3.5v6c0 5-3.4 8.7-8 10.5-4.6-1.8-8-5.5-8-10.5v-6L12 2z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/>',
  cpu:'<rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  brain:'<path d="M9 3a3 3 0 00-3 3 3 3 0 00-2 5 3 3 0 002 5h2M15 3a3 3 0 013 3 3 3 0 012 5 3 3 0 01-2 5h-2M9 3v16M15 3v16" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  play:'<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/><path d="M10 8.5l6 3.5-6 3.5v-7z" fill="currentColor"/>',
  heal:'<path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0112 5.5 5.5 5.5 0 0121.5 12c-2.5 4.65-9.5 9-9.5 9z" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M9 12h2v-2h2v2h2v2h-2v2h-2v-2H9v-2z" fill="currentColor"/>',
  patch:'<path d="M3 12a9 9 0 0115.4-6.3M21 12a9 9 0 01-15.4 6.3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M18 3v5h-5M6 21v-5h5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  scale:'<path d="M4 19h16M7 19V9l5-5 5 5v10" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linejoin="round"/><path d="M10 19v-6h4v6" stroke="currentColor" stroke-width="1.8" fill="none"/>'
};

const CVAR = {red:'--red', cyan:'--cyan', magenta:'--magenta', orange:'--orange'};

/* ============================================================
   Build DOM: slides
   ============================================================ */
const stage = document.getElementById('stage');
const tabsEl = document.getElementById('bottomTabs');

function graphicMarkup(kind, c){
  if(kind === 'patch'){
    return `
    <svg viewBox="0 0 320 320" width="100%" height="100%" style="overflow:visible">
      <g stroke="${c}" stroke-width="2" fill="none" opacity="0.9">
        <line x1="170" y1="30" x2="110" y2="230" stroke-linecap="round"/>
        <line x1="170" y1="30" x2="230" y2="230" stroke-linecap="round"/>
      </g>
      <circle cx="170" cy="30" r="6" fill="${c}"/>
      <circle cx="110" cy="230" r="7" fill="${c}"/>
      <circle cx="230" cy="230" r="7" fill="${c}"/>
      <circle cx="170" cy="150" r="26" fill="${c}" opacity="0.16"/>
      <circle cx="170" cy="150" r="10" fill="${c}"/>
      <circle cx="90" cy="120" r="3.5" fill="${c}" opacity="0.7"/>
      <circle cx="255" cy="90" r="3.5" fill="${c}" opacity="0.7"/>
      <circle cx="245" cy="200" r="4" fill="${c}" opacity="0.6"/>
    </svg>`;
  }
  if(kind === 'hex'){
    const pts = "170,40 250,90 250,190 170,240 90,190 90,90";
    return `
    <svg viewBox="0 0 320 320" width="100%" height="100%" style="overflow:visible">
      <polygon points="${pts}" fill="${c}" opacity="0.10"/>
      <polygon points="${pts}" fill="none" stroke="${c}" stroke-width="2"/>
      <line x1="170" y1="0" x2="170" y2="320" stroke="${c}" stroke-width="1.4" opacity="0.6"/>
      <line x1="10" y1="140" x2="330" y2="140" stroke="${c}" stroke-width="1.4" opacity="0.6"/>
      <line x1="60" y1="60" x2="280" y2="220" stroke="${c}" stroke-width="1.2" opacity="0.4"/>
      <line x1="280" y1="60" x2="60" y2="220" stroke="${c}" stroke-width="1.2" opacity="0.4"/>
      <circle cx="170" cy="140" r="7" fill="${c}"/>
    </svg>`;
  }
  if(kind === 'rings'){
    return `
    <svg viewBox="0 0 320 320" width="100%" height="100%" style="overflow:visible">
      <circle cx="120" cy="110" r="46" fill="none" stroke="#c14fe0" stroke-width="2.4" opacity="0.85"/>
      <circle cx="210" cy="130" r="34" fill="none" stroke="#3fd8e8" stroke-width="2.4" opacity="0.85"/>
      <circle cx="140" cy="210" r="30" fill="none" stroke="#c14fe0" stroke-width="2.4" opacity="0.6"/>
      <circle cx="215" cy="215" r="20" fill="none" stroke="#3fd8e8" stroke-width="2" opacity="0.6"/>
      <rect x="160" y="94" width="6" height="20" fill="#c14fe0"/>
      <rect x="150" y="160" width="20" height="6" fill="#3fd8e8"/>
      <circle cx="165" cy="160" r="3" fill="#fff"/>
    </svg>`;
  }
  if(kind === 'steps'){
    return `
    <svg viewBox="0 0 320 320" width="100%" height="100%" style="overflow:visible">
      <g fill="none" stroke-linecap="round">
        <line x1="255" y1="40"  x2="255" y2="150" stroke="#7c7cf5" stroke-width="2.5"/>
        <line x1="255" y1="150" x2="150" y2="150" stroke="${c}" stroke-width="2.5"/>
        <line x1="150" y1="150" x2="150" y2="215" stroke="#7c7cf5" stroke-width="2.5"/>
        <line x1="150" y1="215" x2="70"  y2="215" stroke="${c}" stroke-width="2.5"/>
        <line x1="70"  y1="215" x2="70"  y2="255" stroke="#7c7cf5" stroke-width="2.5"/>
      </g>
      <circle cx="255" cy="40"  r="3.5" fill="${c}"/>
      <circle cx="255" cy="150" r="5" fill="#7c7cf5"/>
      <circle cx="150" cy="150" r="4" fill="${c}"/>
      <circle cx="150" cy="215" r="5" fill="#7c7cf5"/>
      <circle cx="70"  cy="215" r="4" fill="${c}"/>
      <circle cx="70"  cy="255" r="4" fill="#7c7cf5"/>
      <circle cx="292" cy="230" r="3" fill="${c}" opacity="0.6"/>
      <circle cx="282" cy="270" r="2.5" fill="${c}" opacity="0.5"/>
      <circle cx="118" cy="258" r="3" fill="${c}" opacity="0.6"/>
    </svg>`;
  }
  return '';
}

function capabilitiesMarkup(data){
  const c = `rgb(${Math.round(data.color[0]*255)},${Math.round(data.color[1]*255)},${Math.round(data.color[2]*255)})`;
  const cards = data.cards.map(card => {
    const cc = card.c === 'magenta' ? 'var(--magenta)' : 'var(--cyan)';
    return `
    <div class="cap-card">
      <div class="cap-icon" style="--c:${cc};color:${cc}">
        <svg width="19" height="19" viewBox="0 0 24 24">${ICONS[card.icon]}</svg>
      </div>
      <h3>${card.title}</h3>
      <p>${card.text}</p>
    </div>`;
  }).join('');
  return `
    <div class="cap-head">
      <span class="badge" style="--c:${c}">${data.badge}</span>
      <h1>${data.title}</h1>
      <p class="desc">${data.desc}</p>
    </div>
    <div class="cap-grid">${cards}</div>`;
}

function buildSlideDOM(s, idx){
  const c = `rgb(${Math.round(s.color[0]*255)},${Math.round(s.color[1]*255)},${Math.round(s.color[2]*255)})`;
  const el = document.createElement('section');
  el.className = 'slide' + (s.type==='center' ? ' center' : '') + (s.type==='capabilities' ? ' capabilities' : '');
  el.dataset.index = idx;
  el.style.setProperty('--slide-c', c);

  if(s.type === 'split'){
    el.innerHTML = `
      <div class="slide-grid">
        <div class="col-text layer-fg">
          <span class="badge" style="--c:${c}">${s.badge}</span>
          <h1>${s.title}</h1>
          <p class="desc">${s.desc}</p>
        </div>
        <div class="col-graphic layer-bg">
          <div class="graphic-tilt" data-tilt style="--c:${c}">
            <div class="graphic-glow"></div>
            ${s.tag ? `<div class="tag-pill" style="--c:${c};top:8%;right:6%;"><span class="dot"></span>${s.tag.text}</div>` : ''}
            ${graphicMarkup(s.graphic, c)}
          </div>
        </div>
      </div>`;
  } else if(s.type === 'center'){
    el.innerHTML = `
      <div class="slide-grid">
        <div class="col-text layer-fg">
          <h1>${s.title}</h1>
          <p class="desc">${s.desc}</p>
          <div class="cta-row">
            <button class="btn primary">Test Drive for Free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="btn">Interactive Sandbox</button>
          </div>
        </div>
      </div>`;
  } else if(s.type === 'capabilities'){
    const cards = s.cards.map(card => {
      const cc = card.c === 'magenta' ? 'var(--magenta)' : 'var(--cyan)';
      return `
      <div class="cap-card">
        <div class="cap-icon" style="--c:${cc};color:${cc}">
          <svg width="19" height="19" viewBox="0 0 24 24">${ICONS[card.icon]}</svg>
        </div>
        <h3>${card.title}</h3>
        <p>${card.text}</p>
      </div>`;
    }).join('');
    el.innerHTML = `
      <div class="slide-grid">
        <div class="col-text cap-head layer-fg">
          <span class="badge" style="--c:${c}">${s.badge}</span>
          <h1>${s.title}</h1>
          <p class="desc">${s.desc}</p>
        </div>
        <div class="layer-bg">
          <div class="cap-grid">${cards}</div>
          <div class="cap-dots">
            <span class="d"></span><span class="d"></span>
            <span class="pill">Features</span>
            <span class="d"></span><span class="d"></span>
          </div>
        </div>
      </div>`;
  }
  return el;
}

SLIDES.forEach((s,i)=> stage.appendChild(buildSlideDOM(s,i)) );

/* bottom tabs */
SLIDES.forEach((s,i)=>{
  const c = `rgb(${Math.round(s.color[0]*255)},${Math.round(s.color[1]*255)},${Math.round(s.color[2]*255)})`;
  const b = document.createElement('button');
  b.className = 'tab';
  b.style.setProperty('--c', c);
  b.innerHTML = `<svg viewBox="0 0 24 24">${ICONS[s.tab.icon]}</svg><span class="label">${s.tab.label}</span>`;
  b.addEventListener('click', ()=> goTo(i));
  tabsEl.appendChild(b);
});

/* ============================================================
   Slide transition state machine
   ============================================================ */
let current = 0;
let animating = false;
const slideEls = Array.from(stage.children);
const tabEls = Array.from(tabsEl.children);

/* Horizontal parallax transition: the foreground layer (badge/heading/copy)
   travels further and faster than the background layer (graphic/cards),
   so each slide-change reads as depth sliding across rather than a flat cut.
   Direction follows the nav: next() sweeps content leftward (new slide
   enters from the right), prev() sweeps it rightward. */
const FG_DIST = 190;   // px — foreground layer travel distance
const BG_DIST = 85;    // px — background layer travel distance (slower = feels farther back)
const LEAVE_MS = 560;
const ENTER_MS = 900;

function getLayers(el){
  return { fg: el.querySelectorAll('.layer-fg'), bg: el.querySelectorAll('.layer-bg') };
}
function setLayer(list, x, opacity, transition){
  list.forEach(n=>{
    n.style.transition = transition;
    n.style.transform = `translateX(${x}px)`;
    n.style.opacity = opacity;
  });
}

function applyActive(idx){
  tabEls.forEach((el,i)=> el.classList.toggle('active', i===idx));
  document.documentElement.style.setProperty('--live-c',
    `rgb(${Math.round(SLIDES[idx].color[0]*255)},${Math.round(SLIDES[idx].color[1]*255)},${Math.round(SLIDES[idx].color[2]*255)})`);
}

function goTo(idx){
  idx = ((idx % SLIDES.length) + SLIDES.length) % SLIDES.length;
  if(idx === current || animating) return;
  animating = true;

  // wrap-aware travel direction: 1 = advancing (sweep left), -1 = reversing (sweep right)
  let dir = idx > current ? 1 : -1;
  if(Math.abs(idx - current) === SLIDES.length - 1) dir = -dir;

  const outEl = slideEls[current];
  const inEl = slideEls[idx];
  outEl.style.zIndex = '1';
  inEl.style.zIndex = '2';

  // Safety net against stale/ghost slides: iOS Safari can throttle or drop
  // setTimeout callbacks when the tab is backgrounded, screen-locked, or the
  // app is switched away from mid-transition. If that happens, the setTimeout
  // below that removes 'active' from a previous outEl never fires, and that
  // old slide is left sitting at opacity:1 underneath everything — which is
  // what shows up as ghosted/double-exposed content behind the current slide.
  // Forcing every non-current, non-incoming slide back to inactive here
  // guarantees at most two slides are ever visible, regardless of any missed
  // timers from earlier transitions.
  slideEls.forEach(el=>{ if(el !== outEl && el !== inEl) el.classList.remove('active'); });

  const outLayers = getLayers(outEl);
  const inLayers = getLayers(inEl);
  const leaveT = `transform ${LEAVE_MS}ms cubic-bezier(.4,0,.2,1), opacity ${Math.round(LEAVE_MS*0.85)}ms ease`;

  // outgoing layers slide out in the direction of travel
  setLayer(outLayers.fg, -dir * FG_DIST, 0, leaveT);
  setLayer(outLayers.bg, -dir * BG_DIST, 0, leaveT);

  // incoming layers are placed off-screen on the opposite side, instantly (no transition)
  setLayer(inLayers.fg, dir * FG_DIST, 0, 'none');
  setLayer(inLayers.bg, dir * BG_DIST, 0, 'none');
  inEl.classList.add('active');

  navImpulse += dir * 1.4; // kick the ambient camera/floater pan the same direction

  // force a reflow so the instant offset above is committed before we animate to rest
  void inEl.offsetHeight;
  requestAnimationFrame(()=> requestAnimationFrame(()=>{
    const enterT = `transform ${ENTER_MS}ms cubic-bezier(.19,.62,.24,1), opacity ${Math.round(ENTER_MS*0.9)}ms ease-out`;
    setLayer(inLayers.fg, 0, 1, enterT);
    setLayer(inLayers.bg, 0, 1, enterT);
  }));

  current = idx;
  applyActive(current);
  startColorTransition(SLIDES[current].color);

  // Just hide the outgoing slide once its leave animation has finished — do NOT
  // snap its layers back to a resting (visible, centered) state here. They're
  // already sitting at opacity 0 from the leave transition; any future goTo()
  // that reuses this slide as the *incoming* one explicitly overwrites their
  // transform/opacity before it becomes visible again, so no reset is needed.
  // (Resetting to opacity:1 here previously caused a visible "flash" of the
  // old content snapping back into place for an instant before it hid.)
  setTimeout(()=>{
    outEl.classList.remove('active');
  }, LEAVE_MS);

  setTimeout(()=>{ animating = false; }, ENTER_MS + 40);
}

document.getElementById('nextBtn').addEventListener('click', ()=> goTo(current+1));
document.getElementById('prevBtn').addEventListener('click', ()=> goTo(current-1));
window.addEventListener('keydown', e=>{
  if(chatPanel.classList.contains('open')){
    if(e.key === 'Escape') closeChat();
    return;
  }
  if(explorePanel.classList.contains('open')){
    if(e.key === 'Escape') closeExplore();
    return;
  }
  if(e.key === 'ArrowRight') goTo(current+1);
  if(e.key === 'ArrowLeft') goTo(current-1);
});

/* ============================================================
   "Explore Database" panel — shows the capabilities brief on demand
   instead of it being one of the swipeable slides.
   ============================================================ */
const explorePanel = document.getElementById('explorePanel');
document.getElementById('exploreContent').innerHTML = capabilitiesMarkup(EXPLORE_DATA);

function openExplore(){
  explorePanel.classList.add('open');
  explorePanel.setAttribute('aria-hidden', 'false');
}
function closeExplore(){
  explorePanel.classList.remove('open');
  explorePanel.setAttribute('aria-hidden', 'true');
}
document.getElementById('exploreBtn').addEventListener('click', openExplore);
document.getElementById('exploreClose').addEventListener('click', closeExplore);
document.getElementById('exploreBackdrop').addEventListener('click', closeExplore);

/* ============================================================
   "Talk to Expert" chat panel — static preview UI, slides in from
   the left over a blurred backdrop. Not wired to any real backend.
   ============================================================ */
const chatPanel = document.getElementById('chatPanel');
function openChat(){
  chatPanel.classList.add('open');
  chatPanel.setAttribute('aria-hidden', 'false');
}
function closeChat(){
  chatPanel.classList.remove('open');
  chatPanel.setAttribute('aria-hidden', 'true');
}
document.getElementById('talkBtn').addEventListener('click', openChat);
document.getElementById('chatClose').addEventListener('click', closeChat);
document.getElementById('chatBackdrop').addEventListener('click', closeChat);

/* wheel/swipe gesture navigation — desktop/tablet only.
   On narrow (mobile) viewports slides can scroll internally, so gesture-based
   slide switching is disabled there in favor of the tab bar / arrow buttons. */
function gesturesEnabled(){ return window.innerWidth > 760; }

let wheelLock = false;
window.addEventListener('wheel', (e)=>{
  if(!gesturesEnabled()) return;
  if(wheelLock) return;
  if(Math.abs(e.deltaY) < 18) return;
  wheelLock = true;
  if(e.deltaY > 0) goTo(current+1); else goTo(current-1);
  setTimeout(()=> wheelLock = false, 700);
}, {passive:true});

/* touch swipe */
let touchStartY = null;
window.addEventListener('touchstart', e=>{
  if(!gesturesEnabled()) return;
  touchStartY = e.touches[0].clientY;
}, {passive:true});
window.addEventListener('touchend', e=>{
  if(!gesturesEnabled() || touchStartY===null) return;
  const dy = touchStartY - e.changedTouches[0].clientY;
  if(Math.abs(dy) > 50){ if(dy>0) goTo(current+1); else goTo(current-1); }
  touchStartY = null;
}, {passive:true});

/* autoplay */
let autoplayTimer = null;
function resetAutoplay(){
  clearTimeout(autoplayTimer);
  autoplayTimer = setTimeout(()=> goTo(current+1), 7000);
}
['click','keydown','wheel','touchstart'].forEach(evt=> window.addEventListener(evt, resetAutoplay, {passive:true}));
resetAutoplay();

/* ============================================================
   Floating decorative shapes + stars
   ============================================================ */
const floatersEl = document.getElementById('floaters');
const SHAPES = [
  {shape:'hex', x:'6%', y:'20%', size:34, color:'#3fd8e8', depth:0.35, cls:'bob'},
  {shape:'diamond', x:'92%', y:'16%', size:22, color:'#3fd8e8', depth:0.55, cls:'bob rev'},
  {shape:'star', x:'38%', y:'7%', size:16, color:'#c14fe0', depth:0.25, cls:'bob slow'},
  {shape:'triangle', x:'8%', y:'52%', size:20, color:'#5fe8a0', depth:0.45, cls:'bob rev slow'},
  {shape:'pentagon', x:'50%', y:'86%', size:18, color:'#5fe8a0', depth:0.3, cls:'bob'},
  {shape:'circle', x:'94%', y:'80%', size:26, color:'#e8492f', depth:0.6, cls:'bob slow rev'},
  {shape:'diamond', x:'2%', y:'82%', size:14, color:'#f2a33f', depth:0.5, cls:'bob'},
  {shape:'star', x:'88%', y:'46%', size:12, color:'#c14fe0', depth:0.4, cls:'bob rev'},
  /* faceted "crystal" rocks — the low-poly floating shapes from the mood ref,
     scattered mostly along the upper edges so they read against the grid floor */
  {shape:'crystal', x:'16%', y:'10%', size:40, color:'#3fd8e8', depth:0.22, cls:'bob slow'},
  {shape:'crystal', x:'27%', y:'30%', size:24, color:'#3fd8e8', depth:0.5, cls:'bob rev'},
  {shape:'crystal', x:'80%', y:'8%', size:34, color:'#3fd8e8', depth:0.28, cls:'bob rev slow'},
  {shape:'crystal', x:'72%', y:'34%', size:20, color:'#f2a33f', depth:0.46, cls:'bob'},
  {shape:'crystal', x:'12%', y:'68%', size:22, color:'#3fd8e8', depth:0.4, cls:'bob slow rev'},
  {shape:'crystal', x:'96%', y:'62%', size:30, color:'#3fd8e8', depth:0.33, cls:'bob'},
];
function shapeSVG(kind, size, color){
  const s = size;
  switch(kind){
    case 'hex': return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" style="color:${color}"><polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
    case 'diamond': return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" style="color:${color}"><polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
    case 'star': return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" style="color:${color}"><path d="M12 1l3 7 7 .8-5.3 4.8 1.6 7L12 17l-6.3 3.6 1.6-7L2 8.8 9 8z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`;
    case 'triangle': return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" style="color:${color}"><polygon points="12,3 21,20 3,20" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
    case 'pentagon': return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" style="color:${color}"><polygon points="12,2 22,9.5 18,21 6,21 2,9.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
    case 'circle': return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" style="color:${color}"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
    case 'crystal': return `<svg width="${s}" height="${s}" viewBox="0 0 40 40" style="color:${color}">
      <polygon points="20,3 35,15 20,21 5,15" fill="currentColor" opacity="0.20"/>
      <polygon points="20,21 35,15 27,36 20,39" fill="currentColor" opacity="0.55"/>
      <polygon points="20,21 5,15 13,36 20,39" fill="currentColor" opacity="0.10"/>
      <polygon points="20,3 35,15 20,21 5,15" fill="none" stroke="currentColor" stroke-width="1"/>
      <polygon points="20,21 35,15 27,36 20,39" fill="none" stroke="currentColor" stroke-width="1"/>
      <polygon points="20,21 5,15 13,36 20,39" fill="none" stroke="currentColor" stroke-width="1"/>
      <line x1="20" y1="21" x2="20" y2="3" stroke="currentColor" stroke-width="0.75" opacity="0.6"/>
    </svg>`;
  }
  return '';
}
const floaterNodes = SHAPES.map(cfg=>{
  const wrap = document.createElement('div');
  wrap.className = 'floater';
  wrap.style.left = cfg.x; wrap.style.top = cfg.y;
  wrap.style.color = cfg.color;
  wrap.dataset.depth = cfg.depth;
  const inner = document.createElement('div');
  inner.className = cfg.cls;
  inner.innerHTML = shapeSVG(cfg.shape, cfg.size, cfg.color);
  wrap.appendChild(inner);
  floatersEl.appendChild(wrap);
  return wrap;
});

const starsEl = document.getElementById('stars');
for(let i=0;i<28;i++){
  const d = document.createElement('div');
  d.className = 'star-dot';
  d.style.left = (Math.random()*100)+'%';
  d.style.top = (Math.random()*70)+'%';
  d.style.animationDelay = (Math.random()*4)+'s';
  starsEl.appendChild(d);
}

/* ============================================================
   Pointer-driven parallax + 3D tilt
   ============================================================ */
let px = 0, py = 0;        // raw pointer -1..1
let tpx = 0, tpy = 0;      // smoothed
let idleT = 0;
let navImpulse = 0;        // brief camera/floater pan kicked by goTo(), decays each frame

// True on phones/tablets — no real pointer to react to, only the subtle idle
// drift. On these devices we still want the ambient motion of the floaters,
// but the per-icon .graphic-tilt element is a 3D-transformed parent that
// contains a filter:blur() + mix-blend-mode:screen glow child. Rewriting a
// 3D parent's transform every animation frame forces iOS Safari to
// re-rasterize that blurred/blended child on every frame instead of just
// repositioning a cached layer — that constant re-rasterization is what
// shows up as strobing/flicker on the icon graphics on real phones (this
// doesn't reproduce on desktop/simulator because desktop GPUs composite it
// more cheaply). Since a touch device has no pointer to tilt toward anyway,
// we skip the per-frame rewrite there entirely and let the glow's own CSS
// keyframe animation (glowPulse) provide all of its motion instead.
const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

window.addEventListener('mousemove', e=>{
  px = (e.clientX / window.innerWidth) * 2 - 1;
  py = (e.clientY / window.innerHeight) * 2 - 1;
});
window.addEventListener('mouseleave', ()=>{ px = 0; py = 0; });

function tickParallax(){
  // On touch devices there's no real pointer driving any of this — it's all
  // idle sine/cosine drift for ambient motion. That's not worth what it
  // costs: every frame here was rewriting inline `transform` on 14 floaters
  // (each with a CSS `transition:transform 0.15s linear`, so the 16ms-later
  // JS write interrupts that transition before it finishes — stacking
  // dozens of overlapping, never-completing transitions), plus #stage and
  // #gridFloor, several of which sit under filter:drop-shadow/blur layers.
  // That combination of constant transform writes + interrupted transitions
  // + expensive filters is what was still flickering on real phones even
  // after gating the icon-glow tilt alone. Freezing all of it on touch
  // devices and leaning on the existing CSS keyframe animations (bob,
  // twinkle, glowPulse) for ambient motion removes that load entirely while
  // keeping the scene from looking static.
  if(isCoarsePointer) return;

  // idle auto-drift when pointer is centered/inactive (desktop only now)
  idleT += 0.006;
  const idleX = Math.sin(idleT) * 0.15;
  const idleY = Math.cos(idleT*0.8) * 0.1;
  const targetX = px !== 0 ? px : idleX;
  const targetY = py !== 0 ? py : idleY;

  tpx += (targetX - tpx) * 0.06;
  tpy += (targetY - tpy) * 0.06;
  navImpulse *= 0.91; // decay the slide-change pan kick

  floaterNodes.forEach(node=>{
    const depth = parseFloat(node.dataset.depth);
    const mx = tpx * 42 * depth + navImpulse * 46 * depth;
    const my = tpy * 34 * depth;
    const rotY = tpx * 16 * depth;
    const rotX = -tpy * 12 * depth;
    const tz = (depth - 0.38) * 70; // shallower depth = pushed forward, deeper = recedes
    node.style.transform = `translate3d(${mx}px, ${my}px, ${tz.toFixed(1)}px) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg)`;
  });

  const activeGraphic = stage.querySelector('.slide.active [data-tilt]');
  if(activeGraphic){
    activeGraphic.style.transform = `rotateX(${(-tpy*10).toFixed(2)}deg) rotateY(${(tpx*14 - navImpulse*10).toFixed(2)}deg) translateZ(20px)`;
  }
  stage.style.transform = `rotateX(${(-tpy*1.6).toFixed(2)}deg) rotateY(${(tpx*2.2 - navImpulse*2.8).toFixed(2)}deg)`;

  // the grid floor is the "ground plane" of the scene, so it gets the largest,
  // most obvious parallax throw — plus a slight scale breathing on nav impulses
  // so slide changes read as a little camera dolly across the floor.
  // kept intentionally understated — this should read as an ambient, mostly-still
  // backdrop, not something actively sliding around.
  document.getElementById('gridFloor').style.transform =
    `rotateX(62deg) translateX(${(tpx*8 + navImpulse*10).toFixed(1)}px) translateY(${(tpy*4).toFixed(1)}px)`;

  requestAnimationFrame(tickParallax);
}
requestAnimationFrame(tickParallax);

/* ============================================================
   WebGL neural-noise background
   ============================================================ */
(function initGL(){
  const canvas = document.getElementById('neuro');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if(!gl){ canvas.style.display='none'; return; }

  const vertSrc = `
    attribute vec2 a_position;
    varying vec2 vUv;
    void main(){
      vUv = 0.5 * (a_position + 1.0);
      gl_Position = vec4(a_position, 0.0, 1.0);
    }`;
  /* Many real mobile GPUs actually honor "mediump" (desktop GPUs/ANGLE mostly
     don't, which is why this looked fine in a resized desktop browser but
     broke on an actual phone). The accumulated rotate()/sin()/cos() calls
     below compound across 15 octaves with an ever-growing time value, and in
     true mediump precision that accumulation drifts and blows up into a
     bright, wrongly-placed streak — exactly the "glow in the wrong position"
     symptom, and it's GPU-dependent so it won't reproduce in an emulator
     that's really still running on a desktop GPU. Forcing highp (with the
     standard fallback for the rare GPU that lacks it in fragment shaders)
     fixes it at the source. */
  const fragSrc = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
    #else
      precision mediump float;
    #endif
    varying vec2 vUv;
    uniform float u_time;
    uniform float u_ratio;
    uniform vec2 u_pointer;
    uniform vec3 u_color_from;
    uniform vec3 u_color_to;
    uniform float u_color_mix;

    vec2 rotate(vec2 uv, float th){
      return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
    }
    float neuro(vec2 uv, float t, float p){
      vec2 sine_acc = vec2(0.);
      vec2 res = vec2(0.);
      float scale = 8.;
      for(int j=0;j<15;j++){
        uv = rotate(uv, 1.0);
        sine_acc = rotate(sine_acc, 1.0);
        vec2 layer = uv * scale + float(j) + sine_acc - t;
        sine_acc += sin(layer) + 2.4 * p;
        res += (0.5 + 0.5*cos(layer)) / scale;
        scale *= 1.2;
      }
      return res.x + res.y;
    }
    void main(){
      vec2 uv = 0.5 * vUv;
      uv.x *= u_ratio;
      vec2 pointer = vUv - u_pointer;
      pointer.x *= u_ratio;
      float p = clamp(length(pointer), 0.0, 1.0);
      p = 0.5 * pow(1.0 - p, 2.0);
      float t = 0.0009 * u_time;
      float noise = neuro(uv, t, p);
      noise = 1.2 * pow(noise, 3.0);
      noise += pow(noise, 10.0);
      noise = max(0.0, noise - 0.5);
      noise *= (1.0 - length(vUv - 0.5));
      vec3 base = mix(u_color_from, u_color_to, u_color_mix);
      vec3 color = base * noise;
      gl_FragColor = vec4(color, noise * 0.95);
    }`;

  function compile(type, src){
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
      console.error(gl.getShaderInfoLog(sh));
    }
    return sh;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const u_time = gl.getUniformLocation(prog, 'u_time');
  const u_ratio = gl.getUniformLocation(prog, 'u_ratio');
  const u_pointer = gl.getUniformLocation(prog, 'u_pointer');
  const u_color_from = gl.getUniformLocation(prog, 'u_color_from');
  const u_color_to = gl.getUniformLocation(prog, 'u_color_to');
  const u_color_mix = gl.getUniformLocation(prog, 'u_color_mix');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  function resize(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    gl.viewport(0,0,canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  // color transition state, exposed to goTo()
  let colFrom = SLIDES[0].color.slice();
  let colTo = SLIDES[0].color.slice();
  let colStart = 0, colDur = 900, mixT = 1;

  window.startColorTransition = function(target){
    // snapshot current interpolated color as the new "from"
    const cur = [
      colFrom[0] + (colTo[0]-colFrom[0]) * easeInOutCubic(mixT),
      colFrom[1] + (colTo[1]-colFrom[1]) * easeInOutCubic(mixT),
      colFrom[2] + (colTo[2]-colFrom[2]) * easeInOutCubic(mixT)
    ];
    colFrom = cur;
    colTo = target.slice();
    colStart = performance.now();
    mixT = 0;
  };
  function easeInOutCubic(t){ return t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }

  const pointerSmooth = {x:0.5, y:0.5};

  function frame(t){
    resize.lastW = window.innerWidth;
    const now = performance.now();
    mixT = colDur > 0 ? Math.min(1, (now - colStart) / colDur) : 1;
    const em = easeInOutCubic(mixT);

    // pointer target: use tpx/tpy from parallax loop, remapped to 0..1
    const targetX = 0.5 + (tpx * 0.5);
    const targetY = 0.5 - (tpy * 0.5);
    pointerSmooth.x += (targetX - pointerSmooth.x) * 0.05;
    pointerSmooth.y += (targetY - pointerSmooth.y) * 0.05;

    gl.useProgram(prog);
    gl.uniform1f(u_time, t);
    gl.uniform1f(u_ratio, canvas.width / canvas.height);
    gl.uniform2f(u_pointer, pointerSmooth.x, pointerSmooth.y);
    gl.uniform3f(u_color_from, colFrom[0], colFrom[1], colFrom[2]);
    gl.uniform3f(u_color_to, colTo[0], colTo[1], colTo[2]);
    gl.uniform1f(u_color_mix, em);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* init */
slideEls[0].classList.add('active');
applyActive(0);

/* preloader — hold briefly so the flip + bar are actually seen, then fade it out */
const preloaderEl = document.getElementById('preloader');
window.addEventListener('load', ()=>{
  setTimeout(()=>{
    preloaderEl.classList.add('hide');
  }, 1900);
});
// fallback in case the load event already fired or never fires cleanly
setTimeout(()=>{ preloaderEl.classList.add('hide'); }, 2600);

})();