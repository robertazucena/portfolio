// ===== Oracle AI Email Generator — static prototype router =====
const routes = {
  "#/": homePage,
  "#/templates": templatesPage,
  "#/editor": editorPage,
  "#/analytics": analyticsPage,
  "#/api-docs": apiDocsPage,
};

const navLinks = [
  { label: "Home", path: "#/" },
  { label: "Templates", path: "#/templates" },
  { label: "Analytics", path: "#/analytics" },
  { label: "API Docs", path: "#/api-docs" },
];

// ----- template data -----
const homePresets = [
  { title: "Win Story Announcement", badge: "SAAS", badgeColor: "bg-[#FFCFC6] text-[#9B3D33]", desc: "Share inspiring customer milestones, ROI metrics, and success summaries across the global team.", img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80" },
  { title: "Cloud Momentum Release", badge: "SAAS", badgeColor: "bg-[#FFCFC6] text-[#9B3D33]", desc: "Announce product updates, version releases, and strategic infrastructure scaling news.", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80" },
  { title: "Executive Briefing", badge: "SAAS", badgeColor: "bg-[#FFCFC6] text-[#9B3D33]", desc: "Provide concise executive-level updates on resource allocation and performance projections.", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80" },
];

const templates = [
  { title: "Win Story Announcement", badge: "MARKETING", cls: "b-marketing", desc: "Share inspiring customer milestones, ROI metrics, and success summaries across the global team.", img: "https://images.unsplash.com/photo-1765696300096-82b2425ec6e2?q=80&w=3668&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { title: "Cloud Momentum Release", badge: "NEWSLETTER", cls: "b-newsletter", desc: "Announce product updates, version releases, and strategic infrastructure scaling news.", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80" },
  { title: "Welcome Onboard", badge: "WELCOME", cls: "b-welcome", desc: "Greet new enterprise customers, schedule kick-off calls, and link primary cloud console guides.", img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80" },
  { title: "Summer Promo Offer", badge: "PROMO", cls: "b-marketing", desc: "Extend customized multi-region credit extensions and discounted OCI computing tiers.", img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80" },
  { title: "Product Launch Digest", badge: "PRODUCT UPDATE", cls: "b-newsletter", desc: "Structured release digests covering microservice updates, security patches, and deployment logs.", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80" },
  { title: "Quarterly Enterprise Review", badge: "ONBOARDING", cls: "b-welcome", desc: "Coordinate executive briefings on cloud resource allocation and performance projections.", img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80" },
];

// ----- header rendering -----
function renderHeader() {
  const path = location.hash || "#/";
  const tabs = document.getElementById("navTabs");
  tabs.innerHTML = navLinks.map(l =>
    `<a href="${l.path}" class="${l.path === path ? "active" : ""}">${l.label}</a>`
  ).join("");

  const mobile = document.getElementById("mobileMenu");
  mobile.innerHTML = navLinks.map(l =>
    `<a href="${l.path}" class="${l.path === path ? "active" : ""}">${l.label}</a>`
  ).join("");
}

// ----- pages -----
function homePage() {
  const cards = homePresets.map(p => `
    <a href="#/editor" class="template-card">
      <div class="thumb"><img src="${p.img}" alt="${p.title}" /></div>
      <div class="body">
        <span class="badge" style="background:#FFCFC6;color:#9B3D33;">${p.badge}</span>
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
      </div>
    </a>`).join("");

  return `
    <section class="hero">
      <span class="hero-chip">Powered by OCI Generative AI</span>
      <h1>Transform your ideas into<br><span class="accent">ready-to-send emails</span></h1>
      <p>Generate customized, professional HTML emails instantly using the power of AI prompts.</p>
      <div class="prompt-card">
        <div class="prompt-card-top">
          <span class="label">PROMPT THE AI EDITOR</span>
          <span class="status"><span class="dot"></span>Model Active</span>
        </div>
        <textarea placeholder='Describe the email you want to write... (e.g. "A friendly thank you email to OCI customers with a special discount code for Q3 renewal")'></textarea>
        <div class="prompt-card-bottom">
          <button class="btn btn-outline">📎 Attach Data Context</button>
          <button class="btn btn-outline">🌐 Select Tone</button>
          <a href="#/editor" class="btn btn-primary spacer">Generate Template →</a>
        </div>
      </div>
    </section>
    <section class="page">
      <div class="container">
        <div class="section-head">
          <div>
            <h2>Suggested Starting Points</h2>
            <p>Select a custom preset curated to match enterprise cloud standards.</p>
          </div>
          <a href="#/templates" class="section-link">View all 48 templates →</a>
        </div>
        <div class="grid-3">${cards}</div>
      </div>
    </section>`;
}

function templatesPage() {
  return `
    <div class="page">
      <div class="container">
        <div class="page-header">
          <h1>Template Gallery</h1>
          <p>Browse curated, enterprise-ready email templates. Pick one to customize with AI.</p>
        </div>
        <div class="search"><input id="tplSearch" placeholder="Search templates..." /></div>
        <div class="filters" id="tplFilters"></div>
        <div class="grid-3" id="tplGrid"></div>
      </div>
    </div>`;
}

function editorPage() {
  return `
    <div class="editor-top">
      <div class="inner">
        <div class="breadcrumb"><span>Emails</span><span>›</span><span class="cur">Win Story Email</span></div>
        <button class="btn btn-primary">Send</button>
      </div>
    </div>
    <div class="page">
      <div class="container">
        <h1 class="editor-title">Win Story Email</h1>
        <div class="editor-grid">
          <div>
            <div class="tab-switch">
              <button>Edit Structure</button>
              <button class="active">Live Preview</button>
            </div>
            <div class="card" style="margin-top:1rem;">
              <div class="meta-row"><span class="lbl">Subject</span><input value="Celebrating a Big Win Together!" /></div>
              <div class="meta-row"><span class="lbl">To</span><span class="val">valued-customer@oracle.com</span></div>
            </div>
            <div class="card" style="margin-top:1rem;overflow:hidden;">
              <div class="preview-hero">
                <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80" alt="" />
                <div class="overlay"></div>
                <span class="tag">DEAL CLOSED</span>
              </div>
              <div class="preview-body">
                <h2>We couldn't have done it without you.</h2>
                <p>Dear Partner,</p>
                <p>This milestone represents more than a successful migration — it's a testament to the trust and partnership we've built together across OCI regions this quarter.</p>
                <p>Your team's commitment to cloud-first strategy helped us accelerate deployment by 38% while maintaining full compliance with enterprise governance standards.</p>
                <button class="btn btn-primary" style="margin-top:1.25rem;">Read the Full Story</button>
              </div>
            </div>
            <div class="card sidebar-block" style="margin-top:1rem;">
              <div style="font-size:0.875rem;color:var(--muted);margin-bottom:0.75rem;">✨ Ask AI to refine or rewrite...</div>
              <div class="chips">
                <span class="chip">Make it formal</span>
                <span class="chip">Shorter</span>
                <span class="chip">Add promo code</span>
              </div>
            </div>
          </div>
          <div>
            <div class="card sidebar-block">
              <h3>Email Details</h3>
              <div class="field"><label>Campaign Name</label><input value="Q3 Win Story" /></div>
              <div class="field"><label>Category</label><select><option>Customer Success</option><option>Product Update</option><option>Marketing</option></select></div>
              <div class="field"><label>Priority</label><select><option>High</option><option>Medium</option><option>Low</option></select></div>
            </div>
            <div class="card sidebar-block" style="margin-top:1rem;">
              <h3>Recipients</h3>
              <div class="chips">
                <span class="chip">valued-customer@oracle.com</span>
                <span class="chip">sales-team@oracle.com</span>
                <span class="chip">management@oracle.com</span>
                <span class="chip chip-add">+ Add Recipient</span>
              </div>
            </div>
            <div class="card sidebar-block" style="margin-top:1rem;">
              <h3>Schedule</h3>
              <div class="field"><label>Send Time</label><select><option>Aug 5, 2026 at 10:00 AM</option><option>Aug 6, 2026 at 9:00 AM</option></select></div>
              <div class="field" style="display:flex;justify-content:space-between;align-items:center;font-size:0.875rem;"><span>Send automatically</span><span style="width:2.25rem;height:1.25rem;border-radius:9999px;background:#ff664f;position:relative;"><span style="position:absolute;right:0.125rem;top:0.125rem;width:1rem;height:1rem;background:#fff;border-radius:9999px;"></span></span></div>
              <div style="background:#fff1ee;border:1px solid #fbd3c9;border-radius:0.5rem;padding:0.625rem 0.75rem;font-size:0.75rem;color:#9b3d33;">🔔 Optimal send time suggested by AI</div>
            </div>
            <div class="card sidebar-block" style="margin-top:1rem;">
              <h3>Performance Prediction</h3>
              <div class="field"><div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:0.375rem;"><span style="color:var(--muted)">Estimated Open Rate</span><span style="font-weight:600">34%</span></div><div class="bar"><div style="width:34%;background:#ff664f;"></div></div></div>
              <div class="field"><div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:0.375rem;"><span style="color:var(--muted)">Estimated Click Rate</span><span style="font-weight:600">12%</span></div><div class="bar"><div style="width:12%;background:#10b981;"></div></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

const metrics = [
  { label: "Total Emails Sent", value: "142,850", delta: "+12.4%", up: true },
  { label: "Average Open Rate", value: "38.4%", delta: "+3.2%", up: true },
  { label: "Avg Click-Through Rate", value: "14.2%", delta: "-0.8%", up: false },
  { label: "Bounce Rate", value: "0.92%", delta: "-1.1%", up: false },
];
const chartData = [
  ["Oct 1", 4200, 1700, 540], ["Oct 5", 8800, 3600, 1180],
  ["Oct 9", 15500, 6100, 2050], ["Oct 13", 32000, 12500, 4300],
  ["Oct 17", 58000, 23000, 8100], ["Oct 21", 92000, 36000, 12500],
  ["Oct 25", 128000, 51000, 17800], ["Oct 30", 142850, 54800, 20200],
];
const topTemplates = [
  { name: "Win Story Announcement", pct: 72 }, { name: "Cloud Momentum Release", pct: 64 },
  { name: "Executive Briefing", pct: 51 }, { name: "Summer Promo Offer", pct: 43 },
];
const campaigns = [
  { name: "Q3 Cloud Success...", status: "Sent", open: "48.2%", ctr: "16.4%", date: "Oct 28" },
  { name: "August Maintenan...", status: "Sent", open: "39.1%", ctr: "12.0%", date: "Oct 25" },
  { name: "OCI Storage Speci...", status: "Draft", open: "--", ctr: "--", date: "Oct 20" },
  { name: "Enterprise Kickoff...", status: "Sent", open: "42.8%", ctr: "14.1%", date: "Oct 12" },
];
const insights = [
  { tag: "Tuesdays 10:00 AM", title: "Optimal Send Schedule Identified", text: "OCI database transaction logs suggest user engagement in the technology sector peaks strongly early mid-morning on business days." },
  { tag: "Concise Executive Style", title: "Recommended Format Update", text: "Template drafts consisting of under 180 words, split with standard line grids, average 4.2% higher CTR than heavily styled multi-column newsletters." },
  { tag: "+23.2% Open Probability", title: "Inquiry Framed Subject Lines", text: "Formulating the subject line with a personalized reference or OCI capacity alert results in dramatically higher priority triage by recipients." },
  { tag: "Underutilized Channel", title: "Microservice Status Alerts", text: "Triggering automatic status digests to accounts with high active deployments is modeled to yield a 15% improvement in long-term account health." },
];

function analyticsPage() {
  const metricCards = metrics.map(m => `
    <div class="card metric">
      <div class="lbl">${m.label}</div>
      <div class="val">${m.value}</div>
      <div class="delta ${m.up ? "up" : "down"}">${m.up ? "▲" : "▼"} ${m.delta}</div>
      <svg class="spark" viewBox="0 0 80 24" preserveAspectRatio="none"><polyline points="0,20 12,16 24,18 36,10 48,12 60,6 72,8 80,2" fill="none" stroke="#E3322B" stroke-width="2"/></svg>
    </div>`).join("");

  // build chart polylines
  const maxV = Math.max(...chartData.map(d => d[1]));
  const W = 700, H = 200, pad = 30;
  const pts = (idx) => chartData.map((d, i) => {
    const x = pad + (i * (W - pad * 2)) / (chartData.length - 1);
    const y = H - pad - (d[idx] / maxV) * (H - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  const xLabels = chartData.map((d, i) => {
    const x = pad + (i * (W - pad * 2)) / (chartData.length - 1);
    return `<text x="${x}" y="${H - 8}" font-size="10" fill="#9ca3af" text-anchor="middle">${d[0]}</text>`;
  }).join("");

  const topBars = topTemplates.map(t => `
    <div class="field">
      <div style="display:flex;justify-content:space-between;font-size:0.875rem;margin-bottom:0.375rem;"><span style="font-weight:500">${t.name}</span><span style="color:var(--muted)">${t.pct}% Open</span></div>
      <div class="bar"><div style="width:${t.pct}%;background:#E3322B;"></div></div>
    </div>`).join("");

  const rows = campaigns.map(c => `
    <tr>
      <td style="font-weight:500">${c.name}</td>
      <td><span class="status-pill ${c.status === "Sent" ? "status-sent" : "status-draft"}">${c.status}</span></td>
      <td>${c.open}</td><td>${c.ctr}</td><td style="color:var(--muted)">${c.date}</td>
    </tr>`).join("");

  const insightCards = insights.map(i => `
    <div class="card insight">
      <div class="head"><span class="icon">✦</span><span class="tag">${i.tag}</span></div>
      <h3>${i.title}</h3>
      <p>${i.text}</p>
    </div>`).join("");

  return `
    <div class="page">
      <div class="container">
        <div class="page-header" style="display:flex;flex-direction:column;gap:1rem;">
          <div>
            <h1>Performance Analytics</h1>
            <p>Real-time delivery statistics, open triggers, and key engagement metrics.</p>
          </div>
          <select style="align-self:flex-start;border:1px solid var(--border-2);background:#fff;border-radius:0.5rem;padding:0.625rem 2rem 0.625rem 1rem;font-size:0.875rem;font-family:inherit;">
            <option>Last 30 Days (Oct 1 - Oct 31)</option><option>Last 7 Days</option><option>Last 90 Days</option>
          </select>
        </div>
        <div class="metric-grid">${metricCards}</div>
        <div class="card chart-card">
          <h2>Delivery &amp; Engagement Over Time</h2>
          <div class="chart-legend">
            <span><span class="legend-dot" style="background:#FF8A3D;"></span>Sends</span>
            <span><span class="legend-dot" style="background:#E3322B;"></span>Opens</span>
            <span><span class="legend-dot" style="background:#10B981;"></span>Clicks</span>
          </div>
          <svg class="chart" viewBox="0 0 ${W} ${H}">
            <g stroke="#f1f2f4" stroke-dasharray="3 3">${Array.from({length:5}, (_,i) => `<line x1="${pad}" x2="${W-pad}" y1="${pad + i*((H-pad*2)/4)}" y2="${pad + i*((H-pad*2)/4)}"/>`).join("")}</g>
            ${xLabels}
            <polyline points="${pts(1)}" fill="none" stroke="#FF8A3D" stroke-width="2.5"/>
            <polyline points="${pts(2)}" fill="none" stroke="#E3322B" stroke-width="2.5"/>
            <polyline points="${pts(3)}" fill="none" stroke="#10B981" stroke-width="2.5"/>
          </svg>
        </div>
        <div class="two-col">
          <div class="card sidebar-block">
            <h3>Top Performing Templates</h3>
            ${topBars}
          </div>
          <div class="card sidebar-block" style="overflow-x:auto;">
            <h3>Recent Campaigns</h3>
            <table><thead><tr><th>Campaign Name</th><th>Status</th><th>Open Rate</th><th>CTR</th><th>Dispatched</th></tr></thead><tbody>${rows}</tbody></table>
          </div>
        </div>
        <div class="insights-head"><span>✦</span><h2>Autonomous AI Strategic Insights</h2></div>
        <div class="insights-grid">${insightCards}</div>
      </div>
    </div>`;
}

function apiDocsPage() {
  return `
    <div class="page">
      <div class="container" style="max-width:42rem;text-align:center;padding-top:4rem;">
        <div style="width:3.5rem;height:3.5rem;border-radius:1rem;background:#fff;border:1px solid var(--border);display:grid;place-items:center;margin:0 auto;">⌘</div>
        <h1 style="margin-top:1.25rem;font-size:1.875rem;font-weight:700;">API Documentation</h1>
        <p style="margin-top:0.75rem;font-size:0.875rem;color:var(--muted);max-width:36rem;margin-left:auto;margin-right:auto;">
          Programmatic access to the Oracle AI Email Generator — generate drafts, manage campaigns,
          and pull analytics from your OCI workloads. Full reference coming soon.
        </p>
        <a href="#/" style="display:inline-flex;align-items:center;gap:0.375rem;margin-top:1.5rem;font-size:0.875rem;font-weight:600;color:var(--accent);">← Back to Home</a>
      </div>
    </div>`;
}

// ----- templates page interactivity -----
const filters = ["All", "Marketing", "Newsletter", "Welcome", "Promo", "Product Update", "Onboarding"];
let activeFilter = "All";
let searchQuery = "";

function badgeClass(b) {
  const map = {
    MARKETING: "background:#FFCFC6;color:#9B3D33;",
    NEWSLETTER: "background:#D6E8FF;color:#1E4E8C;",
    WELCOME: "background:#D1FAE5;color:#065F46;",
    PROMO: "background:#FFCFC6;color:#9B3D33;",
    "PRODUCT UPDATE": "background:#D6E8FF;color:#1E4E8C;",
    ONBOARDING: "background:#D1FAE5;color:#065F46;",
  };
  return map[b] || "";
}

function renderTemplates() {
  const grid = document.getElementById("tplGrid");
  if (!grid) return;
  const filtered = templates.filter(t =>
    (activeFilter === "All" || t.badge.toLowerCase().includes(activeFilter.toLowerCase())) &&
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  grid.innerHTML = filtered.length ? filtered.map(t => `
    <a href="#/editor" class="template-card">
      <div class="thumb"><img src="${t.img}" alt="${t.title}" /></div>
      <div class="body">
        <span class="badge" style="${badgeClass(t.badge)}">${t.badge}</span>
        <h3>${t.title}</h3>
        <p>${t.desc}</p>
        <span style="display:inline-flex;align-items:center;gap:0.25rem;margin-top:0.75rem;font-size:0.875rem;font-weight:600;color:#e76f51;">Use template →</span>
      </div>
    </a>`).join("") : `<p class="empty">No templates match your search.</p>`;
}

function initTemplatesPage() {
  const filtersEl = document.getElementById("tplFilters");
  filtersEl.innerHTML = filters.map(f =>
    `<button class="filter-pill ${f === activeFilter ? "active" : ""}" data-filter="${f}">${f}</button>`
  ).join("");
  filtersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-pill");
    if (!btn) return;
    activeFilter = btn.dataset.filter;
    filtersEl.querySelectorAll(".filter-pill").forEach(b => b.classList.toggle("active", b.dataset.filter === activeFilter));
    renderTemplates();
  });
  document.getElementById("tplSearch").addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderTemplates();
  });
  renderTemplates();
}

// ----- router -----
function render() {
  const path = location.hash || "#/";
  const page = routes[path] || homePage;
  document.getElementById("app").innerHTML = page();
  if (path === "#/templates") initTemplatesPage();
  renderHeader();
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);

// mobile menu toggle
document.getElementById("menuToggle").addEventListener("click", () => {
  const m = document.getElementById("mobileMenu");
  m.hidden = !m.hidden;
});
document.addEventListener("click", (e) => {
  const m = document.getElementById("mobileMenu");
  if (!m.hidden && !e.target.closest("#mobileMenu") && !e.target.closest("#menuToggle")) m.hidden = true;
});

render();