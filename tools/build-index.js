// Builds the country list, deep-guide list and place search index for the home page,
// once per language: data/europa/index.js (English) and data/hr/europa/index.js (Croatian).
// Run: node tools/build-index.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const ISO = require('./iso.js');

// Continent, region, countries. A country without a file shows as "coming soon".
const PLAN = [
  ['Europe', [
    ['Southern Europe', ['italija', 'spanjolska', 'portugal', 'malta', 'andora']],
    ['Western Europe', ['francuska', 'belgija', 'nizozemska', 'luksemburg']],
    ['Central Europe', ['njemacka', 'austrija', 'svicarska', 'lihtenstajn', 'ceska', 'madarska', 'poljska', 'slovacka', 'slovenija']],
    ['Northern Europe', ['norveska', 'svedska', 'danska', 'finska', 'island', 'estonija', 'latvija', 'litva']],
    ['British Isles', ['uk', 'irska']],
    ['Southeastern Europe', ['grcka', 'turska', 'crnagora', 'bih', 'srbija', 'albanija', 'makedonija', 'kosovo', 'bugarska', 'rumunjska', 'cipar']]
  ]],
  ['Asia', [
    ['East Asia', ['japan', 'juzna-koreja', 'kina', 'tajvan']],
    ['Southeast Asia', ['tajland', 'vijetnam', 'indonezija', 'kambodza', 'malezija', 'singapur', 'filipini', 'laos']],
    ['South and Central Asia', ['indija', 'sri-lanka', 'nepal', 'maldivi', 'butan', 'uzbekistan', 'gruzija', 'armenija']],
    ['Middle East', ['uae', 'jordan', 'izrael', 'oman', 'katar', 'saudijska-arabija']]
  ]],
  ['Africa', [
    ['North Africa', ['maroko', 'egipat', 'tunis']],
    ['Sub-Saharan Africa', ['jar', 'kenija', 'tanzanija', 'namibija', 'bocvana', 'viktorijini-slapovi', 'mauricijus', 'sejseli', 'madagaskar', 'etiopija', 'senegal', 'zelenortski-otoci', 'gana', 'ruanda-uganda']]
  ]],
  ['North and Central America', [
    ['North America', ['sad', 'kanada']],
    ['Central America and the Caribbean', ['meksiko', 'kuba', 'kostarika', 'gvatemala', 'panama', 'belize', 'dominikanska', 'jamajka', 'bahami', 'portoriko', 'mali-antili']]
  ]],
  ['South America', [
    ['South America', ['brazil', 'argentina', 'peru', 'cile', 'kolumbija', 'ekvador', 'bolivija', 'urugvaj']]
  ]],
  ['Oceania', [
    ['Oceania', ['australija', 'novi-zeland', 'fidzi', 'francuska-polinezija', 'samoa', 'cookovi-otoci']]
  ]]
];
const HR = {
  'Europe': 'Europa', 'Asia': 'Azija', 'Africa': 'Afrika', 'North and Central America': 'Sjeverna i Srednja Amerika',
  'South America': 'Južna Amerika', 'Oceania': 'Oceanija',
  'Southern Europe': 'Južna Europa', 'Western Europe': 'Zapadna Europa', 'Central Europe': 'Srednja Europa',
  'Northern Europe': 'Sjeverna Europa', 'British Isles': 'Britansko otočje', 'Southeastern Europe': 'Jugoistočna Europa',
  'East Asia': 'Istočna Azija', 'Southeast Asia': 'Jugoistočna Azija', 'South and Central Asia': 'Južna i Srednja Azija',
  'Middle East': 'Bliski istok', 'North Africa': 'Sjeverna Afrika', 'Sub-Saharan Africa': 'Podsaharska Afrika',
  'North America': 'Sjeverna Amerika', 'Central America and the Caribbean': 'Srednja Amerika i Karibi'
};

const kfile = path.join(root, 'data', 'koordinate.js');
global.window = {};
if (fs.existsSync(kfile)) require(kfile);
const KO = window.KOORDINATE || {};
const centre = (id, mjesta) => {
  const pts = mjesta.map(m => KO[id + '/' + m.id]).filter(Boolean);
  if (!pts.length) return null;
  const lat = pts.reduce((a, p) => a + p[0], 0) / pts.length;
  // mean longitude through vectors, so countries across the date line do not land on the wrong side of the world
  const x = pts.reduce((a, p) => a + Math.cos(p[1] * Math.PI / 180), 0), y = pts.reduce((a, p) => a + Math.sin(p[1] * Math.PI / 180), 0);
  return [Math.round(lat * 100) / 100, Math.round(Math.atan2(y, x) * 18000 / Math.PI) / 100];
};

