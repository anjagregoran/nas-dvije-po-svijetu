(function () {
  var STATUS = {
    sljedece: ['Sljedeće', ''],
    plan: ['U planu', 'blue'],
    bile: ['Bile smo', 'green']
  };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  var html = window.PUTOVANJA.map(function (p) {
    var st = STATUS[p.status];
    var inner =
      '<div>' +
        '<span class="ink ' + st[1] + '">' + st[0] + '</span>' +
        '<h2>' + esc(p.naziv) + '</h2>' +
        '<div class="where">' + esc(p.gdje) + '</div>' +
        '<p>' + esc(p.opis) + '</p>' +
        (p.spremno ? '<p class="hand">otvori vodič →</p>' : '<p class="note">Vodič je u izradi.</p>') +
      '</div>' +
      '<div class="stamp ' + p.boja + '"><div>' + p.znak + '<span>' + esc(p.naziv) + '</span></div></div>';
    return p.spremno
      ? '<a class="card postcard" href="putovanje.html?p=' + p.id + '">' + inner + '</a>'
      : '<div class="card postcard soon">' + inner + '</div>';
  }).join('');
  document.getElementById('putovanja').innerHTML = html;

  var facts = (window.TRIP && window.TRIP.jesteLiZnale) || [];
  if (facts.length) {
    var box = document.getElementById('cinjenica');
    var show = function () {
      var f = facts[Math.floor(Math.random() * facts.length)];
      box.innerHTML =
        '<div class="card fact"><p class="label">Jeste li znale?</p><p>' + esc(f) + '</p>' +
        '<button type="button">Još jedna</button></div>';
      box.querySelector('button').onclick = show;
    };
    show();
  }

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
