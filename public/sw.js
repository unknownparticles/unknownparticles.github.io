const CACHE_VERSION = 'alun-site-v5';
const OFFLINE_URL = '/offline.html';
const LEGACY_CACHES = ['precache-v1', 'precache-v2', 'runtime', 'runtime-v2', 'alun-site-v3', 'alun-site-v4'];
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/js/site.js',
  '/img/apple-touch-icon.png',
  '/img/favicon.ico',
  '/pwa/manifest.json',
  '/pwa/icons/pwa_icon_128.png',
  '/pwa/icons/pwa_icon_512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(function (cache) { return cache.addAll(PRECACHE_URLS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (key) {
          if (LEGACY_CACHES.includes(key) || (key !== CACHE_VERSION && key.indexOf('alun-site-') === 0)) {
            return caches.delete(key);
          }
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          var copy = response.clone();
          caches.open(CACHE_VERSION).then(function (cache) { cache.put(request, copy); });
          return response;
        })
        .catch(async function () {
          return caches.match(request).then(function (cached) {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cached) {
      var fetched = fetch(request).then(function (response) {
        if (response.ok) {
          var copy = response.clone();
          caches.open(CACHE_VERSION).then(function (cache) { cache.put(request, copy); });
        }
        return response;
      });
      return cached || fetched;
    })
  );
});
