/* Zählbuch — hält die App offline verfügbar. */
const LAGER = 'zaehlbuch-v1';
const SCHALE = ['./', './index.html', './manifest.webmanifest',
                './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(LAGER).then(c => c.addAll(SCHALE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(n => n !== LAGER).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(treffer => treffer || fetch(e.request).then(antwort => {
      if (antwort && antwort.ok && new URL(e.request.url).origin === location.origin){
        const kopie = antwort.clone();
        caches.open(LAGER).then(c => c.put(e.request, kopie));
      }
      return antwort;
    }).catch(() => caches.match('./index.html')))
  );
});
