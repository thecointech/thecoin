import { findBank } from "./matchBank";
import { builtInAccounts, knownIssues } from './data/manual.json';
import { NormalizeAddress } from "@the-coin/utilities/Address";
import { getFiat } from "./fxrates";
import { Reconciliations, AllData, ReconciledRecord, UserReconciled } from "./types";
import { GetContract } from "@the-coin/contract";
//import { buildNewUserRecord } from './reconcileExternal';

export async function verify(r: Reconciliations, data: AllData) {
  for (const user of r) {
    user.transactions.sort((l, r) => r.data.recievedTimestamp.toMillis() - l.data.recievedTimestamp.toMillis());
  }
  await matchLooseEmails(r, data);
  await printUnmatched(r);
}

async function matchLooseEmails(r: Reconciliations, data: AllData) {
  for (const et of data.eTransfers) {
    // any matches in bank?
    const bank = findBank(data, 40, et.cad.toNumber(), et.recieved);
    if (bank) {
      // can we find a block chain for this
      const user = r.find(u => u.address == et.address);
      console.log(user?.names)
      // const bc = blockchain[0];
      //   const fiat = await fetchFiat(bc.change, "Sell", bc.date.toJSDate());
      //   if (fiat == bank.Amount) {
      //     const record = buildNewUserRecord(r, data, bc);
      //     record.record.bank.push(bank);
      //     data.bank.splice(data.bank.indexOf(bank), 1)
      //     continue;
      //   }
      // }
      console.log("BUILD THE REST OF YO SHIT!");
    }
  }
}

const missingEmail = (tx: ReconciledRecord) => (
    tx.action === "Buy" &&
    (tx.data as any).type == 'etransfer' &&
    tx.email === null
  )

const missingBank = (tx: ReconciledRecord) => (
  (tx.data as any).type != "other" &&
  tx.bank.length % 2 == 0 &&
  !tx.refund
)

const missingBlockchain = (tx: ReconciledRecord) => !tx.blockchain;

const missingBankOrBlockchain = (tx: ReconciledRecord) => (
  (missingBank(tx) && !missingBlockchain(tx)) ||
  (missingBlockchain(tx) && !missingBank(tx))
)


const isComplete = (tx: ReconciledRecord) =>
  knownIssues.find(ki => ki.hash === tx.data.hash) ||
  !(
    missingEmail(tx) ||
    missingBankOrBlockchain(tx)
  )

const findNames = (user: UserReconciled) =>
  user.names.length
  ? user.names
  : user.transactions
      .find(tx =>
          tx.bank.find(b => b.Description == "e-Transfer sent")
        )
      ?.bank[0].Details

async function printUnmatched(r: Reconciliations) {
  const contract = await GetContract()
  const skipAccounts = builtInAccounts.map(pair => NormalizeAddress(pair[1]));
  // All purchases should be matched
  const unMatched = r
    .filter(r => !skipAccounts.includes(r.address))
    .map(r => ({
      ...r,
      transactions: r.transactions
        .filter(tx => !isComplete(tx))
    }))
    .filter(um => um.transactions.length > 0)

  for (const um of unMatched) {
    // get the original for references sake
    const [original] = r.filter(src => src.address == um.address);
    const final = original.transactions
      .map(tx => tx.blockchain)
      .filter(bc => !!bc)
      .reduce((acc, blockchain) => acc - ((blockchain?.change ?? 0) + 5000) , 0)
    const ct = (await contract.balanceOf(um.address)).toNumber();
    const names =findNames(original);
    console.log(`-- ${names} - ${um.address} --`)
    console.log(`Calculated: ${final} - Contract: ${ct}`)

    for (const umtx of um.transactions) {
      if (Date.now() - umtx.data.recievedTimestamp.toMillis() < 24 * 60 * 60 * 1000)
        continue;

      const email = missingEmail(umtx) ? " Email" : "";
      const blockchain = umtx.blockchain ? "" : " blockchain";
      const bank = umtx.bank.length % 2 === 1 ? "" : " bank";
      const db = umtx.database ? "" : " db";

      const fiat = await getFiat(umtx);
      console.log(`${umtx.data.recievedTimestamp.toDate()} ${umtx.action} - ${fiat}, missing ${email}${blockchain}${bank}${db}`);
    }
  }
}
