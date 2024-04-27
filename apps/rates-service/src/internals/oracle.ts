import { connectOracle, updateRates } from '@thecointech/contract-oracle';
import { getSigner } from '@thecointech/signers';
import { getCombinedRates } from './rates';
import { log } from '@thecointech/logging';
import { DateTime, Duration } from 'luxon';
import { FirestoreAdmin, Timestamp, getFirestore } from '@thecointech/firestore';
import { toDateStr } from '../utils/date';
import Axios from 'axios';


export async function updateOracle(timestamp: number) {

  await guardFn(async () => {

    const signer = await getSigner("OracleUpdater");
    const oracle = await connectOracle(signer);

    log.debug(
      {
        date: toDateStr(timestamp),
      },
      'Updating Oracle at {date}'
    );

    // Our oracle operates in milliseconds
    await updateRates(oracle, timestamp, async (ts) => {

      log.trace(
        { date: toDateStr(ts) },
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
    const validToDate = DateTime.fromMillis(Number(validTo));
    if (validToDate > DateTime.now().plus({ hours: 6 })) {
      // Ignore this in develop (the duration of a rate is longer than 6h)
      if (process.env.NODE_ENV !== "development") {
        log.error(
          { date: toDateStr(validToDate) },
          "Oracle is too far in the future {date}"
        );
      }
    }
    else {
      log.info(
        { date: toDateStr(validToDate) },
        'Oracle updated to {date}'
      );
    }
  })
}

export async function guardFn<T extends Function>(fn: T) {

  // Because there are multiple versions of this service running, we
  // need to ensure that there is only 1 update happening at any given time
  const guard = await enterCS();
  log.debug(`UpdateOracle acquired CS: ${guard && guard.toDate()}`);

  if (!guard) {
    log.warn("Cannot update Oracle - someone else holds the critical section");
    return;
  }

  const now = DateTime.now();
  const maxTimeout = now.plus({ hour: 1});

  // Ping our service every 5 minutes to
  // prevent GAE from killing us prematurely
  let polling = setInterval(() => {
    if (DateTime.now() > maxTimeout) {
      clearInterval(polling);
      log.error("UpdateOracle timed out");
      return;
    }
    const myUrl = process.env['URL_SERVICE_RATES']
    console.log(`KeepAlive polling ${myUrl}...`);
    if (!myUrl) return;
    try {
      Axios.get(myUrl);
    }
    catch(err) {
      log.error(err, "KeepAlive failed");
    }
  }, Duration.fromObject({ minutes: 5 }).toMillis())

  try {
    await fn();
  }
  finally {
    clearInterval(polling);
    await exitCS(guard);
  }
}

const cs_doc = "admin/__updater_cs";
const start_key = "started";
const complete_key = "complete";
function enterCS() {
  const db = getFirestore() as FirestoreAdmin;
  const ref = db.doc(cs_doc);
  return db.runTransaction(async t => {
    const doc = await t.get(ref);

    if (doc.exists) {
      const startKey = doc.get(start_key);
      const completeKey = doc.get(complete_key);
      log.info(
        { startKey: startKey?.toDate(), completeKey: completeKey?.toDate() },
        'CS state: {startKey} {completeKey}'
      )

      // Check if someone else currently holds the lock
      if (startKey?.toMillis() != completeKey?.toMillis()) {

        if (completeKey?.toMillis() < DateTime.now().minus({hours: 6}).toMillis()) {
          // We assume that a 6-hr gap means that someone else has crashed
          log.error("Expired lock detected, ignoring");
        }
        else {
          // Someone else holds the lock & is still running, so we can't update
          return false;
        }
      }
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
