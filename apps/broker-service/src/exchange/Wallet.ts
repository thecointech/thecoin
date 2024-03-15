
import { getSigner } from '@thecointech/signers';
import { ConnectContract, GetContract as GetCore } from '@thecointech/contract-core';
import { NonceManager } from "@ethersproject/experimental";
import type { Signer } from '@ethersproject/abstract-signer';
import { Provider } from '@ethersproject/abstract-provider';

const walletName = 'BrokerTransferAssistant';
export const GetWallet = () => getSigner(walletName);
export const GetContract = async () => {
  const contract = await GetCore();
  const signer = await getNonceSafeSigner(contract.provider);
  return await ConnectContract(signer);
}

// NonceManager needs to be a singleton to ensure
// nonce is incremented correctly between different calls
let signerPromise: Promise<Signer> | null = null;
function getNonceSafeSigner(provider: Provider) {
  if (signerPromise === null) {
    signerPromise = new Promise<Signer>(async resolve => {
      const signer = await GetWallet();
      // The NonceManager is not recognized as a wallet,
      // and the ConnectContract call checks other signers
      // are connected to the same network as the contract
      const connected = signer.connect(provider);
      const manager = new NonceManager(connected);
      resolve(manager);
    });
  }
  return signerPromise;
}
