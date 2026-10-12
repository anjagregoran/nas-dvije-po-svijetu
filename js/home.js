(function () {
  var I = window.ATLAS_INDEX;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // ---------- step 1: continent, step 2: country ----------
  var active = '';
  var fromHash = decodeURIComponent((location.hash.match(/^#k=(.+)$/) || [])[1] || '');
  if (window.TR) fromHash = window.TR(fromHash);
  if (I.kontinenti.some(function (k) { return k.ime === fromHash; })) active = fromHash;

  var steps = document.getElementById('steps');
  var cont = document.getElementById('continents');
  var box = document.getElementById('countries');
  var mapbox = document.getElementById('mapbox');

  function count(k) {
    var n = 0;
    k.regije.forEach(function (r) { r.zemlje.forEach(function (z) { if (z.spremno) n++; }); });
    return n;
  }
  function current() { return I.kontinenti.filter(function (x) { return x.ime === active; })[0]; }

  function drawSteps() {
    steps.innerHTML =
      '<li class="' + (active ? 'done' : 'now') + '"><a href="#zemlje"><b>1</b>' + (active ? esc(active) : 'Continent') + '</a></li>' +
      '<li class="' + (active ? 'now' : '') + '"><span><b>2</b>Country</span></li>' +
      '<li><span><b>3</b>Part of the country</span></li>' +
      '<li><span><b>4</b>City</span></li>';
  }
  function drawContinents() {
    cont.innerHTML = I.kontinenti.map(function (k) {
      return '<a class="kpill' + (k.ime === active ? ' on' : '') + '" href="#zemlje" data-k="' + esc(k.ime) + '">' +
        '<span class="kname">' + esc(k.ime) + '</span><span class="label">' + count(k) + ' countries</span></a>';
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
    var k = current();
    if (!k) { box.innerHTML = ''; mapbox.hidden = true; return; }
    mapbox.hidden = false;
    if (mapbox.open) drawMap(k);
    var c = 0;
    box.innerHTML = '<div class="stephead" id="kontinent"><span class="label">Step 2 of 4</span><h2>Pick a country in <em>' + esc(k.ime) + '</em></h2></div>' +
      k.regije.map(function (r) {
        return (k.regije.length > 1 ? '<h3 class="group-title">' + esc(r.ime) + '</h3>' : '') + '<div class="grid">' +
          r.zemlje.map(function (z) {
            if (!z.spremno) return '';
            return '<a class="tilec c' + (c++ % 6) + '" href="zemlja.html?z=' + z.id + '">' +
              '<span class="label">' + z.n + ' places</span>' +
              '<div><h3>' + esc(z.ime) + '</h3><p>' + esc(z.sazetak) + '</p></div></a>';
          }).join('') + '</div>';
      }).join('');
  }
  function drawAll() { drawSteps(); drawContinents(); drawCountries(); }

  cont.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    active = a.getAttribute('data-k');
    drawAll();
    history.replaceState(null, '', '#k=' + encodeURIComponent(active));
    document.getElementById('kontinent').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  mapbox.addEventListener('toggle', function () { if (mapbox.open && current()) drawMap(current()); });
  drawAll();
  // A refresh always starts at the top. Arriving from a country page ("1 Europe" in the step bar) jumps to step 2.
  var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (nav.type === 'reload' || !active) window.scrollTo(0, 0);
  else setTimeout(function () { document.getElementById('kontinent').scrollIntoView(); }, 50);

  // ---------- did you know ----------
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
