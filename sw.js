// Bump VERSION whenever you change index.html so phones pick up the update.
const VERSION = "tukar-v1";
const SHELL = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;

  // Rate APIs: always network; the page keeps the last good rates in localStorage.
  if (url.hostname === "open.er-api.com" || url.hostname === "api.frankfurter.app") return;

  // Google Fonts: cache on first use, serve from cache afterwards.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(
      caches.open(VERSION).then(c => c.match(e.request).then(hit => hit ||
        fetch(e.request).then(res => { c.put(e.request, res.clone()); return res; })))
    );
    return;
  }

  // App shell: cache first, fall back to network; pages fall back to the cached index.
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request, { ignoreSearch: true }).then(hit => hit ||
        fetch(e.request).catch(() => e.request.mode === "navigate" ? caches.match("index.html") : undefined))
    );
  }
});
