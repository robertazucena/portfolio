/* Nowhere — one home, read against your own week, with a viewing request */
(function () {
  "use strict";
  var U = AH.ui, $ = U.$, $$ = U.$$, esc = U.esc, fmt = AH.fmt, short = AH.short;
  var ST = AH.load(), ctx = AH.ctx(), A = ctx.anchors;
  var id = +(new URLSearchParams(location.search).get("id") || 1);
  var h = AH.byId(id) || AH.byId(1);
  var s = AH.score(h, ctx), m = s.m, yl = AH.yearsLeft(h), P = AH.LISTERS[h.lister] || AH.LISTERS.priya;
  document.title = "Nowhere | " + h.rooms + " in " + h.town;
  U.savedCount();

  /* typical travel among all homes, for the comparison line */
  var all = AH.listings().map(function (x) { return AH.score(x, ctx); });
  var hrs = all.map(function (x) { return x.hours; }).sort(function (a, b) { return a - b; }), median = hrs[Math.floor(hrs.length / 2)];
  var diff = s.hours - median;
  function totalHTML() { return "<b>" + s.hours.toFixed(1) + " h</b> a week on the road, " + (Math.abs(diff) < 0.2 ? "about the same as the typical home." : Math.abs(diff).toFixed(1) + " h " + (diff < 0 ? "less" : "more") + " than the typical home."); }
  function weekRows() {
    var maxMin = Math.max.apply(null, s.t.map(function (t) { return t.min; }).concat([40]));

    return A.map(function (a, i) {
    var r = AH.ROLES[a.role], t = s.t[i];
    return '<div class="week-row"><span><b>' + r.label + "</b><br>" + esc(a.place) + '</span><div class="week-bar" style="--c:' + r.c + '"><i style="--w:' + (t.min / maxMin * 100).toFixed(0) + '%"></i></div><span>' + t.min + " min<br>" + AH.trips(a) + "× a week</span></div>";
    }).join("");
  }
  var week = weekRows();



  function moneyHTML() {
    var cpfW = m.inst ? m.cpfPays / m.inst * 100 : 100;
    var ledger = "<div><dt>Asking price</dt><dd>" + fmt(h.price) + "</dd></div>" +
      m.grants.map(function (g) { return '<div class="plus"><dt>' + g.name + "</dt><dd>− " + fmt(g.v) + "</dd></div>"; }).join("") +
      "<div><dt>Stamp duty" + (AH.buyerOf(ctx.money.buyer).absd ? " incl. ABSD" : "") + "</dt><dd>" + fmt(m.duty) + "</dd></div>" +
      "<div><dt>Paid upfront from CPF and cash</dt><dd>" + fmt(Math.min(m.upfront, ctx.money.cpf + ctx.money.cash)) + "</dd></div>" +
      '<div class="total"><dt>Loan</dt><dd>' + fmt(m.loan) + "</dd></div>";
    return '<div class="split" aria-hidden="true"><i style="width:' + cpfW.toFixed(0) + '%;background:#242421"></i><i style="width:' + (100 - cpfW).toFixed(0) + '%;background:#242421"></i></div>' +
        '<div class="split-keys"><div><span><i style="background:#242421"></i>From CPF</span><b>' + fmt(m.cpfPays) + '</b></div><div><span><i style="background:#242421"></i>From your pocket</span><b>' + fmt(m.cash) + "</b></div></div>" +
        (m.over ? '<p class="runway-note" style="color:var(--over)">' + (m.shortfall ? "You'd need " + fmt(m.shortfall) + " more upfront." : "The loan is above what banks allow for your income.") + "</p>" : "") +
        (m.gt ? '<p class="runway-note"><b>' + fmt(m.gt) + "</b> in grants comes off the price for you.</p>" : "") +
        '<details class="more"><summary>Full breakdown</summary><dl class="ledger">' + ledger + "</dl></details>";
  }
  var aud = AH.audience(h), topFor = aud.filter(function (x) { return x.rank && x.rank <= 3; }).length;
  var works = {}; aud.forEach(function (x) { if (x.rank && x.rank <= 5) works[x.p.work] = (works[x.p.work] || 0) + 1; });
  var topWork = Object.keys(works).sort(function (a, b) { return works[b] - works[a]; })[0];

  function alsoHTML() {
    return all.filter(function (x) { return x.h.id !== h.id && !x.m.over; }).sort(function (a, b) { return b.fit - a.fit; }).slice(0, 3).map(function (x) {
        return '<li><a href="home.html?id=' + x.h.id + '"><b>' + esc(x.h.rooms + " · " + x.h.town) + "</b><span>" + fmt(x.h.price) + "</span><span>Fit " + x.fit + '</span><svg><use href="#i-chev"/></svg></a></li>';
      }).join("");
  }
  var ppsm = Math.round(h.price / h.sqm);
  var photos = h.photos.length >= 3 ? h.photos : h.photos.concat(["living", "kitchen"]).slice(0, 3);
  var saved = !!ST.saved[h.id];

  var ok = all.filter(function (x) { return !x.m.over; }).sort(function (a, b) { return b.fit - a.fit; });
  /* step through homes in the order the Find page showed them */
  var order = ok.map(function (x) { return x.h.id; });
  try { var bk = JSON.parse(sessionStorage.getItem("thathome:find") || "null"); if (bk && bk.list && bk.list.indexOf(h.id) > -1) order = bk.list; } catch (e) {}
  var rank = order.indexOf(h.id) + 1;
  var prev = rank > 1 ? order[rank - 2] : null, next = rank && rank < order.length ? order[rank] : null;
  function stepTo(id) { try { var b = JSON.parse(sessionStorage.getItem("thathome:find") || "null"); if (b) { b.hot = id; sessionStorage.setItem("thathome:find", JSON.stringify(b)); } } catch (e) {} }
  var two = function (n) { return ("0" + n).slice(-2); };
  var ch = function (n, t, idAttr) { return '<h2 class="ch-h"' + (idAttr ? ' id="' + idAttr + '"' : "") + "><span aria-hidden=\"true\">" + two(n) + "</span>" + t + "</h2>"; };

  /* one column you read top to bottom, the map of your week beside it */
  $("[data-home]").insertAdjacentHTML("beforeend",
    '<div class="hp-col">' +
      '<div class="hp-top tone-' + s.tone + '"><a class="back" href="find.html"><svg><use href="#i-chev"/></svg>Back to your homes</a>' +
        '<div class="hp-rank">' + (rank ? '<nav class="hp-step" aria-label="Step through your homes">' +
          (prev ? '<a href="home.html?id=' + prev + '" data-step="' + prev + '" aria-label="Previous home"><svg><use href="#i-chev"/></svg></a>' : '<span class="off" aria-hidden="true"><svg><use href="#i-chev"/></svg></span>') +
          "<span><b>" + two(rank) + "</b> of " + order.length + " homes for you</span>" +
          (next ? '<a href="home.html?id=' + next + '" data-step="' + next + '" aria-label="Next home"><svg><use href="#i-chev"/></svg></a>' : '<span class="off" aria-hidden="true"><svg><use href="#i-chev"/></svg></span>') +
          "</nav>" : "") + '<span>Fit <b class="fit-n">' + s.fit + "</b></span></div></div>" +
      '<header class="hp-head rise tone-' + s.tone + '">' +
        '<h1 class="h1">' + esc(h.rooms) + " in " + esc(h.town) + "</h1>" +
        '<p class="muted">' + esc(h.street) + " · " + esc(h.mrt) + " MRT, " + h.min + " min walk</p>" +
        '<div class="hp-price"><strong>' + fmt(h.price) + "</strong><span>" + (m.over ? "Above what you can borrow" : m.cash < 1 ? "$0 cash a month, CPF covers it" : fmt(m.cash) + " cash a month after CPF") + "</span></div>" +
        '<div class="hp-acts">' +
          '<a class="act act-book" href="#book"><svg aria-hidden="true"><use href="#i-cal"/></svg><span><b>Book a viewing</b><small>' + (P.kind === "owner" ? "See it with the owner, " : "See it in person with ") + esc(P.name) + ".</small></span></a>" +
          '<button type="button" class="act act-save" data-save aria-pressed="' + saved + '"><svg aria-hidden="true"><use href="#i-mark"/></svg><span><b data-save-t></b><small data-save-s></small></span></button>' +
        "</div>" +
        '<p class="hp-acts-note" data-save-note hidden><a href="shortlist.html">Compare on your shortlist</a></p>' +
      "</header>" +
      '<div class="media" data-media></div>' +

      '<section class="ch">' + ch(1, "Your week from here") +
        '<div class="week-grid"><div class="week">' + week + '</div><div class="map-box" data-map-box><div class="hp-map" id="mini" role="region" aria-label="Map of this home and your places"></div>' +
          '</div></div>' +
        '<p class="week-total">' + totalHTML() + "</p></section>" +

      '<section class="ch">' + ch(2, "Your money") +
        '<div data-money>' + moneyHTML() + '</div></section>' +

      '<section class="ch">' + ch(3, "The home") +
        '<p class="facts-line">' + [esc(h.type), h.beds + " bed", h.sqm + " m²", fmt(ppsm) + " per m²", esc(h.floor)].join("<i>·</i>") + "</p>" +
        (yl ? '<div class="runway"><i style="--w:' + yl + '%"></i><span class="l">' + yl + ' years of lease left</span><span class="r">99</span></div>' : '<p class="runway-note">Freehold. No lease clock.</p>') +
        '<p class="runway-note">' + h.saves + " people saved it. It's in the top 3 for " + topFor + " of " + aud.length + " buyers searching this week.</p></section>" +

      '<section class="ch book" id="book" aria-labelledby="book-h"><div data-book-body></div></section>' +

      '<section class="ch">' + ch(5, "Also fits your life") + '<ol class="also">' + alsoHTML() + "</ol></section>" +
    "</div>");

  AH.media($("[data-media]"), h);
  $$("[data-step]").forEach(function (a) { a.addEventListener("click", function () { stepTo(+a.dataset.step); }); });

  /* ---------- booking ---------- */
  var DAYS = [], d0 = new Date(); d0.setHours(0, 0, 0, 0);
  for (var i = 1; i <= 6; i++) DAYS.push(new Date(d0.getTime() + i * 86400000));
  var TIMES = [10, 11, 14, 17, 19, 20];
  var B = { day: 1, time: null };
  var taken = ST.enquiries.filter(function (e) { return e.listing === h.id && e.state !== "declined"; }).map(function (e) { return e.at; });
  var mine = ST.enquiries.filter(function (e) { return e.listing === h.id && e.pool === -1; })[0];
  var first = P.name.split(" ")[0];
  var defaultMsg = "Hi " + (P.kind === "owner" ? "Mr " + P.name.split(" ")[0] : first) + ", we're a " + AH.buyerOf(ctx.money.buyer).sub.toLowerCase() + " looking for our " + (ctx.money.buyer === "upgrade" ? "next" : "first") + " home. Could we view this one?";

  function bookForm() {
    var at = function (t) { var d = new Date(DAYS[B.day]); d.setHours(t, 0, 0, 0); return d.getTime(); };
    $("[data-book-body]").innerHTML =
      ch(4, "Book a viewing", "book-h") + '<p class="lead">With ' + esc(P.name) + ", " + (P.kind === "owner" ? "the owner" : esc(P.firm)) + ". Pick a time and " + esc(first) + " confirms it here.</p>" +
      '<div class="days" role="radiogroup" aria-label="Day">' + DAYS.map(function (d, k) {
        return '<button type="button" role="radio" data-day="' + k + '" aria-checked="' + (k === B.day) + '">' + d.toLocaleDateString("en-SG", { weekday: "short" }) + "<b>" + d.getDate() + "</b></button>";
      }).join("") + "</div>" +
      '<div class="times" role="radiogroup" aria-label="Time">' + TIMES.map(function (t) {
        var busy = taken.indexOf(at(t)) > -1;
        return '<button type="button" role="radio" data-time="' + t + '" aria-checked="' + (t === B.time) + '"' + (busy ? " disabled aria-label=\"" + (t > 12 ? t - 12 : t) + (t >= 12 ? " pm" : " am") + ', taken"' : "") + ">" + (t > 12 ? t - 12 : t) + (t >= 12 ? " pm" : " am") + "</button>";
      }).join("") + "</div>" +
      '<label class="q" style="margin-top:12px"><span>Message</span><textarea data-msg>' + esc(defaultMsg) + "</textarea></label>" +
      '<label class="share"><input type="checkbox" data-share checked><span><b>Share my fit summary</b><small>Your places, travel times and fit score. Never your income or savings.</small></span></label>' +
      '<button type="button" class="btn primary" data-send' + (B.time ? "" : " disabled") + ">" + (B.time ? "Request " + DAYS[B.day].toLocaleDateString("en-SG", { weekday: "short", day: "numeric" }) + ", " + (B.time > 12 ? B.time - 12 : B.time) + (B.time >= 12 ? " pm" : " am") : "Pick a time") + "</button>";
  }
  function sentState(e) {
    // a ticket for the viewing: who and where, when as a calendar leaf, and the three steps from request to visit
    var d = new Date(e.at), ok = e.state === "confirmed";
    var leaf = '<div class="sent-leaf" aria-hidden="true"><small>' + d.toLocaleDateString("en-SG", { month: "short" }) + "</small><b>" + d.getDate() + "</b><small>" + d.toLocaleDateString("en-SG", { weekday: "short" }) + "</small></div>";
    var row = function (k, v) { return "<div><dt>" + k + "</dt><dd>" + v + "</dd></div>"; };
    $("[data-book-body]").innerHTML = '<div class="sent">' + ch(4, ok ? "Viewing confirmed" : "Request sent", "book-h") +
      '<div class="sent-card">' +
        '<div class="sent-top"><span class="tick"><svg><use href="#i-check"/></svg></span>' +
          "<p><b>" + (ok ? esc(first) + " confirmed your viewing" : "Sent to " + esc(first)) + "</b><small>" + (ok ? "It's in your viewings. See you there." : esc(P.reply || "They reply here, not by phone.")) + "</small></p>" +
          '<span class="sent-st' + (ok ? " is-ok" : "") + '"><i></i>' + (ok ? "Confirmed" : "Awaiting reply") + "</span></div>" +
        '<div class="sent-when">' + leaf + "<dl>" + row("Time", d.toLocaleTimeString("en-SG", { hour: "numeric", minute: "2-digit" })) + row("Where", esc(h.street) + ", " + esc(h.town)) + row("With", esc(P.name)) + "</dl></div>" +
        '<ol class="sent-steps" aria-label="What happens next"><li class="done">Requested</li><li class="' + (ok ? "done" : "now") + '">' + esc(first) + " confirms</li><li>You view it</li></ol>" +
      "</div>" +
      '<div class="sent-acts"><a class="btn primary" href="viewings.html?id=' + e.id + '">Track it in your viewings<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>' +
        '<a class="sent-alt" href="agent.html?as=' + esc(h.lister) + '">See it from ' + esc(first) + "'s side</a></div></div>";
  }
  if (mine) sentState(mine); else bookForm();

  $("[data-book-body]").addEventListener("click", function (e) {
    var d = e.target.closest("[data-day]"), t = e.target.closest("[data-time]"), go = e.target.closest("[data-send]");
    var msg = $("[data-msg]") ? $("[data-msg]").value : "";
    if (d) { B.day = +d.dataset.day; B.time = null; bookForm(); $("[data-msg]").value = msg; $('[data-day="' + B.day + '"]').focus(); }
    if (t && !t.disabled) { B.time = +t.dataset.time; bookForm(); $("[data-msg]").value = msg; $('[data-time="' + B.time + '"]').focus(); }
    if (go && B.time) {
      var at = new Date(DAYS[B.day]); at.setHours(B.time, 0, 0, 0);
      var en = AH.addEnquiry({ pool: -1, listing: h.id, msg: msg.trim().slice(0, 600) || defaultMsg, at: at.getTime(), share: $("[data-share]").checked });
      sentState(en); U.toast("Viewing request sent to " + first);
    }
  });

  $("[data-save]").addEventListener("click", function (e) {
    var b = e.currentTarget, on = !ST.saved[h.id];
    if (on) ST.saved[h.id] = 1; else delete ST.saved[h.id];
    AH.save(); U.savedCount();
    b.setAttribute("aria-pressed", on); saveLabel();
    U.toast(on ? "Saved privately. The agent isn't told." : "Removed from your shortlist");
  });
  function saveLabel() {
    var on = !!ST.saved[h.id], n = Object.keys(ST.saved).length;
    $("[data-save-t]").textContent = on ? "On your shortlist" : "Save to shortlist";
    $("[data-save-s]").textContent = on ? (n === 1 ? "1 home saved to compare" : n + " homes saved to compare") : "Keep it to compare. Nobody is told.";
    $("[data-save-note]").hidden = !on;
  }
  saveLabel();

  /* phone booking bar */
  var bar = $("[data-mbar]");
  bar.hidden = false;
  bar.innerHTML = "<div><b>" + fmt(h.price) + '</b><br><small class="muted">Fit ' + s.fit + '</small></div><a class="btn primary" href="#book">Book a viewing</a>';

  /* ---------- mini map ---------- */
  var LF = window.L, mp = null, drawPlaces = function () {};
  function fitMini(big, fly) {
    if (!mp) return;
    var bounds = LF.latLngBounds([[h.lat, h.lng]].concat(A.map(function (a) { return [a.lat, a.lng]; }))), pb = matchMedia("(min-width: 861px)").matches ? 230 : 54, opt = big ? { paddingTopLeft: [60, 60], paddingBottomRight: [60, pb] } : { paddingTopLeft: [36, 54], paddingBottomRight: [54, pb] };
    if (fly) mp.flyToBounds(bounds, Object.assign({ duration: 0.9, easeLinearity: 0.2 }, opt)); else mp.fitBounds(bounds, opt);
  }
  if (LF) {
    mp = LF.map("mini", { zoomControl: false, scrollWheelZoom: false, attributionControl: true });
    LF.tileLayer("https://www.onemap.gov.sg/maps/tiles/Grey/{z}/{x}/{y}.png", { minZoom: 11, maxZoom: 19, detectRetina: true,
      attribution: '<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener">OneMap</a> &copy; contributors | <a href="https://www.sla.gov.sg/" target="_blank" rel="noopener">Singapore Land Authority</a>' }).addTo(mp);
    LF.control.zoom({ position: "bottomright" }).addTo(mp);
    AH.mrtLayer(LF, mp, h.mrt);
    var tag = function (html) { return LF.divIcon({ className: "hm", html: html, iconSize: null }); };
    var places = LF.layerGroup().addTo(mp);
    drawPlaces = function () {
      places.clearLayers();
      A.forEach(function (a, i) {
        var r = AH.ROLES[a.role];
        LF.polyline([[h.lat, h.lng], [a.lat, a.lng]], { color: r.c, weight: 3, dashArray: "2 8", lineCap: "round", className: "link-line", interactive: false }).addTo(places);
        LF.marker([(h.lat + a.lat) / 2, (h.lng + a.lng) / 2], { icon: tag('<span class="link-tag" style="--c:' + r.c + '">' + s.t[i].min + " min</span>"), interactive: false, keyboard: false }).addTo(places);
        LF.marker([a.lat, a.lng], { icon: tag('<span class="pin" style="--c:' + r.c + '"><b>' + AH.roleIcon(r) + "</b><em>" + esc(a.place) + "</em></span>"), interactive: false, keyboard: false }).addTo(places);
      });
    };
    drawPlaces();
    LF.marker([h.lat, h.lng], { icon: tag('<span class="home-pin"><svg><use href="#i-home"/></svg></span>'), interactive: false, keyboard: false, zIndexOffset: 1000 }).addTo(mp);
    fitMini(false);
  }

  /* the map is always open: a panel on the right on wide screens, a tall map in the page on phones */
  var box = $("[data-map-box]"), slot = box.parentNode, main = $("[data-home]"), wide = matchMedia("(min-width: 861px)");
  function lay() {
    // wide: the map leaves the details and sits beside them in the page wrapper
    (wide.matches ? main : slot).appendChild(box);
    box.classList.toggle("is-full", wide.matches); document.body.classList.toggle("map-open", wide.matches);
    if (mp) { mp.invalidateSize(); wide.matches ? mp.scrollWheelZoom.enable() : mp.scrollWheelZoom.disable(); fitMini(wide.matches); }
  }
  lay(); wide.addEventListener("change", lay);

  /* your places, editable on the map itself: change one and this home re-scores */
  var opts = function (a) {
    var names = Object.keys(AH.ROLES[a.role].places).sort();
    return (names.indexOf(a.place) > -1 ? "" : "<option selected>" + esc(a.place) + "</option>") + names.map(function (n) { return "<option" + (n === a.place ? " selected" : "") + ">" + esc(n) + "</option>"; }).join("");
  };
  var ed = document.createElement("div");
  ed.className = "map-edit"; ed.setAttribute("role", "group"); ed.setAttribute("aria-label", "Your places");
  function renderEd() {
  ed.innerHTML = '<p class="me-h"><b>Your places</b>' + (A.length < 4 ? '<button type="button" class="me-add" data-ed-add><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Add a place</button>' : "") + "</p><ul>" + A.map(function (a, i) {
    var r = AH.ROLES[a.role];
    return '<li style="--c:' + r.c + '"><span class="me-ic" aria-hidden="true">' + AH.roleIcon(r) + '</span><select data-ed-place="' + i + '" aria-label="' + esc(r.label) + ' location">' + opts(a) + "</select>" +
      '<button type="button" class="me-f" data-ed-freq="' + i + '" aria-label="' + esc(r.label) + ", " + a.freq + ', tap to change">' + (a.freq === "daily" ? "Daily" : "Weekly") + "</button>" +
      (A.length > 1 ? '<button type="button" class="me-x" data-ed-x="' + i + '" aria-label="Remove ' + esc(r.label + ", " + a.place) + '"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' : "") + "</li>";
  }).join("") + "</ul>";
  }
  renderEd();
  box.appendChild(ed);
  // re-score in place: only what depends on your places redraws, the page and the map stay put
  function rescore(focus) {
    AH.save();
    ctx = AH.ctx(); s = AH.score(h, ctx); m = s.m;
    all = AH.listings().map(function (x) { return AH.score(x, ctx); });
    hrs = all.map(function (x) { return x.hours; }).sort(function (a, b) { return a - b; }); median = hrs[Math.floor(hrs.length / 2)]; diff = s.hours - median;
    $(".week").innerHTML = weekRows();
    $(".week-total").innerHTML = totalHTML();
    $("[data-money]").innerHTML = moneyHTML();
    $(".also").innerHTML = alsoHTML();
    $$(".fit-n").forEach(function (n) { n.textContent = s.fit; });
    var pl = $(".hp-price span"); if (pl) pl.textContent = m.over ? "Above what you can borrow" : m.cash < 1 ? "$0 cash a month, CPF covers it" : fmt(m.cash) + " cash a month after CPF";
    drawPlaces(); if (mp) fitMini(wide.matches, true);
    renderEd();
    var f = focus && $(focus, ed); if (f) f.focus({ preventScroll: true });
  }
  ed.addEventListener("change", function (e) {
    var i = e.target.dataset.edPlace; if (i == null) return;
    var a = A[+i], p = AH.ROLES[a.role].places[e.target.value]; if (!p) return;
    a.place = e.target.value; a.lat = p[0]; a.lng = p[1]; rescore('[data-ed-place="' + i + '"]');
  });
  ed.addEventListener("click", function (e) {
    var f = e.target.closest("[data-ed-freq]"), x = e.target.closest("[data-ed-x]"), add = e.target.closest("[data-ed-add]");
    if (f) { var a = A[+f.dataset.edFreq]; a.freq = a.freq === "daily" ? "weekly" : "daily"; rescore('[data-ed-freq="' + f.dataset.edFreq + '"]'); }
    if (x && A.length > 1) { A.splice(+x.dataset.edX, 1); rescore(A.length < 4 ? "[data-ed-add]" : null); }
    if (add && A.length < 4) {
      // the first kind of place you haven't pinned yet, at its first option; you pick the real one in the row
      var role = ["work", "parents", "school", "other"].filter(function (k) { return !A.some(function (a) { return a.role === k; }); })[0] || "other";
      var place = Object.keys(AH.ROLES[role].places).sort()[0], p = AH.ROLES[role].places[place];
      ST.uid = (ST.uid || 100) + 1;
      A.push({ id: ST.uid, role: role, place: place, freq: "weekly", lat: p[0], lng: p[1] });
      rescore('[data-ed-place="' + (A.length - 1) + '"]');
    }
  });

  if (location.hash === "#book") { var bk = $("#book"); if (bk) bk.scrollIntoView({ block: "start" }); }
})();
