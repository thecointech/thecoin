import path from "path"
import { Browser, ChromeReleaseChannel, computeExecutablePath, computeSystemExecutablePath, detectBrowserPlatform, install, resolveBuildId } from "@puppeteer/browsers"
import os from "node:os"
import { existsSync, promises as fs } from "node:fs"
import { rootFolder } from "./rootFolder"

// Our process:
// First, detect installed browsers
// Allow user to download chrome to browserDownloadDir
// Save path (do we need to?)

const buildIdAlias = 'downloaded'

const browserDownloadDir = () => path.join(rootFolder(), 'browser')

export async function installChrome(progress?: (bytes: number, total: number) => void) {
  const existing = await getLocalBrowserPath();
  if (existing) {
    // It is the responsibility of the caller to delete existing
    // installations to force a re-install
    return existing;
  }

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
    cacheDir: browserDownloadDir(),
    buildId,
    buildIdAlias,
    downloadProgressCallback: progress,
  })

  return browser.executablePath
}

export async function removeChrome() {
  const installed = await getLocalBrowserPath()
  if (installed) {
    await fs.rm(browserDownloadDir(), { recursive: true })
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
    cacheDir: browserDownloadDir(),
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
