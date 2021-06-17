import { getSigner } from '@thecointech/accounts';
import { connectNFT } from '@thecointech/nft-contract';

export async function getContract() {
  const signer = await getSigner("BrokerTransferAssistant");
  return connectNFT(signer);
}

export async function getMinterAddress() {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.WALLET_NFTMinter_ADDRESS)
      throw new Error('Minter Address no specified');
    return process.env.WALLET_NFTMinter_ADDRESS
  }
  // for dev, get the account and return it's address
  const signer = await getSigner("NFTMinter");
  return signer.getAddress();
}
