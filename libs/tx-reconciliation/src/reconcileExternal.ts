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
import { getFiat } from "./fxrates";
import { AllData, Reconciliations, ReconciledRecord, BankRecord } from "types";
import { CertifiedTransferRequest } from "@the-coin/types";

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
  // Normally, our transactions are sent at the date of processing.
  // However, our blockchain transactions can include transactions where
  // the user directly transfers coin directly to us.  In these cases,
  // the date is the date of the transfer, not when it can be processed
  const processedTimestamp = (action === "Buy") ? dt : undefined;
  const record: ReconciledRecord = {
    action,
    data: {
      confirmed: true,
      hash: bc.txHash!,
      recievedTimestamp: dt,
      processedTimestamp,
      fiatDisbursed: 0,
      transfer: buildTransfer(action, bc)
    },
    blockchain: bc,
    bank: [] as BankRecord[],
  } as ReconciledRecord;
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
