/* Monarch Labs — contact: the brief, one question at a time (the Greed reservation console's approach). Next or
   Enter moves on, Back goes back, a missing answer gets one plain sentence. Each answer is written into the brief
   card beside the form as you go. The last question sends the brief (and the attached file, if any) straight to
   the form service in the form's data-endpoint, as a multipart POST; the page never opens a mail app. */
(() => {
  "use strict";
  const form = document.querySelector("[data-bf]");
  if (!form) return;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches, MAX = 10 * 1024 * 1024;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const qs = $$(".bf-q", form), err = $("[data-bf-err]", form), next = $("[data-bf-next]", form), back = $("[data-bf-back]", form);
  const card = $("[data-bf-card]"), state = $("[data-bf-state]"), ref = $("[data-bf-ref]");
  const file = form.elements.attachment, drop = $("[data-bf-drop]", form), fileName = $("[data-bf-file]", form), unfile = $("[data-bf-unfile]", form);
  const show = {}; $$("[data-bf-show]").forEach(el => { show[el.dataset.bfShow] = el; });
  const LAST = qs.length - 1;          /* the "sent" step */
  const S = { problem: 0, file: 1, services: 2, company: 3, name: 4, email: 5 };
  let at = 0, touched = false, sending = false;

  /* the card: a value lands with a short flash; empty shows a dash */
  const put = (k, v) => {
    const el = show[k], t = v || "—";
    if (el.textContent === t) return;
    el.textContent = t; el.classList.toggle("blank", !v);
    if (v && !still) { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); }
  };
  const picked = () => $$('.bf-opt[aria-pressed="true"]', form).map(b => b.dataset.svc);
  const v = k => form.elements[k].value.trim();
  const size = n => n < 1024 * 1024 ? Math.max(1, Math.round(n / 1024)) + " KB" : (n / 1024 / 1024).toFixed(1) + " MB";

  /* the main button says what it will do: Skip on an empty optional step, Send on the last question */
  const label = () => {
    const empty = (at === S.file && !file.files.length) || (at === S.services && !picked().length) || (at === S.company && !v("company"));
    $("span", next).textContent = sending ? "Sending…" : at === S.email ? "Send the brief" : empty ? "Skip" : "Next";
  };
  const go = i => {
    at = i; form.dataset.at = i; err.textContent = "";
    qs.forEach((q, n) => q.classList.toggle("on", n === i));
    label();
    const f = $("input:not([type=hidden]):not([type=file]), textarea", qs[i]) || $('.bf-opt[aria-pressed="true"]', qs[i]) || $(".bf-opt, .bf-drop input, .bf-ghost", qs[i]);
    if (f && touched) setTimeout(() => f.focus({ preventScroll: true }), still ? 0 : 60);
  };
  /* one plain sentence when something is missing */
  const check = () => {
    if (at === S.problem && v("problem").length < 3) return "A line or two about the problem, so we know where to start.";
    if (at === S.name && !v("name")) return "Your name, so we know who we’re writing to.";
    if (at === S.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email"))) return "That email doesn’t look complete yet.";
    return "";
  };

  /* the attachment: browse or drop; one file, up to 10 MB; the card shows its name and size */
  const setFile = () => {
    const f = file.files[0];
    if (f && f.size > MAX) { file.value = ""; err.textContent = `That file is ${size(f.size)}. Please keep it under 10 MB, or send a link in the problem.`; }
    const ok = file.files[0];
    fileName.textContent = ok ? ok.name : "Drop your file here, or browse";
    drop.classList.toggle("has", !!ok); unfile.hidden = !ok;
    put("file", ok ? `${ok.name} · ${size(ok.size)}` : ""); label();
  };
  file.addEventListener("change", () => { err.textContent = ""; setFile(); });
  ["dragenter", "dragover"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach(t => drop.addEventListener(t, () => drop.classList.remove("over")));
  drop.addEventListener("drop", e => {
    e.preventDefault();
    const f = e.dataTransfer && e.dataTransfer.files[0]; if (!f) return;
    const dt = new DataTransfer(); dt.items.add(f); file.files = dt.files; err.textContent = ""; setFile();
  });
  unfile.addEventListener("click", e => { e.preventDefault(); file.value = ""; setFile(); file.focus(); });

  /* send: multipart POST with everything, the file included; the card seals once the service says yes */
  const sendIt = async () => {
    const url = form.dataset.endpoint;
    if (!url) { err.textContent = "Sending isn’t connected yet. Write to hello@monarch.studio for now."; return; }
    const id = "ML-26-" + String(Math.floor(1000 + Math.random() * 9000));
    form.elements.reference.value = id;
    form.elements.services.value = picked().join(", ");
    form.elements._subject.value = "Brief " + id + " from " + v("name") + (v("company") ? " — " + v("company") : "");
    sending = true; label(); next.disabled = back.disabled = true; form.classList.add("busy");
    try {
      const r = await fetch(url, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.success === false || j.success === "false") throw new Error(j.message || r.status);
      ref.textContent = id; $("[data-bf-ref2]", form).textContent = id; $("[data-bf-first]", form).textContent = v("name").split(/\s+/)[0];
      state.textContent = "Sent"; card.classList.add("sealed");
      go(LAST);
    } catch (e) {
      err.textContent = "The brief didn’t go through. Check your connection and try again, or write to hello@monarch.studio.";
    } finally {
      sending = false; next.disabled = back.disabled = false; form.classList.remove("busy"); label();
    }
  };

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (sending) return;
    const m = check(); if (m) { err.textContent = m; return; }
    if (at === S.email) { sendIt(); return; }
    if (at < LAST) go(at + 1);
  });
  /* Enter moves on from the problem box too (Shift+Enter for a new line) */
  form.elements.problem.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
  back.addEventListener("click", () => { if (at > 0 && !sending) go(at - 1); });

  /* services: toggles; the card and the Next / Skip label follow */
  $$(".bf-opt", form).forEach(b => b.addEventListener("click", () => {
    b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
    put("services", picked().join(", ")); label();
  }));
  /* typing fills the card live */
  ["problem", "company", "name", "email"].forEach(k => form.elements[k].addEventListener("input", function () {
    put(k, this.value.trim()); label(); err.textContent = "";
  }));

  /* another brief: clear everything, back to the first question */
  $("[data-bf-again]", form).addEventListener("click", () => {
    form.reset(); $$(".bf-opt", form).forEach(b => b.setAttribute("aria-pressed", "false")); setFile();
    Object.keys(show).forEach(k => put(k, ""));
    card.classList.remove("sealed"); state.textContent = "Drafting"; ref.textContent = "ML-26-0000";
    go(0);
  });

  /* focus moves with the steps only once the visitor has used the form (no phone keyboard popping up on its own) */
  ["pointerdown", "keydown", "focusin"].forEach(t => form.addEventListener(t, () => { touched = true; }));
  go(0);
})();
