import { Wallet } from 'ethers';
import { ImmerReducer } from 'immer-reducer';

/* --- CALLBACKS ---*/
export type DecryptCallback = (percent: number) => boolean;

/* --- STATE --- */
type ContainerState = {
  accounts: Map<string, Wallet>;
  activeAccount: Wallet | null;
};

/* --- ACTIONS --- */
interface IActions extends ImmerReducer<ContainerState> {
  setState(newState: ContainerState): void;
  setSingleAccount(name: string, account: Wallet): void;
  deleteAccount(name: string): void;

  setActiveAccount(name: string) : void;
  getActiveAccount() : Wallet|null;

  decryptAccount(
    name: string,
    password: string,
    callback: DecryptCallback | undefined,
  ): Iterator<any>;
}
/* --- EXPORTS --- */
export { IActions, ContainerState };
