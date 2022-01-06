//
// Reconcile transactions from external sources.
//
import { spliceBank } from "./matchBank";
import { ActionType } from "@thecointech/broker-db";
import { spliceEmail } from "./matchEmails";
import { getOrCreateUser } from "./utils";
import { NormalizeAddress } from "@thecointech/utilities";
import { builtInAccounts } from './data/manual.json';
import { Transaction } from "@thecointech/tx-blockchain/";
import { AllData, Reconciliations, ReconciledRecord } from "types";
import { getFiat } from './fxrates';

export function reconcileExternal(data: AllData) {

  // First, we review blockchain transactions to see if we can match any to email/bank
  const newEntries = reconcileBlockchain(data);
  return newEntries;
}

async function reconcileBlockchain(data: AllData) {
  const users : Reconciliations= [];
  const skipAccounts = builtInAccounts.map(pair => NormalizeAddress(pair[1]));
  for (const bc of data.blockchain)
  {
    if (skipAccounts.includes(bc.counterPartyAddress))
      continue;

    const { user, record } = buildNewUserRecord(users, bc);

    // TODO
    // What was this transactions value in CAD
    //record.data.fiatDisbursed =

    // is there any bank transaction that matches this amount?
    const transition = {
      type: "temporary",
      created: bc.date,
      date: bc.date,
      fiat: await getFiat(record)
    }
    record.bank = [spliceBank(data, user, transition, record.data.type, 5)];
    record.email = spliceEmail(data, user, record, 30);
  };
  return users;
}

export function buildNewUserRecord(users: Reconciliations, bc: Transaction) {
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
  };
  const record: ReconciledRecord = {
    data,
    blockchain: [bc],
    bank: [null],
    database: null,
    email: null,
  };
  user.transactions.push(record);
  return { user, record };
}
