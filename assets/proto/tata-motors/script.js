// Tata Motors AI Workspace — shared behaviour
// App-like navigation model:
//   - True first load (typed URL / refresh / new tab): show the full brand
//     splash (#preloader) briefly, then reveal the page.
//   - Any in-app click on a link: DON'T show the full splash again — that
//     feels like the app "reloading". Instead, kick a slim top progress
//     bar (like a native app) and let the destination page complete it.
// A sessionStorage flag carries that intent across the real page navigation
// (this is a static multi-page site, so each click is a real page load).
//
// Reliability: the full splash also has a pure-CSS animation safety net
// (see style.css) that force-hides it after 1.6s even if this script never
// runs at all, so the app can never look permanently "stuck".

(function () {
  var FLAG = 'smNavInProgress';

  function byId(id) { return document.getElementById(id); }

  function hidePreloader() {
    var pre = byId('preloader');
    if (!pre || pre.classList.contains('hide')) return;
    pre.classList.add('hide');
  }

  function startProgressBar() {
    var bar = byId('page-progress');
    if (!bar) return;
    bar.style.width = '0%';
    bar.classList.add('active');
    requestAnimationFrame(function () {
      bar.style.width = '55%';
    });
  }

  function completeProgressBar() {
    var bar = byId('page-progress');
    if (!bar) return;
    bar.classList.add('active');
    bar.style.width = '92%';
    setTimeout(function () {
      bar.style.width = '100%';
      setTimeout(function () {
        bar.classList.remove('active');
        setTimeout(function () { bar.style.width = '0%'; }, 200);
      }, 200);
    }, 100);
  }

  // Exposed so custom in-page flows (e.g. the upload wizard's "Proceed"
  // button) can trigger the same app-like transition as a normal link.
  window.smGoTo = function (href) {
    try { sessionStorage.setItem(FLAG, '1'); } catch (e) {}
    startProgressBar();
    setTimeout(function () {
      window.location.href = href;
    }, 200);
  };

  // Mobile sidebar drawer: hamburger opens it, backdrop/X/nav-link closes it.
  function initSidebarDrawer() {
    var toggle = byId('sidebarToggle');
    var sidebar = byId('sidebar');
    var closeBtn = byId('sidebarClose');
    var backdrop = byId('sidebarBackdrop');
    if (!sidebar) return;

    function openDrawer() {
      sidebar.classList.add('mobile-open');
      if (backdrop) backdrop.classList.add('show');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('no-scroll');
    }
    function closeDrawer() {
      sidebar.classList.remove('mobile-open');
      if (backdrop) backdrop.classList.remove('show');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    }

    if (toggle) toggle.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
    // Tapping any nav link inside the drawer should close it too.
    sidebar.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeDrawer);
    });
    // Collapse the drawer if the viewport is resized back up to desktop.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) closeDrawer();
    });
  }

  function init() {
    var cameFromInAppNav = false;
    try {
      cameFromInAppNav = sessionStorage.getItem(FLAG) === '1';
      sessionStorage.removeItem(FLAG);
    } catch (e) {}

    if (cameFromInAppNav) {
      // Already hidden pre-paint by the inline anti-flash snippet; make sure.
      hidePreloader();
      completeProgressBar();
    } else {
      setTimeout(hidePreloader, 350);
      setTimeout(hidePreloader, 2000); // hard safety net
    }

    initSidebarDrawer();

    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href === '#' || href.startsWith('#') || href.startsWith('http') || link.target === '_blank') return;

      link.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let new-tab clicks through
        e.preventDefault();
        window.smGoTo(href);
      });
    });

    var current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.bottom-nav a, .sidebar-tab').forEach(function (a) {
      if (a.getAttribute('href') === current) a.classList.add('active');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


