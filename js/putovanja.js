(function () {
  var P = window.PUTOVANJA;
  var app = document.getElementById('app');
  var active = '';   // '' = sve skupine

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  var colour = {};
  P.skupine.forEach(function (g, i) { colour[g.id] = 'g' + (i + 1); });
  var HEX = { g1: '#5a1830', g2: '#2f6f73', g3: '#c2553a', g4: '#6b5aa6', g5: '#7c8a3e' };

  function trips() { return P.putovanja.filter(function (t) { return !active || t.skupina === active; }); }

  function draw() {
    var list = trips();
    var done = list.filter(function (t) { return t.status === 'bili'; });
    var places = 0, lands = {};
    done.forEach(function (t) { places += t.mjesta.length; lands[t.gdje] = 1; });
    var g = P.skupine.filter(function (x) { return x.id === active; })[0];

    app.innerHTML =
      '<header class="hero left" style="padding-top:34px;padding-bottom:10px"><span class="label">Dnevnik</span>' +
      '<h1>' + (g ? esc(g.ime) : 'Naša <em>putovanja</em>') + '</h1>' +
      '<p class="lead" style="margin:0">' + esc(g ? g.opis : 'Sve gdje smo bile i bili, i sve što tek slijedi, na jednoj karti.') + '</p></header>' +
      '<div class="chips wrapc" id="groups" style="margin-top:14px">' +
        '<button type="button" data-g=""' + (active === '' ? ' class="on"' : '') + '>Sve</button>' +
        P.skupine.map(function (x) {
          return '<button type="button" data-g="' + x.id + '"' + (active === x.id ? ' class="on"' : '') + '><i class="dot" style="background:' + HEX[colour[x.id]] + '"></i>' + esc(x.ime) + '</button>';
        }).join('') + '</div>' +
      '<div class="stats"><div><b>' + done.length + '</b><span>putovanja iza nas</span></div>' +
        '<div><b>' + Object.keys(lands).length + '</b><span>zemalja</span></div>' +
        '<div><b>' + places + '</b><span>mjesta</span></div>' +
        '<div><b>' + (list.length - done.length) + '</b><span>u planu</span></div></div>' +
      '<div class="map" id="map" style="margin-top:0"></div>' +
      (active ? section(g) : P.skupine.map(section).join(''));

    var pts = [];
    list.forEach(function (t) {
      t.mjesta.forEach(function (m) {
        pts.push({ c: m.c, t: m.ime, s: t.naslov + (t.status === 'plan' ? ' · u planu' : ''), h: t.vodic, k: t.status === 'plan' ? 'plan' : colour[t.skupina] });
      });
    });
    window.Karta.draw('map', pts, { maxZoom: 6, zoom: 5 });
  }

  function section(g) {
    var mine = P.putovanja.filter(function (t) { return t.skupina === g.id; });
    return '<div class="sec-head" style="margin-top:44px"><h2><i class="dot" style="width:14px;height:14px;background:' + HEX[colour[g.id]] + '"></i>' + esc(g.ime) + '</h2>' +
      '<span class="label">' + mine.length + (mine.length === 1 ? ' putovanje' : ' putovanja') + '</span></div>' +
      (mine.length ? '<div class="grid places">' + mine.map(function (t) {
        var inner = '<span class="badge' + (t.status === 'plan' ? ' plan' : '') + '">' + (t.status === 'plan' ? 'U planu' : 'Iza nas') + '</span>' +
          '<h3>' + esc(t.naslov) + '</h3><p>' + esc(t.gdje) + (t.godina ? ' · ' + esc(t.godina) : '') + '</p>' +
          (t.biljeska ? '<p style="margin-top:8px;color:var(--ink)">' + esc(t.biljeska) + '</p>' : '');
        return t.vodic ? '<a class="trip" href="' + esc(t.vodic) + '">' + inner + '</a>' : '<div class="trip">' + inner + '</div>';
      }).join('') + '</div>'
        : '<div class="empty">Ovdje još nema putovanja. Čim ih dodamo, pojavit će se na karti u ovoj boji.</div>');
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
