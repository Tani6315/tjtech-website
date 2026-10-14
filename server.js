/* ==========================================================================
   TJ Tech — optional Node.js server (no dependencies)
   • Serves the website            → http://localhost:3000
   • Powers the admin dashboard    → http://localhost:3000/admin/
     (saves projects + pictures straight to these files)
   Run:  npm start          Password: the one set in admin/config.js
         (or set ADMIN_PASSWORD=... to override)
   ========================================================================== */
const http = require("http");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(ROOT, "data", "projects.js");
const CONFIG_FILE = path.join(ROOT, "admin", "config.js");
const UPLOADS = "assets/uploads/";
const MAX_BODY = 80 * 1024 * 1024;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".ico": "image/x-icon", ".txt": "text/plain" };

const sessions = new Map(); // token -> expiry
const failures = new Map(); // ip -> {count, until}

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");
const send = (res, code, obj) => { res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store" }); res.end(JSON.stringify(obj)); };
const serialize = (p) => "/* TJ Tech portfolio data — managed from the admin dashboard (/admin). */\nwindow.TJ_PROJECTS = " + JSON.stringify(p, null, 2) + ";\n";
const parseData = (t) => JSON.parse(t.match(/window\.TJ_PROJECTS\s*=\s*([\s\S]*?);?\s*$/)[1]);

function passwordHash() {
  if (process.env.ADMIN_PASSWORD) return sha256(process.env.ADMIN_PASSWORD);
  const m = fs.readFileSync(CONFIG_FILE, "utf8").match(/"passwordHash"\s*:\s*"([0-9a-f]{64})"/);
  return m ? m[1] : null;
}
function authed(req) {
  const t = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const exp = sessions.get(t);
  if (!exp || exp < Date.now()) { sessions.delete(t); return false; }
  return true;
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", (c) => { size += c.length; if (size > MAX_BODY) { reject(new Error("Upload too large")); req.destroy(); } else chunks.push(c); });
    req.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); } catch { reject(new Error("Invalid JSON")); } });
    req.on("error", reject);
  });
}
// only allow writing/deleting inside assets/uploads with an image extension
function safeUpload(p) {
  if (typeof p !== "string" || !p.startsWith(UPLOADS) || p.includes("..") || !/^[a-z0-9._\/-]+\.(webp|png|jpe?g)$/i.test(p)) return null;
  const abs = path.join(ROOT, p);
  return abs.startsWith(path.join(ROOT, UPLOADS)) ? abs : null;
}
async function writeAtomic(file, data) { const tmp = file + ".tmp"; await fsp.writeFile(tmp, data); await fsp.rename(tmp, file); }

function validProjects(list) {
  return Array.isArray(list) && list.every((p) => p && typeof p.id === "string" && /^[a-z0-9-]+$/.test(p.id) && typeof p.title === "string" && Array.isArray(p.images || []));
}

async function api(req, res, route) {
  const ip = req.socket.remoteAddress;
  if (route === "status") return send(res, 200, { mode: "node" });

  if (route === "login" && req.method === "POST") {
    const f = failures.get(ip);
    if (f && f.until > Date.now()) return send(res, 429, { error: "Too many attempts. Try again in a few minutes." });
    const { password = "" } = await readBody(req);
    const expected = passwordHash();
    const ok = expected && crypto.timingSafeEqual(Buffer.from(sha256(String(password))), Buffer.from(expected));
    if (!ok) {
      const n = (f && f.until <= Date.now() ? 0 : (f ? f.count : 0)) + 1;
      failures.set(ip, { count: n, until: n >= 5 ? Date.now() + 5 * 60e3 : 0 });
      return send(res, 401, { error: "Wrong password" });
    }
    failures.delete(ip);
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, Date.now() + 12 * 3600e3);
    return send(res, 200, { token });
  }

  if (!authed(req)) return send(res, 401, { error: "Not signed in" });

  if (route === "projects" && req.method === "GET") {
    return send(res, 200, { projects: parseData(await fsp.readFile(DATA_FILE, "utf8")) });
  }
  if (route === "publish" && req.method === "POST") {
    const { projects, files = [], remove = [] } = await readBody(req);
    if (!validProjects(projects)) return send(res, 400, { error: "Invalid project data" });
    await fsp.mkdir(path.join(ROOT, UPLOADS), { recursive: true });
    for (const f of files) {
      const abs = safeUpload(f.path);
      if (!abs || typeof f.base64 !== "string") return send(res, 400, { error: "Invalid file path" });
      await fsp.writeFile(abs, Buffer.from(f.base64, "base64"));
    }
    await writeAtomic(DATA_FILE, serialize(projects));
    for (const p of remove) { const abs = safeUpload(p); if (abs) await fsp.unlink(abs).catch(() => {}); }
    return send(res, 200, { ok: true });
  }
  if (route === "password" && req.method === "POST") {
    const { hash } = await readBody(req);
    if (!/^[0-9a-f]{64}$/.test(hash || "")) return send(res, 400, { error: "Invalid hash" });
    const text = await fsp.readFile(CONFIG_FILE, "utf8");
    await writeAtomic(CONFIG_FILE, text.replace(/("passwordHash"\s*:\s*")[0-9a-f]*(")/, `$1${hash}$2`));
    return send(res, 200, { ok: true });
  }
  return send(res, 404, { error: "Not found" });
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://x");
    let p = decodeURIComponent(url.pathname);
    if (p.startsWith("/api/")) return await api(req, res, p.slice(5).replace(/\/$/, ""));
    if (p === "/admin") { res.writeHead(301, { Location: "/admin/" }); return res.end(); }
    if (p.endsWith("/")) p += "index.html";
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT) || /(^|[\/\\])\.|server\.js$|package\.json$/.test(path.relative(ROOT, file))) { res.writeHead(403); return res.end("Forbidden"); }
    const data = await fsp.readFile(file);
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { "Content-Type": TYPES[ext] || "application/octet-stream", "Cache-Control": ext === ".html" || p.startsWith("/data/") || p.startsWith("/admin/") ? "no-cache" : "public, max-age=3600" });
    res.end(data);
  } catch (e) {
    if (e.code === "ENOENT" || e.code === "EISDIR") { res.writeHead(404, { "Content-Type": "text/html" }); return res.end('<h1>404</h1><p><a href="/">Back to TJ Tech</a></p>'); }
    if (!res.headersSent) send(res, 500, { error: e.message || "Server error" });
  }
}).listen(PORT, () => console.log(`TJ Tech running at http://localhost:${PORT}  ·  Admin: http://localhost:${PORT}/admin/`));
