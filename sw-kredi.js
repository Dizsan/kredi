// DİZSAN Kredi Ödemeleri Takip - Bağımsız Service Worker (v2.0.0)
const CACHE_NAME = "dizsan-kredi-v2.0.0";
const ASSETS = [
  "./",
  "./index.html",
  "./mobil.html",
  "./kredi-takip.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./Dizsan Logo.JPG",
  "./auto-date-helper.js",
  "./dizsan-back-navigation.js"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = e.request.url;
  if (
    url.includes("version.json") ||
    url.includes("kredi_shared_state.json") ||
    url.includes("api.github.com") ||
    url.includes("raw.githubusercontent.com") ||
    url.includes("/api/")
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200 && e.request.method === "GET") {
          const copy = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        }
        return networkRes;
      })
      .catch(() =>
        caches.match(e.request).then((cachedRes) => {
          if (cachedRes) return cachedRes;
          if (e.request.destination === "document") {
            return caches.match("./index.html");
          }
        })
      )
  );
});
