import { Wallet, Contract } from 'ethers';
import encrypted from './BrokerTransferAssistantWallet.json';
import { key } from './secret.json';
import {TheContract} from '@the-coin/utilities';
import { GetAccountCode as GetAccountCodeBase } from '@the-coin/utilities/Referrals';

let TCWallet: Wallet|null = null;
let ConnectedContract: Contract|null = null;

async function GetWallet() : Promise<Wallet> {
	if (!TCWallet) {
		TCWallet = await Wallet.fromEncryptedJson(JSON.stringify(encrypted), key);
		if (!TCWallet)
		{
			throw "Cannot load wallet for some reason";
		}
	}
	return TCWallet;
}

async function GetContract() : Promise<Contract> {
	if (!ConnectedContract) {
		let wallet = await GetWallet();
		ConnectedContract = await TheContract.ConnectContract(wallet);
		if (!ConnectedContract)
			throw "Could not connect to Contract";
	}
	return ConnectedContract;
}

export async function GetAccountCode(address: string)
{
  const wallet = await GetWallet();
  // generate this signers secret key
  return GetAccountCodeBase(address, wallet);
}

export { GetWallet, GetContract }