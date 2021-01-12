import { findBank } from "./matchBank";
import { AllData, Reconciliations } from "./types";


export function verify(r: Reconciliations, data: AllData) {
  printUnmatched(r);
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
function printUnmatched(r: Reconciliations) {
  // All purchases should be matched
  const unMatched = r.map(r => ({
    ...r,
    transactions: r.transactions.filter(tx =>
      (tx.action == "Buy" && tx.email == null) ||
      (tx.refund == null && tx.bank == null) ||
      tx.blockchain == null)
  })).filter(um => um.transactions.length > 0);
  for (const um of unMatched) {
    for (const umtx of um.transactions) {
      const email = umtx.email || umtx.action != "Buy" ? "" : " Email";
      const blockchain = umtx.blockchain ? "" : " blockchain";
      const bank = umtx.bank ? "" : " bank";
      console.log(`${umtx.data.recievedTimestamp.toDate()} ${umtx.action} ${um.names} - ${umtx.data.fiatDisbursed}, missing ${email}${blockchain}${bank}`)
    }
  }
}
