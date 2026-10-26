const kaupunki = "Helsinki";
const leveysaste = 60.17;
const pituusaste = 24.94;

try {
  const osoite = `https://api.open-meteo.com/v1/forecast?latitude=${leveysaste}&longitude=${pituusaste}&current=temperature_2m`;
  const vastaus = await fetch(osoite);

  if (!vastaus.ok) {
    throw new Error(`Palvelin palautti virheen: ${vastaus.status}`);
  }

  const data = await vastaus.json();
  const lampotila = data.current.temperature_2m;
  const yksikko = data.current_units.temperature_2m;

  console.log(`${kaupunki}: ${lampotila} ${yksikko}`);
} catch (virhe) {
  console.error("Virhe:", virhe.message);
}
