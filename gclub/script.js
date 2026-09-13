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
  });

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
