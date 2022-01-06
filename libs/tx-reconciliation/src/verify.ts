import { findBank } from "./matchBank";
import { builtInAccounts, knownIssues } from './data/manual.json';
import { NormalizeAddress } from "@thecointech/utilities/Address";
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
  knownIssues.find(ki => tx.database?.history.find(tr => tr.hash === ki.hash)) ||
  !(
    (tx.data.type === "Buy" && tx.email === null) ||
    tx.bank.includes(null) ||
    tx.blockchain.includes(null)
  )

async function printUnmatched(r: Reconciliations) {
  const skipAccounts = builtInAccounts.map(pair => NormalizeAddress(pair[1]));
  // All purchases should be matched
  const unMatched = r
    .filter(r => !skipAccounts.includes(r.address))
    .map(r => ({
      ...r,
      transactions: r.transactions
        .filter(tx => !isComplete(tx))
    })).filter(um => um.transactions.length > 0);

  for (const um of unMatched) {
    for (const umtx of um.transactions) {
      const email = umtx.email || umtx.data.type !== "Buy" ? "" : " Email";
      const blockchain = umtx.blockchain ? "" : " blockchain";
      const bank = umtx.bank.length % 2 === 1 ? "" : " bank";
      const db = umtx.database ? "" : " db";

      const fiat = await getFiat(umtx);
      console.log(`${umtx.data.initiated.toSQLDate()} ${umtx.data.type} ${um.names} - ${fiat}, missing ${email}${blockchain}${bank}${db}`);
    }
  }
}
