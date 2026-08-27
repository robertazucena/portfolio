// Courtly — shared interactions, preloader, and page transitions

const __pageStart = performance.now();
const __PRELOADER_MIN_MS = 900;

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
  setTimeout(() => { window.location.href = href; }, 260);
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
});
