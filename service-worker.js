// Enkel service worker: cacher app-skallet slik at appen kan installeres og
// åpnes offline. Treningsdata i seg selv går via Firestores egen offline-cache
// (se enableIndexedDbPersistence i js/db.js) - denne filen cacher kun UI-filene.
const CACHE_NAME = "treningslogger-v2";

const ASSETS = [
  "./",
  "index.html",
  "login.html",
  "logg.html",
  "historikk.html",
  "eksport.html",
  "profil.html",
  "manifest.json",
  "css/styles.css",
  "js/config.js",
  "js/firebase-config.js",
  "js/firebase-init.js",
  "js/auth.js",
  "js/db.js",
  "js/skills.js",
  "js/nav.js",
  "js/dashboard.js",
  "js/logg.js",
  "js/historikk.js",
  "js/export.js",
  "js/profil.js",
  "js/sw-register.js",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .catch((err) => console.warn("SW install cache-feil:", err))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Stale-while-revalidate: vis cache umiddelbart (raskt + fungerer offline),
// men hent alltid en fersk versjon i bakgrunnen til neste gang.
// Firebase/CDN-kall (annen origin) røres ikke - de går alltid rett til nettverket.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
