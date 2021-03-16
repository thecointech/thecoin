
import { getContract, getSigner } from '@the-coin/accounts';

const walletName = 'BrokerTransferAssistant';
export const GetWallet = () => getSigner(walletName);
export const GetContract = () => getContract(walletName);

