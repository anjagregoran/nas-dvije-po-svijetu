// Language switch. The long texts live in two folders (data/ for English, data/hr/ for Croatian);
// the short interface texts are written in English in the code and translated here on the fly.
(function () {
  var lang = 'en';
  try { lang = localStorage.getItem('lang') === 'hr' ? 'hr' : 'en'; } catch (e) {}
  window.LANG = lang;
  window.BASE = lang === 'hr' ? 'data/hr/' : 'data/';
  document.documentElement.lang = lang;

  // English interface text -> Croatian
  var D = {
    // header, footer
    'Explore': 'Istraži', 'Our trips': 'Naša putovanja', 'Official site': 'Službena stranica',
    'Prices and opening hours change, so check official sites before you go.': 'Cijene i radna vremena mijenjaju se, pa ih prije puta provjerite na službenim stranicama.',
    'Map and location data: © OpenStreetMap contributors.': 'Karta i podaci o položaju: © suradnici OpenStreetMapa.',
    // home
    'A world guide': 'Vodič po svijetu', 'Feel the place,': 'Osjeti mjesto,', 'bite by bite.': 'zalogaj po zalogaj.',
    'For travelers who would rather find the good bakery than the famous museum.': 'Za putnice kojima je dobra pekara draža od slavnog muzeja.',
    'Where to next?': 'Kamo sljedeće?', 'Type a city or country': 'Upišite grad ili zemlju', 'Surprise me': 'Iznenadi me',
    'Pick a': 'Odaberi', 'continent': 'kontinent', 'place': 'mjesto', 'Pick a country in': 'Odaberi zemlju:',
    'See them on the map': 'Pogledaj na karti', 'Every country of this continent as a pin': 'Sve zemlje ovog kontinenta na karti',
    'Upcoming': 'Sljedeća', 'trips': 'putovanja', 'Next': 'Sljedeće', 'Planned': 'U planu', 'Italy': 'Italija',
    'Norway': 'Norveška', 'Sweden': 'Švedska', 'Denmark': 'Danska', 'Scandinavia': 'Skandinavija', 'Apulia': 'Apulija',
    'Did you know?': 'Jeste li znale?', 'Another one': 'Još jedna', 'Coming soon': 'Uskoro',
    'Tap to see what people eat, do and buy there.': 'Dodirnite da vidite što se ondje jede, radi i kupuje.',
    'Anywhere in the world': 'Bilo gdje na svijetu',
    // continents and regions
    'Europe': 'Europa', 'Asia': 'Azija', 'Africa': 'Afrika', 'North and Central America': 'Sjeverna i Srednja Amerika',
    'South America': 'Južna Amerika', 'Oceania': 'Oceanija', 'Southern Europe': 'Južna Europa', 'Western Europe': 'Zapadna Europa',
    'Central Europe': 'Srednja Europa', 'Northern Europe': 'Sjeverna Europa', 'British Isles': 'Britansko otočje',
    'Southeastern Europe': 'Jugoistočna Europa', 'East Asia': 'Istočna Azija', 'Southeast Asia': 'Jugoistočna Azija',
    'South and Central Asia': 'Južna i Srednja Azija', 'Middle East': 'Bliski istok', 'North Africa': 'Sjeverna Afrika',
    'Sub-Saharan Africa': 'Podsaharska Afrika', 'North America': 'Sjeverna Amerika',
    'Central America and the Caribbean': 'Srednja Amerika i Karibi', 'South Asia': 'Južna Azija',
    // country and place pages
    'City': 'Grad', 'Town': 'Gradić', 'Region': 'Regija', 'Island': 'Otok', 'Nature': 'Priroda', 'Place': 'Mjesto', 'Open': 'Otvori',
    'About the country': 'O zemlji', 'A little history and what makes it special': 'Malo povijesti i ono što je čini posebnom',
    'Cuisine': 'Kuhinja', 'Traditional dishes and drinks': 'Tradicionalna jela i pića',
    'What to buy': 'Što kupiti', 'Traditional products to bring home': 'Tradicionalni proizvodi za ponijeti kući',
    'Customs, music and dance': 'Običaji, glazba i ples', 'What to see and where to learn': 'Što vidjeti i gdje naučiti',
    'A few words': 'Nekoliko riječi', 'Phrases with pronunciation': 'Fraze s izgovorom',
    'Practical': 'Praktično', 'When to go, money, getting around': 'Kada ići, novac, kretanje',
    'Facts worth reading out loud': 'Činjenice za pročitati naglas', 'Map': 'Karta', 'Every place at a glance': 'Sva mjesta na jednom mjestu',
    'Sources': 'Izvori', 'Where the facts come from': 'Odakle podaci', 'Sources and official sites': 'Izvori i službene stranice',
    'Hidden gems': 'Skriveni dragulji', 'Spots most visitors miss': 'Mjesta koja većina propusti',
    'Like a local': 'Kao domaći', 'What people here actually do': 'Što ovdje ljudi stvarno rade',
    'Traditional products from here': 'Tradicionalni proizvodi ovog kraja',
    'The story': 'Priča mjesta', 'A short history, if you are curious': 'Kratka povijest, za one koje zanima',
    'Sights': 'Znamenitosti', 'What it is and what to look for': 'Što je to i što na tome potražiti',
    'What people eat here and traditional dishes': 'Što se ovdje jede i tradicionalna jela',
    'Experiences': 'Doživljaji', 'Classes, markets, viewpoints, evenings out': 'Tečajevi, tržnice, vidikovci, večeri',
    'Agencies and guides': 'Agencije i vodiči', 'Tourist offices and trusted tours': 'Turistički uredi i provjerene ture',
    'When to go': 'Kada ići', 'Best season and a tip': 'Najbolje doba i savjet', 'Where it is': 'Gdje se nalazi',
    'More in': 'Još iz zemlje:', 'Where to see or learn it': 'Gdje vidjeti ili naučiti',
    'Where to eat': 'Gdje jesti', 'Restaurants in the center and the Michelin Guide': 'Restorani u središtu i Michelinov vodič',
    'Looking for restaurants in the center…': 'Tražim restorane u središtu…', 'local cuisine': 'domaća kuhinja',
    'Restaurants in the center that have their own website. The list comes from OpenStreetMap and has no ratings, so treat it as a starting point and open the Michelin Guide for proven picks.': 'Restorani u središtu sa službenim stranicama. Popis dolazi s OpenStreetMapa i nema ocjena, pa ga uzmite kao polazište, a za provjerene preporuke otvorite Michelinov vodič.',
    'No restaurants with their own website are listed for this place.': 'Za ovo mjesto nema popisa restorana sa službenim stranicama.',
    'This country is not written yet.': 'Ova zemlja još nije napisana.', 'Back to home': 'Natrag na početnu',
    'This guide is not written yet.': 'Ovaj vodič još nije napisan.',
    // search
    'In our': 'U našem', 'guide': 'vodiču', 'Not in the guide yet': 'Još nije u vodiču',
    'We have not written about this place yet. Below you will find the map, the closest places the guide does cover, and nearby sights with their official sites.': 'Za ovo mjesto još nemamo vlastiti tekst. Dolje su karta, najbliža mjesta koja vodič već opisuje i znamenitosti u okolici s njihovim službenim stranicama.',
    'Looking for sights nearby…': 'Tražim znamenitosti u okolici…', 'Did you': 'Možda ste', 'mean': 'mislile',
    'Closest in the': 'Najbliže u', 'nearby': 'u okolici',
    'Search is unavailable right now. Check your connection and try again.': 'Pretraga trenutačno nije dostupna. Provjerite internetsku vezu i pokušajte ponovno.',
    'Type any city or country in the world.': 'Upišite bilo koji grad ili zemlju na svijetu.',
    'Any city or country in the world': 'Bilo koji grad ili zemlja na svijetu',
    'Museum': 'Muzej', 'Gallery': 'Galerija', 'Sight': 'Znamenitost', 'Viewpoint': 'Vidikovac', 'Artwork': 'Umjetničko djelo',
    'Castle': 'Dvorac', 'Monument': 'Spomenik', 'Memorial': 'Spomen-obilježje', 'Ruins': 'Ruševine', 'Archaeological site': 'Arheološko nalazište',
    'Church': 'Crkva', 'Cathedral': 'Katedrala', 'Monastery': 'Samostan', 'Fort': 'Utvrda', 'City gate': 'Gradska vrata', 'Tower': 'Kula',
    'Palace': 'Palača', 'Manor': 'Dvorac', 'Historic building': 'Povijesna građevina', 'Fountain': 'Fontana', 'Bridge': 'Most', 'Tomb': 'Grobnica',
    'Mosque': 'Džamija', 'Temple': 'Hram', 'City walls': 'Gradske zidine', 'Shrine': 'Kapelica', 'Aqueduct': 'Akvadukt', 'Historic site': 'Povijesno mjesto',
    // our trips
    'Countries I have been to': 'Zemlje u kojima sam bila', 'Anja’s': 'Anjin', 'world': 'svijet', 'Anja’s world': 'Anjin svijet',
    'Every country I have set foot in myself, colored in on one map.': 'Svaka zemlja u koju sam sama kročila, obojena na jednoj karti.',
    'of the world': 'svijeta', 'regions': 'regija', 'still to go': 'još čeka', 'Visited': 'Posjećeno', 'Lived in': 'Živjela', 'Home': 'Dom',
    'Open the guide': 'Otvori vodič', 'No guide needed, this one is home.': 'Vodič ne treba, ovo je dom.',
    'Travel log': 'Dnevnik', 'trips done': 'putovanja iza nas', 'countries': 'zemalja', 'places': 'mjesta', 'planned': 'u planu', 'Done': 'Iza nas',
    'No trips here yet. As soon as we add them they will show on the map in this color.': 'Ovdje još nema putovanja. Čim ih dodamo, pojavit će se na karti u ovoj boji.',
    'Diana and Anja': 'Diana i Anja', 'Drake and Anja': 'Drake i Anja', 'Croatian family trips': 'Obiteljska putovanja u Hrvatskoj',
    'American family trips': 'Obiteljska putovanja u SAD-u', 'Solo trips': 'Solo putovanja',
    'Our yearly trip, just the two of us.': 'Naše godišnje putovanje udvoje.', 'Trips around Croatia and beyond.': 'Putovanja po Hrvatskoj i dalje.',
    'With the family in Croatia.': 'S obitelji u Hrvatskoj.', 'With the family in the USA.': 'S obitelji u SAD-u.',
    'When Anja travels on her own.': 'Kad Anja putuje sama.', 'A girls’ surf trip.': 'Žensko surferska ekipa na valovima.',
    'We walked all of it. Now we can finally read what we were looking at.': 'Prošetale smo ga cijelog, a sad napokon možemo pročitati što smo gledale.',
    'Next up: white towns, trulli and the cooking of the south.': 'Sljedeće na redu: bijeli gradovi, trulli i kuhinja juga.', 'A guided trip.': 'Putovanje s vodičem.',
    'Tanzania': 'Tanzanija', 'Morocco': 'Maroko', 'Austria': 'Austrija', 'Bosnia and Herzegovina': 'Bosna i Hercegovina', 'Croatia': 'Hrvatska',
    'France': 'Francuska', 'Greece': 'Grčka', 'Ireland': 'Irska', 'Serbia': 'Srbija', 'Slovenia': 'Slovenija', 'Spain': 'Španjolska',
    'Czech Republic': 'Češka', 'Turkey': 'Turska', 'USA': 'SAD', 'Maldives': 'Maldivi', 'Rome': 'Rim',
    // Apulia deep guide
    'Places': 'Mjesta', 'Food': 'Hrana', 'Culture': 'Kultura', 'If you want': 'Ako želiš', 'More': 'Još', 'History': 'Povijest', 'Phrasebook': 'Rječnik',
    'What we are looking at and why it matters': 'Što gledamo i zašto je važno', 'What people eat here and where': 'Što se ovdje jede i gdje',
    'Dance, festivals, daily life': 'Ples, fešte, život', 'The stories behind the customs': 'Priče iza običaja',
    'Where to go for each experience': 'Kamo po koji doživljaj', '3,000 years': '3000 godina', 'Everyone who passed through': 'Tko je sve ovuda prošao',
    'Italian': 'Talijanski', 'Trip log': 'Dnevnik puta', 'In short': 'Ukratko', 'Seen': 'Viđeno', 'Tasted': 'Kušano',
    'What are we looking at? Try Santa Croce': 'Što gledamo? Npr. Santa Croce',
    'Nothing by that name. Try a shorter word or the Italian name.': 'Ništa pod tim imenom. Pokušajte kraće ili na talijanskom.',
    'Open the place you are in and read as you walk. Every sight has its story and small details worth looking for.': 'Otvorite mjesto u kojem ste i čitajte dok hodate. Svaka znamenitost ima svoju priču i sitnice koje vrijedi potražiti.',
    '← All places': '← Sva mjesta', 'What we are looking at': 'Što gledamo', 'Look for': 'Potražite', 'Mark as seen': 'Označi kao viđeno',
    'Legends and curiosities': 'Legende i zanimljivosti', 'The Croatian connection': 'Veza s Hrvatskom', 'What to eat here': 'Što ovdje jesti',
    'Good to know': 'Dobro je znati', 'Where to try it': 'Gdje kušati', 'Mark as tasted': 'Označi kao kušano', 'At the table': 'Za stolom',
    'Pick what you feel like doing today and see where to go for it.': 'Odaberite što vam se danas radi, a ovdje piše kamo po to.',
    'Transport, money and habits worth knowing before you go.': 'Prijevoz, novac i navike koje vrijedi znati prije polaska.',
    'Before you go': 'Prije polaska', 'Transport, money, habits': 'Prijevoz, novac, navike', 'Checked': 'Provjereno', 'Where all this comes from': 'Odakle sve ovo znamo',
    'The content was checked against official sites and writers who know this region well. Prices and opening hours change, so it is always worth one more look before you go.': 'Sadržaj je provjeren na službenim stranicama i kod autora koji ovaj kraj dobro poznaju. Cijene i radna vremena mijenjaju se, pa ih uvijek vrijedi još jednom pogledati prije odlaska.'
  };
  // Patterns with a changing part
  var RX = [
    [/^(\d+) places$/, '$1 mjesta'], [/^(\d+) countries$/, '$1 zemalja'], [/^(\d+) country$/, '$1 zemlja'],
    [/^(\d+) trips$/, '$1 putovanja'], [/^(\d+) trip$/, '$1 putovanje'], [/^of (\d+) countries$/, 'od $1 zemalja'],
    [/^(\d+) dishes and drinks$/, '$1 jela i pića'], [/^(\d+) ideas$/, '$1 ideja'],
    [/^Typical of (.+)$/, 'Tipično za: $1'], [/^From around (.+)$/, 'Iz cijele zemlje: $1'], [/^What to eat in (.+)$/, 'Što se jede: $1'],
    [/^Traditional dishes and drinks: (.+)$/, 'Tradicionalna jela i pića: $1'], [/^Open the guide: (.+)$/, 'Otvori vodič: $1'],
    [/^Michelin Guide: (.+)$/, 'Michelinov vodič: $1'], [/^Look up “(.+)”$/, 'Potraži „$1“'], [/^Looking for “(.+)”…$/, 'Tražim „$1“…'],
    [/^Nothing found for “(.+)”\. Try another spelling\.$/, 'Za „$1“ nema rezultata. Pokušajte s drugim nazivom.'],
    [/^Say it: (.+)$/, 'Čita se: $1'], [/^Seen (\d+) of (\d+)$/, 'Viđeno $1 od $2'], [/^(Seen|Tasted): (\d+) of (\d+)$/, function (m, a, b, c) { return (a === 'Seen' ? 'Viđeno' : 'Kušano') + ': ' + b + ' od ' + c; }],
    [/^Every sight and every dish has a button to tick it off\. Out of (\d+) sights and (\d+) flavors, how many will you collect\?$/, 'Uz svaku znamenitost i svako jelo nalazi se gumb kojim ih možete označiti. Od $1 znamenitosti i $2 okusa, koliko ćete ih skupiti?']
  ];

  function one(s) {
    if (D[s]) return D[s];
    for (var i = 0; i < RX.length; i++) if (RX[i][0].test(s)) return s.replace(RX[i][0], RX[i][1]);
    return null;
  }
  // Translate one short piece of interface text; returns null when it is not interface text.
  function tr(text) {
    var m = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
    var core = m[2];
    if (!core || core.length > 220) return null;
    var tail = '';
    var a = core.match(/^(.*?)(\s*[↗→])$/);
    if (a) { core = a[1]; tail = a[2]; }
    var hit = one(core);
    if (!hit && core.indexOf(' · ') > -1) {
      var any = false;
      hit = core.split(' · ').map(function (p) { var t = one(p); if (t) any = true; return t || p; }).join(' · ');
      if (!any) hit = null;
    }
    return hit ? m[1] + hit + tail + m[3] : null;
  }
  window.TR = function (s) { return lang === 'hr' ? (one(s) || s) : s; };

  function walk(node) {
    if (node.nodeType === 3) {
      var t = tr(node.nodeValue);
      if (t !== null && t !== node.nodeValue) node.nodeValue = t;
      return;
    }
    if (node.nodeType !== 1 || /^(SCRIPT|STYLE|CANVAS|SVG)$/i.test(node.tagName)) return;
    ['placeholder', 'aria-label'].forEach(function (attr) {
      var v = node.getAttribute && node.getAttribute(attr);
      if (v) { var t = tr(v); if (t) node.setAttribute(attr, t); }
    });
    for (var c = node.firstChild; c; c = c.nextSibling) walk(c);
  }

  function addSwitch() {
    var nav = document.querySelector('.site-head nav');
    if (!nav || nav.querySelector('.lang')) return;
    var a = document.createElement('a');
    a.href = '#'; a.className = 'lang';
    a.textContent = lang === 'hr' ? 'EN' : 'HR';
    a.title = lang === 'hr' ? 'Switch to English' : 'Prebaci na hrvatski';
    a.addEventListener('click', function (e) {
      e.preventDefault();
      try { localStorage.setItem('lang', lang === 'hr' ? 'en' : 'hr'); } catch (err) {}
      location.reload();
    });
    nav.appendChild(a);
  }

  function start() {
    addSwitch();
    if (lang !== 'hr') return;
    walk(document.body);
    new MutationObserver(function (list) {
      list.forEach(function (m) {
        if (m.type === 'characterData') { walk(m.target); return; }
        m.addedNodes.forEach(walk);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
