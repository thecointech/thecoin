//
// Reconcile transactions from external sources.
//
import { spliceBank } from "./matchBank";
import { UserAction } from "@the-coin/utilities/User";
import { Timestamp } from "@the-coin/utilities/firestore";
import { spliceEmail } from "./matchEmails";
import { getOrCreateUser } from "./utils";
import { NormalizeAddress } from "@the-coin/utilities";
import { builtInAccounts, theCoin } from './data/manual.json';
import { Transaction } from "@the-coin/tx-blockchain/";
import { getFiat, getSettlementDate } from "./fxrates";
import { AllData, Reconciliations, ReconciledRecord, BankRecord } from "types";
import { CertifiedTransferRequest } from "@the-coin/types";

export async function reconcileExternal(data: AllData) {

  // First, we review blockchain transactions to see if we can match any to email/bank
  const newEntries = await reconcileBlockchain(data);
  return newEntries;
}

async function reconcileBlockchain(data: AllData) {
  const users : Reconciliations= [];
  const skipAccounts = builtInAccounts.map(pair => NormalizeAddress(pair[1]));
  for (let i = data.blockchain.length - 1; i >= 0; i--) {
    const bc = data.blockchain[i];
    if (skipAccounts.includes(bc.counterPartyAddress))
      continue;

    const { record } = buildNewUserRecord(users, data, bc);

    // What was this transactions value in CAD
    if (!record.data.processedTimestamp) {
      const settled = await getSettlementDate(record);
      record.data.processedTimestamp = Timestamp.fromMillis(settled.getTime());
    }
    record.data.fiatDisbursed = await getFiat(record);

    // is there any bank transaction that matches this amount?
    // record.bank = spliceBank(data, user, record, 15)
    // record.email = spliceEmail(data, user, record, 30);
  };

  for (let i = 0; i < 30; i++ ) {
    for (const user of users) {
      for (const record of user.transactions) {
        // is there any bank transaction that matches this amount?
        if (record.bank.length == 0)
          record.bank = spliceBank(data, user, record, i)
        record.email = record.email ?? spliceEmail(data, user, record, i);
      }
    }
  }
  // All blockchain records have been converted
  // Mark this data source as empty.
  data.blockchain = [];
  return users;
}

export function buildNewUserRecord(users: Reconciliations, data: AllData, bc: Transaction) {
  const user = getOrCreateUser(users, bc.counterPartyAddress);
  const action: UserAction = bc.change > 0 ? "Sell" : "Buy";
  const bcDate = Timestamp.fromMillis(bc.date.toMillis());
  // Normally, our transactions are sent at the date of processing.
  // However, our blockchain transactions can include transactions where
  // the user directly transfers coin directly to us.  In these cases,
  // the date is the date of the transfer, not when it can be processed

  // const processedTimestamp = bc.completed
  //     ? Timestamp.fromMillis(bc.completed.toMillis())
  //     : undefined;
  const record: ReconciledRecord = {
    action,
    data: {
      confirmed: true,
      hash: bc.txHash!,
      recievedTimestamp: bcDate,
      fiatDisbursed: 0,
      transfer: buildTransfer(action, bc)
    },
    blockchain: bc,
    bank: [] as BankRecord[],
  } as ReconciledRecord;

  // If we have a 'completed' record, that is when the date when the
  // the transaction was logged to the blockchain.  The 'date' in that
  // case becomes the time when the transaction 'happened' (processed for)
  if (bc.completed) {
    const completed = Timestamp.fromMillis(bc.completed.toMillis());
    record.data.completedTimestamp = completed;
    record.data.recievedTimestamp = bcDate; // cannot be before bcDate
    record.data.processedTimestamp = bcDate;
  }

  data.blockchain.splice(data.blockchain.indexOf(bc), 1)
  user.transactions.push(record);
  return { user, record };
}

const buildTransfer = (action: UserAction, bc: Transaction) =>
  action === "Buy"
    ? buildBuyXfer(bc)
    : buildSellXfer(bc);

const buildBuyXfer = (bc: Transaction) => ({
  value: -bc.change,
})

const buildSellXfer = (bc: Transaction) : CertifiedTransferRequest => ({
  fee: 0,
  from: bc.counterPartyAddress,
  to: theCoin,  // We assume all sell xFers are being sold to us.
  signature: "",
  value: bc.change,
  timestamp: bc.date.toMillis(),
})
