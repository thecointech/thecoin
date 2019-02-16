import { Wallet, Contract } from 'ethers';
import { ImmerReducer } from 'immer-reducer';
import { ContainerState as Account } from '../Account/types'

/* --- STATE --- */

type ContainerState = {
  accounts: Map<string, Account>;
  activeAccount: Account|null;
};

/* --- ACTIONS --- */
interface IActions extends ImmerReducer<ContainerState> {
  setActiveAccount(name: string, wallet: Wallet);
}
/* --- EXPORTS --- */
export { IActions, ContainerState };
