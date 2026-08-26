/* =========================================================
   Oracle AI Email Generator — static SPA
   Routes: #/ Home · #/templates · #/analytics · #/docs · #/editor
   ========================================================= */
(function () {
  "use strict";

  var COLORS = { sends: "#FF8A3D", opens: "#E74C3C", clicks: "#00A389" };

  /* ---------- Router ---------- */
  var ROUTES = {
    "/": { title: "Home", render: renderHome, editor: false },
    "/templates": { title: "Templates", render: renderTemplates, editor: false },
    "/analytics": { title: "Analytics", render: renderAnalytics, editor: false },
    "/docs": { title: "API Docs", render: renderDocs, editor: false },
    "/editor": { title: "Win Story Email", render: renderEditor, editor: true }
  };

  function currentPath() { return location.hash.replace(/^#/, "") || "/"; }

  function setActiveNav(path) {
    document.querySelectorAll(".nav-tab").forEach(function (t) {
      t.classList.toggle("is-active", t.getAttribute("data-route") === path);
    });
  }

  function route() {
    var path = currentPath();
    var r = ROUTES[path] || ROUTES["/"];
    document.title = r.title + " · Oracle AI Email Gen";
    setActiveNav(ROUTES[path] ? path : "/");
    document.getElementById("siteHeader").classList.toggle("is-editor", !!r.editor);
    var app = document.getElementById("app");
    app.innerHTML = "";
    r.render(app);
    staggerReveal(app);
    window.scrollTo(0, 0);
    var mm = document.getElementById("mobileMenu");
    if (mm) mm.classList.remove("is-open");
  }

  /* ---------- Page-transition reveal: fade+rise, bottom to top ---------- */
  var REVEAL_WRAPPERS = [
    "home-page", "home-inner", "suggested", "container",
    "templates-page", "analytics-page", "editor-page",
    "start-grid", "tpl-grid", "summary-grid", "mid-grid",
    "insights-grid", "editor-grid", "config-stack", "recipient-tags"
  ];
  function isRevealWrapper(elm) {
    return elm.classList && REVEAL_WRAPPERS.some(function (c) { return elm.classList.contains(c); });
  }
  function collectRevealUnits(root, out) {
    Array.prototype.forEach.call(root.children, function (child) {
      if (!child.classList || child.classList.contains("home-blob")) return;
      if (isRevealWrapper(child)) { collectRevealUnits(child, out); }
      else { out.push(child); }
    });
  }
  function staggerReveal(app) {
    var units = [];
    collectRevealUnits(app, units);
    if (!units.length) return;
    var withRect = units.map(function (elm, i) {
      return { elm: elm, top: elm.getBoundingClientRect().top, i: i };
    });
    // bottom-most element on screen animates first, working upward
    withRect.sort(function (a, b) { return b.top - a.top || b.i - a.i; });
    withRect.forEach(function (item, order) {
      item.elm.classList.remove("stagger-item");
      void item.elm.offsetWidth; // force reflow so animation restarts on re-render
      item.elm.classList.add("stagger-item");
      item.elm.style.animationDelay = (order * 45) + "ms";
    });
  }


  function setupMobileMenu() {
    var toggle = document.getElementById("menuToggle");
    var menu = document.getElementById("mobileMenu");
    if (!toggle || !menu) return;
    menu.innerHTML = "";
    [["Home", "/"], ["Templates", "/templates"], ["Analytics", "/analytics"], ["API Docs", "/docs"]].forEach(function (p) {
      var a = el("a", { href: "#" + p[1], class: "nav-tab" });
      a.textContent = p[0];
      a.addEventListener("click", function () { menu.classList.remove("is-open"); });
      menu.appendChild(a);
    });
    toggle.addEventListener("click", function () { menu.classList.toggle("is-open"); });
  }

  /* =========================================================
     HOME
     ========================================================= */
  function renderHome(app) {
    var page = el("div", { class: "home-page" });
    page.innerHTML = '<div class="home-blob"></div>';
    var inner = el("div", { class: "home-inner" });

    var hero = el("div", { class: "hero" });
    hero.innerHTML =
      '<h1>Transform your ideas into <br><span class="accent">ready-to-send</span> emails</h1>' +
      '<p>Generate customized, professional HTML emails <br>instantly using the power of AI prompts.</p>';
    inner.appendChild(hero);

    var box = el("div", { class: "prompt-box" });
    box.innerHTML =
      '<div class="prompt-top"><span class="prompt-label">PROMPT THE AI EDITOR</span>' +
      '<span class="model-badge"><span class="pulse"></span>Model Active</span></div>' +
      '<textarea placeholder="Describe the email you want to write... (e.g. \'A friendly thank you email to OCI customers with a special discount code for Q3 renewal\')"></textarea>' +
      '<div class="prompt-foot">' +
      '<button class="btn-soft" type="button">' + iconAttach() + ' Attach Data Context</button>' +
      '<button class="btn-soft" type="button">' + iconTone() + ' Select Tone</button>' +
      '<span class="spacer"></span>' +
      '<a href="#/editor" class="btn btn-primary">Generate Template →</a>' +
      '</div>';
    inner.appendChild(box);

    var sug = el("div", { class: "suggested" });
    var shead = el("div", { class: "suggested-head" });
    shead.innerHTML = '<h2>Suggested Starting Points</h2><a href="#/templates">View all 48 templates →</a>';
    sug.appendChild(shead);
    var grid = el("div", { class: "start-grid" });
    var starts = [
      { img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80", pill: "SAAS", t: "Win Story Announcement", d: "Share inspiring customer milestones, ROI metrics, and success summaries across the global team." },
      { img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80", pill: "SAAS", t: "Cloud Momentum Release", d: "Announce product updates, version releases, and strategic infrastructure scaling news." },
      { img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80", pill: "SAAS", t: "Executive Briefing", d: "Coordinate executive briefings on cloud resource allocation and performance projections." }
    ];
    starts.forEach(function (s) {
      var a = el("a", { href: "#/editor", class: "start-card" });
      a.innerHTML =
        '<div class="start-thumb"><img src="' + s.img + '" alt="" loading="lazy" /><span class="start-pill">' + s.pill + '</span></div>' +
        '<div class="start-body"><h3>' + s.t + '</h3><p>' + s.d + '</p></div>';
      grid.appendChild(a);
    });
    sug.appendChild(grid);
    inner.appendChild(sug);

    page.appendChild(inner);
    app.appendChild(page);
  }

  /* =========================================================
     TEMPLATES
     ========================================================= */
  function renderTemplates(app) {
    var wrap = el("div", { class: "container templates-page" });
    wrap.innerHTML =
      '<div class="page-head"><h1>Templates</h1><p>Browse and select from curated email templates to match your enterprise cloud standards.</p></div>';

    var toolbar = el("div", { class: "tpl-toolbar" });
    toolbar.innerHTML =
      '<div class="search-box">' + iconSearch() + '<input type="text" placeholder="Search templates..." /></div>';
    var filters = el("div", { class: "tpl-filters" });
    ["All", "Marketing", "Newsletter", "Welcome", "Promo", "Product Update", "Onboarding"].forEach(function (f, i) {
      var c = el("button", { class: "chip" + (i === 0 ? " is-active" : ""), type: "button" });
      c.textContent = f;
      c.addEventListener("click", function () {
        filters.querySelectorAll(".chip").forEach(function (x) { x.classList.remove("is-active"); });
        c.classList.add("is-active");
      });
      filters.appendChild(c);
    });
    toolbar.appendChild(filters);
    wrap.appendChild(toolbar);

    var grid = el("div", { class: "tpl-grid" });
    var cards = [
      { img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80", cat: "marketing", label: "MARKETING", t: "Win Story Announcement", d: "Share inspiring customer milestones, ROI metrics, and success summaries across the global team." },
      { img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80", cat: "newsletter", label: "NEWSLETTER", t: "Cloud Momentum Release", d: "Announce product updates, version releases, and strategic infrastructure scaling news." },
      { img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80", cat: "welcome", label: "WELCOME", t: "Welcome Onboard", d: "Greet new enterprise customers, schedule kick-off calls, and link primary cloud console guides." },
      { img: "https://images.unsplash.com/photo-1564406860401-1a35364fb9b9?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", cat: "promo", label: "PROMO", t: "Summer Promo Offer", d: "Extend customized multi-region credit extensions and discounted OCI computing tiers." },
      { img: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80", cat: "product", label: "PRODUCT UPDATE", t: "Product Launch Digest", d: "Structured release digests covering microservice updates, security patches, and deployment logs." },
      { img: "https://images.unsplash.com/photo-1771848194108-b86156b6ca72?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", cat: "onboarding", label: "ONBOARDING", t: "Quarterly Enterprise Review", d: "Coordinate executive briefings on cloud resource allocation and performance projections." }
    ];
    cards.forEach(function (c) {
      var card = el("div", { class: "tpl-card" });
      card.innerHTML =
        '<div class="tpl-thumb"><img src="' + c.img + '" alt="" loading="lazy" /></div>' +
        '<div class="tpl-body"><span class="cat-badge ' + c.cat + '">' + c.label + '</span>' +
        '<h3>' + c.t + '</h3><p>' + c.d + '</p></div>';
      card.addEventListener("click", function () { location.hash = "#/editor"; });
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
    app.appendChild(wrap);
  }

  /* =========================================================
     ANALYTICS
     ========================================================= */
  function renderAnalytics(app) {
    var wrap = el("div", { class: "container analytics-page" });
    wrap.innerHTML =
      '<div class="ana-head"><div><h1>Performance Analytics</h1><p>Real-time delivery statistics, open triggers, and key engagement metrics.</p></div>' +
      '<button class="date-picker" type="button">' + iconCal() + ' Last 30 Days (Oct 1 - Oct 31) ▾</button></div>';

    var sg = el("div", { class: "summary-grid" });
    var stats = [
      { label: "Total Emails Sent", delta: "+12.4%", dir: "up", value: "142,850", spark: "sent" },
      { label: "Average Open Rate", delta: "+3.2%", dir: "up", value: "38.4%", spark: "open" },
      { label: "Avg Click-Through Rate", delta: "-0.8%", dir: "down", value: "14.2%", spark: "ctr" },
      { label: "Bounce Rate", delta: "-1.1%", dir: "down", value: "0.92%", spark: "bounce" }
    ];
    stats.forEach(function (s) {
      var c = el("div", { class: "card stat-card" });
      c.innerHTML =
        '<div class="stat-meta"><span class="stat-label">' + s.label + '</span><span class="stat-delta ' + s.dir + '">' + s.delta + '</span></div>' +
        '<div class="stat-value">' + s.value + '</div>' +
        '<svg class="sparkline" data-spark="' + s.spark + '" viewBox="0 0 120 36" preserveAspectRatio="none"></svg>';
      sg.appendChild(c);
    });
    wrap.appendChild(sg);

    var chartCard = el("div", { class: "card chart-card" });
    chartCard.innerHTML =
      '<div class="chart-head"><div><h2>Delivery &amp; Engagement Over Time</h2><p>Monitoring active user interaction trends across the global server array.</p></div>' +
      '<div class="chart-legend" id="chartLegend"></div></div>' +
      '<div class="chart-wrap"><svg id="engagementChart" viewBox="0 0 980 380" preserveAspectRatio="none" aria-label="Delivery and engagement over time chart"></svg></div>';
    wrap.appendChild(chartCard);

    var mid = el("div", { class: "mid-grid" });
    var tplCard = el("div", { class: "card" });
    tplCard.innerHTML = '<div class="card-title"><h2>Top Performing Templates</h2><span class="card-sub">Ranked by open rate this period</span></div><ul class="template-list" id="templateList"></ul>';
    var campCard = el("div", { class: "card" });
    campCard.innerHTML = '<div class="card-title"><h2>Recent Campaigns</h2><span class="card-sub">Latest dispatches across regions</span></div>' +
      '<table class="campaign-table"><thead><tr><th>Campaign Name</th><th>Status</th><th>Open Rate</th><th>CTR</th><th>Dispatched</th></tr></thead><tbody id="campaignBody"></tbody></table>';
    mid.appendChild(tplCard);
    mid.appendChild(campCard);
    wrap.appendChild(mid);

    var ins = el("div", { class: "card insights-card" });
    ins.innerHTML = '<div class="insights-head"><span class="ai-spark">' + iconSpark() + '</span><div><h2>Autonomous AI Strategic Insights</h2><p>Pattern detection across delivery and engagement signals.</p></div></div>' +
      '<div class="insights-grid" id="insightsGrid"></div>';
    wrap.appendChild(ins);

    app.appendChild(wrap);

    buildLegend();
    buildChart();
    buildSparklines();
    buildTemplates();
    buildCampaigns();
    buildInsights();
  }

  /* ---------- Analytics: chart ---------- */
  var VB_W = 980, VB_H = 380;
  var PAD = { top: 24, right: 24, bottom: 38, left: 56 };
  var PLOT_W = VB_W - PAD.left - PAD.right;
  var PLOT_H = VB_H - PAD.top - PAD.bottom;
  var Y_MAX = 160000;
  var Y_TICKS = [0, 25000, 50000, 100000, 150000];
  var X_LABELS = ["Oct 1", "Oct 5", "Oct 10", "Oct 15", "Oct 20", "Oct 25", "Oct 30"];
  var X_LABEL_DAYS = [0, 4, 9, 14, 19, 24, 29];

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInCubic(t) { return t * t * t; }
  function buildSeries(base, peak, endBoost) {
    var pts = [];
    for (var d = 0; d < 30; d++) {
      var v = 0, start = base * 0.18, dipDay = 5, peakDay = 21.5;
      if (d <= dipDay) { v = start * (1 - d / dipDay); }
      else if (d <= peakDay) { v = peak * easeOutCubic((d - dipDay) / (peakDay - dipDay)); }
      else {
        var t = (d - peakDay) / (29 - peakDay);
        v = peak * (1 - 0.28 * Math.sin(Math.PI * t)) * (0.7 + 0.5 * easeInCubic(t)) + endBoost * easeOutCubic(Math.max(0, (t - 0.55) / 0.45));
      }
      pts.push(Math.max(0, Math.round(v)));
    }
    return pts;
  }
  var SERIES = {
    sends: buildSeries(150000, 148000, 12000),
    opens: buildSeries(100000, 96000, 9000),
    clicks: buildSeries(60000, 56000, 5000)
  };

  function ns(tag, attrs) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function xForDay(d) { return PAD.left + (d / 29) * PLOT_W; }
  function yForVal(v) { return PAD.top + PLOT_H - (v / Y_MAX) * PLOT_H; }
  function fmtY(v) { return v >= 1000 ? (v / 1000) + "k" : String(v); }
  function smoothPath(pts) {
    if (pts.length < 2) return "";
    var d = "M " + pts[0].x + " " + pts[0].y;
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += " C " + c1x + " " + c1y + ", " + c2x + " " + c2y + ", " + p2.x + " " + p2.y;
    }
    return d;
  }

  function buildChart() {
    var svg = document.getElementById("engagementChart");
    if (!svg) return;
    var tooltip = document.getElementById("chartTooltip");

    Y_TICKS.forEach(function (tick) {
      var y = yForVal(tick);
      svg.appendChild(ns("line", { x1: PAD.left, x2: VB_W - PAD.right, y1: y, y2: y, class: "grid-line" + (tick === 0 ? " zero" : "") }));
      svg.appendChild(ns("text", { x: PAD.left - 12, y: y + 4, class: "axis-label y" })).textContent = fmtY(tick);
    });
    X_LABELS.forEach(function (lbl, i) {
      svg.appendChild(ns("text", { x: xForDay(X_LABEL_DAYS[i]), y: VB_H - PAD.bottom + 22, class: "axis-label x" })).textContent = lbl;
    });

    var keys = ["sends", "opens", "clicks"];
    var defs = ns("defs");
    keys.forEach(function (key) {
      var grad = ns("linearGradient", { id: "grad-" + key, x1: "0", y1: "0", x2: "0", y2: "1" });
      grad.appendChild(ns("stop", { offset: "0%", "stop-color": COLORS[key], "stop-opacity": "0.18" }));
      grad.appendChild(ns("stop", { offset: "100%", "stop-color": COLORS[key], "stop-opacity": "0" }));
      defs.appendChild(grad);
    });
    svg.insertBefore(defs, svg.firstChild);

    keys.forEach(function (key) {
      var data = SERIES[key];
      var pts = data.map(function (v, d) { return { x: xForDay(d), y: yForVal(v) }; });
      var areaPath = smoothPath(pts) + " L " + pts[pts.length - 1].x + " " + yForVal(0) + " L " + pts[0].x + " " + yForVal(0) + " Z";
      svg.appendChild(ns("path", { d: areaPath, class: "series-area", fill: "url(#grad-" + key + ")" }));
      var line = ns("path", { d: smoothPath(pts), class: "series-line", stroke: COLORS[key], id: "line-" + key });
      svg.appendChild(line);
      pts.forEach(function (p, idx) {
        svg.appendChild(ns("circle", { cx: p.x, cy: p.y, r: 3.2, fill: COLORS[key], class: "series-dot", "data-key": key, "data-day": idx }));
      });
    });

    var hoverLine = ns("line", { x1: 0, x2: 0, y1: PAD.top, y2: PAD.top + PLOT_H, class: "hover-line" });
    svg.appendChild(hoverLine);

    requestAnimationFrame(function () {
      keys.forEach(function (key, i) {
        var line = document.getElementById("line-" + key);
        var len = line.getTotalLength();
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;
        line.style.transition = "stroke-dashoffset 1.5s cubic-bezier(.22,.61,.36,1) " + (i * 0.18) + "s";
        line.getBoundingClientRect();
        line.style.strokeDashoffset = "0";
      });
      setTimeout(function () {
        svg.querySelectorAll(".series-area").forEach(function (a) { a.classList.add("show"); });
      }, 350);
      setTimeout(function () {
        var dots = svg.querySelectorAll(".series-dot");
        dots.forEach(function (dot, idx) { setTimeout(function () { dot.classList.add("show"); }, idx * 8); });
      }, 900);
    });

    function onMove(e) {
      var rect = svg.getBoundingClientRect();
      var relX = ((e.clientX - rect.left) / rect.width) * VB_W;
      if (relX < PAD.left || relX > VB_W - PAD.right) { hoverLine.style.opacity = "0"; tooltip.hidden = true; return; }
      var day = Math.max(0, Math.min(29, Math.round(((relX - PAD.left) / PLOT_W) * 29)));
      var px = xForDay(day);
      hoverLine.setAttribute("x1", px); hoverLine.setAttribute("x2", px);
      hoverLine.style.opacity = "1";
      var html = '<div class="tt-date">Oct ' + (day + 1) + '</div>';
      keys.forEach(function (k) {
        html += '<div class="tt-row"><span class="dot" style="background:' + COLORS[k] + '"></span>' + cap(k) + ': ' + SERIES[k][day].toLocaleString() + '</div>';
      });
      tooltip.innerHTML = html; tooltip.hidden = false;
      var screenX = rect.left + (px / VB_W) * rect.width;
      var topY = rect.top + (yForVal(Math.max(SERIES.sends[day], SERIES.opens[day], SERIES.clicks[day])) / VB_H) * rect.height;
      tooltip.style.left = screenX + "px"; tooltip.style.top = topY + "px";
    }
    function onLeave() { hoverLine.style.opacity = "0"; tooltip.hidden = true; }
    svg.addEventListener("mousemove", onMove);
    svg.addEventListener("mouseleave", onLeave);
  }

  function buildLegend() {
    var e = document.getElementById("chartLegend"); if (!e) return;
    [{ k: "sends", l: "Sends" }, { k: "opens", l: "Opens" }, { k: "clicks", l: "Clicks" }].forEach(function (it) {
      var s = el("span", { class: "legend-item" });
      s.innerHTML = '<span class="legend-dot ' + it.k + '"></span>' + it.l;
      e.appendChild(s);
    });
  }

  function buildSparklines() {
    var sparkData = {
      sent: [12, 18, 14, 22, 19, 28, 26, 34, 30, 38],
      open: [20, 22, 19, 24, 22, 27, 25, 30, 28, 33],
      ctr: [30, 28, 32, 26, 29, 24, 27, 22, 25, 20],
      bounce: [18, 20, 17, 19, 15, 16, 13, 14, 11, 9]
    };
    var sparkColors = { sent: COLORS.sends, open: COLORS.opens, ctr: COLORS.clicks, bounce: COLORS.red };
    document.querySelectorAll(".sparkline").forEach(function (svg) {
      var key = svg.getAttribute("data-spark");
      var data = sparkData[key], color = sparkColors[key], w = 120, h = 36;
      var max = Math.max.apply(null, data), min = Math.min.apply(null, data);
      var pts = data.map(function (v, i) { return { x: (i / (data.length - 1)) * w, y: h - ((v - min) / Math.max(1, max - min)) * (h - 6) - 3 }; });
      var path = smoothPath(pts);
      var SVGNS = "http://www.w3.org/2000/svg";
      var grad = document.createElementNS(SVGNS, "linearGradient");
      grad.setAttribute("id", "sp-" + key); grad.setAttribute("x1", "0"); grad.setAttribute("y1", "0"); grad.setAttribute("x2", "0"); grad.setAttribute("y2", "1");
      var s1 = document.createElementNS(SVGNS, "stop"); s1.setAttribute("offset", "0%"); s1.setAttribute("stop-color", color); s1.setAttribute("stop-opacity", "0.25");
      var s2 = document.createElementNS(SVGNS, "stop"); s2.setAttribute("offset", "100%"); s2.setAttribute("stop-color", color); s2.setAttribute("stop-opacity", "0");
      grad.appendChild(s1); grad.appendChild(s2);
      var defs = document.createElementNS(SVGNS, "defs"); defs.appendChild(grad); svg.appendChild(defs);
      var area = document.createElementNS(SVGNS, "path");
      area.setAttribute("d", path + " L " + w + " " + h + " L 0 " + h + " Z"); area.setAttribute("fill", "url(#sp-" + key + ")"); svg.appendChild(area);
      var line = document.createElementNS(SVGNS, "path");
      line.setAttribute("d", path); line.setAttribute("fill", "none"); line.setAttribute("stroke", color); line.setAttribute("stroke-width", "2");
      line.setAttribute("stroke-linecap", "round"); line.setAttribute("stroke-linejoin", "round"); svg.appendChild(line);
      var last = pts[pts.length - 1];
      var dot = document.createElementNS(SVGNS, "circle");
      dot.setAttribute("cx", last.x); dot.setAttribute("cy", last.y); dot.setAttribute("r", "2.6"); dot.setAttribute("fill", color); svg.appendChild(dot);
    });
  }

  function buildTemplates() {
    var ul = document.getElementById("templateList"); if (!ul) return;
    var data = [
      { name: "Win Story Announcement", rate: 48.2, pct: 96 },
      { name: "Cloud Momentum Release", rate: 41.5, pct: 83 },
      { name: "Executive Briefing", rate: 34.1, pct: 68 },
      { name: "Summer Promo Offer", rate: 29.4, pct: 59 }
    ];
    data.forEach(function (t) {
      var li = el("li");
      li.innerHTML = '<div class="tpl-row"><span class="tpl-name">' + t.name + '</span><span class="tpl-rate">' + t.rate.toFixed(1) + '% Open</span></div>' +
        '<div class="tpl-bar"><div class="tpl-fill" data-w="' + t.pct + '"></div></div>';
      ul.appendChild(li);
    });
    setTimeout(function () {
      ul.querySelectorAll(".tpl-fill").forEach(function (f, i) {
        setTimeout(function () { f.style.width = f.getAttribute("data-w") + "%"; }, i * 120);
      });
    }, 400);
  }

  function buildCampaigns() {
    var body = document.getElementById("campaignBody"); if (!body) return;
    var rows = [
      { name: "Q3 Cloud Success Newsletter", status: "sent", open: "48.2%", ctr: "16.4%", date: "Oct 28" },
      { name: "August Maintenance Advisory", status: "sent", open: "39.1%", ctr: "12.0%", date: "Oct 25" },
      { name: "OCI Storage Specialist Brief", status: "draft", open: "—", ctr: "—", date: "Oct 20" },
      { name: "Enterprise Kickoff Sequence", status: "sent", open: "42.8%", ctr: "14.1%", date: "Oct 12" }
    ];
    rows.forEach(function (r) {
      var tr = el("tr");
      var openCell = r.status === "draft" ? '<span class="muted">' + r.open + '</span>' : r.open;
      var ctrCell = r.status === "draft" ? '<span class="muted">' + r.ctr + '</span>' : r.ctr;
      tr.innerHTML = '<td>' + r.name + '</td><td><span class="badge ' + r.status + '">' + cap(r.status) + '</span></td><td>' + openCell + '</td><td>' + ctrCell + '</td><td>' + r.date + '</td>';
      body.appendChild(tr);
    });
  }

  function buildInsights() {
    var grid = document.getElementById("insightsGrid"); if (!grid) return;
    var data = [
      { title: "Optimal Send Schedule Identified", badge: "Tuesdays 10:00 AM", text: "Dispatch windows scheduled at Tuesday 10:00 AM show the highest open probability across enterprise segments." },
      { title: "Recommended Format Update", badge: "Concise Executive Style", text: "Subject lines under 42 characters with executive framing outperform promotional phrasing by a wide margin." },
      { title: "Inquiry Framed Subject Lines", badge: "+23.2% Open Probability", text: "Audiences targeted on cloud-infrastructure intent signals respond measurably better than generic lists." },
      { title: "Microservice Status Alerts", badge: "Underutilized Channel", text: "Re-engagement flows for dormant OCI tenants remain an underutilized but high-yield channel this quarter." }
    ];
    data.forEach(function (d) {
      var div = el("div", { class: "insight" });
      div.innerHTML = '<span class="insight-badge">' + d.badge + '</span><h3 class="insight-title">' + d.title + '</h3><p>' + d.text + '</p>';
      grid.appendChild(div);
    });
  }

  /* =========================================================
     EDITOR
     ========================================================= */
  function renderEditor(app) {
    var page = el("div", { class: "editor-page" });

    var subbar = el("div", { class: "editor-subbar" });
    subbar.innerHTML = '<div class="container editor-subbar-inner">' +
      '<div class="breadcrumb"><a href="#/">Emails</a><span class="sep">›</span><span class="current">Win Story Email</span></div>' +
      '<button class="btn btn-primary" type="button">Send</button></div>';
    page.appendChild(subbar);

    var titleRow = el("div", { class: "editor-title-row" });
    titleRow.innerHTML = '<h1>Win Story Email</h1>';
    page.appendChild(titleRow);

    var tabs = el("div", { class: "editor-tabs" });
    tabs.innerHTML = '<button class="editor-tab" type="button">Edit Structure</button><button class="editor-tab is-active" type="button">Live Preview</button>';
    page.appendChild(tabs);

    var grid = el("div", { class: "editor-grid" });

    // left: preview
    var preview = el("div", { class: "preview-card" });
    preview.innerHTML =
      '<div class="preview-meta"><div class="meta-row"><span class="meta-label">Subject:</span><span class="meta-val">Celebrating a Big Win Together!</span></div>' +
      '<div class="meta-row"><span class="meta-label">To:</span><span class="meta-val">valued-customer@oracle.com</span></div></div>' +
      '<div class="preview-hero"><img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80" alt="Team celebrating a win" /></div>' +
      '<div class="preview-content"><h2>We couldn\'t have done it without you.</h2>' +
      '<p>Dear Partner,</p>' +
      '<p>We are thrilled to share a milestone that would not have been possible without your continued trust and collaboration. Together, we have accelerated cloud adoption, streamlined enterprise workloads, and unlocked measurable performance gains across the quarter.</p>' +
      '<p>Thank you for being an essential part of this journey. We look forward to reaching even greater heights together.</p>' +
      '<button class="read-btn" type="button">Read the Full Story →</button></div>' +
      '<div class="ai-refine"><div class="ai-refine-label">Ask AI to refine or rewrite this email…</div>' +
      '<input class="ai-refine-input" placeholder="Ask AI to refine or rewrite..." />' +
      '<div class="ai-refine-pills"><button class="ai-pill" type="button">Make it formal</button><button class="ai-pill" type="button">Shorter</button><button class="ai-pill" type="button">Add promo code</button></div></div>';
    grid.appendChild(preview);

    // right: config
    var config = el("div", { class: "config-stack" });
    config.innerHTML =
      '<div class="cfg-card"><h3>Email Details</h3>' +
      '<div class="field"><label>Campaign Name</label><input type="text" value="Q3 Win Story" /></div>' +
      '<div class="field"><label>Category</label><select><option>Customer Success</option><option>Marketing</option><option>Newsletter</option></select></div>' +
      '<div class="field"><label>Priority</label><select><option>High</option><option>Medium</option><option>Low</option></select></div></div>' +
      '<div class="cfg-card"><h3>Recipients</h3>' +
      '<div class="recipient-tags">' +
      '<span class="recipient-tag">valued-customer@oracle.com <span class="x">×</span></span>' +
      '<span class="recipient-tag">sales-team@oracle.com <span class="x">×</span></span>' +
      '<span class="recipient-tag">management@oracle.com <span class="x">×</span></span>' +
      '</div><button class="add-recipient" type="button">+ Add Recipient</button></div>' +
      '<div class="cfg-card"><h3>Schedule</h3>' +
      '<div class="field"><label>Send Date &amp; Time</label><select><option>Aug 5, 2026 at 10:00 AM</option><option>Aug 6, 2026 at 9:00 AM</option></select></div>' +
      '<div class="toggle-row"><span class="t-label">Send automatically</span><label class="switch"><input type="checkbox" checked /><span class="slider"></span></label></div>' +
      '<div class="ai-banner">' + iconSpark() + ' Optimal send time suggested by AI</div></div>' +
      '<div class="cfg-card"><h3>Performance Prediction</h3>' +
      '<div class="pred-row"><div class="pred-top"><span class="pred-label">Estimated Open Rate</span><span class="pred-val">34%</span></div><div class="pred-bar"><div class="pred-fill red" data-w="34"></div></div></div>' +
      '<div class="pred-row"><div class="pred-top"><span class="pred-label">Estimated Click Rate</span><span class="pred-val">12%</span></div><div class="pred-bar"><div class="pred-fill green" data-w="12"></div></div></div></div>';
    grid.appendChild(config);

    page.appendChild(grid);
    app.appendChild(page);

    // animate prediction bars
    setTimeout(function () {
      page.querySelectorAll(".pred-fill").forEach(function (f) { f.style.width = f.getAttribute("data-w") + "%"; });
    }, 300);

    // recipient tag removal
    page.querySelectorAll(".recipient-tag .x").forEach(function (x) {
      x.addEventListener("click", function () { x.parentElement.remove(); });
    });
  }

  /* =========================================================
     API DOCS
     ========================================================= */
  function renderDocs(app) {
    var wrap = el("div", { class: "container", style: "padding:40px 28px 64px; display:grid; grid-template-columns:240px 1fr; gap:26px; align-items:start;" });
    var side = el("div", { class: "docs-side", style: "position:sticky; top:84px;" });
    side.innerHTML = '<h4 style="margin:0 0 10px; font-size:12px; text-transform:uppercase; letter-spacing:.05em; color:var(--ink-faint);">Reference</h4>' +
      ["Introduction", "Authentication", "Generate Email", "Dispatch Email", "Analytics", "Webhooks", "Errors"].map(function (s, i) {
        return '<a href="#" style="display:block; padding:7px 12px; border-radius:8px; text-decoration:none; color:var(--ink-soft); font-size:13px; font-weight:500;' + (i === 0 ? " background:var(--orange-soft); color:var(--logo-red);" : "") + '">' + s + "</a>";
      }).join("");
    var content = el("div");
    content.innerHTML =
      '<h1 style="margin:0 0 8px; font-size:26px; font-weight:700;">API Reference</h1>' +
      '<p style="color:var(--ink-faint); margin:0 0 22px; max-width:640px;">The Oracle AI Email Gen API lets you generate, dispatch, and analyze email campaigns programmatically. All requests are authenticated with a bearer token.</p>' +
      '<div class="card" style="padding:18px 22px; margin-bottom:16px;"><div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;"><span class="badge" style="background:var(--orange-soft); color:var(--logo-red);">POST</span><span style="font-family:ui-monospace,monospace; font-size:13px; font-weight:600;">/v1/emails/generate</span></div><p style="margin:0 0 12px; color:var(--ink-soft); font-size:13px;">Generate an on-brand email draft from a prompt and audience context.</p>' +
      '<pre class="code-block" style="background:#0F1115; color:#E6E8EC; border-radius:10px; padding:14px 16px; font-family:ui-monospace,monospace; font-size:12.5px; line-height:1.6; overflow-x:auto;">curl -X POST https://api.oracle-emailgen.example/v1/emails/generate \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -d \'{"prompt":"Q3 cloud success newsletter"}\'</pre></div>' +
      '<div class="card" style="padding:18px 22px; margin-bottom:16px;"><div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;"><span class="badge" style="background:var(--orange-soft); color:var(--logo-red);">POST</span><span style="font-family:ui-monospace,monospace; font-size:13px; font-weight:600;">/v1/emails/dispatch</span></div><p style="margin:0 0 12px; color:var(--ink-soft); font-size:13px;">Dispatch a generated email to a recipient list immediately or on schedule.</p>' +
      '<pre class="code-block" style="background:#0F1115; color:#E6E8EC; border-radius:10px; padding:14px 16px; font-family:ui-monospace,monospace; font-size:12.5px; line-height:1.6; overflow-x:auto;">{ "email_id": "eml_8f3a", "list_id": "lst_enterprise", "schedule": "2026-08-05T10:00:00Z" }</pre></div>' +
      '<div class="card" style="padding:18px 22px; margin-bottom:16px;"><div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;"><span class="badge" style="background:var(--green-soft); color:var(--green);">GET</span><span style="font-family:ui-monospace,monospace; font-size:13px; font-weight:600;">/v1/analytics?range=30d</span></div><p style="margin:0 0 12px; color:var(--ink-soft); font-size:13px;">Retrieve delivery and engagement metrics for a date range.</p>' +
      '<pre class="code-block" style="background:#0F1115; color:#E6E8EC; border-radius:10px; padding:14px 16px; font-family:ui-monospace,monospace; font-size:12.5px; line-height:1.6; overflow-x:auto;">{ "sent": 142850, "open_rate": 0.384, "ctr": 0.142, "bounce_rate": 0.0092 }</pre></div>';
    wrap.appendChild(side);
    wrap.appendChild(content);
    app.appendChild(wrap);
  }

  /* ---------- Helpers ---------- */
  function el(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function iconCal() { return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'; }
  function iconSpark() { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6z"/></svg>'; }
  function iconSearch() { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'; }
  function iconAttach() { return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>'; }
  function iconTone() { return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9"/><path d="M3 3v6h6"/></svg>'; }

  /* ---------- Init ---------- */
  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    route();
  });
})();
