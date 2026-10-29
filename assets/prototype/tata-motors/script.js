/* Tata Motors AI Workspace: one sample catalogue drives every page */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var page = document.body.getAttribute("data-page");
  var params = new URLSearchParams(location.search);

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function num(n) { return Math.round(n).toLocaleString("en-IN"); }
  function compact(n) { return n >= 1e5 ? (n / 1e5).toFixed(1).replace(/\.0$/, "") + " lakh" : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k" : num(n); }
  function ms(v) { return v >= 1000 ? (v / 1000).toFixed(1) + " s" : v + " ms"; }
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function date(iso) { var d = iso.split("-"); return MONTHS[+d[1] - 1] + " " + +d[2] + ", " + d[0]; }
  function list(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
  function clause(t) { return t.charAt(0).toLowerCase() + t.slice(1).replace(/\.\s*$/, ""); }
  function sentence(t) { return /[.!?]$/.test(t) ? t : t + "."; }
  function of(n) { return n > 2 ? " of the " + n : n === 2 ? " of the two" : ""; }
  function initials(n) { var w = n.trim().split(/\s+/); return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase(); }
  var ICON = {
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    // One glyph per category, tinted like the original file badges
    "Natural language": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/></svg>',
    "Computer vision": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    "Predictive maintenance": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/></svg>',
    "Fleet telemetry": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    Generative: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></svg>'
  };
  var CAT_CLASS = { "Natural language": "c-lang", "Computer vision": "c-vision", "Predictive maintenance": "c-maint", "Fleet telemetry": "c-tele", Generative: "c-gen" };
  var PALETTE = ["#2563eb", "#7c3aed", "#60a5fa", "#a78bfa", "#1e40af", "#c4b5fd"];

  /* ---------- Catalogue (sample data, labelled as such in the footer) ---------- */
  var CATEGORIES = ["Natural language", "Computer vision", "Predictive maintenance", "Fleet telemetry", "Generative"];
  var STATUSES = ["Production", "Staging", "In review", "PoC"];
  var PLANTS = ["Pune", "Jamshedpur", "Lucknow", "Pantnagar", "Sanand", "Dharwad"];

  function A(id, name, cat, status, acc, lat, req, plants, owner, updated, ver, desc, tags, extra) {
    var a = { id: id, name: name, cat: cat, status: status, acc: acc, lat: lat, req: req, plants: plants, owner: owner, updated: updated, ver: ver, desc: desc, tags: tags };
    for (var k in extra) a[k] = extra[k];
    return a;
  }
  var ASSETS = [
    A("battery-degradation", "Battery Degradation Predictor", "Predictive maintenance", "Production", 94.7, 120, 52000, ["Pune", "Sanand"], "Rayven Weathers", "2026-10-21", "2.4",
      "Forecasts state of health for EV battery packs from the telemetry of 12,000+ commercial vehicles, and flags packs for service before range drops.", ["EV", "battery", "forecasting", "telemetry"],
      { data: ["Pack telemetry, 2023–2026 (4.1 TB)", "Service records from Tata Motors dealers", "Cell lab cycling tests"], oci: ["Data Science", "Generative AI Agents", "Autonomous Database"] }),
    A("feedback-classifier", "Tata Customer Feedback Classifier", "Natural language", "Production", 98.2, 42, 18400, ["Pune", "Jamshedpur", "Lucknow"], "Priya Sharma", "2026-10-14", "3.2",
      "Sorts owner and passenger feedback into technical, safety, service and layout complaints for the quality teams.", ["NLP", "classification", "feedback", "quality"],
      { data: ["Owner feedback in 9 languages (2.3M rows)", "Dealer service notes"], oci: ["Language", "Data Science"] }),
    A("telemetry-model", "Vehicle Telemetry Model", "Fleet telemetry", "Production", 96.0, 35, 210000, ["Pune", "Jamshedpur", "Lucknow", "Pantnagar"], "Arjun Mehta", "2026-10-15", "5.0",
      "Normalises CAN-bus signals from connected vehicles into one feature store that every downstream model reads.", ["telemetry", "CAN bus", "feature store"],
      { data: ["Connected-vehicle CAN streams", "Fleet Edge gateway logs"], oci: ["Streaming", "Data Flow", "Autonomous Database"] }),
    A("powertrain-anomaly", "Powertrain Anomalies Monitor", "Predictive maintenance", "Production", 89.4, 60, 74000, ["Jamshedpur", "Lucknow"], "Vikram Patel", "2026-10-09", "3.1",
      "Flags abnormal torque, temperature and vibration patterns in diesel and EV powertrains.", ["powertrain", "anomaly", "vibration"],
      { data: ["Dyno test runs", "Field powertrain telemetry"], oci: ["Anomaly Detection", "Data Science"] }),
    A("cabin-voice", "Smart Cabin Voice Assistant", "Natural language", "Production", 95.1, 230, 41000, ["Pune", "Sanand"], "Rayven Weathers", "2026-10-02", "2.2",
      "Understands Hindi, Marathi and English commands for climate, media and navigation in passenger cars.", ["NLP", "voice", "multilingual", "cabin"],
      { data: ["In-cabin voice samples in 3 languages", "Command transcripts"], oci: ["Speech", "Language"] }),
    A("charging-demand", "Charging Demand Forecaster", "Fleet telemetry", "Production", 93.2, 90, 15600, ["Pune", "Sanand"], "Arjun Mehta", "2026-10-05", "1.9",
      "Forecasts depot charging load by the hour so fleet operators avoid peak tariffs.", ["EV", "charging", "forecasting", "depot"],
      { data: ["Depot charger sessions", "State tariff calendars"], oci: ["Data Science", "Autonomous Database"] }),
    A("manual-copilot", "Service Manual Copilot", "Generative", "Production", 93.8, 820, 8700, ["Pune", "Jamshedpur", "Lucknow", "Pantnagar", "Sanand", "Dharwad"], "Priya Sharma", "2026-10-19", "2.0",
      "Answers technician questions from workshop manuals, citing the page and figure it used.", ["RAG", "manuals", "service"],
      { data: ["Workshop manuals for 41 models", "Technical service bulletins"], oci: ["Generative AI", "Search with OpenSearch"] }),
    A("dealer-sentiment", "Dealer Review Sentiment Model", "Natural language", "Production", 92.4, 38, 11200, ["Pune"], "Arjun Mehta", "2026-09-28", "1.7",
      "Scores dealer reviews for sentiment and the reason behind it, from delivery delays to service quality.", ["NLP", "sentiment", "dealers", "reviews"],
      { data: ["Public dealer reviews", "Post-service surveys"], oci: ["Language"] }),
    A("operator-intent", "Vehicle Operator Intent Engine", "Natural language", "Staging", 94.1, 88, 6200, ["Jamshedpur"], "Arjun Mehta", "2026-10-12", "1.6",
      "Reads fleet driver voice notes and safety logs to spot fatigue and risky intent before an incident.", ["NLP", "voice", "fleet", "safety"],
      { data: ["Fleet radio transcripts", "Safety event logs"], oci: ["Speech", "Language", "Data Science"], gate: "Needs fleet-safety sign-off before the Jamshedpur rollout" }),
    A("brake-wear", "Brake Wear Forecasting Model", "Predictive maintenance", "Staging", 88.6, 75, 9800, ["Lucknow"], "Sneha Iyer", "2026-09-19", "1.3",
      "Predicts brake pad wear from braking events so buses are serviced before failure.", ["brakes", "buses", "forecasting"],
      { data: ["Bus braking events", "Workshop pad replacements"], oci: ["Data Science"], gate: "Waiting on Lucknow depot pilot results" }),
    A("supplier-risk", "Supply Chain Risk Scorer", "Generative", "Staging", 90.8, 410, 1200, ["Pune"], "Priya Sharma", "2026-10-16", "1.1",
      "Scores semiconductor and cell suppliers from news, filings and delivery history; it flagged 3 critical dependencies in the Pune pipeline.", ["supply chain", "risk", "semiconductors"],
      { data: ["Supplier delivery history", "News and filings feed"], oci: ["Generative AI", "Data Science"], gate: "Procurement review of the 3 flagged suppliers" }),
    A("cobalt-optimizer", "EV Battery Cost Optimizer", "Generative", "Staging", 92.5, 1800, 300, ["Pune"], "Rayven Weathers", "2026-10-20", "0.8",
      "Generates cell chemistry scenarios that cut cobalt per pack while holding range targets; 4 scenarios are ready for review.", ["EV", "battery", "cost", "chemistry"],
      { data: ["Cell lab results", "Commodity price history"], oci: ["Generative AI", "Data Science"], gate: "Cell engineering to pick 1 of 4 scenarios" }),
    A("driver-drowsiness", "Driver Drowsiness Detector", "Computer vision", "Staging", 92.9, 22, 7300, ["Jamshedpur"], "Sneha Iyer", "2026-10-01", "1.4",
      "Watches the cabin camera for eyelid and head-pose signs of drowsiness in truck drivers.", ["safety", "camera", "fleet"],
      { data: ["Cabin camera clips from night shifts", "Annotated fatigue events"], oci: ["Vision", "Data Science"], gate: "Night-shift validation on 40 trucks" }),
    A("adas-lane", "ADAS Lane Detection Engine", "Computer vision", "In review", 91.3, 18, 34000, ["Pune"], "Sneha Iyer", "2026-10-18", "4.1",
      "Detects lane markings in camera frames for lane-keep assist.", ["ADAS", "camera", "lane"],
      { data: ["Highway camera footage, 1.2M frames", "Monsoon night set"], oci: ["Vision", "Data Science"], gate: "Performance audit on monsoon night footage, due 4 Nov" }),
    A("lidar-seg", "LiDAR Segmentation Network", "Computer vision", "In review", 90.2, 46, 12500, ["Pune"], "Arjun Mehta", "2026-09-24", "2.0",
      "Segments point clouds into road, vehicle, pedestrian and kerb classes for ADAS validation.", ["ADAS", "lidar", "segmentation"],
      { data: ["LiDAR test-track captures", "Urban drive logs"], oci: ["Data Science", "Object Storage"], gate: "Kerb class is below target (84%) and retraining is queued" }),
    A("plant-doc-summarizer", "Pune Plant Documentation Summarizer", "Generative", "In review", 91.0, 640, 1900, ["Pune"], "Vikram Patel", "2026-10-10", "0.9",
      "Turns dense factory logs and engineering specs into readable bullet points on manufacturing anomalies.", ["summarization", "factory", "documents"],
      { data: ["Pune plant shift logs", "Engineering change notices"], oci: ["Generative AI"], gate: "Data-handling review by plant IT" }),
    A("warranty-parser", "Warranty Claim Parsing Pipeline", "Natural language", "PoC", 87.3, 210, 900, ["Pune"], "Sneha Iyer", "2026-10-08", "0.4",
      "Extracts parts, fault codes and failure modes from dealer warranty narratives to surface repeat failures.", ["NLP", "NER", "warranty", "claims"],
      { data: ["Warranty claim narratives (sample)"], oci: ["Language"] }),
    A("route-optimizer", "Fleet Route Optimizer", "Fleet telemetry", "PoC", 87.0, 300, 2100, ["Jamshedpur"], "Priya Sharma", "2026-09-30", "0.7",
      "Plans delivery routes for commercial fleets around charging stops and load.", ["routing", "fleet", "EV", "charging"],
      { data: ["Fleet trip history", "Charger locations"], oci: ["Data Science"] }),
    A("assembly-defect", "Assembly Line Defect Detector", "Computer vision", "PoC", 85.4, 54, 3400, ["Pune"], "Vikram Patel", "2026-09-15", "0.6",
      "Spots paint and panel-gap defects on the body-shop line from overhead cameras.", ["quality", "paint", "camera"],
      { data: ["Body-shop camera frames"], oci: ["Vision"] }),
    A("tyre-pressure", "Tyre Pressure Anomaly Model", "Fleet telemetry", "PoC", 86.1, 30, 4800, ["Lucknow"], "Vikram Patel", "2026-09-27", "0.5",
      "Finds slow leaks and under-inflation in bus fleets from TPMS readings.", ["tyres", "TPMS", "buses"],
      { data: ["TPMS readings from the Lucknow fleet"], oci: ["Anomaly Detection"] })
  ];
  var BY_ID = Object.create(null); ASSETS.forEach(function (a) { BY_ID[a.id] = a; });
  var AVATAR = { "Priya Sharma": "av-47", "Arjun Mehta": "av-12", "Vikram Patel": "av-33", "Sneha Iyer": "av-44", "Rayven Weathers": "av-15", "Eugene Sharma": "av-45" };
  var PROJECTS = [
    { name: "EV Battery Cost Optimization", desc: "4 scenario models minimising cobalt per pack.", state: "In Progress", stage: "Model training", pct: 72, due: "2026-11-24", team: ["Priya Sharma", "Arjun Mehta", "Sneha Iyer"], asset: "cobalt-optimizer" },
    { name: "Supply Chain Risk Assessment", desc: "Semiconductor dependency mapping for the Pune pipeline.", state: "In Progress", stage: "Data validation", pct: 45, due: "2026-12-02", team: ["Vikram Patel", "Rayven Weathers"], asset: "supplier-risk" },
    { name: "ADAS Lane Detection Audit", desc: "Monsoon night performance audit ahead of staging.", state: "Awaiting Review", stage: "Audit checklist", pct: 30, due: "2026-11-04", team: ["Sneha Iyer"], asset: "adas-lane" },
    { name: "Night-shift Drowsiness Pilot", desc: "Field validation on 40 Jamshedpur trucks.", state: "In Progress", stage: "Field validation", pct: 58, due: "2026-11-18", team: ["Sneha Iyer", "Arjun Mehta"], asset: "driver-drowsiness" },
    { name: "LiDAR Kerb Class Retraining", desc: "Lift the kerb class above the 90% target.", state: "Awaiting Review", stage: "Retraining", pct: 64, due: "2026-11-27", team: ["Arjun Mehta", "Vikram Patel"], asset: "lidar-seg" },
    { name: "Telemetry Feature Store v5", desc: "One CAN-bus feature store for every downstream model.", state: "Completed", stage: "Sign-off", pct: 100, due: "2026-10-15", team: ["Arjun Mehta", "Priya Sharma"], asset: "telemetry-model" }
  ];

  // Requests per plant: the first-listed plant is the lead site, the rest taper off
  function plantSplit(a) {
    var w = [.52, .28, .12, .05, .02, .01].slice(0, a.plants.length), sum = w.reduce(function (p, q) { return p + q; }, 0), out = {};
    a.plants.forEach(function (p, i) { out[p] = a.req * w[i] / sum; });
    return out;
  }

  /* ---------- Search and the answer engine ---------- */
  var STOP = "a an and are be for from how i in is it me of on or show the this to what which who with my our we ready production compare models model find list best summarize summarise".split(" ");
  var SYN = { ev: ["battery", "charging", "ev"], adas: ["adas", "lane", "lidar"], nlp: ["natural language", "nlp"], language: ["natural language"], vision: ["computer vision", "camera"], camera: ["camera", "vision"],
    claims: ["warranty"], voice: ["voice"], supplier: ["supply chain"], suppliers: ["supply chain"], maintenance: ["predictive maintenance"], genai: ["generative"], cobalt: ["cobalt", "chemistry"] };
  var BLOCK_WORDS = /^(blocking|blocked|deployments|deployment|week|waiting|pending|review|audit|stuck|attention|needs)$/;

  function tokens(q) {
    return q.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(function (w) { return w.length > 1 && STOP.indexOf(w) < 0; });
  }
  function has(hay, w) { return new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + (w.length < 4 ? "\\b" : "")).test(hay); }
  function score(a, toks) {
    var name = a.name.toLowerCase(), tags = a.tags.join(" ").toLowerCase(), body = (a.desc + " " + a.cat + " " + a.owner + " " + a.plants.join(" ")).toLowerCase(), s = 0;
    toks.forEach(function (t) {
      [t].concat((SYN[t] || []).filter(function (w) { return w !== t; })).forEach(function (w, i) {
        var weight = i ? .8 : 1;
        if (has(name, w)) s += 3 * weight;
        if (has(tags, w)) s += 2 * weight;
        if (has(body, w)) s += 1 * weight;
      });
    });
    return s;
  }
  function intentOf(q) {
    var l = q.toLowerCase();
    if (/\b(block(ed|ing|ers?)?|waiting|pending|attention|stuck|in review|under review|audit)\b/.test(l)) return "blocked";
    if (/compare|versus|\bvs\b|which is better/.test(l)) return "compare";
    if (/\b(production|ready|deploy(ed|ment|able)?|live|rollout)\b/.test(l)) return "ready";
    return "find";
  }
  function search(q) {
    var toks = tokens(q), intent = intentOf(q);
    var hits = ASSETS.map(function (a) { return { a: a, s: score(a, toks) }; });
    if (intent === "blocked" && !toks.some(function (t) { return !BLOCK_WORDS.test(t); })) {
      // "What is blocking deployments?" has no subject, so it means everything in staging or review
      hits = hits.filter(function (h) { return h.a.status === "In review" || h.a.status === "Staging"; }).map(function (h) { h.s += h.a.status === "In review" ? 2 : 1; return h; });
    } else if (toks.length) hits = hits.filter(function (h) { return h.s > 0; });
    if (intent === "ready") hits.forEach(function (h) { h.s += { Production: 3, Staging: 1.5, "In review": 0, PoC: -1 }[h.a.status]; });
    hits.sort(function (x, y) { return y.s - x.s || y.a.acc - x.a.acc; });
    var top = hits.length ? hits[0].s || 1 : 1;
    return { q: q, intent: intent, hits: hits.map(function (h) { return h.a; }), match: hits.reduce(function (m, h) { m[h.a.id] = Math.max(62, Math.min(99, Math.round(70 + 29 * h.s / top))); return m; }, {}) };
  }

  // An answer is a list of segments: plain text, or a citation keyed to a source card
  function compose(res) {
    var hits = res.hits, refs = hits.slice(0, 3), seg = [];
    function t(s) { seg.push({ text: s }); }
    function c(a) { seg.push({ ref: refs.indexOf(a) + 1 }); }
    if (!refs.length) return { seg: [{ text: "Nothing in the catalogue matches “" + res.q + "” yet. Try a system, a plant or a problem, such as battery health, lane detection or warranty claims." }], refs: [] };
    var live = hits.filter(function (a) { return a.status === "Production"; }).length;
    if (res.intent === "ready") t(hits.length + " catalogue asset" + (hits.length === 1 ? " matches" : "s match") + ", and " + live + (live === 1 ? " is" : " are") + " already in production. ");
    else if (res.intent === "compare") t("These are the " + (refs.length === 1 ? "closest model" : refs.length + " closest models") + ", compared on validation accuracy and p95 latency. ");
    else if (res.intent === "blocked") t(hits.length + (hits.length === 1 ? " asset is" : " assets are") + " waiting on a review or a promotion step. The ones that matter most this week: ");
    else t("I found " + hits.length + " catalogue asset" + (hits.length === 1 ? "" : "s") + " for “" + res.q + "”. The strongest " + (refs.length === 1 ? "match" : refs.length) + ": ");
    refs.forEach(function (a) {
      t(a.name + " "); c(a);
      if (a.status === "Production") t(" runs in production at " + list(a.plants) + " with " + a.acc + "% validation accuracy and " + ms(a.lat) + " p95 latency. ");
      else if (a.status === "Staging") t(" is in staging at " + a.acc + "%; " + clause(a.gate) + ". ");
      else if (a.status === "In review") t(" is in review: " + clause(a.gate) + ". ");
      else t(" is a proof of concept at " + a.acc + "%, not yet validated for production. ");
    });
    var ready = refs.filter(function (a) { return a.status === "Production"; });
    var best = (ready.length ? ready : refs).slice().sort(function (x, y) { return y.acc - x.acc; })[0];
    if (res.intent === "blocked") { t("Clear " + best.name + " "); c(best); t(" first: it is the furthest along" + of(refs.length) + "."); }
    else { t("Start with " + best.name + " "); c(best); t(best.status === "Production" ? ": it is live, owned by " + best.owner + ", and the most accurate" + of(refs.length) + "." : ": it is the most mature option, owned by " + best.owner + "."); }
    return { seg: seg, refs: refs, best: best };
  }

  var BADGE = { Production: "success", Staging: "info", "In review": "warning", PoC: "neutral" };
  function badge(s) { return '<span class="badge ' + BADGE[s] + '">' + esc(s === "PoC" ? "Proof of concept" : s) + "</span>"; }
  function assetHref(a) { return "asset-detail.html?id=" + a.id; }
  function catIcon(cat) { return '<span class="file-icon-box ' + CAT_CLASS[cat] + '" aria-hidden="true"><span class="icon">' + ICON[cat] + "</span></span>"; }
  function avatar(name) {
    return AVATAR[name] ? '<span class="author-avatar" style="background-image:url(\'images/' + AVATAR[name] + '.svg\')" aria-hidden="true"></span>' : '<span class="author-avatar initials" aria-hidden="true">' + esc(initials(name)) + "</span>";
  }

  // Renders an answer card: prose with citations, then its source cards; streams unless motion is reduced
  function renderAnswer(root, ans, opts) {
    opts = opts || {};
    var prose = $(".ans-prose", root), srcs = $(".src-row", root), think = $(".thinking", root);
    root.hidden = false;
    srcs.innerHTML = ans.refs.map(function (a, i) {
      return '<a class="src-card pending" href="' + assetHref(a) + '" data-ref="' + (i + 1) + '"><span class="src-num">' + (i + 1) + '</span><span class="src-main"><span class="src-name">' + esc(a.name) +
        '</span><span class="src-meta">' + esc(a.cat) + " · " + esc(a.owner) + '</span></span><span class="src-side"><span class="src-acc">' + a.acc + "%</span>" + badge(a.status) + "</span></a>";
    }).join("");
    var meta = $(".ans-meta", root);
    if (meta && root.id !== "summary") meta.textContent = ans.refs.length ? "Tata_LLM_v4 · cites " + ans.refs.length + " catalogue asset" + (ans.refs.length === 1 ? "" : "s") : "Tata_LLM_v4";
    var words = [];
    ans.seg.forEach(function (s) {
      if (s.ref) words.push({ ref: s.ref });
      else s.text.split(/(\s+)/).forEach(function (w) { if (w) words.push({ text: w }); });
    });
    function tokenHtml(w) {
      if (!w.ref) return esc(w.text);
      var a = ans.refs[w.ref - 1];
      return '<a class="cite" href="' + assetHref(a) + '" data-ref="' + w.ref + '" aria-label="Source ' + w.ref + ": " + esc(a.name) + '">' + w.ref + "</a>";
    }
    function reveal(w) { if (w.ref) { var c = $('.src-card[data-ref="' + w.ref + '"]', srcs); if (c) c.classList.remove("pending"); } }
    function finish() { root.removeAttribute("aria-busy"); root.classList.remove("is-streaming"); root.classList.add("is-done"); if (opts.done) opts.done(); }
    clearTimeout(root._stream);
    root.classList.remove("is-done");
    if (reduceMotion || opts.instant) {
      if (think) think.hidden = true;
      prose.innerHTML = words.map(tokenHtml).join("");
      words.forEach(reveal);
      $$(".src-card", srcs).forEach(function (c) { c.classList.remove("pending"); });
      finish();
      return;
    }
    root.setAttribute("aria-busy", "true");
    root.classList.add("is-streaming");
    prose.innerHTML = "";
    if (think) think.hidden = false;
    root._stream = setTimeout(function () {
      if (think) think.hidden = true;
      prose.innerHTML = '<span class="caret" aria-hidden="true"></span>';
      var i = 0;
      (function step() {
        var chunk = "";
        for (var n = 0; n < 3 && i < words.length; n++, i++) { chunk += tokenHtml(words[i]); reveal(words[i]); if (words[i].ref) { i++; break; } }
        $(".caret", prose).insertAdjacentHTML("beforebegin", chunk);
        if (i < words.length) root._stream = setTimeout(step, 26);
        else { $(".caret", prose).remove(); $$(".src-card", srcs).forEach(function (c) { c.classList.remove("pending"); }); finish(); }
      })();
    }, 650);
  }

  // A citation and its source card light up together
  function linkCitations(root) {
    function lit(ref, on) { $$('[data-ref="' + ref + '"]', root).forEach(function (el) { el.classList.toggle("is-lit", on); }); }
    ["mouseover", "focusin"].forEach(function (ev) { root.addEventListener(ev, function (e) { var t = e.target.closest("[data-ref]"); if (t) lit(t.getAttribute("data-ref"), true); }); });
    ["mouseout", "focusout"].forEach(function (ev) { root.addEventListener(ev, function (e) { var t = e.target.closest("[data-ref]"); if (t) lit(t.getAttribute("data-ref"), false); }); });
  }
  function answerTools(root, getAns, regenerate) {
    linkCitations(root);
    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]"); if (!b) return;
      var act = b.getAttribute("data-act"), ans = getAns();
      if (act === "copy" && ans) copy(plainAnswer(ans), "Answer copied with its sources");
      if (act === "regen") regenerate();
      if (act === "up" || act === "down") {
        $$('[data-act="up"],[data-act="down"]', root).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        toast(act === "up" ? "Thanks, marked as helpful" : "Thanks, flagged for the model team");
      }
    });
  }
  function plainAnswer(ans) {
    return ans.seg.map(function (s) { return s.ref ? "[" + s.ref + "]" : s.text; }).join("") + (ans.refs.length ? "\n\nSources:\n" +
      ans.refs.map(function (a, i) { return "[" + (i + 1) + "] " + a.name + " (" + a.status + ", " + a.acc + "%)"; }).join("\n") : "");
  }
  // Copies, then says what happened; falls back to execCommand when the Clipboard API is missing or refused (file://)
  function copy(text, label) {
    function fallback() {
      var ta = document.createElement("textarea"), ok = false; ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand("copy"); } catch (x) {} ta.remove();
      toast(ok ? label : "Copy isn't available here. Select the text to copy it.");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast(label); }, fallback);
    else fallback();
  }

  /* ---------- Shell: splash, page transitions, drawer, notifications, search ---------- */
  var NAV_FLAG = "smNavInProgress";
  function hidePreloader() { var p = $("#preloader"); if (p) p.classList.add("hide"); }
  function progressStart() { var b = $("#page-progress"); if (!b) return; b.style.width = "0%"; b.classList.add("active"); requestAnimationFrame(function () { b.style.width = "55%"; }); }
  function progressEnd() {
    var b = $("#page-progress"); if (!b) return;
    b.classList.add("active"); b.style.width = "92%";
    setTimeout(function () { b.style.width = "100%"; setTimeout(function () { b.classList.remove("active"); setTimeout(function () { b.style.width = "0%"; }, 200); }, 200); }, 100);
  }
  var fromApp = false;
  try { fromApp = sessionStorage.getItem(NAV_FLAG) === "1"; sessionStorage.removeItem(NAV_FLAG); } catch (e) {}
  if (fromApp) { hidePreloader(); progressEnd(); } else { setTimeout(hidePreloader, 350); }
  window.addEventListener("pageshow", function (e) { if (e.persisted) { hidePreloader(); document.body.classList.remove("leaving"); var b = $("#page-progress"); if (b) { b.classList.remove("active"); b.style.width = "0%"; } } });

  // In-app links show the thin progress line instead of the full splash
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute("download")) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^[a-z]+:/i.test(href) || !/\.html/.test(href)) return;
    e.preventDefault();
    try { sessionStorage.setItem(NAV_FLAG, "1"); } catch (x) {}
    progressStart();
    document.body.classList.add("leaving");
    setTimeout(function () {
      location.href = href;
      // If the navigation is cancelled (e.g. "Leave site?" → Stay), undo the bar and the flag
      setTimeout(function () {
        if (document.visibilityState !== "visible") return;
        try { sessionStorage.removeItem(NAV_FLAG); } catch (x) {}
        document.body.classList.remove("leaving");
        var b = $("#page-progress"); if (b) { b.classList.remove("active"); b.style.width = "0%"; }
      }, 1200);
    }, reduceMotion ? 0 : 380);
  });

  // Mobile drawer
  (function () {
    var bar = $("#sidebar"), open = $("#sidebarToggle"), close = $("#sidebarClose"), scrim = $("#sidebarBackdrop");
    if (!bar) return;
    function set(on) {
      bar.classList.toggle("mobile-open", on); if (scrim) scrim.classList.toggle("show", on);
      if (open) open.setAttribute("aria-expanded", on); document.body.classList.toggle("no-scroll", on);
      if (on && close) close.focus(); else if (!on && open && bar.contains(document.activeElement)) open.focus();
    }
    if (open) open.addEventListener("click", function () { set(true); });
    if (close) close.addEventListener("click", function () { set(false); });
    if (scrim) scrim.addEventListener("click", function () { set(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && bar.classList.contains("mobile-open")) set(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 768 && bar.classList.contains("mobile-open")) set(false); });
    $$("a", bar).forEach(function (a) { a.addEventListener("click", function () { if (bar.classList.contains("mobile-open")) set(false); }); });
    window.addEventListener("pageshow", function (e) { if (e.persisted && bar.classList.contains("mobile-open")) set(false); });
  })();

  // Notifications popover
  (function () {
    var panel = $("#notifyPanel"), opener;
    if (!panel) return;
    function set(on, from, restore) {
      panel.hidden = !on;
      $$("[data-notify]").forEach(function (b) { b.setAttribute("aria-expanded", on); });
      if (on) { $$("[data-notify] .dot").forEach(function (d) { d.remove(); }); opener = from; $("[data-notify-close]", panel).focus(); }
      else { if (opener && restore !== false) opener.focus(); opener = null; }
    }
    $$("[data-notify]").forEach(function (b) { b.addEventListener("click", function (e) { e.stopPropagation(); set(panel.hidden, b); }); });
    $("[data-notify-close]", panel).addEventListener("click", function () { set(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) set(false); });
    document.addEventListener("click", function (e) { if (!panel.hidden && !panel.contains(e.target)) set(false, null, false); });
  })();

  // ⌘K or / focuses search: the page's own field first, then the global pill
  document.addEventListener("keydown", function (e) {
    var typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
      var g = [$("#ask"), $("#refine"), $("#libFilter"), $("#globalSearch")].filter(function (x) { return x && x.offsetParent; })[0];
      if (g) { e.preventDefault(); g.focus(); g.select(); }
    }
  });

  var toastTimer;
  function toast(msg) {
    var t = $("#toast"); if (!t) return;
    t.textContent = msg; t.classList.add("on");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("on"); }, 2800);
  }
  // Marks each [field, errorEl, invalid, message] rule and focuses the first invalid field
  function check(rules) {
    var ok = true;
    rules.forEach(function (c) {
      if (c[0].setAttribute) c[0].setAttribute("aria-invalid", c[2]);
      c[1].textContent = c[2] ? c[3] : "";
      if (c[2] && ok) { if (c[0].focus) c[0].focus(); ok = false; }
    });
    return ok;
  }
  function today() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function greet() { var h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; }

  // Cards ease up as they scroll into view (once); skipped under reduced motion
  function reveal(sel) {
    if (reduceMotion || !window.IntersectionObserver) return;
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -40px 0px" });
    $$(sel).forEach(function (el) { if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add("rise"); io.observe(el); } });
  }

  /* ---------- Charts ---------- */
  function svg(tag, attrs, parent) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }
  function niceMax(v) { var p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 4 ? 4 : n <= 6 ? 6 : n <= 8 ? 8 : 10) * p; }
  function watch(el, fn) {
    if (!window.ResizeObserver) return;
    var w = el.clientWidth, raf;
    new ResizeObserver(function () { if (el.clientWidth !== w) { w = el.clientWidth; cancelAnimationFrame(raf); raf = requestAnimationFrame(fn); } }).observe(el);
  }
  var gradId = 0;
  // Line chart with the brand's blue-to-violet stroke, a soft glow and a hover readout
  function lineChart(el, o) {
    var id = "g" + (++gradId);
    function draw() {
      $$("svg", el).forEach(function (s) { s.remove(); });
      var w = el.clientWidth || 600, h = o.h || 220, pad = { t: 16, r: 56, b: 28, l: 48 };
      var max = o.max || niceMax(Math.max.apply(null, o.values) * 1.08), min = o.min || 0;
      var x = function (i) { return pad.l + i * (w - pad.l - pad.r) / (o.values.length - 1); };
      var y = function (v) { return pad.t + (1 - (v - min) / (max - min)) * (h - pad.t - pad.b); };
      var s = svg("svg", { viewBox: "0 0 " + w + " " + h, role: "img", "aria-label": o.label }, null);
      var defs = svg("defs", {}, s);
      var lg = svg("linearGradient", { id: id + "l", x1: "0", x2: "1", y1: "0", y2: "0" }, defs);
      svg("stop", { offset: "0", "stop-color": "#2563eb" }, lg); svg("stop", { offset: "1", "stop-color": "#8b5cf6" }, lg);
      var ag = svg("linearGradient", { id: id + "a", x1: "0", x2: "0", y1: "0", y2: "1" }, defs);
      svg("stop", { offset: "0", "stop-color": "#6366f1", "stop-opacity": ".22" }, ag); svg("stop", { offset: "1", "stop-color": "#6366f1", "stop-opacity": "0" }, ag);
      var every = w < 420 ? (o.every || 1) * 2 : (o.every || 1);
      for (var g = 0; g <= 4; g++) {
        var v = min + (max - min) * g / 4, gy = y(v);
        svg("line", { x1: pad.l, x2: w - pad.r, y1: gy, y2: gy, class: "grid" }, s);
        svg("text", { x: pad.l - 8, y: gy + 4, class: "ax", "text-anchor": "end" }, s).textContent = o.fmt(v);
      }
      o.labels.forEach(function (l, i) { if (i % every === 0 || i === o.labels.length - 1) svg("text", { x: x(i), y: h - 8, class: "ax", "text-anchor": i === 0 ? "start" : i === o.labels.length - 1 ? "end" : "middle" }, s).textContent = l; });
      var d = o.values.map(function (v, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1); }).join(" ");
      svg("path", { d: d + " L" + x(o.values.length - 1) + " " + y(min) + " L" + x(0) + " " + y(min) + " Z", fill: "url(#" + id + "a)" }, s);
      svg("path", { d: d, class: "line-glow", stroke: "url(#" + id + "l)" }, s);
      svg("path", { d: d, class: "line", stroke: "url(#" + id + "l)" }, s);
      var li = o.values.length - 1;
      svg("circle", { cx: x(li), cy: y(o.values[li]), r: 9, class: "dot-halo" }, s);
      svg("circle", { cx: x(li), cy: y(o.values[li]), r: 4.5, class: "dot" }, s);
      svg("text", { x: x(li) + 10, y: y(o.values[li]) + 4, class: "end" }, s).textContent = o.fmt(o.values[li]);
      var cross = svg("line", { y1: pad.t, y2: h - pad.b, class: "cross" }, s), hit = svg("rect", { x: pad.l, y: 0, width: w - pad.l - pad.r, height: h, class: "hit" }, s);
      var tip = $(".tip", el) || el.appendChild(Object.assign(document.createElement("div"), { className: "tip" }));
      tip.setAttribute("aria-hidden", "true");
      hit.addEventListener("pointermove", function (ev) {
        var r = s.getBoundingClientRect(), px = (ev.clientX - r.left) * w / r.width;
        var i = Math.max(0, Math.min(li, Math.round((px - pad.l) / ((w - pad.l - pad.r) / li))));
        cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i)); cross.classList.add("on");
        tip.innerHTML = "<b>" + esc(o.labels[i]) + "</b> " + esc(o.fmt(o.values[i], true));
        tip.style.left = Math.max(12, Math.min(88, x(i) / w * 100)) + "%"; tip.classList.add("on");
      });
      hit.addEventListener("pointerleave", function () { cross.classList.remove("on"); tip.classList.remove("on"); });
      el.insertBefore(s, el.firstChild);
    }
    draw(); watch(el, draw);
  }
  // Visually hidden data table behind every chart
  function srTable(caption, head, rows) {
    return '<div class="sr-only"><table><caption>' + esc(caption) + "</caption><thead><tr>" + head.map(function (x) { return '<th scope="col">' + esc(x) + "</th>"; }).join("") +
      "</tr></thead><tbody>" + rows.map(function (r) { return "<tr>" + r.map(function (x) { return "<td>" + esc(x) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  }
  // Donut from a list of {label, value}; the legend shows share and value
  function donut(el, legend, rows, fmt) {
    var total = rows.reduce(function (s, r) { return s + r.value; }, 0) || 1, at = 0;
    el.style.background = "conic-gradient(" + rows.map(function (r, i) {
      var from = at; at += r.value / total * 100;
      return PALETTE[i % PALETTE.length] + " " + from.toFixed(2) + "% " + at.toFixed(2) + "%";
    }).join(", ") + ")";
    legend.innerHTML = rows.map(function (r, i) {
      return '<div class="legend-row"><span class="dotname"><span class="legend-dot" style="background:' + PALETTE[i % PALETTE.length] + '"></span>' + esc(r.label) +
        '</span><span class="amt">' + Math.round(r.value / total * 100) + "%<small>" + esc(fmt(r.value)) + "</small></span></div>";
    }).join("");
    el.setAttribute("aria-label", rows.map(function (r) { return r.label + " " + Math.round(r.value / total * 100) + "%"; }).join(", "));
  }
  // Horizontal bars in the original bar-row style; parts stack inside one track
  function bars(el, rows, o) {
    var max = o.max || Math.max.apply(null, rows.map(function (r) { return r.total; })) || 1;
    el.innerHTML = rows.map(function (r) {
      var parts = (r.parts || [{ v: r.total, c: r.color || "#2563eb" }]).filter(function (p) { return p.v > 0; });
      return '<div class="bar-row"><span class="lbl">' + esc(r.label) + '</span><div class="bar-track">' +
        parts.map(function (p) { return '<div class="bar-fill" style="width:' + (p.v / max * 100).toFixed(2) + "%;background:" + p.c + '"></div>'; }).join("") +
        '</div><span class="amt">' + esc(o.fmt(r.total)) + "</span></div>";
    }).join("");
  }

  /* ---------- Pages ---------- */
  var PAGES = {};

  PAGES.home = function () {
    $("#greet").textContent = greet() + ", Eugene";
    var form = $("#askForm"), field = $("#ask"), card = $("#answer"), current;
    function ask(q) {
      q = q.trim(); if (!q) { field.focus(); return; }
      current = compose(search(q));
      var line = $(".ans-q", card); line.hidden = false; line.textContent = q;
      $(".ans-actions", card).innerHTML = '<a class="btn btn-primary" href="search-results.html?q=' + encodeURIComponent(q) + '">See all results</a>' +
        (current.best ? '<a class="btn btn-secondary" href="' + assetHref(current.best) + '">Open ' + esc(current.best.name) + "</a>" : "");
      renderAnswer(card, current);
      card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
    }
    form.addEventListener("submit", function (e) { e.preventDefault(); ask(field.value); field.value = ""; });
    $$("[data-q]").forEach(function (b) { b.addEventListener("click", function () { field.value = ""; ask(b.getAttribute("data-q")); }); });
    answerTools(card, function () { return current; }, function () { if (current) renderAnswer(card, current); });
    reveal(".conv-card, .suggest-card");
  };

  PAGES.search = function () {
    var q = (params.get("q") || "").trim(), state = { status: "All", page: 1 }, PER = 4, res, saved = {};
    var refine = $("#refine"), gs = $("#globalSearch");
    if (refine) refine.value = q; if (gs) gs.value = q;
    res = q ? search(q) : { q: "", intent: "find", hits: ASSETS.slice().sort(function (x, y) { return y.req - x.req; }), match: {} };
    $("#qTitle").textContent = q ? "“" + q + "”" : "All catalogue assets";
    document.title = (q ? q + " · " : "") + "Search · Tata Motors AI Workspace";
    var synth = $("#synth"), ans;
    if (q) {
      ans = compose(res);
      $(".ans-actions", synth).innerHTML = (ans.best ? '<a class="btn btn-primary" href="' + assetHref(ans.best) + '">Open top recommendation</a>' : "") +
        '<button class="btn btn-secondary" type="button" id="saveSearch" aria-pressed="false">Save to Workspace</button>';
      renderAnswer(synth, ans);
    } else {
      var n = function (st) { return ASSETS.filter(function (a) { return a.status === st; }).length; };
      ans = { seg: [{ text: "Showing all " + ASSETS.length + " catalogue assets, busiest first. " + n("Production") + " are in production, " + n("Staging") + " in staging, " + n("In review") + " in review and " + n("PoC") + " are proofs of concept. Ask a question above for a cited recommendation." }], refs: [] };
      $(".ans-actions", synth).innerHTML = '<a class="btn btn-primary" href="search-results.html?q=Which%20battery%20models%20are%20ready%20for%20production%3F">Try: which battery models are ready?</a>';
      renderAnswer(synth, ans, { instant: true });
    }
    answerTools(synth, function () { return ans; }, function () { renderAnswer(synth, ans); });
    synth.addEventListener("click", function (e) {
      var b = e.target.closest("#saveSearch"); if (!b) return;
      var on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on); b.textContent = on ? "Saved to Workspace" : "Save to Workspace";
      toast(on ? "Search saved to your workspace" : "Removed from your workspace");
    });
    // Status counts follow the query
    $$("#statusFilters [data-status]").forEach(function (b) {
      var s = b.getAttribute("data-status");
      $("span", b).textContent = s === "All" ? res.hits.length : res.hits.filter(function (a) { return a.status === s; }).length;
    });
    function drawResults() {
      var rows = res.hits.filter(function (a) { return state.status === "All" || a.status === state.status; });
      var pages = Math.max(1, Math.ceil(rows.length / PER)); state.page = Math.min(state.page, pages);
      var slice = rows.slice((state.page - 1) * PER, state.page * PER);
      $("#count").textContent = "Found " + rows.length + " result" + (rows.length === 1 ? "" : "s");
      $("#pageInfo").textContent = rows.length ? "Showing " + ((state.page - 1) * PER + 1) + "–" + ((state.page - 1) * PER + slice.length) + " of " + rows.length + " results" : "No results";
      $('[data-pg="prev"]').disabled = state.page <= 1; $('[data-pg="next"]').disabled = state.page >= pages;
      var refs = ans.refs || [];
      $("#results").innerHTML = slice.map(function (a) {
        var r = refs.indexOf(a) + 1, m = res.match[a.id];
        return '<article class="result-card"><div class="result-top"><div class="result-title-group">' + catIcon(a.cat) +
          '<span class="tt"><h2 class="rc-title"><a href="' + assetHref(a) + '">' + esc(a.name) + "</a>" + (r ? '<span class="cite static" title="Cited as source ' + r + '">' + r + "</span>" : "") + "</h2><p>" +
          (m ? m + "% match · " : "") + esc(a.cat) + " · " + a.acc + '% accuracy</p></span></div><div class="result-status">' + badge(a.status) +
          '<button class="icon-btn" type="button" data-save="' + a.id + '" aria-pressed="' + !!saved[a.id] + '" aria-label="Save ' + esc(a.name) + '"><span class="icon">' + ICON.bookmark + "</span></button></div></div>" +
          '<p class="desc">' + esc(a.desc) + '</p><div class="tags-row">' + a.tags.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</div>" +
          '<hr class="divider"><div class="result-footer"><span class="author-info">' + avatar(a.owner) + esc(a.owner) + " · Updated " + date(a.updated) + "</span>" +
          '<div class="action-btns"><a class="btn btn-ghost" href="' + assetHref(a) + '">Details</a>' +
          (a.status === "Production" ? '<button class="btn btn-primary" type="button" data-deploy="' + a.id + '">Deploy Model</button>' : "") + "</div></div></article>";
      }).join("") || '<div class="empty-state"><h2>No assets match these filters</h2><p>Clear the status filter, or ask about a system, a plant or a problem instead.</p><button class="btn btn-secondary" type="button" id="clearStatus">Show all results</button></div>';
    }
    $("#statusFilters").addEventListener("click", function (e) {
      var b = e.target.closest("[data-status]"); if (!b) return;
      state.status = b.getAttribute("data-status"); state.page = 1;
      $$("#statusFilters [data-status]").forEach(function (x) { var on = x === b; x.classList.toggle("active", on); x.setAttribute("aria-pressed", on); });
      drawResults();
    });
    document.addEventListener("click", function (e) {
      var p = e.target.closest("[data-pg]"); if (p && !p.disabled) { state.page += p.getAttribute("data-pg") === "next" ? 1 : -1; drawResults(); $("#results").scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" }); }
      if (e.target.closest("#clearStatus")) $('#statusFilters [data-status="All"]').click();
      var s = e.target.closest("[data-save]");
      if (s) { var id = s.getAttribute("data-save"); saved[id] = !saved[id]; s.setAttribute("aria-pressed", saved[id]); toast(saved[id] ? BY_ID[id].name + " saved" : "Removed from saved assets"); }
      var d = e.target.closest("[data-deploy]");
      if (d) { d.disabled = true; d.textContent = "Added to project"; toast(BY_ID[d.getAttribute("data-deploy")].name + " added to EV Battery Cost Optimization"); }
    });
    drawResults();
  };

  PAGES.detail = function () {
    var a = BY_ID[params.get("id")] || BY_ID["battery-degradation"];
    document.title = a.name + " · Tata Motors AI Workspace";
    $("#crumbCat").textContent = a.cat; $("#crumbCat").href = "library.html?cat=" + encodeURIComponent(a.cat);
    $("#crumbName").textContent = a.name; $("#aName").textContent = a.name;
    $("#aStatus").innerHTML = badge(a.status);
    $("#aDesc").textContent = a.desc;
    $("#aGate").hidden = !a.gate; if (a.gate) $("#aGateText").textContent = sentence(a.gate);
    var live = a.status === "Production";
    $("#dcBody").textContent = live ? "Add this model to a project and Oracle provisions an OCI Data Science endpoint for your team." : "This model isn't validated for production yet. You can request early access for a pilot project.";
    var deployBtns = $$("#deployAsset, [data-deploy-alt]");
    deployBtns.forEach(function (b) {
      if (!live) b.lastChild.textContent = "Request pilot access";
      b.addEventListener("click", function () {
        deployBtns.forEach(function (x) { x.disabled = true; x.lastChild.textContent = live ? "Added to project" : "Access requested"; });
        toast(live ? a.name + " added to EV Battery Cost Optimization" : "Pilot access requested from " + a.owner);
      });
    });
    var save = $("#saveAsset");
    save.addEventListener("click", function () { var on = save.getAttribute("aria-pressed") !== "true"; save.setAttribute("aria-pressed", on); save.lastChild.textContent = on ? "Saved" : "Save"; toast(on ? a.name + " saved to your workspace" : "Removed from saved assets"); });

    // Related assets share a category or tags; the top three are the summary's cited sources
    var related = ASSETS.filter(function (x) { return x !== a; }).map(function (x) {
      return { x: x, s: (x.cat === a.cat ? 2 : 0) + x.tags.filter(function (t) { return a.tags.indexOf(t) > -1; }).length * 1.5 };
    }).sort(function (p, q) { return q.s - p.s || q.x.acc - p.x.acc; }).map(function (r) { return r.x; });
    function kpis(el, rows) {
      $(el).innerHTML = rows.map(function (k) { return '<div class="stat-card"><span class="stat-lbl">' + esc(k[0]) + '</span><span class="stat-val">' + esc(k[1]) + '</span><span class="stat-delta' + (k[3] ? " " + k[3] : "") + '">' + esc(k[2]) + "</span></div>"; }).join("");
    }
    function tile(x) {
      return '<a class="asset-tile" href="' + assetHref(x) + '"><span class="ref-glyph ' + CAT_CLASS[x.cat] + '" aria-hidden="true">' + ICON[x.cat] + "</span>" +
        '<span class="at-body"><span class="rm-name">' + esc(x.name) + '</span><span class="rm-sub">' + esc(x.cat) + " · " + x.acc + "%</span></span>" + badge(x.status) + "</a>";
    }
    var stage = { Production: "Live", Staging: "Staging", "In review": "In review", PoC: "Proof of concept" }[a.status];

    /* Overview */
    kpis("#ovKpis", [["Validation accuracy", a.acc + "%", "v" + a.ver, "up"], ["p95 latency", ms(a.lat), a.lat < 100 ? "Real-time ready" : "Batch or async"],
      ["Requests per day", live ? compact(a.req) : "Pilot", live ? "Across " + a.plants.length + " plant" + (a.plants.length === 1 ? "" : "s") : "No production traffic"], ["Lead plant", a.plants[0] || "None", a.plants.length > 1 ? "+" + (a.plants.length - 1) + " more" : "Single site"]]);
    $("#related").innerHTML = related.slice(3, 9).map(tile).join("");

    // The generated summary cites three related assets
    var refs = [related[0], related[1], related[2]], seg = [];
    function t(s) { seg.push({ text: s }); }
    t(a.name + " " + clause(a.desc) + ". ");
    t(live ? "It serves " + num(a.req) + " requests a day across " + list(a.plants) + " at " + ms(a.lat) + " p95. " : "It is " + { Staging: "in staging", "In review": "in review", PoC: "a proof of concept" }[a.status] + " at " + a.acc + "% validation accuracy. ");
    t("It is most often used alongside " + refs[0].name + " "); seg.push({ ref: 1 }); t(" and " + refs[1].name + " "); seg.push({ ref: 2 });
    t(". For a different approach to the same problem, compare " + refs[2].name + " "); seg.push({ ref: 3 }); t(".");
    var sumAns = { seg: seg, refs: refs };
    var sum = $("#summary");
    renderAnswer(sum, sumAns, { instant: true });
    answerTools(sum, function () { return sumAns; }, function () { renderAnswer(sum, sumAns); });

    var details = [["Category", a.cat], ["Status", a.status === "PoC" ? "Proof of concept" : a.status], ["Version", "v" + a.ver], ["Owner", a.owner], ["Last updated", date(a.updated)], ["Plants", list(a.plants) || "Not deployed yet"],
      ["Runtime", "Python 3.11 on OCI Data Science"], ["OCI services", a.oci.join(", ") || "None assigned yet"], ["Tags", a.tags.join(", ")]];
    $("#details").innerHTML = details.map(function (d) { return '<div class="details-col"><dt class="k">' + esc(d[0]) + '</dt><dd class="v">' + esc(d[1]) + "</dd></div>"; }).join("");

    // Requests by plant
    var split = plantSplit(a), rows = a.plants.map(function (p) { return { label: p, value: split[p] }; });
    if (rows.length) {
      donut($("#plantDonut"), $("#plantLegend"), rows, function (v) { return compact(v) + "/day"; });
      $("#donutLbl").textContent = rows[0].label; $("#donutVal").textContent = Math.round(rows[0].value / a.req * 100) + "%";
    } else { $("#plantDonut").parentNode.innerHTML = '<p class="results-count">Not serving any plant yet.</p>'; }

    /* Performance: everything derives from the catalogue entry so the tabs always agree */
    var vMajor = parseFloat(a.ver), vStep = vMajor >= 2 ? .3 : .1, steps = Math.max(2, Math.min(8, Math.round(vMajor * 3), Math.floor(vMajor / vStep) + 1)), vals = [], labels = [];
    for (var i = 0; i < steps; i++) {
      var back = steps - 1 - i, wob = [0, .4, -.3, .2, -.2, .3, 0, .1][i % 8];
      vals.push(+(a.acc - back * 1.15 + (back ? wob : 0)).toFixed(1));
      labels.push("v" + (vMajor - back * vStep).toFixed(1));
    }
    var f1 = Math.min(99.4, a.acc - .4);
    $("#accNow").textContent = "v" + a.ver + " · " + a.acc + "%";
    kpis("#perfStats", [["Validation accuracy", a.acc + "%", "+" + (a.acc - vals[0]).toFixed(1) + " pts since " + labels[0], "up"], ["F1 score", f1.toFixed(1), "Balanced precision and recall"],
      ["p95 latency", ms(a.lat), "p50 " + ms(Math.round(a.lat * .45))], ["Drift (PSI)", "0.04", "Stable, threshold 0.2", "up"]]);
    var evals = [["Precision", a.acc + .6], ["Recall", a.acc - 1.4], ["F1 score", f1], ["Robustness", a.acc - 4.2], ["Drift check", Math.min(99, a.acc + 2.1)]];
    bars($("#evalBars"), evals.map(function (e, i) { return { label: e[0], total: Math.min(99.4, +e[1].toFixed(1)), color: PALETTE[i % 4] }; }), { max: 100, fmt: function (v) { return v.toFixed(1); } });
    var lat = [["p50", .45], ["p90", .8], ["p95", 1], ["p99", 1.6]].map(function (q, i) { return { label: q[0], total: Math.round(a.lat * q[1]), color: PALETTE[i % 4] }; });
    bars($("#latBars"), lat, { max: Math.round(a.lat * 1.6), fmt: ms });
    if (a.plants.length) {
      var offs = [.3, -.4, .6, -.9, .2, -.2];
      bars($("#plantAcc"), a.plants.map(function (p, i) { return { label: p, total: +Math.min(99.4, a.acc + offs[i]).toFixed(1), color: PALETTE[i % 4] }; }), { max: 100, fmt: function (v) { return v.toFixed(1) + "%"; } });
    } else $("#plantAcc").innerHTML = '<p class="results-count">Plant-level accuracy appears after the first rollout.</p>';
    var accDrawn = false;
    function drawAcc() {
      if (accDrawn) return; accDrawn = true;
      var lo = 100 - 4 * Math.ceil((102 - Math.min.apply(null, vals)) / 4);
      lineChart($("#accChart"), { values: vals, labels: labels, max: 100, min: lo, fmt: function (v, tip) { return tip ? "· " + v + "% validation accuracy" : Math.round(v) + "%"; }, label: "Validation accuracy by version for " + a.name, h: 220 });
      $("#accTable").innerHTML = srTable("Validation accuracy by version", ["Version", "Accuracy"], labels.map(function (l, i) { return [l, vals[i] + "%"]; }));
    }

    /* Datasets */
    var ROWS = [4.1e6, 2.3e6, 8.6e5, 1.2e6], CAD = ["Daily", "Weekly", "Monthly"], pii = /feedback|voice|warranty|reviews|cabin/.test(a.tags.join(" "));
    var totalRows = a.data.reduce(function (s, d, i) { return s + ROWS[i % 4] * (a.req > 20000 ? 1 : .4); }, 0);
    kpis("#dataKpis", [["Sources", String(a.data.length), a.data.length === 1 ? "One registered source" : "Registered in the catalogue"], ["Training rows", compact(totalRows), "80% train · 20% eval"],
      ["Last refreshed", date(a.updated), CAD[a.data.length % 3] + " refresh"], ["Personal data", pii ? "Anonymised" : "None", pii ? "Names and IDs removed at ingest" : "No customer fields", "up"]]);
    $("#lineage").innerHTML = [["Sources", a.data.length + " dataset" + (a.data.length === 1 ? "" : "s")], ["Object Storage", "Raw landing zone"], ["Data Flow", "Feature pipeline"], ["Data Science", "Training v" + a.ver], ["Endpoint", live ? "ap-mumbai-1" : "Pilot sandbox"]]
      .map(function (s, i) { return '<li><span class="ln-num">' + (i + 1) + '</span><span class="ln-t">' + esc(s[0]) + '</span><span class="ln-s">' + esc(s[1]) + "</span></li>"; }).join("");
    $("#datasets").innerHTML = a.data.map(function (d, i) {
      var r = ROWS[i % 4] * (a.req > 20000 ? 1 : .4);
      return '<div class="ds-item"><span class="ref-glyph ' + CAT_CLASS[a.cat] + '" aria-hidden="true">' + ICON[a.cat] + '</span><span class="at-body"><span class="rm-name">' + esc(d) +
        '</span><span class="rm-sub">' + compact(r) + " rows · " + CAD[i % 3] + " refresh · " + (i ? "Evaluation" : "Training") + '</span></span><span class="badge ' + (i ? "info" : "success") + '">' + (i ? "Eval" : "Train") + "</span></div>";
    }).join("") || '<p class="results-count">No training data registered yet.</p>';

    /* API */
    var url = "https://inference.ap-mumbai-1.oci.tatamotors.example/v1/models/" + a.id + "/predict";
    var SCHEMA = {
      "Natural language": [["text", "string", "Required. The utterance or document to classify"], ["language", "string", "Optional. hi, mr or en; detected when omitted"], ["top_k", "integer", "Optional. Number of labels to return, default 3"]],
      "Computer vision": [["image", "base64 JPEG", "Required. One frame, up to 4 MB"], ["camera_id", "string", "Optional. Used for per-camera calibration"], ["threshold", "float", "Optional. Minimum confidence, default 0.5"]],
      "Predictive maintenance": [["vehicle_id", "string", "Required. VIN or fleet ID"], ["window_days", "integer", "Optional. History to read, default 30"], ["signals", "array<float>", "Optional. Override the latest telemetry"]],
      "Fleet telemetry": [["vehicle_id", "string", "Required. VIN or fleet ID"], ["from", "ISO 8601 time", "Required. Start of the window"], ["to", "ISO 8601 time", "Optional. Defaults to now"]],
      Generative: [["prompt", "string", "Required. The question or instruction"], ["max_tokens", "integer", "Optional. Default 512"], ["cite", "boolean", "Optional. Return source citations, default true"]]
    }[a.cat];
    var sample = {}; SCHEMA.forEach(function (f) { sample[f[0]] = { string: f[0] === "text" ? "Brake noise after service" : f[0] === "prompt" ? "Summarise last week's anomalies" : f[0] === "vehicle_id" ? "MAT612345" : f[0] === "language" ? "en" : "cam-07", integer: 30, float: .5, boolean: true, "base64 JPEG": "<base64>", "array<float>": [0.82, 0.79], "ISO 8601 time": "2026-10-28T00:00:00Z" }[f[1]]; });
    var body = JSON.stringify({ inputs: sample });
    var CODE = {
      curl: "curl -X POST " + url + " \\\n  -H \"Authorization: Bearer $OCI_TOKEN\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '" + body + "'",
      python: "import os, requests\n\nres = requests.post(\n    \"" + url + "\",\n    headers={\"Authorization\": f\"Bearer {os.environ['OCI_TOKEN']}\"},\n    json=" + body.replace(/true/g, "True") + ",\n)\nprint(res.json())",
      js: "const res = await fetch(\"" + url + "\", {\n  method: \"POST\",\n  headers: { Authorization: `Bearer ${OCI_TOKEN}`, \"Content-Type\": \"application/json\" },\n  body: JSON.stringify(" + body + "),\n});\nconsole.log(await res.json());"
    };
    var RESP = {
      "Natural language": { label: "service", confidence: .94, alternatives: [{ label: "technical", confidence: .04 }] },
      "Computer vision": { detections: [{ class: "lane_left", confidence: .97 }, { class: "lane_right", confidence: .95 }] },
      "Predictive maintenance": { health: .83, service_in_days: 41, confidence: .91 },
      "Fleet telemetry": { features: 128, gaps: 0, window_hours: 24 },
      Generative: { answer: "3 anomalies on Line 2, all torque drift.", citations: ["shift-log-1026", "ecn-4471"] }
    }[a.cat];
    $("#apiResp").textContent = JSON.stringify({ model: a.id + "@" + a.ver, prediction: RESP, latency_ms: Math.round(a.lat * .45) }, null, 2);
    kpis("#apiKpis", [["Endpoint", live ? "Live" : "Pilot", live ? "Autoscaling 2–6 instances" : "Sandbox only", live ? "up" : ""], ["Region", "ap-mumbai-1", "OCI Mumbai"], ["Rate limit", live ? "600/min" : "60/min", "Per project token"], ["Auth", "OCI IAM", "Bearer token"]]);
    $("#schema").innerHTML = SCHEMA.map(function (f) { return "<div><dt><code>" + esc(f[0]) + "</code><span>" + esc(f[1]) + "</span></dt><dd>" + esc(f[2]) + "</dd></div>"; }).join("");
    var lang = "curl";
    function showCode() { $("#apiCode").textContent = CODE[lang]; $$("#apiLang [data-lang]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang); }); }
    $("#apiLang").addEventListener("click", function (e) { var b = e.target.closest("[data-lang]"); if (b) { lang = b.getAttribute("data-lang"); showCode(); } });
    showCode();
    $("#copyApi").addEventListener("click", function () { copy($("#apiCode").textContent, "Request copied"); });

    /* Logs */
    var vers = [["v" + a.ver, a.updated, { Production: "Promoted to production", Staging: "Promoted to staging", "In review": "Submitted for review", PoC: "Registered as a proof of concept" }[a.status]],
      [labels[labels.length - 2], "2026-08-30", "Retrained on Q2 data"], [labels[Math.max(0, labels.length - 4)], "2026-04-14", "New evaluation set added"], [labels[0], "2025-11-12", "First registered in the catalogue"]];
    vers = vers.filter(function (v, i) { return vers.findIndex(function (u) { return u[0] === v[0]; }) === i; });
    kpis("#logKpis", [["Uptime, 30 days", live ? "99.97%" : "—", live ? "SLA 99.9%" : "Not in production", live ? "up" : ""], ["Error rate", live ? "0.04%" : "0.3%", live ? "Last 24 hours" : "Pilot runs"],
      ["Last deploy", date(a.updated), "v" + a.ver], ["Open alerts", "0", "All rules passing", "up"]]);
    $("#changes").innerHTML = vers.map(function (v) { return "<li><b>" + esc(v[0]) + "</b><time>" + date(v[1]) + "</time><span>" + esc(v[2]) + "</span></li>"; }).join("");
    $("#alerts").innerHTML = [["Drift PSI above 0.2", "Passing"], ["p95 latency above " + ms(a.lat * 2), "Passing"], ["Error rate above 1%", "Passing"], ["Accuracy below " + (a.acc - 3).toFixed(1) + "%", live ? "Passing" : "Paused until rollout"]]
      .map(function (r) { var ok = r[1] === "Passing"; return '<li><span class="nd ' + (ok ? "ok" : "") + '" aria-hidden="true"></span><span>' + esc(r[0]) + '</span><span class="badge ' + (ok ? "success" : "neutral") + '">' + esc(r[1]) + "</span></li>"; }).join("");
    $("#events").innerHTML = (live ? [["10:42", "Batch scored " + compact(a.req / 24) + " requests from " + a.plants[0]], ["09:15", "Drift check passed (PSI 0.04)"], ["07:30", "Nightly evaluation: " + a.acc + "% on the holdout set"], ["Yesterday", "Endpoint autoscaled to 3 instances"], ["Mon", "Token rotated for " + (a.plants[1] || a.plants[0]) + " integration"]]
      : [["Today", "Pilot evaluation on 1,200 samples: " + a.acc + "%"], ["Yesterday", a.owner + " updated the model card"], ["Oct 20", "Reviewer comment: " + (a.gate || "awaiting results")]])
      .map(function (v) { return "<li><b>" + esc(v[0]) + "</b><span>" + esc(v[1]) + "</span></li>"; }).join("");

    // Tabs: arrow keys, Home and End move between them
    var tabs = $$('[role="tab"]');
    function select(tab, focus) {
      tabs.forEach(function (t) { var on = t === tab; t.classList.toggle("active", on); t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; $("#" + t.getAttribute("aria-controls")).hidden = !on; });
      if (focus) tab.focus();
      if (tab.id === "tab-performance") drawAcc();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
        if (n === null) return; e.preventDefault(); select(tabs[(n + tabs.length) % tabs.length], true);
      });
    });
  };

  PAGES.library = function () {
    var state = { cat: params.get("cat") || "All", sort: "updated", dir: -1, page: 1, filter: "" }, PER = 8;
    if (CATEGORIES.indexOf(state.cat) < 0) state.cat = "All";
    var live = ASSETS.filter(function (a) { return a.status === "Production"; }).length;
    $("#totalSplit").textContent = live + " in production · " + (ASSETS.length - live) + " in the pipeline";
    function rank(a, key) { return key === "status" ? STATUSES.indexOf(a.status) : key === "updated" ? a.updated : String(a[key]).toLowerCase(); }
    function draw() {
      var f = state.filter.toLowerCase();
      var view = ASSETS.filter(function (a) { return (state.cat === "All" || a.cat === state.cat) && (!f || (a.name + " " + a.owner + " " + a.tags.join(" ")).toLowerCase().indexOf(f) > -1); });
      view.sort(function (x, y) { var p = rank(x, state.sort), q = rank(y, state.sort); return (p < q ? -1 : p > q ? 1 : 0) * state.dir; });
      var pages = Math.max(1, Math.ceil(view.length / PER)); state.page = Math.min(state.page, pages);
      var start = (state.page - 1) * PER, slice = view.slice(start, start + PER);
      $$("#cats [data-cat]").forEach(function (b) { var on = b.getAttribute("data-cat") === state.cat; b.classList.toggle("active", on); b.setAttribute("aria-pressed", on); });
      $("#libLabel").textContent = state.cat === "All" ? "All Results" : state.cat;
      $("#libCount").textContent = view.length ? "Showing " + (start + 1) + "–" + (start + slice.length) + " of " + view.length + " results" : "No results";
      $$("th[data-sort]").forEach(function (th) { th.setAttribute("aria-sort", th.getAttribute("data-sort") === state.sort ? (state.dir > 0 ? "ascending" : "descending") : "none"); });
      $("#libBody").innerHTML = slice.map(function (a) {
        return '<tr><td><a class="col-name-cell" href="' + assetHref(a) + '">' + catIcon(a.cat) + '<span class="tt"><span class="nm">' + esc(a.name) + '</span><span class="sub">' + a.acc + "% accuracy · " + esc(a.cat) + "</span></span></a></td>" +
          "<td>" + date(a.updated) + '</td><td><span class="col-author">' + avatar(a.owner) + esc(a.owner) + "</span></td><td>" + badge(a.status) + "</td>" +
          '<td><button class="icon-btn" type="button" data-copy="' + a.id + '" aria-label="Copy link to ' + esc(a.name) + '"><span class="icon">' + ICON.copy + "</span></button></td></tr>";
      }).join("") || '<tr><td colspan="5" class="empty-row">No assets match “' + esc(state.filter) + '”. <button class="link-btn" type="button" id="clearLib">Clear the filter</button></td></tr>';
      $("#libCards").innerHTML = slice.map(function (a) {
        return '<a class="asset-card" href="' + assetHref(a) + '"><div class="asset-card-top"><div class="title-row">' + catIcon(a.cat) + "<p>" + esc(a.name) + "</p></div>" + badge(a.status) + "</div>" +
          '<div class="asset-card-footer"><span>' + esc(a.owner) + " · " + a.acc + "%</span><span>" + date(a.updated) + "</span></div></a>";
      }).join("") || '<p class="results-count">No assets match “' + esc(state.filter) + '”.</p>';
      $("#pageNums").innerHTML = Array.apply(null, { length: pages }).map(function (_, i) {
        return '<button type="button" data-pnum="' + (i + 1) + '"' + (i + 1 === state.page ? ' class="current" aria-current="page"' : "") + ' aria-label="Page ' + (i + 1) + '">' + (i + 1) + "</button>";
      }).join("");
      $('[data-pg="prev"]').disabled = state.page <= 1; $('[data-pg="next"]').disabled = state.page >= pages;
    }
    $("#cats").addEventListener("click", function (e) { var b = e.target.closest("[data-cat]"); if (b) { state.cat = b.getAttribute("data-cat"); state.page = 1; draw(); } });
    $$("th[data-sort] button").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.parentNode.getAttribute("data-sort");
        state.dir = state.sort === k ? -state.dir : (k === "updated" ? -1 : 1); state.sort = k; draw();
      });
    });
    var ft; $("#libFilter").addEventListener("input", function (e) { clearTimeout(ft); ft = setTimeout(function () { state.filter = e.target.value.trim(); state.page = 1; draw(); }, 120); });
    document.addEventListener("click", function (e) {
      var p = e.target.closest("[data-pg]"); if (p && !p.disabled) { state.page += p.getAttribute("data-pg") === "next" ? 1 : -1; draw(); }
      var n = e.target.closest("[data-pnum]"); if (n) { state.page = +n.getAttribute("data-pnum"); draw(); }
      if (e.target.closest("#clearLib")) { state.filter = ""; $("#libFilter").value = ""; draw(); }
      var c = e.target.closest("[data-copy]"); if (c) copy(location.href.replace(/[?#].*$/, "").replace(/[^/]*$/, "") + "asset-detail.html?id=" + c.getAttribute("data-copy"), "Link copied");
    });
    draw();
  };

  PAGES.analytics = function () {
    var prod = ASSETS.filter(function (a) { return a.status === "Production"; });
    var weeks = [3.1, 3.3, 3.4, 3.6, 3.7, 3.9, 4.2, 4.1, 4.5, 4.7, 4.9, 5.2].map(function (v) { return v * 1e5; });
    var labels = ["10 Aug", "17 Aug", "24 Aug", "31 Aug", "7 Sep", "14 Sep", "21 Sep", "28 Sep", "5 Oct", "12 Oct", "19 Oct", "26 Oct"];
    var avg = prod.reduce(function (s, a) { return s + a.acc; }, 0) / prod.length;
    var k = $$("#kpis .stat-val");
    k[0].textContent = ASSETS.length; k[1].textContent = prod.length; k[2].textContent = avg.toFixed(1) + "%"; k[3].textContent = compact(weeks[11]);
    $("#trendNow").textContent = "+" + Math.round((weeks[11] / weeks[7] - 1) * 100) + "% in the last 4 weeks";
    lineChart($("#trend"), { values: weeks, labels: labels, fmt: function (v, tip) { return tip ? "· " + num(v) + " inferences a day" : compact(v); }, label: "Inferences per day over the last 12 weeks", every: 2, h: 240 });
    $("#trendTable").innerHTML = srTable("Inferences per day, last 12 weeks", ["Week", "Inferences per day"], labels.map(function (l, i) { return [l, num(weeks[i])]; }));
    var SHORT = { "Predictive maintenance": "Maintenance", "Natural language": "Language", "Computer vision": "Vision", "Fleet telemetry": "Telemetry", Generative: "Generative" };
    bars($("#catBars"), CATEGORIES.map(function (c) {
      var all = ASSETS.filter(function (a) { return a.cat === c; }), p = all.filter(function (a) { return a.status === "Production"; }).length;
      return { label: SHORT[c], total: all.length, parts: [{ v: p, c: "#2563eb" }, { v: all.length - p, c: "#a78bfa" }] };
    }), { fmt: function (v) { return v; } });
    var byPlant = PLANTS.map(function (p) { var t = 0; ASSETS.forEach(function (a) { t += plantSplit(a)[p] || 0; }); return { label: p, value: t }; }).sort(function (x, y) { return y.value - x.value; });
    donut($("#usageDonut"), $("#usageLegend"), byPlant, function (v) { return compact(v) + "/day"; });
    var tot = byPlant.reduce(function (s, r) { return s + r.value; }, 0);
    $("#usageDonut .lbl").textContent = byPlant[0].label; $("#usageTop").textContent = Math.round(byPlant[0].value / tot * 100) + "%";
    $("#topModels").innerHTML = prod.slice().sort(function (x, y) { return y.acc - x.acc; }).slice(0, 4).map(function (a) {
      return '<a class="conv-card" href="' + assetHref(a) + '"><span class="conv-left"><span class="conv-title">' + esc(a.name) + '</span><span class="conv-desc">' + a.acc + "% validation accuracy · " + compact(a.req) + " requests a day</span></span>" +
        '<span class="conv-right">' + badge(a.status) + '<span class="icon chev" aria-hidden="true">' + ICON.chev + "</span></span></a>";
    }).join("");
    $("#builds").innerHTML = PROJECTS.filter(function (p) { return p.state !== "Completed"; }).slice(0, 4).map(function (p) {
      return '<div class="progress-row"><div class="top"><a class="name" href="' + assetHref(BY_ID[p.asset]) + '">' + esc(p.name) + '</a><span class="pct">' + p.pct + '%</span></div><div class="progress-track"><div class="progress-fill" style="width:' + p.pct + '%"></div></div><p class="pr-sub">' + esc(p.stage) + " · due " + date(p.due) + "</p></div>";
    }).join("");
    reveal(".card");
  };

  PAGES.projects = function () {
    var state = "All", projects = PROJECTS.slice();
    var STATE_BADGE = { "In Progress": "info", "Awaiting Review": "warning", Completed: "success" };
    function counts() { $$("#projFilters [data-f]").forEach(function (b) { var f = b.getAttribute("data-f"); $("span", b).textContent = f === "All" ? projects.length : projects.filter(function (p) { return p.state === f; }).length; }); }
    function draw() {
      var rows = projects.filter(function (p) { return state === "All" || p.state === state; });
      $("#projects").innerHTML = rows.map(function (p) {
        var done = p.state === "Completed";
        return '<article class="project-card"><div class="project-top"><div><h2 class="pc-title">' + esc(p.name) + "</h2><p>" + esc(p.desc) + "</p></div>" + '<span class="badge ' + STATE_BADGE[p.state] + '">' + esc(p.state) + "</span></div>" +
          '<div class="progress-row"><div class="top"><span class="name">' + esc(p.stage) + '</span><span class="pct">' + p.pct + '%</span></div><div class="progress-track" role="progressbar" aria-label="' + esc(p.name) + ' progress" aria-valuenow="' + p.pct + '" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill' + (done ? " done" : "") + '" style="width:' + p.pct + '%"></div></div></div>' +
          '<div class="project-footer"><div class="avatar-stack">' + p.team.map(function (n) { return AVATAR[n] ? '<span class="av" title="' + esc(n) + '" style="background-image:url(\'images/' + AVATAR[n] + '.svg\')"></span>' : '<span class="av initials" title="' + esc(n) + '">' + esc(initials(n)) + "</span>"; }).join("") +
          '<span class="sr-only">Team: ' + esc(p.team.join(", ")) + "</span></div>" + '<span class="due-date">' + (done ? "Closed " : "Due ") + date(p.due) + "</span></div>" +
          '<a class="pc-link" href="' + assetHref(BY_ID[p.asset]) + '">' + esc(BY_ID[p.asset].name) + '<span class="icon" aria-hidden="true">' + ICON.chev + "</span></a></article>";
      }).join("") || '<div class="empty-state"><h2>No projects here yet</h2><p>Start a project to track a model from data validation to deployment.</p></div>';
    }
    $("#projFilters").addEventListener("click", function (e) {
      var b = e.target.closest("[data-f]"); if (!b) return; state = b.getAttribute("data-f");
      $$("#projFilters [data-f]").forEach(function (x) { var on = x === b; x.classList.toggle("active", on); x.setAttribute("aria-pressed", on); }); draw();
    });
    // New-project drawer
    var drawer = $("#projDrawer"), form = $("#projForm"), opener, hideTimer;
    $("#pDue").min = today();
    $("#pAsset").innerHTML = ASSETS.map(function (a) { return '<option value="' + a.id + '">' + esc(a.name) + "</option>"; }).join("");
    function open() { clearTimeout(hideTimer); opener = document.activeElement; drawer.hidden = false; document.body.classList.add("no-scroll"); requestAnimationFrame(function () { drawer.classList.add("on"); }); $("#pName").focus(); }
    function close() { drawer.classList.remove("on"); document.body.classList.remove("no-scroll"); hideTimer = setTimeout(function () { drawer.hidden = true; }, reduceMotion ? 0 : 260); if (opener) opener.focus(); }
    $("#newProject").addEventListener("click", open);
    $$("[data-close]", drawer).forEach(function (b) { b.addEventListener("click", close); });
    drawer.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        var f = $$("button, input, select", drawer).filter(function (x) { return !x.disabled && x.offsetParent; }), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#pName"), due = $("#pDue");
      if (!check([[name, $("#pNameErr"), name.value.trim().length < 4, "Give the project a name of at least 4 characters."], [due, $("#pDueErr"), !due.value || due.value < today(), "Choose a due date from today onwards."]])) return;
      projects.unshift({ name: name.value.trim(), desc: "New project · owned by Eugene Sharma", state: "In Progress", stage: $("#pStage").value.trim() || "Kick-off", pct: 5, due: due.value, team: ["Eugene Sharma"], asset: $("#pAsset").value });
      form.reset(); close();
      $('#projFilters [data-f="All"]').click(); counts();
      toast("Project created. It's at the top of the list.");
    });
    counts(); draw(); reveal(".project-card");
  };

  PAGES.profile = function () {
    var acts = [
      ["Uploaded", "Battery Degradation Predictor v2.4", "battery-degradation", "Today, 09:12", "success", "Promoted to production"],
      ["Reviewed", "ADAS Lane Detection Engine", "adas-lane", "Yesterday", "warning", "Asked for the monsoon night audit"],
      ["Deployed", "Tata Customer Feedback Classifier", "feedback-classifier", "Mon", "success", "Rolled out to Lucknow"],
      ["Commented on", "EV Battery Cost Optimizer", "cobalt-optimizer", "Oct 20", "info", "Shortlisted 2 of 4 chemistry scenarios"],
      ["Reviewed", "Fleet Route Optimizer", "route-optimizer", "Oct 16", "neutral", "Left feedback on charging-stop edge cases"]
    ];
    $("#activity").innerHTML = acts.map(function (x) {
      return '<li class="tl-item"><span class="tl-dot ' + x[4] + '" aria-hidden="true"></span><a class="conv-card" href="asset-detail.html?id=' + x[2] + '"><span class="conv-left"><span class="conv-title">' + esc(x[0]) + " " + esc(x[1]) +
        '</span><span class="conv-desc">' + esc(x[5]) + '</span></span><span class="conv-right"><span class="tl-when">' + esc(x[3]) + '</span><span class="icon chev" aria-hidden="true">' + ICON.chev + "</span></span></a></li>";
    }).join("");
    $("#watching").innerHTML = ["cobalt-optimizer", "adas-lane", "battery-degradation"].map(function (id) {
      var a = BY_ID[id];
      return '<a class="suggest-card watch-card" href="' + assetHref(a) + '"><span class="watch-main"><span class="ref-glyph ' + CAT_CLASS[a.cat] + '" aria-hidden="true">' + ICON[a.cat] + '</span><span><span class="wn">' + esc(a.name) + '</span><span class="ws">' + a.acc + "% · v" + esc(a.ver) + "</span></span></span>" + badge(a.status) + "</a>";
    }).join("");
  };

  PAGES.settings = function () {
    var form = $("#settingsForm"), dirty = false, state = $("#saveState");
    form.addEventListener("input", function () { dirty = true; state.textContent = "Unsaved changes"; });
    $$('input[role="switch"]', form).forEach(function (s) { s.addEventListener("change", function () { toast(s.closest(".toggle-row").querySelector(".tt p").textContent + (s.checked ? ": on" : ": off")); }); });
    var pw = $("#fNew");
    pw.addEventListener("input", function () {
      var v = pw.value, sc = (v.length >= 10) + /\d/.test(v) + /[^A-Za-z0-9]/.test(v) + (v.length >= 14);
      var m = $("#pwMeter"); m.style.width = (v ? 16 + sc * 21 : 0) + "%"; m.className = sc >= 3 ? "strong" : sc >= 2 ? "ok" : "";
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#fName"), email = $("#fEmail"), cur = $("#fPwd"), nw = $("#fNew");
      var ok = check([[name, $("#fNameErr"), name.value.trim().length < 2, "Enter your full name."],
       [email, $("#fEmailErr"), !/^[^\s@]+@tatamotors\.com$/i.test(email.value.trim()), "Use your @tatamotors.com work email."],
       [cur, $("#fPwdErr"), !!nw.value && !cur.value, "Enter your current password to set a new one."],
       [nw, $("#fNewErr"), !!nw.value && (nw.value.length < 10 || !/\d/.test(nw.value)), "Use at least 10 characters, including a number."]]);
      if (!ok) { state.textContent = "Check the highlighted fields"; return; }
      cur.value = ""; nw.value = ""; $("#pwMeter").style.width = "0";
      dirty = false; state.textContent = "Saved just now"; toast("Settings saved");
    });
    window.addEventListener("beforeunload", function (e) { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
  };

  PAGES.upload = function () {
    var step = 1, form = $("#uploadForm"), file = $("#fileInput"), drop = $("#drop"), chosen = null;
    var next = $("#nextBtn"), back = $("#backBtn"), desc = $("#uDesc");
    function setFile(f) {
      chosen = f || null;
      $("#dropName").textContent = f ? f.name + " · " + (f.size / 1048576).toFixed(1) + " MB" : "";
      drop.classList.toggle("has", !!f);
      if (f && f.size > 500 * 1048576) {
        $("#fileErr").textContent = f.name + " is over 500 MB. Upload a smaller package or split it.";
        chosen = null; file.value = ""; $("#dropName").textContent = ""; drop.classList.remove("has");
      } else $("#fileErr").textContent = "";
    }
    file.addEventListener("change", function () { setFile(file.files[0]); });
    ["dragenter", "dragover"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("over"); }); });
    ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("over"); }); });
    drop.addEventListener("drop", function (e) { var f = e.dataTransfer.files[0]; if (f) setFile(f); });
    desc.addEventListener("input", function () { $("#uDescCount").textContent = desc.value.length + " / 400"; });
    function picked(name) { return $$('input[name="' + name + '"]:checked').map(function (x) { return x.value; }); }
    function go(n) {
      step = n;
      $$(".wiz").forEach(function (p) { p.hidden = +p.getAttribute("data-pane") !== n; });
      $$(".step").forEach(function (s) { var k = +s.getAttribute("data-step"); s.classList.toggle("active", k === n); s.classList.toggle("done", k < n); if (k === n) s.setAttribute("aria-current", "step"); else s.removeAttribute("aria-current"); });
      back.hidden = n === 1; next.textContent = n === 3 ? "Submit for review" : "Proceed to Step " + (n + 1);
      if (n === 3) {
        var rows = [["File", chosen ? chosen.name : "None attached (metadata only)"], ["Name", $("#uName").value.trim()], ["Category", $("#uCat").value], ["Description", desc.value.trim()],
          ["Segments", picked("seg").join(", ") || "None"], ["Plants", picked("plant").join(", ")], ["Team pillar", $("#uPillar").value], ["Maturity", $("#uStatus").value], ["Tags", $("#uTags").value.trim() || "None"]];
        $("#review").innerHTML = rows.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("");
      }
      var pane = $('.wiz[data-pane="' + n + '"]'), legend = pane && $("legend", pane);
      if (n > 1 && legend) { legend.tabIndex = -1; legend.focus(); }
    }
    next.addEventListener("click", function () {
      if (step === 1 && !check([[$("#uName"), $("#uNameErr"), $("#uName").value.trim().length < 4, "Give the asset a name of at least 4 characters."],
        [$("#uCat"), $("#uCatErr"), !$("#uCat").value, "Choose a category so people can find it."],
        [desc, $("#uDescErr"), desc.value.trim().length < 20, "Describe what it does in at least 20 characters."]])) return;
      if (step === 2 && !check([[{}, $("#plantErr"), !picked("plant").length, "Pick at least one plant."]])) { var p = $('input[name="plant"]'); if (p) p.focus(); return; }
      if (step === 3) {
        if (!check([[$("#uConfirm"), $("#confirmErr"), !$("#uConfirm").checked, "Confirm the data statement to submit."]])) return;
        $$(".wiz").forEach(function (p) { p.hidden = true; });
        $("#done").hidden = false; $("#wizActions").hidden = true;
        $$(".step").forEach(function (s) { s.classList.remove("active"); s.classList.add("done"); s.removeAttribute("aria-current"); });
        $("#doneText").textContent = $("#uName").value.trim() + " is queued for validation by " + $("#uPillar").value + ". You'll be notified when it's approved.";
        var h = $("#done h2"); h.tabIndex = -1; h.focus();
        return;
      }
      go(step + 1);
    });
    back.addEventListener("click", function () { go(step - 1); });
    $("#saveDraft").addEventListener("click", function () { toast("Draft saved. You can finish it later from the library."); });
    $("#again").addEventListener("click", function () { form.reset(); setFile(null); $("#uDescCount").textContent = "0 / 400"; $("#done").hidden = true; $("#wizActions").hidden = false; go(1); $("#uName").focus(); });
  };

  if (PAGES[page]) PAGES[page]();
})();
