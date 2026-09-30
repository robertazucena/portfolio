/* Monarch Studio — script.js
   1. Preloader  (runs first: signal-from-noise loader, then the slash cut)
   2. Site       (cursor, scroll, particles/WebGL + 2D fallback, sliders, case study router & data)
   3. Safety net (starts the particle field if anything above failed)
   Case study content lives in CASES / MORE / SHOTS / NOTES inside section 2. */

/* ---------- 1. Preloader ---------- */
/* Preloader: ~320 points of noise drift, then gather into the Monarch ring as the page loads.
   At 100% the lime slash draws across the ring and keeps going—cutting the screen open to reveal the site. */
(function(){
  var pre=document.getElementById("pre");if(!pre)return;
  var body=document.body,RM=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var seen=false;try{seen=sessionStorage.getItem("monarch-seen")==="1";sessionStorage.setItem("monarch-seen","1")}catch(e){}
  var MIN=RM?300:(seen?500:1500),MAX=6000,t0=performance.now();
  if(window.matchMedia("(pointer:coarse)").matches){var sk=pre.querySelector(".pre-skip");if(sk)sk.textContent="Tap to skip"}
  var cv=document.getElementById("preDots"),ctx=cv.getContext("2d"),arc=document.getElementById("preArc"),slash=document.getElementById("preSlash");
  var cnt=document.getElementById("preCount"),stat=document.getElementById("preStatus");
  var words=["Collecting signal","Filtering noise","Mapping meaning","Editing complexity","Made useful."];
  var N=260,pts=[],W=0,DPR=Math.min(window.devicePixelRatio||1,2);
  function size(){var r=cv.getBoundingClientRect();W=r.width;cv.width=W*DPR;cv.height=W*DPR;ctx.setTransform(DPR,0,0,DPR,0,0)}
  size();addEventListener("resize",size);
  for(var i=0;i<N;i++){var a=i/N*Math.PI*2+Math.random()*.02;pts.push({a:a,x:Math.random(),y:Math.random(),sx:Math.random()*6.28,sy:Math.random()*6.28,sp:.3+Math.random()*.7,z:Math.random(),lime:Math.random()<.07,d:Math.random()*.35})}
  // real readiness signals
  var got={dom:0,fonts:0,load:0,gl:0};
  if(document.readyState!=="loading")got.dom=1;else document.addEventListener("DOMContentLoaded",function(){got.dom=1});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){got.fonts=1});else got.fonts=1;
  if(document.readyState==="complete")got.load=1;else addEventListener("load",function(){got.load=1});
  function target(){var el=performance.now()-t0;if(el>MAX)return 1;
    var r=.12*got.dom+.22*got.fonts+.33*got.load+.33*(window.__mGLok||!window.WebGLRenderingContext?1:0);
    return Math.min(r,el/MIN)}
  var p=0,done=false,raf=0,lastW=-1,lastT=performance.now();
  function ease(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
  function draw(t){
    var c=W/2,R=W*0.335,time=t/1000;
    ctx.clearRect(0,0,W,W);
    for(var i=0;i<pts.length;i++){var q=pts[i];
      var k=Math.max(0,Math.min(1,(p-q.d)/(1-q.d)));k=ease(k);
      var nx=(q.x+Math.sin(time*q.sp+q.sx)*.04)*W,ny=(q.y+Math.cos(time*q.sp*.8+q.sy)*.04)*W;
      var wob=Math.sin(time*2+q.a*6)*2*(1-k);
      var rx=c+Math.cos(q.a)*(R+wob+(q.z-.5)*6*(1-k*.7)),ry=c+Math.sin(q.a)*(R+wob+(q.z-.5)*6*(1-k*.7));
      var x=nx+(rx-nx)*k,y=ny+(ry-ny)*k;
      ctx.globalAlpha=.35+.65*(0.45+0.55*q.z)*(0.5+0.5*k);
      ctx.fillStyle=q.lime?"#d7ff3f":"#f2f0e8";
      var s=(q.lime?2.6:1.8)+q.z*1.2;
      ctx.beginPath();ctx.arc(x,y,s/2,0,6.2832);ctx.fill();
    }
  }
  function tick(t){
    if(done)return;raf=requestAnimationFrame(tick);
    var now=performance.now(),dt=Math.min((now-lastT)/1000,.25);lastT=now;
    var tg=target();if(tg>p)p=Math.min(tg,p+Math.max((tg-p)*(1-Math.exp(-dt*4.5)),dt*.28));if(tg>=1&&p>.992)p=1;
    var pct=Math.round(p*100);
    if(pct!==lastW){lastW=pct;cnt.textContent=String(pct).padStart(3,"0");
      arc.setAttribute("stroke-dashoffset",(1288.05*(1-p)).toFixed(1));
      stat.textContent=words[Math.min(words.length-1,Math.floor(p*(words.length-1)+.0001))];}
    draw(t);
    if(performance.now()-t0>900)pre.classList.add("skippable");
    if(p>=1)finish();
  }
  function reveal(){
    body.classList.remove("loading");
    try{window.dispatchEvent(new Event("monarch:reveal"))}catch(e){}
  }
  function finish(){
    if(done)return;done=true;cancelAnimationFrame(raf);
    cnt.textContent="100";stat.textContent=words[words.length-1];arc.setAttribute("stroke-dashoffset","0");draw(performance.now());
    if(RM){reveal();pre.classList.add("open");setTimeout(function(){pre.remove()},500);return}
    slash.setAttribute("stroke-dashoffset","0");               // 1. the slash cuts through the ring
    setTimeout(function(){pre.classList.add("cut")},330);     // 2. …and keeps going across the screen
    setTimeout(function(){pre.classList.add("open");reveal()},760); // 3. the two halves part
    setTimeout(function(){pre.remove()},1900);
  }
  pre.addEventListener("click",function(){if(pre.classList.contains("skippable")){p=1;finish()}});
  addEventListener("keydown",function(e){if(!done&&(e.key==="Escape"||e.key==="Enter")&&pre.classList.contains("skippable")){p=1;finish()}});
  raf=requestAnimationFrame(tick);
})();

/* ---------- 2. Site ---------- */
(function(){
"use strict";
window.__mStartGL=function(){try{if(!window.__mGLok)startGL()}catch(e){console.error(e)}};
var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var FINE = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
var $ = function(s,r){return (r||document).querySelector(s)};
var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var SVGNS = "http://www.w3.org/2000/svg";
function el(tag, attrs, parent){var e=document.createElementNS(SVGNS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e}
var pointer = {x:innerWidth/2,y:innerHeight/2,nx:0,ny:0,active:false};

/* ============ HERO HEADLINE: split + variable-weight field ============ */
var chars=[];
try{(function(){
  var delay=.25;
  $$("#h1 .line").forEach(function(line){
    var words=line.getAttribute("data-text").split(" ");
    words.forEach(function(wd,wi){
      if(wi){var s=document.createElement("span");s.className="sp";line.appendChild(s)}
      var box=document.createElement("span");box.className="wd";box.setAttribute("aria-hidden","true");line.appendChild(box);
      for(var i=0;i<wd.length;i++){
        var sp=document.createElement("span");sp.className="ch";sp.textContent=wd[i];
        sp.style.animationDelay=(delay+=.035)+"s";
        box.appendChild(sp);chars.push({el:sp,x:0,y:0,w:700});
      }
    });
  });
})();}catch(e){console.error("[monarch] module failed",e)}
function measureChars(){chars.forEach(function(c){var r=c.el.getBoundingClientRect();c.x=r.left+r.width/2;c.y=r.top+r.height/2+scrollY})}
var headlineTick=function(){
  if(REDUCED||!FINE||!pointer.active)return;
  var py=pointer.y+scrollY;
  for(var i=0;i<chars.length;i++){
    var c=chars[i],dx=pointer.x-c.x,dy=py-c.y,d=Math.sqrt(dx*dx+dy*dy);
    var f=Math.max(0,1-d/260);f=f*f*(3-2*f);
    var w=Math.round(700-f*360);
    if(Math.abs(w-c.w)>6){c.w=w;c.el.style.fontWeight=w;c.el.classList.remove("hot")}
  }
};

/* ============ CURSOR ============ */
var cur=$("#cur"),tilt=$(".tilt",cur),lab=$(".lab",cur),tiltA=0;
var rp={x:pointer.x,y:pointer.y};
if(FINE){document.body.classList.add("has-cursor")}
addEventListener("pointermove",function(e){
  pointer.x=e.clientX;pointer.y=e.clientY;cur.classList.toggle("ink",!!(e.target&&e.target.closest&&e.target.closest(".on-lime,.on-light,.wipe")));pointer.nx=e.clientX/innerWidth*2-1;pointer.ny=-(e.clientY/innerHeight*2-1);pointer.active=true;
},{passive:true});
document.addEventListener("pointerleave",function(){pointer.active=false});
document.addEventListener("pointerover",function(e){
  var t=e.target.closest("a,button,[data-cursor],.term,.nd,.ph");
  if(!t){cur.classList.remove("big","labeled");return}
  var l=t.getAttribute&&t.getAttribute("data-cursor");
  var host=t.closest("[data-cursor]");if(!l&&host)l=host.getAttribute("data-cursor");
  cur.classList.add("big");
  cur.classList.remove("labeled");
});

/* ============ SCROLL STATE ============ */
var progressEl=$(".progress"),nav=$("#nav"),lastY=scrollY,scrollVel=0;
var navLinks=$$(".navlinks a");
var navTargets=navLinks.map(function(a){return document.getElementById(a.getAttribute("data-nav"))});
function onScroll(){
  try{pickScene()}catch(e){}
  try{onScrollUI()}catch(e){console.error(e)}
}
function onScrollUI(){
  var y=scrollY,max=document.documentElement.scrollHeight-innerHeight;
  if(progressEl)progressEl.style.transform="scaleX("+(max>0?y/max:0)+")";
  var dy=y-lastY;scrollVel+=dy;lastY=y;
  if(dy>4&&y>300)nav.classList.add("hide");
  else if(dy<-4||y<=300)nav.classList.remove("hide");
  nav.classList.toggle("solid",y>40);
  // nav tone over lime sections
  var onLime=false,onLight=false;$$(".on-lime").forEach(function(s){var r=s.getBoundingClientRect();if(r.top<46&&r.bottom>46)onLime=true});
  $$(".on-light").forEach(function(s){var r=s.getBoundingClientRect();if(r.top<46&&r.bottom>46)onLight=true});
  nav.classList.toggle("lime",onLime&&y>40);nav.classList.toggle("light",onLight&&y>40);
  // active nav
  var mid=innerHeight*.35,act=-1;
  navTargets.forEach(function(t,i){if(!t)return;var r=t.getBoundingClientRect();if(r.top<mid&&r.bottom>mid)act=i});
  if(!$("#casepage").hidden)act=0;
  navLinks.forEach(function(a,i){a.classList.toggle("active",i===act)});
  // process progress
  var st=$("#steps"),r=st.getBoundingClientRect();
  var p=Math.min(1,Math.max(0,(innerHeight*.85-r.top)/(r.height+innerHeight*.35)));
  st.style.setProperty("--p",p.toFixed(3));
  $$(".step",st).forEach(function(s,i){s.classList.toggle("on",p>i/4+.02);s.classList.toggle("done",p>(i+1)/4-.02)});
  // quote words
  var q=$("#quote"),qr=q.getBoundingClientRect();
  var qp=Math.min(1,Math.max(0,(innerHeight*.9-qr.top)/(qr.height+innerHeight*.35)));
  var n=Math.floor(qp*qWords.length*1.05);

  pickScene();
}
// testimonial tabs (auto-advancing; each tab shows its own active / inactive state)
var qWords=[];
try{(function(){
  var port=$("#portraitSrc");
  /* photo: set a path (e.g. "assets/images/testimonials/andrea-villanueva.jpg") when real, approved headshots exist */
  var T=[
    {q:"Monarch made asking for help feel as simple as taking a breath. Our clinics are seeing people who would never have walked in before.",n:"Andrea Villanueva",r:"Co-founder / Hinga",av:"AV",id:"hinga",c:"Hinga",photo:null,c1:"#c2410c",c2:"#fb923c"},
    {q:"Monarch gave us the clarity to make a difficult product feel inevitable. They challenged the technology, the language and the operating model—not just the interface.",n:"Amira Khan",r:"Chief Product Officer / Aster",av:"AK",id:"aster",c:"Aster",photo:port?port.src:null,c1:"#4c5fd5",c2:"#8b9cf7"},
    {q:"We stopped writing for keywords and started answering the questions our specifiers actually have. The results followed.",n:"Daniel Osei",r:"Head of Growth / Morrow",av:"DO",id:"morrow",c:"Morrow",photo:null,c1:"#2f5d50",c2:"#7fb49f"},
    {q:"Residents tell us it’s the first council service that feels like it was made for their life, not our process.",n:"Priya Nair",r:"Director of Digital Services / Common Ground",av:"PN",id:"common-ground",c:"Common Ground",photo:null,c1:"#0f766e",c2:"#5eead4"},
    {q:"They made saving feel simple for people who had never opened a bank account. Sign-ups doubled, and we didn’t add a single form field.",n:"Carmela Santos",r:"Head of Digital / Bayani Bank",av:"CS",id:"bayani",c:"Bayani Bank",photo:null,c1:"#1864ab",c2:"#74c0fc"}
  ];
  var box=$("#testi"),quote=$("#quote"),who=$("#tAuthor"),tabs=$("#tTabs"),link=$("#tCase");
  var AR='<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M11.3328 11.3326V4.66699H4.66718M11.3328 4.66699L4.66718 11.3326" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  function face(t){return '<span class="t-ph" style="--c1:'+t.c1+'">'+(t.photo?'<img src="'+t.photo+'" alt="Portrait of '+t.n+'" onerror="this.remove()">':t.av)+'</span>'}
  tabs.innerHTML=T.map(function(t,k){return '<button type="button" class="t-name" role="tab" id="tt'+k+'" aria-controls="quotePanel" aria-selected="false" tabindex="-1">'+t.c+'<i aria-hidden="true"><b></b></i></button>'}).join("");
  var btns=$$(".t-name",tabs);
  var i=-1,el=0,DUR=9000,hover=false,focus=false,inView=false,last=performance.now(),swapT=0;
  function show(k,user){
    k=(k+T.length)%T.length;if(k===i)return;i=k;var t=T[i];el=0;
    btns.forEach(function(b,j){var on=j===i;b.setAttribute("aria-selected",on?"true":"false");b.tabIndex=on?0:-1;b.querySelector("i b").style.transform="scaleX(0)"});
    $("#quotePanel").setAttribute("aria-labelledby","tt"+i);
    quote.setAttribute("aria-live",user?"polite":"off");
    $$(".w",quote).forEach(function(w){w.style.transitionDelay="0ms";w.classList.remove("in")});
    who.classList.add("swap");clearTimeout(swapT);
    swapT=setTimeout(function(){
      quote.textContent="";
      t.q.split(/\s+/).forEach(function(w,j){var sp=document.createElement("span");sp.className="w";sp.textContent=w;sp.style.transitionDelay=(REDUCED?0:j*22)+"ms";quote.appendChild(sp);quote.appendChild(document.createTextNode(" "))});
      who.innerHTML=face(t)+'<div><b>'+t.n+'</b><p class="mono m10 md mute">'+t.r+'</p></div>';
      who.classList.remove("swap");
      link.href="#/work/"+t.id;link.innerHTML="Read the "+t.c+" case study"+AR;
      requestAnimationFrame(function(){requestAnimationFrame(function(){$$(".w",quote).forEach(function(w){w.classList.add("in")})})});
    },quote.childNodes.length?280:0);
  }
  btns.forEach(function(b,k){b.addEventListener("click",function(){show(k,true)})});
  tabs.addEventListener("keydown",function(e){
    var k=null;if(e.key==="ArrowRight")k=i+1;else if(e.key==="ArrowLeft")k=i-1;else if(e.key==="Home")k=0;else if(e.key==="End")k=T.length-1;
    if(k===null)return;e.preventDefault();show(k,true);btns[i].focus();
  });
  box.addEventListener("pointerenter",function(){hover=true});box.addEventListener("pointerleave",function(){hover=false});
  box.addEventListener("focusin",function(){focus=true});box.addEventListener("focusout",function(){focus=false});
  var sx=null;
  quote.parentNode.addEventListener("pointerdown",function(e){if(e.pointerType!=="mouse")sx=e.clientX});
  quote.parentNode.addEventListener("pointerup",function(e){if(sx!==null){var dx=e.clientX-sx;if(Math.abs(dx)>50)show(i+(dx<0?1:-1),true);sx=null}});
  new IntersectionObserver(function(es){inView=es[0].isIntersecting},{threshold:.3}).observe(box);
  (function tick(now){
    requestAnimationFrame(tick);
    var dt=Math.min(now-last,100);last=now;
    if(inView&&!hover&&!focus&&!REDUCED&&!document.hidden){el+=dt;if(el>=DUR){show(i+1,false);return}}
    if(btns[i])btns[i].querySelector("i b").style.transform="scaleX("+(el/DUR).toFixed(4)+")";
  })(last);
  show(0,false);
})();}catch(e){console.error("[monarch] testimonial failed",e)}

/* ============ COUNTERS ============ */
function runCount(node){
  var raw=node.getAttribute("data-count"),m=raw.match(/^([^\d]*)([\d.]+)(.*)$/);
  if(!m||REDUCED)return;
  var pre=m[1],num=m[2],suf=m[3],dec=(num.split(".")[1]||"").length,pad=num.split(".")[0].length,target=parseFloat(num);
  var t0=performance.now(),dur=1600;
  (function step(t){
    var k=Math.min(1,(t-t0)/dur);k=1-Math.pow(1-k,4);
    var v=(target*k).toFixed(dec);var ip=v.split(".");while(ip[0].length<pad)ip[0]="0"+ip[0];
    node.textContent=pre+ip.join(".")+suf;
    if(k<1)requestAnimationFrame(step);else node.textContent=raw;
  })(t0);
}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){runCount(e.target);io.unobserve(e.target)}})},{threshold:.6});
$$("[data-count]").forEach(function(n){io.observe(n)});

/* ============ SIGNAL BARS (proof strip) ============ */
try{(function(){
  var bars=$("#bars"),is=$$("i",bars),base=is.map(function(b){return b.style.getPropertyValue("--h")});
  var cell=bars.parentElement;
  cell.addEventListener("pointermove",function(e){
    var r=bars.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,idx=Math.max(0,Math.min(8,Math.floor(x*9)));
    is.forEach(function(b,i){var d=Math.abs(i-idx);b.style.height=Math.max(18,112-d*d*9)+"px";b.classList.toggle("on",i===idx)});
  });
  cell.addEventListener("pointerleave",function(){is.forEach(function(b,i){b.style.height="";b.classList.toggle("on",i===5)})});
})();}catch(e){console.error("[monarch] module failed",e)}

/* ============ INTELLIGENCE MAP ============ */
try{(function(){
  var svg=$("#imap"),gN=$(".nodes",svg),gP=$(".paths",svg),label=$("#imapLabel");
  var raw=[[30,28,18],[136,28,30],[242,28,42],[348,28,18],[454,28,30],[60,100,30],[166,100,42],[272,100,18],[378,100,30],[484,100,42],[30,172,42],[136,172,18],[242,172,30],[348,172,42,1],[454,172,18],[60,244,18],[166,244,30],[272,244,42],[378,244,18],[484,244,30]];
  var nodes=raw.map(function(n,i){var s=n[2];var c=el("circle",{cx:n[0]+s/2,cy:n[1]+s/2,r:s/2-.6,"class":"nd"+(n[3]?" key":""),tabindex:"0","aria-label":"Source "+(i+1)},gN);return {x:n[0]+s/2,y:n[1]+s/2,r:s/2,el:c,i:i}});
  var ans={x:291,y:160,w:174,h:72};
  var hold=false,cyc=0,timer=null,inView=false;
  function edge(p){ // nearest point on answer rect border toward p
    var dx=p.x-ans.x,dy=p.y-ans.y,sx=(ans.w/2)/Math.abs(dx||1e-6),sy=(ans.h/2)/Math.abs(dy||1e-6),s=Math.min(sx,sy);
    return {x:ans.x+dx*s,y:ans.y+dy*s};
  }
  function trace(n){
    gP.innerHTML="";nodes.forEach(function(o){o.el.classList.remove("hit","via")});
    n.el.classList.add("hit");
    // choose an intermediate node closer to the answer
    var best=null,bd=1e9;
    nodes.forEach(function(o){if(o===n)return;var dA=Math.hypot(o.x-ans.x,o.y-ans.y),dN=Math.hypot(o.x-ans.x,n.y-ans.y);var dn=Math.hypot(o.x-n.x,o.y-n.y);if(dA<Math.hypot(n.x-ans.x,n.y-ans.y)&&dn<bd&&dn>20){bd=dn;best=o}});
    var pts=[{x:n.x,y:n.y}];
    if(best){best.el.classList.add("via");pts.push({x:best.x,y:best.y})}
    pts.push(edge(pts[pts.length-1]));
    var d="M"+pts.map(function(p){return p.x.toFixed(1)+" "+p.y.toFixed(1)}).join(" L");
    var len=0;for(var i=1;i<pts.length;i++)len+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);
    var path=el("path",{d:d,"class":"pth"},gP);path.style.setProperty("--len",Math.ceil(len));
    el("circle",{cx:pts[pts.length-1].x,cy:pts[pts.length-1].y,r:3,fill:"#D7FF3F"},gP);
    svg.classList.add("lit");
    var conf=(0.82+((n.i*37)%17)/100).toFixed(2);
    label.textContent="SOURCE "+String(n.i+1).padStart(2,"0")+(best?" → SOURCE "+String(best.i+1).padStart(2,"0"):"")+" → ANSWER / CONFIDENCE "+conf;
  }
  nodes.forEach(function(n){
    n.el.addEventListener("pointerenter",function(){hold=true;trace(n)});
    n.el.addEventListener("focus",function(){hold=true;trace(n)});
    n.el.addEventListener("click",function(){hold=true;trace(n)});
  });
  svg.addEventListener("pointerleave",function(){hold=false});
  var order=[0,9,15,4,11,19,2,17,5,14];
  function auto(){if(!hold&&inView&&!REDUCED){trace(nodes[order[cyc++%order.length]])}}
  new IntersectionObserver(function(es){inView=es[0].isIntersecting;if(inView&&!timer){auto();timer=setInterval(auto,2600)}else if(!inView&&timer){clearInterval(timer);timer=null}},{threshold:.4}).observe(svg);
})();}catch(e){console.error("[monarch] module failed",e)}

/* ============ SEMANTIC FIELD ============ */
try{(function(){
  var svg=$("#sem"),gT=$(".terms",svg),gL=$(".links",svg),label=$("#semLabel"),layers=$$(".layer",svg);
  var terms=[["NEED",58,42,"what a specifier is trying to solve"],["ENTITY",388,54,"products, materials, standards"],["PROOF",34,236,"tests, certifications, cases"],["CONTEXT",408,242,"application, climate, budget"]];
  var built=terms.map(function(t){
    var w=t[0].length*5.45+20,h=23,g=el("g",{"class":"term",tabindex:"0"},gT);
    el("rect",{x:t[1],y:t[2],width:w,height:h},g);
    var tx=el("text",{x:t[1]+10,y:t[2]+15,fill:"#10110F","font-family":"Roboto Mono, monospace","font-weight":"700","font-size":"9"},g);tx.textContent=t[0];
    var cx=t[1]+w/2,cy=t[2]+h/2;
    var ln=el("line",{x1:cx,y1:cy,x2:270,y2:160,"class":"link"},gL);
    function on(){built.forEach(function(b){b.g.classList.remove("on");b.ln.classList.remove("on")});g.classList.add("on");ln.classList.add("on");label.textContent=t[0]+" → INTENT / "+t[3].toUpperCase()}
    g.addEventListener("pointerenter",on);g.addEventListener("focus",on);g.addEventListener("click",on);
    return {g:g,ln:ln,depth:.11};
  });
  svg.addEventListener("pointermove",function(e){
    if(REDUCED)return;
    var r=svg.getBoundingClientRect(),dx=(e.clientX-(r.left+r.width/2)),dy=(e.clientY-(r.top+r.height/2));
    layers.forEach(function(l){var k=parseFloat(l.getAttribute("data-depth"));l.style.transform="translate("+(dx*k).toFixed(2)+"px,"+(dy*k).toFixed(2)+"px)"});
    built.forEach(function(b){b.g.style.transform="translate("+(-dx*.05).toFixed(2)+"px,"+(-dy*.05).toFixed(2)+"px)";b.g.style.transition="transform .9s cubic-bezier(.2,.7,.1,1)"});
  });
  svg.addEventListener("pointerleave",function(){layers.forEach(function(l){l.style.transform=""});built.forEach(function(b){b.g.style.transform="";b.g.classList.remove("on");b.ln.classList.remove("on")});label.textContent="ENTITIES / INTENT / PROOF"});
})();}catch(e){console.error("[monarch] module failed",e)}

/* ============ PRODUCT FLOW ============ */
try{(function(){
  var svg=$("#pflow"),g=$(".phones",svg),label=$("#pflowLabel");
  var pos=[[40,28,"SAVED STEPS"],[204,48,"PLAIN GUIDANCE"],[368,68,"PROACTIVE UPDATES"]];
  var phones=pos.map(function(p,i){
    var ph=el("g",{"class":"ph"+(i===1?" on":""),tabindex:"0","aria-label":p[2]},g);
    var inner=el("g",{"class":"g"},ph);
    el("rect",{x:p[0]+.6,y:p[1]+.6,width:136.8,height:248.8,"class":"frame"},inner);
    var X=p[0]+12,Y=p[1]+12;
    el("circle",{cx:X+9,cy:Y+9,r:9,"class":"pf"},inner);
    el("rect",{x:X+86,y:Y+8,width:28,height:2,fill:"#10110F"},inner);
    el("rect",{x:X,y:Y+30,width:114,height:70,"class":"mod"},inner);
    el("rect",{x:X,y:Y+112,width:114,height:5,fill:"#10110F","fill-opacity":".42"},inner);
    el("rect",{x:X,y:Y+129,width:114,height:5,fill:"#10110F","fill-opacity":".42"},inner);
    el("rect",{x:X,y:Y+146,width:72,height:5,fill:"#10110F","fill-opacity":".42"},inner);
    el("rect",{x:X,y:Y+163,width:114,height:32,fill:"#F2F0E8",stroke:"#10110F","stroke-opacity":".15"},inner);
    el("path",{d:"M3.33279 8.00021H12.6672M7.99999 12.6674L12.6672 8.00021L7.99999 3.33301",stroke:"#10110F","stroke-width":"1.5","stroke-linecap":"round",fill:"none",transform:"translate("+(X+49)+" "+(Y+171)+")"},inner);
    function on(){phones.forEach(function(q){q.classList.remove("on")});ph.classList.add("on");label.textContent="STATE 0"+(i+1)+" / "+p[2]}
    ph.addEventListener("pointerenter",on);ph.addEventListener("focus",on);ph.addEventListener("click",on);
    return ph;
  });
})();}catch(e){console.error("[monarch] module failed",e)}

