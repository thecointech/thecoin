


/* --- STATE --- */

export type BankState = {
  url?: string,
  warm?: boolean,
  initBalance?: string,
  testPassed?: boolean,
  eTransferPassed?: boolean,
}
export interface TrainingState {

  readonly visa: BankState,
  readonly chequing: BankState,
  readonly hasCreditDetails: boolean,
}

export type BankKey = "visa"|"chequing"; //keyof TrainingState;
export type DataKey = keyof BankState;

/* --- ACTIONS --- */
export interface IActions {
  setParameter(bank: BankKey, key: DataKey, value: string|boolean|number): void;

  setHasCreditDetails(value: boolean): void;
}
