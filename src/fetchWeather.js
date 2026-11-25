// fetchWeather.js
// Hakee usean kaupungin nykyisen lämpötilan ja kolmen päivän ennusteen
// Open-Meteo-rajapinnasta ja tulostaa ne.
// Aja projektin juuressa: npm run fetch
//
// Open-Meteo on ilmainen eikä vaadi API-avainta.
// Dokumentaatio: https://open-meteo.com/en/docs
//
// Kulku lyhyesti:
//   1. kaupunkilista
//   2. haeSaa(kaupunki) hakee yhden kaupungin sään
//   3. Promise.all ajaa kaikki haut samanaikaisesti ja odottaa, että ne ovat valmiita
//   4. tulokset tulostetaan listan järjestyksessä

// --- 1. Kaupunkien tiedot ---
// Taulukko (array, [ ]) olioita ({ }): jokainen olio on yksi kaupunki.
// Open-Meteo tunnistaa paikan koordinaateista (lat = leveysaste, lon = pituusaste),
// ei kaupungin nimestä. Nimi on vain tulostusta varten.
// Uuden kaupungin saa mukaan lisäämällä listaan rivin.
const kaupungit = [
  { nimi: "Helsinki", lat: 60.1699, lon: 24.9384 },
  { nimi: "Tampere", lat: 61.4981, lon: 23.76 },
  { nimi: "Turku", lat: 60.4518, lon: 22.2666 },
  { nimi: "Oulu", lat: 65.0121, lon: 25.4651 },
  { nimi: "Rovaniemi", lat: 66.5039, lon: 25.7294 },
];

// --- 2. Yhden kaupungin haku ---
// async-funktio palauttaa aina lupauksen (Promise), ja sen sisällä voi käyttää awaitia.
// Funktio palauttaa olion:
//   onnistui: { nimi, lampotila, yksikko, paivitetty, ennuste: { paivat, max, min } }
//   epäonnistui: { nimi, virheviesti }
// Virhe otetaan kiinni tässä funktiossa eikä heitetä eteenpäin. Siksi yksi epäonnistunut
// kaupunki ei kaada muita (ks. kohta 3).
async function haeSaa(kaupunki) {
  // Osoitteen parametrit (? aloittaa, & erottaa):
  //   latitude / longitude   = leveys- ja pituusaste
  //   current=temperature_2m = nykyinen lämpötila 2 metrin korkeudelta
  //   daily=temperature_2m_max,temperature_2m_min = päivän ylin ja alin lämpötila
  //                            (useampi arvo samaan parametriin pilkuilla, ei välilyöntejä)
  //   forecast_days=3          = ennuste kolmelle päivälle (tämä päivä mukaan lukien, oletus 7)
  //   timezone=Europe/Helsinki = ajat Suomen aikana. Ilman tätä ajat tulisivat GMT-aikana.
  // Parametrien järjestyksellä ei ole väliä.
  // Vinkki: kopioi osoite selaimeen, niin näet vastauksen JSON-rakenteen.
  const osoite = `https://api.open-meteo.com/v1/forecast?latitude=${kaupunki.lat}&longitude=${kaupunki.lon}&current=temperature_2m&daily=temperature_2m_max,temperature_2m_min&forecast_days=3&timezone=Europe/Helsinki`;

  // Virheitä on kahdenlaisia:
  //   1. Verkkovirhe (väärä palvelin, ei nettiä): fetch heittää virheen itse
  //      ja suoritus hyppää catch-lohkoon. Viesti: "fetch failed".
  //   2. Palvelin vastaa virhekoodilla (esim. 400 = väärä parametri):
  //      fetch EI heitä virhettä, joten se tarkistetaan itse vastaus.ok:lla.
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
    //   current_units: { time: "iso8601", temperature_2m: "°C" },          ← yksiköt
    //   current:       { time: "2026-11-16T21:00", temperature_2m: 5.5 }   ← arvot
    //   daily: {                                                            ← ennuste
    //     time:               ["2026-11-25", "2026-11-26", "2026-11-27"],
    //     temperature_2m_max: [1.5, 0.0, -1.2],
    //     temperature_2m_min: [-0.8, -3.1, -4.1]
    //   }
    // }
    // current: arvo ja sen yksikkö löytyvät samalla kentän nimellä eri olioista.
    // daily: jokainen kenttä on TAULUKKO, ja taulukot kuuluvat yhteen saman indeksin kautta:
    //   [0] = tänään, [1] = huomenna, [2] = ylihuomenna.
    //   Esim. time[1], temperature_2m_min[1] ja temperature_2m_max[1] ovat kaikki huomista.
    //
    // ennuste on sisäkkäinen olio (olio olion sisällä), jotta ennusteen tiedot pysyvät
    // koossa yhden kentän alla. paivat on monikko, koska se sisältää kaikki päivät (taulukko).
    return {
      nimi: kaupunki.nimi,
      lampotila: data.current.temperature_2m,
      yksikko: data.current_units.temperature_2m,
      paivitetty: data.current.time,
      ennuste: {
        paivat: data.daily.time,
        max: data.daily.temperature_2m_max,
        min: data.daily.temperature_2m_min,
      },
    };
  } catch (virhe) {
    // Kaksi eri asiaa, siksi eri nimet:
    //   virhe       = catch-MUUTTUJA (virheolio). On olemassa vain tämän lohkon sisällä.
    //   virheviesti = palautettavan OLION KENTTÄ. Kulkee olion mukana ulos funktiosta.
    // Viesti kopioidaan muuttujasta olion kenttään, ja return lähettää olion ulos.
    // Silmukka (kohta 4) lukee sitten olion kenttää tulos.virheviesti, ei tätä muuttujaa.
    // virhe.message on pelkkä viesti. Koko virheolio sisältäisi myös pitkän virhepinon.
    return { nimi: kaupunki.nimi, virheviesti: virhe.message };
  }
}

