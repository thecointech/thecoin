import { BrowserWindow, ipcMain } from 'electron';
import type { ValueType } from '@thecointech/scraper-types';
import { actions, ScraperBridgeApi } from './scraper_actions';
import { toBridge } from './scraper_bridge_conversions';
import { getHarvestConfig, getProcessConfig, getWallet, setCoinAccount, getCoinAccountDetails, hasCreditDetails, setCreditDetails, setHarvestConfig, setProcessConfig } from './Harvester/config';
import { CoinAccount, HarvestConfig } from './types';
import { CreditDetails } from './Harvester/types';
import { exportResults, getRawState, setOverrides } from './Harvester/state';
import { harvest } from './Harvester';
import { logsFolder } from './paths';
import { getLocalBrowserPath, getSystemBrowserPath } from '@thecointech/scraper/puppeteer-init/browser';
import { getValues, ActionType } from './Harvester/scraper';
import { AutoConfigParams, autoConfigure } from './Harvester/agent';
import { BackgroundTaskInfo } from './BackgroundTask';
import { AskUserReact } from './Harvester/agent/askUser';
import { downloadRequired } from './GetStarted/download';
import { getScrapingScript } from './results/getScrapingScript';
import { twofaRefresh as doRefresh } from './Harvester/agent/refreshTwoFA';
import { enableLingeringForCurrentUser, isLingeringEnabled } from './Harvester/schedule/linux-lingering';
import { getScraperLogging, setScraperLogging } from './Harvester/scraperLogging';
import { Registry, VisibleOverride } from '@thecointech/scraper';
import { getBankConnectDetails } from './Harvester/events';
import { resetService, loadWalletFromSite } from './account/Connect/server';
import { openLogsFolder, openWebsiteUrl, type WebsiteEndpoints } from './openExternal';

async function guard<T>(cb: () => Promise<T>) {
  try {
    return { value: await cb() };
  }
  catch (err: any) {
    return { error: err.message };
  }
}

const api: Omit<ScraperBridgeApi, "onAskQuestion"|"onBackgroundTaskProgress"|"onAgentProgress"> = {
  hasInstalledBrowser: () => guard(async () => {
    const p = await getLocalBrowserPath();
    return !!p;
  }),
  hasCompatibleBrowser: () => guard(async () => {
    const p = await getSystemBrowserPath();
    return !!p;
  }),

  downloadLibraries: () => guard(async () => {
    downloadRequired(onBgTaskMsg);
    return true;
  }),

  replyQuestion: (response) => guard(async () => {
    AskUserReact.onResponse(response);
    return true;
  }),

  autoProcess: (params) => guard(async () => {
    // Get our coinETransferRecipient
    let wallet = await getWallet();
    if (!wallet) {
      throw new Error("Wallet not configured");
    }
    const depositAddress = getEmailAddress(wallet.address);
    autoConfigure(params, depositAddress, onBgTaskMsg);
    return true;
  }),

  validateAction: (actionName, inputValues) => guard(async () => {
    const r = await getValues(actionName, onBgTaskMsg, inputValues)
    return toBridge(r);
  }),

  twofaRefresh: (actionName) => guard(async () => doRefresh(actionName, onBgTaskMsg)),

  warmup: (_url) => guard(async () => {
    const instance = await Registry.create({
      name: 'warmup',
      context: "default",
    })
    return !!instance;
  }),

  start: (_actionName, _url, _dynamicInputs) => guard(async () => {
    // const instance = await Registry.create({
    //   name: actionName,
    //   dynamicInputs,
    //   onComplete: async (events) => {
    //     await setEvents(actionName, events);
    //   }
    // });
    // return !!instance;
    return false;
  }),
  learnValue: (_valueName, _valueType) => guard(async () => {
    // const instance = await Recorder.instance();
    // return instance.setRequiredValue(valueName, valueType);
    return { parsing: {type: "date", "format": ""}, text: ""};
  }),
  setDynamicInput: (_name, _value) => guard(async () => {
    // const instance = await Recorder.instance();
    // return instance.setDynamicInput(name, value);
    return "TODO";
  }),
  finishAction: () => guard(async () => true /*Recorder.release()*/ ),

  setCoinAccount: (coinAccount) => guard(() => setCoinAccount(coinAccount)),
  getCoinAccountDetails: () => guard(() => getCoinAccountDetails()),

  setCreditDetails: (details) => guard(() => setCreditDetails(details)),
  hasCreditDetails: () => guard(() => hasCreditDetails()),

  getHarvestConfig: () => guard(() => getHarvestConfig()),
  setHarvestConfig: (config) => guard(() => setHarvestConfig(config)),

  alwaysRunScraperVisible: (visible?: boolean) => guard(async () => {
    if (visible !== undefined) {
      await setProcessConfig({ alwaysRunScraperVisible: visible });
    }
    const config = await getProcessConfig();
    return config?.alwaysRunScraperVisible ?? false;
  }),
  alwaysRunScraperLogging: (logging?: boolean) => guard(async () => {
    if (logging !== undefined) {
      await setScraperLogging(logging);
    }
    return await getScraperLogging();
  }),
  runHarvester: (forceVisible?: boolean) => guard(() => {
    const visible = new VisibleOverride(forceVisible);
    return harvest(onBgTaskMsg)
      .finally(() => visible.dispose());
  }),
  getCurrentState: () => guard(() => getRawState()),

  exportResults: () => guard(() => exportResults()),
  exportConfig: () => guard(async () => {
    const config = await getProcessConfig();
    return JSON.stringify(config, null, 2);
  }),

  hasUserEnabledLingering: () => guard(async () => {
    return await isLingeringEnabled();
  }),

  enableLingeringForCurrentUser: () => guard(async () => {
    // Trigger enable
    const result = await enableLingeringForCurrentUser();
    return result;
  }),

  openLogsFolder: () => guard(openLogsFolder),
  openWebsiteUrl: (type) => guard(() => openWebsiteUrl(type)),
  getArgv: () => guard(() => Promise.resolve({
    argv: process.argv,
    broker: process.env.WALLET_BrokerCAD_ADDRESS,
    saveDump: process.env.HARVESTER_SAVE_DUMP,
    env: {
      ...process.env
    },
    logsFolder,
  })),

  setOverrides: (balance, pendingAmt, pendingDate) => guard(() => setOverrides(balance, pendingAmt, pendingDate)),

  importScraperScript: (config) => guard(async () => {

    // Extract the scraping configuration
    const scraping = getScrapingScript(config);

    // Set the configuration using the existing API
    await setProcessConfig({scraping});

    return true;
  }),

  getBankConnectDetails: () => guard(getBankConnectDetails),

  // Wallet connect from site-app
  loadWalletFromSite: (timeoutMs?: number) => guard(async () => loadWalletFromSite(onBgTaskMsg, timeoutMs)),
  cancelloadWalletFromSite: () => guard(async () => resetService()),
}

