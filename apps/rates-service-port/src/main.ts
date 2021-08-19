import { getFirestore, init, Timestamp } from '@thecointech/firestore';
import fs from 'fs';

async function initialize() {
  if (process.env.BROKER_SERVICE_ACCOUNT)
    process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.RATES_SERVICE_ACCOUNT;
  await init();
}

type Coin = {
  ValidFrom: number,
  Buy: number,
  Sell: number,
  ValidUntil: number,
}
type FxRate = {
  ValidFrom: number,
  Rate: number,
  ValidUntil: number,
}

function fixRates(rates: (Coin|FxRate)[]) {
  rates.sort((l, r) => l.ValidUntil - r.ValidUntil);
  let lastValidUntil = rates[0].ValidFrom;
  const filtered: (Coin|FxRate)[] = [];
  for (let i = 0; i < rates.length; i++) {
    const r = {...rates[i]};
    // If our validity ends before the last entry is completed, skip
    if (r.ValidUntil <= lastValidUntil) {
      const lastr = rates[i-1];
      console.log(`Dropping item: \n\t${new Date(lastr.ValidFrom)} -> ${new Date(lastr.ValidUntil)}\n\t${new Date(r.ValidFrom)} -> ${new Date(r.ValidUntil)}`)
      continue;
    }
    // Do not start before the last one ends
    if (r.ValidFrom < lastValidUntil)
      r.ValidFrom = lastValidUntil;
    filtered.push(r)
    lastValidUntil = r.ValidUntil;
  }
  console.log(`Dropped ${rates.length - filtered.length} entries from ${rates.length}`);

  // Double check validity
  lastValidUntil = rates[0].ValidFrom;
  for (const r of filtered) {
    if (lastValidUntil != r.ValidFrom)
      console.error(`Gap found: (${lastValidUntil} - ${new Date(lastValidUntil)} -> ${new Date(r.ValidFrom)}`);
    lastValidUntil = r.ValidUntil;
  }
  return filtered;
}

async function processCoin(coins: Coin[]) {
  const db = getFirestore();
  for (let i = 0; i < coins.length; i++) {
    if (i % 100 == 0) {
      console.log(`Processing coin ${i} of ${coins.length}`)
    }
    const coin = coins[i];
    const doc = db.doc(`Coin/${coin.ValidFrom}`)
    const dbc = await doc.get();

    if (!dbc.exists) {
      await doc.set({
        sell: coin.Sell,
        buy: coin.Buy,
        validFrom: Timestamp.fromMillis(coin.ValidFrom),
        validTill: Timestamp.fromMillis(coin.ValidUntil),
      })
    }
  }
}

async function processRates(rates: FxRate[]) {
  const db = getFirestore();
  for (let i = 0; i < rates.length; i++) {
    if (i % 100 == 0) {
      console.log(`Processing FX ${i} of ${rates.length}`)
    }
    const fx = rates[i];
    const doc = db.doc(`FxRates/${fx.ValidFrom}`);
    const dbc = await doc.get();

    if (!dbc.exists) {
      await doc.set({
        124: fx.Rate,
        validFrom: Timestamp.fromMillis(fx.ValidFrom),
        validTill: Timestamp.fromMillis(fx.ValidUntil),
      })
    }
  }
}


async function updateFirestore() {
  const cache = JSON.parse(fs.readFileSync(`/src/TheCoin/secrets/UserData/rates.cache`, 'utf8'));
  await initialize();

  const coin = fixRates(cache.coin) as any;
  const fxrates = fixRates(cache.fxrates) as any;

  await processCoin(coin);
  await processRates(fxrates);
}

updateFirestore();

