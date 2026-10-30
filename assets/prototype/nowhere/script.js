/* Nowhere — life-first search. Concept prototype; all listings and travel times are samples. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* data, maths and storage live in core.js */
  var ROLES = AH.ROLES, BUYERS = AH.BUYERS, ST = AH.load();
  var L = AH.listings();
  var A = ST.anchors, M = ST.money;
  var uid = A.reduce(function (n, a) { return Math.max(n, a.id); }, 0);
  var S = { view: "all", type: "all", sort: "fit", hot: null, saved: ST.saved };
  /* where you were before opening a home, so Back lands in the same place */
  var KEY = "thathome:find", back = null;
  try { back = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) {}
  var PAGE = 12; // homes per page: never more than 12 on screen at once
  S.page = 0;
  if (back) { S.type = back.type || "all"; S.sort = back.sort || "fit"; S.page = back.page || 0; }
  var fmt = AH.fmt, short = AH.short, km = AH.km, yearsLeft = AH.yearsLeft, trips = AH.trips;
  function ctx() { return { anchors: A, money: M }; }
  function buyer() { return AH.buyerOf(M.buyer); }
  function score(h) { return AH.score(h, ctx()); }
  function reach(pub) { return AH.reach(pub, ctx()); }

  /* ---------- your life panel ---------- */
  function placeOptions(a) {
    var names = Object.keys(ROLES[a.role].places).sort(), has = names.indexOf(a.place) > -1;
    return (has ? "" : '<option selected>' + a.place + "</option>") + names.map(function (n) { return "<option" + (n === a.place ? " selected" : "") + ">" + n + "</option>"; }).join("");
  }
  function renderAnchors() {
    $("[data-anchors]").innerHTML = A.map(function (a, i) {
      var r = ROLES[a.role];
      return '<li class="anchor" data-a="' + a.id + '" style="--c:' + r.c + ";animation-delay:" + i * 60 + 'ms">' +
        '<span class="a-dot" aria-hidden="true">' + AH.roleIcon(r) + "</span>" +
        '<span class="a-role"><select data-role aria-label="What kind of place">' + Object.keys(ROLES).map(function (k) { return '<option value="' + k + '"' + (k === a.role ? " selected" : "") + ">" + ROLES[k].label + "</option>"; }).join("") + "</select></span>" +
        '<span class="a-place"><select data-place aria-label="' + r.label + ' location">' + placeOptions(a) + "</select></span>" +
        (A.length > 1 ? '<button type="button" class="a-x" data-x aria-label="Remove ' + a.place + '"><svg><use href="#i-close"/></svg></button>' : "") +
        '<div class="a-freq"><div class="freq" role="radiogroup" aria-label="How often you go">' +
          '<button type="button" role="radio" data-freq="daily" aria-checked="' + (a.freq === "daily") + '">Daily</button>' +
          '<button type="button" role="radio" data-freq="weekly" aria-checked="' + (a.freq === "weekly") + '">Weekly</button></div><span class="a-trips">' + trips(a) + ' trips a week</span></div>' +
        '<p class="a-note">' + r.note + "</p></li>";
    }).join("");
    $("[data-add]").hidden = A.length >= 4;
    renderStrip();
  }
  function anchorOf(el) { var id = +el.closest("[data-a]").dataset.a; return A.filter(function (a) { return a.id === id; })[0]; }

  $("[data-anchors]").addEventListener("change", function (e) {
    var a = anchorOf(e.target);
    if (e.target.matches("[data-role]")) {
      a.role = e.target.value; a.place = Object.keys(ROLES[a.role].places).sort()[0];
    } else if (e.target.matches("[data-place]")) a.place = e.target.value;
    var p = ROLES[a.role].places[a.place]; if (p) { a.lat = p[0]; a.lng = p[1]; }
    renderAnchors(); update();
  });
  $("[data-anchors]").addEventListener("click", function (e) {
    var f = e.target.closest("[data-freq]"), x = e.target.closest("[data-x]");
    if (f) { anchorOf(f).freq = f.dataset.freq; renderAnchors(); update(); }
    if (x) { var a = anchorOf(x); A.splice(A.indexOf(a), 1); renderAnchors(); update(); toast(a.place + " removed"); }
  });
  $("[data-add]").addEventListener("click", function () {
    var used = A.map(function (a) { return a.role; }), role = ["work", "parents", "school"].filter(function (r) { return used.indexOf(r) < 0; })[0] || "other";
    var place = role === "other" ? "Paya Lebar" : Object.keys(ROLES[role].places).sort()[0], p = ROLES[role].places[place];
    A.push({ id: ++uid, role: role, place: place, freq: "weekly", lat: p[0], lng: p[1] });
    renderAnchors(); update();
    var sel = $('[data-a="' + uid + '"] [data-place]'); if (sel) sel.focus();
  });

  /* money inputs */
  var incomeIn = $('[data-in="income"]'), cpfIn = $('[data-in="cpf"]'), cashIn = $('[data-in="cash"]');
  function paintRange() {
    incomeIn.style.setProperty("--p", (M.income - incomeIn.min) / (incomeIn.max - incomeIn.min) * 100 + "%");
    $('[data-out="income"]').textContent = fmt(M.income) + "/mo";
  }
  incomeIn.value = M.income; cpfIn.value = M.cpf.toLocaleString("en-SG"); cashIn.value = M.cash.toLocaleString("en-SG");
  incomeIn.addEventListener("input", function () { M.income = +incomeIn.value; paintRange(); update(); });
  [[cpfIn, "cpf"], [cashIn, "cash"]].forEach(function (p) {
    p[0].addEventListener("input", function () { M[p[1]] = +p[0].value.replace(/\D/g, "") || 0; update(); });
    p[0].addEventListener("blur", function () { p[0].value = M[p[1]].toLocaleString("en-SG"); });
  });
  $("[data-buyers]").innerHTML = BUYERS.map(function (b) { return '<button type="button" role="radio" data-buyer="' + b.id + '" aria-checked="' + (b.id === M.buyer) + '">' + b.label + "<small>" + b.sub + "</small></button>"; }).join("");
  $("[data-buyers]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-buyer]"); if (!b) return;
    M.buyer = b.dataset.buyer; $$("[data-buyer]").forEach(function (x) { x.setAttribute("aria-checked", x === b); }); update();
  });

  function renderStrip() {
    $("[data-strip]").innerHTML = A.map(function (a) { var r = ROLES[a.role]; return '<span class="schip" style="--c:' + r.c + '"><i>' + AH.roleIcon(r) + "</i>" + a.place + "</span>"; }).join("") +
      '<span class="schip money">' + "$" + (M.income / 1000).toFixed(1) + "k/mo · " + buyer().label + "</span>";
  }

  /* ---------- results ---------- */
  var TYPES = [["all", "All homes"], ["public", "HDB & EC"], ["private", "Condo & landed"]];
  var SORTS = [["fit", "Best fit"], ["time", "Least travel"], ["cash", "Lowest cash"]];
  $("[data-types]").innerHTML = TYPES.map(function (t) { return '<option value="' + t[0] + '"' + (t[0] === S.type ? " selected" : "") + ">" + t[1] + "</option>"; }).join("");
  $("[data-sort]").innerHTML = SORTS.map(function (t) { return '<option value="' + t[0] + '"' + (t[0] === S.sort ? " selected" : "") + ">" + t[1] + "</option>"; }).join("");
  $("[data-types]").addEventListener("change", function (e) { S.type = e.target.value; S.page = 0; update(); });
  $("[data-sort]").addEventListener("change", function (e) { S.sort = e.target.value; S.page = 0; update(); });

  function ring(fit, tone) {
    var c = tone === "over" ? "#B9B2A3" : tone === "good" ? "#242421" : "#6E6A62";
    return '<div class="fit" style="--fc:' + c + '" aria-label="Fit score ' + fit + ' out of 100"><svg viewBox="0 0 50 50" aria-hidden="true"><circle class="bg" cx="25" cy="25" r="20"/><circle class="fg" cx="25" cy="25" r="20" style="stroke-dashoffset:' + (126 - 126 * fit / 100).toFixed(1) + '"/></svg><b>' + fit + "</b></div>";
  }
  /* card: rank, the home, the price, and a bar of the travel week it would give you */
  function weekBar(s, anchors) {
    var parts = anchors.map(function (a, k) { return { a: a, w: s.t[k].min * trips(a) }; }), tot = parts.reduce(function (n, p) { return n + p.w; }, 0) || 1;
    return '<div class="wk"><div class="wk-bar" role="img" aria-label="' + s.hours.toFixed(1) + ' hours of travel a week: ' + parts.map(function (p, k) { return ROLES[p.a.role].label + " " + s.t[k].min + " min"; }).join(", ") + '">' +
      parts.map(function (p) { return '<i style="--c:' + ROLES[p.a.role].c + ";flex-grow:" + p.w + '"></i>'; }).join("") + "</div>" +
      '<span class="wk-h"><b>' + s.hours.toFixed(1) + " h</b> a week</span></div>";
  }
  function card(s, i) {
    var h = s.h, saved = !!S.saved[h.id];
    return '<li class="home tone-' + s.tone + (S.hot === h.id ? " is-hot" : "") + '" data-id="' + h.id + '" style="--i:' + i + '">' +
      '<div class="h-media"><img src="' + AH.img(h.photos[0]) + '" alt="" loading="lazy">' +
        '<span class="h-num" aria-hidden="true">' + (s.rank ? ("0" + s.rank).slice(-2) : "—") + "</span>" +
        '<span class="h-fit" aria-hidden="true">Fit <b>' + s.fit + "</b></span></div>" +
      '<div class="h-body"><h3 class="h-title"><a class="h-open" data-open href="home.html?id=' + h.id + '">' + h.rooms + " · " + h.town + "</a></h3>" +
        '<p class="h-sub">' + h.street + " · " + h.min + " min to " + h.mrt + "</p>" +
        '<p class="h-money"><strong>' + fmt(h.price) + '</strong><span class="sr-only">, fit ' + s.fit + (s.m.over ? ", above your budget" : "") + "</span></p></div>" +
      '<div class="h-foot">' + weekBar(s, A) +
        '<button type="button" class="h-save" data-heart aria-pressed="' + saved + '"><svg><use href="#i-plus"/></svg><span>' + (saved ? "Shortlisted" : "Shortlist") + "</span></button></div>" +
      "</li>";
  }

  var first = true, scored = [], order = [];
  function list() {
    return L.filter(function (h) {
      if (S.view === "saved" && !S.saved[h.id]) return false;
      if (S.type === "public" && !h.public) return false;
      if (S.type === "private" && h.public) return false;
      return true;
    }).map(score);
  }
  function sorter(a, b) {
    if (S.sort === "time") return a.hours - b.hours;
    if (S.sort === "cash") return a.m.cash - b.m.cash || b.fit - a.fit;
    return b.fit - a.fit;
  }

  /* pages of 12: previous, each page, next, and where you are */
  function pager(pages, from, to, total) {
    var b = function (n, label, cls, aria) { return '<button type="button" class="pg-b' + (cls ? " " + cls : "") + '" data-more="' + n + '"' + (aria ? ' aria-label="' + aria + '"' : "") + (n === S.page ? ' aria-current="page"' : "") + ">" + label + "</button>"; };
    var nums = ""; for (var i = 0; i < pages; i++) nums += b(i, i + 1, "pg-n", "Page " + (i + 1));
    return '<li class="more-li"><nav class="pager" aria-label="Pages of homes">' +
      (S.page > 0 ? b(S.page - 1, '<svg><use href="#i-chev"/></svg>', "pg-prev", "Previous 12 homes") : '<span class="pg-b pg-prev off" aria-hidden="true"><svg><use href="#i-chev"/></svg></span>') +
      '<span class="pg-nums">' + nums + "</span>" +
      '<span class="pg-of">' + (from + 1) + "–" + to + " of " + total + "</span>" +
      (S.page < pages - 1 ? b(S.page + 1, '<svg><use href="#i-chev"/></svg>', "pg-next", "Next 12 homes") : '<span class="pg-b pg-next off" aria-hidden="true"><svg><use href="#i-chev"/></svg></span>') +
      "</nav></li>";
  }

  function update() {
    var before = {};
    $$(".home").forEach(function (el) { var r = el.getBoundingClientRect(); before[el.dataset.id] = [r.left, r.top]; });
    scored = list();
    var ok = scored.filter(function (s) { return !s.m.over; }).sort(sorter), over = scored.filter(function (s) { return s.m.over; }).sort(sorter);
    ok.forEach(function (s, i) { s.rank = i + 1; });
    var homes = $("[data-homes]"), overEl = $("[data-homes-over]");
    order = ok.map(function (s) { return s.h.id; });
    var pages = Math.max(1, Math.ceil(ok.length / PAGE));
    S.page = Math.min(S.page, pages - 1);
    var from = S.page * PAGE, to = Math.min(from + PAGE, ok.length);
    homes.innerHTML = ok.slice(from, to).map(card).join("") + (pages > 1 ? pager(pages, from, to, ok.length) : "");
    overEl.innerHTML = over.map(card).join("");
    $("[data-over]").hidden = !over.length;
    $("[data-over-count]").textContent = over.length + (over.length === 1 ? " home is" : " homes are") + " above your budget";
    $("[data-fit-count]").textContent = ok.length;
    $("[data-fit-word]").textContent = S.view === "saved" ? (ok.length === 1 ? "saved home fits" : "saved homes fit") : ok.length === 1 ? "home fits your life" : "homes fit your life";
    $("[data-empty]").hidden = !(S.view === "saved" && !scored.length);
    $("[data-reach=hdb]").textContent = short(reach(true));
    $("[data-reach=pvt]").textContent = short(reach(false));
    renderStrip();
    AH.save();

    if (first) { first = false; }
    else {
      homes.classList.add("settled"); overEl.classList.add("settled");
      $$(".home").forEach(function (el) {
        var was = before[el.dataset.id];
        if (was == null) { el.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "cubic-bezier(.23,1,.32,1)" }); return; }
        var r = el.getBoundingClientRect(), dx = was[0] - r.left, dy = was[1] - r.top;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) el.animate([{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }], { duration: 520, easing: "cubic-bezier(.23,1,.32,1)" });
      });
    }
    drawMap();
  }

  /* card events */
  function onCards(e) {
    if (e.target.closest("[data-more]")) {
      S.page = +e.target.closest("[data-more]").dataset.more; update();
      window.scrollTo(0, 0);
      var top = $("[data-homes] .home"); if (top) { var a = $("a[data-open]", top); if (a) a.focus({ preventScroll: true }); }
      return;
    }
    var li = e.target.closest(".home"); if (!li) return;
    var id = +li.dataset.id;
    if (e.target.closest("[data-heart]")) { toggleSave(id); return; }
    if (e.target.closest("a[data-open]")) { remember(id); return; }
    openHome(id);
  }
  $(".results").addEventListener("click", onCards);
  $(".results").addEventListener("mouseover", function (e) { var li = e.target.closest(".home"); setHot(li ? +li.dataset.id : null); });
  $(".results").addEventListener("mouseleave", function () { setHot(null); });
  $(".results").addEventListener("focusin", function (e) { var li = e.target.closest(".home"); if (li) setHot(+li.dataset.id); });

  function setHot(id) {
    if (S.hot === id) return;
    S.hot = id;
    $$(".home").forEach(function (el) { el.classList.toggle("is-hot", +el.dataset.id === id); });
    drawDots(); drawLinks();
  }

  function toggleSave(id) {
    var on = !S.saved[id];
    if (on) S.saved[id] = 1; else delete S.saved[id];
    AH.save();
    var n = Object.keys(S.saved).length, c = $("[data-saved]");
    c.textContent = n; c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
    $$('[data-id="' + id + '"] [data-heart], [data-dsave]').forEach(function (b) { if (b.dataset.dsave && +b.dataset.dsave !== id) return; b.setAttribute("aria-pressed", on); var t = b.matches("[data-heart]") && b.querySelector("span"); if (t) t.textContent = on ? "Shortlisted" : "Shortlist"; });
    var h = L.filter(function (x) { return x.id === id; })[0];
    toast(on ? "Saved " + h.town + " to your shortlist" : "Removed from your shortlist");
    if (S.view === "saved") update();
  }

  $$("[data-view]").forEach(function (b) {
    b.addEventListener("click", function () {
      S.view = b.dataset.view === S.view && S.view === "saved" ? "all" : b.dataset.view;
      $$("[data-view]").forEach(function (x) { var on = x.dataset.view === S.view; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", on); });
      update();
    });
  });

  /* ---------- map (Leaflet, CARTO basemap from OpenStreetMap) ---------- */
  var LF = window.L, map = null, ringLayer, linkLayer, homeLayer, pins = {}, dragging = null;
  if (LF) {
    map = LF.map("map", { zoomControl: false, zoomSnap: 0.25, minZoom: 11, maxZoom: 18, maxBounds: [[1.144, 103.535], [1.494, 104.1]], maxBoundsViscosity: 0.8 }).setView([1.3521, 103.8198], 12);
    LF.control.zoom({ position: "bottomright" }).addTo(map);
    LF.tileLayer("https://www.onemap.gov.sg/maps/tiles/Grey/{z}/{x}/{y}.png", {
      minZoom: 11, maxZoom: 19, detectRetina: true,
      attribution: '<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener">OneMap</a> &copy; contributors | <a href="https://www.sla.gov.sg/" target="_blank" rel="noopener">Singapore Land Authority</a>'
    }).addTo(map);
    AH.mrtLayer(LF, map);
    ringLayer = LF.layerGroup().addTo(map); linkLayer = LF.layerGroup().addTo(map); homeLayer = LF.layerGroup().addTo(map);
  }
  function tag(html) { return LF.divIcon({ className: "hm", html: html, iconSize: null }); }
  function primary() { return A.filter(function (a) { return a.role === "work"; })[0] || A[0]; }

  function drawRings() {
    var p = primary();
    $("[data-ring-name]").textContent = p ? p.place : "";
    if (!map) return;
    ringLayer.clearLayers(); if (!p) return;
    var c = ROLES[p.role].c;
    [50, 35, 20].forEach(function (m) {
      var r = (m - 13) / 1.9 * 1000;
      LF.circle([p.lat, p.lng], { radius: r, color: c, weight: 1.4, opacity: 0.6, dashArray: "5 6", fillColor: c, fillOpacity: 0.04, interactive: false }).addTo(ringLayer);
      LF.marker([p.lat + r / 111320, p.lng], { icon: tag('<span class="ring-tag" style="--c:' + c + '">' + m + " min</span>"), interactive: false, keyboard: false }).addTo(ringLayer);
    });
  }

  function drawDots() {
    if (!map) return;
    homeLayer.clearLayers();
    scored.forEach(function (s) {
      var h = s.h, hot = S.hot === h.id;
      var mk = LF.marker([h.lat, h.lng], {
        icon: tag('<span class="dot ' + s.tone + (hot ? " is-hot" : "") + '"><i>' + (s.rank ? ("0" + s.rank).slice(-2) : "") + "</i><em>" + short(h.price) + " · fit " + s.fit + "</em></span>"),
        zIndexOffset: hot ? 1000 : s.m.over ? -200 : 300 - (s.rank || 0) * 10, keyboard: true
      }).addTo(homeLayer);
      var el = mk.getElement();
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", h.rooms + " in " + h.town + ", " + fmt(h.price) + ", fit " + s.fit);
      mk.on("click", function () { openHome(h.id); });
      mk.on("mouseover", function () { setHot(h.id); toCard(h.id); });
    });
  }

  /* bring the matching card into the bottom strip when its map tile is hovered */
  function toCard(id) {
    if ($(".app").classList.contains("map-open")) return;
    var c = $('.home[data-id="' + id + '"]'); if (c) c.scrollIntoView({ block: "nearest" });
  }

  function drawLinks() {
    if (!map) return;
    linkLayer.clearLayers();
    var s = scored.filter(function (x) { return x.h.id === S.hot; })[0];
    if (!s) return;
    A.forEach(function (a, i) {
      var c = ROLES[a.role].c;
      LF.polyline([[s.h.lat, s.h.lng], [a.lat, a.lng]], { color: c, weight: 3, dashArray: "2 8", lineCap: "round", className: "link-line", interactive: false }).addTo(linkLayer);
      LF.marker([(s.h.lat + a.lat) / 2, (s.h.lng + a.lng) / 2], { icon: tag('<span class="link-tag" style="--c:' + c + '">' + s.t[i].min + " min</span>"), interactive: false, keyboard: false }).addTo(linkLayer);
    });
  }

  function pinIcon(a) { var r = ROLES[a.role]; return tag('<span class="pin" style="--c:' + r.c + '"><b>' + AH.roleIcon(r) + "</b><em>" + a.place + "</em></span>"); }
  function decorate(mk) {
    var a = mk._a, el = mk.getElement(); if (!el) return;
    el.setAttribute("role", "button");
    el.setAttribute("aria-roledescription", "draggable pin");
    el.setAttribute("aria-label", ROLES[a.role].label + ": " + a.place + ". Drag, or use the arrow keys, to move it.");
  }
  function drawPins() {
    if (!map) return;
    var keep = {};
    A.forEach(function (a) {
      keep[a.id] = 1;
      var mk = pins[a.id];
      if (!mk) {
        mk = pins[a.id] = LF.marker([a.lat, a.lng], { icon: pinIcon(a), draggable: true, autoPan: true, zIndexOffset: 2000, keyboard: true }).addTo(map);
        mk._a = a; mk._sig = a.role + a.place;
        mk.on("dragstart", function () { dragging = mk._a; mk.getElement().classList.add("is-drag"); });
        mk.on("drag", function () {
          var ll = mk.getLatLng(), x = mk._a;
          x.lat = ll.lat; x.lng = ll.lng; x.place = nearest(x);
          var em = mk.getElement().querySelector("em"); if (em) em.textContent = x.place;
          schedule();
        });
        mk.on("dragend", function () {
          var x = mk._a; dragging = null; mk.getElement().classList.remove("is-drag");
          renderAnchors(); update(); toast("Re-ranked for " + x.place);
        });
        mk.on("keydown", function (e) {
          var ev = e.originalEvent, step = ev.shiftKey ? 0.01 : 0.003;
          var k = { ArrowLeft: [0, -step], ArrowRight: [0, step], ArrowUp: [step, 0], ArrowDown: [-step, 0] }[ev.key];
          if (!k) return;
          ev.preventDefault(); ev.stopPropagation();
          var x = mk._a; x.lat += k[0]; x.lng += k[1]; x.place = nearest(x);
          renderAnchors(); update();
          var again = pins[x.id] && pins[x.id].getElement(); if (again) again.focus();
        });
        decorate(mk);
      }
      mk._a = a;
      if (dragging !== a) {
        mk.setLatLng([a.lat, a.lng]);
        var sig = a.role + a.place;
        if (sig !== mk._sig) { mk.setIcon(pinIcon(a)); mk._sig = sig; decorate(mk); }
      }
    });
    Object.keys(pins).forEach(function (id) { if (!keep[id]) { map.removeLayer(pins[id]); delete pins[id]; } });
  }
  function drawMap() { drawRings(); drawDots(); drawLinks(); drawPins(); }

  function fitMap() {
    if (!map || !$("#map").clientWidth) return;
    map.invalidateSize();
    var pts = L.map(function (h) { return [h.lat, h.lng]; }).concat(A.map(function (a) { return [a.lat, a.lng]; }));
    // the glimpse is small, so it fits tight; the open map leaves room for the legend and the close button
    var open = $(".app").classList.contains("map-open");
    map.fitBounds(LF.latLngBounds(pts), open ? { paddingTopLeft: [48, 96], paddingBottomRight: [48, 48] } : { padding: [18, 18] });
  }
  var rT = 0;
  window.addEventListener("resize", function () { clearTimeout(rT); rT = setTimeout(function () { if (map) map.invalidateSize(); }, 120); });

  function nearest(a) {
    var best = null, bd = Infinity, places = ROLES[a.role].places;
    Object.keys(places).forEach(function (n) { var d = km(a, { lat: places[n][0], lng: places[n][1] }); if (d < bd) { bd = d; best = n; } });
    return bd < 0.6 ? best : "Near " + best;
  }
  var raf = 0;
  function schedule() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; update(); }); }

  /* ---------- open a home: go straight to its page ---------- */
  var scrim = $("[data-scrim]");
  function remember(id) {
    var list = order.slice(); // the whole ranked order, so ‹ › on a home steps past this page too
    try { sessionStorage.setItem(KEY, JSON.stringify({ type: S.type, sort: S.sort, page: S.page, hot: id, list: list, top: scrollY })); } catch (e) {}
  }
  function openHome(id) { remember(id); location.href = "home.html?id=" + id; }

  /* ---------- life sheet (tablet and phone) ---------- */
  var life = $("#life");
  function openLife() { life.classList.add("is-open"); scrim.hidden = false; $("[data-close-life]").focus(); }
  function closeLife() { if (!life.classList.contains("is-open")) return; life.classList.remove("is-open"); scrim.hidden = true; $("[data-open-life]").focus(); }
  $("[data-open-life]").addEventListener("click", openLife);
  $("[data-close-life]").addEventListener("click", closeLife);
  scrim.addEventListener("click", closeLife);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLife(); });

  /* desktop dock: income and savings open above the bar */
  var mb = $("[data-money-toggle]");
  function moneyOpen(on) { life.classList.toggle("money-open", on); mb.setAttribute("aria-expanded", on); mb.textContent = on ? "Done" : "Edit income and savings"; }
  mb.addEventListener("click", function () { moneyOpen(!life.classList.contains("money-open")); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && life.classList.contains("money-open")) { moneyOpen(false); mb.focus(); } });

  /* the list is the page; the map shows as a glimpse and opens full screen when asked */
  var app = $(".app"), mapEl = $("#map"), opener = null;
  mapEl.inert = true;
  function mapOpen(on, from) {
    if (on === app.classList.contains("map-open")) return;
    app.classList.toggle("map-open", on);
    document.documentElement.classList.toggle("no-scroll", on);
    mapEl.inert = !on;
    $$("[data-map-open]").forEach(function (b) { b.setAttribute("aria-expanded", on); });
    if (map) { map.invalidateSize(); fitMap(); }
    if (on) { opener = from; $("[data-map-close]").focus(); } else if (opener) opener.focus();
  }
  $$("[data-map-open]").forEach(function (b) { b.addEventListener("click", function () { mapOpen(true, b); }); });
  $("[data-map-close]").addEventListener("click", function () { mapOpen(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && app.classList.contains("map-open")) mapOpen(false); });

  /* ---------- toast ---------- */
  var tEl = $("[data-toast]"), tT = 0;
  function toast(msg) { tEl.textContent = msg; tEl.hidden = false; tEl.style.animation = "none"; void tEl.offsetWidth; tEl.style.animation = ""; clearTimeout(tT); tT = setTimeout(function () { tEl.hidden = true; }, 2400); }

  $("[data-saved]").textContent = Object.keys(S.saved).length;
  var nv = AH.needsYou(), vb = $("[data-viewings]"); if (vb) { vb.textContent = nv; vb.hidden = !nv; vb.setAttribute("aria-label", nv + (nv === 1 ? " needs you" : " need you")); }
  paintRange(); renderAnchors(); update(); fitMap();
  if (back) {
    if (back.top) scrollTo(0, back.top);
    if (back.hot) { setHot(back.hot); if (!back.top) toCard(back.hot); }
  }
})();
