import { Reconciliations, AllData, ReconciledRecord } from "./types.js";
import { getFiat } from './fxrates.js';
import { Transaction, isInternalAddress } from '@thecointech/tx-blockchain';

//
// Does all our data match?  Return true if so.
export async function verify(r: Reconciliations, data: AllData) {
  for (const user of r) {
    user.transactions.sort((l, r) => r.data.initiated.toMillis() - l.data.initiated.toMillis());
  }

  return (
    verifyEmails(data) &&
    verifyBlockchain(data) &&
    verifyBank(data) &&
    await verifyReconciled(r)
  );
}

function verifyEmails(data: AllData) {
  const verified = data.eTransfers.length == 0
  console.log(verified ? "Email Verified" : "Unmatched emails found")
  return verified;
}

// XOR skip from/to.  Skip purely internal & purely external txs
const isExternal = (bc: Transaction) =>
  !(isInternalAddress(bc.from) == isInternalAddress(bc.to))

function verifyBlockchain(data: AllData) {
  const external = data.blockchain.filter(isExternal)
  const verified = external.length == 0;
  console.log(verified ? "Blockchain Verified" : "Unmatched blockchain transfers found");
  return verified;
}

function verifyBank(data: AllData) {
  const unmatchedTransfers = data.bank.filter(tx => (
    tx.Description.startsWith("e-Transfer sent") &&
    tx.Description.startsWith("e-Transfer sent")
  ));
  const verified = unmatchedTransfers.length == 0;
  console.log(verified ? "Bank Verified" : "Unmatched bank transfers found");
  // TODO: Once we have transitioned off the RBC bank account,
  // we can also verify there are no un-matched transfers
  return true;
  //return verified;
}

export const isComplete = (tx: ReconciledRecord) =>
  !(
    tx.data.history.find(h => h.bank === null || h.blockchain === null) ||
    tx.database == null
  )

async function verifyReconciled(r: Reconciliations) {
  // All purchases should be matched
  const unMatched = r
    .map(r => ({
      ...r,
      transactions: r.transactions
        .filter(tx => !isComplete(tx))
    })).filter(um => um.transactions.length > 0);

  for (const um of unMatched) {
    for (const umtx of um.transactions) {
      const {history} = umtx.data;
      const email = umtx.email || umtx.data.type !== "Buy" ? "" : " Email";
      const blockchain = history.find(h => h.blockchain === null) ? " blockchain" : "";
      const bank = history.find(h => h.bank === null) ? " bank" : "";
      const db = umtx.database ? "" : " db";

      const fiat = await getFiat(umtx);
      console.log(`${umtx.data.initiated.toSQLDate()} ${umtx.data.type} ${um.names} - ${fiat}, missing ${email}${blockchain}${bank}${db}`);
    }
  }
  const verified = unMatched.length == 0;
  console.log(verified ? "Database Verified" : "Unmatched database actions found");
  return verified;
}