const onBgTaskMsg = (progress: BackgroundTaskInfo) => {
  // Use emit instead of handle for progress updates
  ipcMain.emit(actions.onBackgroundTaskProgress, progress);
}

export function initMainIPC() {

  ipcMain.handle(actions.hasInstalledBrowser, api.hasInstalledBrowser);
  ipcMain.handle(actions.hasCompatibleBrowser, api.hasCompatibleBrowser);

  ipcMain.handle(actions.downloadLibraries, api.downloadLibraries);

  ipcMain.handle(actions.autoProcess, (_event, params: AutoConfigParams) => api.autoProcess(params));
  ipcMain.handle(actions.validateAction, async (_event, actionName: ActionType, inputValues: Record<string, string>) => {
    return api.validateAction(actionName, inputValues);
  });
  ipcMain.handle(actions.twofaRefresh, (_event, actionName) => api.twofaRefresh(actionName));

  ipcMain.handle(actions.replyQuestion, (_event, response) => api.replyQuestion(response));

  ipcMain.handle(actions.warmup, async (_event, url: string) => api.warmup(url));

  ipcMain.handle(actions.start, async (_event, actionName: ActionType, url: string, dynamicValues?: string[]) => {
    return api.start(actionName, url, dynamicValues);
  })
  ipcMain.handle(actions.learnValue, async (_event, valueName: string, valueType: ValueType) => {
    return api.learnValue(valueName, valueType);
  })
  ipcMain.handle(actions.setDynamicInput, async (_event, name: string, value: ValueType) => {
    return api.setDynamicInput(name, value);
  })
  ipcMain.handle(actions.finishAction, async (_event) => {
    return api.finishAction();
  })

  ipcMain.handle(actions.setCoinAccount, async (_event, coinAccount: CoinAccount) => {
    return api.setCoinAccount(coinAccount);
  })
  ipcMain.handle(actions.getCoinAccountDetails, async (_event) => {
    return api.getCoinAccountDetails();
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

  ipcMain.handle(actions.alwaysRunScraperVisible, async (_event, visible?: boolean) => {
    return api.alwaysRunScraperVisible(visible);
  })
  ipcMain.handle(actions.alwaysRunScraperLogging, async (_event, logging?: boolean) => {
    return api.alwaysRunScraperLogging(logging);
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

  ipcMain.handle(actions.hasUserEnabledLingering, async (_event) => {
    return api.hasUserEnabledLingering();
  })
  ipcMain.handle(actions.enableLingeringForCurrentUser, async (_event) => {
    return api.enableLingeringForCurrentUser();
  })

  ipcMain.handle(actions.openLogsFolder, async (_event) => {
    return api.openLogsFolder();
  })
  ipcMain.handle(actions.openWebsiteUrl, async (_event, type: WebsiteEndpoints) => {
    return api.openWebsiteUrl(type);
  })
  ipcMain.handle(actions.getArgv, async (_event) => {
    return api.getArgv();
  })

  ipcMain.handle(actions.setOverrides, async (_event, balance: number, pendingAmt: number|null, pendingDate: string|null) => {
    return api.setOverrides(balance, pendingAmt, pendingDate);
  })

  ipcMain.handle(actions.importScraperScript, async (_event, config) => {
    return api.importScraperScript(config);
  });

  ipcMain.handle(actions.getBankConnectDetails, async (_event) => {
    return api.getBankConnectDetails();
  });

  // Wallet connect from site-app
  ipcMain.handle(actions.loadWalletFromSite, async (_event, timeoutMs?: number) => {
    return api.loadWalletFromSite(timeoutMs);
  });
  ipcMain.handle(actions.cancelloadWalletFromSite, async (_event) => {
    return api.cancelloadWalletFromSite();
  });

  // Set up progress listener separately
  ipcMain.on(actions.onBackgroundTaskProgress, (progress) => {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(window => {
      if (!window.isDestroyed()) {
        window.webContents.send(actions.onBackgroundTaskProgress, progress);
      }
    });
  });
}

// NOTE!  This is used in multiple places, deduplicate it at some point
const getEmailAddress = (coinAddress: string) => `${coinAddress}@${process.env.TX_GMAIL_DEPOSIT_DOMAIN}`
