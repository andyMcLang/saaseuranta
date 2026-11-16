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
