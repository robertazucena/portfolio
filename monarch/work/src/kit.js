/* Monarch Labs — product screen kit. Recreated client interfaces with sample data, rendered by screens.html at
   their native size and captured to WebP by capture.py. Each screen is a function returning HTML; SCREENS maps a
   file name to its function and size. Held to the portfolio's screen standard: each product has its own world
   (type, colour, a brand-derived detail), one headline, one hero figure or chart, and data set in mono. */

var ICP={wind:'<path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h16a3 3 0 1 1-3 3"/><path d="M3 16h7"/>',
  chevd:'<path d="m6 9 6 6 6-6"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',check:'<path d="M20 6 9 17l-5-5"/>'};
function IC(n,s,c,sw){return '<svg class="ic" width="'+(s||16)+'" height="'+(s||16)+'" viewBox="0 0 24 24" fill="none" stroke="'+(c||"currentColor")+'" stroke-width="'+(sw||2)+'" stroke-linecap="round" stroke-linejoin="round">'+(ICP[n]||"")+'</svg>'}
/* ============================== ASTER ==============================
   Held to the portfolio's screen standard, in Aster's own world: an answer set like an edited document. The
   question is the headline (Newsreader), the answer reads as prose with numbered citations, and the sources sit
   in the margin as sidenotes, the way footnotes sit beside a text. The mark is an asterisk (aster: star; the
   asterisk is the footnote sign), and the same asterisk marks the current page in the nav.
   Ink #16151b, paper #f6f5f1, violet #5a46e0 for citations only. Type: Newsreader / Inter Tight / JetBrains Mono. */
