
import { getSigner } from '@thecointech/accounts';
import { ConnectContract } from '@thecointech/contract';

const walletName = 'BrokerTransferAssistant';
export const GetWallet = () => getSigner(walletName);
export const GetContract = async () => {
  const signer = await GetWallet();
  return ConnectContract(signer);
}