function build(lang) {
  const base = lang === 'hr' ? path.join(root, 'data', 'hr') : path.join(root, 'data');
  const tr = s => (lang === 'hr' ? HR[s] || s : s);
  const W = { country: lang === 'hr' ? 'Zemlja' : 'Country', guide: lang === 'hr' ? 'Veliki vodič' : 'Deep guide', guideLc: lang === 'hr' ? 'veliki vodič' : 'deep guide' };
  const dirs = ['europa', 'svijet'].map(d => path.join(base, d));
  window.ATLAS = {};
  const out = { kontinenti: [], vodici: [], trazi: [], cinjenice: [], mj: [], cc: {} };
  const add = (t, k, h) => { if (t) out.trazi.push([t, k, h]); };
  let problems = 0;

  for (const [kontinent, regije] of PLAN) {
    const K = { ime: tr(kontinent), regije: [] };
    for (const [regija, ids] of regije) {
      const zemlje = [];
      for (const id of ids) {
        const file = dirs.map(d => path.join(d, id + '.js')).filter(f => fs.existsSync(f))[0];
        if (!file) { zemlje.push({ id, ime: id, spremno: false }); continue; }
        try {
          delete require.cache[file];
          require(file);
          const z = window.ATLAS[id];
          if (!z || !Array.isArray(z.mjesta)) throw new Error('no ATLAS["' + id + '"].mjesta');
          if (/[—–]/.test(fs.readFileSync(file, 'utf8'))) { console.warn('! dash in', lang, id); problems++; }
          const h = 'zemlja.html?z=' + id;
          zemlje.push({ id, ime: z.ime, sazetak: z.sazetak, n: z.mjesta.length, spremno: true, c: centre(id, z.mjesta) });
          add(z.ime, W.country, h);
          z.mjesta.forEach(m => add(m.ime, z.ime, h + '#/mjesto/' + m.id));
          z.mjesta.forEach(m => { const c = KO[id + '/' + m.id]; if (c) out.mj.push([m.ime, z.ime, h + '#/mjesto/' + m.id, c[0], c[1]]); });
          (ISO[id] || '').split(',').forEach(c => { if (c && !out.cc[c]) out.cc[c] = [id, z.ime]; });
          (z.zanimljivosti || []).forEach(c => out.cinjenice.push([c, z.ime]));
        } catch (e) {
          console.warn('! skipping', lang, id, '-', e.message); problems++;
          zemlje.push({ id, ime: id, spremno: false });
        }
      }
      K.regije.push({ ime: tr(regija), zemlje });
    }
    out.kontinenti.push(K);
  }

  // Deep guides (so far Apulia).
  for (const gid of ['apulija']) {
    const main = path.join(base, gid + '.js');
    delete require.cache[main];
    require(main);
    const T = global.TRIP = window.TRIP;
    T.dodaci.forEach(d => { const f = path.join(base, d + '.js'); delete require.cache[f]; require(f); });
    const h = 'putovanje.html?p=' + gid;
    const sights = T.mjesta.reduce((n, m) => n + (m.znamenitosti || []).length, 0);
    const foods = T.hrana.reduce((n, k) => n + k.stavke.length, 0);
    out.vodici.push({ id: gid, naziv: T.naziv, nadnaslov: T.nadnaslov, uvod: T.uvod, mjesta: T.mjesta.length, znamenitosti: sights, jela: foods });
    add(T.naziv, W.guide, h);
    T.mjesta.forEach(m => add(m.ime, T.naziv + ' · ' + W.guideLc, h + '#/mjesto/' + m.id));
    T.mjesta.forEach(m => { const c = KO[gid + '/' + m.id]; if (c) out.mj.push([m.ime, T.naziv + ' · ' + W.guideLc, h + '#/mjesto/' + m.id, c[0], c[1]]); });
    T.jesteLiZnale.forEach(c => out.cinjenice.push([c, T.naziv]));
  }

  fs.writeFileSync(path.join(base, 'europa', 'index.js'), '// Generated by tools/build-index.js. Do not edit by hand.\nwindow.ATLAS_INDEX = ' + JSON.stringify(out) + ';\n');
  const ready = out.kontinenti.reduce((n, k) => n + k.regije.reduce((m, r) => m + r.zemlje.filter(z => z.spremno).length, 0), 0);
  console.log(lang + ': zemalja', ready, '| unosa u tražilici:', out.trazi.length, '| činjenica:', out.cinjenice.length, '| problema:', problems);
}

build('en');
if (fs.existsSync(path.join(root, 'data', 'hr', 'europa'))) build('hr');
