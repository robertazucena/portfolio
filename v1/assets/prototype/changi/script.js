(function(){
"use strict";

/* ============================= DATA ============================= */
var PRICING = {
  Compute:[
    {name:"Virtual Machine Instance AMD (8 vCPU, 32GB RAM)", specs:"8 vCPU / 32GB RAM", qty:"1", oracle:274, aws:575, awsPct:"+110%", azure:521, azurePct:"+90%", gcp:559, gcpPct:"+104%"},
    {name:"Virtual Machine Instance Intel (8 vCPU, 32GB RAM)", specs:"8 vCPU / 32GB RAM", qty:"1", oracle:159, aws:620, awsPct:"+290%", azure:580, azurePct:"+265%", gcp:610, gcpPct:"+283%"},
    {name:"Compute GPU A100", specs:"1x NVIDIA A100", qty:"1", oracle:23888, aws:80741, awsPct:"+238%", azure:78830, azurePct:"+230%", gcp:81219, gcpPct:"+240%"},
    {name:"Compute GPU H100", specs:"1x NVIDIA H100", qty:"1", oracle:59520, aws:148800, awsPct:"+150%", azure:154752, azurePct:"+160%", gcp:151180, gcpPct:"+154%"},
    {name:"Kubernetes Cluster Virtual Nodes", specs:"Per node / month", qty:"1", oracle:181, aws:1062, awsPct:"+487%", azure:1167, azurePct:"+545%", gcp:1053, gcpPct:"+481%"}
  ],
  Storage:[
    {name:"Block Storage", specs:"Per TB / month", qty:"1 TB", oracle:43, aws:120, awsPct:"+179%", azure:115, azurePct:"+167%", gcp:130, gcpPct:"+202%"},
    {name:"Object Storage", specs:"Per TB / month", qty:"1 TB", oracle:25, aws:55, awsPct:"+120%", azure:61, azurePct:"+144%", gcp:58, gcpPct:"+132%"}
  ],
  Network:[
    {name:"Public Bandwidth Transferred Out", specs:"Per 10TB", qty:"10 TB", oracle:994, aws:5417, awsPct:"+445%", azure:55167, azurePct:"+5450%", gcp:48883, gcpPct:"+4818%"},
    {name:"Private Line Network", specs:"Dedicated FastConnect", qty:"1", oracle:949, aws:3101, awsPct:"+227%", azure:3240, azurePct:"+241%", gcp:3080, gcpPct:"+225%"}
  ],
  Database:[
    {name:"MySQL Database", specs:"HeatWave Instance", qty:"1", oracle:1313, aws:3875, awsPct:"+195%", azure:4020, azurePct:"+206%", gcp:3940, gcpPct:"+200%"}
  ]
};
var CATEGORY_ORDER = ["Compute","Storage","Network","Database"];

var TCO = [
  {name:"Oracle Cloud Infrastructure", short:"Oracle Cloud", value:435645, oracle:true},
  {name:"Amazon Web Services", short:"AWS", value:1174290},
  {name:"Microsoft Azure", short:"Microsoft Azure", value:1212110},
  {name:"Google Cloud Platform", short:"Google Cloud", value:1189450}
];

var BENEFITS = [
  {icon:"trend", title:"Performance", sub:"2x faster compute", desc:"Optimized network throughput and state-of-the-art Intel and AMD processors guarantee low-latency application responses."},
  {icon:"shield", title:"Security", sub:"Zero-trust architecture", desc:"Isolated network virtualization and pristine hypervisor security run natively in the background without performance penalties."},
  {icon:"trend", title:"Scalability", sub:"Auto-scaling included", desc:"Instantly expand or compress your nodes to dynamically match airport passenger flow and traffic peaks."}
];

var COMPARE_BARS = [
  {label:"VM Instances (vCPU/RAM)", oracle:274, others:552, oraclePct:46, othersPct:92},
  {label:"Block Storage (Per TB)", oracle:43, others:122, oraclePct:32, othersPct:92},
  {label:"Outbound Data Transfer (Per 10TB)", oracle:994, others:36489, oraclePct:5, othersPct:92},
  {label:"Managed DB Core / Cluster", oracle:1313, others:3945, oraclePct:30, othersPct:92}
];

function fmt(n){ return "$" + n.toLocaleString("en-US"); }
function iconSVG(kind){
  if(kind==="trend"){
    return '<svg viewBox="0 0 32 32" width="32" height="32" fill="none"><path d="M4 24l8-8 5 5 11-11" stroke="#7b2d8b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 10h8v8" stroke="#7b2d8b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  return '<svg viewBox="0 0 32 32" width="32" height="32" fill="none"><path d="M16 3l10 5v8c0 7-4.5 11-10 13-5.5-2-10-6-10-13V8l10-5Z" stroke="#7b2d8b" stroke-width="2.4" stroke-linejoin="round"/></svg>';
}

/* ============================= RENDER: PRICING TABLE (desktop) ============================= */
function renderDesktopPricing(){
  var html = "";
  CATEGORY_ORDER.forEach(function(cat){
    html += '<div class="cat-head">'+cat+'</div>';
    PRICING[cat].forEach(function(p){
      html += '<div class="pt-row">' +
        '<div class="pt-name">'+p.name+'</div>' +
        '<div class="pt-qty">'+p.qty+'</div>' +
        '<div class="pt-oracle-val">'+fmt(p.oracle)+'</div>' +
        '<div class="pt-comp-cell"><span class="val">'+fmt(p.aws)+'</span><span class="pct">'+p.awsPct+'</span></div>' +
        '<div class="pt-comp-cell"><span class="val">'+fmt(p.azure)+'</span><span class="pct">'+p.azurePct+'</span></div>' +
        '<div class="pt-comp-cell"><span class="val">'+fmt(p.gcp)+'</span><span class="pct">'+p.gcpPct+'</span></div>' +
      '</div>';
    });
  });
  document.getElementById("pricingRows").innerHTML = html;
}

/* ============================= RENDER: PRICING (mobile cards/tabs/accordion) ============================= */
var activeCategory = "Compute";
function renderMobileCards(){
  var cont = document.getElementById("pricingCatCards");
  var html = "";
  PRICING[activeCategory].forEach(function(p){
    html += '<div class="mobile-pricing-card">' +
      '<div class="mpc-title-row"><p class="mpc-name">'+p.name+'</p><p class="mpc-specs">'+p.specs+'</p></div>' +
      '<div class="mpc-price-row"><div class="mpc-oracle-price"><span class="lbl">Oracle Price</span><span class="val">'+fmt(p.oracle)+' /mo</span></div><span class="mpc-badge">Oracle First</span></div>' +
      '<div class="mpc-comp-row">' +
        '<div class="mpc-comp"><span class="name">AWS</span><span class="val">'+fmt(p.aws)+'</span><span class="pct">'+p.awsPct+'</span></div>' +
        '<div class="mpc-comp"><span class="name">Azure</span><span class="val">'+fmt(p.azure)+'</span><span class="pct">'+p.azurePct+'</span></div>' +
        '<div class="mpc-comp"><span class="name">GCP</span><span class="val">'+fmt(p.gcp)+'</span><span class="pct">'+p.gcpPct+'</span></div>' +
      '</div>' +
    '</div>';
  });
  cont.innerHTML = html;
}
function renderCatTabs(){
  var cont = document.getElementById("pricingCatTabs");
  cont.innerHTML = CATEGORY_ORDER.map(function(c){
    return '<button class="pr-cat-tab'+(c===activeCategory?' active':'')+'" data-cat="'+c+'">'+c+'</button>';
  }).join("");
  cont.querySelectorAll(".pr-cat-tab").forEach(function(btn){
    btn.addEventListener("click", function(){
      activeCategory = btn.getAttribute("data-cat");
      renderCatTabs(); renderMobileCards(); renderAccordions();
    });
  });
}
function renderAccordions(){
  var cont = document.getElementById("pricingAccordions");
  var others = CATEGORY_ORDER.filter(function(c){ return c!==activeCategory; });
  cont.innerHTML = others.map(function(c){
    return '<div class="pr-accordion-row" data-cat="'+c+'"><span><span class="name">'+c+'</span><span class="count">('+PRICING[c].length+' products listed)</span></span>' +
      '<svg viewBox="0 0 12 12" width="12" height="12" fill="none"><path d="M2 4l4 4 4-4" stroke="#4b5563" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
  }).join("");
  cont.querySelectorAll(".pr-accordion-row").forEach(function(row){
    row.addEventListener("click", function(){
      activeCategory = row.getAttribute("data-cat");
      renderCatTabs(); renderMobileCards(); renderAccordions();
      document.getElementById("pricingCatCards").scrollIntoView({behavior:"smooth", block:"nearest"});
    });
  });
}

/* ============================= RENDER: TCO BARS (shared by ROI + dashboard) ============================= */
function renderTcoBars(targetId, dark){
  var max = Math.max.apply(null, TCO.map(function(t){return t.value;}));
  var html = TCO.map(function(t){
    var pct = (t.value/max*100).toFixed(1);
    return '<div class="tco-bar-row'+(t.oracle?' oracle':'')+'">' +
      '<div class="tco-name">'+(dark? t.short : t.name)+'</div>' +
      '<div class="tco-track"><div class="tco-fill" style="width:0%" data-w="'+pct+'"></div></div>' +
      '<div class="tco-amt">'+fmt(t.value)+'</div>' +
    '</div>';
  }).join("");
  var el = document.getElementById(targetId);
  el.innerHTML = html;
  requestAnimationFrame(function(){
    setTimeout(function(){
      el.querySelectorAll(".tco-fill").forEach(function(f){ f.style.width = f.getAttribute("data-w")+"%"; });
    }, 80);
  });
}

/* ============================= RENDER: ROI benefit cards ============================= */
function renderBenefits(){
  var html = BENEFITS.map(function(b){
    return '<div class="card benefit-card">' +
      '<div class="benefit-icon-wrap">'+iconSVG(b.icon)+'</div>' +
      '<div><h4>'+b.title+'</h4><p class="b-sub">'+b.sub+'</p></div>' +
      '<p class="b-desc">'+b.desc+'</p>' +
    '</div>';
  }).join("");
  document.getElementById("roiBenefitGrid").innerHTML = html;
}

/* ============================= RENDER: dashboard compare bars ============================= */
function renderCompareBars(){
  var html = COMPARE_BARS.map(function(item){
    return '<div class="ccw-item">' +
      '<span class="ccw-label">'+item.label+'</span>' +
      '<div class="ccw-bar-row"><div class="bar" style="width:'+item.oraclePct+'%"></div><b>'+fmt(item.oracle)+'</b><span class="tag">(OCI)</span></div>' +
      '<div class="ccw-bar-row comp"><div class="bar" style="width:'+item.othersPct+'%"></div><span>'+fmt(item.others)+'</span></div>' +
    '</div>';
  }).join("");
  document.getElementById("dashCompareBars").innerHTML = html;
}

/* ============================= INIT RENDER ============================= */
renderDesktopPricing();
renderCatTabs(); renderMobileCards(); renderAccordions();
renderTcoBars("roiTcoBars", false);
renderTcoBars("dashTcoBars", true);
renderBenefits();
renderCompareBars();

/* ============================= SEGMENT DROPDOWN (demo) ============================= */
var SEGMENTS = ["Tourism","Aviation Cargo","Retail Concessions","Airport Operations"];
var segIdx = 0;
document.getElementById("segmentDropdown").addEventListener("click", function(){
  segIdx = (segIdx+1) % SEGMENTS.length;
  document.getElementById("segmentValue").textContent = SEGMENTS[segIdx];
});

/* ============================= CONFIGURE FORM ============================= */
var cfgForm = document.getElementById("configureForm");
if(cfgForm){
  cfgForm.addEventListener("submit", function(e){
    e.preventDefault();
    var btn = cfgForm.querySelector(".calc-btn");
    var original = btn.textContent;
    btn.textContent = "Calculating\u2026";
    btn.disabled = true;
    setTimeout(function(){
      btn.textContent = "Updated \u2713";
      setTimeout(function(){ btn.textContent = original; btn.disabled = false; }, 1200);
    }, 700);
  });
}

/* ============================= PAGE NAVIGATION + FLIGHT TRANSITION ============================= */
var pages = Array.prototype.slice.call(document.querySelectorAll(".page"));
var tabs = Array.prototype.slice.call(document.querySelectorAll(".nav-tab"));
var transitionEl = document.getElementById("flight-transition");
var navigating = false;

function activatePage(key){
  var current = document.querySelector(".page.active");
  var next = document.getElementById("page-"+key);
  if(!next || next === current) return;
  if(navigating) return;
  navigating = true;

  transitionEl.classList.remove("run");
  void transitionEl.offsetWidth; /* restart animation */
  transitionEl.classList.add("run");

  setTimeout(function(){
    if(current){ current.classList.remove("active","entering"); }
    next.classList.add("active");
    void next.offsetWidth;
    next.classList.add("entering");
    window.scrollTo({top:0, behavior:"smooth"});
    tabs.forEach(function(t){
      var isActive = t.getAttribute("data-page") === key;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }, 420);

  setTimeout(function(){
    transitionEl.classList.remove("run");
    navigating = false;
  }, 950);
}

tabs.forEach(function(tab){
  tab.addEventListener("click", function(){
    activatePage(tab.getAttribute("data-page"));
  });
});
document.querySelectorAll("[data-goto]").forEach(function(btn){
  btn.addEventListener("click", function(){
    activatePage(btn.getAttribute("data-goto"));
  });
});

/* ============================= PRELOADER ============================= */
var captions = ["Requesting clearance","Taxiing to runway","Cleared for takeoff","Climbing to cruise altitude","Provisioning cloud infrastructure","Ready for arrival"];
var capIdx = 0;
var captionEl = document.getElementById("preloaderCaption");
var fillEl = document.getElementById("preloaderFill");
var capTimer = setInterval(function(){
  capIdx = (capIdx+1) % captions.length;
  captionEl.textContent = captions[capIdx];
}, 480);

var progress = 0;
var progTimer = setInterval(function(){
  progress = Math.min(96, progress + (Math.random()*14+6));
  fillEl.style.width = progress + "%";
}, 260);

function finishPreloader(){
  clearInterval(capTimer);
  clearInterval(progTimer);
  fillEl.style.width = "100%";
  captionEl.textContent = "Ready for arrival";
  setTimeout(function(){
    document.getElementById("preloader").classList.add("hide");
  }, 420);
}
var minTimeReached = false, docReady = false;
setTimeout(function(){ minTimeReached = true; if(docReady) finishPreloader(); }, 1900);
if(document.readyState === "complete"){
  docReady = true;
  if(minTimeReached) finishPreloader();
} else {
  window.addEventListener("load", function(){
    docReady = true;
    if(minTimeReached) finishPreloader();
    else setTimeout(function(){ if(!document.getElementById("preloader").classList.contains("hide")) finishPreloader(); }, 1900);
  });
}
/* safety net */
setTimeout(finishPreloader, 4000);

})();
