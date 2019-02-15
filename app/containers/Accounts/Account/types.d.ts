import { Wallet, Contract } from 'ethers';
import { ImmerReducer } from 'immer-reducer';


/* --- CALLBACKS ---*/
type DecryptCallback = (percent: number) => boolean;


/* --- STATE --- */
type Transaction = {
	date: Date;
	change: number;
	logEntry: string;
}

type ContainerState = {
  name: string;
  wallet: Wallet;
  contract: Contract;
  balance: number;
  history: Transaction[];
};

/* --- ACTIONS --- */
interface IActions extends ImmerReducer<ContainerState> {

	// Get the balance of the account in Coin
	updateBalance() : void;
  updateHistory(from: Date, until: Date) : void;
  updateWithDecrypted(wallet: Wallet): void;

	
	decrypt(
		password: string,
		callback: DecryptCallback | undefined,
	  ): Iterator<any>;
}
/* --- EXPORTS --- */
export { IActions, ContainerState, Transaction, DecryptCallback };
