import manual from './data/manual.json';
import { DateTime } from "luxon";
import Decimal from "decimal.js-light";
import { spliceBank } from "./matchBank";
import { Timestamp } from "@the-coin/utilities/firestore";
import { buildNewUserRecord } from "./reconcileExternal";
import { UserAction } from '@the-coin/utilities/User';
import { Reconciliations, AllData } from './types';
import { spliceBlockchain } from './matchBlockchain';

// file deepcode ignore no-any: backend code, with non-trivial fix

type InsertEntry = typeof manual["insert"][0];
type ConnectBankEntry = typeof manual["connect"]["bank"][0];
type ConnectBlockchainEntry = typeof manual["connect"]["blockchain"][0];

export function matchManual(r: Reconciliations, data: AllData) {
  manual.connect.bank.forEach(entry => doConnectBank(entry, data, r));
  manual.connect.blockchain.forEach(entry => doConnectBlockchain(entry, data, r));
  manual.insert.forEach(entry => doInsert(entry, r, data));
}

function findRecord(r: Reconciliations, hash: string, data?: AllData) {
  for (const user of r)
    for (const record of user.transactions)
      if (record.data.hash === hash)
        return { user, record };

  // Create new entry from blockchain
  const bc = data?.blockchain.find(bc => bc.txHash === hash);
  if (bc)
    return buildNewUserRecord(r, data!, bc);
  throw new Error(`Cannot find entry: ${hash}`);
}

function doInsert(entry: InsertEntry, r: Reconciliations, data: AllData) {
  const dt = DateTime.fromISO(entry.date)
  switch (entry.where) {
    case 'email': {
      const { user, record } = findRecord(r, entry.hash, data);
      record.email = {
        name: user.names[0],
        id: (entry as any).sourceId,
        cad: new Decimal(entry.amount),
        address: user.address,
        recieved: dt,
        email: "Manual Entry - not set",
        depositUrl: "Manual Entry - not set",
      }
      record.notes = entry.notes;
      break;
    }
    case 'bank': {
      const { record } = findRecord(r, entry.hash);
      (record.data as any).type = entry.type;
      record.bank = [{
        Amount: entry.amount,
        Description: "Manual Entry",
        Details: entry.currency,
        Date: dt,
      }]
      record.notes = entry.notes;
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
          transfer: {
            fee: 0,
            from: entry.hash,
            timestamp: dt.toMillis(),
            value: entry.amount,
          } as any,
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
        },
        notes: entry.notes,
      })
      break;
    }
    default:
      throw new Error('unknown insertion type');
  }
}

function doConnectBank(entry: ConnectBankEntry, data: AllData, r: Reconciliations) {
  // Force connecting to a given record
  const { user, record } = findRecord(r, entry.hash, data);
  record.data.fiatDisbursed = entry.amount;
  record.data.completedTimestamp = Timestamp.fromMillis(DateTime.fromISO(entry.date).toMillis());
  record.action = entry.action as any;
  record.notes = entry.notes;
  record.bank = spliceBank(data, user, record, 1);
}

function doConnectBlockchain(entry: ConnectBlockchainEntry, data: AllData, r: Reconciliations) {
  // Force connecting to a given record
  const { user, record } = findRecord(r, entry.hash, data);
  record.refund = spliceBlockchain(data, user, record, entry.refund) ?? undefined;
  record.data.hashRefund = entry.refund;
}
