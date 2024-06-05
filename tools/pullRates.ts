import { getFirestore, init } from '@thecointech/firestore';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { DateTime } from 'luxon';
import { exit } from 'process';
import { log } from '@thecointech/logging';

// This file pulls data from our Firestore
// It is called at the start of a devlive session
// to optionally seed the session with accurate
// historical data.

// If we don't have access to the Firestore, fuggetaboutit
if (!process.env.RATES_SERVICE_ACCOUNT) {
  log.fatal('Requires rates firestore access config');
  exit(0)
}
process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.RATES_SERVICE_ACCOUNT;

// Write our output to the 'data' folder
const outFolder = new URL("../data/", import.meta.url);
const outFile = new URL("rates.json", outFolder);

// We only fetch the last 14 months
// let start = DateTime.now().minus({ months: 14});
let start = DateTime.fromObject({year: 2023});

let existing: any = null;
if (!existsSync(outFolder)) {
  mkdirSync(outFolder);
} else {
  // If this file already exists, then only update with newer data
  if (existsSync(outFile)) {
    const fileRaw = await readFileSync(outFile, 'utf8');
    existing = JSON.parse(fileRaw);
    if (existing.rates) {
      // get the last valid timestamp
      const lastRate = existing.rates.slice(-1)[0];
      if (lastRate?.to) {
        const lastTs = DateTime.fromMillis(lastRate.to);
        if (lastTs.isValid) {
          const daysDiff = DateTime.now().diff(lastTs).as("days");
          if (daysDiff < 1) {
            log.debug(`Skipping update of cached rates`);
            exit(0);
          }
        }
        // Else, we only query new dates
        log.debug(`Updating from ${lastTs.toSQLDate()}`);
        start = lastTs;
      }
    }
  }
}

const firestore = await init();
if (!firestore) throw new Error('Requires firestore');

function validateTimes(rates: any[]) {
  let t = rates[0].validTill;
  for (const r of rates) {
    if (!r.validFrom.isEqual(t)) {
      const msg = `Input Rates are not contiguous: ${r.validFrom.toDate()} != ${t.toDate()}`;
      log.warn(msg);
    }
    t = r.validTill;
  }
}


const db = getFirestore();
const coinsRaw = await db.collection("Coin")
  .where("validTill", ">", start.toJSDate())
  .get();
const coins = coinsRaw.docs.map(d => d.data());
log.trace('Testing Coin');
validateTimes(coins);
log.trace('Testing Fx');
const fxsRaw = await db.collection("FxRates")
  .where("validTill", ">", start.toJSDate())
  .get()
const fxs = fxsRaw.docs.map(d => d.data());
// validateTimes(fxs);

const initTime = coins[0].validFrom.toMillis();
const blockTime = 3 * 60 * 60 * 1000; // How long each
// merge both data streams into one
const rates: { from: number, to: number, rate: number }[] = existing?.rates ?? [];
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

    const from = coin.validFrom.toMillis();
    const to = coin.validTill.toMillis();
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

    if (coin.validTill.toMillis() == to) coinIdx++;
    if (fx.validTill.toMillis() == to) fxIdx++;
  }


  writeFileSync(outFile, JSON.stringify({
    initial: initTime,
    rates
  }))
}

await pullRates();
