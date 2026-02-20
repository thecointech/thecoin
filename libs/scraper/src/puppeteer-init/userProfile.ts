

import os from 'node:os';
import path from 'node:path';
import { rootFolder } from './rootFolder';
import { existsSync } from 'node:fs';
import { copy, remove } from 'fs-extra';
import { log } from '@thecointech/logging';
import { getBrowserType } from './type';
import { isChromeRunning } from './isChromeRunning';

export function getUserDataDir() {
  return path.join(rootFolder(), 'userdata', getBrowserType());
}

function getSystemChromeProfilePath() {
  const platform = os.platform();

  switch (platform) {
    case 'win32': // Windows
      return path.join(process.env.LOCALAPPDATA!, 'Google', 'Chrome', 'User Data');
    case 'darwin': // macOS
      return path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome');
    case 'linux': // Linux
      return path.join(os.homedir(), '.config', 'google-chrome'); // Or ~/.chromium, check both
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export async function maybeCopyProfile(force: boolean = false, verifyChromeClosed?: () => Promise<boolean>) {
  const type = getBrowserType();
  const userDataDir = getUserDataDir();
  const exists = existsSync(userDataDir);

  if (!exists || force) {
    if (exists) {
      // if we have a way to ask the user to close chrome, lets do so.
      if (verifyChromeClosed) {
        // first, see if we need to close chrome
        if (await isChromeRunning()) {
          // ask the user to close chrome
          const confirm = await verifyChromeClosed();
          if (!confirm) {
            throw new Error("User cancelled");
          }
        }
      }
      log.debug({ browser: type }, `Removing existing {browser} profile`);
      await remove(userDataDir);
    }
    // Get the users existing profile (if one exists)
    if (type == "chrome") {
      const chromeProfilePath = getSystemChromeProfilePath();
      if (existsSync(chromeProfilePath)) {

        // Copy all profiles
        try {
          log.debug({chromeProfilePath, userDataDir}, `Copying Chrome profiles: {chromeProfilePath} -> {userDataDir}`);
          await copy(chromeProfilePath, userDataDir, { dereference: false });
          // Clear Singletons
          await cleanProfileLocks();
          log.debug(`Copy Chrome profile complete`);
        }
        catch (e) {
          log.error(e, `Failed to copy Chrome profile`);
          throw e;
        }
      }
      else {
        log.warn('No existing Chrome profile found');
      }
    }
    // TODO: Implement this for firefox
  }
}

export async function cleanProfileLocks() {
  const type = getBrowserType();
  if (type == "chrome") {
    const userDataDir = getUserDataDir();
    await remove(path.join(userDataDir, "SingletonLock"));
    await remove(path.join(userDataDir, "SingletonCookie"));
    await remove(path.join(userDataDir, "SingletonSocket"));
  }
}
