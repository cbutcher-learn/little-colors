const CACHE_NAME = 'little-colors-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './worker.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/idb@7/build/umd.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
