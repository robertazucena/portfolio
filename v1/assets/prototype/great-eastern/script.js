/* Great Eastern Claims AI Portal — shared behaviour */
(function () {
  "use strict";

  /* ---------------------------------------------------------------
   * Brand preloader: simple, sturdy page-to-page transition.
   * Shown briefly on internal navigation; hidden on load. Exposed
   * on window so other flows (e.g. the AI progress redirect) can
   * reuse the exact same transition.
   * ------------------------------------------------------------- */
  function initPreloader() {
    var pre = document.getElementById("preloader");
    if (!pre) return;

    function hide() {
      pre.classList.add("hidden");
    }
    if (document.readyState === "complete") {
      requestAnimationFrame(function () { requestAnimationFrame(hide); });
    } else {
      window.addEventListener("load", function () {
        requestAnimationFrame(function () { requestAnimationFrame(hide); });
      });
    }

    document.addEventListener("click", function (e) {
      var link = e.target.closest("a[href]");
      if (!link) return;
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("data-no-transition")) return;
      if (/^https?:\/\//i.test(href) || href.indexOf("mailto:") === 0) return;

      e.preventDefault();
      goTo(href);
    });

    window.geNavigate = goTo;

    function goTo(href, delay) {
      pre.classList.remove("hidden");
      window.setTimeout(function () {
        window.location.href = href;
      }, delay || 260);
    }
  }

  /* ---------------------------------------------------------------
   * Toasts — small, reusable confirmation messages.
   * ------------------------------------------------------------- */
  function ensureToastContainer() {
    var c = document.querySelector(".toast-container");
    if (!c) {
      c = document.createElement("div");
      c.className = "toast-container";
      document.body.appendChild(c);
    }
    return c;
  }

  var TOAST_ICONS = {
    success: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#10B981"/><path d="M7 12.5l3 3 7-7" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#3B82F6"/><path d="M12 7.5v.01M12 11v5.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
    default: ""
  };

  function toast(message, type, duration) {
    var container = ensureToastContainer();
    var el = document.createElement("div");
    el.className = "toast" + (type ? " " + type : "");
    el.innerHTML = (TOAST_ICONS[type] || "") + "<span>" + message + "</span>";
    container.appendChild(el);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.classList.add("show"); });
    });
    window.setTimeout(function () {
      el.classList.remove("show");
      window.setTimeout(function () { el.remove(); }, 300);
    }, duration || 3200);
  }
  window.geToast = toast;

  /* ---------------------------------------------------------------
   * Claims worklist — live search, status filter chips, sort toggle,
   * and an honest pager (this is a design preview, not wired to a
   * real dataset, so "Next" says so rather than faking pages).
   * ------------------------------------------------------------- */
  function initWorklist() {
    var list = document.querySelector(".worklist-list");
    if (!list) return;

    var rows = Array.prototype.slice.call(list.querySelectorAll(".claim-row"));
    var chips = document.querySelectorAll(".chip[data-filter]");
    var search = document.querySelector(".search-box input");
    var countEl = document.querySelector(".worklist-footer .count");
    var activeFilter = "all";

    var empty = document.createElement("div");
    empty.className = "empty-state";
    empty.hidden = true;
    empty.innerHTML =
      '<svg viewBox="0 0 24 24"><use href="#icon-search"/></svg>' +
      "<p>No claims match your search.</p>" +
      '<span class="hint">Try a different name, plate number, or filter.</span>';
    list.parentNode.insertBefore(empty, list.nextSibling);

    function applyFilters() {
      var q = (search && search.value ? search.value.trim().toLowerCase() : "");
      var visible = 0;
      rows.forEach(function (row) {
        var matchesFilter = activeFilter === "all" || row.dataset.status === activeFilter;
        var matchesSearch = !q || row.textContent.toLowerCase().indexOf(q) !== -1;
        var show = matchesFilter && matchesSearch;
        row.style.display = show ? "" : "none";
        if (show) visible += 1;
      });
      empty.hidden = visible !== 0;
      list.style.display = visible === 0 ? "none" : "flex";
      if (countEl) {
        var total = rows.length;
        countEl.textContent = visible === total
          ? "Showing " + total + " of 40 claimant cases"
          : "Showing " + visible + " of " + total + " loaded cases";
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        activeFilter = chip.dataset.filter;
        applyFilters();
      });
    });

    if (search) {
      search.addEventListener("input", applyFilters);
    }

    var sortLink = document.querySelector(".sort-link");
    if (sortLink) {
      var descending = false;
      sortLink.addEventListener("click", function () {
        descending = !descending;
        sortLink.classList.toggle("desc", descending);
        var sorted = rows.slice().sort(function (a, b) {
          var idA = parseInt(a.dataset.id, 10);
          var idB = parseInt(b.dataset.id, 10);
          return descending ? idB - idA : idA - idB;
        });
        sorted.forEach(function (row) { list.appendChild(row); });
      });
    }

    var nextBtn = document.querySelector(".pager button:last-child");
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        toast("You've reached the end of this preview — the full worklist paginates through all 40 cases.", "info");
      });
    }

    applyFilters();
  }

  /* ---------------------------------------------------------------
   * "New Claim Case" modal (dashboard) — a genuinely working form
   * that prepends a fresh row to the Recent Submissions queue.
   * ------------------------------------------------------------- */
  function initNewClaimModal() {
    var openBtn = document.getElementById("new-claim-btn");
    var overlay = document.getElementById("new-claim-modal");
    if (!openBtn || !overlay) return;

    var form = overlay.querySelector("form");
    var closers = overlay.querySelectorAll("[data-modal-close]");

    function open() {
      overlay.classList.add("open");
      var firstInput = overlay.querySelector("input");
      if (firstInput) window.setTimeout(function () { firstInput.focus(); }, 200);
      document.addEventListener("keydown", onKeydown);
    }
    function close() {
      overlay.classList.remove("open");
      document.removeEventListener("keydown", onKeydown);
    }
    function onKeydown(e) {
      if (e.key === "Escape") close();
    }

    openBtn.addEventListener("click", open);
    closers.forEach(function (el) { el.addEventListener("click", close); });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var vehicle = form.vehicle.value.trim() || "New Vehicle";
        var plate = form.plate.value.trim().toUpperCase() || "PENDING";
        var claimant = form.claimant.value.trim() || "Unnamed Claimant";
        var claimId = "O" + (3500 + Math.floor(Math.random() * 499));

        addSubmissionRow(claimId, vehicle, plate, claimant);
        close();
        form.reset();
        toast("Claim " + claimId + " created and added to your worklist.", "success");
      });
    }
  }

  function addSubmissionRow(claimId, vehicle, plate, claimant) {
    var tbody = document.querySelector(".claims-table tbody");
    if (tbody) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="claim-id"><a href="claim-detail.html">' + claimId + "</a></td>" +
        '<td><div class="veh-name">' + escapeHtml(vehicle) + '</div><div class="veh-plate">' + escapeHtml(plate) + "</div></td>" +
        '<td class="submitted">' + escapeHtml(claimant) + "</td>" +
        '<td class="date">Today</td>' +
        '<td><span class="status-pill status-pending">Pending</span></td>';
      tr.style.opacity = "0";
      tbody.insertBefore(tr, tbody.firstChild);
      requestAnimationFrame(function () {
        tr.style.transition = "opacity .35s ease";
        requestAnimationFrame(function () { tr.style.opacity = "1"; });
      });
    }

    var mobileList = document.querySelector(".mobile-submissions");
    if (mobileList) {
      var card = document.createElement("div");
      card.className = "msub-card";
      card.style.opacity = "0";
      card.innerHTML =
        '<div class="msub-top"><span class="claim-id">' + claimId + '</span><span class="status-pill status-pending">Pending</span></div>' +
        '<div class="msub-bottom"><div><div class="veh">' + escapeHtml(vehicle) + '</div><div class="sub">' + escapeHtml(plate) + " • " + escapeHtml(claimant) + '</div></div><span class="date">Today</span></div>';
      mobileList.insertBefore(card, mobileList.firstChild);
      requestAnimationFrame(function () {
        card.style.transition = "opacity .35s ease";
        requestAnimationFrame(function () { card.style.opacity = "1"; });
      });
    }
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------------------------------------------------------
   * AI in-progress screen: a full, believable 3-step run that ends
   * by handing off to the results page through the same preloader
   * transition used everywhere else, instead of a hard redirect.
   * ------------------------------------------------------------- */
  function initAiProgress() {
    var card = document.querySelector("[data-ai-progress]");
    if (!card) return;

    var meter = card.querySelector(".circular-meter");
    var meterIcon = card.querySelector(".meter-icon");
    var progressCircle = card.querySelector(".progress");
    var runningEl = card.querySelector(".running");
    var elapsedEl = card.querySelector(".elapsed");
    var redirectEl = card.querySelector(".redirect-msg");
    var steps = card.querySelectorAll(".step");
    var lines = card.querySelectorAll(".step-line");

    var CIRC = 2 * Math.PI * 42;
    var elapsed = 155;
    var elapsedTimer = null;
    var done = false;

    function setRing(fraction) {
      if (progressCircle) {
        progressCircle.style.strokeDashoffset = String(CIRC * (1 - fraction));
      }
    }

    function paintElapsed() {
      var m = Math.floor(elapsed / 60);
      var s = elapsed % 60;
      if (elapsedEl) {
        elapsedEl.textContent =
          "Processing elapsed: " + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
      }
    }

    function dotSvg(state) {
      if (state === "done") {
        return '<svg viewBox="0 0 24 24" class="pop"><circle cx="12" cy="12" r="11" fill="#10B981"/><path d="M7 12.5l3 3 7-7" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      }
      if (state === "active") {
        return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" stroke="#003DA5" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="4" fill="#003DA5"><animate attributeName="r" values="4;5.5;4" dur="1.3s" repeatCount="indefinite"/></circle></svg>';
      }
      return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" stroke="#E2E8F0" stroke-width="2" fill="none"/></svg>';
    }

    function advanceStep(index, nextText) {
      var step = steps[index];
      if (!step) return;
      step.classList.remove("active");
      step.classList.add("done");
      var sub = step.querySelector(".sub");
      if (sub) sub.textContent = nextText;
      var dot = step.querySelector(".step-dot");
      if (dot) dot.innerHTML = dotSvg("done");
      if (lines[index]) lines[index].classList.add("done");
    }

    function activateStep(index, nextText) {
      var step = steps[index];
      if (!step) return;
      step.classList.add("active");
      var sub = step.querySelector(".sub");
      if (sub) sub.textContent = nextText;
      var dot = step.querySelector(".step-dot");
      if (dot) dot.innerHTML = dotSvg("active");
    }

    function finish() {
      done = true;
      if (meter) meter.classList.add("done");
      if (meterIcon) {
        meterIcon.classList.remove("pulse");
        meterIcon.innerHTML =
          '<svg viewBox="0 0 24 24" width="30" height="30"><circle cx="12" cy="12" r="11" fill="#10B981"/><path d="M7 12.5l3 3 7-7" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      }
      if (runningEl) runningEl.textContent = "Assessment Complete";
      if (redirectEl) redirectEl.hidden = false;
      setRing(1);
      window.clearInterval(elapsedTimer);

      window.setTimeout(function () {
        if (window.geNavigate) {
          window.geNavigate("ai-results.html", 320);
        } else {
          window.location.href = "ai-results.html";
        }
      }, 1400);
    }

    // Initial state: step 1 already complete, step 2 under way.
    if (meterIcon) meterIcon.classList.add("pulse");
    setRing(1 / 3);
    paintElapsed();

    elapsedTimer = window.setInterval(function () {
      if (done) return;
      elapsed += 1;
      paintElapsed();
    }, 1000);

    window.setTimeout(function () {
      advanceStep(1, "Completed - bumper & headlamp geometry mapped");
      activateStep(2, "In progress - Estimating parts and labour...");
      if (runningEl) runningEl.textContent = "Estimating parts & labour...";
      setRing(2 / 3);
    }, 4200);

    window.setTimeout(function () {
      advanceStep(2, "Completed - final cost estimate generated");
      finish();
    }, 8200);
  }

  /* ---------------------------------------------------------------
   * Final report — make the two action buttons feel real.
   * ------------------------------------------------------------- */
  function initFinalReport() {
    var reviewBtn = document.getElementById("manual-review-btn");
    if (reviewBtn) {
      reviewBtn.addEventListener("click", function () {
        reviewBtn.disabled = true;
        reviewBtn.textContent = "Review Requested";
        toast("Manual review requested — an adjuster will follow up within 1 business day.", "info");
      });
    }

    var submitBtn = document.getElementById("submit-case-btn");
    if (submitBtn) {
      submitBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        toast("Claim O3492 authorized and submitted successfully.", "success");
        var href = submitBtn.getAttribute("href");
        window.setTimeout(function () {
          if (window.geNavigate) {
            window.geNavigate(href, 320);
          } else {
            window.location.href = href;
          }
        }, 900);
      });
    }
  }

  /* ---------------------------------------------------------------
   * Reports page — download links + export button give feedback.
   * ------------------------------------------------------------- */
  function initReports() {
    var downloadLinks = document.querySelectorAll(".download-link[data-report]");
    downloadLinks.forEach(function (btn) {
      btn.addEventListener("click", function () {
        toast("Preparing \u201c" + btn.dataset.report + "\u201d for download...", "info");
      });
    });
    var exportBtn = document.getElementById("export-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        toast("Summary export queued — you'll get a notification when it's ready.", "success");
      });
    }
  }

  /* ---------------------------------------------------------------
   * Settings page — section nav, form save, toggles, buttons.
   * ------------------------------------------------------------- */
  function initSettings() {
    var settingsNav = document.querySelector(".settings-nav");
    if (!settingsNav) return;

    var navLinks = settingsNav.querySelectorAll("a");
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.forEach(function (l) { l.classList.remove("active"); });
        link.classList.add("active");
      });
    });

    var profileForm = document.getElementById("profile-form");
    if (profileForm) {
      profileForm.addEventListener("submit", function (e) {
        e.preventDefault();
        toast("Profile updated successfully.", "success");
      });
    }

    var changePhotoBtn = document.getElementById("change-photo-btn");
    if (changePhotoBtn) {
      changePhotoBtn.addEventListener("click", function () {
        toast("Photo upload isn't wired up in this preview.", "info");
      });
    }

    var changePasswordBtn = document.getElementById("change-password-btn");
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener("click", function () {
        toast("A password reset link has been sent to your email.", "info");
      });
    }

    var signOutBtn = document.getElementById("sign-out-btn");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", function () {
        toast("You've been signed out of this device.", "info");
      });
    }

    var autopilotToggle = document.getElementById("autopilot-toggle");
    if (autopilotToggle) {
      autopilotToggle.addEventListener("change", function () {
        toast(
          autopilotToggle.checked ? "AI Autopilot enabled." : "AI Autopilot disabled — claims will need manual review.",
          autopilotToggle.checked ? "success" : "info"
        );
      });
    }

    settingsNav.querySelectorAll("a[href^='#']").forEach(function (link) {
      link.addEventListener("click", function (e) {
        var target = document.querySelector(link.getAttribute("href"));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initPreloader();
    initWorklist();
    initNewClaimModal();
    initAiProgress();
    initFinalReport();
    initReports();
    initSettings();
  });

  // Preloader must attach before DOMContentLoaded in case of fast clicks.
  initPreloader();
})();
