import { Transaction } from "@thecointech/tx-blockchain/";
import { AllData, User, ReconciledRecord } from "types";

// Next, the tx hash should match blockchain
export function spliceBlockchain(data: AllData, user: User, record: ReconciledRecord, hash: string) {
  const bc = findBlockchain(data.blockchain, user, record.data, hash);
  return (bc)
    ? data.blockchain.splice(data.blockchain.indexOf(bc), 1)[0]
    : null;
}

function findBlockchain(blockchain: Transaction[], user: User, tx: any, hash: string) {
  const bc = blockchain.find(bc => bc.txHash === hash)
  if (bc || tx.hash.startsWith('0x'))
    return bc;

  // Some blockchain transactions were recorded without hash!
  let candidates = blockchain.filter(bc => bc.counterPartyAddress === user.address);
  candidates = candidates.filter(bc => bc.change === tx.transfer.value);

  if (candidates.length === 1)
    return candidates[0];

  return null;
}
