/* Customer Moments: immersive layer shared by every page.
   Gallery hero deck, card tilt + open transition, editor preview & send,
   dashboard count-ups and chart draw-in. All motion respects reduced motion. */
(function () {
  var REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var EASE = "cubic-bezier(.23,1,.32,1)";

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function icon(name) { return (typeof ICONS !== "undefined" && ICONS[name]) || ""; }

  function fillIcons(root) {
    $$("[data-icon]", root).forEach(function (el) {
      var n = el.getAttribute("data-icon");
      el.innerHTML = n === "arrowRight" ? icon("arrowLeft") : icon(n);
      if (n === "arrowRight") el.classList.add("is-flip");
      el.removeAttribute("data-icon");
    });
  }

  var toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "mx-toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = '<span class="mx-toast-ic">' + icon("check") + "</span>" + msg;
    toastEl.classList.add("is-on");
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2400);
  }

  /* ---------- Sidebar: unfinished pages read as "Soon", not broken ---------- */
  function soonTags() {
    $$(".nav-item.disabled").forEach(function (el) {
      if ($(".nav-soon", el)) return;
      var t = document.createElement("span");
      t.className = "nav-soon";
      t.textContent = "Soon";
      el.appendChild(t);
      el.setAttribute("title", "Coming soon");
    });
  }

  /* ---------- Gallery cards: tilt, stagger, open into the editor ---------- */
  function cards(grid) {
    var items = $$(".mx-gcard", grid);
    if (!grid.classList.contains("is-instant") && !REDUCED) {
      items.forEach(function (c) { c.style.opacity = "0"; });
      (window.MXWhenReady || function (cb) { cb(); })(function () {
        var n = 0;
        items.forEach(function (c) {
          c.style.opacity = "";
          if (c.getBoundingClientRect().top > innerHeight) return;
          c.animate([{ opacity: 0, transform: "translateY(28px)" }, { opacity: 1, transform: "none" }],
            { duration: 640, delay: REVEAL_AFTER + 80 * n++, easing: EASE, fill: "backwards" });
        });
      });
    }
    if (FINE && !REDUCED) {
      items.forEach(function (c) {
        c.addEventListener("pointermove", function (e) {
          var r = c.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          c.style.transform = "perspective(900px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 7).toFixed(2) + "deg) translateY(-4px)";
          c.style.setProperty("--gx", (x + 0.5) * 100 + "%");
        });
        c.addEventListener("pointerleave", function () { c.style.transform = ""; });
      });
    }
  }
  /* ---------- Hero deck: a moment that personalizes itself ---------- */
  function deck() {
    var root = $("#mx-deck");
    if (!root) return;
    var nameEl = $(".mx-name", root), chipName = $(".mx-chip-name", root);
    var ai = $(".mx-chip-ai", root), open = $(".mx-chip-open", root);
    var tilt = $(".mx-tilt", root), sheen = $(".mx-sheen", root);
    var PEOPLE = [["Priya", "Priya Anand"], ["Kenji", "Kenji Watanabe"], ["Amara", "Amara Okafor"]];
    var visible = true, timers = [];

    if (REDUCED) { ai.classList.add("is-on"); open.classList.add("is-on"); return; }

    function later(fn, ms) { timers.push(setTimeout(function () { visible && !document.hidden ? fn() : later(fn, 400); }, ms)); }
    function type(word, done) {
      var i = 0;
      (function step() { nameEl.textContent = word.slice(0, i); if (i++ < word.length) later(step, 85); else done(); })();
    }
    function erase(done) {
      (function step() { var t = nameEl.textContent; if (!t) return done(); nameEl.textContent = t.slice(0, -1); later(step, 45); })();
    }
    function cycle(n) {
      var p = PEOPLE[n % PEOPLE.length];
      chipName.textContent = p[1];
      root.classList.add("is-typing");
      type(p[0], function () {
        root.classList.remove("is-typing");
        later(function () { ai.classList.add("is-on"); }, 300);
        later(function () { open.classList.add("is-on"); }, 1300);
        later(function () {
          ai.classList.remove("is-on"); open.classList.remove("is-on");
          later(function () { root.classList.add("is-typing"); erase(function () { later(function () { cycle(n + 1); }, 250); }); }, 450);
        }, 4400);
      });
    }
    nameEl.textContent = "";
    var start = function () { later(function () { cycle(0); }, 500); };
    (window.MXWhenReady || function (cb) { cb(); })(start);

    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(root);

    if (FINE) {
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      var hero = root.closest(".mx-hero");
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      hero.addEventListener("pointerleave", function () { tx = ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
      function loop() {
        cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
        tilt.style.transform = "rotateY(" + (cx * 10).toFixed(2) + "deg) rotateX(" + (-cy * 7).toFixed(2) + "deg)";
        sheen.style.backgroundPosition = (50 + cx * 120).toFixed(1) + "% 0";
        raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(loop) : 0;
      }
    }
  }

  /* ---------- Editor: live tilt preview, AI rewrite, preview & send ---------- */
  function editor() {
    var art = $("#card-art");
    if (!art) return;
    var col = $(".form-column"), step1 = $("#step1"), step2 = $("#step2");
    var nameIn = $("#in-name"), mailIn = $("#in-email"), msgIn = $("#in-message");

    if (FINE && !REDUCED) {
      art.addEventListener("pointermove", function (e) {
        var r = art.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        art.style.transform = "perspective(1100px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg)";
        art.style.setProperty("--gx", (x + 0.5) * 100 + "%");
      });
      art.addEventListener("pointerleave", function () { art.style.transform = ""; });
    }

    /* AI rewrite streams in rather than snapping. */
    var ai = $("#ai-rewrite");
    var fresh = ai.cloneNode(true);
    ai.parentNode.replaceChild(fresh, ai);
    fresh.addEventListener("click", function () {
      var first = (nameIn.value.trim().split(" ")[0]) || "there";
      var text = "What a joy it's been working alongside you and your team, " + first + ". Here's to celebrating this moment together.";
      if (REDUCED) { msgIn.value = text; msgIn.dispatchEvent(new Event("input")); return; }
      fresh.disabled = true; fresh.classList.add("is-busy");
      var i = 0;
      (function step() {
        msgIn.value = text.slice(0, i); msgIn.dispatchEvent(new Event("input"));
        if (i++ < text.length) setTimeout(step, 14);
        else { fresh.disabled = false; fresh.classList.remove("is-busy"); }
      })();
    });

    function fieldError(input, msg) {
      var g = input.closest(".form-group"), e = $(".mx-err", g);
      if (!msg) { if (e) e.remove(); input.removeAttribute("aria-invalid"); return true; }
      if (!e) { e = document.createElement("p"); e.className = "mx-err"; e.id = input.id + "-err"; g.appendChild(e); }
      e.textContent = msg; input.setAttribute("aria-invalid", "true"); input.setAttribute("aria-describedby", e.id);
      return false;
    }
    function valid() {
      var ok = fieldError(nameIn, nameIn.value.trim() ? "" : "Add who this moment is for.");
      var v = mailIn.value.trim();
      var okMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^\+?[\d\s()-]{7,}$/.test(v);
      ok = fieldError(mailIn, okMail ? "" : "Enter an email address or phone number, like priya@company.com.") && ok;
      if (!ok) $("[aria-invalid]", col).focus();
      return ok;
    }
    [nameIn, mailIn].forEach(function (i) { i.addEventListener("input", function () { if (i.hasAttribute("aria-invalid")) fieldError(i, ""); }); });

    var panel = document.createElement("div");
    panel.className = "mx-send";
    panel.hidden = true;
    panel.innerHTML =
      '<div class="mx-send-main"><h2>Preview &amp; send</h2>' +
      '<dl class="mx-sum"><div><dt>To</dt><dd><b id="sum-name"></b><span id="sum-mail"></span></dd></div>' +
      '<div><dt>Message</dt><dd id="sum-msg"></dd></div></dl>' +
      '<fieldset class="mx-when"><legend>When</legend>' +
      '<label><input type="radio" name="mx-when" value="now" checked /> Send now</label>' +
      '<label><input type="radio" name="mx-when" value="later" /> Tuesday, 10:00 AM in their time zone</label></fieldset>' +
      '<div class="form-actions"><button class="btn-primary" id="mx-send-btn" type="button">Send moment</button>' +
      '<button class="btn-secondary" id="mx-back-btn" type="button">Back to edit</button></div></div>' +
      '<div class="mx-sent" hidden><span class="mx-sent-ic">' + icon("check") + '</span><h2 id="mx-sent-h" tabindex="-1"></h2><p id="mx-sent-p"></p>' +
      '<div class="form-actions"><a class="btn-primary" href="index.html">Send another moment</a><a class="btn-secondary" href="dashboard.html">View dashboard</a></div></div>';
    col.appendChild(panel);

    function setStep(n) {
      step1.className = "step " + (n === 1 ? "on" : "off");
      step2.className = "step " + (n === 2 ? "on" : "off");
      col.classList.toggle("is-send", n === 2);
      panel.hidden = n !== 2;
    }
    function toPreview() {
      if (!valid()) return;
      $("#sum-name").textContent = nameIn.value.trim();
      $("#sum-mail").textContent = mailIn.value.trim();
      $("#sum-msg").textContent = msgIn.value.trim() || "No personal message";
      $(".mx-send-main", panel).hidden = false;
      $(".mx-sent", panel).hidden = true;
      setStep(2);
      $("h2", panel).setAttribute("tabindex", "-1");
      $("h2", panel).focus({ preventScroll: true });
    }
    [["#next-btn", toPreview]].forEach(function (p) {
      var b = $(p[0]), c = b.cloneNode(true);
      b.parentNode.replaceChild(c, b);
      c.addEventListener("click", p[1]);
    });
    var s2 = step2.cloneNode(true); step2.parentNode.replaceChild(s2, step2); step2 = s2;
    step2.setAttribute("role", "button"); step2.tabIndex = 0;
    step2.addEventListener("click", toPreview);
    step1.setAttribute("role", "button"); step1.tabIndex = 0;
    step1.addEventListener("click", function () { setStep(1); });
    $("#mx-back-btn", panel).addEventListener("click", function () { setStep(1); nameIn.focus(); });
    $("#save-btn").addEventListener("click", function () { toast("Draft saved. You'll find it under Customer Moments."); });

    $("#mx-send-btn", panel).addEventListener("click", function () {
      var btn = this, first = nameIn.value.trim().split(" ")[0];
      var later = $('input[name="mx-when"]:checked', panel).value === "later";
      btn.disabled = true;
      function done() {
        $(".mx-send-main", panel).hidden = true;
        var sent = $(".mx-sent", panel);
        sent.hidden = false;
        $("#mx-sent-h").textContent = later ? "Scheduled for " + first : "Sent to " + first;
        $("#mx-sent-p").textContent = later ? "It goes out Tuesday at 10:00 AM in their time zone. You can change this from the dashboard." : "We'll let you know when " + first + " opens it.";
        $("#mx-sent-h").focus({ preventScroll: true });
        art.classList.add("is-sent");
        btn.disabled = false;
      }
      if (REDUCED) return done();
      art.style.transform = "";
      art.animate([
        { transform: "none", opacity: 1 },
        { transform: "translateY(-14px) scale(.96) rotate(-2deg)", opacity: 1, offset: 0.3 },
        { transform: "translate(140px,-220px) scale(.35) rotate(10deg)", opacity: 0 }
      ], { duration: 720, easing: "cubic-bezier(.6,0,.4,1)" }).onfinish = function () {
        done();
        art.animate([{ transform: "scale(.94)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 420, easing: EASE });
      };
    });
  }

  /* ---------- Dashboards: numbers count up, charts draw in ---------- */
  function countUps() {
    var els = $$(".kpi-value, .dc-num");
    if (!els.length) return;
    els.forEach(function (el) {
      var raw = el.textContent.trim(), m = raw.match(/^([^\d-]*)(-?[\d,]*\.?\d+)(.*)$/);
      if (!m || REDUCED) return;
      var end = parseFloat(m[2].replace(/,/g, "")), dec = (m[2].split(".")[1] || "").length, comma = m[2].indexOf(",") > -1;
      var t0 = null, dur = 1100;
      el.style.fontVariantNumeric = "tabular-nums";
      function fmt(v) { var s = v.toFixed(dec); return comma ? Number(s).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) : s; }
      function frame(t) {
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
        el.textContent = m[1] + fmt(end * e) + m[3];
        if (k < 1) requestAnimationFrame(frame); else el.textContent = raw;
      }
      el.textContent = m[1] + fmt(0) + m[3];
      requestAnimationFrame(frame);
    });
  }
  function charts() {
    if (REDUCED) return;
    $$("svg polyline").forEach(function (pl) {
      if (!pl.getTotalLength) return;
      var len = pl.getTotalLength();
      pl.style.strokeDasharray = len; pl.style.strokeDashoffset = len;
      pl.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1300, easing: EASE, delay: 150, fill: "forwards" });
      var dots = $$("circle", pl.ownerSVGElement);
      dots.forEach(function (d, i) { d.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 300 + i * 160, fill: "backwards" }); });
    });
    $$(".donut").forEach(function (d) { d.classList.add("mx-sweep"); });
  }

  /* ---------- First-visit preloader (gallery only, not in preview frames) ---------- */
  /* ---------- Page entrance: preloader over the content, then a bottom-to-top reveal ---------- */
  var LOADER_TEXT = {
    index: "Gathering your moments", moment: "Preparing your card", dashboard: "Loading your dashboard",
    "team-activity": "Loading team activity", reports: "Loading reports", settings: "Loading settings", help: "Loading help"
  };
  var REVEAL = ".mx-copy > *, .mx-deck, .mx-tools, .editor-title-row, .preview-column, .form-column, .editor-footer," +
    " .dash-header, .stats-row > *, .charts-row > *, .dash-content > :not(.dash-header):not(.stats-row):not(.charts-row)";
  var HOLD = 1000, REVEAL_AFTER = 0;

  function preloader() {
    var q = [], ready = true;
    window.MXWhenReady = function (cb) { ready ? cb() : q.push(cb); };
    var main = $(".main");
    var framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
    if (!main || framed || REDUCED) return;
    ready = false;

    var targets = $$(REVEAL, main);
    targets.forEach(function (t) { t.style.opacity = "0"; });

    var page = (location.pathname.split("/").pop() || "index.html").replace(".html", "") || "index";
    var el = document.createElement("div");
    var r = main.getBoundingClientRect();
    el.className = "mx-loader";
    el.style.left = Math.max(0, r.left) + "px";
    el.style.top = Math.max(0, r.top) + "px";
    el.setAttribute("role", "status");
    el.setAttribute("aria-label", LOADER_TEXT[page] || "Loading");
    el.innerHTML = '<div class="mx-loader-deck" aria-hidden="true">' +
      '<span style="background-image:url(assets/merry-christmas.jpg)"></span>' +
      '<span style="background-image:url(assets/deal-sealed.jpg)"></span>' +
      '<span style="background-image:url(assets/happy-diwali.jpg)"></span></div>' +
      '<p class="mx-loader-t" aria-hidden="true">' + (LOADER_TEXT[page] || "Loading") + "</p>";
    document.body.appendChild(el);

    var t0 = Date.now();
    function hide() {
      if (el.classList.contains("is-out")) return;
      el.classList.add("is-out");
      REVEAL_AFTER = 120;
      var n = 0;
      targets.forEach(function (t) {
        t.style.opacity = "";
        if (t.getBoundingClientRect().top > innerHeight) return;
        t.animate([{ opacity: 0, transform: "translateY(32px)" }, { opacity: 1, transform: "none" }],
          { duration: 680, delay: REVEAL_AFTER + 90 * n++, easing: EASE, fill: "backwards" });
      });
      REVEAL_AFTER += 90 * n;
      ready = true; q.splice(0).forEach(function (cb) { cb(); });
      setTimeout(function () { el.remove(); }, 500);
    }
    function onLoad() { setTimeout(hide, Math.max(0, HOLD - (Date.now() - t0))); }
    document.readyState === "complete" ? onLoad() : window.addEventListener("load", onLoad);
    setTimeout(hide, 3000);
  }

  /* ---------- Hero field: the Email Gen shape-shifting gradient, in Customer Moments colours ---------- */
  var FIELD_FRAG = [
    "precision mediump float;",
    "uniform vec2 r;uniform float t;uniform vec2 f;uniform vec2 m;",
    "float H(vec2 p){",
    " vec2 q=p*1.35;",
    " q+=.42*vec2(sin(q.y*1.3+t*.32),cos(q.x*1.1-t*.27));",
    " q+=.28*vec2(sin(q.y*2.2-t*.21+1.7),cos(q.x*1.9+t*.24+.6));",
    " return sin(q.x*1.15+t*.17)*cos(q.y*1.35-t*.13)+.35*sin(length(q)*2.1-t*.4);",
    "}",
    "void main(){",
    " vec2 uv=gl_FragCoord.xy/r;",
    " vec2 p=(gl_FragCoord.xy-.5*r)/min(r.x,r.y)*1.6+m*.25;",
    " float h=H(p);",
    " vec2 e=vec2(.004,0.);",
    " vec3 n=normalize(vec3(H(p-e.xy)-H(p+e.xy),H(p-e.yx)-H(p+e.yx),.035));",
    " vec3 L=normalize(vec3(-.45+m.x*.4,.55+m.y*.4,.75));",
    " float dif=clamp(dot(n,L),0.,1.);",
    " float spec=pow(clamp(dot(reflect(-L,n),vec3(0,0,1)),0.,1.),28.);",
    /* brand green, teal, mustard, Oracle red */
    " vec3 green=vec3(.22,.467,.325),teal=vec3(.16,.56,.63),gold=vec3(.93,.71,.18),red=vec3(.78,.275,.204);",
    " float k=h*.5+.5;",
    " vec3 c=mix(green,teal,smoothstep(.0,.45,k));",
    " c=mix(c,gold,smoothstep(.4,.8,k+.15*sin(p.x*.8+t*.1)));",
    " c=mix(c,red,smoothstep(.78,1.,k));",
    " c=mix(c,vec3(1.),.66)*(.84+.2*dif)+spec*.22;",
    " vec2 d=(uv-f)*vec2(r.x/r.y,1.);",
    " float a=(.14+.5*exp(-dot(d,d)*1.4))*1.1;",
    " a*=smoothstep(0.,.32,uv.y);",
    " a=clamp(a*.9+(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)/255.,0.,1.);",
    " gl_FragColor=vec4(c*a,a);",
    "}"
  ].join("\n");

  function field(host, focusAt, heightOf) {
    var cv = document.createElement("canvas");
    cv.className = "mx-field";
    cv.setAttribute("aria-hidden", "true");
    var gl = cv.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: "low-power" });
    if (!gl) return;
    function sh(type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FIELD_FRAG));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    var U = { r: gl.getUniformLocation(pr, "r"), t: gl.getUniformLocation(pr, "t"), f: gl.getUniformLocation(pr, "f"), m: gl.getUniformLocation(pr, "m") };
    host.insertBefore(cv, host.firstChild);
    host.classList.add("has-field");

    var scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;
    var focus = [0.7, 0.5], mouse = [0, 0], target = [0, 0];
    var visible = true, raf = 0, t0 = performance.now(), tOffset = 14;
    function size() {
      cv.style.height = heightOf() + "px";
      var w = cv.clientWidth, h = cv.clientHeight;
      cv.width = Math.max(1, Math.round(w * scale));
      cv.height = Math.max(1, Math.round(h * scale));
      gl.viewport(0, 0, cv.width, cv.height);
      var a = cv.getBoundingClientRect(), b = focusAt(a);
      focus = [(b[0] - a.left) / a.width, 1 - (b[1] - a.top) / a.height];
      if (REDUCED) draw(tOffset);
    }
    function draw(t) {
      gl.uniform2f(U.r, cv.width, cv.height);
      gl.uniform1f(U.t, t);
      gl.uniform2f(U.f, focus[0], focus[1]);
      gl.uniform2f(U.m, mouse[0], mouse[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function loop(now) {
      mouse[0] += (target[0] - mouse[0]) * 0.04;
      mouse[1] += (target[1] - mouse[1]) * 0.04;
      draw(tOffset + (now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    }
    function run() { if (!raf && visible && !document.hidden && !REDUCED) raf = requestAnimationFrame(loop); }
    function pause() { cancelAnimationFrame(raf); raf = 0; }
    new ResizeObserver(size).observe(host);
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; visible ? run() : pause(); }).observe(cv);
    document.addEventListener("visibilitychange", function () { document.hidden ? pause() : run(); });
    if (FINE && !REDUCED) {
      addEventListener("pointermove", function (e) {
        var a = cv.getBoundingClientRect();
        target = [(e.clientX - a.left) / a.width - 0.5, 0.5 - (e.clientY - a.top) / a.height];
      }, { passive: true });
    }
    size();
    REDUCED ? draw(tOffset) : run();
    (window.MXWhenReady || function (cb) { cb(); })(function () { cv.classList.add("is-on"); });
  }

  /* The field replaces the hero background layer: gallery around the deck, other pages behind the header. */
  function heroFields() {
    var bg = $(".moments-bg"), hero = $(".mx-hero");
    if (bg && hero) {
      field(bg, function () {
        var d = $(".mx-deck").getBoundingClientRect();
        return [d.left + d.width / 2, d.top + d.height / 2];
      }, function () { return hero.offsetHeight + 120; });
      return;
    }
    var host = $(".page-bg") || $(".editor-content");
    if (host) {
      field(host, function (a) { return [a.left + a.width * 0.8, a.top + 40]; }, function () { return 460; });
    }
  }

  window.MX = { cards: cards, toast: toast };
  preloader();

  function init() {
    fillIcons(document);
    soonTags();
    deck();
    editor();
    window.MXWhenReady(function () { countUps(); charts(); });
    heroFields();
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
