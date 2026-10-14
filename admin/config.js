/* TJ Tech Admin — configuration
   passwordHash: SHA-256 of the admin password. Change it from Admin → Settings → Admin password.
   github: the repository your website is deployed from (Cloudflare redeploys on every commit).
   dir: folder inside the repository that holds the website files ("" if index.html is at the repo root). */
window.TJ_ADMIN_CONFIG = {
  "passwordHash": "3c3ce4bc032bb417e96c8a75a3147574191235ead0d7d79265325e73d14247d6",
  "github": { "owner": "Tani6315", "repo": "tjtech-website", "branch": "main", "dir": "" },
  "githubApi": "https://api.github.com",
  "dataPath": "data/projects.js",
  "uploadsDir": "assets/uploads"
};
