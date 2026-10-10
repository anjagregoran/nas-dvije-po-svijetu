(function () {
  var Z = window.ATLAS[window.ZEMLJA_ID];
  var app = document.getElementById('app');
  document.getElementById('naslov').textContent = Z.ime;
  document.title = Z.ime + ' · Taste the Map';

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
  function link(url, text) {
    return url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(text || 'Official site') + ' ↗</a>' : '';
  }
  function has(a) { return a && a.length; }

  var VRSTA = { grad: 'City', 'gradić': 'Town', regija: 'Region', otok: 'Island', priroda: 'Nature' };
  var KONT = {
    'Southern Europe': 'Europe', 'Western Europe': 'Europe', 'Central Europe': 'Europe', 'Northern Europe': 'Europe',
    'British Isles': 'Europe', 'Southeastern Europe': 'Europe',
    'East Asia': 'Asia', 'Southeast Asia': 'Asia', 'South and Central Asia': 'Asia', 'Middle East': 'Asia',
    'North Africa': 'Africa', 'Sub-Saharan Africa': 'Africa',
    'North America': 'North and Central America', 'Central America and the Caribbean': 'North and Central America',
    'South America': 'South America', 'Oceania': 'Oceania',
    // stari hrvatski nazivi, dok se sve datoteke ne prevedu
    'Južna Europa': 'Europe', 'Zapadna Europa': 'Europe', 'Srednja Europa': 'Europe', 'Sjeverna Europa': 'Europe',
    'Britansko otočje': 'Europe', 'Jugoistočna Europa': 'Europe',
    'Istočna Azija': 'Asia', 'Jugoistočna Azija': 'Asia', 'Južna i Srednja Azija': 'Asia', 'Bliski istok': 'Asia',
    'Sjeverna Afrika': 'Africa', 'Podsaharska Afrika': 'Africa',
    'Sjeverna Amerika': 'North and Central America', 'Srednja Amerika i Karibi': 'North and Central America',
    'Južna Amerika': 'South America', 'Oceanija': 'Oceania'
  };
  var KO = window.KOORDINATE || {};
  var D = (window.DODACI || {})[Z.id] || { mjesta: {} };

  // ---------- ikone (tanke linije, bez emojija) ----------
  var P = {
    prica: '<path d="M4 20h16M6 20V10M10 20V10M14 20V10M18 20V10M3 10h18L12 4 3 10z"/>',
    vidjeti: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    hrana: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-2.5 5-2.5 8H17m0-8v18"/>',
    dozivjeti: '<path d="M12 3l2.2 5.6L20 9.3l-4.4 3.9L17 19l-5-3.1L7 19l1.4-5.8L4 9.3l5.8-.7z"/>',
    agencije: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    karta: '<path d="M12 21s-6-5.4-6-10a6 6 0 0 1 12 0c0 4.6-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/>',
    kada: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    obicaji: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
    fraze: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    zanimljivosti: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/>',
    dragulji: '<path d="M6 4h12l3 5-9 11L3 9z"/><path d="M3 9h18M9 4l-2 5 5 11 5-11-2-5"/>',
    kupiti: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    domaci: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    ukratko: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2.5h6V4M8.5 10h7M8.5 14h7M8.5 18h4"/>'
  };
  function icon(k) {
    return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[k] + '</svg>';
  }

  function crumbs(m) {
    var k = KONT[Z.regija] || '';
    var home = 'index.html' + (k ? '#k=' + encodeURIComponent(k) : '');
    return '<p class="crumbs">' +
      (k ? '<a href="' + home + '">' + esc(k) + '</a><i>›</i>' : '') +
      (Z.regija && Z.regija !== k ? '<a href="' + home + '">' + esc(Z.regija) + '</a><i>›</i>' : '') +
      (m ? '<a href="#/">' + esc(Z.ime) + '</a><i>›</i>' + esc(m.ime) : esc(Z.ime)) + '</p>';
  }
  function box(href, key, c, title, sub) {
    return '<a class="box ' + c + '" href="' + href + '">' + icon(key) + '<span class="box-t">' + title + '</span><span class="box-s">' + sub + '</span><span class="box-go">Open</span></a>';
  }
  function cards(arr) {
    return '<div class="cards">' + arr.map(function (v) {
      return '<div class="mini"><h3>' + esc(v.ime) + '</h3>' + paras(v.opis) + (v.prica ? paras(v.prica) : '') +
        (v.gdje ? '<div class="look"><span class="label">Where to see or learn it</span>' + paras(v.gdje) + '</div>' : '') +
        (v.link ? '<p style="margin:0">' + link(v.link) + '</p>' : '') + '</div>';
    }).join('') + '</div>';
  }

  // ---------- odjeljci zemlje ----------
  var COUNTRY = {
    prica: { t: 'About the country', s: 'A little history and what makes it special', on: function () { return has(Z.uvod); },
      html: function () { return '<div class="prose">' + paras(Z.uvod) + '</div>'; } },
    hrana: { t: 'Cuisine', s: 'Traditional dishes and drinks', on: function () { return has(Z.hrana); },
      html: function () { return cards(Z.hrana); } },
    kupiti: { t: 'What to buy', s: 'Traditional products to bring home', on: function () { return has(D.kupiti); },
      html: function () { return cards(D.kupiti); } },
    obicaji: { t: 'Customs, music and dance', s: 'What to see and where to learn', on: function () { return has(Z.obicaji); },
      html: function () { return cards(Z.obicaji); } },
    fraze: { t: 'A few words', s: 'Phrases with pronunciation', on: function () { return has(Z.fraze); },
      html: function () {
        return '<div class="cards">' + Z.fraze.map(function (f) {
          return '<div class="mini phrase"><b>' + esc(f.izvorno) + '</b>' + (f.izgovor ? '<i>' + esc(f.izgovor) + '</i>' : '') + '<span>' + esc(f.hr) + '</span></div>';
        }).join('') + '</div>';
      } },
    ukratko: { t: 'Practical', s: 'When to go, money, getting around', on: function () { return has(Z.ukratko); },
      html: function () {
        return '<div class="cards">' + Z.ukratko.map(function (u) { return '<div class="mini"><span class="label">' + esc(u.k) + '</span><p style="margin:6px 0 0">' + esc(u.v) + '</p></div>'; }).join('') + '</div>';
      } },
    zanimljivosti: { t: 'Did you know?', s: 'Facts worth reading out loud', on: function () { return has(Z.zanimljivosti); },
      html: function () {
        return '<div class="cards">' + Z.zanimljivosti.map(function (c) { return '<div class="mini fact"><p style="margin:0">' + esc(c) + '</p></div>'; }).join('') + '</div>';
      } },
    karta: { t: 'Map', s: 'Every place at a glance', on: function () { return Z.mjesta.some(function (m) { return KO[Z.id + '/' + m.id]; }); },
      html: function () { return '<div class="map" id="map" style="margin:0"></div>'; },
      after: function () {
        window.Karta.draw('map', Z.mjesta.map(function (m) {
          return { c: KO[Z.id + '/' + m.id], t: m.ime, s: m.sazetak, h: '#/mjesto/' + m.id };
        }), { maxZoom: 8 });
      } },
    izvori: { t: 'Sources', s: 'Where the facts come from', on: function () { return has(Z.izvori); },
      html: function () { return '<ul class="list">' + Z.izvori.map(function (s) { return '<li>' + link(s.url, s.ime) + '</li>'; }).join('') + '</ul>'; } }
  };
  var C_ORDER = ['hrana', 'kupiti', 'obicaji', 'prica', 'fraze', 'ukratko', 'zanimljivosti', 'karta'];
  var C_ICON = { kupiti: 'kupiti', prica: 'prica', hrana: 'hrana', obicaji: 'obicaji', fraze: 'fraze', ukratko: 'ukratko', zanimljivosti: 'zanimljivosti', karta: 'karta', izvori: 'ukratko' };

  function overview() {
    var n = 0;
    return crumbs() +
      '<header class="hero left" style="padding-top:14px;padding-bottom:22px"><span class="label">' + esc(Z.regija) + '</span><h1>' + esc(Z.ime) + '</h1>' +
      '<p class="lead" style="margin:0">' + esc(Z.sazetak) + '</p></header>' +
      '<div class="boxes">' + C_ORDER.filter(function (k) { return COUNTRY[k].on(); }).map(function (k) {
        return box('#/o/' + k, C_ICON[k], 'c' + (n++ % 6), COUNTRY[k].t, COUNTRY[k].s);
      }).join('') + '</div>' +
      '<div class="sec-head" id="mjesta" style="margin-top:46px"><h2>Cities and <em>places</em></h2><span class="label">' + Z.mjesta.length + ' places</span></div>' +
      '<div class="grid places">' + Z.mjesta.map(function (m) {
        return '<a class="pcard" href="#/mjesto/' + m.id + '"><span class="badge plain">' + esc(VRSTA[m.vrsta] || 'Place') + '</span>' +
          '<h3>' + esc(m.ime) + '</h3><p>' + esc(m.sazetak) + '</p><span class="arrow">→</span></a>';
      }).join('') + '</div>' +
      (COUNTRY.izvori.on() ? '<p style="margin-top:26px"><a class="label" style="text-decoration:none" href="#/o/izvori">Sources and official sites →</a></p>' : '');
  }

  // ---------- odjeljci mjesta ----------
  function placeSections(m) {
    var X = (D.mjesta || {})[m.id] || {};
    return {
      dragulji: { t: 'Hidden gems', s: 'Spots most visitors miss', on: has(X.dragulji),
        html: function () { return cards(X.dragulji); } },
      domaci: { t: 'Like a local', s: 'What people here actually do', on: has(X.domaci),
        html: function () { return cards(X.domaci); } },
      kupiti: { t: 'What to buy', s: 'Traditional products from here', on: has(X.kupiti) || has(D.kupiti),
        html: function () {
          return (has(X.kupiti) ? '<h3 class="group-title" style="margin-top:0">Typical of ' + esc(m.ime) + '</h3>' + cards(X.kupiti) : '') +
            (has(D.kupiti) ? '<h3 class="group-title"' + (has(X.kupiti) ? '' : ' style="margin-top:0"') + '>From around ' + esc(Z.ime) + '</h3>' + cards(D.kupiti) : '');
        } },
      prica: { t: 'The story', s: 'A short history, if you are curious', on: has(m.prica),
        html: function () { return '<div class="prose">' + paras(m.prica) + '</div>'; } },
      vidjeti: { t: 'Sights', s: 'What it is and what to look for', on: has(m.vidjeti),
        html: function () { return cards(m.vidjeti); } },
      hrana: { t: 'Cuisine', s: 'What people eat here and traditional dishes', on: has(m.jesti) || has(Z.hrana),
        html: function () {
          return (has(m.jesti) ? '<h3 class="group-title" style="margin-top:0">What to eat in ' + esc(m.ime) + '</h3>' + cards(m.jesti) : '') +
            (has(Z.hrana) ? '<h3 class="group-title">Traditional dishes and drinks: ' + esc(Z.ime) + '</h3>' + cards(Z.hrana) : '') +
            (KO[Z.id + '/' + m.id] ? '<details class="card" id="restbox" style="margin-top:22px"><summary>Where to eat<small>Restaurants in the center and the Michelin Guide</small></summary><div class="inner"><div id="rest"></div></div></details>' : '');
        },
        after: function () {
          var d = document.getElementById('restbox'), c = KO[Z.id + '/' + m.id];
          if (d && c) d.addEventListener('toggle', function () {
            if (d.open && !d.getAttribute('data-loaded')) { d.setAttribute('data-loaded', '1'); window.Restorani.load('rest', c[0], c[1], m.ime); }
          });
        } },
      dozivjeti: { t: 'Experiences', s: 'Classes, markets, viewpoints, evenings out', on: has(m.dozivjeti),
        html: function () { return cards(m.dozivjeti); } },
      agencije: { t: 'Agencies and guides', s: 'Tourist offices and trusted tours', on: has(m.agencije),
        html: function () { return cards(m.agencije); } },
      kada: { t: 'When to go', s: 'Best season and a tip', on: !!m.kada,
        html: function () { return '<div class="prose">' + paras(m.kada) + '</div>'; } },
      karta: { t: 'Map', s: 'Where it is', on: !!KO[Z.id + '/' + m.id],
        html: function () { return '<div class="map" id="map" style="margin:0"></div>'; },
        after: function () { window.Karta.draw('map', [{ c: KO[Z.id + '/' + m.id], t: m.ime, s: Z.ime }], { zoom: 11 }); } }
    };
  }
  var P_ORDER = ['hrana', 'dragulji', 'domaci', 'kupiti', 'dozivjeti', 'vidjeti', 'prica', 'agencije', 'kada', 'karta'];

  function place(m) {
    var S = placeSections(m), n = 0;
    var others = Z.mjesta.filter(function (x) { return x.id !== m.id; });
    return crumbs(m) +
      '<header class="hero left" style="padding-top:14px;padding-bottom:22px"><span class="label">' + esc(VRSTA[m.vrsta] || 'Place') + ' · ' + esc(Z.ime) + '</span><h1>' + esc(m.ime) + '</h1>' +
      '<p class="lead" style="margin:0">' + esc(m.sazetak) + '</p></header>' +
      '<div class="boxes">' + P_ORDER.filter(function (k) { return S[k].on; }).map(function (k) {
        return box('#/mjesto/' + m.id + '/' + k, k, 'c' + (n++ % 6), S[k].t, S[k].s);
      }).join('') + '</div>' +
      (others.length ? '<div class="sec-head" style="margin-top:46px"><h2>More in <em>' + esc(Z.ime) + '</em></h2></div>' +
        '<div class="chips wrapc">' + others.map(function (x) { return '<a href="#/mjesto/' + x.id + '">' + esc(x.ime) + '</a>'; }).join('') + '</div>' : '');
  }

  // ---------- prozor koji se otvara ----------
  function sheet(key, title, body, back) {
    return '<div class="sheet" id="sheet" data-back="' + esc(back) + '"><div class="sheet-in" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
      '<div class="sheet-head">' + icon(key) + '<h2>' + esc(title) + '</h2><a class="x" href="' + esc(back) + '" aria-label="Close">×</a></div>' +
      '<div class="sheet-body">' + body + '</div></div></div>';
  }
  function closeSheet() {
    var s = document.getElementById('sheet');
    if (s) location.hash = s.getAttribute('data-back');
  }

  // ---------- usmjeravanje ----------
  function route() {
    var parts = decodeURIComponent(location.hash).replace(/^#\/?/, '').split('/');
    var base, sec = null, back, pageKey;

    if (parts[0] === 'mjesto') {
      var m = Z.mjesta.filter(function (x) { return x.id === parts[1]; })[0];
      if (!m) { location.hash = '#/'; return; }
      var k = parts[2] || '';
      if (/^v\d+$/.test(k)) k = 'vidjeti';
      if (k === 'jesti') k = 'hrana';
      pageKey = 'm:' + m.id; base = function () { return place(m); }; back = '#/mjesto/' + m.id;
      var S = placeSections(m);
      if (k && S[k] && S[k].on) sec = { icon: k, t: S[k].t + ' · ' + m.ime, def: S[k] };
    } else {
      var ck = parts[0] === 'o' ? parts[1] : parts[0];
      pageKey = 'z'; base = overview; back = '#/';
      if (ck && COUNTRY[ck] && COUNTRY[ck].on()) sec = { icon: C_ICON[ck], t: COUNTRY[ck].t + ' · ' + Z.ime, def: COUNTRY[ck] };
    }

    if (app.getAttribute('data-page') !== pageKey) {
      app.innerHTML = base(); app.setAttribute('data-page', pageKey); window.scrollTo(0, 0);
    }
    var old = document.getElementById('sheet');
    if (old) old.remove();
    document.body.classList.toggle('locked', !!sec);
    if (sec) {
      document.body.insertAdjacentHTML('beforeend', sheet(sec.icon, sec.t, sec.def.html(), back));
      if (sec.def.after) sec.def.after();
    } else if (parts[0] === 'mjesta') {
      var el = document.getElementById('mjesta');
      if (el) { el.scrollIntoView(); window.scrollBy(0, -76); }
    }
  }

  document.addEventListener('click', function (e) { if (e.target.id === 'sheet') closeSheet(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });
  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
