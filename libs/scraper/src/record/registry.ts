import type { Browser } from 'puppeteer';
import { newPage } from '../puppeteer-init/newPage';
import { log } from '@thecointech/logging';
import { RecorderOptions } from './types';
import { Recorder } from './recorder';

//
// The recorder registry keeps track of all the active recorders
// and their various callbacks etc.
export class Registry {

  private static __instance: Registry|undefined;

  private browser: Browser|undefined;
  private recorders: Record<string, Recorder> = {};

  private constructor(browser: Browser) {
    this.browser = browser;
    browser.on('disconnected', this.clearAll);
  }

  clearAll = async () => {
    this.browser?.off('disconnected', this.clearAll);
    log.info(`** Browser disconnected with ${Object.keys(this.recorders).length} recorders`);
    for (const recorder of Object.values(this.recorders)) {
      await recorder[Symbol.asyncDispose]();
    }
    Registry.__instance = undefined;
  }

  static async create(options: RecorderOptions) {
    const { browser, page } = await newPage(options.context);

    let r = Registry.__instance ??= new Registry(browser);
    // Check if we have a recorder with this name already
    if (r.recorders[options.name]) {
      return r.recorders[options.name];
    }
    const instance = new Recorder(options);
    await instance.initialize(page);
    r.recorders[options.name] = instance;
    return instance;
  }

  static async instance(name: string) {
    return Registry.__instance?.recorders[name];
  }

  // Remove a recorder DOES NOT CLEAN IT UP
  static async remove(name: string) {
    delete Registry.__instance?.recorders[name];
  }
}
