
import { getSigner } from '@thecointech/signers';
import { ConnectContract } from '@thecointech/contract-core';

const walletName = 'BrokerTransferAssistant';
export const GetWallet = () => getSigner(walletName);
export const GetContract = async () => {
  const signer = await GetWallet();
  return await ConnectContract(signer);
}

