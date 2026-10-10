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

  // Nazivi na karti na hrvatskom (ili barem latinicom), a boje u tonovima stranice.
  var NAME = ['coalesce', ['get', 'name:hr'], ['get', 'name:latin'], ['get', 'name_en'], ['get', 'name']];
  function dress(map) {
    (map.getStyle().layers || []).forEach(function (l) {
      var id = l.id, src = l['source-layer'] || '';
      function paint(prop, val) { try { map.setPaintProperty(id, prop, val); } catch (e) {} }
      try {
        if (l.type === 'background') paint('background-color', '#f7eedf');
        else if (l.type === 'symbol') {
          if (l.layout && l.layout['text-field']) map.setLayoutProperty(id, 'text-field', NAME);
          var water = /water/.test(src) || /water|ocean|sea/.test(id);
          paint('text-color', water ? '#5d8ea3' : /country|continent|state/.test(id) ? '#5a1830' : '#6f4a55');
          paint('text-halo-color', water ? 'rgba(207,228,236,.7)' : '#fbf4ea');
          paint('text-halo-width', 1.4);
        }
        else if (l.type === 'fill') {
          if (/water/.test(src) || /water/.test(id)) paint('fill-color', '#cfe4ec');
          else if (/park|wood|forest|grass|landcover|green/.test(src + id)) { paint('fill-color', '#dfe6cf'); paint('fill-opacity', 0.7); }
          else if (/building/.test(src + id)) paint('fill-color', '#efe2cf');
          else if (/landuse|residential/.test(src + id)) paint('fill-color', '#f3e8d6');
        }
        else if (l.type === 'line') {
          if (/boundary|admin/.test(src + id)) { paint('line-color', '#5a1830'); paint('line-opacity', 0.35); }
          else if (/water/.test(src + id)) paint('line-color', '#b9d6e1');
          else if (/transportation|road|highway|bridge|tunnel/.test(src + id)) paint('line-color', /motorway|trunk|primary/.test(id) ? '#f3c9a8' : '#ffffff');
          else if (/rail/.test(id)) paint('line-color', '#d9c7b0');
        }
      } catch (e) {}
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
      map.on('style.load', function () { dress(map); });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');

      var bounds = new maplibregl.LngLatBounds();
      points.forEach(function (p) {
        var ll = [p.c[1], p.c[0]];
        var pin = document.createElement('div');
        pin.className = 'pin' + (p.k ? ' ' + p.k : '');
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
