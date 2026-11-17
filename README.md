# saaseuranta

Node.js-harjoitusprojekti: hakee usean kaupungin sääennusteen [Open-Meteo](https://open-meteo.com/)-rajapinnasta (ei API-avainta), tallentaa sen JSON-tiedostoon ja tarjoaa sen myöhemmin Express-rajapinnan ja yksinkertaisen käyttöliittymän kautta.

## Kansiorakenne

| Kansio | Tarkoitus |
| --- | --- |
| `src/` | Sovelluksen koodi (säänhaku, myöhemmin Express-palvelin) |
| `data/` | Haettu säädata JSON-tiedostoina |
| `public/` | Käyttöliittymän staattiset tiedostot |
| `tests/api/` | Supertest-rajapintatestit |
| `tests/e2e/` | Playwright-käyttöliittymätestit |
| `.github/workflows/` | GitHub Actions -CI |

## Vaatimukset

- Node.js 20 tai uudempi

## Käyttö

```bash
npm run fetch   # hakee kaupunkien nykyiset lämpötilat ja tulostaa ne
```

Kaupungit (Helsinki, Tampere, Turku, Oulu, Rovaniemi) haetaan samanaikaisesti `Promise.all`illa. Jos yhden kaupungin haku epäonnistuu, muut tulostuvat silti.

Esimerkkituloste:

```
Haetaan säätietoja: Helsinki, Tampere, Turku, Oulu, Rovaniemi

Helsinki: 5.5 °C
Päivitetty: 16.11.2026 klo 21.15
================================
Tampere: 4.9 °C
Päivitetty: 16.11.2026 klo 21.15
================================
...
```

## Eteneminen

- [x] `src/fetchWeather.js`: Helsingin nykyinen lämpötila
- [x] Useampi kaupunki (haku samanaikaisesti `Promise.all`illa)
- [ ] Sääennuste (`daily` tai `hourly`)
- [ ] Tallennus JSON-tiedostoon
- [ ] Express-rajapinta
- [ ] Käyttöliittymä
- [ ] Supertest- ja Playwright-testit
- [ ] GitHub Actions -CI

## Testaussuunnitelma ja Laadunvarmistus (QA)

Tämä projekti toimii testiautomaation ja laadunvarmistuksen portfoliona. Sovelluksen arkkitehtuuri on suunniteltu siten, että sitä voidaan testata kattavasti eri tasoilla.

### 1. Tunnistetut riskit (Risk-based testing)
- Ulkoinen riippuvuus: Open-Meteo API saattaa olla alhaalla tai vastata hitaasti.
- Datan eheyden muuttuminen: Rajapinnan palauttama JSON-rakenne voi muuttua.
- Virheensietokyky: Yhden kaupungin säähaun epäonnistuminen ei saa kaataa koko Node.js-prosessia.

### 2. Verifiointipisteet ja Testitasot
Testiautomaatio toteutetaan CI/CD-putkeen (GitHub Actions) seuraavasti:

**API-testaus (Supertest / Jest):**
- Verifioidaan, että `/api/weather` palauttaa HTTP-statuskoodin `200 OK`.
- Verifioidaan, että palautettu JSON-data vastaa odotettua skeemaa (sisältää kentät kaupungin nimelle ja lämpötilalle).
- Verifioidaan negatiivinen skenaario: Miten rajapinta käyttäytyy, jos Open-Meteo on saavuttamattomissa?

**Käyttöliittymätestaus / E2E (Playwright):**
- Verifioidaan DOM:sta, että haetut kaupungit ja lämpötilat renderöityvät käyttäjälle oikein.
- Suoritetaan visuaalinen ja toiminnallinen feature-testaus selaimessa.

**Tutkiva testaus (Exploratory Testing):**
- Ennen automaation kirjoittamista suoritan sovellukselle aikarajatun tutkivan testauksen (esim. poikkeuksellisten syötteiden tai hitaan verkkoyhteyden simulointi selaintyökaluilla).
