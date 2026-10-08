// Courtly — shared interactions, preloader, and page transitions

const __pageStart = performance.now();
let __seen = false;
try { __seen = sessionStorage.getItem('courtly:seen') === '1'; sessionStorage.setItem('courtly:seen', '1'); } catch (e) {}
const __PRELOADER_MIN_MS = __seen ? 0 : 800;
if (__seen) { const p = document.getElementById('preloader'); if (p) p.classList.add('quick'); }
const __buzz = (ms = 6) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

function __hidePreloader() {
  const el = document.getElementById('preloader');
  const app = document.querySelector('.app');
  const elapsed = performance.now() - __pageStart;
  const wait = Math.max(0, __PRELOADER_MIN_MS - elapsed);
  setTimeout(() => {
    if (el) el.classList.add('hide');
    if (app) app.classList.add('page-loaded');
    setTimeout(() => { if (el && el.parentNode) el.parentNode.removeChild(el); }, 550);
  }, wait);
}
// Script runs at end of body, so DOM is already parsed — reveal right away.
__hidePreloader();

// ---- Page-to-page transition (intercepts internal nav clicks) ----
function __isInternalNavLink(a) {
  if (!a) return false;
  if (a.target === '_blank') return false;
  if (a.hasAttribute('download')) return false;
  const href = a.getAttribute('href');
  if (!href) return false;
  if (href.startsWith('#')) return false;
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  if (/^https?:\/\//i.test(href) && !href.startsWith(window.location.origin)) return false;
  return href.endsWith('.html');
}

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a');
  if (!__isInternalNavLink(a)) return;
  const href = a.getAttribute('href');
  e.preventDefault();
  document.body.classList.add('page-leaving');
  setTimeout(() => { window.location.href = href; }, 220);
});

