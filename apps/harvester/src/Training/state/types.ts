


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
  // readonly visa?: string;
  // readonly chequing?: string;

  // readonly chqWarm: boolean,
  // readonly vsaWarm: boolean,

  // readonly
}

export type BankKey = keyof TrainingState;
export type DataKey = keyof BankState;

/* --- ACTIONS --- */
export interface IActions {
  setParameter(bank: BankKey, key: DataKey, value: string|boolean|number): void;
}
