import { Wallet } from 'ethers';
import { AccountMap } from '../Account/types';


/* --- ACTIONS --- */
interface IActions {
  setState(newState: AccountMap): void;
  setSingleWallet(name: string, wallet: Wallet): void;
  deleteWallet(name: string): void;
}
/* --- EXPORTS --- */
export { IActions };
