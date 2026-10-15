/* Aurora destinations globe: a dotted Earth drawn on a canvas with an orthographic projection, routes from the
   Singapore hub flown as raised great-circle arcs, and real buttons for each city that ride along on the surface.
   No libraries; land dots come from globe-land.js (Natural Earth, public domain). */
(function () {
  "use strict";
  var RAD = Math.PI / 180;

  function vec(lat, lon) { var p = lat * RAD, l = lon * RAD; return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)]; }
  function slerp(a, b, t) {
    var d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])), w = Math.acos(d);
    if (w < 1e-6) return a.slice();
    var s = Math.sin(w), ka = Math.sin((1 - t) * w) / s, kb = Math.sin(t * w) / s;
    return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
  }
  function toLatLon(v) { return [Math.asin(Math.max(-1, Math.min(1, v[1]))) / RAD, Math.atan2(v[0], v[2]) / RAD]; }
  function wrap(d) { return ((d + 540) % 360) - 180; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  /* opts: { canvas, pins (container), hub: {code, lat, lon}, cities: [{code, title, lat, lon, dim}], reduced, onPick(code), theme() } */
  function Globe(opts) {
    var cv = opts.canvas, ctx = cv.getContext("2d"), pinsEl = opts.pins, reduced = !!opts.reduced;
    var land = window.AuroraLand || [], N = land.length / 2;
    var lv = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) { var v = vec(land[i * 2] / 10, land[i * 2 + 1] / 10); lv[i * 3] = v[0]; lv[i * 3 + 1] = v[1]; lv[i * 3 + 2] = v[2]; }
    var hubV = vec(opts.hub.lat, opts.hub.lon);
    var cities = opts.cities.map(function (c) {
      var v = vec(c.lat, c.lon), pts = [], dist = Math.acos(Math.max(-1, Math.min(1, hubV[0] * v[0] + hubV[1] * v[1] + hubV[2] * v[2])));
      for (var k = 0; k <= 64; k++) { var t = k / 64, p = slerp(hubV, v, t), h = 1 + Math.sin(Math.PI * t) * (0.06 + dist * 0.09); pts.push([p[0] * h, p[1] * h, p[2] * h]); }
      return { code: c.code, title: c.title, flag: c.flag, v: v, arc: pts, dim: !!c.dim, btn: null };
    });
    var view = { lon: opts.hub.lon + 20, lat: 14 }, target = null, active = null, hover = null;
    var W = 0, R = 0, cx = 0, cy = 0, dpr = 1, raf = 0, last = 0, t0 = 0, running = false, visible = true;
    var drag = null, spin = reduced ? 0 : 3.2, vel = 0, idleUntil = 0;

    /* buttons for every city: focusable, labelled, and positioned on the globe each frame */
    pinsEl.innerHTML = "";
    cities.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "gp" + (c.dim ? " dim" : ""); b.dataset.code = c.code;
      b.setAttribute("aria-label", c.title + ", show the route from Singapore");
      b.innerHTML = '<span class="gp-dot">' + (c.flag ? '<img class="gp-flag" src="' + c.flag + '" alt="" width="22" height="22" decoding="async">' : "") + '</span><span class="gp-label">' + c.title + "</span>";
      b.addEventListener("click", function () { pick(c.code, true); });
      b.addEventListener("focus", function () { pick(c.code, false); });
      b.addEventListener("pointerenter", function () { hover = c.code; kick(); });
      b.addEventListener("pointerleave", function () { if (hover === c.code) hover = null; kick(); });
      pinsEl.appendChild(b); c.btn = b;
    });
    var hubEl = document.createElement("span"); hubEl.className = "gp gp-hub"; hubEl.setAttribute("aria-hidden", "true");
    hubEl.innerHTML = '<span class="gp-dot">' + (opts.hub.flag ? '<img class="gp-flag" src="' + opts.hub.flag + '" alt="" width="22" height="22" decoding="async">' : "") + '</span><span class="gp-label">Singapore</span>'; pinsEl.appendChild(hubEl);

    function rot(v) {
      var l = view.lon * RAD, p = view.lat * RAD, cl = Math.cos(l), sl = Math.sin(l), cp = Math.cos(p), sp = Math.sin(p);
      var x = v[0] * cl - v[2] * sl, z = v[0] * sl + v[2] * cl, y = v[1];
      return [x, y * cp - z * sp, y * sp + z * cp];
    }
    function resize() {
      var r = cv.parentNode.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.round(r.width); cv.width = W * dpr; cv.height = W * dpr; cv.style.width = cv.style.height = W + "px";
      R = W * 0.4; cx = cy = W / 2; draw();
    }
    function palette() {
      var day = opts.theme() === "day";
      return day ? { ocean0: "#2A6BC9", ocean1: "#0F3478", rim: "rgba(255,255,255,.75)", halo: "rgba(120,190,255,.35)", dot: "255,255,255", dotA: .9, arc: "255,255,255", glow: "#BFE6FF", hub: "#FFFFFF", plane: "#1F5FC0" }
                 : { ocean0: "#123A7A", ocean1: "#050C24", rim: "rgba(140,240,215,.6)", halo: "rgba(70,200,190,.28)", dot: "170,220,255", dotA: .85, arc: "160,235,215", glow: "#8BE9CF", hub: "#FFFFFF", plane: "#0B3B7A" };
    }
    function draw(now) {
      if (!W) return;
      var P = palette();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, W);
      // atmosphere
      // ocean sphere, lit from the upper left
      var o = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R); o.addColorStop(0, P.ocean0); o.addColorStop(1, P.ocean1);
      ctx.fillStyle = o; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      // land dots, fading toward the limb
      var s = Math.max(1, R / 210);
      for (var i = 0; i < N; i++) {
        var q = rot([lv[i * 3], lv[i * 3 + 1], lv[i * 3 + 2]]);
        if (q[2] <= 0.02) continue;
        ctx.fillStyle = "rgba(" + P.dot + "," + (P.dotA * (0.25 + 0.75 * q[2])).toFixed(3) + ")";
        ctx.fillRect(cx + q[0] * R - s * 0.6, cy - q[1] * R - s * 0.6, s * 1.25, s * 1.25);
      }
      // rim light
      ctx.strokeStyle = P.rim; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      // routes
      var tt = ((now || 0) - t0) / 1000;
      cities.forEach(function (c) {
        var on = c.code === active || c.code === hover, alpha = c.dim ? 0.14 : on ? 1 : 0.5;
        ctx.lineWidth = on ? 2.2 : 1.3; ctx.lineCap = "round";
        var prev = null;
        for (var k = 0; k < c.arc.length; k++) {
          var q = rot(c.arc[k]), behind = q[2] < 0 && Math.hypot(q[0], q[1]) < 1;
          var pt = [cx + q[0] * R, cy - q[1] * R];
          if (prev && !behind && !prev[2]) { ctx.strokeStyle = "rgba(" + P.arc + "," + alpha + ")"; ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(pt[0], pt[1]); ctx.stroke(); }
          prev = [pt[0], pt[1], behind];
        }
        // a small aircraft glides along the selected route: eased take-off and landing, a smooth heading,
        // a contrail behind it, and a fade out on arrival and back in at Singapore so the loop never jumps
        if (on && !c.dim) {
          var CYCLE = 7, ph = reduced ? 0.5 : ((tt % CYCLE) / CYCLE), fly = 0.82;
          var u = reduced ? 0.55 : ph < fly ? ease(ph / fly) : 1;
          var fade = reduced ? 1 : Math.min(1, ph / 0.06) * (ph < fly ? 1 : Math.max(0, 1 - (ph - fly) / 0.1));
          var at = function (k) {   // a point anywhere along the arc, interpolated between samples
            k = Math.max(0, Math.min(1, k)) * (c.arc.length - 1); var i0 = Math.floor(k), i1 = Math.min(c.arc.length - 1, i0 + 1), fr = k - i0, A = c.arc[i0], B = c.arc[i1];
            return rot([A[0] + (B[0] - A[0]) * fr, A[1] + (B[1] - A[1]) * fr, A[2] + (B[2] - A[2]) * fr]);
          };
          var vis = function (q) { return !(q[2] < 0 && Math.hypot(q[0], q[1]) < 1); };
          if (fade > 0.01) {
            ctx.lineCap = "round";
            var TR = 0.14, steps = 24, prevq = at(u - TR);
            for (var j = 1; j <= steps; j++) {
              var qn = at(u - TR + TR * j / steps); if (!vis(prevq) || !vis(qn)) { prevq = qn; continue; }
              var w = j / steps;
              ctx.strokeStyle = "rgba(" + P.arc + "," + ((0.15 + 0.85 * w) * fade).toFixed(3) + ")"; ctx.lineWidth = 1.4 + 2.8 * w;
              ctx.beginPath(); ctx.moveTo(cx + prevq[0] * R, cy - prevq[1] * R); ctx.lineTo(cx + qn[0] * R, cy - qn[1] * R); ctx.stroke();
              prevq = qn;
            }
            var qp = at(u), qb = at(u - 0.02), qf = at(u + 0.02);
            if (vis(qp)) {
              var px = cx + qp[0] * R, py = cy - qp[1] * R;
              var ang = Math.atan2((cy - qf[1] * R) - (cy - qb[1] * R), (cx + qf[0] * R) - (cx + qb[0] * R));
              ctx.save(); ctx.globalAlpha = fade; ctx.translate(px, py); ctx.rotate(ang); ctx.scale(1.9, 1.9);
              ctx.beginPath();   // nose points along +x
              ctx.moveTo(10, 0); ctx.lineTo(4, -1.5); ctx.lineTo(0.5, -1.6); ctx.lineTo(-2, -8.5); ctx.lineTo(-4, -8.5); ctx.lineTo(-2.6, -1.6);
              ctx.lineTo(-7, -1.4); ctx.lineTo(-9, -4.6); ctx.lineTo(-10.4, -4.6); ctx.lineTo(-9.4, 0);
              ctx.lineTo(-10.4, 4.6); ctx.lineTo(-9, 4.6); ctx.lineTo(-7, 1.4); ctx.lineTo(-2.6, 1.6); ctx.lineTo(-4, 8.5); ctx.lineTo(-2, 8.5);
              ctx.lineTo(0.5, 1.6); ctx.lineTo(4, 1.5); ctx.closePath();
              ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.lineWidth = 0.8; ctx.strokeStyle = P.plane; ctx.stroke();
              ctx.restore();
            }
          }
        }
      });
      // pins ride on the surface; the hidden side is not clickable
      function place(el, v, lift) {
        var q = rot(v), front = q[2] > 0.05;
        el.style.transform = "translate(" + (cx + q[0] * R).toFixed(1) + "px," + (cy - q[1] * R).toFixed(1) + "px)";
        el.classList.toggle("back", !front); el.style.opacity = front ? Math.min(1, 0.35 + q[2] * 1.2).toFixed(2) : "0";
        el.style.zIndex = Math.round(q[2] * 100) + 100 + (lift || 0);
      }
      cities.forEach(function (c) { place(c.btn, c.v, c.code === active ? 50 : 0); c.btn.classList.toggle("on", c.code === active); c.btn.setAttribute("aria-pressed", String(c.code === active)); });
      place(hubEl, hubV, 40);
    }
    function frame(now) {
      raf = 0; var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now; if (!t0) t0 = now;
      var moving = false;
      if (target) {
        var k = Math.min(1, (now - target.start) / target.dur), e = ease(k);
        view.lon = target.fromLon + wrap(target.lon - target.fromLon) * e; view.lat = target.fromLat + (target.lat - target.fromLat) * e;
        if (k >= 1) target = null; moving = true;
      } else if (!drag) {
        if (Math.abs(vel) > 0.01) { view.lon += vel * dt; vel *= Math.pow(0.04, dt); moving = true; }
        else if (spin && now > idleUntil) { view.lon += spin * dt; moving = true; }
      }
      draw(now);
      if (running && visible && (moving || active || hover || drag)) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && running) raf = requestAnimationFrame(frame); }
    function turnTo(lat, lon, dur) {
      if (reduced || dur === 0) { target = null; view.lat = lat; view.lon = lon; draw(performance.now()); kick(); return; }
      target = { fromLon: view.lon, fromLat: view.lat, lon: lon, lat: lat, start: performance.now(), dur: dur || 1100 }; kick();
    }
    function pick(code, fromUser, instant) {
      var c = cities.filter(function (x) { return x.code === code; })[0]; if (!c) return;
      if (active !== code) t0 = performance.now();   // a new route always starts with a take-off from Singapore
      active = code; idleUntil = performance.now() + 6000;
      var mid = toLatLon(slerp(hubV, c.v, 0.5));   // frame the whole route: centre on its midpoint
      turnTo(Math.max(-25, Math.min(40, mid[0])), mid[1], instant ? 0 : 1200);
      if (opts.onPick) opts.onPick(code, fromUser);
      kick();
    }

    /* drag to spin, with a little inertia */
    cv.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, y: e.clientY, lon: view.lon, lat: view.lat, t: performance.now() }; target = null; vel = 0; cv.setPointerCapture(e.pointerId); cv.classList.add("grabbing"); kick(); });
    cv.addEventListener("pointermove", function (e) {
      if (!drag) return; var k = 180 / (Math.PI * R), nl = drag.lon - (e.clientX - drag.x) * k, now = performance.now();
      vel = (nl - view.lon) / Math.max(0.016, (now - drag.t) / 1000); drag.t = now;
      view.lon = nl; view.lat = Math.max(-45, Math.min(55, drag.lat + (e.clientY - drag.y) * k));
    });
    function endDrag() { if (!drag) return; drag = null; cv.classList.remove("grabbing"); vel = reduced ? 0 : Math.max(-120, Math.min(120, vel)); idleUntil = performance.now() + 4000; kick(); }
    cv.addEventListener("pointerup", endDrag); cv.addEventListener("pointercancel", endDrag);

    var io = window.IntersectionObserver ? new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) kick(); }) : null;
    if (io) io.observe(cv);
    window.addEventListener("resize", resize);
    running = true; resize(); kick();

    return {
      pick: pick,
      turnTo: turnTo,
      redraw: function () { draw(performance.now()); },
      destroy: function () { running = false; if (raf) cancelAnimationFrame(raf); if (io) io.disconnect(); window.removeEventListener("resize", resize); }
    };
  }
  window.AuroraGlobe = Globe;
})();
