// Travel log. Each trip belongs to one group and lists its places with coordinates.
// status: "bili" (done) or "plan" (still to come). "vodic" links to our guide when one exists.
window.PUTOVANJA = {
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
