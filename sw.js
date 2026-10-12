const CACHE = 'fawley-court-362c1e42e040';

// Shell: everything needed to open the portal and read every chapter
// offline. Full-size photography is warmed by the page after load, not on
// install, so a first visit on slow wifi is not held up by 1.1MB of plates.
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './align-mark.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './img/estate-aerial-t.jpg',
  './img/estate-elevation-t.jpg',
  './img/estate-longwater-t.jpg',
  './img/estate-thames-t.jpg',
  './img/int-great-hall-t.jpg',
  './img/int-library-t.jpg',
  './img/int-dining-t.jpg',
  './img/int-marble-t.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(ASSETS.map(a => c.add(a).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Pages - the portal itself and the estate model's viewer, which the portal frames -
// are network-first, so an updated build lands immediately and the cache is the
// offline fallback. Each is stored under its own address: the portal under './',
// the viewer under its own. Until 12 October 2026 every navigation counted as the
// portal, so opening the estate model stored the viewer as the portal's offline copy.
// Every other same-origin GET: cache-first with a background refresh, the refresh
// held open with waitUntil so the write lands before the worker is allowed to sleep.
// The cache's name is a hash of everything published, the estate model included,
// so a new build of either replaces this cache on the reader's next visit.
// Cross-origin: untouched.
const SCOPE = new URL(self.registration.scope).pathname;

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return;
  const isPortal = url.pathname === SCOPE || url.pathname === SCOPE + 'index.html';
  const isPage = isPortal || e.request.mode === 'navigate';
  const key = isPortal ? './' : url.origin + url.pathname + url.search;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);

    if (isPage) {
      try {
        const res = await fetch(e.request);
        if (res && res.ok) e.waitUntil(cache.put(key, res.clone()));
        return res;
      } catch {
        return (await cache.match(key))
          || (isPortal && await cache.match('./index.html'))
          || Response.error();
      }
    }

    const hit = await cache.match(e.request);
    const network = fetch(e.request)
      .then(res => { if (res && res.ok) return cache.put(e.request, res.clone()).then(() => res); return res; })
      .catch(() => hit);

    if (hit) { e.waitUntil(network); return hit; }
    const res = await network;
    return res || Response.error();
  })());
});
