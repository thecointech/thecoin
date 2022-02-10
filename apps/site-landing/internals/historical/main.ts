import { updateFxData } from './fetchFx';
import { updateSnPData } from './fetchSnP';

async function updateHistorical() {
  console.log("Updating historical data")
  const r = await Promise.all([
    updateFxData(),
    updateSnPData(),
  ])
  console.log(`Update successful: ${!r.includes(false)}`);
}

updateHistorical();
