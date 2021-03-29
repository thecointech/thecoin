
import { getContract, getSigner } from '@thecointech/accounts';

const walletName = 'BrokerTransferAssistant';
export const GetWallet = () => getSigner(walletName);
export const GetContract = () => getContract(walletName);

