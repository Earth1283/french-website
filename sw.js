const CACHE_NAME = 'bonjour-survival-v1';

// Static assets to pre-cache on install
const PRECACHE_URLS = [
  '/french-website/',
  '/french-website/index.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept cross-origin requests (Unsplash, Google APIs, fonts)
  if (url.origin !== self.location.origin) return;

  // Network-first for navigation requests (always get fresh HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/french-website/index.html'))
    );
    return;
  }

  // Cache-first for JS/CSS/font assets (they're fingerprinted by Vite)
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|svg|png|ico)$/)
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }
});
