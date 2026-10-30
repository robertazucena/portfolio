/* Nowhere — a home's media in two tabs: a photo gallery, and a walkthrough video with a floor plan drawn from the listing */
(function () {
  "use strict";
  var esc = AH.ui.esc, W = 120, H = 80, HALL = 38, NS = "http://www.w3.org/2000/svg";
  var POOL = { living: ["living", "living-2", "living-3", "living-4"], bed: ["bed-1", "bed-2", "bed-3"], kitchen: ["kitchen"], balcony: ["sunroom"] };

  /* rooms laid out from the type and bedroom count: bedrooms across the top, living and service rooms below, a hall between */
  function layout(h) {
    var rooms = [], beds = Math.max(1, Math.min(h.beds, 5)), hdb = h.type === "HDB", condo = h.type === "Condo" || h.type === "EC";
    var top = [{ k: "bed", name: "Master bedroom", w: 1.45, ensuite: true }];
    if (beds > 1) top.push({ k: "bath", name: "Bathroom", w: 0.55 });
    for (var i = 2; i <= beds; i++) top.push({ k: "bed", name: "Bedroom " + i, w: 1.1 });
    var tw = top.reduce(function (s, r) { return s + r.w; }, 0), x = 0;
    top.forEach(function (r) { var w = W * r.w / tw; rooms.push(Object.assign(r, { x: x, y: 0, w: w, h: HALL - 4 })); x += w; });
    var low = [{ k: "living", name: condo ? "Living, dining and balcony" : "Living and dining", w: 2.6 }, { k: "kitchen", name: "Kitchen", w: 1.1 }, { k: "yard", name: "Service yard", w: 0.55 }];
    if (hdb || h.type === "EC") low.push({ k: "shelter", name: "Household shelter", w: 0.45 });
    var lw = low.reduce(function (s, r) { return s + r.w; }, 0); x = 0;
    low.forEach(function (r) { var w = W * r.w / lw; rooms.push(Object.assign(r, { x: x, y: HALL + 4, w: w, h: H - HALL - 4 })); x += w; });
    var f = Math.sqrt(h.sqm / (W * H)); // metres per plan unit; the hall and walls take the rest
    rooms.forEach(function (r) { r.sqm = Math.round(r.w * r.h * f * f); r.dims = (r.w * f).toFixed(1) + " × " + (r.h * f).toFixed(1) + " m"; r.cx = r.x + r.w / 2; r.cy = r.y + r.h / 2; r.sy = r.cy + 9; });
    // walk order: in through the front door, the shared rooms, then down the hall to the bedrooms
    return rooms.filter(function (r) { return r.y; }).concat(rooms.filter(function (r) { return !r.y; }));
  }

  function note(r, h) {
    var condo = h.type === "Condo" || h.type === "EC";
    if (r.k === "living") return r.sqm >= 30 ? "Room for a six-seat table and a three-seat sofa, with space to walk around both." : "Fits a four-seat table and a two-seat sofa.";
    if (r.k === "kitchen") return condo ? "Open to the living room, with a breakfast counter." : "Enclosed, so cooking smells stay in. The yard is through the back door.";
    if (r.k === "yard") return "Laundry, washer and the drying rack, off the kitchen.";
    if (r.k === "shelter") return "Household shelter. Most owners use it as a storeroom.";
    if (r.k === "bath") return "Shared by the other bedrooms. Shower, no tub.";
    if (r.ensuite) return "Fits a king bed and a full wardrobe. Has its own bathroom.";
    return r.sqm >= 10 ? "Fits a queen bed and a desk." : "Fits a single bed and a desk. Good as a nursery or a study.";
  }

  function photos(h, rooms) {
    var own = h.photos.filter(function (p) { return !/^(data:|https?:)/.test(p); }), used = {};
    rooms.forEach(function (r) {
      var kind = r.k === "living" ? "living" : r.k === "bed" ? "bed" : r.k === "kitchen" ? "kitchen" : null;
      if (!kind) return;
      var mine = own.filter(function (p) { return p.indexOf(kind) === 0 && !used[p]; })[0];
      if (mine) { used[mine] = 1; r.photo = mine; r.own = true; return; }
      var pool = POOL[kind], pick = pool.filter(function (p) { return !used[p]; })[0] || pool[0];
      used[pick] = 1; r.photo = pick; r.own = false;
    });
  }

  function svg(rooms, h) {
    var s = '<svg class="fp-svg" viewBox="-3 -3 ' + (W + 6) + " " + (H + 6) + '" role="group" aria-label="Floor plan, ' + esc(h.sqm + " m²") + '">' +
      '<rect class="fp-hall" x="0" y="' + (HALL - 4) + '" width="' + W + '" height="8"/>';
    rooms.forEach(function (r, i) {
      var doorX = r.x + Math.min(4, r.w * 0.2), up = r.y === 0, dy = up ? r.y + r.h : r.y;
      s += '<g class="fp-room" data-room="' + i + '" role="button" tabindex="-1" aria-label="' + esc(r.name + ", about " + r.sqm + " square metres") + '">' +
        '<rect x="' + r.x.toFixed(2) + '" y="' + r.y + '" width="' + r.w.toFixed(2) + '" height="' + r.h + '"/>' +
        (r.k === "bed" || r.k === "living" ? '<line class="fp-win" x1="' + (r.x + r.w * 0.25).toFixed(2) + '" x2="' + (r.x + r.w * 0.75).toFixed(2) + '" y1="' + (up ? 0 : H) + '" y2="' + (up ? 0 : H) + '"/>' : "") +
        '<line class="fp-gap" x1="' + doorX.toFixed(2) + '" x2="' + (doorX + 4.5).toFixed(2) + '" y1="' + dy + '" y2="' + dy + '"/>' +
        '<path class="fp-door" d="M' + doorX.toFixed(2) + " " + dy + " l0 " + (up ? -4.5 : 4.5) + " A4.5 4.5 0 0 " + (up ? 1 : 0) + " " + (doorX + 4.5).toFixed(2) + " " + dy + '"/>' +
        (r.w > 12.5 ? '<text x="' + r.cx.toFixed(2) + '" y="' + (r.cy - 0.5).toFixed(2) + '">' + esc(r.k === "living" ? "Living" : r.k === "shelter" ? "Shelter" : r.k === "yard" ? "Yard" : r.ensuite ? "Master" : r.k === "bath" ? "Bath" : r.name.replace("Bedroom", "Bed")) + "</text>" +
          '<text class="fp-a" x="' + r.cx.toFixed(2) + '" y="' + (r.cy + 4).toFixed(2) + '">' + r.sqm + " m²</text>" : '<text class="fp-a" x="' + r.cx.toFixed(2) + '" y="' + (r.cy + 1).toFixed(2) + '">' + r.sqm + "</text>") +
        "</g>";
    });
    return s + '<rect class="fp-shell" x="0" y="0" width="' + W + '" height="' + H + '"/>' +
      '<path class="fp-entry" d="M-3 ' + HALL + ' h4"/>' +
      '<path class="fp-trail" d=""/><path class="fp-done" d=""/>' +
      '<g class="fp-you" aria-hidden="true"><circle class="fp-pulse" r="3.4"/><circle r="1.9"/></g></svg>';
  }

  function clock(sec) { sec = Math.round(sec); return Math.floor(sec / 60) + ":" + ("0" + sec % 60).slice(-2); }
  function two(n) { return ("0" + n).slice(-2); }
  function quiet(markup) { return markup.replace(/ (role|tabindex|aria-label|aria-pressed|data-room)="[^"]*"/g, ""); }
  // one slow camera move per chapter: scale and offset (in %) at the start and the end
  var MOVES = [[1.14, -3.5, 0, 1.14, 3.5, 0], [1.02, 0, 0, 1.17, 0, -2], [1.14, 3.5, 0, 1.14, -3.5, 0], [1.18, 0, 2, 1.03, 0, 0]];
  var EXP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var PLAY = "M8 5.5v13l11-6.5z", PAUSE = "M7 5h3.5v14H7zM13.5 5H17v14h-3.5z";

  AH.media = function (box, h) {
    if (!box) return;
    var rooms = layout(h), still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    photos(h, rooms);
    // like a filmed tour: arrive outside, come in, shared rooms first, then down the hall
    var lead = h.photos.filter(function (p) { return /^home-/.test(p); })[0] || (h.photos[0] && !/^(data:|https?:|living|bed|kitchen|unit-|in-)/.test(h.photos[0]) ? h.photos[0] : null);
    var CH = (lead ? [{ name: "Arriving at " + h.street, photo: lead, own: true, dur: 4 }] : [])
      .concat(rooms.map(function (r) { return { r: r, name: r.name, photo: r.photo, own: r.own, dur: r.photo ? 5.5 : 3.5 }; }));
    var T = 0; CH.forEach(function (c) { c.t0 = T; T += c.dur; });
    var who = (AH.LISTERS[h.lister] || AH.LISTERS.priya).name.split(" ")[0], pics = h.photos, plan = svg(rooms, h);
    function tag(c) { return '<span class="fp-tag">' + (!c.photo ? "Plan view. No photo of this room yet" : c.own ? "From the listing" : "Similar room, for scale") + "</span>"; }
    function zoom(r) { var pad = 6; return '<svg class="fp-zoom" viewBox="' + (r.x - pad).toFixed(2) + " " + (r.y - pad) + " " + (r.w + pad * 2).toFixed(2) + " " + (r.h + pad * 2) + '" aria-hidden="true">' + quiet(plan.replace(/^<svg[^>]*>|<\/svg>$/g, "")) + "</svg>"; }
    var TABS = [["Photos", pics.length], ["Walkthrough and plan", clock(T)]];

    box.innerHTML = '<div class="md-tabs" role="tablist" aria-label="Ways to see this home">' + TABS.map(function (t, i) {
        return '<button type="button" role="tab" id="md-t' + i + '" aria-controls="md-p' + i + '" aria-selected="' + !i + '" tabindex="' + (i ? -1 : 0) + '" data-tab="' + i + '">' + t[0] + "<small>" + t[1] + "</small></button>";
      }).join("") + "</div>" +
      // photos: one large image, thumbnails underneath
      '<div class="md-p" role="tabpanel" id="md-p0" aria-labelledby="md-t0"><div class="gl">' +
        '<div class="gl-main" tabindex="0" role="group" aria-roledescription="gallery" aria-label="Photos of the home, use the arrow keys"><img data-gl src="' + esc(AH.img(pics[0])) + '" alt="' + esc(h.rooms + " in " + h.town + ", photo 1 of " + pics.length) + '">' +
          (pics.length > 1 ? '<button type="button" class="gl-go" data-gl-go="-1" aria-label="Previous photo"><svg><use href="#i-chev"/></svg></button><button type="button" class="gl-go" data-gl-go="1" aria-label="Next photo"><svg><use href="#i-chev"/></svg></button>' : "") +
          '<span class="gl-n" data-gl-n>1 / ' + pics.length + "</span>" +
          '<button type="button" class="gl-x" data-lb="photo" aria-label="Expand photo">' + EXP + "</button></div>" +
        '<div class="gl-thumbs">' + pics.map(function (p, i) { return '<button type="button" data-gl-i="' + i + '" aria-label="Photo ' + (i + 1) + " of " + pics.length + '" aria-current="' + !i + '"><img src="' + esc(AH.img(p)) + '" alt="" loading="lazy"></button>'; }).join("") +
          '<button type="button" class="gl-more" data-tab-go="1"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + PLAY + '" fill="currentColor"/></svg><span>Walkthrough<small>' + clock(T) + "</small></span></button></div></div></div>" +
      // walkthrough: the video, with the plan inset so you always know where you are
      '<div class="md-p" role="tabpanel" id="md-p1" aria-labelledby="md-t1" hidden>' +
        '<div class="vt-wrap" data-wrap><div class="vt" data-vt role="region" aria-label="Walkthrough video, space to play or pause, arrow keys to change room" tabindex="0">' +
          '<div class="vt-stage" data-stage>' + CH.map(function (c) { return '<div class="vt-shot">' + (c.photo ? '<img src="' + esc(AH.img(c.photo)) + '" alt="" loading="lazy">' : zoom(c.r)) + tag(c) + "</div>"; }).join("") + "</div>" +
          '<p class="vt-cap" aria-hidden="true"><span data-cn></span><b data-ct></b><small data-cd></small></p>' +
          '<button type="button" class="vt-big" data-toggle><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + PLAY + '" fill="currentColor"/></svg><span data-big>Play the walkthrough · ' + clock(T) + "</span></button></div>" +
          // the plan rides on the video on wide screens and sits under it on phones; tap a room to jump there
          '<div class="vt-mini" data-mini>' + plan.replace(/ (role|tabindex|aria-label|aria-pressed)="[^"]*"/g, "").replace("<svg ", '<svg aria-hidden="true" ') +
            '<button type="button" class="vt-x" data-lb="plan" aria-label="Expand the floor plan">' + EXP + "</button></div></div>" +
        '<div class="vt-bar" role="group" aria-label="Chapters">' + CH.map(function (c, i) { return '<button type="button" data-seek="' + i + '" style="flex-grow:' + c.dur + '" aria-label="Chapter ' + (i + 1) + ": " + esc(c.name) + '"><i></i></button>'; }).join("") + "</div>" +
        '<div class="vt-ctl"><button type="button" class="fp-b" data-go="-1" aria-label="Previous room"><svg><use href="#i-chev"/></svg></button>' +
          '<button type="button" class="vt-pp" data-toggle aria-label="Play walkthrough"><svg viewBox="0 0 24 24" aria-hidden="true"><path data-icon d="' + PLAY + '" fill="currentColor"/></svg></button>' +
          '<button type="button" class="fp-b" data-go="1" aria-label="Next room"><svg><use href="#i-chev"/></svg></button>' +
          '<span class="vt-time" data-time>0:00 / ' + clock(T) + "</span>" +
          (box.requestFullscreen ? '<button type="button" class="fp-b vt-fs" data-fs aria-label="Full screen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button>' : "") + "</div>" +
        '<p class="fp-cap">Built from the listing\'s photos, with a plan drawn from its size and rooms as a guide. Rooms marked "similar" use a sample photo for scale. Tap a room on the plan to jump to it. Ask ' + esc(who) + " for the official plan before you renovate.</p></div>";

    var $1 = function (sel) { return box.querySelector(sel); };
    var mini = $1("[data-mini] .fp-svg"), vt = $1("[data-vt]");

    /* ---------- tabs ---------- */
    var tab = 0;
    function open(i, focus) {
      tab = i;
      box.querySelectorAll("[data-tab]").forEach(function (b, k) { b.setAttribute("aria-selected", k === i); b.tabIndex = k === i ? 0 : -1; if (k === i && focus) b.focus(); });
      box.querySelectorAll(".md-p").forEach(function (p, k) { p.hidden = k !== i; });
      if (i !== 1 && playing) pause();
    }

    /* ---------- photos ---------- */
    var gi = 0;
    function photo(i) {
      gi = (i + pics.length) % pics.length;
      var img = $1("[data-gl]");
      img.src = AH.img(pics[gi]); img.alt = h.rooms + " in " + h.town + ", photo " + (gi + 1) + " of " + pics.length;
      img.classList.remove("in"); void img.offsetWidth; img.classList.add("in");
      $1("[data-gl-n]").textContent = (gi + 1) + " / " + pics.length;
      box.querySelectorAll("[data-gl-i]").forEach(function (b, k) { b.setAttribute("aria-current", k === gi); });
    }

    /* ---------- the plan, shared by the plan tab and the video inset ---------- */
    var pts = [[-1, HALL]];
    rooms.forEach(function (r) { var dx = r.x + Math.min(4, r.w * 0.2) + 2.25; pts.push([dx, HALL], [dx, r.sy], [r.cx, r.sy], [dx, r.sy], [dx, HALL]); });
    function d(n) { return "M" + pts.slice(0, n).map(function (p) { return p[0].toFixed(2) + " " + p[1].toFixed(2); }).join(" L"); }
    mini.querySelector(".fp-trail").setAttribute("d", d(pts.length - 1));
    function mark(s, ri) {
      var r = rooms[ri];
      s.querySelectorAll(".fp-room").forEach(function (g, k) { g.classList.toggle("is-on", k === ri); });
      s.querySelector(".fp-you").style.transform = r ? "translate(" + r.cx + "px," + r.sy + "px)" : "translate(-1px," + HALL + "px)";
      s.querySelector(".fp-done").setAttribute("d", r ? d(ri * 5 + 4) : "M-1 " + HALL);
    }

    /* ---------- walkthrough ---------- */
    var shots = box.querySelectorAll(".vt-shot"), segs = box.querySelectorAll("[data-seek] i"), media = Array.prototype.map.call(shots, function (s) { return s.firstElementChild; });
    var t = 0, cur = -1, playing = false, last = 0, raf = 0;
    function chapter(i) {
      cur = i; var c = CH[i], r = c.r;
      shots.forEach(function (s, k) { s.classList.toggle("is-on", k === i); });
      mark(mini, r ? rooms.indexOf(r) : -1);
      $1("[data-cn]").textContent = two(i + 1) + " / " + two(CH.length);
      $1("[data-ct]").textContent = c.name;
      $1("[data-cd]").textContent = r ? "About " + r.sqm + " m² · " + note(r, h) : h.floor + " · " + h.mrt + " MRT, " + h.min + " min walk";
    }
    function frame() {
      var i = 0; while (i < CH.length - 1 && t >= CH[i + 1].t0) i++;
      if (i !== cur) chapter(i);
      var c = CH[i], p = Math.min(1, (t - c.t0) / c.dur), e = 0.5 - Math.cos(Math.PI * p) / 2, M = MOVES[i % 4];
      if (!still) media[i].style.transform = "scale(" + (M[0] + (M[3] - M[0]) * e).toFixed(4) + ") translate(" + (M[1] + (M[4] - M[1]) * e).toFixed(2) + "%," + (M[2] + (M[5] - M[2]) * e).toFixed(2) + "%)";
      segs.forEach(function (s, k) { s.style.transform = "scaleX(" + (k < i ? 1 : k === i ? p : 0) + ")"; });
      $1("[data-time]").textContent = clock(t) + " / " + clock(T);
    }
    function tick(now) {
      if (!playing) return;
      t = Math.min(T, t + (now - last) / 1000); last = now; frame();
      if (t >= T) return pause(true);
      raf = requestAnimationFrame(tick);
    }
    function play() {
      if (t >= T) t = 0;
      playing = true; vt.classList.add("is-playing"); last = performance.now(); raf = requestAnimationFrame(tick);
      $1(".vt-pp").setAttribute("aria-label", "Pause walkthrough"); $1("[data-icon]").setAttribute("d", PAUSE);
    }
    function pause(ended) {
      playing = false; cancelAnimationFrame(raf); vt.classList.remove("is-playing");
      $1(".vt-pp").setAttribute("aria-label", "Play walkthrough"); $1("[data-icon]").setAttribute("d", PLAY);
      $1("[data-big]").textContent = ended === true ? "Watch again · " + clock(T) : "Resume · " + clock(T - t) + " left";
    }
    function seek(i) { i = (i + CH.length) % CH.length; t = CH[i].t0; frame(); }

    /* ---------- input ---------- */
    box.addEventListener("click", function (e) {
      var x = function (s) { return e.target.closest(s); }, b;
      if ((b = x("[data-lb]"))) view(b.dataset.lb, gi, b);
      else if (x("[data-gl]")) view("photo", gi, x(".gl-main"));
      else if ((b = x("[data-tab]"))) open(+b.dataset.tab);
      else if ((b = x("[data-tab-go]"))) { open(+b.dataset.tabGo); vt.focus(); play(); }
      else if ((b = x("[data-gl-go]"))) photo(gi + +b.dataset.glGo);
      else if ((b = x("[data-gl-i]"))) photo(+b.dataset.glI);
      else if ((b = x("[data-room]"))) seek(+b.dataset.room + (lead ? 1 : 0));
      else if ((b = x("[data-go]"))) seek(cur + +b.dataset.go);
      else if ((b = x("[data-seek]"))) seek(+b.dataset.seek);
      else if (x("[data-fs]")) { if (document.fullscreenElement) document.exitFullscreen(); else $1("[data-wrap]").requestFullscreen().catch(function () {}); }
      else if (x("[data-toggle]") || x("[data-stage]")) { if (playing) pause(); else play(); }
    });
    box.addEventListener("keydown", function (e) {
      var k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key], tb = e.target.closest("[data-tab]");
      if (tb && (e.key === "ArrowRight" || e.key === "ArrowLeft")) { e.preventDefault(); open((+tb.dataset.tab + k + 2) % 2, true); }
      else if (k && e.target.classList.contains("gl-main")) { e.preventDefault(); photo(gi + k); }
      else if (e.key === "Enter" && e.target.classList.contains("gl-main")) { e.preventDefault(); view("photo", gi, e.target); }
      else if (e.target === vt && k) { e.preventDefault(); seek(cur + k); }
      else if (e.target === vt && (e.key === " " || e.key === "k")) { e.preventDefault(); if (playing) pause(); else play(); }
    });
    // stop when it scrolls away or the tab is hidden
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { if (!es[0].isIntersecting && playing) pause(); }).observe(vt);
    document.addEventListener("visibilitychange", function () { if (document.hidden && playing) pause(); });

    /* ---------- the viewer: a photo or the plan, full screen ----------
       Swipe or arrow keys between photos; pinch, scroll or double-tap to zoom the plan, and tap a room for its size.
       Back, Esc, the close button or a swipe down all close it, and you land on the photo you were looking at. */
    var lb = document.createElement("dialog"), mode = "photo", li = 0, from = null, pushed = false, Z = { s: 1, x: 0, y: 0 };
    lb.className = "lb";
    lb.innerHTML = '<div class="lb-top"><span class="lb-n" data-lb-n></span>' +
        '<div class="lb-zoom" role="group" aria-label="Zoom"><button type="button" data-lb-z="-1" aria-label="Zoom out"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>' +
          '<button type="button" data-lb-z="0" class="lb-fit">Fit</button>' +
          '<button type="button" data-lb-z="1" aria-label="Zoom in"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12M12 6v12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></div>' +
        '<button type="button" class="lb-x" data-lb-x aria-label="Close" autofocus><svg aria-hidden="true"><use href="#i-close"/></svg></button></div>' +
      '<div class="lb-stage" data-lb-stage><div class="lb-move" data-lb-move></div></div>' +
      '<button type="button" class="lb-go" data-lb-go="-1" aria-label="Previous photo"><svg><use href="#i-chev"/></svg></button>' +
      '<button type="button" class="lb-go" data-lb-go="1" aria-label="Next photo"><svg><use href="#i-chev"/></svg></button>' +
      '<p class="lb-cap" data-lb-cap aria-live="polite"></p>';
    document.body.appendChild(lb);
    var stage = lb.querySelector("[data-lb-stage]"), mv = lb.querySelector("[data-lb-move]"), lbCap = lb.querySelector("[data-lb-cap]");
    var hint = "Pinch or scroll to zoom. Tap a room for its size.";

    function shot(i) {
      li = (i + pics.length) % pics.length;
      mv.innerHTML = '<img src="' + esc(AH.img(pics[li])) + '" alt="' + esc(h.rooms + " in " + h.town + ", photo " + (li + 1) + " of " + pics.length) + '" draggable="false">';
      lb.querySelector("[data-lb-n]").textContent = (li + 1) + " / " + pics.length;
      lbCap.textContent = h.rooms + " in " + h.town;
      [li - 1, li + 1].forEach(function (k) { new Image().src = AH.img(pics[(k + pics.length) % pics.length]); });
      mv.style.transform = ""; mv.style.opacity = "";
      mv.firstChild.classList.add("lb-in");
    }
    function sheet() {
      mv.innerHTML = '<div class="lb-sheet">' + plan.replace(/ tabindex="-1"/g, ' tabindex="0"') + "</div>";
      lb.querySelector("[data-lb-n]").textContent = "Floor plan · " + h.sqm + " m²";
      lbCap.textContent = hint;
      Z = { s: 1, x: 0, y: 0 }; place();
    }
    function room(i) {
      var r = rooms[i]; if (!r) return;
      mv.querySelectorAll(".fp-room").forEach(function (g, k) { g.classList.toggle("is-on", k === i); });
      lbCap.innerHTML = "<b>" + esc(r.name) + "</b> About " + r.sqm + " m², " + r.dims + ". " + esc(note(r, h));
    }
    function view(m, i, trigger) {
      if (lb.open) return;
      mode = m; from = trigger || null; lb.dataset.mode = m;
      if (playing) pause();
      if (m === "plan") sheet(); else shot(i);
      lb.querySelectorAll("[data-lb-go]").forEach(function (b) { b.hidden = m !== "photo" || pics.length < 2; });
      document.documentElement.classList.add("lb-open");
      lb.showModal();
      // the back button closes the viewer instead of leaving the page
      try { history.pushState({ lb: 1 }, ""); pushed = true; } catch (e) { pushed = false; }
    }
    function shut() {
      if (!lb.open) return;
      lb.close(); document.documentElement.classList.remove("lb-open");
      if (mode === "photo") photo(li);
      if (from) from.focus({ preventScroll: true });
    }
    function close() { if (pushed) { pushed = false; history.back(); } else shut(); }
    addEventListener("popstate", function () { pushed = false; shut(); });
    lb.addEventListener("cancel", function (e) { e.preventDefault(); close(); });

    /* zoom and pan the plan: the sheet scales from its centre and never drifts off screen */
    function place(ease) {
      var w = mv.offsetWidth, hh = mv.offsetHeight, sw = stage.clientWidth, sh = stage.clientHeight;
      var mx = Math.max(0, (w * Z.s - sw) / 2 + 24), my = Math.max(0, (hh * Z.s - sh) / 2 + 24);
      Z.x = Math.max(-mx, Math.min(mx, Z.x)); Z.y = Math.max(-my, Math.min(my, Z.y));
      mv.classList.toggle("is-ease", !!ease);
      mv.style.transform = "translate(" + Z.x.toFixed(1) + "px," + Z.y.toFixed(1) + "px) scale(" + Z.s.toFixed(3) + ")";
      lb.classList.toggle("is-zoomed", Z.s > 1.01);
    }
    function zoomAt(px, py, ns, ease) {
      ns = Math.max(1, Math.min(4, ns));
      Z.x = px - (px - Z.x) * ns / Z.s; Z.y = py - (py - Z.y) * ns / Z.s; Z.s = ns;
      if (ns === 1) Z.x = Z.y = 0;
      place(ease);
    }
    function rel(e) { var r = stage.getBoundingClientRect(); return [e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2]; }

    var P = {}, g = null, tapAt = 0, tapXY = [0, 0], moved = false;
    stage.addEventListener("pointerdown", function (e) {
      if (e.button) return;
      P[e.pointerId] = [e.clientX, e.clientY]; moved = false;
      var ids = Object.keys(P);
      if (ids.length === 2) { var a = P[ids[0]], b = P[ids[1]]; g = { pinch: Math.hypot(a[0] - b[0], a[1] - b[1]), s: Z.s }; }
      else g = { x: e.clientX, y: e.clientY, zx: Z.x, zy: Z.y };
    });
    stage.addEventListener("pointermove", function (e) {
      if (!P[e.pointerId] || !g) return;
      P[e.pointerId] = [e.clientX, e.clientY];
      var ids = Object.keys(P);
      if (g.pinch && ids.length === 2 && mode === "plan") {
        var a = P[ids[0]], b = P[ids[1]], r = stage.getBoundingClientRect();
        moved = true; zoomAt((a[0] + b[0]) / 2 - r.left - r.width / 2, (a[1] + b[1]) / 2 - r.top - r.height / 2, g.s * Math.hypot(a[0] - b[0], a[1] - b[1]) / g.pinch);
        return;
      }
      var dx = e.clientX - g.x, dy = e.clientY - g.y;
      // capture only once it is a drag, so a plain tap still lands on the room or the photo it hit
      if (!moved && Math.abs(dx) + Math.abs(dy) > 6) { moved = true; try { stage.setPointerCapture(e.pointerId); } catch (err) {} }
      if (mode === "plan") { if (Z.s > 1) { Z.x = g.zx + dx; Z.y = g.zy + dy; place(); } }
      else if (!still) {
        // the photo follows your finger: sideways to change photo, down to close
        mv.style.transform = Math.abs(dx) > Math.abs(dy) ? "translateX(" + dx + "px)" : dy > 0 ? "translateY(" + dy + "px) scale(" + Math.max(0.85, 1 - dy / 1200) + ")" : "";
        mv.style.opacity = dy > 0 && Math.abs(dy) > Math.abs(dx) ? Math.max(0.4, 1 - dy / 500) : "";
      }
    });
    function lift(e) {
      if (!P[e.pointerId]) return;
      delete P[e.pointerId];
      if (Object.keys(P).length) { g = null; return; }
      if (mode === "photo" && g && !g.pinch) {
        var dx = e.clientX - g.x, dy = e.clientY - g.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) shot(li + (dx < 0 ? 1 : -1));
        else if (dy > 90 && dy > Math.abs(dx)) close();
        else { mv.classList.add("is-ease"); mv.style.transform = ""; mv.style.opacity = ""; setTimeout(function () { mv.classList.remove("is-ease"); }, 260); }
      }
      // double-tap the plan: in to 2.5×, or back out to fit
      if (mode === "plan" && !moved && e.pointerType !== "mouse") {
        var now = Date.now();
        if (now - tapAt < 320 && Math.hypot(e.clientX - tapXY[0], e.clientY - tapXY[1]) < 30) { var p = rel(e); zoomAt(p[0], p[1], Z.s > 1.01 ? 1 : 2.5, true); tapAt = 0; }
        else { tapAt = now; tapXY = [e.clientX, e.clientY]; }
      }
      g = null;
    }
    stage.addEventListener("pointerup", lift);
    stage.addEventListener("pointercancel", lift);
    stage.addEventListener("dblclick", function (e) { if (mode !== "plan") return; var p = rel(e); zoomAt(p[0], p[1], Z.s > 1.01 ? 1 : 2.5, true); });
    stage.addEventListener("wheel", function (e) { if (mode !== "plan") return; e.preventDefault(); var p = rel(e); zoomAt(p[0], p[1], Z.s * Math.exp(-e.deltaY * 0.0018)); }, { passive: false });

    lb.addEventListener("click", function (e) {
      var x = function (s) { return e.target.closest(s); }, b;
      if (x("[data-lb-x]")) close();
      else if ((b = x("[data-lb-go]"))) shot(li + +b.dataset.lbGo);
      else if ((b = x("[data-lb-z]"))) { var z = +b.dataset.lbZ; zoomAt(0, 0, z ? Z.s * (z > 0 ? 1.6 : 1 / 1.6) : 1, true); }
      else if ((b = x("[data-room]")) && !moved) room(+b.dataset.room);
      else if (mode === "photo" && e.target === stage && !moved) close();
    });
    lb.addEventListener("keydown", function (e) {
      var k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (mode === "photo" && k) { e.preventDefault(); shot(li + k); }
      else if (mode === "plan") {
        var r = e.target.closest && e.target.closest("[data-room]");
        if (r && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); room(+r.dataset.room); }
        else if (e.key === "+" || e.key === "=") zoomAt(0, 0, Z.s * 1.6, true);
        else if (e.key === "-") zoomAt(0, 0, Z.s / 1.6, true);
        else if (e.key === "0") zoomAt(0, 0, 1, true);
      }
    });
    addEventListener("resize", function () { if (lb.open && mode === "plan") place(); });
    frame();
  };
})();
