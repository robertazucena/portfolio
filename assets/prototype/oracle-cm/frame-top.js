/* Portfolio preview helper: when this page is shown inside a frame, always start at the top.
   It keeps the page at the top until the visitor scrolls, taps or types themselves.
   Opened on its own (not in a frame), it does nothing. */
(function () {
  var framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
  if (!framed) return;
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  var user = false, done = false;
  ["wheel", "touchstart", "pointerdown", "keydown"].forEach(function (t) {
    window.addEventListener(t, function () { user = true; }, { passive: true, capture: true });
  });
  function toTop() {
    if (user) return;
    if (window.scrollX || window.scrollY) window.scrollTo(0, 0);
    var se = document.scrollingElement; if (se && se.scrollTop) se.scrollTop = 0;
  }
  toTop();
  document.addEventListener("DOMContentLoaded", toTop);
  window.addEventListener("load", function () { toTop(); [120, 400, 900, 1600, 2600, 4000].forEach(function (t) { setTimeout(toTop, t); }); setTimeout(function () { done = true; }, 4200); });
  window.addEventListener("pageshow", toTop);
  window.addEventListener("hashchange", function () { if (!user) setTimeout(toTop, 0); });
  /* programmatic scrolls (autofocus, anchors, scroll restoration) are undone until the visitor takes over */
  window.addEventListener("scroll", function () { if (!user && !done) toTop(); }, { passive: true });
})();
