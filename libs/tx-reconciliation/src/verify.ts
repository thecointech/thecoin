import { findBank } from "./matchBank";

import { Reconciliations, AllData, ReconciledRecord } from "./types";
import { getFiat } from './fxrates';

export async function verify(r: Reconciliations, data: AllData) {
  for (const user of r) {
    user.transactions.sort((l, r) => r.data.initiated.toMillis() - l.data.initiated.toMillis());
  }

  await printUnmatched(r);
  matchLooseEmails(r, data);
}

function matchLooseEmails(_r: Reconciliations, data: AllData) {
  data.eTransfers.forEach(et => {
    // any matches in bank?
    const bank = findBank(data, 40, et.cad, et.recieved);
    if (bank) {
      // can we find a block chain for this?
      const blockchain = data.blockchain.filter(bc => bc.counterPartyAddress === et.address);
      console.log(blockchain.length);
      console.log("BUILD THE REST OF YO SHIT!");
    }
    console.error('UHOH');
  })
}

export const isComplete = (tx: ReconciledRecord) =>
  !(
    tx.data.history.find(h => h.bank === null || h.blockchain === null)
  )

async function printUnmatched(r: Reconciliations) {
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

  return unMatched.length > 0;
}
