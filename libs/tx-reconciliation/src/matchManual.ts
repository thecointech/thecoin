import manual from './data/manual.json';
import { DateTime } from "luxon";
import Decimal from "decimal.js-light";
import { spliceBank } from "./matchBank";
import { Timestamp } from "@the-coin/utilities/firestore";
import { buildNewUserRecord } from "./reconcileExternal";
import { UserAction } from '@the-coin/utilities/User';
import { Reconciliations, AllData } from 'types';

type InsertEntry = typeof manual["insert"][0];
type ConnectEntry = typeof manual["connect"][0];
type SkipEntry = typeof manual["skip"][0];

export function matchManual(r: Reconciliations, data: AllData) {
  manual.connect.forEach(entry => doConnect(entry, data, r));
  manual.insert.forEach(entry => doInsert(entry, r));
  manual.skip.forEach(entry => doSkip(entry, data));
}

function findRecord(r: Reconciliations, hash: string, data?: AllData) {
  for (const user of r)
    for (const record of user.transactions)
      if (record.data.hash == hash)
        return { user, record };

  // Create new entry from blockchain
  const bc = data?.blockchain.find(bc => bc.txHash == hash);
  if (bc)
    return buildNewUserRecord(r, bc);
  throw new Error(`Cannot find entry: ${hash}`);
}

function doInsert(entry: InsertEntry, r: Reconciliations) {
  const dt = DateTime.fromISO(entry.date)
  switch (entry.where) {
    case 'email': {
      const { user, record } = findRecord(r, entry.hash);
      record.email = {
        name: user.names[0],
        id: (entry as any).sourceId,
        cad: new Decimal(entry.amount),
        address: user.address,
        recieved: dt,
        email: "Manual Entry - not set",
        depositUrl: "Manual Entry - not set",
      }
      break;
    }
    case 'bank': {
      const { record } = findRecord(r, entry.hash);
      (record.data as any).type = 'deposit';
      record.bank = [{
        Amount: entry.amount,
        Description: "Manual Entry",
        Details: "USD",
        Date: dt,
      }]
      break;
    }
    case "blockchain": {
      const user = r.find(u => u.address === entry.hash);
      user!.transactions.push({
        action: entry.type as UserAction,
        data: {
          confirmed: true,
          fiatDisbursed: entry.cad ?? 0,
          hash: `CLOSE ACCOUNT:${entry.hash}`,
          recievedTimestamp: Timestamp.fromMillis(dt.toMillis()),
          completedTimestamp: Timestamp.fromMillis(dt.toMillis()),
          transfer: { value: entry.amount },
        },
        bank: [],
        database: null,
        email: null,
        blockchain: {
          txHash: `CLOSE ACCOUNT:${entry.hash}`,
          balance: 0,
          change: -entry.amount,
          date: dt,
          counterPartyAddress: entry.hash,
          logEntry: entry.notes,
        }
      })
    }
  }
}

function doConnect(entry: ConnectEntry, data: AllData, r: Reconciliations) {
  // Force connecting to a given record
  const { user, record } = findRecord(r, entry.hash, data);
  if (entry.where == "bank") {
    record.bank = spliceBank(data, user, {
      data: {
        fiatDisbursed: entry.amount,
        completedTimestamp: Timestamp.fromMillis(DateTime.fromISO(entry.date).toMillis()),
      },
      bank: [],
      action: entry.action,
    } as any, 1);
  }
}

function doSkip(_entry: SkipEntry, _data: AllData) {
}
