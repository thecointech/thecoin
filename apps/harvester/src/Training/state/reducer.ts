
import { BaseReducer } from '@thecointech/shared/store/immerReducer'
import { TrainingState, IActions, BankKey, DataKey } from './types';

export const TRAINING_KEY = "training";

const initChq = localStorage.getItem("chequing")
const initVisa = localStorage.getItem("visa")
const hasCreditDetails = await window.scraper.hasCreditDetails();
// The initial state of the App
export const initialState: TrainingState = {
  chequing: initChq ? JSON.parse(initChq) : {},
  visa: initVisa ? JSON.parse(initVisa) : {},
  hasCreditDetails: !!hasCreditDetails.value
};

export class TrainingReducer extends BaseReducer<IActions, TrainingState>(TRAINING_KEY, initialState)
  implements IActions {
  setHasCreditDetails(value: boolean): void {
    this.draftState.hasCreditDetails = value;
  }

  setParameter(bank: BankKey, key: DataKey, value: string|boolean|number): void {
    const n = {
      ...this.state[bank],
      [key]: value,
      hasCreditDetails: this.state.hasCreditDetails
    };
    this.draftState[bank] = n;
    localStorage.setItem(bank, JSON.stringify(n));
  }
}
