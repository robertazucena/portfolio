function renderSidebar(n){const a=s=>n===s?"nav-item active":"nav-item";return`
    <aside class="sidebar" id="sidebar">
      <button class="collapse-btn" id="collapse-btn" aria-label="Collapse sidebar">${ICONS.chevronRight}</button>
      <div class="sidebar-scroll">
        <div class="sidebar-head">
          <div class="brand">
            <div class="logo">${ICONS.logo}</div>
            <span class="brand-name">myDash</span>
          </div>
          <button class="sidebar-close-btn" id="sidebar-close" aria-label="Close menu">${ICONS.x}</button>
        </div>

        <a class="profile-row" href="settings.html">
          <div class="avatar"><img src="assets/avatar-fn.svg" alt="Fatima Nguyen" /></div>
          <div class="profile-meta">
            <p class="profile-name">Fatima Nguyen</p>
            <p class="profile-role">Marketing Ops</p>
          </div>
          <span class="profile-chevron">${ICONS.chevronRight}</span>
        </a>

        <div class="nav-divider"></div>

        <nav class="nav-flat">
          <a class="${a("moments")}" href="index.html">
            <span class="nav-icon">${ICONS.heart}</span>
            <span class="nav-text">Customer Moments</span>
          </a>
          <a class="${a("dashboard")}" href="dashboard.html">
            <span class="nav-icon">${ICONS.barChart}</span>
            <span class="nav-text">Moments Dashboard</span>
          </a>

          <div class="nav-divider"></div>

          <span class="nav-item disabled" aria-disabled="true" title="Coming soon">
            <span class="nav-icon">${ICONS.calendar}</span>
            <span class="nav-text">Marketing Events</span>
          </span>
          <span class="nav-item disabled" aria-disabled="true" title="Coming soon">
            <span class="nav-icon">${ICONS.megaphone}</span>
            <span class="nav-text">DemGen Calendar</span>
          </span>
          <span class="nav-item disabled" aria-disabled="true" title="Coming soon">
            <span class="nav-icon">${ICONS.award}</span>
            <span class="nav-text">Celebrate Wins</span>
          </span>
          <span class="nav-item disabled" aria-disabled="true" title="Coming soon">
            <span class="nav-icon">${ICONS.lightbulb}</span>
            <span class="nav-text">Sales Tips</span>
          </span>
          <span class="nav-item disabled" aria-disabled="true" title="Coming soon">
            <span class="nav-icon">${ICONS.layers}</span>
            <span class="nav-text">Tools and Resources</span>
          </span>

          <div class="nav-divider"></div>

          <a class="${a("reports")}" href="reports.html">
            <span class="nav-icon">${ICONS.barChart}</span>
            <span class="nav-text">Reports</span>
          </a>
          <a class="${a("team")}" href="team-activity.html">
            <span class="nav-icon">${ICONS.users}</span>
            <span class="nav-text">Team Activity</span>
          </a>
          <a class="${a("settings")}" href="settings.html">
            <span class="nav-icon">${ICONS.settings}</span>
            <span class="nav-text">Settings</span>
          </a>
        </nav>

        <div class="sidebar-bottom">
          <div class="nav-divider"></div>
          <a class="${a("help")}" href="help.html">
            <span class="nav-icon">${ICONS.helpCircle}</span>
            <span class="nav-text">Help</span>
          </a>
        </div>
      </div>
    </aside>
  `}function mountSidebar(n){const a=document.getElementById("sidebar-mount");if(!a)return;a.innerHTML=renderSidebar(n);const s=document.getElementById("sidebar"),i=document.getElementById("sidebar-open"),c=document.getElementById("sidebar-close"),e=document.getElementById("sidebar-backdrop"),d=document.getElementById("collapse-btn");function o(){s.classList.add("open"),e.classList.add("open")}function t(){s.classList.remove("open"),e.classList.remove("open")}i&&i.addEventListener("click",o),c&&c.addEventListener("click",t),e&&e.addEventListener("click",t),s.querySelectorAll("a.nav-item").forEach(l=>l.addEventListener("click",t)),localStorage.getItem("myDash:sidebarCollapsed")==="1"&&document.body.classList.add("sidebar-collapsed"),d&&d.addEventListener("click",()=>{const l=document.body.classList.toggle("sidebar-collapsed");localStorage.setItem("myDash:sidebarCollapsed",l?"1":"0")})}
