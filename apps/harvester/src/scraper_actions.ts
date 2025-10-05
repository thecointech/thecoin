import type { HarvestConfig } from './types';
import type { ValueResult, ValueType} from "@thecointech/scraper/types";
import type { CreditDetails } from './Harvester/types';
import type { CoinAccount, CoinAccountDetails, StoredData } from '@thecointech/store-harvester';
import { ActionType } from './Harvester/scraper';
import { BackgroundTaskCallback } from './BackgroundTask/types';
import type { OptionPacket, QuestionPacket, ResponsePacket } from './Harvester/agent/askUser';
import type { AutoConfigParams } from './Harvester/agent';
import type { BankConnectDetails } from './Harvester/events';

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
  twofaRefresh: (actionName: ActionType, refreshProfile: boolean) => Promise<Result<boolean>>,

  onAskQuestion: (callback: (question: QuestionPacket|OptionPacket) => void) => () => void;
  replyQuestion: (response: ResponsePacket) => Promise<Result<boolean>>;

  // Declare a `readFile` function that will return a promise. This promise
  // will contain the data of the file read from the main process.
  warmup: (url: string) => Promise<Result<boolean>>;

  start: (actionName: ActionType, url: string, dynamicInputs?: string[]) => Promise<Result<boolean>>;

  learnValue: (valueName: string, valueType: ValueType) => Promise<Result<ValueResult>>,
  setDynamicInput: (name: string, value: string) => Promise<Result<string>>,

  // Finish Recording
  finishAction: () => Promise<Result<boolean>>,

  setCoinAccount(coinAccount: CoinAccount): Promise<Result<boolean>>,
  getCoinAccountDetails(): Promise<Result<CoinAccountDetails|null>>,

  hasCreditDetails(): Promise<Result<boolean>>,
  setCreditDetails(details: CreditDetails): Promise<Result<boolean>>,

  getHarvestConfig(): Promise<Result<HarvestConfig|undefined>>,
  setHarvestConfig(config: HarvestConfig): Promise<Result<boolean>>,

  // Set/get the alwaysRunVisible flag
  alwaysRunScraperVisible(visible?: boolean): Promise<Result<boolean>>,
  // Set/get the alwaysRunLogging flag
  alwaysRunScraperLogging(logging?: boolean): Promise<Result<boolean>>,
  runHarvester(forceVisible?: boolean): Promise<Result<string>>,
  getCurrentState(): Promise<Result<StoredData>>,

  exportResults(): Promise<Result<string>>
  exportConfig(): Promise<Result<string>>

  openLogsFolder(): Promise<Result<boolean>>,
  getArgv() : Promise<Result<Record<string, any>>>,

  setOverrides(balance: number, pendingAmt: number|null, pendingDate: string|null|undefined): Promise<Result<boolean>>,

  // Import a scraper script configuration
  importScraperScript(config: any): Promise<Result<boolean>>,

  // Get banking connection details
  getBankConnectDetails(): Promise<Result<BankConnectDetails>>,

  // Lingering (systemd user background)
  hasUserEnabledLingering(): Promise<Result<boolean>>;
  enableLingeringForCurrentUser(): Promise<Result<{ success?: boolean; error?: string }>>;

  // Wallet connect from site-app
  loadWalletFromSite(timeoutMs?: number): Promise<Result<boolean>>;
  cancelloadWalletFromSite(): Promise<Result<boolean>>;
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
  setCoinAccount: 'scraper:setCoinAccount',
  getCoinAccountDetails: 'scraper:getCoinAccountDetails',
  hasUserEnabledLingering: 'scraper:hasUserEnabledLingering',
  enableLingeringForCurrentUser: 'scraper:enableLingeringForCurrentUser',

  // fuggit
  setCreditDetails: "scraper:setCreditDetails",
  hasCreditDetails: "scraper:hasCreditDetails",

  getHarvestConfig: 'scraper:getHarvestConfig',
  setHarvestConfig: 'scraper:setHarvestConfig',

  alwaysRunScraperVisible: 'scraper.alwaysRunScraperVisible',
  alwaysRunScraperLogging: 'scraper.alwaysRunScraperLogging',

  runHarvester: 'scraper.runHarvester',
  getCurrentState: 'scraper.getCurrentState',

  exportResults: 'scraper:exportResults',
  exportConfig: 'scraper:exportConfig',

  openLogsFolder: 'scraper:openLogsFolder',
  getArgv: 'scraper:getArgv',

  setOverrides: 'scraper:setOverrides',
  importScraperScript: 'scraper:importScraperScript',
  getBankConnectDetails: 'scraper:getBankConnectDetails',

  // Wallet connect from site-app
  loadWalletFromSite: 'scraper:loadWalletFromSite',
  cancelloadWalletFromSite: 'scraper:cancelloadWalletFromSite',
}
export type Action = keyof typeof actions
