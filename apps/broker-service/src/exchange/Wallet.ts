
import { getSigner } from '@thecointech/signers';
import { ConnectContract } from 'contract-core';

const walletName = 'BrokerTransferAssistant';
export const GetWallet = () => getSigner(walletName);
export const GetContract = async () => {
  const signer = await GetWallet();
  return ConnectContract(signer);
}

