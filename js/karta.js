// Zajednička karta (MapLibre GL + OpenFreeMap, vektorska pa je oštra na svakom zaslonu).
// Knjižnica se učitava tek kad zatreba.
window.Karta = (function () {
  var loading = null;
  var maps = {};
  var touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  function lib() {
    if (window.maplibregl) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise(function (ok, fail) {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
      document.head.appendChild(css);
      var s = document.createElement('script');
      s.src = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
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
      var first = [points[0].c[1], points[0].c[0]];
      var map = new maplibregl.Map({
        container: elId,
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: first,
        zoom: opts.zoom || 9,
        attributionControl: { compact: true },
        cooperativeGestures: touch,   // na mobitelu se karta pomiče s dva prsta, da ne zarobi listanje stranice
        dragRotate: false
      });
      maps[elId] = map;
      map.touchZoomRotate.disableRotation();
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');

      var bounds = new maplibregl.LngLatBounds();
      points.forEach(function (p) {
        var ll = [p.c[1], p.c[0]];
        var pin = document.createElement('div');
        pin.className = 'pin';
        pin.title = p.t;
        var popup = new maplibregl.Popup({ offset: 14, closeButton: false, maxWidth: '260px' }).setHTML(
          '<b>' + esc(p.t) + '</b>' + (p.s ? '<span>' + esc(p.s) + '</span>' : '') +
          (p.h ? '<a href="' + esc(p.h) + '">Otvori</a>' : ''));
        new maplibregl.Marker({ element: pin }).setLngLat(ll).setPopup(popup).addTo(map);
        bounds.extend(ll);
      });
      if (points.length > 1) map.fitBounds(bounds, { padding: 44, maxZoom: opts.maxZoom || 9, animate: false });
    }).catch(function () { el.style.display = 'none'; });
  }

  return { draw: draw };
})();
