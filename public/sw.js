const CACHE_VERSION = 'alun-site-v6';
const OFFLINE_URL = '/offline.html';
const LEGACY_CACHES = [
  'precache-v1', 'precache-v2', 'runtime', 'runtime-v2',
  'alun-site-v3', 'alun-site-v4', 'alun-site-v5'
];
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

function cacheResponse(request, response) {
  if (!response || !response.ok) return response;
  var copy = response.clone();
  caches.open(CACHE_VERSION).then(function (cache) { cache.put(request, copy); });
  return response;
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  var url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(function (response) { return cacheResponse(request, response); })
        .catch(function () {
          return caches.match(request).then(function (cached) {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Hashed Astro assets are immutable. Network first keeps visitors on the
  // newest deploy; the cache remains an offline fallback, never the source of
  // a stale theme after a release.
  event.respondWith(
    fetch(request)
      .then(function (response) { return cacheResponse(request, response); })
      .catch(function () { return caches.match(request); })
  );
});
