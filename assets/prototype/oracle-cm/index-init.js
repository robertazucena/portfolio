mountSidebar("moments");
document.getElementById("sidebar-open").innerHTML = ICONS.menu;
document.getElementById("mobile-logo").innerHTML = ICONS.logo;
document.getElementById("icon-search").innerHTML = ICONS.search;

/* Gallery: one featured moment, then every moment titled and filterable. */
(function () {
  var META = {
    1: { cat: "wins", sent: 188, order: 3 },
    2: { cat: "holiday", sent: 312, order: 1 },
    3: { cat: "holiday", sent: 96, order: 6 },
    4: { cat: "ai", sent: 141, order: 4 },
    5: { cat: "holiday", sent: 254, order: 5 },
    6: { cat: "wins", sent: 207, order: 2 },
    7: { cat: "holiday", sent: 73, order: 8 },
    8: { cat: "ai", sent: 119, order: 7 }
  };
  var FEATURED = 2;
  var grid = document.getElementById("moments-grid");
  var search = document.getElementById("mx-search");
  var sort = document.getElementById("mx-sort");
  var count = document.getElementById("mx-count");
  var empty = document.getElementById("mx-empty");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".mx-tab"));
  var state = { cat: "all", q: "", sort: "recent" };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function type(m) { return m.type === "video" ? "Video" : "E-card"; }

  function card(m) {
    return '<a class="mx-gcard" href="moment.html?id=' + m.id + '">' +
      '<div class="mx-art"><img src="' + m.img + '" alt="" loading="lazy" />' +
      (m.type === "video" ? '<span class="mx-play">' + ICONS.playCircle + "Video</span>" : "") + "</div>" +
      '<div class="mx-meta"><p class="mx-title">' + esc(m.title) + '</p><p class="mx-type">' + type(m) + "</p></div></a>";
  }
  function feature(m) {
    return '<a class="mx-gcard mx-feat" href="moment.html?id=' + m.id + '">' +
      '<div class="mx-art"><img src="' + m.img + '" alt="" /></div>' +
      '<div class="mx-feat-body"><div><h2>' + esc(m.title) + "</h2>" +
      "<p>Trending this week. Sent " + META[m.id].sent + " times this month, 91% opened.</p></div>" +
      '<span class="mx-link">Personalize this moment<span class="mx-btn-ic">' + ICONS.arrowLeft + "</span></span></div></a>";
  }

  function render(fromUser) {
    var q = state.q.toLowerCase();
    var list = MOMENTS.filter(function (m) {
      var okCat = state.cat === "all" || META[m.id].cat === state.cat;
      var okQ = !q || (m.title + " " + m.badge + " " + m.heading + " " + type(m)).toLowerCase().indexOf(q) > -1;
      return okCat && okQ;
    });
    list.sort(function (a, b) {
      if (state.sort === "az") return a.title.localeCompare(b.title);
      if (state.sort === "popular") return META[b.id].sent - META[a.id].sent;
      return META[a.id].order - META[b.id].order;
    });
    var showFeature = state.cat === "all" && !q && state.sort === "recent";
    grid.innerHTML = list.map(function (m) { return showFeature && m.id === FEATURED ? feature(m) : card(m); }).join("");
    grid.classList.toggle("is-instant", !!fromUser);
    count.textContent = list.length === 1 ? "1 moment" : list.length + " moments";
    empty.hidden = list.length > 0;
    document.getElementById("mx-empty-q").textContent = q ? "“" + state.q + "”" : "this filter";
    if (window.MX) window.MX.cards(grid);
  }

  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      state.cat = t.dataset.cat;
      tabs.forEach(function (o) { var on = o === t; o.classList.toggle("is-on", on); o.setAttribute("aria-pressed", String(on)); });
      render(true);
    });
  });
  search.addEventListener("input", function () { state.q = search.value.trim(); render(true); });
  sort.addEventListener("change", function () { state.sort = sort.value; render(true); });
  document.getElementById("mx-clear").addEventListener("click", function () {
    search.value = ""; state.q = ""; state.cat = "all"; sort.value = state.sort = "recent";
    tabs.forEach(function (o, i) { o.classList.toggle("is-on", i === 0); o.setAttribute("aria-pressed", String(i === 0)); });
    render(true); search.focus();
  });
  document.getElementById("mx-browse").addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("gallery").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });

  var h = new Date().getHours();
  document.getElementById("mx-hello").textContent = (h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening") + ", Fatima";
  render(false);
})();
