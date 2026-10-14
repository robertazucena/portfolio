(function(){"use strict";const m={red:[.91,.29,.18],cyan:[.25,.85,.91],magenta:[.76,.31,.88],orange:[.95,.64,.25],mint:[.36,.9,.62]},c=[{key:"patch",type:"split",colorVar:"--red",color:m.red,badge:"AUTOMATED CYBER PROTECTION",title:"Self-Patching",desc:"Oracle eliminates critical database downtime by automatically applying updates, patches, and security hotfixes without taking systems offline. Absolute resilience built into core infrastructure.",tag:{text:"ACTIVE PATCH REPAIR",c:"cyan"},graphic:"patch",tab:{label:"Self-Patching",icon:"refresh"}},{key:"vigilant",type:"split",colorVar:"--cyan",color:m.cyan,badge:"HYPERVIGILANT DEFENSE",title:"Ever Vigilant",desc:"Guarding your critical datastores continuously. Oracle's hyperattentive security systems instantly detect intrusion patterns, automatically contain malicious attempts, and mitigate complex threats 24/7.",tag:{text:"SECURE SENTINEL",c:"cyan"},graphic:"hex",tab:{label:"Ever Vigilant",icon:"shield"}},{key:"noerror",type:"split",colorVar:"--magenta",color:m.magenta,badge:"ZERO-OPERATION AUTOPILOT",title:"No Human Error.<br>No Human Labor.",desc:"Zero administration overhead. Automate resource provisioning, security tuning, query indexing, and backups. Minimize human operations to eliminate human error entirely.",tag:null,graphic:"rings",tab:{label:"No Human Error",icon:"cpu"}},{key:"ml",type:"split",colorVar:"--mint",color:m.mint,badge:"INTELLIGENT ADAPTATION",title:"Machine Learning",desc:"Integrated real-time telemetry algorithms proactively analyze workloads and automatically optimize configuration parameters on the fly, delivering unparalleled database performance and efficiency.",tag:null,graphic:"steps",tab:{label:"Machine Learning",icon:"brain"}},{key:"time",type:"center",colorVar:"--magenta",color:m.magenta,badge:null,title:'It Adds Up to the Greatest Gift of All: <span class="accent" style="color:var(--magenta)">Time</span>',desc:"Time to extract more value from your data. Time to create rather than administrate. Complete autonomy starts here.",cta:!0,tab:{label:"Watch Video",icon:"play"}}],ae={badge:"CAPABILITIES BRIEF",title:"Engineered for Autonomy",desc:"Deploy, secure, and scale your workloads globally with the world's first fully self-driving database architecture. Eliminate operational complexity entirely.",color:m.cyan,cards:[{icon:"heal",c:"magenta",title:"Self-Healing Infrastructure",text:"Automatically detects, isolates, and resolves hardware and software failures. Continuous telemetry ensures fail-safes trigger instantly without service disruption."},{icon:"patch",c:"cyan",title:"Zero-Downtime Patching",text:"Deploys critical security updates and firmware patches live. Online structural rolling updates keep your transactional systems online and performing at full throughput."},{icon:"scale",c:"cyan",title:"Automated Scaling",text:"Instantly scales compute and storage resources up or down in response to demand spikes. Pay only for what you run with granular micro-billing active."},{icon:"brain",c:"magenta",title:"Predictive Analytics",text:"Uses integrated machine learning to model query execution patterns. Proactively indexes datasets and allocates cache space before performance bottlenecks occur."}]},B={refresh:'<path d="M3 12a9 9 0 0115.4-6.3M21 12a9 9 0 01-15.4 6.3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M18 3v5h-5M6 21v-5h5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',shield:'<path d="M12 2l8 3.5v6c0 5-3.4 8.7-8 10.5-4.6-1.8-8-5.5-8-10.5v-6L12 2z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',brain:'<path d="M9 3a3 3 0 00-3 3 3 3 0 00-2 5 3 3 0 002 5h2M15 3a3 3 0 013 3 3 3 0 012 5 3 3 0 01-2 5h-2M9 3v16M15 3v16" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',play:'<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/><path d="M10 8.5l6 3.5-6 3.5v-7z" fill="currentColor"/>',heal:'<path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0112 5.5 5.5 5.5 0 0121.5 12c-2.5 4.65-9.5 9-9.5 9z" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M9 12h2v-2h2v2h2v2h-2v2h-2v-2H9v-2z" fill="currentColor"/>',patch:'<path d="M3 12a9 9 0 0115.4-6.3M21 12a9 9 0 01-15.4 6.3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M18 3v5h-5M6 21v-5h5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',scale:'<path d="M4 19h16M7 19V9l5-5 5 5v10" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linejoin="round"/><path d="M10 19v-6h4v6" stroke="currentColor" stroke-width="1.8" fill="none"/>'},ke={red:"--red",cyan:"--cyan",magenta:"--magenta",orange:"--orange"},E=document.getElementById("stage"),X=document.getElementById("bottomTabs");function se(e,o){if(e==="patch")return`
    <svg viewBox="0 0 320 320" width="100%" height="100%" style="overflow:visible">
      <g stroke="${o}" stroke-width="2" fill="none" opacity="0.9">
        <line x1="170" y1="30" x2="110" y2="230" stroke-linecap="round"/>
        <line x1="170" y1="30" x2="230" y2="230" stroke-linecap="round"/>
      </g>
      <circle cx="170" cy="30" r="6" fill="${o}"/>
      <circle cx="110" cy="230" r="7" fill="${o}"/>
      <circle cx="230" cy="230" r="7" fill="${o}"/>
      <circle cx="170" cy="150" r="26" fill="${o}" opacity="0.16"/>
      <circle cx="170" cy="150" r="10" fill="${o}"/>
      <circle cx="90" cy="120" r="3.5" fill="${o}" opacity="0.7"/>
      <circle cx="255" cy="90" r="3.5" fill="${o}" opacity="0.7"/>
      <circle cx="245" cy="200" r="4" fill="${o}" opacity="0.6"/>
    </svg>`;if(e==="hex"){const t="170,40 250,90 250,190 170,240 90,190 90,90";return`
    <svg viewBox="0 0 320 320" width="100%" height="100%" style="overflow:visible">
      <polygon points="${t}" fill="${o}" opacity="0.10"/>
      <polygon points="${t}" fill="none" stroke="${o}" stroke-width="2"/>
      <line x1="170" y1="0" x2="170" y2="320" stroke="${o}" stroke-width="1.4" opacity="0.6"/>
      <line x1="10" y1="140" x2="330" y2="140" stroke="${o}" stroke-width="1.4" opacity="0.6"/>
      <line x1="60" y1="60" x2="280" y2="220" stroke="${o}" stroke-width="1.2" opacity="0.4"/>
      <line x1="280" y1="60" x2="60" y2="220" stroke="${o}" stroke-width="1.2" opacity="0.4"/>
      <circle cx="170" cy="140" r="7" fill="${o}"/>
    </svg>`}return e==="rings"?`
    <svg viewBox="0 0 320 320" width="100%" height="100%" style="overflow:visible">
      <circle cx="120" cy="110" r="46" fill="none" stroke="#c14fe0" stroke-width="2.4" opacity="0.85"/>
      <circle cx="210" cy="130" r="34" fill="none" stroke="#3fd8e8" stroke-width="2.4" opacity="0.85"/>
      <circle cx="140" cy="210" r="30" fill="none" stroke="#c14fe0" stroke-width="2.4" opacity="0.6"/>
      <circle cx="215" cy="215" r="20" fill="none" stroke="#3fd8e8" stroke-width="2" opacity="0.6"/>
      <rect x="160" y="94" width="6" height="20" fill="#c14fe0"/>
      <rect x="150" y="160" width="20" height="6" fill="#3fd8e8"/>
      <circle cx="165" cy="160" r="3" fill="#fff"/>
    </svg>`:e==="steps"?`
    <svg viewBox="0 0 320 320" width="100%" height="100%" style="overflow:visible">
      <g fill="none" stroke-linecap="round">
        <line x1="255" y1="40"  x2="255" y2="150" stroke="#7c7cf5" stroke-width="2.5"/>
        <line x1="255" y1="150" x2="150" y2="150" stroke="${o}" stroke-width="2.5"/>
        <line x1="150" y1="150" x2="150" y2="215" stroke="#7c7cf5" stroke-width="2.5"/>
        <line x1="150" y1="215" x2="70"  y2="215" stroke="${o}" stroke-width="2.5"/>
        <line x1="70"  y1="215" x2="70"  y2="255" stroke="#7c7cf5" stroke-width="2.5"/>
      </g>
      <circle cx="255" cy="40"  r="3.5" fill="${o}"/>
      <circle cx="255" cy="150" r="5" fill="#7c7cf5"/>
      <circle cx="150" cy="150" r="4" fill="${o}"/>
      <circle cx="150" cy="215" r="5" fill="#7c7cf5"/>
      <circle cx="70"  cy="215" r="4" fill="${o}"/>
      <circle cx="70"  cy="255" r="4" fill="#7c7cf5"/>
      <circle cx="292" cy="230" r="3" fill="${o}" opacity="0.6"/>
      <circle cx="282" cy="270" r="2.5" fill="${o}" opacity="0.5"/>
      <circle cx="118" cy="258" r="3" fill="${o}" opacity="0.6"/>
    </svg>`:""}function le(e){const o=`rgb(${Math.round(e.color[0]*255)},${Math.round(e.color[1]*255)},${Math.round(e.color[2]*255)})`,t=e.cards.map(r=>{const a=r.c==="magenta"?"var(--magenta)":"var(--cyan)";return`
    <div class="cap-card">
      <div class="cap-icon" style="--c:${a};color:${a}">
        <svg width="19" height="19" viewBox="0 0 24 24">${B[r.icon]}</svg>
      </div>
      <h3>${r.title}</h3>
      <p>${r.text}</p>
    </div>`}).join("");return`
    <div class="cap-head">
      <span class="badge" style="--c:${o}">${e.badge}</span>
      <h1>${e.title}</h1>
      <p class="desc">${e.desc}</p>
    </div>
    <div class="cap-grid">${t}</div>`}function ce(e,o){const t=`rgb(${Math.round(e.color[0]*255)},${Math.round(e.color[1]*255)},${Math.round(e.color[2]*255)})`,r=document.createElement("section");if(r.className="slide"+(e.type==="center"?" center":"")+(e.type==="capabilities"?" capabilities":""),r.dataset.index=o,r.style.setProperty("--slide-c",t),e.type==="split")r.innerHTML=`
      <div class="slide-grid">
        <div class="col-text layer-fg">
          <span class="badge" style="--c:${t}">${e.badge}</span>
          <h1>${e.title}</h1>
          <p class="desc">${e.desc}</p>
        </div>
        <div class="col-graphic layer-bg">
          <div class="graphic-tilt" data-tilt style="--c:${t}">
            <div class="graphic-glow"></div>
            ${e.tag?`<div class="tag-pill" style="--c:${t};top:8%;right:6%;"><span class="dot"></span>${e.tag.text}</div>`:""}
            ${se(e.graphic,t)}
          </div>
        </div>
      </div>`;else if(e.type==="center")r.innerHTML=`
      <div class="slide-grid">
        <div class="col-text layer-fg">
          <h1>${e.title}</h1>
          <p class="desc">${e.desc}</p>
          <div class="cta-row">
            <button class="btn primary">Test Drive for Free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="btn">Interactive Sandbox</button>
          </div>
        </div>
      </div>`;else if(e.type==="capabilities"){const a=e.cards.map(s=>{const i=s.c==="magenta"?"var(--magenta)":"var(--cyan)";return`
      <div class="cap-card">
        <div class="cap-icon" style="--c:${i};color:${i}">
          <svg width="19" height="19" viewBox="0 0 24 24">${B[s.icon]}</svg>
        </div>
        <h3>${s.title}</h3>
        <p>${s.text}</p>
      </div>`}).join("");r.innerHTML=`
      <div class="slide-grid">
        <div class="col-text cap-head layer-fg">
          <span class="badge" style="--c:${t}">${e.badge}</span>
          <h1>${e.title}</h1>
          <p class="desc">${e.desc}</p>
        </div>
        <div class="layer-bg">
          <div class="cap-grid">${a}</div>
          <div class="cap-dots">
            <span class="d"></span><span class="d"></span>
            <span class="pill">Features</span>
            <span class="d"></span><span class="d"></span>
          </div>
        </div>
      </div>`}return r}c.forEach((e,o)=>E.appendChild(ce(e,o))),c.forEach((e,o)=>{const t=`rgb(${Math.round(e.color[0]*255)},${Math.round(e.color[1]*255)},${Math.round(e.color[2]*255)})`,r=document.createElement("button");r.className="tab",r.style.setProperty("--c",t),r.innerHTML=`<svg viewBox="0 0 24 24">${B[e.tab.icon]}</svg><span class="label">${e.tab.label}</span>`,r.addEventListener("click",()=>d(o)),X.appendChild(r)});let n=0,S=!1;const L=Array.from(E.children),de=Array.from(X.children),j=190,q=85,P=560,F=900;function W(e){return{fg:e.querySelectorAll(".layer-fg"),bg:e.querySelectorAll(".layer-bg")}}function v(e,o,t,r){e.forEach(a=>{a.style.transition=r,a.style.transform=`translateX(${o}px)`,a.style.opacity=t})}function Z(e){de.forEach((o,t)=>o.classList.toggle("active",t===e)),document.documentElement.style.setProperty("--live-c",`rgb(${Math.round(c[e].color[0]*255)},${Math.round(c[e].color[1]*255)},${Math.round(c[e].color[2]*255)})`)}function d(e){if(e=(e%c.length+c.length)%c.length,e===n||S)return;S=!0;let o=e>n?1:-1;Math.abs(e-n)===c.length-1&&(o=-o);const t=L[n],r=L[e];t.style.zIndex="1",r.style.zIndex="2",L.forEach(h=>{h!==t&&h!==r&&h.classList.remove("active")});const a=W(t),s=W(r),i=`transform ${P}ms cubic-bezier(.4,0,.2,1), opacity ${Math.round(P*.85)}ms ease`;v(a.fg,-o*j,0,i),v(a.bg,-o*q,0,i),v(s.fg,o*j,0,"none"),v(s.bg,o*q,0,"none"),r.classList.add("active"),w+=o*1.4,r.offsetHeight,requestAnimationFrame(()=>requestAnimationFrame(()=>{const h=`transform ${F}ms cubic-bezier(.19,.62,.24,1), opacity ${Math.round(F*.9)}ms ease-out`;v(s.fg,0,1,h),v(s.bg,0,1,h)})),n=e,Z(n),startColorTransition(c[n].color),setTimeout(()=>{t.classList.remove("active")},P),setTimeout(()=>{S=!1},F+40)}document.getElementById("nextBtn").addEventListener("click",()=>d(n+1)),document.getElementById("prevBtn").addEventListener("click",()=>d(n-1)),window.addEventListener("keydown",e=>{if($.classList.contains("open")){e.key==="Escape"&&z();return}if(k.classList.contains("open")){e.key==="Escape"&&R();return}e.key==="ArrowRight"&&d(n+1),e.key==="ArrowLeft"&&d(n-1)});const k=document.getElementById("explorePanel");document.getElementById("exploreContent").innerHTML=le(ae);function J(){k.classList.add("open"),k.setAttribute("aria-hidden","false")}function R(){k.classList.remove("open"),k.setAttribute("aria-hidden","true")}document.getElementById("exploreBtn").addEventListener("click",J),document.getElementById("exploreClose").addEventListener("click",R),document.getElementById("exploreBackdrop").addEventListener("click",R);const $=document.getElementById("chatPanel");function K(){$.classList.add("open"),$.setAttribute("aria-hidden","false")}function z(){$.classList.remove("open"),$.setAttribute("aria-hidden","true")}document.getElementById("talkBtn").addEventListener("click",K),document.getElementById("chatClose").addEventListener("click",z),document.getElementById("chatBackdrop").addEventListener("click",z);function N(){return window.innerWidth>760}let H=!1;window.addEventListener("wheel",e=>{N()&&(H||Math.abs(e.deltaY)<18||(H=!0,e.deltaY>0?d(n+1):d(n-1),setTimeout(()=>H=!1,700)))},{passive:!0});let M=null;window.addEventListener("touchstart",e=>{N()&&(M=e.touches[0].clientY)},{passive:!0}),window.addEventListener("touchend",e=>{if(!N()||M===null)return;const o=M-e.changedTouches[0].clientY;Math.abs(o)>50&&(o>0?d(n+1):d(n-1)),M=null},{passive:!0});let Q=null;const ee=/^#(s\d|explore|chat)$/.test(location.hash);function te(){clearTimeout(Q),!ee&&(Q=setTimeout(()=>d(n+1),7e3))}["click","keydown","wheel","touchstart"].forEach(e=>window.addEventListener(e,te,{passive:!0})),te();const he=document.getElementById("floaters"),pe=[{shape:"hex",x:"6%",y:"20%",size:34,color:"#3fd8e8",depth:.35,cls:"bob"},{shape:"diamond",x:"92%",y:"16%",size:22,color:"#3fd8e8",depth:.55,cls:"bob rev"},{shape:"star",x:"38%",y:"7%",size:16,color:"#c14fe0",depth:.25,cls:"bob slow"},{shape:"triangle",x:"8%",y:"52%",size:20,color:"#5fe8a0",depth:.45,cls:"bob rev slow"},{shape:"pentagon",x:"50%",y:"86%",size:18,color:"#5fe8a0",depth:.3,cls:"bob"},{shape:"circle",x:"94%",y:"80%",size:26,color:"#e8492f",depth:.6,cls:"bob slow rev"},{shape:"diamond",x:"2%",y:"82%",size:14,color:"#f2a33f",depth:.5,cls:"bob"},{shape:"star",x:"88%",y:"46%",size:12,color:"#c14fe0",depth:.4,cls:"bob rev"},{shape:"crystal",x:"16%",y:"10%",size:40,color:"#3fd8e8",depth:.22,cls:"bob slow"},{shape:"crystal",x:"27%",y:"30%",size:24,color:"#3fd8e8",depth:.5,cls:"bob rev"},{shape:"crystal",x:"80%",y:"8%",size:34,color:"#3fd8e8",depth:.28,cls:"bob rev slow"},{shape:"crystal",x:"72%",y:"34%",size:20,color:"#f2a33f",depth:.46,cls:"bob"},{shape:"crystal",x:"12%",y:"68%",size:22,color:"#3fd8e8",depth:.4,cls:"bob slow rev"},{shape:"crystal",x:"96%",y:"62%",size:30,color:"#3fd8e8",depth:.33,cls:"bob"}];function ue(e,o,t){const r=o;switch(e){case"hex":return`<svg width="${r}" height="${r}" viewBox="0 0 24 24" style="color:${t}"><polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;case"diamond":return`<svg width="${r}" height="${r}" viewBox="0 0 24 24" style="color:${t}"><polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;case"star":return`<svg width="${r}" height="${r}" viewBox="0 0 24 24" style="color:${t}"><path d="M12 1l3 7 7 .8-5.3 4.8 1.6 7L12 17l-6.3 3.6 1.6-7L2 8.8 9 8z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`;case"triangle":return`<svg width="${r}" height="${r}" viewBox="0 0 24 24" style="color:${t}"><polygon points="12,3 21,20 3,20" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;case"pentagon":return`<svg width="${r}" height="${r}" viewBox="0 0 24 24" style="color:${t}"><polygon points="12,2 22,9.5 18,21 6,21 2,9.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;case"circle":return`<svg width="${r}" height="${r}" viewBox="0 0 24 24" style="color:${t}"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;case"crystal":return`<svg width="${r}" height="${r}" viewBox="0 0 40 40" style="color:${t}">
      <polygon points="20,3 35,15 20,21 5,15" fill="currentColor" opacity="0.20"/>
      <polygon points="20,21 35,15 27,36 20,39" fill="currentColor" opacity="0.55"/>
      <polygon points="20,21 5,15 13,36 20,39" fill="currentColor" opacity="0.10"/>
      <polygon points="20,3 35,15 20,21 5,15" fill="none" stroke="currentColor" stroke-width="1"/>
      <polygon points="20,21 35,15 27,36 20,39" fill="none" stroke="currentColor" stroke-width="1"/>
      <polygon points="20,21 5,15 13,36 20,39" fill="none" stroke="currentColor" stroke-width="1"/>
      <line x1="20" y1="21" x2="20" y2="3" stroke="currentColor" stroke-width="0.75" opacity="0.6"/>
    </svg>`}return""}const ye=pe.map(e=>{const o=document.createElement("div");o.className="floater",o.style.left=e.x,o.style.top=e.y,o.style.color=e.color,o.dataset.depth=e.depth;const t=document.createElement("div");return t.className=e.cls,t.innerHTML=ue(e.shape,e.size,e.color),o.appendChild(t),he.appendChild(o),o}),fe=document.getElementById("stars");for(let e=0;e<28;e++){const o=document.createElement("div");o.className="star-dot",o.style.left=Math.random()*100+"%",o.style.top=Math.random()*70+"%",o.style.animationDelay=Math.random()*4+"s",fe.appendChild(o)}let A=0,_=0,u=0,y=0,O=0,w=0;const ge=window.matchMedia("(pointer: coarse)").matches;window.addEventListener("mousemove",e=>{A=e.clientX/window.innerWidth*2-1,_=e.clientY/window.innerHeight*2-1}),window.addEventListener("mouseleave",()=>{A=0,_=0});function oe(){if(ge)return;O+=.006;const e=Math.sin(O)*.15,o=Math.cos(O*.8)*.1,t=A!==0?A:e,r=_!==0?_:o;u+=(t-u)*.06,y+=(r-y)*.06,w*=.91,ye.forEach(s=>{const i=parseFloat(s.dataset.depth),h=u*42*i+w*46*i,C=y*34*i,D=u*16*i,Y=-y*12*i,V=(i-.38)*70;s.style.transform=`translate3d(${h}px, ${C}px, ${V.toFixed(1)}px) rotateY(${D.toFixed(2)}deg) rotateX(${Y.toFixed(2)}deg)`});const a=E.querySelector(".slide.active [data-tilt]");a&&(a.style.transform=`rotateX(${(-y*10).toFixed(2)}deg) rotateY(${(u*14-w*10).toFixed(2)}deg) translateZ(20px)`),E.style.transform=`rotateX(${(-y*1.6).toFixed(2)}deg) rotateY(${(u*2.2-w*2.8).toFixed(2)}deg)`,document.getElementById("gridFloor").style.transform=`rotateX(62deg) translateX(${(u*8+w*10).toFixed(1)}px) translateY(${(y*4).toFixed(1)}px)`,requestAnimationFrame(oe)}requestAnimationFrame(oe),function(){const o=document.getElementById("neuro"),t=o.getContext("webgl")||o.getContext("experimental-webgl");if(!t){o.style.display="none";return}const r=`
    attribute vec2 a_position;
    varying vec2 vUv;
    void main(){
      vUv = 0.5 * (a_position + 1.0);
      gl_Position = vec4(a_position, 0.0, 1.0);
    }`,a=`
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
    }`;function s(l,I){const g=t.createShader(l);return t.shaderSource(g,I),t.compileShader(g),t.getShaderParameter(g,t.COMPILE_STATUS)||console.error(t.getShaderInfoLog(g)),g}const i=t.createProgram();t.attachShader(i,s(t.VERTEX_SHADER,r)),t.attachShader(i,s(t.FRAGMENT_SHADER,a)),t.linkProgram(i),t.useProgram(i);const h=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,h),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW);const C=t.getAttribLocation(i,"a_position");t.enableVertexAttribArray(C),t.vertexAttribPointer(C,2,t.FLOAT,!1,0,0);const D=t.getUniformLocation(i,"u_time"),Y=t.getUniformLocation(i,"u_ratio"),V=t.getUniformLocation(i,"u_pointer"),me=t.getUniformLocation(i,"u_color_from"),ve=t.getUniformLocation(i,"u_color_to"),we=t.getUniformLocation(i,"u_color_mix");t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA);function G(){const l=Math.min(window.devicePixelRatio||1,2);o.width=window.innerWidth*l,o.height=window.innerHeight*l,t.viewport(0,0,o.width,o.height)}window.addEventListener("resize",G),G();let p=c[0].color.slice(),f=c[0].color.slice(),re=0,ie=900,x=1;window.startColorTransition=function(l){p=[p[0]+(f[0]-p[0])*T(x),p[1]+(f[1]-p[1])*T(x),p[2]+(f[2]-p[2])*T(x)],f=l.slice(),re=performance.now(),x=0};function T(l){return l<.5?4*l*l*l:1-Math.pow(-2*l+2,3)/2}const b={x:.5,y:.5};function ne(l){G.lastW=window.innerWidth;const I=performance.now();x=ie>0?Math.min(1,(I-re)/ie):1;const g=T(x),xe=.5+u*.5,be=.5-y*.5;b.x+=(xe-b.x)*.05,b.y+=(be-b.y)*.05,t.useProgram(i),t.uniform1f(D,l),t.uniform1f(Y,o.width/o.height),t.uniform2f(V,b.x,b.y),t.uniform3f(me,p[0],p[1],p[2]),t.uniform3f(ve,f[0],f[1],f[2]),t.uniform1f(we,g),t.drawArrays(t.TRIANGLES,0,3),requestAnimationFrame(ne)}requestAnimationFrame(ne)}(),L[0].classList.add("active"),Z(0);const U=document.getElementById("preloader");if(window.addEventListener("load",()=>{setTimeout(()=>{U.classList.add("hide")},1900)}),setTimeout(()=>{U.classList.add("hide")},2600),ee){U.classList.add("hide");const e=location.hash.slice(1),o=e.match(/^s(\d)$/);if(o){const t=Math.min(c.length,Math.max(1,+o[1]))-1;t>0&&setTimeout(()=>d(t),60)}e==="explore"&&J(),e==="chat"&&K()}})();
