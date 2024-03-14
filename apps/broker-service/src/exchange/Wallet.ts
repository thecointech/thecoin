
import { getSigner } from '@thecointech/signers';
import { ConnectContract } from '@thecointech/contract-core';
import { NonceManager } from "@ethersproject/experimental";
import type { Signer } from '@ethersproject/abstract-signer';

const walletName = 'BrokerTransferAssistant';
export const GetWallet = () => getSigner(walletName);
export const GetContract = async () => {
  const signer = await getNonceSafeSigner();
  return await ConnectContract(signer);
}

// NonceManager needs to be a singleton to ensure
// nonce is incremented correctly between different calls
let signerPromise: Promise<Signer> | null = null;
function getNonceSafeSigner() {
  if (signerPromise === null) {
    signerPromise = new Promise<Signer>(async resolve => {
      const signer = await GetWallet();
      resolve(new NonceManager(signer));
    });
  }
  return signerPromise;
}
