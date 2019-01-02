import { Wallet } from 'ethers';
import { ImmerReducer } from 'immer-reducer';

/* --- STATE --- */
type ContainerState = Map<string, Wallet>;

/* --- ACTIONS --- */
interface IActions extends ImmerReducer<ContainerState> {
  setAllAccounts(newState: ContainerState): void;
  setSingleAccount(name: string, account: Wallet): void;
  deleteAccount(name: string): void;
}
/* --- EXPORTS --- */
export { IActions, ContainerState };
