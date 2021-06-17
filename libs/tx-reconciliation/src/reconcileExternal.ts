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
import { AllData, Reconciliations, ReconciledRecord, BankRecord } from "types";

export function reconcileExternal(data: AllData) {

  // First, we review blockchain transactions to see if we can match any to email/bank
  const newEntries = reconcileBlockchain(data);
  return newEntries;
}

async function reconcileBlockchain(data: AllData) {
  throw new Error('Project not updated: complete work to update to new DB format');

  const users : Reconciliations= [];
  const skipAccounts = builtInAccounts.map(pair => NormalizeAddress(pair[1]));
  for (const bc of data.blockchain)
  {
    if (skipAccounts.includes(bc.counterPartyAddress))
      continue;

    const { user, record } = buildNewUserRecord(users, bc);

    // TODO
    // What was this transactions value in CAD
    //record.data.fiatDisbursed = await getFiat(record);

    // is there any bank transaction that matches this amount?
    record.bank = spliceBank(data, user, record, 5)
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
  // TODO: All of this!
  const action: any = {
    address: user.address,
    type,
    data: {
      initial: {} as any,
      initialId: "",
      timestamp: bc.date,
    }
  };
  const record: ReconciledRecord = {
    action,
    blockchain: bc,
    bank: [] as BankRecord[],
    database: null,
    email: null,
  } as ReconciledRecord;
  user.transactions.push(record);
  return { user, record };
}

// const buildTransfer = (action: ActionType, bc: Transaction) =>
//   action === "Buy"
//     ? buildBuyXfer(bc)
//     : buildSellXfer(bc);

// const buildBuyXfer = (bc: Transaction) => ({
//   value: -bc.change,
// })

// const buildSellXfer = (bc: Transaction) : CertifiedTransferRequest => ({
//   fee: 0,
//   from: bc.counterPartyAddress,
//   to: theCoin,  // We assume all sell xFers are being sold to us.
//   signature: "",
//   value: bc.change,
//   timestamp: bc.date.toMillis(),
// })
