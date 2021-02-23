import { GetFirestore, Timestamp } from "@the-coin/utilities/firestore";
import { RateKey, RateType } from "./types";
import { IsDebug } from "@the-coin/utilities/IsDebug";

// Our data is stored in native Timestamp
// for easy human-comprehension
import { DocumentData } from '@the-coin/types';

//
//  All functions connecting to the DB occur in this file
// Nobody outside this file should be aware of our storage
//


type DbType = Omit<Omit<RateType, "validFrom">, "validTill"> & {
  validFrom: Timestamp,
  validTill: Timestamp,
};

// Helpers
const getRatesCollection = (key: RateKey) =>
  GetFirestore().collection(key.toString());

export const getRateDoc = (key: RateKey, ts: number) =>
  getRatesCollection(key).doc(ts.toString())

const toRateType = (db: DocumentData): RateType => ({
  ...db as any,
  validFrom: db.validFrom.toMillis(),
  validTill: db.validTill.toMillis(),
})
const toDbType = (rt: RateType): DbType => ({
  ...rt,
  validFrom: Timestamp.fromMillis(rt.validFrom),
  validTill: Timestamp.fromMillis(rt.validTill),
})

export const getLatestStored = async (key: RateKey) : Promise<RateType|null> => {
  const snapshot = await getRatesCollection(key)
    .orderBy('validTill', "desc")
    .limit(1)
    .get();
  return snapshot.empty
   ? null
   : toRateType(snapshot.docs[0].data())
}

//
// Get the stored rate encapsulating ts (timestamp)
//
export async function getRate(key: RateKey, ts: number) : Promise<RateType|null> {
  const collection = getRatesCollection(key);
  const minValidity = ts ?? Date.now();
  // Get the first entry that would be valid after ts
  let snapshot = await collection.where('validTill', '>', Timestamp.fromMillis(minValidity))
    .orderBy('validTill', "asc")
    .limit(1)
    .get();

  // If we do not have a valid item for this time,
  // we should return the prior valid item (if it exists)
  if (snapshot.empty)
    return null;

  const candidate = toRateType(snapshot.docs[0].data())
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
export function setRate(key: RateKey, rate: RateType) {
  console.log("Setting {FxKey} rate with validity {ValidTill}",
    key, rate.validFrom);
  const doc = getRateDoc(key, rate.validFrom);
  const data = toDbType(rate);
  return doc.set(data, {merge: false});
}

// debugging-only function
export async function cleanDb()
{
  if (IsDebug)
  {
    await getRatesCollection("Coin").doc().delete();
    await getRatesCollection("FxRates").doc().delete();
  }
}



