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
  var words = ['Street food', 'Markets', 'Dances', 'Hidden gems', 'Vineyards', 'Piazzas', 'Recipes', 'Festivals', 'Crafts', 'Islands'];
  var strip = words.map(function (w) { return '<span>' + w + '</span>'; }).join('');
  document.getElementById('marquee').innerHTML = strip + strip;

  // ---------- veliki vodiči ----------
  document.getElementById('feature').innerHTML = I.vodici.map(function (v) {
    return '<div class="feature">' +
      '<div><span class="label">' + esc(v.nadnaslov) + '</span><h2>' + esc(v.naziv) + '</h2><p>' + esc(v.uvod) + '</p>' +
      '<a class="btn" href="putovanje.html?p=' + v.id + '">Open the guide</a></div>' +
      '<div class="stats">' +
        '<div><b>' + v.mjesta + '</b><span>places</span></div>' +
        '<div><b>' + v.znamenitosti + '</b><span>sights</span></div>' +
        '<div><b>' + v.jela + '</b><span>dishes and drinks</span></div>' +
      '</div></div>';
  }).join('');

  // ---------- kontinenti i zemlje ----------
  var active = I.kontinenti[0].ime;
  var fromHash = decodeURIComponent((location.hash.match(/^#k=(.+)$/) || [])[1] || '');
  if (I.kontinenti.some(function (k) { return k.ime === fromHash; })) active = fromHash;
  var cont = document.getElementById('continents');
  var box = document.getElementById('countries');
  function count(k) {
    var n = 0;
    k.regije.forEach(function (r) { r.zemlje.forEach(function (z) { if (z.spremno) n++; }); });
    return n;
  }
  var ready = I.kontinenti.reduce(function (n, k) { return n + count(k); }, 0);
  document.getElementById('count').textContent = ready + ' countries';

  function drawContinents() {
    cont.innerHTML = I.kontinenti.map(function (k, i) {
      var n = count(k), on = k.ime === active;
      return '<a class="tilec kont c' + (i % 6) + (on ? ' on' : '') + '" href="#zemlje" data-k="' + esc(k.ime) + '">' +
        '<span class="label">' + (n ? n + ' countries' : 'Coming soon') + '</span><h3>' + esc(k.ime) + '</h3></a>';
    }).join('');
  }
  function drawMap(k) {
    var pts = [];
    k.regije.forEach(function (r) {
      r.zemlje.forEach(function (z) {
        if (z.spremno && z.c) pts.push({ c: z.c, t: z.ime, s: z.n + ' places · ' + r.ime, h: 'zemlja.html?z=' + z.id });
      });
    });
    window.Karta.draw('map', pts, { maxZoom: 5 });
  }
  function drawCountries() {
    var k = I.kontinenti.filter(function (x) { return x.ime === active; })[0];
    drawMap(k);
    var c = 0;
    box.innerHTML = '<h2 id="kontinent" style="margin-top:44px">' + esc(k.ime) + '</h2>' + k.regije.map(function (r) {
      return (k.regije.length > 1 ? '<h3 class="group-title">' + esc(r.ime) + '</h3>' : '<div style="height:14px"></div>') + '<div class="grid">' +
        r.zemlje.map(function (z) {
          if (!z.spremno) return '<div class="tilec soon"><span class="label">Coming soon</span><h3>' + esc(z.ime) + '</h3></div>';
          return '<a class="tilec c' + (c++ % 6) + '" href="zemlja.html?z=' + z.id + '">' +
            '<span class="label">' + z.n + ' places</span>' +
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
    document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
    history.replaceState(null, '', '#k=' + encodeURIComponent(active));
  });
  drawContinents(); drawCountries();
  if (fromHash) setTimeout(function () { document.getElementById('zemlje').scrollIntoView(); }, 50);

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
    var raw = e.target.value.trim();
    res.innerHTML = hits.map(function (it) { return '<a href="' + esc(it.h) + '"><small>' + esc(it.k) + '</small>' + esc(it.t) + '</a>'; }).join('') +
      '<a href="trazi.html?q=' + encodeURIComponent(raw) + '"><small>Anywhere in the world</small>Look up “' + esc(raw) + '” →</a>';
  });
  document.getElementById('form').addEventListener('submit', function (e) {
    e.preventDefault();
    var raw = document.getElementById('q').value.trim();
    if (raw) location.href = 'trazi.html?q=' + encodeURIComponent(raw);
  });

  // ---------- što posjetiti sljedeće ----------
  var finder = document.getElementById('finder');
  document.getElementById('next').addEventListener('click', function () {
    finder.hidden = !finder.hidden;
    if (!finder.hidden) document.getElementById('q').focus();
  });
  var onlyPlaces = I.trazi.filter(function (e) { return e[1] !== 'Country' && e[1] !== 'Deep guide'; });
  function surprise() {
    var e = onlyPlaces[Math.floor(Math.random() * onlyPlaces.length)];
    if (!e) return;
    document.getElementById('pick').innerHTML =
      '<a class="pcard" href="' + esc(e[2]) + '" style="max-width:620px;margin:16px auto 0;text-align:left"><span class="badge plain">' + esc(e[1]) + '</span>' +
      '<h3 style="font-size:2.2rem">' + esc(e[0]) + '</h3><p>Tap to see what people eat, do and buy there.</p><span class="arrow">→</span></a>';
  }
  document.getElementById('surprise').addEventListener('click', surprise);

  // ---------- činjenice ----------
  function fact() {
    var f = I.cinjenice[Math.floor(Math.random() * I.cinjenice.length)];
    if (!f) return;
    document.getElementById('fact').textContent = f[0];
    document.getElementById('factwhere').textContent = 'Did you know? · ' + f[1];
  }
  document.getElementById('nextfact').addEventListener('click', fact);
  fact();

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
