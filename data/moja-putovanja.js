// Dnevnik putovanja. Svako putovanje pripada jednoj skupini i ima popis mjesta s koordinatama.
// status: "bili" (prošlo) ili "plan" (tek slijedi). "vodic" je poveznica na naš vodič, ako postoji.
window.PUTOVANJA = {
  skupine: [
    { id: "mama", ime: "Mama i ja", opis: "Naše godišnje putovanje udvoje." },
    { id: "obitelj", ime: "Obiteljska putovanja", opis: "Kad krenemo u širem sastavu." },
    { id: "udvoje", ime: "Drake i ja", opis: "Putovanja po Hrvatskoj i dalje." },
    { id: "solo", ime: "Solo", opis: "Kad putujem sama." },
    { id: "cesta", ime: "Roadtripovi", opis: "Auto, glazba i karta bez žurbe." }
  ],
  putovanja: [
    {
      skupina: "mama", naslov: "Rim", gdje: "Italija", status: "bili",
      biljeska: "Prošetale smo ga, a sad napokon možemo pročitati što smo gledale.",
      vodic: "zemlja.html?z=italija#/mjesto/rim",
      mjesta: [{ ime: "Rim", c: [41.9028, 12.4964] }]
    },
    {
      skupina: "mama", naslov: "Apulija", gdje: "Italija", status: "plan",
      biljeska: "Sljedeće na redu: bijeli gradovi, trulli i kuhinja juga.",
      vodic: "putovanje.html?p=apulija",
      mjesta: [{ ime: "Bari", c: [41.1171, 16.8719] }]
    },
    {
      skupina: "mama", naslov: "Skandinavija", gdje: "Sjeverna Europa", status: "plan",
      biljeska: "Putovanje s vodičem.",
      vodic: "index.html#k=Europa",
      mjesta: []
    }
  ]
};
