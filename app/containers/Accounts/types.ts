import { Wallet } from 'ethers';
import { ImmerReducer } from 'immer-reducer';

/* --- CALLBACKS ---*/
export type DecryptCallback = (percent: number) => boolean;

/* --- STATE --- */
type ContainerState = {
  accounts: Map<string, Wallet>;
};

/* --- ACTIONS --- */
interface IActions extends ImmerReducer<ContainerState> {
  setAllAccounts(newState: ContainerState): void;
  setSingleAccount(name: string, account: Wallet): void;
  deleteAccount(name: string): void;

  decryptAccount(
    name: string,
    password: string,
    callback: DecryptCallback | undefined,
  ): void;
}
/* --- EXPORTS --- */
export { IActions, ContainerState };
