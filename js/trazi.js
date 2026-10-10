// Pretraga cijelog svijeta: sve što nije u našem atlasu dohvaća se uživo s Wikipedije,
// najprije na hrvatskom, a ako članka nema, na engleskom.
(function () {
  var app = document.getElementById('app');
  var input = document.getElementById('q');
  var I = window.ATLAS_INDEX || { trazi: [] };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  }
  function api(lang, params) {
    var url = 'https://' + lang + '.wikipedia.org/w/api.php?format=json&formatversion=2&origin=*&' +
      Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
    return fetch(url).then(function (r) { return r.json(); });
  }
  function status(text) { app.innerHTML = '<p class="note" style="margin-top:30px">' + esc(text) + '</p>'; }
  function live(title, lang) { return 'trazi.html?q=' + encodeURIComponent(title) + (lang ? '&j=' + lang : ''); }

  // ---------- naši, ručno pisani rezultati ----------
  function curated(q) {
    var n = norm(q);
    if (n.length < 2) return '';
    var a = [], b = [];
    I.trazi.forEach(function (e) {
      var p = norm(e[0]).indexOf(n);
      if (p === 0) a.push(e); else if (p > 0) b.push(e);
    });
    var hits = a.concat(b).slice(0, 6);
    if (!hits.length) return '';
    return '<h2 class="group-title">U našem vodiču</h2><div class="results" style="margin:0;max-width:none">' +
      hits.map(function (e) { return '<a href="' + esc(e[2]) + '"><small>' + esc(e[1]) + '</small>' + esc(e[0]) + '</a>'; }).join('') + '</div>';
  }

  // ---------- jedan članak ----------
  function textToHtml(t) {
    return t.split(/\n(?===)/).map(function (block) {
      var m = block.match(/^(=+)\s*(.+?)\s*=+\n?/);
      var body = m ? block.slice(m[0].length) : block;
      var ps = body.split(/\n+/).filter(function (x) { return x.trim(); }).map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('');
      if (m && !ps) return '';
      return (m ? '<h3 style="margin-top:1.2em">' + esc(m[2]) + '</h3>' : '') + ps;
    }).join('');
  }

  function nearby(lang, lat, lon, skipTitle) {
    return api(lang, {
      action: 'query', generator: 'geosearch', ggscoord: lat + '|' + lon, ggsradius: 10000, ggslimit: 30,
      prop: 'pageimages|description|coordinates', piprop: 'thumbnail', pithumbsize: 160
    }).then(function (j) {
      var pages = ((j.query || {}).pages || []).filter(function (p) { return p.title !== skipTitle; });
      pages.sort(function (x, y) { return (x.index || 0) - (y.index || 0); });
      return pages.map(function (p) {
        var c = p.coordinates && p.coordinates[0];
        return { t: p.title, d: p.description || '', img: p.thumbnail && p.thumbnail.source, c: c ? [c.lat, c.lon] : null, lang: lang };
      });
    });
  }
  function nearbyHtml(list) {
    if (!list.length) return '';
    return '<h2 class="group-title">U blizini</h2>' + list.map(function (p) {
      return '<a class="card place" href="' + live(p.t, p.lang) + '"><div><h3 style="font-size:1.4rem">' + esc(p.t) + '</h3>' +
        (p.d ? '<p>' + esc(p.d) + '</p>' : '') + '</div><span class="arrow">→</span></a>';
    }).join('');
  }
  function bothNearby(lat, lon, skip) {
    return nearby('hr', lat, lon, skip).then(function (hr) {
      if (hr.length >= 8) return hr;
      return nearby('en', lat, lon, skip).then(function (en) {
        var seen = {};
        hr.forEach(function (p) { seen[norm(p.t)] = 1; });
        return hr.concat(en.filter(function (p) { return !seen[norm(p.t)]; })).slice(0, 30);
      });
    });
  }

  function showPage(lang, title, q) {
    return api(lang, {
      action: 'query', prop: 'extracts|coordinates|pageimages|info|description', titles: title, redirects: 1,
      explaintext: 1, exsectionformat: 'wiki', exchars: 3500, piprop: 'thumbnail', pithumbsize: 1000, inprop: 'url'
    }).then(function (j) {
      var p = ((j.query || {}).pages || [])[0];
      if (!p || p.missing || !p.extract) return false;
      var c = p.coordinates && p.coordinates[0];
      document.title = p.title + ' · Nas dvije po svijetu';
      app.innerHTML = curated(q || p.title) +
        '<header class="hero left" style="padding-top:26px"><span class="label">Uživo s Wikipedije' + (lang === 'en' ? ' · na engleskom' : '') + '</span>' +
        '<h1 style="font-size:clamp(2.6rem,11vw,5rem)">' + esc(p.title) + '</h1>' +
        (p.description ? '<p class="lead">' + esc(p.description.charAt(0).toUpperCase() + p.description.slice(1)) + '</p>' : '') + '</header>' +
        (p.thumbnail ? '<img src="' + esc(p.thumbnail.source) + '" alt="" style="width:100%;max-height:340px;object-fit:contain;background:var(--paper);border-radius:26px;display:block;margin-bottom:18px">' : '') +
        '<div class="card">' + textToHtml(p.extract) +
        '<p style="margin:14px 0 0"><a class="btn" href="' + esc(p.fullurl) + '" target="_blank" rel="noopener">Cijeli članak ↗</a></p></div>' +
        (lang === 'en' ? '<p class="note">Za ovo mjesto nema članka na hrvatskom, pa je prikazan engleski.</p>' : '') +
        (c ? '<h2 class="group-title">Na karti</h2><div class="map" id="map" style="margin-top:0"></div><div id="nearby"></div>' : '');
      window.scrollTo(0, 0);
      if (c) {
        bothNearby(c.lat, c.lon, p.title).then(function (list) {
          document.getElementById('nearby').innerHTML = nearbyHtml(list);
          window.Karta.draw('map', [{ c: [c.lat, c.lon], t: p.title }].concat(list.map(function (x) {
            return { c: x.c, t: x.t, s: x.d, h: live(x.t, x.lang) };
          })), { maxZoom: 13, zoom: 11 });
        }).catch(function () { window.Karta.draw('map', [{ c: [c.lat, c.lon], t: p.title }], { zoom: 10 }); });
      }
      return true;
    });
  }

  function find(lang, q) {
    return api(lang, { action: 'query', list: 'search', srsearch: q, srlimit: 1 }).then(function (j) {
      var hit = ((j.query || {}).search || [])[0];
      return hit ? hit.title : null;
    });
  }

  function run(q, forceLang) {
    input.value = q;
    status('Tražim „' + q + '“…');
    var langs = forceLang ? [forceLang] : ['hr', 'en'];
    (function next() {
      var lang = langs.shift();
      if (!lang) {
        app.innerHTML = curated(q) + '<p class="note" style="margin-top:30px">Za „' + esc(q) + '“ nema rezultata. Pokušajte s drugim nazivom ili na engleskom.</p>';
        return;
      }
      find(lang, q).then(function (title) {
        if (!title) return next();
        return showPage(lang, title, q).then(function (ok) { if (!ok) next(); });
      }).catch(function () { status('Pretraga trenutačno nije dostupna. Provjerite internetsku vezu i pokušajte ponovno.'); });
    })();
  }

  // ---------- što je oko mene ----------
  function around() {
    if (!navigator.geolocation) return status('Ovaj uređaj ne dopušta određivanje položaja.');
    status('Određujem gdje ste…');
    navigator.geolocation.getCurrentPosition(function (pos) {
      var lat = pos.coords.latitude, lon = pos.coords.longitude;
      bothNearby(lat, lon, '').then(function (list) {
        document.title = 'Oko mene · Nas dvije po svijetu';
        app.innerHTML = '<header class="hero left" style="padding-top:26px"><span class="label">Unutar deset kilometara</span><h1 style="font-size:clamp(2.6rem,11vw,5rem)">Oko mene</h1>' +
          '<p class="lead">Znamenitosti, trgovi, crkve i muzeji u vašoj blizini, poredani od najbližeg. Dodirnite bilo koji da pročitate što je to.</p></header>' +
          '<div class="map" id="map" style="margin-top:0"></div>' +
          (list.length ? nearbyHtml(list).replace('U blizini', 'Najbliže vama') : '<p class="note">U blizini nema zabilježenih znamenitosti.</p>');
        window.Karta.draw('map', [{ c: [lat, lon], t: 'Ovdje ste' }].concat(list.map(function (x) {
          return { c: x.c, t: x.t, s: x.d, h: live(x.t, x.lang) };
        })), { maxZoom: 15, zoom: 14 });
      }).catch(function () { status('Pretraga trenutačno nije dostupna. Provjerite internetsku vezu.'); });
    }, function () {
      status('Položaj nije dostupan. Dopustite pregledniku pristup lokaciji pa pokušajte ponovno.');
    }, { enableHighAccuracy: true, timeout: 15000 });
  }

  document.getElementById('form').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (q) location.href = live(q);
  });
  document.getElementById('near').addEventListener('click', function () { location.href = 'trazi.html?blizu=1'; });

  var P = new URLSearchParams(location.search);
  if (P.get('blizu')) around();
  else if (P.get('q')) run(P.get('q'), P.get('j') === 'en' || P.get('j') === 'hr' ? P.get('j') : null);
  else app.innerHTML = '<p class="lead" style="margin-top:30px">Upišite bilo koji grad, zemlju ili znamenitost na svijetu. Ono što u vodiču još nije napisano stiže uživo s Wikipedije, uvijek u najnovijem izdanju.</p>';
})();
