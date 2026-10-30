/* Nowhere — make an offer, follow the seller's answer, and see every step from the Option to Purchase to the keys */
(function () {
  "use strict";
  var U = AH.ui, $ = U.$, esc = U.esc, fmt = AH.fmt, DAY = 86400000;
  var ctx = AH.ctx(), q = new URLSearchParams(location.search), h = AH.byId(+q.get("id"));
  var box = $("[data-offer]");
  if (!h) {
    box.innerHTML = '<div class="empty-big"><h1 class="h2">That home isn\'t listed any more</h1><p>It may have sold or been taken down.</p><a class="btn primary" href="viewings.html">Back to your viewings</a></div>';
    return;
  }
  var p = AH.LISTERS[h.lister] || AH.LISTERS.priya, first = p.name.split(" ")[0];
  var amount = Math.round(h.price / 1000) * 1000, note = "";

  function two(n) { return ("0" + n).slice(-2); }
  function ch(n, title) { return '<h2 class="ch-h"><span aria-hidden="true">' + two(n) + "</span>" + title + "</h2>"; }
  function day(ts) { return new Date(ts).toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short" }); }
  function cost(v) { return AH.money(Object.assign({}, h, { price: v }), ctx); }

  /* the steps after a yes; dates count from the day the seller accepts */
  function steps(v, m) {
    if (h.public) return [
      [0, "The seller accepts", "You agree the price with " + first + " in writing."],
      [1, "Option to Purchase", "The seller grants the OTP. You pay the option fee.", "Up to $1,000", "Cash"],
      [2, "Ask HDB for a valuation", "By the next working day after the OTP. You pay HDB's valuation fee."],
      [9, "Valuation result", "About seven working days. If it comes in under " + AH.short(v) + ", the gap is Cash Over Valuation and can only be paid in cash."],
      [21, "Exercise the option", "Within 21 days of the OTP. The option fee and deposit together come to $5,000 at most.", "Up to $4,000 more", "Cash"],
      [22, "Resale application", "You and the seller each submit your side on the HDB Resale Portal."],
      [35, "Stamp duty", "Due within 14 days of exercising the option.", fmt(m.duty), "CPF or cash"],
      [78, "Completion: your keys", "About eight weeks after HDB accepts the application. The rest of the downpayment and the loan are paid out.", fmt(Math.max(0, m.upfront - m.duty - 5000)), "CPF and cash"]
    ];
    return [
      [0, "The seller accepts", "You agree the price with " + first + " in writing."],
      [1, "Option to Purchase", "The seller grants the OTP for 1% of the price.", fmt(v * 0.01), "Cash"],
      [15, "Exercise the option", "Within 14 days of the OTP. You pay a further 4% and sign the Sale and Purchase Agreement.", fmt(v * 0.04), "Cash"],
      [29, "Stamp duty", "Due within 14 days of exercising the option.", fmt(m.duty), "CPF or cash"],
      [85, "Completion: your keys", "Usually 8 to 12 weeks after exercising. The rest of the downpayment and the loan are paid out.", fmt(Math.max(0, m.upfront - m.duty - v * 0.05)), "CPF and cash"]
    ];
  }

  function moneyHtml(v) {
    var m = cost(v), off = (h.price - v) / h.price * 100;
    return '<dl class="of-sum">' +
      '<div><dt>Your offer</dt><dd><b>' + fmt(v) + "</b><small>" + (Math.abs(off) < 0.05 ? "the asking price" : Math.abs(off).toFixed(1) + "% " + (off > 0 ? "below" : "above") + " asking") + "</small></dd></div>" +
      "<div><dt>Stamp duty</dt><dd><b>" + fmt(m.duty) + "</b><small>CPF or cash</small></dd></div>" +
      "<div><dt>Paid upfront</dt><dd><b>" + fmt(m.upfront) + "</b><small>from your CPF and cash" + (m.gt ? ", after " + AH.short(m.gt) + " in grants" : "") + "</small></dd></div>" +
      "<div><dt>Cash a month</dt><dd><b>" + (m.over ? "Over budget" : fmt(m.cash)) + "</b><small>" + (m.over ? "above your loan limit or savings" : "after CPF covers " + fmt(m.cpfPays)) + "</small></dd></div></dl>" +
      (h.public ? '<p class="of-note">HDB values the flat after the OTP. Anything you pay above that value is Cash Over Valuation: cash only, no CPF or loan.</p>' : "");
  }

  function timeline(o, m, v) {
    var base = o && o.state === "accepted" ? o.accepted : Date.now(), done = o && o.state === "accepted" ? o.done : -1;
    return '<ol class="tl">' + steps(v, m).map(function (s, i) {
      var st = i < done ? "done" : i === done ? "now" : "";
      var ts = base + s[0] * DAY; while (i && /^(0|6)$/.test(new Date(ts).getDay())) ts += DAY; // paperwork lands on working days
      return '<li class="tl-i' + (st ? " is-" + st : "") + '"><span class="tl-dot" aria-hidden="true">' + (st === "done" ? '<svg><use href="#i-check"/></svg>' : "") + "</span>" +
        '<div class="tl-b"><p class="tl-d">' + (st === "done" ? '<span class="sr-only">Done: </span>' : "") + "Day " + Math.round((ts - base) / DAY) + " · " + day(ts) + "</p><h3>" + s[1] + "</h3><p>" + s[2] + "</p>" +
        (s[3] ? '<p class="tl-pay"><b>' + s[3] + "</b> " + s[4] + "</p>" : "") +
        (st === "now" ? '<button type="button" class="btn ghost" data-done>I\'ve done this</button>' : "") + "</div></li>";
    }).join("") + "</ol>";
  }

  function render() {
    U.savedCount();
    var o = AH.offerFor(h.id), v = o ? (o.state === "countered" ? o.counter : o.amount) : amount, m = cost(v);
    if (o && o.state === "declined") v = o.amount;
    var top = '<div class="hp-top"><a class="back" href="viewings.html"><svg><use href="#i-chev"/></svg>Your viewings</a></div>' +
      '<a class="vw-home of-home" href="home.html?id=' + h.id + '"><img src="' + esc(AH.img(h.photos[0])) + '" alt=""><span><b>' + esc(h.rooms + " · " + h.town) + "</b><small>" + esc(h.street) + " · asking " + fmt(h.price) + "</small></span></a>" +
      '<h1 class="h1 of-h" tabindex="-1">' + (!o ? "Make an offer" : o.state === "accepted" ? "Your offer was accepted" : o.state === "countered" ? first + " came back with " + AH.short(o.counter) : o.state === "declined" ? "The seller said no" : "Offer sent") + "</h1>";
    var main;
    if (!o) {
      var chips = [[0, "Asking"], [1, "1% less"], [2, "2% less"], [3, "3% less"]];
      main = '<section class="ch">' + ch(1, "Your offer") +
        '<div class="q"><label for="amt"><span class="of-lab">Offer price</span></label><div class="of-amt"><span aria-hidden="true">$</span><input id="amt" type="text" inputmode="numeric" autocomplete="off" value="' + amount.toLocaleString("en-SG") + '" data-amt aria-describedby="amt-hint"></div>' +
        '<small id="amt-hint">Asking is ' + fmt(h.price) + ". Most resale offers land within 3% of it.</small></div>" +
        '<div class="seg-row of-chips" role="group" aria-label="Quick amounts">' + chips.map(function (c) { var val = Math.round(h.price * (1 - c[0] / 100) / 1000) * 1000; return '<button type="button" data-set="' + val + '" aria-pressed="' + (val === amount) + '">' + c[1] + "</button>"; }).join("") + "</div>" +
        '<div data-sum>' + moneyHtml(amount) + "</div>" +
        '<label class="q of-msg"><span>Message to ' + esc(first) + ' (optional)</span><textarea data-note rows="3" placeholder="For example: we can be flexible on the completion date.">' + esc(note) + "</textarea></label>" +
        '<button type="button" class="btn primary of-send" data-send>Send offer of ' + fmt(amount) + "</button>" +
        '<p class="of-fine">Sending isn\'t binding. Nothing is final until the seller grants you the Option to Purchase.</p></section>';
    } else {
      var log = o.history.map(function (x) { return "<li><b>" + (x.from === "buyer" ? "You" : esc(first)) + "</b> " + (x.note || "offered " + fmt(x.amount)) + " <small>" + U.ago(x.t) + "</small></li>"; }).join("");
      var acts = o.state === "sent" ? '<div class="lead-actions"><button type="button" class="btn ghost" data-act="withdraw">Withdraw offer</button><a class="mode" href="agent.html?as=' + esc(h.lister) + '&amp;view=offers">See it from ' + esc(first) + "'s side</a></div>"
        : o.state === "countered" ? '<div class="lead-actions"><button type="button" class="btn primary" data-act="take">Accept ' + fmt(o.counter) + '</button><button type="button" class="btn ghost" data-act="withdraw">Decline and offer again</button></div>'
        : o.state === "declined" ? '<div class="lead-actions"><button type="button" class="btn primary" data-act="withdraw">Make a new offer</button><a class="btn ghost" href="find.html">Find similar homes</a></div>' : "";
      main = '<section class="ch">' + ch(1, "Your offer") +
        '<p class="of-status">' + (o.state === "sent" ? "Sent to " + esc(p.name) + " " + U.ago(o.sent) + ". Sellers usually answer within two days."
          : o.state === "countered" ? "You offered " + fmt(o.amount) + ". " + esc(first) + " asked for " + fmt(o.counter) + ", " + ((h.price - o.counter) / h.price * 100).toFixed(1) + "% below asking."
          : o.state === "accepted" ? "Agreed at " + fmt(o.amount) + " on " + day(o.accepted) + ". Your next step is below."
          : "Your offer of " + fmt(o.amount) + " wasn't accepted. You can offer again.") + "</p>" + acts +
        '<ul class="of-log" aria-label="Offer history">' + log + "</ul>" +
        '<div data-sum>' + moneyHtml(v) + "</div></section>";
    }
    box.innerHTML = '<div class="of-col">' + top + main +
      '<section class="ch">' + ch(2, "From offer to keys") + '<p class="of-fine">' + (o && o.state === "accepted" ? "Dates count from the day the seller accepted." : "If the seller accepts today.") + " Estimates only; your lawyer and " + (h.public ? "HDB" : "your bank") + " confirm the real dates.</p>" +
        '<div data-tl>' + timeline(o, m, v) + "</div></section></div>";
  }

  function live() {
    var input = $("[data-amt]"), v = +input.value.replace(/[^\d]/g, "") || 0;
    amount = v;
    $("[data-sum]").innerHTML = moneyHtml(v || h.price);
    $("[data-tl]").innerHTML = timeline(null, cost(v || h.price), v || h.price);
    U.$$("[data-set]").forEach(function (b) { b.setAttribute("aria-pressed", +b.dataset.set === v); });
    var send = $("[data-send]"), low = v < h.price * 0.8;
    send.disabled = !v || low; send.textContent = !v ? "Enter an amount" : low ? "Too far below asking to send" : "Send offer of " + fmt(v);
  }

  box.addEventListener("input", function (e) {
    if (e.target.matches("[data-amt]")) live();
    if (e.target.matches("[data-note]")) note = e.target.value;
  });
  box.addEventListener("change", function (e) { if (e.target.matches("[data-amt]") && amount) e.target.value = amount.toLocaleString("en-SG"); });
  box.addEventListener("click", function (e) {
    var set = e.target.closest("[data-set]"), act = e.target.closest("[data-act]");
    if (set) { $("[data-amt]").value = (+set.dataset.set).toLocaleString("en-SG"); live(); return; }
    if (e.target.closest("[data-send]")) {
      AH.addOffer({ listing: h.id, amount: amount, msg: note.trim() });
      U.toast("Offer sent to " + p.name); render(); $(".of-h").focus(); return;
    }
    var o = AH.offerFor(h.id);
    if (e.target.closest("[data-done]")) { o.done++; AH.save(); U.toast("Step done"); render(); return; }
    if (!act || !o) return;
    if (act.dataset.act === "withdraw") { o.state = "withdrawn"; o.history.push({ from: "buyer", note: "withdrew", t: Date.now() }); U.toast("Offer withdrawn"); }
    if (act.dataset.act === "take") { o.amount = o.counter; o.state = "accepted"; o.accepted = Date.now(); o.done = 1; o.history.push({ from: "buyer", note: "accepted " + fmt(o.counter), t: Date.now() }); U.toast("Agreed at " + fmt(o.amount)); }
    AH.save(); render(); $(".of-h").focus();
  });
  render();
})();
