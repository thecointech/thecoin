import { Wallet, Contract } from 'ethers';
import encrypted from './BrokerTransferAssistantWallet.json';
import { key } from './secret.json';
import { ConnectContract } from '@the-coin/contract/'

let TCWallet: Wallet | null = null;
let ConnectedContract: Contract | null = null;

async function GetWallet(): Promise<Wallet> {
  if (!TCWallet) {
    TCWallet = await Wallet.fromEncryptedJson(JSON.stringify(encrypted), key);
    if (!TCWallet) {
      throw "Cannot load wallet for some reason";
    }
  }
  return TCWallet;
}

async function GetContract(): Promise<Contract> {
  if (!ConnectedContract) {
    let wallet = await GetWallet();
    ConnectedContract = await ConnectContract(wallet);
    if (!ConnectedContract)
      throw "Could not connect to Contract";
  }
  return ConnectedContract;
}

export { GetWallet, GetContract }
