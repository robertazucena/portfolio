/* Nowhere — About, FAQs, Terms and Privacy: live product pieces, the week calculator, reveals, contents, the device ledger */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var U = AH.ui, esc = U.esc;
  document.documentElement.classList.add("js");
  U.savedCount();
  var ctx = AH.ctx();

  /* About: your real top homes, places and buying power, worked out from what's saved on this device */
  var ranked = AH.listings().map(function (h) { return AH.score(h, ctx); }).filter(function (s) { return !s.m.over; }).sort(function (a, b) { return b.fit - a.fit; });
  var cards = $("[data-top]");
  if (cards) cards.innerHTML = ranked.slice(0, 2).map(function (s, i) {
    return U.card(s, ctx.anchors, { rank: i + 1 }).replace('<div class="home', '<a href="home.html?id=' + s.h.id + '" class="home').replace(/<\/div>$/, "</a>").replace(/<(\/?)h3/g, "<$1p");
  }).join("");
  var places = $("[data-places]");
  if (places) places.innerHTML = ctx.anchors.slice(0, 3).map(function (a) {
    var r = AH.ROLES[a.role];
    return '<div class="ui-place" style="--c:' + r.c + '"><i>' + AH.roleIcon(r) + "</i><span><b>" + esc(r.label) + "</b><small>" + esc(a.place) + "</small></span><em>" + (a.freq === "daily" ? "Daily" : "Weekly") + "</em></div>";
  }).join("");
  var money = $("[data-money]");
  if (money) money.innerHTML = "<span>You can buy up to</span><strong>" + AH.short(Math.max(AH.reach(true, ctx), AH.reach(false, ctx))) + "</strong><hr>" +
    "<div>CPF ready<b>" + AH.short(ctx.money.cpf) + "</b></div><div>Cash ready<b>" + AH.short(ctx.money.cash) + "</b></div><small>Loan tested at 4% over 25 years against the 30% and 55% limits.</small>";
  var rank = $("[data-rank]");
  if (rank) rank.innerHTML = ranked.slice(0, 3).map(function (s, i) {
    return '<div class="ui-rank"><span>' + ("0" + (i + 1)).slice(-2) + '</span><img src="' + esc(AH.img(s.h.photos[0])) + '" alt=""><div style="min-width:0"><b>' + esc(s.h.rooms + " · " + s.h.town) + "</b><small>" + AH.fmt(s.h.price) + "</small></div>" + U.ring(s.fit, s.tone) + "</div>";
  }).join("");
  var nfit = $("[data-nfit]"); if (nfit) nfit.textContent = ranked.length;

  /* About: what a commute adds up to */
  var mins = $("[data-mins]"), days = $("[data-days]");
  function week() {
    var m = +mins.value, d = +days.value, h = m * 2 * d / 60, yr = h * 48 / 24;
    $("[data-mins-out]").textContent = m + " min";
    $("[data-days-out]").textContent = d + (d === 1 ? " day" : " days");
    $("[data-hours]").textContent = (Math.round(h * 10) / 10) + " hours a week";
    $("[data-year]").textContent = "About " + Math.round(yr) + " whole days a year, there and back.";
    mins.style.setProperty("--p", (m - 5) / 85 * 100 + "%"); days.style.setProperty("--p", (d - 1) / 5 * 100 + "%");
    $$("[data-bar] i").forEach(function (el, k) { el.classList.toggle("on", k < Math.round(yr / 2)); });
  }
  if (mins) {
    $("[data-bar]").innerHTML = new Array(31).join("<i></i>");
    mins.addEventListener("input", week); days.addEventListener("input", week); week();
  }

  /* each part of a section rises in turn as it enters */
  var n = new Map();
  $$(".rv").forEach(function (el) { var g = el.closest("section, header") || document.body, k = (n.get(g) || 0) + 1; n.set(g, k); el.style.setProperty("--d", Math.min(k - 1, 5) * 80 + "ms"); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    $$(".rv").forEach(function (el) { io.observe(el); });
  } else $$(".rv").forEach(function (el) { el.classList.add("is-in"); });

  /* Terms and Privacy: mark the section being read */
  var toc = $$(".lg-toc a");
  if (toc.length && "IntersectionObserver" in window) {
    var tio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) toc.forEach(function (a) { a.setAttribute("aria-current", a.hash === "#" + e.target.id); }); }); }, { rootMargin: "-25% 0px -65% 0px" });
    $$(".lg-text section[id]").forEach(function (s) { tio.observe(s); });
  }

  /* Privacy: what this device holds right now */
  function count() {
    var s = AH.load(), mine = s.enquiries.filter(function (e) { return e.pool === -1 && e.state !== "cancelled"; });
    var v = { places: s.anchors.length, saved: Object.keys(s.saved).length, viewings: mine.length, messages: mine.reduce(function (t, e) { return t + 1 + (e.thread || []).length; }, 0), offers: s.offers.filter(function (o) { return o.state !== "withdrawn"; }).length, listings: s.published.length };
    Object.keys(v).forEach(function (k) { var el = $('[data-n="' + k + '"]'); if (el) el.textContent = v[k]; });
  }
  if ($("[data-ledger]")) {
    count();
    $("[data-clear]").addEventListener("click", function () {
      if (!confirm("Clear everything Nowhere has saved on this device?")) return;
      AH.reset(); try { sessionStorage.removeItem("thathome:find"); } catch (e) {}
      count(); U.savedCount();
      $("[data-clear-done]").textContent = "Cleared. Everything is back to the samples.";
    });
  }
})();