// Restore visibility if user navigates back via bfcache (page not reloaded)
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    document.body.classList.remove('page-leaving');
    const app = document.querySelector('.app');
    const el = document.getElementById('preloader');
    if (app) app.classList.add('page-loaded');
    if (el) el.remove();
    const menuToggle = document.getElementById('menu-toggle');
    menuToggle && menuToggle.classList.remove('open');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const menuToggle = document.getElementById('menu-toggle');
  const closeBtns = document.querySelectorAll('[data-menu-close]');

  function openSidebar() {
    sidebar && sidebar.classList.add('open');
    overlay && overlay.classList.add('open');
    menuToggle && menuToggle.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    sidebar && sidebar.classList.remove('open');
    overlay && overlay.classList.remove('open');
    menuToggle && menuToggle.classList.remove('open');
    document.body.style.overflow = '';
  }
  function toggleSidebar() {
    if (sidebar && sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  // Single button toggles open/closed and morphs into an X via CSS —
  // it lives outside the sidebar/overlay stack (fixed, top-most z-index)
  // so it's never covered by the dim overlay.
  menuToggle && menuToggle.addEventListener('click', toggleSidebar);
  closeBtns.forEach(btn => btn.addEventListener('click', closeSidebar));
  overlay && overlay.addEventListener('click', closeSidebar);

  // Sport pill toggle (dashboard)
  document.querySelectorAll('.sport-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.sport-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  // Filter pill toggle (community)
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  // Time slot selection (court details)
  document.querySelectorAll('.time-slot:not(.booked)').forEach(slot => {
    slot.addEventListener('click', () => {
      document.querySelectorAll('.time-slot').forEach(s => {
        if (!s.classList.contains('booked')) {
          s.classList.remove('selected');
          s.querySelector('.s').textContent = 'Available';
        }
      });
      slot.classList.add('selected');
      slot.querySelector('.s').textContent = 'Selected';
      const timeText = slot.querySelector('.t').textContent;
      const timeValueEl = document.getElementById('selected-time-value');
      if (timeValueEl) timeValueEl.textContent = timeText;
    });
  });

  // "Book Now" button -> go to booking flow (respects page transition)
  const bookBtn = document.getElementById('book-now-btn');
  if (bookBtn) {
    bookBtn.addEventListener('click', () => {
      document.body.classList.add('page-leaving');
      setTimeout(() => { window.location.href = 'booking.html'; }, 260);
    });
  }

  // Toggle switches (profile page)
  document.querySelectorAll('.toggle-switch').forEach(t => {
    t.addEventListener('click', () => t.classList.toggle('on'));
  });

  // Sport selection pills (edit profile — multi-select)
  document.querySelectorAll('.sport-select-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('selected');
    });
  });

  // Avatar change photo (edit profile)
  const avatarCameraBtn = document.getElementById('avatar-camera-btn');
  const changePhotoBtn = document.getElementById('change-photo-btn');
  const avatarFileInput = document.getElementById('avatar-file-input');
  const avatarPreview = document.getElementById('avatar-preview');
  function triggerAvatarPicker() { avatarFileInput && avatarFileInput.click(); }
  avatarCameraBtn && avatarCameraBtn.addEventListener('click', triggerAvatarPicker);
  changePhotoBtn && changePhotoBtn.addEventListener('click', triggerAvatarPicker);
  avatarFileInput && avatarFileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { if (avatarPreview) avatarPreview.src = ev.target.result; };
    reader.readAsDataURL(file);
  });

  // Bio character counter (edit profile)
  const bioField = document.getElementById('bio');
  const charCount = document.querySelector('.char-count');
  if (bioField && charCount) {
    const max = bioField.getAttribute('maxlength') || 160;
    const updateCount = () => { charCount.textContent = `${bioField.value.length} / ${max}`; };
    updateCount();
    bioField.addEventListener('input', updateCount);
  }

  // Edit Profile form submit -> show toast, then return to profile
  const editForm = document.getElementById('edit-profile-form');
  const saveToast = document.getElementById('save-toast');
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (saveToast) saveToast.classList.add('show');
      setTimeout(() => {
        document.body.classList.add('page-leaving');
        setTimeout(() => { window.location.href = 'profile.html'; }, 260);
      }, 900);
    });
  }

  // Greeting follows the clock
  const greet = document.querySelector('.greeting p:last-child');
  if (greet) {
    const h = new Date().getHours();
    const word = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    greet.textContent = greet.textContent.replace(/^Good (morning|afternoon|evening)/, word);
  }

  // Nearby courts: sport filter + pagination (dashboard)
  const grid = document.getElementById('courts-grid');
  if (grid) {
    const PAGE_SIZE = 6;
    const cards = [...grid.querySelectorAll('.court-card')];
    const empty = document.getElementById('courts-empty');
    const pager = document.getElementById('pager');
    const count = document.getElementById('courts-count');
    const section = grid.closest('section');
    let sport = 'all', page = 1;

    function renderCourts(animate) {
      const list = cards.filter(c => sport === 'all' || c.dataset.sports.split(' ').includes(sport));
      const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
      page = Math.min(page, pages);
      const start = (page - 1) * PAGE_SIZE;
      cards.forEach(c => { c.hidden = true; c.classList.remove('enter'); });
      list.slice(start, start + PAGE_SIZE).forEach((c, i) => {
        c.hidden = false;
        if (animate) { c.style.setProperty('--n', i); void c.offsetWidth; c.classList.add('enter'); }
      });
      if (empty) empty.hidden = list.length > 0;
      if (count) count.textContent = list.length ? list.length : '';
      if (!pager) return;
      if (pages < 2) { pager.innerHTML = list.length ? `<p class="pager-info">Showing all ${list.length} ${list.length === 1 ? 'court' : 'courts'}</p>` : ''; return; }
      const from = start + 1, to = Math.min(start + PAGE_SIZE, list.length);
      let h = `<p class="pager-info">Showing ${from}-${to} of ${list.length} courts</p><div class="pager-controls">`;
      h += `<button class="pager-btn" data-page="${page - 1}" aria-label="Previous page" ${page === 1 ? 'disabled' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>`;
      for (let p = 1; p <= pages; p++) h += `<button class="pager-btn num" data-page="${p}" ${p === page ? 'aria-current="page"' : ''} aria-label="Page ${p}">${p}</button>`;
      h += `<button class="pager-btn" data-page="${page + 1}" aria-label="Next page" ${page === pages ? 'disabled' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button></div>`;
      pager.innerHTML = h;
    }

    pager && pager.addEventListener('click', (e) => {
      const b = e.target.closest('[data-page]');
      if (!b || b.disabled) return;
      __buzz();
      page = +b.dataset.page;
      renderCourts(true);
      const top = section.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.5) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.querySelectorAll('.sport-pill[data-sport]').forEach(pill => {
      pill.addEventListener('click', () => {
        __buzz();
        sport = pill.dataset.sport;
        page = 1;
        renderCourts(true);
      });
    });
    renderCourts(false);
  }

  // Confirm & Pay: loading -> success sheet (replaces the old alert)
  const confirmBtn = document.getElementById('confirm-btn');
  const success = document.getElementById('success');
  if (confirmBtn && success) {
    confirmBtn.addEventListener('click', () => {
      if (confirmBtn.classList.contains('loading')) return;
      confirmBtn.classList.add('loading');
      __buzz(10);
      setTimeout(() => {
        confirmBtn.classList.remove('loading');
        success.classList.add('open');
        success.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        __buzz([14, 40, 22]);
        const f = success.querySelector('a'); f && f.focus({ preventScroll: true });
      }, 800);
    });
  }
});

/* Photo fallback: if a photo can't load (offline, blocked host), keep the card clean.
   Large photos turn transparent so the green panel behind them shows; small avatars show initials. */
(function () {
  var CLEAR = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  function initials(alt) {
    var w = (alt || "").trim().split(/\s+/).filter(Boolean);
    return ((w[0] || "")[0] || "") + ((w[1] || "")[0] || "");
  }
  function avatar(alt) {
    var t = initials(alt).toUpperCase();
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#DCFCE7"/>' +
      (t ? '<text x="40" y="49" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="28" font-weight="700" fill="#166534">' + t + '</text>'
         : '<circle cx="40" cy="31" r="13" fill="#86EFAC"/><path d="M14 72c4-16 15-23 26-23s22 7 26 23z" fill="#86EFAC"/>') + '</svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
  function swap(img) {
    if (img.dataset.ph) return; img.dataset.ph = "1";
    var small = (img.getBoundingClientRect().width || img.width || 0) <= 120 || /avatar|user|profile/i.test(img.className + " " + (img.parentNode && img.parentNode.className));
    img.src = small ? avatar(img.alt) : CLEAR;
    if (!small) img.alt = "";
  }
  document.addEventListener("error", function (e) { var t = e.target; if (t && t.tagName === "IMG") swap(t); }, true);
  function sweep() { Array.prototype.forEach.call(document.images, function (img) { if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) swap(img); }); }
  if (document.readyState === "complete") sweep(); else window.addEventListener("load", sweep);
})();
