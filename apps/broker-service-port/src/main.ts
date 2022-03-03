import { init } from '@thecointech/firestore';
import { updateDeposit } from './deposits';
import { updateSell } from './sell';
import { readReconciledCache } from './load';
import { Reconciliations } from './types';
import { updateBill } from './bills';
import { NormalizeAddress } from '@thecointech/utilities';
import { getUserDoc } from '@thecointech/broker-db/user';
import { DateTime } from 'luxon';

const RECONCILED_CACHE_NAME = "port.reconciled.cache"

declare global {
  var raw: Reconciliations;
  var source: Reconciliations;
}

async function initialize() {
  if (process.env.BROKER_SERVICE_ACCOUNT)
    process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.BROKER_SERVICE_ACCOUNT;
  await init();
}

const builtInAccounts = [
  "445758e37f47b44e05e74ee4799f3469de62a2cb",
  "0x0C327B7FCC6FF94F606B3D31D534F25B5604A0D1",
  "0xD0C3C0E7E94969B78EFF6BD531DBD6D0E90769F0",

  // Not built-in, but ignore anyway
  "0x1198AACEF87B53CA5610C68FD83DF9577D54CC0C", // Manual transfer closed out account
  "0xD86C97292B9BE3A91BD8279F114752248B80E8C5", // Manual transfer closed out account

  "51e1153ee05efcf473d581c15b3f7b760ca5ddb3",
  "0x38DE1B6515663DBE145CC54179ADDCB963BB606A",
  "2fe3cbf59a777e8f4be4e712945ffefc6612d46f",
  "4f107b6633a4b3385c9e20945144c59ce4ff2def"
].map(NormalizeAddress);

async function updateFirestore() {
  const cache = readReconciledCache(RECONCILED_CACHE_NAME, process.env.THECOIN_USER_DATA);
  if (!cache) throw new Error("No Cache");

  await initialize();
  // Do we have a unique ID for every purchase?
  for (let i = 0; i < cache.length; i++) {
    const client = cache[i];
    if (builtInAccounts.includes(NormalizeAddress(client.address)))
      continue;

    // Add in visible data to make it available to firestore on admin app
    const data = client.data || {
      referrer: "UNKNOWN",
      created: DateTime.fromObject({year: 2017, month: 1, day: 1})
    };
    const userDoc = getUserDoc(client.address);
    userDoc.set({
      created: DateTime.fromMillis(data.created.toMillis()),
      referredBy: data.referrer,
    })

    console.log(`-- Processing [${i} of ${cache.length}]: ${client.address} --`)
    for (let t = 0; t < client.transactions.length; t++) {
      const tx = client.transactions[t];
      if (!tx.database) {
        continue;
      }
      switch(tx.action) {
        case "Buy": {
          await updateDeposit(tx);
          break;
        }
        case "Sell": {
          await updateSell(tx);
          break;
        }
        case "Bill": {
          await updateBill(tx);
        }
      }
    }
  }
  // console.log(cache);
}

updateFirestore();

