// Gradi data/europa/index.js: popis zemalja, velikih vodiča i tražilicu za početnu stranicu.
// Pokretanje: node tools/build-index.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const dir = path.join(root, 'data', 'europa');

// Sve zemlje koje atlas treba imati: kontinent, regija, zemlje. Zemlja bez datoteke prikazuje se kao „uskoro“.
const PLAN = [
  ['Europa', [
    ['Južna Europa', ['italija', 'spanjolska', 'portugal', 'malta', 'andora']],
    ['Zapadna Europa', ['francuska', 'belgija', 'nizozemska', 'luksemburg']],
    ['Srednja Europa', ['njemacka', 'austrija', 'svicarska', 'lihtenstajn', 'ceska', 'madarska', 'poljska', 'slovacka', 'slovenija']],
    ['Sjeverna Europa', ['norveska', 'svedska', 'danska', 'finska', 'island', 'estonija', 'latvija', 'litva']],
    ['Britansko otočje', ['uk', 'irska']],
    ['Jugoistočna Europa', ['grcka', 'turska', 'crnagora', 'bih', 'srbija', 'albanija', 'makedonija', 'kosovo', 'bugarska', 'rumunjska', 'cipar']]
  ]],
  ['Azija', [
    ['Istočna Azija', ['japan', 'juzna-koreja', 'kina', 'tajvan']],
    ['Jugoistočna Azija', ['tajland', 'vijetnam', 'indonezija', 'kambodza', 'malezija', 'singapur', 'filipini', 'laos']],
    ['Južna i Srednja Azija', ['indija', 'sri-lanka', 'nepal', 'maldivi', 'butan', 'uzbekistan', 'gruzija', 'armenija']],
    ['Bliski istok', ['uae', 'jordan', 'izrael', 'oman', 'katar', 'saudijska-arabija']]
  ]],
  ['Afrika', [
    ['Sjeverna Afrika', ['maroko', 'egipat', 'tunis']],
    ['Podsaharska Afrika', ['jar', 'kenija', 'tanzanija', 'namibija', 'bocvana', 'viktorijini-slapovi', 'mauricijus', 'sejseli', 'madagaskar', 'etiopija', 'senegal', 'zelenortski-otoci', 'gana', 'ruanda-uganda']]
  ]],
  ['Sjeverna i Srednja Amerika', [
    ['Sjeverna Amerika', ['sad', 'kanada']],
    ['Srednja Amerika i Karibi', ['meksiko', 'kuba', 'kostarika', 'gvatemala', 'panama', 'belize', 'dominikanska', 'jamajka', 'bahami', 'portoriko', 'mali-antili']]
  ]],
  ['Južna Amerika', [
    ['Južna Amerika', ['brazil', 'argentina', 'peru', 'cile', 'kolumbija', 'ekvador', 'bolivija', 'urugvaj']]
  ]],
  ['Oceanija', [
    ['Oceanija', ['australija', 'novi-zeland', 'fidzi', 'francuska-polinezija', 'samoa', 'cookovi-otoci']]
  ]]
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
  rumunjska: 'Rumunjska', cipar: 'Cipar',
  japan: 'Japan', 'juzna-koreja': 'Južna Koreja', kina: 'Kina', tajvan: 'Tajvan',
  tajland: 'Tajland', vijetnam: 'Vijetnam', indonezija: 'Indonezija', kambodza: 'Kambodža', malezija: 'Malezija',
  singapur: 'Singapur', filipini: 'Filipini', laos: 'Laos',
  indija: 'Indija', 'sri-lanka': 'Šri Lanka', nepal: 'Nepal', maldivi: 'Maldivi', butan: 'Butan',
  uzbekistan: 'Uzbekistan', gruzija: 'Gruzija', armenija: 'Armenija',
  uae: 'Ujedinjeni Arapski Emirati', jordan: 'Jordan', izrael: 'Izrael i Palestina', oman: 'Oman', katar: 'Katar',
  'saudijska-arabija': 'Saudijska Arabija', maroko: 'Maroko', egipat: 'Egipat', tunis: 'Tunis',
  jar: 'Južnoafrička Republika', kenija: 'Kenija', tanzanija: 'Tanzanija', namibija: 'Namibija', bocvana: 'Bocvana',
  'viktorijini-slapovi': 'Zimbabve i Zambija', mauricijus: 'Mauricijus', sejseli: 'Sejšeli', madagaskar: 'Madagaskar',
  etiopija: 'Etiopija', senegal: 'Senegal', 'zelenortski-otoci': 'Zelenortska Republika', gana: 'Gana',
  'ruanda-uganda': 'Ruanda i Uganda',
  sad: 'SAD', kanada: 'Kanada', meksiko: 'Meksiko', kuba: 'Kuba', kostarika: 'Kostarika', gvatemala: 'Gvatemala',
  panama: 'Panama', belize: 'Belize', dominikanska: 'Dominikanska Republika', jamajka: 'Jamajka', bahami: 'Bahami',
  portoriko: 'Portoriko', 'mali-antili': 'Mali Antili',
  brazil: 'Brazil', argentina: 'Argentina', peru: 'Peru', cile: 'Čile', kolumbija: 'Kolumbija', ekvador: 'Ekvador',
  bolivija: 'Bolivija', urugvaj: 'Urugvaj',
  australija: 'Australija', 'novi-zeland': 'Novi Zeland', fidzi: 'Fidži', 'francuska-polinezija': 'Francuska Polinezija',
  samoa: 'Samoa', 'cookovi-otoci': 'Cookovi Otoci'
};
const DIRS = ['europa', 'svijet'].map(d => path.join(root, 'data', d));

