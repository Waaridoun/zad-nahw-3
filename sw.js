/* Zād an-Nahw : mode hors ligne. Changer VERSION à chaque mise à jour du site. */
const VERSION = 'zad-1.1';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'fonts.css', 'app.css', 'app.js',
  'catalogue.js', 'l02.js', 'l03.js', 'l05.js', 'l06.js', 'l07.js', 'l08.js', 'l09.js', 'l10.js', 'l11.js', 'l12.js', 'l13.js', 'l14.js', 'l15.js', 'l16.js',
  'scheherazade-new-arabic-400-normal.woff2', 'scheherazade-new-arabic-700-normal.woff2', 'scheherazade-new-latin-400-normal.woff2',
  'noto-naskh-arabic-arabic-400-normal.woff2', 'noto-naskh-arabic-arabic-700-normal.woff2', 'noto-naskh-arabic-latin-400-normal.woff2',
  'figtree-latin-400-normal.woff2', 'figtree-latin-500-normal.woff2', 'figtree-latin-600-normal.woff2', 'figtree-latin-700-normal.woff2',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'
];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
