import manual from './data/manual.json';
import { DateTime } from "luxon";
import Decimal from "decimal.js-light";
import { spliceBank } from "./matchBank";
import { Timestamp } from "@the-coin/utilities/firestore";
import { buildNewUserRecord } from "./reconcileExternal";

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
  throw new Error('Cannot find entry');
}

function doInsert(entry: InsertEntry, r: Reconciliations) {
  const { user, record } = findRecord(r, entry.hash);
  switch (entry.where) {
    case 'email':
      record.email = {
        name: user.names[0],
        id: (entry as any).sourceId,
        cad: new Decimal(entry.amount),
        address: user.address,
        recieved: DateTime.fromISO(entry.date),
        email: "Manual Entry - not set",
        depositUrl: "Manual Entry - not set",
      }
      break;
    case 'bank':
      (record.data as any).type = 'deposit';
      record.bank = [{
        Amount: entry.amount,
        Description: "Manual Entry",
        Details: "USD",
        Date: DateTime.fromISO(entry.date),
      }]
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
