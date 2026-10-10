// Traži koordinate za sva mjesta koja ih još nemaju i sprema ih u data/koordinate.js.
// Koristi OpenStreetMap Nominatim, najviše jedan upit u sekundi. Pokretanje: node tools/geocode.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const outFile = path.join(root, 'data', 'koordinate.js');

const ISO = {
  italija: 'it,sm,va', spanjolska: 'es', portugal: 'pt', malta: 'mt', andora: 'ad', francuska: 'fr,mc', belgija: 'be',
  nizozemska: 'nl', luksemburg: 'lu', njemacka: 'de', austrija: 'at', svicarska: 'ch', lihtenstajn: 'li', ceska: 'cz',
  madarska: 'hu', poljska: 'pl', slovacka: 'sk', slovenija: 'si', norveska: 'no', svedska: 'se', danska: 'dk',
  finska: 'fi', island: 'is', estonija: 'ee', latvija: 'lv', litva: 'lt', uk: 'gb', irska: 'ie', grcka: 'gr',
  turska: 'tr', crnagora: 'me', bih: 'ba', srbija: 'rs', albanija: 'al', makedonija: 'mk', kosovo: 'xk',
  bugarska: 'bg', rumunjska: 'ro', cipar: 'cy', japan: 'jp', 'juzna-koreja': 'kr', kina: 'cn,hk,mo', tajvan: 'tw',
  tajland: 'th', vijetnam: 'vn', indonezija: 'id', kambodza: 'kh', malezija: 'my', singapur: 'sg', filipini: 'ph',
  laos: 'la', indija: 'in', 'sri-lanka': 'lk', nepal: 'np', maldivi: 'mv', butan: 'bt', uzbekistan: 'uz',
  gruzija: 'ge', armenija: 'am', uae: 'ae', jordan: 'jo', izrael: 'il,ps', oman: 'om', katar: 'qa',
  'saudijska-arabija': 'sa', maroko: 'ma', egipat: 'eg', tunis: 'tn', jar: 'za', kenija: 'ke', tanzanija: 'tz',
  namibija: 'na', bocvana: 'bw', 'viktorijini-slapovi': 'zw,zm', mauricijus: 'mu', sejseli: 'sc', madagaskar: 'mg',
  etiopija: 'et', senegal: 'sn', 'zelenortski-otoci': 'cv', gana: 'gh', 'ruanda-uganda': 'rw,ug', sad: 'us',
  kanada: 'ca', meksiko: 'mx', kuba: 'cu', kostarika: 'cr', gvatemala: 'gt', panama: 'pa', belize: 'bz',
  dominikanska: 'do', jamajka: 'jm', bahami: 'bs', portoriko: 'pr', 'mali-antili': 'bb,lc,aw,cw,mq,gp,ag,gd',
  brazil: 'br', argentina: 'ar', peru: 'pe', cile: 'cl', kolumbija: 'co', ekvador: 'ec', bolivija: 'bo',
  urugvaj: 'uy', australija: 'au', 'novi-zeland': 'nz', fidzi: 'fj', 'francuska-polinezija': 'pf', samoa: 'ws',
  'cookovi-otoci': 'ck', apulija: 'it'
};

global.window = {};
let K = {};
if (fs.existsSync(outFile)) { require(outFile); K = window.KOORDINATE || {}; }

// Popis svih mjesta: [ključ, ime, oznake država]
const todo = [];
for (const d of ['europa', 'svijet']) {
  const dir = path.join(root, 'data', d);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.js') || f === 'index.js') continue;
    try { require(path.join(dir, f)); } catch (e) { console.warn('preskačem', f, e.message); }
  }
}
for (const id of Object.keys(window.ATLAS || {})) {
  (window.ATLAS[id].mjesta || []).forEach(m => todo.push([id + '/' + m.id, m.ime, ISO[id]]));
}
require(path.join(root, 'data', 'apulija.js'));
global.TRIP = window.TRIP;
TRIP.dodaci.forEach(d => require(path.join(root, 'data', d + '.js')));
TRIP.mjesta.forEach(m => todo.push(['apulija/' + m.id, m.ime, 'it']));

function variants(name) {
  const v = [name];
  const first = name.split(/ i |,|\(|:| s /)[0].trim();
  if (first && first !== name) v.push(first);
  const inParen = (name.match(/\(([^)]+)\)/) || [])[1];
  if (inParen) v.push(inParen.split(',')[0].trim());
  const stripped = first.replace(/^(dolina|jezero|otok|slapovi|zaljev|poluotok|dvorac|nacionalni parkovi|delta|rudnik soli|regija)\s+/i, '');
  if (stripped !== first) v.push(stripped);
  return v;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function lookup(q, cc) {
  const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=hr&q=' + encodeURIComponent(q) + (cc ? '&countrycodes=' + cc : '');
  const res = await fetch(url, { headers: { 'User-Agent': 'putokaz-travel-guide/1.0 (github.com/anjagregoran/nas-dvije-po-svijetu)' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const j = await res.json();
  return j[0] ? [Math.round(j[0].lat * 1e4) / 1e4, Math.round(j[0].lon * 1e4) / 1e4] : null;
}
function save() {
  const keys = Object.keys(K).sort();
  fs.writeFileSync(outFile, '// Generirano skriptom tools/geocode.js. Ručni ispravci se čuvaju: skripta ne dira postojeće ključeve.\nwindow.KOORDINATE = {\n' +
    keys.map(k => '  ' + JSON.stringify(k) + ': ' + JSON.stringify(K[k])).join(',\n') + '\n};\n');
}

(async () => {
  const missing = todo.filter(t => !(t[0] in K));
  console.log('mjesta:', todo.length, '| bez koordinata:', missing.length);
  let n = 0;
  for (const [key, ime, cc] of missing) {
    let hit = null;
    for (const q of variants(ime)) {
      try { hit = await lookup(q, cc); } catch (e) { console.warn('greška', key, e.message); await sleep(5000); }
      await sleep(1100);
      if (hit) break;
    }
    if (hit) K[key] = hit; else console.warn('NEMA:', key, '|', ime);
    if (++n % 20 === 0) save();
  }
  save();
  console.log('gotovo, ukupno koordinata:', Object.keys(K).length);
})();
