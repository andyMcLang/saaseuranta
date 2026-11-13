// fetchWeather.js
// Hakee Helsingin nykyisen lämpötilan Open-Meteo-rajapinnasta ja tulostaa sen.
// Aja projektin juuressa: npm run fetch
//
// Open-Meteo on ilmainen eikä vaadi API-avainta.
// Dokumentaatio: https://open-meteo.com/en/docs

// --- 1. Kaupungin tiedot ---
// Open-Meteo tunnistaa paikan koordinaateista, ei kaupungin nimestä.
// Nimi on vain tulostusta varten.
const kaupunki = "Helsinki";
const koordinaatit = { lat: 60.1699, lon: 24.9384 };

// --- 2. Pyynnön osoite ---
// Template literal (`...`) upottaa muuttujat merkinnällä ${...}.
// ? aloittaa parametrit ja & erottaa ne toisistaan. Parametrit:
//   latitude / longitude  = leveys- ja pituusaste
//   current=temperature_2m = nykyinen lämpötila 2 metrin korkeudelta
//   timezone=Europe%2FHelsinki = ajat Suomen aikana (%2F on URL-koodattu /-merkki).
//                                Ilman tätä ajat tulisivat GMT-aikana.
// Vinkki: kopioi osoite selaimeen, niin näet vastauksen JSON-rakenteen.
const osoite = `https://api.open-meteo.com/v1/forecast?latitude=${koordinaatit.lat}&longitude=${koordinaatit.lon}&current=temperature_2m&timezone=Europe%2FHelsinki`;

console.log(`Haetaan säätietoja: ${kaupunki}`);

// --- 3. Haku ja virheenkäsittely ---
// fetch ja .json() ovat hitaita (verkko), joten ne palauttavat lupauksen (Promise).
// await odottaa tuloksen. Ylimmällä tasolla await toimii, koska package.json:ssa
// on "type": "module".
//
// Virheitä on kahdenlaisia:
//   1. Verkkovirhe (väärä palvelin, ei nettiä): fetch heittää virheen itse
//      ja suoritus hyppää catch-lohkoon. Viesti: "fetch failed".
//   2. Palvelin vastaa virhekoodilla (esim. 400 = väärä parametri):
//      fetch EI heitä virhettä, joten se pitää tarkistaa itse response.ok:lla.
try {
  const vastaus = await fetch(osoite);

  // ok on true, kun tilakoodi on 200–299. Muuten heitetään oma virhe,
  // ja throw hyppää suoraan catch-lohkoon. Tarkistus tehdään ennen .json():ia.
  if (!vastaus.ok) {
    throw new Error(`Palvelin palautti virheen: ${vastaus.status}`);
  }

  // Muuttaa vastauksen tekstin JavaScript-olioksi.
  const data = await vastaus.json();

  // Vianetsintä: jos jokin arvo on undefined, kentän nimi tai polku on väärin.
  // Poista kommentti seuraavan rivin alusta, niin näet koko vastauksen:
  // console.log(data);

  // Vastauksen rakenne (lyhennettynä):
  // {
  //   current_units: { time: "iso8601", temperature_2m: "°C" },  ← yksiköt
  //   current:       { time: "2026-11-13T19:15", temperature_2m: 4.7 } ← arvot
  // }
  // Arvo ja sen yksikkö löytyvät samalla kentän nimellä eri olioista.
  const lampotila = data.current.temperature_2m;
  const yksikko = data.current_units.temperature_2m;

  // Aika tulee ISO 8601 -muodossa ("2026-11-13T19:15", T erottaa päivän ja kellonajan).
  // new Date() muuttaa sen päivämääräolioksi, ja toLocaleString muotoilee sen
  // suomalaisittain, esim. "13.11.2026 klo 19.15".
  const paivitetty = new Date(data.current.time);
  const paivitettyMuotoiltu = paivitetty.toLocaleString("fi-FI", {
    dateStyle: "short",
    timeStyle: "short",
  });

  console.log("================================");
  console.log(`${kaupunki}: ${lampotila} ${yksikko}`);
  console.log(`Päivitetty: ${paivitettyMuotoiltu}`);
  console.log("================================");
} catch (virhe) {
  // virhe.message on pelkkä viesti. Koko virhe-olio tulostaisi myös pitkän virhepinon.
  console.error("Virhe haettaessa säätietoja:", virhe.message);
}
