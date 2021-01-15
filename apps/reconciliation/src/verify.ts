import { findBank } from "./matchBank";
import { AllData, Reconciliations } from "./types";
import { builtInAccounts, knownIssues } from './data/manual.json';
import { NormalizeAddress } from "@the-coin/utilities/Address";
import { getFiat } from "./fxrates";

export async function verify(r: Reconciliations, data: AllData, original: AllData) {
  for (const user of r) {
    user.transactions.sort((l, r) => r.data.recievedTimestamp.toMillis() - l.data.recievedTimestamp.toMillis());
  }

  await printUnmatched(r, original);
  matchLooseEmails(r, data);

}

function matchLooseEmails(_r: Reconciliations, data: AllData) {
  data.eTransfers.forEach(et => {
    // any matches in bank?
    const bank = findBank(data, 40, et.cad.toNumber(), et.recieved);
    if (bank) {
      // can we find a block chain for this?
      const blockchain = data.blockchain.filter(bc => bc.counterPartyAddress == et.address);
      console.log(blockchain.length);
      console.log("BUILD THE REST OF YO SHIT!");
    }
    console.error('UHOH');
  })
}

async function printUnmatched(r: Reconciliations, _original: AllData) {
  const skipAccounts = builtInAccounts.map(pair => NormalizeAddress(pair[1]));
  // All purchases should be matched
  const unMatched = r
    .filter(r => !skipAccounts.includes(r.address))
    .map(r => ({
      ...r,
      transactions: r.transactions
        .filter(tx => !knownIssues.find(ki => ki.hash == tx.data.hash))
        .filter(tx =>
          (tx.action == "Buy" && tx.email == null) ||
          (tx.refund == null && tx.bank == null) ||
          tx.blockchain == null)
    })).filter(um => um.transactions.length > 0);

  for (const um of unMatched) {
    for (const umtx of um.transactions) {
      const email = umtx.email || umtx.action != "Buy" ? "" : " Email";
      const blockchain = umtx.blockchain ? "" : " blockchain";
      const bank = umtx.bank ? "" : " bank";
      const db = umtx.database ? "" : " db";

      const fiat = await getFiat(umtx);
      console.log(`${umtx.data.recievedTimestamp.toDate()} ${umtx.action} ${um.names} - ${fiat}, missing ${email}${blockchain}${bank}${db}`);
    }
  }
}

