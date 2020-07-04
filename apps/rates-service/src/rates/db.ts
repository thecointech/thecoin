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

//
// Get the stored rate, either encapsulating ts (timestamp) or latest
//
export async function getRate(key: RateKey, ts?: number) : Promise<RateType|null> {
  const collection = getRatesCollection(key);
  const minValidity = ts ?? Date.now();
  // Build a query to either get the rate containing ts,
  // or latest if no ts is supplied.
  let query = collection.where('validUntil', '>=', minValidity)
  if (ts != null) {
    query = query.where('validFrom', '<', ts)
  }
  const snapshot = await query.orderBy('validUntil', "desc")
    .limit(1)
    .get();

  // If we do not have a valid item for this time,
  // we should return the prior valid item (if it exists)
  return !snapshot.empty
    ? snapshot.docs[0].data() as RateType
    : null;
}

//
// Set the new rate. Does no validity checking
//
export const setRate = (key: RateKey, rate: RateType) =>
  getRateDoc(key, rate.validFrom).set(rate, {merge: false});



