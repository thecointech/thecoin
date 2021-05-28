import { getSigner } from '@thecointech/accounts';
import { connectNFT } from '@thecointech/nft-contract';

export async function getContract() {
  const signer = await getSigner("BrokerTransferAssistant");
  return connectNFT(signer);
}
