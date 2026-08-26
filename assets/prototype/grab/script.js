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
    dots[gpActiveDot].classList.remove('is-active');
    gpActiveDot = (gpActiveDot + delta + dots.length) % dots.length;
    dots[gpActiveDot].classList.add('is-active');
  }

  // Tools rail: switches the active tab. Only "My Grab" has content wired
  // up in this preview; other tabs show a short placeholder note.
  var gpCapabilitiesHTML = document.getElementById('gpCapabilities').innerHTML;
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
    var select = document.getElementById('gpRailSelect');
    if (select) select.value = label;
    var list = document.getElementById('gpCapabilities');
    if (label === 'My Grab') {
      list.innerHTML = gpCapabilitiesHTML;
    } else {
      list.innerHTML = '<p style="font-size:13px;color:var(--slate);max-width:280px;">' + gpPlaceholder[label] + '</p>';
    }
  }
  document.getElementById('gpRailSelect').addEventListener('change', function(e){
    gpSwitchTab(e.target.value);
  });
  document.getElementById('gpRail').addEventListener('click', function(e){
    var btn = e.target.closest('.gp-tools__rail-item');
    if (!btn) return;
    gpSwitchTab(btn.textContent.trim());
  });
