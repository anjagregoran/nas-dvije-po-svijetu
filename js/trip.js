(function () {
  var T = window.TRIP;
  var app = document.getElementById('app');
  document.getElementById('naslov').textContent = T.naziv;
  document.title = T.naziv + ' · Putokaz';

  // ---------- pomoćne funkcije ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function paras(t) {
    if (!t) return '';
    return (Array.isArray(t) ? t : [t]).map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('');
  }
  function list(items) {
    if (!items || !items.length) return '';
    return '<ul class="list">' + items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
  }
  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  }
  function link(url, text) {
    return url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(text || 'Službena stranica') + ' ↗</a>' : '';
  }
  function head(label, title, lead) {
    return '<header class="hero left"><span class="label">' + esc(label) + '</span><h1>' + esc(title) + '</h1>' +
      (lead ? '<div class="lead">' + paras(lead) + '</div>' : '') + '</header>';
  }

  // ---------- pamćenje što je viđeno i kušano ----------
  var KEY = 'putokaz:' + T.id;
  var store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  function isDone(id) { return !!store[id]; }
  function toggle(id) {
    if (store[id]) delete store[id]; else store[id] = 1;
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
  }
  function doneBtn(id, onText, offText) {
    var on = isDone(id);
    return '<button type="button" class="' + (on ? 'on' : 'ghost') + '" data-done="' + esc(id) + '" data-on="' + esc(onText) + '" data-off="' + esc(offText) + '">' +
      esc(on ? onText : offText) + '</button>';
  }
  function progress(ids, label) {
    var n = ids.filter(isDone).length;
    var pct = ids.length ? Math.round(n / ids.length * 100) : 0;
    return '<div class="prog" data-ids="' + esc(ids.join('|')) + '" data-label="' + esc(label) + '">' +
      '<span class="label">' + esc(label) + ': ' + n + ' od ' + ids.length + '</span>' +
      '<div class="progress"><i style="width:' + pct + '%"></i></div></div>';
  }

  var sightIds = [];
  T.mjesta.forEach(function (m) {
    (m.znamenitosti || []).forEach(function (z, i) { z._id = 'z:' + m.id + ':' + i; sightIds.push(z._id); });
  });
  var foodIds = [];
  T.hrana.forEach(function (k, ki) {
    k.stavke.forEach(function (s, i) { s._id = 'h-' + ki + '-' + i; foodIds.push(s._id); });
  });

  // ---------- pretraga ----------
  var index = [];
  T.mjesta.forEach(function (m) {
    index.push({ t: m.ime, k: 'Mjesto', h: '#/mjesto/' + m.id, x: norm(m.ime + ' ' + m.sazetak) });
    (m.znamenitosti || []).forEach(function (z, i) {
      index.push({ t: z.ime, k: m.ime, h: '#/mjesto/' + m.id + '/' + i, x: norm(z.ime + ' ' + z.sto + ' ' + m.ime) });
    });
  });
  T.hrana.forEach(function (k) {
    k.stavke.forEach(function (s) {
      index.push({ t: s.ime, k: 'Hrana · ' + k.kategorija, h: '#/hrana/' + s._id, x: norm(s.ime + ' ' + s.opis) });
    });
  });
  T.kultura.forEach(function (c, i) {
    index.push({ t: c.naslov, k: 'Kultura', h: '#/kultura/' + i, x: norm(c.naslov + ' ' + (c.uvod || '') + ' ' + c.dijelovi.map(function (d) { return d.naslov || ''; }).join(' ')) });
  });
  T.akoZelis.forEach(function (a, i) {
    index.push({ t: a.zelja, k: 'Ako želiš', h: '#/ako-zelis/' + i, x: norm(a.zelja + ' ' + a.opcije.map(function (o) { return o.ime + ' ' + o.mjesto; }).join(' ')) });
  });

  function searchBox() {
    return '<div class="search left"><input type="search" id="q" placeholder="Što gledamo? Npr. Santa Croce" autocomplete="off"></div><div class="results" id="res" style="margin-left:0"></div>';
  }
  function runSearch(q) {
    var res = document.getElementById('res');
    q = norm(q.trim());
    if (q.length < 2) { res.innerHTML = ''; return; }
    var hits = index.filter(function (e) { return e.x.indexOf(q) > -1; }).slice(0, 12);
    res.innerHTML = hits.length
      ? hits.map(function (e) { return '<a href="' + e.h + '"><small>' + esc(e.k) + '</small>' + esc(e.t) + '</a>'; }).join('')
      : '<p class="note">Ništa pod tim imenom. Pokušajte kraće ili na talijanskom.</p>';
  }

  function tile(h, c, label, title, sub) {
    return '<a class="tilec ' + c + '" href="' + h + '"><span class="label">' + label + '</span><div><h3>' + title + '</h3><p>' + sub + '</p></div></a>';
  }
  function randomFact() { return T.jesteLiZnale[Math.floor(Math.random() * T.jesteLiZnale.length)]; }

  // ---------- pogledi ----------
  var views = {};

  views.pocetak = function () {
    var nSights = sightIds.length, nFood = foodIds.length;
    return head(T.nadnaslov, T.naziv, T.uvod) +
      searchBox() +
      '<div class="grid" style="margin-top:26px">' +
        tile('#/mjesta', 'c0', T.mjesta.length + ' mjesta', 'Mjesta', 'Što gledamo i zašto je važno') +
        tile('#/hrana', 'c1', nFood + ' jela i pića', 'Hrana', 'Što se ovdje jede i gdje') +
        tile('#/kultura', 'c2', 'Ples, fešte, život', 'Kultura', 'Priče iza običaja') +
        tile('#/ako-zelis', 'c3', T.akoZelis.length + ' ideja', 'Ako želiš', 'Kamo po koji doživljaj') +
        tile('#/povijest', 'c4', '3000 godina', 'Povijest', 'Tko je sve ovuda prošao') +
        tile('#/rjecnik', 'c5', 'Talijanski', 'Rječnik', 'Fraze s izgovorom') +
      '</div>' +
      '<div class="factbox" style="margin-top:14px"><span class="label">Jeste li znale?</span><p class="big" id="fact">' + esc(randomFact()) + '</p><button type="button" class="btn dark" id="nextfact">Još jedna</button></div>' +
      '<h2 class="group-title">Dnevnik puta</h2><div class="card">' +
        progress(sightIds, 'Viđeno') + progress(foodIds, 'Kušano') +
        '<p class="note" style="margin:0">Uz svaku znamenitost i svako jelo nalazi se gumb kojim ih možete označiti. Od ' + nSights + ' znamenitosti i ' + nFood + ' okusa, koliko ćete ih skupiti?</p>' +
      '</div>' +
      '<h2 class="group-title">Ukratko</h2><div class="card kv">' +
        T.ukratko.map(function (u) { return '<div><b>' + esc(u.k) + '</b>' + esc(u.v) + '</div>'; }).join('') +
      '</div>';
  };

  views.mjesta = function () {
    var groups = [];
    T.mjesta.forEach(function (m) {
      var g = groups.filter(function (x) { return x.n === m.regija; })[0];
      if (!g) { g = { n: m.regija, m: [] }; groups.push(g); }
      g.m.push(m);
    });
    return head(T.naziv, 'Mjesta', 'Otvorite mjesto u kojem ste i čitajte dok hodate. Svaka znamenitost ima svoju priču i sitnice koje vrijedi potražiti.') +
      searchBox() + '<div class="map" id="map" style="margin-top:20px"></div>' +
      groups.map(function (g) {
        return '<h2 class="group-title">' + esc(g.n) + '</h2>' +
          g.m.map(function (m) {
            var ids = (m.znamenitosti || []).map(function (z) { return z._id; });
            var n = ids.filter(isDone).length;
            return '<a class="card place" href="#/mjesto/' + m.id + '">' +
              '<div><h3>' + esc(m.ime) + '</h3><p>' + esc(m.sazetak) + '</p>' +
              (n ? '<span class="badge">Viđeno ' + n + ' od ' + ids.length + '</span>' : '') +
              '</div><span class="arrow">→</span></a>';
          }).join('');
      }).join('');
  };

  views.mjesto = function (id, open) {
    var m = T.mjesta.filter(function (x) { return x.id === id; })[0];
    if (!m) return views.mjesta();
    var ids = (m.znamenitosti || []).map(function (z) { return z._id; });
    return '<p style="margin:26px 0 0"><a href="#/mjesta" class="label" style="text-decoration:none">← Sva mjesta</a></p>' +
      head(m.regija, m.ime, m.prica).replace('hero left"', 'hero left" style="padding-top:14px"') +
      (ids.length ? progress(ids, 'Viđeno') : '') +
      (ids.length ? '<h2 class="group-title">Što gledamo</h2>' : '') +
      (m.znamenitosti || []).map(function (z, i) {
        return '<details class="card' + (isDone(z._id) ? ' done' : '') + '" id="z' + i + '"' + (String(open) === String(i) ? ' open' : '') + '>' +
          '<summary>' + esc(z.ime) + '<small>' + esc(z.sto) + '</small></summary>' +
          '<div class="inner">' + paras(z.prica) +
          (z.potrazi && z.potrazi.length ? '<div class="look"><span class="label">Potražite</span>' + list(z.potrazi) + '</div>' : '') +
          (z.prakticno ? '<p class="note">' + esc(z.prakticno) + '</p>' : '') +
          (z.link ? '<p>' + link(z.link) + '</p>' : '') +
          doneBtn(z._id, 'Viđeno', 'Označi kao viđeno') +
          '</div></details>';
      }).join('') +
      (m.zanimljivosti && m.zanimljivosti.length ? '<h2 class="group-title">Legende i zanimljivosti</h2><div class="card">' + list(m.zanimljivosti) + '</div>' : '') +
      (m.hrvatska ? '<h2 class="group-title">Veza s Hrvatskom</h2><div class="hr-link">' + paras(m.hrvatska) + '</div>' : '') +
      (m.jedi && m.jedi.length ? '<h2 class="group-title">Što ovdje jesti</h2><div class="look food">' + list(m.jedi) + '</div>' : '') +
      (m.savjet ? '<h2 class="group-title">Dobro je znati</h2><div class="card">' + paras(m.savjet) + '</div>' : '');
  };

  views.hrana = function () {
    return head(T.naziv, 'Hrana', T.hranaUvod) +
      progress(foodIds, 'Kušano') +
      '<div class="chips">' + T.hrana.map(function (k, i) { return '<a href="#/hrana/k' + i + '">' + esc(k.kategorija) + '</a>'; }).join('') + '</div>' +
      T.hrana.map(function (k, ki) {
        return '<h2 class="group-title" id="k' + ki + '">' + esc(k.kategorija) + '</h2>' +
          k.stavke.map(function (s) {
            return '<details class="card' + (isDone(s._id) ? ' done' : '') + '" id="' + s._id + '">' +
              '<summary>' + esc(s.ime) + '<small>' + esc(s.opis) + '</small></summary>' +
              '<div class="inner">' +
              (s.izgovor ? '<p class="say">Čita se: ' + esc(s.izgovor) + '</p>' : '') +
              paras(s.prica) +
              (s.gdje ? '<div class="look food"><span class="label">Gdje kušati</span>' + paras(s.gdje) + '</div>' : '') +
              (s.savjet ? '<p class="note">' + esc(s.savjet) + '</p>' : '') +
              doneBtn(s._id, 'Kušano', 'Označi kao kušano') +
              '</div></details>';
          }).join('');
      }).join('') +
      (T.zaStolom ? '<h2 class="group-title">Za stolom</h2>' + T.zaStolom.map(function (z) {
        return '<details class="card"><summary>' + esc(z.naslov) + '</summary><div class="inner">' + paras(z.tekst) + '</div></details>';
      }).join('') : '');
  };

  views.kultura = function (open) {
    return head(T.naziv, 'Kultura', T.kulturaUvod) +
      T.kultura.map(function (c, i) {
        return '<details class="card" id="c' + i + '"' + (String(open) === String(i) ? ' open' : '') + '>' +
          '<summary>' + esc(c.naslov) + (c.uvod ? '<small>' + esc(c.uvod) + '</small>' : '') + '</summary>' +
          '<div class="inner">' +
          c.dijelovi.map(function (d) {
            return (d.naslov ? '<h3>' + esc(d.naslov) + '</h3>' : '') + paras(d.tekst) + list(d.popis);
          }).join('') +
          '</div></details>';
      }).join('');
  };

  views.akoZelis = function (open) {
    return head(T.naziv, 'Ako želiš', 'Odaberite što vam se danas radi, a ovdje piše kamo po to.') +
      T.akoZelis.map(function (a, i) {
        return '<details class="card" id="a' + i + '"' + (String(open) === String(i) ? ' open' : '') + '>' +
          '<summary>' + esc(a.zelja) + '</summary>' +
          '<div class="inner">' + paras(a.uvod) +
          a.opcije.map(function (o) {
            return '<h3>' + esc(o.ime) + '</h3>' +
              '<p class="meta">' + esc(o.mjesto) + '</p>' +
              paras(o.opis) +
              (o.napomena ? '<p class="note">' + esc(o.napomena) + '</p>' : '') +
              (o.link ? '<p>' + link(o.link) + '</p>' : '');
          }).join('') +
          '</div></details>';
      }).join('');
  };

  views.povijest = function () {
    return head(T.naziv, 'Povijest', T.povijestUvod) +
      '<div class="timeline">' + T.povijest.map(function (e) {
        return '<div class="ev"><div class="yr">' + esc(e.kada) + '</div><h3>' + esc(e.naslov) + '</h3>' + paras(e.tekst) + '</div>';
      }).join('') + '</div>';
  };

  views.rjecnik = function () {
    return head(T.naziv, 'Rječnik', T.rjecnikUvod) +
      T.rjecnik.map(function (g) {
        return '<h2 class="group-title">' + esc(g.skupina) + '</h2><div class="card">' +
          g.fraze.map(function (f) {
            return '<div class="phrase"><b>' + esc(f.it) + '</b>' + (f.izgovor ? '<i>' + esc(f.izgovor) + '</i>' : '') + '<span>' + esc(f.hr) + '</span></div>';
          }).join('') + '</div>';
      }).join('');
  };

  views.prakticno = function () {
    return head(T.naziv, 'Praktično', 'Prijevoz, novac i navike koje vrijedi znati prije polaska.') +
      T.prakticno.map(function (p) {
        return '<details class="card"><summary>' + esc(p.naslov) + '</summary><div class="inner">' + paras(p.tekst) + list(p.popis) + '</div></details>';
      }).join('');
  };

  views.jos = function () {
    return head(T.naziv, 'Još') +
      '<div class="grid">' +
        tile('#/povijest', 'c4', '3000 godina', 'Povijest', 'Tko je sve ovuda prošao') +
        tile('#/rjecnik', 'c5', 'Talijanski', 'Rječnik', 'Fraze s izgovorom') +
        tile('#/prakticno', 'c0', 'Prije polaska', 'Praktično', 'Prijevoz, novac, navike') +
        tile('#/izvori', 'c2', 'Provjereno', 'Izvori', 'Odakle sve ovo znamo') +
      '</div>';
  };

  views.izvori = function () {
    return head(T.naziv, 'Izvori', 'Sadržaj je provjeren na službenim stranicama i kod autora koji ovaj kraj dobro poznaju. Cijene i radna vremena mijenjaju se, pa ih uvijek vrijedi još jednom pogledati prije odlaska.') +
      '<div class="card"><ul class="list">' + T.izvori.map(function (s) {
        return '<li>' + link(s.url, s.ime) + '</li>';
      }).join('') + '</ul></div>';
  };

  // ---------- usmjeravanje ----------
  function route() {
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    var v = parts[0] || 'pocetak';
    var html, tab = v, scrollTo = null;

    if (v === 'mjesto') { html = views.mjesto(parts[1], parts[2]); tab = 'mjesta'; if (parts[2] != null) scrollTo = 'z' + parts[2]; }
    else if (v === 'hrana') { html = views.hrana(); scrollTo = parts[1] || null; }
    else if (v === 'kultura') { html = views.kultura(parts[1]); if (parts[1] != null) scrollTo = 'c' + parts[1]; }
    else if (v === 'ako-zelis') { html = views.akoZelis(parts[1]); if (parts[1] != null) scrollTo = 'a' + parts[1]; }
    else if (views[v]) { html = views[v](); if (/^(povijest|rjecnik|prakticno|izvori)$/.test(v)) tab = 'jos'; }
    else { html = views.pocetak(); tab = ''; }

    app.innerHTML = html;
    if (v === 'mjesta' && window.Karta) {
      var KO = window.KOORDINATE || {};
      window.Karta.draw('map', T.mjesta.map(function (m) {
        return { c: KO[T.id + '/' + m.id], t: m.ime, s: m.sazetak, h: '#/mjesto/' + m.id };
      }), { maxZoom: 9 });
    }
    document.querySelectorAll('.tabs a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-tab') === tab);
    });

    var el = scrollTo && document.getElementById(scrollTo);
    if (el) {
      if (el.tagName === 'DETAILS') el.open = true;
      el.scrollIntoView();
      window.scrollBy(0, -76);
    } else {
      window.scrollTo(0, 0);
    }
  }

  // ---------- događaji ----------
  app.addEventListener('input', function (e) {
    if (e.target.id === 'q') runSearch(e.target.value);
  });
  app.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.id === 'nextfact') { document.getElementById('fact').textContent = randomFact(); return; }
    var id = b.getAttribute('data-done');
    if (!id) return;
    toggle(id);
    var on = isDone(id);
    b.className = on ? 'on' : 'ghost';
    b.textContent = on ? b.getAttribute('data-on') : b.getAttribute('data-off');
    var d = b.closest('details');
    if (d) d.classList.toggle('done', on);
    document.querySelectorAll('.prog').forEach(function (p) {
      var ids = p.getAttribute('data-ids').split('|');
      var n = ids.filter(isDone).length;
      p.querySelector('.label').textContent = p.getAttribute('data-label') + ': ' + n + ' od ' + ids.length;
      p.querySelector('i').style.width = Math.round(n / ids.length * 100) + '%';
    });
  });

  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
