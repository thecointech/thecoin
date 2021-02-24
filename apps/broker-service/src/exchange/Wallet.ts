
import { getContract, getWallet } from '@the-coin/utilities/Wallets';

const walletName = 'BrokerTransferAssistant';
export const GetWallet = () => getWallet(walletName);
export const GetContract = () => getContract(walletName);

