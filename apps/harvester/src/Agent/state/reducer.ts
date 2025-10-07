
import { BaseReducer } from '@thecointech/shared/store/immerReducer'
import { getInitialState, type InitialState } from './initialState';
import type { BankType, IActions } from './types';
import type { BankData } from '../BankCard/data';
import type { ProcessAccount } from '@thecointech/scraper-agent/types';

export const CONFIG_KEY = "agent";

const initialState = await getInitialState();

export class BankConnectReducer extends BaseReducer<IActions, InitialState>(CONFIG_KEY, initialState)
  implements IActions
{
  setBank(type: BankType, bank: BankData): void {
    this.draftState.banks[type] = bank;
  }
  setCompleted(type: BankType, completed: boolean, accounts?: ProcessAccount[]): void {
    const curr = this.state.banks[type];
    if (!curr) {
      alert("Bank not initialized");
      return;
    };
    this.draftState.banks[type] = {
      ...curr,
      completed,
      accounts
    }
  }
  setStored(): void {
    this.draftState.stored = true;
  }
}
