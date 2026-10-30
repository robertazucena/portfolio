/* Nowhere — list a home, as an agent or as the owner. The preview shows how this week's buyers would rank it. */
(function () {
  "use strict";
  var U = AH.ui, $ = U.$, $$ = U.$$, esc = U.esc, fmt = AH.fmt, short = AH.short;
  var ST = AH.load();
  var me = AH.LISTERS[ST.me] || AH.LISTERS.priya;
  $("[data-me]").textContent = me.initials;

  var D = {
    kind: me.kind, verified: false, lister: me.id,
    lat: null, lng: null, street: "", postal: "", unit: "", town: "", mrt: "", min: 5,
    type: "HDB", beds: 3, sqm: 92, level: 8, storeys: 16, lease: 2005, price: 650000, photos: []
  };
  var STEPS = ["You", "Address", "The home", "Photos", "Review"], at = 0, seen = 0;

  /* ---------- derived listing for preview and publishing ---------- */
  function draft() {
    var tp = AH.TOWNS["Toa Payoh"];
    var h = {
      id: 9999, town: D.town || "Your town", street: D.street || "Your address", type: D.type, beds: D.beds, sqm: D.sqm,
      floor: D.type === "Landed" ? "Landed" : D.level + " of " + D.storeys, mrt: D.mrt || "Nearest", min: D.min,
      lease: D.type === "Landed" ? 0 : D.lease, price: D.price, photos: D.photos.length ? D.photos : ["living"],
      lister: D.lister, lat: D.lat || tp[0], lng: D.lng || tp[1]
    };
    h.public = h.type === "HDB" || h.type === "EC";
    h.rooms = h.type === "HDB" ? (h.beds + 1) + "-room HDB" : h.type === "EC" ? "Executive condo" : h.type;
    return h;
  }

  /* ---------- shell ---------- */
  $("[data-wiz]").innerHTML =
    '<nav class="steps" aria-label="Steps">' + STEPS.map(function (s, i) { return '<button type="button" data-go="' + i + '">' + s + "</button>"; }).join("") + "</nav>" +
    '<div class="wiz-body"><div data-steps></div><div class="wiz-nav"><button type="button" class="btn ghost" data-prev>Back</button><button type="button" class="btn primary" data-next>Continue</button></div></div>' +
    '<aside class="preview" aria-live="polite"><p class="label">HOW BUYERS WILL SEE IT</p><div data-card></div><p class="label" style="margin-top:6px">WHO IT REACHES THIS WEEK</p><p class="muted" style="font-size:13px" data-reach-line></p><ol class="aud" data-aud></ol></aside>';

  var body = $("[data-steps]");
  body.innerHTML = [
    /* 0 · you */
    '<section class="step" data-step="0"><h1 class="h1">Who is listing this home?</h1>' +
      '<div class="pick" role="radiogroup" aria-label="Who is listing">' +
        '<button type="button" role="radio" data-kind="agent"><b>I\'m an agent</b><span>Listing for a client. We check your licence with the Council for Estate Agencies.</span></button>' +
        '<button type="button" role="radio" data-kind="owner"><b>I\'m the owner</b><span>Selling it yourself. We check you own it with Singpass. No commission.</span></button></div>' +
      '<div class="verify" data-verify></div>' +
      '<p class="muted" style="font-size:13px">Every Nowhere listing carries one of these checks, so buyers never meet a fake listing.</p></section>',
    /* 1 · address */
    '<section class="step" data-step="1"><h1 class="h1">Where is it?</h1>' +
      '<label class="q addr"><span>Block, street or postal code</span><input type="text" data-addr autocomplete="off" placeholder="e.g. 108 Lorong 1 Toa Payoh" role="combobox" aria-expanded="false" aria-controls="addr-list" aria-autocomplete="list"><ul id="addr-list" role="listbox" hidden data-addr-list></ul><small data-addr-note>Addresses come from OneMap, Singapore\'s official map.</small></label>' +
      '<div class="found" data-found hidden><div class="minimap" id="fmap"></div><div><b data-f-street></b><small data-f-meta></small></div></div>' +
      '<label class="q"><span>Unit number</span><input type="text" data-unit placeholder="#08-123"><small>Only the floor is shown to buyers. The unit number stays private until you confirm a viewing.</small></label></section>',
    /* 2 · the home */
    '<section class="step" data-step="2"><h1 class="h1">Tell buyers about the home</h1>' +
      '<fieldset class="q"><legend>Type</legend><div class="seg-row" role="radiogroup" data-seg="type">' + ["HDB", "EC", "Condo", "Landed"].map(function (t) { return '<button type="button" role="radio" data-v="' + t + '">' + t + "</button>"; }).join("") + "</div></fieldset>" +
      '<fieldset class="q"><legend>Bedrooms</legend><div class="seg-row" role="radiogroup" data-seg="beds">' + [1, 2, 3, 4, 5].map(function (t) { return '<button type="button" role="radio" data-v="' + t + '">' + t + (t === 5 ? "+" : "") + "</button>"; }).join("") + "</div></fieldset>" +
      '<div class="grid3"><label class="q"><span>Floor area (m²)</span><input type="number" inputmode="numeric" min="30" max="900" data-num="sqm"></label>' +
        '<label class="q" data-hide-landed><span>Floor</span><input type="number" inputmode="numeric" min="1" max="70" data-num="level"></label>' +
        '<label class="q" data-hide-landed><span>Storeys in block</span><input type="number" inputmode="numeric" min="1" max="70" data-num="storeys"></label></div>' +
      '<label class="q" data-hide-landed><span>Lease started</span><input type="number" inputmode="numeric" min="1960" max="2026" data-num="lease"><small data-lease-note></small></label>' +
      '<label class="q"><span>Asking price</span><input type="text" inputmode="numeric" data-price></label>' +
      '<div class="guide"><b>Price guide</b><p class="muted" style="font-size:13px" data-guide-text></p><div class="guide-scale"><i data-guide-dot></i></div><div class="guide-ends"><span data-g-lo></span><span data-g-hi></span></div></div></section>',
    /* 3 · photos */
    '<section class="step" data-step="3"><h1 class="h1">Add photos</h1>' +
      '<label class="drop" data-drop><input type="file" accept="image/*" multiple class="sr-only" data-file><svg style="width:28px;height:28px"><use href="#i-photo"/></svg><b>Drop photos here, or choose files</b><span>Up to 6. The first one is the cover. Photos stay on this device in this prototype.</span></label>' +
      '<ul class="thumbs" data-thumbs></ul>' +
      '<button type="button" class="mode" data-sample style="justify-self:start">Use sample photos instead</button></section>',
    /* 4 · review */
    '<section class="step" data-step="4"><h1 class="h1">Ready to go live</h1><div data-review></div></section>'
  ].join("");

  /* ---------- step 0 · verification ---------- */
  function paintKind() {
    $$("[data-kind]").forEach(function (b) { b.setAttribute("aria-checked", b.dataset.kind === D.kind); });
    var who = D.kind === "owner" ? AH.LISTERS.tan : AH.LISTERS.priya;
    D.lister = who.id;
    $("[data-me]").textContent = who.initials;
    var v = $("[data-verify]");
    v.classList.toggle("is-ok", D.verified);
    v.innerHTML = D.verified
      ? '<svg style="width:26px;height:26px;color:var(--good)"><use href="#i-shield"/></svg><div><b>' + esc(who.name) + "</b><br><small class=\"muted\">" + (D.kind === "owner" ? "Owner of record, checked with Singpass" : esc(who.firm) + " · licence active") + "</small></div>"
      : '<svg style="width:26px;height:26px;color:var(--muted)"><use href="#i-lock"/></svg><div style="flex:1"><b>' + (D.kind === "owner" ? "Verify with Singpass" : "Check your CEA licence") + '</b><br><small class="muted">' + (D.kind === "owner" ? "Confirms you own the home. HDB flats can be sold after the 5-year minimum occupation." : "Confirms your registration number is active.") + '</small></div><button type="button" class="btn primary" data-check>' + (D.kind === "owner" ? "Verify" : "Check") + "</button>";
  }
  body.addEventListener("click", function (e) {
    var k = e.target.closest("[data-kind]"), c = e.target.closest("[data-check]");
    if (k) { D.kind = k.dataset.kind; D.verified = false; ST.me = D.kind === "owner" ? "tan" : "priya"; AH.save(); paintKind(); nav(); }
    if (c) {
      c.disabled = true; c.innerHTML = '<span class="spin" aria-label="Checking"></span>';
      setTimeout(function () { D.verified = true; paintKind(); nav(); U.toast(D.kind === "owner" ? "Ownership confirmed" : "Licence confirmed"); }, 900);
    }
  });

  /* ---------- step 1 · OneMap address search ---------- */
  var addr = $("[data-addr]"), list = $("[data-addr-list]"), qT = 0, results = [], fmap = null, fmk = null;
  function title(t) { return t.toLowerCase().replace(/\b([a-z])/g, function (c) { return c.toUpperCase(); }); }
  addr.addEventListener("input", function () {
    clearTimeout(qT);
    var q = addr.value.trim(); if (q.length < 3) { list.hidden = true; addr.setAttribute("aria-expanded", "false"); return; }
    qT = setTimeout(function () {
      fetch("https://www.onemap.gov.sg/api/common/elastic/search?searchVal=" + encodeURIComponent(q) + "&returnGeom=Y&getAddrDetails=Y&pageNum=1")
        .then(function (r) { return r.json(); })
        .then(function (j) {
          results = (j.results || []).filter(function (r) { return r.POSTAL && r.POSTAL !== "NIL"; }).slice(0, 8);
          list.innerHTML = results.length ? results.map(function (r, i) {
            return '<li role="option"><button type="button" data-pick="' + i + '">' + esc(title((r.BLK_NO && r.BLK_NO !== "NIL" ? r.BLK_NO + " " : "") + r.ROAD_NAME)) + "<small>" + esc(title(r.BUILDING !== "NIL" ? r.BUILDING : "")) + " Singapore " + esc(r.POSTAL) + "</small></button></li>";
          }).join("") : '<li><small class="muted" style="padding:10px;display:block">No match. Try the postal code.</small></li>';
          list.hidden = false; addr.setAttribute("aria-expanded", "true");
        })
        .catch(function () { $("[data-addr-note]").textContent = "Can't reach OneMap right now. Check your connection and try again."; });
    }, 260);
  });
  addr.addEventListener("keydown", function (e) { if (e.key === "ArrowDown" && !list.hidden) { e.preventDefault(); var b = $("button", list); if (b) b.focus(); } });
  list.addEventListener("keydown", function (e) {
    var bs = $$("button", list), i = bs.indexOf(document.activeElement);
    if (e.key === "ArrowDown" && i < bs.length - 1) { e.preventDefault(); bs[i + 1].focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); (i > 0 ? bs[i - 1] : addr).focus(); }
    if (e.key === "Escape") { list.hidden = true; addr.focus(); }
  });
  list.addEventListener("click", function (e) {
    var b = e.target.closest("[data-pick]"); if (!b) return;
    var r = results[+b.dataset.pick];
    D.lat = +r.LATITUDE; D.lng = +r.LONGITUDE; D.postal = r.POSTAL;
    D.street = title((r.BLK_NO && r.BLK_NO !== "NIL" ? "Blk " + r.BLK_NO + " " : "") + r.ROAD_NAME);
    var named = Object.keys(AH.FAMILY).filter(function (t) { return (r.ADDRESS || "").toUpperCase().indexOf(t.toUpperCase()) > -1; })[0];
    D.town = named || AH.nearestOf(AH.FAMILY, D).name;
    var st = AH.nearestOf(AH.MRT, D); D.mrt = st.name; D.min = Math.max(2, Math.round(st.km * 12 + 1));
    if (/\b(EC|RESIDENCES?|CONDO|SUITES|PARC|VILLE)\b/i.test(r.BUILDING || "") && D.type === "HDB") D.type = "Condo";
    addr.value = title(r.ADDRESS || D.street); list.hidden = true; addr.setAttribute("aria-expanded", "false");
    showFound(); update(); nav();
  });
  function showFound() {
    var f = $("[data-found]"); f.hidden = !D.lat; if (!D.lat) return;
    $("[data-f-street]").textContent = D.street + ", Singapore " + D.postal;
    $("[data-f-meta]").textContent = D.town + " · " + D.mrt + " MRT, about " + D.min + " min walk";
    var LF = window.L; if (!LF) return;
    if (!fmap) {
      fmap = LF.map("fmap", { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false });
      LF.tileLayer("https://www.onemap.gov.sg/maps/tiles/Grey/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(fmap);
      fmk = LF.marker([D.lat, D.lng], { icon: LF.divIcon({ className: "hm", html: '<span class="home-pin" style="width:28px;height:28px;border-radius:10px"><svg style="width:16px;height:16px"><use href="#i-home"/></svg></span>', iconSize: null }), interactive: false, keyboard: false }).addTo(fmap);
    }
    fmap.invalidateSize(); fmap.setView([D.lat, D.lng], 16); fmk.setLatLng([D.lat, D.lng]);
  }
  $("[data-unit]").addEventListener("input", function (e) { D.unit = e.target.value.slice(0, 12); });

  /* ---------- step 2 · the home ---------- */
  function paintSegs() {
    $$('[data-seg="type"] button').forEach(function (b) { b.setAttribute("aria-checked", b.dataset.v === D.type); });
    $$('[data-seg="beds"] button').forEach(function (b) { b.setAttribute("aria-checked", +b.dataset.v === D.beds); });
    $$("[data-hide-landed]").forEach(function (el) { el.hidden = D.type === "Landed"; });
    var yl = 99 - (2026 - D.lease);
    $("[data-lease-note]").textContent = D.type === "Landed" ? "" : yl + " years left. " + (yl < 60 ? "Buyers under 35 may not be able to use their CPF in full." : "Buyers can use their CPF in full.");
  }
  body.addEventListener("click", function (e) {
    var b = e.target.closest("[data-seg] button"); if (!b) return;
    var k = b.parentNode.dataset.seg; D[k] = k === "beds" ? +b.dataset.v : b.dataset.v;
    paintSegs(); update();
  });
  $$("[data-num]").forEach(function (inp) {
    inp.value = D[inp.dataset.num];
    inp.addEventListener("input", function () { var v = +inp.value; if (v) { D[inp.dataset.num] = v; paintSegs(); update(); } });
  });
  var priceIn = $("[data-price]");
  priceIn.value = D.price.toLocaleString("en-SG");
  priceIn.addEventListener("input", function () { var v = +priceIn.value.replace(/\D/g, ""); if (v >= 50000) { D.price = v; update(); } nav(); });
  priceIn.addEventListener("blur", function () { priceIn.value = D.price.toLocaleString("en-SG"); });

  function guide() {
    var h = draft(), mine = h.price / h.sqm;
    var comps = AH.listings().filter(function (x) { return x.public === h.public && x.type !== "Shophouse"; });
    var near = comps.filter(function (x) { return AH.km(x, h) < 6; });
    var set = (near.length >= 2 ? near : comps).map(function (x) { return x.price / x.sqm; }).sort(function (a, b) { return a - b; });
    var lo = set[0], hi = set[set.length - 1], min = lo * 0.75, max = hi * 1.25;
    var x = AH.clamp((mine - min) / (max - min) * 100, 2, 98);
    var dot = $("[data-guide-dot]"); dot.style.setProperty("--x", x + "%"); dot.dataset.v = fmt(mine) + "/m²";
    $("[data-g-lo]").textContent = fmt(min) + "/m²"; $("[data-g-hi]").textContent = fmt(max) + "/m²";
    var where = mine < lo ? "below" : mine > hi ? "above" : "within";
    $("[data-guide-text]").textContent = (near.length >= 2 ? "Similar homes within 6 km" : "Similar homes on Nowhere") + " ask " + fmt(lo) + " to " + fmt(hi) + " per m². Yours is " + where + " that range" + (where === "above" ? ", so expect fewer saves." : where === "below" ? ". It should draw interest fast." : ".");
  }

  /* ---------- step 3 · photos ---------- */
  function shrink(file) {
    return new Promise(function (ok, bad) {
      var fr = new FileReader();
      fr.onload = function () {
        var im = new Image();
        im.onload = function () {
          var k = Math.min(1, 1000 / Math.max(im.width, im.height)), c = document.createElement("canvas");
          c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
          c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
          ok(c.toDataURL("image/webp", 0.78));
        };
        im.onerror = bad; im.src = fr.result;
      };
      fr.onerror = bad; fr.readAsDataURL(file);
    });
  }
  function addFiles(files) {
    var room = 6 - D.photos.length, pick = Array.prototype.slice.call(files).filter(function (f) { return /^image\//.test(f.type); }).slice(0, room);
    if (!pick.length) { U.toast(room ? "Those weren't images" : "Six photos is the limit"); return; }
    Promise.all(pick.map(shrink)).then(function (urls) { D.photos = D.photos.concat(urls); paintThumbs(); update(); nav(); })
      .catch(function () { U.toast("One photo couldn't be read"); });
  }
  function paintThumbs() {
    $("[data-thumbs]").innerHTML = D.photos.map(function (p, i) {
      return '<li><img src="' + esc(AH.img(p)) + '" alt="Photo ' + (i + 1) + '">' + (i ? '<button type="button" class="t-set" data-cover="' + i + '">Make cover</button>' : '<span class="cover">Cover</span>') +
        '<button type="button" class="t-x" data-del="' + i + '" aria-label="Remove photo ' + (i + 1) + '"><svg><use href="#i-close"/></svg></button></li>';
    }).join("");
  }
  var drop = $("[data-drop]");
  $("[data-file]").addEventListener("change", function (e) { addFiles(e.target.files); e.target.value = ""; });
  ["dragenter", "dragover"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("is-over"); }); });
  ["dragleave", "drop"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove("is-over"); }); });
  drop.addEventListener("drop", function (e) { addFiles(e.dataTransfer.files); });
  $("[data-thumbs]").addEventListener("click", function (e) {
    var c = e.target.closest("[data-cover]"), d = e.target.closest("[data-del]");
    if (c) { var i = +c.dataset.cover; D.photos.unshift(D.photos.splice(i, 1)[0]); }
    if (d) D.photos.splice(+d.dataset.del, 1);
    if (c || d) { paintThumbs(); update(); nav(); }
  });
  $("[data-sample]").addEventListener("click", function () {
    D.photos = D.type === "HDB" ? ["blocks", "living-2", "kitchen", "bed-3"] : D.type === "Landed" ? ["landed-2", "living-4", "bed-1"] : ["tower-2", "pool-1", "living-3", "bed-2"];
    paintThumbs(); update(); nav();
  });

  /* ---------- preview + audience ---------- */
  function update() {
    var h = draft(), viewer = AH.POOL[0], vctx = AH.poolCtx(viewer);
    var sc = AH.score(h, vctx), rk = AH.listings().map(function (x) { return AH.score(x, vctx); }).concat([sc]).filter(function (x) { return !x.m.over; }).sort(function (a, b) { return b.fit - a.fit; }).indexOf(sc) + 1;
    $("[data-card]").innerHTML = U.card(sc, vctx.anchors, { rank: rk || 0 }) + '<p class="muted" style="font-size:12px;margin-top:6px">Shown for ' + esc(viewer.name) + ", who works at " + esc(viewer.work) + ".</p>";
    var aud = AH.audience(h).sort(function (a, b) { return (a.rank || 99) - (b.rank || 99); });
    var top = aud.filter(function (x) { return x.rank && x.rank <= 3; }).length, afford = aud.filter(function (x) { return x.rank; }).length;
    $("[data-reach-line]").textContent = afford + " of " + aud.length + " buyers can afford it. It's in the top 3 for " + top + ".";
    $("[data-aud]").innerHTML = aud.map(function (x) {
      return "<li><b>" + esc(x.p.name) + "</b><em>" + (x.rank ? '<span class="chip ' + (x.rank <= 3 ? "ok" : "") + '">#' + x.rank + " · fit " + x.s.fit + "</span>" : '<span class="chip bad">Out of budget</span>') + "</em><span>" + esc(x.p.tag) + " · works at " + esc(x.p.work) + "</span></li>";
    }).join("");
    if ($('[data-step="2"]').classList.contains("is-on")) guide();
    if (at === 4) review();
  }

  function review() {
    var h = draft(), who = AH.LISTERS[D.lister];
    $("[data-review]").innerHTML = '<div class="panel" style="display:grid;gap:12px">' +
      '<dl class="ledger">' +
        "<div><dt>Listed by</dt><dd>" + esc(who.name) + " · " + (D.kind === "owner" ? "Owner" : "Agent") + "</dd></div>" +
        "<div><dt>Address</dt><dd>" + esc(h.street) + (D.unit ? ", " + esc(D.unit) + " (private)" : "") + "</dd></div>" +
        "<div><dt>Home</dt><dd>" + esc(h.rooms) + " · " + h.sqm + " m² · " + esc(h.floor) + "</dd></div>" +
        "<div><dt>Lease</dt><dd>" + (h.lease ? 99 - (2026 - h.lease) + " years left" : "Freehold") + "</dd></div>" +
        "<div><dt>Photos</dt><dd>" + D.photos.length + "</dd></div>" +
        '<div class="total"><dt>Asking price</dt><dd>' + fmt(h.price) + "</dd></div></dl>" +
      '<p class="privacy"><svg><use href="#i-shield"/></svg>' + (D.kind === "owner" ? "Shows as “Ownership checked with Singpass”." : "Shows as “Agent licence checked with CEA”.") + "</p>" +
      '<div class="lead-actions"><button type="button" class="btn primary" data-publish>Publish listing</button><button type="button" class="btn ghost" data-draft>Save as draft</button></div></div>';
  }
  body.addEventListener("click", function (e) {
    var pub = e.target.closest("[data-publish]"), dr = e.target.closest("[data-draft]");
    if (!pub && !dr) return;
    var h = draft(); delete h.public; delete h.rooms;
    h.id = ++ST.uid; h.status = pub ? "live" : "draft"; h.stats = [0, 0, 0]; h.created = Date.now();
    ST.published.push(h); ST.status[h.id] = h.status; ST.me = D.lister;
    AH.save();
    location.href = "agent.html?new=" + h.id;
  });

  /* ---------- step navigation ---------- */
  function valid(i) {
    if (i === 0) return D.verified;
    if (i === 1) return !!D.lat;
    if (i === 2) return D.sqm >= 30 && D.price >= 50000;
    if (i === 3) return D.photos.length > 0;
    return true;
  }
  function nav() {
    $$("[data-go]").forEach(function (b, i) {
      b.setAttribute("aria-current", i === at ? "step" : "false");
      b.classList.toggle("done", i < at && valid(i));
      b.disabled = i > seen;
    });
    $("[data-prev]").style.visibility = at ? "visible" : "hidden";
    var nx = $("[data-next]"); nx.hidden = at === 4; nx.disabled = !valid(at);
  }
  function go(i) {
    at = i; seen = Math.max(seen, i);
    $$(".step").forEach(function (s) { s.classList.toggle("is-on", +s.dataset.step === i); });
    if (i === 1) setTimeout(showFound, 30);
    if (i === 2) guide();
    nav(); update();
    var h1 = $('.step.is-on .h1'); if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  $("[data-next]").addEventListener("click", function () { if (valid(at)) go(at + 1); });
  $("[data-prev]").addEventListener("click", function () { if (at) go(at - 1); });
  $(".steps").addEventListener("click", function (e) { var b = e.target.closest("[data-go]"); if (b && !b.disabled) go(+b.dataset.go); });

  paintKind(); paintSegs(); paintThumbs(); go(0);
})();
