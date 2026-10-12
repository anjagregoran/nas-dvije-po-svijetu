(function () {
  var P = window.PUTOVANJA;
  var app = document.getElementById('app');
  var active = 'svijet';   // 'svijet' = Anja's world, '' = all trips, otherwise a group id

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  var colour = {};
  P.skupine.forEach(function (g, i) { colour[g.id] = 'g' + (i + 1); });
  var HEX = { g1: '#5a1830', g2: '#2f6f73', g3: '#c2553a', g4: '#6b5aa6', g5: '#7c8a3e' };

  function trips() { return P.putovanja.filter(function (t) { return !active || t.skupina === active; }); }

  var W = P.svijet;
  function drawWorld() {
    var parts = [];
    W.zemlje.forEach(function (z) {
      var g = parts.filter(function (x) { return x.n === z.dio; })[0];
      if (!g) { g = { n: z.dio, z: [] }; parts.push(g); }
      g.z.push(z);
    });
    var pct = Math.round(W.zemlje.length / W.ukupno * 100);
    app.innerHTML =
      '<header class="hero left" style="padding-top:34px;padding-bottom:10px"><span class="label">Countries I have been to</span>' +
      '<h1>Anja’s <em>world</em></h1>' +
      '<p class="lead" style="margin:0">Every country I have set foot in myself, colored in on one map.</p></header>' +
      chips() +
      '<div class="stats"><div><b>' + W.zemlje.length + '</b><span>of ' + W.ukupno + ' countries</span></div>' +
        '<div><b>' + pct + '%</b><span>of the world</span></div>' +
        '<div><b>' + parts.length + '</b><span>regions</span></div>' +
        '<div><b>' + (W.ukupno - W.zemlje.length) + '</b><span>still to go</span></div></div>' +
      '<div class="map" id="map" style="margin-top:0"></div>' +
      '<p class="note" style="margin-top:10px"><i class="dot" style="background:#5a1830"></i>Visited &nbsp; <i class="dot" style="background:#e0a52e"></i>Lived in &nbsp; <i class="dot" style="background:#2f6f73"></i>Home</p>' +
      parts.map(function (g) {
        return '<div class="sec-head" style="margin-top:40px"><h2>' + esc(g.n) + '</h2><span class="label">' + g.z.length + (g.z.length === 1 ? ' country' : ' countries') + '</span></div>' +
          '<div class="grid places">' + g.z.map(function (z) {
            var tag = z.dom ? 'Home' : z.zivjela ? 'Lived in' : 'Visited';
            var inner = '<span class="badge' + (z.zivjela ? ' plan' : '') + '">' + tag + '</span><h3>' + esc(z.ime) + '</h3>' +
              (z.vodic ? '<p>Open the guide →</p>' : '<p>No guide needed, this one is home.</p>');
            return z.vodic ? '<a class="trip" href="zemlja.html?z=' + z.vodic + '">' + inner + '</a>' : '<div class="trip">' + inner + '</div>';
          }).join('') + '</div>';
      }).join('');
    var colours = {}, names = {};
    W.zemlje.forEach(function (z) { colours[z.iso] = z.dom ? '#2f6f73' : z.zivjela ? '#e0a52e' : '#5a1830'; names[z.iso] = z.ime; });
    window.Karta.world('map', colours, names);
  }
  function chips() {
    return '<div class="chips wrapc" id="groups" style="margin-top:14px">' +
      '<button type="button" data-g="svijet"' + (active === 'svijet' ? ' class="on"' : '') + '>Anja’s world</button>' +
      '<button type="button" data-g=""' + (active === '' ? ' class="on"' : '') + '>All trips</button>' +
      P.skupine.map(function (x) {
        return '<button type="button" data-g="' + x.id + '"' + (active === x.id ? ' class="on"' : '') + '><i class="dot" style="background:' + HEX[colour[x.id]] + '"></i>' + esc(x.ime) + '</button>';
      }).join('') + '</div>';
  }

  function draw() {
    if (active === 'svijet') return drawWorld();
    var list = trips();
    var done = list.filter(function (t) { return t.status === 'bili'; });
    var places = 0, lands = {};
    done.forEach(function (t) { places += t.mjesta.length; lands[t.gdje] = 1; });
    var g = P.skupine.filter(function (x) { return x.id === active; })[0];

    app.innerHTML =
      '<header class="hero left" style="padding-top:34px;padding-bottom:10px"><span class="label">Travel log</span>' +
      '<h1>' + (g ? esc(g.ime) : 'Our <em>trips</em>') + '</h1>' +
      '<p class="lead" style="margin:0">' + esc(g ? g.opis : 'Everywhere we have been and everything still to come, on one map.') + '</p></header>' +
      chips() +
      '<div class="stats"><div><b>' + done.length + '</b><span>trips done</span></div>' +
        '<div><b>' + Object.keys(lands).length + '</b><span>countries</span></div>' +
        '<div><b>' + places + '</b><span>places</span></div>' +
        '<div><b>' + (list.length - done.length) + '</b><span>planned</span></div></div>' +
      '<div class="map" id="map" style="margin-top:0"></div>' +
      (active ? section(g) : P.skupine.map(section).join(''));

    var pts = [];
    list.forEach(function (t) {
      t.mjesta.forEach(function (m) {
        pts.push({ c: m.c, t: m.ime, s: t.naslov + (t.status === 'plan' ? ' · planned' : ''), h: t.vodic, k: t.status === 'plan' ? 'plan' : colour[t.skupina] });
      });
    });
    window.Karta.draw('map', pts, { maxZoom: 6, zoom: 5 });
  }

  function section(g) {
    var mine = P.putovanja.filter(function (t) { return t.skupina === g.id; });
    return '<div class="sec-head" style="margin-top:44px"><h2><i class="dot" style="width:14px;height:14px;background:' + HEX[colour[g.id]] + '"></i>' + esc(g.ime) + '</h2>' +
      '<span class="label">' + mine.length + (mine.length === 1 ? ' trip' : ' trips') + '</span></div>' +
      (mine.length ? '<div class="grid places">' + mine.map(function (t) {
        var inner = '<span class="badge' + (t.status === 'plan' ? ' plan' : '') + '">' + (t.status === 'plan' ? 'Planned' : 'Done') + '</span>' +
          '<h3>' + esc(t.naslov) + '</h3><p>' + esc(t.gdje) + (t.godina ? ' · ' + esc(t.godina) : '') + '</p>' +
          (t.biljeska ? '<p style="margin-top:8px;color:var(--ink)">' + esc(t.biljeska) + '</p>' : '');
        return t.vodic ? '<a class="trip" href="' + esc(t.vodic) + '">' + inner + '</a>' : '<div class="trip">' + inner + '</div>';
      }).join('') + '</div>'
        : '<div class="empty">No trips here yet. As soon as we add them they will show on the map in this color.</div>');
  }

  app.addEventListener('click', function (e) {
    var b = e.target.closest('#groups button');
    if (!b) return;
    active = b.getAttribute('data-g');
    draw();
    window.scrollTo(0, 0);
  });
  draw();
})();
