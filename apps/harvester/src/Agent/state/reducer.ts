
import { BaseReducer } from '@thecointech/shared/store/immerReducer'
import type { BankType, IActions } from './types';
import { BankData } from '../BankCard/data';
import { getInitialState, IntialState } from './initialState';

export const CONFIG_KEY = "agent";

const initialState = await getInitialState();

export class BankConnectReducer extends BaseReducer<IActions, IntialState>(CONFIG_KEY, initialState)
  implements IActions {
    setBank(type: BankType, bank: BankData): void {
      this.draftState[type] = bank;
    }
    setCompleted(type: BankType, completed: boolean): void {
      this.draftState[type] = {
        ...this.state[type]!,
        completed
      }
    }
}
