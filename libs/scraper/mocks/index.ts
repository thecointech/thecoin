export * from './mock_replay';
export * from '../src/puppeteer-init/setup'
import puppeteer from "puppeteer";
export { VisibleOverride } from '../src/puppeteer-init/visibility';
import { newPage as getPageOriginal } from '../src/puppeteer-init/newPage';
import { installBrowser as installBrowserOriginal } from "../src/puppeteer-init/browser";
import { projectUrl } from "@thecointech/setenv/projectUrl";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { rootFolder, setRootFolder } from '../src/puppeteer-init/rootFolder';

type BrowserConnection = {
  endpoint: string;
  count: number;
}

// Jest attempts to only have one instance of a browser open
// at all times, so we need to mock the newPage function
export async function newPage() {
  // Install browser if not already installed
  await installBrowser();
  const contextName = Date.now().toString();
  const info = getConnection();
  if (info.endpoint) {
    try {
      const browser = await puppeteer.connect({
        browserWSEndpoint: info.endpoint,
      });
      globalThis.__scraper__ = {
        browser,
        contexts: {},
      }
    }
    catch (e: any) {
      if (e.message?.includes("ECONNREFUSED")) {
        // If the browser has been closed,
        // but the cache info not updated
        // reset back to 0
        info.count = 0;
      }
      else {
        throw e;
      }
    }
  }
  const { page, browser } = await getPageOriginal(contextName);
  info.count++;
  info.endpoint = browser.wsEndpoint();
  setConnection(info);
  return { page, browser };
}

export async function replayEvents() {
  return {}
}

export async function closeBrowser() {
  const info = getConnection();
  info.count = Math.max(0, info.count - 1);
  setConnection(info);
  if (info.count == 0) {
    await globalThis.__scraper__?.browser.close();
    globalThis.__scraper__ = undefined;
  }
}

export async function installBrowser(progress?: (bytes: number, total: number) => void) {
  // Always install in repo cache
  const browserCache = getCacheUrl();
  setRootFolder(browserCache.pathname);
  await installBrowserOriginal(progress);
}


const getCacheUrl = () => new URL(".cache/", projectUrl());
const getConnectionUrl = () => new URL("jest_connection.json", getCacheUrl());
const getConnection = () =>
  existsSync(getConnectionUrl())
    ? JSON.parse(readFileSync(getConnectionUrl(), "utf-8")) as BrowserConnection
    : { endpoint: "", count: 0 };
const setConnection = (info: BrowserConnection) =>
  writeFileSync(getConnectionUrl(), JSON.stringify(info));
