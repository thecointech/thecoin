import { connectOracle, updateRates } from '@thecointech/contract-oracle';
import { getSigner } from '@thecointech/signers';
import { getCombinedRates } from './rates';
import { log } from '@thecointech/logging';
import { DateTime } from 'luxon';
import { FirestoreAdmin, Timestamp, getFirestore } from '@thecointech/firestore';


export async function updateOracle(timestamp: number) {

  // Because there are multiple versions of this service running, we
  // need to ensure that there is only 1 update happening at any given time
  const guard = await enterCS();
  if (!guard) {
    log.warn("Cannot update Oracle - someone else holds the critical section");
    return;
  }

  try {
    const signer = await getSigner("OracleUpdater");
    const oracle = await connectOracle(signer);

    log.info(`Updating Oracle ${oracle.address} to ${DateTime.fromMillis(timestamp).toLocaleString(DateTime.DATETIME_SHORT)}`);

    // Our oracle operates in milliseconds
    await updateRates(oracle, timestamp, async (ts) => {
      // do we have a data for this time?
      const rates = await getCombinedRates(ts);
      if (!rates) return null;
      // Calculate TC => CAD
      const rate = rates["124"] * (rates.buy + rates.sell) / 2;
      return {
        rate,
        from: rates.validFrom,
        to: rates.validTill,
      }
    })

    const validTo = await oracle.validUntil();
    log.info(`Oracle updated to ${DateTime.fromMillis(validTo.toNumber()).toLocaleString(DateTime.DATETIME_SHORT)}`);
  }
  catch(err) {
    throw err;
  }
  finally {
    await exitCS(guard);
  }
}


const cs_doc = "admin/__updater_cs";
function enterCS() {
  const db: FirestoreAdmin = getFirestore() as any;
  const cs = db.doc(cs_doc);
  return db.runTransaction(async t => {
    const cs_get = await t.get(cs);
    const cs_data = cs_get.data();
    // Check if someone else currently holds the lock
    if (cs_data?.started != cs_data?.complete) {
      return false;
    }
    const timestamp = Timestamp.now();
    t.set(
      cs,
      { started: timestamp },
      { merge: true }
    );
    // const cs_verify = await t.get(cs);
    // // Check again, did we acquire the lock?
    // if (cs_verify.data()?.started != timestamp)
    //   return false;

    return timestamp;
  })
}
function exitCS(guard: Timestamp) {
  const db: FirestoreAdmin = getFirestore() as any;
  const cs = db.doc(cs_doc);
  return cs.set({
    completed: guard
  })
}
