/* Monarch Labs — Studio page: blocks rise in as they enter the scroller, the right edge counter follows the
   section in view (same ticks as the hero's service counter), and the home-base clock shows the time in both studios (Manila and Singapore are both UTC+8). */
(() => {
  "use strict";
  const root = document.documentElement, box = document.querySelector(".studio");
  if (!box) return;
  root.classList.add("js");

  /* reveal: siblings that enter together are staggered by 90ms */
  const els = [...box.querySelectorAll(".rv")];
  const reveal = () => {
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      let n = 0;
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.style.setProperty("--d", (n++ * 0.09).toFixed(2) + "s");
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { root: box, rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    els.forEach(el => io.observe(el));
  } else els.forEach(el => el.classList.add("in"));
  };
  /* after the preloader: start as its wipe crosses the page (ml:ready + .5s); a fallback reveals anyway */
  let started = false;
  const go = () => { if (!started) { started = true; reveal(); } };
  if (window.MLReady || !document.getElementById("pre")) go();
  else { document.addEventListener("ml:ready", () => setTimeout(go, 500), { once: true }); setTimeout(go, 6000); }

  /* counter: the section whose top has passed the scroller's middle */
  const secs = [...box.querySelectorAll("[data-sec]")], ticks = [...document.querySelectorAll(".ticks i")], num = document.querySelector(".count b");
  let cur = -1, raf = 0;
  const mark = () => {
    raf = 0;
    const mid = box.getBoundingClientRect().top + box.clientHeight * 0.5;
    let k = 0;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= mid) k = i; });
    if (box.scrollTop + box.clientHeight >= box.scrollHeight - 4) k = secs.length - 1;
    k = Math.min(k, ticks.length - 1);
    if (k === cur) return;
    cur = k;
    ticks.forEach((t, i) => t.classList.toggle("on", i === k));
    if (num) num.textContent = String(k + 1).padStart(2, "0");
  };
  box.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(mark); }, { passive: true });
  mark();

  /* studio clocks (#pht and any [data-time]): Manila and Singapore share UTC+8 */
  const clocks = [...document.querySelectorAll("#pht,[data-time]")];
  if (clocks.length) {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit" });
    const tick = () => { const v = fmt.format(new Date()); clocks.forEach(c => { c.textContent = v; }); };
    tick(); setInterval(tick, 15000);
  }

  box.focus({ preventScroll: true });
})();
