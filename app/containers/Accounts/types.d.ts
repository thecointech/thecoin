import { Wallet, Contract } from 'ethers';
import { ImmerReducer } from 'immer-reducer';
import { ContainerState as AccountType } from './Account/types'

/* --- STATE --- */

type ContainerState = {
  wallets: Map<string, Wallet>;
};

/* --- ACTIONS --- */
interface IActions extends ImmerReducer<ContainerState> {
  setState(newState: ContainerState): void;
  setSingleWallet(name: string, wallet: Wallet): void;
  deleteWallet(name: string): void;
}
/* --- EXPORTS --- */
export { IActions, ContainerState };
