// Bump VERSION whenever you change index.html so phones pick up the update.
const VERSION = "gz-v2";
const SHELL = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
const LIVE = ["open.er-api.com", "api.frankfurter.app", "api.open-meteo.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || LIVE.includes(url.hostname)) return; // page keeps last data in localStorage
  if (url.origin === location.origin) {
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit ||
      fetch(e.request).catch(() => e.request.mode === "navigate" ? caches.match("index.html") : undefined)));
  }
});
