#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generates the 4 Steady pages from shared partials."""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

ICONS = {
"home": '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
"heart": '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
"moon": '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
"settings": '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
"search": '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
"arrow-right": '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
"sparkles": '<path d="M12 2l1.7 4.8L19 8.4l-5.3 1.6L12 15l-1.7-5-5.3-1.6L10 6.8 12 2z"/><path d="M19 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
"utensils": '<path d="M4 2v7a2 2 0 0 0 2 2h1v11"/><path d="M7 2v9"/><path d="M4 2v9"/><path d="M17 2c-1.66 0-3 2.91-3 6.5S15.34 15 17 15s3-2.91 3-6.5S18.66 2 17 2z"/><path d="M17 15v7"/>',
"footprints": '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
"droplet": '<path d="M12 2.7s6 6.06 6 10.44a6 6 0 0 1-12 0C6 8.76 12 2.7 12 2.7z"/>',
"sliders": '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
"mail": '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>',
"twitter": '<path d="M22 4.6c-.8.35-1.6.6-2.5.7.9-.55 1.6-1.4 1.9-2.4-.85.5-1.8.85-2.8 1.05A4.3 4.3 0 0 0 11.5 7.9 12.3 12.3 0 0 1 2.6 3.3a4.3 4.3 0 0 0 1.33 5.75c-.7 0-1.36-.2-1.94-.53v.05A4.3 4.3 0 0 0 5.4 12.6a4.3 4.3 0 0 1-1.94.07 4.3 4.3 0 0 0 4.02 3A8.63 8.63 0 0 1 2 17.5a12.2 12.2 0 0 0 6.62 1.94c7.94 0 12.29-6.58 12.29-12.29 0-.19 0-.37-.02-.56A8.8 8.8 0 0 0 22 4.6z"/>',
"instagram": '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
"linkedin": '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5.001 2.5 2.5 0 0 1 0-5.002zM3 9h4v12H3zM10 9h3.6v1.7h.05c.5-.9 1.7-1.85 3.5-1.85 3.75 0 4.45 2.4 4.45 5.5V21h-4v-5.4c0-1.3 0-3-1.85-3-1.85 0-2.15 1.4-2.15 2.9V21h-4z"/>',
"chevron-left": '<polyline points="15 18 9 12 15 6"/>',
"check": '<polyline points="20 6 9 17 4 12"/>',
"wind": '<path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/><path d="M17.7 8a2.5 2.5 0 1 1 1.8 4.3H2"/>',
"edit": '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
"activity": '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
"plus": '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
"minus": '<line x1="5" y1="12" x2="19" y2="12"/>',
"users": '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
"thumbs-up": '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>',
"book-open": '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
"check-circle": '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
"menu": '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
"clock": '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
}

def icon(name, extra_class=""):
    body = ICONS[name]
    cls = f' class="{extra_class}"' if extra_class else ""
    return f'<svg{cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{body}</svg>'

NAV_ITEMS = [
    ("Today", "index.html", "home"),
    ("Health", "health.html", "utensils"),
    ("Sleep", "sleep.html", "moon"),
    ("Circle", "circle.html", "settings"),
]

def top_nav(active_href):
    items = []
    for label, href, ic in NAV_ITEMS:
        active = " active" if href == active_href else ""
        items.append(
            f'<a class="nav-item{active}" href="{href}" data-transition="page">{icon(ic)}<span>{label}</span></a>'
        )
    items_html = "\n          ".join(items)
    return f"""  <header class="top-nav">
    <a class="nav-left" href="index.html" data-transition="page" aria-label="Steady home">
      <span class="logo-mark">{icon("plus")}</span>
      <span class="brand">Steady</span>
    </a>
    <nav class="nav-center" aria-label="Primary">
      <div class="mobile-account-row">
        <div class="avatar-circle">SJ</div>
        <div class="user-info">
          <p class="u-name">Sarah Jenkins</p>
          <p class="u-email">Sarah@steady.co</p>
        </div>
      </div>
      <div class="search-pill mobile-search">
        {icon("search")}
        <span>Search health logs</span>
      </div>
          {items_html}
    </nav>
    <div class="nav-right">
      <div class="search-pill">
        {icon("search")}
        <span>Search health logs</span>
      </div>
      <div class="user-brief">
        <div class="avatar-circle">SJ</div>
        <div class="user-info">
          <p class="u-name">Sarah Jenkins</p>
          <p class="u-email">Sarah@steady.co</p>
        </div>
      </div>
      <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
        <span class="bar"></span><span class="bar"></span><span class="bar"></span>
      </button>
    </div>
  </header>"""

def ai_widget():
    """Global, fixed-position FAB + AI FAQ chat panel — shared across every
    page (added once in write_page, outside .app-shell so page-transition
    transforms on the shell never affect its fixed position)."""
    return f"""  <div class="ai-widget">
    <div class="ai-panel" id="aiPanel" role="dialog" aria-label="Steady Companion chat" aria-hidden="true">
      <div class="ai-panel-header">
        <span class="avatar">{icon("sparkles")}</span>
        <div class="ai-panel-title">
          <p class="name">Steady Companion</p>
          <p class="status"><i></i>Usually replies instantly</p>
        </div>
        <button class="ai-close" id="aiCloseBtn" aria-label="Close chat">{icon("plus")}</button>
      </div>
      <div class="ai-messages" id="aiMessages">
        <div class="ai-msg bot">Hi Sarah — I'm your Steady Companion. Ask me anything about your health data, or tap a question below to get started.</div>
      </div>
      <div class="ai-suggest" id="aiSuggest"></div>
      <form class="ai-input-row" id="aiForm">
        <input id="aiInput" type="text" placeholder="Ask a question…" autocomplete="off" />
        <button type="submit" aria-label="Send">{icon("arrow-right")}</button>
      </form>
    </div>
    <button class="fab-ai" id="aiFabBtn" aria-label="Open Steady Companion" aria-expanded="false">
      {icon("sparkles")}
    </button>
  </div>"""

