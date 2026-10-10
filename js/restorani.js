// Restaurants near a place, live from OpenStreetMap. It is a list of what exists, without ratings,
// so it comes with a link to the Michelin Guide for the same place.
window.Restorani = (function () {
  var KUH = { regional: 'local cuisine', local: 'local cuisine', steak_house: 'steakhouse' };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function kuhinja(c) {
    if (!c) return '';
    return c.split(';').slice(0, 2).map(function (x) { x = x.trim(); return KUH[x] || x.replace(/_/g, ' '); }).join(', ');
  }
  function michelin(name) {
    return 'https://guide.michelin.com/en/search?q=' + encodeURIComponent(name);
  }

  // Upit prema Overpassu: jedan po jedan (poslužitelj ne voli usporedne upite), s rezervnim poslužiteljima.
  var HOSTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
  var queue = Promise.resolve();
  function ask(q, i) {
    i = i || 0;
    return fetch(HOSTS[i], { method: 'POST', body: 'data=' + encodeURIComponent(q) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .catch(function (e) { if (i + 1 < HOSTS.length) return ask(q, i + 1); throw e; });
  }
  function overpass(q) {
    var run = queue.then(function () { return ask(q); });
    queue = run.catch(function () {});
    return run;
  }

  function load(elId, lat, lon, name) {
    var el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = '<p class="note">Looking for restaurants in the center…</p>';
    // Michelinov vodič traži po engleskom nazivu, pa ga dohvatimo za ove koordinate (Rim je ondje Rome).
    fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=en&lat=' + lat + '&lon=' + lon)
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var a = j.address || {};
        var en = a.city || a.town || a.village || j.name;
        if (!en) return;
        (function fix(n) {
          var link = document.querySelector('#' + elId + ' a.btn');
          if (link) link.href = michelin(en);
          else if (n) setTimeout(function () { fix(n - 1); }, 700);
        })(20);
      }).catch(function () {});
    var a = '(around:1800,' + lat + ',' + lon + ')';
    var q = '[out:json][timeout:20];nwr' + a + '[amenity=restaurant][name][website];out center 80;';
    overpass(q)
      .then(function (j) {
        if (!document.getElementById(elId)) return;
        var list = (j.elements || []).map(function (e) {
          var t = e.tags || {};
          var c = t.cuisine || '';
          return {
            t: t.name, c: c, web: t.website, ul: [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' '),
            rank: (/regional|local/.test(c) ? 0 : c ? 1 : 2) + (t['addr:street'] ? 0 : 0.5)
          };
        }).filter(function (r) { return /^https?:\/\//.test(r.web || ''); });
        list.sort(function (x, y) { return x.rank - y.rank; });
        list = list.slice(0, 12);
        el.innerHTML =
          '<p style="margin:0 0 14px"><a class="btn" href="' + esc(michelin(name)) + '" target="_blank" rel="noopener">Michelin Guide: ' + esc(name) + ' ↗</a></p>' +
          (list.length
            ? '<p class="note">Restaurants in the center that have their own website. The list comes from OpenStreetMap and has no ratings, so treat it as a starting point and open the Michelin Guide for proven picks.</p>' +
              '<div class="cards three">' + list.map(function (r) {
                return '<div class="mini">' + (kuhinja(r.c) ? '<span class="label">' + esc(kuhinja(r.c)) + '</span>' : '') +
                  '<h3 style="margin-top:6px">' + esc(r.t) + '</h3>' + (r.ul ? '<p>' + esc(r.ul) + '</p>' : '') +
                  '<p style="margin:0"><a href="' + esc(r.web) + '" target="_blank" rel="noopener">Official site ↗</a></p></div>';
              }).join('') + '</div>'
            : '<p class="note">No restaurants with their own website are listed for this place.</p>');
      })
      .catch(function () { if (document.getElementById(elId)) el.innerHTML = '<p style="margin:0"><a class="btn" href="' + esc(michelin(name)) + '" target="_blank" rel="noopener">Michelin Guide: ' + esc(name) + ' ↗</a></p>'; });
  }
  return { load: load, overpass: overpass };
})();
