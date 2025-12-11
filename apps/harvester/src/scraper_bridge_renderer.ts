import { contextBridge, ipcRenderer } from 'electron';
import { actions, ScraperBridgeApi } from './scraper_actions';
import { BackgroundTaskCallback } from './BackgroundTask/types';


const api : ScraperBridgeApi = {
  // installBrowser: () => ipcRenderer.invoke(actions.installBrowser),
  hasInstalledBrowser: () => ipcRenderer.invoke(actions.hasInstalledBrowser),
  hasCompatibleBrowser: () => ipcRenderer.invoke(actions.hasCompatibleBrowser),
  // onBrowserDownloadProgress: (callback: (value: any) => void) => {
  //   ipcRenderer.on(actions.browserDownloadProgress, (_event, value) => callback(value))
  // },

  downloadLibraries: () => ipcRenderer.invoke(actions.downloadLibraries),

  onBackgroundTaskProgress: (callback: BackgroundTaskCallback) => {
    ipcRenderer.on(actions.onBackgroundTaskProgress, (_event, value) => callback(value))
  },
  // init: () => ipcRenderer.invoke(actions.init),
  // onInitProgress: (callback) => {
  //   ipcRenderer.on(actions.onInitProgress, (_event, value) => callback(value))
  // },

  autoProcess: (params) => ipcRenderer.invoke(actions.autoProcess, params),
  validateAction: (actionName, inputValues) => ipcRenderer.invoke(actions.validateAction, actionName, inputValues),
  // onAgentProgress: (callback) => {
  //   ipcRenderer.on(actions.onAgentProgress, (_event, value) => callback(value))
  // },

  twofaRefresh: (actionName) => ipcRenderer.invoke(actions.twofaRefresh, actionName),

  onAskQuestion: (callback) => {
    const _cb = (_event: any, value: any) => callback(value)
    const r = ipcRenderer.on(actions.onAskQuestion, _cb)
    return () => r.off(actions.onAskQuestion, _cb)
  },
  replyQuestion: (packet) => ipcRenderer.invoke(actions.replyQuestion, packet),

  warmup: (url) => ipcRenderer.invoke(actions.warmup, url),
  start: (actionName, url, dynamicValues) => ipcRenderer.invoke(actions.start, actionName, url, dynamicValues),
  learnValue: (valueName, valueType) => ipcRenderer.invoke(actions.learnValue, valueName, valueType),
  setDynamicInput: (name, value) => ipcRenderer.invoke(actions.setDynamicInput, name, value),

  finishAction: () => ipcRenderer.invoke(actions.finishAction),


  setCoinAccount: (coinAccount) => ipcRenderer.invoke(actions.setCoinAccount, coinAccount),
  getCoinAccountDetails: () => ipcRenderer.invoke(actions.getCoinAccountDetails),

  hasCreditDetails: () => ipcRenderer.invoke(actions.hasCreditDetails),
  setCreditDetails: (details) => ipcRenderer.invoke(actions.setCreditDetails, details),

  getHarvestConfig: () => ipcRenderer.invoke(actions.getHarvestConfig),
  setHarvestConfig: (config) => ipcRenderer.invoke(actions.setHarvestConfig, config),

  alwaysRunScraperVisible: (visible?: boolean) => ipcRenderer.invoke(actions.alwaysRunScraperVisible, visible),
  alwaysRunScraperLogging: (logging?: boolean) => ipcRenderer.invoke(actions.alwaysRunScraperLogging, logging),
  runHarvester: (forceVisible?: boolean) => ipcRenderer.invoke(actions.runHarvester, forceVisible),
  getCurrentState: () => ipcRenderer.invoke(actions.getCurrentState),

  exportResults: () => ipcRenderer.invoke(actions.exportResults),
  exportConfig: () => ipcRenderer.invoke(actions.exportConfig),

  openLogsFolder: () => ipcRenderer.invoke(actions.openLogsFolder),
  openWebsiteUrl: (type) => ipcRenderer.invoke(actions.openWebsiteUrl, type),
  getArgv: () => ipcRenderer.invoke(actions.getArgv),

  setOverrides: (balance, pendingAmt, pendingDate) => ipcRenderer.invoke(actions.setOverrides, balance, pendingAmt, pendingDate),

  importScraperScript: (config) => ipcRenderer.invoke(actions.importScraperScript, config),

  getBankConnectDetails: () => ipcRenderer.invoke(actions.getBankConnectDetails),

  hasUserEnabledLingering: () => ipcRenderer.invoke(actions.hasUserEnabledLingering),
  enableLingeringForCurrentUser: () => ipcRenderer.invoke(actions.enableLingeringForCurrentUser),

  // Wallet connect from site-app
  loadWalletFromSite: (timeoutMs?: number) => ipcRenderer.invoke(actions.loadWalletFromSite, timeoutMs),
  cancelloadWalletFromSite: () => ipcRenderer.invoke(actions.cancelloadWalletFromSite),
}

export const connectRenderer = () => contextBridge.exposeInMainWorld('scraper', api)
