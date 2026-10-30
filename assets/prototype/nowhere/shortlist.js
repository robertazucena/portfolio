/* Nowhere — saved homes side by side, with the winner of each row marked */
(function () {
  "use strict";
  var U = AH.ui, $ = U.$, esc = U.esc, fmt = AH.fmt, short = AH.short;
  var ST = AH.load(), ctx = AH.ctx(), A = ctx.anchors;

  function render() {
    U.savedCount();
    var ids = Object.keys(ST.saved).map(Number);
    var rows = ids.map(AH.byId).filter(Boolean).map(function (h) { return AH.score(h, ctx); }).sort(function (a, b) { return b.fit - a.fit; });
    if (!rows.length) {
      $("[data-sub]").textContent = "Saved homes, side by side against your week.";
      $("[data-cmp]").innerHTML = '<div class="empty-big"><h2 class="h2">Nothing saved yet</h2><p>Tap Shortlist on any home and it lands here, lined up against your places and your money.</p><a class="btn primary" href="find.html">Find homes that fit</a></div>';
      return;
    }
    // try a few homes if only one is saved, so the comparison has something to compare
    $("[data-sub]").textContent = rows.length + (rows.length === 1 ? " home" : " homes") + " compared against your week and your money.";

    var top = rows[0];
    var why = [];
    if (rows.length > 1) {
      var lessTime = rows.slice().sort(function (a, b) { return a.hours - b.hours; })[0];
      var lessCash = rows.filter(function (r) { return !r.m.over; }).sort(function (a, b) { return a.m.cash - b.m.cash; })[0];
      if (lessTime === top) why.push("the least travel"); if (lessCash === top) why.push("the lowest monthly cash");
      if (top.m.gt && top.m.gt === Math.max.apply(null, rows.map(function (r) { return r.m.gt; }))) why.push("the most grants");
    }

    function best(vals, low) {
      var ok = vals.filter(function (v) { return v != null; }); if (ok.length < 2) return null;
      return low ? Math.min.apply(null, ok) : Math.max.apply(null, ok);
    }
    function row(label, cells) { return '<tr><th scope="row">' + label + "</th>" + cells.join("") + "</tr>"; }
    function cell(html, isBest) { return '<td><div class="cell' + (isBest ? " best" : "") + '">' + html + "</div></td>"; }

    var fitB = best(rows.map(function (r) { return r.fit; })), hrsB = best(rows.map(function (r) { return +r.hours.toFixed(1); }), true);
    var cashB = best(rows.map(function (r) { return r.m.over ? null : Math.round(r.m.cash); }), true);
    var gtB = best(rows.map(function (r) { return r.m.gt || null; })), sqmB = best(rows.map(function (r) { return r.h.sqm; }));
    var ppsB = best(rows.map(function (r) { return Math.round(r.h.price / r.h.sqm); }), true);
    var leaseB = best(rows.map(function (r) { return AH.yearsLeft(r.h) || 999; }));
    var maxMin = Math.max.apply(null, rows.map(function (r) { return Math.max.apply(null, r.t.map(function (t) { return t.min; })); }).concat([30]));

    var html = (rows.length > 1 ? '<div class="verdict rise"><b>' + esc(top.h.rooms + " in " + top.h.town) + " fits you best</b><span>" + (why.length ? "It has " + why.join(", ") + "." : "It scores highest once travel, money and grants are weighed together.") + "</span></div>" : "") +
      '<div class="cmp-scroll" tabindex="0" role="region" aria-label="Comparison table, scrolls sideways"><table class="cmp"><thead><tr><th scope="col"><span class="sr-only">Home</span></th>' +
      rows.map(function (r) {
        return '<th scope="col"><div class="c-card"><img src="' + esc(AH.img(r.h.photos[0])) + '" alt=""><a href="home.html?id=' + r.h.id + '">' + esc(r.h.rooms + " · " + r.h.town) + "</a><small>" + esc(r.h.street) + '</small><button type="button" class="c-x" data-rm="' + r.h.id + '">Remove</button></div></th>';
      }).join("") + "</tr></thead><tbody>" +
      row("Fit for you", rows.map(function (r) { return cell(U.ring(r.fit, r.tone), r.fit === fitB); })) +
      row("Asking price", rows.map(function (r) { return cell("<b>" + fmt(r.h.price) + "</b>"); })) +
      row("Cash a month after CPF", rows.map(function (r) { return cell(r.m.over ? '<span class="chip bad">Over budget</span>' : "<b>" + fmt(r.m.cash) + "</b>", !r.m.over && Math.round(r.m.cash) === cashB); })) +
      row("Grants for you", rows.map(function (r) { return cell(r.m.gt ? "<b>" + short(r.m.gt) + "</b>" : '<span class="muted">None</span>', r.m.gt && r.m.gt === gtB); })) +
      row("Travel a week", rows.map(function (r) { return cell("<b>" + r.hours.toFixed(1) + " h</b>", +r.hours.toFixed(1) === hrsB); })) +
      A.map(function (a, i) {
        var R = AH.ROLES[a.role], mins = rows.map(function (r) { return r.t[i].min; }), b = best(mins, true);
        return row(R.label + "<br><small>" + esc(a.place) + "</small>", rows.map(function (r) {
          var t = r.t[i]; return cell('<div class="bar" style="--c:' + R.c + '"><i style="--w:' + (t.min / maxMin * 100).toFixed(0) + '%"></i></div><b>' + t.min + " min</b>", t.min === b);
        }));
      }).join("") +
      row("Floor area", rows.map(function (r) { return cell("<b>" + r.h.sqm + " m²</b> · " + r.h.beds + " bed", r.h.sqm === sqmB); })) +
      row("Price per m²", rows.map(function (r) { var v = Math.round(r.h.price / r.h.sqm); return cell("<b>" + fmt(v) + "</b>", v === ppsB); })) +
      row("Lease left", rows.map(function (r) { var y = AH.yearsLeft(r.h); return cell("<b>" + (y ? y + " years" : "Freehold") + "</b>", (y || 999) === leaseB); })) +
      row("Stamp duty", rows.map(function (r) { return cell(fmt(r.m.duty)); })) +
      row("Listed by", rows.map(function (r) { var p = AH.LISTERS[r.h.lister]; return cell(esc(p.name) + '<br><small class="muted">' + (p.kind === "owner" ? "Owner" : "Agent") + "</small>"); })) +
      row("", rows.map(function (r) { return '<td><a class="btn primary" href="home.html?id=' + r.h.id + '#book">Book a viewing</a></td>'; })) +
      "</tbody></table></div>";
    $("[data-cmp]").innerHTML = html;
    more();
  }

  // fade the right edge while more homes sit off to the side
  function more() {
    var sc = $(".cmp-scroll"); if (!sc) return;
    sc.classList.toggle("is-more", sc.scrollLeft + sc.clientWidth < sc.scrollWidth - 4);
  }
  $("[data-cmp]").addEventListener("scroll", more, true);
  addEventListener("resize", more);

  $("[data-cmp]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-rm]"); if (!b) return;
    delete ST.saved[+b.dataset.rm]; AH.save(); render(); U.toast("Removed from your shortlist");
  });
  render();
})();
