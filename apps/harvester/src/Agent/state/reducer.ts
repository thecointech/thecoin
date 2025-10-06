
import { BaseReducer } from '@thecointech/shared/store/immerReducer'
import type { AccountResult, BankType, IActions } from './types';
import { BankData } from '../BankCard/data';
import { getInitialState, InitialState } from './initialState';

export const CONFIG_KEY = "agent";

const initialState = await getInitialState();

export class BankConnectReducer extends BaseReducer<IActions, InitialState>(CONFIG_KEY, initialState)
  implements IActions {
    setBank(type: BankType, bank: BankData): void {
      this.draftState[type] = bank;
    }
    setCompleted(type: BankType, completed: boolean, results?: AccountResult[]): void {
      const curr = this.state[type];
      if (!curr) {
        alert("Bank not initialized");
        return;
      };
      this.draftState[type] = {
        ...curr,
        completed,
        results
      }
    }
}
