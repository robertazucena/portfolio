/* Aurora Airlines prototype: router, state, components and pages.
   Data comes only from AuroraData (data.js); every flight, fare and booking is demonstration data. */
(function () {
  "use strict";
  var D = window.AuroraData;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var main = $("#main");
  var RM0 = window.matchMedia("(prefers-reduced-motion: reduce)").matches, RM = RM0;   // RM also follows the site's own "Reduce motion" setting

  /* =========================================================
     utilities
     ========================================================= */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmtTime(m) { m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function fmtDur(m) { return Math.floor(m / 60) + "h " + pad(m % 60) + "m"; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parse(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
  function today() { return iso(new Date()); }
  function validDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s || "") && !isNaN(parse(s)); }
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function fmtDate(s, long) { var d = parse(s); return DOW[d.getDay()] + " " + d.getDate() + " " + (long ? MONTH[d.getMonth()] : MON[d.getMonth()]) + (long ? " " + d.getFullYear() : ""); }
  function money(n) { return D.currency + " " + Math.round(n).toLocaleString("en-SG"); }
  function A(code) { return D.airport(code) || { code: code, city: code, name: "", country: "" }; }
  function cabinName(id) { return (D.cabins.filter(function (c) { return c.id === id; })[0] || D.cabins[0]).name; }
  function paxCount(p) { return p.adt + p.chd + p.inf; }
  function paxLabel(p) { var n = paxCount(p); return n + (n === 1 ? " traveller" : " travellers"); }
  function qs(o) { return Object.keys(o).filter(function (k) { return o[k] !== undefined && o[k] !== null && o[k] !== ""; }).map(function (k) { return k + "=" + encodeURIComponent(o[k]); }).join("&"); }
  function go(h) { if (location.hash === h) render(); else location.hash = h; }
  function icon(n) { return '<i class="ph ph-' + n + '" aria-hidden="true"></i>'; }
  var toastT;
  function toast(msg) { var t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("on"); }, 3200); }
  var store = {
    get: function (k, s) { try { return JSON.parse((s ? sessionStorage : localStorage).getItem(k)); } catch (e) { return null; } },
    set: function (k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, JSON.stringify(v)); } catch (e) { } }
  };

  /* signature: each flight drawn as an arc between its airports; the arc's height follows the duration */
  function arc(o) {
    o = o || {};
    var w = 200, h = o.h || 34, y = h - 4, lift = Math.max(7, Math.min((h - 6) / 2, (o.mins || 300) / 60 * 1.6));
    var d = "M6 " + y + " Q 100 " + (y - lift * 2) + " 194 " + y;
    function pt(t) { return [(1 - t) * (1 - t) * 6 + 2 * (1 - t) * t * 100 + t * t * 194, (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y - lift * 2) + t * t * y]; }
    var stops = "", i;
    for (i = 1; i <= (o.stops || 0); i++) { var p = pt(i / ((o.stops || 0) + 1)); stops += '<circle class="stop" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.4"/>'; }
    var flown, plane = "";
    if (o.progress != null) {
      var pr = Math.max(0, Math.min(1, o.progress)), segs = [];
      for (i = 0; i <= 24; i++) { var q = pt(pr * i / 24); segs.push((i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)); }
      flown = '<path class="flown" d="' + segs.join(" ") + '"/>';
      if (pr > 0 && pr < 1) { var a = pt(pr), b = pt(Math.min(1, pr + 0.01)), ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI; plane = '<path class="plane" transform="translate(' + a[0].toFixed(1) + " " + a[1].toFixed(1) + ") rotate(" + ang.toFixed(1) + ')" d="M7 0L-4 -4.2L-2 0L-4 4.2Z"/>'; }
    } else flown = '<path class="flown" d="' + d + '"/>';
    return '<svg class="route-arc" viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none" aria-hidden="true"><path class="base" d="' + d + '"/>' + flown + stops + '<circle class="end" cx="6" cy="' + y + '" r="3.6"/><circle class="end" cx="194" cy="' + y + '" r="3.6"/>' + plane + "</svg>";
  }

  /* =========================================================
     theme: night by default, day follows the system or the toggle
     ========================================================= */
  function theme() { return document.documentElement.getAttribute("data-theme") === "day" ? "day" : "night"; }
  function applyTheme(t, save) {
    if (t === "day") document.documentElement.setAttribute("data-theme", "day"); else document.documentElement.removeAttribute("data-theme");
    if (save) { try { localStorage.setItem("aurora.theme", t); } catch (e) { } }
    var b = $("#themeBtn"); b.innerHTML = icon(t === "day" ? "moon" : "sun"); b.setAttribute("aria-label", t === "day" ? "Switch to night theme" : "Switch to day theme");
    var m = $('meta[name="theme-color"]'); if (m) m.setAttribute("content", t === "day" ? "#EEF1F3" : "#0A0D12");
  }
  $("#themeBtn").addEventListener("click", function () { applyTheme(theme() === "day" ? "night" : "day", true); });
  applyTheme(theme(), false);

  /* =========================================================
     state
     ========================================================= */
  function defaults() {
    return { search: { trip: "return", from: "SIN", to: "", depart: addDays(today(), 14), ret: addDays(today(), 21), pax: { adt: 1, chd: 0, inf: 0 }, cabin: "economy" }, sel: { out: null, ret: null }, passengers: [], contact: { email: "", phone: "" } };
  }
  var S = store.get("aurora.state", true) || defaults();
  function save() { store.set("aurora.state", S, true); }
  function bookings() { return (store.get("aurora.bookings") || []).concat(D.demoBookings); }

  /* screens deep-linked from the portfolio arrive with no state: fill a believable demonstration trip */
  function ensureDemoTrip(stage) {
    var s = S.search;
    if (!s.to) { s.from = "SIN"; s.to = "HND"; s.trip = "return"; s.depart = addDays(today(), 14); s.ret = addDays(today(), 21); s.pax = { adt: 2, chd: 0, inf: 0 }; s.cabin = "business"; }
    if (!S.sel.out) { var o = D.search({ from: s.from, to: s.to, date: s.depart, cabin: s.cabin }).flights || []; if (o.length) S.sel.out = { id: o[Math.min(1, o.length - 1)].id, fare: 1 }; }
    if (s.trip === "return" && !S.sel.ret) { var r = D.search({ from: s.to, to: s.from, date: s.ret, cabin: s.cabin }).flights || []; if (r.length) S.sel.ret = { id: r[Math.min(2, r.length - 1)].id, fare: 1 }; }
    if (stage === "review" && !S.passengers.length) {
      S.passengers = [{ type: "adt", title: "Ms", first: "Mei Lin", last: "Tan" }, { type: "adt", title: "Mr", first: "Daniel", last: "Tan" }].slice(0, paxCount(s.pax));
      S.contact = { email: "mei.tan@example.com", phone: "+65 9123 4567" };
    }
    save();
  }
  function selected() {
    return { out: S.sel.out && D.findFlight(S.sel.out.id, S.search.cabin), ret: S.search.trip === "return" && S.sel.ret && D.findFlight(S.sel.ret.id, S.search.cabin) };
  }
  function totals() {
    var f = selected(), adult = 0;
    if (f.out) adult += f.out.prices[S.sel.out.fare];
    if (f.ret) adult += f.ret.prices[S.sel.ret.fare];
    return D.priceFor(adult, S.search.pax);
  }

  /* =========================================================
     search form: comboboxes, calendar, travellers
     ========================================================= */
  function searchForm(opts) {
    opts = opts || {};
    var s = S.search, one = s.trip === "oneway";
    return '<form class="search" novalidate data-search aria-label="Search flights">' +
      '<div class="search-top"><div class="seg" role="group" aria-label="Trip type"><button type="button" data-trip="return" aria-pressed="' + !one + '">Return</button><button type="button" data-trip="oneway" aria-pressed="' + one + '">One way</button></div>' +
      '<p class="search-note">Demonstration fares in ' + D.currency + ', shown per adult.</p></div>' +
      '<div class="search-grid' + (one ? " oneway" : "") + '">' + comboField("from", "From", s.from) +
      '<button type="button" class="swap" data-swap aria-label="Swap origin and destination">' + icon("arrows-left-right") + "</button>" + comboField("to", "To", s.to) +
      '<div class="field f-dates"><span class="flabel" id="lbl-dep">Depart</span><button type="button" class="field-btn" data-cal="depart" aria-labelledby="lbl-dep val-dep" aria-haspopup="dialog"><span id="val-dep">' + (s.depart ? fmtDate(s.depart) : '<span class="muted">Add date</span>') + "</span></button></div>" +
      (one ? "" : '<div class="field f-ret"><span class="flabel" id="lbl-ret">Return</span><button type="button" class="field-btn" data-cal="ret" aria-labelledby="lbl-ret val-ret" aria-haspopup="dialog"><span id="val-ret">' + (s.ret ? fmtDate(s.ret) : '<span class="muted">Add date</span>') + "</span></button></div>") +
      '<div class="field f-pax"><span class="flabel" id="lbl-pax">Travellers and cabin</span><button type="button" class="field-btn" data-paxbtn aria-labelledby="lbl-pax val-pax" aria-haspopup="dialog"><span id="val-pax">' + paxLabel(s.pax) + ", " + cabinName(s.cabin) + "</span></button></div>" +
      '<button class="btn btn-primary search-go" type="submit">' + icon("magnifying-glass") + (opts.cta || "Search") + "</button>" +
      '</div><div class="search-err" role="alert" hidden></div></form>';
  }
  function comboField(key, label, code) {
    var a = code && D.airport(code);
    return '<div class="field f-' + key + '"><label for="in-' + key + '">' + label + '</label><input class="combo" id="in-' + key + '" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="lb-' + key + '" autocomplete="off" spellcheck="false" placeholder="City or airport" value="' + esc(a ? a.city : "") + '">' +
      '<span class="sub" id="sub-' + key + '">' + (a ? a.code + ", " + esc(a.name) : "Where to?") + "</span></div>";
  }

  var openPop = null;
  function closePop(restoreFocus) { if (!openPop) return; var p = openPop; openPop = null; p.el.remove(); if (p.onClose) p.onClose(); if (restoreFocus && p.trigger) p.trigger.focus(); }
  document.addEventListener("pointerdown", function (e) { if (openPop && !openPop.el.contains(e.target) && !(openPop.anchor && openPop.anchor.contains(e.target))) closePop(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && openPop) { e.preventDefault(); closePop(true); } });
  function showPop(anchor, html, cls, trigger, onClose) {
    closePop(false);
    var el = document.createElement("div");
    el.className = "pop " + (cls || "") + (window.innerWidth <= 560 ? " sheet" : "");
    el.innerHTML = html; anchor.appendChild(el);
    if (window.innerWidth > 560 && el.getBoundingClientRect().right > window.innerWidth - 12) el.classList.add("right");   // grow from the side the trigger is on
    openPop = { el: el, anchor: anchor, trigger: trigger, onClose: onClose };
    return el;
  }

  function bindSearch(form, onSubmit) {
    if (!form) return;
    var s = S.search;
    function rerender() { var n = document.createElement("div"); n.innerHTML = searchForm({ cta: form.querySelector(".search-go").textContent }); var f = n.firstChild; form.replaceWith(f); bindSearch(f, onSubmit); return f; }
    $$("[data-trip]", form).forEach(function (b) { b.addEventListener("click", function () { s.trip = b.dataset.trip; if (s.trip === "return" && (!s.ret || s.ret < s.depart)) s.ret = addDays(s.depart, 7); save(); rerender().querySelector("[data-trip='" + s.trip + "']").focus(); }); });
    $("[data-swap]", form).addEventListener("click", function () { var t = s.from; s.from = s.to; s.to = t; save(); rerender().querySelector("[data-swap]").focus(); });
    ["from", "to"].forEach(function (k) { combobox(form, k); });
    $$("[data-cal]", form).forEach(function (b) { b.addEventListener("click", function () { calendar(form, b.dataset.cal, b); }); });
    $("[data-paxbtn]", form).addEventListener("click", function (e) { travellers(form, e.currentTarget); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var errs = [], bad = [];
      if (!s.from) { errs.push("Choose where you are flying from."); bad.push("from"); }
      if (!s.to) { errs.push("Choose a destination."); bad.push("to"); }
      if (s.from && s.from === s.to) { errs.push("Origin and destination are the same. Choose a different destination."); bad.push("to"); }
      if (!validDate(s.depart) || s.depart < today()) { errs.push("Choose a departure date from today onwards."); bad.push("dates"); }
      if (s.trip === "return" && (!validDate(s.ret) || s.ret < s.depart)) { errs.push("Your return date must be on or after your departure."); bad.push("ret"); }
      $$(".field", form).forEach(function (f) { f.classList.remove("has-error"); });
      var box = $(".search-err", form);
      if (errs.length) {
        bad.forEach(function (k) { var f = $(".f-" + k, form); if (f) f.classList.add("has-error"); });
        box.hidden = false; box.innerHTML = icon("warning-circle") + "<span>" + esc(errs[0]) + "</span>";
        var first = $(".f-" + bad[0] + " input, .f-" + bad[0] + " button", form); if (first) first.focus();
        return;
      }
      box.hidden = true; S.sel = { out: null, ret: null }; save();
      (onSubmit || function () { go("#/results?" + qs({ from: s.from, to: s.to, depart: s.depart, ret: s.trip === "return" ? s.ret : "", adt: s.pax.adt, chd: s.pax.chd, inf: s.pax.inf, cabin: s.cabin })); })();
    });
  }

  function combobox(form, key) {
    var field = $(".f-" + key, form), input = $("#in-" + key, form), sub = $("#sub-" + key, form), active = -1, list = [];
    function matches(q) {
      q = q.trim().toLowerCase();
      var other = S.search[key === "from" ? "to" : "from"];
      return D.airports.filter(function (a) { return !q || a.code.toLowerCase().indexOf(q) === 0 || a.city.toLowerCase().indexOf(q) === 0 || a.name.toLowerCase().indexOf(q) > -1 || a.country.toLowerCase().indexOf(q) === 0; })
        .sort(function (a, b) { return (a.code === other) - (b.code === other); });
    }
    function draw() {
      list = matches(input.value === (D.airport(S.search[key]) || {}).city ? "" : input.value);
      var html = list.length ? list.map(function (a, i) {
        return '<li role="option" id="op-' + key + "-" + a.code + '" data-code="' + a.code + '" aria-selected="' + (i === active) + '"><span class="code">' + a.code + '</span><span class="city">' + esc(a.city) + ", " + esc(a.country) + '</span><span class="air">' + esc(a.name) + "</span></li>";
      }).join("") : '<li class="empty" role="option" aria-disabled="true">No airports match “' + esc(input.value) + '”. Try a city or a three-letter code.</li>';
      /* listbox opens dozens of times per search, often from the keyboard: no entrance animation */
      var pop = openPop && openPop.trigger === input ? openPop.el : showPop(field, '<ul class="listbox" role="listbox" id="lb-' + key + '" aria-label="' + (key === "from" ? "Origin" : "Destination") + ' airports"></ul>', "instant", input, function () { input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); restore(); });
      $("ul", pop).innerHTML = html;
      input.setAttribute("aria-expanded", "true");
      if (active > -1 && list[active]) { input.setAttribute("aria-activedescendant", "op-" + key + "-" + list[active].code); var li = $("#op-" + key + "-" + list[active].code, pop); if (li) li.scrollIntoView({ block: "nearest" }); }
      else input.removeAttribute("aria-activedescendant");
      $$("li[data-code]", pop).forEach(function (li) { li.addEventListener("pointerdown", function (e) { e.preventDefault(); pick(li.dataset.code); }); });
    }
    function restore() { var a = D.airport(S.search[key]); input.value = a ? a.city : ""; }
    function pick(code) {
      S.search[key] = code; save();
      var a = D.airport(code); sub.textContent = a.code + ", " + a.name; field.classList.remove("has-error");
      closePop(false); input.value = a.city;
      var next = key === "from" ? $("#in-to", form) : $("[data-cal='depart']", form);
      if (next && !(key === "from" && S.search.to)) next.focus();
    }
    input.addEventListener("focus", function () { input.select(); active = -1; draw(); });
    input.addEventListener("input", function () { active = 0; draw(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); active = Math.min(list.length - 1, active + 1); draw(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(0, active - 1); draw(); }
      else if (e.key === "Enter") { if (openPop && list[active]) { e.preventDefault(); pick(list[active].code); } }
      else if (e.key === "Tab") { if (openPop && list[active] && input.value && input.value !== (D.airport(S.search[key]) || {}).city) pick(list[active].code); else closePop(false); }
    });
  }

  function calendar(form, which, trigger) {
    var s = S.search, range = s.trip === "return", min = today(), max = addDays(today(), 330);
    var picking = which, start = s.depart, end = range ? s.ret : null;
    var view = parse(which === "ret" && s.ret ? s.ret : (s.depart || min)); view.setDate(1);
    var focusDate = which === "ret" && s.ret ? s.ret : (s.depart || min);
    function month(y, m) {
      var first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate(), lead = (first.getDay() + 6) % 7, cells = "";
      for (var i = 0; i < lead; i++) cells += "<span></span>";
      for (var d = 1; d <= days; d++) {
        var ds = iso(new Date(y, m, d)), dis = ds < min || ds > max, cls = ["cal-day"];
        if (ds === today()) cls.push("today");
        if (ds === start) cls.push("start"); if (range && ds === end) cls.push("end");
        if (range && start && end && ds > start && ds < end) cls.push("in-range");
        cells += '<button type="button" class="' + cls.join(" ") + '" data-d="' + ds + '"' + (dis ? " disabled" : "") + ' tabindex="' + (ds === focusDate ? 0 : -1) + '" aria-pressed="' + (ds === start || (range && ds === end)) + '" aria-label="' + fmtDate(ds, true) + (ds === start ? ", departure" : "") + (range && ds === end ? ", return" : "") + '">' + d + "</button>";
      }
      return '<div class="cal-month"><h3>' + MONTH[m] + " " + y + '</h3><div class="cal-grid">' + ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(function (w) { return '<span class="dow" aria-hidden="true">' + w + "</span>"; }).join("") + cells + "</div></div>";
    }
    function html() {
      var y = view.getFullYear(), m = view.getMonth(), n = new Date(y, m + 1, 1);
      var hint = range && picking === "ret" ? "Now choose your return date" : "Choose your departure date";
      return '<div role="dialog" aria-label="' + (range ? "Choose travel dates" : "Choose a date") + '"><div class="cal-head"><p aria-live="polite">' + hint + '</p><div class="cal-nav"><button type="button" data-m="-1" aria-label="Previous month"' + (iso(view) <= min.slice(0, 8) + "01" ? " disabled" : "") + ">" + icon("caret-left") + '</button><button type="button" data-m="1" aria-label="Next month">' + icon("caret-right") + "</button></div></div>" +
        '<div class="cal-months">' + month(y, m) + month(n.getFullYear(), n.getMonth()) + "</div>" +
        '<div class="pop-foot"><span>' + (start ? fmtDate(start) : "Not set") + (range ? " to " + (end ? fmtDate(end) : "not set") + (start && end ? ", " + Math.round((parse(end) - parse(start)) / 864e5) + " nights" : "") : "") + '</span><button type="button" class="btn btn-primary btn-sm" data-done>Done</button></div></div>';
    }
    var pop = showPop(trigger.closest(".field"), "", "cal", trigger);
    function paint(focus) {
      pop.innerHTML = html();
      $$("[data-m]", pop).forEach(function (b) { b.addEventListener("click", function () { view.setMonth(view.getMonth() + +b.dataset.m); paint(); }); });
      $("[data-done]", pop).addEventListener("click", function () { commit(); closePop(true); });
      $$(".cal-day", pop).forEach(function (b) {
        b.addEventListener("click", function () { choose(b.dataset.d); });
        b.addEventListener("keydown", function (e) {
          var step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
          if (!step) return; e.preventDefault();
          var nd = addDays(b.dataset.d, step); if (nd < min || nd > max) return;
          focusDate = nd; var v = parse(nd); if (v.getMonth() !== view.getMonth() && v.getMonth() !== (view.getMonth() + 1) % 12) view = new Date(v.getFullYear(), v.getMonth(), 1);
          paint(true);
        });
      });
      if (focus) { var f = $(".cal-day[tabindex='0']", pop); if (f) f.focus(); }
    }
    function choose(ds) {
      focusDate = ds;
      if (!range) { start = ds; commit(); closePop(true); return; }
      if (picking === "depart" || (end && ds < start)) { start = ds; if (end && end < start) end = null; picking = "ret"; paint(true); return; }
      end = ds; commit(); paint(true);
    }
    function commit() {
      s.depart = start; if (range) s.ret = end || addDays(start, 7); save();
      $("#val-dep", form).textContent = fmtDate(s.depart); if (range && $("#val-ret", form)) $("#val-ret", form).textContent = fmtDate(s.ret);
      $$(".f-dates, .f-ret", form).forEach(function (f) { f.classList.remove("has-error"); });
    }
    paint(true);
  }

  function travellers(form, trigger) {
    var s = S.search;
    function row(k, label, note, min, max) {
      return '<div class="pax-row"><div><b id="pl-' + k + '">' + label + "</b><span>" + note + '</span></div><div class="stepper" role="group" aria-labelledby="pl-' + k + '"><button type="button" data-step="' + k + '" data-d="-1" aria-label="Remove one ' + label.toLowerCase() + '"' + (s.pax[k] <= min ? " disabled" : "") + ">" + icon("minus") + '</button><output aria-live="polite">' + s.pax[k] + '</output><button type="button" data-step="' + k + '" data-d="1" aria-label="Add one ' + label.toLowerCase() + '"' + (s.pax[k] >= max ? " disabled" : "") + ">" + icon("plus") + "</button></div></div>";
    }
    function html() {
      return '<div role="dialog" aria-label="Travellers and cabin">' + row("adt", "Adults", "12 years and over", 1, 9 - s.pax.chd) + row("chd", "Children", "2 to 11 years", 0, 9 - s.pax.adt) + row("inf", "Infants", "Under 2, on an adult’s lap", 0, s.pax.adt) +
        '<h4>Cabin</h4><div class="cabin-opts">' + D.cabins.map(function (c) { return '<button type="button" data-cabin="' + c.id + '" aria-pressed="' + (s.cabin === c.id) + '">' + c.name + "</button>"; }).join("") + "</div>" +
        '<p class="pax-note">Up to 9 seated travellers per booking. One infant per adult.</p><div class="pop-foot"><span>' + paxLabel(s.pax) + ", " + cabinName(s.cabin) + '</span><button type="button" class="btn btn-primary btn-sm" data-done>Done</button></div></div>';
    }
    var pop = showPop(trigger.closest(".field"), "", "pax", trigger);
    function paint(focusSel) {
      pop.innerHTML = html();
      $$("[data-step]", pop).forEach(function (b) { b.addEventListener("click", function () { var k = b.dataset.step; s.pax[k] += +b.dataset.d; if (s.pax.inf > s.pax.adt) s.pax.inf = s.pax.adt; save(); upd(); paint("[data-step='" + k + "'][data-d='" + b.dataset.d + "']"); }); });
      $$("[data-cabin]", pop).forEach(function (b) { b.addEventListener("click", function () { s.cabin = b.dataset.cabin; save(); upd(); paint("[data-cabin='" + s.cabin + "']"); }); });
      $("[data-done]", pop).addEventListener("click", function () { closePop(true); });
      var f = focusSel && $(focusSel, pop); if (f && !f.disabled) f.focus(); else if (!focusSel) { var first = $("button:not(:disabled)", pop); if (first) first.focus(); }
    }
    function upd() { $("#val-pax", form).textContent = paxLabel(s.pax) + ", " + cabinName(s.cabin); }
    paint();
  }

  /* =========================================================
     shared page parts
     ========================================================= */
  var STEPS = ["Flights", "Fare", "Travellers", "Review", "Confirmed"];
  function progress(i) { return '<ol class="progress" aria-label="Booking progress">' + STEPS.map(function (n, k) { return '<li class="' + (k < i ? "done" : "") + '"' + (k === i ? ' aria-current="step"' : "") + '><span class="sr">Step ' + (k + 1) + " of " + STEPS.length + ": </span>" + n + "</li>"; }).join("") + "</ol>"; }
  function routeHead(from, to, meta, extra) {
    var a = A(from), b = A(to);
    return '<div class="route-line"><span class="rl-code" aria-label="' + esc(a.city) + '">' + a.code + '</span><span class="rl-arc">' + arc({ mins: 600, h: 30 }) + '</span><span class="rl-code" aria-label="' + esc(b.city) + '">' + b.code + "</span>" + (extra || "") + '<p class="rl-meta">' + meta + "</p></div>";
  }
  function summaryPanel(opts) {
    opts = opts || {};
    var f = selected(), t = totals(), s = S.search;
    function leg(label, fl, sel) {
      if (!fl) return '<div class="sum-leg"><span class="k">' + label + '</span><span class="s">Not chosen yet</span></div>';
      return '<div class="sum-leg"><span class="k">' + label + ", " + fmtDate(fl.date) + '</span><span class="v">' + fl.from + " " + fmtTime(fl.dep) + "  " + fl.to + " " + fmtTime(fl.arr) + (fl.dayShift ? " +" + fl.dayShift : "") + '</span><span class="s">' + fmtDur(fl.mins) + ", " + (fl.stops ? "1 stop via " + fl.via.join(", ") : "nonstop") + ", " + cabinName(fl.cabin) + " " + D.fares[sel.fare].name + "</span></div>";
    }
    return '<aside class="summary" aria-label="Trip summary"><div class="summary-head"><h2>Your trip</h2><span class="demo-tag">Demo</span></div><div class="summary-body">' +
      leg("Outbound", f.out, S.sel.out) + (s.trip === "return" ? leg("Return", f.ret, S.sel.ret) : "") +
      '<div class="sum-leg"><span class="k">Travellers</span><span class="s">' + [s.pax.adt + " adult" + (s.pax.adt > 1 ? "s" : ""), s.pax.chd ? s.pax.chd + " child" + (s.pax.chd > 1 ? "ren" : "") : "", s.pax.inf ? s.pax.inf + " infant" + (s.pax.inf > 1 ? "s" : "") : ""].filter(Boolean).join(", ") + "</span></div></div>" +
      '<div class="sum-total">' + (f.out ? '<div class="sum-row"><span>Fares</span><span>' + money(t.fare) + '</span></div><div class="sum-row"><span>Taxes, fees and charges</span><span>' + money(t.taxes) + '</span></div><div class="sum-row total"><span>Total</span><b>' + money(t.total) + "</b></div>" : '<p class="sum-row">Choose a flight to see the total for everyone travelling.</p>') +
      (opts.cta ? '<button class="btn btn-primary" type="button" data-next>' + opts.cta + "</button>" : "") +
      '<p class="fine">Demonstration prices. No payment is taken.</p></div></aside>';
  }
  function mobileBar(cta) { var t = totals(); return '<div class="mobile-bar"><div><div class="mb-k">Total, all travellers</div><div class="mb-v">' + money(t.total) + '</div></div><button class="btn btn-primary" type="button" data-next>' + cta + "</button></div>"; }
  function itinerary(fl) {
    var rows = "";
    fl.legs.forEach(function (lg) {
      var a = A(lg.from), b = A(lg.to);
      rows += '<div class="itin-leg"><span class="it-time">' + fmtTime(lg.dep) + '</span><span class="it-rail"><span class="it-dot"></span></span><div class="it-body"><b>' + esc(a.city) + ' <span class="mono">' + a.code + "</span></b><p>" + esc(a.name) + "</p></div></div>";
      rows += '<div class="itin-leg fly"><span></span><span class="it-rail"></span><div class="it-body"><span class="mono">' + lg.flightNo + "</span>, " + D.aircraft[lg.aircraft] + ", " + fmtDur(lg.mins) + "</div></div>";
      rows += '<div class="itin-leg"><span class="it-time">' + fmtTime(lg.arr) + '</span><span class="it-rail"><span class="it-dot"></span></span><div class="it-body"><b>' + esc(b.city) + ' <span class="mono">' + b.code + "</span></b><p>" + esc(b.name) + "</p></div></div>";
      if (lg.layover) rows += '<div class="itin-leg lay"><span></span><span class="it-rail"></span><div class="it-body"><span class="lay-box">' + icon("clock") + fmtDur(lg.layover) + " connection in " + esc(b.city) + "</span></div></div>";
    });
    return '<div class="itin">' + rows + "</div>";
  }
  function bindNext(fn) { $$("[data-next]", main).forEach(function (b) { b.addEventListener("click", fn); }); }
  /* image reveal on first sight (Emil: clip-path inset, once) */
  var revealIO = window.IntersectionObserver ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); revealIO.unobserve(e.target); } }); }, { rootMargin: "0px 0px -12% 0px" }) : null;
  function watchReveals() { $$(".reveal", main).forEach(function (el) { if (revealIO && !RM) revealIO.observe(el); else el.classList.add("in"); }); }

  /* =========================================================
     pages
     ========================================================= */
  function home() {
    var dest = D.destinations;
    function card(d) {
      var a = A(d.code), price = D.cheapestFor("SIN", d.code, addDays(today(), 30), "economy");
      return '<a class="dc" href="#/book?to=' + d.code + '"><img src="' + d.photo + '" alt="" loading="lazy" decoding="async"><div class="dc-body"><div><span class="dc-k">' + esc(d.kicker) + '</span><h3>' + esc(d.title) + "</h3></div>" + (price ? '<span class="dc-price">From<b>' + money(price) + "</b></span>" : "") + "</div></a>";
    }
    main.innerHTML =
      '<section class="hero" aria-labelledby="hero-h"><div class="hero-media">' +
      '<picture class="hm-plane"><source media="(max-aspect-ratio: 1/1)" srcset="media/aircraft-day-portrait.webp?v=11"><img class="img-day" src="media/aircraft-day.webp?v=12" alt="An Aurora Airlines widebody seen from above, banking over a sunlit blue ocean" width="1536" height="864" fetchpriority="high" decoding="async"></picture>' +
      '<picture class="hm-plane"><source media="(max-aspect-ratio: 1/1)" srcset="media/aircraft-night-portrait.webp?v=13"><img class="img-night" src="media/aircraft-night.webp?v=13" alt="The same Aurora aircraft at night, flying above the clouds beneath the northern lights" width="1536" height="864" fetchpriority="high" decoding="async"></picture><div class="hm-aurora" aria-hidden="true"></div><div class="hm-glint" aria-hidden="true"></div><div class="hm-clouds" aria-hidden="true"><div class="hm-sea img-day"></div><div class="hm-sea img-night"></div><div class="hm-wisps img-day"></div><div class="hm-wisps img-night"></div></div></div>' +
      '<div class="hero-in"><div class="hero-copy" style="--i:0"><h1 id="hero-h"><span>Beyond the ordinary.</span> <span><em>Into the extraordinary.</em></span></h1><p class="hero-sub">Search, choose and manage every flight in a few calm steps, day or night.</p></div>' +
      '<div style="--i:1">' + searchForm() + '</div>' +
      '<nav class="quick" aria-label="Your trip" style="--i:2"><a href="#/checkin">' + icon("airplane-takeoff") + 'Check in</a><a href="#/manage">' + icon("ticket") + 'Manage booking</a><a href="#/status">' + icon("airplane-in-flight") + 'Flight status</a><a href="#/help/baggage">' + icon("suitcase-rolling") + "Baggage</a></nav></div></section>" +
      '<section class="band" aria-labelledby="dest-h"><div class="wrap"><div class="sec-head"><h2 id="dest-h">Places worth the long way round</h2><p>Six cities we love flying to, with demonstration economy fares from Singapore for travel next month.</p></div>' +
      '<div class="bento">' + card(dest[0]) + card(dest[1]) + card(dest[6]) + '<div class="bento-row">' + [dest[2], dest[3], dest[7]].map(card).join("") + "</div></div>" +
      '<p class="sec-foot"><a class="link" href="#/destinations">See all destinations</a></p></div></section>' +
      '<section class="band" aria-labelledby="nj-h"><div class="wrap"><div class="sec-head"><h2 id="nj-h">One night, Singapore to London</h2><p>Thirteen hours in the air, planned around how you want to feel when you land.</p></div>' +
      '<div class="nj"><div class="nj-sky" aria-hidden="true"></div><ol class="nj-steps">' +
      [["23:55", "airplane-takeoff", "Doors close", "Lights soften to a calm blue. A warm towel and the evening menu while we climb."],
       ["00:40", "fork-knife", "Supper, or sleep", "A light three-course supper, or skip straight to rest. Your call, served when you ask."],
       ["01:30", "moon-stars", "Lights down", "The cabin dims to aurora blue, tuned to your body clock rather than the clock on the ground."],
       ["05:10", "sun-horizon", "First light", "Lights brighten slowly with the dawn outside. Breakfast cooked to order."],
       ["06:20", "airplane-landing", "London, rested", "Arrive with a full night behind you. Business bags come off first."]].map(function (n, i) { return '<li style="--n:' + i + '"><span class="nj-time mono">' + n[0] + '</span><span class="nj-dot">' + icon(n[1]) + "</span><h3>" + n[2] + "</h3><p>" + n[3] + "</p></li>"; }).join("") +
      '</ol></div><p class="hint" style="margin-top:16px">An illustrative long-haul night on our A350-1000. Times are local to Singapore at departure and London on arrival.</p></div></section>' +
      '<section class="band" aria-labelledby="cab-h"><div class="wrap"><div class="sec-head"><h2 id="cab-h">Choose how you cross the night</h2></div>' +
      '<div class="tabs" role="tablist" aria-label="Cabins">' + D.cabinStories.map(function (c, i) { return '<button type="button" role="tab" id="tab-' + c.id + '" aria-controls="cabin-panel" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-cabin-tab="' + i + '">' + c.title + "</button>"; }).join("") + "</div>" +
      '<div class="cabin-panel" id="cabin-panel" role="tabpanel" aria-labelledby="tab-business"></div></div></section>' +
      '<section class="band" aria-labelledby="man-h"><div class="wrap"><div class="sec-head"><h2 id="man-h">How every step is designed</h2><p>Four promises, built into every screen of the booking.</p></div><div class="promises">' +
      '<article class="pr reveal"><div class="pr-demo pr-price" aria-hidden="true"><span class="pr-k">Total for 2 adults</span><b>SGD 2,496</b><span class="pr-rows"><span>Fares<i>SGD 2,180</i></span><span>Taxes and fees<i>SGD 316</i></span></span></div><h3>Clear prices</h3><p>The total for everyone travelling stays in view, from the first result to the last screen. No surprises at payment.</p></article>' +
      '<article class="pr reveal"><div class="pr-demo pr-fare" aria-hidden="true"><span class="pr-k">Flex fare includes</span>' + [["check", "2 × 30 kg checked bags"], ["check", "Any seat, free"], ["check", "Free changes"], ["check", "Fully refundable"]].map(function (r) { return '<span class="pr-line">' + icon(r[0]) + r[1] + "</span>"; }).join("") + '</div><h3>Honest fares</h3><p>Bags, seats, changes and refunds are spelled out on every fare before you choose it.</p></article>' +
      '<article class="pr reveal"><div class="pr-demo pr-steps" aria-hidden="true">' + ["Flights", "Travellers", "Review", "Pay"].map(function (t, i) { return '<span class="' + (i < 1 ? "done" : i === 1 ? "now" : "") + '"><i>' + (i < 1 ? icon("check") : i + 1) + "</i>" + t + "</span>"; }).join("") + '</div><h3>Calm by default</h3><p>One decision at a time, with your trip summary beside you the whole way.</p></article>' +
      '<article class="pr reveal"><div class="pr-demo pr-find" aria-hidden="true"><span class="pr-field"><span class="pr-k">Reference</span><b class="mono">AUK3PD</b></span><span class="pr-field"><span class="pr-k">Last name</span><b>Santos</b></span><span class="pr-btn">' + icon("pencil-simple") + 'Change flight</span></div><h3>Yours to change</h3><p>Find any booking with its reference and last name. No account, no call centre.</p></article>' +
      "</div></div></section>";
    document.body.classList.add("on-hero");
    var hero = $(".hero", main); requestAnimationFrame(function () { hero.classList.add("arrive"); });
    heroDepth(hero);
    bindSearch($("[data-search]", main));
    cabinTabs(); watchReveals();
  }
  /* hero depth: the aircraft and the cloud band sit on separate layers and drift apart as the pointer moves
     and the page scrolls, so the scene reads in depth. Reduced motion keeps the still photograph. */
  function heroDepth(hero) {
    if (RM || !hero) return;
    var media = $(".hero-media", hero), fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    function frame() {
      raf = 0; cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      var r = hero.getBoundingClientRect(), sy = Math.min(1, Math.max(0, -r.top / r.height));
      media.style.setProperty("--px", cx.toFixed(4)); media.style.setProperty("--py", cy.toFixed(4)); media.style.setProperty("--sy", sy.toFixed(4));
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    if (fine) {
      hero.addEventListener("pointermove", function (e) { var r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width * 2 - 1; ty = (e.clientY - r.top) / r.height * 2 - 1; kick(); });
      hero.addEventListener("pointerleave", function () { tx = 0; ty = 0; kick(); });
    }
    window.addEventListener("scroll", kick, { passive: true });
    /* the cloud layers flow by exactly one tile per loop, so the seam never shows; the tile width follows the layer height */
    var flows = $$(".hm-sea, .hm-wisps", hero), ratio = { day: 1536 / 453, night: 1536 / 486 };
    function sizeFlows() { flows.forEach(function (el) { var r = el.classList.contains("img-day") ? ratio.day : ratio.night, k = el.classList.contains("hm-wisps") ? 1.3 : 1; el.style.setProperty("--tw", Math.round(el.clientHeight * k * r) + "px"); }); }
    sizeFlows(); window.addEventListener("resize", sizeFlows);
    /* nothing animates while the hero is out of view */
    var still = window.IntersectionObserver ? new IntersectionObserver(function (es) { hero.classList.toggle("hero-still", !es[0].isIntersecting); }) : null;
    if (still) still.observe(hero);
    cleanups.push(function () { window.removeEventListener("scroll", kick); window.removeEventListener("resize", sizeFlows); if (still) still.disconnect(); if (raf) cancelAnimationFrame(raf); });
  }
  function cabinTabs() {
    var tabs = $$("[data-cabin-tab]", main), panel = $("#cabin-panel");
    function show(i, how) {   // how: init | click | key
      var c = D.cabinStories[i];
      tabs.forEach(function (t, k) { t.setAttribute("aria-selected", String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      panel.setAttribute("aria-labelledby", "tab-" + c.id);
      panel.innerHTML = '<div class="cp-media"><img src="' + c.photo + '" alt="" loading="lazy" decoding="async"></div><div><h3>' + c.title + '</h3><p class="sub">' + c.sub + ".</p><ul>" + c.points.map(function (p) { return "<li>" + icon("check") + "<span>" + p + "</span></li>"; }).join("") + '</ul><a class="btn btn-secondary" style="margin-top:24px" href="#/book">Search ' + c.title + "</a></div>";
      panel.classList.remove("swap-in"); void panel.offsetWidth; if (how === "click") panel.classList.add("swap-in");   // keyboard switches and first paint skip the animation
      if (how === "key") tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { show(i, "click"); });
      t.addEventListener("keydown", function (e) { var d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); show((i + d + tabs.length) % tabs.length, "key"); } });
    });
    show(0, "init");
  }

  function book(q) {
    if (q.to && D.airport(q.to)) S.search.to = q.to;
    if (q.from && D.airport(q.from)) S.search.from = q.from;
    save();
    main.innerHTML = '<div class="page-head ph-photo ph-book"><div class="wrap"><h1>Book a flight</h1><p>Sixteen airports, one hub in Singapore. Every fare shows its bags, seats and change rules before you choose.</p></div></div>' +
      '<div class="task"><div class="wrap">' + searchForm() + '<div class="panel" style="margin-top:24px"><h2>Popular from Singapore</h2><p>Lowest demonstration economy fare for travel in about a month.</p><div class="filters" style="margin-top:16px">' +
      ["HND", "KEF", "LHR", "SYD", "JFK", "ZQN", "LIS", "CPT"].map(function (c) { var p = D.cheapestFor("SIN", c, addDays(today(), 30)); return '<a class="chip" href="#/book?to=' + c + '">' + esc(A(c).city) + (p ? ', from ' + money(p) : "") + "</a>"; }).join("") + "</div></div></div></div>";
    var f = $("[data-search]", main); bindSearch(f);
    if (q.to) { var dep = $("[data-cal='depart']", f); if (dep) dep.focus(); }
  }

  /* ---------- results ---------- */
  var resultsUI = { sort: "best", stops: "any", time: "any", open: null };
  function results(q) {
    var s = S.search;
    if (q.from) { s.from = q.from; s.to = q.to; s.depart = q.depart || s.depart; s.trip = q.ret ? "return" : "oneway"; s.ret = q.ret || ""; s.pax = { adt: +q.adt || 1, chd: +q.chd || 0, inf: +q.inf || 0 }; s.cabin = q.cabin || "economy"; }
    if (!s.to) ensureDemoTrip();
    var leg = q.leg === "ret" && s.trip === "return" ? "ret" : "out";
    if (leg === "ret" && !S.sel.out) ensureDemoTrip();
    save();
    var from = leg === "out" ? s.from : s.to, to = leg === "out" ? s.to : s.from, date = leg === "out" ? s.depart : s.ret;
    var title = leg === "out" ? "Choose your outbound flight" : "Choose your return flight";
    main.innerHTML = '<div class="page-head ph-photo ph-flow"><div class="wrap">' +
      '<h1 class="sr">Choose flights from ' + esc(A(from).city) + " to " + esc(A(to).city) + "</h1>" + routeHead(from, to, esc(A(from).city) + " to " + esc(A(to).city) + ", " + fmtDate(date, true) + ", " + paxLabel(s.pax) + ", " + cabinName(s.cabin), '<button class="btn btn-secondary btn-sm rl-edit" type="button" data-edit aria-expanded="false">Change search</button>') +
      '<div id="edit" hidden style="margin-top:18px"></div>' + progress(0) + "</div></div>" +
      '<div class="task"><div class="wrap task-grid"><div><h2 class="sr">' + title + "</h2>" +
      (leg === "ret" ? '<div class="alert alert-ok" style="margin-bottom:16px">' + icon("check-circle") + "<span>Outbound chosen. " + title + ".</span></div>" : "") +
      '<div class="date-strip" id="dates"></div><div class="res-tools"><p class="res-count" id="count" aria-live="polite">Searching</p><div class="seg" role="group" aria-label="Sort flights">' +
      [["best", "Recommended"], ["price", "Cheapest"], ["fast", "Fastest"], ["early", "Earliest"]].map(function (o) { return '<button type="button" data-sort="' + o[0] + '" aria-pressed="' + (resultsUI.sort === o[0]) + '">' + o[1] + "</button>"; }).join("") + "</div></div>" +
      '<div class="filters" role="group" aria-label="Filter flights">' +
      [["stops", "any", "Any stops"], ["stops", "0", "Nonstop"], ["stops", "1", "1 stop"], ["time", "morning", "Depart before noon"], ["time", "evening", "Depart after 6pm"]].map(function (o) { return '<button type="button" class="chip" data-f="' + o[0] + '" data-v="' + o[1] + '" aria-pressed="' + (resultsUI[o[0]] === o[1]) + '">' + (resultsUI[o[0]] === o[1] ? icon("check") : "") + o[2] + "</button>"; }).join("") + "</div>" +
      '<div class="flights" id="flights" aria-busy="true"></div></div>' + summaryPanel() + "</div></div>";
    $("[data-edit]", main).addEventListener("click", function (e) {
      var box = $("#edit"), open = box.hidden;
      box.hidden = !open; e.currentTarget.setAttribute("aria-expanded", String(open));
      if (open) { box.innerHTML = searchForm({ cta: "Update" }); bindSearch($("[data-search]", box)); $("#in-from", box).focus(); }
    });
    function dates() {
      var html = '<button class="ds-nav" type="button" data-shift="-1" aria-label="Earlier dates">' + icon("caret-left") + "</button>", prices = [], i;
      for (i = -3; i <= 3; i++) { var dd0 = addDays(date, i); prices.push(dd0 < today() ? null : D.cheapestFor(from, to, dd0, s.cabin)); }
      var lo = Math.min.apply(null, prices.filter(Boolean));
      for (i = -3; i <= 3; i++) {
        var dd = addDays(date, i), p = prices[i + 3], bad = dd < today() || (leg === "ret" && dd < s.depart) || (leg === "out" && s.trip === "return" && dd > s.ret);
        html += '<button class="ds-day" type="button" data-d="' + dd + '" aria-pressed="' + (i === 0) + '"' + (bad || !p ? " disabled" : "") + "><span>" + DOW[parse(dd).getDay()] + " " + parse(dd).getDate() + " " + MON[parse(dd).getMonth()] + '</span><b class="' + (p === lo ? "lo" : "") + '">' + (p && !bad ? Math.round(p).toLocaleString("en-SG") : "No fare") + "</b></button>";
      }
      $("#dates").innerHTML = html + '<button class="ds-nav" type="button" data-shift="1" aria-label="Later dates">' + icon("caret-right") + "</button>";
      $$("#dates [data-d]").forEach(function (b) { b.addEventListener("click", function () { if (leg === "out") s.depart = b.dataset.d; else s.ret = b.dataset.d; S.sel[leg] = null; save(); results({ leg: leg }); }); });
      $$("#dates [data-shift]").forEach(function (b) { b.addEventListener("click", function () { var nd = addDays(date, +b.dataset.shift * 7); if (nd < today()) nd = today(); if (leg === "out") s.depart = nd; else s.ret = nd < s.depart ? s.depart : nd; save(); results({ leg: leg }); }); });
    }
    dates();
    var list = $("#flights");
    list.innerHTML = [0, 1, 2].map(function () { return '<div class="flight loading" aria-hidden="true"><div class="skel" style="height:26px;width:62%"></div><div class="skel" style="height:14px;width:36%"></div></div>'; }).join("");
    var res = D.search({ from: from, to: to, date: date, cabin: s.cabin });
    setTimeout(draw, RM ? 0 : 480);
    function draw() {
      list.setAttribute("aria-busy", "false");
      if (res.error) { list.innerHTML = empty("We couldn’t search that route", res.error === "same-airport" ? "Origin and destination are the same airport. Change one of them to search again." : "One of the airports isn’t in our demonstration network.", true); $("#count").textContent = "No flights"; return; }
      var fl = res.flights.slice();
      if (resultsUI.stops !== "any") fl = fl.filter(function (f) { return String(f.stops) === resultsUI.stops; });
      if (resultsUI.time === "morning") fl = fl.filter(function (f) { return f.dep < 720; });
      if (resultsUI.time === "evening") fl = fl.filter(function (f) { return f.dep >= 1080; });
      if (!res.flights.length) { $("#count").textContent = "No flights"; list.innerHTML = empty("No flights on this date", "We don’t fly " + A(from).city + " to " + A(to).city + " in our demonstration network. Try another destination.", true); return; }
      var minP = Math.min.apply(null, res.flights.map(function (f) { return f.prices[0]; })), minD = Math.min.apply(null, res.flights.map(function (f) { return f.mins; }));
      function score(f) { return f.prices[0] / minP + f.mins / minD * 0.9; }
      var best = res.flights.slice().sort(function (a, b) { return score(a) - score(b); })[0];
      fl.sort({ best: function (a, b) { return score(a) - score(b); }, price: function (a, b) { return a.prices[0] - b.prices[0]; }, fast: function (a, b) { return a.mins - b.mins; }, early: function (a, b) { return a.dep - b.dep; } }[resultsUI.sort]);
      $("#count").textContent = fl.length + " of " + res.flights.length + " flights, prices per adult in " + cabinName(s.cabin);
      if (!fl.length) { list.innerHTML = empty("No flights match these filters", "Clear a filter to see all " + res.flights.length + " flights on this date.", false, true); bindFlights(); return; }
      list.innerHTML = fl.map(function (f) { return flightCard(f, f === best && res.flights.length > 2, f.prices[0] === minP); }).join("");
      bindFlights();
    }
    function empty(h, p, editBtn, clearBtn) {
      return '<div class="empty-state">' + icon("airplane-tilt") + "<h2>" + h + "</h2><p>" + p + "</p>" + (clearBtn ? '<button class="btn btn-secondary btn-sm" type="button" data-clear>Clear filters</button>' : "") + (editBtn ? '<a class="btn btn-secondary btn-sm" href="#/book">Change search</a>' : "") + "</div>";
    }
    function flightCard(f, rec, cheapest) {
      var open = resultsUI.open === f.id;
      return '<article class="flight' + (open ? " open" : "") + '" data-id="' + f.id + '" aria-label="Departs ' + fmtTime(f.dep) + ", arrives " + fmtTime(f.arr) + ", " + fmtDur(f.mins) + ", " + (f.stops ? f.stops + " stop" : "nonstop") + ", from " + money(f.prices[0]) + '">' +
        '<div class="fl-main"><div class="fl-times"><div class="fl-t"><b>' + fmtTime(f.dep) + "</b><span>" + f.from + '</span></div><div class="fl-arc">' + arc({ mins: f.mins, stops: f.stops }) + '<span class="dur">' + fmtDur(f.mins) + '</span><span class="stops' + (f.stops ? "" : " ns") + '">' + (f.stops ? f.stops + " stop, " + f.via.join(", ") : "Nonstop") + '</span></div><div class="fl-t r"><b>' + fmtTime(f.arr) + (f.dayShift ? "<sup>" + (f.dayShift > 0 ? "+" : "") + f.dayShift + "</sup>" : "") + "</b><span>" + f.to + "</span></div></div>" +
        '<div class="fl-price"><span class="from">' + cabinName(s.cabin) + " from</span><b>" + money(f.prices[0]) + '</b><button class="btn ' + (open ? "btn-primary" : "btn-secondary") + ' btn-sm" type="button" data-pick aria-expanded="' + open + '" aria-controls="fares-' + f.id + '">' + (open ? "Hide fares" : "Choose fare") + "</button></div>" +
        '<div class="fl-meta"><span class="mono">' + f.legs.map(function (l) { return l.flightNo; }).join(" + ") + "</span><span>" + D.aircraft[f.legs[0].aircraft] + "</span>" + (rec ? '<span class="tag">Recommended: best balance of price and time</span>' : "") + (cheapest && !rec ? '<span class="tag">Lowest fare</span>' : "") + (f.seatsLeft ? '<span class="warn">' + f.seatsLeft + " seats left at this price</span>" : "") + "</div></div>" +
        (open ? faresHTML(f) : "") + "</article>";
    }
    function faresHTML(f) {
      return '<div class="fares" id="fares-' + f.id + '" role="group" aria-label="Fares for this flight">' + D.fares.map(function (fa, i) {
        var y = function (ok, txt) { return '<li class="' + (ok ? "y" : "n") + '">' + icon(ok ? "check" : "x") + "<span>" + txt + "</span></li>"; };
        return '<div class="fare' + (i === 1 ? " rec" : "") + '">' + (i === 1 ? '<span class="rec-tag">Most chosen</span>' : "") + "<h4>" + fa.name + "<b>" + money(f.prices[i]) + "</b></h4><ul>" +
          y(true, "Cabin bag " + fa.bags.cabin) + y(fa.bags.checked !== "None", "Checked bags: " + fa.bags.checked) + y(fa.seat !== "Fee applies", "Seat: " + fa.seat) + y(fa.changes !== "Not permitted", "Changes: " + fa.changes) + y(fa.refund !== "Not refundable", "Refund: " + fa.refund) +
          '</ul><button class="btn ' + (i === 1 ? "btn-primary" : "btn-secondary") + ' btn-sm" type="button" data-fare="' + i + '">Select ' + fa.name + "</button></div>";
      }).join("") + "</div>";
    }
    function bindFlights() {
      $$("[data-pick]", list).forEach(function (b) { b.addEventListener("click", function () { var id = b.closest(".flight").dataset.id; resultsUI.open = resultsUI.open === id ? null : id; draw(); var nb = $(".flight[data-id='" + id + "'] [data-pick]", list); if (nb) nb.focus(); }); });
      $$("[data-fare]", list).forEach(function (b) {
        b.addEventListener("click", function () {
          S.sel[leg] = { id: b.closest(".flight").dataset.id, fare: +b.dataset.fare }; resultsUI.open = null; save();
          if (leg === "out" && s.trip === "return") { toast("Outbound selected. Now choose your return."); go("#/results?leg=ret"); } else go("#/fare");
        });
      });
      var c = $("[data-clear]", list); if (c) c.addEventListener("click", function () { resultsUI.stops = "any"; resultsUI.time = "any"; syncChips(); draw(); });
    }
    function syncChips() {
      $$("[data-f]", main).forEach(function (b) { var on = resultsUI[b.dataset.f] === b.dataset.v; b.setAttribute("aria-pressed", String(on)); b.innerHTML = (on ? icon("check") : "") + b.textContent; });
      $$("[data-sort]", main).forEach(function (b) { b.setAttribute("aria-pressed", String(resultsUI.sort === b.dataset.sort)); });
    }
    $$("[data-sort]", main).forEach(function (b) { b.addEventListener("click", function () { resultsUI.sort = b.dataset.sort; syncChips(); draw(); }); });
    $$("[data-f]", main).forEach(function (b) { b.addEventListener("click", function () { var k = b.dataset.f; resultsUI[k] = resultsUI[k] === b.dataset.v && b.dataset.v !== "any" ? "any" : b.dataset.v; syncChips(); draw(); }); });
  }

  /* ---------- fare review ---------- */
  function fare() {
    ensureDemoTrip();
    var f = selected(), s = S.search;
    if (!f.out) return go("#/book");
    function block(k, fl, sel) {
      var fa = D.fares[sel.fare];
      return '<section class="panel" aria-labelledby="h-' + k + '"><div class="row"><h2 id="h-' + k + '">' + (k === "out" ? "Outbound" : "Return") + ", " + fmtDate(fl.date, true) + '</h2><a class="link" href="#/results?leg=' + k + '">Change flight</a></div>' +
        '<p style="color:var(--ink-3);margin:4px 0 18px">' + cabinName(fl.cabin) + " " + fa.name + ", " + fmtDur(fl.mins) + ", " + (fl.stops ? fl.stops + " stop" : "nonstop") + "</p>" + itinerary(fl) +
        '<dl class="cond"><div><dt>Cabin bag</dt><dd>' + fa.bags.cabin + "</dd></div><div><dt>Checked bags</dt><dd>" + fa.bags.checked + "</dd></div><div><dt>Seat selection</dt><dd>" + fa.seat + "</dd></div><div><dt>Changes</dt><dd>" + fa.changes + "</dd></div><div><dt>Refunds</dt><dd>" + fa.refund + "</dd></div><div><dt>Aurora Miles earned</dt><dd>" + fa.miles + "</dd></div></dl>" +
        '<details class="more"><summary>Full fare conditions ' + icon("caret-down") + "</summary><p>Changes are allowed up to 24 hours before departure, subject to any difference in fare. Unused fares can’t be transferred to another person. If your plans change after departure, contact us before your next flight so the rest of the trip isn’t cancelled. These conditions are illustrative for this prototype.</p></details></section>";
    }
    main.innerHTML = '<div class="page-head ph-photo ph-flow"><div class="wrap">' + routeHead(s.from, s.to, (s.trip === "return" ? "Return" : "One way") + ", " + paxLabel(s.pax) + ", " + cabinName(s.cabin)) + progress(1) + "</div></div>" +
      '<div class="task"><div class="wrap task-grid"><div><h1 class="sr">Review your fare</h1>' + block("out", f.out, S.sel.out) + (f.ret ? block("ret", f.ret, S.sel.ret) : "") +
      '<div class="actions"><a class="link" href="#/results?leg=out">Back to flights</a></div></div>' + summaryPanel({ cta: "Continue" }) + "</div></div>" + mobileBar("Continue");
    bindNext(function () { go("#/passengers"); });
  }

  /* ---------- travellers ---------- */
  function passengers() {
    ensureDemoTrip();
    var s = S.search, list = [], prev = S.passengers || [], label = { adt: "Adult", chd: "Child", inf: "Infant" };
    ["adt", "chd", "inf"].forEach(function (t) { for (var i = 0; i < s.pax[t]; i++) list.push(t); });
    function inp(i, k, lbl, v, span, ac, opts) {
      opts = opts || {}; var id = "p" + i + "-" + k, req = !opts.optional;
      return '<div class="fg ' + span + '"><label for="' + id + '">' + lbl + (opts.optional ? ' <span class="opt">(optional)</span>' : "") + '</label><input class="input" id="' + id + '" data-k="' + k + '" type="' + (opts.type || "text") + '" autocomplete="' + ac + '" value="' + esc(v || "") + '"' + (opts.ph ? ' placeholder="' + opts.ph + '"' : "") + (req ? " required" : "") + (opts.type === "date" ? ' max="' + today() + '"' : "") + ' aria-describedby="' + id + '-e"><span class="err" id="' + id + '-e" hidden></span></div>';
    }
    function sel(i, k, lbl, list2, v, span, optional) {
      var id = "p" + i + "-" + k;
      return '<div class="fg ' + span + '"><label for="' + id + '">' + lbl + (optional ? ' <span class="opt">(optional)</span>' : "") + '</label><select class="select" id="' + id + '" data-k="' + k + '"' + (optional ? "" : " required") + ' aria-describedby="' + id + '-e">' + list2.map(function (o) { return '<option value="' + o + '"' + (o === v ? " selected" : "") + ">" + (o || "Select") + "</option>"; }).join("") + '</select><span class="err" id="' + id + '-e" hidden></span></div>';
    }
    main.innerHTML = '<div class="page-head ph-photo ph-flow"><div class="wrap">' + routeHead(s.from, s.to, "Enter each name exactly as it appears on the passport.") + progress(2) + "</div></div>" +
      '<div class="task"><div class="wrap task-grid"><form id="pf" novalidate><h1 class="sr">Traveller details</h1><div class="alert alert-err" id="pf-err" role="alert" hidden></div>' +
      '<section class="panel"><h2>Travellers</h2><p>We only ask for what is needed to issue a ticket.</p>' +
      list.map(function (t, i) {
        var p = prev[i] || {};
        return '<fieldset class="pax-card" data-i="' + i + '" data-t="' + t + '"><legend><h3>Traveller ' + (i + 1) + ' <span class="ty">' + label[t] + '</span></h3></legend><div class="form-grid">' +
          sel(i, "title", "Title", ["", "Ms", "Mrs", "Mr", "Mx", "Dr"], p.title, "s3", t !== "adt") + inp(i, "first", "First and middle names", p.first, "s4", "given-name") + inp(i, "last", "Last name", p.last, "s4", "family-name") +
          (t === "adt" ? inp(i, "ff", "Aurora Miles number", p.ff, "s6", "off", { optional: true, ph: "8 digits" }) : inp(i, "dob", "Date of birth", p.dob, "s6", "bday", { type: "date" })) + "</div></fieldset>";
      }).join("") + "</section>" +
      '<section class="panel"><h2>Contact for this booking</h2><p>We’ll send the itinerary and any schedule changes here.</p><div class="form-grid">' +
      '<div class="fg"><label for="c-email">Email</label><input class="input" id="c-email" type="email" autocomplete="email" value="' + esc(S.contact.email) + '" required aria-describedby="c-email-e"><span class="err" id="c-email-e" hidden></span></div>' +
      '<div class="fg"><label for="c-phone">Mobile number</label><input class="input" id="c-phone" type="tel" autocomplete="tel" inputmode="tel" value="' + esc(S.contact.phone) + '" placeholder="+65 9123 4567" required aria-describedby="c-phone-h c-phone-e"><span class="hint" id="c-phone-h">Include the country code.</span><span class="err" id="c-phone-e" hidden></span></div>' +
      '</div></section><div class="actions"><a class="link" href="#/fare">Back to fare</a><button class="btn btn-primary" type="submit">Continue</button></div></form>' + summaryPanel() + "</div></div>";
    var form = $("#pf");
    function setErr(el, msg) { var e = $("#" + el.id + "-e"); el.setAttribute("aria-invalid", msg ? "true" : "false"); if (e) { e.hidden = !msg; e.innerHTML = msg ? icon("warning-circle") + esc(msg) : ""; } }
    function check(el) {
      var v = el.value.trim(), k = el.dataset.k || el.id, msg = "";
      if (el.required && !v) msg = { title: "Choose a title.", first: "Enter first and middle names as on the passport.", last: "Enter the last name as on the passport.", dob: "Enter a date of birth.", "c-email": "Enter an email address.", "c-phone": "Enter a mobile number." }[k] || "This field is required.";
      else if ((k === "first" || k === "last") && v && !/^[A-Za-zÀ-ÖØ-öø-ÿ' -]{1,40}$/.test(v)) msg = "Use letters, spaces, hyphens or apostrophes only.";
      else if (k === "ff" && v && !/^\d{8}$/.test(v)) msg = "Aurora Miles numbers have 8 digits.";
      else if (k === "c-email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = "Enter an email like name@example.com.";
      else if (k === "c-phone" && v && !/^\+?[0-9 ()-]{7,20}$/.test(v)) msg = "Enter a phone number using digits, including the country code.";
      else if (k === "dob" && v) {
        var t = el.closest("[data-t]").dataset.t, age = (parse(S.search.depart) - parse(v)) / (365.25 * 864e5);
        if (v > today()) msg = "Date of birth can’t be in the future.";
        else if (t === "chd" && (age < 2 || age >= 12)) msg = "Children must be 2 to 11 years old on the travel date.";
        else if (t === "inf" && age >= 2) msg = "Infants must be under 2 on the travel date.";
      }
      setErr(el, msg); return !msg;
    }
    $$("input, select", form).forEach(function (el) { el.addEventListener("blur", function () { if (el.value || el.getAttribute("aria-invalid") === "true") check(el); }); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = $$("input, select", form).filter(function (el) { return !check(el); }), box = $("#pf-err");
      if (bad.length) { box.hidden = false; box.innerHTML = icon("warning-circle") + "<span>" + bad.length + (bad.length === 1 ? " field needs" : " fields need") + " attention. The first one is selected.</span>"; bad[0].focus(); return; }
      box.hidden = true;
      S.passengers = $$("[data-i]", form).map(function (fs) { var o = { type: fs.dataset.t }; $$("[data-k]", fs).forEach(function (el) { o[el.dataset.k] = el.value.trim(); }); return o; });
      S.contact = { email: $("#c-email").value.trim(), phone: $("#c-phone").value.trim() }; save();
      go("#/review");
    });
  }

  /* ---------- review and confirm ---------- */
  function review() {
    ensureDemoTrip("review");
    var f = selected(), s = S.search, t = totals();
    main.innerHTML = '<div class="page-head ph-photo ph-flow"><div class="wrap">' + routeHead(s.from, s.to, "Check everything once more. You can still change any step.") + progress(3) + "</div></div>" +
      '<div class="task"><div class="wrap task-grid"><div><h1 class="sr">Review and confirm</h1>' +
      ["out", "ret"].filter(function (k) { return f[k]; }).map(function (k) { var fl = f[k], fa = D.fares[S.sel[k].fare]; return '<section class="panel"><div class="row"><h2>' + (k === "out" ? "Outbound" : "Return") + ", " + fmtDate(fl.date, true) + '</h2><a class="link" href="#/results?leg=' + k + '">Change</a></div><p style="color:var(--ink-3);margin:4px 0 18px">' + cabinName(fl.cabin) + " " + fa.name + ", " + fa.bags.checked + " checked, changes: " + fa.changes.toLowerCase() + "</p>" + itinerary(fl) + "</section>"; }).join("") +
      '<section class="panel"><div class="row"><h2>Travellers</h2><a class="link" href="#/passengers">Edit</a></div><dl class="cond">' +
      S.passengers.map(function (p, i) { return "<div><dt>Traveller " + (i + 1) + "</dt><dd>" + esc([p.title, p.first, p.last].filter(Boolean).join(" ")) + "</dd></div>"; }).join("") +
      "<div><dt>Email</dt><dd>" + esc(S.contact.email) + "</dd></div><div><dt>Mobile</dt><dd>" + esc(S.contact.phone) + "</dd></div></dl></section>" +
      '<section class="panel"><h2>Payment</h2><div class="alert alert-warn" style="margin-top:12px">' + icon("info") + "<span>This is a demonstration prototype. No card details are collected and no payment is taken. Confirming creates a demonstration booking that only exists in this browser.</span></div>" +
      '<label class="check" style="margin-top:18px"><input type="checkbox" id="agree"><span>I’ve read the <a class="link" href="#/help/fares">fare conditions</a> and understand this booking is a demonstration.</span></label><p class="err" id="agree-e" hidden>' + icon("warning-circle") + "Tick the box to confirm you’ve read the fare conditions.</p></section>" +
      '<div class="actions"><a class="link" href="#/passengers">Back to travellers</a><button class="btn btn-primary" type="button" data-next>Confirm booking</button></div></div>' + summaryPanel() + "</div></div>";
    bindNext(function (e) {
      var btn = e.currentTarget, agree = $("#agree");
      if (!agree.checked) { $("#agree-e").hidden = false; agree.focus(); return; }
      $("#agree-e").hidden = true; btn.setAttribute("aria-disabled", "true"); btn.style.width = btn.offsetWidth + "px"; btn.innerHTML = '<span class="spin" aria-hidden="true"></span><span class="sr">Confirming</span>';
      setTimeout(function () {
        var ref = "AU" + Array.apply(null, Array(4)).map(function () { return "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]; }).join("");
        var b = { ref: ref, last: (S.passengers[0] || {}).last || "Traveller", demo: true, trip: s.trip, cabin: s.cabin, segments: [S.sel.out].concat(S.sel.ret && s.trip === "return" ? [S.sel.ret] : []), passengers: S.passengers, contact: S.contact, total: t.total };
        var all = store.get("aurora.bookings") || []; all.unshift(b); store.set("aurora.bookings", all.slice(0, 12));
        S.lastRef = ref; save(); go("#/confirmation?ref=" + ref);
      }, RM ? 200 : 1000);
    });
  }
  function findBooking(ref, last) {
    ref = String(ref || "").trim().toUpperCase(); last = String(last || "").trim().toLowerCase();
    return bookings().filter(function (b) { return b.ref === ref && (!last || b.last.toLowerCase() === last); })[0] || null;
  }
  function confirmation(q) {
    var b = findBooking(q.ref || S.lastRef);
    if (!b) { ensureDemoTrip("review"); b = { ref: "AUDEMO", last: "Tan", demo: true, segments: [S.sel.out].concat(S.sel.ret ? [S.sel.ret] : []), passengers: S.passengers, contact: S.contact, total: totals().total, cabin: S.search.cabin }; }
    var segs = b.segments.map(function (sg) { return D.findFlight(sg.id, b.cabin); }).filter(Boolean), out = segs[0], lead = b.passengers[0] || {};
    function bars(ref) { var r = D.seed(ref), x = 0, o = ""; while (x < 220) { var w = 1 + Math.floor(r() * 3.2); if (r() > 0.35) o += '<rect x="' + x + '" y="0" width="' + w + '" height="64"/>'; x += w + 1; } return o; }
    main.innerHTML = '<div class="confirm-head ph-confirm"><div class="wrap"><span class="ok">' + icon("check-circle") + "Demonstration booking confirmed</span><h1>Your trip to " + esc(A(out.to).city) + " is booked.</h1><p>Saved in this browser. A live service would email your e-ticket to " + esc(b.contact.email || "you") + ". No ticket issued, no payment taken.</p></div></div>" +
      '<div class="wrap" style="padding-bottom:clamp(64px,8vw,96px)"><article class="pass" aria-label="Itinerary"><div class="pass-main"><span class="demo-tag">Demonstration itinerary</span>' +
      '<div class="pass-route"><div><div class="code">' + out.from + '</div><div class="city">' + esc(A(out.from).city) + "</div></div>" + arc({ mins: out.mins, stops: out.stops, h: 48 }) + '<div style="text-align:right"><div class="code">' + out.to + '</div><div class="city">' + esc(A(out.to).city) + "</div></div></div>" +
      '<dl class="pass-grid"><div><dt>Departs</dt><dd>' + fmtDate(out.date) + ", " + fmtTime(out.dep) + "</dd></div><div><dt>Arrives</dt><dd>" + fmtTime(out.arr) + (out.dayShift ? " +" + out.dayShift : "") + '</dd></div><div><dt>Flight</dt><dd class="mono">' + out.legs.map(function (l) { return l.flightNo; }).join(" + ") + "</dd></div><div><dt>Cabin</dt><dd>" + cabinName(b.cabin) + "</dd></div>" +
      "<div><dt>Lead traveller</dt><dd>" + esc([lead.first, lead.last].filter(Boolean).join(" ") || "Not set") + "</dd></div><div><dt>Travellers</dt><dd>" + b.passengers.length + "</dd></div><div><dt>Return</dt><dd>" + (segs[1] ? fmtDate(segs[1].date) + ", " + fmtTime(segs[1].dep) : "One way") + "</dd></div><div><dt>Total</dt><dd>" + money(b.total) + "</dd></div></dl></div>" +
      '<div class="pass-stub"><div class="ref">Booking reference<b>' + esc(b.ref) + '</b></div><svg viewBox="0 0 220 64" aria-hidden="true">' + bars(b.ref) + '</svg><a class="btn btn-secondary btn-sm" href="#/manage?ref=' + esc(b.ref) + "&last=" + encodeURIComponent(b.last) + '">Manage booking</a></div></article>' +
      '<div class="next-steps"><div class="panel"><h2>Check in from 48 hours before</h2><p>Online check-in opens two days before each flight. Bring the passports you entered for every traveller.</p><a class="link" style="margin-top:10px;display:inline-block" href="#/checkin?' + qs({ ref: b.ref, last: b.last }) + '">Check in</a></div><div class="panel"><h2>Choose your seats</h2><p>Pick seats now for every flight. Your fare decides which are free.</p><a class="link" style="margin-top:10px;display:inline-block" href="#/checkin?' + qs({ ref: b.ref, last: b.last, mode: "seats" }) + '">Choose seats</a></div><div class="panel"><h2>On the day</h2><p>Flight status shows gates and any schedule changes.</p></div></div>' +
      '<div class="actions"><a class="link" href="#/">Back to home</a><a class="btn btn-primary" href="#/status?flight=' + encodeURIComponent(out.legs[0].flightNo) + "&date=" + out.date + '">Flight status</a></div></div>';
    S.sel = { out: null, ret: null }; S.passengers = []; save();
  }

  /* ---------- manage ---------- */
  function manage(q) {
    var b = q.ref ? findBooking(q.ref, q.last) : null, tried = !!q.ref;
    main.innerHTML = '<div class="page-head ph-photo ph-manage"><div class="wrap"><h1>Manage booking</h1><p>Find a booking with its six-character reference and the lead traveller’s last name.</p></div></div>' +
      '<div class="task"><div class="wrap task-grid"><div><form class="panel" id="mf" novalidate><h2>Find your booking</h2><p>Try a demonstration booking: <button type="button" class="link" data-demo="AUR7QX|Tan">AUR7QX with Tan</button> or <button type="button" class="link" data-demo="AUK3PD|Santos">AUK3PD with Santos</button>.</p>' +
      '<div class="form-grid"><div class="fg s4"><label for="m-ref">Booking reference</label><input class="input mono" id="m-ref" autocomplete="off" autocapitalize="characters" maxlength="6" value="' + esc(q.ref || "") + '" aria-describedby="m-ref-h"><span class="hint" id="m-ref-h">6 letters and numbers</span></div><div class="fg s4"><label for="m-last">Last name</label><input class="input" id="m-last" autocomplete="family-name" value="' + esc(q.last || "") + '"></div><div class="fg s4 fg-btn"><button class="btn btn-primary" type="submit">Find booking</button></div></div>' +
      '<div id="m-res" role="status" aria-live="polite" style="margin-top:16px">' + (tried && !b ? '<div class="alert alert-err">' + icon("warning-circle") + "<span>We couldn’t find booking " + esc(String(q.ref).toUpperCase()) + " with that last name. Check both and try again. References never use the letters O or I.</span></div>" : "") + "</div></form>" +
      (b ? bookingDetail(b) : "") + '</div><aside class="panel" style="align-self:start"><h2>Trips in this browser</h2><p>Demonstration bookings made here.</p><div style="display:grid;gap:8px;margin-top:14px">' +
      bookings().map(function (x) { var fl = D.findFlight(x.segments[0].id, x.cabin); return fl ? '<a class="chip" style="justify-content:space-between;min-height:44px" href="#/manage?ref=' + x.ref + "&last=" + encodeURIComponent(x.last) + '"><b class="mono">' + x.ref + "</b><span>" + fl.from + " to " + fl.to + ", " + fmtDate(fl.date) + "</span></a>" : ""; }).join("") + "</div></aside></div></div>";
    $$("[data-demo]", main).forEach(function (bt) { bt.addEventListener("click", function () { var p = bt.dataset.demo.split("|"); $("#m-ref").value = p[0]; $("#m-last").value = p[1]; $("#mf").requestSubmit(); }); });
    $("#mf").addEventListener("submit", function (e) {
      e.preventDefault(); var r = $("#m-ref").value.trim(), l = $("#m-last").value.trim();
      if (!/^[A-Za-z0-9]{6}$/.test(r) || !l) { $("#m-res").innerHTML = '<div class="alert alert-err">' + icon("warning-circle") + "<span>" + (!l ? "Enter the lead traveller’s last name." : "Booking references have exactly six letters and numbers.") + "</span></div>"; (!l ? $("#m-last") : $("#m-ref")).focus(); return; }
      go("#/manage?" + qs({ ref: r.toUpperCase(), last: l }));
    });
    if (b) { var h = $("#bk-h"); if (h) h.focus(); }
  }
  /* what a traveller can do next with a booking: check in when the window is open, otherwise choose seats */
  function tripActions(b) {
    var legs = tripLegs(b), group = checkinGroup(legs), t = tripState(b.ref), q = { ref: b.ref, last: b.last };
    if (!group.length) return '<div class="actions trip-actions"><span class="hint">This trip has departed.</span></div>';
    var st = windowState(group[0]), done = group.every(function (L) { return t.checked[L.key]; }), first = group[0];
    var seatsSet = legs.filter(function (L) { return (t.seats[L.key] || []).some(Boolean); }).length;
    var note = done ? icon("check-circle") + "Checked in for " + first.lg.flightNo : st === "open" ? icon("clock") + "Check-in is open until " + fmtStamp(first.closes, A(first.lg.from).tz) : icon("calendar-blank") + "Check-in opens " + fmtStamp(first.opens, A(first.lg.from).tz);
    return '<div class="trip-actions"><p class="trip-note">' + note + (seatsSet ? ", seats chosen" : "") + '</p><div class="trip-btns">' +
      (done ? '<a class="btn btn-primary btn-sm" href="#/checkin?' + qs(q) + '">' + icon("ticket") + "Boarding passes</a>" : st === "open" ? '<a class="btn btn-primary btn-sm" href="#/checkin?' + qs(q) + '">Check in</a>' : "") +
      '<a class="btn btn-secondary btn-sm" href="#/checkin?' + qs({ ref: b.ref, last: b.last, mode: "seats" }) + '">' + icon("armchair") + (seatsSet ? "Change seats" : "Choose seats") + "</a>" +
      '<a class="btn btn-secondary btn-sm" href="#/status?flight=' + encodeURIComponent(first.lg.flightNo) + "&date=" + first.date + '">Flight status</a></div></div>';
  }
  function bookingDetail(b) {
    var segs = b.segments.map(function (sg) { return { f: D.findFlight(sg.id, b.cabin), fare: D.fares[sg.fare] }; }).filter(function (x) { return x.f; });
    if (!segs.length) return "";
    return '<section class="panel"><div class="row"><h2 id="bk-h" tabindex="-1">Booking <span class="mono">' + esc(b.ref) + '</span></h2><span class="badge ok">Confirmed</span></div><p>' + esc(b.passengers.map(function (p) { return [p.first, p.last].join(" "); }).join(", ")) + (b.demo ? ", demonstration booking" : "") + "</p>" +
      segs.map(function (x, i) { return '<div style="margin-top:22px"><h3 style="font-size:15px;margin-bottom:12px">' + (i ? "Return" : "Outbound") + ", " + fmtDate(x.f.date, true) + ", " + cabinName(b.cabin) + " " + x.fare.name + "</h3>" + itinerary(x.f) + "</div>"; }).join("") +
      tripActions(b) + "</section>";
  }

  /* ---------- check-in, seats and boarding passes ----------
     Every leg of a booking can have seats chosen at any time; check-in opens 48 hours before a leg departs and
     closes an hour before. Seats and check-in state live in this browser, keyed by booking reference. */
  var SEATMAPS = {
    "35K": { first: { rows: [1, 2], blocks: [["A"], ["E"], ["K"]] }, business: { rows: [11, 18], blocks: [["A"], ["D", "G"], ["K"]] }, premium: { rows: [31, 34], blocks: [["A", "C"], ["D", "E", "F"], ["H", "K"]] }, economy: { rows: [41, 66], blocks: [["A", "B", "C"], ["D", "E", "G"], ["H", "J", "K"]], legroom: [41, 55] } },
    "789": { first: { rows: [1, 2], blocks: [["A"], ["E"], ["K"]] }, business: { rows: [11, 16], blocks: [["A"], ["D", "G"], ["K"]] }, premium: { rows: [31, 33], blocks: [["A", "C"], ["D", "E", "F"], ["H", "K"]] }, economy: { rows: [41, 60], blocks: [["A", "B", "C"], ["D", "E", "G"], ["H", "J", "K"]], legroom: [41, 50] } }
  };
  function seatRows(m) { var r = []; for (var n = m.rows[0]; n <= m.rows[1]; n++) if (n !== 13) r.push(n); return r; }   // no row 13, as on most airlines
  function seatFee(fareIdx, legroom) { return fareIdx >= 2 ? 0 : legroom ? (fareIdx === 1 ? 45 : 60) : (fareIdx === 1 ? 0 : 25); }
  function tripState(ref) { var all = store.get("aurora.trips") || {}; return all[ref] || { seats: {}, checked: {} }; }
  function saveTrip(ref, t) { var all = store.get("aurora.trips") || {}; all[ref] = t; store.set("aurora.trips", all); }
  /* every leg of a booking, with its local date, times and the check-in window */
  function tripLegs(b) {
    var out = [];
    b.segments.forEach(function (sg, si) {
      var f = D.findFlight(sg.id, b.cabin); if (!f) return;
      f.legs.forEach(function (lg, li) {
        var date = addDays(f.date, Math.floor(lg.dep / 1440)), dep = ((lg.dep % 1440) + 1440) % 1440, d = parse(date);
        var depUtc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) + (dep - A(lg.from).tz * 60) * 6e4;
        out.push({ si: si, li: li, seg: f, lg: lg, fare: sg.fare, date: date, dep: dep, arr: lg.arr, key: lg.flightNo + "|" + date, depUtc: depUtc, opens: depUtc - 48 * 3600e3, closes: depUtc - 3600e3 });
      });
    });
    return out;
  }
  function windowState(L) { var now = Date.now(); return now < L.opens ? "soon" : now < L.closes ? "open" : "closed"; }
  function fmtStamp(ms, tz) { var d = new Date(ms + tz * 3600e3); return DOW[d.getUTCDay()] + " " + d.getUTCDate() + " " + MON[d.getUTCMonth()] + ", " + pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()); }
  /* the legs a check-in covers: the first segment that has not closed yet */
  function checkinGroup(legs) { var first = legs.filter(function (L) { return windowState(L) !== "closed"; })[0]; return first ? legs.filter(function (L) { return L.si === first.si; }) : []; }
  function occupied(L, cabin) {
    var m = SEATMAPS[L.lg.aircraft][cabin], r = D.seed(L.key + cabin), taken = {}, fill = cabin === "economy" ? 0.58 : 0.42;
    seatRows(m).forEach(function (n) { m.blocks.forEach(function (bl) { bl.forEach(function (c) { if (r() < fill) taken[n + c] = true; }); }); });
    return taken;
  }
  function seatKind(m, letter) {
    var bl = m.blocks.filter(function (b) { return b.indexOf(letter) > -1; })[0], first = m.blocks[0], last = m.blocks[m.blocks.length - 1];
    if ((bl === first && letter === bl[0]) || (bl === last && letter === bl[bl.length - 1])) return "Window";
    return letter === bl[0] || letter === bl[bl.length - 1] ? "Aisle" : "Middle";
  }
  /* seats for travellers who have none yet: the best free seats, side by side where possible */
  function autoSeats(L, cabin, picks, n) {
    var m = SEATMAPS[L.lg.aircraft][cabin], taken = occupied(L, cabin), out = picks.slice();
    picks.forEach(function (s) { if (s) taken[s] = true; });
    var free = [];
    seatRows(m).forEach(function (row) { m.blocks.forEach(function (bl) { bl.forEach(function (c) { if (!taken[row + c] && !(m.legroom && m.legroom.indexOf(row) > -1)) free.push(row + c); }); }); });
    for (var i = 0; i < n; i++) if (!out[i]) { out[i] = free.shift() || null; }
    return out;
  }
  /* a QR-style code for the pass: real finder squares, seeded data modules (a demonstration, not a scannable code) */
  function qr(seedText) {
    var N = 29, r = D.seed(seedText), cells = [], x, y, o = "";
    function finder(cx, cy) { for (y = 0; y < 7; y++) for (x = 0; x < 7; x++) { var e = x === 0 || y === 0 || x === 6 || y === 6 || (x > 1 && x < 5 && y > 1 && y < 5); cells[(cy + y) * N + cx + x] = e ? 1 : 2; } }
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
      var i = y * N + x; if (cells[i]) continue;
      if ((x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9)) { cells[i] = 2; continue; }
      cells[i] = (y === 6 || x === 6) ? ((x + y) % 2 ? 2 : 1) : r() < 0.48 ? 1 : 2;
    }
    for (y = 0; y < N; y++) for (x = 0; x < N; x++) if (cells[y * N + x] === 1) { var w = 1; while (x + w < N && cells[y * N + x + w] === 1) w++; o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="1"/>'; x += w - 1; }
    return '<svg class="bp-qr" viewBox="-2 -2 ' + (N + 4) + " " + (N + 4) + '" role="img" aria-label="Boarding code"><rect class="bp-qr-bg" x="-2" y="-2" width="' + (N + 4) + '" height="' + (N + 4) + '"/><g class="bp-qr-m">' + o + "</g></svg>";
  }

  var ck = { ref: null, step: 0, pax: null, leg: 0, who: 0, picks: null };
  function checkin(q) {
    var b = q.ref ? findBooking(q.ref, q.last) : null, seatsOnly = q.mode === "seats";
    var head = '<div class="page-head ph-photo ph-checkin"><div class="wrap"><h1>' + (seatsOnly ? "Choose your seats" : "Check in") + "</h1><p>" + (seatsOnly ? "Pick a seat for every traveller on every flight. Your fare decides which seats are free." : "Online check-in opens 48 hours before departure and closes an hour before. Choose seats, then get your boarding passes.") + "</p></div></div>";
    if (!b) return checkinFind(q, head);
    if (ck.ref !== b.ref + (seatsOnly ? "|s" : "")) ck = { ref: b.ref + (seatsOnly ? "|s" : ""), step: 0, pax: b.passengers.map(function () { return true; }), leg: 0, who: 0 };
    var legs = tripLegs(b), t = tripState(b.ref), back = "#/manage?" + qs({ ref: b.ref, last: b.last });
    var group = seatsOnly ? legs.filter(function (L) { return windowState(L) !== "closed"; }) : checkinGroup(legs);
    if (!group.length) { main.innerHTML = head + '<div class="task"><div class="wrap"><div class="panel"><h2>Nothing left to check in</h2><p>Every flight on booking <span class="mono">' + esc(b.ref) + '</span> has closed for check-in.</p><div class="actions"><a class="link" href="' + back + '">Back to the booking</a></div></div></div></div>'; return; }
    var st = windowState(group[0]), done = !seatsOnly && group.every(function (L) { return t.checked[L.key]; });
    if (!seatsOnly && st === "soon") {
      main.innerHTML = head + '<div class="task"><div class="wrap task-grid"><div class="panel"><span class="badge info">' + icon("clock") + 'Not open yet</span><h2 style="margin-top:14px">Check-in opens ' + fmtStamp(group[0].opens, A(group[0].lg.from).tz) + "</h2><p>That is 48 hours before " + group[0].lg.flightNo + " leaves " + esc(A(group[0].lg.from).city) + ". You can choose seats now, and we will keep them for check-in.</p>" +
        '<div class="actions"><a class="link" href="' + back + '">Back to the booking</a><a class="btn btn-primary" href="#/checkin?' + qs({ ref: b.ref, last: b.last, mode: "seats" }) + '">Choose seats now</a></div></div>' + checkinAside(b, group) + "</div></div>";
      return;
    }
    if (done) ck.step = 2;
    var steps = seatsOnly ? ["Seats"] : ["Travellers", "Seats", "Boarding passes"];
    var prog = '<ol class="progress" aria-label="Check-in progress">' + steps.map(function (n, k) { var i = seatsOnly ? 0 : ck.step; return '<li class="' + (k < i ? "done" : "") + '"' + (k === i ? ' aria-current="step"' : "") + ">" + n + "</li>"; }).join("") + "</ol>";
    var body = seatsOnly || ck.step === 1 ? seatStep(b, group, t, seatsOnly) : ck.step === 0 ? paxStep(b, group) : passStep(b, group, t);
    main.innerHTML = head + '<div class="task ck"><div class="wrap">' + '<div class="panel ck-trip"><div class="ck-trip-row"><span class="mono ck-ref">' + esc(b.ref) + "</span><span>" + group.map(function (L) { return L.lg.from + " → " + L.lg.to; }).join(", ") + ", " + fmtDate(group[0].date) + "</span><span>" + cabinName(b.cabin) + "</span></div>" + prog + "</div>" + body + "</div></div>";
    bindCheckin(b, group, t, seatsOnly, back);
  }
  function checkinAside(b, group) {
    return '<aside class="panel" style="align-self:start"><h2>Before you fly</h2><ul class="ck-list">' +
      '<li>' + icon("identification-card") + "<span><b>Passports</b>Valid for six months after you arrive, for every traveller.</span></li>" +
      '<li>' + icon("suitcase-rolling") + "<span><b>Bag drop</b>Closes 60 minutes before departure at " + esc(A(group[0].lg.from).name) + ".</span></li>" +
      '<li>' + icon("door-open") + "<span><b>Boarding</b>Starts 45 minutes before departure. The gate closes 20 minutes before.</span></li></ul></aside>";
  }
  function checkinFind(q, head) {
    var tried = !!q.ref;
    main.innerHTML = head + '<div class="task"><div class="wrap task-grid"><form class="panel" id="cf" novalidate><h2>Find your booking</h2><p>Try a demonstration booking: <button type="button" class="link" data-demo="AUC4NX|Lim">AUC4NX with Lim</button> departs tomorrow, so check-in is open.</p>' +
      '<div class="form-grid"><div class="fg s4"><label for="c-ref">Booking reference</label><input class="input mono" id="c-ref" autocomplete="off" autocapitalize="characters" maxlength="6" value="' + esc(q.ref || "") + '"></div><div class="fg s4"><label for="c-last">Last name</label><input class="input" id="c-last" autocomplete="family-name" value="' + esc(q.last || "") + '"></div><div class="fg s4 fg-btn"><button class="btn btn-primary" type="submit">Check in</button></div></div>' +
      '<div id="c-res" role="status" aria-live="polite" style="margin-top:16px">' + (tried ? '<div class="alert alert-err">' + icon("warning-circle") + "<span>We couldn’t find booking " + esc(String(q.ref).toUpperCase()) + " with that last name. Check both and try again.</span></div>" : "") + "</div></form>" +
      '<aside class="panel" style="align-self:start"><h2>Before you fly</h2><ul class="ck-list"><li>' + icon("clock") + "<span><b>When</b>From 48 hours to 60 minutes before departure.</span></li><li>" + icon("identification-card") + "<span><b>Passports</b>Have every traveller’s passport details ready.</span></li><li>" + icon("device-mobile") + "<span><b>Boarding pass</b>On your phone, or printed at the airport.</span></li></ul></aside></div></div>";
    $$("[data-demo]", main).forEach(function (bt) { bt.addEventListener("click", function () { var p = bt.dataset.demo.split("|"); $("#c-ref").value = p[0]; $("#c-last").value = p[1]; $("#cf").requestSubmit(); }); });
    $("#cf").addEventListener("submit", function (e) {
      e.preventDefault(); var r = $("#c-ref").value.trim(), l = $("#c-last").value.trim();
      if (!/^[A-Za-z0-9]{6}$/.test(r) || !l) { $("#c-res").innerHTML = '<div class="alert alert-err">' + icon("warning-circle") + "<span>" + (!l ? "Enter the lead traveller’s last name." : "Booking references have exactly six letters and numbers.") + "</span></div>"; (!l ? $("#c-last") : $("#c-ref")).focus(); return; }
      go("#/checkin?" + qs({ ref: r.toUpperCase(), last: l }));
    });
  }
  function paxStep(b, group) {
    return '<div class="task-grid"><form class="panel" id="ck-pax" novalidate><h2>Who is travelling?</h2><p>Check in everyone on this booking, or only some of you.</p><div class="ck-pax">' +
      b.passengers.map(function (p, i) { return '<label class="ck-person"><input type="checkbox" data-pax="' + i + '"' + (ck.pax[i] ? " checked" : "") + '><span class="ck-av">' + esc((p.first || "?")[0] + (p.last || "")[0]) + "</span><span><b>" + esc([p.title, p.first, p.last].filter(Boolean).join(" ")) + "</b><small>" + (p.type === "chd" ? "Child" : p.type === "inf" ? "Infant" : "Adult") + ", passport details on file</small></span></label>"; }).join("") +
      '</div><h3 class="ck-sub">Travel declarations</h3><label class="check"><input type="checkbox" id="ck-d1"><span>Every traveller’s passport is valid for six months after arrival, with any visa needed for ' + esc(A(group[group.length - 1].lg.to).country) + ".</span></label>" +
      '<label class="check"><input type="checkbox" id="ck-d2"><span>No one is carrying <a class="link" href="#/help/baggage">dangerous goods</a> such as lithium batteries in checked bags, gas canisters or flammable liquids.</span></label>' +
      '<div id="ck-err" role="alert"></div><div class="actions"><span class="hint">Demonstration only. Nothing is sent to an airline.</span><button class="btn btn-primary" type="submit">Continue to seats</button></div></form>' + checkinAside(b, group) + "</div>";
  }
  function seatStep(b, group, t, seatsOnly) {
    var L = group[Math.min(ck.leg, group.length - 1)], m = SEATMAPS[L.lg.aircraft][b.cabin], taken = occupied(L, b.cabin);
    var who = b.passengers.map(function (p, i) { return i; }).filter(function (i) { return seatsOnly || ck.pax[i]; });
    if (!ck.picks || ck.picks.key !== L.key) ck.picks = { key: L.key, seats: (t.seats[L.key] || []).slice() };
    var picks = ck.picks.seats; if (who.indexOf(ck.who) < 0) ck.who = who[0];
    var mine = {}; picks.forEach(function (s, i) { if (s) mine[s] = i; });
    var head = '<div class="sm-head"><span class="sm-row"></span>' + m.blocks.map(function (bl, k) { return (k ? '<span class="sm-aisle"></span>' : "") + bl.map(function (c) { return '<span class="sm-col">' + c + "</span>"; }).join(""); }).join("") + '<span class="sm-row"></span></div>';
    var rows = seatRows(m).map(function (n) {
      var lr = m.legroom && m.legroom.indexOf(n) > -1;
      return (lr ? '<div class="sm-exit"><span>Exit</span><span>Exit</span></div>' : "") + '<div class="sm-line' + (lr ? " lr" : "") + '"><span class="sm-row">' + n + "</span>" + m.blocks.map(function (bl, k) {
        return (k ? '<span class="sm-aisle"></span>' : "") + bl.map(function (c) {
          var id = n + c, own = mine[id] !== undefined, busy = taken[id] && !own, fee = seatFee(L.fare, lr), kind = seatKind(m, c);
          var label = "Seat " + id + ", " + kind.toLowerCase() + (lr ? ", extra legroom" : "") + (busy ? ", taken" : own ? ", chosen for " + b.passengers[mine[id]].first : ", available" + (fee ? ", " + money(fee) : ", included"));
          return '<button type="button" class="seat' + (busy ? " busy" : "") + (own ? " mine" : "") + (lr ? " lr" : "") + (fee && !busy ? " fee" : "") + '" data-seat="' + id + '"' + (busy ? " disabled" : "") + ' aria-label="' + label + '" aria-pressed="' + own + '">' + (own ? '<span class="seat-who">' + esc(((b.passengers[mine[id]].first || "?")[0] + (b.passengers[mine[id]].last || "?")[0]).toUpperCase()) + "</span>" : "") + "</button>";
        }).join("");
      }).join("") + '<span class="sm-row">' + n + "</span></div>";
    }).join("");
    var fees = 0; group.forEach(function (G) { var ss = G.key === L.key ? picks : (t.seats[G.key] || []); var gm = SEATMAPS[G.lg.aircraft][b.cabin]; ss.forEach(function (s) { if (!s) return; var row = parseInt(s, 10); fees += seatFee(G.fare, gm.legroom && gm.legroom.indexOf(row) > -1); }); });
    var fare = D.fares[L.fare];
    return '<div class="task-grid"><section class="panel sm-panel" aria-labelledby="sm-h"><div class="row"><h2 id="sm-h">' + L.lg.from + " to " + L.lg.to + ', <span class="mono">' + L.lg.flightNo + "</span></h2><span class=\"hint\">" + D.aircraft[L.lg.aircraft] + ", " + cabinName(b.cabin) + "</span></div>" +
      (group.length > 1 ? '<div class="seg sm-legs" role="group" aria-label="Flight">' + group.map(function (G, k) { return '<button type="button" data-leg="' + k + '" aria-pressed="' + (G.key === L.key) + '">' + G.lg.from + " → " + G.lg.to + "</button>"; }).join("") + "</div>" : "") +
      '<div class="sm-who" role="group" aria-label="Choose a seat for">' + who.map(function (i) { var p = b.passengers[i]; return '<button type="button" class="chip" data-who="' + i + '" aria-pressed="' + (i === ck.who) + '"><span class="ck-av sm">' + esc((p.first || "?")[0] + (p.last || "?")[0]) + "</span>" + esc(p.first) + '<span class="sm-pick' + (picks[i] ? " mono" : "") + '">' + (picks[i] || "No seat") + "</span></button>"; }).join("") + "</div>" +
      '<ul class="sm-legend"><li><span class="seat' + (seatFee(L.fare, false) ? " fee" : "") + '"></span>' + (seatFee(L.fare, false) ? "Standard, " + money(seatFee(L.fare, false)) : "Included") + "</li>" + (m.legroom ? '<li><span class="seat lr"></span>Extra legroom' + (seatFee(L.fare, true) ? ", " + money(seatFee(L.fare, true)) : ", included") + "</li>" : "") + '<li><span class="seat busy"></span>Taken</li><li><span class="seat mine"></span>Your seat</li></ul>' +
      '<div class="sm-scroll"><div class="sm-plane sm-' + b.cabin + '"><div class="sm-nose" aria-hidden="true">Front of the aircraft</div>' + head + rows + "</div></div></section>" +
      '<aside class="panel ck-side" style="align-self:start"><h2>Your seats</h2><p class="hint">' + fare.name + " fare: " + fare.seat.toLowerCase() + ".</p><dl class=\"ck-seats\">" +
      group.map(function (G) { var ss = G.key === L.key ? picks : (t.seats[G.key] || []); return who.map(function (i) { return "<div><dt>" + esc(b.passengers[i].first) + ", " + G.lg.from + " to " + G.lg.to + '</dt><dd' + (ss[i] ? ' class="mono"' : ' class="ck-none"') + ">" + (ss[i] || "Not chosen") + "</dd></div>"; }).join(""); }).join("") +
      '</dl><div class="sum-row total" style="margin-top:14px"><span>Seat charges</span><b>' + (fees ? money(fees) : "None") + "</b></div>" +
      (seatsOnly ? '<button class="btn btn-primary" type="button" id="sm-save" style="width:100%;margin-top:16px">Save seats</button>' : '<button class="btn btn-primary" type="button" id="sm-go" style="width:100%;margin-top:16px">Check in</button><p class="fine">Anyone without a seat gets the best free one, side by side where we can.</p>') +
      '<p class="fine">Demonstration charges. No payment is taken.</p></aside></div>';
  }
  function passStep(b, group, t) {
    var who = b.passengers.map(function (p, i) { return i; }).filter(function (i) { return ck.pax[i]; });
    var cards = [];
    group.forEach(function (L) {
      var ls = legStatus({ from: L.lg.from, to: L.lg.to, dep: L.dep, mins: L.lg.mins, flightNo: L.lg.flightNo }, L.date), seats = t.seats[L.key] || [], r = D.seed(L.key + b.ref);
      who.forEach(function (i) {
        var p = b.passengers[i], seat = seats[i] || "", row = parseInt(seat, 10) || 0, zone = b.cabin === "business" || b.cabin === "first" ? 1 : b.cabin === "premium" ? 2 : row >= 55 ? 3 : 4;
        cards.push('<article class="bp" aria-label="Boarding pass for ' + esc(p.first + " " + p.last) + ", " + L.lg.flightNo + '"><header class="bp-top"><span class="brand-word">Aurora</span><span>Boarding pass</span></header>' +
          '<div class="bp-route"><div><b class="mono">' + L.lg.from + "</b><span>" + esc(A(L.lg.from).city) + '</span></div><span class="bp-plane">' + icon("airplane") + '</span><div style="text-align:right"><b class="mono">' + L.lg.to + "</b><span>" + esc(A(L.lg.to).city) + "</span></div></div>" +
          '<dl class="bp-grid"><div class="w2"><dt>Passenger</dt><dd>' + esc((p.last + "/" + p.first + " " + (p.title || "")).toUpperCase()) + '</dd></div><div><dt>Flight</dt><dd class="mono">' + L.lg.flightNo + "</dd></div><div><dt>Date</dt><dd>" + fmtDate(L.date) + '</dd></div><div><dt>Boards</dt><dd class="mono">' + fmtTime(L.dep - 45 + ls.delay) + '</dd></div><div><dt>Departs</dt><dd class="mono">' + fmtTime(L.dep + ls.delay) + "</dd></div>" +
          '<div><dt>Gate</dt><dd class="mono">' + ls.gate + '</dd></div><div><dt>Terminal</dt><dd class="mono">T' + ls.term + '</dd></div><div><dt>Seat</dt><dd class="mono bp-seat">' + (seat || "At gate") + '</dd></div><div><dt>Zone</dt><dd class="mono">' + zone + "</dd></div><div><dt>Class</dt><dd>" + cabinName(b.cabin) + '</dd></div><div><dt>Seq</dt><dd class="mono">' + pad(Math.floor(r() * 90) + 10) + Math.floor(r() * 9) + "</dd></div></dl>" +
          '<div class="bp-code">' + qr(b.ref + p.last + L.key + i) + "<p>Show this code at security and at the gate. Gate closes " + fmtTime(L.dep - 20 + ls.delay) + ".</p></div>" + (ls.delay ? '<p class="bp-note">' + icon("clock") + "Delayed " + ls.delay + " minutes. Times above are updated.</p>" : "") + "</article>");
      });
    });
    return '<div class="ck-done"><div class="alert alert-ok">' + icon("check-circle") + "<span>You’re checked in. " + who.length + (who.length === 1 ? " traveller" : " travellers") + ", " + group.length + (group.length === 1 ? " flight" : " flights") + ". Boarding passes are below and saved to this booking.</span></div>" +
      '<div class="bp-rail" tabindex="0" aria-label="Boarding passes">' + cards.join("") + "</div>" +
      '<div class="actions"><a class="link" href="#/manage?' + qs({ ref: b.ref, last: b.last }) + '">Back to the booking</a><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-secondary" type="button" data-wallet>' + icon("wallet") + 'Add to wallet</button><button class="btn btn-primary" type="button" data-print>' + icon("printer") + "Print passes</button></div></div></div>";
  }
  function bindCheckin(b, group, t, seatsOnly, back) {
    var paxForm = $("#ck-pax");
    if (paxForm) {
      paxForm.addEventListener("submit", function (e) {
        e.preventDefault(); var err = $("#ck-err");
        $$("[data-pax]", paxForm).forEach(function (c) { ck.pax[+c.dataset.pax] = c.checked; });
        if (!ck.pax.some(Boolean)) { err.innerHTML = '<div class="alert alert-err">' + icon("warning-circle") + "<span>Choose at least one traveller to check in.</span></div>"; return; }
        if (!$("#ck-d1").checked || !$("#ck-d2").checked) { err.innerHTML = '<div class="alert alert-err">' + icon("warning-circle") + "<span>Confirm both travel declarations to continue.</span></div>"; (!$("#ck-d1").checked ? $("#ck-d1") : $("#ck-d2")).focus(); return; }
        ck.step = 1; ck.picks = null; render(); window.scrollTo(0, 0);
      });
      return;
    }
    $$("[data-leg]", main).forEach(function (bt) { bt.addEventListener("click", function () { keep(); ck.leg = +bt.dataset.leg; ck.picks = null; render(); }); });
    $$("[data-who]", main).forEach(function (bt) { bt.addEventListener("click", function () { ck.who = +bt.dataset.who; render(); }); });
    function keep() { if (ck.picks) { t.seats[ck.picks.key] = ck.picks.seats.slice(); saveTrip(b.ref, t); } }
    $$("[data-seat]", main).forEach(function (bt) {
      bt.addEventListener("click", function () {
        var id = bt.dataset.seat, s = ck.picks.seats, at = s.indexOf(id);
        if (at > -1) s[at] = null; else { s[ck.who] = id; var next = b.passengers.map(function (p, i) { return i; }).filter(function (i) { return (seatsOnly || ck.pax[i]) && !s[i]; })[0]; if (next !== undefined) ck.who = next; }
        keep(); var y = window.scrollY, sc = $(".sm-scroll", main), sy = sc ? sc.scrollTop : 0; render(); window.scrollTo(0, y); var sc2 = $(".sm-scroll", main); if (sc2) sc2.scrollTop = sy;
        var again = $('[data-seat="' + id + '"]', main); if (again) again.focus();
      });
    });
    var save = $("#sm-save"); if (save) save.addEventListener("click", function () { keep(); toast("Seats saved to booking " + b.ref + "."); go(back); });
    var goBtn = $("#sm-go");
    if (goBtn) goBtn.addEventListener("click", function () {
      keep();
      group.forEach(function (L) { var n = b.passengers.length, ss = (t.seats[L.key] || []).slice(); var wanted = ss.map(function (s, i) { return ck.pax[i] ? s : s; }); var filled = autoSeats(L, b.cabin, wanted, n); b.passengers.forEach(function (p, i) { if (!ck.pax[i]) filled[i] = ss[i] || null; }); t.seats[L.key] = filled; t.checked[L.key] = true; });
      saveTrip(b.ref, t); ck.step = 2; render(); window.scrollTo(0, 0);
    });
    var w = $("[data-wallet]", main); if (w) w.addEventListener("click", function () { toast("Demonstration only: in a live app this adds the passes to your phone’s wallet."); });
    var pr = $("[data-print]", main); if (pr) pr.addEventListener("click", function () { window.print(); });
  }

  /* ---------- flight status ---------- */
  function allLegs(date) {
    var out = {};
    D.airports.forEach(function (a) { D.airports.forEach(function (b) { if (a === b) return; (D.search({ from: a.code, to: b.code, date: date }).flights || []).forEach(function (f) { if (!f.stops) out[f.legs[0].flightNo + "|" + f.dep] = f.legs[0]; }); }); });
    return Object.keys(out).map(function (k) { return out[k]; });
  }
  /* the status track: a curved route that keeps its shape at any width. The curve is stretched only
     horizontally (non-scaling stroke keeps the line even); dots and the aircraft are HTML laid over it. */
  function statusTrack(s, lg) {
    var p = Math.max(0, Math.min(1, s.prog)), H = 56, y0 = 46, peak = 8;
    function yAt(t) { return (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * (2 * peak - y0) + t * t * y0; }   // quadratic curve, control point set so the top sits at `peak`
    var d = "M0 " + y0 + " Q 500 " + (2 * peak - y0) + " 1000 " + y0;
    function flownPath(t) { var pts = []; for (var k = 0; k <= 40; k++) { var u = t * k / 40; pts.push((k ? "L" : "M") + (u * 1000).toFixed(1) + " " + yAt(u).toFixed(2)); } return pts.join(" "); }
    var left = Math.round((1 - p) * lg.mins), note = s.st === "Landed" ? "Landed" : p > 0 ? fmtDur(left) + " to go" : "Departs " + fmtTime(lg.dep + s.delay);
    var slope = 2 * ((1 - p) * (2 * peak - 2 * y0) + p * (2 * y0 - 2 * peak)) / 2;   // dy/dt
    return '<div class="st-track" style="--p:' + p.toFixed(3) + '"><svg viewBox="0 0 1000 ' + H + '" preserveAspectRatio="none" aria-hidden="true"><path class="st-base" d="' + d + '" vector-effect="non-scaling-stroke"/>' +
      (p > 0 ? '<path class="st-flown" d="' + flownPath(p) + '" vector-effect="non-scaling-stroke"/>' : "") + "</svg>" +
      '<span class="st-dot" style="left:0;top:' + y0 + 'px"></span><span class="st-dot' + (p >= 1 ? " on" : "") + '" style="left:100%;top:' + y0 + 'px"></span>' +
      (p > 0 && p < 1 ? '<span class="st-plane" data-slope="' + slope.toFixed(2) + '" style="left:' + (p * 100).toFixed(2) + "%;top:" + yAt(p).toFixed(1) + 'px">' + icon("airplane") + "</span>" : "") +
      '<span class="st-note">' + note + "</span></div>";
  }
  /* point each in-flight aircraft along its curve, using the track's real width */
  function aimPlanes(root) { $$(".st-plane", root).forEach(function (el) { var w = el.parentNode.clientWidth || 600, ang = Math.atan2(+el.dataset.slope, w) * 180 / Math.PI; el.style.setProperty("--a", (90 + ang).toFixed(1) + "deg"); }); }
  function legStatus(lg, date) {
    var a = A(lg.from), b = A(lg.to), r = D.seed(lg.flightNo + date), delay = r() < 0.22 ? 15 + Math.round(r() * 8) * 5 : 0;
    var d = parse(date), depUtc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) + (lg.dep + delay - a.tz * 60) * 6e4, arrUtc = depUtc + lg.mins * 6e4, now = Date.now(), st, cls, prog = 0;
    if (now < depUtc - 60 * 6e4) { st = delay ? "Delayed " + delay + " min" : "On time"; cls = delay ? "warn" : "ok"; }
    else if (now < depUtc) { st = "Boarding"; cls = "live"; }
    else if (now < arrUtc) { st = "In flight"; cls = "live"; prog = (now - depUtc) / (arrUtc - depUtc); }
    else { st = "Landed"; cls = "info"; prog = 1; }
    return { st: st, cls: cls, prog: prog, delay: delay, gate: String.fromCharCode(65 + Math.floor(r() * 6)) + (1 + Math.floor(r() * 24)), term: 1 + Math.floor(r() * 3), a: a, b: b };
  }
  function status(q) {
    var date = validDate(q.date) ? q.date : today(), mode = q.from ? "route" : "flight", list = [], searched = !!(q.flight || q.from);
    if (q.flight) { var n = String(q.flight).toUpperCase().replace(/^AU\s*/, "").replace(/\D/g, ""); list = allLegs(date).filter(function (l) { return l.flightNo === "AU " + n; }); }
    if (q.from && q.to) list = (D.search({ from: q.from, to: q.to, date: date }).flights || []).filter(function (f) { return !f.stops; }).map(function (f) { return f.legs[0]; });
    var days = [-1, 0, 1].map(function (k) { return addDays(today(), k); });
    var sample = ((D.search({ from: "SIN", to: "KEF", date: date }).flights || []).filter(function (f) { return !f.stops; })[0] || { legs: [{ flightNo: "AU 548" }] }).legs[0].flightNo;
    function opts(sel) { return D.airports.map(function (a) { return '<option value="' + a.code + '"' + (a.code === sel ? " selected" : "") + ">" + esc(a.city) + " (" + a.code + ")</option>"; }).join(""); }
    main.innerHTML = '<div class="page-head ph-photo ph-status"><div class="wrap"><h1>Flight status</h1><p>Departure and arrival times for yesterday, today and tomorrow. Times are local to each airport.</p></div></div>' +
      '<div class="task"><div class="wrap"><form class="panel" id="sf" novalidate><div class="seg" role="group" aria-label="Search by"><button type="button" data-mode="flight" aria-pressed="' + (mode === "flight") + '">Flight number</button><button type="button" data-mode="route" aria-pressed="' + (mode === "route") + '">Route</button></div><div class="form-grid">' +
      '<div class="fg s4" data-only="flight"' + (mode === "flight" ? "" : " hidden") + '><label for="s-fl">Flight number</label><input class="input mono" id="s-fl" placeholder="' + sample + '" value="' + esc(q.flight || "") + '" autocomplete="off"></div>' +
      '<div class="fg s3" data-only="route"' + (mode === "route" ? "" : " hidden") + '><label for="s-from">From</label><select class="select" id="s-from">' + opts(q.from || "SIN") + "</select></div>" +
      '<div class="fg s3" data-only="route"' + (mode === "route" ? "" : " hidden") + '><label for="s-to">To</label><select class="select" id="s-to">' + opts(q.to || "HND") + "</select></div>" +
      '<div class="fg s3"><label for="s-date">Date</label><select class="select" id="s-date">' + days.map(function (d, i) { return '<option value="' + d + '"' + (d === date ? " selected" : "") + ">" + ["Yesterday", "Today", "Tomorrow"][i] + ", " + fmtDate(d) + "</option>"; }).join("") + "</select></div>" +
      '<div class="fg s3 fg-btn"><button class="btn btn-primary" type="submit">Check status</button></div></div><p class="hint" style="margin-top:12px">Try ' + sample + " or a route such as Singapore to Tokyo. Status is simulated from the demonstration schedule.</p></form>" +
      '<div id="s-res" aria-live="polite" style="display:grid;gap:12px;margin-top:16px">' +
      (searched && !list.length ? '<div class="empty-state">' + icon("airplane-tilt") + "<h2>No flights found</h2><p>" + (q.flight ? "We don’t operate " + esc(String(q.flight).toUpperCase()) + " on " + fmtDate(date, true) + "." : "There are no nonstop flights on this route that day.") + " Check the number or search by route.</p></div>" : "") +
      list.map(function (lg) {
        var s = legStatus(lg, date);
        return '<article class="status-card"><div class="row"><h2 style="font-size:18px"><span class="mono">' + lg.flightNo + '</span> <span style="color:var(--ink-3);font-weight:500">' + esc(s.a.city) + " to " + esc(s.b.city) + '</span></h2><span class="badge ' + s.cls + '">' + s.st + "</span></div>" +
          '<div class="status-track"><div><div class="code">' + s.a.code + '</div><div class="t">' + (s.delay ? "<s>" + fmtTime(lg.dep) + "</s> " + fmtTime(lg.dep + s.delay) : fmtTime(lg.dep)) + "</div></div>" + statusTrack(s, lg) + '<div style="text-align:right"><div class="code">' + s.b.code + '</div><div class="t">' + fmtTime(lg.arr + s.delay) + "</div></div></div>" +
          '<dl class="status-facts"><div><dt>Terminal</dt><dd>T' + s.term + '</dd></div><div><dt>Gate</dt><dd class="mono">' + s.gate + "</dd></div><div><dt>Aircraft</dt><dd>" + D.aircraft[lg.aircraft] + "</dd></div><div><dt>Flight time</dt><dd>" + fmtDur(lg.mins) + "</dd></div></dl></article>";
      }).join("") + "</div></div></div>";
    aimPlanes(main);
    var form = $("#sf");
    $$("[data-mode]", form).forEach(function (b) { b.addEventListener("click", function () { $$("[data-mode]", form).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); $$("[data-only]", form).forEach(function (x) { x.hidden = x.dataset.only !== b.dataset.mode; }); }); });
    form.addEventListener("submit", function (e) {
      e.preventDefault(); var m = $("[data-mode][aria-pressed='true']", form).dataset.mode, d = $("#s-date").value;
      if (m === "flight") { var v = $("#s-fl").value.trim(); if (!/^(AU)?\s*\d{2,4}$/i.test(v)) { $("#s-res").innerHTML = '<div class="alert alert-err">' + icon("warning-circle") + "<span>Enter a flight number like " + sample + ".</span></div>"; $("#s-fl").focus(); return; } go("#/status?" + qs({ flight: v, date: d })); }
      else { var f = $("#s-from").value, t = $("#s-to").value; if (f === t) { $("#s-res").innerHTML = '<div class="alert alert-err">' + icon("warning-circle") + "<span>Choose two different airports.</span></div>"; return; } go("#/status?" + qs({ from: f, to: t, date: d })); }
    });
  }

  /* ---------- destinations: a globe of routes from Singapore, then an explorer for every city ---------- */
  /* round country flags (flag-icons, MIT) for the destinations globe, card and list */
  var FLAGS = { "Iceland": "is", "Japan": "jp", "Portugal": "pt", "New Zealand": "nz", "South Africa": "za", "United States": "us", "Australia": "au", "Singapore": "sg" };
  function flagSrc(country) { return FLAGS[country] ? "vendor/flags/" + FLAGS[country] + ".svg" : ""; }
  function flagImg(country, cls) { var f = flagSrc(country); return f ? '<img class="' + cls + '" src="' + f + '" alt="" width="20" height="20" decoding="async">' : ""; }
  function localTime(tz) { var d = new Date(Date.now() + tz * 3600e3); return pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()); }
  var destSort = "time";
  function destinations(q) {
    var regions = ["All", "Asia", "Europe", "Oceania", "Americas", "Africa"], reg = regions.indexOf(q.region) > -1 ? q.region : "All";
    var hub = A("SIN"), date = addDays(today(), 30);
    var all = D.destinations.map(function (d) {
      var a = A(d.code), r = D.search({ from: "SIN", to: d.code, date: date }), fl = r.flights || [];
      return { d: d, a: a, mins: fl.length ? Math.min.apply(null, fl.map(function (f) { return f.mins; })) : null, nonstop: fl.some(function (f) { return !f.stops; }), price: D.cheapestFor("SIN", d.code, date) };
    });
    var shown = all.filter(function (x) { return reg === "All" || x.a.region === reg; });
    main.innerHTML =
      '<section class="gh" aria-labelledby="atlas-h"><div class="gh-media" aria-hidden="true"><canvas class="gh-stars"></canvas><canvas class="gh-stars twinkle"></canvas><div class="gh-sea img-day"></div><div class="gh-sea img-night"></div><div class="gh-tint"></div></div><div class="wrap gh-in"><div class="gh-copy">' +
      '<h1 id="atlas-h">Where the night takes you</h1><p>Every route starts in Singapore. Spin the globe or pick a city, and we will draw the way there.</p>' +
      '<div class="filters" role="group" aria-label="Filter by region">' + regions.map(function (r) { return '<a class="chip" href="#/destinations' + (r === "All" ? "" : "?region=" + r) + '" aria-pressed="' + (r === reg) + '">' + r + "</a>"; }).join("") + "</div>" +
      '<div class="atlas-card" id="atlas-card" aria-live="polite"></div></div>' +
      '<div class="gh-stage"><div class="gh-globe"><canvas class="gh-canvas" aria-hidden="true"></canvas><div class="gh-pins" role="group" aria-label="Destinations on the globe"></div></div><p class="gh-hint">' + icon("hand-grabbing") + "Drag to spin. Select a city to see its route.</p></div>" +
      "</div></section>" +

      (shown.length ? '<section class="dx-band" aria-labelledby="dx-h"><div class="wrap"><div class="dg-head"><div><h2 id="dx-h">Explore ' + (reg === "All" ? "a city" : esc(reg)) + '</h2><p>' + shown.length + (shown.length === 1 ? " city" : " cities") + ' from Singapore. Pick one to see what to do, when to go and what it costs to get there.</p></div>' +
        '<div class="seg dg-sort" role="group" aria-label="Sort destinations">' + [["time", "Shortest flight"], ["price", "Lowest fare"], ["name", "A to Z"]].map(function (o) { return '<button type="button" data-sort="' + o[0] + '" aria-pressed="' + (o[0] === destSort) + '">' + o[1] + "</button>"; }).join("") + "</div></div>" +
        '<div class="dx"><div class="dx-list" id="dx-list" role="tablist" aria-label="Destinations"></div><article class="dx-panel" id="dx-panel" role="tabpanel" tabindex="0"></article></div></div></section>'
        : '<div class="wrap" style="padding-bottom:96px"><div class="empty-state">' + icon("globe-hemisphere-west") + "<h2>No destinations in " + reg + ' yet</h2><p>Our demonstration network doesn’t feature a city there. Try another region.</p><a class="btn btn-secondary btn-sm" href="#/destinations">Show all</a></div></div>');

    var card = $("#atlas-card"), active = -1, globe = null;
    function select(i, scroll, fromGlobe, instant) {
      active = i; var x = all[i];
      card.innerHTML = '<div class="ac-row"><span class="mono ac-codes">SIN ' + icon("arrow-right") + " " + x.a.code + '</span><span class="mono ac-time">' + (x.mins ? fmtDur(x.mins) : "") + '</span></div><h2>' + flagImg(x.a.country, "ac-flag") + esc(x.d.title) + ", " + esc(x.a.country) + "</h2><p>" + (x.nonstop ? "Nonstop" : "One connection") + (x.price ? ", fares from " + money(x.price) : "") + '</p><button type="button" class="link" data-open="' + x.a.code + '">' + (shown.indexOf(x) > -1 ? "See " + esc(x.d.title) + " details" : "Show in all regions") + "</button>";
      $("[data-open]", card).addEventListener("click", function () { if (shown.indexOf(x) > -1) jump(x.a.code); else go("#/destinations"); });
      if (globe && !fromGlobe) globe.pick(x.a.code, false, instant);
      if (scroll) jump(x.a.code);
    }
    function jump(code) {
      if (!$("#dx-tab-" + code)) return;
      showCity(code, true);
      $(".dx-band").scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" });
    }
    /* the night sky behind the globe: two seeded star layers, redrawn to the hero's size */
    function stars() {
      $$(".gh-stars", main).forEach(function (cv, layer) {
        var r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1), c = cv.getContext("2d"), seed = 7 + layer * 101;
        function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
        cv.width = r.width * dpr; cv.height = r.height * dpr; c.scale(dpr, dpr);
        var n = Math.round(r.width * r.height / (layer ? 9000 : 4200));
        for (var k = 0; k < n; k++) {
          var x = rnd() * r.width, y = rnd() * r.height * 0.85, big = rnd() > 0.93, a = (0.25 + rnd() * 0.6) * (1 - y / r.height * 0.6);
          c.fillStyle = "rgba(220,235,255," + a.toFixed(2) + ")"; c.beginPath(); c.arc(x, y, big ? 1.3 : 0.7, 0, Math.PI * 2); c.fill();
        }
      });
    }
    function seaSize() { $$(".gh-sea", main).forEach(function (el) { el.style.setProperty("--tw", Math.round(el.clientHeight * (el.classList.contains("img-day") ? 1536 / 453 : 1536 / 486)) + "px"); }); }
    seaSize(); window.addEventListener("resize", seaSize); cleanups.push(function () { window.removeEventListener("resize", seaSize); });
    stars(); window.addEventListener("resize", stars); cleanups.push(function () { window.removeEventListener("resize", stars); });
    var first = all.indexOf(shown[0] || all[0]);
    if (window.AuroraGlobe) {
      globe = window.AuroraGlobe({
        canvas: $(".gh-canvas", main), pins: $(".gh-pins", main), reduced: RM, theme: theme,
        hub: { code: "SIN", lat: hub.lat, lon: hub.lon, flag: flagSrc(hub.country) },
        cities: all.map(function (x) { return { code: x.a.code, title: x.d.title, lat: x.a.lat, lon: x.a.lon, flag: flagSrc(x.a.country), dim: shown.indexOf(x) < 0 }; }),
        onPick: function (code) { var i = all.map(function (x) { return x.a.code; }).indexOf(code); if (i > -1 && i !== active) select(i, false, true); }
      });
      cleanups.push(function () { globe.destroy(); });
    }
    select(first, false, false, true);

    /* the explorer: a sortable list of cities beside one rich panel */
    var list = $("#dx-list"), panel = $("#dx-panel"), cur = null;
    function byCode(code) { return shown.filter(function (x) { return x.a.code === code; })[0]; }
    function tzDiff(tz) { var d = tz - hub.tz; return d === 0 ? "Same as Singapore" : (d > 0 ? "+" : "−") + Math.abs(d) + "h from Singapore"; }
    function renderList() {
      if (!list) return;
      var by = { time: function (p, q) { return (p.mins || 1e9) - (q.mins || 1e9); }, price: function (p, q) { return (p.price || 1e9) - (q.price || 1e9); }, name: function (p, q) { return p.d.title.localeCompare(q.d.title); } }[destSort];
      list.innerHTML = shown.slice().sort(by).map(function (x) {
        var c = x.a.code;
        return '<button type="button" role="tab" class="dx-item" id="dx-tab-' + c + '" data-code="' + c + '" aria-controls="dx-panel" aria-selected="false" tabindex="-1">' +
          '<img src="' + x.d.photo + '" alt="" width="96" height="64" loading="lazy" decoding="async"><span class="dx-name"><b>' + esc(x.d.title) + "</b><span>" + flagImg(x.a.country, "dx-flag") + esc(x.d.kicker) + "</span></span>" +
          '<span class="dx-meta"><span class="mono">' + (x.mins ? fmtDur(x.mins) : "No route") + "</span><span>" + (x.price ? money(x.price) : "") + "</span></span></button>";
      }).join("");
      $$(".dx-item", list).forEach(function (t, k, all) {
        t.addEventListener("click", function () { showCity(t.dataset.code, true); });
        t.addEventListener("keydown", function (e) {
          var d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (!d) return;
          e.preventDefault(); var n = all[(k + d + all.length) % all.length]; showCity(n.dataset.code, true); n.focus();
        });
      });
      showCity(cur && byCode(cur) ? cur : list.firstChild.dataset.code, false);
    }
    function showCity(code, animate) {
      var x = byCode(code); if (!x || !panel) return; cur = code;
      $$(".dx-item", list).forEach(function (t) { var on = t.dataset.code === code; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; if (on && animate) t.scrollIntoView({ block: "nearest", inline: "nearest", behavior: RM ? "auto" : "smooth" }); });
      panel.setAttribute("aria-labelledby", "dx-tab-" + code);
      var d = x.d;
      panel.innerHTML = '<div class="dx-media"><img src="' + d.photo + '" alt="' + esc(d.title) + ", " + esc(d.kicker) + '" width="1536" height="864" decoding="async">' +
        (x.mins ? '<span class="dx-badge">' + icon("airplane-tilt") + '<span class="mono">SIN ' + fmtDur(x.mins) + "</span>" + (x.nonstop ? "Nonstop" : "1 stop") + "</span>" : "") + "</div>" +
        '<div class="dx-body"><span class="dx-k">' + esc(d.kicker) + "</span><h3>" + esc(d.title) + '</h3><p class="dx-line">' + esc(d.line) + "</p>" +
        '<h4 class="dx-sub">Three reasons to go</h4><ul class="dx-hl">' + (d.highlights || []).map(function (h) { return '<li><span class="dx-ic">' + icon(h[0]) + "</span><span><b>" + esc(h[1]) + "</b>" + esc(h[2]) + "</span></li>"; }).join("") + "</ul>" +
        '<dl class="dx-facts"><div><dt>' + icon("calendar-blank") + "Best time</dt><dd>" + esc(d.season) + "</dd></div><div><dt>" + icon("thermometer-simple") + "Weather</dt><dd>" + esc(d.weather) + "</dd></div><div><dt>" + icon("clock") + 'Local time</dt><dd><span class="mono" data-tz="' + x.a.tz + '">' + localTime(x.a.tz) + "</span>, " + tzDiff(x.a.tz) + "</dd></div></dl>" +
        '<div class="dx-foot"><span class="dg-price">Economy from<b>' + (x.price ? money(x.price) : "No fare") + '</b><small>One way, per adult</small></span><div class="dx-cta"><button type="button" class="btn btn-secondary btn-sm" data-route>' + icon("map-pin") + 'Show route</button><a class="btn btn-primary btn-sm" href="#/book?to=' + code + '">Search flights to ' + esc(d.title) + "</a></div></div></div>";
      $("[data-route]", panel).addEventListener("click", function () { select(all.indexOf(x), false); $(".atlas").scrollIntoView({ behavior: RM ? "auto" : "smooth" }); });
      if (animate && !RM) { panel.classList.remove("dx-swap"); void panel.offsetWidth; panel.classList.add("dx-swap"); }
    }
    renderList();
    $$("[data-sort]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        destSort = b.dataset.sort;
        $$("[data-sort]", main).forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
        renderList();
      });
    });
    var tick = setInterval(function () { $$("[data-tz]", main).forEach(function (el) { el.textContent = localTime(+el.dataset.tz); }); }, 30000);
    cleanups.push(function () { clearInterval(tick); });
  }

  /* ---------- experiences ---------- */
  function experiences() {
    main.innerHTML = '<div class="page-head ph-photo ph-exp"><div class="wrap"><h1>Cabins and aircraft</h1><p>One aircraft family, one livery, and cabins designed around long nights in the air.</p></div></div>' +
      '<section class="band" style="padding-top:40px"><div class="wrap"><figure class="craft-figure reveal" style="margin:0"><img src="media/aircraft-side.webp?v=2" alt="Side profile of an Aurora Airlines A350-1000 above bright white clouds under a clear blue sky" decoding="async"></figure>' +
      '<div class="craft-grid"><dl class="craft-facts">' + [["A350-1000", "Long-haul flagship", "Three cabins, with Business suites in a 1-2-1 layout."], ["787-9", "Regional widebody", "Flies our shorter routes across Asia and Oceania."], ["9V-AUR", "Livery", "Ice white, a navy wordmark, and the aurora up the tail."]].map(function (f) { return "<div><dt>" + f[0] + "</dt><dd><b>" + f[1] + "</b>" + f[2] + "</dd></div>"; }).join("") +
      '</dl><div class="craft-plates"><figure><img src="media/aircraft-engine.webp?v=2" alt="The engine and blended winglet in daylight" loading="lazy"></figure><figure><img src="media/aircraft-tail.webp?v=2" alt="The teal to violet tail fin against a clear blue sky" loading="lazy"></figure></div></div><p class="hint" style="margin-top:16px">Aircraft images are AI-generated renders of a fictional livery. Specifications are illustrative.</p></div></section>' +
      '<section class="band"><div class="wrap"><div class="sec-head"><h2>Choose how you cross the night</h2></div><div class="tabs" role="tablist" aria-label="Cabins">' + D.cabinStories.map(function (c, i) { return '<button type="button" role="tab" id="tab-' + c.id + '" aria-controls="cabin-panel" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-cabin-tab="' + i + '">' + c.title + "</button>"; }).join("") + '</div><div class="cabin-panel" id="cabin-panel" role="tabpanel"></div></div></section>';
    cabinTabs(); watchReveals();
  }

  /* ---------- account (demonstration) ---------- */
  /* ---------- Sign in and join Aurora Miles ----------
     One page, two forms, deep-linkable (#/account and #/account?mode=join). Beside the form, a membership card
     fills in as you type. Fields validate when you leave them, errors sit under the field, and the first problem
     takes focus on submit. Demonstration only: the "account" lives in this tab's session storage. */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function memberNo(seed) { var r = D.seed(seed || "aurora"), n = ""; for (var i = 0; i < 8; i++) n += Math.floor(r() * 10); return "AU " + n.slice(0, 4) + " " + n.slice(4); }
  function memberCard(tier, name, no) {
    return '<div class="mi-' + tier + ' auth-card-wrap"><div class="mi-card auth-card" aria-hidden="true"><span class="brand-word">Aurora</span><span class="mi-card-tier">' + ({ blue: "Blue", silver: "Silver", aurora: "Aurora" })[tier] +
      '</span><span class="auth-card-name" id="card-name">' + esc(name) + '</span><span class="mi-card-no mono" id="card-no">' + esc(no) + "</span></div></div>";
  }
  function field(id, label, type, ac, extra) {
    extra = extra || {};
    return '<div class="fg ' + (extra.span || "s12") + '"><label for="' + id + '">' + label + (extra.opt ? ' <span class="opt">Optional</span>' : "") + "</label>" +
      '<input class="input" id="' + id + '" name="' + id + '" type="' + type + '" autocomplete="' + ac + '"' + (extra.attrs || "") + ' aria-describedby="' + id + '-err' + (extra.help ? " " + id + "-help" : "") + '">' +
      (type === "password" ? '<button type="button" class="pw-toggle" data-reveal="' + id + '" aria-pressed="false" aria-controls="' + id + '">' + icon("eye") + "Show</button>" : "") +
      (extra.help ? '<p class="hint" id="' + id + '-help">' + extra.help + "</p>" : "") + '<p class="err" id="' + id + '-err" hidden></p></div>';
  }
  function authPage(q) {
    var join = q.mode === "join";
    var head = '<div class="page-head ph-photo ph-account"><div class="wrap"><h1>' + (join ? "Join Aurora Miles" : "Welcome back") + "</h1><p>" +
      (join ? "Free to join. Earn miles from your very first booking." : "Your trips, boarding passes and Aurora Miles in one place.") + "</p></div></div>";
    var sw = '<nav class="seg auth-switch" aria-label="Account">' + [["", "Sign in"], ["join", "Join Aurora Miles"]].map(function (m) { var on = (m[0] === "join") === join; return '<a href="#/account' + (m[0] ? "?mode=join" : "") + '"' + (on ? ' aria-current="page"' : "") + ">" + m[1] + "</a>"; }).join("") + "</nav>";
    var form = join
      ? '<form class="auth-form" id="auth" novalidate data-mode="join"><div class="form-grid">' +
        field("j-first", "First name", "text", "given-name", { span: "s6" }) + field("j-last", "Last name", "text", "family-name", { span: "s6" }) +
        field("j-email", "Email", "email", "email", { help: "We send booking confirmations and boarding passes here." }) +
        field("j-pw", "Create a password", "password", "new-password") +
        '</div><ul class="pw-rules" id="pw-rules" aria-live="polite">' + [["len", "At least 8 characters"], ["num", "A number"], ["case", "An upper and a lower case letter"]].map(function (r) { return '<li data-rule="' + r[0] + '">' + icon("circle") + "<span>" + r[1] + "</span></li>"; }).join("") + "</ul>" +
        '<label class="check auth-check"><input type="checkbox" id="j-terms" aria-describedby="j-terms-err"><span>I agree to the <a class="link" href="#/help/terms">terms of use</a> and the <a class="link" href="#/help/privacy">privacy notice</a>.</span></label><p class="err" id="j-terms-err" hidden></p>' +
        '<label class="check auth-check"><input type="checkbox" id="j-news"><span>Send me fare deals and route news. <span class="opt">Optional</span></span></label>' +
        '<button class="btn btn-primary auth-submit" type="submit">Create account</button></form>'
      : '<form class="auth-form" id="auth" novalidate data-mode="signin"><div class="form-grid">' +
        field("s-email", "Email", "email", "username") + field("s-pw", "Password", "password", "current-password") +
        '</div><div class="auth-row"><label class="check"><input type="checkbox" id="s-keep" checked><span>Keep me signed in</span></label><button type="button" class="link" data-forgot>Forgot password?</button></div>' +
        '<div id="s-note" role="status" aria-live="polite"></div>' +
        '<button class="btn btn-primary auth-submit" type="submit">Sign in</button>' +
        '<div class="auth-or"><span>or</span></div><button class="btn btn-secondary auth-alt" type="button" data-passkey>' + icon("fingerprint") + "Sign in with a passkey</button>" +
        '<p class="auth-foot">Only need one trip? <a class="link" href="#/manage">Find a booking without an account</a></p></form>';
    var side = join
      ? memberCard("blue", "Your name", memberNo("new")) + '<div class="auth-side"><h2>What you get on day one</h2><ul class="ck-list">' +
        [["gift", "2,000 welcome miles", "Added when you create your account."], ["airplane-tilt", "Miles on every flight", "By distance, cabin and fare, from your first booking."], ["armchair", "Saved seats and passes", "Your choices and boarding passes in one place."]].map(function (x) { return "<li>" + icon(x[0]) + "<span><b>" + x[1] + "</b>" + x[2] + "</span></li>"; }).join("") + "</ul></div>"
      : memberCard("silver", "Welcome back", memberNo("silver")) + '<div class="auth-side"><h2>Signed in, you can</h2><ul class="ck-list">' +
        [["ticket", "Keep every trip together", "Bookings, seats and boarding passes, saved."], ["sparkle", "Use your miles", "Pay for flights, upgrades, seats and bags."], ["clock-counter-clockwise", "Check in faster", "Your passport details are already filled in."]].map(function (x) { return "<li>" + icon(x[0]) + "<span><b>" + x[1] + "</b>" + x[2] + "</span></li>"; }).join("") + "</ul></div>";
    main.innerHTML = head + '<div class="task"><div class="wrap auth-grid"><section class="panel auth-panel" aria-labelledby="auth-h"><h2 class="sr" id="auth-h">' + (join ? "Create your account" : "Sign in") + "</h2>" + sw +
      '<p class="auth-demo">' + icon("info") + "Demonstration only. Any email and an 8 character password work, and nothing is sent.</p>" + form + "</section><aside class=\"auth-aside\">" + side + "</aside></div></div>";
    bindAuth(join);
  }
  function bindAuth(join) {
    var form = $("#auth"), touched = {};
    function setErr(id, msg) {
      var f = $("#" + id), e = $("#" + id + "-err");
      if (msg) { e.innerHTML = icon("warning-circle") + "<span>" + msg + "</span>"; e.hidden = false; f.setAttribute("aria-invalid", "true"); }
      else { e.hidden = true; e.innerHTML = ""; f.removeAttribute("aria-invalid"); }
      return !msg;
    }
    var rules = {
      "s-email": function (v) { return !v ? "Enter the email you signed up with." : !EMAIL_RE.test(v) ? "Check the email: it needs an @ and a domain, like name@example.com." : ""; },
      "s-pw": function (v) { return !v ? "Enter your password." : v.length < 8 ? "Passwords have at least 8 characters." : ""; },
      "j-first": function (v) { return !v ? "Enter your first name, as on your passport." : ""; },
      "j-last": function (v) { return !v ? "Enter your last name, as on your passport." : ""; },
      "j-email": function (v) { return !v ? "Enter an email for confirmations and boarding passes." : !EMAIL_RE.test(v) ? "Check the email: it needs an @ and a domain, like name@example.com." : ""; },
      "j-pw": function (v) { return pwChecks(v).every(Boolean) ? "" : "Your password needs all three things listed below."; }
    };
    function pwChecks(v) { return [v.length >= 8, /\d/.test(v), /[a-z]/.test(v) && /[A-Z]/.test(v)]; }
    function check(id) { var f = $("#" + id); return setErr(id, rules[id](f.value.trim ? (id.indexOf("pw") > -1 ? f.value : f.value.trim()) : f.value)); }
    Object.keys(rules).forEach(function (id) {
      var f = $("#" + id); if (!f) return;
      f.addEventListener("blur", function () { if (f.value) touched[id] = true; if (touched[id]) check(id); });
      f.addEventListener("input", function () { if (touched[id]) check(id); });
    });
    $$("[data-reveal]", form).forEach(function (b) {
      b.addEventListener("click", function () { var f = $("#" + b.dataset.reveal), show = f.type === "password"; f.type = show ? "text" : "password"; b.setAttribute("aria-pressed", String(show)); b.innerHTML = icon(show ? "eye-slash" : "eye") + (show ? "Hide" : "Show"); f.focus(); });
    });
    if (join) {
      /* the card fills in as you type, and the password rules tick off live */
      function cardName() { var n = ($("#j-first").value.trim() + " " + $("#j-last").value.trim()).trim(); $("#card-name").textContent = n || "Your name"; $("#card-no").textContent = memberNo(n.toLowerCase() || "new"); }
      $("#j-first").addEventListener("input", cardName); $("#j-last").addEventListener("input", cardName);
      $("#j-pw").addEventListener("input", function () { var c = pwChecks($("#j-pw").value); $$("#pw-rules li").forEach(function (li, i) { li.classList.toggle("ok", c[i]); li.querySelector(".ph").className = "ph ph-" + (c[i] ? "check-circle" : "circle"); }); });
    } else {
      $("[data-forgot]", form).addEventListener("click", function () {
        touched["s-email"] = true;
        if (!check("s-email")) { $("#s-email").focus(); return; }
        $("#s-note").innerHTML = '<div class="alert alert-ok">' + icon("envelope-simple") + "<span>We sent a reset link to <b>" + esc($("#s-email").value.trim()) + "</b>. It works for 30 minutes. (Demonstration: nothing was sent.)</span></div>";
      });
      $("[data-passkey]", form).addEventListener("click", function () { toast("Demonstration: a passkey would sign you in with Face ID, Touch ID or a security key."); });
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ids = Object.keys(rules).filter(function (id) { return $("#" + id); }), firstBad = null;
      ids.forEach(function (id) { touched[id] = true; if (!check(id) && !firstBad) firstBad = $("#" + id); });
      if (join) { var t = $("#j-terms"); var ok = t.checked; var te = $("#j-terms-err"); te.hidden = ok; te.innerHTML = ok ? "" : icon("warning-circle") + "<span>Agree to the terms to create an account.</span>"; t.setAttribute("aria-invalid", String(!ok)); if (!ok && !firstBad) firstBad = t; }
      if (firstBad) { firstBad.focus(); return; }
      var btn = $(".auth-submit", form), label = btn.textContent;
      btn.disabled = true; btn.setAttribute("aria-busy", "true"); btn.innerHTML = '<span class="spin" aria-hidden="true"></span>' + (join ? "Creating your account" : "Signing in");
      setTimeout(function () {
        var user = join
          ? { email: $("#j-email").value.trim(), first: $("#j-first").value.trim(), last: $("#j-last").value.trim(), tier: "blue", miles: 2000, joined: true }
          : { email: $("#s-email").value.trim(), first: "", tier: "silver", miles: 48210 };
        store.set("aurora.user", user, true);
        toast(join ? "Account created. Welcome to Aurora Miles." : "Signed in");
        btn.disabled = false; btn.textContent = label;
        render(); window.scrollTo(0, 0);
      }, 700);
    });
  }

  function account(q) {
    var user = store.get("aurora.user", true);
    if (!user) return authPage(q || {});
    var tier = user.tier || "silver", name = [user.first, user.last].filter(Boolean).join(" "), first = user.first || "", miles = user.miles != null ? user.miles : 48210;
    main.innerHTML = '<div class="page-head ph-photo ph-account"><div class="wrap"><h1>' + (first ? (user.joined ? "Welcome aboard, " : "Welcome back, ") + esc(first) : "Your account") + '</h1><p>' + esc(user.email) + ', demonstration account</p></div></div><div class="task"><div class="wrap task-grid"><div class="panel"><h2>Upcoming trips</h2><p>Bookings made in this browser, plus two demonstration trips.</p><div style="display:grid;gap:8px;margin-top:16px">' +
      bookings().map(function (b) { var fl = D.findFlight(b.segments[0].id, b.cabin); return fl ? '<a class="chip" style="justify-content:space-between;min-height:52px;padding:0 18px" href="#/manage?ref=' + b.ref + "&last=" + encodeURIComponent(b.last) + '"><b>' + esc(A(fl.from).city) + " to " + esc(A(fl.to).city) + '</b><span>' + fmtDate(fl.date) + ', <span class="mono">' + b.ref + "</span></span></a>" : ""; }).join("") +
      '</div></div><aside class="panel acct-side" style="align-self:start">' + memberCard(tier, name || "Aurora member", memberNo(name.toLowerCase() || tier)) + '<h2>Aurora Miles</h2><p>' + ({ blue: "Blue", silver: "Silver", aurora: "Aurora" })[tier] + ' member' + (user.joined ? ", welcome miles added" : "") + '</p><p class="num" style="font-size:34px;font-weight:600;margin-top:6px">' + miles.toLocaleString("en-SG") + '</p><a class="link" style="display:inline-block;margin-top:6px" href="#/miles">Tiers, earning and awards</a><br><button class="btn btn-secondary btn-sm" style="margin-top:16px" type="button" data-out>' + icon("sign-out") + "Sign out</button></aside></div></div>";
    $("[data-out]").addEventListener("click", function () { try { sessionStorage.removeItem("aurora.user"); } catch (e) { } toast("Signed out"); render(); });
  }

  /* ---------- Aurora Miles: tiers, an earning calculator, award prices and the member's progress ---------- */
  var TIERS = [
    { id: "blue", name: "Blue", need: "Free to join", qual: 0, bonus: 0, perks: ["Earn miles on every flight and partner", "Spend miles on flights, seats and bags", "Family pooling for up to six people"] },
    { id: "silver", name: "Silver", need: "25,000 tier miles or 25 flights a year", qual: 25000, bonus: 25, perks: ["25% bonus miles", "Priority check-in and boarding", "Standard seats free on every fare", "One extra checked bag"] },
    { id: "aurora", name: "Aurora", need: "60,000 tier miles or 50 flights a year", qual: 60000, bonus: 50, perks: ["50% bonus miles", "Lounge access with one guest, any cabin", "Extra legroom seats free", "Two upgrade vouchers a year", "A dedicated service line"] }
  ];
  var MILES_CMP = [
    ["Bonus miles", "None", "25%", "50%"], ["Priority check-in", false, true, true], ["Priority boarding", false, "Zone 2", "Zone 1"],
    ["Seat selection", "Fare rules", "Standard free", "Any seat free"], ["Extra checked bag", false, "1 bag", "2 bags"],
    ["Lounge access", "Business only", "Business only", "Any cabin, plus a guest"], ["Upgrade vouchers", false, false, "2 a year"]
  ];
  var CABIN_EARN = { economy: 1, premium: 1.25, business: 1.75, first: 2.25 };
  var AWARD_ZONES = [["Asia", "Tokyo, Osaka, Hong Kong, Bangkok, Manila, Bali", 12500], ["Oceania and the Middle East", "Sydney, Queenstown, Dubai", 25000], ["Europe and Africa", "London, Paris, Lisbon, Reykjavík, Cape Town", 40000], ["The Americas", "New York", 50000]];
  function kmBetween(a, b) {
    var r = Math.PI / 180, d = Math.sin((b.lat - a.lat) * r / 2), e = Math.sin((b.lon - a.lon) * r / 2);
    return 2 * 6371 * Math.asin(Math.sqrt(d * d + Math.cos(a.lat * r) * Math.cos(b.lat * r) * e * e));
  }
  function milesFor(to, cabin, fareIdx, tierBonus) {
    var base = kmBetween(A("SIN"), A(to)) * 0.62 * CABIN_EARN[cabin] * (parseInt(D.fares[fareIdx].miles, 10) / 100);
    return Math.round(base * (1 + tierBonus / 100) / 10) * 10;
  }
  function miles() {
    var user = store.get("aurora.user", true), calc = { to: "HND", cabin: "economy", fare: 1, tier: 0 };
    function yes(v) { return v === true ? '<span class="mi-yes">' + icon("check") + '<span class="sr">Included</span></span>' : v === false ? '<span class="mi-no">' + icon("minus") + '<span class="sr">Not included</span></span>' : esc(v); }
    main.innerHTML = '<div class="page-head ph-photo ph-miles"><div class="wrap"><h1>Every night in the air, counted</h1><p>Earn on every flight, rise through three tiers, and spend miles on flights, upgrades, seats and bags.</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px"><a class="btn btn-primary" href="#/account">' + (user ? "See my miles" : "Join for free") + '</a><a class="btn btn-secondary" href="#mi-calc">Work out what you earn</a></div></div></div>' +
      '<div class="task"><div class="wrap">' +
      (user ? memberPanel() : '<section class="panel mi-join" aria-label="Why join"><div class="mi-join-grid">' + [["gift", "Free to join", "Sign up in a minute and earn from your next flight."], ["clock-counter-clockwise", "36 months", "Miles last three years, and any activity resets the clock."], ["airplane-takeoff", "From 12,500 miles", "Enough for a one-way flight anywhere in Asia."]].map(function (x) { return '<div><span class="dx-ic">' + icon(x[0]) + "</span><b>" + x[1] + "</b><p>" + x[2] + "</p></div>"; }).join("") + '</div><a class="btn btn-primary" href="#/account">Join for free</a></section>') +
      '<section class="mi-sec" aria-labelledby="mi-tiers-h"><div class="sec-head"><h2 id="mi-tiers-h">Three tiers, one sky</h2><p>Tier miles come from the flights you take. Reach a tier in a membership year and keep it for the next.</p></div><div class="mi-tiers">' +
      TIERS.map(function (t) { return '<article class="mi-tier mi-' + t.id + '"><div class="mi-card" aria-hidden="true"><span class="brand-word">Aurora</span><span class="mi-card-tier">' + t.name + '</span><span class="mi-card-no mono">AU ' + { blue: "1048 2213", silver: "2210 7731", aurora: "3307 1955" }[t.id] + "</span></div><h3>" + t.name + "</h3><p class=\"mi-need\">" + t.need + '</p><ul class="mi-perks">' + t.perks.map(function (p) { return "<li>" + icon("check") + "<span>" + p + "</span></li>"; }).join("") + "</ul></article>"; }).join("") +
      '</div><div class="mi-cmp-wrap"><table class="mi-cmp"><caption class="sr">Benefits by tier</caption><thead><tr><th scope="col">Benefit</th>' + TIERS.map(function (t) { return '<th scope="col">' + t.name + "</th>"; }).join("") + "</tr></thead><tbody>" +
      MILES_CMP.map(function (r) { return '<tr><th scope="row">' + r[0] + "</th>" + TIERS.map(function (t, i) { return '<td data-tier="' + t.name + '">' + yes(r[i + 1]) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div></section>" +
      '<section class="mi-sec" id="mi-calc" aria-labelledby="mi-calc-h"><div class="sec-head"><h2 id="mi-calc-h">What a flight earns</h2><p>Miles follow the distance flown, your cabin and your fare. Tier bonuses come on top.</p></div>' +
      '<div class="mi-calc panel"><div class="form-grid" style="margin-top:0"><div class="fg s3"><label for="mc-to">Singapore to</label><select class="select" id="mc-to">' + D.airports.filter(function (a) { return a.code !== "SIN"; }).map(function (a) { return '<option value="' + a.code + '"' + (a.code === calc.to ? " selected" : "") + ">" + esc(a.city) + "</option>"; }).join("") + "</select></div>" +
      '<div class="fg s3"><label for="mc-cabin">Cabin</label><select class="select" id="mc-cabin">' + D.cabins.map(function (c) { return '<option value="' + c.id + '">' + c.name + "</option>"; }).join("") + "</select></div>" +
      '<div class="fg s3"><label for="mc-fare">Fare</label><select class="select" id="mc-fare">' + D.fares.map(function (f, i) { return '<option value="' + i + '"' + (i === 1 ? " selected" : "") + ">" + f.name + " (" + f.miles + ")</option>"; }).join("") + "</select></div>" +
      '<div class="fg s3"><label for="mc-tier">Your tier</label><select class="select" id="mc-tier">' + TIERS.map(function (t) { return '<option value="' + t.bonus + '">' + t.name + (t.bonus ? " (+" + t.bonus + "%)" : "") + "</option>"; }).join("") + "</select></div></div>" +
      '<div class="mi-out" aria-live="polite" id="mc-out"></div></div></section>' +
      '<section class="mi-sec" aria-labelledby="mi-spend-h"><div class="sec-head"><h2 id="mi-spend-h">Spend them on the next trip</h2><p>One-way award flights from Singapore, before taxes. Premium Economy costs 1.6 times the Economy price, Business 2.5 times.</p></div>' +
      '<div class="mi-spend"><div class="panel"><table class="mi-zones"><thead><tr><th scope="col">Zone</th><th scope="col">Economy</th><th scope="col">Business</th></tr></thead><tbody>' +
      AWARD_ZONES.map(function (z) { return '<tr><th scope="row"><b>' + z[0] + "</b><span>" + z[1] + '</span></th><td>' + z[2].toLocaleString("en-SG") + '</td><td>' + Math.round(z[2] * 2.5).toLocaleString("en-SG") + "</td></tr>"; }).join("") + "</tbody></table></div>" +
      '<div class="mi-ways">' + [["arrow-fat-lines-up", "Upgrades", "From 15,000 miles to move up a cabin on any Aurora flight."], ["armchair", "Seats and bags", "Extra legroom from 4,000 miles; an extra checked bag from 6,000."], ["users-three", "Family pooling", "Combine miles with up to six people in one household."]].map(function (w) { return '<div class="panel mi-way"><span class="dx-ic">' + icon(w[0]) + "</span><h3>" + w[1] + "</h3><p>" + w[2] + "</p></div>"; }).join("") + "</div></div></section>" +
      '<section class="mi-sec" aria-labelledby="mi-faq-h"><div class="sec-head"><h2 id="mi-faq-h">Good to know</h2></div><div class="mi-faq">' +
      [["Do my miles expire?", "Miles last 36 months. Earning or spending any miles resets the clock for your whole balance."], ["How do I claim missing miles?", "Add your membership number to any booking in Manage booking, or claim up to six months after you fly."], ["When does my tier change?", "Tiers are reviewed at the end of each membership year. If you qualify early, you move up straight away."], ["Can I earn on partner airlines?", "Yes, on flights booked with an Aurora flight number. Miles arrive within seven days of flying."]].map(function (f) { return '<details class="mi-q"><summary>' + f[0] + icon("caret-down") + "</summary><p>" + f[1] + "</p></details>"; }).join("") +
      '</div><p class="hint" style="margin-top:18px">Aurora Miles is part of a design prototype. Tiers, earning rates and award prices are illustrative.</p></section></div></div>';
    function upd() {
      var to = $("#mc-to").value, cab = $("#mc-cabin").value, fi = +$("#mc-fare").value, tb = +$("#mc-tier").value;
      var one = milesFor(to, cab, fi, tb), rt = one * 2, km = Math.round(kmBetween(A("SIN"), A(to)));
      var next = AWARD_ZONES.slice().reverse().filter(function (z) { return rt >= z[2]; })[0];
      $("#mc-out").innerHTML = '<div class="mi-big"><span>Return trip earns</span><b>' + rt.toLocaleString("en-SG") + '</b><small>miles, ' + one.toLocaleString("en-SG") + " each way over " + km.toLocaleString("en-SG") + " km</small></div>" +
        '<p class="mi-then">' + icon(next ? "gift" : "trend-up") + (next ? "Enough for a one-way Economy award to " + next[0].replace("The ", "the ") + "." : "Halfway to an award: " + AWARD_ZONES[0][2].toLocaleString("en-SG") + " miles flies you anywhere in Asia.") + "</p>";
    }
    ["#mc-to", "#mc-cabin", "#mc-fare", "#mc-tier"].forEach(function (id) { $(id).addEventListener("change", upd); });
    upd();
  }
  function memberPanel() {
    var bal = 48210, tierMiles = 31840, cur = TIERS[1], nxt = TIERS[2], pct = Math.round(tierMiles / nxt.qual * 100);
    return '<section class="panel mi-me" aria-label="Your membership"><div><span class="hint">Your membership</span><h2>' + cur.name + ' member</h2><p>Balance <b>' + bal.toLocaleString("en-SG") + "</b> miles</p></div>" +
      '<div class="mi-prog"><div class="mi-prog-row"><span>' + tierMiles.toLocaleString("en-SG") + " tier miles</span><span>" + nxt.name + " at " + nxt.qual.toLocaleString("en-SG") + '</span></div><div class="mi-bar" role="progressbar" aria-label="Progress to ' + nxt.name + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><span style="width:' + pct + '%"></span></div><p class="hint">' + (nxt.qual - tierMiles).toLocaleString("en-SG") + " tier miles to " + nxt.name + ". A return trip to London in Business Flex would get you there.</p></div></section>";
  }

  /* ---------- About Aurora ---------- */
  function about() {
    main.innerHTML =
      '<section class="ab-hero" aria-labelledby="ab-h"><div class="ab-media" aria-hidden="true"></div><div class="wrap ab-in"><div class="ab-copy">' +
      '<h1 id="ab-h">Built around the night</h1><p>Most long-haul flights cross the night. So we built a whole airline around it, from the schedule to the light.</p></div>' +
      '<dl class="ab-stats">' + [["16", "airports"], ["5", "continents"], ["1", "hub, Singapore"], ["9V-AUR", "our first A350"]].map(function (x) { return '<div><dt>' + x[0] + "</dt><dd>" + x[1] + "</dd></div>"; }).join("") + "</dl></div></section>" +
      '<section class="band ab-band" aria-labelledby="ab-m-h"><div class="wrap"><h2 class="ab-quote" id="ab-m-h">“Rest is the product. Everything else is how we deliver it.”</h2><div class="ab-beliefs">' +
      [["01", "Calm over clutter", "One decision at a time, from the search box to the boarding gate. If a screen or a service doesn’t help you travel, it goes."], ["02", "Honest by default", "Bags, seats, changes and refunds are on every fare before you choose it. The total you see is the total you pay."], ["03", "Light that follows you", "Cabin lighting tracks your body clock, not the clock on the ground, so you land rested instead of reset."]].map(function (b) { return '<div class="ab-belief"><h3>' + b[1] + "</h3><p>" + b[2] + "</p></div>"; }).join("") + "</div></div></section>" +
      '<section class="band ab-band" aria-labelledby="ab-t-h"><div class="wrap"><div class="sec-head"><h2 id="ab-t-h">How we got here</h2><p>A young airline with a simple idea.</p></div><ol class="ab-time">' +
      [["2021", "An idea over Iceland", "A night flight, a window seat, and the northern lights outside. The name came first."], ["2023", "A home in Singapore", "Changi becomes our hub: a day’s flying from five continents."], ["2024", "9V-AUR arrives", "Our first Airbus A350-1000, with Business suites in a 1-2-1 layout."], ["2025", "Flights to the lights", "Reykjavík joins the network: the route our name was waiting for."], ["2026", "Sixteen airports", "Long-haul across Asia, Oceania, Europe, Africa and the Americas."]].map(function (t, i) { return '<li><span class="ab-year">' + t[0] + '</span><span class="ab-dot" aria-hidden="true"></span><h3>' + t[1] + "</h3><p>" + t[2] + "</p></li>"; }).join("") + "</ol></div></section>" +
      '<section class="band ab-band" aria-labelledby="ab-f-h"><div class="wrap"><div class="sec-head"><h2 id="ab-f-h">Two aircraft, nothing older than five years</h2><p>A young, quiet fleet that burns less fuel on every seat.</p></div><div class="ab-fleet">' +
      [["media/aircraft-side.webp?v=2", "Airbus A350-1000", "Long-haul flagship", [["Seats", "327"], ["Range", "16,100 km"], ["Cabins", "Business, Premium, Economy"]]], ["media/aircraft-tail.webp?v=2", "Boeing 787-9", "Regional widebody", [["Seats", "283"], ["Range", "14,000 km"], ["Cabins", "Business, Premium, Economy"]]]].map(function (f) { return '<article class="ab-plane"><div class="ab-plane-img"><img src="' + f[0] + '" alt="" loading="lazy" decoding="async"></div><div class="ab-plane-body"><span class="hint">' + f[2] + "</span><h3>" + f[1] + '</h3><dl>' + f[3].map(function (s) { return "<div><dt>" + s[0] + "</dt><dd>" + s[1] + "</dd></div>"; }).join("") + "</dl></div></article>"; }).join("") + "</div></div></section>" +
      '<section class="band ab-band" aria-labelledby="ab-s-h"><div class="wrap"><div class="ab-green"><div class="sec-head"><h2 id="ab-s-h">Lighter on the sky</h2><p>Where we are today, and where we have promised to be.</p></div><div class="ab-meters">' +
      [["Less fuel per seat than the aircraft we replaced", 25, "25%", ""], ["Sustainable aviation fuel in flights from Singapore", 5, "5%", "10% by 2030"], ["Single-use plastic removed from the cabin", 80, "80%", "All of it by 2027"], ["Bookings that add verified carbon removal", 18, "18%", "Offered on every fare"]].map(function (m) { return '<div class="ab-meter"><div class="ab-meter-top"><b>' + m[2] + "</b><span>" + m[3] + '</span></div><div class="ab-bar" role="img" aria-label="' + m[2] + '"><span style="--w:' + m[1] + '%"></span></div><p>' + m[0] + "</p></div>"; }).join("") +
      '</div><p class="hint" style="margin-top:18px">Figures are illustrative for this prototype.</p></div></div></section>' +
      '<section class="band ab-band" aria-labelledby="ab-n-h"><div class="wrap ab-cta"><div><h2 id="ab-n-h">Where the night takes you</h2><p>Sixteen airports, one hub, and a globe of routes to explore.</p><div class="ab-flags" aria-hidden="true">' + ["sg", "jp", "au", "nz", "is", "pt", "za", "us"].map(function (c) { return '<img src="vendor/flags/' + c + '.svg" alt="" width="28" height="28">'; }).join("") + '</div></div><a class="btn btn-primary" href="#/destinations">Explore destinations</a></div>' +
      '<p class="wrap hint" style="margin-top:24px">Aurora Airlines is a design prototype by Robert Azucena. The story, fleet and figures on this page are illustrative.</p></section>';
    watchReveals();
  }

  /* ---------- Accessibility: live display preferences, help at every step, and an assistance request ---------- */
  var A11Y = [["text", "Larger text", "Everything on the site a size up.", "text-aa"], ["contrast", "Higher contrast", "Stronger text and outlines.", "circle-half"], ["motion", "Reduce motion", "Stop animation and moving backgrounds.", "pause-circle"], ["links", "Underline links", "Make every link easy to spot.", "link-simple"]];
  function a11yPrefs() { return store.get("aurora.a11y") || {}; }
  function applyA11y() { var p = a11yPrefs(), r = document.documentElement; A11Y.forEach(function (o) { if (p[o[0]]) r.setAttribute("data-a11y-" + o[0], ""); else r.removeAttribute("data-a11y-" + o[0]); }); RM = RM0 || !!p.motion; }
  function accessibility() {
    var p = a11yPrefs();
    main.innerHTML =
      '<div class="page-head ph-photo ph-access"><div class="wrap"><h1>Travel, your way</h1><p>A site that works for everyone, and help at every step. Tell us once and we carry it to arrival.</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px"><a class="btn btn-primary" href="#a11y-req">Request assistance</a><a class="btn btn-secondary" href="#a11y-prefs">Adjust this site</a></div></div></div>' +
      '<div class="task"><div class="wrap">' +
      '<section class="panel a11y-prefs" id="a11y-prefs" aria-labelledby="ap-h"><div class="row"><div><h2 id="ap-h">Make this site work for you</h2><p>Changes apply straight away, on every page, and stay in this browser.</p></div><button type="button" class="link" data-reset>Reset all</button></div><div class="ap-grid">' +
      A11Y.map(function (o) { return '<button type="button" class="ap-opt" role="switch" aria-checked="' + !!p[o[0]] + '" data-pref="' + o[0] + '"><span class="dx-ic">' + icon(o[3]) + '</span><span class="ap-txt"><b>' + o[1] + "</b><small>" + o[2] + '</small></span><span class="ap-sw" aria-hidden="true"></span></button>'; }).join("") + "</div></section>" +
      '<section class="mi-sec" aria-labelledby="aj-h"><div class="sec-head"><h2 id="aj-h">Help at every step</h2><p>Ask once, at least 48 hours before you fly. Every team along the way will know.</p></div><ol class="aj">' +
      [["laptop", "Booking", "Add your needs to any booking, online or in Manage booking. No forms to repeat."], ["buildings", "At the airport", "Assistance points at check-in, with seating and a fast lane through bag drop."], ["shield-check", "Security", "A guided route through screening, with your mobility aids and medicines."], ["door-open", "Boarding", "You board first, with time to settle. An aisle wheelchair waits at the door."], ["airplane-in-flight", "On board", "Crew briefed before take-off. Accessible washrooms on every widebody."], ["map-pin", "Arrival", "Met at the door and taken through arrivals, or to your connection."]].map(function (s, i) { return '<li><span class="aj-ic">' + icon(s[0]) + '</span><span class="aj-n">' + pad(i + 1) + "</span><h3>" + s[1] + "</h3><p>" + s[2] + "</p></li>"; }).join("") + "</ol></section>" +
      '<section class="mi-sec a11y-split" aria-labelledby="ar-h"><form class="panel" id="a11y-req" novalidate aria-labelledby="ar-h"><h2 id="ar-h">Request assistance</h2><p>Try a demonstration booking: <button type="button" class="link" data-demo="AUC4NX|Lim">AUC4NX with Lim</button>.</p>' +
      '<div class="form-grid"><div class="fg s6"><label for="ar-ref">Booking reference</label><input class="input mono" id="ar-ref" maxlength="6" autocomplete="off" autocapitalize="characters"></div><div class="fg s6"><label for="ar-last">Last name</label><input class="input" id="ar-last" autocomplete="family-name"></div></div>' +
      '<fieldset class="ar-needs"><legend>What would help?</legend>' + [["wchr", "Wheelchair to the gate", "I can walk short distances and climb steps"], ["wchc", "Wheelchair to my seat", "I need help all the way to my seat"], ["vis", "Sight", "Guidance through the airport and a cabin briefing"], ["hear", "Hearing", "Written updates and a visual call at boarding"], ["dog", "Assistance dog", "Travels with me in the cabin, free of charge"], ["calm", "Extra time and a quieter route", "For autism, dementia and other hidden disabilities"]].map(function (n) { return '<label class="ar-need"><input type="checkbox" value="' + n[0] + '"><span><b>' + n[1] + "</b><small>" + n[2] + "</small></span></label>"; }).join("") + "</fieldset>" +
      '<div class="fg s12" style="margin-top:16px"><label for="ar-note">Anything else? <span class="opt">Optional</span></label><textarea class="input" id="ar-note" rows="3" style="height:auto;padding:12px 14px"></textarea></div>' +
      '<div id="ar-res" role="status" aria-live="polite"></div><div class="actions"><span class="hint">Demonstration only. Nothing is sent.</span><button class="btn btn-primary" type="submit">Send request</button></div></form>' +
      '<aside class="a11y-side"><div class="panel"><h2>Built in, not bolted on</h2><p>We design this site to meet <abbr title="Web Content Accessibility Guidelines">WCAG</abbr> 2.2 at level AA.</p><ul class="ck-list">' +
      [["keyboard", "Keyboard first", "Every task works without a mouse, with a clear focus ring."], ["speaker-high", "Screen readers", "Labelled controls, headings, and announced updates."], ["circle-half", "Contrast", "Text and controls meet AA in day and night themes."], ["arrows-out", "Reflow and zoom", "Works on small screens and at 200% text size."]].map(function (c) { return "<li>" + icon(c[0]) + "<span><b>" + c[1] + "</b>" + c[2] + "</span></li>"; }).join("") +
      '</ul></div><div class="panel"><h2>Tell us what we got wrong</h2><p>If something here is hard to use, say which page and what happened. We read every message.</p><a class="link" style="display:inline-block;margin-top:10px" href="#/help/contact">Send feedback</a></div></aside></section></div></div>';
    $$("[data-pref]", main).forEach(function (b) {
      b.addEventListener("click", function () { var p = a11yPrefs(), k = b.dataset.pref; p[k] = !p[k]; store.set("aurora.a11y", p); applyA11y(); b.setAttribute("aria-checked", String(!!p[k])); toast(b.querySelector("b").textContent + (p[k] ? " on" : " off")); });
    });
    $("[data-reset]", main).addEventListener("click", function () { store.set("aurora.a11y", {}); applyA11y(); $$("[data-pref]", main).forEach(function (b) { b.setAttribute("aria-checked", "false"); }); toast("Display settings reset"); });
    $("[data-demo]", main).addEventListener("click", function () { $("#ar-ref").value = "AUC4NX"; $("#ar-last").value = "Lim"; });
    $("#a11y-req").addEventListener("submit", function (e) {
      e.preventDefault(); var r = $("#ar-ref").value.trim().toUpperCase(), l = $("#ar-last").value.trim(), needs = $$(".ar-need input:checked", main), out = $("#ar-res");
      function err(m, f) { out.innerHTML = '<div class="alert alert-err" style="margin-top:16px">' + icon("warning-circle") + "<span>" + m + "</span></div>"; if (f) f.focus(); }
      if (!/^[A-Z0-9]{6}$/.test(r)) return err("Enter the six-character booking reference.", $("#ar-ref"));
      if (!l) return err("Enter the lead traveller’s last name.", $("#ar-last"));
      var b = findBooking(r, l); if (!b) return err("We couldn’t find booking " + esc(r) + " with that last name.", $("#ar-ref"));
      if (!needs.length) return err("Choose at least one kind of help.", needs[0] || $(".ar-need input", main));
      out.innerHTML = '<div class="alert alert-ok" style="margin-top:16px">' + icon("check-circle") + "<span>Request received for booking <b class=\"mono\">" + esc(b.ref) + "</b>: " + needs.map(function (n) { return n.parentNode.querySelector("b").textContent.toLowerCase(); }).join(", ") + ". Every team on your trip will see it. This is a demonstration, so nothing was sent.</span></div>";
    });
    watchReveals();
  }

  /* ---------- Help: Baggage, Fare conditions and Contact ---------- */
  function helpHero(cls, kickerIcon, kicker, title, text, ctas) {
    return '<div class="page-head ph-photo ' + cls + '"><div class="wrap"><h1>' + title + "</h1><p>" + text + "</p>" +
      (ctas ? '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px">' + ctas + "</div>" : "") + "</div></div>";
  }
  /* a suitcase drawn to scale (1 cm = k px) with its dimensions labelled */
  function bagSvg(w, h, d, label, k, accent) {
    var W = w * k, H = h * k, D = d * k * 0.45, CW = 55 * k + 30 * k * 0.45 + 70, CH = 78 * k + 30 * k * 0.45 + 70, x = (CW - W - D) / 2, y = CH - H - 44;
    return '<svg class="bg-svg" viewBox="0 0 ' + CW + " " + CH + '" role="img" aria-label="' + label + ", " + h + " by " + w + " by " + d + ' centimetres">' +
      '<path class="bg-side" d="M' + (x + W) + " " + y + " l" + D + " " + -D + " v" + H + " l" + -D + " " + D + 'z"/>' +
      '<path class="bg-top" d="M' + x + " " + y + " l" + D + " " + -D + " h" + W + " l" + -D + " " + D + 'z"/>' +
      '<rect class="bg-front' + (accent ? " acc" : "") + '" x="' + x + '" y="' + y + '" width="' + W + '" height="' + H + '" rx="8"/>' +
      '<rect class="bg-handle" x="' + (x + W / 2 - 12) + '" y="' + (y - 12) + '" width="24" height="10" rx="4"/>' +
      [0.33, 0.66].map(function (f) { return '<line class="bg-rib" x1="' + (x + W * f) + '" y1="' + (y + 10) + '" x2="' + (x + W * f) + '" y2="' + (y + H - 10) + '"/>'; }).join("") +
      '<text class="bg-dim" x="' + (x + W / 2) + '" y="' + (y + H + 26) + '" text-anchor="middle">' + w + " cm</text>" +
      '<text class="bg-dim" x="' + (x - 10) + '" y="' + (y + H / 2) + '" text-anchor="end" dominant-baseline="middle">' + h + "</text>" +
      '<text class="bg-dim" x="' + (x + W + D / 2 + 8) + '" y="' + (y - D / 2 - 6) + '">' + d + "</text></svg>";
  }
  function baggage() {
    var st = { cabin: "economy", fare: 1, tier: 0 };
    main.innerHTML = helpHero("ph-baggage", "suitcase-rolling", "Baggage", "Pack light, or pack it all", "What you can bring on every fare, the sizes that fit, and what stays home. Extra bags cost less online.", '<a class="btn btn-primary" href="#bag-find">Check my allowance</a><a class="btn btn-secondary" href="#bag-rules">What I can’t pack</a>') +
      '<div class="task"><div class="wrap">' +
      '<section class="panel bag-find" id="bag-find" aria-labelledby="bf-h"><div class="row"><div><h2 id="bf-h">Your allowance</h2><p>Choose your cabin and fare. Allowances are per traveller.</p></div></div>' +
      '<div class="bag-ctl"><div class="seg" role="group" aria-label="Cabin">' + D.cabins.map(function (c) { return '<button type="button" data-bc="' + c.id + '" aria-pressed="' + (c.id === st.cabin) + '">' + c.name + "</button>"; }).join("") + "</div>" +
      '<div class="seg" role="group" aria-label="Fare">' + D.fares.map(function (f, i) { return '<button type="button" data-bf="' + i + '" aria-pressed="' + (i === st.fare) + '">' + f.name + "</button>"; }).join("") + "</div>" +
      '<label class="check bag-tier"><input type="checkbox" id="bag-tier"><span>I’m a Silver or Aurora member</span></label></div><div class="bag-out" id="bag-out" aria-live="polite"></div></section>' +
      '<section class="mi-sec" aria-labelledby="bs-h"><div class="sec-head"><h2 id="bs-h">Will it fit?</h2><p>Drawn to scale. Wheels and handles count towards the size.</p></div><div class="bag-sizes">' +
      [[40, 30, 15, "Personal item", "Under the seat in front", "Up to 4 kg", false], [36, 56, 23, "Cabin bag", "In the overhead bin", "Up to 7 kg", true], [55, 78, 30, "Checked bag", "Up to 158 cm, length plus width plus height", "23, 30 or 32 kg by fare", false]].map(function (b) { return '<figure class="bag-size panel">' + bagSvg(b[0], b[1], b[2], b[3], 2.4, b[6]) + "<figcaption><b>" + b[3] + "</b><span>" + b[4] + '</span><span class="bag-kg">' + b[5] + "</span></figcaption></figure>"; }).join("") + "</div></section>" +
      '<section class="mi-sec" aria-labelledby="bx-h"><div class="sec-head"><h2 id="bx-h">Need more room?</h2><p>Add bags in Manage booking up to 4 hours before departure.</p></div><div class="bag-extra">' +
      [["Extra 23 kg bag", 75, 120], ["Extra 32 kg bag", 110, 170], ["Overweight, 23 to 32 kg", 60, 90]].map(function (x) { return '<div class="panel"><h3>' + x[0] + '</h3><div class="bag-px"><div><span>Online</span><b>' + money(x[1]) + '</b></div><div><span>At the airport</span><b>' + money(x[2]) + '</b></div></div><p class="bag-save">' + icon("piggy-bank") + "Save " + money(x[2] - x[1]) + " by adding it early</p></div>"; }).join("") + "</div></section>" +
      '<section class="mi-sec" aria-labelledby="bsp-h"><div class="sec-head"><h2 id="bsp-h">Special items</h2></div><div class="bag-special">' +
      [["wheelchair", "Mobility aids", "Wheelchairs, walkers and scooters travel free, on top of your allowance."], ["baby-carriage", "Travelling with a baby", "A pram and a car seat travel free for every infant."], ["bicycle", "Sports equipment", "Bikes, golf clubs and skis count as one checked bag if they fit the weight."], ["guitar", "Musical instruments", "Small instruments fly in the cabin. Larger ones can have their own seat."]].map(function (x) { return '<div class="panel mi-way"><span class="dx-ic">' + icon(x[0]) + "</span><h3>" + x[1] + "</h3><p>" + x[2] + "</p></div>"; }).join("") + "</div></section>" +
      '<section class="mi-sec" id="bag-rules" aria-labelledby="br-h"><div class="sec-head"><h2 id="br-h">Cabin, hold, or home?</h2><p>Some things can fly only in the cabin, some only in the hold, and some not at all.</p></div><div class="bag-rules">' +
      [["Cabin only", "airplane-in-flight", "ok", ["Power banks and spare lithium batteries", "E-cigarettes and vapes", "Medicines you need on the flight"]], ["Hold only", "suitcase", "info", ["Liquids over 100 ml each", "Knives, scissors over 6 cm and tools", "Sports bats, clubs and poles"]], ["Leave at home", "prohibit", "err", ["Fireworks, flares and gas canisters", "Flammable liquids and paint", "Self-balancing boards and hoverboards"]]].map(function (r) { return '<div class="panel bag-rule t-' + r[2] + '"><h3>' + icon(r[1]) + r[0] + "</h3><ul>" + r[3].map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul></div>"; }).join("") + "</div></section>" +
      '<section class="mi-sec panel bag-lost" aria-labelledby="bl-h"><div><h2 id="bl-h">Bag delayed or damaged?</h2><p>Report it before you leave the arrivals hall, at the baggage service desk. Keep your bag tag: it is how we find it.</p></div><ol class="bag-steps">' + ["Report it at the desk in arrivals", "Get a reference to track it online", "We deliver it to you, free of charge"].map(function (x, i) { return '<li><span class="mono">' + (i + 1) + "</span>" + x + "</li>"; }).join("") + '</ol><a class="link" href="#/help/contact">Contact us about a bag</a></section>' +
      '<p class="hint" style="margin-top:24px">Allowances and prices are illustrative for this prototype.</p></div></div>';
    function upd() {
      var f = D.fares[st.fare], extraCabin = st.cabin === "economy" ? 0 : 1, checkedN = f.bags.checked === "None" ? 0 : parseInt(f.bags.checked, 10), kg = f.bags.checked === "None" ? "" : f.bags.checked.split("×")[1].trim();
      var total = checkedN + extraCabin + st.tier, cabinN = parseInt(f.bags.cabin, 10) + (st.cabin === "business" || st.cabin === "first" ? 1 : 0);
      if (st.cabin !== "economy" && !kg) kg = "30 kg"; if (st.cabin === "business" || st.cabin === "first") kg = "32 kg"; if (!kg) kg = "23 kg";
      function bags(n, cls, lab) { var o = ""; for (var i = 0; i < n; i++) o += '<span class="bag-ic ' + cls + '">' + icon(cls === "cab" ? "suitcase-rolling" : "suitcase") + "</span>"; return o || '<span class="bag-none">' + lab + "</span>"; }
      $("#bag-out").innerHTML = '<div class="bag-col"><span class="hint">In the cabin</span><div class="bag-row">' + bags(cabinN, "cab") + '<span class="bag-ic per">' + icon("backpack") + '</span></div><p><b class="mono">' + cabinN + " × 7 kg</b> plus a personal item</p></div>" +
        '<div class="bag-col"><span class="hint">In the hold</span><div class="bag-row">' + bags(total, "hold", "No checked bags") + "</div><p>" + (total ? '<b class="mono">' + total + " × " + kg + "</b>" + (st.tier ? ", including your member bag" : "") + (extraCabin && checkedN === 0 ? ", included with " + cabinName(st.cabin) : "") : "Add one online from " + money(75)) + "</p></div>";
    }
    $$("[data-bc]", main).forEach(function (b) { b.addEventListener("click", function () { st.cabin = b.dataset.bc; $$("[data-bc]", main).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); upd(); }); });
    $$("[data-bf]", main).forEach(function (b) { b.addEventListener("click", function () { st.fare = +b.dataset.bf; $$("[data-bf]", main).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); upd(); }); });
    $("#bag-tier").addEventListener("change", function (e) { st.tier = e.target.checked ? 1 : 0; upd(); });
    upd();
  }

  /* fare rules as data, so the comparison and the "what if" tool agree */
  var FARE_RULES = [
    { change: null, refund: null, noshow: "Fare lost; taxes refunded", cancel24: true },
    { change: 150, refund: 250, noshow: 300, cancel24: true },
    { change: 0, refund: 0, noshow: 100, cancel24: true }
  ];
  function fares() {
    var st = { fare: 1, act: "change", days: 10 };
    var rows = [["Cabin bag", function (f) { return f.bags.cabin; }], ["Checked bags", function (f) { return f.bags.checked; }], ["Seat selection", function (f) { return f.seat; }], ["Changes", function (f) { return f.changes; }], ["Refunds", function (f) { return f.refund; }], ["Aurora Miles", function (f) { return f.miles + " of base miles"; }]];
    main.innerHTML = helpHero("ph-fares", "ticket", "Fare conditions", "Know the rules before you choose", "Every fare shows its bags, seats, changes and refunds up front. Check what a change would cost.", '<a class="btn btn-primary" href="#fr-what">What if my plans change?</a><a class="btn btn-secondary" href="#/book">Search flights</a>') +
      '<div class="task"><div class="wrap"><section aria-labelledby="fc-h"><h2 class="sr" id="fc-h">Compare fares</h2><div class="fr-cards">' +
      D.fares.map(function (f, i) { return '<article class="fr-card' + (i === 1 ? " pick" : "") + '">' + (i === 1 ? '<span class="fr-flag">Most chosen</span>' : "") + "<h3>" + f.name + '</h3><p class="fr-for">' + ["Light travellers with fixed plans", "The balance most people want", "Plans that might move"][i] + '</p><dl class="fr-list">' + rows.map(function (r) { var v = r[1](f), no = /None|Not |Fee applies/.test(v); return '<div class="' + (no ? "no" : "") + '"><dt>' + r[0] + "</dt><dd>" + icon(no ? "minus-circle" : "check-circle") + "<span>" + v + "</span></dd></div>"; }).join("") + "</dl></article>"; }).join("") + "</div></section>" +
      '<section class="mi-sec" id="fr-what" aria-labelledby="fw-h"><div class="sec-head"><h2 id="fw-h">What if my plans change?</h2><p>Pick a fare and a situation. We show what happens, before you book.</p></div><div class="panel fr-what">' +
      '<div class="fr-ctl"><div class="fg"><span class="lbl">Fare</span><div class="seg" role="group" aria-label="Fare">' + D.fares.map(function (f, i) { return '<button type="button" data-ff="' + i + '" aria-pressed="' + (i === st.fare) + '">' + f.name + "</button>"; }).join("") + '</div></div>' +
      '<div class="fg"><span class="lbl">I want to</span><div class="seg" role="group" aria-label="Situation">' + [["change", "Change dates"], ["refund", "Cancel"], ["noshow", "Miss the flight"]].map(function (a) { return '<button type="button" data-fa="' + a[0] + '" aria-pressed="' + (a[0] === st.act) + '">' + a[1] + "</button>"; }).join("") + '</div></div>' +
      '<div class="fg fr-days"><label for="fr-days">Days before departure: <b id="fr-dv" class="mono">10</b></label><input type="range" id="fr-days" min="0" max="60" value="10"></div></div><div class="fr-out" id="fr-out" aria-live="polite"></div></div></section>' +
      '<section class="mi-sec" aria-labelledby="fg-h"><div class="sec-head"><h2 id="fg-h">Words worth knowing</h2></div><div class="mi-faq">' +
      [["Fare difference", "If your new flight costs more than the one you booked, you pay the difference on top of any change fee. If it costs less, the difference is not refunded."], ["Free 24-hour cancellation", "Every fare can be cancelled free within 24 hours of booking, as long as the flight is at least 7 days away."], ["No-show", "Missing a flight without telling us. The rest of the trip is cancelled unless you contact us before departure."], ["Taxes and fees", "Airport and government taxes are refunded if you don’t fly, even on fares that aren’t refundable."]].map(function (f) { return '<details class="mi-q"><summary>' + f[0] + icon("caret-down") + "</summary><p>" + f[1] + "</p></details>"; }).join("") +
      '</div><p class="hint" style="margin-top:18px">Fare rules are illustrative for this prototype. Changes close 24 hours before departure.</p></section></div></div>';
    function upd() {
      var f = D.fares[st.fare], r = FARE_RULES[st.fare], d = st.days, out, tone = "ok";
      $("#fr-dv").textContent = d === 0 ? "today" : d;
      if (st.act === "noshow") { out = typeof r.noshow === "number" ? ["You pay " + money(r.noshow) + " and keep the rest of the trip.", "Call us before departure and the fee is waived."] : [r.noshow + ".", "Tell us before departure so the return flight stays booked."]; tone = typeof r.noshow === "number" && r.noshow <= 100 ? "ok" : "warn"; }
      else if (d < 1) { out = ["Changes and cancellations close 24 hours before departure.", "You can still call us, or the no-show rules apply."]; tone = "err"; }
      else if (st.act === "change") { out = r.change === null ? ["Essential fares can’t be changed.", "Cancel within 24 hours of booking to get everything back, if the flight is 7 or more days away."] : [r.change ? "Change for " + money(r.change) + ", plus any fare difference." : "Change for free. You only pay any fare difference.", "Make it in Manage booking, up to 24 hours before departure."]; tone = r.change === null ? "err" : r.change ? "warn" : "ok"; }
      else { out = r.refund === null ? ["Essential fares aren’t refundable.", "Taxes and fees come back to you, about " + money(90) + " a ticket."] : [r.refund ? "Refund minus a " + money(r.refund) + " fee." : "Full refund to your card.", "Refunds reach you in 7 to 10 working days."]; tone = r.refund === null ? "err" : r.refund ? "warn" : "ok"; }
      $("#fr-out").innerHTML = '<div class="fr-verdict t-' + tone + '">' + icon(tone === "ok" ? "check-circle" : tone === "warn" ? "info" : "x-circle") + "<div><b>" + out[0] + "</b><p>" + out[1] + '</p></div></div><p class="fr-note">' + f.name + " fare" + (st.act !== "noshow" ? ", " + (d === 0 ? "on the day" : d + " day" + (d === 1 ? "" : "s") + " before departure") : "") + "</p>";
    }
    $$("[data-ff]", main).forEach(function (b) { b.addEventListener("click", function () { st.fare = +b.dataset.ff; $$("[data-ff]", main).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); upd(); }); });
    $$("[data-fa]", main).forEach(function (b) { b.addEventListener("click", function () { st.act = b.dataset.fa; $$("[data-fa]", main).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); $(".fr-days", main).style.visibility = st.act === "noshow" ? "hidden" : ""; upd(); }); });
    $("#fr-days").addEventListener("input", function (e) { st.days = +e.target.value; upd(); });
    upd();
  }

  /* contact: answer it here first, then the right channel */
  var HELP_QA = [
    ["How do I change my flight?", "Open Manage booking with your reference and last name, then choose a new date. The fare rules show the cost first.", "#/manage", "manage booking change date flight"],
    ["When does check-in open?", "48 hours before departure, until 60 minutes before. Seats can be chosen any time.", "#/checkin", "check in online seat boarding pass"],
    ["How much baggage can I bring?", "It depends on your fare and cabin. Our allowance tool shows it in two taps.", "#/help/baggage", "bag baggage luggage allowance weight suitcase"],
    ["Can I get a refund?", "Flex fares are fully refundable, Classic fares for a fee. Taxes always come back.", "#/help/fares", "refund cancel money back fare"],
    ["I need help at the airport", "Ask for assistance at least 48 hours before you fly and every team will know.", "#/accessibility", "wheelchair assistance disability help special"],
    ["Is my flight on time?", "Flight status shows departures, arrivals and gates for yesterday, today and tomorrow.", "#/status", "status delay late gate on time"],
    ["How do I earn miles?", "Every flight earns Aurora Miles by distance, cabin and fare. Joining is free.", "#/miles", "miles points loyalty earn member"]
  ];
  function contact() {
    main.innerHTML = helpHero("ph-contact", "chat-circle-text", "Contact", "How can we help?", "Most answers are a search away. If you still need us, pick the way that suits you.", "") +
      '<div class="task"><div class="wrap">' +
      '<section class="panel ct-search" aria-labelledby="cs-h"><h2 id="cs-h">Search help</h2><div class="ct-field">' + icon("magnifying-glass") + '<input class="input" id="ct-q" type="search" aria-labelledby="cs-h" placeholder="Try “refund”, “bags” or “check in”" autocomplete="off" aria-describedby="ct-count"></div><p class="hint" id="ct-count" aria-live="polite"></p><div class="ct-res" id="ct-res"></div></section>' +
      '<section class="mi-sec" aria-labelledby="cc-h"><div class="sec-head"><h2 id="cc-h">Talk to us</h2><p>Live help is open every day, around the clock.</p></div><div class="ct-ways">' +
      [["chats-circle", "Chat", "Usually answers in under a minute.", "Start a chat", "chat", "Online now"], ["phone", "Call", "For changes on the day you fly.", "See phone numbers", "call", "Around 4 minutes wait"], ["envelope-simple", "Message", "For anything that can wait a day.", "Write to us", "mail", "Replies within 24 hours"]].map(function (w) { return '<div class="panel ct-way"><span class="dx-ic">' + icon(w[0]) + '</span><span class="ct-live"><i></i>' + w[5] + "</span><h3>" + w[1] + "</h3><p>" + w[2] + '</p><button type="button" class="btn btn-secondary btn-sm" data-way="' + w[4] + '">' + w[3] + "</button></div>"; }).join("") + "</div></section>" +
      '<section class="mi-sec ct-split" aria-labelledby="cm-h"><form class="panel" id="ct-form" novalidate><h2 id="cm-h">Send us a message</h2><div class="form-grid">' +
      '<div class="fg s6"><label for="ct-name">Name</label><input class="input" id="ct-name" autocomplete="name"></div><div class="fg s6"><label for="ct-email">Email</label><input class="input" id="ct-email" type="email" autocomplete="email"></div>' +
      '<div class="fg s6"><label for="ct-topic">Topic</label><select class="select" id="ct-topic">' + ["A booking", "Baggage", "Refunds and changes", "Accessibility", "Aurora Miles", "Feedback on the site"].map(function (t) { return "<option>" + t + "</option>"; }).join("") + '</select></div><div class="fg s6"><label for="ct-ref">Booking reference <span class="opt">Optional</span></label><input class="input mono" id="ct-ref" maxlength="6" autocapitalize="characters"></div>' +
      '<div class="fg s12"><label for="ct-msg">Message</label><textarea class="input" id="ct-msg" rows="4" style="height:auto;padding:12px 14px"></textarea></div></div><div id="ct-err" role="alert"></div>' +
      '<div class="actions"><span class="hint">Demonstration only. Nothing is sent.</span><button class="btn btn-primary" type="submit">Send message</button></div></form>' +
      '<aside class="panel ct-designer"><span class="demo-tag">About this prototype</span><h2 style="margin-top:12px">There is no airline behind this page</h2><p>Aurora Airlines is a design prototype, so these channels are demonstrations. To talk about the design itself, contact its designer.</p><a class="btn btn-primary btn-sm" style="margin-top:16px" href="https://robertazucena.com/#contact" target="_top">Contact Robert Azucena</a></aside></section></div></div>';
    var q = $("#ct-q"), res = $("#ct-res"), cnt = $("#ct-count");
    function find() {
      var t = q.value.trim().toLowerCase(), list = HELP_QA.filter(function (x) { return !t || (x[0] + " " + x[1] + " " + x[3]).toLowerCase().indexOf(t) > -1 || t.split(/\s+/).some(function (w) { return w.length > 2 && x[3].indexOf(w) > -1; }); });
      cnt.textContent = t ? list.length + (list.length === 1 ? " answer" : " answers") : "Popular questions";
      res.innerHTML = list.length ? list.slice(0, t ? 7 : 4).map(function (x) { return '<a class="ct-ans" href="' + x[2] + '"><b>' + x[0] + "</b><span>" + x[1] + "</span>" + icon("arrow-right") + "</a>"; }).join("") : '<p class="ct-none">No answers for “' + esc(q.value) + '”. Try a shorter word, or message us below.</p>';
    }
    q.addEventListener("input", find); find();
    $$("[data-way]", main).forEach(function (b) { b.addEventListener("click", function () { if (b.dataset.way === "mail") { $("#ct-name").focus(); $("#ct-form").scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" }); } else toast("Demonstration only: in a live service this opens " + (b.dataset.way === "chat" ? "a chat with our team." : "our phone numbers by country.")); }); });
    $("#ct-form").addEventListener("submit", function (e) {
      e.preventDefault(); var err = $("#ct-err");
      function bad(m, f) { err.innerHTML = '<div class="alert alert-err" style="margin-top:16px">' + icon("warning-circle") + "<span>" + m + "</span></div>"; f.focus(); }
      if (!$("#ct-name").value.trim()) return bad("Tell us your name.", $("#ct-name"));
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($("#ct-email").value.trim())) return bad("Enter an email we can reply to.", $("#ct-email"));
      if ($("#ct-msg").value.trim().length < 10) return bad("Add a little more detail to your message.", $("#ct-msg"));
      err.innerHTML = '<div class="alert alert-ok" style="margin-top:16px">' + icon("check-circle") + "<span>Thanks, " + esc($("#ct-name").value.trim().split(" ")[0]) + ". In a live service we would reply to " + esc($("#ct-email").value.trim()) + " within 24 hours. This is a demonstration, so nothing was sent.</span></div>";
    });
  }

  /* ---------- Legal centre: Privacy, Terms of use, Cookies and storage ----------
     One layout for all three: a side menu between the documents, jump links to sections, a plain "In short"
     summary first, then the detail. The storage page reads what this browser has actually saved. */
  var STORE_KEYS = [
    ["aurora.theme", "local", "Day or night theme", "So the site opens in the theme you chose."],
    ["aurora.a11y", "local", "Display settings", "Larger text, contrast, motion and link settings from the Accessibility page."],
    ["aurora.bookings", "local", "Bookings you made here", "Demonstration bookings, so Manage booking can find them."],
    ["aurora.trips", "local", "Seats and check-in", "Seats you chose and flights you checked in for."],
    ["aurora.state", "session", "Booking in progress", "Your search and choices while you book. Cleared when you close the tab."],
    ["aurora.user", "session", "Demonstration sign-in", "Your name, email and Miles tier. Cleared when you close the tab."]
  ];
  var LEGAL = {
    privacy: { title: "Privacy", intro: "What this site keeps, what a real airline would need, and the choices you have.",
      short: [["shield-check", "Nothing leaves your browser", "There is no server, account database or tracking behind this prototype."], ["database", "You can see everything we keep", "Cookies and storage lists every item, with a button to remove it."], ["user-circle", "A real airline would need more", "Passport names and contact details, used only to fly you and meet the law."]],
      sections: [
        ["here", "What this prototype keeps", function () { return "<p>Only what makes the site work, saved in your own browser and never sent anywhere:</p>" + storageTable(false) + '<p><a class="link" href="#/help/cookies">See and remove these items</a></p>'; }],
        ["live", "What a live airline would collect", function () { return "<p>To carry you, an airline needs a few details. This is what a live Aurora would collect, why, and how long it would keep it.</p>" +
          '<div class="lg-table" role="table" aria-label="Data a live airline would collect"><div role="row" class="lg-th"><span role="columnheader">Data</span><span role="columnheader">Why</span><span role="columnheader">Kept for</span></div>' +
          [["Names as on your passport", "To issue tickets that match your travel documents", "7 years, for tax and audit"], ["Email and phone", "To send confirmations and tell you about changes", "Until you close your account"], ["Passport details", "Border authorities require them before you fly", "Until 72 hours after your trip"], ["Seat, meal and assistance needs", "To prepare the cabin and the help you asked for", "Until your trip ends"], ["Payment card", "To take payment, handled by a certified payment provider", "Never stored by us"]].map(function (r) { return '<div role="row"><span role="cell"><b>' + r[0] + '</b></span><span role="cell">' + r[1] + '</span><span role="cell">' + r[2] + "</span></div>"; }).join("") + "</div>"; }],
        ["rights", "Your rights", function () { return '<div class="lg-rights">' + [["eye", "See it", "Ask for a copy of everything we hold about you."], ["pencil-simple", "Correct it", "Fix a name, email or detail that is wrong."], ["trash", "Delete it", "Close your account and erase what the law allows."], ["download-simple", "Take it with you", "Get your data in a file you can use elsewhere."]].map(function (x) { return "<div>" + icon(x[0]) + "<b>" + x[1] + "</b><span>" + x[2] + "</span></div>"; }).join("") + '</div><p>To use any of these, <a class="link" href="#/help/contact">contact us</a>. A live airline would reply within 30 days.</p>'; }],
        ["ask", "Questions", function () { return '<p>This page describes a design prototype. To talk about the design, <a class="link" href="https://robertazucena.com/#contact" target="_top">contact Robert Azucena</a>.</p>'; }]
      ] },
    terms: { title: "Terms of use", intro: "The short version: this is a design prototype, not an airline.",
      short: [["airplane-tilt", "No real flights", "Nothing you book here is a ticket, and no seat is held."], ["credit-card", "No payments", "No card is charged and no payment details are asked for."], ["image", "Made for this prototype", "Images are AI-generated; fares and schedules are demonstration data."]],
      sections: [
        ["site", "About this site", function () { return "<p>Aurora Airlines is a design prototype by Robert Azucena, built to explore how calm booking a flight can feel. It is not an airline and does not sell travel.</p>"; }],
        ["travel", "Bookings and fares", function () { return "<p>Flights, fares, seats, flight status and boarding passes are generated for demonstration. Booking references work only in this browser. Fare rules such as bags, changes and refunds show how a live airline would present them, and create no obligation.</p>"; }],
        ["account", "Accounts and Aurora Miles", function () { return "<p>Signing in or joining Aurora Miles creates a demonstration account in this browser tab only. Miles, tiers and awards are illustrative and have no value.</p>"; }],
        ["credits", "Images and credits", function () { return "<p>Aircraft, cabin, destination and page images are AI-generated for this prototype. Country flags come from the open-source flag-icons project (MIT licence). Icons are Phosphor (MIT licence). Map data is from Natural Earth (public domain).</p>"; }],
        ["changes", "Changes to these terms", function () { return '<p>These terms may change as the prototype does. The date at the top of this page shows the latest version.</p>'; }]
      ] },
    cookies: { title: "Cookies and storage", intro: "No cookies, no tracking. Here is everything this site keeps in your browser.",
      short: [["cookie", "No cookies at all", "The site sets no cookies, first-party or third-party."], ["chart-bar", "No analytics or ads", "No tracking scripts, pixels or advertising tools are loaded."], ["hard-drives", "A few saved settings", "Theme, bookings and your sign-in, kept on this device. Remove them below."]],
      sections: [
        ["saved", "What is saved on this device", function () { return '<p>This list reads your browser right now. Removing an item resets that part of the site.</p><div id="lg-store">' + storageTable(true) + "</div>"; }],
        ["none", "What we never use", function () { return '<div class="lg-rights">' + [["cookie", "Cookies", "None, of any kind."], ["chart-line-up", "Analytics", "No page views or clicks are measured."], ["megaphone", "Advertising", "No ad networks or retargeting."], ["globe", "Third-party scripts", "Fonts and icons are served from this site."]].map(function (x) { return "<div>" + icon(x[0]) + "<b>" + x[1] + "</b><span>" + x[2] + "</span></div>"; }).join("") + "</div>"; }]
      ] }
  };
  function storedItems() {
    return STORE_KEYS.map(function (k) {
      var raw = null; try { raw = (k[1] === "local" ? localStorage : sessionStorage).getItem(k[0]); } catch (e) { }
      return { key: k[0], where: k[1], name: k[2], why: k[3], size: raw == null ? 0 : raw.length };
    });
  }
  function storageTable(controls) {
    var items = storedItems(), any = items.some(function (i) { return i.size; });
    return '<ul class="lg-store">' + items.map(function (i) {
      return '<li class="' + (i.size ? "" : "empty") + '"><span class="dx-ic">' + icon(i.where === "local" ? "device-mobile" : "browser") + '</span><div><b>' + i.name + "</b><span>" + i.why + '</span><small>' + (i.where === "local" ? "Kept on this device" : "Kept in this tab") + ", " + (i.size ? (i.size < 1024 ? i.size + " bytes" : (i.size / 1024).toFixed(1) + " KB") : "nothing saved") + "</small></div>" +
        (controls && i.size ? '<button type="button" class="btn btn-secondary btn-sm" data-forget="' + i.key + '" data-where="' + i.where + '">Remove</button>' : "") + "</li>";
    }).join("") + "</ul>" + (controls ? '<div class="lg-clear">' + (any ? '<button type="button" class="btn btn-secondary" data-forget-all>' + icon("trash") + "Clear everything</button>" : '<p class="hint">Nothing is saved on this device.</p>') + '<div id="lg-confirm" role="alert"></div></div>' : "");
  }
  function legal(topic) {
    var d = LEGAL[topic], updated = "16 October 2026";
    main.innerHTML = '<div class="page-head ph-photo ph-legal"><div class="wrap"><h1>' + d.title + "</h1><p>" + d.intro + "</p></div></div>" +
      '<div class="task"><div class="wrap lg-grid"><aside class="lg-side"><nav class="panel lg-nav" aria-label="Legal"><h2>Policies</h2>' +
      [["privacy", "Privacy", "#/help/privacy"], ["terms", "Terms of use", "#/help/terms"], ["cookies", "Cookies and storage", "#/help/cookies"], ["accessibility", "Accessibility", "#/accessibility"]].map(function (l) { return '<a href="' + l[2] + '"' + (l[0] === topic ? ' aria-current="page"' : "") + ">" + l[1] + "</a>"; }).join("") +
      '<h2 class="lg-on">On this page</h2>' + d.sections.map(function (s) { return '<a href="#' + "lg-" + s[0] + '" data-jump="lg-' + s[0] + '" class="lg-jump">' + s[1] + "</a>"; }).join("") + "</nav></aside>" +
      '<article class="lg-doc"><p class="lg-date">Last updated ' + updated + '</p><section class="lg-short" aria-labelledby="lg-short-h"><h2 id="lg-short-h">In short</h2><ul>' + d.short.map(function (x) { return "<li>" + icon(x[0]) + "<span><b>" + x[1] + "</b>" + x[2] + "</span></li>"; }).join("") + "</ul></section>" +
      d.sections.map(function (s) { return '<section class="lg-sec" id="lg-' + s[0] + '" aria-labelledby="lg-' + s[0] + '-h"><h2 id="lg-' + s[0] + '-h">' + s[1] + "</h2>" + s[2]() + "</section>"; }).join("") + "</article></div></div>";
    /* jump links scroll inside the page without changing the route */
    $$("[data-jump]", main).forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); var t = document.getElementById(a.dataset.jump); if (t) { t.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" }); t.querySelector("h2").setAttribute("tabindex", "-1"); t.querySelector("h2").focus({ preventScroll: true }); } }); });
    if (topic === "cookies") bindStorage();
  }
  function bindStorage() {
    function redraw(msg) { $("#lg-store").innerHTML = storageTable(true); bindStorage(); if (msg) toast(msg); }
    $$("[data-forget]", main).forEach(function (b) {
      b.addEventListener("click", function () {
        try { (b.dataset.where === "local" ? localStorage : sessionStorage).removeItem(b.dataset.forget); } catch (e) { }
        if (b.dataset.forget === "aurora.theme") { var sys = window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches ? "day" : "night"; if (sys === "day") document.documentElement.setAttribute("data-theme", "day"); else document.documentElement.removeAttribute("data-theme"); }
        if (b.dataset.forget === "aurora.a11y") applyA11y();
        if (b.dataset.forget === "aurora.user") { var acc = $(".nav-account-label"); if (acc) acc.textContent = "Sign in"; }
        redraw("Removed: " + b.closest("li").querySelector("b").textContent);
      });
    });
    var all = $("[data-forget-all]", main);
    if (all) all.addEventListener("click", function () {
      $("#lg-confirm").innerHTML = '<div class="alert alert-warn">' + icon("warning") + '<span>This removes your theme, display settings, demonstration bookings, seats and sign-in from this browser. <span class="lg-confirm-btns"><button type="button" class="btn btn-primary btn-sm" data-yes>Clear everything</button><button type="button" class="btn btn-secondary btn-sm" data-no>Keep my data</button></span></span></div>';
      $("[data-no]", main).focus();
      $("[data-no]", main).addEventListener("click", function () { $("#lg-confirm").innerHTML = ""; all.focus(); });
      $("[data-yes]", main).addEventListener("click", function () {
        STORE_KEYS.forEach(function (k) { try { (k[1] === "local" ? localStorage : sessionStorage).removeItem(k[0]); } catch (e) { } });
        applyA11y(); var acc = $(".nav-account-label"); if (acc) acc.textContent = "Sign in";
        redraw("Everything this site saved has been cleared");
      });
    });
  }

  /* ---------- help ---------- */
  function help(topic) {
    var pages = {
      about: ["About Aurora", "Aurora Airlines is a design prototype. This is the story it is built around.", '<div class="doc">' +
        '<h2>Built around long nights</h2><p>Aurora flies long-haul from its hub in Singapore to cities in Asia, Oceania, Europe, Africa and the Americas. The schedule is planned around overnight flights, so the cabin, the meals and the lighting are all tuned for rest.</p>' +
        '<div class="doc-stats">' + [["16", "airports"], ["2", "aircraft types"], ["1", "hub, Singapore"], ["9V-AUR", "our first A350"]].map(function (x) { return '<div><b>' + x[0] + "</b><span>" + x[1] + "</span></div>"; }).join("") + "</div>" +
        '<h2>A young, efficient fleet</h2><p>Every aircraft is an Airbus A350-1000 or a Boeing 787-9. Both burn around a quarter less fuel per seat than the aircraft they replace, and are much quieter for people living near airports.</p>' +
        '<h2>Lighter on the planet</h2><ul><li>Sustainable aviation fuel blended into flights from Singapore, rising every year.</li><li>Single-use plastics removed from the cabin, with meals loaded to order to cut waste.</li><li>The option to fund verified carbon removal when you book.</li></ul>' +
        '<h2>The design</h2><p>Aurora was designed and built by Robert Azucena as a portfolio prototype, to explore how calm a booking can feel. Flights, fares and bookings are demonstration data.</p></div>'],
      accessibility: ["Accessibility", "How this site works for everyone, and the help we offer at the airport and on board.", '<div class="doc">' +
        '<h2>Our aim</h2><p>We design this site to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.</p><ul>' +
        "<li>Every task works with a keyboard alone, with a visible focus ring.</li><li>Pages work with screen readers: headings, labels, live updates and named controls.</li><li>Text and controls meet contrast guidelines in both the day and night themes.</li><li>Animation stops when your device asks for reduced motion.</li><li>Pages reflow on small screens and when text is enlarged to 200%.</li></ul>" +
        '<h2>Special assistance</h2><p>Tell us at least 48 hours before you fly and we will arrange:</p><ul><li>Wheelchair help from check-in to your seat, and on arrival.</li><li>Guidance for travellers who are blind or have low vision, and for travellers who are deaf or hard of hearing.</li><li>Trained assistance dogs travelling in the cabin at no charge.</li><li>Extra time and seating near the door for travellers who need it.</li></ul>' +
        '<h2>Tell us what we got wrong</h2><p>If anything on this site is hard to use, <a class="link" href="#/help/contact">contact us</a> and say which page and what happened.</p></div>'],
    }, p = pages[topic];
    if (topic === "about" || topic === "accessibility") { location.replace("#/" + topic); return; }
    if (topic === "baggage") return baggage();
    if (topic === "fares") return fares();
    if (topic === "contact") return contact();
    if (topic === "privacy" || topic === "terms" || topic === "cookies") return legal(topic);
    if (!p) return notFound();
    var intro = p.length > 2 ? p[1] : "", body = p[p.length - 1];
    main.innerHTML = '<div class="page-head ph-photo ph-legal"><div class="wrap"><h1>' + p[0] + "</h1>" + (intro ? "<p>" + intro + "</p>" : "") + '</div></div><div class="task"><div class="wrap" style="max-width:820px"><div class="panel">' + body + "</div></div></div>";
  }
  function notFound() {
    main.innerHTML = '<div class="page-head ph-photo ph-lost"><div class="wrap"><h1>This page has drifted off course</h1><p>The link may be out of date, or the page has moved. Start a new search or head back home.</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px"><a class="btn btn-primary" href="#/">Back to home</a><a class="btn btn-secondary" href="#/book">Search flights</a></div></div></div>' +
      '<div class="task"><div class="wrap"><div class="panel lost-links"><h2>Popular pages</h2><div class="ct-res">' + HELP_QA.slice(0, 4).map(function (x) { return '<a class="ct-ans" href="' + x[2] + '"><b>' + x[0] + "</b><span>" + x[1] + "</span>" + icon("arrow-right") + "</a>"; }).join("") + "</div></div></div></div>";
  }

  /* =========================================================
     router
     ========================================================= */
  function parseHash() {
    var h = location.hash.replace(/^#\/?/, ""), i = h.indexOf("?"), path = (i > -1 ? h.slice(0, i) : h).split("/").filter(Boolean), q = {};
    if (i > -1) h.slice(i + 1).split("&").forEach(function (kv) { var p = kv.split("="); if (p[0]) q[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || "").replace(/\+/g, " ")); });
    return { path: path, q: q };
  }
  var TITLES = { "": "Beyond the ordinary", about: "About Aurora", accessibility: "Accessibility", checkin: "Check in", miles: "Aurora Miles", book: "Book a flight", results: "Choose flights", fare: "Review fare", passengers: "Travellers", review: "Review and confirm", confirmation: "Booking confirmed", manage: "Manage booking", status: "Flight status", destinations: "Destinations", experiences: "Cabins and aircraft", account: "My account", help: "Help" };
  var lastPath = null, cleanups = [];
  function render() {
    closePop(false);
    while (cleanups.length) cleanups.pop()();
    document.body.classList.remove("on-hero");
    var r = parseHash(), p = r.path[0] || "";
    var view = { "": home, book: book, results: results, fare: fare, passengers: passengers, review: review, confirmation: confirmation, manage: manage, checkin: checkin, miles: miles, about: about, accessibility: accessibility, status: status, destinations: destinations, experiences: experiences, account: account, help: function () { help(r.path[1]); } }[p] || notFound;
    view(r.q);
    document.title = "Aurora Airlines, " + (TITLES[p] || "page not found");
    if (p) { main.classList.remove("view-enter"); void main.offsetWidth; main.classList.add("view-enter"); }
    var navKey = { results: "book", fare: "book", passengers: "book", review: "book", confirmation: "book" }[p] || p;
    $$("[data-nav]").forEach(function (a) { if (a.dataset.nav === navKey) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    var acc = $(".nav-account-label"); if (acc) acc.textContent = store.get("aurora.user", true) ? "My account" : "Sign in";
    setDrawer(false);
    if (lastPath !== null && lastPath !== location.hash) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
    lastPath = location.hash;
  }
  function setDrawer(open) { $("#menuBtn").setAttribute("aria-expanded", String(open)); $("#drawer").hidden = !open; $("#menuBtn").innerHTML = icon(open ? "x" : "list"); }
  $("#menuBtn").addEventListener("click", function () { setDrawer($("#drawer").hidden); });
  /* page changes: a short branded veil covers the switch between sections; small changes within a page
     (filters, steps) re-render without it. Reduced motion keeps a plain cross-fade. */
  var veil = $("#veil"), veilBusy = false, vlBoard = $("#vl-board"), vlTitle = $("#vl-title");
  /* departure-board tiles roll like a split-flap wheel: each tile scrolls a short strip of letters and eases onto
     its final letter. One transform per tile, so the motion stays smooth instead of jittering. */
  function rollTiles(tiles, word, opts) {
    var ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", base = opts.base, step = opts.step, spin = opts.spin || 9;
    tiles.forEach(function (el, i) {
      var final = word[i], n = spin + (i % 3), letters = [];
      for (var k = 0; k < n - 1; k++) letters.push(ABC[Math.floor(Math.random() * 26)]);
      letters.push(final);
      el.innerHTML = '<i class="reel" style="--n:' + n + '">' + letters.map(function (c) { return "<b>" + c + "</b>"; }).join("") + "</i>";
      el.classList.remove("set");
      var reel = el.firstChild, dur = base + i * step;
      reel.style.transition = "transform " + dur + "ms cubic-bezier(.16, 1, .3, 1)";
      requestAnimationFrame(function () { requestAnimationFrame(function () { reel.style.transform = "translateY(" + (-(n - 1) / n * 100).toFixed(4) + "%)"; }); });
      setTimeout(function () { el.classList.add("set"); }, dur * 0.7);
    });
    return base + (tiles.length - 1) * step;
  }
  /* the departure board flips to the name of the page you are going to */
  var BOARD = { "": "HOME", book: "BOOK", results: "FLIGHTS", fare: "FARE", passengers: "DETAILS", review: "REVIEW", confirmation: "BOOKED", manage: "MY TRIP", checkin: "CHECK IN", status: "STATUS",
    destinations: "EXPLORE", experiences: "CABINS", account: "ACCOUNT", miles: "MILES", about: "ABOUT", accessibility: "ACCESS",
    "help/baggage": "BAGGAGE", "help/fares": "FARES", "help/contact": "CONTACT", "help/privacy": "PRIVACY", "help/terms": "TERMS", "help/cookies": "COOKIES" };
  function boardFor(h) { var path = (h || "").replace(/^#\/?/, "").split("?")[0], first = path.split("/")[0]; return BOARD[path] || BOARD[first] || "AURORA"; }
  function flipBoard(word) {   // returns when the last tile settles (ms)
    vlBoard.innerHTML = word.split("").map(function (ch) { return ch === " " ? '<span class="gap"></span>' : "<span></span>"; }).join("");
    return rollTiles($$("span:not(.gap)", vlBoard), word.replace(/ /g, ""), { base: 440, step: 40, spin: 7 });
  }
  function section(h) { return (h || "").replace(/^#\/?/, "").split(/[/?]/)[0]; }
  var lastSection = section(location.hash);
  function skipVeil() { if (!veil.classList.contains("in")) return; veil.classList.remove("in"); veil.classList.add("out"); }
  veil.addEventListener("click", skipVeil); document.addEventListener("keydown", function (e) { if (veil.classList.contains("in") && e.key === "Escape") skipVeil(); });
  window.addEventListener("hashchange", function () {
    var next = section(location.hash);
    if (next === lastSection || RM || !veil || veilBusy) { lastSection = next; render(); return; }
    lastSection = next; veilBusy = true;
    /* the home preloader in miniature: fade in, the board rolls to the page name while the route is flown, fade out */
    var settled = flipBoard(boardFor(location.hash)), t0 = performance.now();
    vlTitle.textContent = TITLES[next] || "Aurora";
    $("#vl-to").textContent = D.destinations[Math.floor(Math.random() * D.destinations.length)].code;
    $(".ld-end", veil).classList.remove("on");
    veil.classList.remove("out", "go"); void veil.offsetWidth; veil.classList.add("in", "go");
    setTimeout(function () { $(".ld-end", veil).classList.add("on"); }, 700);
    setTimeout(function () {
      render();
      var hold = Math.max(0, Math.max(settled, 720) + 60 - (performance.now() - t0));   // about 1 s door to door   // the board reads and the plane lands before it fades
      setTimeout(function () {
        veil.classList.remove("in"); veil.classList.add("out");
        setTimeout(function () { veil.classList.remove("out", "go"); veilBusy = false; }, 220);
      }, hold);
    }, 180);
  });
  applyA11y();
  render();
  /* first load: the preloader is a departure board. The name settles tile by tile while a flight is drawn from
     Singapore; it stays until the page is ready and the sequence has played (about 3.5 s). Click or any key skips it. */
  (function () {
    var ld = $("#loader"); if (!ld) return;
    if (document.documentElement.classList.contains("still")) { ld.remove(); return; }
    var tiles = $$(".ld-board span", ld), status = $("#ld-status"), to = $("#ld-to"), end = $(".ld-end", ld);
    var dest = D.destinations[Math.floor(Math.random() * D.destinations.length)].code;
    to.textContent = dest;
    var t0 = performance.now(), min = RM ? 400 : 3500, done = false, timers = [], ready = false;
    if (!RM) {
      ld.classList.add("go");
      rollTiles(tiles, "AURORA", { base: 1100, step: 160, spin: 12 });
      [[1300, "Preparing your cabin"], [2600, "Clear for departure, " + A(dest).city]].forEach(function (s2) {
        timers.push(setTimeout(function () { status.classList.add("swap"); setTimeout(function () { status.textContent = s2[1]; status.classList.remove("swap"); }, 200); }, s2[0]));
      });
      timers.push(setTimeout(function () { end.classList.add("on"); }, 2900));
    } else { tiles.forEach(function (el, i) { el.textContent = "AURORA"[i]; el.classList.add("set"); }); end.classList.add("on"); status.textContent = "Clear for departure"; }
    function finish() {
      if (done) return; done = true; timers.forEach(clearTimeout);
      ld.classList.add("done"); document.documentElement.classList.remove("loading");
      document.removeEventListener("keydown", finish); ld.removeEventListener("click", finish);
      setTimeout(function () { ld.remove(); }, 900);
    }
    function pageReady() { ready = true; var wait = Math.max(0, min - (performance.now() - t0)); setTimeout(finish, wait); }
    document.addEventListener("keydown", finish); ld.addEventListener("click", finish);
    var imgs = $$("#main img", document).filter(function (i) { return i.loading !== "lazy"; }).slice(0, 4);
    Promise.all([document.fonts ? document.fonts.ready : null].concat(imgs.map(function (i) { return i.decode ? i.decode().catch(function () {}) : null; }))).then(pageReady, pageReady);
    setTimeout(finish, 6000);   // never hold anyone for long
  })();
})();
