// Travel log. Each trip belongs to one group and lists its places with coordinates.
// status: "bili" (done) or "plan" (still to come). "vodic" links to our guide when one exists.
window.PUTOVANJA = {
  // Anja's world: countries Anja has personally been to (from her Mark O'Travel list).
  // iso = ISO 3166-1 numeric code (used to color the map), vodic = id of our country guide, if we have one.
  svijet: {
    ukupno: 195,
    zemlje: [
      { ime: "Tanzania", iso: "834", dio: "Africa", vodic: "tanzanija" },
      { ime: "Austria", iso: "040", dio: "Europe", vodic: "austrija" },
      { ime: "Bosnia and Herzegovina", iso: "070", dio: "Europe", vodic: "bih" },
      { ime: "Croatia", iso: "191", dio: "Europe", dom: true },
      { ime: "France", iso: "250", dio: "Europe", vodic: "francuska" },
      { ime: "Greece", iso: "300", dio: "Europe", vodic: "grcka" },
      { ime: "Ireland", iso: "372", dio: "Europe", vodic: "irska" },
      { ime: "Italy", iso: "380", dio: "Europe", vodic: "italija" },
      { ime: "Malta", iso: "470", dio: "Europe", vodic: "malta" },
      { ime: "Portugal", iso: "620", dio: "Europe", vodic: "portugal" },
      { ime: "Serbia", iso: "688", dio: "Europe", vodic: "srbija" },
      { ime: "Slovenia", iso: "705", dio: "Europe", vodic: "slovenija" },
      { ime: "Spain", iso: "724", dio: "Europe", vodic: "spanjolska" },
      { ime: "Czech Republic", iso: "203", dio: "Europe", vodic: "ceska" },
      { ime: "Turkey", iso: "792", dio: "Middle East", vodic: "turska" },
      { ime: "USA", iso: "840", dio: "North America", vodic: "sad", zivjela: true },
      { ime: "Maldives", iso: "462", dio: "South Asia", vodic: "maldivi" }
    ]
  },
  skupine: [
    { id: "mama", ime: "Mom and me", opis: "Our yearly trip, just the two of us." },
    { id: "obitelj", ime: "Family trips", opis: "When the wider crew comes along." },
    { id: "udvoje", ime: "Drake and me", opis: "Trips around Croatia and beyond." },
    { id: "solo", ime: "Solo", opis: "When I travel on my own." },
    { id: "cesta", ime: "Road trips", opis: "A car, good music and no rush." }
  ],
  putovanja: [
    {
      skupina: "mama", naslov: "Rome", gdje: "Italy", status: "bili",
      biljeska: "We walked all of it. Now we can finally read what we were looking at.",
      vodic: "zemlja.html?z=italija#/mjesto/rim",
      mjesta: [{ ime: "Rome", c: [41.9028, 12.4964] }]
    },
    {
      skupina: "mama", naslov: "Apulia", gdje: "Italy", status: "plan",
      biljeska: "Next up: white towns, trulli and the cooking of the south.",
      vodic: "putovanje.html?p=apulija",
      mjesta: [{ ime: "Bari", c: [41.1171, 16.8719] }]
    },
    {
      skupina: "mama", naslov: "Scandinavia", gdje: "Northern Europe", status: "plan",
      biljeska: "A guided trip.",
      vodic: "index.html#k=Europe",
      mjesta: []
    }
  ]
};
