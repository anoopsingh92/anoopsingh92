const CACHE_NAME = 'anoopsingh-v2';
const STATIC_ASSETS = [
  './',
  './about/',
  './404.html',
  './assets/bundle.min.css',
  './assets/bundle.min.js',
  './assets/manifest.json',
  './assets/favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  // Navigation fallback to cache first, network fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});