// --- 3. Kaikki haut samanaikaisesti: Promise.all ---
// kaupungit.map(haeSaa) kutsuu haeSaa-funktiota jokaiselle kaupungille HETI.
// Tuloksena on taulukko lupauksia, ja kaikki viisi hakua ovat käynnissä yhtä aikaa.
//
// Promise.all(lupaukset) odottaa, että KAIKKI lupaukset ovat valmiita, ja antaa
// tulokset taulukkona SAMASSA JÄRJESTYKSESSÄ kuin lista, vaikka vastaukset saapuisivat
// eri järjestyksessä. tulokset[0] on siis aina Helsinki.
//
// Ero for...of + await -silmukkaan:
//   silmukka:    Helsinki → odota → Tampere → odota → ...  (aika = kaikkien hakujen summa)
//   Promise.all: kaikki yhtä aikaa                          (aika = hitaimman haun kesto)
//
// Tärkeää: Promise.all hylkää koko tuloksen, jos YKSIKIN lupaus epäonnistuu.
// Siksi haeSaa ottaa virheensä itse kiinni ja palauttaa { nimi, virheviesti }.
// Vaihtoehto: Promise.allSettled ei koskaan hylkää, vaan kertoo jokaisesta
// lupauksesta erikseen, onnistuiko se ("fulfilled") vai epäonnistuiko ("rejected").
console.log(`Haetaan säätietoja: ${kaupungit.map((k) => k.nimi).join(", ")}\n`);

const tulokset = await Promise.all(kaupungit.map(haeSaa));

// --- 4. Tulostus ---
// Tulostus tehdään vasta, kun kaikki haut ovat valmiita, joten järjestys pysyy samana.
for (const tulos of tulokset) {
  // tulos on haeSaa:n palauttama olio. Jos siinä on kenttä virheviesti, haku epäonnistui.
  // Onnistuneessa oliossa kenttää ei ole, jolloin tulos.virheviesti on undefined
  // ja if tulkitsee sen epätodeksi.
  if (tulos.virheviesti) {
    console.error(
      `Virhe haettaessa säätietoja (${tulos.nimi}): ${tulos.virheviesti}`,
    );
    continue; // continue hyppää silmukan seuraavaan kierrokseen
  }

  // Aika tulee ISO 8601 -muodossa ("2026-11-16T21:00", T erottaa päivän ja kellonajan).
  // new Date() muuttaa sen päivämääräolioksi, ja toLocaleString muotoilee sen
  // suomalaisittain, esim. "16.11.2026 klo 21.00".
  const paivitettyMuotoiltu = new Date(tulos.paivitetty).toLocaleString(
    "fi-FI",
    {
      dateStyle: "short",
      timeStyle: "short",
    },
  );

  console.log(`${tulos.nimi}: ${tulos.lampotila} ${tulos.yksikko}`);
  console.log(`Päivitetty: ${paivitettyMuotoiltu}`);
  // Otsikko ennen silmukkaa, jotta se tulostuu vain kerran.
  console.log("Kolmen päivän ennuste:");

  // Silmukka silmukassa: ulompi (for...of) käy läpi kaupungit, tämä sisempi
  // käy läpi yhden kaupungin ennustepäivät.
  // Tavallinen for-silmukka, koska tarvitaan indeksi i:
  //   let i = 0       aloitus: i on ensin 0
  //   i < ...length   jatketaan niin kauan kuin päiviä riittää (3 päivää → i = 0, 1, 2)
  //   i++             i kasvaa yhdellä joka kierroksella
  // Samalla i:llä luetaan kaikista kolmesta taulukosta saman päivän arvo.
  // Huom: paivat (kenttä) = kaikki päivät taulukkona, paiva (muuttuja) = yksi muotoiltu päivä.
  for (let i = 0; i < tulos.ennuste.paivat.length; i++) {
    // toLocaleDateString muotoilee pelkän päivämäärän, esim. "25.11.2026".
    const paiva = new Date(tulos.ennuste.paivat[i]).toLocaleDateString(
      "fi-FI",
      {
        dateStyle: "short",
      },
    );
    // Väli kirjoitetaan pienimmästä suurimpaan: min ... max
    console.log(
      `  ${paiva}: ${tulos.ennuste.min[i]} ... ${tulos.ennuste.max[i]} ${tulos.yksikko}`,
    );
  }

  console.log("================================");
}
