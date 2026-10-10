// Zajednička karta (Leaflet + OpenStreetMap). Knjižnica se učitava tek kad zatreba.
window.Karta = (function () {
  var loading = null;
  var maps = {};

  function lib() {
    if (window.L) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise(function (ok, fail) {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
      var s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = ok; s.onerror = fail;
      document.head.appendChild(s);
    });
    return loading;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // points: [{ c: [lat, lng], t: naslov, s: podnaslov, h: poveznica }]
  function draw(elId, points, opts) {
    opts = opts || {};
    points = points.filter(function (p) { return p.c; });
    var el = document.getElementById(elId);
    if (!el) return;
    if (!points.length) { el.style.display = 'none'; return; }
    el.style.display = '';
    lib().then(function () {
      if (maps[elId]) { maps[elId].remove(); delete maps[elId]; }
      if (!document.getElementById(elId)) return;
      var map = L.map(elId, { scrollWheelZoom: false, attributionControl: true, zoomControl: !opts.small });
      maps[elId] = map;
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
      var icon = L.divIcon({ className: 'pin', iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -8] });
      var group = [];
      points.forEach(function (p) {
        var m = L.marker(p.c, { icon: icon, title: p.t }).addTo(map);
        m.bindPopup('<b>' + esc(p.t) + '</b>' + (p.s ? '<span>' + esc(p.s) + '</span>' : '') +
          (p.h ? '<a href="' + esc(p.h) + '">Otvori</a>' : ''), { closeButton: false });
        group.push(p.c);
      });
      if (group.length === 1) map.setView(group[0], opts.zoom || 10);
      else map.fitBounds(group, { padding: [34, 34], maxZoom: opts.maxZoom || 9 });
    }).catch(function () { el.style.display = 'none'; });
  }

  return { draw: draw };
})();
