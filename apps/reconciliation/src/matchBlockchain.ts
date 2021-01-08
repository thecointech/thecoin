import { AllData } from "./types";

// Next, the tx hash should match blockchain
export function spliceBlockchain(data: AllData, txHash: string) {
  const index = data.blockchain.findIndex(tx => tx.txHash === txHash)
  return (index !== -1)
    ? data.blockchain.splice(index, 1)[0]
    : null;
}
