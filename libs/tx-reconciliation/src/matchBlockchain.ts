import { Transaction } from "@thecointech/tx-blockchain";
import { AllData, User } from "types";
import Decimal from 'decimal.js-light';;

// Next, the tx hash should match blockchain
export function spliceBlockchain(data: AllData, hash: string) {
  const bc = data.blockchain.find(bc => bc.txHash === hash);
  return (bc)
    ? data.blockchain.splice(data.blockchain.indexOf(bc), 1)[0]
    : null;
}

// Kept for posterity.  DB is required to record hash
export function findBlockchain(blockchain: Transaction[], user: User, amount: Decimal) {
  let candidates = blockchain.filter(bc => [bc.to, bc.from].includes(user.address));
  candidates = candidates.filter(bc => amount.eq(bc.value));

  if (candidates.length === 1)
    return candidates[0];

  return null;
}
