//
// Reconcile transactions from external sources.
//
import { ActionType } from "@thecointech/broker-db";
import { spliceEmail } from "./matchEmails";
import { getOrCreateUser } from "./utils";
import { Transaction } from "@thecointech/tx-blockchain/";
import { AllData, Reconciliations, ReconciledRecord } from "types";
import { fetchFiat } from './fxrates';
import { skipAccounts } from './accounts';
import { DateTime } from 'luxon';

export function reconcileExternal(data: AllData) {
  // First, we review blockchain transactions to see if we can match any to email/bank
  const newEntries = reconcileBlockchain(data);
  return newEntries;
}

async function reconcileBlockchain(data: AllData) {
  const users : Reconciliations= [];


  for (const bc of data.blockchain)
  {
    const skipFrom = skipAccounts.includes(bc.from);
    const skipTo = skipAccounts.includes(bc.to)
    // XOR skip from/to.  Skip purely internal & purely external txs
    if (skipFrom && skipTo || !(skipFrom && skipTo))
      continue;

    const { user, record } = await buildNewUserRecord(users, bc);

    // is there any bank transaction that matches this amount?
    // record.bank = [spliceBank(data, user, record.data.fiat!, record.data.initiated, 5)];
    throw new Error("Any missed transactions should be fixed!")
    record.email = spliceEmail(data, user, record, 30);
  };
  return users;
}

export async function buildNewUserRecord(users: Reconciliations, bc: Transaction) {
  const user = getOrCreateUser(users, bc.counterPartyAddress);
  const type: ActionType = bc.change > 0 ? "Sell" : "Buy";
  // Normally, our transactions are sent at the date of processing.
  // However, our blockchain transactions can include transactions where
  // the user directly transfers coin directly to us.  In these cases,
  // the date is the date of the transfer, not when it can be processed
  const data = {
    type,
    id: bc.txHash,
    initiated: bc.date,
    coin: bc.value,
    fiat: await fetchFiat(bc.value, type, bc.date),
    history: [{
      delta: {
        type: "unknown",
        coin: bc.value,
        created: DateTime.now()
      },
      state: {
        type: "initial",
        created: DateTime.now()
      },
      blockchain: bc,
      bank: undefined,
    }]
  };
  const record: ReconciledRecord = {
    data,
    database: null,
    email: null,
  };
  user.transactions.push(record);
  return { user, record };
}
