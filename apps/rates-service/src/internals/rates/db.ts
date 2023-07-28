import { getFirestore, Timestamp, CollectionReference } from "@thecointech/firestore";
import { CoinRate, FxRates, RateKey, RateType, RateTypes } from "./types";
import { IsDebug } from "@thecointech/utilities/IsDebug";
import { log } from "@thecointech/logging";
import { toDateStr } from '../../utils/date';


//
// All functions connecting to the DB occur in this file
// Nobody outside this file should be aware of our storage
//

// Our data is stored in native Timestamp, but our codebase is based
// on DateTime.  This file manages the conversion back and forth
type DbType = Omit<Omit<RateType, "validFrom">, "validTill"> & {
  validFrom: Timestamp,
  validTill: Timestamp,
};

// Helpers
const getRatesCollection = (key: RateKey) =>
  getFirestore().collection(key.toString()) as CollectionReference<DbType>;

const getRateDoc = (key: RateKey, ts: number) =>
  getRatesCollection(key).doc(ts.toString())

const toRateType = (db: DbType): RateType => ({
  ...db as any,
  validFrom: db.validFrom.toMillis(),
  validTill: db.validTill.toMillis(),
})
export const toDbType = (rt: RateType): DbType => ({
  ...rt,
  validFrom: Timestamp.fromMillis(rt.validFrom),
  validTill: Timestamp.fromMillis(rt.validTill),
})

export const getLatestStored = async <T extends RateKey>(key: T) : Promise<RateTypes[T]|null> => {
  const snapshot = await getRatesCollection(key)
    .orderBy('validTill', "desc")
    .limit(1)
    .get();
  return snapshot.empty
   ? null
   : toRateType(snapshot.docs[0].data()) as RateTypes[T]
}

//
// Get the stored rate encapsulating ts (timestamp)
export async function getRate(key: RateKey, ts: number) : Promise<RateType|null> {
  const collection = getRatesCollection(key);
  const minValidity = ts ?? Date.now();
  // Get the first entry that would be valid after ts
  let snapshot = await collection.where('validTill', '>', new Date(minValidity))
    .orderBy('validTill', "asc")
    .limit(1)
    .get();

  // If we do not have a valid item for this time,
  // we should return the prior valid item (if it exists)
  if (snapshot.empty)
    return null;

  const candidate = toRateType(snapshot.docs[0].data())
  // If we have ts, ensure that our entry is not too late
  if (ts && candidate.validFrom > ts) {
    log.error(`Warning: Cannot find valid entry for ${new Date(ts)}`);
  }
  return candidate;
}

export const getCoinRate = (ts: number) => getRate("Coin", ts) as Promise<CoinRate|null>;
export const getFxRates = (ts: number) => getRate("FxRates", ts) as Promise<FxRates|null>;

//
// Set the new rate. Does no validity checking
export function setRate(key: RateKey, rate: RateType) {
  log.trace(
    { FxKey: key, ValidTill: toDateStr(rate.validTill) },
    "Setting {FxKey} rate with ValidTill {ValidTill}"
  );
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



