import { Wallet, Contract } from 'ethers';
import { ImmerReducer } from 'immer-reducer';

import { CurrencyCodes } from '@the-coin/utilities/lib/CurrencyCodes'
/* --- CALLBACKS ---*/
type DecryptCallback = (percent: number) => boolean;


/* --- STATE --- */
type Transaction = {
	txHash: string;
	date: Date;
	change: number;
	logEntry: string;
	balance: number;
}

// An account state holds all relevant info
// for an account, including loaded transactions etc
type ContainerState = {
	name: string; // Convenience storage of name
	// Possibly encrypted raw ethers wallet
	wallet: Wallet;
	// Contract connected to this wallet as a signer
	contract: Contract | null;
	// The timestamp of the last update to balance/history
	lastUpdate: number;
	// Current balance in Coin
	balance: number;
	// Transaction history
	history: Transaction[];
	// The currency to display your account value in
	displayCurrency: CurrencyCodes;

	// cache values to remember the date range we
	// have stored, and corresponding block numbers
	historyLoading?: boolean;
	historyStart?: Date;
	historyStartBlock?: number;
	historyEnd?: Date;
	historyEndBlock?: number;
};

/* --- ACTIONS --- */
interface IActions extends ImmerReducer<ContainerState> {

	setName(name: string) : void;
	setWallet(wallet: Wallet): void;

	// Get the balance of the account in Coin
	updateBalance(newBalance?: number) : Iterator<any>;
	updateHistory(from: Date, until: Date) : Iterator<any>;

	registerTransferOut(email: string, brokerAddress: string, value: number, fee: number, timestamp: number);

	decrypt(password: string, callback: DecryptCallback | undefined): Iterator<any>;
}
/* --- EXPORTS --- */
export { IActions, ContainerState, Transaction, DecryptCallback };
