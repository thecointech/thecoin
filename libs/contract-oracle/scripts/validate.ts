import { getContract } from '../src';
import { DateTime, Duration } from 'luxon';
import { log } from '@thecointech/logging';
import { fetchRate, weBuyAt, weSellAt } from '@thecointech/fx-rates';
import { getFirestore, Timestamp, init } from '@thecointech/firestore';
import { BigNumber } from 'ethers';
import { updateRates } from '../src/update';

// ----------------------------------------------------------------
// This simple script compares the value stored in Oracle vs
// the value in the database.
const oracle = await getContract();

// From start till now, verify that we have (mostly) the same values
const INITIAL_TIMESTAMP = (await oracle.INITIAL_TIMESTAMP()).toNumber();
const BLOCK_TIME = (await oracle.BLOCK_TIME()).toNumber();
const offset = (await oracle.getOffset(INITIAL_TIMESTAMP)).toNumber();
const start = DateTime.fromMillis(INITIAL_TIMESTAMP);
const factor = Math.pow(10, await oracle.decimals());
log.debug("Initial timestamp: " + start.toLocaleString());
const now = DateTime.now();
const currOffset = (await oracle.getOffset(now.toMillis())).toNumber();

const latestRound = await oracle.latestRoundData();
const blockIdx = latestRound[0].toNumber();

const pushValidUntil = INITIAL_TIMESTAMP + (4 + blockIdx) * BLOCK_TIME;
const maxValidUntil = 1690399925000 + (BLOCK_TIME);
if (!(pushValidUntil <= maxValidUntil)) console.log("Too many updates")
let orates = [];
for (let i = 0; i < 20; i++) {
  const rate = (await oracle.getRoundData(i))[1].toNumber();
  orates.push(rate);
}

console.log(orates);

const rates: number[] = [];

const MockOracle = {
  INITIAL_TIMESTAMP: oracle.INITIAL_TIMESTAMP,
  decimals: oracle.decimals,
  validUntil:  oracle.INITIAL_TIMESTAMP,
  BLOCK_TIME:  oracle.BLOCK_TIME,
  lastOffsetFrom:  () => BigNumber.from(0),
  getOffset: () => BigNumber.from(0),
  bulkUpdate: (r: number[]) => {
    rates.push(...r);
    return {
      wait: () => Promise.resolve(),
    }
  },
  provider: {
    getFeeData: () => ({ fees: {} }),
  }
}

const rateFactory = async (millis: number) => {
  const r = await fetchRate(new Date(millis));
  if (!r) throw new Error('No Rates found for ' + millis);
  const rate = r["124"] * (r.buy + r.sell) / 2;
  return {
    rate,
    from: r.validFrom,
    to: r.validTill,
  }
}

// await updateRates(MockOracle as any, start.plus({days: 5}).toMillis(), rateFactory);

let firstInvalidIndex = -1;

// if (process.env.RATES_SERVICE_ACCOUNT) {
//   process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.RATES_SERVICE_ACCOUNT;
// }
// await init();
// const db = getFirestore();
// var coinsdb = await db.collection("Coin")
//   .where("validFrom", ">=", new Date(INITIAL_TIMESTAMP))
//   .orderBy('validFrom', "asc")
//   .limit(100)
//   .get();

// var fxsdb = await db.collection("FxRates")
//   .where("validFrom", ">=", new Date(INITIAL_TIMESTAMP))
//   .orderBy('validFrom', "asc")
//   .limit(100)
//   .get();

// const coins = coinsdb.docs.map(d => ({
//   ...d.data(),
//   validFrom: d.data().validFrom.toDate(),
//   validTill: d.data().validTill.toDate(),
// }));
// const fxs = fxsdb.docs.map(d => ({
//   ...d.data(),
//   validFrom: d.data().validFrom.toDate(),
//   validTill: d.data().validTill.toDate(),
// }));
// console.log("Got " + coins.length + " rates");

const brates = [];
let t = start;
let idx = 0;
for (let t = start; t < now; ) {
  const db = await fetchRate(t.toJSDate());
// for (let db of coins) {

  //t = DateTime.fromMillis(db.validTill.toMillis());
  // if (!db) throw new Error('No Rates found for ' + t);
  // if (t.toMillis() != db.validFrom) {
  //   log.warn(`Invalid Start Time`);
  // }

  const oidx = await oracle.getBlockIndexFor(t.toMillis());
  const ooffset = await oracle.getOffset(t.toMillis());
  const bc = await oracle.getRoundFromTimestamp(t.toMillis());

  brates.push(bc.toNumber());

  if (oidx.toNumber() != idx) {
    console.error("Block Index is not sequential");
  }
  idx++;

  // Are they the same?
  const rate = db["124"] * (db.buy + db.sell) / 2;
  const avgm = Math.round(rate * factor);
  if (bc.toNumber() != avgm) {
    // log.error(
    //   { blockchain: bc.toNumber(), database: avgm },
    //   'Error validating Oracle: {blockchain} != {database}'
    // );
    if (firstInvalidIndex < 0) {
      firstInvalidIndex = t.diff(start).as("milliseconds") / BLOCK_TIME;
    }
  }
  else {
    console.log(`Block Index: ${oidx} (${ooffset}) - ${rate}`);
  }
  const validTill = db.validTill;
  const validFrom = db.validFrom;
  //t = DateTime.fromMillis(db.validTill.toMillis());
  //if ((db.validTill.toMillis() - db.validFrom.toMillis()) > BLOCK_TIME) {
  if ((validTill - validFrom) > BLOCK_TIME) {
    log.warn("Larger jump than expected, wazzup?")
  }
  t = DateTime.fromMillis(validTill);
}

if (firstInvalidIndex >= 0) {
  log.warn("First invalid index: " + firstInvalidIndex);
}
