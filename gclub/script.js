(function(){
  "use strict";

  /* ---------------------------------------------------------
     Preloader: waits for a minimum flourish + actual load
  --------------------------------------------------------- */
  var MIN_SHOW_MS = 1400;
  var startedAt = Date.now();

  function hidePreloader(){
    var el = document.getElementById('preloader');
    if(!el) return;
    var elapsed = Date.now() - startedAt;
    var wait = Math.max(0, MIN_SHOW_MS - elapsed);
    setTimeout(function(){
      el.classList.add('is-hidden');
      setTimeout(function(){ el.remove(); }, 720);
    }, wait);
  }

  if(document.readyState === 'complete'){
    hidePreloader();
  } else {
    window.addEventListener('load', hidePreloader);
  }

  /* ---------------------------------------------------------
     Page transition veil: intercept same-site nav links so
     leaving a page feels like one continuous motion, and
     pick that motion back up on arrival (see inline guard).
  --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function(){
    var veil = document.getElementById('page-veil');
    if(!veil) return;

    // Arrived mid-transition: the veil is already fully covering the
    // screen (set synchronously before paint). Hold briefly, then
    // fade it away to reveal this page \u2014 that fade *is* the reveal.
    if(veil.classList.contains('is-instant')){
      window.addEventListener('load', function(){
        setTimeout(function(){
          veil.classList.remove('is-instant'); // re-enable the opacity transition
          requestAnimationFrame(function(){
            requestAnimationFrame(function(){
              veil.classList.remove('is-active'); // now this fade is animated
            });
          });
        }, 250);
      });
    }

    document.querySelectorAll('a[data-transition]').forEach(function(link){
      link.addEventListener('click', function(e){
        var href = link.getAttribute('href');
        if(!href || href.startsWith('#')) return;
        e.preventDefault();
        sessionStorage.setItem('gclubTransition', '1');
        veil.classList.add('is-active');
        setTimeout(function(){ window.location.href = href; }, 460);
      });
    });
  });

  /* ---------------------------------------------------------
     Marketplace filter + pagination: the grid shows one page
     of whichever category is active, with results count and
     page controls always kept in sync with what's filtered.
  --------------------------------------------------------- */
  var PAGE_SIZE = 12;
  var currentPage = 1;

  function filteredCards(){
    var grid = document.querySelector('.profile-grid');
    if(!grid) return [];
    var activePill = document.querySelector('.filter-pill.is-active');
    var key = activePill ? activePill.getAttribute('data-filter') : 'all';
    var locationSelect = document.getElementById('location-filter');
    var location = locationSelect ? locationSelect.value : 'all';
    var all = Array.prototype.slice.call(grid.querySelectorAll('.profile-card'));
    if(key !== 'all'){
      all = all.filter(function(c){ return c.getAttribute('data-category') === key; });
    }
    if(location !== 'all'){
      all = all.filter(function(c){
        var locations = (c.getAttribute('data-location') || '').split(' ');
        return locations.indexOf(location) !== -1;
      });
    }
    return all;
  }

  function renderGrid(){
    var grid = document.querySelector('.profile-grid');
    if(!grid) return;

    var matches = filteredCards();
    var totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);

    grid.querySelectorAll('.profile-card').forEach(function(c){ c.style.display = 'none'; });
    var start = (currentPage - 1) * PAGE_SIZE;
    matches.slice(start, start + PAGE_SIZE).forEach(function(c){ c.style.display = ''; });

    var count = document.getElementById('results-count');
    if(count){
      count.textContent = matches.length + (matches.length === 1 ? ' person to meet' : ' people to meet');
    }

    var numbersEl = document.querySelector('.page-numbers');
    if(numbersEl){
      numbersEl.innerHTML = '';
      for(var i = 1; i <= totalPages; i++){
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'page-number' + (i === currentPage ? ' is-active' : '');
        btn.textContent = i;
        btn.setAttribute('data-page', i);
        numbersEl.appendChild(btn);
      }
    }
    var prevBtn = document.querySelector('.page-prev');
    var nextBtn = document.querySelector('.page-next');
    if(prevBtn) prevBtn.disabled = currentPage <= 1;
    if(nextBtn) nextBtn.disabled = currentPage >= totalPages;

    var pagination = document.querySelector('.pagination');
    if(pagination) pagination.style.display = totalPages <= 1 ? 'none' : 'flex';
  }

  document.addEventListener('DOMContentLoaded', function(){
    if(document.querySelector('.profile-grid')) renderGrid();

    // "Book her again" links arrive as index.html?profile=Name \u2014 open that profile.
    var wantedProfile = new URLSearchParams(window.location.search).get('profile');
    if(wantedProfile){
      var wantedTriggers = document.querySelectorAll('[data-open-profile]');
      for(var wi = 0; wi < wantedTriggers.length; wi++){
        if((wantedTriggers[wi].getAttribute('data-name') || '').toLowerCase() === wantedProfile.toLowerCase()){
          openProfileModal(wantedTriggers[wi]);
          break;
        }
      }
    }

    // ---- Gentleman application: remember how far they got, offer to resume ----
    var GENT_STEP_PAGES = { 'gent-details.html': 2, 'gent-preferences.html': 3, 'gent-verify.html': 4 };
    var thisPage = window.location.pathname.split('/').pop();
    if(GENT_STEP_PAGES[thisPage]) rememberGentStep(GENT_STEP_PAGES[thisPage]);

    var resumeBanner = document.getElementById('resume-banner');
    if(resumeBanner && !isRegistered()){
      var resumeStep = parseInt(sessionStorage.getItem('gclubGentProgress'), 10) || 1;
      var RESUME = {
        2: ['your details', 'gent-details.html'],
        3: ['your preferences', 'gent-preferences.html'],
        4: ['verification', 'gent-verify.html'],
        5: ['plan & payment', 'gent-plan.html?from=application']
      };
      if(RESUME[resumeStep]){
        document.getElementById('resume-step-name').textContent = RESUME[resumeStep][0];
        document.getElementById('resume-link').setAttribute('href', RESUME[resumeStep][1]);
        resumeBanner.style.display = 'flex';
      }
    }

    // One-time-code autofill hint on every verification code row
    document.querySelectorAll('.otp-row').forEach(function(row){
      var firstBox = row.querySelector('.otp-box');
      if(firstBox) firstBox.setAttribute('autocomplete', 'one-time-code');
    });

    // ---- Gentleman wallet: show the credit balance, and open Top up when asked ----
    var walletBalance = document.getElementById('credit-balance-amount');
    if(walletBalance){
      var shownCredit = currentCredit();
      if(walletBalance.firstChild) walletBalance.firstChild.textContent = shownCredit.toLocaleString('en-US') + ' ';
      var walletNote = document.querySelector('.wallet-balance .note');
      if(walletNote) walletNote.innerHTML = '\u2248 \u20b1' + shownCredit.toLocaleString('en-US') + ' value \u00b7 1 credit = \u20b11';
      if(new URLSearchParams(window.location.search).get('topup') === '1'){
        var topupOpenBtn = document.getElementById('open-topup-btn');
        if(topupOpenBtn) setTimeout(function(){ topupOpenBtn.click(); }, 400);
      }
    }
    var membershipCreditNote = document.getElementById('membership-credit-note');
    if(membershipCreditNote){
      var memPlan = sessionStorage.getItem('gclubPlanName');
      if(sessionStorage.getItem('gclubMembershipActive') === 'true' && PLAN_CREDIT[memPlan]){
        membershipCreditNote.textContent = 'Renews ' + PLAN_RENEWS[memPlan] + ' with +' + PLAN_CREDIT[memPlan].toLocaleString('en-US') + ' credit';
        membershipCreditNote.style.display = 'block';
      }
    }

    // ---- Gentleman "Plan & payment" step (also the plan-change page) ----
    var planForm = document.getElementById('plan-form-card');
    if(planForm){
      var fromParam = new URLSearchParams(window.location.search).get('from');
      if(['application', 'profile', 'market'].indexOf(fromParam) !== -1){
        sessionStorage.setItem('gclubPlanReturn', fromParam);
      }
      var planReturn = sessionStorage.getItem('gclubPlanReturn');
      if(['application', 'profile', 'market'].indexOf(planReturn) === -1){
        // someone who is already registered is changing plans, not applying again
        planReturn = isRegistered() ? 'profile' : 'application';
      }
      var upgradeMode = (planReturn === 'profile' || planReturn === 'market');
      planForm.setAttribute('data-mode', upgradeMode ? 'upgrade' : 'application');
      var RETURNS = {
        application: ['gent-verify.html', 'Back'],
        profile: ['gent-profile.html', 'Back to profile'],
        market: ['index.html', 'Back to marketplace']
      };
      var planBackLink = document.getElementById('gent-plan-back');
      if(planBackLink){
        planBackLink.setAttribute('href', RETURNS[planReturn][0]);
        if(planBackLink.lastChild) planBackLink.lastChild.textContent = ' ' + RETURNS[planReturn][1];
      }
      var payDoneLink = document.getElementById('pay-done-link');
      if(payDoneLink){
        payDoneLink.setAttribute('href', RETURNS[planReturn][0]);
        if(payDoneLink.firstChild) payDoneLink.firstChild.textContent = RETURNS[planReturn][1] + ' ';
      }
      var startName = sessionStorage.getItem('gclubPlanName');
      if(upgradeMode){
        // a plan change from the profile or marketplace is not part of the application
        var wizardProgress = document.querySelector('.app-progress');
        if(wizardProgress) wizardProgress.style.display = 'none';
        var headingEyebrow = document.querySelector('.form-heading .eyebrow');
        if(headingEyebrow) headingEyebrow.textContent = 'Membership';
        var explainLabel = document.querySelector('.step-explain .label');
        if(explainLabel) explainLabel.textContent = 'Membership';
        ['plan-card-limited', 'app-only-sections'].forEach(function(hideId){
          var hideEl = document.getElementById(hideId);
          if(hideEl) hideEl.style.display = 'none';
        });
        if(startName === 'Free') startName = null;
      } else {
        rememberGentStep(5);
      }
      if(!startName){
        sessionStorage.setItem('gclubPlanName', 'Monthly');
        sessionStorage.setItem('gclubPlanPrice', '800');
        sessionStorage.setItem('gclubPlanPeriod', '/ month');
      }
      applyPlanToPayment();
      if(upgradeMode){
        var upgradeBtn = document.getElementById('pay-continue-btn');
        if(upgradeBtn){ upgradeBtn.disabled = false; upgradeBtn.classList.remove('is-disabled'); }
      } else {
        updateGentPrimaryState();
      }
    }
  });

  /* ---------------------------------------------------------
     Profile modal: opens in place over the marketplace,
     populated from the clicked card's data attributes.
  --------------------------------------------------------- */
  var lastTrigger = null;
  var pendingTopupReturn = false;

  function openProfileModal(trigger){
    var backdrop = document.getElementById('profile-modal-backdrop');
    if(!backdrop) return;

    var name = trigger.getAttribute('data-name') || '';
    var age = trigger.getAttribute('data-age') || '';
    var rate = trigger.getAttribute('data-rate') || '';
    var rating = trigger.getAttribute('data-rating') || '';
    var initial = name ? name[0].toUpperCase() : '?';

    var fullName = age ? (name + ', ' + age) : name;
    var setText = function(id, val){ var el = document.getElementById(id); if(el) el.textContent = val; };
    setText('modal-name', fullName);
    setText('modal-name2', name);
    if(rating){ setText('modal-rating', rating); setText('modal-rating2', rating); }
    if(rate){ setText('modal-rate', Number(rate).toLocaleString('en-US')); }
    setText('modal-cover-initial', initial);
    setText('modal-avatar-initial', initial);
    lastTrigger = trigger;
    backdrop.classList.add('is-active');
    document.body.classList.add('modal-open');
    var panel = backdrop.querySelector('.modal-panel');
    if(panel) panel.scrollTop = 0;
    var closeBtn = backdrop.querySelector('.modal-close');
    if(closeBtn) closeBtn.focus();

    // Reset the hour selection to the 3-hour minimum for each new profile
    var hoursCount = document.getElementById('hours-count');
    if(hoursCount) hoursCount.textContent = '3';
    updateBookingSummary();
    resetGallery();
    applyMembershipGate();
  }

  /* ---------------------------------------------------------
     A Gentleman can have an account without being a member
     (no plan chosen/paid). Reviews and booking are member
     benefits, gated behind the same flag the plan/payment
     flow sets once a fee is actually paid.
  --------------------------------------------------------- */
  function applyMembershipGate(){
    var registered = isRegistered();
    var isMember = registered && sessionStorage.getItem('gclubMembershipActive') === 'true';

    var reviewsSection = document.getElementById('reviews-section');
    var reviewsLocked = document.getElementById('reviews-locked-view');
    if(reviewsSection) reviewsSection.style.display = isMember ? 'block' : 'none';
    if(reviewsLocked) reviewsLocked.style.display = isMember ? 'none' : 'flex';

    // Non-members can still browse the booking form freely (pick a
    // day, time, and hours) \u2014 the gate only kicks in when they
    // actually try to submit the request. See requestBtn handler below.

    var galleryThumbs = document.getElementById('gallery-thumbs');
    var galleryCounter = document.querySelector('.gallery-counter');
    var galleryLockedNote = document.getElementById('gallery-locked-note');
    if(galleryThumbs){
      // Non-members still see the rest of the gallery, just blurred and not clickable.
      galleryThumbs.style.display = 'grid';
      galleryThumbs.classList.toggle('is-locked', !isMember);
      galleryThumbs.querySelectorAll('.gallery-thumb').forEach(function(t){
        if(isMember){ t.removeAttribute('tabindex'); t.removeAttribute('aria-disabled'); }
        else { t.setAttribute('tabindex', '-1'); t.setAttribute('aria-disabled', 'true'); }
      });
    }
    if(galleryCounter) galleryCounter.style.display = isMember ? '' : 'none';
    if(galleryLockedNote) galleryLockedNote.style.display = isMember ? 'none' : 'block';

    // Visitors are sent to sign up first; signed-in gents go to the plan page.
    var ctaHref = registered ? 'gent-plan.html?from=market' : 'gent-welcome.html';
    var ctaText = registered ? 'Become a member \u2192' : 'Join G Club \u2192';
    ['#reviews-locked-view a.btn', '#booking-locked-view a.btn', '#gallery-locked-note a'].forEach(function(sel){
      var link = document.querySelector(sel);
      if(link){ link.setAttribute('href', ctaHref); link.textContent = ctaText; }
    });

    // Free plan: one booking, then booking stays locked until they upgrade.
    var freeNow = (!isMember && registered) ? freeStatus() : null;
    var isFree = !!freeNow;
    var freeUsed = parseInt(sessionStorage.getItem('gclubFreeBookingsUsed'), 10) || 0;
    var freeExpired = isFree && freeNow.expired;
    var limitReached = isFree && (freeUsed >= 1 || freeExpired);
    var bookingForm = document.getElementById('booking-form-view');
    var bookingPay = document.getElementById('booking-payment-view');
    var bookingLocked = document.getElementById('booking-locked-view');
    var freeNote = document.getElementById('free-booking-note');
    if(freeNote){
      freeNote.style.display = (isFree && !limitReached) ? 'block' : 'none';
      if(isFree && !limitReached) freeNote.textContent = 'Free plan \u00b7 1 booking included \u00b7 ' + freeNow.daysLeft + (freeNow.daysLeft === 1 ? ' day' : ' days') + ' left';
    }
    if(bookingLocked){
      if(limitReached){
        var lockHead = bookingLocked.querySelector('h3');
        var lockText = bookingLocked.querySelector('p');
        if(lockHead) lockHead.textContent = freeExpired ? 'Your free 14 days have ended' : 'You\u2019ve used your free booking';
        if(lockText) lockText.textContent = freeExpired
          ? 'Choose Starter or Monthly to keep booking companions.'
          : 'The Free plan includes one booking. Become a member to keep booking companions.';
        if(bookingForm) bookingForm.style.display = 'none';
        if(bookingPay) bookingPay.style.display = 'none';
        bookingLocked.style.display = 'flex';
        bookingLocked.setAttribute('data-limit', '1');
      } else if(bookingLocked.getAttribute('data-limit') === '1'){
        bookingLocked.style.display = 'none';
        bookingLocked.removeAttribute('data-limit');
        if(bookingForm) bookingForm.style.display = '';
      }
    }
  }
  window.gclubApplyMembershipGate = applyMembershipGate;

  /* ---------------------------------------------------------
     Profile modal gallery: one large main photo plus a
     thumbnail strip. Clicking a thumbnail swaps it into the
     main view (and puts the previous main photo back in that
     thumbnail's spot), the way a real photo gallery would.
  --------------------------------------------------------- */
  function initGalleryOriginals(){
    var main = document.getElementById('modal-cover');
    if(main && !main.hasAttribute('data-original-src')){
      var mainImg = main.querySelector('img');
      if(mainImg) main.setAttribute('data-original-src', mainImg.getAttribute('src'));
    }
    document.querySelectorAll('#gallery-thumbs .gallery-thumb').forEach(function(thumb){
      if(!thumb.hasAttribute('data-original-src')){
        var tileImg = thumb.querySelector('.photo-tile img');
        if(tileImg) thumb.setAttribute('data-original-src', tileImg.getAttribute('src'));
      }
    });
  }
  initGalleryOriginals();

  /* Marketplace nav: reflect a logged-in session (set at login) by
     swapping Become a G / Log in for a profile chip, same idea as
     the chip already shown on the account pages themselves. */
  /* The Free plan lasts 14 days from the day they sign up, with 20 messages and
     one booking in that time. After that they need Starter or Monthly. */
  var FREE_DAYS = 14;
  function freeStatus(){
    if(sessionStorage.getItem('gclubMembershipActive') === 'true' || sessionStorage.getItem('gclubFreePlan') !== 'true') return null;
    // Demo helper: add ?freeDay=15 to any page to see the plan 15 days in.
    var demoDay = new URLSearchParams(window.location.search).get('freeDay');
    if(demoDay !== null && /^\d+$/.test(demoDay)){
      sessionStorage.setItem('gclubFreeStart', String(Date.now() - parseInt(demoDay, 10) * 86400000));
    }
    var start = parseInt(sessionStorage.getItem('gclubFreeStart'), 10);
    if(!start){ start = Date.now(); sessionStorage.setItem('gclubFreeStart', String(start)); }
    var endsOn = start + FREE_DAYS * 86400000;
    var msLeft = endsOn - Date.now();
    return { expired: msLeft <= 0, daysLeft: Math.max(0, Math.ceil(msLeft / 86400000)), endsOn: endsOn };
  }
  window.gclubFreeStatus = freeStatus;
  function formatDay(ms){
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var d = new Date(ms);
    return months[d.getMonth()] + ' ' + d.getDate();
  }

  /* Money is always pesos. Plans add credit (1 credit = 1 peso): when a
     plan is bought and again at every renewal. Top-ups add more. */
  function peso(n){ return '\u20b1' + Number(n).toLocaleString('en-US'); }
  var PLAN_CREDIT = { Starter: 300, Monthly: 800 };
  var PLAN_RENEWS = { Starter: 'every 2 weeks', Monthly: 'every month' };
  function currentCredit(){
    var saved = parseInt(sessionStorage.getItem('gclubCredit'), 10);
    if(!isNaN(saved)) return saved;
    // demo wallets: Daniel (and anyone not yet signed in) shows the page's own balance
    var who = sessionStorage.getItem('gclubLoggedInName');
    return (who && who !== 'Daniel') ? 0 : 2450;
  }
  function addCredit(n, freshAccount){
    var base = (freshAccount && sessionStorage.getItem('gclubCredit') === null) ? 0 : currentCredit();
    sessionStorage.setItem('gclubCredit', String(base + n));
  }
  function creditNoteHtml(planName){
    var c = PLAN_CREDIT[planName] || 0;
    if(!c) return '';
    return '<strong>' + c.toLocaleString('en-US') + ' credit</strong> added to your balance. It renews ' + PLAN_RENEWS[planName] + ' with ' + c.toLocaleString('en-US') + ' more. ' +
      'Need more? <a href="gent-profile.html?topup=1" data-transition>Top up</a> with \u20b1500, \u20b11,000 or any amount.';
  }

  function isRegistered(){ return sessionStorage.getItem('gclubRegistered') === 'true'; }

  /* Banner under the marketplace nav for signed-in gents who aren't paid
     members yet: says what is locked and puts the plan page one click away. */
  function applyMemberBanner(){
    var banner = document.getElementById('member-banner');
    if(!banner) return;
    var isGent = sessionStorage.getItem('gclubLoggedInProfile') === 'gent-profile.html';
    var paid = sessionStorage.getItem('gclubMembershipActive') === 'true';
    if(!(isRegistered() && isGent && !paid)){ banner.style.display = 'none'; return; }
    var freeNow = freeStatus();
    var used = parseInt(sessionStorage.getItem('gclubFreeBookingsUsed'), 10) || 0;
    var text, cta;
    if(freeNow && freeNow.expired){
      text = 'Your free 14 days have ended. Choose Starter or Monthly to keep messaging and booking.';
      cta = 'Choose a plan \u2192';
    } else if(freeNow && used >= 1){
      text = 'You\u2019ve used your free booking. Become a member to keep booking companions.';
      cta = 'Become a member \u2192';
    } else if(freeNow){
      text = 'You\u2019re on the Free plan \u2014 ' + freeNow.daysLeft + (freeNow.daysLeft === 1 ? ' day' : ' days') + ' left, with 1 booking and 20 messages. Upgrade for photos, reviews, and unlimited booking.';
      cta = 'Upgrade \u2192';
    } else {
      text = 'You\u2019re signed in without a membership. Extra photos, reviews, and booking are for members.';
      cta = 'Choose a plan \u2192';
    }
    var t = document.getElementById('member-banner-text');
    var c = document.getElementById('member-banner-cta');
    if(t) t.textContent = text;
    if(c) c.textContent = cta;
    banner.style.display = 'block';
  }

  /* Log out clears who you are and what you've bought, but keeps the
     two-sided session confirmations so a booking can still be completed
     from the other person's account. */
  function clearSessionForLogout(){
    ['gclubLoggedInName','gclubLoggedInInitial','gclubLoggedInProfile','gclubRegistered',
     'gclubMembershipActive','gclubFreePlan','gclubFreeBookingsUsed','gclubFreeMsgCount','gclubFreeStart',
     'gclubPlanName','gclubPlanPrice','gclubPlanPeriod','gclubPlanReturn','gclubGentProgress','gclubCredit'
    ].forEach(function(k){ sessionStorage.removeItem(k); });
  }

  /* Marketplace nav: reflect a logged-in session (set at login or at
     signup) by swapping Become a G / Log in for a profile chip. */
  function applyLoggedInNav(){
    var chip = document.getElementById('nav-logged-in-chip');
    if(!chip) return;
    var name = sessionStorage.getItem('gclubLoggedInName');
    var becomeBtn = document.getElementById('nav-become-g-btn');
    var loginBtn = document.getElementById('nav-login-btn');
    var logoutBtn = document.getElementById('nav-logout-btn');
    if(name){
      var initial = sessionStorage.getItem('gclubLoggedInInitial') || name[0];
      var profileHref = sessionStorage.getItem('gclubLoggedInProfile') || 'index.html';
      var nameEl = document.getElementById('nav-logged-in-name');
      var initialEl = document.getElementById('nav-logged-in-initial');
      if(nameEl) nameEl.textContent = name;
      if(initialEl) initialEl.textContent = initial;
      chip.setAttribute('href', profileHref);
      chip.style.display = 'flex';
      if(becomeBtn) becomeBtn.style.display = 'none';
      if(loginBtn) loginBtn.style.display = 'none';
      if(logoutBtn) logoutBtn.style.display = '';
    } else {
      chip.style.display = 'none';
      if(becomeBtn) becomeBtn.style.display = '';
      if(loginBtn) loginBtn.style.display = '';
      if(logoutBtn) logoutBtn.style.display = 'none';
    }
    applyMemberBanner();
  }
  applyLoggedInNav();

  function resetGallery(){
    var main = document.getElementById('modal-cover');
    var counter = document.getElementById('gallery-counter-current');
    if(counter) counter.textContent = '1';
    if(main){
      main.setAttribute('data-variant', '0');
      var mainImg = main.querySelector('img');
      var mainOriginal = main.getAttribute('data-original-src');
      if(mainImg && mainOriginal) mainImg.setAttribute('src', mainOriginal);
    }
    var thumbs = document.querySelectorAll('#gallery-thumbs .gallery-thumb');
    thumbs.forEach(function(thumb){
      thumb.classList.remove('is-active');
    });
    // The first thumbnail mirrors the main photo shown by default,
    // so it starts out marked as the active one.
    if(thumbs[0]) thumbs[0].classList.add('is-active');
  }

  function selectGalleryPhoto(thumb){
    var strip = thumb.closest('#gallery-thumbs');
    if(strip && strip.classList.contains('is-locked')) return;
    var main = document.getElementById('modal-cover');
    var tile = thumb.querySelector('.photo-tile');
    var counter = document.getElementById('gallery-counter-current');
    if(!main || !tile) return;

    // Thumbnails always represent the same fixed photo \u2014 clicking one
    // just brings that photo into the main viewer and marks it active.
    // The thumbnail itself never changes.
    main.setAttribute('data-variant', tile.getAttribute('data-variant'));

    var mainImg = main.querySelector('img');
    var tileImg = tile.querySelector('img');
    if(mainImg && tileImg){
      mainImg.setAttribute('src', tileImg.getAttribute('src'));
    }

    document.querySelectorAll('#gallery-thumbs .gallery-thumb').forEach(function(t){
      t.classList.remove('is-active');
    });
    thumb.classList.add('is-active');

    if(counter){
      var slot = thumb.getAttribute('data-variant');
      counter.textContent = slot ? (parseInt(slot, 10) + 1) : '1';
    }
  }

  function updateBookingSummary(){
    var hoursEl = document.getElementById('hours-count');
    var rateEl = document.getElementById('modal-rate');
    if(!hoursEl || !rateEl) return;
    var hours = parseInt(hoursEl.textContent, 10) || 3;
    var rate = parseInt(rateEl.textContent.replace(/[^0-9]/g, ''), 10) || 0;
    var subtotal = hours * rate;
    var fee = Math.round(subtotal * 0.1);
    var total = subtotal + fee;

    var minusBtn = document.getElementById('hours-minus');
    if(minusBtn) minusBtn.disabled = hours <= 3;

    var setText = function(id, val){ var el = document.getElementById(id); if(el) el.textContent = val; };
    setText('summary-hours-label', hours + ' hours \u00d7 ' + peso(rate));
    setText('summary-subtotal', peso(subtotal));
    setText('summary-fee', peso(fee));
    setText('summary-total', peso(total));
  }

  function closeProfileModal(){
    var backdrop = document.getElementById('profile-modal-backdrop');
    if(!backdrop || !backdrop.classList.contains('is-active')) return;
    backdrop.classList.remove('is-active');
    document.body.classList.remove('modal-open');
    if(lastTrigger){ lastTrigger.focus(); lastTrigger = null; }
  }

  document.addEventListener('input', function(e){
    if(e.target.id === 'custom-amount-input'){
      updateTopupSummary();
    }
    if(e.target.classList.contains('otp-box')){
      e.target.classList.remove('is-error');
      var val = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = val.slice(0, 1);
      if(val && e.target.nextElementSibling && e.target.nextElementSibling.classList.contains('otp-box')){
        e.target.nextElementSibling.focus();
      }
    }
    if(e.target.id === 'terms-agree-checkbox'){
      var girlSubmit = document.getElementById('submit-application');
      if(girlSubmit){
        girlSubmit.disabled = !e.target.checked;
        girlSubmit.classList.toggle('is-disabled', !e.target.checked);
      }
      updateGentPrimaryState();
    }
  });

  document.addEventListener('paste', function(e){
    var pasteBox = e.target.closest ? e.target.closest('.otp-box') : null;
    if(!pasteBox) return;
    e.preventDefault();
    var pasted = ((e.clipboardData || window.clipboardData).getData('text') || '').replace(/\D/g, '').slice(0, 6);
    var otpBoxes = pasteBox.parentElement.querySelectorAll('.otp-box');
    for(var oi = 0; oi < otpBoxes.length; oi++){
      otpBoxes[oi].value = pasted.charAt(oi) || '';
      otpBoxes[oi].classList.remove('is-error');
    }
    otpBoxes[Math.min(pasted.length, otpBoxes.length - 1)].focus();
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Backspace' && e.target.classList && e.target.classList.contains('otp-box') && !e.target.value){
      var prev = e.target.previousElementSibling;
      if(prev && prev.classList.contains('otp-box')) prev.focus();
    }
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      closeProfileModal();
      var videoBackdrop = document.getElementById('video-review-backdrop');
      if(videoBackdrop && videoBackdrop.classList.contains('is-active')){
        videoBackdrop.classList.remove('is-active');
        document.body.classList.remove('modal-open');
      }
      var transferBackdrop = document.getElementById('transfer-modal-backdrop');
      if(transferBackdrop && transferBackdrop.classList.contains('is-active')){
        transferBackdrop.classList.remove('is-active');
        document.body.classList.remove('modal-open');
      }
      var termsBackdropEsc = document.getElementById('terms-modal-backdrop');
      if(termsBackdropEsc && termsBackdropEsc.classList.contains('is-active')){
        termsBackdropEsc.classList.remove('is-active');
        document.body.classList.remove('modal-open');
      }
      var bankBackdrop = document.getElementById('bank-modal-backdrop');
      if(bankBackdrop && bankBackdrop.classList.contains('is-active')){
        bankBackdrop.classList.remove('is-active');
        document.body.classList.remove('modal-open');
      }
      var gentBankBackdrop = document.getElementById('gent-bank-modal-backdrop');
      if(gentBankBackdrop && gentBankBackdrop.classList.contains('is-active')){
        gentBankBackdrop.classList.remove('is-active');
        document.body.classList.remove('modal-open');
      }
      var topupBackdropEsc = document.getElementById('topup-modal-backdrop');
      if(topupBackdropEsc && topupBackdropEsc.classList.contains('is-active')){
        topupBackdropEsc.classList.remove('is-active');
        document.body.classList.remove('modal-open');
      }
      document.querySelectorAll('.filter-sidebar.is-open').forEach(function(s){
        s.classList.remove('is-open');
        var btn = s.querySelector('.filter-toggle');
        if(btn) btn.setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* ---------------------------------------------------------
     Small interactive flourishes shared across pages
  --------------------------------------------------------- */
  document.addEventListener('click', function(e){
    if(e.target.closest('#login-send-code-btn')){
      var phoneInput = document.getElementById('login-phone-input');
      var phoneStep = document.getElementById('login-phone-step');
      var otpStep = document.getElementById('login-otp-step');
      var phoneDisplay = document.getElementById('login-phone-display');
      if(phoneInput && phoneInput.value.trim()){
        if(phoneDisplay) phoneDisplay.textContent = phoneInput.value.trim();
        if(phoneStep) phoneStep.style.display = 'none';
        if(otpStep){
          otpStep.style.display = 'flex';
          var firstBox = otpStep.querySelector('.otp-box');
          if(firstBox) firstBox.focus();
        }

        // Two known accounts for this prototype: route each to
        // their own profile once verified. Anything else falls
        // back to the marketplace, same as before.
        var verifyBtn = document.getElementById('verify-signup-otp-btn');
        if(verifyBtn){
          var entered = phoneInput.value.trim().toLowerCase();
          if(entered === 'robertazucena@gmail.com'){
            verifyBtn.setAttribute('data-next-href', 'gent-profile.html');
            sessionStorage.setItem('gclubLoggedInName', 'Daniel');
            sessionStorage.setItem('gclubLoggedInInitial', 'D');
            sessionStorage.setItem('gclubLoggedInProfile', 'gent-profile.html');
            sessionStorage.setItem('gclubRegistered', 'true');
            // This is the seeded demo account for previewing the full
            // gent experience, so it logs in as an active member \u2014
            // no need to walk through the plan/payment flow each time.
            sessionStorage.setItem('gclubMembershipActive', 'true');
            sessionStorage.setItem('gclubPlanName', 'Monthly');
            sessionStorage.setItem('gclubPlanPrice', '800');
            sessionStorage.setItem('gclubPlanPeriod', '/ month');
            sessionStorage.removeItem('gclubFreePlan');
          } else if(entered === 'tobyazucena@gmail.com'){
            verifyBtn.setAttribute('data-next-href', 'girl-profile.html');
            sessionStorage.setItem('gclubLoggedInName', 'Maya');
            sessionStorage.setItem('gclubLoggedInInitial', 'M');
            sessionStorage.setItem('gclubLoggedInProfile', 'girl-profile.html');
            sessionStorage.setItem('gclubRegistered', 'true');
          } else {
            verifyBtn.setAttribute('data-next-href', 'index.html');
          }
        }
      } else if(phoneInput){
        phoneInput.focus();
      }
    }
    if(e.target.closest('#login-change-number-link')){
      e.preventDefault();
      var phoneStep2 = document.getElementById('login-phone-step');
      var otpStep2 = document.getElementById('login-otp-step');
      if(otpStep2) otpStep2.style.display = 'none';
      if(phoneStep2) phoneStep2.style.display = 'flex';
    }

    if(e.target.closest('#resend-otp-link')){
      e.preventDefault();
      var note = document.getElementById('otp-resend-note');
      if(note){
        note.innerHTML = '<span class="is-sent">A new code has been sent.</span>';
        setTimeout(function(){
          note.innerHTML = 'Didn\u2019t get a code? <a href="#" id="resend-otp-link">Resend code</a>';
        }, 2500);
      }
    }

    if(e.target.closest('#verify-signup-otp-btn')){
      var verifyBtn = document.getElementById('verify-signup-otp-btn');
      var errorMsg = document.getElementById('otp-error');
      if(errorMsg) errorMsg.style.display = 'none';

      var veil = document.getElementById('page-veil');
      var nextHref = verifyBtn.getAttribute('data-next-href');
      if(veil && nextHref){
        sessionStorage.setItem('gclubTransition', '1');
        veil.classList.add('is-active');
        setTimeout(function(){ window.location.href = nextHref; }, 460);
      }
    }

    if(e.target.closest('#hours-plus')){
      var hoursEl = document.getElementById('hours-count');
      if(hoursEl){
        var current = parseInt(hoursEl.textContent, 10) || 3;
        if(current < 12){ hoursEl.textContent = current + 1; updateBookingSummary(); }
      }
    }
    if(e.target.closest('#hours-minus')){
      var hoursEl2 = document.getElementById('hours-count');
      if(hoursEl2){
        var current2 = parseInt(hoursEl2.textContent, 10) || 3;
        if(current2 > 3){ hoursEl2.textContent = current2 - 1; updateBookingSummary(); }
      }
    }

    if(e.target.closest('[data-logout]')){
      e.preventDefault();
      clearSessionForLogout();
      var logoutVeil = document.getElementById('page-veil');
      if(logoutVeil){
        sessionStorage.setItem('gclubTransition', '1');
        logoutVeil.classList.add('is-active');
        setTimeout(function(){ window.location.href = 'index.html'; }, 460);
      } else {
        window.location.href = 'index.html';
      }
    }

    var opener = e.target.closest('[data-open-profile]');
    if(opener){
      e.preventDefault();
      openProfileModal(opener);
    }

    var galleryThumb = e.target.closest('[data-gallery-thumb]');
    if(galleryThumb){
      selectGalleryPhoto(galleryThumb);
    }

    if(e.target.closest('[data-modal-close]')){
      closeProfileModal();
    }
    if(e.target.id === 'profile-modal-backdrop'){
      closeProfileModal();
    }

    var save = e.target.closest('.save-btn');
    if(save){
      e.preventDefault();
      save.classList.toggle('is-saved');
    }

    var filter = e.target.closest('.filter-pill');
    if(filter){
      filter.parentElement.querySelectorAll('.filter-pill').forEach(function(f){ f.classList.remove('is-active'); });
      filter.classList.add('is-active');
      currentPage = 1;
      renderGrid();

      // Mobile dropdown: reflect the choice on the toggle button, then close.
      var sidebar = filter.closest('.filter-sidebar');
      if(sidebar){
        var valueEl = document.getElementById('filter-toggle-value');
        if(valueEl) valueEl.textContent = filter.textContent.trim();
        sidebar.classList.remove('is-open');
        var toggleBtn = sidebar.querySelector('.filter-toggle');
        if(toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
      }    }

    var filterToggle = e.target.closest('.filter-toggle');
    if(filterToggle){
      var toggleSidebar = filterToggle.closest('.filter-sidebar');
      if(toggleSidebar){
        var willOpen = !toggleSidebar.classList.contains('is-open');
        toggleSidebar.classList.toggle('is-open', willOpen);
        filterToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      }
    } else if(!e.target.closest('.filter-sidebar')){
      // Clicked outside the filter dropdown: close it if open.
      document.querySelectorAll('.filter-sidebar.is-open').forEach(function(s){
        s.classList.remove('is-open');
        var btn = s.querySelector('.filter-toggle');
        if(btn) btn.setAttribute('aria-expanded', 'false');
      });
    }

    var pageNum = e.target.closest('.page-number');
    if(pageNum){
      currentPage = parseInt(pageNum.getAttribute('data-page'), 10) || 1;
      renderGrid();
      var resultsCol = document.querySelector('.results-column');
      if(resultsCol) resultsCol.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    var prevPage = e.target.closest('.page-prev');
    if(prevPage && !prevPage.disabled){
      currentPage--;
      renderGrid();
    }

    var nextPage = e.target.closest('.page-next');
    if(nextPage && !nextPage.disabled){
      currentPage++;
      renderGrid();
    }

    var day = e.target.closest('.day-pill');
    if(day){
      day.parentElement.querySelectorAll('.day-pill').forEach(function(d){ d.classList.remove('is-active'); });
      day.classList.add('is-active');
    }

    var time = e.target.closest('.time-pill');
    if(time){
      time.parentElement.querySelectorAll('.time-pill').forEach(function(t){ t.classList.remove('is-active'); });
      time.classList.add('is-active');
    }

    var pill = e.target.closest('.choice-pill');
    if(pill){
      pill.classList.toggle('is-selected');
    }

    var submitBtn = e.target.closest('#submit-application');
    if(submitBtn){
      submitApplication();
    }

    var recordBtn = e.target.closest('#record-toggle');
    if(recordBtn){
      toggleRecording();
    }

    var planCardClicked = e.target.closest('.plan-card');
    if(planCardClicked && document.getElementById('plan-form-card')){
      setPlan(planCardClicked.getAttribute('data-plan-name'), planCardClicked.getAttribute('data-plan-price'), planCardClicked.getAttribute('data-plan-period'));
    }

    var payMethodBtn = e.target.closest('.payment-badge');
    if(payMethodBtn){
      selectPaymentMethod(payMethodBtn);
    }

    var payContinueBtn = e.target.closest('#pay-continue-btn');
    if(payContinueBtn){
      startPaymentFlow();
    }

    var openVideoBtn = e.target.closest('[data-open-video]');
    if(openVideoBtn){
      openVideoReview(openVideoBtn);
    }
    if(e.target.closest('[data-modal-close-video]')){
      closeVideoReview();
    }
    if(e.target.id === 'video-review-backdrop'){
      closeVideoReview();
    }
    var videoAction = e.target.closest('[data-video-action]');
    if(videoAction){
      var backdrop = document.getElementById('video-review-backdrop');
      var openRow = backdrop ? backdrop._sourceRow : null;
      if(openRow){
        var statusCell = openRow.querySelector('.admin-badge');
        var approved = videoAction.getAttribute('data-video-action') === 'approve';
        if(statusCell){
          statusCell.className = 'admin-badge ' + (approved ? 'green' : 'red');
          statusCell.innerHTML = '<span class="dot"></span>' + (approved ? 'Approved' : 'Rejected');
        }
      }
      closeVideoReview();
    }

    var profileTab = e.target.closest('.profile-nav-tab');
    if(profileTab){
      var navContainer = profileTab.parentElement;
      navContainer.querySelectorAll('.profile-nav-tab').forEach(function(t){ t.classList.remove('is-active'); });
      profileTab.classList.add('is-active');
      document.querySelectorAll('.profile-tab-panel').forEach(function(p){ p.classList.remove('is-active'); });
      var targetPanel = document.getElementById(profileTab.getAttribute('data-tab'));
      if(targetPanel) targetPanel.classList.add('is-active');

      // Mobile dropdown: reflect the choice, close it, and bring the
      // newly-revealed section into view under the sticky toggle.
      var sidePanel = profileTab.closest('.profile-side-panel');
      var toggleValue = document.getElementById('profile-nav-toggle-value');
      var toggleBtn = document.getElementById('profile-nav-toggle');
      if(toggleValue){
        var labelSpan = profileTab.querySelector('span:not(.member-nav-badge)');
        toggleValue.textContent = (labelSpan ? labelSpan.textContent : profileTab.textContent).trim();
      }
      if(sidePanel) sidePanel.classList.remove('is-open');
      if(toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
      if(targetPanel && window.matchMedia('(max-width: 1100px)').matches){
        setTimeout(function(){
          var stickyPanel = document.querySelector('.profile-side-panel');
          var stickyHeight = stickyPanel ? stickyPanel.getBoundingClientRect().height : 0;
          var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
          var targetTop = targetPanel.getBoundingClientRect().top + window.scrollY;
          var offset = navH + stickyHeight + 16;
          window.scrollTo({ top: Math.max(0, targetTop - offset), behavior: 'smooth' });
        }, 60);
      }
    }

    var navToggle = e.target.closest('#profile-nav-toggle');
    if(navToggle){
      var panel = navToggle.closest('.profile-side-panel');
      if(panel){
        var willOpen = !panel.classList.contains('is-open');
        panel.classList.toggle('is-open', willOpen);
        navToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      }
    }

    if(e.target.closest('#open-terms-link')){
      e.preventDefault();
      var termsBackdrop = document.getElementById('terms-modal-backdrop');
      if(termsBackdrop){
        termsBackdrop.classList.add('is-active');
        document.body.classList.add('modal-open');
      }
    }
    if(e.target.closest('[data-modal-close-terms]')){
      var termsBackdropClose = document.getElementById('terms-modal-backdrop');
      if(termsBackdropClose){
        termsBackdropClose.classList.remove('is-active');
        document.body.classList.remove('modal-open');
      }
    }
    if(e.target.id === 'terms-modal-backdrop'){
      e.target.classList.remove('is-active');
      document.body.classList.remove('modal-open');
    }

    if(e.target.closest('#open-transfer-btn')){
      var transferBackdrop = document.getElementById('transfer-modal-backdrop');
      if(transferBackdrop){
        transferBackdrop.classList.add('is-active');
        document.body.classList.add('modal-open');
      }
    }
    if(e.target.closest('#manage-wallet-bank-link')){
      e.preventDefault();
      var bankBackdropOpen = document.getElementById('bank-modal-backdrop');
      if(bankBackdropOpen){
        bankBackdropOpen.classList.add('is-active');
        document.body.classList.add('modal-open');
      }
    }
    if(e.target.closest('[data-modal-close-bank]')){
      closeBankModal();
    }
    if(e.target.id === 'bank-modal-backdrop'){
      closeBankModal();
    }
    if(e.target.closest('#save-bank-btn')){
      saveBankAccount();
    }

    if(e.target.closest('#manage-bank-link')){
      e.preventDefault();
      openGentBankModal();
    }
    if(e.target.closest('[data-modal-close-gentbank]')){
      closeGentBankModal();
    }
    if(e.target.id === 'gent-bank-modal-backdrop'){
      closeGentBankModal();
    }
    if(e.target.closest('#gent-save-bank-btn')){
      saveGentBankAccount();
    }

    if(e.target.closest('#open-topup-btn')){
      var topupBackdrop = document.getElementById('topup-modal-backdrop');
      if(topupBackdrop){
        topupBackdrop.classList.add('is-active');
        document.body.classList.add('modal-open');
      }
    }
    if(e.target.closest('[data-modal-close-topup]')){
      closeTopupModal();
    }
    if(e.target.id === 'topup-modal-backdrop'){
      closeTopupModal();
    }

    var amountPill = e.target.closest('#topup-modal-content .choice-pill');
    if(amountPill){
      var pillRow = amountPill.parentElement;
      pillRow.querySelectorAll('.choice-pill').forEach(function(p){ p.classList.remove('is-selected'); });
      amountPill.classList.add('is-selected');
      var customField = document.getElementById('custom-amount-field');
      var isCustom = amountPill.getAttribute('data-amount') === 'custom';
      if(customField) customField.style.display = isCustom ? 'block' : 'none';
      if(isCustom){
        var customInput = document.getElementById('custom-amount-input');
        if(customInput) customInput.focus();
      }
      updateTopupSummary();
    }

    var topupMethod = e.target.closest('#topup-modal-content .payment-badge');
    if(topupMethod){
      if(topupMethod.id === 'topup-bank-option' && topupMethod.getAttribute('data-registered') !== 'true'){
        pendingTopupReturn = true;
        closeTopupModal();
        openGentBankModal();
      } else {
        var methodRow = topupMethod.parentElement;
        methodRow.querySelectorAll('.payment-badge').forEach(function(b){ b.classList.remove('is-active'); });
        topupMethod.classList.add('is-active');
      }
    }

    if(e.target.closest('#confirm-topup-btn')){
      confirmTopup();
    }

    if(e.target.closest('[data-modal-close-transfer]')){
      closeTransferModal();
    }
    if(e.target.id === 'transfer-modal-backdrop'){
      closeTransferModal();
    }
    if(e.target.closest('#confirm-transfer-btn')){
      confirmTransfer();
    }
  });

  var locationFilterEl = document.getElementById('location-filter');
  if(locationFilterEl){
    locationFilterEl.addEventListener('change', function(){
      currentPage = 1;
      renderGrid();
    });
  }

  function updateTopupSummary(){
    var selectedPill = document.querySelector('#topup-modal-content .choice-pill.is-selected');
    var amount = 0;
    if(selectedPill){
      var val = selectedPill.getAttribute('data-amount');
      if(val === 'custom'){
        var customInput = document.getElementById('custom-amount-input');
        amount = customInput ? (parseInt(customInput.value, 10) || 0) : 0;
      } else {
        amount = parseInt(val, 10) || 0;
      }
    }
    var payEl = document.getElementById('topup-pay-amount');
    var receiveEl = document.getElementById('topup-receive-amount');
    if(payEl) payEl.textContent = '\u20b1' + amount.toLocaleString();
    if(receiveEl) receiveEl.textContent = amount.toLocaleString() + ' credit';
  }

  function closeTopupModal(){
    var backdrop = document.getElementById('topup-modal-backdrop');
    if(!backdrop) return;
    backdrop.classList.remove('is-active');
    document.body.classList.remove('modal-open');
  }

  function openGentBankModal(){
    var backdrop = document.getElementById('gent-bank-modal-backdrop');
    if(!backdrop) return;
    backdrop.classList.add('is-active');
    document.body.classList.add('modal-open');
  }
  function closeGentBankModal(){
    var backdrop = document.getElementById('gent-bank-modal-backdrop');
    if(!backdrop) return;
    backdrop.classList.remove('is-active');
    document.body.classList.remove('modal-open');
  }

  function saveGentBankAccount(){
    var bankSelect = document.getElementById('gent-bank-name-input');
    var acctNumber = document.getElementById('gent-bank-account-number-input');
    var acctName = document.getElementById('gent-bank-account-name-input');

    var bankName = bankSelect ? bankSelect.value : '';
    var number = acctNumber ? acctNumber.value.trim() : '';
    var name = acctName ? acctName.value.trim() : '';

    if(!bankName || !number || !name){
      var content = document.getElementById('gent-bank-modal-content');
      var existingWarning = document.getElementById('gent-bank-form-warning');
      if(!existingWarning && content){
        var warning = document.createElement('p');
        warning.id = 'gent-bank-form-warning';
        warning.style.cssText = 'color:#b8564f; font-size:13px; margin:-8px 0 16px;';
        warning.textContent = 'Please fill in all fields before saving.';
        var saveBtn = document.getElementById('gent-save-bank-btn');
        if(saveBtn) content.insertBefore(warning, saveBtn);
      }
      return;
    }

    var last4 = number.replace(/\s/g, '').slice(-4);
    var maskedLabel = bankName + ' \u2022\u2022\u2022\u2022 ' + last4;

    var nameLabel = document.getElementById('gent-bank-name-value');
    var manageLink = document.getElementById('manage-bank-link');
    if(nameLabel){
      nameLabel.textContent = maskedLabel;
      nameLabel.style.color = '';
      nameLabel.style.fontWeight = '';
    }
    if(manageLink) manageLink.textContent = 'Change bank account';

    var bankTopupOption = document.getElementById('topup-bank-option');
    if(bankTopupOption){
      bankTopupOption.textContent = maskedLabel;
      bankTopupOption.setAttribute('data-registered', 'true');
    }

    closeGentBankModal();

    if(pendingTopupReturn){
      pendingTopupReturn = false;
      var topupBackdropReturn = document.getElementById('topup-modal-backdrop');
      if(topupBackdropReturn){
        topupBackdropReturn.classList.add('is-active');
        document.body.classList.add('modal-open');
      }
      if(bankTopupOption){
        document.querySelectorAll('#topup-modal-content .payment-badge').forEach(function(b){ b.classList.remove('is-active'); });
        bankTopupOption.classList.add('is-active');
      }
    }
  }

  function confirmTopup(){
    var selectedPill = document.querySelector('#topup-modal-content .choice-pill.is-selected');
    var amount = 0;
    if(selectedPill){
      var val = selectedPill.getAttribute('data-amount');
      if(val === 'custom'){
        var customInput = document.getElementById('custom-amount-input');
        amount = customInput ? (parseInt(customInput.value, 10) || 0) : 0;
      } else {
        amount = parseInt(val, 10) || 0;
      }
    }
    if(amount <= 0){
      var customInput2 = document.getElementById('custom-amount-input');
      if(customInput2) customInput2.style.borderColor = '#b8564f';
      return;
    }

    var selectedMethod = document.querySelector('#topup-modal-content .payment-badge.is-active');
    var methodLabel = selectedMethod ? selectedMethod.textContent.trim() : 'Visa \u2022\u2022\u2022\u2022 4821';

    var balanceEl = document.getElementById('credit-balance-amount');
    var currentBalance = balanceEl ? parseInt(balanceEl.textContent.replace(/[^0-9]/g, ''), 10) || 0 : 0;
    var newBalance = currentBalance + amount;
    sessionStorage.setItem('gclubCredit', String(newBalance));

    var content = document.getElementById('topup-modal-content');
    if(content){
      content.innerHTML =
        '<div style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:16px; padding:8px 0;">' +
          '<div class="success-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg></div>' +
          '<h2 style="font-family:var(--font-serif); font-size:22px; font-weight:400; margin:0;">Top-up successful</h2>' +
          '<p style="color:var(--muted); font-size:14px; margin:0;">' + amount.toLocaleString() + ' credit has been added to your balance.</p>' +
          '<button type="button" class="btn btn-dark" data-modal-close-topup style="margin-top:4px;">Done</button>' +
        '</div>';
    }

    if(balanceEl) balanceEl.innerHTML = newBalance.toLocaleString() + ' <span style="font-size:16px; color:var(--muted); font-weight:400;">credit</span>';
    var noteEl = document.querySelector('.wallet-balance .note');
    if(noteEl) noteEl.innerHTML = '\u2248 \u20b1' + newBalance.toLocaleString() + ' value \u00b7 1 credit = \u20b11';

    var tbody = document.getElementById('gent-transactions-body');
    if(tbody){
      var today = formatToday();
      var row = document.createElement('tr');
      row.innerHTML = '<td>' + today + '</td><td>Credit top-up</td><td>' + methodLabel + '</td>' +
        '<td><span class="admin-badge green"><span class="dot"></span>Paid</span></td>' +
        '<td style="font-weight:600;">\u20b1' + amount.toLocaleString() + '</td>';
      tbody.insertBefore(row, tbody.firstChild);
    }
  }

  function closeTransferModal(){
    var backdrop = document.getElementById('transfer-modal-backdrop');
    if(!backdrop) return;
    backdrop.classList.remove('is-active');
    document.body.classList.remove('modal-open');
  }

  function closeBankModal(){
    var backdrop = document.getElementById('bank-modal-backdrop');
    if(!backdrop) return;
    backdrop.classList.remove('is-active');
    document.body.classList.remove('modal-open');
  }

  function saveBankAccount(){
    var bankSelect = document.getElementById('bank-name-input');
    var acctNumber = document.getElementById('bank-account-number-input');
    var acctName = document.getElementById('bank-account-name-input');

    var bankName = bankSelect ? bankSelect.value : '';
    var number = acctNumber ? acctNumber.value.trim() : '';
    var name = acctName ? acctName.value.trim() : '';

    if(!bankName || !number || !name){
      var content = document.getElementById('bank-modal-content');
      var existingWarning = document.getElementById('bank-form-warning');
      if(!existingWarning && content){
        var warning = document.createElement('p');
        warning.id = 'bank-form-warning';
        warning.style.cssText = 'color:#b8564f; font-size:13px; margin:-8px 0 16px;';
        warning.textContent = 'Please fill in all fields before saving.';
        var saveBtn = document.getElementById('save-bank-btn');
        if(saveBtn) content.insertBefore(warning, saveBtn);
      }
      return;
    }

    var last4 = number.replace(/\s/g, '').slice(-4);
    var nameLabel = document.getElementById('wallet-bank-name-value');
    var manageLink = document.getElementById('manage-wallet-bank-link');
    var transferTrigger = document.getElementById('open-transfer-btn');

    if(nameLabel){
      nameLabel.textContent = bankName + ' \u2022\u2022\u2022\u2022 ' + last4;
      nameLabel.style.color = '';
      nameLabel.style.fontWeight = '';
    }
    if(manageLink) manageLink.textContent = 'Change bank account';
    if(transferTrigger){
      transferTrigger.setAttribute('data-bank-registered', 'true');
      transferTrigger.classList.remove('is-disabled');
    }

    closeBankModal();
  }

  function confirmTransfer(){
    var content = document.getElementById('transfer-modal-content');
    if(!content) return;
    content.innerHTML =
      '<div style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:16px; padding:8px 0;">' +
        '<div class="success-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg></div>' +
        '<h2 style="font-family:var(--font-serif); font-size:22px; font-weight:400; margin:0;">Transfer requested</h2>' +
        '<p style="color:var(--muted); font-size:14px; margin:0;">Your transfer to BDO Unibank &bull;&bull;&bull;&bull; 4821 is on its way. It typically completes within 1&ndash;2 business days.</p>' +
        '<button type="button" class="btn btn-dark" data-modal-close-transfer style="margin-top:4px;">Done</button>' +
      '</div>';

    var balanceEl = document.getElementById('wallet-balance-amount');
    var noteEl = document.getElementById('wallet-balance-note');
    var openBtn = document.getElementById('open-transfer-btn');
    if(balanceEl) balanceEl.textContent = '\u20b10';
    if(noteEl) noteEl.textContent = 'No balance available right now';
    if(openBtn){ openBtn.disabled = true; openBtn.classList.add('is-disabled'); }

    var sourceRow = document.getElementById('wallet-source-row');
    if(sourceRow){
      var badge = sourceRow.querySelector('.admin-badge');
      if(badge){
        badge.className = 'admin-badge amber';
        badge.innerHTML = '<span class="dot"></span>Processing';
      }
      var desc = sourceRow.children[1];
      if(desc) desc.textContent = 'Bank transfer to BDO \u2022\u2022\u2022\u2022 4821';
      var method = sourceRow.children[2];
      if(method) method.textContent = 'Bank transfer';
    }
  }

  /* ---------------------------------------------------------
     Admin: review a G Girl's submitted Q&A verification video.
  --------------------------------------------------------- */
  function openVideoReview(trigger){
    var backdrop = document.getElementById('video-review-backdrop');
    if(!backdrop) return;
    var setText = function(id, val){ var el = document.getElementById(id); if(el) el.textContent = val; };
    setText('video-review-name', trigger.getAttribute('data-name'));
    setText('video-review-initial', trigger.getAttribute('data-initial'));
    setText('video-review-duration', trigger.getAttribute('data-duration'));
    setText('video-review-submitted', trigger.getAttribute('data-submitted'));
    backdrop._sourceRow = trigger.closest('tr');
    backdrop.classList.add('is-active');
    document.body.classList.add('modal-open');
  }
  function closeVideoReview(){
    var backdrop = document.getElementById('video-review-backdrop');
    if(!backdrop) return;
    backdrop.classList.remove('is-active');
    document.body.classList.remove('modal-open');
  }

  /* ---------------------------------------------------------
     Gentleman payment step: switch between card and G-Cash
     fields, then simulate the authorize -> success sequence.
  --------------------------------------------------------- */
  function selectPaymentMethod(btn){
    var all = document.querySelectorAll('.payment-badge');
    all.forEach(function(b){ b.classList.remove('is-active'); });
    btn.classList.add('is-active');

    var isGcash = btn.getAttribute('data-method') === 'gcash';
    var cardFields = document.getElementById('pay-fields-card');
    var gcashFields = document.getElementById('pay-fields-gcash');
    var billingNote = document.getElementById('pay-billing-note');
    if(cardFields) cardFields.style.display = isGcash ? 'none' : 'block';
    if(gcashFields) gcashFields.style.display = isGcash ? 'block' : 'none';
    if(billingNote){
      billingNote.textContent = isGcash
        ? 'We\u2019ll send a secure authorization request to this G-Cash account.'
        : 'Your billing details are never shared with companions or shown on your profile.';
    }
  }

  function formatToday(){
    var d = new Date();
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function randomRef(prefix){
    var n = function(){ return Math.floor(1000 + Math.random() * 9000); };
    return prefix + '-' + n() + '-' + n() + '-' + n();
  }

  /* ---------------------------------------------------------
     Gentleman "Plan & payment" step: one page to pick a plan (or skip
     to the Free plan), enter payment, agree to the terms, and submit.
     The same page doubles as the plan-change page for existing members.
  --------------------------------------------------------- */
  function rememberGentStep(n){
    if(isRegistered()) return;
    var cur = parseInt(sessionStorage.getItem('gclubGentProgress'), 10) || 1;
    if(n > cur) sessionStorage.setItem('gclubGentProgress', String(n));
  }

  function isGentApplicationMode(){
    var form = document.getElementById('plan-form-card');
    return !!form && form.getAttribute('data-mode') === 'application';
  }

  function updateGentPrimaryState(){
    var btn = document.getElementById('pay-continue-btn');
    var terms = document.getElementById('terms-agree-checkbox');
    if(!btn || !terms || !isGentApplicationMode()) return;
    btn.disabled = !terms.checked;
    btn.classList.toggle('is-disabled', !terms.checked);
  }

  function setPlan(name, price, period){
    sessionStorage.setItem('gclubPlanName', name);
    sessionStorage.setItem('gclubPlanPrice', price);
    sessionStorage.setItem('gclubPlanPeriod', period);
    applyPlanToPayment();
  }

  function applyPlanToPayment(){
    var planLine = document.getElementById('pay-plan-line');
    if(!planLine) return;
    var name = sessionStorage.getItem('gclubPlanName') || 'Monthly';
    var price = sessionStorage.getItem('gclubPlanPrice') || '800';
    var period = sessionStorage.getItem('gclubPlanPeriod') || '/ month';
    var limited = name === 'Free';
    var amountText = '\u20b1' + Number(price).toLocaleString();

    planLine.textContent = (limited ? 'Free plan' : name + ' plan') + ' - ' + amountText + ' ' + period;
    var amt = document.getElementById('pay-amount-value');
    if(amt) amt.textContent = amountText;
    var authAmt = document.getElementById('authorize-amount-value');
    if(authAmt) authAmt.textContent = amountText;
    var planCredit = PLAN_CREDIT[name] || 0;
    var creditLine = document.getElementById('pay-credit-line');
    if(creditLine){
      creditLine.style.display = planCredit ? 'block' : 'none';
      creditLine.textContent = planCredit ? planCredit.toLocaleString('en-US') + ' credit added now and again at each renewal' : '';
    }

    document.querySelectorAll('.plan-card').forEach(function(card){
      var on = card.getAttribute('data-plan-name') === name;
      var radio = card.querySelector('.plan-radio');
      if(radio) radio.classList.toggle('is-checked', on);
      card.classList.toggle('is-selected', on);
    });

    // The Free plan is card-only; the paid plans also take G-Cash.
    var gcashBadge = document.querySelector('.payment-badge[data-method="gcash"]');
    var cardFields = document.getElementById('pay-fields-card');
    var gcashFields = document.getElementById('pay-fields-gcash');
    if(limited){
      if(gcashBadge) gcashBadge.style.display = 'none';
      document.querySelectorAll('.payment-badge').forEach(function(b){ b.classList.remove('is-active'); });
      if(cardFields) cardFields.style.display = 'block';
      if(gcashFields) gcashFields.style.display = 'none';
    } else if(gcashBadge){
      gcashBadge.style.display = '';
    }
    var gcashActive = !!document.querySelector('.payment-badge.is-active[data-method="gcash"]');
    var note = document.getElementById('pay-billing-note');
    if(note){
      note.textContent = limited
        ? 'No charge for 14 days. After that, choose Starter or Monthly to keep your access.'
        : (gcashActive
          ? 'We\u2019ll send a secure authorization request to this G-Cash account.'
          : 'Your billing details are never shared with companions or shown on your profile.');
    }

    var btn = document.getElementById('pay-continue-btn');
    if(btn && btn.firstChild){
      var label = limited ? 'Save card & submit' : 'Pay ' + amountText + (isGentApplicationMode() ? ' & submit' : ' & upgrade');
      btn.firstChild.textContent = label + ' ';
    }
  }

  function startPaymentFlow(){
    if(sessionStorage.getItem('gclubPlanName') === 'Free'){
      var cardInputs = document.querySelectorAll('#pay-fields-card input');
      var missing = Array.prototype.some.call(cardInputs, function(i){ return !i.value.trim(); });
      var cardErr = document.getElementById('pay-card-error');
      if(missing){ if(cardErr) cardErr.style.display = 'block'; return; }
      if(cardErr) cardErr.style.display = 'none';
    }
    var appMode = isGentApplicationMode();
    var isGcash = document.querySelector('.payment-badge.is-active[data-method="gcash"]');
    var mainSections = document.getElementById('plan-main-sections');
    var authorizeSection = document.getElementById('pay-authorize-section');
    var successSection = document.getElementById('pay-success-section');
    var title = document.getElementById('pay-title');
    var desc = document.getElementById('pay-desc');

    // Applying: paying is the last step of the application, so it finishes the
    // application too. Changing plans: show the receipt and head back.
    function onPaid(viaGcash){
      finishPaymentSuccess(viaGcash, title, desc);
      if(appMode){ completeGentApplication(); }
      else if(successSection){ successSection.style.display = 'block'; }
    }

    if(mainSections) mainSections.style.display = 'none';
    if(isGcash){
      if(authorizeSection) authorizeSection.style.display = 'block';
      if(title) title.textContent = 'Authorize your payment';
      if(desc) desc.textContent = 'One final confirmation in your G-Cash app.';
      setTimeout(function(){
        if(authorizeSection) authorizeSection.style.display = 'none';
        onPaid(true);
      }, 2200);
    } else {
      onPaid(false);
    }
  }

  function finishPaymentSuccess(isGcash, title, desc){
    if(title) title.textContent = 'Payment successful';
    if(desc) desc.textContent = 'Your membership payment has been securely received.';
    var sub = document.getElementById('pay-success-sub');
    var refLabel = document.getElementById('pay-ref-label');
    var refValue = document.getElementById('pay-ref-value');
    var dateValue = document.getElementById('pay-date-value');
    if(sub) sub.textContent = isGcash ? 'Your G-Cash payment was successful.' : 'Your card payment was successful.';
    if(refLabel) refLabel.textContent = isGcash ? 'G-Cash reference number' : 'Card reference number';
    if(refValue) refValue.textContent = isGcash ? randomRef('GC') : randomRef('CH');
    if(dateValue) dateValue.textContent = formatToday();
    if(sessionStorage.getItem('gclubPlanName') === 'Free'){
      // Free plan: card saved, nothing charged. Not a paid membership, so
      // the member flag stays off and the Free limits apply instead.
      sessionStorage.removeItem('gclubMembershipActive');
      sessionStorage.setItem('gclubFreePlan', 'true');
      sessionStorage.setItem('gclubFreeBookingsUsed', sessionStorage.getItem('gclubFreeBookingsUsed') || '0');
      // Re-picking Free never restarts the 14 days or refills the messages.
      sessionStorage.setItem('gclubFreeStart', sessionStorage.getItem('gclubFreeStart') || String(Date.now()));
      sessionStorage.setItem('gclubFreeMsgCount', sessionStorage.getItem('gclubFreeMsgCount') || '0');
      if(title) title.textContent = 'You\u2019re all set';
      if(desc) desc.textContent = 'Your card is saved. You won\u2019t be charged for 14 days.';
      var successTitle = document.getElementById('pay-success-title');
      if(successTitle) successTitle.textContent = 'Card saved';
      if(sub) sub.textContent = 'Your 14 free days start today. Pick Starter or Monthly any time to keep going.';
      if(refLabel) refLabel.textContent = 'Card reference number';
    } else {
      sessionStorage.setItem('gclubMembershipActive', 'true');
      sessionStorage.removeItem('gclubFreePlan');
      // The plan's credit lands in the wallet now (and again at each renewal).
      var boughtPlan = sessionStorage.getItem('gclubPlanName');
      if(PLAN_CREDIT[boughtPlan]){
        addCredit(PLAN_CREDIT[boughtPlan], isGentApplicationMode());
        var creditNote = document.getElementById('pay-credit-note');
        if(creditNote){ creditNote.innerHTML = creditNoteHtml(boughtPlan); creditNote.style.display = 'block'; }
      }
    }
  }

  /* ---------------------------------------------------------
     Gentleman application: submitting creates the account. Shows what
     happens next (status tracker) and a receipt for what was paid.
  --------------------------------------------------------- */
  function completeGentApplication(){
    // From here on they are registered (and signed in), with or without a paid plan.
    sessionStorage.setItem('gclubRegistered', 'true');
    sessionStorage.setItem('gclubLoggedInName', 'Alex');
    sessionStorage.setItem('gclubLoggedInInitial', 'A');
    sessionStorage.setItem('gclubLoggedInProfile', 'gent-profile.html');
    sessionStorage.removeItem('gclubGentProgress');
    sessionStorage.removeItem('gclubPlanReturn');

    var card = document.getElementById('plan-form-card');
    if(!card) return;
    var heading = document.getElementById('plan-heading');
    var progress = document.querySelector('.app-progress');
    var explain = document.getElementById('plan-explain');
    if(heading) heading.style.display = 'none';
    if(progress) progress.style.display = 'none';
    if(explain) explain.style.display = 'none';
    var appContent = card.closest('.app-content');
    var formColumn = card.closest('.form-column');
    if(appContent) appContent.classList.add('is-centered');
    if(formColumn) formColumn.classList.add('is-centered');

    var planName = sessionStorage.getItem('gclubPlanName') || 'Monthly';
    var amount = (document.getElementById('pay-amount-value') || {}).textContent || '';
    var ref = (document.getElementById('pay-ref-value') || {}).textContent || '';
    var freeNow = planName === 'Free' ? freeStatus() : null;
    var receipt = planName === 'Free'
      ? 'Free for 14 days \u00b7 until ' + formatDay(freeNow ? freeNow.endsOn : Date.now() + FREE_DAYS * 86400000) + ' \u00b7 card saved'
      : planName + ' plan \u00b7 ' + amount + ' paid \u00b7 Ref ' + ref;

    card.innerHTML =
      '<div class="success-panel">' +
        '<div class="success-icon">' +
          '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>' +
        '</div>' +
        '<h2>Your application is in</h2>' +
        '<p>Thanks for applying to G Club. Our team typically completes a discreet review within 24 hours. We\u2019ll email you as soon as you\u2019re approved.</p>' +
        '<div class="status-tracker">' +
          '<div class="status-step is-done"><span class="st-dot"></span><span>Submitted</span></div>' +
          '<div class="status-line is-done"></div>' +
          '<div class="status-step is-current"><span class="st-dot"></span><span>In review</span></div>' +
          '<div class="status-line"></div>' +
          '<div class="status-step"><span class="st-dot"></span><span>Approved</span></div>' +
        '</div>' +
        '<p class="receipt-line">' + receipt + '</p>' +
        (PLAN_CREDIT[planName] ? '<p class="receipt-line credit-note">' + creditNoteHtml(planName) + '</p>' : '') +
        '<div style="display:flex; gap:10px; margin-top:8px; flex-wrap:wrap; justify-content:center;">' +
          '<a href="index.html" class="btn btn-dark btn-lg" data-transition>Browse while you wait</a>' +
          '<a href="gent-profile.html" class="btn btn-ghost btn-lg" data-transition>View profile</a>' +
        '</div>' +
      '</div>';

    var veil = document.getElementById('page-veil');
    card.querySelectorAll('a[data-transition]').forEach(function(freshLink){
      freshLink.addEventListener('click', function(e){
        var href = freshLink.getAttribute('href');
        e.preventDefault();
        sessionStorage.setItem('gclubTransition', '1');
        if(veil) veil.classList.add('is-active');
        setTimeout(function(){ window.location.href = href; }, 460);
      });
    });
  }

  /* ---------------------------------------------------------
     Video verification step: a mock record/re-record toggle.
     No real capture here \u2014 this is a static prototype \u2014 but
     Continue stays disabled until a "recording" exists, so it's
     clear this step is a required part of the process.
  --------------------------------------------------------- */
  function toggleRecording(){
    var recorder = document.getElementById('video-recorder');
    var status = document.getElementById('video-status');
    var btn = document.getElementById('record-toggle');
    var frameText = recorder ? recorder.querySelector('.video-frame p') : null;
    var continueBtn = document.getElementById('video-continue');
    if(!recorder) return;

    var isRecorded = recorder.classList.toggle('is-recorded');
    if(isRecorded){
      if(status) status.innerHTML = '<span class="dot"></span> Recorded \u00b7 2:14';
      if(btn) btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg> Re-record';
      if(btn) btn.classList.replace('btn-dark', 'btn-ghost');
      if(frameText) frameText.textContent = 'Recording saved';
      if(continueBtn) continueBtn.classList.remove('is-disabled');
    } else {
      if(status) status.innerHTML = '<span class="dot"></span> Not recorded yet';
      if(btn) btn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg> Start recording';
      if(btn) btn.classList.replace('btn-ghost', 'btn-dark');
      if(frameText) frameText.textContent = 'Your camera preview will appear here';
      if(continueBtn) continueBtn.classList.add('is-disabled');
    }
  }

  /* ---------------------------------------------------------
     G Girl application: final submit swaps the preview card
     for a confirmation, right in place.
  --------------------------------------------------------- */
  function submitApplication(){
    var card = document.getElementById('preview-form-card');
    var heading = document.getElementById('preview-heading');
    var progress = document.getElementById('wizard-progress');
    var explain = document.getElementById('wizard-explain');
    if(!card) return;

    if(heading) heading.style.display = 'none';
    if(progress) progress.style.display = 'none';
    if(explain) explain.style.display = 'none';

    // With the sidebar and step-explanation gone, center what's left
    // on the page instead of leaving it stranded on the left.
    var appContent = document.getElementById('preview-app-content');
    var formColumn = document.getElementById('preview-form-column');
    if(appContent) appContent.classList.add('is-centered');
    if(formColumn) formColumn.classList.add('is-centered');

    card.innerHTML =
      '<div class="success-panel">' +
        '<div class="success-icon">' +
          '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>' +
        '</div>' +
        '<h2>Your profile is under review</h2>' +
        '<p>Thanks for applying to G Club. Our team typically reviews new profiles within 24\u201348 hours. We\u2019ll email you as soon as you\u2019re approved.</p>' +
        '<div style="display:flex; gap:10px; margin-top:8px; flex-wrap:wrap; justify-content:center;">' +
          '<a href="girl-profile.html" class="btn btn-dark btn-lg" data-transition>View Profile</a>' +
          '<a href="index.html" class="btn btn-ghost btn-lg" data-transition>Back to G Club</a>' +
        '</div>' +
      '</div>';

    // Re-bind the transition links we just injected, since they were
    // added after the page's initial [data-transition] wiring ran.
    var veil = document.getElementById('page-veil');
    var freshLinks = card.querySelectorAll('a[data-transition]');
    freshLinks.forEach(function(freshLink){
      freshLink.addEventListener('click', function(e){
        var href = freshLink.getAttribute('href');
        e.preventDefault();
        sessionStorage.setItem('gclubTransition', '1');
        veil.classList.add('is-active');
        setTimeout(function(){ window.location.href = href; }, 460);
      });
    });
  }

})();
