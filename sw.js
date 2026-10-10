// Vodič radi i bez interneta: uvijek prvo pokušaj mrežu, a ako je nema, posluži spremljenu kopiju.
var CACHE = 'ndps-v1';
var CORE = [
  './', 'index.html', 'putovanje.html',
  'css/style.css', 'js/home.js', 'js/trip.js',
  'data/putovanja.js', 'data/apulija.js', 'icon.svg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true });
    })
  );
});
