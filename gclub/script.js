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
    var all = Array.prototype.slice.call(grid.querySelectorAll('.profile-card'));
    return key === 'all' ? all : all.filter(function(c){ return c.getAttribute('data-category') === key; });
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
  });

  /* ---------------------------------------------------------
     Profile modal: opens in place over the marketplace,
     populated from the clicked card's data attributes.
  --------------------------------------------------------- */
  var lastTrigger = null;

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
    if(rate){ setText('modal-rate', rate); }
    setText('modal-cover-initial', initial);
    setText('modal-avatar-initial', initial);
    lastTrigger = trigger;
    backdrop.classList.add('is-active');
    document.body.classList.add('modal-open');
    var panel = backdrop.querySelector('.modal-panel');
    if(panel) panel.scrollTop = 0;
    var closeBtn = backdrop.querySelector('.modal-close');
    if(closeBtn) closeBtn.focus();
  }

  function closeProfileModal(){
    var backdrop = document.getElementById('profile-modal-backdrop');
    if(!backdrop || !backdrop.classList.contains('is-active')) return;
    backdrop.classList.remove('is-active');
    document.body.classList.remove('modal-open');
    if(lastTrigger){ lastTrigger.focus(); lastTrigger = null; }
  }

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      closeProfileModal();
      var videoBackdrop = document.getElementById('video-review-backdrop');
      if(videoBackdrop && videoBackdrop.classList.contains('is-active')){
        videoBackdrop.classList.remove('is-active');
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
    var opener = e.target.closest('[data-open-profile]');
    if(opener){
      e.preventDefault();
      openProfileModal(opener);
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
      }
    }

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

    var payMethodBtn = e.target.closest('.payment-badge');
    if(payMethodBtn){
      selectPaymentMethod(payMethodBtn);
    }

    var payContinueBtn = e.target.closest('#pay-continue-btn');
    if(payContinueBtn){
      startPaymentFlow();
    }

    var gentSubmitBtn = e.target.closest('#gent-submit-application');
    if(gentSubmitBtn){
      submitGentApplication();
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
  });

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

  function startPaymentFlow(){
    var isGcash = document.querySelector('.payment-badge.is-active[data-method="gcash"]');
    var methodSection = document.getElementById('pay-method-section');
    var authorizeSection = document.getElementById('pay-authorize-section');
    var successSection = document.getElementById('pay-success-section');
    var title = document.getElementById('pay-title');
    var desc = document.getElementById('pay-desc');

    if(isGcash){
      methodSection.style.display = 'none';
      authorizeSection.style.display = 'block';
      if(title) title.textContent = 'Authorize your payment';
      if(desc) desc.textContent = 'One final confirmation in your G-Cash app.';

      setTimeout(function(){
        authorizeSection.style.display = 'none';
        successSection.style.display = 'block';
        finishPaymentSuccess(true, title, desc);
      }, 2200);
    } else {
      methodSection.style.display = 'none';
      successSection.style.display = 'block';
      finishPaymentSuccess(false, title, desc);
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
  }

  /* ---------------------------------------------------------
     Gentleman application: final submit, same in-place swap
     pattern as the G Girl flow.
  --------------------------------------------------------- */
  function submitGentApplication(){
    var card = document.getElementById('gent-review-form-card');
    var heading = document.getElementById('gent-review-heading');
    var progress = document.getElementById('gent-wizard-progress');
    var explain = document.getElementById('gent-wizard-explain');
    if(!card) return;

    if(heading) heading.style.display = 'none';
    if(progress) progress.style.display = 'none';
    if(explain) explain.style.display = 'none';

    var appContent = card.closest('.app-content');
    var formColumn = card.closest('.form-column');
    if(appContent) appContent.classList.add('is-centered');
    if(formColumn) formColumn.classList.add('is-centered');

    card.innerHTML =
      '<div class="success-panel">' +
        '<div class="success-icon">' +
          '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>' +
        '</div>' +
        '<h2>Your account is under review</h2>' +
        '<p>Thanks for applying to G Club. Our team typically completes a discreet review within 24 hours. We\u2019ll email you as soon as you\u2019re approved.</p>' +
        '<a href="index.html" class="btn btn-dark btn-lg" data-transition style="margin-top:8px;">Back to G Club</a>' +
      '</div>';

    var veil = document.getElementById('page-veil');
    var freshLink = card.querySelector('a[data-transition]');
    if(veil && freshLink){
      freshLink.addEventListener('click', function(e){
        var href = freshLink.getAttribute('href');
        e.preventDefault();
        sessionStorage.setItem('gclubTransition', '1');
        veil.classList.add('is-active');
        setTimeout(function(){ window.location.href = href; }, 460);
      });
    }
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
        '<a href="index.html" class="btn btn-dark btn-lg" data-transition style="margin-top:8px;">Back to G Club</a>' +
      '</div>';

    // Re-bind the transition link we just injected, since it was
    // added after the page's initial [data-transition] wiring ran.
    var veil = document.getElementById('page-veil');
    var freshLink = card.querySelector('a[data-transition]');
    if(veil && freshLink){
      freshLink.addEventListener('click', function(e){
        var href = freshLink.getAttribute('href');
        e.preventDefault();
        sessionStorage.setItem('gclubTransition', '1');
        veil.classList.add('is-active');
        setTimeout(function(){ window.location.href = href; }, 460);
      });
    }
  }

})();
