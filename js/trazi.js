// Pretraga cijelog svijeta. Mjesta iz našeg vodiča otvaraju se izravno. Za sva ostala
// pokazujemo gdje su (OpenStreetMap), najbliža mjesta iz vodiča, znamenitosti u blizini
// s njihovim službenim stranicama i službene izvore za tu zemlju.
(function () {
  var app = document.getElementById('app');
  var input = document.getElementById('q');
  var I = window.ATLAS_INDEX || { trazi: [], mj: [], cc: {} };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  }
  function status(text) { app.innerHTML = '<p class="note" style="margin-top:30px">' + esc(text) + '</p>'; }
  function km(a, b, c, d) {
    var R = 6371, p = Math.PI / 180;
    var x = Math.sin((c - a) * p / 2), y = Math.sin((d - b) * p / 2);
    return 2 * R * Math.asin(Math.sqrt(x * x + Math.cos(a * p) * Math.cos(c * p) * y * y));
  }
  function dist(k) { return k < 1 ? Math.round(k * 1000 / 50) * 50 + ' m' : k < 20 ? k.toFixed(1).replace('.', ',') + ' km' : Math.round(k) + ' km'; }

  // ---------- naša mjesta ----------
  function curated(q) {
    var n = norm(q);
    if (n.length < 2) return [];
    var a = [], b = [];
    I.trazi.forEach(function (e) {
      var p = norm(e[0]).indexOf(n);
      if (p === 0) a.push(e); else if (p > 0) b.push(e);
    });
    return a.concat(b).slice(0, 8);
  }
  function curatedHtml(hits) {
    if (!hits.length) return '';
    return '<div class="sec-head" style="margin-top:34px"><h2>U našem <em>vodiču</em></h2></div><div class="grid places">' +
      hits.map(function (e) {
        return '<a class="pcard" href="' + esc(e[2]) + '"><span class="badge plain">' + esc(e[1]) + '</span><h3>' + esc(e[0]) + '</h3><span class="arrow">→</span></a>';
      }).join('') + '</div>';
  }
  function nearestGuide(lat, lon, n, maxKm) {
    return I.mj.map(function (m) { return { m: m, d: km(lat, lon, m[3], m[4]) }; })
      .filter(function (x) { return x.d <= maxKm; })
      .sort(function (x, y) { return x.d - y.d; }).slice(0, n);
  }
  function guideHtml(list, title) {
    if (!list.length) return '';
    return '<div class="sec-head" style="margin-top:40px"><h2>' + title + '</h2></div><div class="grid places">' +
      list.map(function (x) {
        return '<a class="pcard" href="' + esc(x.m[2]) + '"><span class="badge plain">' + esc(x.m[1]) + ' · ' + dist(x.d) + '</span><h3>' + esc(x.m[0]) + '</h3><span class="arrow">→</span></a>';
      }).join('') + '</div>';
  }

  // ---------- znamenitosti u blizini (OpenStreetMap) ----------
  var TIP = {
    museum: 'Muzej', gallery: 'Galerija', attraction: 'Znamenitost', viewpoint: 'Vidikovac', artwork: 'Umjetničko djelo',
    castle: 'Dvorac', monument: 'Spomenik', memorial: 'Spomen-obilježje', ruins: 'Ruševine', archaeological_site: 'Arheološko nalazište',
    church: 'Crkva', cathedral: 'Katedrala', monastery: 'Samostan', fort: 'Utvrda', city_gate: 'Gradska vrata', tower: 'Kula',
    palace: 'Palača', manor: 'Dvorac', building: 'Povijesna građevina', fountain: 'Fontana', bridge: 'Most', tomb: 'Grobnica',
    mosque: 'Džamija', temple: 'Hram', citywalls: 'Gradske zidine', wayside_shrine: 'Kapelica', aqueduct: 'Akvadukt', yes: 'Povijesno mjesto'
  };
  function sights(lat, lon, radius) {
    var a = '(around:' + radius + ',' + lat + ',' + lon + ')';
    var q = '[out:json][timeout:20];(nwr' + a + '[tourism~"^(attraction|museum|gallery|viewpoint)$"][name];nwr' + a +
      '[historic~"^(castle|monument|ruins|archaeological_site|church|cathedral|monastery|fort|city_gate|tower|palace|manor|fountain|bridge|tomb|mosque|temple|citywalls|aqueduct|memorial)$"][name];);out center 120;';
    return fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var seen = {};
        return (j.elements || []).map(function (e) {
          var t = e.tags || {}, la = e.lat || (e.center && e.center.lat), lo = e.lon || (e.center && e.center.lon);
          var kind = t.historic || t.tourism;
          return {
            t: t['name:hr'] || t.name, kind: TIP[kind] || 'Znamenitost', c: la ? [la, lo] : null,
            d: la ? km(lat, lon, la, lo) : 999, web: t.website || t['contact:website'] || '',
            rank: (t.website || t['contact:website'] ? 0 : 1) + (kind === 'memorial' || kind === 'artwork' ? 1 : 0)
          };
        }).filter(function (s) {
          var k = norm(s.t);
          if (!s.c || seen[k]) return false;
          seen[k] = 1; return true;
        });
      });
  }
  function sightsHtml(list, title) {
    if (!list.length) return '';
    return '<div class="sec-head" style="margin-top:40px"><h2>' + title + '</h2><span class="label">' + list.length + ' mjesta</span></div><div class="cards three">' +
      list.map(function (s) {
        var web = /^https?:\/\//.test(s.web) ? s.web : '';
        return '<div class="mini"><span class="label">' + esc(s.kind) + ' · ' + dist(s.d) + '</span><h3 style="margin-top:6px">' + esc(s.t) + '</h3>' +
          (web ? '<p style="margin:0"><a href="' + esc(web) + '" target="_blank" rel="noopener">Službena stranica ↗</a></p>' : '') + '</div>';
      }).join('') + '</div>';
  }
  function pins(list) { return list.map(function (s) { return { c: s.c, t: s.t, s: s.kind }; }); }

  // ---------- bilo koje mjesto na svijetu ----------
  function geocode(q) {
    return fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&accept-language=hr&q=' + encodeURIComponent(q))
      .then(function (r) { return r.json(); });
  }
  function showPlace(p, q, others) {
    var lat = +p.lat, lon = +p.lon, a = p.address || {};
    var name = p.name || (p.display_name || q).split(',')[0];
    var where = [a.state || a.region || a.county, a.country].filter(Boolean).join(', ');
    var ours = I.cc[(a.country_code || '').toLowerCase()];
    var big = /^(country|state|region|province)$/.test(p.addresstype || '');
    document.title = name + ' · Nas dvije po svijetu';
    app.innerHTML = curatedHtml(curated(q)) +
      '<header class="hero left" style="padding-top:34px;padding-bottom:18px"><span class="label">Još nije u vodiču</span>' +
      '<h1 style="font-size:clamp(2.6rem,10vw,5rem)">' + esc(name) + '</h1>' +
      (where ? '<p class="lead" style="margin:0">' + esc(where) + '</p>' : '') + '</header>' +
      '<p class="note" style="max-width:40em">Za ovo mjesto još nemamo vlastiti tekst. Dolje su karta, najbliža mjesta koja vodič već opisuje i znamenitosti u okolici s njihovim službenim stranicama.</p>' +
      (ours ? '<p><a class="btn" href="zemlja.html?z=' + ours[0] + '">Otvori vodič: ' + esc(ours[1]) + '</a></p>' : '') +
      '<div class="map" id="map"></div>' +
      '<div id="guide"></div><div id="sights"><p class="note" style="margin-top:26px">Tražim znamenitosti u okolici…</p></div>' +
      (others.length ? '<div class="sec-head" style="margin-top:40px"><h2>Možda ste <em>mislile</em></h2></div><div class="chips wrapc">' +
        others.map(function (o) { return '<a href="trazi.html?q=' + encodeURIComponent(o.display_name.split(',').slice(0, 3).join(',')) + '">' + esc(o.display_name.split(',').slice(0, 3).join(',')) + '</a>'; }).join('') + '</div>' : '');
    window.scrollTo(0, 0);
    var near = nearestGuide(lat, lon, 6, big ? 1500 : 400);
    document.getElementById('guide').innerHTML = guideHtml(near, 'Najbliže u <em>vodiču</em>');
    window.Karta.draw('map', [{ c: [lat, lon], t: name, s: where }], { zoom: big ? 5 : 11 });
    if (big) { document.getElementById('sights').innerHTML = ''; return; }
    sights(lat, lon, 6000).then(function (list) {
      list.sort(function (x, y) { return x.rank - y.rank || x.d - y.d; });
      list = list.slice(0, 30);
      document.getElementById('sights').innerHTML = sightsHtml(list, 'Znamenitosti u <em>okolici</em>');
      window.Karta.draw('map', [{ c: [lat, lon], t: name, s: where }].concat(pins(list)), { maxZoom: 13 });
    }).catch(function () { document.getElementById('sights').innerHTML = ''; });
  }

  function run(q) {
    input.value = q;
    var hits = curated(q);
    var exact = hits.filter(function (e) { return norm(e[0]) === norm(q); })[0];
    if (exact) { location.replace(exact[2]); return; }
    status('Tražim „' + q + '“…');
    geocode(q).then(function (list) {
      if (!list.length) {
        app.innerHTML = curatedHtml(hits) + '<p class="note" style="margin-top:30px">Za „' + esc(q) + '“ nema rezultata. Pokušajte s drugim nazivom ili na engleskom.</p>';
        return;
      }
      showPlace(list[0], q, list.slice(1, 4));
    }).catch(function () { status('Pretraga trenutačno nije dostupna. Provjerite internetsku vezu i pokušajte ponovno.'); });
  }

  // ---------- što je oko mene ----------
  function around() {
    if (!navigator.geolocation) return status('Ovaj uređaj ne dopušta određivanje položaja.');
    status('Određujem gdje ste…');
    navigator.geolocation.getCurrentPosition(function (pos) {
      var lat = pos.coords.latitude, lon = pos.coords.longitude;
      document.title = 'Oko mene · Nas dvije po svijetu';
      app.innerHTML = '<header class="hero left" style="padding-top:34px;padding-bottom:18px"><span class="label">Na dohvat ruke</span><h1 style="font-size:clamp(2.6rem,10vw,5rem)">Oko mene</h1>' +
        '<p class="lead" style="margin:0">Znamenitosti u krugu od kilometra i pol, poredane od najbliže, te najbliža mjesta koja vodič opisuje.</p></header>' +
        '<div class="map" id="map"></div><div id="guide"></div><div id="sights"><p class="note" style="margin-top:26px">Tražim znamenitosti oko vas…</p></div>';
      document.getElementById('guide').innerHTML = guideHtml(nearestGuide(lat, lon, 3, 150), 'Najbliže u <em>vodiču</em>');
      window.Karta.draw('map', [{ c: [lat, lon], t: 'Ovdje ste' }], { zoom: 15 });
      sights(lat, lon, 1500).then(function (list) {
        list.sort(function (x, y) { return x.d - y.d; });
        list = list.slice(0, 40);
        document.getElementById('sights').innerHTML = list.length ? sightsHtml(list, 'Najbliže <em>vama</em>') : '<p class="note" style="margin-top:26px">U blizini nema zabilježenih znamenitosti.</p>';
        window.Karta.draw('map', [{ c: [lat, lon], t: 'Ovdje ste' }].concat(pins(list)), { maxZoom: 16 });
      }).catch(function () { document.getElementById('sights').innerHTML = ''; });
    }, function () {
      status('Položaj nije dostupan. Dopustite pregledniku pristup lokaciji pa pokušajte ponovno.');
    }, { enableHighAccuracy: true, timeout: 15000 });
  }

  document.getElementById('form').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (q) location.href = 'trazi.html?q=' + encodeURIComponent(q);
  });
  document.getElementById('near').addEventListener('click', function () { location.href = 'trazi.html?blizu=1'; });

  var Q = new URLSearchParams(location.search);
  if (Q.get('blizu')) around();
  else if (Q.get('q')) run(Q.get('q'));
  else app.innerHTML = '<p class="lead" style="margin-top:30px">Upišite bilo koji grad ili zemlju na svijetu.</p>';
})();
