/* Nowhere — workspace for agents and owners: listings, viewing requests with each buyer's fit, and viewings */
(function () {
  "use strict";
  var U = AH.ui, $ = U.$, $$ = U.$$, esc = U.esc, fmt = AH.fmt;
  var ST = AH.load(), q = new URLSearchParams(location.search);
  if (q.get("as") && AH.LISTERS[q.get("as")]) { ST.me = q.get("as"); AH.save(); }
  var newId = +q.get("new") || 0;
  var V = { view: q.get("view") || (newId ? "units" : "units"), thread: null };

  function me() { return AH.LISTERS[ST.me] || AH.LISTERS.priya; }
  function mine() { return AH.listings(true).filter(function (h) { return h.lister === ST.me; }); }
  function myEnquiries() {
    var ids = mine().map(function (h) { return h.id; });
    return ST.enquiries.filter(function (e) { return ids.indexOf(e.listing) > -1; });
  }
  function buyerOf(e) {
    if (e.pool === -1) {
      var c = AH.ctx();
      return { name: "Robert A.", tag: AH.buyerOf(c.money.buyer).sub, ctx: c, work: (c.anchors.filter(function (a) { return a.role === "work"; })[0] || {}).place };
    }
    var p = AH.POOL[e.pool] || AH.POOL[0];
    return { name: p.name, tag: p.tag, ctx: AH.poolCtx(p), work: p.work };
  }
  function initials(n) { return n.split(/[\s&.]+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase(); }

  /* ---------- shell ---------- */
  $("[data-ws]").innerHTML =
    '<aside class="side"><div class="who"><span class="av" data-av></span><div style="min-width:0"><b data-name></b><small data-role></small></div></div>' +
      '<label class="switch"><span>VIEWING AS</span><select data-as>' + Object.keys(AH.LISTERS).map(function (k) { var p = AH.LISTERS[k]; return '<option value="' + k + '">' + esc(p.name) + (p.kind === "owner" ? " (owner)" : " (agent)") + "</option>"; }).join("") + "</select></label>" +
      '<nav aria-label="Workspace sections"><button type="button" data-v="units">Listings</button><button type="button" data-v="leads">Viewing requests <span data-badge hidden></span></button><button type="button" data-v="cal">Viewings</button><button type="button" data-v="offers">Offers <span data-obadge hidden></span></button></nav>' +
      '<a class="btn primary" href="list.html"><svg><use href="#i-plus"/></svg>List a home</a></aside>' +
    '<main class="ws-main" id="main"><div class="ws-head"><div><h1 class="h1" data-hello></h1><p class="muted" data-hello-sub></p></div></div>' +
      '<div class="kpis" data-kpis></div>' +
      '<section class="view" data-view="units" aria-label="Listings"></section>' +
      '<section class="view" data-view="leads" aria-label="Viewing requests"></section>' +
      '<section class="view" data-view="cal" aria-label="Viewings"></section>' +
      '<section class="view" data-view="offers" aria-label="Offers"></section></main>';

  function paint() {
    var p = me(), en = myEnquiries(), list = mine();
    $("[data-me]").textContent = p.initials;
    $("[data-av]").textContent = p.initials; $("[data-av]").classList.toggle("owner", p.kind === "owner");
    $("[data-name]").textContent = p.name; $("[data-role]").textContent = p.firm; $("[data-as]").value = p.id;
    var hr = new Date().getHours();
    $("[data-hello]").textContent = (hr < 12 ? "Good morning, " : hr < 18 ? "Good afternoon, " : "Good evening, ") + p.name.split(" ")[0];
    var fresh = en.filter(function (e) { return e.state === "new"; }).length;
    $("[data-hello-sub]").textContent = fresh ? fresh + (fresh === 1 ? " viewing request needs" : " viewing requests need") + " a reply." : "You're all caught up.";
    var badge = $("[data-badge]"); badge.hidden = !fresh; badge.textContent = fresh;
    var oNew = myOffers().filter(function (o) { return o.state === "sent"; }).length, ob = $("[data-obadge]"); ob.hidden = !oNew; ob.textContent = oNew;
    var live = list.filter(function (h) { return h.status === "live"; }).length;
    var wk = en.filter(function (e) { return e.state === "confirmed" && e.at > Date.now() - 86400000 && e.at < Date.now() + 7 * 86400000; }).length;
    var saves = list.reduce(function (s, h) { return s + h.saves; }, 0);
    $("[data-kpis]").innerHTML =
      '<div class="kpi rise"><span>Live listings</span><b>' + live + "</b><small>" + list.length + " in total</small></div>" +
      '<div class="kpi rise"><span>Saved by buyers</span><b>' + saves + "</b><small>across your listings</small></div>" +
      '<div class="kpi rise"><span>New requests</span><b>' + fresh + "</b><small>" + en.length + " this month</small></div>" +
      '<div class="kpi rise"><span>Viewings this week</span><b>' + wk + "</b><small>confirmed</small></div>";
    $$("[data-v]").forEach(function (b) { b.setAttribute("aria-current", b.dataset.v === V.view ? "page" : "false"); });
    $$(".view").forEach(function (s) { s.classList.toggle("is-on", s.dataset.view === V.view); });
    if (V.view === "units") units(); else if (V.view === "leads") leads(); else if (V.view === "offers") offers(); else cal();
  }

  /* ---------- listings ---------- */
  var STATUS = [["live", "Live"], ["offer", "Under offer"], ["sold", "Sold"], ["draft", "Draft"]];
  function units() {
    var list = mine().sort(function (a, b) { return (b.id === newId) - (a.id === newId) || b.id - a.id; }), en = myEnquiries();
    var box = $('[data-view="units"]');
    if (!list.length) { box.innerHTML = '<div class="empty-big"><h2 class="h2">No listings yet</h2><p>List your first home. It takes about three minutes.</p><a class="btn primary" href="list.html">List a home</a></div>'; return; }
    box.innerHTML = '<div class="unit-head" aria-hidden="true"><span></span><span>Home</span><span>Views</span><span>Saves</span><span class="c-enq">Requests</span><span class="c-aud">Best match this week</span><span>Status</span></div>' +
      '<ul class="units">' + list.map(function (h, i) {
        var aud = AH.audience(h), top = aud.filter(function (x) { return x.rank && x.rank <= 3; });
        var w = {}; top.forEach(function (x) { w[x.p.work] = (w[x.p.work] || 0) + 1; });
        var topW = Object.keys(w).sort(function (a, b) { return w[b] - w[a]; })[0];
        var req = en.filter(function (e) { return e.listing === h.id; }).length;
        return '<li class="unit rise' + (h.id === newId ? " is-new" : "") + '" style="animation-delay:' + i * 50 + 'ms">' +
          '<img src="' + esc(AH.img(h.photos[0])) + '" alt="">' +
          '<div style="min-width:0"><b>' + esc(h.rooms + " · " + h.town) + "</b><small>" + esc(h.street) + " · " + fmt(h.price) + "</small></div>" +
          '<div class="stat"><b>' + h.views + "</b><small>views</small></div>" +
          '<div class="stat"><b>' + h.saves + "</b><small>saves</small></div>" +
          '<div class="stat c-enq"><b>' + req + "</b><small>requests</small></div>" +
          '<div class="aud-mini c-aud">' + (top.length ? "Top 3 for <b>" + top.length + " of " + aud.length + "</b> buyers" + (topW ? ", mostly working at <b>" + esc(topW) + "</b>" : "") : "Not in anyone's top 3 yet. Check the price guide.") + "</div>" +
          '<div><label class="sr-only" for="st' + h.id + '">Status</label><select class="status" id="st' + h.id + '" data-status="' + h.id + '">' + STATUS.map(function (s) { return '<option value="' + s[0] + '"' + (h.status === s[0] ? " selected" : "") + ">" + s[1] + "</option>"; }).join("") + "</select></div></li>";
      }).join("") + "</ul>";
  }
  $("[data-ws]").addEventListener("change", function (e) {
    var s = e.target.closest("[data-status]");
    if (s) { ST.status[+s.dataset.status] = s.value; AH.save(); U.toast(s.value === "live" ? "Back on Nowhere" : s.value === "draft" ? "Hidden from buyers" : "Status updated. Buyers who saved it will see this."); paint(); }
    if (e.target.matches("[data-as]")) { ST.me = e.target.value; AH.save(); V.thread = null; newId = 0; paint(); }
  });

  /* ---------- viewing requests ---------- */
  var LABEL = { "new": "New", confirmed: "Confirmed", proposed: "New time proposed", declined: "Not a fit" };
  function leads() {
    var en = myEnquiries().sort(function (a, b) { return (b.state === "new") - (a.state === "new") || b.sent - a.sent; });
    var box = $('[data-view="leads"]');
    if (!en.length) { box.innerHTML = '<div class="empty-big"><h2 class="h2">No requests yet</h2><p>When a buyer books a viewing, it lands here with how well the home fits their week.</p></div>'; return; }
    if (!V.thread || !en.some(function (e) { return e.id === V.thread; })) V.thread = en[0].id;
    box.innerHTML = '<div class="inbox"><div class="threads" role="list">' + en.map(function (e) {
      var b = buyerOf(e), h = AH.byId(e.listing);
      return '<button type="button" class="thread" role="listitem" data-t="' + e.id + '" aria-current="' + (e.id === V.thread) + '"><span class="t-top"><b>' + (e.state === "new" ? '<i class="dotnew" aria-hidden="true"></i><span class="sr-only">New: </span>' : "") + esc(b.name) + "</b><small>" + U.ago(e.sent) + "</small></span><small>" + esc(h ? h.rooms + " · " + h.town : "Listing removed") + " · " + LABEL[e.state] + "</small><p>" + esc(e.msg) + "</p></button>";
    }).join("") + '</div><div class="panel lead" data-lead></div></div>';
    lead();
  }
  function lead() {
    var e = ST.enquiries.filter(function (x) { return x.id === V.thread; })[0]; if (!e) return;
    var b = buyerOf(e), h = AH.byId(e.listing), s = AH.score(h, b.ctx);
    var fitHtml = e.share
      ? '<div class="lead-fit">' + U.ring(s.fit, s.tone) + "<div><p><b>" + (s.fit >= 70 ? "A strong fit for their week." : s.fit >= 50 ? "A workable fit for their week." : "A stretch for their week.") + "</b> " + s.hours.toFixed(1) + " hours of travel a week" + (s.m.gt ? ", and they'd qualify for grants" : "") + ".</p>" +
        '<div class="trips">' + U.trips(s, b.ctx.anchors) + "</div>" +
        '<p class="privacy" style="margin-top:8px"><svg><use href="#i-check"/></svg>' + (s.m.over ? "Outside their budget, based on their own figures." : "Within their budget, based on their own figures.") + " Income and savings are never shared.</p></div></div>"
      : '<div class="lead-fit"><div class="fit" style="--fc:#B9B2A3"><svg viewBox="0 0 50 50" aria-hidden="true"><circle class="bg" cx="25" cy="25" r="20"/></svg><b>?</b></div><p>They chose not to share their fit summary.</p></div>';
    $("[data-lead]").innerHTML =
      '<div class="lead-top"><div class="who"><span class="av" style="background:#3D5A8A" aria-hidden="true">' + esc(initials(b.name)) + "</span><div><b>" + esc(b.name) + "</b><small>" + esc(b.tag) + " · sent " + U.ago(e.sent) + "</small></div></div>" +
        '<span class="chip' + (e.state === "confirmed" ? " ok" : e.state === "declined" ? " bad" : e.state === "proposed" ? " warn" : " ink") + '">' + LABEL[e.state] + "</span></div>" +
      '<a class="sim" style="grid-template-columns:96px 1fr;align-items:center" href="home.html?id=' + h.id + '"><img src="' + esc(AH.img(h.photos[0])) + '" alt=""><span><b style="padding:0">' + esc(h.rooms + " · " + h.town) + "</b><br>" + esc(h.street) + "</span></a>" +
      '<p><b>Wants to view:</b> ' + U.when(e.at) + "</p>" +
      fitHtml +
      '<ol class="chat" aria-label="Conversation with ' + esc(b.name) + '">' + [{ from: "buyer", text: e.msg, t: e.sent }].concat(e.thread || []).map(function (m) {
        var mine = m.from === "lister";
        return '<li class="bub' + (mine ? " me" : "") + '"><span class="sr-only">' + (mine ? "You" : esc(b.name)) + ": </span>" + esc(m.text) + "<small>" + (mine ? "You" : esc(b.name.split(" ")[0])) + " · " + U.ago(m.t) + "</small></li>";
      }).join("") + "</ol>" +
      '<form class="compose" data-compose><label class="sr-only" for="reply">Reply to ' + esc(b.name) + '</label><textarea id="reply" rows="2" enterkeyhint="send" placeholder="Reply to ' + esc(b.name.split(" ")[0]) + '…" data-reply></textarea><button type="submit" class="btn primary">Send</button></form>' +
      (e.state === "new" || e.state === "proposed"
        ? '<div class="lead-actions"><button type="button" class="btn primary" data-act="confirmed">Confirm viewing</button><button type="button" class="btn ghost" data-act="proposed">Suggest the next day</button><button type="button" class="btn ghost" data-act="declined">Not a fit</button></div>'
        : '<div class="lead-actions"><button type="button" class="btn ghost" data-act="new">Undo</button></div>');
  }
  $("[data-ws]").addEventListener("click", function (e) {
    var v = e.target.closest("[data-v]"), t = e.target.closest("[data-t]"), act = e.target.closest("[data-act]"), ob = e.target.closest("[data-o]");
    if (ob) {
      var o = ST.offers.filter(function (x) { return x.id === +ob.dataset.oid; })[0], k = ob.dataset.o, now = Date.now();
      if (k === "accept") { o.state = "accepted"; o.accepted = now; o.done = 1; o.history.push({ from: "lister", note: "accepted " + fmt(o.amount), t: now }); U.toast("Offer accepted. The buyer sees the next steps."); }
      if (k === "counter") { o.state = "countered"; o.counter = +ob.dataset.mid; o.history.push({ from: "lister", note: "countered at " + fmt(o.counter), t: now }); U.toast("Counter-offer sent: " + fmt(o.counter)); }
      if (k === "decline") { o.state = "declined"; o.history.push({ from: "lister", note: "declined", t: now }); U.toast("Offer declined"); }
      AH.save(); paint(); return;
    }
    if (v) { V.view = v.dataset.v; paint(); }
    if (t) { V.thread = +t.dataset.t; $$("[data-t]").forEach(function (x) { x.setAttribute("aria-current", x === t); }); lead(); }
    if (act) {
      var en = ST.enquiries.filter(function (x) { return x.id === V.thread; })[0];
      if (act.dataset.act === "proposed") en.at += 86400000;
      en.state = act.dataset.act;
      var line = { confirmed: "Confirmed for " + U.when(en.at) + ". See you there.", proposed: "That time is taken. Would " + U.when(en.at) + " work instead?", declined: "Sorry, this home isn't the right fit for that time. Thank you for asking." }[en.state];
      if (line) AH.say(en, "lister", line);
      AH.save();
      U.toast(en.state === "confirmed" ? "Viewing confirmed. The buyer sees it straight away." : en.state === "proposed" ? "New time sent: " + U.when(en.at) : en.state === "declined" ? "Declined politely on your behalf" : "Moved back to new");
      paint();
    }
  });

  /* ---------- offers ---------- */
  function myOffers() { var ids = mine().map(function (h) { return h.id; }); return (ST.offers || []).filter(function (o) { return ids.indexOf(o.listing) > -1 && o.state !== "withdrawn"; }); }
  var OLABEL = { sent: ["New offer", " ink"], countered: ["You countered", " warn"], accepted: ["Accepted", " ok"], declined: ["Declined", " bad"] };
  function offers() {
    var list = myOffers().sort(function (a, b) { return (b.state === "sent") - (a.state === "sent") || b.sent - a.sent; });
    var box = $('[data-view="offers"]');
    if (!list.length) { box.innerHTML = '<div class="empty-big"><h2 class="h2">No offers yet</h2><p>When a buyer makes an offer, it lands here with what it means against your asking price.</p></div>'; return; }
    box.innerHTML = '<div class="offers">' + list.map(function (o) {
      var h = AH.byId(o.listing), off = (h.price - o.amount) / h.price * 100, mid = Math.round((o.amount + h.price) / 2 / 1000) * 1000, L = OLABEL[o.state];
      return '<article class="panel offer-c rise"><div class="lead-top"><a class="vw-home" href="home.html?id=' + h.id + '"><img src="' + esc(AH.img(h.photos[0])) + '" alt=""><span><b>' + esc(h.rooms + " · " + h.town) + "</b><small>" + esc(h.street) + " · asking " + fmt(h.price) + "</small></span></a>" +
        '<span class="chip' + L[1] + '">' + L[0] + "</span></div>" +
        '<p class="offer-amt"><b>' + fmt(o.amount) + "</b><span>from Robert A. · " + (Math.abs(off) < 0.05 ? "at asking" : Math.abs(off).toFixed(1) + "% " + (off > 0 ? "below" : "above") + " asking") + " · " + U.ago(o.sent) + "</span></p>" +
        (o.msg ? '<p class="msg">' + esc(o.msg) + "</p>" : "") +
        (o.state === "sent" ? '<div class="lead-actions"><button type="button" class="btn primary" data-o="accept" data-oid="' + o.id + '">Accept ' + AH.short(o.amount) + '</button><button type="button" class="btn ghost" data-o="counter" data-oid="' + o.id + '" data-mid="' + mid + '">Counter at ' + fmt(mid) + '</button><button type="button" class="btn ghost" data-o="decline" data-oid="' + o.id + '">Decline</button></div>'
          : o.state === "countered" ? '<p class="muted">Waiting for the buyer to answer your ' + fmt(o.counter) + ".</p>"
          : o.state === "accepted" ? '<p class="muted">Agreed. Grant the Option to Purchase next; the buyer sees the same steps.</p>' : "") + "</article>";
    }).join("") + "</div>";
  }

  $("[data-ws]").addEventListener("submit", function (e) {
    e.preventDefault();
    var box = $("[data-reply]"), text = box.value.trim(); if (!text) { box.focus(); return; }
    AH.say(ST.enquiries.filter(function (x) { return x.id === V.thread; })[0], "lister", text); AH.save(); lead(); $("[data-reply]").focus();
  });
  $("[data-ws]").addEventListener("keydown", function (e) {
    if (e.target.matches("[data-reply]") && e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); e.target.form.requestSubmit(); }
  });

  /* ---------- viewings ---------- */
  function ics(e, h, b) {
    var d = new Date(e.at), z = function (n) { return ("0" + n).slice(-2); };
    var st = d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + "T" + z(d.getHours()) + "0000";
    var en = d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + "T" + z(d.getHours()) + "4500";
    var body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Nowhere//Concept//EN", "BEGIN:VEVENT", "UID:thathome-" + e.id, "DTSTART:" + st, "DTEND:" + en, "SUMMARY:Viewing with " + b.name, "LOCATION:" + h.street + ", Singapore", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(body);
  }
  function cal() {
    var en = myEnquiries().filter(function (e) { return e.state === "confirmed" || e.state === "proposed"; }).sort(function (a, b) { return a.at - b.at; });
    var box = $('[data-view="cal"]');
    if (!en.length) { box.innerHTML = '<div class="empty-big"><h2 class="h2">No viewings booked</h2><p>Confirm a request and it shows up here, day by day.</p></div>'; return; }
    var days = {};
    en.forEach(function (e) { var k = new Date(e.at).toDateString(); (days[k] = days[k] || []).push(e); });
    box.innerHTML = '<div class="days-list">' + Object.keys(days).map(function (k) {
      var d = new Date(k);
      return '<div class="day"><h3>' + d.toLocaleDateString("en-SG", { weekday: "long", day: "numeric", month: "long" }) + "</h3><div style=\"display:grid;gap:8px\">" + days[k].map(function (e) {
        var h = AH.byId(e.listing), b = buyerOf(e), s = AH.score(h, b.ctx);
        return '<div class="slot"><time>' + new Date(e.at).toLocaleTimeString("en-SG", { hour: "numeric" }) + '</time><img src="' + esc(AH.img(h.photos[0])) + '" alt=""><div style="min-width:0"><b>' + esc(b.name) + "</b><small>" + esc(h.street) + " · " + (e.share ? "fit " + s.fit : "fit not shared") + (e.state === "proposed" ? " · waiting for them to accept" : "") + "</small></div>" +
          '<a class="mode" href="' + ics(e, h, b) + '" download="viewing-' + e.id + '.ics">Add to calendar</a></div>';
      }).join("") + "</div></div>";
    }).join("") + "</div>";
  }

  paint();
  if (newId) {
    var h = AH.byId(newId);
    if (h) {
      var top = AH.audience(h).filter(function (x) { return x.rank && x.rank <= 3; }).length;
      U.toast(h.status === "draft" ? "Saved as a draft" : "Live. It's in the top 3 for " + top + " buyers this week.");
    }
  }
})();
