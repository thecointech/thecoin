import { BrowserWindow, ipcMain } from 'electron';
import { ValueType } from '@thecointech/scraper/types';
import { actions, ScraperBridgeApi } from './scraper_actions';
import { toBridge } from './scraper_bridge_conversions';
import { getHarvestConfig, getProcessConfig, getWallet, getWalletAddress, hasCreditDetails, setCreditDetails, setHarvestConfig, setWalletMnemomic } from './Harvester/config';
import { HarvestConfig, Mnemonic } from './types';
import { CreditDetails } from './Harvester/types';
import { spawn } from 'child_process';
import { exportResults, getState, setOverrides } from './Harvester/db';
import { harvest } from './Harvester';
import { logsFolder } from './paths';
import { platform } from 'node:os';
import { getLocalBrowserPath, getSystemBrowserPath } from '@thecointech/scraper/puppeteer-init/browser';
import { getValues, ActionType } from './Harvester/scraper';
import { AutoConfigParams, autoConfigure } from './Harvester/agent';
import { BackgroundTaskInfo } from './BackgroundTask';
import { AskUserReact } from './Harvester/agent/askUser';
import { Registry } from '@thecointech/scraper';
import { downloadRequired } from './Download/download';


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

  warmup: (url) => guard(async () => {
     const instance = await Registry.create({
      name: 'warmup',
      headless: false,
     }, url)
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

  setWalletMnemomic: (mnemonic) => guard(() => setWalletMnemomic(mnemonic)),
  getWalletAddress: () => guard(() => getWalletAddress()),

  setCreditDetails: (details) => guard(() => setCreditDetails(details)),
  hasCreditDetails: () => guard(() => hasCreditDetails()),

  getHarvestConfig: () => guard(() => getHarvestConfig()),
  setHarvestConfig: (config) => guard(() => setHarvestConfig(config)),

  runHarvester: (headless?: boolean) => guard(() => {
    process.env.RUN_SCRAPER_HEADLESS = headless?.toString()
    return harvest(onBgTaskMsg)
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

// const newBgTaskCb = (): BackgroundTaskCallbackInst => {
//   const id = Date.now().toString();
//   return (progress: BackgroundTaskInfoInst) => {
//     ipcMain.emit(actions.onBackgroundTaskProgress, {id, ...progress});
//   }
// }
const onBgTaskMsg = (progress: BackgroundTaskInfo) => {
  // Use emit instead of handle for progress updates
  ipcMain.emit(actions.onBackgroundTaskProgress, progress);
}

export function initScraping() {

  ipcMain.handle(actions.hasInstalledBrowser, api.hasInstalledBrowser);
  ipcMain.handle(actions.hasCompatibleBrowser, api.hasCompatibleBrowser);

  ipcMain.handle(actions.downloadLibraries, api.downloadLibraries);

  ipcMain.handle(actions.autoProcess, (_event, params: AutoConfigParams) => api.autoProcess(params));
  ipcMain.handle(actions.validateAction, async (_event, actionName: ActionType, inputValues: Record<string, string>) => {
    return api.validateAction(actionName, inputValues);
  });

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

  ipcMain.handle(actions.setWalletMnemomic, async (_event, mnemonic: Mnemonic) => {
    return api.setWalletMnemomic(mnemonic);
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

const openFolder = (path: string) => {
  let explorer = '';
  switch (platform()) {
      case "win32": explorer = "explorer"; break;
      case "linux": explorer = "xdg-open"; break;
      case "darwin": explorer = "open"; break;
  }
  spawn(explorer, [path], { detached: true }).unref();
}


// async function installBrowser(event: IpcMainInvokeEvent) {
//   log.info('Installing browser');
//   let lastLoggedPercent = 0;
//   try {
//     await installChrome((bytes, total) => {
//       const percent = Math.round((bytes / total) * 100);
//       if (percent - lastLoggedPercent > 10) {
//         log.info(`Downloaded: ${percent}%`);
//         lastLoggedPercent = percent;
//       }
//       event.sender.send(actions.browserDownloadProgress, { percent });
//     });
//     event.sender.send(actions.browserDownloadProgress, { completed: true });
//   }
//   catch (e) {
//     log.error(e);
//     event.sender.send(actions.browserDownloadProgress, { error: e })
//   }
// }

// async function downloadLibraries(event: IpcMainInvokeEvent) {
//   await downloadRequired(progress => onBackgroundTaskProgress(event, progress))
// }

// function onBackgroundTaskProgress(event: IpcMainInvokeEvent, progress: BackgroundTaskInfo) {
//   event.sender.send(actions.onBackgroundTaskProgress, progress);
// }


// async function init(event: IpcMainInvokeEvent) {
//   await initAgent((progress) => onBackgroundTaskProgress(event, progress));
// }

// NOTE!  This is used in multiple places, deduplicate it at some point
const getEmailAddress = (coinAddress: string) => `${coinAddress}@${process.env.TX_GMAIL_DEPOSIT_DOMAIN}`

// async function autoProcess(event: IpcMainInvokeEvent,

// async function testAction(event: IpcMainInvokeEvent, actionName: ActionType, inputValues: Record<string, string>) {
//   const r = await getValues(actionName, (progress) => {
//     onBackgroundTaskProgress(event, progress);
//   }, inputValues)
//   return toBridge(r);
// }
