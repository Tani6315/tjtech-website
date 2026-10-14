/* ==========================================================================
   TJ Tech — renders projects from data/projects.js
   (cards on Home/Portfolio and the full project.html case-study page)
   ========================================================================== */
(() => {
  "use strict";
  const DATA = Array.isArray(window.TJ_PROJECTS) ? window.TJ_PROJECTS : [];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "");
  const assetUrl = (u) => (/^(https?:|data:|blob:)/i.test(u || "") ? u : String(u || "").replace(/^\/+/, ""));

  const I = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    ext: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
    expand: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    left: '<path d="M15 18l-6-6 6-6"/>',
    right: '<path d="M9 18l6-6-6-6"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    trend: '<path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  };
  const svg = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
  const GH = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"/></svg>';

  const TECH_ICONS = {
    "html": "html5", "html5": "html5", "css": "css3", "css3": "css3", "tailwind css": "tailwindcss", "javascript": "javascript", "typescript": "typescript",
    "react": "react", "react (tsx)": "react", "react native": "react", "next.js": "nextjs:invert", "node.js": "nodejs", "express": "express:invert", "express.js": "express:invert",
    "mongodb": "mongodb", "mysql": "mysql:bright", "postgresql": "postgresql", "firebase": "firebase", "flutter": "flutter", "php": "php:bright", "laravel": "laravel",
    "python": "python", "wordpress": "wordpress:invert", "figma": "figma", "git": "git", "github": "github:invert", "vercel": "vercel:invert", "docker": "docker",
    "bootstrap": "bootstrap", "cloudflare workers": "cloudflareworkers", "cloudflare d1": "cloudflare", "cloudflare turnstile": "cloudflare", "cloudflare": "cloudflare",
    "d1 (sqlite)": "sqlite", "sqlite": "sqlite", "android studio": "androidstudio",
  };
  const techIcon = (name) => {
    const v = TECH_ICONS[String(name).toLowerCase().trim()];
    if (!v) return "";
    const [file, cls] = v.split(":");
    return `<img src="assets/tech/${file}.svg" alt="" ${cls ? `class="${cls}"` : ""} width="22" height="22" loading="lazy">`;
  };

  const TYPE_LABEL = { website: "Website", software: "Custom Software", app: "Mobile App" };
  const badge = (p) => {
    const map = {
      live: ["live", p.source === "demo" ? "Live Demo" : "Live"],
      private: ["private", "Confidential"],
      development: ["demo", "In Development"],
      demo: ["demo", "Demo"],
    };
    return map[p.status] || map.demo;
  };
  const sourceLabel = (p) => (p.source === "demo" ? "Demo Project" : "Real World Project");
  const cover = (p) => (p.images && p.images[0] ? assetUrl(p.images[0].src) : "assets/img/logo-full-t.png");
  const detailUrl = (p) => `project.html?id=${encodeURIComponent(p.id)}`;

  /* ---------- cards ---------- */
  function card(p, i, wide) {
    const [btype, btext] = badge(p);
    const chips = (p.tech || []).slice(0, 5).map((t) => `<span class="chip">${esc(t)}</span>`).join("");
    const url = safeUrl(p.url);
    const shots = (p.images || []).length;
    let foot = `<a class="link-arrow" href="${detailUrl(p)}">View Project ${svg("arrow")}</a>`;
    if (url) foot += `<a class="btn btn--ghost btn--sm" href="${esc(url)}" target="_blank" rel="noopener">Visit Website ${svg("ext")}</a>`;
    else if (p.confidential) foot += `<span class="note">${svg("lock")} Demo data only</span>`;
    else if (p.status === "development") foot += `<span class="note">${svg("phone")} In development</span>`;
    const cats = [p.type === "app" ? "apps" : p.type === "software" ? "software" : "websites", p.source === "demo" ? "demo" : "real"].join(" ");
    return `<article class="project${wide ? " project--feature" : ""}" data-cat="${cats}" data-reveal style="--d:${((i % 2) * 0.08).toFixed(2)}s">
  <a class="project__media" href="${detailUrl(p)}" aria-label="${esc(p.title)} — view project">
    <img src="${esc(cover(p))}" alt="${esc(p.title)} — ${esc(p.kind)} preview" loading="lazy" onerror="this.style.opacity=0">
    <div class="project__badges"><span class="badge badge--${btype}">${btext}</span><span class="badge">${sourceLabel(p)}</span>${shots > 1 ? `<span class="badge">${svg("image")} ${shots} screens</span>` : ""}</div>
  </a>
  <div class="project__body">
    <span class="project__cat">${esc(p.kind || TYPE_LABEL[p.type] || "")}</span>
    <h3><a href="${detailUrl(p)}">${esc(p.title)}</a></h3>
    <p>${esc(p.summary)}</p>
    <div class="chips">${chips}</div>
    <div class="project__foot">${foot}</div>
  </div>
</article>`;
  }

  // First card wide; if the rest is odd, make the second wide too so pairs line up.
  function renderList(el, list) {
    el.innerHTML = list.map((p, i) => card(p, i, i === 0 || (i === 1 && (list.length - 1) % 2 === 1))).join("") ||
      '<p class="muted center" style="grid-column:1/-1">Projects will appear here soon.</p>';
  }

  document.querySelectorAll("[data-projects]").forEach((el) => {
    const mode = el.dataset.projects;
    let list = DATA.slice();
    if (mode === "featured") { const f = list.filter((p) => p.featured); list = (f.length ? f : list).slice(0, +el.dataset.limit || 4); }
    renderList(el, list);
  });

  // dynamic counters on the portfolio page
  const counts = { real: DATA.filter((p) => p.source !== "demo").length, demo: DATA.filter((p) => p.source === "demo").length, total: DATA.length, screens: DATA.reduce((n, p) => n + (p.images || []).length, 0) };
  document.querySelectorAll("[data-stat]").forEach((el) => el.setAttribute("data-count", counts[el.dataset.stat] || 0));

  /* ---------- detail page ---------- */
  const detail = document.querySelector("[data-project-detail]");
  if (!detail) return;
  const id = new URLSearchParams(location.search).get("id");
  const idx = DATA.findIndex((p) => p.id === id);
  const p = DATA[idx];
  if (!p) {
    detail.innerHTML = `<section class="page-hero"><div class="container"><span class="eyebrow">404</span><h1>Project not found</h1><p class="lead">This project may have been moved or removed.</p><div class="mt-40"><a href="portfolio.html" class="btn btn--primary">Back to Portfolio ${svg("arrow")}</a></div></div></section>`;
    return;
  }
  document.title = `${p.title} — ${p.kind || "Project"} | TJ Tech`;
  const md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute("content", p.summary || "");

  const [btype, btext] = badge(p);
  const url = safeUrl(p.url), repo = safeUrl(p.repo);
  const imgs = p.images || [];
  const actions = [
    url ? `<a class="btn btn--primary" href="${esc(url)}" target="_blank" rel="noopener" data-magnetic>Visit Live Website ${svg("ext")}</a>` : "",
    repo ? `<a class="btn btn--ghost" href="${esc(repo)}" target="_blank" rel="noopener">${GH} View Code</a>` : "",
    !url ? `<a class="btn btn--primary" href="contact.html" data-magnetic>${p.confidential ? "Request a Live Demo" : "Discuss a Similar Project"} ${svg("arrow")}</a>` : `<a class="btn btn--ghost" href="contact.html">Build Something Similar</a>`,
  ].join("");

  const meta = [
    ["Type", TYPE_LABEL[p.type] || "Project"],
    ["Project", sourceLabel(p).replace(" Project", "")],
    ["Status", btext],
    imgs.length ? ["Screens", `${imgs.length} screenshot${imgs.length > 1 ? "s" : ""}`] : null,
  ].filter(Boolean).map(([k, v]) => `<div><small>${k}</small><strong>${esc(v)}</strong></div>`).join("");

  const gallery = imgs.length > 1 ? `
<section class="section section--tight">
  <div class="container">
    <div class="section-head"><span class="eyebrow" data-reveal>Screens</span><h2 class="h2" data-reveal>Inside the <span class="grad-text">${esc(p.title)}</span></h2>${p.confidential ? `<p class="lead" data-reveal>${svg("lock")} Real customer data is private — these screenshots use demo data only.</p>` : ""}</div>
    <div class="gallery">${imgs.map((im, i) => `<figure class="shot" data-reveal style="--d:${((i % 3) * 0.06).toFixed(2)}s"><button type="button" data-lb="${i}" aria-label="Open screenshot: ${esc(im.caption || p.title)}"><img src="${esc(assetUrl(im.src))}" alt="${esc(im.caption || p.title)}" loading="lazy"><span class="shot__zoom">${svg("expand")}</span></button>${im.caption ? `<figcaption>${esc(im.caption)}</figcaption>` : ""}</figure>`).join("")}</div>
  </div>
</section>` : "";

  const story = p.client || (p.goals && p.goals.length) || p.result ? `
<section class="section section--alt">
  <div class="container">
    <div class="section-head"><span class="eyebrow" data-reveal>Case study</span><h2 class="h2" data-reveal>The story behind <span class="grad-text">the project</span></h2></div>
    <div class="story">
      ${p.client ? `<div class="card" data-reveal><div class="card__icon">${svg("user")}</div><h3>The client</h3><p>${esc(p.client)}</p></div>` : ""}
      ${p.goals && p.goals.length ? `<div class="card" data-reveal style="--d:.08s"><div class="card__icon">${svg("target")}</div><h3>The goal</h3><ul class="ticks">${p.goals.map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div>` : ""}
      ${p.result ? `<div class="card" data-reveal style="--d:.16s"><div class="card__icon">${svg("trend")}</div><h3>The result</h3><p>${esc(p.result)}</p></div>` : ""}
    </div>
  </div>
</section>` : "";

  const feats = (p.features || []).filter((g) => g.items && g.items.length);
  const featureHtml = feats.length ? `
<section class="section">
  <div class="container">
    <div class="section-head"><span class="eyebrow" data-reveal>Features & functionality</span><h2 class="h2" data-reveal>What it <span class="grad-text">can do</span></h2></div>
    <div class="feature-groups">${feats.map((g, i) => `<div class="card feature-group" data-reveal style="--d:${((i % 2) * 0.08).toFixed(2)}s"><span class="card__num">${String(i + 1).padStart(2, "0")}</span><h3>${esc(g.title)}</h3><ul class="ticks">${g.items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>`).join("")}</div>
  </div>
</section>` : "";

  const techHtml = (p.tech || []).length ? `
<section class="section section--tight section--alt">
  <div class="container">
    <div class="section-head"><span class="eyebrow" data-reveal>Technology</span><h2 class="h2" data-reveal>Languages & technologies</h2></div>
    <div class="tech-pills" data-reveal>${p.tech.map((t) => `<span class="pill">${techIcon(t)}${esc(t)}</span>`).join("")}</div>
    ${(p.tags || []).length ? `<div class="chips mt-40" data-reveal>${p.tags.map((t) => `<span class="chip">#${esc(t)}</span>`).join("")}</div>` : ""}
  </div>
</section>` : "";

  const prev = DATA[(idx - 1 + DATA.length) % DATA.length], next = DATA[(idx + 1) % DATA.length];
  const navHtml = DATA.length > 1 ? `
<section class="section section--tight">
  <div class="container"><div class="pn">
    <a href="${detailUrl(prev)}" class="pn__item">${svg("left")}<span><small>Previous project</small><strong>${esc(prev.title)}</strong></span></a>
    <a href="portfolio.html" class="pn__all">All projects</a>
    <a href="${detailUrl(next)}" class="pn__item pn__item--next"><span><small>Next project</small><strong>${esc(next.title)}</strong></span>${svg("right")}</a>
  </div></div>
</section>` : "";

  detail.innerHTML = `
<section class="page-hero project-hero">
  <div class="container">
    <div class="breadcrumb" data-reveal><a href="index.html">Home</a>${svg("right")}<a href="portfolio.html">Portfolio</a>${svg("right")}<span>${esc(p.title)}</span></div>
    <div class="project__badges static" data-reveal><span class="badge badge--${btype}">${btext}</span><span class="badge">${sourceLabel(p)}</span></div>
    <span class="eyebrow" data-reveal>${esc(p.kind || "")}</span>
    <h1 data-split>${esc(p.title)}</h1>
    <p class="lead" data-reveal style="--d:.3s;max-width:780px">${esc(p.summary)}</p>
    <div class="hero__actions" data-reveal style="--d:.4s;margin-top:34px">${actions}</div>
    <div class="project-meta" data-reveal style="--d:.5s">${meta}</div>
    ${imgs[0] ? `<div class="project-cover frame" data-reveal="zoom" style="--d:.2s"><button type="button" data-lb="0" aria-label="Open screenshot"><img src="${esc(assetUrl(imgs[0].src))}" alt="${esc(imgs[0].caption || p.title)}"></button></div>` : ""}
  </div>
</section>
${story}${gallery}${featureHtml}${techHtml}${navHtml}`;

  /* lightbox */
  if (!imgs.length) return;
  const lb = document.createElement("div");
  lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Screenshot viewer");
  lb.innerHTML = `<button class="lb-btn lb-close" aria-label="Close">${svg("x")}</button>${imgs.length > 1 ? `<button class="lb-btn lb-prev" aria-label="Previous">${svg("left")}</button><button class="lb-btn lb-next" aria-label="Next">${svg("right")}</button>` : ""}<figure><img alt=""><figcaption></figcaption></figure>`;
  document.body.appendChild(lb);
  const lbImg = lb.querySelector("img"), lbCap = lb.querySelector("figcaption");
  let cur = 0, lastFocus = null;
  const show = (i) => { cur = (i + imgs.length) % imgs.length; lbImg.src = assetUrl(imgs[cur].src); lbImg.alt = imgs[cur].caption || p.title; lbCap.textContent = `${cur + 1} / ${imgs.length}${imgs[cur].caption ? " — " + imgs[cur].caption : ""}`; };
  const open = (i) => { lastFocus = document.activeElement; show(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; lb.querySelector(".lb-close").focus(); };
  const close = () => { lb.classList.remove("open"); document.body.style.overflow = ""; lastFocus && lastFocus.focus(); };
  detail.addEventListener("click", (e) => { const b = e.target.closest("[data-lb]"); if (b) open(+b.dataset.lb); });
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.closest(".lb-close")) close(); else if (e.target.closest(".lb-prev")) show(cur - 1); else if (e.target.closest(".lb-next")) show(cur + 1); });
  document.addEventListener("keydown", (e) => { if (!lb.classList.contains("open")) return; if (e.key === "Escape") close(); if (e.key === "ArrowLeft") show(cur - 1); if (e.key === "ArrowRight") show(cur + 1); });
  let tx = 0; lb.addEventListener("touchstart", (e) => (tx = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) show(cur + (d < 0 ? 1 : -1)); });
})();
