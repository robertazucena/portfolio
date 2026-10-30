/* Nowhere — your viewing requests: what each agent said, new times to accept, and what to do once you've seen a home */
(function () {
  "use strict";
  var U = AH.ui, $ = U.$, $$ = U.$$, esc = U.esc, DAY = 86400000;
  var ST = AH.load(), q = new URLSearchParams(location.search), pick = +q.get("id") || null;

  function mine() {
    return ST.enquiries.filter(function (e) { return e.pool === -1 && e.state !== "cancelled" && AH.byId(e.listing); })
      .sort(function (a, b) { return need(b) - need(a) || rank(a) - rank(b) || a.at - b.at; });
  }
  function viewed(e) { return e.state === "confirmed" && e.at < Date.now(); }
  function offer(e) { return AH.offerFor(e.listing); }
  function need(e) { var o = offer(e); return e.state === "proposed" || (o && o.state === "countered") ? 1 : 0; }
  function rank(e) { return { proposed: 0, confirmed: viewed(e) ? 2 : 1, "new": 1, passed: 4, declined: 5 }[e.state] || 3; }
  function status(e) {
    var o = offer(e);
    if (o) return o.state === "accepted" ? ["Offer accepted", "ok"] : o.state === "countered" ? ["Counter-offer", "warn"] : o.state === "declined" ? ["Offer declined", "bad"] : ["Offer sent", "ink"];
    if (e.state === "proposed") return ["New time proposed", "warn"];
    if (e.state === "new") return ["Waiting for a reply", ""];
    if (e.state === "declined") return ["Not available", "bad"];
    if (e.state === "passed") return ["Not for us", ""];
    return viewed(e) ? ["Viewed", "ok"] : ["Confirmed", "ok"];
  }
  function who(h) { return AH.LISTERS[h.lister] || AH.LISTERS.priya; }

  function ics(e, h) {
    var d = new Date(e.at), z = function (n) { return ("0" + n).slice(-2); }, day = d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + "T" + z(d.getHours());
    var body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Nowhere//Concept//EN", "BEGIN:VEVENT", "UID:nowhere-" + e.id, "DTSTART:" + day + "0000", "DTEND:" + day + "4500", "SUMMARY:Viewing: " + h.rooms + ", " + h.town, "LOCATION:" + h.street + ", Singapore", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(body);
  }

  function render() {
    U.savedCount();
    var list = mine(), waiting = list.filter(need).length;
    $("[data-sub]").textContent = list.length ? list.length + (list.length === 1 ? " viewing" : " viewings") + (waiting ? ", " + waiting + (waiting === 1 ? " needs" : " need") + " your reply." : ". Nothing needs you right now.") : "Book a viewing on any home and the conversation lands here.";
    if (!list.length) {
      $("[data-vw]").innerHTML = '<div class="empty-big"><h2 class="h2">No viewings yet</h2><p>Book a viewing on any home. The agent or owner replies here, and so do you.</p><a class="btn primary" href="find.html">Find homes that fit</a></div>';
      return;
    }
    if (!pick || !list.some(function (e) { return e.id === pick; })) pick = list[0].id;
    $("[data-vw]").innerHTML = '<div class="inbox"><div class="threads" role="list">' + list.map(function (e) {
      var h = AH.byId(e.listing), s = status(e), last = (e.thread || []).slice(-1)[0];
      return '<button type="button" class="thread vw-t" role="listitem" data-t="' + e.id + '" aria-current="' + (e.id === pick) + '">' +
        '<img src="' + esc(AH.img(h.photos[0])) + '" alt="">' +
        '<span class="vw-tx"><span class="t-top"><b>' + (need(e) ? '<i class="dotnew" aria-hidden="true"></i><span class="sr-only">Needs you: </span>' : "") + esc(h.rooms + " · " + h.town) + "</b><small>" + U.ago(last ? last.t : e.sent) + "</small></span>" +
        "<small>" + esc(who(h).name) + " · " + s[0] + "</small><p>" + esc(last ? last.text : e.msg) + "</p></span></button>";
    }).join("") + '</div><div class="panel lead vw-d" data-d></div></div>';
    detail();
  }

  function actions(e, h) {
    var o = offer(e);
    if (o) return '<div class="lead-actions"><a class="btn primary" href="offer.html?id=' + h.id + '">' + (o.state === "countered" ? "Review the counter-offer" : o.state === "accepted" ? "See your next steps" : "See your offer") + "</a></div>";
    if (e.state === "proposed") return '<div class="lead-actions"><button type="button" class="btn primary" data-act="accept">Accept ' + esc(U.when(e.at)) + '</button><button type="button" class="btn ghost" data-act="later">Ask for the next day</button></div>';
    if (e.state === "new") return '<div class="lead-actions"><button type="button" class="btn ghost" data-act="cancel">Cancel request</button></div>';
    if (e.state === "declined") return '<div class="lead-actions"><a class="btn primary" href="find.html">Find similar homes</a></div>';
    if (e.state === "passed") return '<div class="lead-actions"><button type="button" class="btn ghost" data-act="undo">Undo</button></div>';
    if (viewed(e)) return '<div class="lead-actions"><a class="btn primary" href="offer.html?id=' + h.id + '">Make an offer</a><button type="button" class="btn ghost" data-act="pass">Not for us</button></div>';
    return '<div class="lead-actions"><a class="btn primary" href="' + ics(e, h) + '" download="viewing-' + e.id + '.ics">Add to calendar</a>' +
      '<a class="btn ghost" href="https://www.google.com/maps/dir/?api=1&amp;destination=' + encodeURIComponent(h.street + ", Singapore") + '" target="_blank" rel="noopener">Directions<span class="sr-only"> (opens in a new tab)</span></a>' +
      '<button type="button" class="btn ghost" data-act="cancel">Cancel</button></div>';
  }

  function detail() {
    var e = ST.enquiries.filter(function (x) { return x.id === pick; })[0]; if (!e) return;
    var h = AH.byId(e.listing), p = who(h), s = status(e);
    var msgs = [{ from: "buyer", text: e.msg, t: e.sent }].concat(e.thread || []);
    $("[data-d]").innerHTML =
      '<div class="lead-top"><a class="vw-home" href="home.html?id=' + h.id + '"><img src="' + esc(AH.img(h.photos[0])) + '" alt=""><span><b>' + esc(h.rooms + " · " + h.town) + "</b><small>" + esc(h.street) + " · " + AH.fmt(h.price) + "</small></span></a>" +
        '<span class="chip' + (s[1] ? " " + s[1] : "") + '">' + s[0] + "</span></div>" +
      '<p class="vw-when"><span>' + (viewed(e) ? "Viewed" : e.state === "proposed" ? "Proposed" : e.state === "confirmed" ? "Viewing" : "Requested") + "</span><b>" + esc(U.when(e.at)) + "</b></p>" +
      actions(e, h) +
      '<ol class="chat" aria-label="Conversation with ' + esc(p.name) + '">' + msgs.map(function (m) {
        var me = m.from === "buyer";
        return '<li class="bub' + (me ? " me" : "") + '"><span class="sr-only">' + (me ? "You" : esc(p.name)) + ": </span>" + esc(m.text) + "<small>" + (me ? "You" : esc(p.name.split(" ")[0])) + " · " + U.ago(m.t) + "</small></li>";
      }).join("") + "</ol>" +
      (e.state === "declined" || e.state === "passed" ? "" :
        '<form class="compose" data-compose><label class="sr-only" for="reply">Message ' + esc(p.name) + '</label><textarea id="reply" rows="2" enterkeyhint="send" placeholder="Write to ' + esc(p.name.split(" ")[0]) + '…" data-reply></textarea><button type="submit" class="btn primary">Send</button></form>');
    var c = $(".chat"); c.scrollTop = c.scrollHeight;
  }

  $("[data-vw]").addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-t]"), act = ev.target.closest("[data-act]");
    if (t) {
      pick = +t.dataset.t; history.replaceState(null, "", "?id=" + pick);
      $$("[data-t]").forEach(function (x) { x.setAttribute("aria-current", x === t); }); detail();
      if (matchMedia("(max-width: 860px)").matches) $("[data-d]").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      return;
    }
    if (!act) return;
    var e = ST.enquiries.filter(function (x) { return x.id === pick; })[0], a = act.dataset.act, msg;
    if (a === "accept") { e.state = "confirmed"; AH.say(e, "buyer", "That works for us. See you then."); msg = "Viewing confirmed for " + U.when(e.at); }
    if (a === "later") { e.at += DAY; e.state = "new"; AH.say(e, "buyer", "Could we do " + U.when(e.at) + " instead?"); msg = "Asked for " + U.when(e.at); }
    if (a === "cancel") { e.state = "cancelled"; AH.say(e, "buyer", "Sorry, we need to cancel this viewing."); msg = "Viewing cancelled"; pick = null; }
    if (a === "pass") { e.state = "passed"; msg = "Marked as not for you"; }
    if (a === "undo") { e.state = "confirmed"; msg = "Moved back to viewed"; }
    AH.save(); U.toast(msg); render();
  });
  $("[data-vw]").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var box = $("[data-reply]"), text = box.value.trim(); if (!text) { box.focus(); return; }
    var e = ST.enquiries.filter(function (x) { return x.id === pick; })[0];
    AH.say(e, "buyer", text); AH.save(); render(); $("[data-reply]").focus();
  });
  $("[data-vw]").addEventListener("keydown", function (ev) {
    if (ev.target.matches("[data-reply]") && ev.key === "Enter" && !ev.shiftKey && !ev.isComposing) { ev.preventDefault(); ev.target.form.requestSubmit(); }
  });
  render();
})();
