// Imports the Google Cloud client library
import { Datastore } from '@google-cloud/datastore';
import admin from "firebase-admin";
import { RateKey, RateType, CoinRate, ExchangeRate, FXRate, FxRates } from './types';
import { writeFileSync } from 'fs';

const secret = require("../firebase.secret.json");
// import { log } from './logging';
// import fs from 'fs';

// Legacy client
const datastore = new Datastore({
  keyFilename: '/src/TheCoin/apps/rates-patcher/thecoincore-212314-6f71b16407ed.json'
});

admin.initializeApp({
  credential: admin.credential.cert(secret),
  databaseURL: "https://carbon-theorem-283310.firebaseio.com"
});
const firestore = admin.firestore();

const Timestamp = admin.firestore.Timestamp
// async function getRate(kind: string, rate: ExchangeRate | FXRate) {
//   const k = datastore.key([kind, rate.ValidUntil]);
//   const r = await datastore.save({
//     key: k,
//     data: rate
//   })
//   log.trace(r);

//   await setLatest(kind, rate);
// }
// Helpers
const getRatesCollection = (key: RateKey) =>
  firestore.collection(key.toString());

export const getRateDoc = (key: RateKey, ts: number) =>
  getRatesCollection(key).doc(ts.toString())

//
// Set the new rate. Does no validity checking
//
export function setRate(key: RateKey, rate: RateType) {
  //console.log("Setting {FxKey} rate with validity {ValidTill}",
  //  key, rate.validFrom);
  return getRateDoc(key, rate.validFrom.toMillis()).set(rate, {merge: false});
}
ts : Timestamp.fromMillis(123);
const ToCoinRate = (r: ExchangeRate): CoinRate => (
  {

    buy: r.Buy,
    sell: r.Sell,
    validFrom: Timestamp.fromMillis(r.ValidFrom),
    validTill: Timestamp.fromMillis(r.ValidUntil)
  }
)
const ToFxRate = (r: FXRate): FxRates => (
  {
    124: r.Rate,
    validFrom: Timestamp.fromMillis(r.ValidFrom),
    validTill: Timestamp.fromMillis(r.ValidUntil)
  } as any
)

const CheckValidity = (r: FXRate|ExchangeRate, oldValid: number, type: string) => {
  if (r.ValidFrom != oldValid)
    console.log(`hole in ${type} Validity: ${new Date(oldValid)} != ${new Date(r.ValidFrom)}, (${r.ValidFrom - oldValid}ms diff)`);
  return r.ValidUntil
}

const InsertRates = async (rates: (any)[]) =>
{
  let coinValidFrom = 0;
  let fxValidFrom = 0;
  for (let i = 5390; i < rates.length; i++)
  {

    const task = rates[i];

    if (i % 10 == 0)
      console.log(`Completed ${i} of ${rates.length} : ${new Date(task.ValidUntil).toDateString()}`);

    if (task[datastore.KEY].kind == "0")
    {
      coinValidFrom =CheckValidity(task, coinValidFrom, "Coin");
      const rate = ToCoinRate(task as ExchangeRate);
      await setRate("Coin", rate);

    }
    else if (task[datastore.KEY].kind == "124")
    {
      fxValidFrom =CheckValidity(task, fxValidFrom, "FxRate");
      const rate = ToFxRate(task as FXRate);
      await setRate("FxRates", rate);
    }
    else {
      const kind = task[datastore.KEY].kind;
      console.log(`Skipping key of kind: ${kind}`);
    }
  }
}
async function migrate() {

  // Fetch all coin rates
  const query = datastore
    .createQuery();

  const [tasks, cont] = await datastore.runQuery(query);

  if (cont.moreResults != "NO_MORE_RESULTS")
    throw("ERROR: Num Results maxed out at: " + tasks.length);

  console.log('Tasks:');
  const sorted = tasks.sort((a, b) => a.ValidFrom - b.ValidFrom);
  writeFileSync("./sorted.json", JSON.stringify(sorted))

  InsertRates(sorted);
}

migrate();
