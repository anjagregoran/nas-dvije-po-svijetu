(function () {
  var Z = window.ATLAS[window.ZEMLJA_ID];
  var app = document.getElementById('app');
  document.getElementById('naslov').textContent = Z.ime;
  document.title = Z.ime + ' · Nas dvije po svijetu';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function paras(t) {
    if (!t) return '';
    return (Array.isArray(t) ? t : [t]).map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('');
  }
  function link(url, text) {
    return url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(text || 'Službena stranica') + ' ↗</a>' : '';
  }
  function has(a) { return a && a.length; }
  var KONT = {
    'Južna Europa': 'Europa', 'Zapadna Europa': 'Europa', 'Srednja Europa': 'Europa', 'Sjeverna Europa': 'Europa',
    'Britansko otočje': 'Europa', 'Jugoistočna Europa': 'Europa',
    'Istočna Azija': 'Azija', 'Jugoistočna Azija': 'Azija', 'Južna i Srednja Azija': 'Azija', 'Bliski istok': 'Azija',
    'Sjeverna Afrika': 'Afrika', 'Podsaharska Afrika': 'Afrika',
    'Sjeverna Amerika': 'Sjeverna i Srednja Amerika', 'Srednja Amerika i Karibi': 'Sjeverna i Srednja Amerika',
    'Južna Amerika': 'Južna Amerika', 'Oceanija': 'Oceanija'
  };
  var KO = window.KOORDINATE || {};
  function crumbs(m) {
    var k = KONT[Z.regija] || '';
    var home = 'index.html' + (k ? '#k=' + encodeURIComponent(k) : '');
    return '<p class="crumbs">' +
      (k ? '<a href="' + home + '">' + esc(k) + '</a><i>›</i>' : '') +
      (Z.regija && Z.regija !== k ? '<a href="' + home + '">' + esc(Z.regija) + '</a><i>›</i>' : '') +
      (m ? '<a href="#/mjesta">' + esc(Z.ime) + '</a><i>›</i>' + esc(m.ime) : esc(Z.ime)) + '</p>';
  }
  var VRSTA = { grad: 'Grad', 'gradić': 'Gradić', regija: 'Regija', otok: 'Otok', priroda: 'Priroda' };

  function overview() {
    return crumbs() + '<header class="hero left" style="padding-top:14px"><span class="label">' + esc(Z.mjesta.length) + ' mjesta</span><h1>' + esc(Z.ime) + '</h1>' +
      '<div class="lead">' + paras(Z.uvod) + '</div></header>' +
      '<div class="chips">' +
        '<a href="#/mjesta">Mjesta</a>' +
        (has(Z.hrana) ? '<a href="#/hrana">Hrana</a>' : '') +
        (has(Z.obicaji) ? '<a href="#/obicaji">Običaji</a>' : '') +
        (has(Z.fraze) ? '<a href="#/fraze">Fraze</a>' : '') +
        (has(Z.zanimljivosti) ? '<a href="#/zanimljivosti">Zanimljivosti</a>' : '') +
      '</div>' +
      (has(Z.ukratko) ? '<div class="card kv">' + Z.ukratko.map(function (u) { return '<div><b>' + esc(u.k) + '</b>' + esc(u.v) + '</div>'; }).join('') + '</div>' : '') +

      '<h2 class="group-title" id="mjesta">Mjesta</h2><div class="map" id="map" style="margin:0 0 14px"></div>' +
      Z.mjesta.map(function (m) {
        return '<a class="card place" href="#/mjesto/' + m.id + '"><div>' +
          '<span class="badge plain">' + esc(VRSTA[m.vrsta] || 'Mjesto') + '</span>' +
          '<h3>' + esc(m.ime) + '</h3><p>' + esc(m.sazetak) + '</p></div><span class="arrow">→</span></a>';
      }).join('') +

      (has(Z.hrana) ? '<h2 class="group-title" id="hrana">Što se jede i pije</h2>' + Z.hrana.map(function (h) {
        return '<details class="card"><summary>' + esc(h.ime) + '<small>' + esc(h.opis) + '</small></summary><div class="inner">' + paras(h.prica) + '</div></details>';
      }).join('') : '') +

      (has(Z.obicaji) ? '<h2 class="group-title" id="obicaji">Običaji, glazba i ples</h2>' + Z.obicaji.map(function (o) {
        return '<details class="card"><summary>' + esc(o.ime) + '</summary><div class="inner">' + paras(o.opis) +
          (o.gdje ? '<div class="look"><span class="label">Gdje vidjeti ili naučiti</span>' + paras(o.gdje) + '</div>' : '') + '</div></details>';
      }).join('') : '') +

      (has(Z.fraze) ? '<h2 class="group-title" id="fraze">Nekoliko riječi</h2><div class="card">' + Z.fraze.map(function (f) {
        return '<div class="phrase"><b>' + esc(f.izvorno) + '</b>' + (f.izgovor ? '<i>' + esc(f.izgovor) + '</i>' : '') + '<span>' + esc(f.hr) + '</span></div>';
      }).join('') + '</div>' : '') +

      (has(Z.zanimljivosti) ? '<h2 class="group-title" id="zanimljivosti">Jeste li znale?</h2><div class="factbox"><ul class="list">' +
        Z.zanimljivosti.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul></div>' : '') +

      (has(Z.izvori) ? '<h2 class="group-title">Izvori</h2><div class="card"><ul class="list">' +
        Z.izvori.map(function (s) { return '<li>' + link(s.url, s.ime) + '</li>'; }).join('') + '</ul></div>' : '');
  }

  function items(arr, cls) {
    return '<div class="card">' + arr.map(function (v, i) {
      return (i ? '<hr style="border:0;border-top:1px solid var(--line);margin:16px 0">' : '') +
        '<h3 style="font-size:1.45rem">' + esc(v.ime) + '</h3>' + paras(v.opis) + (v.link ? '<p style="margin:0">' + link(v.link) + '</p>' : '');
    }).join('') + '</div>';
  }

  var TABS = [['vidjeti', 'Znamenitosti'], ['hrana', 'Hrana'], ['dozivjeti', 'Doživljaji'], ['agencije', 'Agencije'], ['karta', 'Karta']];

  function place(id, tab) {
    var m = Z.mjesta.filter(function (x) { return x.id === id; })[0];
    if (!m) return overview();
    var openSight = null;
    if (/^v\d+$/.test(tab || '')) { openSight = tab; tab = 'vidjeti'; }
    if (tab === 'jesti') tab = 'hrana';
    var have = {
      vidjeti: has(m.vidjeti), hrana: has(m.jesti) || has(Z.hrana), dozivjeti: has(m.dozivjeti),
      agencije: has(m.agencije), karta: !!KO[Z.id + '/' + m.id]
    };
    if (!have[tab]) tab = 'vidjeti';
    var base = '#/mjesto/' + m.id + '/';
    var body = '';

    if (tab === 'vidjeti') {
      body = '<p class="note">Dodirnite znamenitost da pročitate što je to i što na njoj potražiti.</p>' +
        m.vidjeti.map(function (v, i) {
          return '<details class="card" id="v' + i + '"' + (openSight === 'v' + i || (!openSight && i === 0) ? ' open' : '') + '><summary>' + esc(v.ime) + '</summary><div class="inner">' + paras(v.opis) + '</div></details>';
        }).join('') +
        (m.kada ? '<h2 class="group-title">Kada ići</h2><div class="look">' + paras(m.kada) + '</div>' : '');
    } else if (tab === 'hrana') {
      body = (has(m.jesti) ? '<h2 class="group-title" style="margin-top:8px">Specijaliteti ovog mjesta</h2>' + items(m.jesti) : '') +
        (has(Z.hrana) ? '<h2 class="group-title">Tradicionalna jela: ' + esc(Z.ime) + '</h2>' + Z.hrana.map(function (h) {
          return '<details class="card"><summary>' + esc(h.ime) + '<small>' + esc(h.opis) + '</small></summary><div class="inner">' + paras(h.prica) + '</div></details>';
        }).join('') : '');
    } else if (tab === 'dozivjeti') {
      body = '<p class="note">Ako želite nešto više od razgledavanja, ovo su ideje kamo i po što.</p>' + items(m.dozivjeti) +
        (has(Z.obicaji) ? '<p style="margin-top:16px"><a class="btn ghost" href="#/obicaji">Običaji, glazba i ples: ' + esc(Z.ime) + '</a></p>' : '');
    } else if (tab === 'agencije') {
      body = '<p class="note">Službeni turistički uredi te provjereni vodiči i agencije za ovo mjesto.</p>' + items(m.agencije);
    } else if (tab === 'karta') {
      body = '<div class="map" id="map" style="margin-top:0"></div>';
    }

    return crumbs(m) +
      '<header class="hero left" style="padding-top:14px;padding-bottom:18px"><span class="label">' + esc(VRSTA[m.vrsta] || 'Mjesto') + '</span><h1>' + esc(m.ime) + '</h1>' +
      '<div class="lead">' + paras(m.prica) + '</div></header>' +
      '<div class="chips sticky">' + TABS.filter(function (t) { return have[t[0]]; }).map(function (t) {
        return '<a href="' + base + t[0] + '"' + (t[0] === tab ? ' class="on"' : '') + '>' + t[1] + '</a>';
      }).join('') + '</div>' +
      '<div id="panel">' + body + '</div>';
  }

  function route() {
    var parts = decodeURIComponent(location.hash).replace(/^#\/?/, '').split('/');
    var target = null;
    if (parts[0] === 'mjesto') {
      var samePlace = app.getAttribute('data-place') === parts[1];
      app.innerHTML = place(parts[1], parts[2]);
      app.setAttribute('data-place', parts[1]);
      var pm = Z.mjesta.filter(function (x) { return x.id === parts[1]; })[0];
      if (pm && document.getElementById('map')) window.Karta.draw('map', [{ c: KO[Z.id + '/' + pm.id], t: pm.ime, s: Z.ime }], { zoom: 11 });
      if (/^v\d+$/.test(parts[2] || '')) target = parts[2];
      else if (samePlace && parts[2]) target = 'panel';
    } else {
      app.removeAttribute('data-place');
      app.innerHTML = overview(); target = parts[0];
      window.Karta.draw('map', Z.mjesta.map(function (m) {
        return { c: KO[Z.id + '/' + m.id], t: m.ime, s: m.sazetak, h: '#/mjesto/' + m.id };
      }), { maxZoom: 8 });
    }
    var el = target && document.getElementById(target);
    if (el) { el.scrollIntoView(); window.scrollBy(0, -130); } else { window.scrollTo(0, 0); }
  }
  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
