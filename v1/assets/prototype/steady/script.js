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
    var ICON_HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
    var FAQ = [
      {
        q: "How is my heart rate trending?",
        a: "Your heart rate has been beautifully steady this week. Your resting average is 62 BPM, showing great cardiovascular recovery during rest.",
        widget:
          '<div class="ai-inline-widget">' +
            '<div class="ai-inline-header">' +
              '<div class="ai-inline-left"><span class="ai-inline-icon-pill">' + ICON_HEART + '</span><span class="ai-inline-label">7-day trend</span></div>' +
              '<span class="ai-inline-badge">Steady</span>' +
            '</div>' +
            '<div class="ai-inline-stat-row">' +
              '<p class="ai-inline-stat">62<span>BPM avg</span></p>' +
              '<div class="ai-sparkline-mini">' +
                [6, 12, 8, 18, 10, 14, 20].map(function (h) { return '<i style="height:' + h + 'px"></i>'; }).join("") +
              '</div>' +
            '</div>' +
          '</div>'
      },
      {
        q: "How was my sleep last night?",
        a: "You logged 7h 32m of sleep, which is +45m more than the previous night. Your Deep sleep was exceptionally restorative.",
        widget:
          '<div class="ai-inline-widget">' +
            '<div class="ai-sleep-stage-row">' +
              '<div class="ai-stage-block"><span>Deep</span><b style="color:var(--accent)">1h 45m</b></div>' +
              '<div class="ai-stage-block"><span>Light</span><b>4h 12m</b></div>' +
              '<div class="ai-stage-block"><span>REM</span><b style="color:#f59e0b">1h 35m</b></div>' +
            '</div>' +
          '</div>'
      },
      { q: "How do I log a meal?", a: "Go to Health → Nourish Log, tap a meal group like Breakfast, Lunch, Dinner or Snacks, and add what you ate — calories and macros update automatically." },
      { q: "How do I change my daily calorie goal?", a: "On the Health page, use the − / + buttons under \u201cDaily Target Goal\u201d to adjust your target in 50 kcal steps." },
      { q: "What is Circle?", a: "Circle is your wellness network — friends, coaches and pros you can follow, message, and get encouragement from." },
      { q: "How does the morning routine work?", a: "Sleep → Morning routine walks you through four gentle steps. Tap Done to complete a step, or Skip if you'd rather come back to it later." },
      { q: "Is my data private?", a: "Your health data stays tied to your account and is never shared without permission. You can review our Privacy page in the footer any time." }
    ];

    function scrollToBottom() { aiMessages.scrollTop = aiMessages.scrollHeight; }

    function addMessage(text, who, widgetHtml) {
      var el = document.createElement("div");
      el.className = "ai-msg " + who + (widgetHtml ? " has-widget" : "");
      if (widgetHtml) {
        var p = document.createElement("p");
        p.style.margin = "0";
        p.textContent = text;
        el.appendChild(p);
        var wrap = document.createElement("div");
        wrap.innerHTML = widgetHtml; // static, hardcoded template — not user input
        el.appendChild(wrap.firstChild);
      } else {
        el.textContent = text;
      }
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
        addMessage(answer, "bot", match && match.widget);
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

  /* ---------------------------------------------------------
     Circle page — 1:1 "Message" chat modal, opened from peer,
     pro, and suggested-connection cards.
  --------------------------------------------------------- */
  var chatBackdrop = document.getElementById("chatBackdrop");
  var chatModal = document.getElementById("chatModal");
  var chatAvatar = document.getElementById("chatAvatar");
  var chatName = document.getElementById("chatName");
  var chatSub = document.getElementById("chatSub");
  var chatMessages = document.getElementById("chatMessages");
  var chatCloseBtn = document.getElementById("chatCloseBtn");
  var chatForm = document.getElementById("chatForm");
  var chatInput = document.getElementById("chatInput");

  if (chatModal && chatBackdrop && chatMessages) {
    var DEFAULT_CONVO = chatMessages.innerHTML;
    var currentChatName = null;

    function openPeerChat(card) {
      var name = card.getAttribute("data-chat-name");
      var role = card.getAttribute("data-chat-role") || "Friend";
      var initials = card.getAttribute("data-chat-initials") || "??";
      var grad = card.getAttribute("data-chat-grad") || "linear-gradient(135deg,#f6ad55,#e76f51)";
      chatAvatar.textContent = initials;
      chatAvatar.style.background = grad;
      chatName.textContent = name;
      chatSub.textContent = "Online \u00b7 " + role;
      if (name !== currentChatName) {
        chatMessages.innerHTML = DEFAULT_CONVO;
        currentChatName = name;
      }
      chatBackdrop.classList.add("open");
      chatModal.classList.add("open");
      chatModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      window.setTimeout(function () { chatInput.focus(); }, 200);
    }
    function closePeerChat() {
      chatBackdrop.classList.remove("open");
      chatModal.classList.remove("open");
      chatModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }

    document.querySelectorAll(".peer-card[data-chat-name], .suggest-card[data-chat-name]").forEach(function (card) {
      card.addEventListener("click", function (e) {
        if (e.target.closest("button")) return; // let Connect keep its own click behavior
        openPeerChat(card);
      });
    });

    chatCloseBtn.addEventListener("click", closePeerChat);
    chatBackdrop.addEventListener("click", closePeerChat);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePeerChat();
    });

    chatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = chatInput.value.trim();
      if (!val) return;
      var bubble = document.createElement("div");
      bubble.className = "chat-bubble me";
      bubble.textContent = val;
      chatMessages.appendChild(bubble);
      chatInput.value = "";
      chatMessages.scrollTop = chatMessages.scrollHeight;
      window.setTimeout(function () {
        var reply = document.createElement("div");
        reply.className = "chat-bubble them";
        reply.textContent = "Love that energy \u2014 let's keep it going! \ud83d\udcaa";
        chatMessages.appendChild(reply);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 900);
    });
  }

  /* ---------------------------------------------------------
     Health page — "Log food" modal: Search / Scan barcode / Photo.
     All three methods are simulated (no real barcode/vision API),
     but all three genuinely append a real line item to the meal log.
  --------------------------------------------------------- */
  var foodBackdrop = document.getElementById("foodBackdrop");
  var foodModal = document.getElementById("foodModal");
  var foodCloseBtn = document.getElementById("foodCloseBtn");
  var foodMealLabel = document.getElementById("foodMealLabel");

  if (foodModal && foodBackdrop) {
    var FOOD_DB = [
      { name: "Grilled Chicken Breast (120g)", kcal: 165, detail: "31g protein \u00b7 0g carbs \u00b7 4g fat" },
      { name: "Avocado (half)", kcal: 120, detail: "1g protein \u00b7 6g carbs \u00b7 11g fat" },
      { name: "Brown Rice (1 cup)", kcal: 216, detail: "5g protein \u00b7 45g carbs \u00b7 2g fat" },
      { name: "Greek Yogurt, plain (170g)", kcal: 100, detail: "17g protein \u00b7 6g carbs \u00b7 0g fat" },
      { name: "Almonds (1 oz)", kcal: 164, detail: "6g protein \u00b7 6g carbs \u00b7 14g fat" },
      { name: "Banana (medium)", kcal: 105, detail: "1g protein \u00b7 27g carbs \u00b7 0g fat" },
      { name: "Salmon Fillet (150g)", kcal: 235, detail: "31g protein \u00b7 0g carbs \u00b7 12g fat" },
      { name: "Quinoa, cooked (1 cup)", kcal: 222, detail: "8g protein \u00b7 39g carbs \u00b7 4g fat" }
    ];

    var activeMeal = "Snacks";
    var searchInput = document.getElementById("foodSearchInput");
    var resultsEl = document.getElementById("foodResults");
    var scanBtn = document.getElementById("foodScanBtn");
    var scanFrame = document.getElementById("foodScanFrame");
    var scanResult = document.getElementById("foodScanResult");
    var photoDrop = document.getElementById("foodPhotoDrop");
    var photoInput = document.getElementById("foodPhotoInput");
    var photoResult = document.getElementById("foodPhotoResult");

    function openFoodModal(meal) {
      activeMeal = meal || "Snacks";
      foodMealLabel.textContent = activeMeal;
      document.querySelectorAll(".food-meal-btn").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-meal") === activeMeal);
      });
      foodBackdrop.classList.add("open");
      foodModal.classList.add("open");
      foodModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      renderResults("");
      window.setTimeout(function () { if (searchInput) searchInput.focus(); }, 200);
    }
    function closeFoodModal() {
      foodBackdrop.classList.remove("open");
      foodModal.classList.remove("open");
      foodModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      if (scanResult) scanResult.hidden = true;
      if (photoResult) photoResult.hidden = true;
      if (scanFrame) scanFrame.classList.remove("scanning");
      if (photoDrop) { photoDrop.classList.remove("has-image"); photoDrop.style.backgroundImage = ""; }
    }

    document.querySelectorAll("[data-open-food-modal]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openFoodModal(btn.getAttribute("data-open-food-modal"));
      });
    });
    if (foodCloseBtn) foodCloseBtn.addEventListener("click", closeFoodModal);
    foodBackdrop.addEventListener("click", closeFoodModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && foodModal.classList.contains("open")) closeFoodModal();
    });

    document.querySelectorAll(".food-meal-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        activeMeal = b.getAttribute("data-meal");
        foodMealLabel.textContent = activeMeal;
        document.querySelectorAll(".food-meal-btn").forEach(function (x) { x.classList.toggle("active", x === b); });
      });
    });

    document.querySelectorAll(".food-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        document.querySelectorAll(".food-tab").forEach(function (t) { t.classList.toggle("active", t === tab); });
        var name = tab.getAttribute("data-tab");
        document.querySelectorAll(".food-panel").forEach(function (p) {
          p.hidden = p.getAttribute("data-panel") !== name;
        });
      });
    });

    function addToLog(name, kcal, detail) {
      var group = document.querySelector('.meal-group[data-meal-group="' + activeMeal + '"]');
      if (!group) return;
      var itemsEl = group.querySelector("[data-meal-items]");
      var emptyHint = itemsEl.querySelector(".meal-empty");
      if (emptyHint) emptyHint.remove();
      var row = document.createElement("div");
      row.className = "meal-item";
      row.innerHTML =
        '<div><p class="food-name">' + name + '</p><p class="food-detail">' + detail + '</p></div>' +
        '<span class="food-kcal">' + kcal + ' kcal</span>';
      itemsEl.appendChild(row);
      var totalEl = group.querySelector("[data-meal-total]");
      var current = parseInt(totalEl.textContent.replace(/[^0-9]/g, ""), 10) || 0;
      totalEl.textContent = (current + kcal) + " kcal";
      window.steadyToast("Added to " + activeMeal + ".");
      closeFoodModal();
    }

    function renderResults(query) {
      var q = (query || "").toLowerCase().trim();
      var matches = q ? FOOD_DB.filter(function (f) { return f.name.toLowerCase().indexOf(q) !== -1; }) : FOOD_DB.slice(0, 5);
      resultsEl.innerHTML = "";
      if (!matches.length) {
        var hint = document.createElement("p");
        hint.className = "food-empty-hint";
        hint.textContent = "No matches — try a different search.";
        resultsEl.appendChild(hint);
        return;
      }
      matches.forEach(function (f) {
        var row = document.createElement("div");
        row.className = "food-result-row";
        row.innerHTML =
          '<div class="food-result-info"><p class="food-result-name">' + f.name + '</p><p class="food-result-detail">' + f.detail + '</p></div>' +
          '<span class="food-result-kcal">' + f.kcal + ' kcal</span>' +
          '<button type="button" class="food-result-add" aria-label="Add ' + f.name + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
          '</button>';
        row.querySelector(".food-result-add").addEventListener("click", function () {
          addToLog(f.name, f.kcal, f.detail);
        });
        resultsEl.appendChild(row);
      });
    }
    if (searchInput) {
      searchInput.addEventListener("input", function () { renderResults(searchInput.value); });
    }

    if (scanBtn) {
      scanBtn.addEventListener("click", function () {
        scanResult.hidden = true;
        scanFrame.classList.add("scanning");
        scanBtn.disabled = true;
        window.setTimeout(function () {
          scanFrame.classList.remove("scanning");
          scanBtn.disabled = false;
          scanResult.hidden = false;
          scanResult.innerHTML =
            '<p class="food-found-title">Chobani Greek Yogurt, Vanilla</p>' +
            '<p class="food-found-detail">12g protein \u00b7 15g carbs \u00b7 2g fat \u00b7 per container</p>' +
            '<p class="food-found-kcal">140 kcal</p>' +
            '<button type="button" class="btn btn-grad" style="width:100%;justify-content:center" id="foodScanAddBtn">Add to log</button>';
          document.getElementById("foodScanAddBtn").addEventListener("click", function () {
            addToLog("Chobani Greek Yogurt, Vanilla", 140, "12g protein \u00b7 15g carbs \u00b7 2g fat");
          });
        }, 1200);
      });
    }

    if (photoDrop && photoInput) {
      photoDrop.addEventListener("click", function () { photoInput.click(); });
      photoInput.addEventListener("change", function () {
        var file = photoInput.files && photoInput.files[0];
        if (!file) return;
        var url = URL.createObjectURL(file);
        photoDrop.classList.add("has-image");
        photoDrop.style.backgroundImage = "url(" + url + ")";
        photoDrop.querySelector("span").textContent = "";
        photoResult.hidden = false;
        photoResult.innerHTML = '<div class="food-analyzing"><span class="dot-spin"></span>Analyzing your photo\u2026</div>';
        window.setTimeout(function () {
          photoResult.innerHTML =
            '<p class="food-found-title">AI estimate: Grilled salmon &amp; roasted vegetables</p>' +
            '<p class="food-found-detail">34g protein \u00b7 22g carbs \u00b7 19g fat (estimated)</p>' +
            '<p class="food-found-kcal">~410 kcal</p>' +
            '<p class="food-found-note">AI estimate \u2014 adjust after adding if needed.</p>' +
            '<button type="button" class="btn btn-grad" style="width:100%;justify-content:center" id="foodPhotoAddBtn">Add to log</button>';
          document.getElementById("foodPhotoAddBtn").addEventListener("click", function () {
            addToLog("Grilled salmon & roasted vegetables (AI estimate)", 410, "34g protein \u00b7 22g carbs \u00b7 19g fat");
          });
        }, 1500);
      });
    }
  }
})();
