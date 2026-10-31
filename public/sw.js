const CACHE_NAME = 'anoopsingh-v3';
const STATIC_ASSETS = [
  './',
  './about/',
  './products/',
  './case-study.html',
  './404.html',
  './assets/bundle.min.css',
  './assets/bundle.min.js',
  './assets/manifest.json',
  './assets/favicon.ico',
  './assets/img/anoop.webp',
  './assets/img/screenshot-wide.png'
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
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request) || caches.match('./404.html'))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});