import { AllData, ReconciledRecord, Reconciliations, User } from "./types";
import manual from './data/manual.json';
import { DateTime } from "luxon";
import Decimal from "decimal.js-light";
import { spliceBank } from "./matchBank";
import { Timestamp } from "@the-coin/utilities/firestore";

type ManualEntry = typeof manual[0];
export function matchManual(r: Reconciliations, data: AllData) {
  for (const entry of manual) {
    const ru = findRecord(r, entry.hash);
    if (ru) {
      const { user, record } = ru;
      switch (entry.do) {
        case "insert": doInsert(entry, user, record); break;
        case "connect": doConnect(entry, data, user, record); break;
      }
    }
  }
}

function findRecord(r: Reconciliations, hash: string) {
  for (const user of r)
    for (const record of user.transactions)
      if (record.data.hash == hash)
        return { user, record };
  return undefined;
}

function doInsert(entry: ManualEntry, user: User, record: ReconciledRecord) {
  if (entry.where == 'email') {
    record.email = {
      name: user.names[0],
      id: entry.sourceId,
      cad: new Decimal(entry.amount),
      address: user.address,
      recieved: DateTime.fromISO(entry.date),
      email: "Manual Entry - not set",
      depositUrl: "Manual Entry - not set",
    }
  }
}

function doConnect(entry: ManualEntry, data: AllData, user: User, record: ReconciledRecord) {
  // Force connecting to a given record
  if (entry.where == "bank") {
    record.bank = spliceBank(data, user, {
      data: {
        fiatDisbursed: entry.amount,
        completedTimestamp: Timestamp.fromMillis(DateTime.fromISO(entry.date).toMillis()),
      },
      action: entry.action,
    } as any, 1);
  }
}
