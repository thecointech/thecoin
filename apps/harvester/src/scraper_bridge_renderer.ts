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

  twofaRefresh: (actionName, refreshProfile) => ipcRenderer.invoke(actions.twofaRefresh, actionName, refreshProfile),

  onAskQuestion: (callback) => {
    ipcRenderer.on(actions.onAskQuestion, (_event, value) => callback(value))
  },
  replyQuestion: (packet) => ipcRenderer.invoke(actions.replyQuestion, packet),

  warmup: (url) => ipcRenderer.invoke(actions.warmup, url),
  start: (actionName, url, dynamicValues) => ipcRenderer.invoke(actions.start, actionName, url, dynamicValues),
  learnValue: (valueName, valueType) => ipcRenderer.invoke(actions.learnValue, valueName, valueType),
  setDynamicInput: (name, value) => ipcRenderer.invoke(actions.setDynamicInput, name, value),

  finishAction: () => ipcRenderer.invoke(actions.finishAction),


  setWalletMnemomic: (mnemonic) => ipcRenderer.invoke(actions.setWalletMnemomic, mnemonic),
  getWalletAddress: () => ipcRenderer.invoke(actions.getWalletAddress),

  hasCreditDetails: () => ipcRenderer.invoke(actions.hasCreditDetails),
  setCreditDetails: (details) => ipcRenderer.invoke(actions.setCreditDetails, details),

  getHarvestConfig: () => ipcRenderer.invoke(actions.getHarvestConfig),
  setHarvestConfig: (config) => ipcRenderer.invoke(actions.setHarvestConfig, config),

  runHarvester: (headless?: boolean) => ipcRenderer.invoke(actions.runHarvester, headless),
  getCurrentState: () => ipcRenderer.invoke(actions.getCurrentState),

  exportResults: () => ipcRenderer.invoke(actions.exportResults),
  exportConfig: () => ipcRenderer.invoke(actions.exportConfig),

  openLogsFolder: () => ipcRenderer.invoke(actions.openLogsFolder),
  getArgv: () => ipcRenderer.invoke(actions.getArgv),

  allowOverrides: () => ipcRenderer.invoke(actions.allowOverrides),
  setOverrides: (balance, pendingAmt, pendingDate) => ipcRenderer.invoke(actions.setOverrides, balance, pendingAmt, pendingDate),

  importScraperScript: (config) => ipcRenderer.invoke(actions.importScraperScript, config),
}

export const connectRenderer = () => contextBridge.exposeInMainWorld('scraper', api)
