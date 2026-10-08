// Grab Portal — shared script for Home / Analytics / My Team / Resources.
// Home-only blocks are guarded (they check for elements that only exist on
// index.html) so this one file can be safely loaded by every page.

// Theme toggle: cycles explicit light -> dark -> (system default), stored
// only in memory for this view (no persistence needed for a preview).
function gpToggleTheme(){
  var root = document.documentElement;
  var current = root.getAttribute('data-theme');
  if (current === 'dark') { root.setAttribute('data-theme','light'); }
  else if (current === 'light') { root.removeAttribute('data-theme'); }
  else { root.setAttribute('data-theme','dark'); }
}

// Newsroom dial: purely visual — advances the active dot.
var gpActiveDot = 0;
function gpShiftDial(delta){
  var dots = document.querySelectorAll('#gpDots span');
  if (!dots.length) return;
  dots[gpActiveDot].classList.remove('is-active');
  gpActiveDot = (gpActiveDot + delta + dots.length) % dots.length;
  dots[gpActiveDot].classList.add('is-active');
}

// Tools rail: switches the active tab. Only "My Grab" has content wired
// up in this preview; other tabs show a short placeholder note.
(function(){
  var capabilities = document.getElementById('gpCapabilities');
  var rail = document.getElementById('gpRail');
  var railSelect = document.getElementById('gpRailSelect');
  if (!capabilities || !rail || !railSelect) return;
  var gpCapabilitiesHTML = capabilities.innerHTML;
  var gpPlaceholder = {
    'My Team': 'Team rosters, org charts, and reporting lines live here.',
    'My Learning': 'Courses, certifications, and skill-building paths live here.',
    'My Help': 'IT support, HR help desk, and ticketing live here.',
    'My Procurement': 'Purchase requests and vendor management live here.'
  };
  function gpSwitchTab(label){
    document.querySelectorAll('.gp-tools__rail-item').forEach(function(b){
      b.classList.toggle('is-active', b.textContent.trim() === label);
    });
    railSelect.value = label;
    if (label === 'My Grab') {
      capabilities.innerHTML = gpCapabilitiesHTML;
    } else {
      capabilities.innerHTML = '<p style="font-size:13px;color:var(--slate);max-width:280px;">' + gpPlaceholder[label] + '</p>';
    }
  }
  railSelect.addEventListener('change', function(e){
    gpSwitchTab(e.target.value);
  });
  rail.addEventListener('click', function(e){
    var btn = e.target.closest('.gp-tools__rail-item');
    if (!btn) return;
    gpSwitchTab(btn.textContent.trim());
  });
})();

// Mobile menu toggle — shared across every page (Home navbar and the app-page navbar).
(function(){
  var btn = document.querySelector('.gp-navbar__menu-btn, .gp-appnav__menu-btn');
  var menu = document.getElementById('gpMobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', function(e){
    e.stopPropagation();
    menu.classList.toggle('is-open');
  });
  document.addEventListener('click', function(e){
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('is-open');
    }
  });
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ menu.classList.remove('is-open'); });
  });
})();

// Tools page (tools.html only): chip category filter + live text search over
// the tool cards. Guarded on gpToolChips so it's a no-op on every other page.
(function(){
  var chipRow = document.getElementById('gpToolChips');
  var searchInput = document.getElementById('gpToolSearchInput');
  var sections = document.querySelectorAll('.gp-tool-section');
  var emptyState = document.getElementById('gpToolEmpty');
  if (!chipRow || !sections.length) return;

  var activeCategory = 'All';

  function applyFilters(){
    var query = (searchInput && searchInput.value || '').trim().toLowerCase();
    var anyVisible = false;

    sections.forEach(function(section){
      var category = section.getAttribute('data-category');
      var categoryMatches = activeCategory === 'All' || activeCategory === category;
      var cards = section.querySelectorAll('.gp-tool-card');
      var visibleInSection = 0;

      cards.forEach(function(card){
        var title = card.querySelector('.gp-tool-card__title');
        var desc = card.querySelector('.gp-tool-card__desc');
        var text = ((title ? title.textContent : '') + ' ' + (desc ? desc.textContent : '')).toLowerCase();
        var textMatches = !query || text.indexOf(query) !== -1;
        var show = categoryMatches && textMatches;
        card.style.display = show ? '' : 'none';
        if (show) visibleInSection++;
      });

      var showSection = visibleInSection > 0;
      section.style.display = showSection ? '' : 'none';
      if (showSection) anyVisible = true;
    });

    if (emptyState) emptyState.classList.toggle('is-visible', !anyVisible);
  }

  chipRow.addEventListener('click', function(e){
    var chip = e.target.closest('.gp-tool-chip');
    if (!chip) return;
    chipRow.querySelectorAll('.gp-tool-chip').forEach(function(c){ c.classList.remove('is-active'); });
    chip.classList.add('is-active');
    activeCategory = chip.textContent.trim();
    applyFilters();
  });

  if (searchInput){
    searchInput.addEventListener('input', applyFilters);
  }
})();
