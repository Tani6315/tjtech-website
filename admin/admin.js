/* ==========================================================================
   TJ Tech Admin Dashboard
   Two ways to save:
   1. Node.js server (npm start)  → saves straight to the server's files via /api
   2. GitHub (Vercel / Netlify)   → commits data + pictures to the repository;
                                     the host redeploys the site automatically
   ========================================================================== */
(() => {
  "use strict";
  const CFG = Object.assign({ github: {}, githubApi: "https://api.github.com", dataPath: "data/projects.js", uploadsDir: "assets/uploads" }, window.TJ_ADMIN_CONFIG || {});
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const store = {
    get(k, d = null) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
    sget(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch {} },
    sdel(k) { try { sessionStorage.removeItem(k); } catch {} },
  };

  const ICON = {
    up: '<svg viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
    left: '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',
    right: '<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    cover: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  };
  const TECH_SUGGEST = ["HTML", "CSS", "JavaScript", "TypeScript", "Tailwind CSS", "React", "React (TSX)", "Next.js", "Node.js", "Express", "MongoDB", "MySQL", "PostgreSQL", "Firebase", "Flutter", "PHP", "Laravel", "Python", "WordPress", "Cloudflare Workers", "Cloudflare D1", "PWA", "Vercel"];
  const STATUS_LABEL = { live: "Live", private: "Confidential", development: "In Development", demo: "Demo" };
  const TYPE_LABEL = { website: "Website", software: "Custom Software", app: "Mobile App" };

  const S = { mode: "readonly", projects: [], saved: [], dirty: false, editIndex: -1, draft: null, nodeToken: store.sget("tj_node_token"), gh: null };

  /* ------------------------------------------------------------ utilities */
  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  const slugify = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "project";
  const uniqueId = (base, ignoreIndex) => { let id = slugify(base), n = 2; const taken = (x) => S.projects.some((p, i) => i !== ignoreIndex && p.id === x); while (taken(id)) id = `${slugify(base)}-${n++}`; return id; };
  const lines = (t) => String(t || "").split(/\r?\n/).map((s) => s.replace(/^[\s•*\-–]+/, "").trim()).filter(Boolean);
  const csv = (t) => String(t || "").split(",").map((s) => s.trim()).filter(Boolean);
  const isUrl = (u) => !u || /^https?:\/\/[^\s]+\.[^\s]+/i.test(u);
  const imgUrl = (src) => (/^(data:|blob:|https?:)/.test(src) ? src : "../" + src);
  const b64FromDataUrl = (d) => d.slice(d.indexOf(",") + 1);
  const utf8ToB64 = (str) => { const bytes = new TextEncoder().encode(str); let bin = ""; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(bin); };

  function serialize(projects) {
    return "/* TJ Tech portfolio data — managed from the admin dashboard (/admin). */\nwindow.TJ_PROJECTS = " + JSON.stringify(projects, null, 2) + ";\n";
  }
  function parseData(text) {
    const m = String(text).match(/window\.TJ_PROJECTS\s*=\s*([\s\S]*?);?\s*$/);
    if (!m) throw new Error("Could not read data/projects.js");
    return JSON.parse(m[1]);
  }

  function toast(msg, type = "") {
    const t = document.createElement("div"); t.className = `toast ${type}`; t.textContent = msg;
    $("#toasts").appendChild(t); setTimeout(() => t.remove(), type === "err" ? 9000 : 5000);
  }
  function busy(on, title = "Publishing…", step = "") { $("#busy").hidden = !on; $("#busyTitle").textContent = title; $("#busyStep").textContent = step; }
  const step = (t) => ($("#busyStep").textContent = t);
  function confirmBox(title, text, yes = "Delete") {
    return new Promise((res) => {
      const m = $("#modal"); $("#modalTitle").textContent = title; $("#modalText").textContent = text; $('[data-modal="yes"]', m).textContent = yes; m.hidden = false;
      const done = (v) => { m.hidden = true; m.removeEventListener("click", h); document.removeEventListener("keydown", k); res(v); };
      const h = (e) => { if (e.target === m || e.target.dataset.modal === "no") done(false); if (e.target.dataset.modal === "yes") done(true); };
      const k = (e) => { if (e.key === "Escape") done(false); };
      m.addEventListener("click", h); document.addEventListener("keydown", k); $('[data-modal="no"]', m).focus();
    });
  }

  /* ------------------------------------------------------------ backends */
  const Node = {
    async status() { try { const r = await fetch("../api/status", { cache: "no-store" }); if (!r.ok) return false; const j = await r.json(); return j && j.mode === "node"; } catch { return false; } },
    async call(path, opts = {}) {
      const r = await fetch("../api/" + path, { ...opts, headers: { "Content-Type": "application/json", Authorization: "Bearer " + (S.nodeToken || ""), ...(opts.headers || {}) } });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) { logout(true); throw new Error("Session expired — please sign in again."); }
      if (!r.ok) throw new Error(j.error || `Server error (${r.status})`);
      return j;
    },
    async login(pw) { const r = await fetch("../api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || "Wrong password"); return j.token; },
    async load() { return (await Node.call("projects")).projects; },
    async publish({ projects, files, remove }) { step("Saving to the server…"); await Node.call("publish", { method: "POST", body: JSON.stringify({ projects, files, remove }) }); },
    async setPassword(hash) { await Node.call("password", { method: "POST", body: JSON.stringify({ hash }) }); },
  };

  const GH = {
    cfg() { const g = S.gh || {}; return g.owner && g.repo && g.branch && g.token ? g : null; },
    async api(path, opts = {}) {
      const g = GH.cfg(); if (!g) throw new Error("GitHub is not connected. Open Settings first.");
      const r = await fetch(`${CFG.githubApi.replace(/\/$/, "")}/repos/${encodeURIComponent(g.owner)}/${encodeURIComponent(g.repo)}${path}`, {
        ...opts, cache: "no-store",
        headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${g.token}`, "X-GitHub-Api-Version": "2022-11-28", ...(opts.body ? { "Content-Type": "application/json" } : {}), ...(opts.headers || {}) },
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        const hint = r.status === 401 ? " — the token is invalid or expired." : r.status === 403 ? " — the token needs Contents: Read and write permission." : r.status === 404 ? " — repository, branch or file not found (check the names and token access)." : "";
        throw new Error(`GitHub: ${j.message || r.statusText}${hint}`);
      }
      return r;
    },
    path: (p) => p.split("/").map(encodeURIComponent).join("/"),
    // site files may live in a sub-folder of the repo (e.g. "tjtech/")
    full: (p) => { const d = String((S.gh && S.gh.dir) || "").replace(/^\/+|\/+$/g, ""); return d ? `${d}/${p}` : p; },
    async test() {
      const j = await (await GH.api("")).json();
      if (j.permissions && !j.permissions.push) throw new Error("This token can read but not write to the repository.");
      await GH.api(`/git/ref/heads/${GH.path(S.gh.branch)}`);
      // find the website folder automatically: try the typed folder first, then the repo root, then "tjtech"
      const typed = String(S.gh.dir || "");
      let found = false;
      for (const d of [...new Set([typed, "", "tjtech"])]) {
        S.gh.dir = d;
        try { await GH.raw(CFG.dataPath); found = true; break; } catch {}
      }
      if (!found) { S.gh.dir = typed; throw new Error(`Could not find ${CFG.dataPath} in the repository. Check the owner, repository name, branch and token access.`); }
      const fld = document.querySelector("#ghForm [name=dir]"); if (fld) fld.value = S.gh.dir;
      return j;
    },
    async raw(path) { return GH.api(`/contents/${GH.path(GH.full(path))}?ref=${encodeURIComponent(S.gh.branch)}`, { headers: { Accept: "application/vnd.github.raw+json" } }); },
    async load() { return parseData(await (await GH.raw(CFG.dataPath)).text()); },
    async commit(message, entries) {
      const g = S.gh;
      step("Reading the latest version…");
      const ref = await (await GH.api(`/git/ref/heads/${GH.path(g.branch)}`)).json();
      const base = await (await GH.api(`/git/commits/${ref.object.sha}`)).json();
      const tree = [];
      let n = 0;
      for (const e of entries) {
        if (e.delete) { tree.push({ path: GH.full(e.path), mode: "100644", type: "blob", sha: null }); continue; }
        n++; step(`Uploading ${e.label || e.path} (${n}/${entries.filter((x) => !x.delete).length})…`);
        const blob = await (await GH.api("/git/blobs", { method: "POST", body: JSON.stringify({ content: e.base64, encoding: "base64" }) })).json();
        tree.push({ path: GH.full(e.path), mode: "100644", type: "blob", sha: blob.sha });
      }
      step("Creating commit…");
      const t = await (await GH.api("/git/trees", { method: "POST", body: JSON.stringify({ base_tree: base.tree.sha, tree }) })).json();
      const c = await (await GH.api("/git/commits", { method: "POST", body: JSON.stringify({ message, tree: t.sha, parents: [ref.object.sha] }) })).json();
      step("Publishing…");
      await GH.api(`/git/refs/heads/${GH.path(g.branch)}`, { method: "PATCH", body: JSON.stringify({ sha: c.sha, force: false }) });
    },
    async publish({ projects, files, remove, message }) {
      const entries = [
        ...files.map((f) => ({ path: f.path, base64: f.base64, label: "picture" })),
        { path: CFG.dataPath, base64: utf8ToB64(serialize(projects)), label: "project data" },
        ...remove.map((p) => ({ path: p, delete: true })),
      ];
      await GH.commit(message, entries);
    },
    async setPassword(hash) {
      const text = await (await GH.raw("admin/config.js")).text();
      const next = text.replace(/("passwordHash"\s*:\s*")[0-9a-f]*(")/, `$1${hash}$2`);
      if (next === text) throw new Error("Could not find passwordHash in admin/config.js");
      await GH.commit("Admin: update password", [{ path: "admin/config.js", base64: utf8ToB64(next), label: "config" }]);
    },
    // show pictures that are committed but not deployed yet
    async fallbackImage(img, src) {
      if (img.dataset.fallback || !GH.cfg() || /^(data:|blob:|https?:)/.test(src)) return;
      img.dataset.fallback = "1";
      try { const b = await (await GH.raw(src)).blob(); img.src = URL.createObjectURL(b); } catch {}
    },
  };
  window.__tjImgErr = (img) => { if (S.mode === "github") GH.fallbackImage(img, img.dataset.src); };

  const backend = () => (S.mode === "node" ? Node : S.mode === "github" ? GH : null);

  /* ------------------------------------------------------------ login */
  async function login(pw) {
    if (S.mode === "node") { S.nodeToken = await Node.login(pw); store.sset("tj_node_token", S.nodeToken); return; }
    if ((await sha256(pw)) !== CFG.passwordHash) throw new Error("Wrong password");
    store.sset("tj_admin_ok", CFG.passwordHash);
  }
  function logout(silent) {
    store.sdel("tj_admin_ok"); store.sdel("tj_node_token"); S.nodeToken = null;
    $("#app").hidden = true; $("#login").hidden = false; $("#loginPw").value = "";
    if (silent) $("#loginErr").textContent = "Please sign in again.";
  }
  const isLoggedIn = () => (S.mode === "node" ? !!S.nodeToken : store.sget("tj_admin_ok") === CFG.passwordHash);

  /* ------------------------------------------------------------ data load */
  async function loadProjects() {
    try {
      if (S.mode === "node" || S.mode === "github") S.projects = await backend().load();
      else S.projects = await loadLocalScript();
    } catch (e) {
      toast(e.message, "err");
      S.projects = await loadLocalScript().catch(() => []);
      if (S.mode === "github") { S.mode = "readonly"; updateConn("GitHub error — read-only", "warn"); }
    }
    S.saved = clone(S.projects); S.dirty = false;
  }
  function loadLocalScript() {
    return new Promise((res, rej) => {
      const s = document.createElement("script"); s.src = `../${CFG.dataPath}?t=${Date.now()}`;
      s.onload = () => res(clone(window.TJ_PROJECTS || [])); s.onerror = () => rej(new Error("Could not load project data")); document.body.appendChild(s);
    });
  }

  function updateConn(text, cls) { const c = $("#conn"); c.className = `conn ${cls || ""}`; $("span", c).textContent = text; }
  function refreshMode() {
    const b = $("#banner");
    if (S.mode === "node") { updateConn("Node.js server", "ok"); b.hidden = true; }
    else if (S.mode === "github") { updateConn(`GitHub: ${S.gh.owner}/${S.gh.repo}`, "ok"); b.hidden = true; }
    else { updateConn("Not connected (read-only)", "warn"); b.hidden = false; b.innerHTML = 'Read-only mode — to save changes, <a href="#settings">connect your GitHub repository</a> in Settings, or run the site with <b>npm start</b> (Node.js).'; }
    $("#nodePanel").hidden = S.mode !== "node"; $("#ghPanel").hidden = S.mode === "node";
  }

  /* ------------------------------------------------------------ publish */
  // Work out new picture files + orphaned uploads, then send everything in one go.
  async function publishAll(nextProjects, message) {
    const be = backend();
    if (!be) { toast("Connect GitHub in Settings (or run npm start) before saving.", "err"); location.hash = "#settings"; return false; }
    const projects = clone(nextProjects);
    const files = [];
    projects.forEach((p) => (p.images || []).forEach((im, i) => {
      if (/^data:image\//.test(im.src)) {
        const ext = im.src.startsWith("data:image/webp") ? "webp" : im.src.startsWith("data:image/png") ? "png" : "jpg";
        const path = `${CFG.uploadsDir}/${p.id}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}-${i + 1}.${ext}`;
        files.push({ path, base64: b64FromDataUrl(im.src) }); im.src = path;
      }
    }));
    const used = new Set(projects.flatMap((p) => (p.images || []).map((im) => im.src)));
    const before = new Set(S.saved.flatMap((p) => (p.images || []).map((im) => im.src)));
    const remove = [...before].filter((src) => src.startsWith(CFG.uploadsDir + "/") && !used.has(src));
    busy(true, "Publishing…", "Preparing…");
    try {
      await be.publish({ projects, files, remove, message });
      S.projects = projects; S.saved = clone(projects); S.dirty = false;
      busy(false);
      toast(S.mode === "github" ? "Published! Your website updates in about a minute, after the host redeploys." : "Saved! The website is updated.", "ok");
      return true;
    } catch (e) {
      busy(false); toast(e.message || "Publishing failed", "err"); return false;
    }
  }

  /* ------------------------------------------------------------ router */
  function route() {
    const h = location.hash.replace(/^#/, "") || "projects";
    document.body.classList.remove("nav-open");
    const [view, arg] = h.split("/");
    $$(".view").forEach((v) => (v.hidden = true));
    $$(".side__nav a").forEach((a) => a.classList.toggle("active", a.dataset.nav === (view === "edit" ? "projects" : view)));
    $("#topActions").innerHTML = "";
    if (view === "new" || view === "edit") {
      const idx = view === "edit" ? S.projects.findIndex((p) => p.id === decodeURIComponent(arg || "")) : -1;
      if (view === "edit" && idx < 0) { location.hash = "#projects"; return; }
      openEditor(idx);
    } else if (view === "settings") {
      $("#view-settings").hidden = false; $("#pageTitle").textContent = "Settings"; $("#pageSub").textContent = "Connection, password and backups"; fillSettings();
    } else {
      $("#view-projects").hidden = false; $("#pageTitle").textContent = "Projects"; $("#pageSub").textContent = "Manage what appears in your portfolio";
      $("#topActions").innerHTML = '<a href="#new" class="btn btn--primary btn--sm">+ Add Project</a>';
      renderList();
    }
    window.scrollTo(0, 0);
  }

  /* ------------------------------------------------------------ list */
  function renderList() {
    const P = S.projects;
    const shots = P.reduce((n, p) => n + (p.images || []).length, 0);
    $("#stats").innerHTML = [["Projects", P.length], ["Real world", P.filter((p) => p.source !== "demo").length], ["Demos", P.filter((p) => p.source === "demo").length], ["Screenshots", shots]]
      .map(([k, v]) => `<div class="stat"><small>${k}</small><strong>${v}</strong></div>`).join("");
    $("#plist").innerHTML = P.length ? P.map((p, i) => {
      const cover = p.images && p.images[0] ? p.images[0].src : "assets/img/logo-full-t.png";
      return `<div class="prow" data-i="${i}">
        <div class="order"><button data-act="up" aria-label="Move up" ${i === 0 ? "disabled" : ""}>${ICON.up}</button><button data-act="down" aria-label="Move down" ${i === P.length - 1 ? "disabled" : ""}>${ICON.down}</button></div>
        <div class="prow__thumb"><img src="${esc(imgUrl(cover))}" data-src="${esc(cover)}" alt="" loading="lazy" onerror="__tjImgErr(this)"></div>
        <div class="prow__info"><h3>${esc(p.title)}</h3><p>${esc(p.kind || "")}</p>
          <div class="pills"><span class="pill ${p.status === "live" ? "live" : p.status === "private" ? "private" : ""}">${STATUS_LABEL[p.status] || p.status}</span><span class="pill">${TYPE_LABEL[p.type] || p.type}</span><span class="pill">${p.source === "demo" ? "Demo" : "Real world"}</span><span class="pill">${(p.images || []).length} pictures</span>${p.url ? '<span class="pill">Has link</span>' : ""}</div></div>
        <div class="prow__act">
          <button class="iconbtn star ${p.featured ? "on" : ""}" data-act="feature" aria-label="${p.featured ? "Remove from" : "Add to"} home page" title="Featured on home page">${ICON.star}</button>
          <a class="iconbtn" href="../project.html?id=${encodeURIComponent(p.id)}" target="_blank" rel="noopener" aria-label="View on website" title="View on website">${ICON.eye}</a>
          <a class="btn btn--ghost btn--sm" href="#edit/${encodeURIComponent(p.id)}">${ICON.edit} Edit</a>
          <button class="iconbtn del" data-act="delete" aria-label="Delete ${esc(p.title)}" title="Delete">${ICON.trash}</button>
        </div></div>`;
    }).join("") : '<div class="empty">No projects yet. <a href="#new" style="color:var(--cyan)">Add your first project →</a></div>';
    $("#dirtyBar").hidden = !S.dirty;
  }

  $("#plist").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const i = +b.closest(".prow").dataset.i, P = S.projects;
    const act = b.dataset.act;
    if (act === "up" || act === "down") {
      const j = act === "up" ? i - 1 : i + 1; if (j < 0 || j >= P.length) return;
      [P[i], P[j]] = [P[j], P[i]]; S.dirty = true; renderList();
      const row = $(`.prow[data-i="${j}"]`); row && (row.classList.add("moved"), $(`[data-act="${act}"]`, row) && !$(`[data-act="${act}"]`, row).disabled && $(`[data-act="${act}"]`, row).focus());
    } else if (act === "feature") { P[i].featured = !P[i].featured; S.dirty = true; renderList(); }
    else if (act === "delete") {
      const ok = await confirmBox(`Delete “${P[i].title}”?`, "The project and its uploaded pictures will be removed from your website. This can’t be undone (download a backup first if unsure).");
      if (!ok) return;
      const next = P.filter((_, k) => k !== i);
      const prev = clone(S.projects);
      if (await publishAll(next, `Delete project: ${P[i].title}`)) renderList(); else { S.projects = prev; renderList(); }
    }
  });
  $("#discardBtn").addEventListener("click", () => { S.projects = clone(S.saved); S.dirty = false; renderList(); });
  $("#publishOrderBtn").addEventListener("click", async () => { if (await publishAll(S.projects, "Update project order / featured")) renderList(); });

  /* ------------------------------------------------------------ editor */
  const blank = () => ({ id: "", title: "", kind: "", type: "website", source: "real", status: "live", featured: false, confidential: false, url: "", repo: "", summary: "", client: "", goals: [], result: "", tech: [], tags: [], images: [], features: [] });
  const F = () => $("#editor");

  function openEditor(idx) {
    S.editIndex = idx;
    S.draft = idx >= 0 ? clone(S.projects[idx]) : blank();
    const d = S.draft, f = F();
    $("#view-editor").hidden = false;
    $("#pageTitle").textContent = idx >= 0 ? `Edit: ${d.title}` : "Add new project";
    $("#pageSub").textContent = idx >= 0 ? "Changes go live when you press Save & Publish" : "Fill in the details and upload screenshots";
    ["title", "kind", "type", "source", "status", "url", "repo", "summary", "client", "result"].forEach((k) => (f.elements[k].value = d[k] || ""));
    f.elements.featured.checked = !!d.featured; f.elements.confidential.checked = !!d.confidential;
    f.elements.goals.value = (d.goals || []).join("\n");
    f.elements.tech.value = (d.tech || []).join(", "); f.elements.tags.value = (d.tags || []).join(", ");
    $$(".fld.bad", f).forEach((x) => x.classList.remove("bad"));
    $("#groups").innerHTML = ""; (d.features && d.features.length ? d.features : [{ title: "Key features", items: [] }]).forEach(addGroup);
    renderImages(); renderSuggest(); updateCount();
  }

  function addGroup(g = { title: "", items: [] }) {
    const el = document.createElement("div"); el.className = "group";
    el.innerHTML = `<div class="group__head"><input placeholder="Group heading, e.g. Security" value="${esc(g.title)}" aria-label="Feature group heading"><button type="button" class="iconbtn" data-g="up" aria-label="Move group up">${ICON.up}</button><button type="button" class="iconbtn" data-g="down" aria-label="Move group down">${ICON.down}</button><button type="button" class="iconbtn del" data-g="del" aria-label="Remove group">${ICON.trash}</button></div><textarea placeholder="One feature per line" aria-label="Features, one per line">${esc((g.items || []).join("\n"))}</textarea>`;
    $("#groups").appendChild(el);
  }
  $("#addGroup").addEventListener("click", () => { addGroup(); $("#groups .group:last-child input").focus(); });
  $("#groups").addEventListener("click", (e) => {
    const b = e.target.closest("[data-g]"); if (!b) return; const g = b.closest(".group");
    if (b.dataset.g === "del") g.remove();
    if (b.dataset.g === "up" && g.previousElementSibling) g.parentNode.insertBefore(g, g.previousElementSibling);
    if (b.dataset.g === "down" && g.nextElementSibling) g.parentNode.insertBefore(g.nextElementSibling, g);
  });

  function renderSuggest() {
    const cur = csv(F().elements.tech.value).map((s) => s.toLowerCase());
    $("#techSuggest").innerHTML = TECH_SUGGEST.map((t) => `<button type="button" class="${cur.includes(t.toLowerCase()) ? "on" : ""}" data-tech="${esc(t)}">${cur.includes(t.toLowerCase()) ? "✓ " : "+ "}${esc(t)}</button>`).join("");
  }
  $("#techSuggest").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tech]"); if (!b) return; const inp = F().elements.tech;
    let list = csv(inp.value); const t = b.dataset.tech;
    list = list.some((x) => x.toLowerCase() === t.toLowerCase()) ? list.filter((x) => x.toLowerCase() !== t.toLowerCase()) : [...list, t];
    inp.value = list.join(", "); renderSuggest();
  });
  F().elements.tech.addEventListener("input", renderSuggest);
  const updateCount = () => { const el = $('[data-count-for="summary"]'); el.textContent = `${F().elements.summary.value.length}/500`; };
  F().elements.summary.addEventListener("input", updateCount);

  /* images */
  function renderImages() {
    const imgs = S.draft.images;
    $("#imgs").innerHTML = imgs.map((im, i) => `<div class="img ${im.processing ? "processing" : ""}" data-i="${i}">
      <div class="img__pic"><img src="${esc(imgUrl(im.src))}" data-src="${esc(im.src)}" alt="" onerror="__tjImgErr(this)">${i === 0 ? '<span class="img__cover">Cover</span>' : ""}${/^data:/.test(im.src) ? '<span class="img__new">New</span>' : ""}</div>
      <div class="img__tools"><button type="button" class="iconbtn" data-im="left" aria-label="Move left" ${i === 0 ? "disabled" : ""}>${ICON.left}</button><button type="button" class="iconbtn" data-im="right" aria-label="Move right" ${i === imgs.length - 1 ? "disabled" : ""}>${ICON.right}</button>${i > 0 ? `<button type="button" class="iconbtn" data-im="cover" aria-label="Make cover" title="Make cover">${ICON.cover}</button>` : ""}<button type="button" class="iconbtn del" data-im="del" aria-label="Remove picture">${ICON.trash}</button></div>
      <input value="${esc(im.caption || "")}" placeholder="Caption (optional)" data-cap aria-label="Caption">
    </div>`).join("");
  }
  $("#imgs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-im]"); if (!b) return;
    const i = +b.closest(".img").dataset.i, A = S.draft.images;
    if (b.dataset.im === "del") A.splice(i, 1);
    if (b.dataset.im === "left" && i > 0) [A[i - 1], A[i]] = [A[i], A[i - 1]];
    if (b.dataset.im === "right" && i < A.length - 1) [A[i + 1], A[i]] = [A[i], A[i + 1]];
    if (b.dataset.im === "cover") A.unshift(A.splice(i, 1)[0]);
    renderImages();
  });
  $("#imgs").addEventListener("input", (e) => { if (e.target.matches("[data-cap]")) S.draft.images[+e.target.closest(".img").dataset.i].caption = e.target.value; });

  async function compress(file) {
    const MAX_W = 1920, MAX_H = 2600;
    const bmp = await (window.createImageBitmap ? createImageBitmap(file) : new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); }));
    const r = Math.min(1, MAX_W / bmp.width, MAX_H / bmp.height);
    const c = document.createElement("canvas"); c.width = Math.round(bmp.width * r); c.height = Math.round(bmp.height * r);
    const ctx = c.getContext("2d"); ctx.imageSmoothingQuality = "high"; ctx.drawImage(bmp, 0, 0, c.width, c.height);
    let url = c.toDataURL("image/webp", 0.85);
    if (!url.startsWith("data:image/webp")) url = c.toDataURL("image/jpeg", 0.86);
    return url;
  }
  async function addFiles(files) {
    const list = [...files].filter((f) => /^image\//.test(f.type));
    if (!list.length) return toast("Please choose image files (PNG, JPG or WebP).", "err");
    for (const f of list) {
      if (f.size > 25 * 1024 * 1024) { toast(`${f.name} is larger than 25 MB — skipped.`, "err"); continue; }
      const item = { src: "", caption: f.name.replace(/\.[^.]+$/, "").replace(/^\d+[-_ ]*/, "").replace(/[-_]+/g, " ").replace(/^\w/, (c) => c.toUpperCase()), processing: true };
      try { item.src = await compress(f); delete item.processing; S.draft.images.push(item); renderImages(); }
      catch { toast(`Could not read ${f.name}`, "err"); }
    }
  }
  const drop = $("#drop");
  $("#fileInput").addEventListener("change", (e) => { addFiles(e.target.files); e.target.value = ""; });
  ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", (e) => addFiles(e.dataTransfer.files));
  document.addEventListener("paste", (e) => { if ($("#view-editor").hidden) return; const fs = [...(e.clipboardData || {}).files || []]; if (fs.length) { e.preventDefault(); addFiles(fs); } });

  $("#cancelEdit").addEventListener("click", () => (location.hash = "#projects"));

  F().addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = F(), d = S.draft, v = (k) => f.elements[k].value.trim();
    let bad = null;
    const mark = (k, cond) => { const fl = f.elements[k].closest(".fld"); fl.classList.toggle("bad", !!cond); if (cond && !bad) bad = f.elements[k]; };
    mark("title", !v("title")); mark("kind", !v("kind")); mark("summary", !v("summary"));
    mark("url", !isUrl(v("url"))); mark("repo", !isUrl(v("repo")));
    if (bad) { bad.focus(); return toast(!isUrl(v("url")) || !isUrl(v("repo")) ? "Links must start with https://" : "Please fill in the required fields.", "err"); }
    if (S.draft.images.some((im) => im.processing)) return toast("Pictures are still compressing — one moment.", "err");
    Object.assign(d, {
      title: v("title"), kind: v("kind"), type: v("type"), source: v("source"), status: v("status"),
      featured: f.elements.featured.checked, confidential: f.elements.confidential.checked,
      url: v("url"), repo: v("repo"), summary: v("summary"), client: v("client"), result: v("result"),
      goals: lines(f.elements.goals.value), tech: csv(f.elements.tech.value), tags: csv(f.elements.tags.value),
      features: $$("#groups .group").map((g) => ({ title: $("input", g).value.trim(), items: lines($("textarea", g).value) })).filter((g) => g.items.length),
      images: d.images.map(({ src, caption }) => ({ src, caption: (caption || "").trim() })),
    });
    d.features.forEach((g) => { if (!g.title) g.title = "Features"; });
    if (!d.images.length && !(await confirmBox("No pictures added", "This project has no screenshots, so the card will show your logo instead. Publish anyway?", "Publish"))) return;
    const isNew = S.editIndex < 0;
    if (isNew) d.id = uniqueId(d.title, -1);
    const next = clone(S.projects);
    if (isNew) next.unshift(d); else next[S.editIndex] = d;
    if (await publishAll(next, `${isNew ? "Add" : "Update"} project: ${d.title}`)) location.hash = "#projects";
  });

  /* ------------------------------------------------------------ settings */
  function fillSettings() {
    const f = $("#ghForm"), g = S.gh || {};
    f.elements.owner.value = g.owner || CFG.github.owner || ""; f.elements.repo.value = g.repo || CFG.github.repo || ""; f.elements.branch.value = g.branch || CFG.github.branch || "main";
    f.elements.dir.value = g.dir != null ? g.dir : (CFG.github.dir || "");
    f.elements.token.value = g.token || "";
  }
  $("#ghForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, g = { owner: f.elements.owner.value.trim(), repo: f.elements.repo.value.trim(), branch: f.elements.branch.value.trim() || "main", dir: f.elements.dir.value.trim().replace(/^\/+|\/+$/g, ""), token: f.elements.token.value.trim() };
    if (!g.token) return toast("Paste your GitHub token first.", "err");
    const prev = S.gh; S.gh = g;
    busy(true, "Testing connection…", `${g.owner}/${g.repo} · ${g.branch}`);
    try {
      await GH.test();
      store.set("tj_gh", { owner: g.owner, repo: g.repo, branch: g.branch, dir: g.dir, token: f.elements.remember.checked ? g.token : "" });
      if (!f.elements.remember.checked) store.sset("tj_gh_token", g.token); else store.sdel("tj_gh_token");
      S.mode = "github"; refreshMode(); await loadProjects(); busy(false);
      toast("Connected to GitHub ✓ — you can now add, edit and delete projects.", "ok");
    } catch (err) { S.gh = prev; busy(false); toast(err.message, "err"); }
  });
  $("#forgetToken").addEventListener("click", () => { store.del("tj_gh"); store.sdel("tj_gh_token"); S.gh = null; if (S.mode === "github") S.mode = "readonly"; refreshMode(); fillSettings(); toast("Token removed from this device."); });
  $("#pwForm").addEventListener("submit", async (e) => {
    e.preventDefault(); const f = e.target;
    if (f.elements.pw1.value !== f.elements.pw2.value) return toast("Passwords don’t match.", "err");
    if (f.elements.pw1.value.length < 8) return toast("Use at least 8 characters.", "err");
    const be = backend(); if (!be) return toast("Connect GitHub first.", "err");
    const hash = await sha256(f.elements.pw1.value);
    busy(true, "Updating password…");
    try { await be.setPassword(hash); CFG.passwordHash = hash; store.sset("tj_admin_ok", hash); busy(false); f.reset(); toast(S.mode === "github" ? "Password updated — active after the site redeploys (about a minute)." : "Password updated.", "ok"); }
    catch (err) { busy(false); toast(err.message, "err"); }
  });
  $("#exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(S.projects, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `tjtech-projects-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  $("#importInput").addEventListener("change", async (e) => {
    const file = e.target.files[0]; e.target.value = ""; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data) || data.some((p) => !p || !p.id || !p.title)) throw new Error("This file is not a valid TJ Tech projects backup.");
      if (!(await confirmBox("Restore backup?", `This replaces your current ${S.projects.length} projects with ${data.length} from the backup.`, "Restore"))) return;
      if (await publishAll(data, "Restore projects from backup")) location.hash = "#projects";
    } catch (err) { toast(err.message, "err"); }
  });

  /* ------------------------------------------------------------ misc UI */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-toggle-pw]"); if (!t) return;
    const inp = t.dataset.togglePw ? document.getElementById(t.dataset.togglePw) : t.previousElementSibling;
    inp.type = inp.type === "password" ? "text" : "password"; t.textContent = inp.type === "password" ? "Show" : "Hide";
  });
  $("#menuBtn").addEventListener("click", () => document.body.classList.toggle("nav-open"));
  $("#logout").addEventListener("click", () => logout());
  window.addEventListener("beforeunload", (e) => { if (S.dirty) { e.preventDefault(); e.returnValue = ""; } });
  window.addEventListener("hashchange", () => { if (!$("#app").hidden) route(); });

  async function enterApp() {
    $("#login").hidden = true; $("#app").hidden = false;
    refreshMode(); await loadProjects(); refreshMode(); route();
  }
  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault(); $("#loginErr").textContent = "";
    const btn = $("button[type=submit]", e.target); btn.disabled = true;
    try { await login($("#loginPw").value); await enterApp(); }
    catch (err) { $("#loginErr").textContent = err.message === "Wrong password" ? "Incorrect password. Please try again." : err.message; $("#loginPw").select(); }
    finally { btn.disabled = false; }
  });

  /* ------------------------------------------------------------ boot */
  (async function boot() {
    const saved = store.get("tj_gh");
    if (saved) S.gh = { ...saved, token: saved.token || store.sget("tj_gh_token") || "" };
    if (await Node.status()) S.mode = "node";
    else if (GH.cfg()) S.mode = "github";
    if (isLoggedIn()) enterApp(); else { $("#login").hidden = false; $("#loginPw").focus(); }
  })();
})();
