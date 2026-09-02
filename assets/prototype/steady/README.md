# Steady — web app

## Folder structure

```
steady-web/
├── index.html          Today (dashboard)
├── health.html          Health · Nourish Log
├── sleep.html            Sleep · Morning routine
├── circle.html          Circle · Wellness network
├── css/
│   └── styles.css        ← single centralized stylesheet, used by every page
├── js/
│   └── script.js          ← single centralized script, used by every page
├── build.py                shared header / footer / preloader / AI-widget templates
├── build_dashboard.py     page-specific content for index.html
├── build_health.py         page-specific content for health.html
├── build_sleep.py           page-specific content for sleep.html
└── build_circle.py          page-specific content for circle.html
```

Keep this folder structure intact (don't rename `css/` or `js/`, and keep the
4 `.html` files next to those folders) — the pages reference
`css/styles.css` and `js/script.js` by relative path.

## Everything is templated

Nothing in the header, footer, preloader, or AI chat widget is duplicated
by hand across the 4 pages. `build.py` defines each of those once:

- `top_nav(active_href)` — logo, nav links, search, account, mobile menu
- `footer()` — the 4-column footer grid, socials, newsletter
- `preloader()` — the "translating into health" intro animation
- `ai_widget()` — the fixed bottom-right FAB + FAQ chat panel
- `ICONS` / `icon(name)` — every inline icon used site-wide

Each `build_<page>.py` file only defines that page's own main content and
calls `write_page(filename, title, desc, active_href, body_html)`, which
wraps it with the shared head, nav, footer, and script tag.

## Making changes

**Change the header, footer, preloader, or chat widget everywhere at once**
→ edit the matching function in `build.py`, then re-run all four:

```bash
python3 build_dashboard.py
python3 build_health.py
python3 build_sleep.py
python3 build_circle.py
```

**Change one page's own content** (e.g. the dashboard's steps/macros)
→ edit that page's `build_<page>.py`, then re-run just that script.

**Change shared visual styling** (colors, spacing, responsive rules,
animations) → edit `css/styles.css` directly. No rebuild needed — every
page picks it up immediately since it's linked, not inlined.

**Change shared behavior** (nav toggle, page transitions, chat logic,
preloader timing) → edit `js/script.js` directly, same as above.

## Running it

Because the pages now load `css/styles.css` and `js/script.js` as separate
files, they need to be served from a real origin (not opened as a bare
`file://` page in some browsers, and not previewed individually without
their sibling `css/`/`js/` folders). Easiest options:

- Open the whole `steady-web` folder locally and run a tiny static server,
  e.g. `python3 -m http.server` from inside it, then visit
  `http://localhost:8000/index.html`.
- Or upload the whole folder (keeping structure) to any static host.
