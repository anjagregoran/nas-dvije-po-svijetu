// Restorani u blizini nekog mjesta, uživo iz OpenStreetMapa. To je popis onoga što postoji,
// bez ocjena, pa uz njega nudimo i poveznicu na Michelinov vodič za isto mjesto.
window.Restorani = (function () {
  var KUH = {
    regional: 'domaća kuhinja', local: 'domaća kuhinja', italian: 'talijanska', pizza: 'pizza', seafood: 'riba i plodovi mora',
    fish: 'riba', french: 'francuska', spanish: 'španjolska', tapas: 'tapas', greek: 'grčka', turkish: 'turska',
    japanese: 'japanska', sushi: 'sushi', chinese: 'kineska', thai: 'tajlandska', indian: 'indijska', mexican: 'meksička',
    vietnamese: 'vijetnamska', korean: 'korejska', mediterranean: 'mediteranska', steak_house: 'odresci', grill: 'roštilj',
    barbecue: 'roštilj', vegetarian: 'vegetarijanska', vegan: 'veganska', international: 'međunarodna', german: 'njemačka',
    portuguese: 'portugalska', lebanese: 'libanonska', moroccan: 'marokanska', peruvian: 'peruanska', argentinian: 'argentinska',
    american: 'američka', burger: 'burgeri', noodle: 'rezanci', ramen: 'ramen', asian: 'azijska', balkan: 'balkanska',
    croatian: 'hrvatska', austrian: 'austrijska', bavarian: 'bavarska', georgian: 'gruzijska', bistro: 'bistro'
  };
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
    el.innerHTML = '<p class="note">Tražim restorane u središtu…</p>';
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
          '<p style="margin:0 0 14px"><a class="btn" href="' + esc(michelin(name)) + '" target="_blank" rel="noopener">Michelinov vodič: ' + esc(name) + ' ↗</a></p>' +
          (list.length
            ? '<p class="note">Restorani u središtu sa službenim stranicama. Popis dolazi s OpenStreetMapa i nema ocjena, pa ga uzmite kao polazište, a za provjerene preporuke otvorite Michelinov vodič.</p>' +
              '<div class="cards three">' + list.map(function (r) {
                return '<div class="mini">' + (kuhinja(r.c) ? '<span class="label">' + esc(kuhinja(r.c)) + '</span>' : '') +
                  '<h3 style="margin-top:6px">' + esc(r.t) + '</h3>' + (r.ul ? '<p>' + esc(r.ul) + '</p>' : '') +
                  '<p style="margin:0"><a href="' + esc(r.web) + '" target="_blank" rel="noopener">Službena stranica ↗</a></p></div>';
              }).join('') + '</div>'
            : '<p class="note">Za ovo mjesto nema popisa restorana sa službenim stranicama.</p>');
      })
      .catch(function () { if (document.getElementById(elId)) el.innerHTML = '<p style="margin:0"><a class="btn" href="' + esc(michelin(name)) + '" target="_blank" rel="noopener">Michelinov vodič: ' + esc(name) + ' ↗</a></p>'; });
  }
  return { load: load, overpass: overpass };
})();
