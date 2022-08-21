import { getFirestore, init } from '@thecointech/firestore';
import { writeFileSync } from 'fs';

if (!process.env.RATES_SERVICE_ACCOUNT) throw new Error('Requires rates firestore access config');
process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.RATES_SERVICE_ACCOUNT;
const outFile = new URL("rates.json", import.meta.url);

const firestore = await init();
if (!firestore) throw new Error('Requires firestore');

function validateTimes(rates: any[]) {
  let t = rates[0].validTill;
  for (const r of rates) {
    if (!r.validFrom.isEqual(t)) {
      const msg = `Input Rates are not contiguous: ${r.validFrom.toDate()} != ${t.toDate()}`;
      console.log(msg);
    }
    t = r.validTill;
  }
}

const db = getFirestore();
const coins = (await db.collection("Coin").get()).docs.map(d => d.data());
console.log('Testing Coin');
validateTimes(coins);
console.log('Testing Fx');
const fxs = (await db.collection("FxRates").get()).docs.map(d => d.data());
// validateTimes(fxs);

const initTime = coins[0].validFrom.seconds;
const blockTime = 3 * 60 * 60; // How long each
// merge both data streams into one
const rates: { from: number, to: number, rate: number }[] = [];
let coinIdx = 0;
let fxIdx = 0;
const factor = Math.pow(10, 8);

function findFx(coin: any) {
  for (const fx of fxs) {
    if (fx.validTill > coin.validFrom)
      return fx;
  }
  throw new Error("fuck");
}

async function pullRates() {
  // the fx entries seem to be rather out-of-whack.
  // We will more-or-less ignore them for this project
  // and simply use coin data to demarcate our
  //while (coinIdx < coins.length && fxIdx < fxs.length) {
  // for (const coin of coins) {
  for (let i = 0; i < coins.length; i++) {
    const coin = coins[i];
    const fx = findFx(coin)
    // const from = Math.max(coin.validFrom.seconds, fx.validFrom.seconds);
    // const to = Math.min(coin.validTill.seconds, fx.validTill.seconds);
    const from = coin.validFrom.seconds;
    const to = coin.validTill.seconds;
    const rate = Math.round(factor * ((coin.buy + coin.sell) / 2) * fx["124"]) / factor;

    // Compact any rates that haven't changed.
    const lastRate = rates[rates.length - 1];
    if (rate == lastRate?.rate) {
      lastRate.to = to;
    }
    // compact multiple that are shorter than our offset interval
    else if (lastRate && (to - lastRate.from) <= blockTime) {
      lastRate.to = to;
      // The rate is an approximation for historical times already,
      // so don't worry that this isn't exact.
      lastRate.rate = Math.round((lastRate.rate + rate) / 2);
    }
    else {
      rates.push({
        from,
        to,
        rate,
      });
    }

    if (coin.validTill.seconds == to) coinIdx++;
    if (fx.validTill.seconds == to) fxIdx++;
  }


  writeFileSync(outFile, JSON.stringify({
    initial: initTime,
    rates
  }))
}

await pullRates();
