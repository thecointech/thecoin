import type { HarvestConfig, Mnemonic } from './types';
import type { ValueResult, ValueType} from "@thecointech/scraper/types";
import type { CreditDetails } from './Harvester/types';
import type { StoredData } from './Harvester/db_translate';
import { ActionType } from './Harvester/scraper';
import { BackgroundTaskCallback } from './BackgroundTask/types';
import type { OptionPacket, QuestionPacket, ResponsePacket } from './Harvester/agent/askUser';
import type { AutoConfigParams } from './Harvester/agent';

export type Result<T> = {
  error?: string;
  value?: T,
}

export type ScraperBridgeApi = {
  hasInstalledBrowser(): Promise<Result<boolean>>;
  hasCompatibleBrowser(): Promise<Result<boolean>>;

  // Trigger download of browser/similarity pipeline
  downloadLibraries(): Promise<Result<boolean>>;

  // Generic update pathway for all long-running actions
  onBackgroundTaskProgress: (progress: BackgroundTaskCallback) => void;

  // Run the automatic configurator for the given action on the appropriate url
  autoProcess: (params: AutoConfigParams) => Promise<Result<boolean>>;

  // Validate an action
  validateAction(actionName: ActionType, inputValues?: Record<string, string>): Promise<Result<Record<string, string>>>,

  // Reset 2FA without doing a full banking setup
  // Useful if your chequing acc loses it's 2FA token
  // but you don't want to send unnecessary etransfers
  twofaRefresh: (actionName: ActionType, refreshProfile: boolean, showBrowser: boolean) => Promise<Result<boolean>>,

  onAskQuestion: (callback: (question: QuestionPacket|OptionPacket) => void) => void;
  replyQuestion: (response: ResponsePacket) => Promise<Result<boolean>>;

  // Declare a `readFile` function that will return a promise. This promise
  // will contain the data of the file read from the main process.
  warmup: (url: string) => Promise<Result<boolean>>;

  start: (actionName: ActionType, url: string, dynamicInputs?: string[]) => Promise<Result<boolean>>;

  learnValue: (valueName: string, valueType: ValueType) => Promise<Result<ValueResult>>,
  setDynamicInput: (name: string, value: string) => Promise<Result<string>>,

  // Finish Recording
  finishAction: () => Promise<Result<boolean>>,

  setWalletMnemomic(mnemonic: Mnemonic): Promise<Result<boolean>>,
  getWalletAddress(): Promise<Result<string|null>>,

  hasCreditDetails(): Promise<Result<boolean>>,
  setCreditDetails(details: CreditDetails): Promise<Result<boolean>>,

  getHarvestConfig(): Promise<Result<HarvestConfig|undefined>>,
  setHarvestConfig(config: HarvestConfig): Promise<Result<boolean>>,

  runHarvester(headless?: boolean): Promise<Result<boolean>>,
  getCurrentState(): Promise<Result<StoredData>>,

  exportResults(): Promise<Result<string>>
  exportConfig(): Promise<Result<string>>

  openLogsFolder(): Promise<Result<boolean>>,
  getArgv() : Promise<Result<Record<string, any>>>,

  allowOverrides(): Promise<Result<boolean>>,
  setOverrides(balance: number, pendingAmt: number|null, pendingDate: string|null|undefined): Promise<Result<boolean>>,

  // Import a scraper script configuration
  importScraperScript(config: any): Promise<Result<boolean>>;
}


export const actions = {
  hasInstalledBrowser: "browser:hasInstalledBrowser",
  hasCompatibleBrowser: "browser:hasCompatibleBrowser",

  onBackgroundTaskProgress: 'scraper:onBackgroundTaskProgress',

  downloadLibraries: 'scraper:downloadLibraries',

  autoProcess: 'scraper:autoProcess',
  validateAction: 'scraper:validateAction',

  twofaRefresh: 'scraper:twofaRefresh',

  onAskQuestion: 'scraper:onAskQuestion',
  replyQuestion: 'scraper:replyQuestion',

  warmup: 'scraper:warmup',
  start: 'scraper:start',
  learnValue: 'scraper:learnValue',
  setDynamicInput: 'scraper:setDynamicInput',
  finishAction: 'scraper:finishAction',

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
  importScraperScript: 'scraper:importScraperScript',
}
export type Action = keyof typeof actions
