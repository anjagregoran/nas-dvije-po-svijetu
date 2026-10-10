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

  // ---------- zemlje ----------
  var active = '';
  var chips = document.getElementById('chips');
  var box = document.getElementById('countries');
  var ready = 0;
  I.regije.forEach(function (r) { r.zemlje.forEach(function (z) { if (z.spremno) ready++; }); });
  document.getElementById('count').textContent = ready ? ready + ' zemalja' : 'Atlas se puni';

  function drawChips() {
    chips.innerHTML = '<button type="button" data-r=""' + (active === '' ? ' class="on"' : '') + '>Sve</button>' +
      I.regije.map(function (r) {
        return '<button type="button" data-r="' + esc(r.ime) + '"' + (active === r.ime ? ' class="on"' : '') + '>' + esc(r.ime) + '</button>';
      }).join('');
  }
  function drawCountries() {
    var k = 0;
    box.innerHTML = I.regije.filter(function (r) { return !active || r.ime === active; }).map(function (r) {
      return '<h3 class="group-title">' + esc(r.ime) + '</h3><div class="grid">' +
        r.zemlje.map(function (z) {
          if (!z.spremno) return '<div class="tilec soon"><span class="label">Uskoro</span><h3>' + esc(z.ime) + '</h3></div>';
          return '<a class="tilec c' + (k++ % 6) + '" href="zemlja.html?z=' + z.id + '">' +
            '<span class="label">' + z.n + ' mjesta</span>' +
            '<div><h3>' + esc(z.ime) + '</h3><p>' + esc(z.sazetak) + '</p></div></a>';
        }).join('') + '</div>';
    }).join('');
  }
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    active = b.getAttribute('data-r');
    drawChips(); drawCountries();
  });
  drawChips(); drawCountries();

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
