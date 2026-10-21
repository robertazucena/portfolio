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
      '<button class="btn-soft is-set" type="button">' + ICON.clip + " <span><span class=\"chip-pre\">Data: </span>Q3 accounts</span></button>" +
      '<button class="btn-soft is-set" type="button">' + ICON.tone + " <span><span class=\"chip-pre\">Tone: </span>Warm</span></button>" +
      '<span class="spacer"></span><button class="btn btn-primary compose-go" type="button">Generate</button><a href="#/editor" class="btn btn-primary compose-open" hidden>Editor →</a>' +
      "</div></div>" +
      '<ol class="compose-steps">' +
      STEPS.map(function (s) {
        return '<li><span class="compose-tick">' + ICON.check + "</span>" + s[0] + "<small>" + s[1] + "</small></li>";
      }).join("") +
      "</ol></div>" +
      '<div class="compose-mail" aria-label="Email preview">' +
      '<div class="compose-meta" data-at="1"><div><span>Subject</span>Celebrating a big win, together</div><div><span>To</span>Q3 OCI accounts · 2,418 recipients</div></div>' +
      '<div class="compose-hero" data-at="2"><img src="images/win.jpg" alt="A team working together on laptops" /><span class="compose-pin">Approved module · Hero</span><span class="compose-pin compose-pin-tone" data-at="3">Tone · Warm</span></div>' +
      '<div class="compose-body">' +
      '<h2 data-at="2">We couldn\'t have done it without you.</h2>' +
      '<p data-at="3">Dear Partner,</p>' +
      '<p class="compose-typed" data-at="3"></p>' +
      '<div class="compose-sk" aria-hidden="true"><i></i><i></i></div>' +
      '<div class="compose-cta-row"><span class="compose-cta" aria-hidden="true">Read the full story →</span></div>' +
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
    var open = root.querySelector(".compose-open");
    function doneState(on) {
      go.classList.toggle("is-again", on);
      go.classList.toggle("btn-primary", !on);
      if (on) { go.innerHTML = ICON.replay; go.setAttribute("aria-label", "Generate again"); go.title = "Generate again"; }
      else { go.textContent = "Generate"; go.removeAttribute("aria-label"); go.removeAttribute("title"); }
      open.hidden = !on;
    }
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
      doneState(true);
    }

    this.play = function (withBrief) {
      clear();
      typed.textContent = "";
      mail.querySelectorAll(".compose-stats b").forEach(function (b) { b.textContent = "…"; });
      if (REDUCED) { if (!brief.value) brief.value = BRIEF; finish(); return; }
      doneState(false);
      setStage(0);
      var start = function () {
        setStage(1);
        later(function () { setStage(2); }, 650);
        later(function () {
          setStage(3);
          typeInto(function (s) { typed.textContent = s; }, BODY, 14, function () {
            later(function () { setStage(4); stats(true); doneState(true); }, 350);
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
    go.addEventListener("click", function () {
      if (!userEdited && brief.value.length < BRIEF.length) brief.value = BRIEF;
      self.play(false);
    });
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

  /* ---------- Editor content per template (Templates and Home cards open their own) ---------- */
  var EDIT_TPL = {
    win: { title: "Win Story Email", campaign: "Q3 Win Story", category: "Customer Success",
      link: { path: "customers/q3-win-story", img: "images/win.jpg", title: "How OCI customers cut batch times by 38% this quarter", excerpt: "Three customers share how they moved critical workloads to Oracle Cloud Infrastructure, and what changed for their teams." } },
    cloud: { title: "Cloud Momentum Email", campaign: "Cloud Momentum Release", category: "Newsletter", img: "images/cloud.jpg", alt: "Earth at night from orbit",
      subject: "Cloud momentum: what shipped this month", h: "This month on Oracle Cloud.", g: "Hi there,",
      b: "We shipped faster provisioning in six regions, new cost controls in the console and a simpler way to move workloads between tenancies. Here is what changed and what it means for your teams.",
      c: "Reply to this email if you'd like a walkthrough with our cloud engineers.", cta: "Read the release notes",
      formal: { h: "Oracle Cloud release summary for this month.", b: "This month we released faster provisioning in six regions, additional cost controls in the console and improved workload migration between tenancies." },
      short: "Faster provisioning in six regions, new cost controls and easier workload moves between tenancies.",
      link: { path: "cloud/whats-new/cloud-momentum", img: "images/cloud.jpg", title: "What's new on Oracle Cloud", excerpt: "The full release notes for this month's infrastructure, console and migration updates." } },
    welcome: { title: "Welcome Onboard Email", campaign: "Enterprise Welcome", category: "Customer Success", img: "images/welcome.jpg", alt: "Shoes on a welcome mat",
      subject: "Welcome to Oracle Cloud", h: "Welcome aboard. Let's get you set up.", g: "Hi there,",
      b: "Your tenancy is ready. Book a 30-minute kick-off with your customer success lead, and keep the console guides close for your first week.",
      c: "We'll check in once your first workload is live.", cta: "Book your kick-off",
      formal: { h: "Welcome to Oracle Cloud Infrastructure.", b: "Your tenancy has been provisioned. We invite you to schedule a kick-off session with your customer success lead and to review the console guides during your first week." },
      short: "Your tenancy is ready. Book a kick-off and keep the console guides handy.",
      link: { path: "cloud/get-started/kick-off", img: "images/welcome.jpg", title: "Book your Oracle Cloud kick-off", excerpt: "Pick a 30-minute slot with your customer success lead and get your first workload live." } },
    promo: { title: "Summer Promo Email", campaign: "Summer Region Credits", category: "Marketing", img: "images/promo.jpg", alt: "A colourful summer pool scene",
      subject: "Summer credits for your next region", h: "More room to grow this summer.", g: "Hi there,",
      b: "Expand into a new region before the end of August and we'll add credits to your account for the first three months, plus discounted compute on every new tier.",
      c: "The offer applies to every service on your current plan.", cta: "Claim your credits",
      formal: { h: "Summer regional expansion offer.", b: "Customers who expand into an additional region before 31 August will receive account credits for the first three months and discounted compute pricing on new tiers." },
      short: "Add a region by the end of August for three months of credits and cheaper compute.",
      link: { path: "cloud/offers/summer-regions", img: "images/promo.jpg", title: "Summer region credits", excerpt: "Eligibility, credit amounts and how to claim them for new regions this summer." } },
    launch: { title: "Product Launch Email", campaign: "Product Launch Digest", category: "Newsletter", img: "images/launch.jpg", alt: "Engineers reviewing a release at their desks",
      subject: "Release digest: what changed this sprint", h: "Faster tuning, smarter scaling, still hands‑free.", g: "Hi there,",
      b: "This release brings automatic index tuning to every workload, scaling that reacts in seconds and security patches applied with no downtime.",
      c: "Your databases pick up the changes automatically, so there is nothing to do.", cta: "See what's new",
      formal: { h: "Autonomous Database release summary.", b: "This release introduces automatic index tuning for all workloads, faster elastic scaling and zero-downtime security patching." },
      short: "Automatic index tuning, faster scaling and zero-downtime patches.",
      link: { path: "database/autonomous/release-notes", img: "images/launch.jpg", title: "Autonomous Database release notes", excerpt: "Every change in this release, with upgrade notes for administrators." } },
    review: { title: "Enterprise Review Email", campaign: "Quarterly Enterprise Review", category: "Customer Success", img: "images/review.jpg", alt: "An executive team in a briefing",
      subject: "Your quarterly enterprise review", h: "Your quarter on Oracle Cloud, in one page.", g: "Hi there,",
      b: "Ahead of your briefing, here is a summary of resource use, spend against forecast and the performance projections we'll walk through together.",
      c: "Reply with any topics you'd like us to add to the agenda.", cta: "Open the full review",
      formal: { h: "Quarterly enterprise review summary.", b: "In preparation for your briefing, please find a summary of resource utilisation, spend against forecast and performance projections for the coming quarter." },
      short: "Your resource use, spend and projections for the quarter, ahead of the briefing.",
      link: { path: "cloud/reviews/q3", img: "images/review.jpg", title: "Q3 enterprise review", excerpt: "Resource allocation, spend and performance projections for your tenancy." } }
  };
  var TITLE_TO_TPL = { "Win Story Announcement": "win", "Cloud Momentum Release": "cloud", "Welcome Onboard": "welcome", "Summer Promo Offer": "promo", "Product Launch Digest": "launch", "Quarterly Enterprise Review": "review", "Executive Briefing": "review" };
  var editTpl = "win";
  document.addEventListener("click", function (e) {
    var card = e.target.closest && e.target.closest(".tpl-card, .start-card");
    if (card) { var h = card.querySelector("h3"); editTpl = (h && TITLE_TO_TPL[h.textContent.trim()]) || "win"; }
    else if (e.target.closest && e.target.closest("#newDraftBtn")) editTpl = "win";
  }, true);

  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  function fillEditor(page, card, t) {
    var q = function (s, r) { return (r || page).querySelector(s); };
    q(".editor-title-row h1").textContent = t.title;
    var crumb = q(".breadcrumb .current"); if (crumb) crumb.textContent = t.title;
    document.title = t.title + " · Oracle AI Email Gen";
    var camp = q(".config-stack input[type=text]"); if (camp) camp.value = t.campaign;
    var cat = q(".config-stack select");
    if (cat) Array.prototype.forEach.call(cat.options, function (o) { o.selected = o.textContent === t.category; });
    if (!t.subject) return;
    q(".preview-meta .meta-val", card).textContent = t.subject;
    var img = q(".preview-hero img", card); img.src = t.img; img.alt = t.alt;
    var c = q(".preview-content", card), ps = c.querySelectorAll("p");
    c.querySelector("h2").textContent = t.h;
    ps[0].textContent = t.g; ps[1].textContent = t.b; ps[2].textContent = t.c;
    q(".read-btn", card).textContent = t.cta + " →";
  }

  /* Read the full story: a side panel that checks where the button goes */
  function linkPanel(card, t, btn) {
    var url = "https://www.oracle.com/" + t.link.path;
    var utm = { utm_source: "email", utm_medium: "ai-email-gen", utm_campaign: slug(t.campaign) };
    var full = url + "?" + Object.keys(utm).map(function (k) { return k + "=" + utm[k]; }).join("&");
    var wrap = document.createElement("div");
    wrap.className = "link-panel-wrap";
    wrap.innerHTML =
      '<div class="link-panel-scrim"></div>' +
      '<aside class="link-panel" role="dialog" aria-modal="true" aria-labelledby="linkPanelTitle">' +
      '<div class="lp-head"><h2 id="linkPanelTitle">Button destination</h2><button type="button" class="lp-close" aria-label="Close">×</button></div>' +
      '<p class="lp-ok">' + ICON.check + " Link checked. The page loads and the tracking tags are attached.</p>" +
      '<label class="lp-label" for="lpText">Button text</label><input id="lpText" class="lp-input" type="text" />' +
      '<label class="lp-label" for="lpUrl">Destination</label><div class="lp-url"><input id="lpUrl" class="lp-input" type="text" readonly value="' + full + '" /><button type="button" class="btn btn-outline lp-copy">Copy</button></div>' +
      '<span class="lp-label">Tracking tags</span><div class="lp-tags">' + Object.keys(utm).map(function (k) { return "<code>" + k + "=" + utm[k] + "</code>"; }).join("") + "</div>" +
      '<span class="lp-label">Landing page preview</span>' +
      '<div class="lp-page"><img src="' + t.link.img + '" alt="" /><div><span class="lp-host">oracle.com/' + t.link.path + "</span><h3>" + t.link.title + "</h3><p>" + t.link.excerpt + "</p></div></div>" +
      '<div class="lp-foot"><button type="button" class="btn btn-primary lp-done">Done</button></div>' +
      "</aside>";
    document.body.appendChild(wrap);
    var panel = wrap.querySelector(".link-panel"), text = wrap.querySelector("#lpText");
    text.value = btn.textContent.replace(/\s*→\s*$/, "");
    text.addEventListener("input", function () { btn.textContent = (text.value.trim() || "Read more") + " →"; });
    wrap.querySelector(".lp-copy").addEventListener("click", function (e) {
      var b = e.currentTarget;
      try { navigator.clipboard.writeText(full); } catch (err) {}
      b.textContent = "Copied";
      setTimeout(function () { b.textContent = "Copy"; }, 1600);
    });
    function close() {
      document.removeEventListener("keydown", onKey);
      wrap.classList.remove("is-open");
      setTimeout(function () { wrap.remove(); }, REDUCED ? 0 : 220);
      btn.focus();
    }
    function onKey(e) {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab") return;
      var f = panel.querySelectorAll("button, input"), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    wrap.querySelector(".lp-close").addEventListener("click", close);
    wrap.querySelector(".lp-done").addEventListener("click", close);
    wrap.querySelector(".link-panel-scrim").addEventListener("click", close);
    window.addEventListener("hashchange", function h() { window.removeEventListener("hashchange", h); if (wrap.isConnected) wrap.remove(); });
    requestAnimationFrame(function () { wrap.classList.add("is-open"); text.focus(); });
  }

  /* Edit structure: reorder and show or hide the email's modules */
  function structure(card, tabs) {
    var content = card.querySelector(".preview-content");
    var ps = content.querySelectorAll("p");
    var mods = [
      { name: "Hero image", el: card.querySelector(".preview-hero"), fixed: true },
      { name: "Headline", el: content.querySelector("h2") },
      { name: "Greeting", el: ps[0] },
      { name: "Body", el: ps[1] },
      { name: "Closing", el: ps[2] },
      { name: "Button", el: content.querySelector(".read-btn") }
    ];
    var initial = mods.slice();
    var view = document.createElement("div");
    view.className = "structure-view";
    view.id = "structurePanel";
    view.setAttribute("role", "tabpanel");
    view.hidden = true;
    card.querySelector(".preview-meta").after(view);
    var live = [card.querySelector(".preview-hero"), content, card.querySelector(".ai-refine")];

    function snippet(m) {
      if (m.el.tagName === "DIV") return m.el.querySelector("img").alt;
      var s = m.el.textContent.trim();
      return s.length > 64 ? s.slice(0, 62) + "…" : s;
    }
    function render(focusSel) {
      var movable = mods.filter(function (m) { return !m.fixed; });
      view.innerHTML =
        '<div class="sv-head"><p>Approved modules only. Move them or hide them, then check the result in Live Preview.</p><button type="button" class="sv-reset">Reset</button></div>' +
        '<ol class="sv-list">' + mods.map(function (m, i) {
          var j = movable.indexOf(m);
          return '<li class="' + (m.el.hidden ? "is-off" : "") + '"><div class="sv-text"><b>' + m.name + "</b><span>" + snippet(m) + "</span></div>" +
            (m.fixed ? '<span class="sv-fixed">Fixed at top</span>' :
              '<div class="sv-move"><button type="button" data-i="' + i + '" data-d="-1" aria-label="Move ' + m.name + ' up"' + (j === 0 ? " disabled" : "") + ">↑</button>" +
              '<button type="button" data-i="' + i + '" data-d="1" aria-label="Move ' + m.name + ' down"' + (j === movable.length - 1 ? " disabled" : "") + ">↓</button></div>") +
            '<button type="button" class="sv-toggle" data-t="' + i + '" aria-pressed="' + !m.el.hidden + '" aria-label="Show ' + m.name + '">' + (m.el.hidden ? "Hidden" : "Shown") + "</button></li>";
        }).join("") + "</ol>";
      if (focusSel) { var f = view.querySelector(focusSel); if (f && !f.disabled) f.focus(); }
    }
    function sync() {
      mods.filter(function (m) { return !m.fixed; }).forEach(function (m) { content.appendChild(m.el); });
    }
    view.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.classList.contains("sv-reset")) {
        mods = initial.slice();
        mods.forEach(function (m) { m.el.hidden = false; });
        sync(); render(".sv-reset"); return;
      }
      if (b.dataset.t) {
        var m = mods[+b.dataset.t];
        m.el.hidden = !m.el.hidden;
        render('[data-t="' + b.dataset.t + '"]'); return;
      }
      var i = +b.dataset.i, d = +b.dataset.d, k = i + d;
      if (k < 1 || k >= mods.length) return;
      var tmp = mods[i]; mods[i] = mods[k]; mods[k] = tmp;
      sync(); render('[data-i="' + k + '"][data-d="' + d + '"]');
    });

    tabs.forEach(function (tab, i) {
      tab.setAttribute("role", "tab");
      tab.addEventListener("click", function () {
        var structureOn = i === 0;
        tabs.forEach(function (t, j) { t.classList.toggle("is-active", j === i); t.setAttribute("aria-selected", String(j === i)); });
        if (structureOn) render();
        view.hidden = !structureOn;
        live.forEach(function (n) { n.style.display = structureOn ? "none" : ""; });
      });
    });
    tabs[0].setAttribute("aria-controls", "structurePanel");
    tabs.forEach(function (t) { t.setAttribute("aria-selected", String(t.classList.contains("is-active"))); });
    tabs[0].parentNode.setAttribute("role", "tablist");
  }

  function editor() {
    var card = document.querySelector(".preview-card");
    if (!card || card.dataset.ai) return;
    card.dataset.ai = "1";
    var page = card.closest(".editor-page");
    var tpl = EDIT_TPL[editTpl] || EDIT_TPL.win;
    fillEditor(page, card, tpl);
    var readBtn = card.querySelector(".read-btn");
    readBtn.setAttribute("aria-haspopup", "dialog");
    readBtn.addEventListener("click", function () { linkPanel(card, tpl, readBtn); });
    structure(card, Array.prototype.slice.call(page.querySelectorAll(".editor-tab")));
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
      if (editTpl !== "win" && tpl.subject) {
        v = key === "formal" ? { h: tpl.formal.h, g: "Dear Valued Partner,", b: tpl.formal.b, c: "We appreciate your continued partnership." }
          : key === "shorter" ? { b: tpl.short, c: "Thank you." }
          : key === "promo" ? { c: tpl.c + " As a thank-you, use code <strong>OCI15</strong> for 15% off your next renewal." }
          : { b: tpl.short, c: "Thank you for building this with us." };
      }
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

  /* ---------- Templates: category chips + search filter the grid ---------- */
  var CHIP_CAT = { "All": "", "Marketing": "marketing", "Newsletter": "newsletter", "Welcome": "welcome", "Promo": "promo", "Product Update": "product", "Onboarding": "onboarding" };

  function templates() {
    var page = document.querySelector(".templates-page");
    if (!page || page.dataset.ai) return;
    page.dataset.ai = "1";
    var grid = page.querySelector(".tpl-grid");
    var input = page.querySelector(".search-box input");
    var chips = page.querySelectorAll(".tpl-filters .chip");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".tpl-card")).map(function (c) {
      var badge = c.querySelector(".cat-badge");
      return { el: c, cat: badge ? badge.classList[1] : "", text: c.textContent.toLowerCase() };
    });
    var cat = "";
    input.setAttribute("aria-label", "Search templates");
    input.setAttribute("type", "search");

    var status = document.createElement("p");
    status.className = "tpl-count";
    status.setAttribute("aria-live", "polite");
    grid.parentNode.insertBefore(status, grid);

    var empty = document.createElement("div");
    empty.className = "tpl-empty";
    empty.hidden = true;
    empty.innerHTML = "<h3>No templates match</h3><p></p><button type=\"button\" class=\"btn btn-outline\">Clear filters</button>";
    grid.parentNode.insertBefore(empty, grid.nextSibling);

    function apply(fromUser) {
      var q = input.value.trim().toLowerCase(), shown = 0;
      if (fromUser) cards.forEach(function (c) { c.el.classList.remove("stagger-item"); c.el.style.animationDelay = ""; });
      cards.forEach(function (c) {
        var on = (!cat || c.cat === cat) && (!q || c.text.indexOf(q) > -1);
        if (on && c.el.hidden && !REDUCED) {
          c.el.classList.remove("tpl-in");
          void c.el.offsetWidth;
          c.el.classList.add("tpl-in");
        }
        c.el.hidden = !on;
        if (on) shown++;
      });
      var label = "";
      chips.forEach(function (ch) { if (ch.classList.contains("is-active") && CHIP_CAT[ch.textContent]) label = ch.textContent; });
      status.textContent = shown + (shown === 1 ? " template" : " templates") + (label ? " in " + label : "") + (q ? " matching “" + input.value.trim() + "”" : "");
      empty.hidden = shown > 0;
      grid.hidden = shown === 0;
      if (!shown) empty.querySelector("p").textContent = "Try another word, or switch to a different category.";
    }

    chips.forEach(function (ch) {
      ch.setAttribute("aria-pressed", String(ch.classList.contains("is-active")));
      ch.addEventListener("click", function () {
        cat = CHIP_CAT[ch.textContent] || "";
        chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === ch)); });
        apply(true);
      });
    });
    input.addEventListener("input", function () { apply(true); });
    empty.querySelector("button").addEventListener("click", function () {
      input.value = "";
      chips[0].click();
      input.focus();
    });
    apply();
  }

  /* ---------- Profile: who is sending, and the defaults the AI writes with ---------- */
  function profile(root) {
    var field = function (id, label, value, extra) {
      return '<div class="field"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + ((extra && extra.type) || "text") + '" value="' + value + '"' + (extra && extra.readonly ? " readonly" : "") + " /></div>";
    };
    var toggle = function (label, hint, on) {
      return '<label class="toggle-row pf-toggle"><span><span class="t-label">' + label + '</span><small>' + hint + '</small></span><span class="switch"><input type="checkbox"' + (on ? " checked" : "") + ' /><span class="slider"></span></span></label>';
    };
    var drafts = [["win", "Win Story Email", "Edited 2 hours ago"], ["welcome", "Welcome Onboard Email", "Edited yesterday"], ["launch", "Product Launch Email", "Scheduled for Wed 09:00"]];
    var page = document.createElement("div");
    page.className = "container profile-page";
    page.innerHTML =
      '<div class="pf-head"><span class="pf-avatar" aria-hidden="true">JD</span><div><h1>Jamie Dela Cruz</h1><p>Senior Marketing Manager · Oracle Cloud Marketing, APAC</p></div></div>' +
      '<div class="pf-grid"><form class="pf-main" novalidate>' +
      '<section class="cfg-card"><h3>Profile</h3><div class="pf-two">' +
      field("pfName", "Full name", "Jamie Dela Cruz") + field("pfTitle", "Job title", "Senior Marketing Manager") +
      field("pfTeam", "Team", "Oracle Cloud Marketing, APAC") + field("pfEmail", "Work email", "jamie.delacruz@oracle.com", { type: "email", readonly: true }) +
      '</div><div class="field"><label for="pfTz">Time zone</label><select id="pfTz"><option selected>Singapore (GMT+8)</option><option>Manila (GMT+8)</option><option>Sydney (GMT+11)</option><option>Tokyo (GMT+9)</option></select></div></section>' +
      '<section class="cfg-card"><h3>Writing defaults</h3>' +
      '<div class="field"><span class="pf-label" id="pfToneLabel">Default tone</span><div class="vis-seg pf-seg" role="radiogroup" aria-labelledby="pfToneLabel">' +
      ["Warm", "Clear", "Formal", "Upbeat"].map(function (t, i) { return '<button type="button" role="radio" aria-checked="' + (i === 0) + '" class="' + (i === 0 ? "is-on" : "") + '">' + t + "</button>"; }).join("") +
      "</div></div>" +
      '<div class="field"><label for="pfSign">Sign-off</label><input id="pfSign" type="text" value="Jamie and the Oracle Cloud team" /></div>' +
      toggle("Suggest a send time", "The AI picks the hour each audience opens most.", true) +
      toggle("Add the unsubscribe footer", "Required for marketing email. Locked on for promo templates.", true) +
      toggle("Ask before sending to over 5,000 people", "Large sends wait for a second approver.", false) +
      "</section>" +
      '<section class="cfg-card"><h3>Sending identity</h3><div class="pf-two">' +
      field("pfFrom", "From name", "Oracle Cloud") + field("pfReply", "Reply-to address", "cloud-apac@oracle.com", { type: "email" }) +
      '</div><p class="pf-error" id="pfReplyError" hidden>Enter an email address, like name@oracle.com.</p></section>' +
      '<section class="cfg-card"><h3>Notifications</h3>' +
      toggle("A campaign finishes sending", "Delivery summary by email.", true) +
      toggle("Weekly performance digest", "Opens, clicks and the best send times, every Monday.", true) +
      toggle("Someone asks for your approval", "Also shown in the bell menu.", true) +
      "</section>" +
      '<div class="pf-save"><span class="pf-status" aria-live="polite"></span><button type="submit" class="btn btn-primary" disabled>Save changes</button></div>' +
      "</form>" +
      '<aside class="pf-side">' +
      '<section class="cfg-card"><h3>Recent drafts</h3><ul class="pf-drafts">' +
      drafts.map(function (d) { return '<li><a href="#/editor" data-tpl="' + d[0] + '"><b>' + d[1] + "</b><span>" + d[2] + "</span></a></li>"; }).join("") +
      "</ul></section>" +
      '<section class="cfg-card"><h3>Your last 30 days</h3><dl class="pf-stats"><div><dt>Emails generated</dt><dd>46</dd></div><div><dt>Sent</dt><dd>18</dd></div><div><dt>Average open rate</dt><dd>41.2%</dd></div></dl><a class="story-link pf-link" href="#/analytics">See analytics →</a></section>' +
      '<section class="cfg-card"><h3>API key</h3><p class="pf-note">Use this key to generate and send email from your own tools.</p>' +
      '<div class="pf-key"><code>oeg_live_••••••••••3f9a</code><button type="button" class="btn btn-outline pf-copy">Copy</button></div>' +
      '<div class="pf-regen"><button type="button" class="pf-text-btn pf-regen-ask">Regenerate key</button>' +
      '<div class="pf-confirm" hidden><p>The current key stops working straight away. Regenerate it?</p><button type="button" class="btn btn-primary pf-regen-yes">Regenerate</button><button type="button" class="btn btn-outline pf-regen-no">Cancel</button></div></div>' +
      '<a class="story-link pf-link" href="#/docs">Read the API docs →</a></section>' +
      '<button type="button" class="btn btn-outline pf-signout">Sign out</button>' +
      "</aside></div>";
    root.appendChild(page);

    var form = page.querySelector(".pf-main"), save = form.querySelector("[type=submit]"), status = form.querySelector(".pf-status");
    var reply = form.querySelector("#pfReply"), replyErr = form.querySelector("#pfReplyError");
    function dirty() { save.disabled = false; status.textContent = "Unsaved changes"; form.classList.add("is-dirty"); }
    form.addEventListener("input", dirty);
    form.addEventListener("change", dirty);
    form.querySelectorAll(".pf-seg button").forEach(function (b, i, all) {
      b.addEventListener("click", function () {
        all.forEach(function (x) { x.classList.toggle("is-on", x === b); x.setAttribute("aria-checked", String(x === b)); });
        dirty();
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reply.value.trim());
      replyErr.hidden = ok;
      reply.setAttribute("aria-invalid", String(!ok));
      if (ok) reply.removeAttribute("aria-describedby"); else reply.setAttribute("aria-describedby", "pfReplyError");
      if (!ok) { reply.focus(); status.textContent = "Fix the highlighted field to save."; return; }
      save.disabled = true;
      form.classList.remove("is-dirty");
      var now = new Date();
      status.textContent = "Saved at " + now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0");
      page.querySelector(".pf-head h1").textContent = form.querySelector("#pfName").value.trim() || "Jamie Dela Cruz";
      page.querySelector(".pf-head p").textContent = [form.querySelector("#pfTitle").value.trim(), form.querySelector("#pfTeam").value.trim()].filter(Boolean).join(" · ");
    });

    page.querySelectorAll(".pf-drafts a").forEach(function (a) {
      a.addEventListener("click", function () { editTpl = a.dataset.tpl; });
    });
    page.querySelector(".pf-copy").addEventListener("click", function (e) {
      var b = e.currentTarget;
      try { navigator.clipboard.writeText(page.querySelector(".pf-key code").textContent); } catch (err) {}
      b.textContent = "Copied";
      setTimeout(function () { b.textContent = "Copy"; }, 1600);
    });
    var ask = page.querySelector(".pf-regen-ask"), confirmBox = page.querySelector(".pf-confirm");
    ask.addEventListener("click", function () { confirmBox.hidden = false; ask.hidden = true; confirmBox.querySelector(".pf-regen-no").focus(); });
    page.querySelector(".pf-regen-no").addEventListener("click", function () { confirmBox.hidden = true; ask.hidden = false; ask.focus(); });
    page.querySelector(".pf-regen-yes").addEventListener("click", function () {
      var tail = Math.random().toString(16).slice(2, 6);
      page.querySelector(".pf-key code").textContent = "oeg_live_••••••••••" + tail;
      confirmBox.hidden = true; ask.hidden = false;
      ask.textContent = "Key regenerated. Regenerate again";
      ask.focus();
    });
    page.querySelector(".pf-signout").addEventListener("click", function (e) {
      e.currentTarget.textContent = "Signed out (demo)";
      e.currentTarget.disabled = true;
    });
  }

  function markAvatar() {
    var a = document.querySelector(".avatar");
    if (a) { if (location.hash === "#/profile") a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); }
  }

  function enhance() {
    markAvatar();
    requestAnimationFrame(function () { editor(); analytics(); templates(); });
  }
  window.addEventListener("hashchange", enhance);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", enhance);
  else enhance();

  window.OEGCompose = {
    profile: profile,
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
