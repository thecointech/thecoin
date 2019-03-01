import { Wallet, Contract } from 'ethers';
import { ImmerReducer } from 'immer-reducer';

import { CurrencyCodes } from '@the-coin/utilities/lib/CurrencyCodes'
/* --- CALLBACKS ---*/
type DecryptCallback = (percent: number) => boolean;


/* --- STATE --- */
type Transaction = {
	date: Date;
	change: number;
	logEntry: string;
}

type ContainerState = {
	name: string; // Convenience storage of name
	// Possibly encrypted raw ethers wallet
	wallet: Wallet;
	// Contract connected to this wallet as a signer
	contract: Contract|null;
	// The timestamp of the last update to balance/history
	lastUpdate: number;
	// Current balance in Coin
	balance: number;
	// Transaction history
	history: Transaction[];
	// The currency to display your account value in
	displayCurrency: CurrencyCodes;
};

/* --- ACTIONS --- */
interface IActions extends ImmerReducer<ContainerState> {

	// Get the balance of the account in Coin
	updateBalance(newBalance?: number) : void;
  updateHistory(from: Date, until: Date) : void;

	decrypt(
		password: string,
		callback: DecryptCallback | undefined,
	  ): Iterator<any>;
}
/* --- EXPORTS --- */
export { IActions, ContainerState, Transaction, DecryptCallback };
