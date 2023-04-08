import { ipcMain } from 'electron';
import { Recorder } from './scraper/record';
import { replay } from './scraper/replay';
import { ActionTypes, ValueType } from './scraper/types';
import { warmup } from './scraper/warmup';
import { actions, ScraperBridgeApi } from './scraper_actions';
import { toBridge } from './scraper_bridge_conversions';
import { getHarvestConfig, getWalletAddress, initialize, setHarvestConfig, setWalletMnemomic } from './Harvester/config';
import type { Mnemonic } from '@ethersproject/hdnode';
import { HarvestConfig } from './types';

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

  getHarvestConfig: () => guard(() => getHarvestConfig()),
  setHarvestConfig: (config) => guard(() => setHarvestConfig(config))
}

export function initScraping() {

  // initialize the config db
  // Yes, this is a hard-coded password.
  // Will fix ASAP with dynamically
  // generated code (Apr 04 2023)
  initialize("hF,835-/=Pw\\nr6r");

  ipcMain.handle(actions.warmup, async (_event, url: string) => {
    console.log("Warmup");
    return api.warmup(url);
  }),

  ipcMain.handle(actions.start, async (_event, actionName: ActionTypes, url: string, dynamicValues: Record<string, string>) => {
    console.log("Start", dynamicValues);
    return api.start(actionName, url, dynamicValues);
  })
  ipcMain.handle(actions.learnValue, async (_event, valueName: string, valueType: ValueType) => {
    console.log("LearnValue");
    return api.learnValue(valueName, valueType);
  })
  ipcMain.handle(actions.finishAction, async (_event, actionName: ActionTypes) => {
    console.log("finishAction");
    return api.finishAction(actionName);
  })
  ipcMain.handle(actions.testAction, async (_event, actionName: ActionTypes, dynamicValues: Record<string, string>) => {
    console.log("testAction");
    return api.testAction(actionName, dynamicValues);
  })

  ipcMain.handle(actions.setWalletMnemomic, async (_event, mnemonic: Mnemonic) => {
    console.log(`setWalletMnemomic`);
    return api.setWalletMnemomic(mnemonic as any);
  })
  ipcMain.handle(actions.getWalletAddress, async (_event) => {
    console.log(`getWalletAddress`);
    return api.getWalletAddress();
  })

  ipcMain.handle(actions.getHarvestConfig, async (_event) => {
    console.log(`getHarvestConfig`);
    return api.getHarvestConfig();
  })
  ipcMain.handle(actions.setHarvestConfig, async (_event, config: HarvestConfig) => {
    console.log(`setHarvestConfig`);
    return api.setHarvestConfig(config);
  })
}
