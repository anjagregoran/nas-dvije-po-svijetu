(function () {
  var Z = window.ATLAS[window.ZEMLJA_ID];
  var app = document.getElementById('app');
  document.getElementById('naslov').textContent = Z.ime;
  document.title = Z.ime + ' · Nas dvije po svijetu';

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
    return url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(text || 'Službena stranica') + ' ↗</a>' : '';
  }
  function has(a) { return a && a.length; }

  var VRSTA = { grad: 'Grad', 'gradić': 'Gradić', regija: 'Regija', otok: 'Otok', priroda: 'Priroda' };
  var KONT = {
    'Južna Europa': 'Europa', 'Zapadna Europa': 'Europa', 'Srednja Europa': 'Europa', 'Sjeverna Europa': 'Europa',
    'Britansko otočje': 'Europa', 'Jugoistočna Europa': 'Europa',
    'Istočna Azija': 'Azija', 'Jugoistočna Azija': 'Azija', 'Južna i Srednja Azija': 'Azija', 'Bliski istok': 'Azija',
    'Sjeverna Afrika': 'Afrika', 'Podsaharska Afrika': 'Afrika',
    'Sjeverna Amerika': 'Sjeverna i Srednja Amerika', 'Srednja Amerika i Karibi': 'Sjeverna i Srednja Amerika',
    'Južna Amerika': 'Južna Amerika', 'Oceanija': 'Oceanija'
  };
  var KO = window.KOORDINATE || {};

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
    return '<a class="box ' + c + '" href="' + href + '">' + icon(key) + '<span class="box-t">' + title + '</span><span class="box-s">' + sub + '</span><span class="box-go">Otvori</span></a>';
  }
  function cards(arr) {
    return '<div class="cards">' + arr.map(function (v) {
      return '<div class="mini"><h3>' + esc(v.ime) + '</h3>' + paras(v.opis) + (v.prica ? paras(v.prica) : '') +
        (v.gdje ? '<div class="look"><span class="label">Gdje vidjeti ili naučiti</span>' + paras(v.gdje) + '</div>' : '') +
        (v.link ? '<p style="margin:0">' + link(v.link) + '</p>' : '') + '</div>';
    }).join('') + '</div>';
  }

  // ---------- odjeljci zemlje ----------
  var COUNTRY = {
    prica: { t: 'O zemlji', s: 'Povijest i ono što je čini posebnom', on: function () { return has(Z.uvod); },
      html: function () { return '<div class="prose">' + paras(Z.uvod) + '</div>'; } },
    hrana: { t: 'Kuhinja', s: 'Tradicionalna jela i pića', on: function () { return has(Z.hrana); },
      html: function () { return cards(Z.hrana); } },
    obicaji: { t: 'Običaji, glazba i ples', s: 'Što vidjeti i gdje naučiti', on: function () { return has(Z.obicaji); },
      html: function () { return cards(Z.obicaji); } },
    fraze: { t: 'Nekoliko riječi', s: 'Fraze s izgovorom', on: function () { return has(Z.fraze); },
      html: function () {
        return '<div class="cards">' + Z.fraze.map(function (f) {
          return '<div class="mini phrase"><b>' + esc(f.izvorno) + '</b>' + (f.izgovor ? '<i>' + esc(f.izgovor) + '</i>' : '') + '<span>' + esc(f.hr) + '</span></div>';
        }).join('') + '</div>';
      } },
    ukratko: { t: 'Praktično', s: 'Kada ići, novac, kretanje', on: function () { return has(Z.ukratko); },
      html: function () {
        return '<div class="cards">' + Z.ukratko.map(function (u) { return '<div class="mini"><span class="label">' + esc(u.k) + '</span><p style="margin:6px 0 0">' + esc(u.v) + '</p></div>'; }).join('') + '</div>';
      } },
    zanimljivosti: { t: 'Jeste li znale?', s: 'Činjenice za pročitati naglas', on: function () { return has(Z.zanimljivosti); },
      html: function () {
        return '<div class="cards">' + Z.zanimljivosti.map(function (c) { return '<div class="mini fact"><p style="margin:0">' + esc(c) + '</p></div>'; }).join('') + '</div>';
      } },
    karta: { t: 'Karta', s: 'Sva mjesta na jednom mjestu', on: function () { return Z.mjesta.some(function (m) { return KO[Z.id + '/' + m.id]; }); },
      html: function () { return '<div class="map" id="map" style="margin:0"></div>'; },
      after: function () {
        window.Karta.draw('map', Z.mjesta.map(function (m) {
          return { c: KO[Z.id + '/' + m.id], t: m.ime, s: m.sazetak, h: '#/mjesto/' + m.id };
        }), { maxZoom: 8 });
      } },
    izvori: { t: 'Izvori', s: 'Odakle podaci', on: function () { return has(Z.izvori); },
      html: function () { return '<ul class="list">' + Z.izvori.map(function (s) { return '<li>' + link(s.url, s.ime) + '</li>'; }).join('') + '</ul>'; } }
  };
  var C_ORDER = ['prica', 'hrana', 'obicaji', 'fraze', 'ukratko', 'zanimljivosti', 'karta'];
  var C_ICON = { prica: 'prica', hrana: 'hrana', obicaji: 'obicaji', fraze: 'fraze', ukratko: 'ukratko', zanimljivosti: 'zanimljivosti', karta: 'karta', izvori: 'ukratko' };

  function overview() {
    var n = 0;
    return crumbs() +
      '<header class="hero left" style="padding-top:14px;padding-bottom:22px"><span class="label">' + esc(Z.regija) + '</span><h1>' + esc(Z.ime) + '</h1>' +
      '<p class="lead" style="margin:0">' + esc(Z.sazetak) + '</p></header>' +
      '<div class="boxes">' + C_ORDER.filter(function (k) { return COUNTRY[k].on(); }).map(function (k) {
        return box('#/o/' + k, C_ICON[k], 'c' + (n++ % 6), COUNTRY[k].t, COUNTRY[k].s);
      }).join('') + '</div>' +
      '<div class="sec-head" id="mjesta" style="margin-top:46px"><h2>Gradovi i <em>mjesta</em></h2><span class="label">' + Z.mjesta.length + ' mjesta</span></div>' +
      '<div class="grid places">' + Z.mjesta.map(function (m) {
        return '<a class="pcard" href="#/mjesto/' + m.id + '"><span class="badge plain">' + esc(VRSTA[m.vrsta] || 'Mjesto') + '</span>' +
          '<h3>' + esc(m.ime) + '</h3><p>' + esc(m.sazetak) + '</p><span class="arrow">→</span></a>';
      }).join('') + '</div>' +
      (COUNTRY.izvori.on() ? '<p style="margin-top:26px"><a class="label" style="text-decoration:none" href="#/o/izvori">Izvori i službene stranice →</a></p>' : '');
  }

  // ---------- odjeljci mjesta ----------
  function placeSections(m) {
    return {
      prica: { t: 'Priča', s: 'Povijest i zašto izgleda kako izgleda', on: has(m.prica),
        html: function () { return '<div class="prose">' + paras(m.prica) + '</div>'; } },
      vidjeti: { t: 'Znamenitosti', s: (m.vidjeti || []).length + ' stvari koje vrijedi vidjeti', on: has(m.vidjeti),
        html: function () { return cards(m.vidjeti); } },
      hrana: { t: 'Kuhinja i restorani', s: 'Specijaliteti, restorani, tradicionalna jela', on: has(m.jesti) || has(Z.hrana),
        html: function () {
          return (has(m.jesti) ? '<h3 class="group-title" style="margin-top:0">Specijaliteti ovog mjesta</h3>' + cards(m.jesti) : '') +
            (KO[Z.id + '/' + m.id] ? '<h3 class="group-title">Restorani</h3><div id="rest"></div>' : '') +
            (has(Z.hrana) ? '<h3 class="group-title">Tradicionalna jela: ' + esc(Z.ime) + '</h3>' + cards(Z.hrana) : '');
        },
        after: function () { var c = KO[Z.id + '/' + m.id]; if (c) window.Restorani.load('rest', c[0], c[1], m.ime); } },
      dozivjeti: { t: 'Doživljaji', s: 'Tečajevi, tržnice, vidikovci, večeri', on: has(m.dozivjeti),
        html: function () { return cards(m.dozivjeti); } },
      agencije: { t: 'Agencije i vodiči', s: 'Turistički uredi i provjerene ture', on: has(m.agencije),
        html: function () { return cards(m.agencije); } },
      kada: { t: 'Kada ići', s: 'Najbolje doba i savjet', on: !!m.kada,
        html: function () { return '<div class="prose">' + paras(m.kada) + '</div>'; } },
      karta: { t: 'Karta', s: 'Gdje se nalazi', on: !!KO[Z.id + '/' + m.id],
        html: function () { return '<div class="map" id="map" style="margin:0"></div>'; },
        after: function () { window.Karta.draw('map', [{ c: KO[Z.id + '/' + m.id], t: m.ime, s: Z.ime }], { zoom: 11 }); } }
    };
  }
  var P_ORDER = ['prica', 'vidjeti', 'hrana', 'dozivjeti', 'agencije', 'kada', 'karta'];

  function place(m) {
    var S = placeSections(m), n = 0;
    var others = Z.mjesta.filter(function (x) { return x.id !== m.id; });
    return crumbs(m) +
      '<header class="hero left" style="padding-top:14px;padding-bottom:22px"><span class="label">' + esc(VRSTA[m.vrsta] || 'Mjesto') + ' · ' + esc(Z.ime) + '</span><h1>' + esc(m.ime) + '</h1>' +
      '<p class="lead" style="margin:0">' + esc(m.sazetak) + '</p></header>' +
      '<div class="boxes">' + P_ORDER.filter(function (k) { return S[k].on; }).map(function (k) {
        return box('#/mjesto/' + m.id + '/' + k, k, 'c' + (n++ % 6), S[k].t, S[k].s);
      }).join('') + '</div>' +
      (others.length ? '<div class="sec-head" style="margin-top:46px"><h2>Još iz zemlje <em>' + esc(Z.ime) + '</em></h2></div>' +
        '<div class="chips wrapc">' + others.map(function (x) { return '<a href="#/mjesto/' + x.id + '">' + esc(x.ime) + '</a>'; }).join('') + '</div>' : '');
  }

  // ---------- prozor koji se otvara ----------
  function sheet(key, title, body, back) {
    return '<div class="sheet" id="sheet" data-back="' + esc(back) + '"><div class="sheet-in" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
      '<div class="sheet-head">' + icon(key) + '<h2>' + esc(title) + '</h2><a class="x" href="' + esc(back) + '" aria-label="Zatvori">×</a></div>' +
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