/* ============ CONTACT DIAGRAM + MAGNETIC EMAIL ============ */
try{(function(){
  var d=$("#mdiag"),axis=$(".axis",d),email=$("#email");
  addEventListener("pointermove",function(e){
    if(REDUCED)return;
    var r=d.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
    var a=Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2))*180/Math.PI;
    axis.style.transform="rotate("+((a+90)*.35).toFixed(1)+"deg)";
    var er=email.getBoundingClientRect(),ex=e.clientX-(er.left+er.width/2),ey=e.clientY-(er.top+er.height/2);
    if(Math.abs(ex)<er.width*.9&&Math.abs(ey)<er.height*2.2){email.style.transform="translate("+(ex*.12).toFixed(1)+"px,"+(ey*.25).toFixed(1)+"px)"}else email.style.transform="";
  },{passive:true});
})();}catch(e){console.error("[monarch] module failed",e)}

/* ============ WEBGL: particle intelligence field ============ */
var GL=null;
function initGL(mode){
  var alive=true,TWO=mode==="2d";
  if(!TWO&&!window.THREE)return null;
  var canvas=$("#gl"),renderer,c2=null,ctx2=null;
  var PR=Math.min(devicePixelRatio||1,1.75);
  if(!TWO){
    try{renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:false,alpha:true,powerPreference:"high-performance"})}catch(e){return null}
    if(!renderer.getContext()||renderer.getContext().isContextLost())return null;
    renderer.setPixelRatio(PR);renderer.setClearColor(0x000000,0);
  }else{
    // plain 2D canvas: works on every browser, no GPU context to lose
    var old2=document.getElementById("gl2d");if(old2)old2.remove();
    c2=document.createElement("canvas");c2.id="gl2d";c2.setAttribute("aria-hidden","true");
    canvas.parentNode.insertBefore(c2,canvas.nextSibling);
    ctx2=c2.getContext("2d");if(!ctx2){c2.remove();return null}
    PR=Math.min(devicePixelRatio||1,1.5);
    renderer={setSize:function(w,h){c2.width=Math.round(w*PR);c2.height=Math.round(h*PR)},render:function(){draw2d()},dispose:function(){},forceContextLoss:function(){},setPixelRatio:function(){},setClearColor:function(){}};
  }
  function V3(){return {x:0,y:0,z:0,set:function(a,b,c){this.x=a;this.y=b;this.z=c}}}
  var scene=TWO?{add:function(){}}:new THREE.Scene();
  var camera=TWO?{aspect:innerWidth/innerHeight,updateProjectionMatrix:function(){},position:V3()}:new THREE.PerspectiveCamera(35,innerWidth/innerHeight,.1,50);camera.position.z=6;
  var N=TWO?((innerWidth<760||!FINE)?3200:6000):((innerWidth<760||!FINE)?11000:26000);
  var VH=2*6*Math.tan(17.5*Math.PI/180),VW=VH*innerWidth/innerHeight;

  // ---- shape library (all centred at origin, ~3 units wide) ----
  function R(){return Math.random()}
  function G(){var u=1-R(),v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
  function sphereS(r){var z=R()*2-1,t=R()*6.2832,s=Math.sqrt(1-z*z);return [s*Math.cos(t)*r,s*Math.sin(t)*r,z*r]}
  var S=3.0/540; // figma-space → world scale for diagrams
  function fig(x,y){return [(x-270)*S,-(y-160)*S]}
  var shapes={
    mark:function(i){var r=R(),p,t=0;
      if(r<.64){var a=R()*6.2832,rr=1.18+G()*.018,tube=G()*.03;p=[Math.cos(a)*(rr+tube),Math.sin(a)*(rr+tube),G()*.035]}
      else{var s=(R()*2-1)*1.42,a2=38*Math.PI/180,w=G()*.022;p=[Math.sin(a2)*s+Math.cos(a2)*w,Math.cos(a2)*s-Math.sin(a2)*w,G()*.03];t=1}
      return [p,t]},
    chaos:function(){var k=R(),p;
      if(k<.6){p=[G()*1.05,G()*.62,G()*.6]}else{var c=[[-1.1,.45,0],[.9,-.3,.2],[.2,.6,-.3]][Math.floor(R()*3)];p=[c[0]+G()*.28,c[1]+G()*.22,c[2]+G()*.25]}
      return [p,R()<.05?1:0]},
    bars:function(){var h=[38,64,47,92,68,112,78,54,96],tot=0,i;for(i=0;i<9;i++)tot+=h[i];var pick=R()*tot,b=0;for(i=0;i<9;i++){pick-=h[i];if(pick<=0){b=i;break}}
      var W=3.0,gap=.083,bw=(W-gap*8)/9,x0=-W/2+b*(bw+gap),H=h[b]/112*1.167;
      return [[x0+R()*bw,-.6+R()*H,G()*.03],b===5?1:0]},
    lattice:function(){var nodes=[[30,28,18],[136,28,30],[242,28,42],[348,28,18],[454,28,30],[60,100,30],[166,100,42],[272,100,18],[378,100,30],[484,100,42],[30,172,42],[136,172,18],[242,172,30],[348,172,42],[454,172,18],[60,244,18],[166,244,30],[272,244,42],[378,244,18],[484,244,30]];
      var k=R();
      if(k<.2){var c=fig(291,160);return [[c[0]+(R()-.5)*174*S,c[1]+(R()-.5)*72*S,G()*.03],1]}
      if(k<.34){var n=nodes[Math.floor(R()*20)],a=fig(n[0]+n[2]/2,n[1]+n[2]/2),b=fig(291,160),t=R();return [[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,G()*.02],0]}
      var n2=nodes[Math.floor(R()*20)],c2=fig(n2[0]+n2[2]/2,n2[1]+n2[2]/2),q=sphereS(n2[2]/2*S);return [[c2[0]+q[0],c2[1]+q[1],q[2]],n2[0]===348&&n2[1]===172?1:0]},
    orbits:function(){var k=R(),c=[0,0];
      if(k<.78){var rs=[133.5,104.5,73.5],ri=Math.floor(R()*3),r=rs[ri]*S,a=R()*6.2832,x=Math.cos(a)*r,y=Math.sin(a)*r,z=0;
        var tx=[.25,-.5,.9][ri],ty=[.4,.2,-.35][ri];var y2=y*Math.cos(tx)-z*Math.sin(tx),z2=y*Math.sin(tx)+z*Math.cos(tx);var x3=x*Math.cos(ty)+z2*Math.sin(ty),z3=-x*Math.sin(ty)+z2*Math.cos(ty);
        return [[x3,y2,z3],0]}
      if(k<.88){var q=sphereS(.14);return [[q[0],q[1],q[2]],0]}
      var T=[[58+20,42+11],[388+26,54+11],[34+22,236+11],[408+29,242+11]][Math.floor(R()*4)],p=fig(T[0],T[1]);return [[p[0]+G()*.06,p[1]+G()*.03,G()*.03],1]},
    planes:function(){var P=[[40,28],[204,48],[368,68]],i=Math.floor(R()*3),o=P[i],w=138,h=250,k=R(),x,y,tone=i===1?1:0;
      if(k<.55){var per=2*(w+h),d=R()*per;if(d<w){x=d;y=0}else if(d<w+h){x=w;y=d-w}else if(d<2*w+h){x=d-w-h;y=h}else{x=0;y=d-2*w-h}}
      else if(k<.8){x=12+R()*114;y=42+R()*70}else{x=12+R()*114;y=124+Math.floor(R()*3)*17+R()*5}
      var p=fig(o[0]+x,o[1]+y);return [[p[0],p[1],(i-1)*.25+G()*.015],tone]},
    triad:function(){var i=Math.floor(R()*3),cx=(i-1)*1.2,s=.42,k=R(),x,y;
      if(i===0){var t=R()*6.2832;x=s*Math.pow(Math.cos(t),3);y=s*Math.pow(Math.sin(t),3);if(k<.12){x=.3+G()*.04;y=.3+G()*.04}}
      else if(i===1){if(k<.6){var c=[[-.34,0],[.34,0],[0,.34],[0,-.34]][Math.floor(R()*4)],a=R()*6.2832;x=c[0]+Math.cos(a)*.09;y=c[1]+Math.sin(a)*.09}else if(k<.8){x=(R()*2-1)*.25;y=0}else{var tt=R();x=-.25+tt*.2;y=.25-tt*.2;if(R()<.5){x=-x;y=-y}}}
      else{if(k<.7){var per=4,d=R()*per;if(d<1){x=-.36+d*.72;y=.36}else if(d<2){x=.36;y=.36-(d-1)*.72}else if(d<3){x=.36-(d-2)*.72;y=-.36}else{x=-.36;y=-.36+(d-3)*.72}}else if(k<.85){x=-.36+R()*.72;y=.12}else{x=-.12;y=.12-R()*.48}}
      return [[cx+x+G()*.008,y+G()*.008,G()*.03],R()<.7?1:0]},
    path:function(){var k=R();
      if(k<.6){var t=R()*2-1;return [[t*1.9,Math.sin(t*3)*.05+G()*.006,G()*.01],0]}
      var j=Math.floor(R()*4),x=-1.9+j*1.2667,q=sphereS(.06+R()*.02);return [[x+q[0],q[1]+Math.sin(x/1.9*3)*.05,q[2]],j===3?1:0]},
    dust:function(){return [[(R()-.5)*VW*1.15,(R()-.5)*VH*1.15,(R()-.5)*2.5],R()<.04?1:0]}
  };

  // approximate island outlines (lon, lat) — Luzon, Mindoro, Palawan, Visayas, Mindanao
  var PH=(function(){
    var polys=[
      [[120.6,18.5],[121.2,18.6],[122.2,18.5],[122.3,17.2],[122.5,16.2],[121.6,15.8],[121.6,14.9],[122.0,14.2],[122.6,14.3],[123.1,13.8],[123.9,13.8],[124.2,13.1],[123.9,12.6],[123.3,13.0],[122.6,13.2],[121.8,13.9],[120.9,13.8],[120.6,14.5],[120.3,14.9],[119.8,15.9],[120.3,16.3],[120.4,17.5]],
      [[120.4,13.5],[121.2,13.5],[121.5,12.9],[121.2,12.2],[120.8,12.4],[120.4,13.0]],
      [[117.2,8.4],[117.6,8.3],[119.0,10.0],[119.7,11.0],[119.5,11.4],[118.8,10.6],[117.9,9.3]],
      [[121.9,11.9],[122.6,11.6],[123.1,11.2],[122.4,10.6],[122.0,10.5],[121.9,11.2]],
      [[122.4,10.9],[123.2,10.9],[123.5,10.3],[123.2,9.1],[122.9,9.1],[122.4,9.7]],
      [[124.05,11.3],[124.1,10.6],[123.6,9.6],[123.4,9.5],[123.6,10.3],[123.9,11.0]],
      [[123.8,10.1],[124.5,10.1],[124.6,9.7],[124.1,9.6],[123.8,9.7]],
      [[124.3,11.5],[125.0,11.4],[125.1,10.4],[124.8,10.0],[124.4,10.4],[124.3,11.0]],
      [[124.3,12.5],[125.3,12.6],[125.7,11.8],[125.5,11.1],[125.0,11.2],[124.4,11.6]],
      [[123.2,12.3],[123.8,12.4],[124.0,12.0],[123.5,11.9]],
      [[121.9,7.0],[122.2,7.8],[123.0,8.2],[123.6,8.6],[124.2,8.2],[124.8,8.9],[125.5,9.8],[126.1,9.2],[126.6,7.3],[126.2,6.3],[125.4,5.6],[125.2,6.1],[124.2,6.2],[124.0,7.1],[123.4,7.8],[122.6,7.4],[122.1,6.9]]
    ];
    function W(p){return [(p[0]-122)*.186,(p[1]-12)*.19]}
    var out=[],tot=0;
    polys.forEach(function(pl){
      var pts=pl.map(W),a=0,mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;
      for(var i=0;i<pts.length;i++){var p=pts[i],q=pts[(i+1)%pts.length];a+=p[0]*q[1]-q[0]*p[1];mnx=Math.min(mnx,p[0]);mny=Math.min(mny,p[1]);mxx=Math.max(mxx,p[0]);mxy=Math.max(mxy,p[1])}
      a=Math.abs(a)/2;tot+=a;out.push({pts:pts,area:a,cum:tot,b:[mnx,mny,mxx,mxy]});
    });
    return {polys:out,tot:tot,manila:W([120.98,14.6])};
  })();
  function inPoly(x,y,pts){var c=false;for(var i=0,j=pts.length-1;i<pts.length;j=i++){var a=pts[i],b=pts[j];if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))c=!c}return c}
  shapes.ph=function(){
    var k=R();
    if(k<.06){var m=PH.manila;return [[m[0]+G()*.018,m[1]+G()*.018,G()*.02],1]}
    var pick=R()*PH.tot,pl=PH.polys[0];for(var i=0;i<PH.polys.length;i++){if(pick<=PH.polys[i].cum){pl=PH.polys[i];break}}
    if(k<.2){var n=pl.pts.length,e=Math.floor(R()*n),a=pl.pts[e],b=pl.pts[(e+1)%n],t=R();return [[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,G()*.01],0]}
    for(var tries=0;tries<40;tries++){var x=pl.b[0]+R()*(pl.b[2]-pl.b[0]),y=pl.b[1]+R()*(pl.b[3]-pl.b[1]);if(inPoly(x,y,pl.pts))return [[x,y,G()*.025],0]}
    return [[pl.pts[0][0],pl.pts[0][1],0],0];
  };
  shapes.dust2=shapes.dust;shapes.dustInk=shapes.dust;shapes.markInk=function(){var o=shapes.mark();o[1]=0;return o};

  // anchor: element the formation rides with while scrolling ("self" = the scene element)
  // fit: formation width in world units that should match the anchor's on-screen width
  var scenes={
    hero:{s:"mark",anchor:"self",x:.25,y:.03,k:.95,a:1,ink:0,n:.35,size:2.3,rot:1},
    pov:{s:"chaos",anchor:"self",x:.12,y:0,k:1.05,a:0,ink:0,n:1.0,size:2.0,rot:1},
    bars:{s:"bars",anchor:"self",fit:3.0,x:0,y:0,a:0,ink:0,n:.35,size:2.0,rot:.25},
    dust:{s:"dust",x:0,y:0,k:1,a:0,ink:0,n:.6,size:1.7,rot:.6},
    lattice:{s:"lattice",anchor:".diagram",fit:3.0,x:0,y:0,a:0,ink:0,n:.25,size:2.0,rot:.18},
    orbits:{s:"orbits",anchor:".diagram",fit:3.0,x:0,y:0,a:0,ink:0,n:.25,size:2.0,rot:.35},
    planes:{s:"planes",anchor:".diagram",fit:3.0,x:0,y:0,a:0,ink:1,n:.15,size:2.2,rot:.18},
    triad:{s:"triad",anchor:".matrix",fit:3.6,x:0,y:0,a:0,ink:0,n:.2,size:1.9,rot:.25},
    path:{s:"path",anchor:".steps",top:1,fit:3.8,x:0,y:0,a:0,ink:0,n:.12,size:2.0,rot:.1},
    dust2:{s:"dust2",x:0,y:0,k:1,a:0,ink:0,n:.5,size:1.7,rot:.6},
    ph:{s:"ph",anchor:".phstage",fit:1.9,x:0,y:0,a:.9,ink:0,n:.12,size:2.2,rot:.12},
    caseLattice:{s:"lattice",anchor:".stage",fit:3.0,x:0,y:0,a:.95,ink:0,n:.3,size:2.5,rot:.4},
    caseOrbits:{s:"orbits",anchor:".stage",fit:3.0,x:0,y:0,a:.95,ink:0,n:.3,size:2.5,rot:.7},
    casePlanes:{s:"planes",anchor:".stage",fit:3.0,x:0,y:0,a:.95,ink:0,n:.2,size:2.5,rot:.45},
    dustInk:{s:"dustInk",x:0,y:0,k:1,a:0,ink:1,n:.5,size:1.8,rot:.6},
    markInk:{s:"markInk",anchor:"#mdiag",fit:2.48,x:0,y:0,a:.35,ink:1,n:.3,size:2.1,rot:.5}
  };

  var A=new Float32Array(N*3),B=new Float32Array(N*3),TA=new Float32Array(N),TB=new Float32Array(N),RND=new Float32Array(N*4);
  for(var i=0;i<N;i++){
    RND[i*4]=R();RND[i*4+1]=R();RND[i*4+2]=R();RND[i*4+3]=R();
    var d=shapes.dust();A[i*3]=d[0][0]*2.2;A[i*3+1]=d[0][1]*2.2;A[i*3+2]=d[0][2]*2;
  }
  var geo;
  if(!TWO){
    geo=new THREE.BufferGeometry();
    geo.setAttribute("position",new THREE.BufferAttribute(A,3));
    geo.setAttribute("aTarget",new THREE.BufferAttribute(B,3));
    geo.setAttribute("aToneA",new THREE.BufferAttribute(TA,1));
    geo.setAttribute("aToneB",new THREE.BufferAttribute(TB,1));
    geo.setAttribute("aRand",new THREE.BufferAttribute(RND,4));
    geo.boundingSphere=new THREE.Sphere(new THREE.Vector3(),50);
  }else geo={attributes:{position:{},aTarget:{},aToneA:{},aToneB:{}},dispose:function(){}};

  var noise="vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}"+
  "float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}";

  var uniforms={uTime:{value:0},uMorph:{value:0},uNoise:{value:.4},uAlpha:{value:1},uInk:{value:0},uSize:{value:2.2},uPR:{value:PR},uMouse:{value:TWO?V3():new THREE.Vector3(99,99,0)},uMouseStr:{value:0},uFlow:{value:0}};
  var mat=TWO?{dispose:function(){}}:new THREE.ShaderMaterial({
    uniforms:uniforms,transparent:true,depthWrite:false,depthTest:false,
    vertexShader:
      "attribute vec3 aTarget;attribute float aToneA;attribute float aToneB;attribute vec4 aRand;"+
      "uniform float uTime,uMorph,uNoise,uAlpha,uSize,uPR,uMouseStr,uFlow;uniform vec3 uMouse;varying float vTone;varying float vA;"+noise+
      "void main(){float dl=aRand.x*.35;float m=clamp((uMorph-dl)/.65,0.,1.);m=m*m*(3.-2.*m);"+
      "vec3 p=mix(position,aTarget,m);float fly=sin(m*3.14159);"+
      "float t=uTime*.12;vec3 q=p*.85;vec3 n=vec3(snoise(q+vec3(t,0.,0.)),snoise(q+vec3(7.1,t,0.)),snoise(q+vec3(0.,3.3,-t)));"+
      "p+=n*(uNoise*.05+uFlow*.08+fly*.45*aRand.y);"+
      "vec4 w=modelMatrix*vec4(p,1.);vec2 dd=w.xy-uMouse.xy;float d=length(dd);float f=smoothstep(.85,0.,d)*uMouseStr;"+
      "w.xy+=normalize(dd+1e-4)*f*.32;w.z+=f*.5;"+
      "vec4 mv=viewMatrix*w;gl_Position=projectionMatrix*mv;"+
      "gl_PointSize=uSize*(.55+aRand.z*.9)*uPR*(6./-mv.z)*(1.+f*.8);"+
      "vTone=mix(aToneA,aToneB,m);vA=uAlpha*(.35+.65*aRand.w)*(1.+f*1.2);}",
    fragmentShader:
      "uniform float uInk;varying float vTone;varying float vA;"+
      "void main(){vec2 c=gl_PointCoord-.5;float r=length(c);if(r>.5)discard;float a=smoothstep(.5,.05,r)*vA;"+
      "vec3 cream=vec3(.949,.941,.91);vec3 lime=vec3(.843,1.,.247);vec3 ink=vec3(.063,.067,.059);"+
      "float L=step(.5,vTone);vec3 dark=mix(cream,lime,L);vec3 lit=mix(ink,cream,L);"+
      "gl_FragColor=vec4(mix(dark,lit,uInk),min(a*(1.+uInk*.6),1.));}"
  });
  var points,group;
  if(!TWO){points=new THREE.Points(geo,mat);group=new THREE.Group();group.add(points);scene.add(group)}
  else{points={rotation:V3()};group={position:V3(),scale:{v:1,setScalar:function(k){this.v=k}}}}

  // ---- 2D renderer: same shapes, morphs, mouse field and colours, drawn with canvas rectangles ----
  var TAN=Math.tan(17.5*Math.PI/180);
  function draw2d(){
    var W=c2.width,H=c2.height,u=uniforms;ctx2.clearRect(0,0,W,H);
    var t=u.uTime.value,m0=u.uMorph.value,amp=u.uNoise.value*.05+u.uFlow.value*.08,ink=u.uInk.value>.5;
    var rx=points.rotation.x,ry=points.rotation.y,cx=Math.cos(rx),sx=Math.sin(rx),cy=Math.cos(ry),sy=Math.sin(ry);
    var gx=group.position.x,gy=group.position.y,gk=group.scale.v,mx=u.uMouse.value.x,my=u.uMouse.value.y,ms=u.uMouseStr.value;
    var asp=camera.aspect,sz0=u.uSize.value*PR,al0=u.uAlpha.value;
    var cols=ink?["#10110f","#f2f0e8"]:["#f2f0e8","#d7ff3f"];
    for(var pass=0;pass<2;pass++){
      ctx2.fillStyle=cols[pass];
      for(var i=0;i<N;i++){
        var j=i*3,q=i*4,dl=RND[q]*.35,m=(m0-dl)/.65;m=m<0?0:m>1?1:m;m=m*m*(3-2*m);
        var tone=TA[i]+(TB[i]-TA[i])*m;if((tone>.5?1:0)!==pass)continue;
        var x=A[j]+(B[j]-A[j])*m,y=A[j+1]+(B[j+1]-A[j+1])*m,z=A[j+2]+(B[j+2]-A[j+2])*m;
        var fly=Math.sin(m*3.14159)*.45*RND[q+1],a=amp+fly,ph=RND[q+2]*6.28;
        x+=Math.sin(y*1.7+t*.35+ph)*a;y+=Math.sin(z*1.9+t*.3+ph*1.3)*a;z+=Math.sin(x*1.5-t*.3+ph*.7)*a;
        var y1=y*cx-z*sx,z1=y*sx+z*cx,x2=x*cy+z1*sy,z2=-x*sy+z1*cy;
        var wx=x2*gk+gx,wy=y1*gk+gy,wz=z2*gk;
        var dx=wx-mx,dy=wy-my,d=Math.sqrt(dx*dx+dy*dy)+1e-4,f=0;
        if(ms>0&&d<.85){f=1-d/.85;f=f*f*(3-2*f)*ms;wx+=dx/d*f*.32;wy+=dy/d*f*.32;wz+=f*.5}
        var zc=6-wz;if(zc<.3)continue;
        var sxp=(wx/(zc*TAN*asp)*.5+.5)*W,syp=(-wy/(zc*TAN)*.5+.5)*H;
        if(sxp<-4||syp<-4||sxp>W+4||syp>H+4)continue;
        var s=sz0*(.55+RND[q+2]*.9)*(6/zc)*(1+f*.8)*1.25;
        var al=al0*(.35+.65*RND[q+3])*(1+f*1.2)*(ink?1.4:1);ctx2.globalAlpha=al>1?1:al;
        ctx2.fillRect(sxp-s/2,syp-s/2,s,s);
      }
    }
    ctx2.globalAlpha=1;
  }

  var state={cur:null,el:null,anchor:null,morph:0,tgt:{x:0,y:0,k:1,a:1,ink:0,n:.4,size:2.2,rot:1},drag:0,dragV:0,rotY:0,rotX:0};
  function layout(sc){
    var mobile=innerWidth<860,o={x:mobile?0:sc.x*VW,y:sc.y*VH,k:(sc.k||1)*Math.min(1,VW/5.2)*(mobile?.9:1),a:sc.a*(mobile&&sc.s.indexOf("dust")<0&&!sc.fit?.55:1),ink:sc.ink,n:sc.n,size:sc.size,rot:sc.rot};
    var a=state.anchor;
    if(a){
      var r=a.getBoundingClientRect(),cx=r.left+r.width/2,cy=sc.top?r.top:r.top+r.height/2;
      o.x+=(cx/innerWidth-.5)*VW;o.y+=-(cy/innerHeight-.5)*VH;
      if(sc.fit)o.k=(r.width/innerWidth*VW)/sc.fit;
    }
    return o;
  }
  function bake(){ // freeze current blended position into A
    var m0=state.morph;
    for(var i=0;i<N;i++){
      var m=Math.min(1,Math.max(0,(m0-RND[i*4]*.35)/.65));m=m*m*(3-2*m);
      var j=i*3;A[j]+= (B[j]-A[j])*m;A[j+1]+=(B[j+1]-A[j+1])*m;A[j+2]+=(B[j+2]-A[j+2])*m;
      TA[i]=TA[i]+(TB[i]-TA[i])*m;
    }
  }
  function goto(name,force,el){
    if(!scenes[name]||(state.cur===name&&state.el===el&&!force))return;
    if(el){state.el=el;var an=scenes[name].anchor;state.anchor=!an?null:(an==="self"?el:(el.querySelector(an)||document.querySelector(an)))}
    if(state.cur)bake();
    var sc=scenes[name],fn=shapes[sc.s];
    for(var i=0;i<N;i++){var r=fn(i);B[i*3]=r[0][0];B[i*3+1]=r[0][1];B[i*3+2]=r[0][2];TB[i]=r[1]}
    geo.attributes.position.needsUpdate=true;geo.attributes.aTarget.needsUpdate=true;geo.attributes.aToneA.needsUpdate=true;geo.attributes.aToneB.needsUpdate=true;
    state.morph=REDUCED?1:0;state.cur=name;state.tgt=layout(sc);
  }
  function resize(){
    renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
    VH=2*6*Math.tan(17.5*Math.PI/180);VW=VH*camera.aspect;
    if(state.cur&&state.cur.indexOf("dust")===0)goto(state.cur,true,state.el)
  }
  resize();addEventListener("resize",function(){if(alive)resize()});

  // drag-to-spin anywhere in the hero
  var down=false,lx=0;
  addEventListener("pointerdown",function(e){if(state.cur==="hero"&&!e.target.closest("a,button")){down=true;lx=e.clientX;cur.classList.add("grab")}});
  addEventListener("pointerup",function(){down=false;cur.classList.remove("grab")});
  addEventListener("pointermove",function(e){if(down){state.dragV+=(e.clientX-lx)*.0022;lx=e.clientX}},{passive:true});

  var blank=false;
  var clock=TWO?{t0:performance.now(),last:performance.now(),elapsedTime:0,getDelta:function(){var n=performance.now(),d=(n-this.last)/1000;this.last=n;this.elapsedTime=(n-this.t0)/1000;return d}}:new THREE.Clock(),g={x:0,y:0,k:1,r:1},smoothFlow=0,visible=true;
  document.addEventListener("visibilitychange",function(){visible=!document.hidden});
  function frame(){
    if(!alive)return;
    requestAnimationFrame(frame);
    glBeat++;
    if(!visible)return;
    var dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
    uniforms.uTime.value=t;
    if(!document.body.classList.contains("loading")||t>9)state.morph=Math.min(1,state.morph+dt*(state.cur==="hero"&&state.morph<1?.5:.62));
    uniforms.uMorph.value=state.morph;
    var T=state.tgt=state.cur?layout(scenes[state.cur]):state.tgt,e=1-Math.pow(.04,dt),ef=1-Math.pow(.0006,dt);
    g.x+=(T.x-g.x)*ef;g.y+=(T.y-g.y)*ef;g.k+=(T.k-g.k)*e;g.r+=(T.rot-g.r)*e;
    uniforms.uAlpha.value+=(T.a-uniforms.uAlpha.value)*e;
    uniforms.uInk.value+=(T.ink-uniforms.uInk.value)*e*1.4;
    uniforms.uNoise.value+=(T.n-uniforms.uNoise.value)*e;
    uniforms.uSize.value+=(T.size-uniforms.uSize.value)*e;
    smoothFlow+=(Math.min(Math.abs(scrollVel)/40,2.5)-smoothFlow)*.08;scrollVel*=.85;
    uniforms.uFlow.value=smoothFlow;
    group.position.set(g.x,g.y,0);group.scale.setScalar(g.k);
    state.dragV*=.94;state.drag+=state.dragV;if(state.cur!=="hero")state.drag*=.96;
    var wantY=(Math.sin(t*.16)*.28+pointer.nx*.32)*g.r+state.drag,wantX=(-pointer.ny*.18+Math.sin(t*.11)*.06)*g.r;
    state.rotY+=(wantY-state.rotY)*.05;state.rotX+=(wantX-state.rotX)*.05;
    points.rotation.set(state.rotX,state.rotY,0);
    uniforms.uMouse.value.set(pointer.nx*VW/2,pointer.ny*VH/2,0);
    uniforms.uMouseStr.value+=((pointer.active&&FINE?1:0)-uniforms.uMouseStr.value)*.08;
    headlineTick();
    if(document.body.classList.contains("loading")&&t<9)return;
    // nothing to show here: draw one empty frame, then idle until a visible scene returns
    if(T.a===0&&uniforms.uAlpha.value<.004){if(!blank){renderer.render(scene,camera);blank=true}return}
    blank=false;
    renderer.render(scene,camera);
  }
  goto("hero",false,document.getElementById("top"));
  if(REDUCED){state.morph=1;uniforms.uMorph.value=1;renderer.render(scene,camera);}
  frame();
  return {mode:TWO?"2d":"gl",goto:goto,destroy:function(){
    alive=false;
    try{geo.dispose();mat.dispose();renderer.dispose();renderer.forceContextLoss()}catch(e){}
    if(c2)c2.remove();
  }};
}

