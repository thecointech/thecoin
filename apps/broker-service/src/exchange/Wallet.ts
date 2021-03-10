
import { getContract, getSigner } from '@the-coin/utilities/blockchain';

const walletName = 'BrokerTransferAssistant';
export const GetWallet = () => getSigner(walletName);
export const GetContract = () => getContract(walletName);

