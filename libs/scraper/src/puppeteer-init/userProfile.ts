

import os from 'node:os';
import path from 'node:path';
import { rootFolder } from './rootFolder';
import { existsSync } from 'node:fs';
import { copy, remove } from 'fs-extra';
import { log } from '@thecointech/logging';
import { getBrowserType } from './type';

export function getUserDataDir() {
  return path.join(rootFolder(), 'userdata', getBrowserType());
}

function getChromeProfilePath() {
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

export async function maybeCopyProfile(force: boolean = false) {
  const type = getBrowserType();
  const userDataDir = getUserDataDir();
  const exists = existsSync(userDataDir);
  if (!exists || force) {
    if (exists) {
      log.debug({ browser: type }, `Removing existing {browser} profile`);
      await remove(userDataDir);
    }
    // Get the users existing profile (if one exists)
    if (type == "chrome") {
      const chromeProfilePath = getChromeProfilePath();
      if (existsSync(chromeProfilePath)) {

        // Copy all profiles
        try {
          log.debug(`Copying Chrome profiles`);
          await copy(chromeProfilePath, userDataDir, { dereference: false });
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
