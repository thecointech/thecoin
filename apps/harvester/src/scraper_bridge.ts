import { IpcMainInvokeEvent, ipcMain } from 'electron';
import { Recorder } from './scraper/record';
import { replay } from './scraper/replay';
import { ActionTypes, ValueType } from './scraper/types';
import { warmup } from './scraper/warmup';
import { actions, ScraperBridgeApi } from './scraper_actions';
import { toBridge } from './scraper_bridge_conversions';
import { getHarvestConfig, getProcessConfig, getWalletAddress, hasCreditDetails, setCreditDetails, setHarvestConfig, setWalletMnemomic } from './Harvester/config';
import { HarvestConfig, Mnemonic } from './types';
import { CreditDetails } from './Harvester/types';
import { spawn } from 'child_process';
import { exportResults, getState, setOverrides } from './Harvester/db';
import { harvest } from './Harvester';
import { logsFolder } from './paths';
import { platform } from 'node:os';
import { getLocalBrowserPath, getSystemBrowserPath, installChrome } from './scraper/puppeteer/browser';
import { log } from '@thecointech/logging';

async function guard<T>(cb: () => Promise<T>) {
  try {
    return { value: await cb() };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (err: any) {
    return { error: err.message };
  }
}

const api: Omit<ScraperBridgeApi, "installBrowser"|"onBrowserDownloadProgress"> = {
  hasInstalledBrowser: () => guard(async () => {
    const p = await getLocalBrowserPath();
    return !!p;
  }),
  hasCompatibleBrowser: () => guard(async () => {
    const p = await getSystemBrowserPath();
    return !!p;
  }),

  warmup: (url) => guard(() => warmup(url)),
  start: (actionName, url, dynamicValues) => guard(async () => {
    const instance = await Recorder.instance(actionName, url, dynamicValues);
    return !!instance;
  }),
  learnValue: (valueName, valueType) => guard(async () => {
    const instance = await Recorder.instance();
    return instance.setRequiredValue(valueName, valueType);
  }),
  setDynamicInput: (name, value) => guard(async () => {
    const instance = await Recorder.instance();
    return instance.setDynamicInput(name, value);
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

  runHarvester: (headless?: boolean) => guard(() => {
    process.env.RUN_SCRAPER_HEADLESS = headless?.toString()
    return harvest()
  }),
  getCurrentState: () => guard(() => getState()),

  exportResults: () => guard(() => exportResults()),
  exportConfig: () => guard(async () => {
    const config = await getProcessConfig();
    return JSON.stringify(config, null, 2);
  }),

  openLogsFolder: () => guard(async () => {
    openFolder(logsFolder);
    return true;
  }),
  getArgv: () => guard(() => Promise.resolve({
    argv: process.argv,
    broker: process.env.WALLET_BrokerCAD_ADDRESS,
    saveDump: process.env.HARVESTER_SAVE_DUMP,
    env: {
      ...process.env
    },
    logsFolder,
  })),

  allowOverrides: () => guard(() => Promise.resolve(process.env.HARVESTER_ALLOW_OVERRIDES === "true")),
  setOverrides: (balance, pendingAmt, pendingDate) => guard(() => setOverrides(balance, pendingAmt, pendingDate)),
}

export function initScraping() {

  ipcMain.handle(actions.installBrowser, installBrowser);
  ipcMain.handle(actions.hasInstalledBrowser, api.hasInstalledBrowser);
  ipcMain.handle(actions.hasCompatibleBrowser, api.hasCompatibleBrowser);

  ipcMain.handle(actions.warmup, async (_event, url: string) => {
    return api.warmup(url);
  }),

  ipcMain.handle(actions.start, async (_event, actionName: ActionTypes, url: string, dynamicValues?: string[]) => {
    return api.start(actionName, url, dynamicValues);
  })
  ipcMain.handle(actions.learnValue, async (_event, valueName: string, valueType: ValueType) => {
    return api.learnValue(valueName, valueType);
  })
  ipcMain.handle(actions.setDynamicInput, async (_event, name: string, value: ValueType) => {
    return api.setDynamicInput(name, value);
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

  ipcMain.handle(actions.runHarvester, async (_event, headless?: boolean) => {
    return api.runHarvester(headless);
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

  ipcMain.handle(actions.allowOverrides, async (_event) => {
    return api.allowOverrides();
  })
  ipcMain.handle(actions.setOverrides, async (_event, balance: number, pendingAmt: number|null, pendingDate: string|null) => {
    return api.setOverrides(balance, pendingAmt, pendingDate);
  })
}


const openFolder = (path: string) => {
  let explorer = '';
  switch (platform()) {
      case "win32": explorer = "explorer"; break;
      case "linux": explorer = "xdg-open"; break;
      case "darwin": explorer = "open"; break;
  }
  spawn(explorer, [path], { detached: true }).unref();
}


async function installBrowser(event: IpcMainInvokeEvent) {
  log.info('Installing browser');
  let lastLoggedPercent = 0;
  try {
    await installChrome((bytes, total) => {
      const percent = Math.round((bytes / total) * 100);
      if (percent - lastLoggedPercent > 10) {
        log.info(`Downloaded: ${percent}%`);
        lastLoggedPercent = percent;
      }
      event.sender.send(actions.browserDownloadProgress, { percent });
    });
    event.sender.send(actions.browserDownloadProgress, { completed: true });
  }
  catch (e) {
    log.error(e);
    event.sender.send(actions.browserDownloadProgress, { error: e })
  }
}
