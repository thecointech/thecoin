import path from "path"
import { ChromeReleaseChannel, computeExecutablePath, computeSystemExecutablePath, detectBrowserPlatform, install, resolveBuildId } from "@puppeteer/browsers"
import os from "node:os"
import { existsSync, promises as fs } from "node:fs"
import { rootFolder } from "./rootFolder"
import { log } from "@thecointech/logging"
import { getBrowserType } from "./type"

const buildIdAlias = 'downloaded'

const browserDownloadDir = () => path.join(rootFolder(), 'browser')

export async function installBrowser(progress?: (bytes: number, total: number) => void) {
  const existing = await getLocalBrowserPath();

  if (existing) {
    // It is the responsibility of the caller to delete existing
    // installations to force a re-install
    log.info(
      { browser: getBrowserType(), path: existing },
      "{browser} install found at {path}"
    )
    return existing;
  }
  const cacheDir = browserDownloadDir();
  log.info(
    { browser: getBrowserType(), path: cacheDir },
    `Initiating download of {browser} to: {path}`
  )

  const platform = detectBrowserPlatform();
  if (!platform) {
    throw new Error(`Cannot detect the browser platform for: ${os.platform()} (${os.arch()})`);
  }
  const buildId = await resolveBuildId(
    getBrowserType(),
    platform,
    'stable',
  )
  const browser = await install({
    browser: getBrowserType(),
    cacheDir,
    buildId,
    buildIdAlias,
    downloadProgressCallback: progress,
  })

  log.info(
    { browser: getBrowserType(), path: browser.executablePath },
    "{browser} installed to: {path}"
  )

  return browser.executablePath
}

export async function removeBrowser() {
  const installed = await getLocalBrowserPath()
  if (installed) {
    await fs.rm(browserDownloadDir(), { recursive: true })
  }
}

export async function getSystemBrowserPath() {
  const path = computeSystemExecutablePath({
    browser: getBrowserType(),
    channel: ChromeReleaseChannel.STABLE,
  });
  return path
}

export async function getLocalBrowserPath() {
  const path = computeExecutablePath({
    browser: getBrowserType(),
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