/* scene picker: which [data-scene] crosses the viewport centre */
var curScene=null;
function pickScene(){
  if(!GL)return;
  var sceneEls=document.querySelectorAll("[data-scene]"),mid=innerHeight*.5,pick=null,pel=null;
  for(var i=0;i<sceneEls.length;i++){var r=sceneEls[i].getBoundingClientRect();if(r.top<=mid&&r.bottom>mid){pick=sceneEls[i].getAttribute("data-scene");pel=sceneEls[i]}}
  if(pel&&pel!==curScene){curScene=pel;GL.goto(pick,false,pel)}
}

var force2D=false;
function startGL(){
  if(GL){try{GL.destroy()}catch(e){}GL=null}
  if(!force2D){try{GL=initGL("gl")}catch(e){console.error("[monarch] webgl init failed",e);GL=null}}
  if(!GL){try{GL=initGL("2d")}catch(e){console.error("[monarch] 2d fallback failed",e);GL=null}}
  window.__mGLok=!!GL;
  document.body.classList.toggle("no-gl",!GL);
  if(GL){curScene=null;pickScene()}
  return !!GL;
}
if(!startGL()){
  // headline + cursor keep working without WebGL
  var hl=function(){if(GL)return;requestAnimationFrame(hl);headlineTick()};hl();
  if(!window.THREE){ // primary CDN blocked or failed: try a second host, then retry
    var fb=document.createElement("script");
    fb.src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js";
    fb.onload=function(){startGL()};
    document.head.appendChild(fb);
  }
}
/* ---- keep the particle field alive ----
   What can stop a WebGL canvas, and what we do about it:
   - the browser caps live WebGL canvases (~16) and switches off the oldest → rebuild on a fresh canvas
   - the GPU resets (sleep, driver update)                                  → rebuild on a fresh canvas
   - the render loop silently stalls while someone is using the page        → heartbeat watchdog rebuilds
   - copies of the page that nobody can see hog a slot                      → release after 8 s off-screen
     (and wake instantly on any scroll, pointer or key input, in case visibility was misreported)
   - rebuilds fighting another page for the last slot                       → back-off so nothing thrashes */
var parked=false,parkT=0,lostT=0,glBeat=0,lastBeat=-1,lastInput=Date.now(),rebuilds=[],coolUntil=0;
function canRebuild(){
  var now=Date.now();rebuilds=rebuilds.filter(function(t){return now-t<30000});
  if(now<coolUntil)return false;
  if(rebuilds.length>=4){coolUntil=now+15000;rebuilds=[];if(!force2D){force2D=true;setTimeout(function(){force2D=false},60000);return true}return false}
  rebuilds.push(now);return true;
}
function bindCanvas(c){
  c.addEventListener("webglcontextlost",function(e){
    e.preventDefault();
    if(parked)return;
    clearTimeout(lostT);lostT=setTimeout(function(){if(!parked)rebuildGL()},900);
  });
  c.addEventListener("webglcontextrestored",function(){clearTimeout(lostT);if(GL){curScene=null;pickScene()}});
}
function rebuildGL(force){
  if(!force&&!canRebuild())return;
  if(GL){try{GL.destroy()}catch(e){}GL=null}
  var old=$("#gl"),c=old.cloneNode(false);
  old.parentNode.replaceChild(c,old);bindCanvas(c);
  startGL();
}
function park(){parked=true;if(GL){try{GL.destroy()}catch(e){}GL=null}}
function unpark(){if(parked){parked=false;rebuildGL(true)}}
bindCanvas($("#gl"));
if("IntersectionObserver" in window){
  var sentinel=document.createElement("div");
  sentinel.setAttribute("aria-hidden","true");
  sentinel.style.cssText="position:fixed;inset:0;pointer-events:none;visibility:hidden;z-index:-1";
  document.body.appendChild(sentinel);
  new IntersectionObserver(function(es){
    var vis=es[es.length-1].isIntersecting;
    clearTimeout(parkT);
    if(!vis)parkT=setTimeout(function(){if(Date.now()-lastInput>8000)park()},8000);
    else unpark();
  }).observe(sentinel);
}
["pointermove","pointerdown","wheel","scroll","keydown","touchstart"].forEach(function(ev){
  addEventListener(ev,function(){lastInput=Date.now();if(parked)unpark()},{passive:true,capture:true});
});
document.addEventListener("visibilitychange",function(){if(!document.hidden){lastInput=Date.now();if(parked)unpark()}});
// watchdog: while the page is visible and in use, the loop must be beating and the context alive
setInterval(function(){
  if(parked||document.hidden)return;
  var inUse=Date.now()-lastInput<6000;
  var c=$("#gl"),gl=null;if(GL&&GL.mode==="gl"){try{gl=c&&(c.getContext("webgl2")||c.getContext("webgl"))}catch(e){}}
  var lost=GL&&GL.mode==="gl"&&gl&&gl.isContextLost&&gl.isContextLost();
  var stalled=GL&&inUse&&glBeat===lastBeat;
  if(!GL||lost||stalled)rebuildGL();
  lastBeat=glBeat;
},3000);
setInterval(function(){if(GL&&GL.mode==="2d"&&!force2D&&!parked&&!document.hidden){var ok=false;try{var t=document.createElement("canvas");ok=!!(t.getContext("webgl2")||t.getContext("webgl"))}catch(e){}if(ok)rebuildGL(true)}},60000);
(function cursorLoop(){
  requestAnimationFrame(cursorLoop);
  var vx=pointer.x-rp.x;
  rp.x+=(pointer.x-rp.x)*.4;rp.y+=(pointer.y-rp.y)*.4;
  tiltA=0;
  cur.style.transform="translate("+rp.x.toFixed(1)+"px,"+rp.y.toFixed(1)+"px)";
  tilt.style.transform="rotate("+tiltA.toFixed(1)+"deg)";
})();


/* ============ CASE STUDIES: data + hash router ============ */
var ARROW='<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M11.3328 11.3326V4.66699H4.66718M11.3328 4.66699L4.66718 11.3326" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
var ARROW_R='<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.33279 8.00021H12.6672M7.99999 12.6674L12.6672 8.00021L7.99999 3.33301" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
var CASES={
  "aster":{idx:"01",cat:"AI solutions",name:"Aster / Knowledge Operations",title:"An AI copilot people can verify.",scene:"caseLattice",
    meta:[["Client","Aster"],["Sector","Enterprise knowledge software"],["Services","AI product strategy, RAG systems, experience design"],["Timeline","20 weeks"],["Year","2025"]],
    stage:["Evidence → decision","AI copilot / verified path"],
    overview:"Aster’s operations teams answered hundreds of policy and product questions a week. The answers existed—spread across 18 tools—but nobody trusted a fast answer they couldn’t check. We designed a copilot whose first job is to show its working.",
    story:[["Challenge","Critical knowledge was scattered across 18 tools, making every answer slow and difficult to trust. Teams re-verified answers by hand, and a handful of experts became the bottleneck for routine questions."],["Insight","Confidence came from showing the path to an answer—not simply producing one faster. In research sessions, people accepted a slower answer if they could see its sources and who had approved them."],["Solution","A citation-first AI workspace with role-aware retrieval, human review and transparent confidence states. Every answer carries its sources, their freshness and a clear route to an expert when confidence is low."]],
    approach:[["Frame","2 weeks","Mapped 312 recurring questions to the tools, owners and risks behind them, and agreed what a verified answer means."],["Find","3 weeks","Shadowed operations and compliance teams, then tested three trust models on paper before any model work."],["Form","7 weeks","Built retrieval, citation and review flows together, tuning confidence thresholds against real questions."],["Field","8 weeks","Rolled out team by team, measuring accepted answers, escalations and time to a verified answer."]],
    built:[["Citation-first answers","Every sentence links to the passage it came from, with the source owner and last-reviewed date."],["Confidence states","Three plain states—verified, likely, needs an expert—replace a misleading single score."],["Role-aware retrieval","Answers respect permissions and adapt to the asker’s role, region and product line."],["Human review loop","Experts approve, correct or retire answers, and each approval becomes reusable, trusted knowledge."]],
    results:[["−61%","Time to a verified answer","First 90 days"],["18 → 1","Tools searched per question","One governed workspace"],["87%","Answers accepted without escalation","Across six teams"]],
    quote:["Monarch gave us the clarity to make a difficult product feel inevitable. They challenged the technology, the language and the operating model—not just the interface.","Amira Khan","Chief Product Officer / Aster","portrait"],
    caps:"AI product strategy / RAG systems / Experience design",next:"morrow"},
  "morrow":{idx:"02",cat:"Semantic SEO",name:"Morrow / Climate Materials",title:"Search organised around meaning.",scene:"caseOrbits",
    meta:[["Client","Morrow"],["Sector","Low-carbon building materials"],["Services","Semantic SEO, information architecture, content systems"],["Timeline","6 months"],["Year","2025"]],
    stage:["Meaning → search","Entities / intent / proof"],
    overview:"Morrow makes low-carbon materials that architects want to specify—if they can find the evidence in time. The expertise was deep, but the site was organised around the company, not the questions specifiers actually ask.",
    story:[["Challenge","Deep technical expertise existed, but disconnected pages failed to answer how specifiers actually searched. Test data sat in PDFs, and product pages never mentioned the standards buyers were checking against."],["Insight","The growth opportunity was a map of entities and decisions, not a longer keyword list. Specifiers search by material, standard and application—and they need proof at the moment of choice."],["Solution","A semantic content system linking products, proof, applications and expert guidance into useful topic journeys, structured so both people and machine readers can cite it."]],
    approach:[["Frame","2 weeks","Audited 1,400 pages and nine months of search data against the decisions specifiers make."],["Find","4 weeks","Interviewed 22 architects and specifiers, and modelled the entities they search by: materials, standards, applications, proof."],["Form","8 weeks","Designed the topic architecture and structured content model, then rebuilt the templates around it."],["Field","12 weeks","Published in topic clusters, measured qualified sessions and specification requests, and pruned what didn’t help."]],
    built:[["Entity map","A shared model of 140 entities that content, schema and navigation all draw from."],["Topic journeys","Pages that answer a specifier’s next question, linking product, evidence and application guidance."],["Structured proof","Test data, certifications and case studies published as structured, citable content."],["Editorial system","Templates, briefs and governance so Morrow’s experts can extend the system without an agency."]],
    results:[["+186%","Non-brand qualified sessions","Six months"],["2.3×","Specification requests from search","Versus the prior six months"],["−38%","Pages, with wider coverage","1,400 → 870"]],
    quote:["We stopped writing for keywords and started answering the questions our specifiers actually have. The results followed.","Daniel Osei","Head of Growth / Morrow","DO"],
    caps:"Semantic SEO / Information architecture / Content systems",next:"common-ground"},
  "common-ground":{idx:"03",cat:"Web + mobile",name:"Common Ground / Civic Platform",title:"A mobile service built for real life.",scene:"casePlanes",
    meta:[["Client","Common Ground"],["Sector","Public services"],["Services","Service design, mobile UX, product engineering"],["Timeline","9 months"],["Year","2024"]],
    stage:["Service → mobile","Saved steps / plain guidance / updates"],
    overview:"Common Ground runs housing and benefits support for a city of 1.2 million residents. Most applications started on a phone and ended in a phone call—because the service had never been designed for one.",
    story:[["Challenge","Residents abandoned a fragmented service across forms, calls and desktop-only portals. A single application could involve four systems and two office visits."],["Insight","Progress needed to feel visible and forgiving—even with one hand, weak signal and little time. The biggest drop-off wasn’t difficulty; it was losing work and not knowing what happened next."],["Solution","One responsive product with saved steps, plain-language guidance and proactive case updates, backed by a shared view for caseworkers."]],
    approach:[["Frame","3 weeks","Traced 40 real applications end to end to find exactly where and why residents dropped out."],["Find","4 weeks","Tested with residents in libraries, community centres and on the bus—often one-handed, with weak signal."],["Form","10 weeks","Designed and built one responsive product and design system, piloting each step with caseworkers."],["Field","22 weeks","Launched service by service, measuring completed journeys, avoided calls and time to decision."]],
    built:[["Saved steps","Progress saves at every step and works offline, so an interruption never means starting again."],["Plain guidance","Every question rewritten in plain language, with an example and the reason it’s asked."],["Proactive updates","Residents see where their case is and what happens next—before they need to call."],["Caseworker view","A shared picture of each case, so staff can help residents pick up exactly where they left off."]],
    results:[["3.4×","More completed service journeys","12 weeks"],["−48%","Calls asking about case status","Contact centre"],["4.7/5","Resident rating","In-product survey"]],
    quote:["Residents tell us it’s the first council service that feels like it was made for their life, not our process.","Priya Nair","Director of Digital Services / Common Ground","PN"],
    caps:"Service design / Mobile UX / Product engineering",next:"tala"}
};

/* ============ SAMPLE PRODUCT SCREENS (recreated UI, sample data) ============ */
/* =====================================================================
   SAMPLE PRODUCT SCREENS — modern UI kit (recreated interfaces, sample data)
   Every screen is plain HTML/SVG so it stays sharp at any size.
   Elements marked data-n="k" are the targets of the numbered annotations.
   ===================================================================== */
var ICP={
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  home:'<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/>',
  inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  users:'<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 3.13a4 4 0 0 1 0 7.75M22 21a7 7 0 0 0-5-6.7"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  chart:'<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  checkc:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  msg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  send:'<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  spark:'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  back:'<path d="m15 18-6-6 6-6"/>',
  chev:'<path d="m9 18 6-6-6-6"/>',
  chevd:'<path d="m6 9 6 6 6-6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  filter:'<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',
  lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  wifioff:'<path d="M2 2l20 20"/><path d="M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5.2-2.8M19 13a10 10 0 0 0-2.3-1.7M12 20h.01"/>',
  truck:'<path d="M1 4h14v12H1z"/><path d="M15 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.2"/><circle cx="18.5" cy="18.5" r="2.2"/>',
  box:'<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  cloud:'<path d="M17.5 18H7a5 5 0 1 1 1-9.9A6 6 0 0 1 19.5 10 4 4 0 0 1 17.5 18z"/>',
  rain:'<path d="M17.5 15H7a5 5 0 1 1 1-9.9A6 6 0 0 1 19.5 7 4 4 0 0 1 17.5 15z"/><path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2"/>',
  ship:'<path d="M2 20c2 1 4 1 6 0s4-1 6 0 4 1 6 0"/><path d="M4 16l-1-5h18l-2 5"/><path d="M12 3v8M7 11V6h10v5"/>',
  plane:'<path d="M2 16l20-7-3-2-7 3-6-5-2 1 4 6-4 2-2-1-1 1z"/>',
  van:'<path d="M3 17V8l2-3h11l4 5h1v7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>',
  up:'<path d="M7 10v11M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.4 22H7V10l4-8a3 3 0 0 1 4 3.9z"/>',
  copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  share:'<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>',
  trend:'<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  wallet:'<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20M16 15h2"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  leaf:'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
  bolt:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 19v3"/>',
  cart:'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
  store:'<path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/>',
  receipt:'<path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 2 2V2l-2 2-3-2-3 2-3-2-3 2-3-2z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  anchor:'<circle cx="12" cy="5" r="3"/><path d="M12 22V8M5 12H2a10 10 0 0 0 20 0h-3"/>',
  doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  more:'<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  layers:'<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  card:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  qr:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 18h3v3h-3z"/>',
  flag:'<path d="M4 22V4a8 8 0 0 1 8 0 8 8 0 0 0 8 0v10a8 8 0 0 1-8 0 8 8 0 0 0-8 0"/>',
  star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  refresh:'<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  battery:'<rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 11v2"/><path d="M6 10v4M10 10v4"/>'
};
function IC(n,s,c,sw){return '<svg class="ic" width="'+(s||16)+'" height="'+(s||16)+'" viewBox="0 0 24 24" fill="none" stroke="'+(c||"currentColor")+'" stroke-width="'+(sw||2)+'" stroke-linecap="round" stroke-linejoin="round">'+(ICP[n]||"")+'</svg>'}
function AV(t,c,s){s=s||28;return '<span class="av" style="width:'+s+'px;height:'+s+'px;background:'+c+';font-size:'+Math.round(s*.38)+'px">'+t+'</span>'}
function MCUR(x,y,name,c){return '<div class="mcur" style="left:'+x+'px;top:'+y+'px"><svg width="16" height="18" viewBox="0 0 16 18"><path d="M1 1l13 6-5.6 1.7L6 15z" fill="'+c+'" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></svg><span style="background:'+c+'">'+name+'</span></div>'}
function SPARK(pts,w,h,c,fill){var mx=Math.max.apply(null,pts),mn=Math.min.apply(null,pts),d="";pts.forEach(function(v,i){var x=i/(pts.length-1)*w,y=h-(v-mn)/(mx-mn||1)*(h-2)-1;d+=(i?"L":"M")+x.toFixed(1)+" "+y.toFixed(1)});
  return '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">'+(fill?'<path d="'+d+'L'+w+' '+h+'L0 '+h+'z" fill="'+c+'" opacity=".12"/>':'')+'<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="1.6" stroke-linejoin="round"/></svg>'}
var SBI='<span class="sbi"><svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor"/><rect x="4.5" y="5" width="3" height="6" rx="1" fill="currentColor"/><rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="currentColor"/><rect x="13.5" y="0" width="3" height="11" rx="1" fill="currentColor"/></svg><svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 10.5l2.2-2.6a3.2 3.2 0 0 0-4.4 0z M7.5 3.6c1.9 0 3.6.7 4.9 1.9l1.3-1.5A9 9 0 0 0 7.5 1.6 9 9 0 0 0 1.3 4l1.3 1.5a7 7 0 0 1 4.9-1.9z" fill="currentColor"/></svg><svg width="25" height="12" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3.5" stroke="currentColor" opacity=".45" fill="none"/><rect x="2" y="2" width="15" height="8" rx="2" fill="currentColor"/><rect x="23" y="4" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".45"/></svg></span>';
function SB(color){return '<div class="sbar" style="color:'+(color||"#111")+'"><span>9:41</span>'+SBI+'</div>'}
function PH(color,cls,inner,bg){return '<div class="ui x ios '+(cls||"")+'" style="width:360px;height:740px;--b:'+color+';'+(bg?"background:"+bg:"")+'">'+inner+'</div>'}
function TABBAR(items,on){return '<div class="tabbar">'+items.map(function(t,i){return '<div class="'+(i===on?"on":"")+'">'+IC(t[0],24,"currentColor",i===on?2.2:1.8)+'<span>'+t[1]+'</span>'+(t[2]?'<i class="badge">'+t[2]+'</i>':'')+'</div>'}).join("")+'</div>'}
function SWITCH(on){return '<span class="sw'+(on?" on":"")+'"><i></i></span>'}