var A_VI="#5a46e0";
function aStar(s,c){return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5v15M3.5 6.25l13 7.5M3.5 13.75l13-7.5" stroke="'+(c||A_VI)+'" stroke-width="2.6" stroke-linecap="round"/></svg>'}
function aNav(on){
  return '<nav class="as-nav"><span class="as-brand">aster'+aStar(13)+'</span>'+
    '<span class="as-path">Operations<i>/</i>Billing &amp; refunds</span>'+
    '<span class="as-links">'+["Ask","Library","Reviews","Owners"].map(function(t,i){return '<span'+(i===on?' class="on"':'')+'>'+(i===on?aStar(9):'')+t+(t==="Reviews"?'<sup>3</sup>':'')+'</span>'}).join("")+'</span>'+
    '<span class="as-find">Ask anything<kbd>⌘K</kbd></span><span class="as-me">JR</span></nav>';
}
/* sources: n, type, title, place, quote (with the cited passage), owner, days since review */
var A_SRC=[[1,"PDF","Refund policy, Enterprise","Policy Hub / Legal / Billing","Enterprise annual plans may be refunded <mark>pro rata after 30 days</mark> where a service failure breaches the SLA.","Legal Ops",17],
           [2,"XLS","Finance approval matrix","Finance Drive / Controls","Refunds or credits <mark>above €25,000</mark> require Finance lead approval before processing.","M. Schneider",26],
           [3,"WIKI","Service credits FAQ","Support Wiki / Billing","For convenience requests, offer <mark>account credit</mark>; refunds do not apply.","Support team",41]];
function aCite(n,on){return '<a class="as-c'+(on?" on":"")+'">'+n+'</a>'}
function uiAster(){
  /* freshness: each source placed on the 90-day review window */
  var fresh=A_SRC.map(function(s){return '<span class="as-pin" style="left:'+(s[6]/90*100).toFixed(1)+'%"><b>'+s[0]+'</b><em>'+s[6]+' d</em></span>'}).join("");
  return '<div class="ui x as" style="width:1200px;height:750px">'+aNav(0)+
    '<main class="as-main">'+
      '<p class="as-meta"><span class="as-av" style="background:#e8a33d">JR</span><b>Jo Reiter</b> asked in Operations · 2 min ago</p>'+
      '<h1>Can we refund an enterprise annual plan after the 30-day window?</h1>'+
      '<article class="as-ans">'+
        '<div class="as-ah"><span class="as-who">'+aStar(15)+'Aster</span><span class="as-state ok">Verified</span><span class="as-role">Answering as Operations · EU</span><span class="as-mono">3 sources · 2.1 s</span></div>'+
        '<p class="as-prose"><b>Yes, with approval.</b> Enterprise annual plans can be refunded pro rata after 30 days when a service failure breaches the SLA'+aCite(1)+'. Refunds above €25,000 need the Finance lead’s approval first'+aCite(2,1)+'. If the customer is asking for convenience rather than a failure, offer account credit instead'+aCite(3)+'.</p>'+
        '<div class="as-fresh"><div class="as-fh"><span>Source freshness</span><span class="as-mono">Review window 90 d</span></div>'+
          '<div class="as-track"><i class="as-due"></i>'+fresh+'</div><div class="as-ticks"><span>Today</span><span>45 d</span><span>90 d</span></div></div>'+
        '<div class="as-act"><span class="as-btn">Insert into reply</span><span class="as-btn gh">Copy</span><span class="as-btn gh">Ask an expert</span><span class="as-by">Approved by M. Schneider, Legal Ops</span></div>'+
      '</article>'+
      '<p class="as-next"><span>Next</span>'+["Draft the refund email","How is pro rata calculated?","Similar approved cases"].map(function(t){return '<span>'+aStar(10)+t+'</span>'}).join("")+'</p>'+
    '</main>'+
    '<aside class="as-notes"><p class="as-lbl">Sources <span class="as-mono">3</span></p>'+
      A_SRC.map(function(s){return '<div class="as-note'+(s[0]===2?" on":"")+'"><span class="as-n">'+s[0]+'</span><div><p class="as-nt">'+s[2]+'</p><p class="as-np"><span>'+s[1]+'</span>'+s[3]+'</p><p class="as-q">'+s[4]+'</p><p class="as-own">'+s[5]+' · <span class="as-mono">reviewed '+s[6]+' d ago</span></p></div></div>'}).join("")+
    '</aside></div>';
}

/* 2 · Reviews: how every answer is labelled this week, and the questions waiting for a person */
function uiAsterConf(){
  var R=[["ok","Verified",1284,"Every claim cited; every source reviewed by its owner within 90 days.",[1,1,1]],
         ["mid","Likely",212,"Cited, but one source is due for review. Shown with a prompt to check it.",[1,1,0]],
         ["low","Needs an expert",37,"Sources disagree or are missing. Routed to the owner.",[1,2,-1]]];
  var tot=1533;
  var Q=[["Does the EU data addendum cover sub-processors in Singapore?","Legal Ops","Conflicting",["d1","d2"]],
         ["Can a reseller extend a trial past 60 days?","Partner team","Missing",["d1","d-1"]],
         ["Which SLA applies to the legacy Standard plan?","Support team","Conflicting",["d2","d1"]],
         ["Is the 2025 partner discount still valid in Japan?","Partner team","Due for review",["d0","d1"]]];
  return '<div class="ui x as" style="width:1200px;height:750px">'+aNav(2)+
    '<main class="as-main"><p class="as-meta">Reviews · Billing &amp; refunds · this week</p>'+
      '<h1>Three states. No scores.</h1><p class="as-lede">A number like 87% invites people to guess what it means. Aster says what it knows in plain words, and shows why.</p>'+
      '<div class="as-split"><p class="as-lbl">Answers this week <span class="as-mono">'+tot.toLocaleString("en")+'</span></p><div class="as-bar">'+R.map(function(r){return '<i class="'+r[0]+'" style="flex:'+r[2]+'"></i>'}).join("")+'</div></div>'+
      '<div class="as-states">'+R.map(function(r){return '<div><span class="as-state '+r[0]+'">'+r[1]+'</span><p class="as-big">'+r[2].toLocaleString("en")+'</p><p class="as-rule">'+r[3]+'</p><span class="as-dots">'+r[4].map(function(d){return '<i class="d'+d+'"></i>'}).join("")+'</span></div>'}).join("")+'</div>'+
      '<div class="as-facts">'+[["3 h 40 min","Median time to an expert’s answer"],["96","Answers approved and reused"],["9","Answers retired after review"]].map(function(f){return '<div><p class="as-fv">'+f[0]+'</p><p>'+f[1]+'</p></div>'}).join("")+'</div>'+
    '</main>'+
    '<aside class="as-notes"><p class="as-lbl">Waiting for an expert <span class="as-mono">37</span></p>'+
      Q.map(function(q,i){return '<div class="as-note'+(i===0?" on":"")+'"><span class="as-dots as-qd">'+q[3].map(function(d){return '<i class="'+d+'"></i>'}).join("")+'</span><div><p class="as-q">'+q[0]+'</p><p class="as-own">'+q[2]+' · routed to <b>'+q[1]+'</b></p>'+(i===0?'<span class="as-btn sm">Review now</span>':'')+'</div></div>'}).join("")+
      '<p class="as-foot"><span class="as-dots"><i class="d1"></i></span>Fresh <span class="as-dots"><i class="d0"></i></span>Due <span class="as-dots"><i class="d2"></i></span>Conflicting <span class="as-dots"><i class="d-1"></i></span>Missing</p>'+
    '</aside></div>';
}

/* 3 · Library: a citation opened at its source, with the person who stands behind it */
function uiAsterCite(){
  return '<div class="ui x as as-lib" style="width:1200px;height:750px">'+aNav(1)+
    '<div class="as-page"><p class="as-pk"><span>XLS</span>Finance Drive / Controls / Finance approval matrix<em>§ 4.2</em></p>'+
      '<h3>4.2 Refunds and credits</h3>'+
      '<p>Refunds are processed by Billing Operations once the request is logged against the customer account and the reason is recorded in the ticket.</p>'+
      '<p><mark>Refunds or credits above €25,000 require Finance lead approval before processing.</mark> Below that amount, the team lead for the account may approve the refund directly.</p>'+
      '<p>Approvals are recorded in the matrix with the approver, the date and the ticket reference, and are kept for seven years.</p>'+
      '<h3>4.3 Service credits</h3>'+
      '<p>Service credits are applied to the next invoice and never paid out. They may be combined with a pro rata refund only where the SLA was breached in two consecutive months.</p></div>'+
    '<aside class="as-notes"><p class="as-lbl"><span class="as-n on">2</span>Cited in Aster’s answer</p>'+
      '<p class="as-pq">“Refunds above €25,000 need the Finance lead’s approval first.”</p>'+
      '<dl class="as-dl"><div><dt>Owner</dt><dd><span class="as-av" style="background:#2f7a52">MS</span>M. Schneider, Finance</dd></div><div><dt>Reviewed</dt><dd class="as-mono">03 Sep 2026</dd></div><div><dt>Next review</dt><dd class="as-mono">02 Dec 2026</dd></div></dl>'+
      '<p class="as-lbl" style="margin-top:22px">Also cited in <span class="as-mono">14</span> answers this month</p>'+
      ['Can Support approve a €30,000 credit?','Who signs off a refund for Acme GmbH?'].map(function(q){return '<p class="as-also">'+aStar(10)+q+'</p>'}).join("")+
      '<span class="as-btn">Open in Finance Drive</span></aside></div>';
}

/* phone · the same answer, in a pocket */
function uiAsterM(){
  return '<div class="ui x as as-m" style="width:390px;height:844px">'+
    '<div class="as-mtop"><span class="as-brand">aster'+aStar(11)+'</span><span class="as-me">JR</span></div>'+
    '<p class="as-meta">Asked in Operations · 2 min ago</p>'+
    '<h1>Can we refund an enterprise annual plan after 30 days?</h1>'+
    '<article class="as-ans"><div class="as-ah"><span class="as-who">'+aStar(13)+'Aster</span><span class="as-state ok">Verified</span></div>'+
      '<p class="as-prose"><b>Yes, with approval.</b> Plans can be refunded pro rata after 30 days when a service failure breaches the SLA'+aCite(1)+'. Refunds above €25,000 need the Finance lead’s approval first'+aCite(2,1)+'.</p></article>'+
    '<p class="as-lbl as-ml">Sources <span class="as-mono">3</span></p>'+
    '<div class="as-mrow">'+A_SRC.slice(0,2).map(function(s){return '<div class="as-mnote'+(s[0]===2?" on":"")+'"><span class="as-n">'+s[0]+'</span><p class="as-nt">'+s[2]+'</p><p class="as-own">'+s[5]+' · <span class="as-mono">'+s[6]+' d</span></p></div>'}).join("")+'</div>'+
    '<p class="as-lbl as-ml">Next</p>'+["Draft the refund email","How is pro rata calculated?"].map(function(t){return '<p class="as-also">'+aStar(10)+t+'</p>'}).join("")+
    '<div class="as-mask">Ask a follow-up<span class="as-send">'+aStar(12,"#fff")+'</span></div></div>';
}

/* ============================== KYMA ==============================
   Held to the portfolio's screen standard (Steady, Aurora): a real photograph with the nav set into it, one big
   headline, a white sheet with one hero number, one chart that carries the idea, and data set in mono.
   Brand: ink #121417, Aegean sand #f4f1ec, orange #e8590c used only for meltemi and the mark. Type: Geist / Geist Mono. */
var L_OR="#e8590c";
/* wind risk from the Beaufort force: calm (≤3), breezy (4–5), meltemi (≥6) */
function kRisk(bf){return bf>=6?2:bf>=4?1:0}
var K_RISK=["Calm","Breezy","Meltemi"];
/* the plan: day, date, island, leg, mode, time, Beaufort, temperature */
var K_DAYS=[["Mon","11","Naxos","Athens → Naxos","Flight","07:40",3,"29°"],
            ["Tue","12","Paros","Naxos → Paros","Ferry","09:30",5,"28°"],
            ["Wed","13","Antiparos","Sea caves by boat","Boat","10:00",7,"27°"],
            ["Thu","14","Milos","Paros → Milos","Ferry","07:15",6,"27°"],
            ["Fri","15","Athens","Milos → Athens","Flight","15:10",4,"29°"]];
var K_LOGO='<svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><rect width="26" height="26" rx="8" fill="#121417"/><path d="M5 15.5c2 0 2-2.6 4-2.6s2 2.6 4 2.6 2-2.6 4-2.6 2 2.6 4 2.6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="17.5" cy="8.5" r="2.2" fill="'+L_OR+'"/></svg>';
var K_PHOTO="img/kleftiko.jpg";
/* the nav is part of the photo, not a bar on top of it: wordmark and trip on the left, a live wind reading,
   plain links with a wave under the current one (kyma is Greek for wave) */
var K_WAVE='<svg class="ky-wave" width="34" height="7" viewBox="0 0 34 7" aria-hidden="true"><path d="M1 4c2.6 0 2.6-2.6 5.3-2.6S8.9 4 11.6 4s2.6-2.6 5.3-2.6S19.5 4 22.2 4s2.6-2.6 5.3-2.6S30.1 4 33 4" fill="none" stroke="'+L_OR+'" stroke-width="2" stroke-linecap="round"/></svg>';
function kNav(on){
  return '<nav class="ky-nav"><span class="ky-brand"><svg width="30" height="18" viewBox="0 0 30 18" aria-hidden="true"><path d="M2 11c3 0 3-4 6.5-4S11.5 11 15 11s3-4 6.5-4 3 4 6.5 4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="22" cy="2.6" r="2.4" fill="'+L_OR+'"/></svg>kyma</span>'+
    '<span class="ky-trip"><b>Cyclades</b>11–15 Aug'+IC("chevd",14,"currentColor",2)+'</span>'+
    '<span class="ky-links">'+["Plan","Trips","Ferries","Alerts"].map(function(t,i){return '<span'+(i===on?' class="on"':'')+'>'+t+(t==="Alerts"?'<sup>2</sup>':'')+(i===on?K_WAVE:'')+'</span>'}).join("")+'</span>'+
    '<span class="ky-now"><i></i>Naxos now <b>29° · Bf 3</b></span><span class="ky-me">AK</span></nav>';
}
/* a page: the photo, the nav set into it, a hero, and the white sheet */
function kPage(on,photo,pos,hero,sheet,cls){
  return '<div class="ui x ky'+(cls?" "+cls:"")+'" style="width:1200px;height:750px">'+
    '<div class="ky-photo" style="background-image:url('+photo+');background-position:'+pos+'"></div>'+kNav(on)+hero+'<section class="ky-sheet">'+sheet+'</section></div>';
}
function kRoute(c){return '<div class="ky-route" aria-label="Route">'+c.map(function(x,i){return (i?'<i></i>':'')+'<span>'+x+'</span>'}).join("")+'</div>'}
/* bars: [label, sub, value, risk, value text]; max is the top of the scale, hold the dashed line (or null) */
function kBars(items,max,hold,holdTxt){
  return '<div class="ky-chart" style="grid-template-columns:repeat('+items.length+',1fr)">'+(hold?'<div class="ky-hold'+(holdTxt?'':' bare')+'" style="top:calc(var(--th) * '+(1-hold/max).toFixed(3)+')"><span>'+holdTxt+'</span></div>':'')+
    items.map(function(d){return '<div class="ky-bar r'+d[3]+(d[5]?" you":"")+(d[2]/max<.2?" lo":"")+'"><div class="tr"><i style="height:'+(d[2]/max*100)+'%"><em>'+d[4]+'</em></i></div><b>'+d[0]+'</b><span>'+d[1]+'</span></div>'}).join("")+'</div>';
}
function kKey(extra){return '<p class="ky-key">'+K_RISK.map(function(k,i){return '<span class="r'+i+'"><i></i>'+k+'</span>'}).join("")+(extra||"")+'</p>'}

/* 1 · the plan */
function uiKyma(){
  return kPage(0,K_PHOTO,"50% 42%",
    '<header class="ky-hero"><p class="ky-eye"><b>Your plan</b> · Mon 11 – Fri 15 August · 2 adults · relaxed pace</p>'+
      '<h1>Five days in the Cyclades,<br>wind and all.</h1><p class="ky-sub">August is meltemi season. Every crossing has a plan B, held at no extra cost.</p></header>'+
    kRoute(["ATH","JNX","PAS","MLO","ATH"]),
    '<div class="ky-c1"><p class="ky-hi">Kalimera, Anna.</p><h2>Two windy days.<br>Both covered.</h2>'+
      '<p class="ky-lbl">Trip total, 2 adults</p><p class="ky-num">€1,700</p><p class="ky-ok">+ €0 for plan B seats</p>'+
      '<table class="ky-tbl"><tr><th>Item</th><th>Cost</th></tr>'+[["Flights","€320"],["Ferries & boats","€240"],["Stays, 4 nights","€980"]].map(function(c){return '<tr><td>'+c[0]+'</td><td>'+c[1]+'</td></tr>'}).join("")+'</table></div>'+
    '<div class="ky-c2"><div class="ky-c2h"><div><p class="ky-lbl">Wind along your route</p><p class="ky-t">Beaufort forecast, 7 AM</p></div><span class="ky-seg"><span class="on">Wind</span><span>Sea</span><span>Temp</span></span></div>'+
      kBars(K_DAYS.map(function(d){return [d[0]+" "+d[1],d[2],d[6],kRisk(d[6]),"Bf "+d[6]]}),8,6,"Bf 6 · ferries may be held")+kKey()+'</div>'+
    '<div class="ky-c3"><p class="ky-lbl">Plan B ready</p><p class="ky-t">Thu 14 · Paros → Milos</p>'+
      '<div class="ky-leg off"><span>07:15</span><b>SeaJets ferry</b><em>Bf 6 forecast</em></div>'+
      '<div class="ky-leg"><span>10:40</span><b>SKY 316 to Athens</b><em>Seat held</em></div>'+
      '<div class="ky-leg"><span>13:50</span><b>OA 7322 to Milos</b><em>Seat held</em></div>'+
      '<p class="ky-note">You still see Sarakiniko at sunset. Kyma decides at 6 PM the night before.</p>'+
      '<span class="ky-btn">Review plan B</span></div>');
}

/* 2 · the morning the ferry is cancelled: the day rebuilt, one decision left */
function uiKymaAlert(){
  var hours=[["06","",8],["08","",8],["10","",7],["12","",7],["14","",6],["16","",5],["18","",4]].map(function(h){return [h[0],h[1],h[2],kRisk(h[2]),String(h[2])]});
  return kPage(3,"img/harbour.jpg","50% 62%",
    '<header class="ky-hero"><p class="ky-eye"><b>Alert</b> · Thu 14 August · 06:10</p>'+
      '<h1>Thursday’s ferry is cancelled.<br>Plan B is already live.</h1><p class="ky-sub">Paros port is closed to fast ferries until 4 PM. Your seats via Athens are confirmed.</p></header>'+
    kRoute(["PAS","ATH","MLO"]),
    '<div class="ky-c1"><p class="ky-lbl">Wind at Paros port, now</p><p class="ky-num">Bf 8</p><p class="ky-warn">Gale · fast ferries held</p>'+
      '<p class="ky-lbl" style="margin-top:22px">Today, by hour</p>'+kBars(hours,8,6,"")+'</div>'+
    '<div class="ky-c2"><div class="ky-c2h"><div><p class="ky-lbl">Your Thursday, rebuilt</p><p class="ky-t">Paros → Athens → Milos</p></div><span class="ky-tag r2">'+IC("wind",12,"currentColor",2.2)+'Ferry cancelled</span></div>'+
      '<div class="ky-day">'+
        '<div class="ky-leg off"><span>07:15</span><b>SeaJets ferry to Milos</b><em>Refunded</em></div>'+
        '<div class="ky-leg"><span>10:40</span><b>SKY 316 · Paros → Athens</b><em>Seat 14A</em></div>'+
        '<div class="ky-leg"><span>13:50</span><b>OA 7322 · Athens → Milos</b><em>Seat 14B</em></div>'+
        '<div class="ky-leg"><span>14:35</span><b>Arrive Milos · transfer booked</b><em>Kept</em></div>'+
        '<div class="ky-leg"><span>19:40</span><b>Sarakiniko at sunset</b><em>Kept</em></div></div></div>'+
    '<div class="ky-c3"><p class="ky-lbl">One decision, by 6 PM</p><p class="ky-t">How do you want to travel?</p>'+
      '<div class="ky-opt on"><b>Fly via Athens</b><span>Arrive 14:35 · nothing lost</span><em>€0</em></div>'+
      '<div class="ky-opt"><b>Wait for the 4 PM ferry</b><span>40% chance it sails · arrive 18:15</span><em>€0</em></div>'+
      '<span class="ky-btn">Confirm plan B</span></div>');
}

/* 3 · before booking: which week the wind agrees with */
function uiKymaDates(){
  var R=[0,0,0,0,1,0,0,1,2,1, 0,1,2,2,1,1,0,1,2,2, 2,1,0,0,0,1,1,2,2,1, 0], cells="";
  for(var i=0;i<4;i++)cells+='<span></span>';
  for(var d=1;d<=31;d++){cells+='<span class="r'+R[d-1]+(d>=11&&d<=15?" in":"")+(d>=4&&d<=8?" alt":"")+'">'+d+'</span>'}
  var weeks=[["1–3","Aug",25,1,"25%"],["4–8","Aug",8,0,"8%"],["11–15","Your dates",62,2,"62%",1],["18–22","Aug",74,2,"74%"],["25–29","Aug",48,1,"48%"]];
  return kPage(0,"img/sarakiniko.jpg","50% 55%",
    '<header class="ky-hero"><p class="ky-eye"><b>New trip</b> · Cyclades · August · 2 adults</p>'+
      '<h1>Pick a week the wind<br>agrees with.</h1><p class="ky-sub">Kyma reads ten summers of wind and this year’s forecast before you book.</p></header>',
    '<div class="ky-c1 ky-cal"><p class="ky-lbl">August · wind outlook</p><p class="ky-t">Your dates are outlined</p>'+
      '<div class="ky-grid ky-dow">'+["M","T","W","T","F","S","S"].map(function(x){return '<span>'+x+'</span>'}).join("")+'</div>'+
      '<div class="ky-grid">'+cells+'</div>'+kKey('<span class="alt"><i></i>Calmer week</span>')+'</div>'+
    '<div class="ky-c2"><div class="ky-c2h"><div><p class="ky-lbl">Chance of a meltemi day</p><p class="ky-t">By week, ten-year average</p></div></div>'+
      kBars(weeks,100,null)+'</div>'+
    '<div class="ky-c3"><p class="ky-lbl">Compare</p><p class="ky-t">Your dates or the calmer week</p>'+
      '<table class="ky-tbl ky-cmp"><tr><th></th><th>11–15</th><th>4–8</th></tr>'+[["Windy days","2","0"],["Plan Bs needed","2","0"],["Ferries, 2 adults","€240","€200"]].map(function(c){return '<tr><td>'+c[0]+'</td><td>'+c[1]+'</td><td>'+c[2]+'</td></tr>'}).join("")+'</table>'+
      '<span class="ky-btn">Move to 4–8 Aug</span><span class="ky-btn gh">Keep my dates, with plan Bs</span></div>');
}

/* phone · the plan, one-handed */
function uiKymaM(){
  return '<div class="ui x ky ky-m" style="width:390px;height:844px">'+
    '<div class="ky-photo" style="background-image:url('+K_PHOTO+');background-position:40% 40%"></div>'+
    '<div class="ky-mtop"><span class="ky-brand"><svg width="26" height="16" viewBox="0 0 30 18" aria-hidden="true"><path d="M2 11c3 0 3-4 6.5-4S11.5 11 15 11s3-4 6.5-4 3 4 6.5 4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="22" cy="2.6" r="2.4" fill="'+L_OR+'"/></svg>kyma</span><span class="ky-me">AK</span></div>'+
    '<header class="ky-hero"><p class="ky-eye"><b>Your plan</b> · 11–15 Aug</p><h1>Five days in the Cyclades, wind and all.</h1></header>'+
    '<section class="ky-sheet"><div class="ky-c2h"><div><p class="ky-lbl">Wind along your route</p><p class="ky-t">Two windy days, both covered</p></div></div>'+
      kBars(K_DAYS.map(function(d){return [d[0],d[2],d[6],kRisk(d[6]),String(d[6])]}),8,6,"Bf 6")+
      '<div class="ky-mcard"><p class="ky-lbl">Plan B ready · Thu 14</p>'+
        '<div class="ky-leg off"><span>07:15</span><b>Ferry to Milos</b><em>Bf 6</em></div>'+
        '<div class="ky-leg"><span>10:40</span><b>Fly via Athens</b><em>Held</em></div></div>'+
    '</section>'+
    '<nav class="ky-mnav">'+["Plan","Trips","Ferries","Alerts"].map(function(t,i){return '<span'+(i===0?' class="on"':'')+'>'+t+(i===0?K_WAVE:'')+'</span>'}).join("")+'</nav></div>';
}

/* ============================== MORROW ==============================
   Copenhagen maker of low-carbon concrete. Held to the portfolio standard in Morrow's own world: the specifier's
   reference sheet. Concrete paper, ink, one moss green for Morrow's own figures; the comparison material in warm grey.
   The mark is a square with its lower half filled (a horizon: the morning after), and the same filled square marks
   the current page in the nav. The recurring detail is the carbon figure, always with its EPD source beside it.
   Type: Instrument Sans / IBM Plex Mono. */
var M_MO="#2f5d46";
function mMark(s){return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 16 16" aria-hidden="true"><rect x="1" y="1" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"/><rect x="1" y="8" width="14" height="7" fill="'+M_MO+'"/></svg>'}
function mNav(on){
  return '<nav class="mo-nav"><span class="mo-brand">'+mMark(17)+'morrow</span>'+
    '<span class="mo-links">'+["Materials","Applications","Proof","Guidance"].map(function(t,i){return '<span'+(i===on?' class="on"':'')+'>'+t+'</span>'}).join("")+'</span>'+
    '<span class="mo-find">'+IC("search",15)+'Search a material, standard or use</span><span class="mo-cta">Specify</span></nav>';
}
/* embodied carbon, A1–A3, kg CO2e per m3 (sample EPD figures) */
var M_CO2=[["CEM I reference, C30/37",320,0],["Morrow M30, C30/37",186,1]];
function mCarbon(w){
  return '<div class="mo-co2">'+M_CO2.map(function(r){return '<div class="mo-co2r'+(r[2]?' me':'')+'"><span>'+r[0]+'</span><i style="width:'+(r[1]/350*w).toFixed(0)+'px"></i><b>'+r[1]+'</b></div>'}).join("")+
    '<p class="mo-delta"><b>−42%</b> kg CO₂e per m³, A1–A3</p></div>';
}
var M_NEXT=[["Will it reach strength in time to strike the formwork?","Proof","Strength gain"],["Does it meet EN 206 for exposure class XC3?","Standard","EN 206"],["How does it cure below 5 °C?","Guidance","Cold weather"],["Where has it been poured?","Case","Nordhavn school"]];
function mNext(n){return '<ol class="mo-next">'+M_NEXT.slice(0,n).map(function(q,i){return '<li><span>0'+(i+1)+'</span><b>'+q[0]+'</b><em>'+q[1]+' · '+q[2]+'</em></li>'}).join("")+'</ol>'}
function uiMorrow(){
  return '<div class="ui x mo" style="width:1200px;height:750px">'+mNav(1)+
    '<div class="mo-v1"><div class="mo-ph" style="background-image:url(img/morrow.jpg)">'+
      '<header class="mo-hero"><p class="mo-eye">Applications<i>/</i>Structural slabs</p><h1>Structural slabs with 42% less embodied carbon.</h1>'+
      '<p class="mo-ents"><span><em>Material</em>M30</span><span><em>Standard</em>EN 206</span><span><em>Use</em>Flat slabs</span></p></header>'+
      '<p class="mo-cred">Morrow M30 · C30/37 · XC1–XC3</p></div>'+
    '<div class="mo-side">'+
      '<section><p class="mo-lbl">Embodied carbon, per m³</p>'+mCarbon(300)+'<p class="mo-src">Source: EPD NEPD-4471-EN, third-party verified, EN 15804+A2</p></section>'+
      '<section><p class="mo-lbl">Your next questions</p>'+mNext(4)+'</section>'+
      '<footer class="mo-by"><span class="mo-av">KH</span><p><b>Reviewed by Katrine Holm</b>Structural engineer · 12 Oct 2026</p><span class="mo-btn">Copy spec clause</span></footer>'+
    '</div></div></div>';
}
/* strength gain, EN 12390-3, mean of 36 cylinders (sample lab data) */
var M_STR=[[3,12],[7,21],[14,28],[28,38],[56,43]];
function uiMorrowProof(){
  var W=680,H=380,L=44,B=30,T=16,x=function(d){return L+d/56*(W-L-16)},y=function(v){return T+(1-v/50)*(H-T-B)};
  var grid=[0,10,20,30,40,50].map(function(v){return '<line x1="'+L+'" x2="'+(W-16)+'" y1="'+y(v)+'" y2="'+y(v)+'" class="g"/><text x="'+(L-10)+'" y="'+(y(v)+4)+'" text-anchor="end">'+v+'</text>'}).join("");
  var xt=[0,7,14,28,56].map(function(d){return '<text x="'+x(d)+'" y="'+(H-8)+'" text-anchor="middle">'+d+'</text>'}).join("");
  var pts=[[0,0]].concat(M_STR),path=pts.map(function(p,i){return (i?"L":"M")+x(p[0]).toFixed(1)+" "+y(p[1]).toFixed(1)}).join(" ");
  var dots=M_STR.map(function(p){return '<circle cx="'+x(p[0])+'" cy="'+y(p[1])+'" r="4.5"/>'}).join("");
  var chart='<svg class="mo-chart" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" aria-label="Strength gain">'+grid+xt+
    '<line x1="'+L+'" x2="'+(W-16)+'" y1="'+y(30)+'" y2="'+y(30)+'" class="req"/><text x="'+(W-16)+'" y="'+(y(30)-8)+'" text-anchor="end" class="ink">Design strength, 30 MPa</text>'+
    '<path d="'+path+'" class="ln"/>'+dots+
    '<line x1="'+x(17)+'" x2="'+x(17)+'" y1="'+y(30)+'" y2="'+(H-B)+'" class="mk"/><circle cx="'+x(17)+'" cy="'+y(30)+'" r="5.5" class="hit"/>'+
    '<text x="'+(x(17)+10)+'" y="'+(y(30)+22)+'" class="ink b">Day 17</text>'+
    '<text x="'+(x(28)+8)+'" y="'+(y(38)+20)+'" class="ink">38 MPa</text><text x="'+(x(56)-8)+'" y="'+(y(43)+22)+'" text-anchor="end" class="ink">43 MPa</text></svg>';
  return '<div class="ui x mo" style="width:1200px;height:750px">'+mNav(2)+
    '<div class="mo-v2"><div class="mo-main">'+
      '<p class="mo-eye d">Proof<i>/</i>Compressive strength<i>/</i>EN 12390-3</p><h1 class="mo-h">M30 reaches its design strength on day 17.</h1>'+
      '<div class="mo-plot"><p class="mo-lbl">Strength gain, MPa, by day</p>'+chart+
      '<p class="mo-meta"><span>36 cylinders</span><span>Cured at 20 °C</span><span>Tested by DTI, Taastrup</span><span>Updated 3 Nov 2026</span></p></div></div>'+
    '<aside class="mo-aside"><p class="mo-lbl">Certified</p><dl class="mo-dl">'+
      [["EPD","EN 15804+A2","NEPD-4471-EN · valid to 03/2030"],["Conformity","EN 206","Certificate 1073-CPR-2291"],["Building regs","BR18 LCA","Accepted, Danish Housing Agency"]].map(function(r){return '<div><dt>'+r[0]+'</dt><dd><b>'+r[1]+'</b><span>'+r[2]+'</span></dd></div>'}).join("")+'</dl>'+
      '<p class="mo-lbl">As machines read this page</p><pre class="mo-code"><i>{</i>\n  <s>"@type"</s>: <u>"Product"</u>,\n  <s>"name"</s>: <u>"Morrow M30"</u>,\n  <s>"hasCertification"</s>: <u>"EN 15804+A2"</u>,\n  <s>"additionalProperty"</s>: <i>{</i>\n    <s>"name"</s>: <u>"Compressive strength, 28 d"</u>,\n    <s>"value"</s>: 38, <s>"unitCode"</s>: <u>"MPA"</u>\n  <i>}</i>\n<i>}</i></pre>'+
      '<p class="mo-cited"><b>Cited on 14 pages</b>Structural slabs, Foundations, Precast and 11 more</p></aside></div></div>';
}
/* the studio: the entity map and how much of it is answered */
var M_COV=[["Flat slabs",24,2,0],["Foundations",18,3,3],["Precast",16,4,6],["Screeds",14,2,4],["Repair",14,1,1]];
function uiMorrowMap(){
  var cols=[["Materials",["M30","M40","Screed L"]],["Applications",["Flat slabs","Foundations","Precast"]],["Standards",["EN 206","EN 15804","DGNB ENV1.1"]]];
  var X=[0,255,510],Y=function(i){return 56+i*100};
  var edges=[[0,0,1,0],[0,0,1,1],[0,1,1,2],[0,2,1,0],[1,0,2,0],[1,0,2,1],[1,1,2,0],[1,2,2,1],[1,2,2,2],[0,1,1,0]];
  var on=function(e){return (e[0]===0&&e[2]===1&&e[3]===0)||(e[0]===1&&e[1]===0)};
  var svg='<svg class="mo-map" width="680" height="300" viewBox="0 0 680 300" aria-hidden="true">'+edges.map(function(e){
    var x1=X[e[0]]+170,y1=Y(e[1])+18,x2=X[e[2]],y2=Y(e[3])+18,mx=(x1+x2)/2;
    return '<path d="M'+x1+' '+y1+'C'+mx+' '+y1+' '+mx+' '+y2+' '+x2+' '+y2+'" class="'+(on([e[0],e[1],e[2],e[3]])?"on":"")+'"/>'}).join("")+'</svg>';
  var nodes=cols.map(function(c,ci){return '<p class="mo-mh" style="left:'+X[ci]+'px">'+c[0]+'</p>'+c[1].map(function(n,i){var sel=ci===1&&i===0,lit=ci===0||(ci===2&&i<2);return '<span class="mo-node'+(sel?" sel":lit?" lit":"")+'" style="left:'+X[ci]+'px;top:'+Y(i)+'px">'+n+'</span>'}).join("")}).join("");
  var tot=M_COV.map(function(r){return r[1]+r[2]+r[3]});
  var bars=M_COV.map(function(r,i){var t=tot[i];return '<div class="mo-cov"><span>'+r[0]+'</span><div class="mo-seg">'+[1,2,3].map(function(k){return r[k]?'<i class="s'+k+'" style="flex:'+r[k]+'"></i>':''}).join("")+'</div><b>'+r[1]+'/'+t+'</b></div>'}).join("");
  return '<div class="ui x mo" style="width:1200px;height:750px"><nav class="mo-nav st"><span class="mo-brand">'+mMark(17)+'morrow <em>Studio</em></span>'+
    '<span class="mo-links">'+["Entity map","Coverage","Briefs","Templates"].map(function(t,i){return '<span'+(i===0?' class="on"':'')+'>'+t+'</span>'}).join("")+'</span><span class="mo-me">KH</span></nav>'+
    '<div class="mo-v3"><div class="mo-main"><p class="mo-eye d">Studio<i>/</i>Entity map</p><h1 class="mo-h">86 of 112 specifier questions answered.</h1>'+
      '<div class="mo-mapbox"><p class="mo-lbl">Flat slabs, and what it connects to</p><div class="mo-mapin">'+svg+nodes+'</div>'+
      '<p class="mo-meta"><span>9 entities</span><span>14 links</span><span>Feeds pages, schema and navigation</span></p></div></div>'+
    '<aside class="mo-aside"><p class="mo-lbl">Coverage by application</p><p class="mo-key"><span class="s1"><i></i>Answered</span><span class="s2"><i></i>In draft</span><span class="s3"><i></i>Open</span></p>'+bars+
      '<p class="mo-lbl mt">Briefs this week</p><ul class="mo-briefs">'+[["Precast: lifting before 7 days","J. Berg","Thu"],["Foundations: sulphate exposure","K. Holm","Fri"],["Screeds: drying times","A. Lund","Mon"]].map(function(b){return '<li><b>'+b[0]+'</b><span>'+b[1]+' · due '+b[2]+'</span></li>'}).join("")+'</ul></aside></div></div>';
}
function uiMorrowM(){
  return '<div class="ui x mo mo-m" style="width:390px;height:844px"><div class="mo-mph" style="background-image:url(img/morrow.jpg)">'+
    '<div class="mo-mtop"><span class="mo-brand">'+mMark(16)+'morrow</span><span class="mo-mi">'+IC("search",18)+'</span></div>'+
    '<header class="mo-hero"><p class="mo-eye">Applications<i>/</i>Structural slabs</p><h1>Structural slabs with 42% less embodied carbon.</h1></header></div>'+
    '<div class="mo-msheet"><p class="mo-lbl">Embodied carbon, per m³</p>'+mCarbon(150)+
    '<p class="mo-lbl mt">Your next questions</p>'+mNext(3)+'</div></div>';
}

/* ============================== NORTHWIND ==============================
   Rotterdam freight forwarder, northern Europe to Asia. Held to the portfolio standard in Northwind's own world:
   the port. Navy ink, white, and signal yellow (the yellow of the quay cranes and hazard paint) for the one thing
   to act on. Every lane is written as its UN/LOCODE pair, NLRTM → SGSIN, the way the trade writes it; the current
   page in the nav carries a yellow bar like a quay marking. Type: Archivo / DM Mono. */
var N_Y="#f2c230";
function nMark(s){return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5 18.5 10 10 18.5 1.5 10z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 1.5 18.5 10H10z" fill="'+N_Y+'"/></svg>'}
function nNav(on,tool){
  var L=tool?["Lanes","Review","Sources","Rules"]:["Lanes","Cargo","Ports","Track"];
  return '<nav class="nw-nav"><span class="nw-brand">'+nMark(18)+'northwind'+(tool?' <em>Lanes</em>':'')+'</span>'+
    '<span class="nw-links">'+L.map(function(t,i){return '<span'+(i===on?' class="on"':'')+'>'+t+(tool&&t==="Review"?'<sup>3</sup>':'')+'</span>'}).join("")+'</span>'+
    (tool?'<span class="nw-me">AV</span>':'<span class="nw-find">'+IC("search",15)+'From, to, cargo</span><span class="nw-cta">Get a quote</span>')+'</nav>';
}
/* transit days, last 12 sailings; promised 26 */
var N_TT=[24,25,26,24,25,28,25,24,26,25,24,25];
function nBars(w,h){
  var max=30,bw=(w-11*6)/12;
  return '<div class="nw-tt" style="width:'+w+'px;height:'+h+'px">'+N_TT.map(function(d,i){var late=d>26;return '<span class="'+(late?"late":"")+'" style="left:'+(i*(bw+6)).toFixed(1)+'px;width:'+bw.toFixed(1)+'px;height:'+(d/max*100).toFixed(1)+'%">'+(late?'<em>'+d+' d · late</em>':'')+'</span>'}).join("")+
    '<i class="nw-prom" style="bottom:'+(26/max*100).toFixed(1)+'%"><b>Promised 26 d</b></i></div>';
}
function nRoute(){return '<p class="nw-route"><b>NLRTM</b><i></i><b>SGSIN</b></p>'}
function uiNorthwind(){
  return '<div class="ui x nw" style="width:1200px;height:750px">'+nNav(0)+
    '<div class="nw-ph" style="background-image:url(img/rotterdam.jpg)"><header class="nw-hero"><p class="nw-eye">Lane<i>/</i>Weekly, every Saturday</p><h1>Rotterdam to Singapore in 26 days.</h1></header>'+nRoute()+'</div>'+
    '<div class="nw-sheet">'+
      '<section class="nw-c1"><p class="nw-lbl">Transit time, last 12 sailings</p><p class="nw-t">11 of 12 arrived on time</p>'+nBars(420,150)+'<p class="nw-ax"><span>Wk 34</span><span>Wk 45</span></p></section>'+
      '<section class="nw-c2"><p class="nw-lbl">Next sailings</p><table class="nw-tbl"><tr><th>Vessel</th><th>Cut-off</th><th>Departs</th><th>Arrives</th></tr>'+
        [["Maersk Elba","13 Nov","15 Nov","11 Dec"],["CMA CGM Tage","20 Nov","22 Nov","18 Dec"],["ONE Harmony","27 Nov","29 Nov","25 Dec"]].map(function(r){return '<tr>'+r.map(function(c,i){return '<td>'+c+'</td>'}).join("")+'</tr>'}).join("")+'</table>'+
        '<p class="nw-lbl mt">Cargo rules on this lane</p><p class="nw-chips"><span>General</span><span>Reefer</span><span class="dg">Lithium batteries</span><span>DG class 1–9</span></p></section>'+
      '<section class="nw-c3"><div class="nw-quote"><p class="nw-lbl">40 ft container, from</p><p class="nw-price">€2,840</p><p class="nw-q2"><span>20 ft</span><b>€1,960</b></p><p class="nw-q2"><span>Valid to</span><b>30 Nov</b></p><span class="nw-btn">Get a quote</span></div>'+
        '<p class="nw-chk">'+IC("check",14)+'Checked by the lane manager · 3 Nov</p></section>'+
    '</div></div>';
}
function uiNorthwindRules(){
  var steps=[["Tue 11 Nov, 18:00","DG declaration lodged"],["Wed 12, 08:00","Gate opens, ECT Delta"],["Thu 13, 18:00","Vessel cut-off"],["Sat 15, 06:00","Departs Rotterdam"]];
  return '<div class="ui x nw nw-pg" style="width:1200px;height:750px">'+nNav(1)+
    '<div class="nw-v2"><div class="nw-main"><p class="nw-eye d">NLRTM → SGSIN<i>/</i>Cargo<i>/</i>Lithium batteries</p>'+
      '<h1 class="nw-h">Lithium batteries sail on this lane, on four conditions.</h1>'+
      '<ol class="nw-cond">'+[["Declared as UN3480, Class 9","Under the IMDG Code, Amendment 42-24"],["Packed to P903","UN-approved packaging, terminals protected"],["Declaration 48 hours before cut-off","Through Portbase, with the packing certificate"],["Carrier approval per booking","We request it; it takes about a working day"]].map(function(c,i){return '<li><span>0'+(i+1)+'</span><b>'+c[0]+'</b><em>'+c[1]+'</em></li>'}).join("")+'</ol>'+
      '<p class="nw-lbl">Your deadlines for the 15 Nov sailing</p><div class="nw-tl">'+steps.map(function(s,i){return '<div class="'+(i===2?"cut":"")+'"><i></i><b>'+s[0]+'</b><span>'+s[1]+'</span></div>'}).join("")+'</div>'+
      '<div class="nw-book"><div><p class="nw-lbl">DG surcharge, per container</p><p class="nw-bp">€310</p></div><p class="nw-bt">Carrier approval takes about one working day, so book by <b>Mon 10 Nov</b> for this sailing.</p><span class="nw-btn">Start a DG booking</span></div></div>'+
    '<aside class="nw-aside"><p class="nw-lbl">Port guidance</p>'+
      [["NLRTM","Rotterdam","ECT Delta terminal. Class 9 goes to the DG stack; notify the port through Portbase."],["SGSIN","Singapore","PSA Pasir Panjang. A DG permit from the MPA is needed before the vessel arrives."]].map(function(p){return '<div class="nw-port"><p><b>'+p[0]+'</b>'+p[1]+'</p><span>'+p[2]+'</span></div>'}).join("")+
      '<div class="nw-src"><p class="nw-lbl">Where these rules come from</p><p>IMDG Code 42-24 · carrier DG policy · port bylaws</p><p class="nw-chk">'+IC("check",14)+'Checked by Anouk de Vries · 3 Nov</p></div>'+
      '<p class="nw-lbl mt">Other cargo on this lane</p><ul class="nw-rel">'+[["Reefer","Pre-trip inspection, set point at booking"],["Flammable liquids","Class 3, under deck only"],["Vehicles","Batteries disconnected, fuel under ¼"]].map(function(r){return '<li><b>'+r[0]+'</b><span>'+r[1]+'</span></li>'}).join("")+'</ul></aside></div></div>';
}
function uiNorthwindReview(){
  var wk=[24,24,24,25,24,24,25,26,26,26,26,26],W=740,H=150,x=function(i){return 8+i*(W-60)/11},y=function(v){return 20+(1-(v-22)/6)*(H-34)};
  var p=wk.map(function(v,i){return (i?"L":"M")+x(i).toFixed(1)+" "+y(v).toFixed(1)}).join(" ");
  var spark='<svg class="nw-spark" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" aria-hidden="true">'+[22,24,26,28].map(function(v){return '<line x1="0" x2="'+W+'" y1="'+y(v)+'" y2="'+y(v)+'" class="g"/><text x="'+(W)+'" y="'+(y(v)-4)+'" text-anchor="end">'+v+' d</text>'}).join("")+
    '<path d="'+p+'" class="ln"/><circle cx="'+x(7)+'" cy="'+y(26)+'" r="5" class="hit"/><text x="'+(x(7)-8)+'" y="'+(y(26)-10)+'" text-anchor="end" class="ink">Schedule change, wk 41</text></svg>';
  var lanes=[["NLRTM → SGSIN","Transit 24 → 26 d",1,1],["DEHAM → CNSHA","New cut-off, Thu",1,0],["NLRTM → KRPUS","Reefer rule added",1,0],["BEANR → MYPKG","Live",0,0],["NLRTM → VNSGN","Live",0,0],["DEHAM → SGSIN","Live",0,0]];
  return '<div class="ui x nw nw-pg" style="width:1200px;height:750px">'+nNav(1,1)+
    '<div class="nw-v3"><aside class="nw-list"><p class="nw-lbl">Lanes</p><p class="nw-sum"><b>38</b> live · <b>3</b> waiting</p>'+
      lanes.map(function(l){return '<div class="nw-li'+(l[3]?" sel":"")+'"><b>'+l[0]+'</b><span class="'+(l[2]?"rv":"ok")+'"><i></i>'+l[1]+'</span></div>'}).join("")+'<p class="nw-all">Show all 38 lanes</p></aside>'+
    '<div class="nw-main"><p class="nw-eye d">Review<i>/</i>NLRTM → SGSIN</p><h1 class="nw-h">38 lanes live. 3 need a look.</h1>'+
      '<div class="nw-diff"><p class="nw-lbl">Changed from operations data</p><div class="nw-dr"><span>Transit time</span><s>24 days</s><b>26 days</b></div><div class="nw-dr"><span>Source</span><em>Carrier schedule, published wk 45</em></div>'+
        '<div class="nw-dr"><span>Pages affected</span><em>Lane page, 3 cargo pages, quote form</em></div></div>'+
      '<div class="nw-trend"><p class="nw-lbl">Median transit, last 12 weeks</p>'+spark+'</div>'+
      '<div class="nw-act"><span class="nw-btn">Approve and publish</span><span class="nw-btn gh">Edit before publishing</span><p>You run this lane, so it waits for you.</p></div></div></div></div>';
}
function uiNorthwindM(){
  return '<div class="ui x nw nw-m" style="width:390px;height:844px"><div class="nw-mph" style="background-image:url(img/rotterdam.jpg)">'+
    '<div class="nw-mtop"><span class="nw-brand">'+nMark(17)+'northwind</span><span class="nw-mi">'+IC("search",18)+'</span></div>'+
    '<header class="nw-hero"><p class="nw-eye">Lane<i>/</i>Weekly, Saturdays</p><h1>Rotterdam to Singapore in 26 days.</h1></header>'+nRoute()+'</div>'+
    '<div class="nw-msheet"><p class="nw-lbl">Transit time, last 12 sailings</p><p class="nw-t">11 of 12 arrived on time</p>'+nBars(342,120)+
    '<div class="nw-mq"><div><p class="nw-lbl">40 ft from</p><p class="nw-price">€2,840</p></div><span class="nw-btn">Get a quote</span></div>'+
    '<p class="nw-chk">'+IC("check",14)+'Checked by the lane manager · 3 Nov</p></div></div>';
}

/* ============================== COMMON GROUND ==============================
   Manchester's housing and benefits service. Held to the portfolio standard in its own world: the city's red brick
   and a type family designed for legibility (Atkinson Hyperlegible, with its mono for reference numbers and dates).
   Paper, ink, brick red for the service's own voice, one green kept for "saved". The mark is a gable, the roofline
   of the terraces it serves, and the same gable sits over the current page in the nav. */
var C_BR="#a83f26";
function cMark(s){return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 20 20" aria-hidden="true"><path d="M2 18V9l8-6.5L18 9v9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M7 18v-5h6v5" fill="'+C_BR+'"/></svg>'}
function cNav(on,staff){
  var L=staff?["Cases","Waiting","Reports"]:["My claim","Messages","Documents","Help"];
  return '<nav class="cg-nav'+(staff?" st":"")+'"><span class="cg-brand">'+cMark(19)+'Common Ground<em>'+(staff?"Caseworkers":"Manchester")+'</em></span>'+
    '<span class="cg-links">'+L.map(function(t,i){return '<span'+(i===on?' class="on"':'')+'>'+t+(t==="Messages"?'<sup>1</sup>':t==="Waiting"?'<sup>6</sup>':'')+'</span>'}).join("")+'</span>'+
    (staff?'<span class="cg-me">SO</span>':'<span class="cg-call">Call us <b>0161 234 5000</b></span><span class="cg-me">AH</span>')+'</nav>';
}
function cSaved(t){return '<p class="cg-saved">'+IC("check",14)+'Saved '+t+'</p>'}
var C_STAGES=[["Sent","3 Nov",2],["Checked","5 Nov",2],["With a caseworker","Now",1],["Decision","By 17 Nov",0]];
function cStages(){return '<ol class="cg-stages">'+C_STAGES.map(function(s){return '<li class="s'+s[2]+'"><i>'+(s[2]===2?IC("check",12,"#fff",3):'')+'</i><b>'+s[0]+'</b><span>'+s[1]+'</span></li>'}).join("")+'</ol>'}
function uiCommon(){
  return '<div class="ui x cg" style="width:1200px;height:750px">'+cNav(0)+
    '<div class="cg-v1"><div class="cg-main"><p class="cg-eye">Housing support<i>·</i>Claim HS-20418</p>'+
      '<h1 class="cg-h">Your claim is with a caseworker.</h1><p class="cg-sub">Sam Okafor picked it up on Tuesday. You don’t need to do anything yet.</p>'+cStages()+
      '<div class="cg-time"><p class="cg-lbl">Working days to a decision</p><div class="cg-range"><span class="typ" style="left:40%;width:20%"><em>Most claims, 8–12 days</em></span><span class="you" style="left:30%"><em>You, day 6</em></span></div>'+
        '<p class="cg-ax"><span>0</span><span>5</span><span>10</span><span>15</span><span>20</span></p></div>'+
      '<p class="cg-lbl mt">What happens next</p><ul class="cg-next"><li><b>Sam checks your tenancy agreement</b><span>We have it. Nothing else is needed.</span></li><li><b>We tell you the decision</b><span>By text and letter, with what you’ll get and when.</span></li></ul></div>'+
    '<div class="cg-ph" style="background-image:url(img/commonground.jpg)"><div class="cg-card"><p class="cg-lbl">Next from us</p><p class="cg-ct">Sam will call you on <b>Friday 14 Nov</b>, between 10:00 and 12:00.</p><span class="cg-link">Change the time</span></div></div></div></div>';
}
var C_STEPS=["About you","Your home","Who lives with you","Income","Rent","Bank details","Check and send"];
function cRail(cur){return '<ol class="cg-rail">'+C_STEPS.map(function(s,i){var st=i<cur?2:i===cur?1:0;return '<li class="s'+st+'"><i>'+(st===2?IC("check",11,"#fff",3):(i+1))+'</i>'+s+'</li>'}).join("")+'</ol>'}
function uiCommonStep(){
  return '<div class="ui x cg cg-pg" style="width:1200px;height:750px">'+cNav(0)+
    '<div class="cg-v2"><aside class="cg-side"><p class="cg-lbl">Housing support</p><p class="cg-prog"><b>Step 5 of 7</b> · about 4 minutes left</p>'+cRail(4)+cSaved("2 minutes ago")+'</aside>'+
    '<div class="cg-q"><p class="cg-eye">Step 5<i>·</i>Rent</p><h1 class="cg-h">How much rent do you pay?</h1>'+
      '<p class="cg-hint">The amount on your tenancy agreement, before any help you already get. For example, £725 a month.</p>'+
      '<div class="cg-in"><span>£</span><b>725</b><i></i></div>'+
      '<div class="cg-per">'+["Every month","Every 4 weeks","Every week"].map(function(t,i){return '<span'+(i===0?' class="on"':'')+'><i></i>'+t+'</span>'}).join("")+'</div>'+
      '<div class="cg-btns"><span class="cg-btn">Continue</span><span class="cg-back">Back</span></div></div>'+
    '<aside class="cg-why"><div class="cg-wbox"><p class="cg-lbl">Why we ask</p><p>Your rent sets how much housing support you can get. We check it against your tenancy agreement, so you won’t be asked again.</p></div>'+
      '<div class="cg-wbox off"><p class="cg-lbl">No signal?</p><p>Keep going. Your answers save on this phone or computer and send when you’re back online.</p></div>'+
      '<p class="cg-help">Stuck? <b>Talk to someone</b>, Monday to Friday, 8:00 to 18:00.</p></aside></div></div>';
}
/* residents who paused at each step, last 30 days */
var C_PAUSE=[[1,22],[2,18],[3,31],[4,46],[5,64],[6,27],[7,9]];
function uiCommonStaff(){
  var max=70,bars=C_PAUSE.map(function(p){return '<div class="cg-pb'+(p[0]===5?" hi":"")+'"><em>'+p[1]+'</em><i style="height:'+(p[1]/max*100).toFixed(1)+'%"></i><span>'+p[0]+'</span></div>'}).join("");
  var cases=[["Amira Haddad","Stopped at step 5, rent","2 days",1],["Daniel Price","Waiting for a payslip","4 days",0],["Joy Mensah","Ready for a decision","Today",0],["Piotr Nowak","Stopped at step 4, income","1 day",0],["Leah Brooks","Ready for a decision","Today",0]];
  return '<div class="ui x cg cg-pg" style="width:1200px;height:750px">'+cNav(0,1)+
    '<div class="cg-v3"><aside class="cg-list"><p class="cg-lbl">Waiting on you</p>'+cases.map(function(c){return '<div class="cg-ci'+(c[3]?" sel":"")+'"><b>'+c[0]+'</b><span>'+c[1]+'</span><em>'+c[2]+'</em></div>'}).join("")+'</aside>'+
    '<div class="cg-main"><p class="cg-eye">Amira Haddad<i>·</i>HS-20431</p><h1 class="cg-h">Pick up where Amira stopped.</h1>'+
      '<div class="cg-pick"><div><p class="cg-lbl">Stopped at</p><p class="cg-pv">Step 5 of 7, rent</p></div><div><p class="cg-lbl">Last saved</p><p class="cg-pv">Sun 9 Nov, 21:40, on a phone</p></div><div><p class="cg-lbl">Already answered</p><p class="cg-pv">Steps 1 to 4</p></div></div>'+
      '<div class="cg-acts"><span class="cg-btn">Call Amira</span><span class="cg-btn gh">Send a text with a link back to step 5</span></div>'+
      '<div class="cg-pause"><p class="cg-lbl">Where residents paused, last 30 days</p><p class="cg-pt">Rent is the step people stop at most</p><div class="cg-pbs">'+bars+'</div><p class="cg-ax2">Step</p></div></div></div></div>';
}
function uiCommonM(){
  return '<div class="ui x cg cg-m" style="width:390px;height:844px"><div class="cg-mtop"><span class="cg-brand">'+cMark(18)+'Common Ground</span><span class="cg-me">AH</span></div>'+
    '<div class="cg-off">'+IC("check",13)+'No signal. Your answers are saved on this phone.</div>'+
    '<div class="cg-mbody"><p class="cg-prog"><b>Step 5 of 7</b> · Rent</p><div class="cg-mbar"><i style="width:57%"></i></div>'+
      '<h1 class="cg-h">How much rent do you pay?</h1><p class="cg-hint">The amount on your tenancy agreement. For example, £725 a month.</p>'+
      '<div class="cg-in"><span>£</span><b>725</b><i></i></div>'+
      '<div class="cg-per v">'+["Every month","Every 4 weeks","Every week"].map(function(t,i){return '<span'+(i===0?' class="on"':'')+'><i></i>'+t+'</span>'}).join("")+'</div>'+
      '<details class="cg-wbox" open><summary class="cg-lbl">Why we ask</summary><p>Your rent sets how much support you can get.</p></details>'+
      '<span class="cg-btn">Continue</span></div></div>';
}

/* ============================== OLIVE ==============================
   Lisbon savings app for first-time savers. Held to the portfolio standard in Olive's own world: a Lisbon morning,
   warm paper, olive green for money and progress, terracotta only in the mark. Type: Bricolage Grotesque with Geist
   Mono for amounts and dates. The mark is an olive (an oval with a leaf); the progress line runs through every
   screen as a row of stops, and the current page in the nav carries the leaf. */
var O_OL="#56622a";
function oMark(s){return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 20 20" aria-hidden="true"><ellipse cx="9" cy="12" rx="5.5" ry="6.5" fill="'+O_OL+'"/><path d="M11 6c1-3 4-4.5 7-4-.5 3-3 5-7 4z" fill="#c8553d"/></svg>'}
function oLine(cur,n){n=n||5;var h='';for(var i=0;i<n;i++){if(i)h+='<b'+(i<=cur?' class="d"':'')+'></b>';h+='<i class="'+(i<cur?"d":i===cur?"c":"")+'"></i>'}return '<div class="ol-line">'+h+'</div>'}
function oProg(cur,left){return '<div class="ol-prog"><p><b>'+(cur+1)+' of 5</b>'+left+'</p>'+oLine(cur)+'</div>'}
function oNav(){return '<nav class="ol-nav"><span class="ol-brand">'+oMark(20)+'olive</span><span class="ol-step">Opening your savings account</span><span class="ol-help">Questions? <b>Chat with us</b></span><span class="ol-x">Save and finish later</span></nav>'}
function uiOlive(){
  return '<div class="ui x ol" style="width:1200px;height:750px">'+oNav()+
    '<div class="ol-v1"><div class="ol-ph" style="background-image:url(img/lisbon.jpg)"><header class="ol-hero"><p class="ol-eye">Olive savings</p><h1>Open a savings account in about four minutes.</h1><p class="ol-sub">One question at a time. No minimum, no fees.</p></header></div>'+
    '<div class="ol-q">'+oProg(1,' · about 3 minutes left')+
      '<p class="ol-eye d">Step 2</p><h2 class="ol-h">What’s your NIF?</h2><p class="ol-hint">Your tax number, nine digits. It’s on your Cartão de Cidadão and your payslips.</p>'+
      '<div class="ol-in">245 819 603<i></i></div><p class="ol-ok">'+IC("check",14)+'Nine digits, that looks right</p>'+
      '<div class="ol-why"><p class="ol-lbl">Why we ask</p><p>The law needs it before we can pay you interest. We never use it for anything else.</p></div>'+
      '<span class="ol-btn">Continue</span></div></div></div>';
}
function uiOliveId(){
  return '<div class="ui x ol ol-pg" style="width:1200px;height:750px">'+oNav()+
    '<div class="ol-v2"><div class="ol-q w">'+oProg(2,' · about 2 minutes left')+
      '<p class="ol-eye d">Step 3</p><h2 class="ol-h">One document is enough.</h2><p class="ol-hint">Choose the one you have with you. We check it in about 30 seconds.</p>'+
      '<div class="ol-docs">'+[["Cartão de Cidadão","Portuguese citizens",1],["Residence permit","Título de Residência",0],["Passport","Any country",0]].map(function(d){return '<div class="'+(d[2]?"on":"")+'"><i></i><b>'+d[0]+'</b><span>'+d[1]+'</span></div>'}).join("")+'</div>'+
      '<div class="ol-why"><p class="ol-lbl">Why only one</p><p>One document proves who you are. Your address can wait until your first withdrawal.</p></div></div>'+
    '<div class="ol-scan"><div class="ol-frame"><span class="c1"></span><span class="c2"></span><span class="c3"></span><span class="c4"></span><div class="ol-card"><i></i><p><b>REPÚBLICA PORTUGUESA</b><span>CARTÃO DE CIDADÃO</span></p><em>RITA SOUSA</em><s>14 03 2001</s></div></div>'+
      '<p class="ol-scant">Hold the front of your card inside the frame</p><p class="ol-ok c">'+IC("check",14)+'Card found · reading it now</p><span class="ol-btn gh">Upload a photo instead</span></div></div></div>';
}
/* €125 a month from Nov 2026 to €3,000 */
function uiOliveGoal(){
  var W=440,H=260,L=46,T=16,B=30,m=24,x=function(i){return L+i/m*(W-L-10)},y=function(v){return T+(1-v/3500)*(H-T-B)};
  var grid=[0,1000,2000,3000].map(function(v){return '<line x1="'+L+'" x2="'+(W-10)+'" y1="'+y(v)+'" y2="'+y(v)+'" class="g"/><text x="'+(L-10)+'" y="'+(y(v)+4)+'" text-anchor="end">€'+(v/1000)+(v?'k':'')+'</text>'}).join("");
  var xt=[[0,"Nov 26"],[6,"May 27"],[12,"Nov 27"],[18,"May 28"],[24,"Nov 28"]].map(function(t){return '<text x="'+x(t[0])+'" y="'+(H-8)+'" text-anchor="'+(t[0]===24?"end":t[0]?"middle":"start")+'">'+t[1]+'</text>'}).join("");
  var chart='<svg class="ol-chart" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" aria-label="Projected savings">'+grid+xt+
    '<line x1="'+L+'" x2="'+(W-10)+'" y1="'+y(3000)+'" y2="'+y(3000)+'" class="goal"/><text x="'+(L+8)+'" y="'+(y(3000)-8)+'" class="ink">Goal, €3,000</text>'+
    '<path d="M'+x(0)+' '+y(0)+'L'+x(24)+' '+y(3000)+'L'+x(24)+' '+y(0)+'Z" class="ar"/><path d="M'+x(0)+' '+y(0)+'L'+x(24)+' '+y(3000)+'" class="ln"/>'+
    '<circle cx="'+x(24)+'" cy="'+y(3000)+'" r="6" class="hit"/><text x="'+(x(24)-12)+'" y="'+(y(3000)+24)+'" text-anchor="end" class="ink b">Nov 2028</text></svg>';
  return '<div class="ui x ol ol-pg" style="width:1200px;height:750px">'+oNav()+
    '<div class="ol-v3"><div class="ol-q w">'+oProg(3,' · one more after this')+
      '<p class="ol-eye d">Step 4</p><h2 class="ol-h">What are you saving for?</h2><p class="ol-hint">Name it now. Your account opens with a goal, not an empty balance.</p>'+
      '<div class="ol-goals">'+["A deposit for a flat","A rainy-day fund","Travel","Something else"].map(function(g,i){return '<span'+(i===0?' class="on"':'')+'>'+g+'</span>'}).join("")+'</div>'+
      '<p class="ol-lbl">How much, each month</p><div class="ol-amt">'+[["€75","Feb 2030"],["€125","Nov 2028"],["€200","Mar 2028"]].map(function(a,i){return '<span'+(i===1?' class="on"':'')+'><b>'+a[0]+'</b><em>'+a[1]+'</em></span>'}).join("")+'</div></div>'+
    '<div class="ol-proj"><p class="ol-lbl">A deposit for a flat</p><p class="ol-big">€3,000 <span>by November 2028</span></p>'+chart+'<p class="ol-note">At €125 a month. Change it whenever you like.</p><span class="ol-btn">Set my goal</span></div></div></div>';
}
var O_WK=[60,60,75,60,0,95,60,70];
function uiOliveM(){
  var mx=100,bars=O_WK.map(function(v,i){return '<span'+(i===7?' class="now"':'')+'><i style="height:'+Math.max(v/mx*100,2).toFixed(0)+'%"></i><em>'+(v?'€'+v:'—')+'</em></span>'}).join("");
  return '<div class="ui x ol ol-m" style="width:390px;height:844px"><div class="ol-mph" style="background-image:url(img/lisbon.jpg)">'+
    '<div class="ol-mtop"><span class="ol-brand">'+oMark(18)+'olive</span><span class="ol-me">RS</span></div>'+
    '<div class="ol-mh"><p class="ol-eye">A deposit for a flat</p><p class="ol-mbig">€640<span> of €3,000</span></p><div class="ol-mbar"><i style="width:21%"></i></div><p class="ol-mt"><span>21%</span><span>On track for Nov 2028</span></p></div></div>'+
    '<div class="ol-msheet"><p class="ol-lbl">Saved each week</p><p class="ol-t">Eight weeks, one skipped</p><div class="ol-wk">'+bars+'</div>'+
    '<div class="ol-mnext"><div><p class="ol-lbl">Next transfer</p><p class="ol-v">€125 · Mon 1 Dec</p></div><span class="ol-btn sm">Add money</span></div></div></div>';
}

/* ============================== CLARA ==============================
   Valencia home-solar installer (clara: clear). Held to the portfolio standard in Clara's own world: whitewashed walls
   under a teal Mediterranean sky. Whitewash paper, deep-sea ink, teal for the home's own numbers, sun amber only for
   what the panels make. The mark is a half sun on a horizon; the same half sun marks the current page in the nav.
   Type: Figtree / Spline Sans Mono. */
var L_TE="#1f6f76",L_SUN="#e8912d";
function lMark(s){return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 13a6 6 0 0 1 12 0z" fill="'+L_SUN+'"/><path d="M1.5 15.5h17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'}
function lNav(on,dark){
  return '<nav class="cl-nav'+(dark?" dk":"")+'"><span class="cl-brand">'+lMark(20)+'clara</span><span class="cl-links">'+["Savings","Guides","How it works","Reviews"].map(function(t,i){return '<span'+(i===on?' class="on"':'')+'>'+(i===on?lMark(11):'')+t+'</span>'}).join("")+'</span><span class="cl-cta">Book a roof visit</span></nav>';
}
/* cumulative savings €612 a year against a €5,400 system */
function lPayback(W,H){
  var L=48,T=14,B=28,x=function(y){return L+y/25*(W-L-8)},y=function(v){return T+(1-v/16000)*(H-T-B)};
  var g=[0,5000,10000,15000].map(function(v){return '<line x1="'+L+'" x2="'+(W-8)+'" y1="'+y(v)+'" y2="'+y(v)+'" class="g"/><text x="'+(L-8)+'" y="'+(y(v)+4)+'" text-anchor="end">€'+(v/1000)+(v?'k':'')+'</text>'}).join("");
  var xt=[0,5,10,15,20,25].map(function(t){return '<text x="'+x(t)+'" y="'+(H-6)+'" text-anchor="'+(t===25?"end":t?"middle":"start")+'">'+(t?"Yr "+t:"Now")+'</text>'}).join("");
  return '<svg class="cl-chart" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" aria-label="Savings against cost">'+g+xt+
    '<line x1="'+L+'" x2="'+(W-8)+'" y1="'+y(5400)+'" y2="'+y(5400)+'" class="cost"/><text x="'+(W-8)+'" y="'+(y(5400)+18)+'" text-anchor="end" class="ink">Cost, €5,400</text>'+
    '<path d="M'+x(0)+' '+y(0)+'L'+x(25)+' '+y(15300)+'L'+x(25)+' '+y(0)+'Z" class="ar"/><path d="M'+x(0)+' '+y(0)+'L'+x(25)+' '+y(15300)+'" class="ln"/>'+
    '<circle cx="'+x(8.8)+'" cy="'+y(5400)+'" r="6" class="hit"/><text x="'+(x(8.8)-10)+'" y="'+(y(5400)-12)+'" text-anchor="end" class="ink b">Paid back, year 9</text>'+
    '<text x="'+(x(25)-14)+'" y="'+(y(15300)-2)+'" text-anchor="end" class="ink">€15,300 saved</text></svg>';
}
function uiClara(){
  return '<div class="ui x cl" style="width:1200px;height:750px"><div class="cl-photo" style="background-image:url(img/clara.jpg)"></div>'+lNav(0,1)+
    '<header class="cl-hero"><p class="cl-eye">Your estimate</p><h1>Solar would save you €612 a year.</h1><p class="cl-sub">Worked out from your own bill, not an average home.</p></header>'+
    '<section class="cl-sheet"><div class="cl-ins"><div><p class="cl-lbl">Your bill</p><p class="cl-in"><b>€95</b> a month</p></div><div><p class="cl-lbl">Your roof</p><p class="cl-in"><b>SE</b> · 30 m²</p></div><div><p class="cl-lbl">You’d get</p><p class="cl-in"><b>8 panels</b> · 3.6 kW</p></div></div>'+
      '<p class="cl-lbl">Savings against what it costs, over 25 years</p>'+lPayback(500,230)+
      '<div class="cl-foot"><p><b>€5,400</b> installed, VAT included</p><span class="cl-btn">Book a roof visit</span></div></section></div>';
}
/* a sunny day in May: what the panels make and what the home uses, kW by hour */
var L_GEN=[0,0,0,0,0,0,0,.2,.7,1.4,2.1,2.6,3,3.1,3,2.6,2,1.3,.6,.15,0,0,0,0],L_USE=[.4,.3,.3,.3,.3,.4,.7,1,.8,.6,.5,.5,.6,.7,.5,.5,.6,.8,1.2,1.6,1.8,1.5,1,.6];
function lDay(W,H){
  var L=40,T=14,B=26,x=function(h){return L+h/23*(W-L-8)},y=function(v){return T+(1-v/3.5)*(H-T-B)};
  var pts=function(a){return a.map(function(v,h){return x(h).toFixed(1)+" "+y(v).toFixed(1)})};
  var g=[0,1,2,3].map(function(v){return '<line x1="'+L+'" x2="'+(W-8)+'" y1="'+y(v)+'" y2="'+y(v)+'" class="g"/><text x="'+(L-8)+'" y="'+(y(v)+4)+'" text-anchor="end">'+v+' kW</text>'}).join("");
  var xt=[0,6,12,18,23].map(function(h){return '<text x="'+x(h)+'" y="'+(H-6)+'" text-anchor="'+(h===23?"end":h?"middle":"start")+'">'+(h<10?"0":"")+h+':00</text>'}).join("");
  var sur=[];for(var h=9;h<=17;h++)sur.push([h,L_GEN[h]]);var surB=[];for(h=17;h>=9;h--)surB.push([h,L_USE[h]]);
  var sp='M'+sur.concat(surB).map(function(p){return x(p[0]).toFixed(1)+" "+y(p[1]).toFixed(1)}).join("L")+'Z';
  return '<svg class="cl-chart" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" aria-label="Generation and use over a day">'+g+xt+
    '<path d="M'+x(0)+' '+y(0)+'L'+pts(L_GEN).join("L")+'L'+x(23)+' '+y(0)+'Z" class="gen"/><path d="'+sp+'" class="sur"/>'+
    '<path d="M'+pts(L_GEN).join("L")+'" class="genl"/><path d="M'+pts(L_USE).join("L")+'" class="use"/>'+
    '<text x="'+x(12.5)+'" y="'+y(1.75)+'" text-anchor="middle" class="ink b">Surplus</text><text x="'+x(20.3)+'" y="'+(y(1.8)-10)+'" text-anchor="middle" class="ink">Evening, you buy</text></svg>';
}
function uiClaraSurplus(){
  return '<div class="ui x cl cl-pg" style="width:1200px;height:750px">'+lNav(1)+
    '<div class="cl-v2"><div class="cl-main"><p class="cl-eye d">Guides<i>/</i>Surplus</p><h1 class="cl-h">What happens to the power you don’t use.</h1>'+
      '<div class="cl-box"><div class="cl-boxh"><p class="cl-lbl">A sunny day in May, 3.6 kW home system</p><p class="cl-key"><span class="k1"><i></i>Panels make</span><span class="k2"><i></i>Home uses</span><span class="k3"><i></i>Surplus</span></p></div>'+lDay(700,260)+'</div>'+
      '<p class="cl-lbl nx">Next questions</p><p class="cl-nx">'+["Do I need a battery?","Is the credit the same every month?","What if I use more in summer?"].map(function(q){return '<span>'+q+'</span>'}).join("")+'</p></div>'+
    '<aside class="cl-aside"><ol class="cl-steps">'+[["Midday","The panels make more than the house uses."],["The surplus goes to the grid","Your supplier credits it at <b>€0.06</b> a kWh."],["Evening","You buy from the grid at <b>€0.17</b> a kWh, minus that credit."]].map(function(s,i){return '<li><span>'+(i+1)+'</span><b>'+s[0]+'</b><p>'+s[1]+'</p></li>'}).join("")+'</ol>'+
      '<div class="cl-sum"><p class="cl-lbl">On your bill, in May</p><p class="cl-big">−€8.40</p><p>From 140 kWh of surplus. Bigger in summer, smaller in winter.</p></div></aside></div></div>';
}
var L_COST=[["Panels, 8 × 450 W",1850],["Inverter",1050],["Installation, one day",1100],["Mounting and wiring",650],["VAT",550],["Permit and paperwork",200]];
function uiClaraCost(){
  return '<div class="ui x cl cl-pg" style="width:1200px;height:750px">'+lNav(1)+
    '<div class="cl-v3"><div class="cl-main"><p class="cl-eye d">Guides<i>/</i>Cost</p><h1 class="cl-h">What solar costs, line by line.</h1>'+
      '<p class="cl-lede">A typical 3.6 kW system for a house in Valencia. Your price comes from a roof visit, and it’s fixed once we’ve seen the roof.</p>'+
      '<div class="cl-cost">'+L_COST.map(function(c){return '<div><span>'+c[0]+'</span><i style="width:'+(c[1]/1850*100).toFixed(0)+'%"></i><b>€'+c[1].toLocaleString("en-GB")+'</b></div>'}).join("")+'<div class="tot"><span>Total</span><i></i><b>€5,400</b></div></div>'+
      '<p class="cl-by">Written by our installers · checked 2 Nov 2026</p></div>'+
    '<aside class="cl-aside"><p class="cl-lbl">What people ask next</p><dl class="cl-qa">'+[["How long until it pays back?","For most homes, eight to ten years. Try it with your own bill."],["Do I need a battery?","Usually not at first. It adds about €3,000 and pays back more slowly."],["What about cloudy days?","The panels still make power, about a third as much."],["Is there a grant?","Many towns cut the IBI property tax for three to five years."]].map(function(q){return '<div><dt>'+q[0]+'</dt><dd>'+q[1]+'</dd></div>'}).join("")+'</dl><span class="cl-link">Work out my savings</span></aside></div></div>';
}
function uiClaraM(){
  return '<div class="ui x cl cl-m" style="width:390px;height:844px"><div class="cl-mph" style="background-image:url(img/clara.jpg)"><div class="cl-mtop"><span class="cl-brand">'+lMark(18)+'clara</span></div>'+
    '<header class="cl-hero"><p class="cl-eye">Your estimate</p><h1>Solar would save you €612 a year.</h1></header></div>'+
    '<section class="cl-msheet"><div class="cl-ins"><div><p class="cl-lbl">Your bill</p><p class="cl-in"><b>€95</b>/mo</p></div><div><p class="cl-lbl">You’d get</p><p class="cl-in"><b>8 panels</b></p></div></div>'+
      '<p class="cl-lbl">Savings against cost, 25 years</p>'+lPayback(346,200)+'<span class="cl-btn">Book a roof visit</span></section></div>';
}

/* ============================== RIVE ==============================
   Montréal neighbourhood clinics (rive: the riverbank). Held to the portfolio standard in Rive's own world: the
   painted plexes of the Plateau and their outside staircases. Facade navy for ink, clinic green for confirmed things,
   a pale wash for the patient's own messages. The mark is a staircase; a single step marks the current page.
   The assistant answers in whatever mix of French and English the patient writes. Type: Albert Sans / Red Hat Mono. */
var R_GR="#3f7f1f";
function rMark(s){return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 20 20" aria-hidden="true"><path d="M2 18h5v-5h5V8h5V3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><circle cx="17" cy="3" r="2.4" fill="'+R_GR+'"/></svg>'}
function rNav(on,staff){
  var L=staff?["Inbox","Hand-offs","Scripts","Clinics"]:["Book","My visits","Clinics","Aide / Help"];
  return '<nav class="rv-nav'+(staff?" st":"")+'"><span class="rv-brand">'+rMark(19)+'rive'+(staff?'<em>Équipe</em>':'')+'</span><span class="rv-links">'+L.map(function(t,i){return '<span'+(i===on?' class="on"':'')+'>'+t+(t==="Hand-offs"?'<sup>2</sup>':'')+'</span>'}).join("")+'</span>'+
    (staff?'<span class="rv-me">JR</span>':'<span class="rv-lang"><b>FR</b><i>/</i><b>EN</b></span><span class="rv-me">NB</span>')+'</nav>';
}
var R_CHAT=[[0,"Bonjour, I need a rendez-vous pour ma fille. Elle fait de la fièvre depuis hier."],
  [1,"Bien sûr. I can book her with a nurse today. Les premiers créneaux à la Clinique Plateau :",["14:20","15:40","17:10"]],
  [0,"15:40 c’est parfait"],
  [1,"C’est réservé : <b>jeudi 15:40</b>, Clinique Plateau, with nurse Julie Roy. Bring her <b>carte RAMQ</b>, and arrive ten minutes early."]];
function rChat(n){return R_CHAT.slice(0,n).map(function(m){return '<div class="rv-msg '+(m[0]?"bot":"me")+'"><p>'+m[1]+'</p>'+(m[2]?'<span class="rv-slots">'+m[2].map(function(s,i){return '<i'+(i===1?' class="on"':'')+'>'+s+'</i>'}).join("")+'</span>':'')+'</div>'}).join("")}
function uiRive(){
  return '<div class="ui x rv" style="width:1200px;height:750px">'+rNav(0)+
    '<div class="rv-v1"><div class="rv-ph" style="background-image:url(img/rive.jpg)"><header class="rv-hero"><p class="rv-eye">Clinique Plateau · Mile End · Verdun</p><h1>Book in French, English, or both.</h1></header></div>'+
    '<div class="rv-chat"><div class="rv-ch"><span class="rv-av">'+rMark(18)+'</span><p><b>Rive</b>Answers in seconds, in your language</p><span class="rv-lang2">Following you: <b>FR + EN</b></span></div>'+
      '<div class="rv-thread">'+rChat(4)+'<p class="rv-note">Logistics only. Anything medical goes to a nurse.</p></div>'+
      '<div class="rv-input">Écrivez ou tapez… / Type here…<span>'+IC("chevd",16)+'</span></div></div></div></div>';
}
/* average wait at Clinique Plateau today, minutes, by hour from 8:00 */
var R_WAIT=[[8,18],[9,24],[10,21],[11,15],[12,11],[13,14],[14,16],[15,12],[16,19],[17,26],[18,22],[19,13]];
function uiRivePrep(){
  var mx=30,bars=R_WAIT.map(function(w){return '<span'+(w[0]===15?' class="on"':'')+'><i style="height:'+(w[1]/mx*100).toFixed(0)+'%">'+(w[0]===15?'<em>12 min at 15:40</em>':'')+'</i><b>'+w[0]+'</b></span>'}).join("");
  return '<div class="ui x rv rv-pg" style="width:1200px;height:750px">'+rNav(1)+
    '<div class="rv-v2"><div class="rv-main"><p class="rv-eye d">Visit RV-2041<i>·</i>Léa Bergeron, 6</p><h1 class="rv-h">Jeudi 15:40, Clinique Plateau.</h1><p class="rv-sub">Thursday at 15:40, with nurse Julie Roy. 4372 rue Saint-Denis.</p>'+
      '<p class="rv-lbl">Bring / Apportez</p><ul class="rv-check">'+[["Her carte RAMQ","Quebec health card, valid"],["Her medicines","Or a photo of the boxes"],["Ten minutes early","To check in at the desk"]].map(function(c){return '<li><i>'+IC("check",13,"#fff",3)+'</i><b>'+c[0]+'</b><span>'+c[1]+'</span></li>'}).join("")+'</ul>'+
      '<div class="rv-wait"><p class="rv-lbl">Average wait today, minutes, by hour</p><div class="rv-wb">'+bars+'</div></div></div>'+
    '<aside class="rv-aside"><p class="rv-lbl">We’ll remind you</p><ol class="rv-tl">'+[["Wed 18:00","A text with the address and what to bring"],["Thu 13:40","A text two hours before"],["Thu 15:30","Check in by text when you arrive"]].map(function(t){return '<li><b>'+t[0]+'</b><span>'+t[1]+'</span></li>'}).join("")+'</ol>'+
      '<div class="rv-chg"><p class="rv-lbl">Need to change it?</p><p>Reply <b>CHANGER</b> or <b>CHANGE</b> to any of our texts.</p></div></aside></div></div>';
}
/* bookings this week: handled by the assistant, handed to a person */
var R_WK=[["Mon",71,6],["Tue",64,5],["Wed",68,7],["Thu",60,6],["Fri",73,8],["Sat",24,3],["Sun",15,2]];
function uiRiveStaff(){
  var mx=85,bars=R_WK.map(function(d){return '<span><i class="s2" style="height:'+(d[2]/mx*100).toFixed(1)+'%"></i><i class="s1" style="height:'+(d[1]/mx*100).toFixed(1)+'%"></i><b>'+d[0]+'</b></span>'}).join("");
  return '<div class="ui x rv rv-pg" style="width:1200px;height:750px">'+rNav(1,1)+
    '<div class="rv-v3"><div class="rv-main"><p class="rv-eye d">This week<i>·</i>3 clinics</p><h1 class="rv-h">412 bookings this week. 37 went to a person.</h1>'+
      '<div class="rv-box"><div class="rv-boxh"><p class="rv-lbl">Bookings by day</p><p class="rv-key"><span class="s1"><i></i>Booked by the assistant</span><span class="s2"><i></i>Handed to a person</span></p></div><div class="rv-sb">'+bars+'</div></div></div>'+
    '<aside class="rv-aside"><p class="rv-lbl">Hand-off · 40 seconds ago</p><div class="rv-ho"><p class="rv-hot">Chest pain mentioned</p><p class="rv-q">“J’ai mal à la poitrine since this morning, can I come today?”</p>'+
      '<div class="rv-hs"><span>Sent to</span><b>Julie Roy, nurse</b></div><div class="rv-hs"><span>Time to a person</span><b>40 s</b></div><div class="rv-hs"><span>Assistant said</span><b class="q">“A nurse is calling you now.”</b></div></div>'+
      '<p class="rv-rule">'+IC("check",14)+'The assistant gives no medical advice. It books, prepares and hands off.</p></aside></div></div>';
}
function uiRiveM(){
  return '<div class="ui x rv rv-m" style="width:390px;height:844px"><div class="rv-mh"><span class="rv-av">'+rMark(18)+'</span><p><b>Rive</b>Text message · 514 555 0142</p></div>'+
    '<div class="rv-thread">'+rChat(4)+'</div><div class="rv-input">Text / Texto<span>'+IC("chevd",16)+'</span></div></div>';
}

/* ============================== ESQUINA ==============================
   Supplier to New York bodegas (esquina: corner). Held to the portfolio standard in its own world: the corner deli.
   Kraft paper like the cases on the shelf, ink black, cobalt for the order and its total, the colour of the price gun.
   The mark is a corner bracket; the same corner marks the current page. Prices and counts set in mono like a
   receipt. Type: Familjen Grotesk / JetBrains Mono. */
var E_CO="#2346d8";
function eMark(s){return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 17V3h14" fill="none" stroke="currentColor" stroke-width="3"/><rect x="9" y="9" width="8" height="8" fill="'+E_CO+'"/></svg>'}
function eNav(on,depot){
  var L=depot?["Orders","Routes","Stores","Stock"]:["Order","Deliveries","Invoices","Help"];
  return '<nav class="es-nav'+(depot?" dp":"")+'"><span class="es-brand">'+eMark(18)+'esquina'+(depot?'<em>Depot · Bronx</em>':'')+'</span><span class="es-links">'+L.map(function(t,i){return '<span'+(i===on?' class="on"':'')+'>'+t+'</span>'}).join("")+'</span>'+
    (depot?'<span class="es-me">MR</span>':'<span class="es-store">Rivera Deli · 163rd &amp; Amsterdam</span>')+'</nav>';
}
var E_USUAL=[["Coffee, regular grind","5 lb bag",4,38],["Whole milk","Gallon",12,64],["Eggs, large","15 dozen case",2,22],["Bread, white loaf","Each",18,51],["Water, 16.9 oz","24 pack",6,30],["Chips, variety","30 count",3,27],["Paper cups, 12 oz","Sleeve of 50",4,19]];
function eRows(compact){var mx=64;return E_USUAL.slice(0,7).map(function(r){return '<div class="es-row"><p><b>'+r[0]+'</b><span>'+r[1]+'</span></p>'+(compact?'':'<div class="es-sold"><i style="width:'+(r[3]/mx*100).toFixed(0)+'%"></i><em>'+r[3]+'</em></div>')+'<span class="es-qty"><i>−</i><b>'+r[2]+'</b><i>+</i></span></div>'}).join("")}
function uiEsquina(){
  return '<div class="ui x es" style="width:1200px;height:750px">'+eNav(0)+
    '<div class="es-v1"><div class="es-ph" style="background-image:url(img/esquina.jpg)"><header class="es-hero"><p class="es-eye">Tuesday, 6:12 am</p><h1>Your usual, ready to send.</h1></header></div>'+
    '<div class="es-order"><div class="es-oh"><p class="es-lbl">Your usual order</p><p class="es-lbl r">Sold last week</p><p class="es-lbl r">Order</p></div>'+eRows()+
      '<div class="es-off">'+IC("check",14)+'No signal. Saved on this phone, it sends when you’re back online.</div>'+
      '<div class="es-tot"><p><span>7 items · cash on delivery</span><b>$412.60</b></p><span class="es-btn">Send the usual</span></div></div></div></div>';
}
var E_STOPS=[["6:40","Depot"],["7:05","Ortiz Grocery"],["7:30","Rivera Deli",1],["7:55","Sunrise Market"],["8:20","La Esquina Deli"],["8:50","Depot"]];
function uiEsquinaDelivery(){
  return '<div class="ui x es es-pg" style="width:1200px;height:750px">'+eNav(1)+
    '<div class="es-v2"><div class="es-main"><p class="es-eye d">Order ES-58213<i>·</i>7 items</p><h1 class="es-h">Thursday, between 7 and 9 am.</h1><p class="es-sub">Before the morning rush. The driver texts you when he’s one stop away.</p>'+
      '<p class="es-lbl">Pick a window</p><div class="es-win">'+[["Thu","7–9 am",1],["Thu","11 am–1 pm",0],["Fri","7–9 am",0]].map(function(w){return '<span'+(w[2]?' class="on"':'')+'><em>'+w[0]+'</em><b>'+w[1]+'</b></span>'}).join("")+'</div>'+
      '<p class="es-lbl">Truck 4, Thursday’s route</p><div class="es-route">'+E_STOPS.map(function(s){return '<div class="'+(s[2]?"you":"")+'"><i></i><b>'+s[0]+'</b><span>'+s[1]+(s[2]?' · you':'')+'</span></div>'}).join("")+'</div>'+
      '<div class="es-arr"><p class="es-lbl">Your last 8 deliveries, arrival time</p><div class="es-band"><span class="w" style="left:16.7%;width:66.7%"><em>Your window, 7–9 am</em></span>'+[7.4,7.52,7.47,7.67,7.37,8.08,7.58,7.5].map(function(t,i){return '<i style="left:'+((t-6.5)/3*100).toFixed(1)+'%;top:'+(i%2?30:70)+'%"></i>'}).join("")+'</div><p class="es-ax"><span>6:30</span><span>7:00</span><span>8:00</span><span>9:00</span><span>9:30</span></p><p class="es-t">All eight arrived inside the window.</p></div></div>'+
    '<aside class="es-aside"><div class="es-cod"><p class="es-lbl">Cash on delivery</p><p class="es-big">$412.60</p><p>Count it with the driver. He gives you a printed receipt.</p></div>'+
      '<ul class="es-sum">'+[["Coffee, regular","4"],["Whole milk","12"],["Eggs, large","2"],["Bread, white","18"],["Water","6"],["Chips","3"],["Paper cups","4"]].map(function(i){return '<li><span>'+i[0]+'</span><b>× '+i[1]+'</b></li>'}).join("")+'</ul></aside></div></div>';
}
/* share of orders with a wrong or missing item, by week; the app launched in week 6 */
var E_ERR=[9.1,8.4,9.6,8.8,9.3,7.2,4.1,2.6,1.9,1.5,1.3,1.2];
function uiEsquinaDepot(){
  var W=640,H=320,L=42,T=14,B=26,x=function(i){return L+i*(W-L-12)/11},y=function(v){return T+(1-v/12)*(H-T-B)};
  var g=[0,4,8,12].map(function(v){return '<line x1="'+L+'" x2="'+(W-12)+'" y1="'+y(v)+'" y2="'+y(v)+'" class="g"/><text x="'+(L-8)+'" y="'+(y(v)+4)+'" text-anchor="end">'+v+'%</text>'}).join("");
  var xt=[0,3,6,9,11].map(function(i){return '<text x="'+x(i)+'" y="'+(H-6)+'" text-anchor="'+(i===11?"end":i?"middle":"start")+'">Wk '+(i+1)+'</text>'}).join("");
  var chart='<svg class="es-chart" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" aria-label="Wrong orders by week">'+g+xt+
    '<line x1="'+x(5)+'" x2="'+x(5)+'" y1="'+T+'" y2="'+(H-B)+'" class="mk"/><text x="'+(x(5)+8)+'" y="'+(T+12)+'" class="ink b">App launches</text>'+
    '<path d="M'+E_ERR.map(function(v,i){return x(i).toFixed(1)+" "+y(v).toFixed(1)}).join("L")+'" class="ln"/>'+E_ERR.map(function(v,i){return '<circle cx="'+x(i)+'" cy="'+y(v)+'" r="4"/>'}).join("")+
    '<text x="'+(x(11)-6)+'" y="'+(y(1.2)-12)+'" text-anchor="end" class="ink b">1.2%</text><text x="'+(x(2)+6)+'" y="'+(y(9.6)-10)+'" class="ink">9.6%</text></svg>';
  return '<div class="ui x es es-pg" style="width:1200px;height:750px">'+eNav(0,1)+
    '<div class="es-v3"><div class="es-main"><p class="es-eye d">Depot<i>·</i>Thursday picking</p><h1 class="es-h">Orders arrive right.</h1>'+
      '<div class="es-box"><p class="es-lbl">Orders with a wrong or missing item, by week</p>'+chart+'</div></div>'+
    '<aside class="es-aside"><p class="es-lbl">To pick for Thursday</p>'+[["Truck 4","Washington Heights",14,1],["Truck 2","Mott Haven",11,0],["Truck 7","Sunset Park",16,0]].map(function(t){return '<div class="es-tk'+(t[3]?" on":"")+'"><p><b>'+t[0]+'</b>'+t[1]+'</p><span>'+t[2]+' stores</span></div>'}).join("")+
      '<p class="es-lbl mt">Arrived from the app overnight</p><p class="es-big sm">41 orders</p><p class="es-n">None copied by hand. Each prints as a picking list, by aisle.</p></aside></div></div>';
}
function uiEsquinaM(){
  return '<div class="ui x es es-m" style="width:390px;height:844px"><div class="es-mtop"><span class="es-brand">'+eMark(17)+'esquina</span><span class="es-store">Rivera Deli</span></div>'+
    '<div class="es-off">'+IC("check",14)+'No signal. Your order is saved.</div>'+
    '<div class="es-mb"><p class="es-eye d">Tuesday, 6:12 am</p><h1 class="es-h">Your usual, ready to send.</h1>'+eRows(1)+'</div>'+
    '<div class="es-mtot"><p><span>7 items · cash</span><b>$412.60</b></p><span class="es-btn">Send the usual</span></div></div>';
}

/* ============================== ANADL ==============================
   A bilingual front door to mental health care in Wales (anadl: breath). Named and designed by the studio. Held to
   the portfolio standard in Anadl's own world: a still lake in morning mist. Mist paper, slate ink, heather for the
   brand, a serif that breathes (Instrument Serif) over Hanken Grotesk, with Geist Mono for times and prices.
   Every line is in Welsh and English. The mark is a breath ring; the crisis line is on every screen.
   Feelings palette validated with the dataviz script (contrast WARN relieved by visible labels and counts). */
var N_HE="#5e4b7d",N_FEEL=[["Calm","Tawel","#26966a"],["Tired","Blinedig","#c98a00"],["Anxious","Pryderus","#cf4a6a"],["Low","Isel","#5b62d6"]];
function aMark2(s,c){c=c||N_HE;return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="'+c+'" stroke-width="1.6" opacity=".45"/><circle cx="10" cy="10" r="4.6" fill="'+c+'"/></svg>'}
function anNav(on,light){
  return '<nav class="an-nav'+(light?" lt":"")+'"><span class="an-brand">'+aMark2(20,light?"#fff":null)+'anadl</span><span class="an-links">'+[["Check in","Gwirio"],["Journal","Dyddiadur"],["Talk to someone","Siarad"]].map(function(t,i){return '<span'+(i===on?' class="on"':'')+'>'+t[0]+'<em>'+t[1]+'</em></span>'}).join("")+'</span>'+
    '<span class="an-lang"><b>Cymraeg</b> / English</span><span class="an-sos">Need help now? <b>116 123</b></span></nav>';
}
function uiAnadl(){
  return '<div class="ui x an" style="width:1200px;height:750px"><div class="an-photo" style="background-image:url(img/anadl.jpg)"></div>'+anNav(-1,1)+
    '<header class="an-hero"><h1>Start with a breath, not a form.</h1><p class="an-cy">Dechrau gydag anadl, nid ffurflen.</p></header>'+
    '<section class="an-check"><p class="an-q">How are you today? <em>Sut wyt ti heddiw?</em></p><div class="an-feels">'+N_FEEL.map(function(f,i){return '<span'+(i===1?' class="on"':'')+'><i style="background:'+f[2]+'"></i>'+f[0]+'<em>'+f[1]+'</em></span>'}).join("")+'<span><i class="ns"></i>Not sure<em>Ddim yn siŵr</em></span></div>'+
      '<p class="an-fine">No account needed. Nothing is saved until you choose to.</p></section></div>';
}
/* the last four weeks of check-ins; null = a day without one (no streaks, no scores) */
var N_DAYS=[0,1,null,1,2,0,0, 1,1,null,2,2,3,0, null,0,1,1,null,0,0, 2,1,0,null,1,0,1];
function uiAnadlJournal(){
  var cnt=[0,0,0,0];N_DAYS.forEach(function(d){if(d!==null)cnt[d]++});
  var cal=N_DAYS.map(function(d,i){return '<i'+(d===null?' class="e"':' style="background:'+N_FEEL[d][2]+'"')+'>'+(i===27?'<b>Today</b>':'')+'</i>'}).join("");
  return '<div class="ui x an an-pg" style="width:1200px;height:750px">'+anNav(1)+
    '<div class="an-v2"><div class="an-main"><p class="an-eye">Thursday evening · Nos Iau</p><p class="an-done"><i style="background:'+N_FEEL[1][2]+'"></i>You checked in: <b>tired</b>, because of <b>work</b></p>'+
      '<h1 class="an-h">What would make tomorrow a little lighter?</h1><p class="an-cy d">Beth fyddai’n gwneud yfory ychydig yn ysgafnach?</p>'+
      '<div class="an-write">Leaving on time, for once. And telling Ffion I can’t take the extra shift<i></i></div>'+
      '<div class="an-guard">'+aMark2(16)+'<p>Prompts are written with counsellors. Anadl never diagnoses. If you write about harming yourself, we show you people to talk to, straight away.</p></div></div>'+
    '<aside class="an-aside"><p class="an-lbl">Your last four weeks</p><div class="an-cal">'+cal+'</div><p class="an-cal-ax"><span>Mon</span><span>Sun</span></p>'+
      '<ul class="an-key">'+N_FEEL.map(function(f,i){return '<li><i style="background:'+f[2]+'"></i>'+f[0]+'<b>'+cnt[i]+(cnt[i]===1?' day':' days')+'</b></li>'}).join("")+'<li><i class="e"></i>No check-in<b>5 days</b></li></ul>'+
      '<p class="an-note">No streaks and no scores. Missing a day is fine.</p></aside></div>'+anSos()+'</div>';
}
function anSos(){return '<div class="an-sosbar"><p><b>Need to talk now?</b> Samaritans, free, day or night: <b>116 123</b><i>·</i>Text <b>SHOUT</b> to <b>85258</b></p><span>Angen siarad nawr?</span></div>'}
function uiAnadlTalk(){
  var C=[["Ffion Pritchard","Counsellor, BACP","Bangor, or online","Tue 10:00",["Cymraeg","English"],"£35",1],["Dr Owen Hughes","Psychotherapist","Online","Wed 18:30",["English"],"£55",0],["Elin Morgan","Counsellor, BACP","Cardiff, or online","Thu 12:15",["Cymraeg","English"],"Free with a GP referral",0]];
  return '<div class="ui x an an-pg" style="width:1200px;height:750px">'+anNav(2)+
    '<div class="an-v3"><p class="an-eye">Talk to someone · Siarad â rhywun</p><h1 class="an-h">Talk to someone this week.</h1>'+
      '<p class="an-filt">'+["Welsh-speaking","Online","Under £40","This week"].map(function(f,i){return '<span'+(i!==2?' class="on"':'')+'>'+f+'</span>'}).join("")+'</p>'+
      '<div class="an-cs">'+C.map(function(c){return '<div class="an-c'+(c[6]?" on":"")+'"><span class="an-av">'+c[0].split(" ").map(function(w){return w[0]}).slice(-2).join("")+'</span><p class="an-cn">'+c[0]+'</p><p class="an-cr">'+c[1]+'</p>'+
        '<p class="an-tags">'+c[4].map(function(t){return '<i>'+t+'</i>'}).join("")+'</p><dl><div><dt>Where</dt><dd>'+c[2]+'</dd></div><div><dt>Next</dt><dd>'+c[3]+'</dd></div><div><dt>Cost</dt><dd>'+c[5]+'</dd></div></dl><span class="an-btn">Book '+c[3].split(" ")[0]+'</span></div>'}).join("")+'</div></div>'+anSos()+'</div>';
}
function uiAnadlM(){
  return '<div class="ui x an an-m" style="width:390px;height:844px"><div class="an-photo" style="background-image:url(img/anadl.jpg)"></div>'+
    '<div class="an-mtop"><span class="an-brand">'+aMark2(18,"#fff")+'anadl</span><span class="an-lang"><b>CY</b> / EN</span></div>'+
    '<div class="an-ring"><i class="r3"></i><i class="r2"></i><i class="r1"></i><p><b>Breathe in</b><em>Anadlwch i mewn</em><span>4</span></p></div>'+
    '<p class="an-mcap">Four in, four hold, six out. Stop whenever you like.</p>'+
    '<div class="an-msos"><b>Need to talk now?</b> Samaritans <b>116 123</b></div></div>';
}

/* the screens: file name → function and native size (desktop views 1200×750, phone 390×844) */
var SCREENS={
  "aster-1":[uiAster,1200,750], "aster-2":[uiAsterConf,1200,750], "aster-3":[uiAsterCite,1200,750], "aster-m":[uiAsterM,390,844],
  "kyma-1":[uiKyma,1200,750], "kyma-2":[uiKymaAlert,1200,750], "kyma-3":[uiKymaDates,1200,750], "kyma-m":[uiKymaM,390,844],
  "morrow-1":[uiMorrow,1200,750], "morrow-2":[uiMorrowProof,1200,750], "morrow-3":[uiMorrowMap,1200,750], "morrow-m":[uiMorrowM,390,844],
  "northwind-1":[uiNorthwind,1200,750], "northwind-2":[uiNorthwindRules,1200,750], "northwind-3":[uiNorthwindReview,1200,750], "northwind-m":[uiNorthwindM,390,844],
  "common-ground-1":[uiCommon,1200,750], "common-ground-2":[uiCommonStep,1200,750], "common-ground-3":[uiCommonStaff,1200,750], "common-ground-m":[uiCommonM,390,844],
  "olive-1":[uiOlive,1200,750], "olive-2":[uiOliveId,1200,750], "olive-3":[uiOliveGoal,1200,750], "olive-m":[uiOliveM,390,844],
  "clara-1":[uiClara,1200,750], "clara-2":[uiClaraSurplus,1200,750], "clara-3":[uiClaraCost,1200,750], "clara-m":[uiClaraM,390,844],
  "rive-1":[uiRive,1200,750], "rive-2":[uiRivePrep,1200,750], "rive-3":[uiRiveStaff,1200,750], "rive-m":[uiRiveM,390,844],
  "esquina-1":[uiEsquina,1200,750], "esquina-2":[uiEsquinaDelivery,1200,750], "esquina-3":[uiEsquinaDepot,1200,750], "esquina-m":[uiEsquinaM,390,844],
  "anadl-1":[uiAnadl,1200,750], "anadl-2":[uiAnadlJournal,1200,750], "anadl-3":[uiAnadlTalk,1200,750], "anadl-m":[uiAnadlM,390,844]
};
