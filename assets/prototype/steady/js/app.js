(function () {
  "use strict";

  /* ---------------------------------------------------------
     Preloader — plays once per browser tab session, then
     the "heartbeat" mark stays cached so return visits within
     the session skip straight to the entrance animation.
  --------------------------------------------------------- */
  var SEEN_KEY = "steady:intro-seen";
  var pre = document.getElementById("preloader");

  function finishPreloader() {
    if (!pre) return;
    pre.classList.add("hide");
    document.body.classList.remove("preloading");
    document.body.classList.add("is-entering");
    window.setTimeout(function () {
      pre.remove();
    }, 700);
  }

  if (pre) {
    var alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem(SEEN_KEY) === "1"; } catch (e) {}

    if (alreadySeen) {
      // Quick, quiet entrance for subsequent pages in the same tab.
      pre.classList.add("hide");
      document.body.classList.add("is-entering");
      window.setTimeout(function () { pre.remove(); }, 350);
    } else {
      document.body.classList.add("preloading");
      try { sessionStorage.setItem(SEEN_KEY, "1"); } catch (e) {}
      // Timed to line up with the EKG-draw -> mark-morph animation in CSS.
      window.setTimeout(finishPreloader, 2150);
    }
  }

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
})();
