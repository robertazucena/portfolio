/* Home hero: the brief types itself, the email composes module by module,
   over a WebGL shape-shifting gradient. Mounted by the Home view in script.js. */
(function () {
  "use strict";
  var REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = matchMedia("(hover:hover) and (pointer:fine)").matches;

  var BRIEF = "A warm thank-you to OCI customers celebrating our Q3 win, with a link to the full customer story";
  var BODY = "We're thrilled to share a milestone made possible by your trust. Together we accelerated cloud adoption, streamlined enterprise workloads and unlocked measurable performance gains across the quarter.";

  var ICON = {
    check: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    clip: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
    tone: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>',
    replay: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>'
  };

  var STEPS = [
    ["Read the brief and data context", "0.4s"],
    ["Picked approved header and hero modules", "0.9s"],
    ["Writing body copy in a warm tone", "1.6s"],
    ["Added the call to action and predicted send time", "2.1s"]
  ];

  function markup() {
    return (
      '<canvas class="compose-bg" aria-hidden="true"></canvas>' +
      '<div class="compose-inner">' +
      '<div class="compose-copy">' +
      '<h1>Describe the email. <span class="accent">Watch it build itself.</span></h1>' +
      '<p class="compose-lede">Every module is drawn from approved Oracle components, so what the AI writes is on brand before you touch it.</p>' +
      '<div class="prompt-box compose-prompt">' +
      '<div class="prompt-top"><label class="prompt-label" for="composeBrief">Your brief</label><span class="compose-status" aria-live="polite"></span></div>' +
      '<textarea id="composeBrief" rows="3" placeholder="Describe the email you want to write"></textarea>' +
      '<div class="prompt-foot">' +
      '<button class="btn-soft is-set" type="button">' + ICON.clip + " Data: Q3 accounts</button>" +
      '<button class="btn-soft is-set" type="button">' + ICON.tone + " Tone: Warm</button>" +
      '<span class="spacer"></span><button class="btn btn-primary compose-go" type="button">Generate</button>' +
      "</div></div>" +
      '<ol class="compose-steps">' +
      STEPS.map(function (s) {
        return '<li><span class="compose-tick">' + ICON.check + "</span>" + s[0] + "<small>" + s[1] + "</small></li>";
      }).join("") +
      "</ol></div>" +
      '<div class="compose-mail" aria-label="Email preview">' +
      '<div class="compose-meta" data-at="1"><div><span>Subject</span>Celebrating a big win, together</div><div><span>To</span>Q3 OCI accounts · 2,418 recipients</div></div>' +
      '<div class="compose-hero" data-at="2"><img src="images/win.jpg" alt="A team working together on laptops" /><span class="compose-pin">Approved module · Hero</span></div>' +
      '<div class="compose-body">' +
      '<h2 data-at="2">We couldn\'t have done it without you.</h2>' +
      '<p data-at="3">Dear Partner,</p>' +
      '<p class="compose-typed" data-at="3"></p>' +
      '<div class="compose-sk" aria-hidden="true"><i></i><i></i></div>' +
      '<div class="compose-cta-row"><a href="#/editor" class="compose-cta" tabindex="-1">Read the full story →</a><span class="compose-pin" data-at="3">Tone · Warm</span></div>' +
      "</div>" +
      '<div class="compose-stats" data-at="4">' +
      '<div>Predicted open<b data-n="41.2" data-u="%">…</b></div>' +
      '<div>Predicted click<b data-n="12.8" data-u="%">…</b></div>' +
      "<div>Best send time<b data-t=\"Tue 10:00\">…</b></div>" +
      "</div></div></div>"
    );
  }

  /* ---------- Composition timeline ---------- */
  function Timeline(root) {
    var self = this;
    var timers = [];
    var brief = root.querySelector("textarea");
    var status = root.querySelector(".compose-status");
    var steps = root.querySelectorAll(".compose-steps li");
    var typed = root.querySelector(".compose-typed");
    var go = root.querySelector(".compose-go");
    var mail = root.querySelector(".compose-mail");
    var userEdited = false;

    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function clear() { timers.forEach(clearTimeout); timers = []; }
    function alive() { return root.isConnected; }

    function setStage(n) {
      mail.querySelectorAll("[data-at]").forEach(function (el) {
        el.classList.toggle("is-in", +el.getAttribute("data-at") <= n);
      });
      steps.forEach(function (li, i) {
        li.classList.toggle("is-done", i < n);
        li.classList.toggle("is-now", i === n && n < steps.length);
      });
      mail.classList.toggle("is-done", n >= 4);
      status.textContent = n >= 4 ? "Ready to send" : n > 0 ? "Composing" : "";
      root.classList.toggle("is-composing", n > 0 && n < 4);
    }

    function stats(animate) {
      mail.querySelectorAll(".compose-stats b").forEach(function (b) {
        if (b.dataset.t) { b.textContent = b.dataset.t; return; }
        var end = +b.dataset.n, u = b.dataset.u, t0 = performance.now();
        if (!animate) { b.textContent = end.toFixed(1) + u; return; }
        (function tick(now) {
          if (!alive()) return;
          var k = Math.min(1, (now - t0) / 900), e = 1 - Math.pow(1 - k, 4);
          b.textContent = (end * e).toFixed(1) + u;
          if (k < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }

    function typeInto(write, text, speed, done) {
      var i = 0;
      (function next() {
        if (!alive()) return;
        i += 1 + (Math.random() < 0.3 ? 1 : 0);
        write(text.slice(0, i));
        if (i < text.length) later(next, speed + Math.random() * speed);
        else done && done();
      })();
    }

    function finish() {
      setStage(4);
      typed.textContent = BODY;
      stats(false);
      go.innerHTML = ICON.replay + " Generate again";
    }

    this.play = function (withBrief) {
      clear();
      typed.textContent = "";
      mail.querySelectorAll(".compose-stats b").forEach(function (b) { b.textContent = "…"; });
      if (REDUCED) { if (!brief.value) brief.value = BRIEF; finish(); return; }
      go.textContent = "Generate";
      setStage(0);
      var start = function () {
        setStage(1);
        later(function () { setStage(2); }, 650);
        later(function () {
          setStage(3);
          typeInto(function (s) { typed.textContent = s; }, BODY, 14, function () {
            later(function () { setStage(4); stats(true); go.innerHTML = ICON.replay + " Generate again"; }, 350);
          });
        }, 1500);
      };
      if (withBrief) {
        brief.value = "";
        later(function () {
          typeInto(function (s) { if (!userEdited) brief.value = s; }, BRIEF, 22, function () { later(start, 450); });
        }, 500);
      } else start();
    };

    brief.addEventListener("input", function () { userEdited = true; });
    brief.addEventListener("focus", function () {
      if (!userEdited && brief.value.length < BRIEF.length) { userEdited = true; brief.value = BRIEF; }
    });
    go.addEventListener("click", function () { self.play(false); });
    root.querySelectorAll(".btn-soft.is-set").forEach(function (b) {
      b.setAttribute("aria-pressed", "true");
      b.addEventListener("click", function () { b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); });
    });
    this.stop = clear;
  }

  /* ---------- Shape-shifting gradient (WebGL) ---------- */
  var FRAG = [
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
    " vec3 blue=vec3(.145,.388,.922),violet=vec3(.486,.227,.929),orange=vec3(1.,.353,.235),red=vec3(.78,.275,.204);",
    " float k=h*.5+.5;",
    " vec3 c=mix(blue,violet,smoothstep(.0,.45,k));",
    " c=mix(c,orange,smoothstep(.4,.8,k+.15*sin(p.x*.8+t*.1)));",
    " c=mix(c,red,smoothstep(.78,1.,k));",
    " c=mix(c,vec3(1.),.66)*(.84+.2*dif)+spec*.22;",
    " vec2 d=(uv-f)*vec2(r.x/r.y,1.);",
    " float a=.14+.5*exp(-dot(d,d)*1.4);",
    " a*=smoothstep(0.,.32,uv.y);",
    " a=clamp(a*.9+(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)/255.,0.,1.);",
    " gl_FragColor=vec4(c*a,a);",
    "}"
  ].join("\n");

  function Field(canvas, focusEl) {
    var gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: "low-power" });
    if (!gl) { canvas.parentNode.classList.add("no-gl"); return; }
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { canvas.parentNode.classList.add("no-gl"); return; }
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    var U = { r: gl.getUniformLocation(pr, "r"), t: gl.getUniformLocation(pr, "t"), f: gl.getUniformLocation(pr, "f"), m: gl.getUniformLocation(pr, "m") };

    var scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;
    var focus = [0.7, 0.5], mouse = [0, 0], target = [0, 0];
    var visible = true, raf = 0, t0 = performance.now(), tOffset = 14;

    function size() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      var a = canvas.getBoundingClientRect(), b = focusEl.getBoundingClientRect();
      focus = [(b.left + b.width / 2 - a.left) / a.width, 1 - (b.top + b.height * 0.45 - a.top) / a.height];
      if (REDUCED) draw(tOffset);
    }
    function draw(t) {
      gl.uniform2f(U.r, canvas.width, canvas.height);
      gl.uniform1f(U.t, t);
      gl.uniform2f(U.f, focus[0], focus[1]);
      gl.uniform2f(U.m, mouse[0], mouse[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function loop(now) {
      if (!canvas.isConnected) return stop();
      mouse[0] += (target[0] - mouse[0]) * 0.04;
      mouse[1] += (target[1] - mouse[1]) * 0.04;
      draw(tOffset + (now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    }
    function run() { if (!raf && visible && !document.hidden && !REDUCED) raf = requestAnimationFrame(loop); }
    function pause() { cancelAnimationFrame(raf); raf = 0; }
    function onVis() { document.hidden ? pause() : run(); }
    function onMove(e) {
      var a = canvas.getBoundingClientRect();
      target = [(e.clientX - a.left) / a.width - 0.5, 0.5 - (e.clientY - a.top) / a.height];
    }
    var ro = new ResizeObserver(size);
    var io = new IntersectionObserver(function (en) { visible = en[0].isIntersecting; visible ? run() : pause(); });
    function stop() {
      pause(); ro.disconnect(); io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
    }
    ro.observe(canvas);
    io.observe(canvas);
    document.addEventListener("visibilitychange", onVis);
    if (FINE && !REDUCED) window.addEventListener("pointermove", onMove, { passive: true });
    size();
    REDUCED ? draw(tOffset) : run();
  }

  /* ---------- Story sections below the templates ---------- */
  var DAYS = [["Mon", 34], ["Tue", 46], ["Wed", 41], ["Thu", 38], ["Fri", 29], ["Sat", 17], ["Sun", 21]];

  function storyMarkup() {
    var modules = [["Header", "&lt;header&gt;"], ["Hero", "&lt;img&gt;"], ["Body", "&lt;p&gt;"], ["Call to action", "&lt;a&gt;"], ["Footer", "&lt;footer&gt;"]];
    var people = [["Priya", "Northwind Logistics", "your 38% faster batch runs"], ["Daniel", "Kestrel Bank", "your move to Autonomous Database"], ["Mei", "Halden Retail", "your peak-season uptime"]];
    function row(cls, h, p, link, vis) {
      return '<div class="story-row ' + cls + '"><div class="story-copy"><h2>' + h + "</h2><p>" + p + "</p>" + (link || "") + '</div><div class="story-vis" aria-hidden="true">' + vis + "</div></div>";
    }
    return (
      '<section class="story" aria-label="How it works">' +
      row("is-brief",
        "Write the brief, not the email.",
        "Describe the goal, the audience and the tone in a sentence. The AI turns it into structured, send-ready HTML you can still edit line by line.",
        '<a class="story-link" href="#/editor">Open the editor →</a>',
        '<div class="vis-card vis-brief"><span class="vis-label">Brief</span>A warm thank-you to OCI customers celebrating our Q3 win</div>' +
        '<div class="vis-modules">' + modules.map(function (m, i) { return '<div style="--i:' + i + '"><span>' + m[0] + "</span><code>" + m[1] + "</code></div>"; }).join("") + "</div>") +
      row("is-brand",
        "On brand by default.",
        "Every email is composed from approved modules, brand colours and tone settings, so reviews focus on the message instead of the margins.",
        "",
        '<div class="vis-card vis-kit">' +
        '<span class="vis-label">Brand kit</span>' +
        '<div class="vis-swatches">' + [["#C74634", "Oracle red"], ["#FF5A3C", "Action"], ["#1A1A1A", "Ink"], ["#F8FAFC", "Paper"]].map(function (c) { return '<div><i style="background:' + c[0] + '"></i>' + c[1] + "</div>"; }).join("") + "</div>" +
        '<span class="vis-label">Tone</span><div class="vis-seg"><span class="is-on">Warm</span><span>Formal</span><span>Upbeat</span></div>' +
        '<span class="vis-label">Approved modules</span><div class="vis-approved">' + ["Header", "Hero", "Quote", "Call to action", "Footer"].map(function (m) { return "<span>" + ICON.check + m + "</span>"; }).join("") + "</div>" +
        "</div>") +
      row("is-personal",
        "Personal at every address.",
        "Attach data context and each recipient gets their own greeting, account details and next step, from one brief.",
        "",
        '<div class="vis-stack">' + people.map(function (p, i) {
          return '<div class="vis-mini" style="--i:' + i + '"><span class="vis-to">To ' + p[1] + "</span><p>Hi <mark>" + p[0] + "</mark>, thank you for helping us reach this quarter's milestone, including <mark>" + p[2] + "</mark>.</p></div>";
        }).join("") + "</div>") +
      row("is-timing",
        "Send at the right moment, then learn.",
        "See a suggested send time and predicted open and click rates before launch, then follow delivery and engagement live once it goes out.",
        '<a class="story-link" href="#/analytics">See analytics →</a>',
        '<div class="vis-card vis-week"><div class="vis-week-head"><span class="vis-label">Predicted opens by day</span><b>Best: Tue 10:00</b></div>' +
        '<div class="vis-bars">' + DAYS.map(function (d, i) {
          return '<div class="' + (i === 1 ? "is-best" : "") + '"><i style="--h:' + d[1] / 46 + ";--i:" + i + '"></i><span>' + d[0] + "</span></div>";
        }).join("") + "</div>" +
        '<div class="vis-week-foot"><div>Predicted open<b>41.2%</b></div><div>Predicted click<b>12.8%</b></div></div></div>') +
      "</section>" +
      '<section class="dev-band"><div class="dev-inner">' +
      '<div class="dev-copy"><h2>Generate from your own stack.</h2><p>One endpoint turns a prompt into on-brand HTML. Dispatch, schedule and track campaigns through the same API.</p><a class="story-link" href="#/docs">Read the API docs →</a></div>' +
      '<pre class="dev-code" tabindex="0" aria-label="Example API request"><span class="c-m">POST</span> /v1/emails/generate\n\ncurl -X POST https://api.oracle-emailgen.example/v1/emails/generate \\\n  -H <span class="c-s">"Authorization: Bearer $TOKEN"</span> \\\n  -d <span class="c-s">\'{"prompt":"Q3 cloud success newsletter",\n       "tone":"warm",\n       "context":"q3_accounts"}\'</span></pre>' +
      "</div></section>" +
      '<section class="close-band"><h2>Your next campaign starts with a sentence.</h2>' +
      '<div class="close-actions"><button type="button" class="btn close-primary">Write a brief</button><a href="#/templates" class="btn close-secondary">View all templates</a></div></section>'
    );
  }

  function story(parent) {
    var wrap = document.createElement("div");
    wrap.innerHTML = storyMarkup();
    var nodes = Array.prototype.slice.call(wrap.children);
    nodes.forEach(function (n) { parent.appendChild(n); });
    parent.querySelector(".close-primary").addEventListener("click", function () {
      var brief = document.getElementById("composeBrief");
      window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
      if (brief) setTimeout(function () { brief.focus({ preventScroll: true }); brief.select(); }, REDUCED ? 0 : 450);
    });
    var rows = parent.querySelectorAll(".story-row, .dev-band, .close-band");
    if (REDUCED || !("IntersectionObserver" in window)) { rows.forEach(function (r) { r.classList.add("is-seen"); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-seen"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -15% 0px" });
    rows.forEach(function (r) { r.classList.add("will-reveal"); io.observe(r); });
  }

  /* ---------- Editor: AI refine rewrites the preview in place ---------- */
  var VARIANTS = {
    formal: {
      label: "Make it formal",
      h: "Thank you for your partnership this quarter.",
      g: "Dear Valued Partner,",
      b: "We are pleased to report a milestone achieved through your continued trust and collaboration. Together, we have accelerated cloud adoption, streamlined enterprise workloads and delivered measurable performance gains this quarter.",
      c: "We appreciate your partnership and look forward to our continued work together."
    },
    shorter: {
      label: "Shorter",
      b: "Your trust made this quarter's milestone possible: faster cloud adoption, leaner workloads and measurable performance gains.",
      c: "Thank you for being part of it."
    },
    promo: {
      label: "Add promo code",
      c: "Thank you for being an essential part of this journey. As a thank-you, use code <strong>Q3WIN15</strong> for 15% off your next OCI renewal."
    },
    warm: {
      label: "Your request",
      h: "We couldn't have done this without you.",
      b: "This quarter's milestone is yours as much as ours. Your trust and partnership helped us speed up cloud adoption, simplify enterprise workloads and deliver real performance gains.",
      c: "Thank you for building this with us. We can't wait to see what we achieve next."
    }
  };

  function editor() {
    var card = document.querySelector(".preview-card");
    if (!card || card.dataset.ai) return;
    card.dataset.ai = "1";
    var content = card.querySelector(".preview-content");
    var ps = content.querySelectorAll("p");
    var el = { h: content.querySelector("h2"), g: ps[0], b: ps[1], c: ps[2] };
    var original = {};
    Object.keys(el).forEach(function (k) { original[k] = el[k].innerHTML; });
    var label = card.querySelector(".ai-refine-label");
    label.setAttribute("aria-live", "polite");
    var input = card.querySelector(".ai-refine-input");
    input.setAttribute("aria-label", "Ask AI to refine or rewrite this email");
    var pillWrap = card.querySelector(".ai-refine-pills");
    var pills = pillWrap.querySelectorAll(".ai-pill");
    ["formal", "shorter", "promo"].forEach(function (k, i) { if (pills[i]) pills[i].dataset.v = k; });
    var undo = document.createElement("button");
    undo.type = "button";
    undo.className = "ai-pill ai-undo";
    undo.hidden = true;
    undo.innerHTML = ICON.replay + " Undo";
    pillWrap.appendChild(undo);
    var busy = false, timers = [];

    function stream(node, html, done) {
      var text = html.replace(/<[^>]+>/g, ""), i = 0;
      node.classList.add("ai-writing");
      (function next() {
        if (!card.isConnected) return;
        i += 3;
        node.textContent = text.slice(0, i);
        if (i < text.length) timers.push(setTimeout(next, 16));
        else { node.innerHTML = html; node.classList.remove("ai-writing"); done(); }
      })();
    }

    function apply(target, name) {
      if (busy) return;
      busy = true;
      var keys = Object.keys(el).filter(function (k) { return el[k].innerHTML !== target[k]; });
      pills.forEach(function (p) { p.setAttribute("aria-pressed", String(p.textContent === name)); });
      card.classList.add("is-rewriting");
      label.innerHTML = '<span class="ai-live"></span>Rewriting · ' + name;
      Object.keys(el).forEach(function (k) { el[k].classList.remove("ai-fresh"); });
      var finish = function () {
        busy = false;
        card.classList.remove("is-rewriting");
        keys.forEach(function (k) { void el[k].offsetWidth; el[k].classList.add("ai-fresh"); });
        var reverted = target === original;
        label.textContent = reverted ? "Restored the original draft." : "Rewritten · " + name + ". Changes are highlighted.";
        undo.hidden = reverted;
        if (reverted) pills.forEach(function (p) { p.setAttribute("aria-pressed", "false"); });
      };
      if (REDUCED) { keys.forEach(function (k) { el[k].innerHTML = target[k]; }); finish(); return; }
      (function run(i) {
        if (i >= keys.length) return finish();
        stream(el[keys[i]], target[keys[i]], function () { run(i + 1); });
      })(0);
    }

    function variant(key) {
      var v = VARIANTS[key], t = {};
      Object.keys(el).forEach(function (k) { t[k] = v[k] || original[k]; });
      return t;
    }

    pills.forEach(function (p) {
      p.setAttribute("aria-pressed", "false");
      p.addEventListener("click", function () { apply(variant(p.dataset.v), p.textContent); });
    });
    undo.addEventListener("click", function () { apply(original, "Original"); });
    input.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" || !input.value.trim()) return;
      var q = input.value.toLowerCase();
      var key = /formal|professional/.test(q) ? "formal" : /short|brief|concise/.test(q) ? "shorter" : /promo|code|discount|offer/.test(q) ? "promo" : "warm";
      apply(variant(key), key === "warm" ? "“" + input.value.trim() + "”" : VARIANTS[key].label);
      input.value = "";
    });
  }

  /* ---------- Analytics: the data draws itself in ---------- */
  function countUp(node) {
    var raw = node.textContent.trim(), m = raw.match(/^([\d,]+(?:\.\d+)?)(%?)$/);
    if (!m) return;
    var end = parseFloat(m[1].replace(/,/g, "")), dec = (m[1].split(".")[1] || "").length, comma = m[1].indexOf(",") > -1, t0 = performance.now();
    (function tick(now) {
      if (!node.isConnected) return;
      var k = Math.min(1, (now - t0) / 1200), v = end * (1 - Math.pow(1 - k, 4));
      var s = v.toFixed(dec);
      if (comma) s = Number(s).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
      node.textContent = k < 1 ? s + m[2] : raw;
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  function drawPath(p, delay, dur) {
    var len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
    p.getBoundingClientRect();
    p.style.transition = "stroke-dashoffset " + dur + "ms cubic-bezier(.16,1,.3,1) " + delay + "ms";
    p.style.strokeDashoffset = "0";
    setTimeout(function () { p.style.strokeDasharray = p.style.strokeDashoffset = p.style.transition = ""; }, delay + dur + 50);
  }

  function fadeIn(nodes, delay, step) {
    nodes.forEach(function (n, i) {
      n.style.opacity = "0";
      n.getBoundingClientRect();
      n.style.transition = "opacity .7s ease-out " + (delay + i * step) + "ms";
      n.style.opacity = "";
    });
  }

  function analytics() {
    var chart = document.getElementById("engagementChart");
    if (!chart || chart.dataset.ai || REDUCED) return;
    chart.dataset.ai = "1";
    chart.querySelectorAll(".series-line").forEach(function (p, i) { drawPath(p, 250 + i * 160, 1700); });
    fadeIn(Array.prototype.slice.call(chart.querySelectorAll(".series-area")), 700, 160);
    fadeIn(Array.prototype.slice.call(chart.querySelectorAll(".series-dot")), 1500, 12);
    document.querySelectorAll(".sparkline path").forEach(function (p) {
      if (p.getAttribute("fill") && p.getAttribute("fill") !== "none") fadeIn([p], 500, 0);
      else drawPath(p, 150, 1100);
    });
    document.querySelectorAll(".stat-value").forEach(countUp);
  }

  function enhance() {
    requestAnimationFrame(function () { editor(); analytics(); });
  }
  window.addEventListener("hashchange", enhance);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", enhance);
  else enhance();

  window.OEGCompose = {
    story: story,
    mount: function (parent) {
      var root = document.createElement("section");
      root.className = "compose";
      root.innerHTML = markup();
      parent.appendChild(root);
      requestAnimationFrame(function () {
        Field(root.querySelector(".compose-bg"), root.querySelector(".compose-mail"));
        new Timeline(root).play(true);
      });
      return root;
    }
  };
})();
