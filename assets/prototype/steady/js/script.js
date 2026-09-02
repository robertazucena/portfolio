(function () {
  "use strict";

  /* ---------------------------------------------------------
     Preloader — the "translating into health" intro. Plays in
     full on every page load so the moment is always visible.
  --------------------------------------------------------- */
  var pre = document.getElementById("preloader");

  if (pre) {
    document.body.classList.add("preloading");
    // Timed to line up with the EKG-draw -> mark-morph animation in CSS.
    window.setTimeout(function () {
      pre.classList.add("hide");
      document.body.classList.remove("preloading");
      document.body.classList.add("is-entering");
      window.setTimeout(function () { pre.remove(); }, 700);
    }, 2150);
  }

  /* ---------------------------------------------------------
     Ambient background videos (wellness banner, quote banner):
     pause them for people who've asked for reduced motion, and
     fail quietly back to the gradient poster if a clip can't load.
  --------------------------------------------------------- */
  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".banner-illustration video, .quote-banner video").forEach(function (video) {
    if (prefersReducedMotion) {
      video.removeAttribute("autoplay");
      video.pause();
    }
    video.addEventListener("error", function () {
      video.style.display = "none"; // falls back to the CSS gradient background
    }, true);
  });

  /* ---------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var navCenter = document.querySelector(".nav-center");
  if (toggle && navCenter) {
    var setOpen = function (open) {
      navCenter.classList.toggle("open", open);
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
    };
    toggle.addEventListener("click", function () {
      setOpen(!navCenter.classList.contains("open"));
    });
    navCenter.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("click", function (e) {
      if (!navCenter.contains(e.target) && !toggle.contains(e.target)) {
        setOpen(false);
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1024) setOpen(false);
    });
  }

  /* ---------------------------------------------------------
     Mobile-app-style page transitions.
     Uses the native View Transitions API when available
     (see @view-transition in CSS). Falls back to a manual
     fade/slide-out before navigating on browsers without it.
  --------------------------------------------------------- */
  var supportsViewTransitions = "startViewTransition" in document;

  document.querySelectorAll('a[data-transition="page"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      if (!href || link.target === "_blank" || e.metaKey || e.ctrlKey) return;
      if (supportsViewTransitions) return; // let the browser handle it natively
      e.preventDefault();
      document.body.classList.add("is-leaving");
      window.setTimeout(function () { window.location.href = href; }, 260);
    });
  });

  /* ---------------------------------------------------------
     Toast helper (used by non-destination CTAs like FAB / connect)
  --------------------------------------------------------- */
  window.steadyToast = function (message) {
    var el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    requestAnimationFrame(function () { el.classList.add("show"); });
    window.clearTimeout(el._t);
    el._t = window.setTimeout(function () { el.classList.remove("show"); }, 2200);
  };

  document.querySelectorAll("[data-toast]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      window.steadyToast(btn.getAttribute("data-toast"));
    });
  });

  /* ---------------------------------------------------------
     Goal stepper (Nourish Log page)
  --------------------------------------------------------- */
  var stepperValue = document.querySelector("[data-stepper-value]");
  if (stepperValue) {
    var val = parseInt(stepperValue.getAttribute("data-stepper-value"), 10) || 2000;
    var render = function () { stepperValue.textContent = val.toLocaleString() + " kcal"; };
    var minus = document.querySelector("[data-stepper-minus]");
    var plus = document.querySelector("[data-stepper-plus]");
    if (minus) minus.addEventListener("click", function () { val = Math.max(1200, val - 50); render(); });
    if (plus) plus.addEventListener("click", function () { val = Math.min(4000, val + 50); render(); });
  }

  /* ---------------------------------------------------------
     Routine "Done" / "Skip" micro-interaction (Morning routine)
  --------------------------------------------------------- */
  document.querySelectorAll("[data-routine-done]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".routine-card");
      if (card) {
        card.classList.remove("is-active");
        card.classList.add("is-done");
        var check = card.querySelector(".rc-check");
        if (check) {
          check.classList.add("done");
          check.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
        }
      }
      window.steadyToast("Nice work — step marked done.");
    });
  });

  /* ---------------------------------------------------------
     Animate progress bars / donut arcs in on scroll-into-view
  --------------------------------------------------------- */
  var animated = document.querySelectorAll("[data-animate-width]");
  if (animated.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var w = el.getAttribute("data-animate-width");
          el.style.width = "0%";
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { el.style.width = w; });
          });
          io.unobserve(el);
        }
      });
    }, { threshold: .3 });
    animated.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------
     Steady Companion — fixed AI FAQ chat widget (same on every
     page). Lightweight keyword-matched FAQ, no backend required.
  --------------------------------------------------------- */
  var aiFab = document.getElementById("aiFabBtn");
  var aiPanel = document.getElementById("aiPanel");
  var aiClose = document.getElementById("aiCloseBtn");
  var aiMessages = document.getElementById("aiMessages");
  var aiForm = document.getElementById("aiForm");
  var aiInput = document.getElementById("aiInput");
  var aiSuggest = document.getElementById("aiSuggest");

  if (aiFab && aiPanel && aiForm) {
    var FAQ = [
      { q: "How is my heart rate calculated?", a: "We average readings from your connected device every few minutes and compare them against your resting baseline to flag anything unusual." },
      { q: "How do I log a meal?", a: "Go to Health → Nourish Log, tap a meal group like Breakfast, Lunch, Dinner or Snacks, and add what you ate — calories and macros update automatically." },
      { q: "How do I change my daily calorie goal?", a: "On the Health page, use the − / + buttons under \u201cDaily Target Goal\u201d to adjust your target in 50 kcal steps." },
      { q: "What is Circle?", a: "Circle is your wellness network — friends, coaches and pros you can follow, message, and get encouragement from." },
      { q: "How does the morning routine work?", a: "Sleep → Morning routine walks you through four gentle steps. Tap Done to complete a step, or Skip if you'd rather come back to it later." },
      { q: "Is my data private?", a: "Your health data stays tied to your account and is never shared without permission. You can review our Privacy page in the footer any time." }
    ];

    function scrollToBottom() { aiMessages.scrollTop = aiMessages.scrollHeight; }

    function addMessage(text, who) {
      var el = document.createElement("div");
      el.className = "ai-msg " + who;
      el.textContent = text;
      aiMessages.appendChild(el);
      scrollToBottom();
      return el;
    }

    function renderSuggestions() {
      aiSuggest.innerHTML = "";
      FAQ.slice(0, 4).forEach(function (item) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = item.q;
        btn.addEventListener("click", function () {
          addMessage(item.q, "user");
          botReply(item.q);
        });
        aiSuggest.appendChild(btn);
      });
    }

    function botReply(userText) {
      var typing = document.createElement("div");
      typing.className = "ai-typing";
      typing.innerHTML = "<span></span><span></span><span></span>";
      aiMessages.appendChild(typing);
      scrollToBottom();

      window.setTimeout(function () {
        typing.remove();
        var lower = (userText || "").toLowerCase();
        var match = FAQ.find(function (item) {
          return item.q.toLowerCase().split(/\s+/).some(function (w) {
            return w.length > 3 && lower.indexOf(w) !== -1;
          });
        });
        var answer = match ? match.a : "I don't have a canned answer for that one yet — here are a few things I can help with:";
        addMessage(answer, "bot");
        if (!match) renderSuggestions();
      }, 600 + Math.random() * 500);
    }

    function openChat() {
      aiPanel.classList.add("open");
      aiFab.classList.add("open");
      aiFab.setAttribute("aria-expanded", "true");
      aiPanel.setAttribute("aria-hidden", "false");
      window.setTimeout(function () { aiInput.focus(); }, 200);
    }
    function closeChat() {
      aiPanel.classList.remove("open");
      aiFab.classList.remove("open");
      aiFab.setAttribute("aria-expanded", "false");
      aiPanel.setAttribute("aria-hidden", "true");
    }

    aiFab.addEventListener("click", function () {
      if (aiPanel.classList.contains("open")) closeChat(); else openChat();
    });
    if (aiClose) aiClose.addEventListener("click", closeChat);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeChat();
    });

    aiForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = aiInput.value.trim();
      if (!val) return;
      addMessage(val, "user");
      aiInput.value = "";
      botReply(val);
    });

    renderSuggestions();
  }
})();
