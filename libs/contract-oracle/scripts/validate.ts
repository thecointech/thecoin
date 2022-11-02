import { getContract } from '@thecointech/contract-oracle';
import { DateTime } from 'luxon';
import { log } from '@thecointech/logging';
import { fetchRate, weBuyAt, weSellAt } from '@thecointech/fx-rates';

// ----------------------------------------------------------------
// This simple script compares the value stored in Oracle vs
// the value in the database.

const oracle = await getContract();

// From start till now, verify that we have (mostly) the same values
const INITIAL_TIMESTAMP = await oracle.INITIAL_TIMESTAMP();
const start = DateTime.fromSeconds(INITIAL_TIMESTAMP.toNumber());
log.debug("Initial timestamp: " + start.toLocaleString());
const now = DateTime.now();

for (let t = start; t < now; ) {
  const db = await fetchRate(t.toJSDate());
  if (!db) throw new Error('No Rates found for ' + t);
  if (t.toMillis() != db.validFrom) {
    log.warn(`Invalid Start Time`);
  }

  const bc = await oracle.getRoundFromTimestamp(t.toSeconds());

  // Are they the same?
  const buy = weBuyAt([db], t.toJSDate());
  const sell = weSellAt([db], t.toJSDate());
  const avg = (buy + sell) / 2;
  const avgm = Math.round(avg * 100000000);
  if (bc.toNumber() != avgm) {
    log.error('Numbers are different');
  }
  t = DateTime.fromMillis(db.validTill);
}
