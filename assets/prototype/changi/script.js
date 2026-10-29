/* Changi × Oracle — Cloud Mission Control
   One cost model feeds every view: the configured stack sets the monthly
   Oracle cost, hyperscaler equivalents come from per-line price ratios,
   and the live telemetry spends that budget along Changi's passenger curve. */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Formatting ---------- */
  function money(n, dec) {
    dec = dec || 0;
    return (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function compact(n) {
    var a = Math.abs(n);
    var sign = n < 0 ? "-$" : "$";
    if (a >= 1e6) return sign + (a / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
    if (a >= 1e3) return sign + Math.round(a / 1e3) + "k";
    return sign + Math.round(a);
  }
  function pct(n) { return Math.round(n * 100) + "%"; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* Count a number up or down to its new value */
  function tween(el, to, fmt, dur) {
    if (!el) return;
    var from = el._v == null ? 0 : el._v;
    el._v = to;
    if (reduceMotion || from === to) { el.textContent = fmt(to); return; }
    var t0 = performance.now(); dur = dur || 700;
    cancelAnimationFrame(el._raf);
    (function step(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (k < 1) el._raf = requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- Providers & price catalogue ---------- */
  var PROVIDERS = [
    { k: "oracle", name: "Oracle", color: "var(--s-oracle)" },
    { k: "aws", name: "AWS", color: "var(--s-aws)" },
    { k: "azure", name: "Azure", color: "var(--s-azure)" },
    { k: "gcp", name: "Google Cloud", color: "var(--s-gcp)" }
  ];
  var RIVALS = ["aws", "azure", "gcp"];

  var CATALOG = [
    { cat: "Compute", name: "VM instance, AMD", spec: "8 vCPU, 32 GB RAM", qty: "1", oracle: 274, aws: 575, azure: 521, gcp: 559 },
    { cat: "Compute", name: "VM instance, Intel", spec: "8 vCPU, 32 GB RAM", qty: "1", oracle: 159, aws: 620, azure: 580, gcp: 610 },
    { cat: "Compute", name: "GPU node, NVIDIA A100", spec: "8 × A100 80 GB", qty: "1", oracle: 23888, aws: 80741, azure: 78830, gcp: 81219 },
    { cat: "Compute", name: "GPU node, NVIDIA H100", spec: "8 × H100 80 GB", qty: "1", oracle: 59520, aws: 148800, azure: 154752, gcp: 151180 },
    { cat: "Compute", name: "Kubernetes virtual node", spec: "Per node", qty: "1", oracle: 181, aws: 1062, azure: 1167, gcp: 1053 },
    { cat: "Storage", name: "Block storage", spec: "Balanced performance", qty: "1 TB", oracle: 43, aws: 120, azure: 115, gcp: 130 },
    { cat: "Storage", name: "Object storage", spec: "Standard tier", qty: "1 TB", oracle: 25, aws: 55, azure: 61, gcp: 58 },
    { cat: "Network", name: "Internet egress", spec: "Data transferred out", qty: "10 TB", oracle: 994, aws: 5417, azure: 5167, gcp: 4888 },
    { cat: "Network", name: "Private line", spec: "10 Gbps dedicated", qty: "1", oracle: 949, aws: 3101, azure: 3240, gcp: 3080 },
    { cat: "Database", name: "MySQL HeatWave", spec: "Managed, 2 replicas", qty: "1", oracle: 1313, aws: 3875, azure: 4020, gcp: 3940 }
  ];
  var CATS = ["Compute", "Storage", "Network", "Database"];

  /* ---------- Cost model ---------- */
  var DEFAULT_CFG = { shape: "amd", vcpu: 8, ram: 32, instances: 10, gpu: "none", gpuCount: 0, block: 5, object: 20, backup: "daily", egress: 10, links: 1, region: "sg1", db: "heatwave", dbStorage: 1, replicas: 2 };
  var SHAPES = { amd: { name: "AMD EPYC", cpu: 23.25, ram: 2.75 }, intel: { name: "Intel Ice Lake", cpu: 25.4, ram: 3 }, arm: { name: "Ampere Arm", cpu: 15.5, ram: 2 } };
  var GPU = { a100: 23888, h100: 59520 };
  var BACKUP = { daily: 12.8, weekly: 4.4, continuous: 36 };
  var DB = { heatwave: { name: "MySQL HeatWave", base: 1313 }, adb: { name: "Autonomous Database", base: 1580 }, pg: { name: "PostgreSQL", base: 980 } };
  var REPLICA = { 1: .75, 2: 1, 4: 1.5 };
  /* What AWS, Azure and Google charge per Oracle dollar, by line (from the catalogue) */
  var MULT = {
    compute: [2.1, 1.9, 2.04], a100: [3.38, 3.3, 3.4], h100: [2.5, 2.6, 2.54], block: [2.79, 2.67, 3.02], object: [2.2, 2.44, 2.32],
    backup: [2.4, 2.3, 2.5], egress: [5.45, 5.2, 4.92], links: [3.27, 3.41, 3.25], db: [2.95, 3.06, 3], dbStorage: [2.6, 2.7, 2.65]
  };
  var GROUPS = [
    { k: "Compute", color: "var(--s-oracle)" },
    { k: "Storage", color: "var(--pax)" },
    { k: "Network", color: "var(--s-aws)" },
    { k: "Database", color: "var(--s-gcp)" }
  ];

  function costLines(c) {
    var s = SHAPES[c.shape], lines = [];
    function add(key, group, label, oracle) {
      if (oracle <= 0) return;
      var m = MULT[key], line = { key: key, group: group, label: label, oracle: oracle };
      RIVALS.forEach(function (p, i) { line[p] = oracle * m[i]; });
      lines.push(line);
    }
    add("compute", "Compute", s.name + " VMs × " + c.instances, c.instances * (c.vcpu * s.cpu + c.ram * s.ram));
    if (c.gpu !== "none") add(c.gpu, "Compute", c.gpu.toUpperCase() + " GPU nodes × " + c.gpuCount, c.gpuCount * GPU[c.gpu]);
    add("block", "Storage", c.block + " TB block storage", c.block * 43);
    add("object", "Storage", c.object + " TB object storage", c.object * 25);
    add("backup", "Storage", (c.backup === "continuous" ? "Continuous" : c.backup === "weekly" ? "Weekly" : "Daily") + " backups", c.block * BACKUP[c.backup]);
    add("egress", "Network", c.egress + " TB egress", c.egress * 99.4);
    add("links", "Network", c.links + " × 10 Gbps FastConnect", c.links * 949);
    add("db", "Database", DB[c.db].name + ", " + c.replicas + (c.replicas == 1 ? " replica" : " replicas"), DB[c.db].base * REPLICA[c.replicas]);
    add("dbStorage", "Database", c.dbStorage + " TB database storage", c.dbStorage * 260);
    return lines;
  }
  function totals(lines) {
    var t = { oracle: 0, aws: 0, azure: 0, gcp: 0 };
    lines.forEach(function (l) { PROVIDERS.forEach(function (p) { t[p.k] += l[p.k]; }); });
    t.avg = (t.aws + t.azure + t.gcp) / 3;
    return t;
  }

  /* Oracle-native optimisations; applying one lowers the monthly Oracle run-rate */
  var RECS = [
    { id: "schedule", title: "Pause non-production overnight", desc: "Dev and test pools off 23:00–05:00 SGT, when no departure banks are scheduled", save: 640, group: "Compute", seg: "tourism" },
    { id: "rightsize", title: "Rightsize Terminal 4 retail POS nodes", desc: "18% average CPU over 30 days; move to flexible 4-core shapes", save: 412, group: "Compute", seg: "retail" },
    { id: "autopilot", title: "Turn on HeatWave Autopilot", desc: "Automatic shape and node-count advice for the operations analytics cluster", save: 210, group: "Database", seg: "ops" },
    { id: "archive", title: "Tier cold logs to Archive Storage", desc: "Flight-display and cargo manifests older than 90 days leave the standard tier", save: 180, group: "Storage", seg: "cargo" },
    { id: "credits", title: "Commit to annual Universal Credits", desc: "A pre-paid annual commitment at 6% off list, across every service", rate: .06 }
  ];

  var SEGMENTS = {
    tourism: { name: "Tourism", lede: "Live cost and capacity for Changi's Oracle Cloud estate, scaling with every flight bank.", opt: "The executive view for passenger-facing systems: what the move saves, and what the next optimisations add." },
    cargo: { name: "Aviation Cargo", lede: "Live cost and capacity for cargo systems, scaling with every freighter wave at the Airfreight Centre.", opt: "The executive view for cargo systems: what the move saves, and what the next optimisations add." },
    retail: { name: "Retail Concessions", lede: "Live cost and capacity for retail systems, scaling with footfall across the terminals and Jewel.", opt: "The executive view for retail and concessions: what the move saves, and what the next optimisations add." },
    ops: { name: "Airport Operations", lede: "Live cost and capacity for airside operations, scaling with every movement on the runways.", opt: "The executive view for airport operations: what the move saves, and what the next optimisations add." }
  };

  var state = {
    cfg: Object.assign({}, DEFAULT_CFG),     // applied topology, drives every view
    draft: Object.assign({}, DEFAULT_CFG),   // what the Configure form currently shows
    applied: {},                             // optimisation ids switched on
    segment: "tourism",
    roi: { years: 5, growth: .06, migration: 36000, against: "avg" }
  };

  /* Monthly figures after optimisations, split by service group */
  function model() {
    var lines = costLines(state.cfg), t = totals(lines), groups = {};
    GROUPS.forEach(function (g) { groups[g.k] = 0; });
    lines.forEach(function (l) { groups[l.group] += l.oracle; });
    var flat = 0;
    RECS.forEach(function (r) {
      if (!state.applied[r.id] || r.rate) return;
      var cut = Math.min(r.save, groups[r.group] * .5);
      groups[r.group] -= cut; flat += cut;
    });
    var gross = t.oracle - flat, rate = state.applied.credits ? RECS[4].rate : 0;
    GROUPS.forEach(function (g) { groups[g.k] *= (1 - rate); });
    var eff = gross * (1 - rate);
    return { lines: lines, t: t, groups: groups, gross: gross, eff: eff, unlocked: t.oracle - eff };
  }

  function roiSeries(m) {
    var r = state.roi, out = [];
    PROVIDERS.concat([{ k: "avg" }]).forEach(function (p) {
      var monthly = p.k === "oracle" ? m.eff : m.t[p.k], cum = p.k === "oracle" ? r.migration : 0, vals = [cum];
      for (var y = 0; y < r.years; y++) { cum += monthly * 12 * Math.pow(1 + r.growth, y); vals.push(cum); }
      out[p.k] = vals;
    });
    return out;
  }
  function payback(m, against) {
    var monthlySave = (against === "avg" ? m.t.avg : m.t[against]) - m.eff;
    if (state.roi.migration <= 0) return 0;
    return monthlySave > 0 ? state.roi.migration / monthlySave : Infinity;
  }

  /* ---------- Time (Singapore, UTC+8) ---------- */
  function sgt() { var d = new Date(Date.now() + 8 * 3600e3); return { d: d, h: d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600 }; }
  function two(n) { return (n < 10 ? "0" : "") + n; }
  function hhmm(h) { h = ((h % 24) + 24) % 24; return two(Math.floor(h)) + ":" + two(Math.floor((h % 1) * 60 + 1e-6)); }

  /* Passengers per hour across the terminals, thousands, by hour of day */
  var PAX = [5.2, 3.6, 2.1, 1.5, 2.0, 4.8, 8.6, 10.9, 11.6, 10.8, 9.4, 8.7, 8.9, 9.1, 8.6, 8.2, 8.8, 9.6, 10.2, 10.9, 11.3, 10.6, 9.0, 7.1];
  function wobble(i) { var x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return (x - Math.floor(x) - .5) * .07; }
  function paxAt(h) {
    var hh = ((h % 24) + 24) % 24, i = Math.floor(hh), f = hh - i, a = PAX[i], b = PAX[(i + 1) % 24];
    var v = a + (b - a) * (1 - Math.cos(f * Math.PI)) / 2;
    return v * (1 + wobble(Math.round(h * 4)));
  }
  function nodesAt(h) { return Math.round(state.cfg.instances * (1 + paxAt(h) * .135)); }
  var AVG_FACTOR = (function () { var s = 0; for (var q = 0; q < 96; q++) s += 1 + paxAt(q / 4) * .135; return s / 96; })();
  /* Hourly burn: compute follows the node count, everything else is flat */
  function burnAt(h, m) {
    var compute = m.groups.Compute, rest = m.eff - compute;
    return (rest + compute * ((1 + paxAt(h) * .135) / AVG_FACTOR)) / 730;
  }

  /* ---------- Charts ---------- */
  var NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function niceMax(v) {
    if (v <= 0) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  }

  /* Line/area plot with crosshair tooltip. opts: n, series[{values,color,area,step,dashFrom,label}],
     xTicks[{i,label}], yFmt, nowAt, endLabels, tip(i) -> html, noTip, onHover(i|null) */
  function plot(el, opts) {
    el._opts = opts;
    var w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    el.innerHTML = "";
    var m = { l: 46, r: opts.endLabels ? 104 : 10, t: 10, b: 24 };
    var iw = w - m.l - m.r, ih = h - m.t - m.b, n = opts.n;
    var max = -Infinity, min = Infinity;
    opts.series.forEach(function (s) { s.values.forEach(function (v) { if (v > max) max = v; if (v < min) min = v; }); });
    var step = niceMax(((max * 1.04) - Math.min(0, min)) / 4);
    var yMin = Math.min(0, Math.floor(min / step) * step), yMax = Math.max(step, Math.ceil(max * 1.04 / step) * step);
    var X = function (i) { return m.l + (n === 1 ? 0 : i / (n - 1) * iw); };
    var Y = function (v) { return m.t + ih - (v - yMin) / (yMax - yMin) * ih; };
    var svg = svgEl("svg", { viewBox: "0 0 " + w + " " + h, role: "img", "aria-label": el.getAttribute("aria-label") || "" }, el);

    var g = svgEl("g", { "class": "grid" }, svg), ax = svgEl("g", { "class": "axis" }, svg);
    for (var v = yMin; v <= yMax + step / 2; v += step) {
      var y = Y(v);
      svgEl("line", { x1: m.l, x2: m.l + iw, y1: y, y2: y }, g);
      svgEl("text", { x: m.l - 10, y: y + 4, "text-anchor": "end" }, ax).textContent = opts.yFmt(v);
    }
    (opts.xTicks || []).forEach(function (t) {
      svgEl("text", { x: X(t.i), y: h - 6, "text-anchor": t.anchor || "middle" }, ax).textContent = t.label;
    });

    if (opts.nowAt != null) {
      svgEl("line", { "class": "now-line", x1: X(opts.nowAt), x2: X(opts.nowAt), y1: m.t, y2: m.t + ih }, svg);
      svgEl("text", { "class": "now-label", x: X(opts.nowAt) + 6, y: m.t + 10 }, svg).textContent = "now";
    }

    function pathFor(vals, from, to, step) {
      var d = "";
      for (var i = from; i <= to; i++) {
        var x = X(i), y = Y(vals[i]);
        if (i === from) d += "M" + x + " " + y;
        else d += step ? "H" + x + "V" + y : "L" + x + " " + y;
      }
      return d;
    }
    opts.series.forEach(function (s) {
      var last = n - 1, cut = s.dashFrom == null ? last : s.dashFrom;
      if (s.area) {
        svgEl("path", { d: pathFor(s.values, 0, cut, s.step) + "V" + (m.t + ih) + "H" + X(0) + "Z", style: "fill:" + s.color + ";opacity:.14" }, svg);
        if (cut < last) svgEl("path", { d: pathFor(s.values, cut, last, s.step) + "V" + (m.t + ih) + "H" + X(cut) + "Z", style: "fill:" + s.color + ";opacity:.06" }, svg);
      }
      var line = svgEl("path", { d: pathFor(s.values, 0, cut, s.step), fill: "none", "stroke-width": s.width || 2, "stroke-linejoin": "round", "stroke-linecap": "round", style: "stroke:" + s.color + (s.dim ? ";opacity:.3" : "") }, svg);
      if (!reduceMotion && opts.draw) {
        var len = line.getTotalLength();
        line.style.strokeDasharray = len; line.style.strokeDashoffset = len;
        line.getBoundingClientRect();
        line.style.transition = "stroke-dashoffset 1s cubic-bezier(.2,.7,.2,1)";
        line.style.strokeDashoffset = 0;
      }
      if (cut < last) svgEl("path", { d: pathFor(s.values, cut, last, s.step), fill: "none", "stroke-width": 2, "stroke-dasharray": "4 4", style: "stroke:" + s.color + ";opacity:.75" }, svg);
      if (opts.endLabels) {
        var ev = s.values[last];
        svgEl("circle", { "class": "dot", cx: X(last), cy: Y(ev), r: 4.5, style: "fill:" + s.color + (s.dim ? ";opacity:.3" : "") }, svg);
        s._ly = Y(ev);
      }
    });
    if (opts.endLabels) {
      // Nudge end labels apart so they never collide
      var labs = opts.series.slice().sort(function (a, b) { return a._ly - b._ly; });
      for (var j = 1; j < labs.length; j++) if (labs[j]._ly - labs[j - 1]._ly < 15) labs[j]._ly = labs[j - 1]._ly + 15;
      labs.forEach(function (s) {
        svgEl("text", { "class": "end-label", x: X(n - 1) + 10, y: s._ly + 4, style: s.dim ? "opacity:.45" : "" }, svg).textContent = s.label;
      });
    }

    // Hover layer: crosshair, dots and tooltip
    var xh = svgEl("line", { "class": "xhair", y1: m.t, y2: m.t + ih, visibility: "hidden" }, svg);
    var dots = opts.series.map(function (s) { return svgEl("circle", { "class": "dot", r: 4.5, visibility: "hidden", style: "fill:" + s.color }, svg); });
    var tip = document.createElement("div"); tip.className = "tip"; el.appendChild(tip);
    if (opts.noTip) tip.style.display = "none";
    var hit = svgEl("rect", { "class": "hit", x: m.l, y: m.t, width: iw, height: ih }, svg);

    function show(i) {
      if (i == null) { xh.setAttribute("visibility", "hidden"); dots.forEach(function (d) { d.setAttribute("visibility", "hidden"); }); tip.classList.remove("show"); return; }
      var x = X(i);
      xh.setAttribute("x1", x); xh.setAttribute("x2", x); xh.setAttribute("visibility", "visible");
      opts.series.forEach(function (s, k) { dots[k].setAttribute("cx", x); dots[k].setAttribute("cy", Y(s.values[i])); dots[k].setAttribute("visibility", "visible"); });
      tip.innerHTML = opts.tip(i);
      tip.classList.add("show");
      var tw = tip.offsetWidth, left = x + 14;
      if (left + tw > w) left = x - tw - 14;
      tip.style.left = Math.max(0, left) + "px";
      tip.style.top = m.t + "px";
    }
    function pick(e) {
      var r = svg.getBoundingClientRect(), px = (e.clientX - r.left) * (w / r.width);
      return clamp(Math.round((px - m.l) / iw * (n - 1)), 0, n - 1);
    }
    hit.addEventListener("pointermove", function (e) { var i = pick(e); show(i); if (opts.onHover) opts.onHover(i); });
    hit.addEventListener("pointerleave", function () { show(null); if (opts.onHover) opts.onHover(null); });
    el._show = show;
  }

  var ro = "ResizeObserver" in window ? new ResizeObserver(function (entries) {
    entries.forEach(function (en) {
      var el = en.target;
      if (el._opts && el.clientWidth && el._w !== el.clientWidth) { el._w = el.clientWidth; plot(el, Object.assign({}, el._opts, { draw: false })); }
    });
  }) : null;
  function watch(el) { if (ro && !el._watched) { el._watched = true; el._w = el.clientWidth; ro.observe(el); } }

  /* ---------- Mission Control ---------- */
  var WORKLOADS = [
    { name: "Flight information displays", scope: "All terminals", share: .14, seg: "ops", load: 1.05 },
    { name: "Check-in and bag drop", scope: "T1 to T4", share: .18, seg: "tourism", load: 1.2 },
    { name: "Baggage handling", scope: "T1 to T4", share: .16, seg: "ops", load: 1.1 },
    { name: "Immigration e-gates sync", scope: "All terminals", share: .08, seg: "tourism", load: .9 },
    { name: "Retail POS and iShopChangi", scope: "Terminals and Jewel", share: .14, seg: "retail", load: 1 },
    { name: "Changi App and web", scope: "Public", share: .12, seg: "tourism", load: .95 },
    { name: "Cargo community system", scope: "Airfreight Centre", share: .08, seg: "cargo", load: .7 },
    { name: "HeatWave analytics", scope: "Data platform", share: .10, seg: "ops", load: .8 }
  ];
  var TERMINALS = [
    { name: "T1", share: .22, cap: 3.0 }, { name: "T2", share: .21, cap: 2.9 }, { name: "T3", share: .3, cap: 4.0 },
    { name: "T4", share: .12, cap: 1.9 }, { name: "Jewel", share: .15, cap: 2.4, footfall: true }
  ];

  function jitter(a) { return 1 + (Math.random() - .5) * a; }

  function renderFlow(draw) {
    var now = sgt().h, start = now - 24, steps = 30 * 4, xs = [];
    for (var i = 0; i <= steps; i++) xs.push(start + i / 4);
    var pax = xs.map(function (h) { return paxAt(h) * 1000; });
    var nodes = xs.map(nodesAt);
    var nowI = 96, ticks = [];
    for (var j = 0; j <= steps; j += 24) ticks.push({ i: j, label: hhmm(xs[j]), anchor: j === 0 ? "start" : j === steps ? "end" : "middle" });
    var paxEl = $("#flowPax"), nodeEl = $("#flowNodes");
    var tip = function (i) {
      return "<b>" + hhmm(xs[i]) + " SGT" + (i > nowI ? " · forecast" : "") + "</b>" +
        '<div class="row"><span><i style="background:var(--pax)"></i>Passengers</span><em>' + Math.round(pax[i]).toLocaleString("en-US") + "/hr</em></div>" +
        '<div class="row"><span><i style="background:var(--brand)"></i>Nodes</span><em>' + nodes[i] + "</em></div>";
    };
    plot(paxEl, { n: xs.length, series: [{ values: pax, color: "var(--pax)", area: true, dashFrom: nowI }], xTicks: [], yFmt: function (v) { return v ? Math.round(v / 1000) + "k" : "0"; }, nowAt: nowI, tip: tip, draw: draw, onHover: function (i) { if (nodeEl._show) nodeEl._show(i); } });
    plot(nodeEl, { n: xs.length, series: [{ values: nodes, color: "var(--brand)", area: true, step: true, dashFrom: nowI }], xTicks: ticks, yFmt: function (v) { return Math.round(v); }, nowAt: nowI, tip: tip, noTip: true, draw: draw, onHover: function (i) { if (paxEl._show) paxEl._show(i); } });
    watch(paxEl); watch(nodeEl);
  }

  // Same load drives the airfield schematic: a bar per terminal, a ring for Jewel
  function mapTerminal(name, load) {
    var g = $("#am" + name), f = Math.min(1, load);
    if (!g) return;
    g.classList.toggle("hot", load > .82);
    g.querySelector(name === "Jewel" ? ".am-jval" : ".am-val").textContent = pct(load);
    var ring = g.querySelector(".am-ring"), bar = g.querySelector(".am-fill");
    if (ring) ring.setAttribute("stroke-dasharray", (f * 100).toFixed(1) + " 100");
    else bar.setAttribute("width", (f * bar.getAttribute("data-w")).toFixed(1));
  }

  function renderTerminals() {
    var h = sgt().h, total = paxAt(h);
    $("#termTime").textContent = hhmm(h) + " SGT";
    $("#termList").innerHTML = TERMINALS.map(function (t) {
      var v = total * t.share * jitter(.06), load = v / t.cap;
      mapTerminal(t.name, load);
      return '<li class="term"><span class="term-name">' + t.name + '</span>' +
        '<span class="term-bar"><i class="' + (load > .82 ? "hot" : "") + '" style="width:' + Math.min(100, load * 100).toFixed(1) + '%"></i></span>' +
        '<span class="term-val">' + Math.round(v * 1000).toLocaleString("en-US") + "<small>" + (t.footfall ? "visitors/hr" : "pax/hr") + "</small></span>" +
        '<span class="term-meta">' + pct(load) + " of design capacity" + (load > .82 ? " · pre-scaled" : "") + "</span></li>";
    }).join("");
    // Next peak in the coming 12 hours
    var best = h, bestV = 0;
    for (var q = 2; q <= 48; q++) { var v = paxAt(h + q / 4); if (v > bestV) { bestV = v; best = h + q / 4; } }
    $("#termHint").innerHTML = "Next peak around <b>" + hhmm(Math.round(best * 2) / 2) + " SGT</b>, about " + Math.round(bestV * 1000).toLocaleString("en-US") + " passengers an hour. Node pools pre-scale to <b>" + nodesAt(best) + "</b> fifteen minutes before.";
  }

  function renderWorkloads() {
    var m = model(), h = sgt().h, nodes = nodesAt(h), factor = paxAt(h) / 11.6, burn = burnAt(h, m);
    $("#wlBody").innerHTML = WORKLOADS.map(function (w) {
      var cpu = clamp(Math.round((28 + factor * 55 * w.load) * jitter(.12)), 6, 97);
      var n = Math.max(1, Math.round(nodes * w.share));
      var hot = cpu > 80, focus = w.seg === state.segment;
      return '<tr class="' + (focus ? "is-focus" : "") + '"><td class="wl-name">' + w.name + '</td><td class="wl-scope">' + w.scope + '</td>' +
        '<td class="num">' + n + '</td><td class="num"><span class="cpu"><i><b class="' + (hot ? "hot" : "") + '" style="width:' + cpu + '%"></b></i>' + cpu + "%</span></td>" +
        '<td class="num">' + money(burn * w.share, 2) + '</td><td><span class="st ' + (hot ? "st-warn" : "st-good") + '">' + (hot ? "Scaling" : "Healthy") + "</span></td></tr>";
    }).join("");
  }

  function renderGuards() {
    var m = model(), c = state.cfg, s = sgt(), dim = new Date(Date.UTC(s.d.getUTCFullYear(), s.d.getUTCMonth() + 1, 0)).getUTCDate();
    var elapsed = (s.d.getUTCDate() - 1 + s.h / 24) / dim, budget = budgetFor(m), used = m.eff * elapsed / budget;
    var idle = state.applied.rightsize ? 0 : 3;
    var items = [
      { t: "Monthly budget", st: used <= elapsed * 1.02 ? "good" : "warn", label: used <= elapsed * 1.02 ? "On pace" : "Ahead of pace", sub: pct(used) + " used with " + pct(elapsed) + " of the month gone" },
      { t: "Egress allowance", st: c.egress <= 20 ? "good" : "warn", label: c.egress <= 20 ? "Within cap" : "Over cap", sub: c.egress + " TB of the 20 TB monthly cap" },
      { t: "Idle resources", st: idle ? "warn" : "good", label: idle ? idle + " found" : "None", sub: idle ? "Over-provisioned retail POS nodes, $412 a month" : "Retail POS nodes rightsized" },
      { t: "Cloud Guard posture", st: "good", label: "Clean", sub: "0 critical problems across 4 compartments" }
    ];
    $("#guardList").innerHTML = items.map(function (g) {
      return '<li class="guard"><p>' + g.t + '</p><span class="pill ' + g.st + '"><i></i>' + g.label + '</span><p class="sub">' + g.sub + "</p></li>";
    }).join("");
  }

  function budgetFor(m) { return Math.ceil(m.eff * 1.08 / 500) * 500; }

  function tickKpis() {
    var m = model(), s = sgt(), h = s.h, burn = burnAt(h, m);
    // Spend so far today, integrated in 15-minute steps along the passenger curve
    var spent = 0;
    for (var q = 0; q < Math.floor(h * 4); q++) spent += burnAt(q / 4, m) / 4;
    spent += burn * (h - Math.floor(h * 4) / 4);
    var dim = new Date(Date.UTC(s.d.getUTCFullYear(), s.d.getUTCMonth() + 1, 0)).getUTCDate();
    var elapsed = (s.d.getUTCDate() - 1 + h / 24) / dim, mtd = m.eff * elapsed, budget = budgetFor(m);
    $("#kSpendToday").textContent = money(spent, 2);
    $("#kBurn").textContent = money(burn, 2);
    $("#kMtd").textContent = money(mtd);
    $("#kMtdBar").style.width = Math.min(100, mtd / budget * 100) + "%";
    $("#kMtdMark").style.left = (elapsed * 100) + "%";
    $("#kMtdPct").textContent = pct(mtd / budget);
    $("#kBudget").textContent = money(budget);
    $("#kForecast").textContent = money(m.eff);
    $("#kSaved").textContent = money((m.t.avg - m.eff) * elapsed);
    $("#kNodes").textContent = nodesAt(h);
    var la = 1.8 * jitter(.18), lb = 2.4 * jitter(.18);
    $("#kLatency").textContent = la.toFixed(1);
    $("#latA").textContent = la.toFixed(1) + " ms";
    $("#latB").textContent = lb.toFixed(1) + " ms";
    var util = .22 + paxAt(h) / 11.6 * .46;
    $("#tpLink").textContent = pct(util * jitter(.05));
    $("#tpThru").textContent = (util * 10 * state.cfg.links * jitter(.05)).toFixed(1) + " Gbps";
    $("#tpLag").textContent = Math.round(3 + Math.random() * 4) + " s";
  }

  /* Event log: seeded from the last few hours, then streams */
  var logEl = $("#eventLog");
  function logLine(time, tag, cls, text, animate) {
    var li = document.createElement("li");
    if (animate) li.className = "in";
    li.innerHTML = "<time>" + time + '</time><p><span class="tag ' + cls + '">' + tag + "</span>" + esc(text) + "</p>";
    logEl.insertBefore(li, logEl.firstChild);
    while (logEl.children.length > 10) logEl.removeChild(logEl.lastChild);
  }
  function seedLog() {
    logEl.innerHTML = "";
    var h = sgt().h, prev = nodesAt(h - 3), evs = [];
    for (var q = -11; q <= 0; q++) {
      var t = h + q / 4, n = nodesAt(t);
      if (n !== prev) evs.push([t, "Autoscale", "scale", (n > prev ? "+" : "") + (n - prev) + " nodes to " + n + ", following the passenger forecast"]);
      prev = n;
    }
    var m = model();
    evs.push([h - 3.6, "Security", "warn", "WAF blocked 1,284 bot requests on iShopChangi checkout"]);
    evs.push([h - 3.3, "Deploy", "scale", "Flight information displays v4.12 rolled out, zero downtime"]);
    evs.push([h - 2.9, "Optimiser", "cost", "Idle retail POS nodes flagged, $412 a month"]);
    evs.push([h - 2.6, "Backup", "ops", "HeatWave snapshot complete, " + state.cfg.dbStorage + " TB in 4 min"]);
    evs.push([h - 2.1, "Security", "ops", "Cloud Guard scan clean across 4 compartments"]);
    evs.push([h - 1.7, "Replication", "ops", "SG-2 standby in sync, lag 4 s"]);
    evs.push([h - 1.2, "Forecast", "scale", "Passenger forecast refreshed from the flight schedule, " + Math.round(paxAt(h + 1) * 1000).toLocaleString("en-US") + " an hour expected"]);
    evs.push([h - .7, "Cost", "cost", "Run-rate " + money(burnAt(h - .7, m), 2) + " an hour, " + pct(1 - m.eff / m.t.avg) + " under the hyperscaler average"]);
    evs.push([h - .3, "Network", "ops", "FastConnect p95 1.8 ms between Changi DC and SG-1"]);
    evs.sort(function (a, b) { return a[0] - b[0]; }).slice(-10).forEach(function (e) { logLine(hhmm(e[0]), e[1], e[2], e[3], false); });
  }
  var lastNodes = null;
  function streamLog() {
    var h = sgt().h, n = nodesAt(h), m = model(), pick = Math.random();
    if (lastNodes != null && n !== lastNodes) { logLine(hhmm(h), "Autoscale", "scale", (n > lastNodes ? "+" : "") + (n - lastNodes) + " nodes to " + n + ", following the passenger forecast", true); lastNodes = n; return; }
    lastNodes = n;
    var opts = [
      ["Network", "ops", "FastConnect p95 " + (1.8 * jitter(.2)).toFixed(1) + " ms between Changi DC and SG-1"],
      ["Cost", "cost", "Run-rate " + money(burnAt(h, m), 2) + " an hour, " + pct(1 - m.eff / m.t.avg) + " under the hyperscaler average"],
      ["Replication", "ops", "SG-2 standby in sync, lag " + Math.round(2 + Math.random() * 6) + " s"],
      ["Forecast", "scale", "Next departure bank pre-scaled for " + hhmm(Math.ceil(h + .5)) + " SGT"],
      ["Security", "ops", "Cloud Guard scan clean across 4 compartments"],
      ["Budget", paxAt(h) > 10 ? "warn" : "cost", "Peak-hour burn at " + pct(burnAt(h, m) * 730 / m.eff) + " of the monthly average rate"]
    ];
    var o = opts[Math.floor(pick * opts.length)];
    logLine(hhmm(h), o[0], o[1], o[2], true);
  }

  /* ---------- Pricing ---------- */
  var pr = { cat: "All", q: "", sort: null, dir: "desc" };
  function renderPricingSummary() {
    var t = { oracle: 0, aws: 0, azure: 0, gcp: 0 };
    CATALOG.forEach(function (r) { PROVIDERS.forEach(function (p) { t[p.k] += r[p.k]; }); });
    var avg = (t.aws + t.azure + t.gcp) / 3;
    tween($("#prOracleTotal"), t.oracle, function (v) { return money(v); });
    $("#prSaveLede").textContent = pct(1 - t.oracle / avg) + " less";
    $("#prVs").innerHTML = RIVALS.map(function (k) {
      var p = PROVIDERS.filter(function (x) { return x.k === k; })[0];
      return '<div class="vs"><p class="vs-top"><span>' + p.name + "</span><b>" + money(t[k]) + '</b></p>' +
        '<div class="vs-track"><i style="width:100%;background:var(--panel-3)"></i><i class="o" style="width:' + (t.oracle / t[k] * 100).toFixed(1) + '%"></i></div>' +
        '<p class="vs-note">Oracle is <strong>' + pct(1 - t.oracle / t[k]) + " cheaper</strong></p></div>";
    }).join("");
  }
  function renderChips() {
    $("#prChips").innerHTML = ["All"].concat(CATS).map(function (c) {
      var n = c === "All" ? CATALOG.length : CATALOG.filter(function (r) { return r.cat === c; }).length;
      return '<button class="chip" aria-pressed="' + (pr.cat === c) + '" data-cat="' + c + '">' + c + "<small>" + n + "</small></button>";
    }).join("");
  }
  function avgRival(r) { return (r.aws + r.azure + r.gcp) / 3; }
  function renderPricing() {
    var q = pr.q.trim().toLowerCase();
    var rows = CATALOG.filter(function (r) {
      return (pr.cat === "All" || r.cat === pr.cat) && (!q || (r.name + " " + r.spec + " " + r.cat).toLowerCase().indexOf(q) > -1);
    });
    if (pr.sort) {
      var key = pr.sort, dir = pr.dir === "asc" ? 1 : -1;
      rows = rows.slice().sort(function (a, b) {
        var va = key === "name" ? a.name : key === "save" ? 1 - a.oracle / avgRival(a) : a[key];
        var vb = key === "name" ? b.name : key === "save" ? 1 - b.oracle / avgRival(b) : b[key];
        return (va > vb ? 1 : va < vb ? -1 : 0) * dir;
      });
    }
    var html = "", lastCat = null, tot = { oracle: 0, aws: 0, azure: 0, gcp: 0 };
    rows.forEach(function (r) {
      if (!pr.sort && r.cat !== lastCat) { html += '<tr class="cat"><td colspan="7">' + r.cat + "</td></tr>"; lastCat = r.cat; }
      PROVIDERS.forEach(function (p) { tot[p.k] += r[p.k]; });
      var save = 1 - r.oracle / avgRival(r);
      html += '<tr><td class="p-cell"><span class="p-name">' + r.name + '</span><span class="p-spec">' + r.spec + '</span></td>' +
        '<td class="num qty">' + r.qty + '</td><td class="num col-oracle" data-label="Oracle">' + money(r.oracle) + "</td>" +
        RIVALS.map(function (k) {
          var p = PROVIDERS.filter(function (x) { return x.k === k; })[0];
          return '<td class="num" data-label="' + p.name + '">' + money(r[k]) + '<span class="delta">+' + Math.round((r[k] / r.oracle - 1) * 100) + "%</span></td>";
        }).join("") +
        '<td class="col-share"><div class="share"><span>' + pct(save) + ' less</span><div class="share-track"><i style="width:' + (save * 100).toFixed(1) + '%"></i></div></div></td></tr>';
    });
    $("#prBody").innerHTML = html;
    $("#prEmpty").hidden = rows.length > 0;
    var foot = $(".pr-table tfoot");
    if (foot) foot.remove();
    if (rows.length > 1) {
      var tf = document.createElement("tfoot");
      tf.innerHTML = '<tr><td class="p-cell">Total, ' + rows.length + ' products</td><td class="num qty"></td><td class="num col-oracle" data-label="Oracle">' + money(tot.oracle) + "</td>" +
        RIVALS.map(function (k) { return '<td class="num" data-label="' + PROVIDERS.filter(function (x) { return x.k === k; })[0].name + '">' + money(tot[k]) + "</td>"; }).join("") +
        '<td class="col-share"><div class="share"><span>' + pct(1 - tot.oracle / ((tot.aws + tot.azure + tot.gcp) / 3)) + " less</span></div></td></tr>";
      $(".pr-table").appendChild(tf);
    }
    $$(".pr-table .sort").forEach(function (b) {
      if (b.getAttribute("data-sort") === pr.sort) b.setAttribute("data-dir", pr.dir); else b.removeAttribute("data-dir");
    });
  }
  $("#prChips").addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    pr.cat = b.getAttribute("data-cat"); renderChips(); renderPricing();
  });
  $("#prSearch").addEventListener("input", function (e) { pr.q = e.target.value; renderPricing(); });
  $$(".pr-table .sort").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-sort");
      if (pr.sort !== k) { pr.sort = k; pr.dir = k === "name" ? "asc" : "desc"; }
      else if (pr.dir === (k === "name" ? "asc" : "desc")) pr.dir = pr.dir === "asc" ? "desc" : "asc";
      else pr.sort = null;
      renderPricing();
    });
  });

  /* ---------- ROI ---------- */
  function setRangeFill(input) { input.style.setProperty("--p", ((input.value - input.min) / (input.max - input.min) * 100) + "%"); }
  function renderRoi(draw) {
    var m = model(), r = state.roi, S = roiSeries(m), Y = r.years, a = r.against;
    var cmp = S[a][Y], ora = S.oracle[Y], saved = cmp - ora, pb = payback(m, a);
    var aName = a === "avg" ? "the hyperscaler average" : PROVIDERS.filter(function (p) { return p.k === a; })[0].name;
    tween($("#roiSaved"), saved, function (v) { return money(v); });
    tween($("#roiPct"), saved / cmp, function (v) { return pct(v); });
    $("#roiPayback").textContent = pb === 0 ? "Immediate" : pb === Infinity ? "Never" : pb.toFixed(1) + " mo";
    $("#roiSavedNote").textContent = "over " + Y + (Y === 1 ? " year" : " years") + " against " + aName;
    $("#roiLegend").innerHTML = PROVIDERS.map(function (p) { return '<span><i class="sw" style="background:' + p.color + '"></i>' + p.name + "</span>"; }).join("");
    var series = PROVIDERS.map(function (p) {
      return { values: S[p.k], color: p.color, label: p.name, dim: a !== "avg" && p.k !== "oracle" && p.k !== a };
    });
    var ticks = []; for (var y = 0; y <= Y; y++) ticks.push({ i: y, label: y === 0 ? "Start" : "Year " + y, anchor: y === 0 ? "start" : "middle" });
    var el = $("#roiChart");
    plot(el, {
      n: Y + 1, series: series, xTicks: ticks, yFmt: compact, endLabels: true, draw: draw,
      tip: function (i) {
        return "<b>" + (i === 0 ? "Start" : "End of year " + i) + "</b>" + PROVIDERS.map(function (p) {
          return '<div class="row"><span><i style="background:' + p.color + '"></i>' + p.name + "</span><em>" + money(S[p.k][i]) + "</em></div>";
        }).join("");
      }
    });
    watch(el);
    $("#roiTable").innerHTML = "<caption>Cumulative cost by year</caption><tr><th>Year</th>" + PROVIDERS.map(function (p) { return "<th>" + p.name + "</th>"; }).join("") + "</tr>" +
      S.oracle.map(function (_, i) { return "<tr><td>" + i + "</td>" + PROVIDERS.map(function (p) { return "<td>" + money(S[p.k][i]) + "</td>"; }).join("") + "</tr>"; }).join("");
  }
  function bindRoi() {
    var years = $("#roiYears"), growth = $("#roiGrowth"), mig = $("#roiMig");
    function sync() {
      state.roi.years = +years.value; state.roi.growth = growth.value / 100; state.roi.migration = +mig.value;
      $("#roiYearsOut").textContent = years.value + (years.value === "1" ? " year" : " years");
      $("#roiGrowthOut").textContent = growth.value + "%";
      $("#roiMigOut").textContent = money(+mig.value);
      [years, growth, mig].forEach(setRangeFill);
    }
    [years, growth, mig].forEach(function (i) { i.addEventListener("input", function () { sync(); renderRoi(false); }); });
    sync();
    var group = $("#roiAgainst");
    group.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      $$("button", group).forEach(function (x) { x.setAttribute("aria-checked", x === b ? "true" : "false"); x.tabIndex = x === b ? 0 : -1; });
      state.roi.against = b.getAttribute("data-v"); renderRoi(false);
    });
    group.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var bs = $$("button", group), i = bs.indexOf(document.activeElement);
      var n = bs[(i + (e.key === "ArrowRight" ? 1 : bs.length - 1)) % bs.length];
      n.focus(); n.click(); e.preventDefault();
    });
    $$("button", group).forEach(function (x) { x.tabIndex = x.getAttribute("aria-checked") === "true" ? 0 : -1; });
  }

  /* ---------- Configure ---------- */
  var form = $("#cfgForm");
  var NUM_LIMITS = { instances: [1, 200], gpuCount: [0, 8], block: [0, 500], object: [0, 2000], egress: [0, 500], dbStorage: [0, 100] };
  function readForm() {
    var c = {};
    $$("select, input", form).forEach(function (f) {
      var v = f.value;
      if (f.type === "number") { var lim = NUM_LIMITS[f.name]; v = clamp(Math.round(+v || 0), lim[0], lim[1]); }
      else if (["vcpu", "ram", "links", "replicas"].indexOf(f.name) > -1) v = +v;
      c[f.name] = v;
    });
    if (c.gpu === "none") c.gpuCount = 0;
    else if (!c.gpuCount) c.gpuCount = 1;
    return c;
  }
  function writeForm(c) { $$("select, input", form).forEach(function (f) { f.value = c[f.name]; }); }
  function renderEstimate() {
    var c = state.draft, lines = costLines(c), t = totals(lines), groups = {};
    GROUPS.forEach(function (g) { groups[g.k] = 0; });
    lines.forEach(function (l) { groups[l.group] += l.oracle; });
    tween($("#estTotal"), t.oracle, function (v) { return money(v, 2); }, 450);
    $("#estSgd").textContent = "SGD " + Math.round(t.oracle * 1.35).toLocaleString("en-US");
    $("#estYear").textContent = money(t.oracle * 12);
    $("#estBar").innerHTML = GROUPS.map(function (g) { return '<i style="flex-grow:' + groups[g.k].toFixed(2) + ";background:" + g.color + (groups[g.k] ? "" : ";display:none") + '"></i>'; }).join("");
    $("#estLines").innerHTML = lines.map(function (l) {
      var g = GROUPS.filter(function (x) { return x.k === l.group; })[0];
      return '<li><i style="background:' + g.color + '"></i><span>' + esc(l.label) + "</span><b>" + money(l.oracle) + "</b></li>";
    }).join("") + '<li><i style="background:var(--panel-3)"></i><span>Premium support</span><b>Included</b></li>';
    $("#estVs").innerHTML = RIVALS.map(function (k) {
      return "<li><span>" + PROVIDERS.filter(function (p) { return p.k === k; })[0].name + "</span><span><b>" + money(t[k]) + "</b><em>+" + Math.round((t[k] / t.oracle - 1) * 100) + "%</em></span></li>";
    }).join("");
    var dirty = JSON.stringify(state.draft) !== JSON.stringify(state.cfg);
    $("#cfgApply").textContent = dirty ? "Apply to Mission Control" : "Applied to Mission Control";
    $("#cfgApply").disabled = !dirty;
    $$("select, input", form).forEach(function (f) { f.closest(".fld").classList.toggle("changed", String(state.cfg[f.name]) !== String(state.draft[f.name])); });
  }
  form.addEventListener("input", function () { state.draft = readForm(); renderEstimate(); });
  form.addEventListener("change", function () { state.draft = readForm(); writeForm(state.draft); renderEstimate(); });
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  $("#cfgReset").addEventListener("click", function () { state.draft = Object.assign({}, DEFAULT_CFG); writeForm(state.draft); renderEstimate(); });
  $("#cfgApply").addEventListener("click", function () {
    state.cfg = Object.assign({}, state.draft);
    renderEstimate(); seedLog();
    logLine(hhmm(sgt().h), "Deploy", "scale", "New topology applied: " + state.cfg.instances + " base instances, " + money(model().eff) + " a month", false);
    toast("Topology applied. Mission Control is running the new stack.");
    go("control");
  });

  /* ---------- Optimizer ---------- */
  function renderOptimizer(draw) {
    var m = model(), r = state.roi;
    // The executive view always reads five years against the average
    var saved5 = (function () {
      var ora = r.migration, avg = 0;
      for (var y = 0; y < 5; y++) { var f = 12 * Math.pow(1 + r.growth, y); ora += m.eff * f; avg += m.t.avg * f; }
      return { ora: ora, avg: avg };
    })();
    tween($("#oAnnual"), (m.t.avg - m.eff) * 12, function (v) { return money(v); });
    tween($("#oTco"), 1 - saved5.ora / saved5.avg, function (v) { return pct(v); });
    var pb = payback(m, "avg");
    $("#oPayback").textContent = pb === 0 ? "Immediate" : pb.toFixed(1) + " mo";
    tween($("#oMonthly"), m.eff, function (v) { return money(v, 2); });
    var on = RECS.filter(function (x) { return state.applied[x.id]; }).length;
    $("#oMonthlyNote").textContent = on ? "After " + on + (on === 1 ? " optimisation" : " optimisations") : "Current topology, before optimisations";
    tween($("#recTotal"), m.unlocked, function (v) { return money(v); });

    // Recommendations, the one suggested for this segment first
    var recs = RECS.slice().sort(function (a, b) { return (b.seg === state.segment) - (a.seg === state.segment); });
    $("#recList").innerHTML = recs.map(function (x) {
      var save = x.rate ? m.gross * x.rate : x.save;
      var isOn = !!state.applied[x.id], suggested = x.seg === state.segment;
      return '<li class="rec' + (isOn ? " on" : "") + '"><p class="rec-title">' + x.title + (suggested ? ' <span class="rec-tag">Suggested for ' + SEGMENTS[state.segment].name + "</span>" : "") + "</p>" +
        '<p class="sub">' + x.desc + '</p><span class="rec-save">−' + money(save) + "/mo</span>" +
        '<button class="switch" role="switch" aria-checked="' + isOn + '" aria-label="' + esc(x.title) + '" data-rec="' + x.id + '"></button></li>';
    }).join("");

    // Donut by service group
    var total = 0; GROUPS.forEach(function (g) { total += m.groups[g.k]; });
    var dn = $("#donut"), R = 70, C = 2 * Math.PI * R, off = 0;
    dn.innerHTML = "";
    var svg = svgEl("svg", { viewBox: "0 0 180 180", role: "img", "aria-label": "Monthly Oracle spend by service" }, dn);
    svgEl("circle", { cx: 90, cy: 90, r: R, fill: "none", "stroke-width": 22, style: "stroke:var(--panel-2)" }, svg);
    GROUPS.forEach(function (g, i) {
      var v = m.groups[g.k]; if (!v) return;
      var len = v / total * C, gap = Math.min(3, len / 2);
      var arc = svgEl("circle", { "class": "seg-arc", cx: 90, cy: 90, r: R, fill: "none", "stroke-width": 22, "stroke-dasharray": (len - gap) + " " + (C - len + gap), "stroke-dashoffset": -off, transform: "rotate(-90 90 90)", style: "stroke:" + g.color, "data-i": i }, svg);
      if (!reduceMotion && draw) { arc.style.strokeDasharray = "0 " + C; arc.getBoundingClientRect(); arc.style.transition = "stroke-dasharray .9s cubic-bezier(.2,.7,.2,1) " + (i * .08) + "s"; arc.style.strokeDasharray = (len - gap) + " " + (C - len + gap); }
      off += len;
    });
    var center = document.createElement("div"); center.className = "donut-center";
    dn.appendChild(center);
    function centerShow(i) {
      center.innerHTML = i == null ? "<b>" + money(m.eff) + "</b><span>a month</span>" : "<b>" + money(m.groups[GROUPS[i].k]) + "</b><span>" + GROUPS[i].k + "</span>";
      $$(".seg-arc", dn).forEach(function (a) { a.style.opacity = i == null || +a.getAttribute("data-i") === i ? 1 : .3; });
      $$("#donutLegend li").forEach(function (li, k) { li.style.opacity = i == null || k === i ? 1 : .45; });
    }
    $("#donutLegend").innerHTML = GROUPS.map(function (g) {
      return '<li><i style="background:' + g.color + '"></i><span>' + g.k + "<small>" + pct(m.groups[g.k] / total) + "</small></span><b>" + money(m.groups[g.k]) + "</b></li>";
    }).join("");
    $$(".seg-arc", dn).forEach(function (a) {
      a.addEventListener("pointerenter", function () { centerShow(+a.getAttribute("data-i")); });
      a.addEventListener("pointerleave", function () { centerShow(null); });
    });
    $$("#donutLegend li").forEach(function (li, k) {
      li.addEventListener("pointerenter", function () { centerShow(k); });
      li.addEventListener("pointerleave", function () { centerShow(null); });
    });
    centerShow(null);

    // Unit economics: what the platform costs per passenger and per flight
    var paxMonth = 0; for (var q = 0; q < 24; q++) paxMonth += PAX[q] * 1000; paxMonth *= 30.4;
    $("#unitList").innerHTML = [
      ["Per passenger", money(m.eff / paxMonth * 100, 2).replace("$", "") + "¢", money(m.t.avg / paxMonth * 100, 2).replace("$", "") + "¢"],
      ["Per flight", money(m.eff / (1100 * 30.4), 2), money(m.t.avg / (1100 * 30.4), 2)],
      ["Per node-hour", money(m.groups.Compute / (state.cfg.instances * AVG_FACTOR * 730), 3), money(m.groups.Compute * 2.01 / (state.cfg.instances * AVG_FACTOR * 730), 3)]
    ].map(function (u) { return "<li><span>" + u[0] + "</span><b>" + u[1] + "</b><small>vs " + u[2] + "</small></li>"; }).join("");

    // Five-year TCO bars: Oracle in brand colour, rivals neutral
    var five = {};
    PROVIDERS.forEach(function (p) {
      var monthly = p.k === "oracle" ? m.eff : m.t[p.k], cum = p.k === "oracle" ? r.migration : 0;
      for (var y = 0; y < 5; y++) cum += monthly * 12 * Math.pow(1 + r.growth, y);
      five[p.k] = cum;
    });
    var maxV = Math.max(five.aws, five.azure, five.gcp), worst = RIVALS.filter(function (k) { return five[k] === maxV; })[0];
    $("#tcoBars").innerHTML = PROVIDERS.map(function (p) {
      var isO = p.k === "oracle";
      return '<div class="hbar' + (isO ? " is-oracle" : "") + '"><span class="hbar-name">' + p.name + '</span><span class="hbar-track"><i style="width:' + (draw ? 0 : five[p.k] / maxV * 100) + "%;background:" + (isO ? "var(--s-oracle)" : "var(--panel-3)") + '" data-w="' + (five[p.k] / maxV * 100).toFixed(1) + '"></i></span><span class="hbar-val">' + money(five[p.k]) + "</span></div>";
    }).join("") + '<p class="hbar-note">Oracle saves <b>' + money(maxV - five.oracle) + "</b> over five years against " + PROVIDERS.filter(function (p) { return p.k === worst; })[0].name + ", the most expensive option.</p>";
    if (draw) requestAnimationFrame(function () { $$("#tcoBars .hbar-track i").forEach(function (i) { i.style.width = i.getAttribute("data-w") + "%"; }); });

    // Savings build-up, month by month over five years
    var vals = [0], cum = -r.migration;
    vals[0] = cum;
    for (var mo = 1; mo <= 60; mo++) { cum += (m.t.avg - m.eff) * Math.pow(1 + r.growth, Math.floor((mo - 1) / 12)); vals.push(cum); }
    var ticks = [0, 12, 24, 36, 48, 60].map(function (i) { return { i: i, label: i === 0 ? "Start" : "Year " + i / 12, anchor: i === 0 ? "start" : i === 60 ? "end" : "middle" }; });
    var el = $("#saveChart");
    plot(el, {
      n: 61, series: [{ values: vals, color: "var(--good)", area: true }], xTicks: ticks, yFmt: compact, draw: draw,
      tip: function (i) { return "<b>" + (i === 0 ? "Migration" : "Month " + i) + '</b><div class="row"><span><i style="background:var(--good)"></i>Saved to date</span><em>' + money(vals[i]) + "</em></div>"; }
    });
    watch(el);
  }
  $("#recList").addEventListener("click", function (e) {
    var b = e.target.closest(".switch"); if (!b) return;
    var id = b.getAttribute("data-rec");
    state.applied[id] = !state.applied[id];
    renderOptimizer(false);
    var nb = $('.switch[data-rec="' + id + '"]'); if (nb) nb.focus();
    toast(state.applied[id] ? "Optimisation applied. Mission Control updated." : "Optimisation removed.");
  });
  $("#exportBtn").addEventListener("click", function () { window.print(); });

  /* ---------- Segment ---------- */
  $("#segment").addEventListener("change", function (e) {
    state.segment = e.target.value;
    $("#mcLede").textContent = SEGMENTS[state.segment].lede;
    $("#optLede").textContent = SEGMENTS[state.segment].opt;
    renderWorkloads();
    if (current === "dashboard") renderOptimizer(false);
    toast("Personalised for " + SEGMENTS[state.segment].name + ".");
  });

  /* ---------- Theme: light brand default, dark night operations ---------- */
  var themeBtn = $("#themeBtn"), root = document.documentElement;
  function syncTheme() {
    var dark = root.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
    $('meta[name="theme-color"]').setAttribute("content", dark ? "#150d1b" : "#f4f5f7");
  }
  themeBtn.addEventListener("click", function () {
    var dark = root.getAttribute("data-theme") !== "dark";
    if (dark) root.setAttribute("data-theme", "dark"); else root.removeAttribute("data-theme");
    try { localStorage.setItem("changi-theme", dark ? "dark" : "light"); } catch (e) {}
    syncTheme();
  });
  syncTheme();

  /* ---------- Toast ---------- */
  var toastT;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 2400);
  }

  /* ---------- Views & navigation ---------- */
  var PAGES = ["control", "pricing", "roi", "configure", "dashboard"];
  var tabs = $$(".tab"), current = null, busy = false;
  function renderPage(id, draw) {
    if (id === "control") { tickKpis(); renderFlow(draw); renderTerminals(); renderWorkloads(); renderGuards(); }
    else if (id === "pricing") { renderPricingSummary(); renderPricing(); }
    else if (id === "roi") renderRoi(draw);
    else if (id === "configure") { writeForm(state.draft); renderEstimate(); }
    else if (id === "dashboard") renderOptimizer(draw);
  }
  function activate(id, animate) {
    $$(".page").forEach(function (p) { p.classList.remove("active", "entering"); });
    var page = $("#page-" + id);
    page.classList.add("active");
    if (animate) { page.offsetWidth; page.classList.add("entering"); }
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-page") === id;
      t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1;
    });
    current = id;
    document.title = page.getAttribute("data-title") + " · Changi + Oracle";
    renderPage(id, animate);
  }
  /* ---------- Preloader: logo and progress bar, on boot and on every view change ---------- */
  var pre = $("#preloader");
  function runBoard(id, o) {
    var t0, shown = 0, done = false, fill = $("#bpFill"), label = $("#bpPct"), bar = $(".boot-progress");
    bar.classList.remove("on"); fill.style.width = "0%"; label.textContent = "0%";
    pre.classList.remove("lift", "hide");
    setTimeout(function () { bar.classList.add("on"); t0 = performance.now(); requestAnimationFrame(tick); }, o.delay);
    // Eases towards 100 over o.min; holds at 92 while o.ready() is false, but never hangs
    function tick(now) {
      var k = Math.min(1, (now - t0) / o.min), target = (1 - Math.pow(1 - k, 2)) * 100;
      if (o.ready && !o.ready() && now - t0 < o.min + 2400) target = Math.min(target, 92);
      shown += (target - shown) * .22;
      if (target === 100 && shown > 99.5) shown = 100;
      fill.style.width = shown + "%";
      label.textContent = Math.floor(shown) + "%";
      if (shown < 100) return requestAnimationFrame(tick);
      if (done) return; done = true;
      setTimeout(function () {
        $("#bootStatus").textContent = $("#page-" + id).getAttribute("data-title") + " ready";
        o.done();
        pre.classList.add("lift", "hide");
      }, o.settle);
    }
  }

  function go(id) {
    if (PAGES.indexOf(id) < 0 || id === current || busy) return;
    if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    if (reduceMotion) { activate(id, false); window.scrollTo(0, 0); return; }
    busy = true;
    $("#bootStatus").textContent = "Opening " + $("#page-" + id).getAttribute("data-title");
    pre.classList.add("nav");
    runBoard(id, {
      delay: 60, min: 560, settle: 120,
      done: function () {
        activate(id, true); window.scrollTo({ top: 0 });
        setTimeout(function () { pre.classList.remove("nav"); busy = false; }, 240);
      }
    });
  }
  tabs.forEach(function (t) { t.addEventListener("click", function () { go(t.getAttribute("data-page")); }); });
  $(".tabs").addEventListener("keydown", function (e) {
    var i = tabs.indexOf(document.activeElement); if (i < 0) return;
    var n = e.key === "ArrowRight" ? (i + 1) % tabs.length : e.key === "ArrowLeft" ? (i + tabs.length - 1) % tabs.length : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : -1;
    if (n < 0) return;
    e.preventDefault(); tabs[n].focus(); go(tabs[n].getAttribute("data-page"));
  });
  $$("[data-goto]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); go(a.getAttribute("data-goto")); }); });
  window.addEventListener("hashchange", function () {
    var id = location.hash.slice(1);
    if (PAGES.indexOf(id) > -1 && id !== current) activate(id, false);
  });

  /* ---------- Live clock & telemetry ---------- */
  function clock() {
    var d = sgt().d;
    $("#sgtClock").textContent = two(d.getUTCHours()) + ":" + two(d.getUTCMinutes()) + ":" + two(d.getUTCSeconds());
  }
  var sec = 0;
  setInterval(function () {
    if (document.hidden) return;
    clock(); sec++;
    if (current !== "control") return;
    tickKpis();
    if (sec % 2 === 0) { renderWorkloads(); renderTerminals(); }
    if (sec % 6 === 0) streamLog();
    if (sec % 60 === 0) { renderFlow(false); renderGuards(); }
  }, 1000);

  /* ---------- Boot ---------- */
  bindRoi(); renderChips(); clock(); seedLog(); lastNodes = nodesAt(sgt().h);
  // Every fresh load plays the preloader into the view in the address; embedded previews skip it
  var startId = PAGES.indexOf(location.hash.slice(1)) > -1 ? location.hash.slice(1) : "control";
  var embedded = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  if (embedded || reduceMotion) {
    pre.classList.add("hide");
    activate(startId, false);
  } else {
    boardBoot(startId);
  }

  function boardBoot(id) {
    var loaded = document.readyState === "complete";
    if (!loaded) window.addEventListener("load", function () { loaded = true; });
    // The bar runs a second longer than it needs to, so the brand moment registers
    runBoard(id, { delay: 300, min: 1900, settle: 220, ready: function () { return loaded; }, done: function () { activate(id, true); } });
  }
})();
