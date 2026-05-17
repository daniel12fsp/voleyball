const CACHE_NAME = 'volei-score-v1';

const PRECACHE = [
  '/',
  '/index.html',
  '/app.js',
  '/confetti.js',
  '/i18n.js',
  '/styles.css',
  '/manifest.webmanifest',
  '/icon.svg',
  'https://esm.sh/preact@10.29.2',
  'https://esm.sh/preact@10.29.2/hooks',
  'https://esm.sh/htm@3.1.1'
];

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      try {
        const resp = await fetch(event.request);
        if (resp.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, resp.clone());
        }
        return resp;
      } catch {
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