/* ============================== ASTER ============================== */
var A_IND="#4c5fd5";
function uiAster(){
  var rail=['home','inbox','search','book','users','chart'].map(function(n,i){return '<span class="ri'+(i===3?" on":"")+'">'+IC(n,18,"currentColor",1.8)+(i===1?'<i class="rb">3</i>':'')+'</span>'}).join("");
  var spaces=[["Operations",128,1],["Compliance",64],["Product",212],["Customer support",356]];
  var src=[
    ["#e03131","PDF","Refund policy — Enterprise","Policy Hub › Legal › Billing","Enterprise annual plans may be refunded <mark>pro rata after 30 days</mark> where a service failure breaches the SLA.","LO","Legal Ops","Reviewed 17d ago",1],
    ["#2f9e44","XLS","Finance approval matrix","Finance Drive › Controls","Refunds or credits <mark>above ₱250,000</mark> require Finance lead approval.","MS","M. Santos","Reviewed 26d ago",2],
    ["#1c7ed6","WIKI","Service credits FAQ","Support Wiki › Billing","For convenience requests, offer <mark>account credit</mark>; refunds do not apply.","ST","Support team","Reviewed 41d ago",0]];
  return '<div class="ui x" style="width:1200px;height:720px;--b:'+A_IND+';display:grid;grid-template-columns:58px 228px 1fr 318px;background:#fff">'+
  '<aside class="a-rail"><span class="a-logo">A</span>'+rail+'<span style="flex:1"></span><span class="ri">'+IC("settings",18,"currentColor",1.8)+'</span>'+AV("JR","#f08c00",28)+'</aside>'+
  '<aside class="a-side"><div class="a-ws"><span class="a-wsl">AO</span><b>Aster Ops</b>'+IC("chevd",14,"#9ca3af")+'</div>'+
    '<div class="a-find">'+IC("search",14,"#9ca3af")+'<span>Search or ask…</span><span class="kbd">⌘K</span></div>'+
    '<p class="a-h">Spaces</p>'+spaces.map(function(s){return '<div class="a-it'+(s[2]?" on":"")+'">'+IC("book",15,s[2]?A_IND:"#9ca3af",1.8)+'<span>'+s[0]+'</span><em>'+s[1]+'</em></div>'}).join("")+
    '<p class="a-h">Pinned</p>'+[["#e03131","Refund policy — Enterprise"],["#f08c00","Q4 pricing changes"]].map(function(p){return '<div class="a-it"><i class="dot" style="background:'+p[0]+'"></i><span>'+p[1]+'</span></div>'}).join("")+
    '<div class="a-usage"><div style="display:flex;justify-content:space-between"><span class="xs mut">Verified answers · this week</span>'+IC("trend",14,"#2f9e44")+'</div><b>1,284 <small style="color:#2f9e44;font-size:11px">▲ 12%</small></b>'+SPARK([12,15,14,19,18,22,21,26,25,29],180,34,A_IND,1)+'</div>'+
  '</aside>'+
  '<main class="a-main">'+
    '<div class="a-top"><span class="sm mut">Operations</span>'+IC("chev",12,"#c0c4cc")+'<span class="sm mut">Billing &amp; refunds</span>'+IC("chev",12,"#c0c4cc")+'<span class="sm" style="font-weight:600">Ask</span><span style="flex:1"></span>'+
      '<span class="avs">'+AV("JR","#f08c00",26)+AV("MS","#2f9e44",26)+AV("AL","#7048e8",26)+'<span class="av" style="width:26px;height:26px;background:#eef0f4;color:#4b5563;font-size:10px">+4</span></span><span class="btn">'+IC("share",14)+'Share</span><span class="btn gh" style="padding:0 6px">'+IC("more",18)+'</span></div>'+
    '<div class="a-body">'+
      '<div style="display:flex;gap:10px;align-items:center">'+AV("JR","#f08c00",26)+'<span class="sm"><b>Jo Reyes</b> <span class="mut">asked · 2 min ago</span></span><span class="pill" style="background:#f3f4f6;color:#4b5563">'+IC("users",11)+'Operations</span></div>'+
      '<h1 class="a-q" data-n="1">Can we offer a refund after the 30-day window on enterprise annual plans?</h1>'+
      '<div class="card a-ans">'+
        '<div class="a-ansh"><span class="a-bot">'+IC("spark",13,"#fff",2)+'</span><b class="sm">Aster</b><span class="pill" data-n="2" style="background:#e6f4ea;color:#1e7a3c">'+IC("shield",12,"#1e7a3c",2.2)+'Verified</span><span class="xs mut">3 sources · generated in 2.1s</span><span style="flex:1"></span><span class="mut">'+IC("up",15,"currentColor",1.8)+'</span><span class="mut" style="transform:scaleY(-1);display:inline-flex">'+IC("up",15,"currentColor",1.8)+'</span></div>'+
        '<p><span class="a-hl">Yes, with approval.</span> Enterprise annual plans can be refunded pro rata after 30 days when the customer reports a service failure that breaches the SLA<sup>1</sup>.</p>'+
        '<ul class="a-ul"><li>'+IC("check",14,"#2f9e44",2.4)+'<span>The outage must breach the SLA: 4+ hours of downtime in a calendar month<sup>1</sup></span></li><li>'+IC("check",14,"#2f9e44",2.4)+'<span>Refund is pro rata from the date the outage was reported<sup>1</sup></span></li><li>'+IC("check",14,"#2f9e44",2.4)+'<span>Refunds above ₱250,000 need Finance lead approval<sup class="hl" data-n="3">2</sup></span></li></ul>'+
        '<p class="mut sm">If it’s a convenience request rather than a service failure, offer account credit instead<sup>3</sup>.</p>'+
        '<div class="a-conf"><span class="xs mut">Confidence</span><span class="seg"><i></i><i></i><i></i><i></i><i class="off"></i></span><b class="xs" style="color:#1e7a3c">High</b><span style="flex:1"></span><span class="btn">'+IC("copy",14)+'Copy</span><span class="btn">'+IC("send",14)+'Insert</span><span class="btn pri" data-n="5">'+IC("users",14,"#fff")+'Ask an expert</span></div>'+
      '</div>'+
      '<div class="a-fu"><span class="xs mut" style="display:flex;gap:6px;align-items:center">'+IC("spark",13,A_IND)+'Suggested follow-ups</span><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip">Draft the refund email to the customer</span><span class="chip">How is pro rata calculated?</span><span class="chip">Show similar approved cases</span></div></div>'+
    '</div>'+
    MCUR(470,346,"Mara · Legal","#e64980")+
    '<div class="toast" style="right:22px;bottom:22px"><span style="width:22px;height:22px;border-radius:50%;background:#2f9e44;display:grid;place-items:center">'+IC("check",13,"#fff",3)+'</span><span><b>Approved</b> by M. Santos · Legal Ops</span><span style="color:#93c5fd;font-weight:600;margin-left:6px">Undo</span></div>'+
  '</main>'+
  '<aside class="a-srcs"><div class="a-tabs"><span class="on">Sources <em>3</em></span><span>Activity</span><span>Related</span></div>'+
    src.map(function(s,i){return '<div class="card a-s'+(s[8]===2?" sel":"")+'"'+(i===0?' data-n="4"':'')+'><div style="display:flex;gap:10px;align-items:center"><span class="ft" style="background:'+s[0]+'">'+s[1]+'</span><div style="min-width:0"><b class="sm" style="display:block">'+s[2]+'</b><span class="xs mut">'+s[3]+'</span></div><sup class="'+(s[8]===2?"hl":"")+'" style="margin-left:auto">'+(i+1)+'</sup></div>'+
      '<p class="a-snip">“'+s[4]+'”</p><div style="display:flex;align-items:center;gap:8px">'+AV(s[5],["#7048e8","#2f9e44","#1c7ed6"][i],20)+'<span class="xs mut">'+s[6]+'</span><span style="flex:1"></span><span class="pill" style="background:'+(i<2?"#e6f4ea":"#fff4dc")+';color:'+(i<2?"#1e7a3c":"#94620a")+'">'+IC("clock",11)+s[7]+'</span></div></div>'}).join("")+
    '<div class="a-health" style="display:none"><span class="xs mut">Knowledge health · Billing</span><div style="display:flex;justify-content:space-between;align-items:flex-end"><b style="font-size:22px">94%</b>'+SPARK([80,82,85,84,88,90,91,94],120,30,"#2f9e44",1)+'</div><span class="xs mut">2 sources due for review this month</span></div>'+
  '</aside></div>';
}
function uiAsterConf(){
  var R=[["#e6f4ea","#1e7a3c","shield","Verified","Every claim is cited and each source was reviewed by its owner in the last 90 days.",4],
         ["#fff4dc","#94620a","clock","Likely","Cited, but one source is due for review. Shown with a prompt to check it.",3],
         ["#fde8e6","#b3261e","users","Needs an expert","Sources disagree or are missing. Routed to the right expert in one tap.",1]];
  return '<div class="ui x" style="width:600px;height:400px;background:#f7f8fa;padding:26px;display:flex;flex-direction:column;gap:12px">'+
    '<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:15px">How Aster labels every answer</b><span class="pill" style="background:#eef0ff;color:'+A_IND+'">'+IC("info",11)+'Confidence model v2</span></div>'+
    R.map(function(r){return '<div class="card" style="padding:14px 16px;display:grid;grid-template-columns:150px 1fr 70px;gap:14px;align-items:center"><span class="pill" style="background:'+r[0]+';color:'+r[1]+';height:26px;font-size:12px">'+IC(r[2],13,r[1],2.2)+r[3]+'</span><span class="sm" style="color:#374151">'+r[4]+'</span><span class="seg sm2" style="--c:'+r[1]+'">'+[1,2,3,4,5].map(function(k){return '<i'+(k>r[5]?' class="off"':'')+'></i>'}).join("")+'</span></div>'}).join("")+
    '<p class="xs mut" style="margin-top:auto">Thresholds are set with Legal Ops and reviewed quarterly.</p></div>';
}
function uiAsterCite(){
  var lines='';for(var i=0;i<11;i++)lines+='<i style="width:'+[92,88,95,70,90,84,93,60,89,91,76][i]+'%"></i>';
  return '<div class="ui x" style="width:600px;height:400px;background:#eef0f4;position:relative;overflow:hidden">'+
    '<div class="doc"><div style="display:flex;gap:8px;align-items:center;margin-bottom:12px"><span class="ft" style="background:#2f9e44">XLS</span><b class="sm">Finance approval matrix</b><span class="xs mut" style="margin-left:auto">Section 4.2</span></div>'+lines.slice(0,200)+'<p class="docq"><mark>Refunds or credits above ₱250,000 require approval from the Finance lead before processing.</mark></p>'+lines.slice(200)+'</div>'+
    '<div class="card pop"><div style="display:flex;gap:10px;align-items:center"><span class="ft" style="background:#2f9e44">XLS</span><div><b class="sm" style="display:block">Source 2 · Finance approval matrix</b><span class="xs mut">Finance Drive › Controls › Section 4.2</span></div></div>'+
    '<p style="font-size:14px;border-left:3px solid '+A_IND+';padding-left:12px;color:#111827">Refunds or credits above ₱250,000 require approval from the Finance lead before processing.</p>'+
    '<div style="display:flex;gap:8px;align-items:center">'+AV("MS","#2f9e44",20)+'<span class="xs mut">Owner M. Santos · reviewed 03 Sep 2026</span></div>'+
    '<div style="display:flex;gap:8px"><span class="btn pri" style="--b:'+A_IND+'">'+IC("link",14,"#fff")+'Open in Finance Drive</span><span class="btn">'+IC("copy",14)+'Copy link</span></div></div></div>';
}

/* ============================== MORROW ============================== */
var M_GR="#2f5d50";
function slabSVG(){
  var reb='';for(var i=0;i<14;i++)reb+='<circle cx="'+(40+i*25)+'" cy="118" r="4" fill="#57534e"/>';
  return '<svg viewBox="0 0 400 190" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><defs><pattern id="agg" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#d6d3cb"/><circle cx="3" cy="4" r="1.6" fill="#bdb8ad"/><circle cx="10" cy="9" r="1.2" fill="#c8c3b8"/><circle cx="6" cy="12" r=".9" fill="#aaa497"/></pattern></defs>'+
    '<rect x="0" y="0" width="400" height="190" fill="#ece9e1"/><rect x="20" y="40" width="360" height="14" fill="#e7e2d6"/><rect x="20" y="54" width="360" height="86" fill="url(#agg)"/>'+
    '<path d="M20 78 C120 132, 280 132, 380 78" stroke="#2f5d50" stroke-width="3" fill="none"/>'+reb+
    '<g font-family="Inter,sans-serif" font-size="10" fill="#1d2a25" font-weight="600"><text x="24" y="34">Screed · 50 mm</text><text x="24" y="160">C35 LC slab · 250 mm</text><text x="252" y="160" fill="#2f5d50">PT tendon profile</text></g>'+
    '<path d="M300 150 L300 124" stroke="#2f5d50" stroke-width="1"/><rect x="20" y="140" width="360" height="4" fill="#bdb8ad"/></svg>';
}
function uiMorrow(){
  return '<div class="ui x" style="width:1200px;height:720px;--b:'+M_GR+';background:#f6f4ee;color:#1d2a25;display:flex;flex-direction:column">'+
  '<div class="m-ann">'+IC("leaf",13,"#cde5da")+'<span><b>New</b> · The EPD for C35 LC is now third-party verified</span><span style="text-decoration:underline">Read the report →</span></div>'+
  '<div class="m-nav"><span class="m-logo"><i></i>morrow</span>'+["Materials","Applications","Proof","Guidance","Pricing"].map(function(x,i){return '<span>'+x+(i<2?IC("chevd",13,"#6f7b75"):"")+'</span>'}).join("")+'<span style="flex:1"></span>'+IC("search",17,"#3d4a44")+'<span>Log in</span><span class="btn pri" style="border-radius:999px;height:36px;padding:0 16px">Talk to a specialist</span></div>'+
  '<div style="flex:1;display:grid;grid-template-columns:1fr 420px;gap:28px;padding:22px 40px 0;min-height:0">'+
    '<div style="display:flex;flex-direction:column;gap:14px;min-width:0">'+
      '<span class="xs" style="color:#6f7b75">Applications › Structural frames › <b style="color:#1d2a25">Structural slabs</b></span>'+
      '<h1 style="font:650 38px/1.06 var(--sans);letter-spacing:-.03em">Low-carbon concrete for structural slabs</h1>'+
      '<p style="font-size:15.5px;line-height:1.5;color:#3d4a44;max-width:600px">How Morrow C35 LC performs in post-tensioned and flat slabs, what it saves in embodied carbon, and the evidence you need to specify it.</p>'+
      '<div data-n="1" style="display:flex;gap:8px;flex-wrap:wrap">'+[["box","Material","C35 LC"],["shield","Standard","EN 206"],["layers","Method","Post-tensioned"],["checkc","Proof","EPD verified"]].map(function(c){return '<span class="m-chip">'+IC(c[0],13,M_GR)+'<em>'+c[1]+'</em>'+c[2]+'</span>'}).join("")+'</div>'+
      '<div style="display:flex;gap:10px"><span class="btn pri" style="height:38px;border-radius:10px">'+IC("download",15,"#fff")+'Download spec sheet</span><span class="btn" style="height:38px;border-radius:10px;background:transparent;border-color:#cfcabd">Compare mixes</span></div>'+
      '<div class="card" data-n="2" style="padding:18px 20px;display:grid;grid-template-columns:1fr 1fr;gap:18px">'+
        '<div><b style="font-size:15px">Will it meet my specification?</b><table class="m-tbl">'+[["Strength class","C35/45"],["Early strength, 3 days","22 MPa"],["Exposure class","XC1–XC3"],["Stripping time","Standard"]].map(function(r){return '<tr><td>'+IC("check",13,"#2f7a4f",2.4)+r[0]+'</td><td>'+r[1]+'</td></tr>'}).join("")+'</table></div>'+
        '<div><b style="font-size:15px">Embodied carbon, per m³</b><div class="m-bars"><div><span>Standard C35/45</span><div><i style="width:100%;background:#c9c4b8"></i></div><b>315 kg</b></div><div><span>Morrow C35 LC</span><div><i style="width:59%"></i></div><b style="color:#2f7a4f">186 kg</b></div></div><p class="xs" style="color:#6f7b75;margin-top:8px"><b style="color:#2f7a4f">−41%</b> vs. an equivalent CEM I mix · EPD #MRW-0192</p></div>'+
      '</div>'+
    '</div>'+
    '<div style="display:flex;flex-direction:column;gap:12px;min-height:0">'+
      '<div class="card" style="overflow:hidden;height:160px;padding:0;position:relative">'+slabSVG()+'<span class="pill" style="position:absolute;right:10px;top:10px;background:#fff;color:#1d2a25;box-shadow:0 1px 2px rgba(0,0,0,.08)">Typical section</span></div>'+
      '<div data-n="3" style="display:flex;flex-direction:column;gap:8px"><span class="xs" style="color:#6f7b75;font-weight:600;letter-spacing:.04em">PROOF</span>'+
        [["#e03131","PDF","Environmental Product Declaration","EPD #MRW-0192 · verified 2026"],["#1c7ed6","CSV","Third-party strength tests","28-day results · 42 samples"],["#7048e8","CASE","Harbour Street offices","12-storey post-tensioned frame"]].map(function(p){return '<div class="card m-p"><span class="ft" style="background:'+p[0]+'">'+p[1]+'</span><div style="min-width:0"><b class="sm" style="display:block">'+p[2]+'</b><span class="xs" style="color:#6f7b75">'+p[3]+'</span></div>'+IC("download",16,"#6f7b75")+'</div>'}).join("")+'</div>'+
      '<div data-n="4" style="display:flex;flex-direction:column;gap:6px"><span class="xs" style="color:#6f7b75;font-weight:600;letter-spacing:.04em">NEXT QUESTIONS SPECIFIERS ASK</span>'+
        ["How does it cure in cold weather?","Can it be pumped at height?","Compare with GGBS blends"].map(function(q){return '<div class="m-q"><span>'+q+'</span>'+IC("arrow",15,M_GR)+'</div>'}).join("")+'</div>'+
    '</div>'+
  '</div></div>';
}
function uiMorrowGraph(){
  var C={app:["#2f5d50","#fff"],mat:["#e3efe8","#1d2a25"],std:["#e7ecf6","#1d2a25"],prf:["#fbeee0","#1d2a25"],q:["#f3f0fa","#1d2a25"]};
  var n=[[300,200,"Structural slabs","APPLICATION","app","layers"],[118,96,"C35 LC concrete","MATERIAL","mat","box"],[478,92,"EN 206","STANDARD","std","shield"],[300,64,"Post-tensioning","METHOD","mat","sliders"],[112,302,"EPD #MRW-0192","PROOF","prf","file"],[488,306,"Harbour Street","CASE","prf","pin"],[300,340,"Cold-weather curing","QUESTION","q","msg"]];
  var s='<svg width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#fbfaf7"/>';
  for(var i=1;i<n.length;i++)s+='<line x1="300" y1="200" x2="'+n[i][0]+'" y2="'+n[i][1]+'" stroke="#c7d4cc" stroke-width="1.5" stroke-dasharray="'+(i>3?"4 4":"0")+'"/>';
  n.forEach(function(p){var w=Math.max(p[2].length*7.1,p[3].length*6.2)+52,col=C[p[4]];s+='<g><rect x="'+(p[0]-w/2)+'" y="'+(p[1]-23)+'" width="'+w+'" height="46" rx="12" fill="'+col[0]+'" stroke="'+(p[4]==="app"?"none":"#dcd8cc")+'"/><foreignObject x="'+(p[0]-w/2+10)+'" y="'+(p[1]-10)+'" width="20" height="20"><div xmlns="http://www.w3.org/1999/xhtml" style="color:'+(p[4]==="app"?"#b8d4c7":"#2f5d50")+'">'+IC(p[5],18)+'</div></foreignObject><text x="'+(p[0]-w/2+36)+'" y="'+(p[1]-4)+'" font-size="9" font-weight="700" letter-spacing=".6" fill="'+(p[4]==="app"?"#b8d4c7":"#6f7b75")+'" font-family="Inter,sans-serif">'+p[3]+'</text><text x="'+(p[0]-w/2+36)+'" y="'+(p[1]+11)+'" font-size="13" font-weight="600" fill="'+col[1]+'" font-family="Inter,sans-serif">'+p[2]+'</text></g>'});
  s+='<g font-family="Inter,sans-serif" font-size="10" fill="#6f7b75"><text x="18" y="386">140 entities · 612 relationships · last synced 2 h ago</text></g></svg>';
  return '<div class="ui x" style="width:600px;height:400px">'+s+'</div>';
}
function uiMorrowSerp(){
  return '<div class="ui x" style="width:600px;height:400px;padding:22px 28px;display:flex;flex-direction:column;gap:8px;font-family:Arial,Helvetica,sans-serif;color:#202124">'+
    '<div style="height:42px;border-radius:999px;box-shadow:0 1px 6px rgba(32,33,36,.18);display:flex;align-items:center;gap:10px;padding:0 16px;font-size:14px;margin-bottom:6px">'+IC("search",16,"#9aa0a6")+'low carbon concrete structural slab specification<span style="margin-left:auto">'+IC("mic",16,"#4285f4")+'</span></div>'+
    '<div style="display:flex;gap:10px;align-items:center"><span style="width:26px;height:26px;border-radius:50%;background:#e3efe8;display:grid;place-items:center"><i style="width:10px;height:10px;border-radius:50%;background:'+M_GR+'"></i></span><div style="line-height:1.25"><span style="font-size:13px">Morrow</span><br><span style="font-size:12px;color:#4d5156">https://morrow.co › applications › structural-slabs</span></div></div>'+
    '<p style="font-size:19px;color:#1a0dab">Low-carbon concrete for structural slabs | Morrow</p>'+
    '<p style="font-size:13.5px;color:#4d5156;line-height:1.5">C35/45 strength with <b>41% lower embodied carbon</b>. EPD verified, EN 206 compliant, with test data and case studies for specifiers.</p>'+
    '<div style="display:flex;gap:18px;font-size:12.5px;color:#4d5156"><span><b style="color:#202124">Embodied carbon:</b> 186 kgCO₂e/m³</span><span><b style="color:#202124">Strength:</b> C35/45</span><span><b style="color:#202124">EPD:</b> Verified</span></div>'+
    '<div style="border-top:1px solid #ebebeb;margin-top:6px"></div>'+
    '<div style="display:flex;justify-content:space-between;align-items:center;font-size:14px;padding:6px 0"><span>How does C35 LC cure in cold weather?</span>'+IC("chevd",16,"#5f6368")+'</div>'+
    '<p style="font-size:13px;color:#4d5156;line-height:1.5;margin-top:-4px">Below 5 °C, use insulated formwork and extend striking time by 24–48 hours. Early strength stays within 10% of a standard mix.</p>'+
    '<div style="border-top:1px solid #ebebeb"></div><div style="display:flex;justify-content:space-between;align-items:center;font-size:14px;padding:6px 0"><span>Can low-carbon concrete be post-tensioned?</span>'+IC("chevd",16,"#5f6368")+'</div></div>';
}

/* ============================== COMMON GROUND ============================== */
var CG_T="#0f766e";
function steps6(k){var s='<div class="seg6">';for(var i=0;i<6;i++)s+='<i'+(i<k?' class="on"':'')+'></i>';return s+'</div>'}
function uiCG1(){return PH(CG_T,"",SB()+
  '<div class="navbar"><span style="color:'+CG_T+';display:flex;align-items:center">'+IC("back",22,CG_T,2.4)+'Back</span><b>Housing support</b><span style="color:'+CG_T+';font-size:15px">Save &amp; exit</span></div>'+
  '<div style="padding:4px 18px 0;display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280"><span>Step 3 of 6 · Your household</span><span data-n="1" style="color:'+CG_T+';font-weight:600;display:flex;gap:4px;align-items:center">'+IC("checkc",14,CG_T,2.2)+'Saved just now</span></div>'+steps6(3)+'</div>'+
  '<p class="ltitle" style="padding-top:16px">Who lives with you?</p>'+
  '<div class="iosnote" data-n="2">'+IC("info",18,"#1f4a42",2)+'<span><b>Why we ask</b><br>The number of people in your home changes how much support you can get.</span></div>'+
  '<div class="grp" style="margin-top:14px">'+[["MD","#0f766e","Maria Dela Cruz","You · 34"],["PD","#f08c00","Paolo Dela Cruz","Son · 9"],["LD","#7048e8","Lourdes Dela Cruz","Mother · 67"]].map(function(p){return '<div class="it">'+AV(p[0],p[1],36)+'<div style="flex:1"><b style="font-weight:500">'+p[2]+'</b><br><span class="sm mut">'+p[3]+'</span></div>'+IC("chev",18,"#c7c7cc")+'</div>'}).join("")+
  '<div class="it" style="color:'+CG_T+'">'+IC("plus",20,CG_T,2.2)+'<span style="font-weight:500">Add a person</span></div></div>'+
  '<div style="margin-top:auto;padding:14px 16px 34px;display:flex;flex-direction:column;gap:10px"><div class="cta">Continue</div><span style="text-align:center;color:'+CG_T+';font-size:15px;font-weight:500">I live alone</span></div>')}
function uiCG2(){
  var keys=[["1",""],["2","ABC"],["3","DEF"],["4","GHI"],["5","JKL"],["6","MNO"],["7","PQRS"],["8","TUV"],["9","WXYZ"],[".",""],["0",""],["⌫",""]];
  return PH(CG_T,"",SB()+
  '<div class="navbar"><span style="color:'+CG_T+';display:flex;align-items:center">'+IC("back",22,CG_T,2.4)+'Back</span><b>Housing support</b><span style="width:60px"></span></div>'+
  '<div class="offb" data-n="1">'+IC("wifioff",18,"#fbbf24",2)+'<span><b>You’re offline.</b> Answers are saved on this phone and will send when you’re back online.</span></div>'+
  '<div style="padding:12px 18px 0;display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280"><span>Step 4 of 6 · Rent and income</span><span style="color:'+CG_T+';font-weight:600">Saved on phone</span></div>'+steps6(4)+'</div>'+
  '<p class="ltitle" style="font-size:25px;padding-top:14px">How much rent do you pay each month?</p>'+
  '<div style="padding:0 16px;display:flex;flex-direction:column;gap:8px"><div class="seg2"><span class="on">Monthly</span><span>Weekly</span></div>'+
  '<div class="field" data-n="2"><span class="xs mut">Monthly rent</span><div style="display:flex;align-items:baseline;gap:6px"><span style="color:#6b7280;font-size:22px">₱</span><b style="font-size:28px;letter-spacing:-.02em">8,500</b><i class="caret"></i></div></div>'+
  '<p class="sm mut">Only include rent. Don’t include electricity, water or internet.</p></div>'+
  '<div class="kbbar"><span>'+IC("chevd",18,"#6b7280")+'</span><span class="cta" style="height:40px;width:140px;font-size:15px">Continue</span></div>'+
  '<div class="kb">'+keys.map(function(k){return '<span'+(k[0]==="."||k[0]==="⌫"?' class="fn"':'')+'><b>'+k[0]+'</b><em>'+k[1]+'</em></span>'}).join("")+'</div>')}
function uiCG3(){return PH(CG_T,"",SB()+
  '<div class="push" data-n="2"><span class="appic" style="background:'+CG_T+'">'+IC("home",16,"#fff",2.2)+'</span><div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between"><b class="xs" style="letter-spacing:.02em">COMMON GROUND</b><span class="xs mut">now</span></div><b class="sm" style="display:block">Documents checked ✓</b><span class="sm" style="color:#374151">Your application moved to caseworker review.</span></div></div>'+
  '<div style="height:96px"></div><p class="ltitle">Your application</p>'+
  '<div class="card" style="margin:0 16px;padding:14px;display:flex;gap:14px;align-items:center;border-radius:16px"><svg width="58" height="58" viewBox="0 0 58 58"><circle cx="29" cy="29" r="24" stroke="#e5e7eb" stroke-width="6" fill="none"/><circle cx="29" cy="29" r="24" stroke="'+CG_T+'" stroke-width="6" fill="none" stroke-dasharray="150.8" stroke-dashoffset="52" transform="rotate(-90 29 29)" stroke-linecap="round"/><text x="29" y="33" text-anchor="middle" font-size="12" font-weight="700" fill="#111" font-family="Inter,sans-serif">3/4</text></svg><div><span class="pill" style="background:#fff4dc;color:#94620a">'+IC("clock",11)+'In review</span><b style="display:block;font-size:16px;margin-top:5px">Usually 5 working days</b><span class="xs mut">Ref HS-24-01872 · Housing support</span></div></div>'+
  '<div class="tline" data-n="1">'+[["done","Application sent","12 Sep, 7:58 PM"],["done","Documents checked","15 Sep, 10:14 AM"],["now","Caseworker review","Rhea M. · started today"],["todo","Decision","Expected by 22 Sep"]].map(function(t){return '<div class="'+t[0]+'"><i></i><span><b>'+t[1]+'</b><br><span class="xs mut">'+t[2]+'</span></span></div>'}).join("")+'</div>'+
  '<div class="grp">'+[["doc","Proof of income","Needed by 18 Sep","#b3261e","Upload"],["checkc","Valid ID","Checked","#1e7a3c",""]].map(function(d){return '<div class="it">'+IC(d[0],20,d[3],2)+'<div style="flex:1"><b style="font-weight:500">'+d[1]+'</b><br><span class="xs" style="color:'+d[3]+'">'+d[2]+'</span></div>'+(d[4]?'<span class="btn pri" style="height:30px;border-radius:999px">'+d[4]+'</span>':IC("chev",18,"#c7c7cc"))+'</div>'}).join("")+'</div>'+
  TABBAR([["home","Home"],["file","Applications"],["msg","Messages","2"],["user","Profile"]],1))}
