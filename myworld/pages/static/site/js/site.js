/* Ronalyn Caabay Asio: portfolio behaviour
   1. hero: scroll progress (--p) drives the zoom, blur and drifting tiles
   2. pointer parallax, blur-in reveals, nav highlight, mobile menu
   3. hobby collage, project dialog, contact form                       */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- entrance: start once the portrait is decoded ---------- */
  const portraitImg = $("#portrait img");
  const ready = () => root.classList.add("ready");
  const decoded = portraitImg && portraitImg.decode ? portraitImg.decode().catch(() => {}) : Promise.resolve();
  Promise.race([decoded, new Promise((r) => setTimeout(r, 1600))]).then(ready);

  /* ---------- nav highlight follows the scroll position (Home / About / Work / Toolkit / Contact) ---------- */
  const links = $$(".pill a");
  const spyEls = ["about", "work", "toolkit", "contact"].map((id) => document.getElementById(id)).filter(Boolean);
  let currentId = "";
  function updateNav() {
    const mid = window.innerHeight * 0.5;
    let id = "top";
    spyEls.forEach((s) => { if (s.getBoundingClientRect().top <= mid) id = s.id; });
    if (id !== currentId) { currentId = id; links.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + id))); }
  }

  /* ---------- hero: scroll -> --p (0 to 1) ---------- */
  const hero = $(".hero"), stick = $("#heroStick"), nav = $("#nav");
  const zoom = parseFloat(getComputedStyle(hero).getPropertyValue("--zoom")) || 150;
  let ticking = false, lastP = -1;
  function update() {
    ticking = false;
    const p = reduce ? 0 : clamp(window.scrollY / ((zoom / 100) * window.innerHeight), 0, 1);
    if (p !== lastP) { stick.style.setProperty("--p", p.toFixed(4)); stick.classList.toggle("past", p > 0.04); lastP = p; }
    updateNav();
  }
  const requestUpdate = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();

  /* ---------- pointer parallax (hero tiles/cards + about figure) ---------- */
  if (!reduce && finePointer) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    stick.addEventListener("pointermove", (e) => { tx = (e.clientX / window.innerWidth - 0.5) * 2; ty = (e.clientY / window.innerHeight - 0.5) * 2; });
    stick.addEventListener("pointerleave", () => { tx = 0; ty = 0; });
    (function loop() {
      if (window.scrollY < window.innerHeight * 2.5) {
        cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
        if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) { stick.style.setProperty("--mx", cx.toFixed(3)); stick.style.setProperty("--my", cy.toFixed(3)); }
      }
      requestAnimationFrame(loop);
    })();
    const panel = $("#figurePanel");
    if (panel) {
      panel.addEventListener("pointermove", (e) => {
        const r = panel.getBoundingClientRect();
        panel.style.setProperty("--fx", ((e.clientX - r.left) / r.width - 0.5) * -22 + "px");
        panel.style.setProperty("--fy", ((e.clientY - r.top) / r.height - 0.5) * -10 + "px");
      });
      panel.addEventListener("pointerleave", () => { panel.style.setProperty("--fx", "0px"); panel.style.setProperty("--fy", "0px"); });
    }
  }

  /* ---------- blur-in reveals ---------- */
  const reveals = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add("in"));

  /* ---------- nav: current section + mobile menu ---------- */
  const menu = $("#menu"), menuBtn = $("#menuBtn");
  const setMenu = (open) => { menu.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", String(open)); menuBtn.textContent = open ? "Close" : "Menu"; };
  menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  links.forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- hobbies: layered cut-outs, one comes forward at a time ---------- */
  const stage = $("#hobbyStage");
  if (stage) {
    const imgs = $$(".hobby", stage), tabs = $$(".hobby-tab"), label = $("#hobbyLabel");
    const names = Object.fromEntries(tabs.map((t) => [t.dataset.hobby, t.textContent.trim()]));
    const ids = tabs.map((t) => t.dataset.hobby);
    let current = ids[0], userTouched = false, timer = 0;
    function setHobby(id) {
      current = id; stage.dataset.active = id;
      imgs.forEach((i) => i.classList.toggle("active", i.dataset.id === id));
      tabs.forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.hobby === id)));
      label.textContent = names[id] || "";
    }
    const choose = (id) => { userTouched = true; clearInterval(timer); setHobby(id); };
    tabs.forEach((t) => { t.addEventListener("click", () => choose(t.dataset.hobby)); t.addEventListener("pointerenter", () => { if (finePointer) choose(t.dataset.hobby); }); });
    imgs.forEach((i) => i.addEventListener("click", () => choose(i.dataset.id)));
    setHobby(current);
    if (!reduce && "IntersectionObserver" in window) {   // gentle auto-cycle until the visitor interacts
      new IntersectionObserver(([en]) => {
        clearInterval(timer);
        if (en.isIntersecting && !userTouched) timer = setInterval(() => setHobby(ids[(ids.indexOf(current) + 1) % ids.length]), 2800);
      }, { threshold: 0.4 }).observe(stage);
    }
  }

  /* ---------- project details dialog ---------- */
  const dlg = $("#projectDialog");
  if (dlg) {
    const fill = (card) => {
      const d = card.dataset;
      $("#pdName").textContent = d.name; $("#pdRole").textContent = d.role || ""; $("#pdText").textContent = d.text;
      const img = $("#pdImage"); img.src = d.image || ""; img.alt = d.image ? "Screenshot of " + d.name : ""; img.hidden = !d.image;
      const tags = $("#pdTags"); tags.textContent = "";
      (d.tech || "").split(",").map((t) => t.trim()).filter(Boolean).forEach((t) => { const li = document.createElement("li"); li.textContent = t; tags.appendChild(li); });
      const links = $("#pdLinks"); links.textContent = "";
      [["Live site", d.live, "btn btn-dark"], ["Source code", d.repo, "btn btn-light"]].forEach(([text, href, cls]) => {
        if (!href) return; const a = document.createElement("a"); a.className = cls; a.href = href; a.target = "_blank"; a.rel = "noopener"; a.textContent = text; links.appendChild(a);
      });
    };
    $$(".project-card").forEach((card) => card.addEventListener("click", () => { fill(card); dlg.showModal(); }));
    $("#pdClose").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  }

  /* ---------- contact form ---------- */
  const form = $("#contactForm");
  if (form) {
    const status = $("#formStatus"), btn = $("button[type=submit]", form);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = new FormData(form), name = (f.get("name") || "").trim(), email = (f.get("email") || "").trim(), message = (f.get("message") || "").trim();
      if (!name || !message || !/^\S+@\S+\.\S+$/.test(email)) { status.textContent = "Please add your name, a valid email and a message."; status.className = "form-status err"; return; }
      btn.disabled = true; status.textContent = "Sending..."; status.className = "form-status";
      try {
        const csrf = (document.querySelector('meta[name="csrf-token"]') || {}).content || "";
        const res = await fetch(form.dataset.url, { method: "POST", headers: { "Content-Type": "application/json", "X-CSRFToken": csrf }, body: JSON.stringify({ name, email, message, website: f.get("website") || "" }) });
        const out = await res.json().catch(() => ({}));
        if (res.ok && out.ok) { form.reset(); status.textContent = "Message sent. Thank you, I'll reply soon."; status.className = "form-status ok"; }
        else { status.textContent = out.error || "Something went wrong. Please try again."; status.className = "form-status err"; }
      } catch (err) { status.textContent = "Network error. Please try again or email me directly."; status.className = "form-status err"; }
      btn.disabled = false;
    });
  }
})();
