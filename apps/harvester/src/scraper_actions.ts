import { Mnemonic } from '@ethersproject/hdnode';
import type {ActionTypes, ValueResult, ValueType} from "./scraper/types";

export type Result<T> = {
  error?: string;
  value?: T,
}

export type ScraperBridgeApi = {
  // Declare a `readFile` function that will return a promise. This promise
  // will contain the data of the file read from the main process.
  warmup: (url: string) => Promise<Result<boolean>>,

  start: (actionName: ActionTypes, url: string, dynamicValues?: Record<string, string>) => Promise<Result<boolean>>,

  learnValue: (valueName: string, valueType: ValueType) => Promise<Result<ValueResult>>,

  // Finish Recording
  finishAction: (actionName: ActionTypes) => Promise<Result<boolean>>,

  // A test of an action
  testAction(actionName: ActionTypes, inputValues?: Record<string, string>): Promise<Result<Record<string, string>>>,

  setWalletMnemomic(mnemonic: Mnemonic): Promise<Result<boolean>>,
  getWalletAddress(): Promise<Result<string|null>>,
}


export const actions = {
  warmup: 'scraper:warmup',
  start: 'scraper:start',
  learnValue: 'scraper:learnValue',
  finishAction: 'scraper:finishAction',

  testAction: 'scraper.testAction',

  // Not really scraper, but meh
  setWalletMnemomic: 'scraper:setWalletMnemomic',
  getWalletAddress: 'scraper:getWalletAddress',
}
export type Action = keyof typeof actions
