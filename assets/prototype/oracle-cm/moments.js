/* Customer Moments: immersive layer shared by every page.
   Gallery hero deck, card tilt + open transition, editor preview & send,
   dashboard count-ups and chart draw-in. All motion respects reduced motion. */
(function () {
  var REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var EASE = "cubic-bezier(.23,1,.32,1)";
  var VT = "onpagereveal" in window;

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
      items.forEach(function (c, i) {
        c.animate([{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }],
          { duration: 520, delay: 60 * i, easing: EASE, fill: "backwards" });
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
  /* Shared-element morph from the clicked card art into the editor preview. */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a.mx-gcard, a#new-moment-cta");
    if (!a || !VT || REDUCED || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    e.stopPropagation();
    var img = a.id === "new-moment-cta" ? $(".mx-front img") : $(".mx-art img", a);
    if (img) img.style.viewTransitionName = "moment-art";
    location.href = a.getAttribute("href");
  }, true);

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
    $("#art-img").style.viewTransitionName = "moment-art";

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
  function preloader() {
    var q = [], ready = true;
    window.MXWhenReady = function (cb) { ready ? cb() : q.push(cb); };
    if (!$("#mx-deck") || REDUCED) return;
    var framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
    var seen = false; try { seen = sessionStorage.getItem("mx-seen") === "1"; sessionStorage.setItem("mx-seen", "1"); } catch (e) {}
    if (framed || seen) return;
    ready = false;
    var el = document.createElement("div");
    el.className = "mx-loader";
    el.setAttribute("role", "status");
    el.setAttribute("aria-label", "Loading Customer Moments");
    el.innerHTML = '<div class="mx-loader-deck" aria-hidden="true">' +
      '<span style="background-image:url(assets/merry-christmas.jpg)"></span>' +
      '<span style="background-image:url(assets/deal-sealed.jpg)"></span>' +
      '<span style="background-image:url(assets/happy-diwali.jpg)"></span></div>' +
      '<p class="mx-loader-t" aria-hidden="true">Gathering your moments</p>';
    document.body.appendChild(el);
    var t0 = Date.now();
    function hide() {
      if (el.classList.contains("is-out")) return;
      el.classList.add("is-out");
      ready = true; q.splice(0).forEach(function (cb) { cb(); });
      setTimeout(function () { el.remove(); }, 500);
    }
    function onLoad() { setTimeout(hide, Math.max(0, 1500 - (Date.now() - t0))); }
    document.readyState === "complete" ? onLoad() : window.addEventListener("load", onLoad);
    setTimeout(hide, 3200);
  }

  window.MX = { cards: cards, toast: toast };
  preloader();

  function init() {
    fillIcons(document);
    soonTags();
    deck();
    editor();
    countUps();
    charts();
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
