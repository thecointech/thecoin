import path from "path"
import { Browser, ChromeReleaseChannel, computeExecutablePath, computeSystemExecutablePath, detectBrowserPlatform, install, resolveBuildId } from "@puppeteer/browsers"
import os from "node:os"
import { existsSync, promises as fs } from "node:fs"
// Our process:
// First, detect installed browsers
// Allow user to download chrome to cacheDir
// Save path (do we need to?)


let rootFolder: string;
let cacheDir: string;
export function setRootFolder(folder: string) {
  rootFolder = folder;
  cacheDir = path.join(rootFolder, 'browser')
}
// By default, we initialize to CWD
setRootFolder(process.cwd())
const buildIdAlias = 'downloaded'

export async function installChrome(progress?: (bytes: number, total: number) => void) {
  // First, remove existing
  await removeChrome();

  const platform = detectBrowserPlatform();
  if (!platform) {
    throw new Error(`Cannot detect the browser platform for: ${os.platform()} (${os.arch()})`);
  }
  const buildId = await resolveBuildId(
    Browser.CHROME,
    platform,
    'stable',
  )
  const browser = await install({
    browser: Browser.CHROME,
    cacheDir,
    buildId,
    buildIdAlias,
    downloadProgressCallback: progress,
  })

  return browser.executablePath
}

export async function removeChrome() {
  const installed = await getLocalBrowserPath()
  if (installed) {
    await fs.rm(cacheDir, { recursive: true })
  }
}

export async function getSystemBrowserPath() {
  const path = computeSystemExecutablePath({
    browser: Browser.CHROME,
    channel: ChromeReleaseChannel.STABLE,
  });
  return path
}

export async function getLocalBrowserPath() {
  const path = computeExecutablePath({
    browser: Browser.CHROME,
    cacheDir,
    buildId: buildIdAlias,
  })
  // The above always returns a path,
  // but that doesn't mean it exists
  return (existsSync(path))
    ? path
    : undefined
}

export async function getBrowserPath() {
  return (
    (await getLocalBrowserPath()) ||
    (await getSystemBrowserPath())
  )
}

export function getUserDataDir() {
  return path.join(rootFolder, 'chrome_data');
}
