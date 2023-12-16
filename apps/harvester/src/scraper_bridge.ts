import { ipcMain } from 'electron';
import { Recorder } from './scraper/record';
import { replay } from './scraper/replay';
import { ActionTypes, ValueType } from './scraper/types';
import { warmup } from './scraper/warmup';
import { actions, ScraperBridgeApi } from './scraper_actions';
import { toBridge } from './scraper_bridge_conversions';
import { getHarvestConfig, getProcessConfig, getWalletAddress, hasCreditDetails, setCreditDetails, setHarvestConfig, setWalletMnemomic } from './Harvester/config';
import type { Mnemonic } from '@ethersproject/hdnode';
import { HarvestConfig } from './types';
import { CreditDetails } from './Harvester/types';
import { exec } from 'child_process';
import { exportResults, getState } from './Harvester/db';
import { harvest } from './Harvester';
import { logsFolder } from './paths';

async function guard<T>(cb: () => Promise<T>) {
  try {
    return { value: await cb() };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (err: any) {
    return { error: err.message };
  }
}

const api: ScraperBridgeApi = {

  warmup: (url) => guard(() => warmup(url)),
  start: (actionName, url, dynamicValues) => guard(async () => {
    const instance = await Recorder.instance(actionName, url, dynamicValues);
    return !!instance;
  }),
  learnValue: (valueName, valueType) => guard(async () => {
    const instance = await Recorder.instance();
    return instance.setRequiredValue(valueName, valueType);
  }),
  finishAction: (actionName) => guard(() => Recorder.release(actionName)),

  // We can only pass POD back through the renderer, use toBridge to convert
  testAction: (actionName, dynamicValues) => guard(async () => toBridge(await replay(actionName, dynamicValues))),

  setWalletMnemomic: (mnemonic) => guard(() => setWalletMnemomic(mnemonic)),
  getWalletAddress: () => guard(() => getWalletAddress()),

  setCreditDetails: (details) => guard(() => setCreditDetails(details)),
  hasCreditDetails: () => guard(() => hasCreditDetails()),

  getHarvestConfig: () => guard(() => getHarvestConfig()),
  setHarvestConfig: (config) => guard(() => setHarvestConfig(config)),

  runHarvester: () => guard(() => harvest()),
  getCurrentState: () => guard(() => getState()),

  exportResults: () => guard(() => exportResults()),
  exportConfig: () => guard(async () => {
    const config = await getProcessConfig();
    return JSON.stringify(config, null, 2);
  }),

  openLogsFolder: () => guard(async () => {
    exec(`start "" "${logsFolder}"`);
    return true;
  }),
  getArgv: () => guard(() => Promise.resolve(JSON.stringify({
    argv: process.argv,
    broker: process.env.WALLET_BrokerCAD_ADDRESS
  }))),
}

export function initScraping() {

  ipcMain.handle(actions.warmup, async (_event, url: string) => {
    return api.warmup(url);
  }),

  ipcMain.handle(actions.start, async (_event, actionName: ActionTypes, url: string, dynamicValues: Record<string, string>) => {
    return api.start(actionName, url, dynamicValues);
  })
  ipcMain.handle(actions.learnValue, async (_event, valueName: string, valueType: ValueType) => {
    return api.learnValue(valueName, valueType);
  })
  ipcMain.handle(actions.finishAction, async (_event, actionName: ActionTypes) => {
    return api.finishAction(actionName);
  })
  ipcMain.handle(actions.testAction, async (_event, actionName: ActionTypes, dynamicValues: Record<string, string>) => {
    return api.testAction(actionName, dynamicValues);
  })

  ipcMain.handle(actions.setWalletMnemomic, async (_event, mnemonic: Mnemonic) => {
    return api.setWalletMnemomic(mnemonic as any);
  })
  ipcMain.handle(actions.getWalletAddress, async (_event) => {
    return api.getWalletAddress();
  })

  ipcMain.handle(actions.hasCreditDetails, async (_event) => {
    return api.hasCreditDetails();
  })
  ipcMain.handle(actions.setCreditDetails, async (_event, details: CreditDetails) => {
    return api.setCreditDetails(details);
  })

  ipcMain.handle(actions.getHarvestConfig, async (_event) => {
    return api.getHarvestConfig();
  })
  ipcMain.handle(actions.setHarvestConfig, async (_event, config: HarvestConfig) => {
    return api.setHarvestConfig(config);
  })

  ipcMain.handle(actions.runHarvester, async (_event) => {
    return api.runHarvester();
  })
  ipcMain.handle(actions.getCurrentState, async (_event) => {
    return api.getCurrentState();
  })

  ipcMain.handle(actions.exportResults, async (_event) => {
    return api.exportResults();
  })
  ipcMain.handle(actions.exportConfig, async (_event) => {
    return api.exportConfig();
  })

  ipcMain.handle(actions.openLogsFolder, async (_event) => {
    return api.openLogsFolder();
  })
  ipcMain.handle(actions.getArgv, async (_event) => {
    return api.getArgv();
  })
}
