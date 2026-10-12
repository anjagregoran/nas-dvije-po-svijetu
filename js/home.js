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

  // ---------- veliki vodiči ----------
  var featureEl = document.getElementById('feature');
  if (featureEl) featureEl.innerHTML = I.vodici.map(function (v) {
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
  if (window.TR) fromHash = window.TR(fromHash);
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
  var lastK = null, mapbox = document.getElementById('mapbox');
  mapbox.addEventListener('toggle', function () { if (mapbox.open && lastK) drawMap(lastK); });
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
    lastK = k; if (mapbox.open) drawMap(k);
    var c = 0;
    box.innerHTML = '<div class="sec-head" id="kontinent" style="margin-top:50px"><h2><span class="step">2</span>Pick a country in <em>' + esc(k.ime) + '</em></h2></div>' + k.regije.map(function (r) {
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
    document.getElementById('kontinent').scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', '#k=' + encodeURIComponent(active));
  });
  drawContinents(); drawCountries();
  if (fromHash) setTimeout(function () { document.getElementById('zemlje').scrollIntoView(); }, 50);

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
