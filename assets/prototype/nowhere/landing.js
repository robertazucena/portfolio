/* Nowhere — the landing page: say where your week happens, watch Singapore re-rank, then walk into the marketplace with it */
(function () {
  "use strict";
  var U = AH.ui, $ = U.$, $$ = U.$$, esc = U.esc, R = AH.ROLES;
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");
  U.savedCount();

  /* ---------- your week, read from (and written back to) this device ---------- */
  var ST = AH.load();
  function anchor(role) { return ST.anchors.filter(function (a) { return a.role === role; })[0]; }
  var work = anchor("work"), par = anchor("parents"), sch = anchor("school");
  /* parents and the school run are optional: leave them out and homes are ranked on the commute and the money alone */
  var fresh = !work;
  var pick = { work: work && R.work.places[work.place] ? work.place : "Raffles Place", parents: par && R.parents.places[par.place] ? par.place : fresh ? "Bishan" : "", freq: par ? par.freq : "weekly", school: sch && R.school.places[sch.place] ? sch.place : fresh ? "Catholic High School" : "" };
  var last = { parents: pick.parents || "Bishan", school: pick.school || "Catholic High School" };

  function fill(sel, places, on, none) {
    sel.innerHTML = (none ? '<option value="">' + none + "</option>" : "") + Object.keys(places).sort().map(function (p) { return "<option" + (p === on ? " selected" : "") + ">" + esc(p) + "</option>"; }).join("");
    sel.value = on;
  }
  fill($("[data-work]"), R.work.places, pick.work);
  fill($("[data-parents]"), R.parents.places, last.parents);
  fill($("[data-school]"), R.school.places, last.school);
  $("[data-freq]").value = pick.freq;

  /* keep every other place you've pinned (a school, a gym); swap in the two chosen here */
  function save(fresh) {
    var id = ST.anchors.reduce(function (m, a) { return Math.max(m, a.id || 0); }, 0);
    function put(role, place, freq) {
      var c = R[role].places[place], a = anchor(role);
      if (!a) { a = { id: ++id, role: role }; ST.anchors.unshift(a); }
      a.place = place; a.freq = freq; a.lat = c[0]; a.lng = c[1];
    }
    if (pick.school) put("school", pick.school, "daily");
    else ST.anchors = ST.anchors.filter(function (a) { return a.role !== "school"; });
    if (pick.parents) put("parents", pick.parents, pick.freq);
    else ST.anchors = ST.anchors.filter(function (a) { return a.role !== "parents"; });
    put("work", pick.work, "daily");
    ST.anchors.sort(function (a, b) { return (a.role === "work" ? 0 : a.role === "parents" ? 1 : 2) - (b.role === "work" ? 0 : b.role === "parents" ? 1 : 2); });
    AH.save();
    if (fresh) try { sessionStorage.removeItem("thathome:find"); } catch (e) {}
  }

  var ok = [], best = null;
  function rank() {
    var ctx = { anchors: ST.anchors, money: ST.money };
    ok = AH.listings().map(function (h) { return AH.score(h, ctx); }).filter(function (s) { return !s.m.over; }).sort(function (a, b) { return b.fit - a.fit; });
    best = ok[0];
    return ctx;
  }

  /* ---------- hero: the count, the top three, the map ---------- */
  var shownN = 0;
  function count(to) {
    var el = $("[data-n]"), from = shownN, t0 = performance.now();
    shownN = to;
    if (still) { el.textContent = to; return; }
    (function step(t) {
      var k = Math.min(1, (t - t0) / 600), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  function top3() {
    var box = $("[data-top]"), before = {};
    $$(".ld-row", box).forEach(function (el) { before[el.dataset.id] = el.getBoundingClientRect().left; });
    box.innerHTML = ok.slice(0, 3).map(function (s, i) {
      var h = s.h;
      return '<li class="ld-row" data-id="' + h.id + '"><a href="home.html?id=' + h.id + '" data-go aria-label="' + esc("Number " + (i + 1) + ": " + h.rooms + " in " + h.town + ", " + AH.fmt(h.price) + ", fit " + s.fit) + '">' +
        '<img src="' + esc(AH.img(h.photos[0])) + '" alt="" width="64" height="64"><span class="ld-fit">' + s.fit + "</span></a></li>";
    }).join("");
    if (still) return;
    $$(".ld-row", box).forEach(function (el, i) {
      var was = before[el.dataset.id], now = el.getBoundingClientRect().left;
      if (was == null) el.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], { duration: 420, delay: i * 60, easing: "cubic-bezier(.23,1,.32,1)", fill: "backwards" });
      else if (Math.abs(was - now) > 1) el.animate([{ transform: "translateX(" + (was - now) + "px)" }, { transform: "none" }], { duration: 520, easing: "cubic-bezier(.23,1,.32,1)" });
    });
  }

  /* ---------- the cheaper home, and what it costs in days ---------- */
  function vs() {
    if (!best) return;
    var cheaper = ok.filter(function (s) { return s.h.price < best.h.price && s.hours > best.hours + 0.5; }).sort(function (a, b) { return b.hours - a.hours; })[0]
      || ok.slice().sort(function (a, b) { return b.hours - a.hours; })[0];
    function card(s, label, cls) {
      var h = s.h;
      return '<a class="ld-vs-card ' + cls + '" href="home.html?id=' + h.id + '" data-go><figure><img src="' + esc(AH.img(h.photos[0])) + '" alt="" loading="lazy"><figcaption>' + label + "</figcaption></figure>" +
        '<div class="ld-vs-b"><p class="ld-vs-t">' + esc(h.rooms + " · " + h.town) + "</p><p class=\"ld-vs-p\">" + AH.fmt(h.price) + "</p>" +
        '<dl><div><dt>On the road</dt><dd>' + s.hours.toFixed(1) + " h<small> a week</small></dd></div><div><dt>Cash a month</dt><dd>" + (s.m.cash < 1 ? "$0" : AH.short(s.m.cash)) + "</dd></div><div><dt>Fit</dt><dd>" + s.fit + "</dd></div></dl></div></a>";
    }
    var save = best.h.price - cheaper.h.price, more = cheaper.hours - best.hours, days = Math.round(more * 48 / 24);
    $("[data-vs]").innerHTML = card(cheaper, save > 0 ? "Cheaper" : "Further out", "is-cheap") +
      '<div class="ld-vs-mid" aria-live="polite"><p class="ld-vs-days"><b>' + days + "</b> days</p><p>" +
      (save > 0 ? "It costs " + AH.short(save) + " less, then takes " + more.toFixed(1) + " more hours every week. Over a year that's " + days + " whole days on the road."
                : "It adds " + more.toFixed(1) + " hours on the road every week: " + days + " whole days a year.") + "</p></div>" +
      card(best, "Best fit for your week", "is-best");
  }

  /* ---------- every home, read for your week ---------- */
  function reel() {
    $("[data-reel]").innerHTML = ok.slice(0, 12).map(function (s, i) {
      var h = s.h;
      return '<li><a class="ld-card" href="home.html?id=' + h.id + '" data-go aria-label="' + esc("Number " + (i + 1) + ": " + h.rooms + " in " + h.town + ", " + AH.fmt(h.price) + ", " + s.hours.toFixed(1) + " hours a week, fit " + s.fit) + '">' +
        '<figure><img src="' + esc(AH.img(h.photos[0])) + '" alt="" loading="lazy"><span class="ld-card-n">' + ("0" + (i + 1)).slice(-2) + "</span>" +
        '<div class="ld-card-o"><p class="ld-card-t">' + esc(h.rooms + " · " + h.town) + '</p><p class="ld-card-p">' + AH.fmt(h.price) + '</p><p class="ld-card-m">' + s.hours.toFixed(1) + " h a week · fit " + s.fit + "</p></div></figure></a></li>";
    }).join("");
    $("[data-n2]").textContent = ok.length;
    cur = -1; arrows();
  }

  /* the reel: tiles sit flush in a row; the one at the front is lifted out of it with its details on the photo,
     and a line and a counter underneath say where you are */
  var rail = $("[data-reel]"), cur = -1;
  function items() { return rail.children; }
  function go(n) {
    var it = items(); n = Math.max(0, Math.min(it.length - 1, n));
    rail.scrollTo({ left: it[n].offsetLeft - it[0].offsetLeft, behavior: still ? "auto" : "smooth" });
  }
  $$("[data-reel-go]").forEach(function (b) {
    b.addEventListener("click", function () { go(cur + +b.dataset.reelGo); });
  });
  // a tile at the side comes to the front first; the one at the front opens
  rail.addEventListener("click", function (e) {
    var li = e.target.closest("li"); if (!li || li.classList.contains("is-on")) return;
    e.preventDefault(); go(Array.prototype.indexOf.call(items(), li));
  });
  rail.addEventListener("focusin", function (e) {
    var li = e.target.closest("li"); if (li && !li.classList.contains("is-on")) go(Array.prototype.indexOf.call(items(), li));
  });
  // the tile at the front of the row follows the scroll
  function arrows() {
    var it = items(); if (!it.length) return;
    var start = rail.getBoundingClientRect().left + (parseFloat(getComputedStyle(rail).paddingLeft) || 0), n = 0, best = Infinity;
    Array.prototype.forEach.call(it, function (li, i) { var d = Math.abs(li.getBoundingClientRect().left - start); if (d < best) { best = d; n = i; } });
    on(n);
  }
  // with a mouse, the tile you point at is lifted, and stays lifted until you point at another
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    rail.addEventListener("pointerover", function (e) {
      var li = e.target.closest("li"); if (li && li.parentNode === rail) on(Array.prototype.indexOf.call(items(), li));
    });
  }
  // the shadow answers the pointer: it falls away from where you are, as if the light followed your hand
  if (matchMedia("(hover: hover) and (pointer: fine)").matches && !still) {
    rail.addEventListener("pointermove", function (e) {
      var li = e.target.closest("li.is-on"); if (!li) return;
      var f = li.querySelector("figure"), b = f.getBoundingClientRect();
      var x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
      f.style.setProperty("--sx", (-x * 36).toFixed(1) + "px"); f.style.setProperty("--sy", (-y * 24).toFixed(1) + "px");
      li.classList.add("is-near");
    });
    rail.addEventListener("pointerout", function (e) {
      var li = e.target.closest("li.is-on"); if (!li || li.contains(e.relatedTarget)) return;
      li.classList.remove("is-near"); var f = li.querySelector("figure"); f.style.removeProperty("--sx"); f.style.removeProperty("--sy");
    });
  }
  function on(n) {
    var it = items();
    $('[data-reel-go="-1"]').disabled = n === 0;
    $('[data-reel-go="1"]').disabled = n === it.length - 1;
    // it grows away from the edge it sits against: from its left at the front, from its right at the far end.
    // Checked on every call, since a smooth scroll is still carrying it to the front when it first becomes active.
    var r = rail.getBoundingClientRect(), b = it[n].getBoundingClientRect(), pad = parseFloat(getComputedStyle(rail).paddingLeft) || 0;
    it[n].classList.toggle("is-l", b.left <= r.left + pad + 4);
    it[n].classList.toggle("is-r", b.left > r.left + pad + 4 && b.right >= r.right - 4);
    if (n === cur) return;
    if (it[cur]) { it[cur].classList.remove("is-on", "is-l", "is-r", "is-near"); it[cur].querySelector("figure").style.removeProperty("--sx"); it[cur].querySelector("figure").style.removeProperty("--sy"); }
    cur = n; it[n].classList.add("is-on");
    $("[data-reel-bar]").style.transform = "scaleX(" + ((n + 1) / it.length).toFixed(3) + ")";
    var from = Math.max(0, Math.min(it.length - 4, n - 1)), nums = "";
    for (var k = from; k < Math.min(it.length, from + 4); k++) nums += "<li" + (k === n ? ' class="is-cur"' : "") + ">" + (k + 1) + "</li>";
    $("[data-reel-num]").innerHTML = nums;
  }
  rail.addEventListener("scroll", function () { requestAnimationFrame(arrows); }, { passive: true });

  /* ---------- everything that follows from your week ---------- */
  function render() {
    rank();
    var good = ok.filter(function (s) { return s.tone === "good"; }).length;
    count(good);
    var more = ok.length - good; $("[data-ok]").textContent = more + (more === 1 ? " more is" : " more are");
    $$("[data-count]").forEach(function (el) { el.textContent = ok.length; });
    var basis = ["your commute"]; if (pick.parents) basis.push("seeing your parents"); if (pick.school) basis.push("the school run");
    $("[data-basis]").textContent = basis.join(", ") + (basis.length > 2 ? "," : "") + " and what you can afford";
    top3(); vs(); reel(); arrows();
  }
  $("[data-week]").addEventListener("change", function (e) {
    var t = e.target;
    if (t.matches("[data-work]")) pick.work = t.value;
    if (t.matches("[data-parents]")) pick.parents = last.parents = t.value;
    if (t.matches("[data-freq]")) pick.freq = t.value;
    if (t.matches("[data-school]")) pick.school = last.school = t.value;
    save(true); render();
  });
  /* leave a place out, or bring it back */
  function clauses() {
    ["parents", "school"].forEach(function (k) {
      $('[data-clause="' + k + '"]').hidden = !pick[k];
      $('[data-add="' + k + '"]').hidden = !!pick[k];
    });
  }
  document.addEventListener("click", function (e) {
    var drop = e.target.closest("[data-drop]"), add = e.target.closest("[data-add]");
    if (!drop && !add) return;
    var k = (drop || add).dataset.drop || (drop || add).dataset.add;
    pick[k] = drop ? "" : last[k];
    save(true); clauses(); render();
    if (drop) $('[data-add="' + k + '"]').focus(); else $(k === "parents" ? "[data-parents]" : "[data-school]").focus();
  });
  if (fresh) save();
  clauses(); render();
  var rT = 0;
  addEventListener("resize", function () { clearTimeout(rT); rT = setTimeout(arrows, 150); });

  /* ---------- from your week to your keys: the line fills as you read ---------- */
  var path = $(".ld-path"), steps = $$(".ld-step");
  function progress() {
    var r = path.getBoundingClientRect(), vh = innerHeight;
    var p = Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height * 0.9)));
    path.style.setProperty("--p", p.toFixed(3));
    steps.forEach(function (s, i) { s.classList.toggle("on", p >= i / (steps.length - 1) - 0.001); });
  }
  if (still) { path.style.setProperty("--p", 1); steps.forEach(function (s) { s.classList.add("on"); }); }
  else { var ticking = false; addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { progress(); ticking = false; }); } }, { passive: true }); progress(); }

  /* ---------- each part of a section rises in turn ---------- */
  var groups = new Map();
  $$(".rv").forEach(function (el) { var g = el.closest("section, header") || document.body, k = (groups.get(g) || 0) + 1; groups.set(g, k); el.style.setProperty("--d", Math.min(k - 1, 5) * 80 + "ms"); });
  /* ---------- the hero: a walk through one Singapore home, each room drifting then crossfading, like the walkthrough ---------- */
  (function () {
    var box = $("[data-slides]"); if (!box) return;
    var shots = $$(".ld-photo", box), imgs = shots.map(function (f) { return f.firstElementChild; });
    var btns = $$("[data-slide]"), segs = btns.map(function (b) { return b.firstElementChild; }), pp = $("[data-sl-pp]"), n = shots.length;
    var MOVES = [[1.14, -3.5, 0, 1.14, 3.5, 0], [1.02, 0, 0, 1.17, 0, -2], [1.14, 3.5, 0, 1.14, -3.5, 0], [1.18, 0, 2, 1.03, 0, 0]];
    var D = 7, i = 0, t = 0, playing = !still, seen = true, last = 0, raf = 0;
    function two(k) { return (k < 10 ? "0" : "") + k; }
    function draw() {
      var p = Math.min(1, t / D), e = 0.5 - Math.cos(Math.PI * p) / 2, M = MOVES[i % MOVES.length];
      if (!still) imgs[i].style.transform = "scale(" + (M[0] + (M[3] - M[0]) * e).toFixed(4) + ") translate(" + (M[1] + (M[4] - M[1]) * e).toFixed(2) + "%," + (M[2] + (M[5] - M[2]) * e).toFixed(2) + "%)";
      segs.forEach(function (s, k) { s.style.transform = "scaleX(" + (k < i ? 1 : k === i ? (playing ? p : 1) : 0) + ")"; });
    }
    function show(k) {
      i = (k + n) % n; t = 0;
      shots.forEach(function (f, j) { f.classList.toggle("is-on", j === i); });
      btns.forEach(function (b, j) { b.setAttribute("aria-current", j === i ? "true" : "false"); });
      $("[data-sl-n]").textContent = two(i + 1) + " / " + two(n);
      $("[data-sl-t]").textContent = shots[i].dataset.room;
      draw();
    }
    function live() { return playing && seen && !document.hidden; }
    function tick(now) {
      if (!live()) { raf = 0; return; }
      t += (now - last) / 1000; last = now;
      if (t >= D) show(i + 1); else draw();
      raf = requestAnimationFrame(tick);
    }
    function kick() { if (live() && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }
    function setPlay(on) {
      playing = on; draw(); kick();
      pp.setAttribute("aria-label", on ? "Pause the photos" : "Play the photos");
      $("[data-sl-icon]").setAttribute("d", on ? "M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" : "M8 5.5v13l11-6.5z");
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { show(+b.dataset.slide); kick(); }); });
    pp.addEventListener("click", function () { setPlay(!playing); });
    document.addEventListener("visibilitychange", kick);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; kick(); }).observe(box);
    show(0); setPlay(playing);
  })();

  /* ---------- reviews: pick a face and it grows into the large frame, the last one steps back to the left ---------- */
  (function () {
    var stage = $("[data-rv]"); if (!stage) return;
    var P = [
      { img: "rv-01.jpg", name: "Mei Ling Tan", where: "4-room resale, Bishan", q: "I typed in my office and my mum’s flat. The top home was eleven minutes from both, in a town I’d never have searched." },
      { img: "rv-02.jpg", name: "Arjun Pillai", where: "5-room resale, Tampines", q: "The grant line did the sums for me. $20,000 off, because my parents live two stops away." },
      { img: "rv-03.jpg", name: "Nur Aisyah Rahman", where: "First home, Punggol", q: "I saw the cash left after CPF before I booked a single viewing. No surprises at the bank." },
      { img: "rv-04.jpg", name: "Daniel Lim", where: "Condo, Queenstown", q: "The agent replied in the app within the hour. Three viewings, one Saturday, no phone tag." },
      { img: "rv-05.jpg", name: "Wei Jie & Hui Min Koh", where: "Executive flat, Ang Mo Kio", q: "Our girl starts Primary 1 next year. Pinning the school showed which homes sit within 1 km." },
      { img: "rv-06.jpg", name: "Clara Ong", where: "3-room resale, Clementi", q: "I stopped sorting by price. Sorting by my week was the first time the list made sense." }
    ];
    var n = P.length, a = 0, L = [], timers = [];
    var ul = $("[data-rv-people]", stage), copy = $("[data-rv-copy]", stage);
    var slotPrev = $(".ld-rv-slot.is-prev", stage), slotMain = $(".ld-rv-slot.is-main", stage), slotQ = $$(".ld-rv-slot.is-q", stage);
    ul.innerHTML = P.map(function (p, i) {
      return '<li><button class="ld-rv-p" type="button" data-i="' + i + '" aria-label="Read ' + esc(p.name) + '\'s review"><img src="images/' + p.img + '" alt="" loading="lazy" decoding="async"></button></li>';
    }).join("");
    var B = $$(".ld-rv-p", ul);
    // where each person sits: -1 is the last one, 0 the large frame, 1-3 the queue, anything else is off stage
    function lane(i) { var d = (i - a + n) % n; return d === n - 1 ? -1 : d; }
    function box(el) { var s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: r.left - s.left, y: r.top - s.top, w: r.width }; }
    function spot(l) {
      var hasPrev = slotPrev.offsetWidth > 0, q = slotQ[slotQ.length - 1];
      if (l === 0) return box(slotMain);
      if (l >= 1 && l <= 3) return box(slotQ[l - 1]);
      if (l === -1 && hasPrev) return box(slotPrev);
      var r = l < 0 ? box(hasPrev ? slotPrev : slotMain) : box(q);
      r.x += (l < 0 ? -0.5 : 0.5) * r.w; r.gone = true; return r;
    }
    function place(b, l, snap) {
      var r = spot(l), W = slotMain.offsetWidth;
      b.classList.toggle("is-snap", !!snap);
      b.style.width = W + "px"; b.style.height = W * 1.25 + "px";
      b.style.transform = "translate(" + r.x.toFixed(1) + "px," + r.y.toFixed(1) + "px) scale(" + (r.w / W).toFixed(4) + ")";
      b.style.opacity = r.gone ? 0 : 1;
      b.classList.toggle("is-gone", !!r.gone); b.classList.toggle("is-on", l === 0);
      b.style.zIndex = l === 0 ? 3 : r.gone ? 0 : 1;
      b.tabIndex = l === 0 || r.gone ? -1 : 0;
      b.setAttribute("aria-hidden", r.gone || l === 0 ? "true" : "false");
      if (snap) void b.offsetWidth;
    }
    function words(i) {
      var p = P[i], k = 0;
      function m(tag, cls, html) { return "<" + tag + ' class="' + cls + ' ld-rv-m"><span style="--k:' + (k++) + '">' + html + "</span></" + tag + ">"; }
      copy.innerHTML = m("p", "ld-rv-n", "#" + String(i + 1).padStart(2, "0")) + m("h3", "ld-rv-name", esc(p.name)) + m("p", "ld-rv-where", esc(p.where)) +
        '<blockquote class="ld-rv-q">' + m("span", "", "“" + esc(p.q) + "”") + "</blockquote>";
    }
    function all(snap) { B.forEach(function (b, i) { L[i] = lane(i); place(b, L[i], snap); }); }
    function go(to) {
      if (to === a) return;
      var k = ((to - a + n) % n) <= n / 2 ? (to - a + n) % n : -((a - to + n) % n);
      timers.forEach(clearTimeout); timers = [];
      a = to; words(a);
      B.forEach(function (b, i) {
        var now = lane(i), straight = L[i] - k;
        var off = function (l) { return l < -1 || l > 3; };
        if (now === straight || off(now) && off(straight) && (now < 0) === (straight < 0)) place(b, straight < -1 || straight > 3 ? straight : now);
        else if (still) place(b, now, true);
        else {
          // it would cross the whole stage: leave on one side, come back on the other
          place(b, straight < 0 ? -2 : 4);
          timers.push(setTimeout(function () { place(b, now < 0 || now === 0 ? -2 : 4, true); place(b, now); }, 460));
        }
        L[i] = now;
      });
    }
    B.forEach(function (b) { b.addEventListener("click", function () { go(+b.dataset.i); }); });
    words(a); all(true);
    var rz = 0; addEventListener("resize", function () { cancelAnimationFrame(rz); rz = requestAnimationFrame(function () { all(true); }); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { all(true); });
  })();

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    $$(".rv, .ld-end").forEach(function (el) { io.observe(el); });
  } else $$(".rv").forEach(function (el) { el.classList.add("is-in"); });
})();
