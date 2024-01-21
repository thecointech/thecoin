import { connectOracle, updateRates } from '@thecointech/contract-oracle';
import { getSigner } from '@thecointech/signers';
import { getCombinedRates } from './rates';
import { log } from '@thecointech/logging';
import { DateTime } from 'luxon';
import { FirestoreAdmin, Timestamp, getFirestore } from '@thecointech/firestore';
import { toDateStr } from '../utils/date';


export async function updateOracle(timestamp: number) {

  // Because there are multiple versions of this service running, we
  // need to ensure that there is only 1 update happening at any given time
  const guard = await enterCS();
  log.debug(`UpdateOracle acquired CS: ${guard && guard.toDate()}`);

  if (!guard) {
    log.warn("Cannot update Oracle - someone else holds the critical section");
    return;
  }

  try {
    const signer = await getSigner("OracleUpdater");
    const oracle = await connectOracle(signer);

    log.debug(
      {
        date: toDateStr(timestamp),
        address: oracle.address,
      },
      'Updating Oracle {address} at {date}'
    );

    // Our oracle operates in milliseconds
    await updateRates(oracle, timestamp, async (ts) => {

      log.trace(
        {date: toDateStr(ts)},
        'Fetching rate for oracle at {date}'
      )
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
    const validToDate = DateTime.fromMillis(validTo.toNumber());
    if (validToDate > DateTime.now().plus({ hours: 6})) {
      log.error(
        { date: toDateStr(validToDate) },
        "Oracle is too far in the future {date}"
      );
    }
    else {
      log.info(
        { date: toDateStr(validToDate) },
        'Oracle updated to {date}'
      );
    }
  }
  finally {
    await exitCS(guard);
  }
}


const cs_doc = "admin/__updater_cs";
const start_key = "started";
const complete_key = "complete";
function enterCS() {
  const db: FirestoreAdmin = getFirestore() as any;
  const ref = db.doc(cs_doc);
  return db.runTransaction(async t => {
    const doc = await t.get(ref);
    // Check if someone else currently holds the lock
    log.info(`CS state: ${JSON.stringify(doc?.data())}`)
    console.log('CS state: ', doc)
    console.log('t: ', t)
    if (doc.get(start_key)?.toMillis() != doc.get(complete_key)?.toMillis()) {
      return false;
    }
    const timestamp = Timestamp.now();
    // Enable set for dev:live
    if (!doc.exists) {
      t.set(
        ref,
        { started: timestamp }
      )
    }
    else {
      t.update(
        ref,
        { started: timestamp },
        { lastUpdateTime: doc.updateTime }
      );
    }
    return timestamp;
  })
}
function exitCS(guard: Timestamp) {
  const db: FirestoreAdmin = getFirestore() as any;
  const doc = db.doc(cs_doc);
  return doc.set(
    { [complete_key]: guard },
    { merge: true }
  )
}
