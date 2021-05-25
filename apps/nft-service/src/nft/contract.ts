import { getSigner } from '@thecointech/accounts';
import { connectNFT } from '@thecointech/nft-contract';

export async function getContract() {
  const signer = await getSigner("BrokerTransferAssistant");
  return connectNFT(signer);
}

export async function getMinterAddress() {
  if (process.env.NODE_ENV === 'production') {
    const {address} = await import('./minter.json');
    return address;
  }
  // for dev, get the account and return it's address
  const signer = await getSigner("NFTMinter");
  return signer.getAddress();
}
