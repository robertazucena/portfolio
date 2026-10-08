mountSidebar("moments");

  document.getElementById("sidebar-open").innerHTML = ICONS.menu;
  document.getElementById("mobile-logo").innerHTML = ICONS.logo;
  document.getElementById("icon-search").innerHTML = ICONS.search;
  document.getElementById("icon-layers").innerHTML = ICONS.layers;
  document.getElementById("icon-filter").innerHTML = ICONS.filter;
  document.getElementById("icon-bookmark").innerHTML = ICONS.bookmarkPlus;

  const grid = document.getElementById("moments-grid");
  grid.innerHTML = MOMENTS.map((m) => {
    if (m.type === "video") {
      return `
        <a class="moment-card type-video" href="moment.html?id=${m.id}">
          <div class="card-img">
            <img src="${m.img}" alt="${m.title}" loading="lazy" />
            <span class="play-btn">${ICONS.playCircle}</span>
          </div>
        </a>`;
    }
    return `
      <a class="moment-card type-simple" href="moment.html?id=${m.id}">
        <div class="card-img"><img src="${m.img}" alt="${m.title}" loading="lazy" /></div>
        <div class="card-meta">
          <p class="m-title">${m.title}</p>
          <p class="m-sub">E-card</p>
        </div>
      </a>`;
  }).join("");

  document.getElementById("new-moment-cta").addEventListener("click", () => {
    pageNavigate("moment.html?id=" + MOMENTS[0].id);
  });
