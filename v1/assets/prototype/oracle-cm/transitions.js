// Lightweight page-transition helper for this static multi-page app.
// Since each page is a full document load (not an SPA), we fake a smooth
// transition by fading the current page out just before following an
// internal link, then relying on the fade-in keyframe below to animate
// the next page in once it loads. Modern browsers additionally get a
// native cross-document View Transition (see the @view-transition rule
// in styles.css) which layers a real crossfade on top of this.
(function () {
  function isInternalNavigable(a) {
    if (!a) return false;
    const href = a.getAttribute("href");
    if (!href || href === "#" || href.charAt(0) === "#") return false;
    if (a.target && a.target !== "" && a.target !== "_self") return false;
    if (a.hasAttribute("aria-disabled") || a.classList.contains("disabled")) return false;
    if (href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return false;
    if (/^[a-z]+:\/\//i.test(href) && href.indexOf(window.location.origin) !== 0) return false;
    return true;
  }

  // Exposed so button-driven navigation (not a plain <a> click) can use
  // the same fade-out timing, e.g. the "Got a moment?" CTA.
  window.pageNavigate = function (url) {
    document.body.classList.add("page-leaving");
    window.setTimeout(function () {
      window.location.href = url;
    }, 160);
  };

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest("a[href]");
    if (!isInternalNavigable(a)) return;
    e.preventDefault();
    window.pageNavigate(a.getAttribute("href"));
  });
})();
