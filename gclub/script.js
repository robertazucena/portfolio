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

    // Gentleman payment page: reflect whichever plan was actually chosen
    var planLine = document.getElementById('pay-plan-line');
    if(planLine){
      var storedName = sessionStorage.getItem('gclubPlanName');
      var storedPrice = sessionStorage.getItem('gclubPlanPrice');
      var storedPeriod = sessionStorage.getItem('gclubPlanPeriod');
      if(storedName && storedPrice){
        planLine.textContent = storedName + ' plan - \u20b1' + Number(storedPrice).toLocaleString() + ' ' + storedPeriod;
        var amt = document.getElementById('pay-amount-value');
        var authAmt = document.getElementById('authorize-amount-value');
        if(amt) amt.textContent = '\u20b1' + Number(storedPrice).toLocaleString();
        if(authAmt) authAmt.textContent = '\u20b1' + Number(storedPrice).toLocaleString();
      }
    }

    // Gentleman review page: only show an active membership if payment
    // was actually completed \u2014 the fee is what makes it real.
    var membershipRow = document.getElementById('gent-membership-value');
    if(membershipRow){
      var isActive = sessionStorage.getItem('gclubMembershipActive') === 'true';
      if(isActive){
        var name = sessionStorage.getItem('gclubPlanName') || 'Monthly';
        var price = sessionStorage.getItem('gclubPlanPrice') || '800';
        var period = sessionStorage.getItem('gclubPlanPeriod') || '/ month';
        membershipRow.textContent = name + ' \u2014 \u20b1' + Number(price).toLocaleString() + ' ' + period;
        membershipRow.style.color = '#2f9b67';
        var upsell = document.getElementById('gent-upsell-card');
        if(upsell){
          upsell.innerHTML = '<div>' +
            '<p class="ord-label">Membership active</p>' +
            '<p class="plan-line" style="font-size:18px;">You&rsquo;re a ' + name + ' member</p>' +
            '<p style="color:var(--muted); font-size:13px; margin:4px 0 0;">Your fee has been received. Manage or change your plan anytime from your profile.</p>' +
          '</div>';
        }
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

    var planCardClicked = e.target.closest('.plan-card');
    if(planCardClicked){
      document.querySelectorAll('.plan-radio').forEach(function(r){ r.classList.remove('is-checked'); });
      var radio = planCardClicked.querySelector('.plan-radio');
      if(radio) radio.classList.add('is-checked');
    }

    if(e.target.closest('#gent-plan-continue')){
      var checkedRadio = document.querySelector('.plan-radio.is-checked');
      var chosenCard = checkedRadio ? checkedRadio.closest('.plan-card') : null;
      if(chosenCard){
        sessionStorage.setItem('gclubPlanName', chosenCard.getAttribute('data-plan-name'));
        sessionStorage.setItem('gclubPlanPrice', chosenCard.getAttribute('data-plan-price'));
        sessionStorage.setItem('gclubPlanPeriod', chosenCard.getAttribute('data-plan-period'));
      }
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
      if(toggleValue) toggleValue.textContent = profileTab.textContent.trim();
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
    if(receiveEl) receiveEl.textContent = amount.toLocaleString() + ' G Coin';
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

    var balanceEl = document.getElementById('gcoin-balance-amount');
    var currentBalance = balanceEl ? parseInt(balanceEl.textContent.replace(/[^0-9]/g, ''), 10) || 0 : 0;
    var newBalance = currentBalance + amount;

    var content = document.getElementById('topup-modal-content');
    if(content){
      content.innerHTML =
        '<div style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:16px; padding:8px 0;">' +
          '<div class="success-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg></div>' +
          '<h2 style="font-family:var(--font-serif); font-size:22px; font-weight:400; margin:0;">Top-up successful</h2>' +
          '<p style="color:var(--muted); font-size:14px; margin:0;">' + amount.toLocaleString() + ' G Coin has been added to your balance.</p>' +
          '<button type="button" class="btn btn-dark" data-modal-close-topup style="margin-top:4px;">Done</button>' +
        '</div>';
    }

    if(balanceEl) balanceEl.innerHTML = newBalance.toLocaleString() + ' <span style="font-size:16px; color:var(--muted); font-weight:400;">G Coin</span>';
    var noteEl = document.querySelector('.wallet-balance .note');
    if(noteEl) noteEl.innerHTML = '\u2248 \u20b1' + newBalance.toLocaleString() + ' value \u00b7 1 G Coin = \u20b11';

    var tbody = document.getElementById('gent-transactions-body');
    if(tbody){
      var today = formatToday();
      var row = document.createElement('tr');
      row.innerHTML = '<td>' + today + '</td><td>G Coin top-up</td><td>' + methodLabel + '</td>' +
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
    sessionStorage.setItem('gclubMembershipActive', 'true');
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
        '<div style="display:flex; gap:10px; margin-top:8px; flex-wrap:wrap; justify-content:center;">' +
          '<a href="gent-profile.html" class="btn btn-dark btn-lg" data-transition>View Profile</a>' +
          '<a href="index.html" class="btn btn-ghost btn-lg" data-transition>Back to G Club</a>' +
        '</div>' +
      '</div>';

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
