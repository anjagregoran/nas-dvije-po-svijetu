// Gradi data/europa/index.js: popis zemalja, velikih vodiča i tražilicu za početnu stranicu.
// Pokretanje: node tools/build-index.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const dir = path.join(root, 'data', 'europa');

// Sve zemlje koje atlas treba imati, redom kojim se prikazuju. Zemlja bez datoteke prikazuje se kao „uskoro“.
const PLAN = [
  ['Južna Europa', ['italija', 'spanjolska', 'portugal', 'malta', 'andora']],
  ['Zapadna Europa', ['francuska', 'belgija', 'nizozemska', 'luksemburg']],
  ['Srednja Europa', ['njemacka', 'austrija', 'svicarska', 'lihtenstajn', 'ceska', 'madarska', 'poljska', 'slovacka', 'slovenija']],
  ['Sjeverna Europa', ['norveska', 'svedska', 'danska', 'finska', 'island', 'estonija', 'latvija', 'litva']],
  ['Britansko otočje', ['uk', 'irska']],
  ['Jugoistočna Europa', ['grcka', 'turska', 'crnagora', 'bih', 'srbija', 'albanija', 'makedonija', 'kosovo', 'bugarska', 'rumunjska', 'cipar']]
];
const NAMES = {
  italija: 'Italija', spanjolska: 'Španjolska', portugal: 'Portugal', malta: 'Malta', andora: 'Andora',
  francuska: 'Francuska', belgija: 'Belgija', nizozemska: 'Nizozemska', luksemburg: 'Luksemburg',
  njemacka: 'Njemačka', austrija: 'Austrija', svicarska: 'Švicarska', lihtenstajn: 'Lihtenštajn', ceska: 'Češka',
  madarska: 'Mađarska', poljska: 'Poljska', slovacka: 'Slovačka', slovenija: 'Slovenija',
  norveska: 'Norveška', svedska: 'Švedska', danska: 'Danska', finska: 'Finska', island: 'Island',
  estonija: 'Estonija', latvija: 'Latvija', litva: 'Litva', uk: 'Ujedinjeno Kraljevstvo', irska: 'Irska',
  grcka: 'Grčka', turska: 'Turska', crnagora: 'Crna Gora', bih: 'Bosna i Hercegovina', srbija: 'Srbija',
  albanija: 'Albanija', makedonija: 'Sjeverna Makedonija', kosovo: 'Kosovo', bugarska: 'Bugarska',
  rumunjska: 'Rumunjska', cipar: 'Cipar'
};

global.window = {};
const out = { regije: [], vodici: [], trazi: [], cinjenice: [] };
const add = (t, k, h) => { if (t) out.trazi.push([t, k, h]); };
let problems = 0;

for (const [regija, ids] of PLAN) {
  const zemlje = [];
  for (const id of ids) {
    const file = path.join(dir, id + '.js');
    if (!fs.existsSync(file)) { zemlje.push({ id, ime: NAMES[id], spremno: false }); continue; }
    try {
      delete require.cache[file];
      require(file);
      const z = window.ATLAS[id];
      if (!z || !Array.isArray(z.mjesta)) throw new Error('nema ATLAS["' + id + '"].mjesta');
      const raw = fs.readFileSync(file, 'utf8');
      if (/[—–]/.test(raw)) { console.warn('! crtica (em/en dash) u', id); problems++; }
      const h = 'zemlja.html?z=' + id;
      zemlje.push({ id, ime: z.ime, sazetak: z.sazetak, n: z.mjesta.length, spremno: true });
      add(z.ime, 'Zemlja', h);
      z.mjesta.forEach(m => {
        add(m.ime, z.ime, h + '#/mjesto/' + m.id);
        (m.vidjeti || []).forEach((v, i) => add(v.ime, m.ime + ' · znamenitost', h + '#/mjesto/' + m.id + '/v' + i));
        (m.jesti || []).forEach(v => add(v.ime, m.ime + ' · hrana', h + '#/mjesto/' + m.id + '/jesti'));
        (m.dozivjeti || []).forEach(v => add(v.ime, m.ime + ' · doživljaj', h + '#/mjesto/' + m.id + '/dozivjeti'));
        (m.agencije || []).forEach(v => add(v.ime, m.ime + ' · agencija', h + '#/mjesto/' + m.id + '/agencije'));
      });
      (z.hrana || []).forEach(v => add(v.ime, z.ime + ' · hrana', h + '#/hrana'));
      (z.obicaji || []).forEach(v => add(v.ime, z.ime + ' · običaji', h + '#/obicaji'));
      (z.zanimljivosti || []).forEach(c => out.cinjenice.push([c, z.ime]));
    } catch (e) {
      console.warn('! preskačem', id, '-', e.message); problems++;
      zemlje.push({ id, ime: NAMES[id], spremno: false });
    }
  }
  out.regije.push({ ime: regija, zemlje });
}

// Veliki vodiči (zasad Apulija).
for (const gid of ['apulija']) {
  delete window.TRIP; global.TRIP = undefined;
  require(path.join(root, 'data', gid + '.js'));
  const T = global.TRIP = window.TRIP;
  T.dodaci.forEach(d => require(path.join(root, 'data', d + '.js')));
  const h = 'putovanje.html?p=' + gid;
  const sights = T.mjesta.reduce((n, m) => n + (m.znamenitosti || []).length, 0);
  const foods = T.hrana.reduce((n, k) => n + k.stavke.length, 0);
  out.vodici.push({ id: gid, naziv: T.naziv, nadnaslov: T.nadnaslov, uvod: T.uvod, mjesta: T.mjesta.length, znamenitosti: sights, jela: foods });
  add(T.naziv, 'Veliki vodič', h);
  T.mjesta.forEach(m => {
    add(m.ime, T.naziv, h + '#/mjesto/' + m.id);
    (m.znamenitosti || []).forEach((z, i) => add(z.ime, m.ime + ' · znamenitost', h + '#/mjesto/' + m.id + '/' + i));
  });
  T.hrana.forEach((k, ki) => k.stavke.forEach((s, i) => add(s.ime, T.naziv + ' · hrana', h + '#/hrana/h-' + ki + '-' + i)));
  T.kultura.forEach((c, i) => add(c.naslov, T.naziv + ' · kultura', h + '#/kultura/' + i));
  T.akoZelis.forEach((a, i) => {
    add(a.zelja, T.naziv + ' · ako želiš', h + '#/ako-zelis/' + i);
    a.opcije.forEach(o => add(o.ime, o.mjesto, h + '#/ako-zelis/' + i));
  });
  T.jesteLiZnale.forEach(c => out.cinjenice.push([c, T.naziv]));
}

fs.writeFileSync(path.join(dir, 'index.js'), '// Generirano skriptom tools/build-index.js. Ne uređivati ručno.\nwindow.ATLAS_INDEX = ' + JSON.stringify(out) + ';\n');
const ready = out.regije.reduce((n, r) => n + r.zemlje.filter(z => z.spremno).length, 0);
console.log('zemalja:', ready, '| unosa u tražilici:', out.trazi.length, '| činjenica:', out.cinjenice.length, '| problema:', problems);
