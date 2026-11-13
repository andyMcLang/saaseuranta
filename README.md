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
npm run fetch   # hakee Helsingin nykyisen lämpötilan ja tulostaa sen
```

Esimerkkituloste:

```
Haetaan säätietoja: Helsinki
================================
Helsinki: 4.7 °C
Päivitetty: 13.11.2026 klo 19.15
================================
```

## Eteneminen

- [x] `src/fetchWeather.js`: Helsingin nykyinen lämpötila
- [ ] Useampi kaupunki ja tallennus JSON-tiedostoon
- [ ] Express-rajapinta
- [ ] Käyttöliittymä
- [ ] Supertest- ja Playwright-testit
- [ ] GitHub Actions -CI