def footer():
    return f"""  <footer class="site-footer">
    <div class="footer-bg-shape" style="width:260px;height:260px;left:-130px;top:-114px;border-radius:28%;transform:rotate(-12deg);"></div>
    <div class="footer-bg-shape" style="width:280px;height:280px;right:-126px;top:-80px;border-radius:28%;transform:rotate(18deg);"></div>
    <div class="footer-bg-shape" style="width:220px;height:220px;left:calc(50% - 310px);bottom:-118px;border-radius:28%;transform:rotate(-8deg);"></div>
    <div class="footer-bg-shape" style="width:240px;height:240px;left:calc(50% + 100px);bottom:-136px;border-radius:28%;transform:rotate(-10deg);"></div>
    <div class="footer-bg-shape" style="width:200px;height:200px;right:-174px;bottom:-142px;border-radius:28%;transform:rotate(14deg);"></div>

    <div class="footer-grid">
      <div class="footer-col footer-col-brand">
        <div class="brand-row">
          <span class="logo-mark">{icon("plus")}</span>
          <span class="brand">Steady</span>
        </div>
        <p>Your space for mindful health, steady habits, and a clearer mind.</p>
        <div class="social-row">
          <a class="social-icon" href="#" aria-label="Twitter" data-toast="Opens Twitter (demo)">{icon("twitter")}</a>
          <a class="social-icon" href="#" aria-label="Instagram" data-toast="Opens Instagram (demo)">{icon("instagram")}</a>
          <a class="social-icon" href="#" aria-label="LinkedIn" data-toast="Opens LinkedIn (demo)">{icon("linkedin")}</a>
        </div>
      </div>

      <div class="footer-col">
        <span class="head">Explore</span>
        <a href="index.html" data-transition="page">Today</a>
        <a href="health.html" data-transition="page">Health</a>
        <a href="sleep.html" data-transition="page">Sleep</a>
        <a href="circle.html" data-transition="page">Circle</a>
      </div>

      <div class="footer-col">
        <span class="head">Company</span>
        <a href="#" data-toast="About Steady — coming soon.">About</a>
        <a href="#" data-toast="Privacy policy — coming soon.">Privacy</a>
        <a href="#" data-toast="Terms of service — coming soon.">Terms</a>
      </div>

      <div class="footer-col footer-col-newsletter">
        <span class="head">Stay in the loop</span>
        <p class="newsletter-copy">Gentle reminders and wellness notes, at most twice a month.</p>
        <form class="newsletter" onsubmit="event.preventDefault(); steadyToast('Subscribed! Welcome to Steady.');">
          <label class="newsletter-input">
            {icon("mail")}
            <input type="email" placeholder="Email address" required />
          </label>
          <button class="newsletter-cta" type="submit">Subscribe {icon("arrow-right")}</button>
        </form>
      </div>
    </div>


    <div class="footer-bottom">
      <p>© 2026 Steady. All rights reserved.</p>
      <p>Built for mindful health.</p>
    </div>
  </footer>"""

def preloader():
    return f"""  <div id="preloader" aria-hidden="true">
    <div class="pre-stage">
      <div class="pre-word" aria-label="Steady">
        <span style="animation-delay:.05s">S</span><span style="animation-delay:.10s">t</span><span style="animation-delay:.15s">e</span><span style="animation-delay:.20s">a</span><span style="animation-delay:.25s">d</span><span style="animation-delay:.30s">y</span>
      </div>
      <div class="pre-ekg-wrap">
        <svg class="pre-ekg" viewBox="0 0 220 64" aria-hidden="true">
          <path d="M0 32 H60 L72 8 L86 56 L98 32 H124 L132 20 L140 44 L148 32 H220" />
        </svg>
        <div class="pre-mark">
          <div class="pre-ring"></div>
          {icon("plus")}
        </div>
      </div>
      <p class="pre-caption">Translating into health</p>
    </div>
  </div>"""

# Every page links to the centralized css/styles.css and js/script.js
# files rather than inlining them. Keep the whole steady-web folder
# (html files + css/ + js/) together — relative paths depend on that
# folder structure staying intact, whether opened locally or hosted.
PAGE_HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>{title} · Steady</title>
<meta name="description" content="{desc}" />
<link rel="icon" href="data:image/svg+xml,{favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/styles.css" />
</head>
<body>
{preloader}
<div class="app-shell">
{nav}
"""

PAGE_TAIL = """
{footer}
</div>
{ai_widget}
<script src="js/script.js"></script>
</body>
</html>
"""

FAVICON = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Crect width='36' height='36' rx='10' fill='%23ea580c'/%3E%3Cpath d='M18 9v18M9 18h18' stroke='white' stroke-width='3.4' stroke-linecap='round'/%3E%3C/svg%3E"

def write_page(filename, title, desc, active_href, body_html):
    html = PAGE_HEAD.format(
        title=title, desc=desc, favicon=FAVICON,
        preloader=preloader(), nav=top_nav(active_href),
    )
    html += body_html
    html += PAGE_TAIL.format(footer=footer(), ai_widget=ai_widget())
    path = os.path.join(ROOT, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", path, len(html), "bytes")

# Expose to other build modules
if __name__ == "__main__":
    print("partials ready")
