import type { HarvestConfig, Mnemonic } from './types';
import type {ActionTypes, ValueResult, ValueType} from "./scraper/types";
import type { CreditDetails } from './Harvester/types';
import type { StoredData } from './Harvester/db_translate';

export type Result<T> = {
  error?: string;
  value?: T,
}

export type ScraperBridgeApi = {
  installBrowser(): Promise<void>;
  hasInstalledBrowser(): Promise<Result<boolean>>;
  hasCompatibleBrowser(): Promise<Result<boolean>>;
  onBrowserDownloadProgress: (value: any) => void;

  // Declare a `readFile` function that will return a promise. This promise
  // will contain the data of the file read from the main process.
  warmup: (url: string) => Promise<Result<boolean>>,

  start: (actionName: ActionTypes, url: string, dynamicValues?: string[]) => Promise<Result<boolean>>,

  learnValue: (valueName: string, valueType: ValueType) => Promise<Result<ValueResult>>,
  setDynamicInput: (name: string, value: string) => Promise<Result<string>>,

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

  runHarvester(headless?: boolean): Promise<Result<void>>,
  getCurrentState(): Promise<Result<StoredData>>,

  exportResults(): Promise<Result<string>>
  exportConfig(): Promise<Result<string>>

  openLogsFolder(): Promise<Result<boolean>>,
  getArgv() : Promise<Result<Record<string, any>>>,

  allowOverrides(): Promise<Result<boolean>>,
  setOverrides(balance: number, pendingAmt: number|null, pendingDate: string|null|undefined): Promise<Result<boolean>>
}


export const actions = {
  installBrowser: "browser:installBrowser",
  hasInstalledBrowser: "browser:hasInstalledBrowser",
  hasCompatibleBrowser: "browser:hasCompatibleBrowser",
  browserDownloadProgress: "browser:browserDownloadProgress",

  warmup: 'scraper:warmup',
  start: 'scraper:start',
  learnValue: 'scraper:learnValue',
  setDynamicInput: 'scraper:setDynamicInput',
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

  allowOverrides: 'scraper:allowOverrides',
  setOverrides: 'scraper:setOverrides',
}
export type Action = keyof typeof actions
