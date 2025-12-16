import { getSigner } from '@thecointech/signers';
import { ContractNFT } from '@thecointech/contract-nft';

export async function getContract() {
  const signer = await getSigner("BrokerTransferAssistant");
  return ContractNFT.connect(signer);
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
