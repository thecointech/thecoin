import { Wallet, Contract } from 'ethers';
import { ImmerReducer } from 'immer-reducer';
import { ContainerState as AccountType } from './Account/types'

/* --- STATE --- */

type ContainerState = {
  accounts: Map<string, Wallet>;
  activeAccount: AccountType|null;
};

/* --- ACTIONS --- */
interface IActions extends ImmerReducer<ContainerState> {
  setState(newState: ContainerState): void;
  setSingleAccount(name: string, account: Wallet): void;
  setActiveAccount(name: string);
  deleteAccount(name: string): void;
}
/* --- EXPORTS --- */
export { IActions, ContainerState };
