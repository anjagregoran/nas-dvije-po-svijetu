(function () {
  var I = window.ATLAS_INDEX;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  }

  // ---------- traka s riječima ----------
  var words = ['Katedrale', 'Tržnice', 'Plesovi', 'Legende', 'Vinogradi', 'Trgovi', 'Recepti', 'Fešte', 'Dvorci', 'Otoci'];
  var strip = words.map(function (w) { return '<span>' + w + '</span>'; }).join('');
  document.getElementById('marquee').innerHTML = strip + strip;

  // ---------- veliki vodiči ----------
  document.getElementById('feature').innerHTML = I.vodici.map(function (v) {
    return '<div class="feature">' +
      '<div><span class="label">' + esc(v.nadnaslov) + '</span><h2>' + esc(v.naziv) + '</h2><p>' + esc(v.uvod) + '</p>' +
      '<a class="btn" href="putovanje.html?p=' + v.id + '">Otvori vodič</a></div>' +
      '<div class="stats">' +
        '<div><b>' + v.mjesta + '</b><span>mjesta</span></div>' +
        '<div><b>' + v.znamenitosti + '</b><span>znamenitosti</span></div>' +
        '<div><b>' + v.jela + '</b><span>jela i pića</span></div>' +
      '</div></div>';
  }).join('');

  // ---------- kontinenti i zemlje ----------
  var active = I.kontinenti[0].ime;
  var cont = document.getElementById('continents');
  var box = document.getElementById('countries');
  function count(k) {
    var n = 0;
    k.regije.forEach(function (r) { r.zemlje.forEach(function (z) { if (z.spremno) n++; }); });
    return n;
  }
  var ready = I.kontinenti.reduce(function (n, k) { return n + count(k); }, 0);
  document.getElementById('count').textContent = ready + ' zemalja';

  function drawContinents() {
    cont.innerHTML = I.kontinenti.map(function (k, i) {
      var n = count(k), on = k.ime === active;
      return '<a class="tilec kont c' + (i % 6) + (on ? ' on' : '') + '" href="#zemlje" data-k="' + esc(k.ime) + '">' +
        '<span class="label">' + (n ? n + ' zemalja' : 'Uskoro') + '</span><h3>' + esc(k.ime) + '</h3></a>';
    }).join('');
  }
  function drawCountries() {
    var k = I.kontinenti.filter(function (x) { return x.ime === active; })[0];
    var c = 0;
    box.innerHTML = '<h2 id="kontinent" style="margin-top:44px">' + esc(k.ime) + '</h2>' + k.regije.map(function (r) {
      return (k.regije.length > 1 ? '<h3 class="group-title">' + esc(r.ime) + '</h3>' : '<div style="height:14px"></div>') + '<div class="grid">' +
        r.zemlje.map(function (z) {
          if (!z.spremno) return '<div class="tilec soon"><span class="label">Uskoro</span><h3>' + esc(z.ime) + '</h3></div>';
          return '<a class="tilec c' + (c++ % 6) + '" href="zemlja.html?z=' + z.id + '">' +
            '<span class="label">' + z.n + ' mjesta</span>' +
            '<div><h3>' + esc(z.ime) + '</h3><p>' + esc(z.sazetak) + '</p></div></a>';
        }).join('') + '</div>';
    }).join('');
  }
  cont.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    active = a.getAttribute('data-k');
    drawContinents(); drawCountries();
    document.getElementById('kontinent').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  drawContinents(); drawCountries();

  // ---------- tražilica ----------
  var idx = I.trazi.map(function (e) { return { t: e[0], k: e[1], h: e[2], x: norm(e[0]), y: norm(e[1]) }; });
  var res = document.getElementById('res');
  document.getElementById('q').addEventListener('input', function (e) {
    var q = norm(e.target.value.trim());
    if (q.length < 2) { res.innerHTML = ''; return; }
    var a = [], b = [], c = [];
    idx.forEach(function (it) {
      var p = it.x.indexOf(q);
      if (p === 0) a.push(it); else if (p > 0) b.push(it); else if (it.y.indexOf(q) > -1) c.push(it);
    });
    var hits = a.concat(b, c).slice(0, 14);
    res.innerHTML = hits.length
      ? hits.map(function (it) { return '<a href="' + esc(it.h) + '"><small>' + esc(it.k) + '</small>' + esc(it.t) + '</a>'; }).join('')
      : '<p class="note">Ništa pod tim imenom. Pokušajte kraće ili na izvornom jeziku.</p>';
  });

  // ---------- činjenice ----------
  function fact() {
    var f = I.cinjenice[Math.floor(Math.random() * I.cinjenice.length)];
    if (!f) return;
    document.getElementById('fact').textContent = f[0];
    document.getElementById('factwhere').textContent = 'Jeste li znale? · ' + f[1];
  }
  document.getElementById('nextfact').addEventListener('click', fact);
  fact();

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