function uiCGDesk(){
  var rows=[["MD","#0f766e","Maria Dela Cruz","HS-24-01872","Housing support",4,"2 h ago",1,"c1","In review","3d left",1],["RS","#1c7ed6","Ramon Santos","HS-24-01869","Housing support",2,"Yesterday",0,"c2","Needs documents","5d left"],["LM","#7048e8","Liza Mercado","BN-24-00431","Benefits",6,"Yesterday",0,"c3","Ready to decide","1d left"],["JB","#f08c00","Joel Bautista","HS-24-01851","Housing support",6,"2 days ago",1,"c3","Ready to decide","Today"],["AV","#e64980","Ana Villanueva","BN-24-00427","Benefits",3,"3 days ago",0,"c2","Needs documents","6d left"],["CR","#2f9e44","Carlo Reyes","HS-24-01840","Housing support",5,"3 days ago",0,"c1","In review","4d left"]];
  return '<div class="ui x" style="width:1200px;height:720px;--b:'+CG_T+';display:flex;flex-direction:column;background:#f6f7f6">'+
  '<div class="cg-top"><span class="cg-logo">'+IC("home",15,"#5eead4",2.2)+'Common Ground</span><span style="opacity:.55">/</span><span>Caseworker</span><div class="cg-search">'+IC("search",14,"#9ca3af")+'Search residents, references…<span class="kbd" style="background:transparent;color:#9ca3af;border-color:#374151">/</span></div><span style="flex:1"></span><span style="position:relative">'+IC("bell",18,"#d1d5db",1.8)+'<i style="position:absolute;right:-2px;top:-2px;width:8px;height:8px;border-radius:50%;background:#f59e0b"></i></span>'+AV("RM","#14b8a6",30)+'<span class="sm">Rhea M.</span></div>'+
  '<div style="flex:1;display:grid;grid-template-columns:196px 1fr 350px;min-height:0">'+
    '<aside class="cg-nav">'+[["inbox","My cases","24",1],["users","Team queue","112"],["clock","Waiting on residents","9"],["wifioff","Offline drafts","3"],["chart","Reports",""],["settings","Settings",""]].map(function(n){return '<div class="'+(n[3]?"on":"")+'">'+IC(n[0],16,"currentColor",1.8)+'<span>'+n[1]+'</span><em>'+n[2]+'</em></div>'}).join("")+'</aside>'+
    '<main style="padding:18px 22px;display:flex;flex-direction:column;gap:14px;min-width:0">'+
      '<div style="display:flex;align-items:center;gap:10px"><b style="font-size:20px;letter-spacing:-.01em">My cases</b><span style="flex:1"></span><span class="btn">'+IC("filter",14)+'Filters</span><span class="btn pri">'+IC("plus",14,"#fff")+'New case</span></div>'+
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">'+[["Open cases","24","",[20,22,21,25,23,24],"#0f766e"],["Avg. time to decision","4.2 days","▼ 18%",[6.1,5.8,5.2,4.9,4.5,4.2],"#2f9e44"],["Completed this week","31","▲ 9",[18,22,19,25,28,31],"#1c7ed6"]].map(function(k){return '<div class="card" style="padding:12px 14px;display:flex;justify-content:space-between;align-items:flex-end"><div><span class="xs mut">'+k[0]+'</span><br><b style="font-size:22px;letter-spacing:-.02em">'+k[1]+'</b> <span class="xs" style="color:#2f9e44;font-weight:600">'+k[2]+'</span></div>'+SPARK(k[3],90,30,k[4],1)+'</div>'}).join("")+'</div>'+
      '<div class="cg-f" data-n="1">'+[["All","24",1],["Waiting on documents","6"],["Ready to decide","5"],["Offline drafts","3"]].map(function(f){return '<span class="'+(f[2]?"on":"")+'">'+f[0]+' <em>'+f[1]+'</em></span>'}).join("")+'</div>'+
      '<div class="card" style="overflow:hidden"><table class="cg-t"><tr><th style="width:26px"><i class="cb"></i></th><th>Resident</th><th>Progress</th><th>Last active</th><th>Status</th></tr>'+
      rows.map(function(r){return '<tr'+(r[11]?' class="sel" data-n="2"':'')+'><td><i class="cb'+(r[11]?" on":"")+'"></i></td><td><div style="display:flex;gap:9px;align-items:center">'+AV(r[0],r[1],28)+'<div><b style="font-weight:600">'+r[2]+'</b><br><span class="xs mut">'+r[3]+'</span></div></div></td><td><div style="display:flex;gap:8px;align-items:center"><span class="pbar"><i style="width:'+(r[5]/6*100)+'%"></i></span><span class="xs mut">'+r[5]+'/6</span></div></td><td><span style="display:flex;gap:5px;align-items:center">'+(r[7]?IC("wifioff",13,"#d97706"):"")+r[6]+'</span></td><td><span class="c '+r[8]+'">'+r[9]+'</span></td></tr>'}).join("")+'</table></div>'+
    '</main>'+
    '<aside class="cg-r"><div style="display:flex;gap:12px;align-items:center">'+AV("MD","#0f766e",44)+'<div><b style="font-size:17px">Maria Dela Cruz</b><br><span class="xs mut">HS-24-01872 · Marikina · Filipino, English</span></div></div>'+
      '<div style="display:flex;gap:6px"><span class="pill" style="background:#fff4dc;color:#94620a">In review</span><span class="pill" style="background:#e6f2ef;color:#0f766e">Household of 3</span></div>'+
      '<div class="cg-steps">'+[["About you",1],["Your household",1],["Your home",1],["Rent and income",1],["Documents","2 of 3"],["Declaration",0]].map(function(s){return '<div><span>'+(s[1]===1?IC("checkc",16,"#0f766e",2):s[1]===0?'<i class="o"></i>':IC("clock",16,"#d97706",2))+s[0]+'</span><b class="xs '+(s[1]===1?"mut":"")+'">'+(s[1]===1?"Done":s[1]===0?"—":s[1])+'</b></div>'}).join("")+'</div>'+
      '<div class="cg-note" data-n="3">'+IC("wifioff",15,"#1f4a42",2)+'<span>Step 4 was saved offline at <b>7:42 PM</b> and synced at <b>7:58 PM</b>. Still needed: proof of income.</span></div>'+
      '<div style="display:flex;gap:8px">'+[["Lease.pdf","#e03131"],["ID-front.jpg","#1c7ed6"],["Payslip.pdf","#9ca3af"]].map(function(d,i){return '<div class="cg-doc'+(i===2?" miss":"")+'"><span class="ft" style="background:'+d[1]+'">'+(i===1?"JPG":"PDF")+'</span><span class="xs">'+(i===2?"Missing":d[0])+'</span></div>'}).join("")+'</div>'+
      '<div style="display:flex;gap:8px;margin-top:auto"><span class="btn" style="flex:1;justify-content:center;height:38px">'+IC("msg",14)+'Request doc</span><span class="btn pri" data-n="4" style="flex:1;justify-content:center;height:38px">Ready to decide</span></div>'+
    '</aside>'+
  '</div></div>';
}

/* ============================== TALA HEALTH ============================== */
var T_P="#c2255c";
function talaHead(sub){return '<div class="navbar" style="background:#fff;border-bottom:1px solid #eee;height:58px;justify-content:flex-start;gap:10px">'+IC("back",22,T_P,2.4)+'<span style="position:relative">'+AV("T",T_P,36)+'<i style="position:absolute;right:0;bottom:0;width:10px;height:10px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 2px #fff"></i></span><div style="flex:1;line-height:1.2"><b style="font-size:16px">Tala Health</b><br><span class="xs" style="color:#6b7280;font-weight:400">'+sub+'</span></div>'+IC("phone",20,T_P,1.8)+'<span style="width:10px"></span>'+IC("info",20,T_P,1.8)+'</div>'}
function chatIn(ph){return '<div class="cin">'+IC("plus",22,T_P,2)+'<span>'+ph+'</span>'+IC("mic",20,T_P,1.8)+'</div>'}
function uiTala1(){return PH(T_P,"chat",SB()+talaHead("Typically replies instantly")+
  '<div class="chatb"><span class="dd">Today 8:12 AM</span>'+
  '<div class="bi">Hi! Ako si Tala. I can book, move or cancel clinic visits. Paano kita matutulungan?</div>'+
  '<div class="bo">Pa-book po ng check-up, 2 days na po ang ubo ni baby</div>'+
  '<div class="bi">Sige po. I’ll book a pediatric consult at your nearest clinic:</div>'+
  '<div class="card clin"><div class="clin-img">'+IC("home",26,"#fff",1.6)+'<span class="pill" style="position:absolute;left:8px;top:8px;background:rgba(255,255,255,.92);color:#111">Open until 6 PM</span></div><div style="padding:10px 12px"><b class="sm">Tala Marikina</b><br><span class="xs mut">'+IC("pin",11,"#9ca3af")+' 1.2 km · 2F Riverbanks Arcade</span></div></div>'+
  '<span class="xs mut" style="margin:2px 0 -2px">Available bukas, Tue 14 Oct:</span>'+
  '<div class="qr" data-n="1"><span class="on">9:30 AM</span><span>11:00 AM</span><span>2:15 PM</span><span>4:00 PM</span></div>'+
  '<div class="card bk"><span class="xs" style="color:'+T_P+';font-weight:700;letter-spacing:.04em">PEDIATRIC CONSULT</span><b>Tue 14 Oct · 9:30 AM</b><span class="xs mut">Dr. Ana Reyes · Tala Marikina</span><div style="display:flex;gap:8px;margin-top:6px"><span class="btn pri" style="flex:1;justify-content:center;border-radius:10px">Confirm</span><span class="btn" style="flex:1;justify-content:center;border-radius:10px;color:'+T_P+';border-color:'+T_P+'">Change</span></div></div>'+
  '<p class="xs mut" style="text-align:center" data-n="2">'+IC("shield",11,"#9ca3af")+' Tala books visits. It doesn’t give medical advice.</p></div>'+
  chatIn("Type in Filipino or English…"))}
function qrSVG(){var s='<svg width="92" height="92" viewBox="0 0 23 23"><rect width="23" height="23" fill="#fff"/>',seed=7;function r(){seed=(seed*9301+49297)%233280;return seed/233280}
  for(var y=0;y<23;y++)for(var x=0;x<23;x++){var f=(x<7&&y<7)||(x>15&&y<7)||(x<7&&y>15);if(f){var ix=x%16,iy=y%16;var inr=(ix===0||ix===6||iy===0||iy===6||(ix>=2&&ix<=4&&iy>=2&&iy<=4));if(inr)s+='<rect x="'+x+'" y="'+y+'" width="1" height="1" fill="#111"/>'}else if(r()>.52)s+='<rect x="'+x+'" y="'+y+'" width="1" height="1" fill="#111"/>'}
  return s+'</svg>'}
function uiTala2(){return PH(T_P,"",SB()+
  '<div class="navbar">'+IC("back",22,T_P,2.4)+'<b>Your visit</b>'+IC("share",20,T_P,1.8)+'</div>'+
  '<div class="pass"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><span class="xs" style="opacity:.8;letter-spacing:.05em;font-weight:700">CONFIRMED</span><b style="display:block;font-size:22px;letter-spacing:-.01em">Tue 14 Oct, 9:30 AM</b><span class="sm" style="opacity:.9">Pediatric consult</span></div><span style="background:#fff;border-radius:8px;padding:5px">'+qrSVG()+'</span></div>'+
  '<div style="display:flex;gap:10px;align-items:center;margin-top:10px">'+AV("AR","#fff",30).replace('color:#fff','color:'+T_P)+'<span class="sm"><b>Dr. Ana Reyes</b><br><span style="opacity:.85" class="xs">Pediatrics · Room 204</span></span><span style="margin-left:auto;font:600 11px/1 var(--mono);opacity:.85">#TL-4471</span></div></div>'+
  '<div class="card" style="margin:12px 16px 0;overflow:hidden;padding:0;border-radius:14px"><svg viewBox="0 0 328 110" width="100%" height="110"><rect width="328" height="110" fill="#eef1ec"/><path d="M0 70 L328 58" stroke="#fff" stroke-width="12"/><path d="M120 0 L150 110" stroke="#fff" stroke-width="9"/><path d="M0 22 C90 30 200 12 328 26" stroke="#bfdbfe" stroke-width="14" fill="none"/><path d="M240 110 L255 0" stroke="#fff" stroke-width="7"/><circle cx="170" cy="62" r="11" fill="'+T_P+'"/><circle cx="170" cy="62" r="4" fill="#fff"/><text x="186" y="52" font-size="10" font-weight="700" font-family="Inter,sans-serif" fill="#111">Tala Marikina</text></svg><div style="display:flex;align-items:center;gap:8px;padding:10px 12px"><span class="sm"><b>2F Riverbanks Arcade</b><br><span class="xs mut">12 min by jeepney · 5 min by car</span></span><span class="btn" style="margin-left:auto;border-radius:999px;color:'+T_P+'">Directions</span></div></div>'+
  '<p class="xs mut" style="padding:14px 20px 6px;font-weight:600;letter-spacing:.04em">BEFORE YOU GO</p>'+
  '<div class="grp" data-n="1">'+[[1,"Bring your PhilHealth ID or any valid ID"],[0,"Bring your child’s vaccination record"],[0,"Arrive 10 minutes early to register"]].map(function(c){return '<div class="it">'+(c[0]?'<span class="ck on">'+IC("check",13,"#fff",3)+'</span>':'<span class="ck"></span>')+'<span style="flex:1;font-size:14.5px">'+c[1]+'</span></div>'}).join("")+'</div>'+
  '<div style="margin-top:auto;padding:12px 16px 34px;display:flex;gap:10px"><span class="cta" style="flex:1;background:#fff;color:'+T_P+';box-shadow:inset 0 0 0 1.5px '+T_P+'">Reschedule</span><span class="cta" style="flex:1">Add to calendar</span></div>')}
function uiTala3(){return PH(T_P,"chat",SB()+talaHead("Nurse Joy is in this chat")+
  '<div class="chatb">'+
  '<div class="bo">Mataas po ang lagnat niya ngayon, 39.5</div>'+
  '<div class="bi">Salamat sa pagsabi. For a high fever, it’s better to talk to a nurse now. Ikinokonekta kita sa Tala Marikina.</div>'+
  '<div class="alrt" data-n="1">'+IC("alert",18,"#b91c1c",2.2)+'<span><b>If breathing is difficult or your child is very drowsy,</b> go to the nearest emergency room or call 911.</span></div>'+
  '<span class="sysm">'+IC("users",12,"#6b7280")+' Tala connected you to <b>Nurse Joy</b> · 8:24 AM</span>'+
  '<div style="display:flex;gap:8px;align-items:flex-end">'+AV("JS","#7048e8",26)+'<div class="bi" style="margin:0">Hi po, si Nurse Joy ito. Ilang araw na po ang lagnat? May gamot na po bang nainom?</div></div>'+
  '<div class="bo">Kagabi pa po. Paracetamol po kaninang 6 AM</div>'+
  '<div style="display:flex;gap:8px;align-items:flex-end">'+AV("JS","#7048e8",26)+'<div class="bi typing" style="margin:0"><i></i><i></i><i></i></div></div>'+
  '</div>'+chatIn("Reply to Nurse Joy…"))}

/* ============================== BAYANI BANK ============================== */
var B_BL="#1864ab";
function uiBay1(){
  var ids=[["PhilSys ID",1],["UMID"],["Driver’s license"],["Passport"]];
  return PH(B_BL,"dark",SB("#fff")+
  '<div class="navbar" style="color:#fff">'+IC("x",22,"#fff",2)+'<b>Scan your ID</b>'+IC("info",20,"#fff",1.8)+'</div>'+
  '<div data-n="1" style="padding:0 20px;display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:space-between;font-size:13px;color:#9ca3af"><span>Step 2 of 4</span><span>About 3 min left</span></div><div class="seg6 dk"><i class="on"></i><i class="on"></i><i></i><i></i></div></div>'+
  '<div class="vf"><span class="cn tl"></span><span class="cn tr"></span><span class="cn bl"></span><span class="cn br"></span>'+
    '<div class="idc"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:9px;letter-spacing:.08em;color:#1e3a8a">NATIONAL ID</b><span style="width:16px;height:16px;border-radius:50%;background:linear-gradient(135deg,#fbbf24,#f59e0b)"></span></div><div style="display:flex;gap:10px;margin-top:8px"><span class="photo"></span><div style="flex:1;display:flex;flex-direction:column;gap:5px;padding-top:2px"><i style="width:80%"></i><i style="width:60%"></i><i style="width:70%"></i><i style="width:45%"></i></div></div><div class="mrz">0000 1234 5678 9012</div></div>'+
    '<span class="scan"></span></div>'+
  '<p style="text-align:center;color:#fff;font-weight:600;font-size:16px;margin-top:6px">Hold steady…</p><p style="text-align:center;color:#9ca3af;font-size:13px;margin-top:4px;padding:0 30px">We’ll capture automatically when all four corners are in the frame.</p>'+
  '<div class="idchips" data-n="2">'+ids.map(function(d){return '<span class="'+(d[1]?"on":"")+'">'+d[0]+'</span>'}).join("")+'</div>'+
  '<div style="margin-top:auto;display:flex;justify-content:center;align-items:center;gap:56px;padding:0 0 34px">'+IC("layers",24,"#9ca3af",1.8)+'<span class="shut"><i></i></span>'+IC("bolt",24,"#9ca3af",1.8)+'</div>',"#0b0f14")}
function uiBay2(){
  var g=[["🎓","Tuition",1],["🛟","Emergency fund"],["📦","Balikbayan box"],["🏪","Small business"]];
  return PH(B_BL,"",SB()+
  '<div class="navbar">'+IC("back",22,B_BL,2.4)+'<b>Your first goal</b><span style="width:22px"></span></div>'+
  '<div style="padding:0 20px;display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280"><span>Step 4 of 4</span><span>Last step</span></div><div class="seg6"><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i></div></div>'+
  '<p class="ltitle" style="font-size:26px;padding-top:16px">What are you saving for?</p>'+
  '<div class="goals" data-n="1">'+g.map(function(x){return '<div class="'+(x[2]?"on":"")+'"><span class="em">'+x[0]+'</span><b>'+x[1]+'</b>'+(x[2]?'<span class="tick">'+IC("check",12,"#fff",3)+'</span>':'')+'</div>'}).join("")+'</div>'+
  '<div class="card amt" data-n="2"><div style="display:flex;justify-content:space-between;align-items:baseline"><span class="sm mut">Goal amount</span><span class="xs" style="color:'+B_BL+';font-weight:600">Edit</span></div><b style="font-size:30px;letter-spacing:-.02em">₱15,000</b><span class="sm mut">by June 2027 · about <b style="color:#111">₱700 a week</b></span>'+
  '<div class="sld"><i style="width:29%"></i><span style="left:29%"></span></div><div style="display:flex;justify-content:space-between" class="xs mut"><span>₱1,000</span><span>₱50,000</span></div>'+
  '<div style="display:flex;align-items:center;gap:10px;border-top:1px solid #f0f0f0;padding-top:10px;margin-top:4px">'+IC("refresh",18,B_BL,2)+'<span class="sm" style="flex:1">Auto-save every Monday</span>'+SWITCH(1)+'</div></div>'+
  '<div style="margin-top:auto;padding:12px 16px 34px"><div class="cta">Open my account</div><p class="xs mut" style="text-align:center;margin-top:8px">'+IC("lock",11,"#9ca3af")+' Deposits insured up to ₱1,000,000 per depositor</p></div>')}
function uiBay3(){
  var tx=[["store","#fff4e6","#e8590c","Cash in · partner store","Today, 6:12 PM","+₱500"],["refresh","#e7f5ff",B_BL,"Weekly auto-save","Mon, 9:00 AM","+₱200"],["bolt","#fff9db","#f08c00","Meralco bill","Sun, 3:40 PM","−₱1,284"]];
  return PH(B_BL,"",SB()+
  '<div style="display:flex;align-items:center;gap:10px;padding:6px 18px 10px">'+AV("JC","#fab005",38)+'<div style="flex:1"><span class="xs mut">Magandang gabi,</span><br><b style="font-size:18px">Jessa</b></div><span style="position:relative">'+IC("bell",22,"#111",1.8)+'<i style="position:absolute;right:0;top:0;width:8px;height:8px;border-radius:50%;background:#e03131"></i></span></div>'+
  '<div class="dcard"><div style="display:flex;justify-content:space-between"><b style="letter-spacing:.14em;font-size:13px">BAYANI</b><span class="xs" style="opacity:.8">Savings</span></div><span class="chip2"></span><div style="display:flex;justify-content:space-between;align-items:flex-end"><span style="font:500 14px/1 var(--mono);letter-spacing:.12em">•••• 4417</span><span style="display:flex"><i style="width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.6)"></i><i style="width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.35);margin-left:-9px"></i></span></div></div>'+
  '<div style="padding:14px 20px 0" data-n="1"><span class="sm mut">Savings balance</span><div style="display:flex;align-items:baseline;gap:8px"><b style="font-size:32px;letter-spacing:-.03em">₱2,450.00</b><span class="xs" style="color:#2f9e44;font-weight:600">+₱700 this week</span></div><span class="xs mut">Earning 3.5% a year · interest paid monthly</span></div>'+
  '<div class="qa">'+[["plus","Add money"],["send","Send"],["receipt","Pay bills"],["target","Goals"]].map(function(q){return '<div><span>'+IC(q[0],20,B_BL,2)+'</span><em>'+q[1]+'</em></div>'}).join("")+'</div>'+
  '<div class="card" style="margin:0 16px;padding:12px 14px;border-radius:14px;display:flex;align-items:center;gap:12px"><span style="font-size:22px">🎓</span><div style="flex:1"><div style="display:flex;justify-content:space-between"><b class="sm">Tuition fund</b><span class="xs mut">16%</span></div><div class="pbar" style="width:100%;margin:6px 0 4px"><i style="width:16%;background:'+B_BL+'"></i></div><span class="xs mut">₱2,450 of ₱15,000 · on track for June</span></div></div>'+
  '<div class="grp" style="margin-top:10px">'+tx.map(function(t){return '<div class="it" style="padding:10px 14px"><span style="width:34px;height:34px;border-radius:10px;background:'+t[1]+';display:grid;place-items:center">'+IC(t[0],17,t[2],2)+'</span><div style="flex:1"><span class="sm" style="font-weight:500">'+t[3]+'</span><br><span class="xs mut">'+t[4]+'</span></div><b class="sm" style="color:'+(t[5][0]==="+"?"#2f9e44":"#111")+'">'+t[5]+'</b></div>'}).join("")+'</div>'+
  TABBAR([["home","Home"],["target","Goals"],["card","Card"],["user","Me"]],0))}

/* ============================== LAKBAY ============================== */
var L_OR="#e8590c";
function landSVG(k){var P=[["#0ea5a4","#5eead4","#f5d0a9"],["#0284c7","#7dd3fc","#fde68a"],["#155e75","#67e8f9","#d9f99d"],["#1e40af","#93c5fd","#fecaca"],["#0f766e","#99f6e4","#fef3c7"]][k];
  return '<svg viewBox="0 0 96 72" width="96" height="72"><defs><linearGradient id="sky'+k+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+P[1]+'"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><rect width="96" height="72" fill="url(#sky'+k+')"/><path d="M0 44 Q24 20 44 40 T96 30 V72 H0z" fill="#166534" opacity=".85"/><path d="M0 52 Q48 44 96 50 V72 H0z" fill="'+P[0]+'"/><path d="M0 62 Q48 56 96 62 V72 H0z" fill="'+P[2]+'"/><circle cx="76" cy="16" r="7" fill="#fff7ed" opacity=".9"/></svg>'}
