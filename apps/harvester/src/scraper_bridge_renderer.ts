import { contextBridge, ipcRenderer } from 'electron';
import { actions, ScraperBridgeApi } from './scraper_actions';

const api : ScraperBridgeApi = {
  warmup: (url) => ipcRenderer.invoke(actions.warmup, url),
  start: (actionName, url, dynamicValues) => ipcRenderer.invoke(actions.start, actionName, url, dynamicValues),
  learnValue: (valueName, valueType) => ipcRenderer.invoke(actions.learnValue, valueName, valueType),

  finishAction: (actionName) => ipcRenderer.invoke(actions.finishAction, actionName),

  testAction: async (actionName, dynamicValues) => ipcRenderer.invoke(actions.testAction, actionName, dynamicValues),
}

export const connectRenderer = () => contextBridge.exposeInMainWorld('scraper', api)