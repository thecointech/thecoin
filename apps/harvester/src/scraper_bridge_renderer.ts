import { contextBridge, ipcRenderer } from 'electron';
import { actions, ScraperBridgeApi } from './scraper_actions';

const api : ScraperBridgeApi = {
  installBrowser: () => ipcRenderer.invoke(actions.installBrowser),
  hasInstalledBrowser: () => ipcRenderer.invoke(actions.hasInstalledBrowser),
  hasCompatibleBrowser: () => ipcRenderer.invoke(actions.hasCompatibleBrowser),
  onBrowserDownloadProgress: (callback: (value: any) => void) => {
    ipcRenderer.on(actions.browserDownloadProgress, (_event, value) => callback(value))
  },

  warmup: (url) => ipcRenderer.invoke(actions.warmup, url),
  start: (actionName, url, dynamicValues) => ipcRenderer.invoke(actions.start, actionName, url, dynamicValues),
  learnValue: (valueName, valueType) => ipcRenderer.invoke(actions.learnValue, valueName, valueType),
  setDynamicInput: (name, value) => ipcRenderer.invoke(actions.setDynamicInput, name, value),

  finishAction: (actionName) => ipcRenderer.invoke(actions.finishAction, actionName),

  testAction: (actionName, dynamicValues) => ipcRenderer.invoke(actions.testAction, actionName, dynamicValues),

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
}

export const connectRenderer = () => contextBridge.exposeInMainWorld('scraper', api)
