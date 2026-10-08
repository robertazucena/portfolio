/* =========================================================
   MUFG Asia Pacific — Shared behaviour
   Mobile nav toggle, slider-dot state, and light entrance
   animation. Kept intentionally small: this is a static
   marketing/dashboard front end, not an app.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile navigation toggle ------------------------- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---- Generic dot-indicator sliders --------------------- */
  document.querySelectorAll('[data-slider]').forEach((slider) => {
    const dots = slider.querySelectorAll('.dots button');
    const prevBtn = slider.querySelector('[data-slider-prev]');
    const nextBtn = slider.querySelector('[data-slider-next]');

    if (!dots.length) return;

    let active = 0;

    const setActive = (index) => {
      active = (index + dots.length) % dots.length;
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
    };

    dots.forEach((dot, i) => dot.addEventListener('click', () => setActive(i)));
    if (prevBtn) prevBtn.addEventListener('click', () => setActive(active - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => setActive(active + 1));
  });

  /* ---- Header shadow after scroll ------------------------ */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
});
