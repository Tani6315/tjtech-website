/* ==========================================================================
   TJ Tech — interactions
   ========================================================================== */

/* ---- Contact form configuration ------------------------------------------
   Paste your Web3Forms access key below (get one free at https://web3forms.com).
   The contact form and the footer newsletter both send through it.          */
const FORM_ACCESS_KEY = "158a5fb8-3554-4fdb-bda6-7a070a35ee66";
const FORM_ENDPOINT = "https://api.web3forms.com/submit";

(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Preloader */
  const preloader = $(".preloader");
  let loaded = false;
  const finishLoading = () => {
    if (loaded) return; loaded = true;
    document.body.classList.remove("is-loading");
    preloader && preloader.classList.add("done");
    revealHeroWords();
  };
  // Show the full preloader only on the first visit of a session; later pages open quickly
  let seen = false;
  try { seen = sessionStorage.getItem("tj_seen") === "1"; sessionStorage.setItem("tj_seen", "1"); } catch (e) {}
  if (seen) { if (preloader) preloader.style.transition = "opacity .2s, visibility .2s"; setTimeout(finishLoading, 0); }
  else if (document.readyState === "complete") setTimeout(finishLoading, 350);
  else window.addEventListener("load", () => setTimeout(finishLoading, 450));
  setTimeout(finishLoading, 2500); // safety net

  /* Page transitions between internal pages */
  const wipe = $(".page-transition");
  $$("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || a.target === "_blank" || /^https?:/.test(href)) return;
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || reduceMotion || !wipe) return;
      e.preventDefault();
      wipe.classList.add("leaving");
      setTimeout(() => (window.location.href = href), 480);
    });
  });
  window.addEventListener("pageshow", (e) => { if (e.persisted && wipe) wipe.classList.remove("leaving"); });

  /* Header: scrolled state, hide on scroll down */
  const header = $(".header");
  const progress = $(".scroll-progress");
  const toTop = $(".fab--top");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 30);
    header.classList.toggle("hide", y > 400 && y > lastY && !document.body.classList.contains("menu-open"));
    lastY = y;
    const h = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    if (toTop) toTop.classList.toggle("show", y > 700);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop && toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* Mobile menu */
  const burger = $(".burger");
  burger && burger.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", open);
  });
  $$(".mobile-menu a").forEach((a) => a.addEventListener("click", () => document.body.classList.remove("menu-open")));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") document.body.classList.remove("menu-open"); });

  /* Cursor glow */
  const glow = $(".cursor-glow");
  if (glow && matchMedia("(hover:hover)").matches) {
    let gx = innerWidth / 2, gy = innerHeight / 2, cx = gx, cy = gy;
    window.addEventListener("mousemove", (e) => { gx = e.clientX; gy = e.clientY; });
    const loop = () => { cx += (gx - cx) * 0.12; cy += (gy - cy) * 0.12; glow.style.transform = `translate(${cx - 210}px,${cy - 210}px)`; requestAnimationFrame(loop); };
    glow.style.left = glow.style.top = "0px";
    loop();
  }

  /* Card spotlight follows mouse */
  $$(".card, .project").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* Magnetic buttons */
  if (!reduceMotion && matchMedia("(hover:hover)").matches) {
    $$("[data-magnetic]").forEach((b) => {
      b.addEventListener("mousemove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.32}px)`;
      });
      b.addEventListener("mouseleave", () => (b.style.transform = ""));
    });
  }

  /* 3D tilt for hero code window */
  const tilt = $("[data-tilt]");
  if (tilt && !reduceMotion && matchMedia("(hover:hover)").matches) {
    const wrap = tilt.parentElement;
    wrap.addEventListener("mousemove", (e) => {
      const r = wrap.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `rotateY(${-12 + x * 14}deg) rotateX(${6 - y * 10}deg)`;
    });
    wrap.addEventListener("mouseleave", () => (tilt.style.transform = ""));
  }

  /* Split headline words */
  $$("[data-split]").forEach((el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement("span"); w.className = "w";
            const s = document.createElement("span"); s.textContent = part; s.style.setProperty("--i", i++);
            w.appendChild(s); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains("rotator")) walk(n);
        else if (n.nodeType === 1) {
          const w = document.createElement("span"); w.className = "w";
          n.style.setProperty("--i", i++); n.parentNode.insertBefore(w, n); w.appendChild(n);
          n.style.display = "inline-block"; n.classList.add("w-inner");
        }
      });
    };
    walk(el);
    el.classList.add("split-words");
  });
  const style = document.createElement("style");
  style.textContent = ".split-words .w>.w-inner{transform:translateY(105%);transition:transform 1s cubic-bezier(.22,1,.36,1);transition-delay:calc(var(--i)*55ms + .15s)}.split-words.in .w>.w-inner{transform:none}";
  document.head.appendChild(style);
  let heroDone = false;
  function revealHeroWords() {
    if (heroDone) return; heroDone = true;
    $$("[data-split]").forEach((el) => setTimeout(() => el.classList.add("in"), 80));
  }

  /* Reveal on scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$("[data-reveal]").forEach((el) => io.observe(el));
  $$("[data-stagger]").forEach((wrap) => {
    [...wrap.children].forEach((c, i) => { c.setAttribute("data-reveal", c.getAttribute("data-reveal") || ""); c.style.setProperty("--d", `${i * 0.08}s`); io.observe(c); });
  });

  /* Counters */
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count, dur = 1800, t0 = performance.now();
      const step = (t) => { const p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step); cio.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$("[data-count]").forEach((el) => cio.observe(el));

  /* Typing rotator */
  const rot = $("[data-rotate]");
  if (rot) {
    const words = JSON.parse(rot.dataset.rotate);
    const txt = rot.querySelector(".txt");
    let wi = 0, ci = words[0].length, del = true;
    const tick = () => {
      const w = words[wi];
      if (del) { ci--; if (ci <= 0) { del = false; wi = (wi + 1) % words.length; } }
      else { ci++; if (ci >= words[wi].length) { del = true; txt.textContent = words[wi]; return setTimeout(tick, 2200); } }
      txt.textContent = (del ? w : words[wi]).slice(0, Math.max(ci, 0));
      setTimeout(tick, del ? 45 : 85);
    };
    if (!reduceMotion) setTimeout(tick, 3000);
  }

  /* Typing code block */
  const code = $("[data-typecode]");
  if (code && !reduceMotion) {
    const html = code.innerHTML;
    const tokens = html.match(/<[^>]+>|&[a-z]+;|[\s\S]/g) || [];
    code.innerHTML = "";
    let k = 0, buf = "";
    const typeIt = () => {
      for (let n = 0; n < 3 && k < tokens.length; n++) { buf += tokens[k++]; while (k < tokens.length && tokens[k].startsWith("<")) buf += tokens[k++]; }
      code.innerHTML = buf + '<span class="caret-c">▍</span>';
      if (k < tokens.length) setTimeout(typeIt, 18); else code.innerHTML = buf;
    };
    setTimeout(typeIt, 900);
  }

  /* Hero particle network */
  const cv = $(".hero__canvas");
  if (cv && !reduceMotion) {
    const ctx = cv.getContext("2d");
    let W, H, pts = [], mouse = { x: -999, y: -999 };
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(90, Math.floor((W * H) / 16000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.6 + 0.4 }));
    };
    resize(); window.addEventListener("resize", resize);
    cv.parentElement.addEventListener("mousemove", (e) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    let heroVisible = true;
    if ("IntersectionObserver" in window) new IntersectionObserver((en) => { heroVisible = en[0].isIntersecting; }).observe(cv);
    const draw = () => {
      // pause the particles while the menu is open or the hero is off-screen (saves GPU, stops flicker)
      if (!heroVisible || document.hidden || document.body.classList.contains("menu-open")) { requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r + (dm < 120 ? 1.2 : 0), 0, 7); ctx.fillStyle = dm < 120 ? "rgba(25,211,255,.95)" : "rgba(120,170,255,.55)"; ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 130) { ctx.strokeStyle = `rgba(70,130,255,${0.16 * (1 - d / 130)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  /* Portfolio filter */
  $$(".filters").forEach((bar) => {
    const items = $$(bar.dataset.target);
    bar.addEventListener("click", (e) => {
      const b = e.target.closest(".filter"); if (!b) return;
      $$(".filter", bar).forEach((x) => x.classList.toggle("active", x === b));
      const f = b.dataset.filter;
      items.forEach((it) => {
        const show = f === "all" || it.dataset.cat.split(" ").includes(f);
        if (show) { it.classList.remove("is-hidden"); it.style.opacity = 0; it.style.transform = "translateY(20px)"; requestAnimationFrame(() => requestAnimationFrame(() => { it.style.opacity = ""; it.style.transform = ""; })); }
        else it.classList.add("is-hidden");
      });
    });
  });

  /* Accordion */
  $$(".acc__q").forEach((q) => {
    q.addEventListener("click", () => {
      const acc = q.closest(".acc");
      const open = acc.classList.toggle("open");
      q.setAttribute("aria-expanded", open);
    });
  });

  /* FAQ search + category nav */
  const faqSearch = $("#faqSearch");
  if (faqSearch) {
    const accs = $$(".acc"), titles = $$(".faq-group-title"), empty = $(".faq-empty");
    faqSearch.addEventListener("input", () => {
      const q = faqSearch.value.trim().toLowerCase(); let any = false;
      accs.forEach((a) => { const hit = !q || a.textContent.toLowerCase().includes(q); a.style.display = hit ? "" : "none"; if (hit) any = true; });
      titles.forEach((t) => { const grp = $$(`.acc[data-group="${t.dataset.group}"]`); t.style.display = grp.some((a) => a.style.display !== "none") ? "" : "none"; });
      empty.style.display = any ? "none" : "block";
    });
    $$(".faq-nav button").forEach((b) => b.addEventListener("click", () => {
      $$(".faq-nav button").forEach((x) => x.classList.toggle("active", x === b));
      const t = $(`.faq-group-title[data-group="${b.dataset.group}"]`);
      if (t) window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 120, behavior: "smooth" });
    }));
  }

  /* Process roadmap progress line */
  const road = $(".roadmap");
  if (road) {
    const line = $(".roadmap__line span"), steps = $$(".step", road);
    const upd = () => {
      const r = road.getBoundingClientRect(), mid = innerHeight * 0.6;
      const p = Math.min(Math.max((mid - r.top) / r.height, 0), 1);
      line.style.height = `${p * 100}%`;
      steps.forEach((s) => s.classList.toggle("lit", s.getBoundingClientRect().top + 32 < mid));
    };
    window.addEventListener("scroll", upd, { passive: true }); upd();
  }

  /* Journey map path draw */
  const jp = $(".journey .path-fg");
  if (jp) {
    const len = jp.getTotalLength(); jp.style.strokeDasharray = len; jp.style.strokeDashoffset = len;
    const jio = new IntersectionObserver((en) => { if (en[0].isIntersecting) { jp.style.transition = "stroke-dashoffset 3.2s cubic-bezier(.22,1,.36,1)"; jp.style.strokeDashoffset = 0; $$(".journey .pin").forEach((p, i) => { p.style.transition = `opacity .6s ${0.25 * i}s, transform .6s ${0.25 * i}s`; p.style.opacity = 1; p.style.transform = "none"; }); jio.disconnect(); } }, { threshold: 0.3 });
    $$(".journey .pin").forEach((p) => { p.style.opacity = 0; p.style.transformBox = "fill-box"; p.style.transformOrigin = "center"; p.style.transform = "scale(.4)"; });
    jio.observe(jp.closest("svg"));
  }

  /* Forms (Web3Forms) */
  const keyMissing = () => !FORM_ACCESS_KEY || FORM_ACCESS_KEY.startsWith("YOUR_");
  async function send(data) {
    data.access_key = FORM_ACCESS_KEY;
    const res = await fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) throw new Error(json.message || "Something went wrong");
    return json;
  }

  const form = $("#contactForm");
  if (form) {
    const status = $(".form-status", form), btn = $("button[type=submit]", form), label = btn.innerHTML;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.className = "form-status";
      let ok = true;
      $$("[required]", form).forEach((f) => {
        const bad = !f.value.trim() || (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
        f.closest(".field").classList.toggle("invalid", bad); if (bad) ok = false;
      });
      if (!ok) { status.textContent = "Please fill in the highlighted fields."; status.classList.add("err"); return; }
      if ($("[name=botcheck]", form).checked) return;
      if (keyMissing()) { status.textContent = "The form is not connected yet — add your Web3Forms access key in js/main.js. Meanwhile, email tjtech063@gmail.com."; status.classList.add("err"); return; }
      const data = Object.fromEntries(new FormData(form).entries());
      delete data.botcheck;
      data.subject = `New project enquiry from ${data.name} — TJ Tech website`;
      data.from_name = "TJ Tech Website";
      btn.classList.add("loading");
      btn.innerHTML = 'Sending <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.2-8.6"/></svg>';
      try {
        await send(data);
        form.reset();
        status.textContent = "Thank you! Your message has been sent. Tanveer will get back to you within 24 hours.";
        status.classList.add("ok");
      } catch (err) {
        status.textContent = `Sorry, the message could not be sent (${err.message}). Please email tjtech063@gmail.com or WhatsApp +92 300 0585929.`;
        status.classList.add("err");
      } finally { btn.classList.remove("loading"); btn.innerHTML = label; }
    });
    $$("input,textarea,select", form).forEach((f) => f.addEventListener("input", () => f.closest(".field") && f.closest(".field").classList.remove("invalid")));
  }

  $$(".newsletter").forEach((nl) => {
    nl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = $("input", nl), btn = $("button", nl);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) { input.focus(); input.placeholder = "Enter a valid email"; input.value = ""; return; }
      if (keyMissing()) { input.value = ""; input.placeholder = "Form not connected yet"; return; }
      btn.textContent = "…";
      try { await send({ email: input.value, subject: "New newsletter subscriber — TJ Tech", from_name: "TJ Tech Website" }); input.value = ""; input.placeholder = "Subscribed — thank you!"; }
      catch { input.placeholder = "Try again later"; }
      finally { btn.textContent = "Subscribe"; }
    });
  });

  /* Year */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
