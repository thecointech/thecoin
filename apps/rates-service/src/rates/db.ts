import { GetFirestore } from "@the-coin/utilities/firestore";
import { RateKey, RateType } from "./types";

//
//  All functions connecting to the DB occur in this file
// Nobody outside this file should be aware of our storage
//

// Helpers
const getRatesCollection = (key: RateKey) =>
  GetFirestore().collection(key.toString());

export const getRateDoc = (key: RateKey, ts: number) =>
  getRatesCollection(key).doc(ts.toString())

export const getLatestStored = async (key: RateKey) => {
  const snapshot = await getRatesCollection(key)
    .orderBy('validTill', "desc")
    .limit(1)
    .get();
  return snapshot.empty
   ? null
   : snapshot.docs[0].data() as RateType
}

//
// Get the stored rate, either encapsulating ts (timestamp) or latest
//
export async function getRate(key: RateKey, ts: number) : Promise<RateType|null> {
  const collection = getRatesCollection(key);
  const minValidity = ts ?? Date.now();
  // Get the first entry that would be valid after ts
  let snapshot = await collection.where('validTill', '>', minValidity)
    .orderBy('validTill', "asc")
    .limit(1)
    .get();

  // If we do not have a valid item for this time,
  // we should return the prior valid item (if it exists)
  if (snapshot.empty)
    return null;

  const candidate = snapshot.docs[0].data() as RateType
  // If we have ts, ensure that our entry is not too late
  if (ts && candidate.validFrom > ts)
    return null;

  return candidate;
}

export const getCoinRate = (ts: number) => getRate("Coin", ts);
export const getFxRates = (ts: number) => getRate("FxRates", ts);

//
// Set the new rate. Does no validity checking
//
export const setRate = (key: RateKey, rate: RateType) =>
  getRateDoc(key, rate.validFrom).set(rate, {merge: false});



