/* The veil: runs first thing in <body>.
   First visit of a session: the NOWHERE wordmark on the dark with a ring that fills to 100% (what has really
   loaded, never faster than the minimum), then the dark slides up.
   Between pages: the next page slides up over this one while this one drifts up and darkens beneath it, then the
   new page's headline rises line by line. Where the browser supports cross-document view transitions it does
   this with real snapshots of both pages (veil.css); elsewhere a sheet the colour of the page stands in for it. */
(function () {
  var KEY = "nowhere:veil", still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PAGES = ["index.html", "find.html", "home.html", "shortlist.html", "viewings.html", "offer.html", "agent.html", "list.html", "about.html", "faq.html", "terms.html", "privacy.html"];
  var ROLE = { work: "Work", parents: "Parents", school: "School", other: "Other" };
  var root = document.documentElement;
  // browsers with cross-document view transitions run the real thing (Chrome does, even from file://)
  var native = "onpagereveal" in window;
  function store(k, v) { try { v === undefined ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function page(u) { var f = (u.pathname.split("/").pop() || "index.html"); return PAGES.indexOf(f) > -1 ? f : null; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var arriving = read(KEY), first = !read(KEY + ":seen");
  store(KEY); store(KEY + ":seen", "1");
  var full = first && !still;

  /* ---------- the headline: lines rise from behind their own masks ---------- */
  // Split the first heading into its rendered lines, rise them one after another, then put the
  // original markup back so it reflows normally afterwards. Headings with markup inside rise as one piece.
  function rise(delay) {
    if (still) return;
    function go() {
      var h = document.querySelector("main h1, h1"); if (!h || h.dataset.vt) return;
      h.dataset.vt = "1";
      var orig = h.innerHTML, plain = !h.querySelector("*:not(br)");
      var lines = [];
      if (plain) {
        var words = h.textContent.trim().split(/\s+/);
        h.innerHTML = words.map(function (w) { return '<span class="vt-w">' + esc(w) + "</span>"; }).join(" ");
        var top = null;
        Array.prototype.forEach.call(h.querySelectorAll(".vt-w"), function (s) {
          if (s.offsetTop !== top) { lines.push([]); top = s.offsetTop; }
          lines[lines.length - 1].push(s.textContent);
        });
      } else lines = [null];
      h.innerHTML = lines.map(function (l, i) {
        return '<span class="vt-l"><span class="vt-i" style="--k:' + i + '">' + (l ? esc(l.join(" ")) : orig) + "</span></span>";
      }).join("");
      h.style.setProperty("--d", (delay || 0) + "ms");
      void h.offsetWidth; h.classList.add("vt-go");
      setTimeout(function () { h.innerHTML = orig; h.classList.remove("vt-go"); }, (delay || 0) + 1100 + lines.length * 90);
    }
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
      document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", go) : go();
    });
  }

  /* ---------- arriving from another page ---------- */
  if (native) {
    // the browser slides this page in; the headline rises as it lands
    addEventListener("pagereveal", function (e) { if (!full) rise(e.viewTransition ? 520 : 80); });
  } else if (arriving && !full) {
    // the sheet that slid up on the last page is still here, the colour of this page: lift it off as this one is ready
    root.classList.add("vt-arrive");
    var sheet = document.createElement("div"); sheet.className = "vt-sheet is-up"; sheet.setAttribute("aria-hidden", "true");
    root.appendChild(sheet);
    var off = false;
    var reveal = function () { if (off) return; off = true; sheet.classList.add("is-off"); root.classList.remove("vt-arrive"); setTimeout(function () { sheet.remove(); }, 400); rise(40); };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
      document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", reveal) : reveal();
    });
    setTimeout(reveal, 700);
  }

  /* ---------- the first visit: ring preloader ---------- */
  if (full) {
    var A = null;
    try { A = (JSON.parse(localStorage.getItem("thathome:v1")) || {}).anchors; } catch (e) {}
    A = (A || []).filter(function (a) { return ROLE[a.role] && a.place; }).slice(0, 4);
    if (!A.length) A = [{ role: "work", place: "Raffles Place" }, { role: "parents", place: "Bishan" }, { role: "school", place: "Catholic High School" }];

    var v = document.createElement("div");
    v.className = "veil"; v.setAttribute("aria-hidden", "true");
    v.innerHTML = '<div class="veil-sheet"></div><div class="veil-stage"><div class="veil-ring"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" pathLength="100"/><circle class="veil-arc" cx="24" cy="24" r="22" pathLength="100"/></svg>' +
      '<b class="veil-pct"><span>0</span>%</b></div><div class="veil-word">NOWHERE</div><div class="veil-mask"></div></div>';
    document.body.insertBefore(v, document.body.firstChild);
    var arc = v.querySelector(".veil-arc"), pct = v.querySelector(".veil-pct span"), mask = v.querySelector(".veil-mask");

    // a line rolls up through a mask; the old one leaves upward
    var say = function (html) {
      var old = mask.querySelector(".veil-line.is-in"), w = document.createElement("span");
      w.className = "veil-line"; w.innerHTML = html;
      if (old) { old.className = "veil-line is-out"; setTimeout(function () { old.remove(); }, 400); }
      mask.appendChild(w); void w.offsetWidth; w.classList.add("is-in");
    };
    var loaded = document.readyState === "complete", t0 = performance.now(), done = false, p = 0, MIN = 2200, CAP = 6000;
    addEventListener("load", function () { loaded = true; });
    requestAnimationFrame(function () { v.classList.add("is-in"); });
    A.forEach(function (a, i) { setTimeout(function () { say("<small>" + ROLE[a.role] + "</small>" + esc(a.place)); }, 120 + i * (MIN - 700) / A.length); });
    setTimeout(function () { say("Homes, ranked by your week"); }, MIN - 520);

    // the ring: what has really loaded, eased, and held back by the clock so it reads as a steady fill
    var tick = function () {
      var t = performance.now() - t0;
      var target = t > CAP ? 1 : Math.min(loaded ? 1 : document.readyState === "interactive" ? 0.6 : 0.3, t / MIN);
      p += (target - p) * 0.14;
      if (target === 1 && p > 0.995) p = 1;
      arc.style.strokeDashoffset = (100 - p * 100).toFixed(2);
      pct.textContent = Math.round(p * 100);
      if (p === 1) { lift(); return; }
      requestAnimationFrame(tick);
    };
    // done: the ring and the name lift away, the dark slides up, and the headline rises behind it
    var lift = function () {
      if (done) return; done = true;
      setTimeout(function () {
        v.classList.add("is-open");
        setTimeout(function () { v.classList.add("is-part"); rise(260); }, 220);
        setTimeout(function () { v.remove(); }, 1300);
      }, 160);
    };
    requestAnimationFrame(tick);
  } else if (!native && !arriving) {
    rise(60);
  }

  /* ---------- leaving, where the browser can't run the transition itself ---------- */
  if (!native) document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.target && a.target !== "_self" || a.hasAttribute("download")) return;
    var u = new URL(a.href, location.href);
    if (!page(u) || u.protocol !== location.protocol || u.host !== location.host) return;
    if (u.pathname === location.pathname && u.search === location.search) return; // same page or a hash link
    e.preventDefault();
    store(KEY, "1");
    if (still) { location.href = u.href; return; }
    // this page drifts up and darkens; the next one (a sheet the colour of the page) slides up over it
    var shade = document.createElement("div"), sheet = document.createElement("div");
    shade.className = "vt-shade"; sheet.className = "vt-sheet";
    shade.setAttribute("aria-hidden", "true"); sheet.setAttribute("aria-hidden", "true");
    root.appendChild(shade); root.appendChild(sheet);
    void sheet.offsetWidth;
    root.classList.add("vt-leave");
    setTimeout(function () { location.href = u.href; }, 780);
  });

  /* ---------- a simple loader while a slow page is on its way ---------- */
  // Over the browser's transition this page stays put until the next one is ready, so if that takes a moment
  // a small ring appears. It is taken off just before the browser snapshots the page, so it never slides away with it.
  if (native && !still) {
    var loader = null, wait = 0;
    var loading = function () {
      clearTimeout(wait);
      wait = setTimeout(function () {
        if (!loader) { loader = document.createElement("div"); loader.className = "vt-load"; loader.setAttribute("role", "status"); loader.innerHTML = '<i aria-hidden="true"></i><span class="sr-only">Loading</span>'; document.body.appendChild(loader); }
        void loader.offsetWidth; loader.classList.add("is-on");
        wait = setTimeout(done, 10000); // the navigation was stopped: don't leave it spinning
      }, 280);
    };
    var done = function () { clearTimeout(wait); if (loader) { loader.remove(); loader = null; } };
    if (window.navigation) {
      navigation.addEventListener("navigate", function (e) {
        if (e.hashChange || e.downloadRequest || e.navigationType === "reload" || e.destination.sameDocument) return;
        var u = new URL(e.destination.url);
        if (u.origin !== location.origin || !page(u) || u.pathname === location.pathname && u.search === location.search) return;
        loading();
      });
    }
    addEventListener("pageswap", done);
    addEventListener("pagehide", done);
  }

  // back/forward from the cache: put this page back as it was
  addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    root.classList.remove("vt-leave", "vt-arrive");
    Array.prototype.forEach.call(document.querySelectorAll(".vt-shade, .vt-sheet"), function (n) { n.remove(); });
  });
})();
