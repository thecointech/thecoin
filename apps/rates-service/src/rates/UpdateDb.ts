// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GOOGLE_CLOUD_PROJECT environment variable. See
// https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
// These environment variables are set automatically on Google App Engine

import { updateLatest, getLatest } from "./latest";
import { setRate } from "./db";
import { fetchCoinRate } from "./fetchCoin";
import { fetchFxRate } from "./fetchFx";
import { RateKey, RateOffsetFromMarket, RateType } from "./types";
import { waitTillBuffer } from "./delay";

//import fetch from "node-fetch";
//import { ApiKey }  from './ApiKey';
//import { GetFirestore } from "@the-coin/utilities/Firestore";

//import { ArrayRenderer } from '../../../site/app/containers/HelpDocs/Renderer/ArrayRenderer';
//import { number } from 'card-validator';



//
//  Returns the latest stored rate, or null if none present
//
// async function getLastRate(code: number, name: string){

//   const rateDb = await getRateFromDb(code)
//   const doc = await rateDb.get();
//   if (doc.exists) {
//     let Exchange = new ExchangeObj(name, code, doc.data() as any);
//     return Exchange;
//   }
//   return null;
// }

//
//  Returns the latest stored rates
//
// async function getAllRates(){
//     // All the supported exchanges
//     // The Coin Rates
//     let Exchange0 = await getLastRate(0, "Coin");
//     if (Exchange0){
//         Exchanges.splice(0, 0, Exchange0);
//     }
//     // The CAD Rates
//     let Exchange124 = await getLastRate(124, "CAD");
//     if (Exchange124){
//         Exchanges.splice(124, 0, Exchange124);
//     }
//     return Exchanges;
// }

//
//  Returns the latest stored rate, or null if none present
//
//export const getLatestRate = (code: number) => exchanges[code].latest;
//     //let Exchanges = await getAllRates();

//     let exchange = exchanges[code];
//     if (exchange == null) {
//         throw new Error("Unsupported Currency");
//     }
//     if (exchange.latest != null)
//         return exchange.latest;
// }

// export async function setLatestRate(code: number, newRecord: ExchangeRate) {
//   if (updateLatest(code, newRecord))
//     await setRate(code, newRecord);
// }

//////////////////////////////////////////////////////////////////////////

//
// Gets current rates, and if necessary, generates
// and stores a new rate.  This function may update
// the existing rate if it decides that the current
// rate is still valid (ie - if it decides the market is closed)
//
// export async function ensureLatestCoinRate(now: number) {
//     const latest = getLatestRate(0);
//     // Quick exit if we are updating again too quickly
//     // We should only update in the period between
//     // when the new market values become available
//     // and when they become our new rates.
//     if ((latest.validUntil - now) > RateOffsetFromMarket)
//         return latest;

//     return await updateLatestCoinRate(now, latest.validUntil);
// }

// export async function updateLatestCoinRate(now: number, latestValidUntil: number) {
//     let newRecord = await fetchLatestCoinRate(now, latestValidUntil);
//     if (newRecord){
//         setLatestRate(0, newRecord);
//     }
//     return newRecord;
// }

/////////////////////////////////////////////////////////////////////////////////

const fetchNewRate = (key: RateKey, now: number, currentExpires: number) =>
  (key == "Coin")
    ? fetchCoinRate(currentExpires, now)
    : fetchFxRate(currentExpires, now)

export async function ensureLatestRate(key: RateKey, now: number) : Promise<RateType>
{
  let current = getLatest(key);
  console.log("Updating {FxKey} with current expiration {ValidUntil}",
    key, current.validTill);

  // Quick exit if we are updating again too quickly
  // We should only update in the period between
  // when the new market values become available
  // and when they become our new rates.
  const remainingValidity = current.validTill - now;
  if (remainingValidity > RateOffsetFromMarket)
  {
    console.log("Existing {FxKey} has remaining validity {Remaining}, exiting",
      key, remainingValidity);
    return current;
  }

  // fetch our new rate
  const newRate = await fetchNewRate(key, now, current.validTill);
  console.log("Fetched new rates for {FxKey} with new expiration {ValidUntil}",
    key, newRate?.validTill);

  // Does the new rate meaningfully update our existing latest rate?
  if (!newRate || !updateLatest(key, newRate))
    return current;

  // If so, then store to DB
  await setRate(key, newRate);
  return newRate;
}


// export async function ensureLatestRate(code: number, now:number)
// {
//   let latest = getLatestRate(code);
//   console.log("Updating {FxKey} with latest until {ValidUntil}",
//     code, latest.validUntil);

//   // Quick exit if we are updating again too quickly
//   // We should only update in the period between
//   // when the new market values become available
//   // and when they become our new rates.
//   const remainingValidity = latest.validUntil - now;
//   if (remainingValidity > RateOffsetFromMarket)
//   {
//     console.log("Existing {FxKey} has remaining validity {Remaining}, exiting",
//       code, remainingValidity);
//     return latest;
//   }

//   // fetch our new rate
//   const newRate = await fetchNewRate(code, now, latest.validUntil);
//   console.log("Fecthed new {FxRate} for code {FxKey}",
//     newRate, code);

//   // Does the new rate meaningfully update our existing latest rate?
//   if (!newRate || !updateLatest(code, newRate))
//     return latest;

//   // If so, then store to DB
//   await setRate(code, newRate);
//   return newRate;
// }

export async function update() {
    try {
      const now = Date.now();
      const coinWait = ensureLatestRate("Coin", now);
      const fxWait = ensureLatestRate("FxRates", now);

      const coinResult = await coinWait;
      const fxResult = await fxWait;

      const minValidity = Math.min(coinResult.validTill, fxResult.validTill);
      return minValidity;
    }
    catch (err) {
        console.error(err);
    }
    return false;
}

export async function updateRates() {
  await waitTillBuffer();
  await update();
}

