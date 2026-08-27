// Renders the left sidebar and wires up mobile open/close behaviour.
// `activeSection` matches one of the keys below and controls which single
// nav item gets the "active" (bold + brand-colored) treatment:
//   "moments"  -> Customer Moments grid, and any individual moment page
//   "dashboard"-> Moments Dashboard analytics
//   "reports"  -> Reports
//   "team"     -> Team Activity
//   "settings" -> Settings
//   "help"     -> Help
function renderSidebar(activeSection) {
  const cls = (key) => (activeSection === key ? "nav-item active" : "nav-item");

  return `
    <aside class="sidebar" id="sidebar">
      <button class="collapse-btn" id="collapse-btn" aria-label="Collapse sidebar">${ICONS.chevronRight}</button>
      <div class="sidebar-scroll">
        <div class="sidebar-head">
          <div class="brand">
            <div class="logo">${ICONS.logo}</div>
            <span class="brand-name">myDash</span>
          </div>
        </div>

        <a class="profile-row" href="settings.html">
          <div class="avatar"><img src="https://images.unsplash.com/photo-1758691737605-69a0e78bd193?auto=format&fit=crop&w=120&h=120&q=80" alt="Fatima Nguyen" /></div>
          <div class="profile-meta">
            <p class="profile-name">Fatima Nguyen</p>
            <p class="profile-role">Marketing Ops</p>
          </div>
          <span class="profile-chevron">${ICONS.chevronRight}</span>
        </a>

        <div class="nav-divider"></div>

        <nav class="nav-flat">
          <a class="${cls("moments")}" href="index.html">
            <span class="nav-icon">${ICONS.heart}</span>
            <span class="nav-text">Customer Moments</span>
          </a>
          <a class="${cls("dashboard")}" href="dashboard.html">
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

          <a class="${cls("reports")}" href="reports.html">
            <span class="nav-icon">${ICONS.barChart}</span>
            <span class="nav-text">Reports</span>
          </a>
          <a class="${cls("team")}" href="team-activity.html">
            <span class="nav-icon">${ICONS.users}</span>
            <span class="nav-text">Team Activity</span>
          </a>
          <a class="${cls("settings")}" href="settings.html">
            <span class="nav-icon">${ICONS.settings}</span>
            <span class="nav-text">Settings</span>
          </a>
        </nav>

        <div class="sidebar-bottom">
          <div class="nav-divider"></div>
          <a class="${cls("help")}" href="help.html">
            <span class="nav-icon">${ICONS.helpCircle}</span>
            <span class="nav-text">Help</span>
          </a>
        </div>
      </div>
    </aside>
  `;
}

function mountSidebar(activeSection) {
  const mount = document.getElementById("sidebar-mount");
  if (!mount) return;
  mount.innerHTML = renderSidebar(activeSection);

  const sidebar = document.getElementById("sidebar");
  const openBtn = document.getElementById("sidebar-open");
  const backdrop = document.getElementById("sidebar-backdrop");
  const collapseBtn = document.getElementById("collapse-btn");

  function open() {
    sidebar.classList.add("open");
    backdrop.classList.add("open");
  }
  function close() {
    sidebar.classList.remove("open");
    backdrop.classList.remove("open");
  }
  if (openBtn) openBtn.addEventListener("click", open);
  if (backdrop) backdrop.addEventListener("click", close);
  sidebar.querySelectorAll("a.nav-item").forEach((a) => a.addEventListener("click", close));

  // Desktop collapse-to-rail toggle (state persists across pages)
  const collapsed = localStorage.getItem("myDash:sidebarCollapsed") === "1";
  if (collapsed) document.body.classList.add("sidebar-collapsed");
  if (collapseBtn) {
    collapseBtn.addEventListener("click", () => {
      const isCollapsed = document.body.classList.toggle("sidebar-collapsed");
      localStorage.setItem("myDash:sidebarCollapsed", isCollapsed ? "1" : "0");
    });
  }
}
