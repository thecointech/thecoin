//
// Reconcile transactions from external sources.
//

import { AllData, ReconciledRecord, Reconciliations } from "types";
import { spliceBank } from "./matchBank";
import { UserAction } from "@the-coin/utilities/User";
import { Timestamp } from "@the-coin/utilities/firestore";
import { spliceEmail } from "./matchEmails";
import { getOrCreateUser } from "./utils";
import { NormalizeAddress } from "@the-coin/utilities";
import { builtInAccounts } from './data/manual.json';
import { Transaction } from "@the-coin/tx-blockchain/";
import { getFiat } from "./fxrates";

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

    // What was this transactions value in CAD
    record.data.fiatDisbursed = await getFiat(record);

    // is there any bank transaction that matches this amount?
    record.bank = spliceBank(data, user, record, 5)
    record.email = spliceEmail(data, user, record, 30);
  };
  return users;
}

export function buildNewUserRecord(users: Reconciliations, bc: Transaction) {
  const user = getOrCreateUser(users, bc.counterPartyAddress);
  const action: UserAction = bc.change > 0 ? "Sell" : "Buy";
  const dt = Timestamp.fromMillis(bc.date.toMillis());
  const record: ReconciledRecord = {
    action,
    data: {
      confirmed: true,
      hash: bc.txHash!,
      recievedTimestamp: dt,
      completedTimestamp: dt,
      fiatDisbursed: 0,
      transfer: { value: bc.change },
    },
    blockchain: bc,
  } as ReconciledRecord;
  user.transactions.push(record);
  return { user, record };
}
