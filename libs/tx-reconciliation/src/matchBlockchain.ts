import { Transaction } from "@thecointech/tx-blockchain";
import { AllData, User } from "types";
import { Decimal } from "decimal.js-light";

// Next, the tx hash should match blockchain
export function spliceBlockchain(data: AllData, user: User, amount: Decimal, hash?: string) {
  const bc = findBlockchain(data.blockchain, user, amount, hash);
  return (bc)
    ? data.blockchain.splice(data.blockchain.indexOf(bc), 1)[0]
    : null;
}

function findBlockchain(blockchain: Transaction[], user: User,  amount: Decimal, hash?: string) {
  const bc = blockchain.find(bc => bc.txHash === hash)
  if (bc || hash?.startsWith('0x'))
    return bc;

  // Some blockchain transactions were recorded without hash!
  let candidates = blockchain.filter(bc => bc.counterPartyAddress === user.address);
  candidates = candidates.filter(bc => amount.eq(bc.value));

  if (candidates.length === 1)
    return candidates[0];

  return null;
}
