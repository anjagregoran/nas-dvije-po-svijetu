(function () {
  var T = window.TRIP;
  var app = document.getElementById('app');
  document.getElementById('naslov').textContent = T.naziv;
  document.title = T.naziv + ' · Nas dvije po svijetu';

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
  function list(items, cls) {
    if (!items || !items.length) return '';
    return '<ul class="' + (cls || 'list') + '">' + items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
  }
  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  }
  function link(url, text) {
    return url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(text || 'Službena stranica') + ' ↗</a>' : '';
  }

  // ---------- pamćenje što smo vidjele i probale ----------
  var KEY = 'ndps:' + T.id;
  var store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  function isDone(id) { return !!store[id]; }
  function toggle(id) {
    if (store[id]) delete store[id]; else store[id] = 1;
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
  }
  function doneBtn(id, onText, offText) {
    var on = isDone(id);
    return '<button type="button" class="' + (on ? 'on' : '') + '" data-done="' + esc(id) + '" data-on="' + esc(onText) + '" data-off="' + esc(offText) + '">' +
      (on ? '✓ ' + esc(onText) : esc(offText)) + '</button>';
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
    k.stavke.forEach(function (s, i) { s._id = 'h:' + ki + ':' + i; foodIds.push(s._id); });
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
    index.push({ t: c.naslov, k: 'Kultura', h: '#/kultura/' + i, x: norm(c.naslov + ' ' + (c.uvod || '')) });
  });
  T.akoZelis.forEach(function (a, i) {
    index.push({ t: a.zelja, k: 'Ako želiš', h: '#/ako-zelis/' + i, x: norm(a.zelja + ' ' + a.opcije.map(function (o) { return o.ime + ' ' + o.mjesto; }).join(' ')) });
  });

  function searchBox() {
    return '<div class="search"><input type="search" id="q" placeholder="Što gledamo? Upiši npr. Santa Croce" autocomplete="off"></div><div class="results" id="res"></div>';
  }
  function runSearch(q) {
    var res = document.getElementById('res');
    q = norm(q.trim());
    if (q.length < 2) { res.innerHTML = ''; return; }
    var hits = index.filter(function (e) { return e.x.indexOf(q) > -1; }).slice(0, 12);
    res.innerHTML = hits.length
      ? hits.map(function (e) { return '<a href="' + e.h + '"><small>' + esc(e.k) + '</small>' + esc(e.t) + '</a>'; }).join('')
      : '<p class="note">Ništa nismo našle pod tim imenom. Probaj kraće ili na talijanskom.</p>';
  }

  // ---------- pogledi ----------
  var views = {};

  views.pocetak = function () {
    var f = T.jesteLiZnale[Math.floor(Math.random() * T.jesteLiZnale.length)];
    return '<header class="hero">' +
        '<span class="hand">' + esc(T.rukopis) + '</span>' +
        '<h1>' + esc(T.naziv) + '</h1>' +
        '<p class="lead">' + esc(T.uvod) + '</p>' +
      '</header>' +
      searchBox() +
      '<div class="tiles">' +
        tile('#/mjesta', '📍', 'Mjesta', 'Što gledamo i zašto je važno') +
        tile('#/hrana', '🍝', 'Hrana', 'Što se ovdje jede i gdje') +
        tile('#/kultura', '💃', 'Kultura', 'Ples, običaji i život') +
        tile('#/ako-zelis', '✨', 'Ako želiš', 'Ideje za doživljaje') +
        tile('#/povijest', '📜', 'Povijest', 'Tko je sve ovuda prošao') +
        tile('#/rjecnik', '💬', 'Rječnik', 'Talijanski za put') +
      '</div>' +
      '<div class="card fact"><p class="label">Jeste li znale?</p><p id="fact">' + esc(f) + '</p><button type="button" id="nextfact">Još jedna</button></div>' +
      '<div class="card"><p class="label">Naš dnevnik</p>' +
        progress(sightIds, 'Vidjele smo') + progress(foodIds, 'Probale smo') +
      '</div>' +
      '<div class="card"><p class="label">Ukratko</p>' +
        T.ukratko.map(function (u) { return '<p><strong>' + esc(u.k) + ':</strong> ' + esc(u.v) + '</p>'; }).join('') +
      '</div>';
  };
  function tile(h, ic, t, s) {
    return '<a class="card tile" href="' + h + '"><span class="big">' + ic + '</span><strong>' + t + '</strong><small>' + s + '</small></a>';
  }

  views.mjesta = function () {
    var groups = [];
    T.mjesta.forEach(function (m) {
      var g = groups.filter(function (x) { return x.n === m.regija; })[0];
      if (!g) { g = { n: m.regija, m: [] }; groups.push(g); }
      g.m.push(m);
    });
    var tones = ['t1', 't2', 't3', 't4'];
    return '<h1 style="margin-top:26px">Mjesta</h1>' +
      '<p>Otvori mjesto u kojem ste i čitaj dok hodate. Svaka znamenitost ima svoju priču i sitnice koje vrijedi potražiti.</p>' +
      searchBox() +
      groups.map(function (g, gi) {
        return '<h2 class="group-title">' + esc(g.n) + '</h2>' +
          g.m.map(function (m, i) {
            var ids = (m.znamenitosti || []).map(function (z) { return z._id; });
            var n = ids.filter(isDone).length;
            return '<a class="card place" href="#/mjesto/' + m.id + '">' +
              '<div class="stamp ' + tones[(gi + i) % 4] + '"><div>' + m.znak + '</div></div>' +
              '<div><h3>' + esc(m.ime) + '</h3><p>' + esc(m.sazetak) + '</p>' +
              (n ? '<span class="ink green" style="margin-top:6px">Viđeno ' + n + '/' + ids.length + '</span>' : '') +
              '</div></a>';
          }).join('');
      }).join('');
  };

  views.mjesto = function (id, open) {
    var m = T.mjesta.filter(function (x) { return x.id === id; })[0];
    if (!m) return views.mjesta();
    var ids = (m.znamenitosti || []).map(function (z) { return z._id; });
    return '<p style="margin-top:22px"><a href="#/mjesta" class="label">← Sva mjesta</a></p>' +
      '<span class="hand">' + esc(m.regija) + '</span>' +
      '<h1>' + m.znak + ' ' + esc(m.ime) + '</h1>' +
      paras(m.prica) +
      (ids.length ? progress(ids, 'Vidjele smo') : '') +
      (ids.length ? '<h2 class="group-title">Što gledamo</h2>' : '') +
      (m.znamenitosti || []).map(function (z, i) {
        return '<details class="card' + (isDone(z._id) ? ' done' : '') + '" id="z' + i + '"' + (String(open) === String(i) ? ' open' : '') + '>' +
          '<summary>' + esc(z.ime) + '<small>' + esc(z.sto) + '</small></summary>' +
          '<div class="inner">' + paras(z.prica) +
          (z.potrazi && z.potrazi.length ? '<div class="look"><span class="label">Potraži</span>' + list(z.potrazi, '') + '</div>' : '') +
          (z.prakticno ? '<p class="note">' + esc(z.prakticno) + '</p>' : '') +
          (z.link ? '<p>' + link(z.link) + '</p>' : '') +
          doneBtn(z._id, 'Vidjele smo', 'Označi da smo vidjele') +
          '</div></details>';
      }).join('') +
      (m.zanimljivosti && m.zanimljivosti.length ? '<h2 class="group-title">Legende i zanimljivosti</h2><div class="card">' + list(m.zanimljivosti) + '</div>' : '') +
      (m.hrvatska ? '<h2 class="group-title">Veza s nama</h2><div class="hr-link">' + paras(m.hrvatska) + '</div>' : '') +
      (m.jedi && m.jedi.length ? '<h2 class="group-title">Što ovdje jesti</h2><div class="card">' + list(m.jedi) + '</div>' : '') +
      (m.savjet ? '<h2 class="group-title">Dobro je znati</h2><div class="card">' + paras(m.savjet) + '</div>' : '');
  };

  views.hrana = function () {
    return '<h1 style="margin-top:26px">Hrana</h1>' +
      paras(T.hranaUvod) +
      progress(foodIds, 'Probale smo') +
      '<div class="chips">' + T.hrana.map(function (k, i) { return '<a href="#/hrana/k' + i + '">' + esc(k.kategorija) + '</a>'; }).join('') + '</div>' +
      T.hrana.map(function (k, ki) {
        return '<h2 class="group-title" id="k' + ki + '">' + esc(k.kategorija) + '</h2>' +
          (k.uvod ? paras(k.uvod) : '') +
          k.stavke.map(function (s) {
            return '<details class="card' + (isDone(s._id) ? ' done' : '') + '" id="' + s._id + '">' +
              '<summary>' + esc(s.ime) + '<small>' + esc(s.opis) + '</small></summary>' +
              '<div class="inner">' +
              (s.izgovor ? '<p class="say">Izgovor: ' + esc(s.izgovor) + '</p>' : '') +
              paras(s.prica) +
              (s.gdje ? '<div class="look"><span class="label">Gdje probati</span>' + paras(s.gdje) + '</div>' : '') +
              (s.savjet ? '<p class="note">' + esc(s.savjet) + '</p>' : '') +
              doneBtn(s._id, 'Probale smo', 'Označi da smo probale') +
              '</div></details>';
          }).join('');
      }).join('') +
      (T.zaStolom ? '<h2 class="group-title">Za stolom</h2>' + T.zaStolom.map(function (z) {
        return '<details class="card"><summary>' + esc(z.naslov) + '</summary><div class="inner">' + paras(z.tekst) + '</div></details>';
      }).join('') : '');
  };

  views.kultura = function (open) {
    return '<h1 style="margin-top:26px">Kultura i život</h1>' +
      paras(T.kulturaUvod) +
      T.kultura.map(function (c, i) {
        return '<details class="card" id="c' + i + '"' + (String(open) === String(i) ? ' open' : '') + '>' +
          '<summary>' + c.ikona + ' ' + esc(c.naslov) + (c.uvod ? '<small>' + esc(c.uvod) + '</small>' : '') + '</summary>' +
          '<div class="inner">' +
          c.dijelovi.map(function (d) {
            return (d.naslov ? '<h3>' + esc(d.naslov) + '</h3>' : '') + paras(d.tekst) + list(d.popis);
          }).join('') +
          '</div></details>';
      }).join('');
  };

  views.akoZelis = function (open) {
    return '<h1 style="margin-top:26px">Ako želiš…</h1>' +
      '<p>Odaberi što ti se danas radi, a mi ćemo ti reći kamo.</p>' +
      T.akoZelis.map(function (a, i) {
        return '<details class="card" id="a' + i + '"' + (String(open) === String(i) ? ' open' : '') + '>' +
          '<summary>' + a.ikona + ' ' + esc(a.zelja) + '</summary>' +
          '<div class="inner">' + paras(a.uvod) +
          a.opcije.map(function (o) {
            return '<h3>' + esc(o.ime) + '</h3>' +
              '<p class="meta">📍 ' + esc(o.mjesto) + '</p>' +
              paras(o.opis) +
              (o.napomena ? '<p class="note">' + esc(o.napomena) + '</p>' : '') +
              (o.link ? '<p>' + link(o.link) + '</p>' : '');
          }).join('') +
          '</div></details>';
      }).join('');
  };

  views.povijest = function () {
    return '<h1 style="margin-top:26px">Povijest u kratkim crtama</h1>' +
      paras(T.povijestUvod) +
      '<div class="timeline">' + T.povijest.map(function (e) {
        return '<div class="ev"><div class="yr">' + esc(e.kada) + '</div><h3>' + esc(e.naslov) + '</h3>' + paras(e.tekst) + '</div>';
      }).join('') + '</div>';
  };

  views.rjecnik = function () {
    return '<h1 style="margin-top:26px">Rječnik za put</h1>' +
      paras(T.rjecnikUvod) +
      T.rjecnik.map(function (g) {
        return '<h2 class="group-title">' + esc(g.skupina) + '</h2><div class="card">' +
          g.fraze.map(function (f) {
            return '<div class="phrase"><b>' + esc(f.it) + '</b>' + (f.izgovor ? '<i>' + esc(f.izgovor) + '</i>' : '') + '<span>' + esc(f.hr) + '</span></div>';
          }).join('') + '</div>';
      }).join('');
  };

  views.prakticno = function () {
    return '<h1 style="margin-top:26px">Praktično</h1>' +
      T.prakticno.map(function (p) {
        return '<details class="card"><summary>' + p.ikona + ' ' + esc(p.naslov) + '</summary><div class="inner">' + paras(p.tekst) + list(p.popis) + '</div></details>';
      }).join('');
  };

  views.jos = function () {
    return '<h1 style="margin-top:26px">Još</h1>' +
      '<div class="tiles">' +
        tile('#/povijest', '📜', 'Povijest', 'Tko je sve ovuda prošao') +
        tile('#/rjecnik', '💬', 'Rječnik', 'Talijanski za put') +
        tile('#/prakticno', '🧭', 'Praktično', 'Prijevoz, novac, navike') +
        tile('#/izvori', '🔎', 'Izvori', 'Odakle sve ovo znamo') +
      '</div>';
  };

  views.izvori = function () {
    return '<h1 style="margin-top:26px">Izvori</h1>' +
      '<p>Sve što ovdje piše provjereno je na službenim stranicama i kod ljudi koji ovaj kraj dobro poznaju. Cijene i radna vremena mijenjaju se, pa ih uvijek vrijedi još jednom pogledati prije odlaska.</p>' +
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
    document.querySelectorAll('.tabs a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-tab') === tab);
    });

    var el = scrollTo && document.getElementById(scrollTo);
    if (el) {
      if (el.tagName === 'DETAILS') el.open = true;
      el.scrollIntoView();
      window.scrollBy(0, -64);
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
    if (b.id === 'nextfact') {
      document.getElementById('fact').textContent = T.jesteLiZnale[Math.floor(Math.random() * T.jesteLiZnale.length)];
      return;
    }
    var id = b.getAttribute('data-done');
    if (!id) return;
    toggle(id);
    var on = isDone(id);
    b.classList.toggle('on', on);
    b.textContent = on ? '✓ ' + b.getAttribute('data-on') : b.getAttribute('data-off');
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
