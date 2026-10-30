/* Nowhere — shared UI bits for the secondary pages: icons, fit ring, home card, toast */
(function () {
  "use strict";
  var SPRITE = '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' +
    '<symbol id="i-logo" viewBox="0 0 32 32"><path d="M4 15 16 5l12 10v12a1.5 1.5 0 0 1-1.5 1.5h-21A1.5 1.5 0 0 1 4 27z" fill="currentColor"/><circle cx="16" cy="19" r="4.2" fill="#FAF8F3"/><circle cx="16" cy="19" r="1.6" fill="currentColor"/></symbol>' +
    '<symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.4-9.3-9.2C1.5 8 3.6 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.6 0 5.7 3.5 4.5 6.8-1.8 4.8-9.3 9.2-9.3 9.2z"/></symbol>' +
    '<symbol id="i-close" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>' +
    '<symbol id="i-mark" viewBox="0 0 24 24"><path d="M6.5 3.5h11v17L12 16.5l-5.5 4z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>' +
    '<symbol id="i-cal" viewBox="0 0 24 24"><path d="M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
    '<symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>' +
    '<symbol id="i-bed" viewBox="0 0 24 24"><path d="M3 18V7M3 13h18v5M21 13a3 3 0 0 0-3-3h-7v3M7 11.5a1.5 1.5 0 1 0 0-.01" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
    '<symbol id="i-area" viewBox="0 0 24 24"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
    '<symbol id="i-lease" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>' +
    '<symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
    '<symbol id="i-chev" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
    '<symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3 5 6v5.5c0 4.4 3 8.1 7 9.5 4-1.4 7-5.1 7-9.5V6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m9 12 2.2 2.2L15.5 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
    '<symbol id="i-home" viewBox="0 0 24 24"><path d="M4 11 12 4l8 7v9H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></symbol>' +
    '<symbol id="i-photo" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="10" r="1.8" fill="currentColor"/><path d="m4 17 5-4 4 3 3-2 4 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>' +
    '<symbol id="i-lock" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="1.7"/></symbol>' +
    "</svg>";
  document.body.insertAdjacentHTML("afterbegin", SPRITE);

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function ring(fit, tone) {
    var c = tone === "over" ? "#B9B2A3" : tone === "good" ? "#242421" : "#6E6A62";
    return '<div class="fit" style="--fc:' + c + '" role="img" aria-label="Fit score ' + fit + ' out of 100"><svg viewBox="0 0 50 50" aria-hidden="true"><circle class="bg" cx="25" cy="25" r="20"/><circle class="fg" cx="25" cy="25" r="20" style="stroke-dashoffset:' + (126 - 126 * fit / 100).toFixed(1) + '"/></svg><b aria-hidden="true">' + fit + "</b></div>";
  }

  function trips(s, anchors) {
    return anchors.map(function (a, k) {
      var t = s.t[k], r = AH.ROLES[a.role];
      return '<span class="trip' + (t.min > 50 ? " long" : "") + '" style="--c:' + r.c + '"><i aria-hidden="true"></i>' + r.label + " " + t.min + " min" + (t.walk ? " walk" : "") + "</span>";
    }).join("");
  }

  /* the same card buyers see on the Find page */
  function card(s, anchors, opts) {
    opts = opts || {};
    var h = s.h;
    var parts = anchors.map(function (a, k) { return { a: a, w: s.t[k].min * AH.trips(a) }; });
    return '<div class="home tone-' + s.tone + (opts.cls ? " " + opts.cls : "") + '">' +
      '<span class="h-num" aria-hidden="true">' + (opts.rank ? ("0" + opts.rank).slice(-2) : "—") + "</span>" +
      '<div class="h-media"><img src="' + esc(AH.img(h.photos[0] || "living")) + '" alt=""></div>' +
      '<div class="h-body"><h3 class="h-title">' + esc(h.rooms + " · " + h.town) + '</h3><p class="h-money"><strong>' + AH.fmt(h.price) + "</strong></p></div>" +
      '<div class="h-foot"><div class="wk"><div class="wk-bar" role="img" aria-label="' + s.hours.toFixed(1) + ' hours of travel a week">' + parts.map(function (p) { return '<i style="--c:' + AH.ROLES[p.a.role].c + ";flex-grow:" + p.w + '"></i>'; }).join("") + '</div><span class="wk-h"><b>' + s.hours.toFixed(1) + " h</b> a week</span></div></div></div>";
  }

  function lister(h) {
    var p = AH.LISTERS[h.lister] || AH.LISTERS.priya;
    return '<div class="who"><span class="av' + (p.kind === "owner" ? " owner" : "") + '" aria-hidden="true">' + p.initials + "</span><div><b>" + esc(p.name) + "</b><small>" + esc(p.firm) + "</small></div></div>";
  }

  var tEl = null, tT = 0;
  function toast(msg) {
    if (!tEl) { tEl = document.createElement("div"); tEl.className = "toast"; tEl.setAttribute("role", "status"); document.body.appendChild(tEl); }
    tEl.textContent = msg; tEl.hidden = false; tEl.style.animation = "none"; void tEl.offsetWidth; tEl.style.animation = "";
    clearTimeout(tT); tT = setTimeout(function () { tEl.hidden = true; }, 2600);
  }

  function savedCount() {
    var n = Object.keys(AH.load().saved).length, w = AH.needsYou();
    $$("[data-saved]").forEach(function (el) { el.textContent = n; });
    $$("[data-viewings]").forEach(function (el) { el.textContent = w; el.hidden = !w; el.setAttribute("aria-label", w + (w === 1 ? " needs you" : " need you")); });
  }

  function when(ts) {
    var d = new Date(ts);
    return d.toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short" }) + ", " + d.toLocaleTimeString("en-SG", { hour: "numeric", minute: "2-digit" });
  }
  function ago(ts) {
    var m = Math.round((Date.now() - ts) / 60000);
    if (m < 1) return "just now"; if (m < 60) return m + " min ago";
    var h = Math.round(m / 60); if (h < 24) return h + " h ago";
    return Math.round(h / 24) + " d ago";
  }

  AH.ui = { $: $, $$: $$, esc: esc, ring: ring, trips: trips, card: card, lister: lister, toast: toast, savedCount: savedCount, when: when, ago: ago };
})();
