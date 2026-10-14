/* Portfolio preview helper: when this page is shown inside a frame, always start at the top.
   It keeps the page at the top until the visitor scrolls, taps or types themselves, and stops the
   page from scrolling the portfolio around it (autofocus, scrollIntoView).
   Opened on its own (not in a frame), it does nothing. */
(function () {
  var framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
  if (!framed) return;
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  var user = false, done = false;
  ["wheel", "touchstart", "pointerdown", "keydown"].forEach(function (t) {
    window.addEventListener(t, function () { user = true; }, { passive: true, capture: true });
  });
  /* focusing an input or calling scrollIntoView inside a frame also scrolls the page around it,
     which made the portfolio jump. Until the visitor interacts, focus without scrolling and skip
     scroll-into-view requests. */
  try {
    var nativeFocus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function (opts) {
      if (user) return nativeFocus.call(this, opts);
      var o = {}; if (opts && typeof opts === "object") for (var k in opts) o[k] = opts[k];
      o.preventScroll = true; return nativeFocus.call(this, o);
    };
    var nativeSIV = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function () { if (user) return nativeSIV.apply(this, arguments); };
    if (Element.prototype.scrollIntoViewIfNeeded) {
      var nativeSIVN = Element.prototype.scrollIntoViewIfNeeded;
      Element.prototype.scrollIntoViewIfNeeded = function () { if (user) return nativeSIVN.apply(this, arguments); };
    }
  } catch (e) {}
  function stripAutofocus() { try { var a = document.querySelectorAll("[autofocus]"); for (var i = 0; i < a.length; i++) a[i].removeAttribute("autofocus"); } catch (e) {} }
  document.addEventListener("DOMContentLoaded", stripAutofocus);
  try { new MutationObserver(function () { if (!user) stripAutofocus(); }).observe(document.documentElement, { childList: true, subtree: true }); } catch (e) {}

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
