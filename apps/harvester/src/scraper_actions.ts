import { Mnemonic } from '@ethersproject/hdnode';
import { HarvestConfig } from './types';
import type {ActionTypes, ValueResult, ValueType} from "./scraper/types";
import type { CreditDetails } from './Harvester/types';
import type { StoredData } from './Harvester/db_translate';

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

  hasCreditDetails(): Promise<Result<boolean>>,
  setCreditDetails(details: CreditDetails): Promise<Result<boolean>>,

  getHarvestConfig(): Promise<Result<HarvestConfig|undefined>>,
  setHarvestConfig(config: HarvestConfig): Promise<Result<boolean>>,

  runHarvester(): Promise<Result<void>>,
  getCurrentState(): Promise<Result<StoredData>>,

  exportResults(): Promise<Result<string>>
  exportConfig(): Promise<Result<string>>

  openLogsFolder(): Promise<Result<boolean>>,
  getArgv() : Promise<Result<string>>,

  setCurrentBalance(balance: number): Promise<Result<boolean>>
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

  // fuggit
  setCreditDetails: "scraper:setCreditDetails",
  hasCreditDetails: "scraper:hasCreditDetails",

  getHarvestConfig: 'scraper:getHarvestConfig',
  setHarvestConfig: 'scraper:setHarvestConfig',

  runHarvester: 'scraper.runHarvester',
  getCurrentState: 'scraper.getCurrentState',

  exportResults: 'scraper:exportResults',
  exportConfig: 'scraper:exportConfig',

  openLogsFolder: 'scraper:openLogsFolder',
  getArgv: 'scraper:getArgv',

  setCurrentBalance: 'scraper:setCurrentBalance',
}
export type Action = keyof typeof actions