function uiLakbay(){
  var days=[["Mon 11","Fly Manila → Puerto Princesa","plane","PR 2787 · 7:45 AM → 9:10 AM","Underground River · 1:30 PM slot","City food tour if the river closes",0,"sun","32°","10%"],
            ["Tue 12","Van to El Nido · 5 h","van","Shared van · 8:00 AM","Check in near Corong-Corong","Earlier 6 AM van if rain is forecast",1,"cloud","30°","40%"],
            ["Wed 13","Island hopping, Tour A","ship","Small Lagoon · Big Lagoon · snorkelling","Boat leaves 9:00 AM","Nacpan Beach if boats are cancelled",2,"rain","28°","70%"],
            ["Thu 14","Ferry El Nido → Coron · 4 h","ship","Departs 6:00 AM · Montenegro","Kayangan Lake at sunset","Fly El Nido → Manila if the ferry is suspended",3,"rain","27°","65%"]];
  return '<div class="ui x" style="width:1200px;height:720px;--b:'+L_OR+';display:flex;flex-direction:column;background:#faf8f5">'+
  '<div class="l-nav"><span class="l-logo">'+IC("sun",18,L_OR,2.2)+'lakbay</span><span class="on">Plan</span><span>My trips</span><span>Ferries</span><span>Deals</span><span style="flex:1"></span><div class="l-srch">'+IC("search",14,"#9ca3af")+'Where to next?</div>'+AV("KA","#7048e8",30)+'</div>'+
  '<div style="flex:1;display:grid;grid-template-columns:320px 1fr 300px;min-height:0">'+
    '<aside class="l-chat"><div style="display:flex;align-items:center;gap:8px"><span class="a-bot" style="background:'+L_OR+'">'+IC("spark",13,"#fff",2)+'</span><b class="sm">Trip assistant</b></div>'+
      '<div class="bo" data-n="1" style="background:'+L_OR+'">5 days in Palawan in August, two adults, not too rushed, some snorkelling.</div>'+
      '<div class="bi" style="font-size:13.5px">Here’s a relaxed plan. August is typhoon season, so every leg has a plan B and your last night stays near the airport.</div>'+
      '<div class="card" data-n="2" style="padding:10px 12px"><div style="display:flex;justify-content:space-between;align-items:center"><b class="xs" style="letter-spacing:.04em">WEATHER RISK · PALAWAN</b><span class="pill" style="background:#fff4dc;color:#94620a">Moderate</span></div><div class="wx">'+[["sun","Mon","32°","10%"],["cloud","Tue","30°","40%"],["rain","Wed","28°","70%"],["rain","Thu","27°","65%"],["cloud","Fri","29°","35%"]].map(function(w){return '<div>'+IC(w[0],18,w[0]==="sun"?"#f59e0b":"#64748b",1.8)+'<b>'+w[1]+'</b><span>'+w[2]+'</span><em>'+w[3]+'</em></div>'}).join("")+'</div></div>'+
      '<div style="display:flex;flex-wrap:wrap;gap:6px"><span class="chip">Swap Coron for Port Barton</span><span class="chip">Add a spa day</span><span class="chip">Cheaper stays</span></div>'+
      '<div class="cin" style="margin-top:auto;border-radius:12px;background:#fff">'+IC("spark",18,L_OR,2)+'<span>Ask Lakbay to change anything…</span>'+IC("send",18,L_OR,2)+'</div></aside>'+
    '<main style="padding:18px 22px;display:flex;flex-direction:column;gap:10px;min-width:0;overflow:hidden">'+
      '<div style="display:flex;align-items:center;gap:8px"><b style="font-size:22px;letter-spacing:-.02em">Palawan · 11–15 August</b><span class="pill" style="background:#f1f0ed;color:#4b5563">2 adults</span><span class="pill" style="background:#f1f0ed;color:#4b5563">Relaxed pace</span><span style="flex:1"></span><span class="btn">'+IC("share",14)+'Share</span></div>'+
      days.map(function(d,i){return '<div class="card l-day"><span class="l-ph">'+landSVG(d[6])+'</span><div style="flex:1;min-width:0"><div style="display:flex;gap:8px;align-items:center"><span class="xs" style="color:'+L_OR+';font-weight:700">'+d[0]+'</span>'+IC(d[2],14,"#6b7280")+'<b class="sm">'+d[1]+'</b></div><span class="xs mut" style="display:block;margin-top:2px">'+d[3]+' · '+d[4]+'</span><span class="planb'+(i===3?" warn":"")+'"'+(i===3?' data-n="3"':'')+'>'+IC("refresh",11)+'Plan B: '+d[5]+'</span></div><div class="l-w">'+IC(d[7],16,d[7]==="sun"?"#f59e0b":"#64748b",1.8)+'<b>'+d[8]+'</b><em>'+d[9]+'</em></div></div>'}).join("")+
    '</main>'+
    '<aside class="l-side"><div class="card" style="padding:0;overflow:hidden;border-radius:14px"><svg viewBox="0 0 276 250" width="100%" height="250"><rect width="276" height="250" fill="#cfe8f3"/><path d="M40 238 C60 200 80 180 110 150 S160 90 190 60 S235 20 250 10 L262 22 C240 40 210 70 190 100 S140 170 115 190 S70 238 58 246z" fill="#d9ead0" stroke="#b8d2a8"/><path d="M200 40 C215 30 232 34 238 46 C230 58 214 60 202 52z" fill="#d9ead0" stroke="#b8d2a8"/><path d="M232 60 C246 56 256 62 254 74 C244 78 234 74 232 60z" fill="#d9ead0" stroke="#b8d2a8"/><path d="M92 196 L150 118 L236 58" fill="none" stroke="'+L_OR+'" stroke-width="2.5" stroke-dasharray="6 5"/>'+[[92,196,"Puerto Princesa"],[150,118,"El Nido"],[236,58,"Coron"]].map(function(p){return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="8" fill="#fff" stroke="'+L_OR+'" stroke-width="3"/><text x="'+(p[0]-(p[2].length>8?92:44))+'" y="'+(p[1]+4)+'" font-size="11" font-weight="700" font-family="Inter,sans-serif" fill="#1f2937">'+p[2]+'</text>'}).join("")+'</svg></div>'+
      '<div class="card" data-n="4" style="padding:14px 16px;display:flex;flex-direction:column;gap:7px"><span class="xs mut" style="font-weight:600;letter-spacing:.04em">ESTIMATED COST · 2 ADULTS</span>'+[["Flights","₱18,200"],["Ferries & vans","₱6,800"],["Stays · 4 nights","₱11,400"],["Tours","₱2,000"]].map(function(c){return '<div style="display:flex;justify-content:space-between" class="sm"><span class="mut">'+c[0]+'</span><span>'+c[1]+'</span></div>'}).join("")+'<div style="display:flex;justify-content:space-between;border-top:1px solid #eee;padding-top:8px"><b>Total</b><b style="font-size:20px;color:'+L_OR+'">₱38,400</b></div><span class="btn pri" style="justify-content:center;height:40px;border-radius:10px">Book this plan</span><span class="xs mut" style="text-align:center">Free changes up to 48 h before each leg</span></div>'+
    '</aside>'+
  '</div></div>';
}

/* ============================== NORTHWIND ============================== */
var N_NV="#1d4ed8";
function uiNorth(){
  var sch=[["#e03131","ONE","ONE Harmony 214S","Tue 21 Oct","Sun 26 Oct","Good"],["#1c7ed6","MSK","Maersk Kolkata 42S","Fri 24 Oct","Tue 28 Oct","Good"],["#f08c00","EVG","Ever Lucent 118S","Tue 28 Oct","Sun 2 Nov","Limited"]];
  return '<div class="ui x" style="width:1200px;height:720px;--b:'+N_NV+';display:flex;flex-direction:column;background:#f5f7fa">'+
  '<div class="n-top"><span class="n-logo">'+IC("anchor",17,"#93c5fd",2.2)+'NORTHWIND</span><span>Lanes</span><span>Sea freight</span><span>Air freight</span><span>Customs</span><span style="flex:1"></span><div class="n-track">'+IC("search",14,"#9ca3af")+'Track a container or B/L</div><span class="btn pri" style="height:34px">Get a quote</span></div>'+
  '<div class="n-hero"><svg viewBox="0 0 1200 150" width="1200" height="150" preserveAspectRatio="none"><rect width="1200" height="150" fill="#0b2545"/><g fill="#13315c"><path d="M0 0 H260 C230 40 250 70 200 100 C150 130 60 120 0 150z"/><path d="M820 150 C860 110 900 120 940 90 C990 60 1060 80 1200 40 V150z"/><path d="M430 20 C470 10 520 30 500 60 C480 80 440 70 430 20z"/></g><path d="M300 52 C520 -10 760 30 900 104" stroke="#60a5fa" stroke-width="2.5" fill="none" stroke-dasharray="7 6"/><circle cx="300" cy="52" r="7" fill="#fff"/><circle cx="900" cy="104" r="7" fill="#fff"/><text x="258" y="80" font-size="13" font-weight="700" fill="#fff" font-family="Inter,sans-serif">Manila (MNL)</text><text x="860" y="132" font-size="13" font-weight="700" fill="#fff" font-family="Inter,sans-serif">Singapore (SIN)</text><g transform="translate(560 14)"><rect width="42" height="18" rx="4" fill="#fbbf24"/><text x="21" y="13" text-anchor="middle" font-size="10" font-weight="800" fill="#0b2545" font-family="Inter,sans-serif">2,390 km</text></g></svg>'+
    '<div class="n-stats">'+[["4–5 days","Port to port"],["2 sailings","Every week"],["98.1%","On time, 12 months"]].map(function(s){return '<div><b>'+s[0]+'</b><span>'+s[1]+'</span></div>'}).join("")+'</div></div>'+
  '<div style="flex:1;display:grid;grid-template-columns:1fr 340px;gap:22px;padding:18px 28px;min-height:0">'+
    '<div style="display:flex;flex-direction:column;gap:12px;min-width:0">'+
      '<span class="xs mut">Lanes › Philippines › <b style="color:#111">Manila → Singapore</b></span>'+
      '<div style="display:flex;align-items:center;gap:12px"><h1 style="font:700 26px/1.1 var(--sans);letter-spacing:-.02em">Manila → Singapore sea freight</h1><span class="pill" style="background:#dcfce7;color:#166534">FCL · LCL · Reefer</span></div>'+
      '<div class="card" data-n="1" style="overflow:hidden"><table class="n-t"><tr><th>Carrier</th><th>Vessel / voyage</th><th>ETD Manila</th><th>ETA Singapore</th><th>Space</th><th style="text-align:right">40′ from</th></tr>'+sch.map(function(r,i){return '<tr><td><span class="carr" style="background:'+r[0]+'">'+r[1]+'</span></td><td><b style="font-weight:600">'+r[2]+'</b></td><td>'+r[3]+'</td><td>'+r[4]+'</td><td><span class="pill" style="background:'+(r[5]==="Good"?"#dcfce7":"#fef3c7")+';color:'+(r[5]==="Good"?"#166534":"#92400e")+'">'+r[5]+'</span></td><td style="text-align:right;font-weight:700">US$ '+[420,445,398][i]+'</td></tr>'}).join("")+'</table></div>'+
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">'+[["box","Cargo rules","Dangerous goods need an MSDS and 72 h notice.",1],["doc","Documents","Commercial invoice, packing list, bill of lading."],["shield","Customs","Singapore GST applies on arrival; we can file for you."]].map(function(c){return '<div class="card" style="padding:12px 14px;display:flex;flex-direction:column;gap:6px"'+(c[3]?' data-n="2"':'')+'><span style="display:flex;gap:8px;align-items:center">'+IC(c[0],16,N_NV,2)+'<b class="sm">'+c[1]+'</b></span><span class="xs" style="color:#4b5563;line-height:1.45">'+c[2]+'</span></div>'}).join("")+'</div>'+
      '<div data-n="4" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="xs mut" style="font-weight:600">RELATED LANES</span>'+["Manila → Ho Chi Minh City","Cebu → Singapore","Manila → Port Klang","Davao → Singapore"].map(function(l){return '<span class="chip" style="display:flex;gap:6px;align-items:center">'+IC("ship",12,"#6b7280")+l+'</span>'}).join("")+'</div>'+
    '</div>'+
    '<div class="card" data-n="3" style="padding:16px 18px;display:flex;flex-direction:column;gap:10px;align-self:start"><b style="font-size:16px">Get a quote in 2 minutes</b>'+
      '<div class="stp"><span class="d">'+IC("check",11,"#fff",3)+'</span><em>Route</em><i></i><span class="a">2</span><em><b>Cargo</b></em><i></i><span>3</span><em>Price</em></div>'+
      [["Container","40′ standard, 1 unit"],["Ready date","20 Oct 2026"],["Commodity","Furniture · 18 pallets · 9.6 t"]].map(function(f){return '<div><span class="xs mut">'+f[0]+'</span><div class="n-field">'+f[1]+IC("chevd",14,"#9ca3af")+'</div></div>'}).join("")+
      '<div style="display:flex;justify-content:space-between;align-items:baseline;background:#eff6ff;border-radius:10px;padding:10px 12px"><span class="sm" style="color:#1e3a8a">Estimate</span><b style="font-size:20px;color:#1e3a8a">US$ 398–445</b></div>'+
      '<span class="btn pri" style="justify-content:center;height:40px">See exact prices</span><span class="xs mut" style="display:flex;gap:6px;align-items:center">'+IC("clock",12,"#9ca3af")+'A lane specialist replies within 1 working hour</span></div>'+
  '</div></div>';
}

/* ============================== SARI ============================== */
var S_OR="#d9480f";
function pack(c,label,w,h){w=w||40;h=h||48;return '<svg width="'+w+'" height="'+h+'" viewBox="0 0 40 48"><rect x="4" y="4" width="32" height="42" rx="4" fill="'+c+'"/><rect x="4" y="4" width="32" height="10" rx="4" fill="#000" opacity=".12"/><rect x="8" y="20" width="24" height="12" rx="2" fill="#fff" opacity=".9"/><text x="20" y="29" text-anchor="middle" font-size="7" font-weight="800" font-family="Inter,sans-serif" fill="'+c+'">'+label+'</text></svg>'}
function androidBar(color){return '<div class="sbar" style="height:36px;padding:0 20px;font-size:13px;color:'+(color||"#111")+'"><span>9:41</span><span style="display:flex;gap:5px;align-items:center">'+IC("globe",13,"currentColor",2)+SBI.replace('class="sbi"','class="sbi" style="transform:scale(.85)"')+'</span></div>'}
function uiSari1(){
  var low=[["#f59f00","RICE","Dinorado rice, 25 kg","~3 days left",.25,2],["#e03131","OIL","Cooking oil 1 L × 12","~4 days left",.35,1],["#1c7ed6","NOOD","Instant noodles × 48","~2 days left",.15,3],["#6741d9","3in1","3-in-1 coffee × 100","~5 days left",.45,2]];
  return PH(S_OR,"and",androidBar()+
  '<div class="s-top">'+AV("AN","#d9480f",36)+'<div style="flex:1;line-height:1.25"><b style="font-size:17px">Aling Nena’s Store</b><br><span class="xs" style="color:#2f9e44">● Online · Brgy. Malanday</span></div>'+IC("bell",22,"#111",1.8)+'</div>'+
  '<div class="s-search">'+IC("search",18,"#6b7280")+'Search 2,400 products'+IC("camera",18,"#6b7280")+'</div>'+
  '<div class="s-usual" data-n="1"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><span class="xs" style="opacity:.85;font-weight:600">YOUR USUAL ORDER</span><b style="display:block;font-size:22px;letter-spacing:-.01em">12 items · ₱6,840</b><span class="xs" style="opacity:.85">Last ordered Monday · arrives Thursday</span></div><span style="display:flex">'+pack("#f59f00","RICE",30,36)+pack("#e03131","OIL",30,36)+pack("#1c7ed6","NOOD",30,36)+'</span></div><span class="s-btn">'+IC("refresh",16,S_OR,2.2)+'Reorder in one tap</span></div>'+
  '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px 4px"><b class="sm" data-n="2">Running low</b><span class="xs" style="color:'+S_OR+';font-weight:600">See all</span></div>'+
  low.map(function(l){return '<div class="s-it">'+pack(l[0],l[1])+'<div style="flex:1;min-width:0"><b class="sm" style="font-weight:600">'+l[2]+'</b><div style="display:flex;align-items:center;gap:6px;margin-top:4px"><span class="pbar" style="width:60px"><i style="width:'+(l[4]*100)+'%;background:#e03131"></i></span><span class="xs mut">'+l[3]+'</span></div></div><span class="stp2">'+IC("minus",14,"#374151",2.4)+'<b>'+l[5]+'</b>'+IC("plus",14,S_OR,2.4)+'</span></div>'}).join("")+
  '<div class="m3nav">'+[["store","Order",1],["truck","Deliveries"],["chart","Sales"],["user","Store"]].map(function(n){return '<div class="'+(n[2]?"on":"")+'"><span>'+IC(n[0],22,"currentColor",1.9)+'</span><em>'+n[1]+'</em></div>'}).join("")+'</div>')}
function uiSari2(){return PH(S_OR,"and",androidBar()+
  '<div class="s-top">'+IC("back",24,"#111",2)+'<b style="font-size:19px;flex:1">Checkout</b></div>'+
  '<div class="snack" data-n="1">'+IC("wifioff",18,"#fbbf24",2)+'<span>No signal. Your cart is saved and will send when you’re back online.</span></div>'+
  '<p class="s-h">Delivery window</p>'+
  '<div class="s-chips" data-n="2">'+[["Thu","8–11 AM",1,"Before your morning rush"],["Thu","2–5 PM"],["Fri","8–11 AM"]].map(function(c){return '<div class="'+(c[2]?"on":"")+'"><em>'+c[0]+'</em><b>'+c[1]+'</b></div>'}).join("")+'</div>'+
  '<p class="xs mut" style="padding:6px 18px 0">'+IC("info",12,"#9ca3af")+' Most stores in Malanday pick Thursday mornings</p>'+
  '<p class="s-h">Payment</p>'+
  '<div class="s-opt on"><span class="rd"></span><div style="flex:1"><b class="sm">Cash on delivery</b><br><span class="xs mut">Pay the driver when it arrives</span></div>'+IC("wallet",20,S_OR,1.8)+'</div>'+
  '<div class="s-opt"><span class="rd"></span><div style="flex:1"><b class="sm">Pay later · 7 days</b><br><span class="xs mut">Credit limit ₱15,000</span></div>'+IC("cal",20,"#9ca3af",1.8)+'</div>'+
  '<div class="s-sum"><div><span>12 items</span><span>₱6,840</span></div><div><span>Delivery</span><span style="color:#2f9e44">Free</span></div><div><span>Points earned</span><span>+68</span></div></div>'+
  '<div style="margin-top:auto;padding:12px 16px 30px"><div class="cta" style="border-radius:999px">Place order · ₱6,840</div></div>')}
function uiSari3(){return PH(S_OR,"and",androidBar()+
  '<div style="position:relative;height:330px;overflow:hidden"><svg viewBox="0 0 360 330" width="360" height="330"><rect width="360" height="330" fill="#eceae4"/><g stroke="#fff" stroke-width="14"><path d="M-10 90 L380 60"/><path d="M-10 220 L380 250"/><path d="M90 -10 L120 340"/><path d="M260 -10 L240 340"/></g><g stroke="#fff" stroke-width="6"><path d="M-10 150 L380 150"/><path d="M180 -10 L170 340"/></g><rect x="130" y="100" width="36" height="36" fill="#dcfce7"/><rect x="190" y="170" width="40" height="30" fill="#dbeafe"/><path d="M40 285 C80 240 110 230 125 190 S170 150 205 110 S250 80 300 70" fill="none" stroke="'+S_OR+'" stroke-width="5" stroke-linecap="round"/><path d="M40 285 C80 240 110 230 125 190" fill="none" stroke="#9ca3af" stroke-width="5" stroke-dasharray="1 0"/><circle cx="300" cy="70" r="10" fill="#111"/><circle cx="300" cy="70" r="4" fill="#fff"/></svg>'+
    '<span style="position:absolute;left:112px;top:170px;width:34px;height:34px;border-radius:50%;background:'+S_OR+';display:grid;place-items:center;box-shadow:0 0 0 6px rgba(217,72,15,.2)">'+IC("truck",18,"#fff",2)+'</span>'+
    '<span style="position:absolute;left:14px;top:44px;width:40px;height:40px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 2px 8px rgba(0,0,0,.15)">'+IC("back",20,"#111",2.2)+'</span></div>'+
  '<div class="sheet"><i class="grab"></i><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><span class="xs" style="color:'+S_OR+';font-weight:700;letter-spacing:.04em">ON THE WAY</span><b style="display:block;font-size:22px;letter-spacing:-.01em">9:10 – 9:40 AM</b><span class="xs mut">Order #SR-88214 · 12 items</span></div><span class="pill" style="background:#e6f4ea;color:#1e7a3c">2 stops away</span></div>'+
  '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid #f0f0f0;border-bottom:1px solid #f0f0f0">'+AV("RD","#495057",38)+'<div style="flex:1"><b class="sm">Mang Rudy</b><br><span class="xs mut">Truck 07 · NBC 4412 · ★ 4.9</span></div><span class="rb2">'+IC("msg",18,S_OR,2)+'</span><span class="rb2">'+IC("phone",18,S_OR,2)+'</span></div>'+
  '<div class="tl2" data-n="1">'+[["done","Order received","Mon 7:58 PM"],["done","Packed at Marikina depot","Thu 6:40 AM"],["now","Out for delivery","Thu 8:52 AM"],["todo","Delivered · pay ₱6,840 cash",""]].map(function(t){return '<div class="'+t[0]+'"><i></i><span class="sm">'+t[1]+'</span><em class="xs mut">'+t[2]+'</em></div>'}).join("")+'</div></div>')}

/* ============================== KALINAW ============================== */
var K_GR="#2b8a3e";
function houseSVG(){var p='';for(var i=0;i<5;i++)for(var j=0;j<2;j++)p+='<rect x="'+(70+i*27-j*12)+'" y="'+(62+j*20)+'" width="24" height="17" fill="#1e3a8a" stroke="#93c5fd" stroke-width="1" transform="skewX(-18)"/>';
  return '<svg viewBox="0 0 300 170" width="100%" height="170"><rect width="300" height="170" fill="#eaf6ee"/><circle cx="252" cy="36" r="18" fill="#fcc419"/><g stroke="#fcc419" stroke-width="2.5">'+[0,45,90,135,180,225,270,315].map(function(a){var r=a*Math.PI/180;return '<line x1="'+(252+Math.cos(r)*24)+'" y1="'+(36+Math.sin(r)*24)+'" x2="'+(252+Math.cos(r)*30)+'" y2="'+(36+Math.sin(r)*30)+'"/>'}).join("")+'</g><path d="M40 105 L110 40 L230 40 L260 105z" fill="#94a3b8"/>'+p+'<rect x="52" y="105" width="196" height="55" fill="#fff" stroke="#d1d5db"/><rect x="80" y="120" width="30" height="40" fill="#fde68a"/><rect x="140" y="118" width="36" height="24" fill="#bfdbfe"/><rect x="190" y="118" width="36" height="24" fill="#bfdbfe"/><rect x="0" y="160" width="300" height="10" fill="#b2dfb8"/></svg>'}
function uiKal(){
  var cum=[],v=-285;for(var y=0;y<=20;y++){cum.push(v);v+=50.4*(y<10?1:0.96)}
  var W=440,H=120,mn=-300,mx=Math.max.apply(null,cum),path="";cum.forEach(function(c,i){var x=i/20*W,y=H-(c-mn)/(mx-mn)*H;path+=(i?"L":"M")+x.toFixed(1)+" "+y.toFixed(1)});
  var zeroY=H-(0-mn)/(mx-mn)*H,pbx=5.8/20*W;
  var bars=[62,58,70,74,78,66,52,49,55,60,63,68];
  return '<div class="ui x" style="width:1200px;height:720px;--b:'+K_GR+';display:flex;flex-direction:column;background:#f7faf8">'+
  '<div class="k-nav"><span class="k-logo">'+IC("sun",18,K_GR,2.2)+'kalinaw</span><span>How solar works</span><span>Net metering</span><span class="on">Costs &amp; savings</span><span>Guides</span><span style="flex:1"></span><span class="sm mut">(02) 8123 4567</span><span class="btn pri" style="border-radius:999px;height:36px">Book a free site visit</span></div>'+
  '<div style="flex:1;display:grid;grid-template-columns:1fr 330px;gap:22px;padding:18px 32px;min-height:0">'+
    '<div style="display:flex;flex-direction:column;gap:12px;min-width:0">'+
      '<span class="xs mut">Guides › Costs &amp; savings</span><h1 style="font:700 30px/1.1 var(--sans);letter-spacing:-.025em">How much can solar save your home?</h1>'+
      '<div class="card" style="padding:14px 16px;display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:16px">'+
        '<div data-n="1"><span class="xs mut">Your monthly electricity bill</span><div class="k-field"><span class="mut">₱</span><b>6,500</b></div><div class="sld" style="margin-top:12px"><i style="width:38%"></i><span style="left:38%"></span></div></div>'+
        '<div><span class="xs mut">Roof type</span><div class="seg2" style="margin-top:6px"><span class="on">Metal</span><span>Tile</span><span>Concrete</span></div><div style="display:flex;align-items:center;gap:8px;margin-top:12px"><span class="sm" style="flex:1">Add battery backup</span>'+SWITCH(0)+'</div></div>'+
        '<div><span class="xs mut">City</span><div class="k-field" style="font-size:15px;justify-content:space-between">Quezon City'+IC("chevd",16,"#9ca3af")+'</div><span class="xs mut" style="display:block;margin-top:10px">'+IC("sun",11,"#f59e0b")+' 4.6 peak sun hours / day</span></div>'+
      '</div>'+
      '<div data-n="2" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">'+[["bolt","5 kWp","Recommended system · 10 panels"],["wallet","₱4,200","Saved each month"],["clock","5.8 years","Payback period"],["leaf","3.1 t","CO₂ avoided each year"]].map(function(s){return '<div class="card" style="padding:12px 14px"><span style="display:flex;gap:6px;align-items:center" class="xs mut">'+IC(s[0],14,K_GR,2)+s[2]+'</span><b style="display:block;font-size:22px;letter-spacing:-.02em;color:#14532d;margin-top:4px">'+s[1]+'</b></div>'}).join("")+'</div>'+
      '<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:12px">'+
        '<div class="card" style="padding:12px 14px"><div style="display:flex;justify-content:space-between"><b class="sm">Savings over 20 years</b><span class="xs mut">cumulative, ₱ thousands</span></div><svg viewBox="0 0 '+W+' '+(H+18)+'" width="100%" height="'+(H+18)+'"><line x1="0" y1="'+zeroY+'" x2="'+W+'" y2="'+zeroY+'" stroke="#d1d5db" stroke-dasharray="3 3"/><path d="'+path+'L'+W+' '+H+'L0 '+H+'z" fill="'+K_GR+'" opacity=".12"/><path d="'+path+'" fill="none" stroke="'+K_GR+'" stroke-width="2.4"/><line x1="'+pbx+'" y1="0" x2="'+pbx+'" y2="'+H+'" stroke="#f59e0b" stroke-width="1.5"/><rect x="'+(pbx+6)+'" y="4" width="92" height="20" rx="5" fill="#fff7e6" stroke="#fcd34d"/><text x="'+(pbx+12)+'" y="18" font-size="10.5" font-weight="700" fill="#92400e" font-family="Inter,sans-serif">Paid back · 5.8 y</text><text x="'+(W-4)+'" y="16" text-anchor="end" font-size="11" font-weight="700" fill="#14532d" font-family="Inter,sans-serif">₱'+Math.round(mx)+'k</text><g font-size="9.5" fill="#9ca3af" font-family="Inter,sans-serif"><text x="0" y="'+(H+14)+'">Year 0</text><text x="'+(W/2-14)+'" y="'+(H+14)+'">Year 10</text><text x="'+(W-38)+'" y="'+(H+14)+'">Year 20</text></g></svg></div>'+
        '<div class="card" style="padding:12px 14px"><b class="sm" data-n="3">Estimated monthly solar output</b><div style="display:flex;align-items:flex-end;gap:5px;height:100px;margin-top:10px">'+bars.map(function(h,i){return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px"><i style="display:block;width:100%;height:'+h+'px;border-radius:3px 3px 0 0;background:'+K_GR+';opacity:'+(i>=2&&i<=4?1:.4)+'"></i><span style="font-size:9px;color:#9ca3af">'+"JFMAMJJASOND"[i]+'</span></div>'}).join("")+'</div><span class="xs mut">Highest in dry season, March to May</span></div>'+
      '</div>'+
    '</div>'+
    '<div style="display:flex;flex-direction:column;gap:12px;min-height:0">'+
      '<div class="card" style="overflow:hidden;padding:0">'+houseSVG()+'<div style="padding:10px 14px;display:flex;justify-content:space-between;align-items:center"><span class="sm"><b>10 × 500 W panels</b><br><span class="xs mut">≈ 26 m² of roof · 1 day to install</span></span><span class="pill" style="background:#eaf6ee;color:#14532d">Fits your roof</span></div></div>'+
      '<div class="card" style="padding:12px 14px"><b class="sm" data-n="4">Questions people ask next</b>'+
        '<div class="faq open"><div>What is net metering?'+IC("chevd",16,"#6b7280")+'</div><p>Extra power your panels make is sent to the grid and credited on your bill, so sunny days lower the months that follow.</p></div>'+
        ["Do panels work during brownouts?","How long do panels last?","Can I pay in instalments?"].map(function(q){return '<div class="faq"><div>'+q+IC("chev",16,"#9ca3af")+'</div></div>'}).join("")+'</div>'+
    '</div>'+
  '</div></div>';
}

var SHOTS={
  "aster":{h:"The answer, with its working shown.",main:{url:"app.aster.io/ask/refunds-enterprise",ui:uiAster,w:1200,h:720,cap:"Ask workspace / answer with sources"},
    tiles:[{ui:uiAsterConf,w:600,h:400,cap:"Three plain confidence states"},{ui:uiAsterCite,w:600,h:400,cap:"Every claim opens its source"}]},
  "morrow":{h:"Pages that answer the next question.",main:{url:"morrow.co/applications/structural-slabs",ui:uiMorrow,w:1200,h:720,cap:"Topic journey / structural slabs"},
    tiles:[{ui:uiMorrowGraph,w:600,h:400,cap:"The entity map behind every page"},{ui:uiMorrowSerp,w:600,h:400,cap:"Structured proof, as search engines read it"}]},
  "common-ground":{h:"Built for one hand, weak signal and little time.",phones:[{ui:uiCG1,cap:"Saved steps / plain guidance"},{ui:uiCG2,cap:"Works offline"},{ui:uiCG3,cap:"Proactive case updates"}],
    main:{url:"staff.commonground.city/cases",ui:uiCGDesk,w:1200,h:720,cap:"Caseworker view / pick up where residents left off"}}
};
function escA(t){return String(t).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}
function hotLayer(notes,n0){
  if(!notes||!notes.length)return "";
  return '<div class="hots">'+notes.map(function(nt,k){return '<button type="button" class="hot" data-sel="'+escA(nt[0])+'" aria-label="'+(n0+k)+'. '+escA(nt[1])+'" aria-expanded="false">'+(n0+k)+'<span class="tip">'+nt[1]+'</span></button>'}).join("")+'</div>';
}
function legend(notes,n0){
  return ""; /* notes text switched off; markers stay */
  if(!notes||!notes.length)return "";
  return '<ol class="notes">'+notes.map(function(nt,k){return '<li><b>'+(n0+k)+'</b><span>'+nt[1]+'</span></li>'}).join("")+'</ol>';
}
function fitBox(ui,w,h,notes,n0){return '<div class="fit" data-w="'+w+'" data-h="'+h+'" style="aspect-ratio:'+w+'/'+h+'">'+ui()+hotLayer(notes,n0||1)+'</div>'}
var LOCK='<svg viewBox="0 0 12 12" fill="none"><rect x="2" y="5.5" width="8" height="5.5" rx="1.2" fill="#8e9188"/><path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" stroke="#8e9188" stroke-width="1.3"/></svg>';
function shotsHTML(id){
  var S=SHOTS[id];if(!S)return "";
  var X=NOTES[id]||{},n=1;
  var out='<section class="cp-shots" data-scene="dust2"><div class="wrap">'+
    '<div class="cp-ov"><div style="display:flex;flex-direction:column;gap:14px"><p class="mono m11 sb">The product</p><p class="shot-note mono m9 mute"><i></i>Interface recreated for illustration / sample data</p></div><h2 class="cp-h2">'+S.h+'</h2></div>';
  if(S.phones){
    var all=[];
    out+='<div class="phones" style="grid-template-columns:repeat('+S.phones.length+',1fr);max-width:'+(S.phones.length*347)+'px">'+S.phones.map(function(p,k){
      var nt=(X.phones&&X.phones[k])||[],start=n;n+=nt.length;all=all.concat(nt);
      return '<figure class="fig"><div class="phone"><span class="btn-side"></span>'+fitBox(p.ui,360,740,nt,start)+'</div><figcaption class="mono m9 mute"><span>'+p.cap+'</span></figcaption></figure>'}).join("")+'</div>';
    out+=legend(all,1);
  }
  if(S.main){
    var mn=X.main||[],ms=n;n+=mn.length;var tab=X.tab||[S.main.cap,"#888"];
    out+='<figure class="fig"><div class="browser"><div class="chrome"><span class="tl"><i></i><i></i><i></i></span><span class="tab"><b style="background:'+tab[1]+'"></b><span>'+tab[0]+'</span><em>×</em></span><span class="newtab">+</span></div>'+
      '<div class="tbar"><span class="nv"><span>←</span><span>→</span><span>↻</span></span><span class="url">'+LOCK+S.main.url+'</span><span class="me"></span></div>'+
      fitBox(S.main.ui,S.main.w,S.main.h,mn,ms)+'</div><figcaption class="mono m9 mute"><span>'+S.main.cap+'</span><span>Desktop / 1200 × 720</span></figcaption>'+legend(mn,ms)+'</figure>';
  }
  if(S.tiles)out+='<div class="shot-row">'+S.tiles.map(function(t){return '<figure class="fig"><div class="tile">'+fitBox(t.ui,t.w,t.h)+'</div><figcaption class="mono m9 mute"><span>'+t.cap+'</span></figcaption></figure>'}).join("")+'</div>';
  return out+'</div></section>';
}
function findTarget(ui,sel){
  if(sel.indexOf("text:")===0){
    var txt=sel.slice(5),best=null,bl=1e9,all=ui.querySelectorAll("*");
    for(var i=0;i<all.length;i++){var tc=all[i].textContent;if(tc&&tc.indexOf(txt)>=0&&tc.length<bl){best=all[i];bl=tc.length}}
    return best;
  }
  try{return ui.querySelector(sel)}catch(e){return null}
}
document.addEventListener("click",function(e){
  var h=e.target.closest&&e.target.closest(".hot");
  $$(".hot.open").forEach(function(o){if(o!==h){o.classList.remove("open");o.setAttribute("aria-expanded","false")}});
  if(h){var on=!h.classList.contains("open");h.classList.toggle("open",on);h.setAttribute("aria-expanded",on?"true":"false")}
});
document.addEventListener("keydown",function(e){if(e.key==="Escape")$$(".hot.open").forEach(function(o){o.classList.remove("open");o.setAttribute("aria-expanded","false")})});
function placeNotes(f){
  var hots=f.querySelectorAll(".hot");if(!hots.length)return;
  var ui=f.querySelector(".ui"),fr=f.getBoundingClientRect();if(!fr.width||!ui)return;
  for(var i=0;i<hots.length;i++){var h=hots[i],t=findTarget(ui,h.getAttribute("data-sel"));
    if(!t){h.hidden=true;continue}
    var r=t.getBoundingClientRect();
    var x=(r.left-fr.left-15)/fr.width*100,y=(r.top-fr.top+Math.min(r.height/2,14))/fr.height*100;
    x=Math.max(5,Math.min(95,x));y=Math.max(5,Math.min(95,y));
    h.style.left=x+"%";h.style.top=y+"%";
    h.classList.toggle("al",x<35);h.classList.toggle("ar",x>65);h.classList.toggle("bl",y<30);
  }
}
function fitShots(){$$(".fit").forEach(function(f){if(!f.clientWidth)return;var s=f.clientWidth/parseFloat(f.getAttribute("data-w"));var u=f.firstElementChild;if(u)u.style.transform="scale("+s+")";placeNotes(f)})}
addEventListener("resize",fitShots);


/* further projects for the "More work" index (sample content, replace with real projects) */
var MORE=[
  ["tala",{idx:"04",cat:"AI solutions",key:"ai",color:"#c2255c",kind:"chat",client:"Tala Health",name:"Tala Health / Clinic Network",title:"Clinic booking that speaks Filipino and English.",year:"2025",
    meta:[["Client","Tala Health"],["Sector","Primary care clinics"],["Services","AI product design, conversation design, engineering"],["Timeline","16 weeks"],["Year","2025"]],
    overview:"Tala runs 60 neighbourhood clinics across Luzon. Patients booked by phone, in whichever mix of Filipino and English felt natural—and front desks spent their day on hold queues. We designed an assistant that books, reschedules and prepares patients in the language they actually use.",
    story:[["Challenge","Two-thirds of calls were routine bookings, but switching between Filipino, English and Taglish broke every off-the-shelf bot the clinics had tried."],["Insight","Patients didn’t want a chatbot; they wanted to be booked quickly and told exactly what to bring. The language had to follow them, not the other way round."],["Solution","A bilingual booking assistant on Messenger and web, with clinic-approved scripts, clear hand-off to staff, and no medical advice—only logistics and preparation."]],
    results:[["−54%","Routine calls to front desks","First quarter"],["71%","Bookings completed without staff","Across 60 clinics"],["4.6/5","Patient satisfaction","Post-visit survey"]],caps:"AI product design / Conversation design / Engineering"}],
  ["bayani",{idx:"05",cat:"Web + mobile",key:"web",color:"#1864ab",kind:"phone",client:"Bayani Bank",name:"Bayani Bank / Digital Savings",title:"A first savings account in four minutes.",year:"2025",
    meta:[["Client","Bayani Bank"],["Sector","Retail banking"],["Services","Product strategy, mobile UX, design system"],["Timeline","7 months"],["Year","2025"]],
    overview:"Bayani wanted to reach first-time savers—students, gig workers and families outside Metro Manila. Their onboarding asked for eleven screens of forms before anyone saw a peso. We rebuilt the first five minutes around trust and momentum.",
    story:[["Challenge","Half of new applicants dropped out before identity checks, and support tickets showed people didn’t understand why each document was needed."],["Insight","First-time savers needed to see progress and a clear reason for every question. Trust came from plain language, not from security badges."],["Solution","A four-minute mobile onboarding with one question per screen, one valid ID, a live progress line and a savings goal set before the account is even open."]],
    results:[["2.1×","Completed account openings","Versus the old flow"],["4 min","Median time to open an account","From 19 minutes"],["−37%","Onboarding support tickets","First 90 days"]],caps:"Product strategy / Mobile UX / Design system"}],
  ["lakbay",{idx:"06",cat:"AI solutions",key:"ai",color:"#e67700",kind:"chat",client:"Lakbay",name:"Lakbay / Travel Planning",title:"Trip plans that account for the weather.",year:"2024",
    meta:[["Client","Lakbay"],["Sector","Travel and tourism"],["Services","AI prototyping, data design, product design"],["Timeline","12 weeks"],["Year","2024"]],
    overview:"Lakbay helps travellers plan island trips across the Philippines. Their itineraries ignored ferry schedules and typhoon season, so plans fell apart on arrival. We designed an assistant that plans around what can actually happen.",
    story:[["Challenge","Generic itineraries created refunds and angry reviews when ferries were cancelled or routes closed during bad weather."],["Insight","Travellers trusted a plan that showed its backup. Being honest about uncertainty sold more trips than a perfect-looking schedule."],["Solution","An AI trip planner grounded in live ferry, flight and weather data, which shows a plan B for every leg and flags risky dates before booking."]],
    results:[["−42%","Trips changed after arrival","Peak season"],["+28%","Bookings from planned trips","Six months"],["3×","Saved itineraries shared","Versus the old planner"]],caps:"AI prototyping / Data design / Product design"}],
  ["northwind",{idx:"07",cat:"Semantic SEO",key:"seo",color:"#343a40",kind:"search",client:"Northwind Freight",name:"Northwind Freight / Logistics",title:"Search that finds the right freight lane.",year:"2024",
    meta:[["Client","Northwind Freight"],["Sector","Logistics"],["Services","Semantic SEO, information architecture, structured data"],["Timeline","5 months"],["Year","2024"]],
    overview:"Northwind moves cargo between Asia-Pacific ports. Shippers searched by route, cargo type and deadline; the site answered with service brochures. We rebuilt it around the lanes people actually needed.",
    story:[["Challenge","Hundreds of route pages were thin duplicates, and the lanes that made the most money barely appeared in search."],["Insight","Shippers search for a lane, a cargo and a deadline together. Each of those is an entity the site could model and connect."],["Solution","A lane-based content system with structured transit times, cargo rules and port guidance, generated from operational data and reviewed by the team."]],
    results:[["+164%","Qualified quote requests from search","Six months"],["−61%","Duplicate route pages","Consolidated"],["38","Priority lanes ranking on page one","From 6"]],caps:"Semantic SEO / Information architecture / Structured data"}],
  ["sari",{idx:"08",cat:"Web + mobile",key:"web",color:"#d9480f",kind:"phone",client:"Sari",name:"Sari / Neighbourhood Retail",title:"A storefront for 40,000 neighbourhood stores.",year:"2024",
    meta:[["Client","Sari"],["Sector","Retail and distribution"],["Services","Service design, mobile app, engineering"],["Timeline","8 months"],["Year","2024"]],
    overview:"Sari supplies sari-sari stores—the small neighbourhood shops found on nearly every Filipino street. Owners reordered stock by text and paper lists. We designed a reordering app for owners who are also cashiers, parents and delivery drivers.",
    story:[["Challenge","Owners ran out of best-sellers weekly, and orders arrived wrong because lists were copied by hand at the depot."],["Insight","Owners reorder between customers, one-handed. The app had to be faster than writing a list and forgive a patchy connection."],["Solution","A lightweight Android app with one-tap reorders of usual items, offline carts, cash-on-delivery and delivery windows owners can plan around."]],
    results:[["40k","Stores ordering in-app","Within a year"],["−63%","Incorrect deliveries","Versus paper orders"],["+18%","Average order value","Suggested restocks"]],caps:"Service design / Mobile app / Engineering"}],
  ["kalinaw",{idx:"09",cat:"Semantic SEO",key:"seo",color:"#2b8a3e",kind:"search",client:"Kalinaw Energy",name:"Kalinaw Energy / Home Solar",title:"Explaining home solar in plain language.",year:"2023",
    meta:[["Client","Kalinaw Energy"],["Sector","Renewable energy"],["Services","Content strategy, semantic SEO, calculators"],["Timeline","4 months"],["Year","2023"]],
    overview:"Kalinaw installs rooftop solar for homes and small businesses. Buyers searched for cost, payback and net metering—and found jargon. We turned the site into the clearest explanation of home solar in the country.",
    story:[["Challenge","High-intent searches about cost and payback landed on product spec sheets, and sales calls spent twenty minutes on basics."],["Insight","Homeowners wanted their own numbers. A good estimate built more trust than any claim about panel efficiency."],["Solution","Plain-language guides linked to a bill-based savings calculator, net-metering explainers and structured FAQs that answer the next question."]],
    results:[["+212%","Organic visits from buying questions","Six months"],["2.6×","Qualified consultation requests","From search"],["−45%","Time on first sales calls","Reported by sales"]],caps:"Content strategy / Semantic SEO / Calculators"}]
];
var SCENE_BY_KEY={ai:"caseLattice",seo:"caseOrbits",web:"casePlanes"};
var STAGE_BY_KEY={ai:["Evidence → decision","AI / grounded answers"],seo:["Meaning → search","Entities / intent / proof"],web:["Service → mobile","Steps / guidance / updates"]};
MORE.forEach(function(m,i){var id=m[0],c=m[1];c.more=true;c.scene=SCENE_BY_KEY[c.key];c.stage=STAGE_BY_KEY[c.key];c.next=MORE[i+1]?MORE[i+1][0]:"hinga";CASES[id]=c});
/* ============================== HINGA (spotlight project) ==============================
   Mental wellbeing, Philippines. Theme: calm mist greys, near-black, one signal orange,
   tight editorial sans, hairline structure. Scenery: Banaue terraces in morning fog. */
var HG="#f0501e",HGC=0;
function hgMark(s,c){c=c||HG;return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="4.4" fill="'+c+'"/><circle cx="16" cy="16" r="9.2" stroke="'+c+'" stroke-width="1.6"/><path d="M16 1.6A14.4 14.4 0 0 1 30.4 16" stroke="'+c+'" stroke-width="1.6" stroke-linecap="round"/><path d="M1.6 16A14.4 14.4 0 0 0 16 30.4" stroke="'+c+'" stroke-width="1.6" stroke-linecap="round"/></svg>'}
function hgBrand(dark,sz){return '<span class="hg3-brand" style="color:'+(dark?"#fff":"#0b0b0b")+'">'+hgMark(sz||24)+'<b>hinga</b></span>'}
function hgHead(dark){return '<div class="hg3-head'+(dark?" hgdk":"")+'">'+hgBrand(dark)+'<span style="display:flex;align-items:center;gap:12px"><span class="hg3-login">Log in</span><span class="hg3-round">'+'<i></i><i></i></span></span></div>'}
function hgEb(t){return '<p class="hg3-eb"><i></i>'+t+'</p>'}
/* Banaue terraces in morning fog — layered contour bands, pure SVG */
function hgTerraces(w,h,par,dark){
  var id="t"+(++HGC),P=dark?["#4b4f4c","#3a3e3b","#2c2f2d","#232624","#1b1d1c","#141615","#0f1110","#0b0c0b"]:["#b9c2bb","#aab4ac","#9aa59d","#8b978f","#7d8a82","#6f7c74","#617067","#55635b"];
  var s='<svg viewBox="0 0 360 320" width="'+w+'" height="'+h+'" preserveAspectRatio="'+(par||"xMidYMax slice")+'"><defs>'+
    '<linearGradient id="sk'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+(dark?"#2a2d2c":"#dfe4e7")+'" stop-opacity="'+(dark?1:0)+'"/><stop offset="1" stop-color="'+(dark?"#555a57":"#e8ecee")+'"/></linearGradient>'+
    '<linearGradient id="fg'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+(dark?"#0b0b0b":"#f3f5f6")+'" stop-opacity="0"/><stop offset="1" stop-color="'+(dark?"#0b0b0b":"#f3f5f6")+'"/></linearGradient>'+
    '<filter id="bl'+id+'" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="8"/></filter>'+
    '<filter id="bs'+id+'"><feGaussianBlur stdDeviation="1.4"/></filter></defs>'+
    '<rect width="360" height="320" fill="url(#sk'+id+')"/>'+
    '<path d="M0 118 C50 92 96 108 140 86 S228 66 274 88 S336 92 360 84 V320 H0z" fill="'+(dark?"#3f4341":"#c5cdd1")+'" opacity=".75" filter="url(#bs'+id+')"/>'+
    '<g filter="url(#bl'+id+')" fill="'+(dark?"#5a5f5c":"#f1f3f4")+'" opacity=".9"><ellipse cx="90" cy="130" rx="150" ry="16"/><ellipse cx="290" cy="124" rx="130" ry="14"/></g>';
  for(var k=0;k<8;k++){var y=140+k*23,a=(k%2?1:-1)*(6+k);
    s+='<path d="M0 '+y+' C60 '+(y-12+a*.3)+' 110 '+(y+9)+' 180 '+(y-5)+' S300 '+(y+11-a*.3)+' 360 '+(y-4)+' V320 H0z" fill="'+P[k]+'"/>'+
       '<path d="M0 '+y+' C60 '+(y-12+a*.3)+' 110 '+(y+9)+' 180 '+(y-5)+' S300 '+(y+11-a*.3)+' 360 '+(y-4)+'" fill="none" stroke="'+(dark?"rgba(255,255,255,.08)":"rgba(255,255,255,.55)")+'" stroke-width="1"/>'+
       '<path d="M0 '+(y+8)+' C60 '+(y-4+a*.3)+' 110 '+(y+17)+' 180 '+(y+3)+' S300 '+(y+19-a*.3)+' 360 '+(y+4)+'" fill="none" stroke="'+(dark?"rgba(255,255,255,.04)":"rgba(255,255,255,.18)")+'" stroke-width=".8"/>';
    if(k===2)s+='<g filter="url(#bl'+id+')" fill="'+(dark?"#4a4f4c":"#eef1f2")+'" opacity=".75"><ellipse cx="200" cy="'+(y+6)+'" rx="190" ry="10"/></g>';}
  return s+'<rect y="200" width="360" height="120" fill="url(#fg'+id+')"/></svg>';
}
/* line-art feature icons (own set) */
var HGI3={
  dial:'<circle cx="24" cy="24" r="19"/><path d="M11 30a14 14 0 0 1 26 0"/><path d="M24 30l7-8"/><circle cx="24" cy="30" r="2.2" fill="'+HG+'" stroke="none"/>',
  pen:'<rect x="9" y="7" width="26" height="34" rx="3"/><path d="M15 16h14M15 22h14M15 28h8"/><path d="M33 30l6-6 3 3-6 6h-3z"/>',
  wave:'<circle cx="24" cy="24" r="19"/><path d="M9 24c3-5 6-5 9 0s6 5 9 0 6-5 9 0" /><path d="M13 31c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 7 0" opacity=".5"/>',
  duo:'<circle cx="17" cy="18" r="6"/><circle cx="31" cy="18" r="6"/><path d="M7 38a10 10 0 0 1 20 0M21 38a10 10 0 0 1 20 0"/><circle cx="24" cy="8" r="1.8" fill="'+HG+'" stroke="none"/>'
};
function hgI(n){return '<svg width="38" height="38" viewBox="0 0 48 48" fill="none" stroke="'+HG+'" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">'+HGI3[n]+'</svg>'}

function uiHinga1(){
  return '<div class="ui x hg3" style="width:360px;height:740px;background:linear-gradient(180deg,#e9ecee 0%,#e3e7ea 55%,#eef1f2 100%)">'+SB()+
  '<div class="hg3-guides"></div>'+hgHead(false)+
  '<div class="hg3-body">'+hgEb("BREATHE, THEN BEGIN")+
    '<h1 class="hg3-h1" data-n="1">Room to breathe, whenever you need&nbsp;it.</h1>'+
    '<p class="hg3-sub">Check in with how you feel, put it into words, and reach a counselor when you’re ready—in Filipino or English.</p>'+
    '<div style="display:flex;align-items:center;gap:16px;margin-top:18px"><span class="hg3-cta" data-n="2">Start a check-in'+IC("arrow",13,"#fff",2)+'</span><span class="hg3-link">How it works</span></div></div>'+
  '<div class="hg3-scene">'+hgTerraces(360,330)+
    '<span class="hg3-live"><i></i>1,204 people breathing now</span>'+
    '<div class="hg3-coord"><span>16.9186° N · 121.0580° E</span><span>Banaue, Ifugao</span></div></div>'+
  '</div>';
}
function uiHinga2(){
  var T=[["dial","Check in, in seconds","Pick how you feel and what’s behind it. No streaks to keep."],
         ["pen","Write it out","Prompts in Filipino, English or both, for when words are hard.",3],
         ["wave","Breathe with a guide","Three-minute sessions for the commute or the break room."],
         ["duo","Talk to someone real","Book a licensed counselor online or near you.",4]];
  return '<div class="ui x hg3" style="width:360px;height:740px;background:#fff">'+SB()+
  '<div class="hg3-guides lt"></div>'+hgHead(false)+
  '<div class="hg3-dots" style="height:20px"></div>'+
  '<div class="hg3-body" style="padding-top:20px;padding-bottom:20px;border-bottom:1px solid #ececec">'+hgEb("WHAT YOU CAN DO HERE")+'<h2 class="hg3-h2">Small tools for heavy days.</h2><p class="hg3-sub">Private, gentle and made with Filipino counselors—so taking care of yourself never feels like homework.</p></div>'+
  '<div class="hg3-grid">'+T.map(function(t){return '<div'+(t[3]?' data-n="'+t[3]+'"':'')+'>'+hgI(t[0])+'<b>'+t[1]+'</b><p>'+t[2]+'</p></div>'}).join("")+'</div>'+
  '<div class="hg3-lang"><span>Available in</span><b>Filipino</b><b>English</b><b>Taglish</b></div>'+
  '<div class="hg3-dots" style="flex:1"></div></div>';
}
function uiHinga3(){
  var v=[46,52,40,44,58,74,66],W=276,H=92,pts=v.map(function(x,i){return [i/6*W,H-(x-30)/50*H]}),d="";
  pts.forEach(function(p,i){if(!i){d="M"+p[0]+" "+p[1];return}var q=pts[i-1],cx=(q[0]+p[0])/2;d+=" C"+cx+" "+q[1]+" "+cx+" "+p[1]+" "+p[0]+" "+p[1]});
  var id="c"+(++HGC),hl=pts[5];
  return '<div class="ui x hg3 hgdk" style="width:360px;height:740px;background:#0b0b0b;color:#fff">'+SB("#fff")+
  '<div class="hg3-guides gdk"></div>'+hgHead(true)+
  '<div class="hg3-band">'+hgTerraces(360,170,"xMidYMid slice",true)+'<div class="hg3-bandtxt">'+hgEb("YOUR WEEK")+'<h2 class="hg3-h2" style="color:#fff">Patterns,<br>not pressure.</h2></div></div>'+
  '<div class="hg3-chart" data-n="5"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:12px;font-weight:500">How you’ve felt</b><span class="hg3-chip">7 days</span></div>'+
    '<svg viewBox="0 -14 '+W+' '+(H+34)+'" width="100%" height="'+(H+34)+'"><defs><linearGradient id="ar'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+HG+'" stop-opacity=".35"/><stop offset="1" stop-color="'+HG+'" stop-opacity="0"/></linearGradient></defs>'+
    [0,1,2].map(function(k){return '<line x1="0" x2="'+W+'" y1="'+(k*H/2)+'" y2="'+(k*H/2)+'" stroke="#ffffff14"/>'}).join("")+
    '<path d="'+d+' L'+W+' '+H+' L0 '+H+'z" fill="url(#ar'+id+')"/><path d="'+d+'" fill="none" stroke="'+HG+'" stroke-width="2"/>'+
    pts.map(function(p,i){return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(i===5?5:2.6)+'" fill="'+(i===5?HG:"#0b0b0b")+'" stroke="'+HG+'" stroke-width="1.6"/>'}).join("")+
    '<g transform="translate('+(hl[0]-86)+' '+(hl[1]-30)+')"><rect width="76" height="20" rx="6" fill="#fff"/><text x="38" y="13.5" text-anchor="middle" font-size="9" font-weight="600" fill="#0b0b0b" font-family="Inter,sans-serif">Calmer · slept 8h</text></g>'+
    "MTWTFSS".split("").map(function(c,i){return '<text x="'+(i/6*W)+'" y="'+(H+16)+'" text-anchor="middle" font-size="9" fill="'+(i===5?"#fff":"#777")+'" font-family="Inter,sans-serif">'+c+'</text>'}).join("")+'</svg></div>'+
  '<div class="hg3-items"><span>'+IC("checkc",16,"#d4d4d4",1.6)+'Missed a day? No streak to lose.</span><span>'+IC("msg",16,"#d4d4d4",1.6)+'Prompts when words are hard</span>'+
    '<span class="hl">'+IC("users",16,HG,1.8)+'<span>A counselor is online tonight<em>From ₱350 · book in two taps</em></span></span>'+
    '<span data-n="6">'+IC("phone",16,"#d4d4d4",1.6)+'<span>In crisis? Call NCMH <b style="color:'+HG+'">1553</b>, 24/7</span></span></div>'+
  '</div>';
}
function uiHingaWeb(){
  var M=[["Bagyo","#6b7280"],["Ulan","#9ca3af"],["Maulap","#c4c8cc"],["Maaliwalas",HG],["Maaraw","#fb923c"]];
  return '<div class="ui x hg3" style="width:1200px;height:720px;background:linear-gradient(180deg,#e7eaec 0%,#e1e5e8 50%,#eef1f2 100%)">'+
  '<div class="hg3-guides web"></div>'+
  '<div class="hg3-wnav">'+hgBrand(false,28)+'<span style="flex:1"></span><span>How it works</span><span>Counselors</span><span>For workplaces</span><span>Stories</span><span class="hg3-login" style="font-size:13.5px">Log in</span><span class="hg3-cta" style="margin:0">Start a check-in'+IC("arrow",13,"#fff",2)+'</span></div>'+
  '<div style="position:absolute;left:0;right:0;bottom:0;height:400px">'+hgTerraces(1200,400,"none")+'</div>'+
  '<div style="position:relative;padding:62px 0 0 96px;max-width:720px;display:flex;flex-direction:column;gap:14px">'+hgEb("BREATHE, THEN BEGIN")+
    '<h1 class="hg3-h1" style="font-size:56px">Room to breathe,<br>whenever you need&nbsp;it.</h1>'+
    '<p class="hg3-sub" style="font-size:16px;max-width:470px">Check in with how you feel, put it into words, and reach a counselor when you’re ready—in Filipino or English.</p>'+
    '<div data-n="1" style="display:flex;align-items:center;gap:18px;margin-top:6px"><span class="hg3-cta" style="margin:0;height:46px;padding:0 22px">Start in your browser'+IC("arrow",13,"#fff",2)+'</span><span class="hg3-link">For clinics and workplaces</span></div></div>'+
  '<div class="hg3-float" data-n="2"><div style="display:flex;justify-content:space-between;align-items:center"><span class="hg3-eb" style="margin:0"><i></i>CHECK-IN</span><span style="font-size:10.5px;color:#8a8f93">8:12 AM</span></div>'+
    '<b style="display:block;font:500 19px/1.15 var(--sans);letter-spacing:-.035em;margin:8px 0 14px">How are you arriving today?</b>'+
    '<div class="hg3-scale">'+M.map(function(m,i){return '<div class="'+(i===3?"on":"")+'"><span style="background:'+m[1]+'"></span><em>'+m[0]+'</em></div>'}).join("")+'</div>'+
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:14px">'+["Work","Slept well","Family","Money"].map(function(t,i){return '<span class="hg3-tag'+(i===1?" on":"")+'">'+t+'</span>'}).join("")+'</div>'+
    '<span class="hg3-cta" style="margin:16px 0 0;width:100%;justify-content:center">Continue</span></div>'+
  '<div class="hg3-wfoot" data-n="3"><span>16.9186° N</span><span style="display:flex;gap:30px;align-items:center"><span class="mono-s">With clinic partners</span><b>Kalinga Care</b><b>Dagat Clinics</b><b>Bukid Mental Health</b></span><span style="color:'+HG+'">In crisis? Call NCMH 1553</span></div>'+
  '</div>';
}

CASES["hinga"]={idx:"00",cat:"Brand + product + AI",name:"Hinga / Mental Wellbeing",title:"A calmer front door to mental health care.",scene:"caseOrbits",back:"#spotlight",
  meta:[["Client","Hinga"],["Sector","Mental wellbeing"],["Services","Naming, identity, product design, AI journaling, engineering"],["Timeline","8 months"],["Year","2026"]],
  stage:["Feel → reflect → reach out","Check-ins / journaling / care"],
  overview:"Most Filipinos who struggle with their mental health never speak to anyone about it. Cost, stigma and distance all play a part—but so does the first step, which usually asks too much. With a group of counselors and clinics, we named, designed and built Hinga: a gentle, bilingual front door that starts with a breath, not a form.",
  story:[["Challenge","Partner clinics had capacity, but people weren’t booking. Intake forms were long, English-only and clinical, and nothing existed for the days before someone felt ready to talk."],
         ["Insight","People don’t start with therapy; they start with a feeling they can’t yet name. A thirty-second check-in in their own language earned more trust than any promise of help."],
         ["Solution","A calm, bilingual app and site: mood check-ins, AI-assisted journaling prompts reviewed by counselors, guided breathing, and a clear, one-tap path to licensed care or crisis support."]],
  approach:[["Frame","3 weeks","Agreed success with clinicians: returning users and booked sessions, never time-in-app."],["Find","5 weeks","Listened to 36 people across Metro Manila, Cebu and Davao, and to the counselors who would receive them."],["Form","12 weeks","Named the brand, built the identity and prototyped check-ins and journaling with counselors reviewing every AI prompt."],["Field","14 weeks","Launched with three clinic networks, measuring return visits, bookings and safety escalations weekly."]],
  built:[["Thirty-second check-ins","Pick a feeling and what’s behind it. No streaks, no scores, no guilt for missing a day."],["AI journaling, with guardrails","Gentle prompts in Filipino, English or Taglish. The assistant never diagnoses, and hands off the moment risk appears."],["Counselor booking","Licensed counselors, online or nearby, with sliding-scale pricing shown upfront."],["Crisis support, always visible","NCMH 1553 and local hotlines are one tap away on every screen."]],
  results:[["68%","Come back in week two","Across 41,000 early users"],["2.4×","More counselor bookings","Versus the old clinic site"],["4.8","App store rating","From 3,900 reviews"]],
  quote:["Monarch made asking for help feel as simple as taking a breath. Our clinics are seeing people who would never have walked in before.","Andrea Villanueva","Co-founder / Hinga","AV"],
  caps:"Naming and identity / Product design / AI journaling / Web + mobile engineering",next:"aster"};
SHOTS["hinga"]={h:"Calm by design, in your own language.",
  phones:[{ui:uiHinga1,cap:"Welcome / a quiet first step"},{ui:uiHinga2,cap:"What you can do here"},{ui:uiHinga3,cap:"Your week and crisis support"}],
  main:{url:"hinga.ph",ui:uiHingaWeb,w:1200,h:720,cap:"Website / check in before signing up"}};
function buildSpotlight(){var el=$("#spotPhones");if(!el)return;el.innerHTML=[uiHinga1,uiHinga2,uiHinga3].map(function(f){return '<div class="spot-scr">'+fitBox(f,360,740)+'</div>'}).join("")}
try{buildSpotlight()}catch(e){console.error("[monarch] spotlight failed",e)}
SHOTS["tala"]={h:"Booking in the language people actually use.",phones:[{ui:uiTala1,cap:"Bilingual booking in chat"},{ui:uiTala2,cap:"Confirmation and visit prep"},{ui:uiTala3,cap:"Safe hand-off to a nurse"}]};
SHOTS["bayani"]={h:"Four minutes from download to a first savings goal.",phones:[{ui:uiBay1,cap:"One ID, one question per screen"},{ui:uiBay2,cap:"A goal before the account opens"},{ui:uiBay3,cap:"Progress you can see every week"}]};
SHOTS["lakbay"]={h:"A plan that shows its plan B.",main:{url:"lakbay.ph/plan/palawan-august",ui:uiLakbay,w:1200,h:720,cap:"AI trip plan with weather-aware backups"}};
SHOTS["northwind"]={h:"One page per lane, with the answers shippers need.",main:{url:"northwindfreight.com/lanes/manila-singapore",ui:uiNorth,w:1200,h:720,cap:"Lane page / transit, cut-offs, rules and quote"}};
SHOTS["sari"]={h:"Faster than writing the list by hand.",phones:[{ui:uiSari1,cap:"One-tap reorder of the usual"},{ui:uiSari2,cap:"Offline cart, cash on delivery"},{ui:uiSari3,cap:"Delivery tracking"}]};
SHOTS["kalinaw"]={h:"Your numbers first, jargon never.",main:{url:"kalinaw.energy/guides/solar-savings",ui:uiKal,w:1200,h:720,cap:"Bill-based savings calculator"}};

/* annotations: what each screen shows, and why it matters (targets are data-n markers in each screen) */
function NN(list){return list.map(function(x){return ['[data-n="'+x[0]+'"]',x[1]]})}
var NOTES={
  "aster":{tab:["Refunds after 30 days · Aster","#4c5fd5"],main:NN([
    [1,"Questions are asked in plain language and scoped to the team’s own space"],
    [2,"‘Verified’ means every claim is cited and each source was reviewed in the last 90 days"],
    [3,"Numbered citations open the exact passage an answer came from"],
    [4,"Each source shows its owner, review date and how fresh it is"],
    [5,"When confidence is low, one click routes the question to a named expert"]])},
  "morrow":{tab:["Low-carbon concrete for structural slabs | Morrow","#2f5d50"],main:NN([
    [1,"Entity chips link material, standard, method and proof across the whole site"],
    [2,"Answers the specifier’s real question with numbers, including the carbon saving"],
    [3,"Evidence sits beside the answer: EPD, test data and a built case study"],
    [4,"‘Next questions’ turn a single visit into a useful journey"]])},
  "common-ground":{tab:["Cases · Common Ground","#0f766e"],
    phones:[NN([[1,"Progress saves after every answer, so interruptions cost nothing"],[2,"Every question explains why it’s asked, in plain language"]]),
            NN([[1,"Works offline and sends answers when the signal returns"],[2,"Big, clear inputs in local currency with a number keypad"]]),
            NN([[1,"A live status timeline means residents don’t need to call"],[2,"Push updates arrive the moment a case moves forward"]])],
    main:NN([[1,"Queues are organised by what needs action next"],[2,"Staff see each resident’s live progress, including steps saved offline"],[3,"Sync notes explain exactly what happened, and when"],[4,"One click moves a complete case to a decision"]])},
  "tala":{phones:[NN([[1,"Available times are tap targets, so nobody has to type"],[2,"A clear boundary: Tala books visits and never gives medical advice"]]),
                  NN([[1,"A prep checklist cuts no-shows and repeat visits"]]),
                  NN([[1,"Urgent symptoms hand over to a nurse, with emergency guidance"]])]},
  "bayani":{phones:[NN([[1,"Showing time left, not just steps, reduces drop-off"],[2,"One valid ID is enough, and the fastest option comes first"]]),
                    NN([[1,"Goals are framed in everyday Filipino terms"],[2,"A weekly amount and auto-save make the goal feel doable"]]),
                    NN([[1,"Balance and interest are written in plain words"]])]},
  "lakbay":{tab:["Palawan, 11–15 August · Lakbay","#e8590c"],main:NN([
    [1,"Plans start from a plain-language request"],
    [2,"Seasonal weather risk is surfaced before anyone books"],
    [3,"Every leg carries its own backup plan"],
    [4,"The full cost for two, flights and ferries included"]])},
  "northwind":{tab:["Manila → Singapore sea freight | Northwind","#1d4ed8"],main:NN([
    [1,"Live sailings with vessel, dates, space and price for the lane"],
    [2,"Rules, documents and customs help on the same page"],
    [3,"A quote form built into the answer, not a separate page"],
    [4,"Related lanes connect the lane pages into one network"]])},
  "sari":{phones:[NN([[1,"The usual order is a single tap"],[2,"Suggests what’s about to run out, with days left"]]),
                  NN([[1,"The cart survives a dropped connection"],[2,"Delivery windows fit around store hours"]]),
                  NN([[1,"Tracking shows each step and exactly what to pay on delivery"]])]},
  "hinga":{tab:["Hinga · Room to breathe","#f0501e"],
    phones:[NN([[1,"A warm, plain headline written with Filipino counselors"],[2,"One clear first step: a thirty-second check-in, not a sign-up form"]]),
            NN([[3,"Journaling prompts in Filipino, English or Taglish, reviewed by counselors"],[4,"A direct path to licensed counselors when someone is ready"]]),
            NN([[5,"A gentle mood curve that links feelings to sleep and days, with no scores or streaks"],[6,"Crisis support is always one tap away: NCMH 1553, 24/7"]])],
    main:NN([[1,"Start in the browser, with no download or sign-up standing in the way"],[2,"A live check-in on the homepage, so people can try it first"],[3,"Clinic partners and the crisis line are visible on every page"]])},
  "kalinaw":{tab:["Solar savings calculator | Kalinaw","#2b8a3e"],main:NN([
    [1,"Starts from the bill people already know"],
    [2,"System size, monthly savings, payback and CO₂, at a glance"],
    [3,"Seasonal output is explained, not hidden"],
    [4,"FAQs matched to the next question buyers ask"]])}
};
var CASE_TOTAL=String(Object.keys(CASES).length).padStart(2,"0");
function thumb(id){
  var c=CASES[id],S=SHOTS[id],v;
  if(S&&S.phones)v='<div class="vw ph">'+fitBox(S.phones[0].ui,360,740)+'</div>';
  else if(S&&S.main)v='<div class="vw">'+fitBox(S.main.ui,S.main.w,S.main.h)+'</div>';
  else v='';
  return '<div class="th2" style="background:'+c.color+'"><div class="tb"><span>'+c.client+' / '+c.cat+'</span><span>'+c.year+'</span></div>'+v+'</div>';
}
function buildMoreWork(){
  var list=$("#mwList"),filters=$("#mwFilters"),prev=$("#mwPrev");if(!list)return;
  var items=MORE.map(function(m){return {id:m[0],c:m[1]}});
  list.innerHTML=items.map(function(it){var c=it.c;return '<a class="mw-row" href="#/work/'+it.id+'" data-key="'+c.key+'" data-id="'+it.id+'" data-cursor="Open">'+
    '<span class="n">'+c.idx+'</span><span class="cl"><i style="background:'+c.color+'"></i>'+c.client+'</span><span class="t">'+c.title+'</span><span class="yr dsc">'+c.cat+'</span><span class="yr">'+c.year+'</span>'+ARROW+'<span class="mw-thumb" aria-hidden="true">'+thumb(it.id)+'</span></a>'}).join("")+'<p class="mw-empty mono m11" hidden>No projects in this discipline yet.</p>';
  var cats=[["all","All"],["ai","AI solutions"],["seo","Semantic SEO"],["web","Web + mobile"]];
  filters.innerHTML=cats.map(function(k,i){var n=k[0]==="all"?items.length:items.filter(function(it){return it.c.key===k[0]}).length;return '<button type="button" data-f="'+k[0]+'" aria-pressed="'+(i===0)+'">'+k[1]+'<sup>'+n+'</sup></button>'}).join("");
  filters.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;var f=b.getAttribute("data-f");
    $$("button",filters).forEach(function(x){x.setAttribute("aria-pressed",String(x===b))});
    var shown=0;$$(".mw-row",list).forEach(function(r){var on=f==="all"||r.getAttribute("data-key")===f;r.classList.toggle("hide",!on);if(on)shown++});
    $(".mw-empty",list).hidden=shown>0;});
  // cursor-following preview
  var P={x:0,y:0,tx:0,ty:0,on:false,raf:0,rot:0};
  function tick(){P.x+=(P.tx-P.x)*.16;P.y+=(P.ty-P.y)*.16;P.rot+=(((P.tx-P.x)*.06)-P.rot)*.2;
    prev.style.transform="translate("+(P.x+28).toFixed(1)+"px,"+(P.y-160).toFixed(1)+"px) rotate("+Math.max(-8,Math.min(8,P.rot)).toFixed(2)+"deg)";
    if(P.on||Math.abs(P.tx-P.x)>.5)P.raf=requestAnimationFrame(tick);else P.raf=0}
  list.addEventListener("pointerover",function(e){var r=e.target.closest(".mw-row");if(!r||!FINE||REDUCED)return;
    var c=CASES[r.getAttribute("data-id")];if(prev.getAttribute("data-id")!==r.getAttribute("data-id")){prev.innerHTML=thumb(r.getAttribute("data-id"));fitShots();prev.setAttribute("data-id",r.getAttribute("data-id"))}
    if(!P.on){P.x=P.tx=e.clientX;P.y=P.ty=e.clientY}P.on=true;prev.classList.add("on");if(!P.raf)tick()});
  list.addEventListener("pointermove",function(e){P.tx=e.clientX;P.ty=e.clientY});
  list.addEventListener("pointerleave",function(){P.on=false;prev.classList.remove("on")});
  addEventListener("scroll",function(){if(P.on){P.on=false;prev.classList.remove("on")}},{passive:true});
}
try{buildMoreWork()}catch(e){console.error(e)}
requestAnimationFrame(fitShots);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitShots);
var PORTRAIT_SRC=(document.getElementById("portraitSrc")||{}).src||"";
function caseHTML(id){
  var c=CASES[id],n=CASES[c.next],q=c.quote,av="";
  if(q)av=q[3]==="portrait"?'<img src="'+PORTRAIT_SRC+'" alt="Portrait of '+q[1]+'" width="34" height="34">':'<span class="initials" aria-hidden="true">'+q[3]+'</span>';
  var back=c.back||(c.more?"#more-work":"#work");
  var h=''+
  '<div class="cp-top" data-scene="'+c.scene+'"><div class="wrap">'+
    '<div class="cp-bar"><a class="back" href="'+back+'" data-cursor="Back">'+ARROW_R+'All work</a><p class="mono m11 mute">Case '+c.idx+' / '+CASE_TOTAL+'</p></div>'+
    '<div class="casehead"><span class="tag"><span class="ix lime">'+c.idx+'</span><span class="lbl">'+c.cat+'</span></span><p class="mono m11 sb bone">'+c.name+'</p></div>'+
    '<h1 class="cp-title">'+c.title+'</h1>'+
    '<dl class="cp-meta">'+c.meta.map(function(m){return '<div><dt class="mono m9 b mute">'+m[0]+'</dt><dd>'+m[1]+'</dd></div>'}).join("")+'</dl>'+
    '<div class="stage" aria-hidden="true"><p class="mono m9 b mute tl">'+c.stage[0]+'</p><p class="mono m9 b mute bl">'+c.stage[1]+'</p><p class="mono m9 mute br">Move through the field</p></div>'+
  '</div></div>'+
  '<section class="cp-sec" data-scene="dust"><div class="wrap">'+
    '<div class="cp-ov"><p class="mono m11 sb">Overview</p><p class="cp-lead">'+c.overview+'</p></div>'+
    '<div class="cp-rows">'+c.story.map(function(s){return '<div class="cp-row"><p class="mono m9 b mute">'+s[0]+'</p><p>'+s[1]+'</p></div>'}).join("")+'</div>'+
  '</div></section>'+
  shotsHTML(id);
  if(c.approach)h+='<section class="cp-approach" data-scene="path"><div class="wrap">'+
    '<div class="process" style="padding:0;background:none"><div class="top"><div class="l"><span class="tag"><span class="ix">'+c.idx+'</span><span class="lbl">How we worked</span></span><h2 class="cp-h2">Four moves, in the open.</h2></div><p>'+c.caps+'</p></div>'+
    '<div class="steps" style="--p:1"><span class="bar" aria-hidden="true"></span>'+c.approach.map(function(a,i){return '<div class="step on'+(i===3?' done':'')+'"><div class="meta"><b>0'+(i+1)+'</b><span class="mono m9 mute">'+a[1]+'</span></div><div><h3>'+a[0]+'</h3><p>'+a[2]+'</p></div><div class="mk"><i></i><s></s></div></div>'}).join("")+'</div></div>'+
  '</div></section>';
  h+='<section class="cp-sec" data-scene="dust2"><div class="wrap">';
  if(c.built)h+='<div class="cp-ov"><p class="mono m11 sb">What we built</p><h2 class="cp-h2">Designed around the real job to be done.</h2></div>'+
    '<div class="cp-built">'+c.built.map(function(b){return '<div><h3>'+b[0]+'</h3><p>'+b[1]+'</p></div>'}).join("")+'</div>';
  h+='<div class="cp-ov"><p class="mono m11 sb">Outcomes</p><p class="mono m9 mute">'+c.caps+'</p></div>'+
    '<div class="cp-results">'+c.results.map(function(r){return '<div class="metric"><p class="big" data-count="'+r[0]+'">'+r[0]+'</p><div class="note"><b>'+r[1]+'</b><p class="mono m10 dimc">'+r[2]+'</p></div></div>'}).join("")+'</div>';
  if(q)h+='<figure class="cp-quote" style="margin:0"><div class="author">'+av+'<div><b>'+q[1]+'</b><p class="mono m10 md mute">'+q[2]+'</p></div></div><blockquote><span style="color:var(--lime)">“</span>'+q[0]+'”</blockquote></figure>';
  h+='</div></section>'+
  '<section class="cp-next on-lime" data-scene="dustInk"><div class="wrap">'+
    '<a class="nextlink" href="#/work/'+c.next+'" data-cursor="Next"><div><p class="mono m11 sb">Next case / '+n.idx+' '+n.cat+'</p><h2>'+n.title+'</h2></div>'+ARROW+'</a>'+
    '<div class="row"><a class="tlink" href="'+back+'" data-cursor="Back">All work'+ARROW+'</a><a class="tlink" href="#contact" data-cursor="Let\'s talk">Start a project'+ARROW+'</a></div>'+
  '</div></section>';
  return h;
}
var homeEl=$("#home"),cpEl=$("#casepage"),wipe=$(".wipe"),baseTitle=document.title,busy=false;
function swap(fn,animate){
  if(!animate||REDUCED){fn();return}
  busy=true;wipe.classList.remove("out");wipe.classList.add("in");
  setTimeout(function(){fn();wipe.classList.remove("in");wipe.classList.add("out");setTimeout(function(){wipe.classList.remove("out");busy=false},650)},580);
}
function jump(y){var h=document.documentElement,sb=h.style.scrollBehavior;h.style.scrollBehavior="auto";window.scrollTo(0,y);h.style.scrollBehavior=sb}
function route(first){
  var m=location.hash.match(/^#\/work\/([\w-]+)/);
  if(m&&CASES[m[1]]){
    var id=m[1];
    swap(function(){
      cpEl.innerHTML=caseHTML(id);cpEl.hidden=false;homeEl.hidden=true;
      document.title=CASES[id].name.split(" / ")[0]+" — "+CASES[id].title+" | Monarch®";
      jump(0);curScene=null;
      $$("[data-count]",cpEl).forEach(function(n){io.observe(n)});fitShots();requestAnimationFrame(fitShots);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitShots);
      onScroll();
      var h=$(".cp-title",cpEl);if(h){h.setAttribute("tabindex","-1");h.focus({preventScroll:true})}
    },!first);
  }else if(homeEl.hidden){
    var tgt=location.hash&&location.hash.length>1&&location.hash.indexOf("#/")!==0?document.querySelector(location.hash):null;
    swap(function(){
      cpEl.hidden=true;cpEl.innerHTML="";homeEl.hidden=false;document.title=baseTitle;curScene=null;
      if(tgt){jump(tgt.getBoundingClientRect().top+scrollY-70)}else if(!first)jump(0);
      measureChars();onScroll();fitShots();requestAnimationFrame(fitShots);
    },!first);
  }
}
addEventListener("hashchange",function(){route(false)});

addEventListener("scroll",onScroll,{passive:true});
addEventListener("resize",function(){measureChars();onScroll()});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){setTimeout(measureChars,2700)});
setTimeout(measureChars,2800);
addEventListener("monarch:reveal",function(){setTimeout(measureChars,2600);onScroll()});
setTimeout(function(){if(document.body.classList.contains("loading")){document.body.classList.remove("loading");var p=document.getElementById("pre");if(p)p.remove();onScroll();setTimeout(measureChars,2600)}},9000);
if(/^#\/work\//.test(location.hash)){try{route(true)}catch(e){console.error(e)}}
onScroll();
})();

/* ---------- 3. Safety net ---------- */
setTimeout(function(){try{if(!window.__mGLok&&window.__mStartGL)window.__mStartGL()}catch(e){}},2500)