global.window = {};
const kfile = path.join(root, 'data', 'koordinate.js');
if (fs.existsSync(kfile)) require(kfile);
const KO = window.KOORDINATE || {};
const centre = (id, mjesta) => {
  const pts = mjesta.map(m => KO[id + '/' + m.id]).filter(Boolean);
  if (!pts.length) return null;
  const lat = pts.reduce((a, p) => a + p[0], 0) / pts.length;
  // srednja dužina preko vektora, da zemlje preko datumske granice ne završe na krivoj strani svijeta
  const x = pts.reduce((a, p) => a + Math.cos(p[1] * Math.PI / 180), 0), y = pts.reduce((a, p) => a + Math.sin(p[1] * Math.PI / 180), 0);
  return [Math.round(lat * 100) / 100, Math.round(Math.atan2(y, x) * 18000 / Math.PI) / 100];
};
const ISO = require('./iso.js');
const out = { kontinenti: [], vodici: [], trazi: [], cinjenice: [], mj: [], cc: {} };
const add = (t, k, h) => { if (t) out.trazi.push([t, k, h]); };
let problems = 0;

for (const [kontinent, regije] of PLAN) {
 const K = { ime: kontinent, regije: [] };
 for (const [regija, ids] of regije) {
  const zemlje = [];
  for (const id of ids) {
    const file = DIRS.map(d => path.join(d, id + '.js')).filter(f => fs.existsSync(f))[0];
    if (!file) { zemlje.push({ id, ime: NAMES[id], spremno: false }); continue; }
    try {
      delete require.cache[file];
      require(file);
      const z = window.ATLAS[id];
      if (!z || !Array.isArray(z.mjesta)) throw new Error('nema ATLAS["' + id + '"].mjesta');
      const raw = fs.readFileSync(file, 'utf8');
      if (/[—–]/.test(raw)) { console.warn('! crtica (em/en dash) u', id); problems++; }
      const h = 'zemlja.html?z=' + id;
      zemlje.push({ id, ime: z.ime, sazetak: z.sazetak, n: z.mjesta.length, spremno: true, c: centre(id, z.mjesta) });
      add(z.ime, 'Zemlja', h);
      z.mjesta.forEach(m => add(m.ime, z.ime, h + '#/mjesto/' + m.id));
      z.mjesta.forEach(m => { const c = KO[id + '/' + m.id]; if (c) out.mj.push([m.ime, z.ime, h + '#/mjesto/' + m.id, c[0], c[1]]); });
      (ISO[id] || '').split(',').forEach(c => { if (c && !out.cc[c]) out.cc[c] = [id, z.ime]; });
      (z.zanimljivosti || []).forEach(c => out.cinjenice.push([c, z.ime]));
    } catch (e) {
      console.warn('! preskačem', id, '-', e.message); problems++;
      zemlje.push({ id, ime: NAMES[id], spremno: false });
    }
  }
  K.regije.push({ ime: regija, zemlje });
 }
 out.kontinenti.push(K);
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
  T.mjesta.forEach(m => add(m.ime, T.naziv + ' · veliki vodič', h + '#/mjesto/' + m.id));
  T.mjesta.forEach(m => { const c = KO[gid + '/' + m.id]; if (c) out.mj.push([m.ime, T.naziv + ' · veliki vodič', h + '#/mjesto/' + m.id, c[0], c[1]]); });
  T.jesteLiZnale.forEach(c => out.cinjenice.push([c, T.naziv]));
}

fs.writeFileSync(path.join(dir, 'index.js'), '// Generirano skriptom tools/build-index.js. Ne uređivati ručno.\nwindow.ATLAS_INDEX = ' + JSON.stringify(out) + ';\n');
const ready = out.kontinenti.reduce((n, k) => n + k.regije.reduce((m, r) => m + r.zemlje.filter(z => z.spremno).length, 0), 0);
console.log('zemalja:', ready, '| unosa u tražilici:', out.trazi.length, '| činjenica:', out.cinjenice.length, '| problema:', problems);
