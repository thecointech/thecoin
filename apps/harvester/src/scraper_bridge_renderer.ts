import { contextBridge, ipcRenderer } from 'electron';
import { actions, ScraperBridgeApi } from './scraper_actions';

const api : ScraperBridgeApi = {
  warmup: (url) => ipcRenderer.invoke(actions.warmup, url),
  start: (actionName, url, dynamicValues) => ipcRenderer.invoke(actions.start, actionName, url, dynamicValues),
  learnValue: (valueName, valueType) => ipcRenderer.invoke(actions.learnValue, valueName, valueType),

  finishAction: (actionName) => ipcRenderer.invoke(actions.finishAction, actionName),

  testAction: (actionName, dynamicValues) => ipcRenderer.invoke(actions.testAction, actionName, dynamicValues),

  setWalletMnemomic: (mnemonic) => ipcRenderer.invoke(actions.setWalletMnemomic, mnemonic),
  getWalletAddress: () => ipcRenderer.invoke(actions.getWalletAddress)
}

export const connectRenderer = () => contextBridge.exposeInMainWorld('scraper', api)
