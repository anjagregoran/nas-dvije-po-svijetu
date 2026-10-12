// Vodič radi i bez interneta: uvijek prvo pokušaj mrežu, a ako je nema, posluži spremljenu kopiju.
var CACHE = 'ttm-v7';
var CORE = [
  './', 'index.html', 'putovanje.html', 'zemlja.html', 'trazi.html', 'js/trazi.js',
  'css/style.css', 'js/home.js', 'js/trip.js', 'js/zemlja.js', 'js/karta.js', 'js/restorani.js', 'js/putovanja.js', 'putovanja.html', 'data/moja-putovanja.js', 'data/koordinate.js',
  'data/europa/index.js', 'data/apulija.js', 'data/apulija-mjesta-1.js', 'data/apulija-mjesta-2.js',
  'data/apulija-hrana.js', 'data/apulija-kultura.js', 'data/apulija-ako-zelis.js', 'icon.svg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
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
