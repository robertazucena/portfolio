/* Aztec core: the ONE preloader, shared by the website and the platform.
   A big 000-100 counter fills with sky from the bottom while the logo settles on top. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // inline the logo where it animates: Z appears, flips, then the A and "tec" slide out from behind it
  const sym = document.getElementById('i-logo');
  if (sym) document.querySelectorAll('.loader__logo').forEach(svg => {
    const u = svg.querySelector('use'); if (!u) return;
    svg.classList.add('lgo'); svg.style.overflow = 'visible';
    [...sym.children].forEach(c => svg.insertBefore(c.cloneNode(true), u)); u.remove();
  });
  const loader = document.querySelector('.loader');
  const mark = loader && loader.querySelector('.loader__mark');
  const nums = loader ? [...loader.querySelectorAll('[data-loader-count]')] : [];
  const set = p => { const t = String(Math.round(p * 100)).padStart(3, '0'); nums.forEach(n => { n.textContent = t; }); mark && mark.style.setProperty('--p', (p * 100).toFixed(1)); };
  const run = () => {
    if (!loader) return;
    loader.classList.remove('is-done', 'is-run'); void loader.offsetWidth; loader.classList.add('is-run');
    if (reduced) { set(1); return; }
    set(0);
    const t0 = performance.now();
    const tick = t => { const p = Math.max(0, Math.min(1, (t - t0 - 80) / 900)); set(1 - Math.pow(1 - p, 2)); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  window.AztecLoader = { run, LOAD_MS: reduced ? 0 : 1400, SWAP_MS: reduced ? 0 : 1050 };
})();
