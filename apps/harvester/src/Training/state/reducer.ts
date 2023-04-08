
import { BaseReducer } from '@thecointech/shared/store/immerReducer'
import { TrainingState, IActions, BankKey, DataKey } from './types';
// import { getData, Key } from '../data';

export const TRAINING_KEY = "training";

const initChq = localStorage.getItem("chequing")
const initVisa = localStorage.getItem("visa")
// The initial state of the App
export const initialState: TrainingState = {
  chequing: initChq ? JSON.parse(initChq) : {},
  visa: initVisa ? JSON.parse(initVisa) : {},
};

export class TrainingReducer extends BaseReducer<IActions, TrainingState>(TRAINING_KEY, initialState)
  implements IActions {
  setParameter(bank: BankKey, key: DataKey, value: string|boolean|number): void {
    this.draftState[bank][key] = value as any;
    const n = {
      ...this.state[bank],
      [key]: value,
    };
    this.draftState[bank] = n;
    localStorage.setItem(bank, JSON.stringify(n));
  }
}
