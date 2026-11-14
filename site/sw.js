/* Service worker : met en cache le code et les données (jamais d'enregistrement vocal).
   Changer CACHE à chaque ajout/modif de fichier. */
const CACHE = 'det-prep-v1.0.1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/core.js', 'js/today.js', 'js/pages.js',
  'js/modules/ctest.js', 'js/modules/faults.js', 'js/modules/cognates.js', 'js/modules/review.js',
  'js/data/fib.js', 'js/data/rac.js', 'js/data/faults.js', 'js/data/cognates.js', 'js/data/test.js',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // Réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
