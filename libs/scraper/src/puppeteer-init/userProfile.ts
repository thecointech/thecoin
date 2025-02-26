

import os from 'node:os';
import path from 'node:path';
import { rootFolder } from './rootFolder';
import { existsSync, readdirSync } from 'node:fs';
import { copy } from 'fs-extra';
import { log } from '@thecointech/logging';


export function getUserDataDir() {
  return path.join(rootFolder(), 'chrome_userdata');
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

export async function maybeCopyProfile() {
  const userDataDir = getUserDataDir();
  if (!existsSync(userDataDir)) {
    // Get the users existing profile (if one exists)
    const chromeProfilePath = getChromeProfilePath();
    if (existsSync(chromeProfilePath)) {

      // list available profiles
      const allcontents = readdirSync(chromeProfilePath, { withFileTypes: true });
      const profiles = allcontents.filter((c) => !c.isDirectory()).map((c) => c.name);
      const defaultProfile = profiles.find((p) => p.toLowerCase().includes('default')) ?? profiles[0];
      try {
        log.debug(`Copying Chrome profile: ${defaultProfile}`);
        await copy(path.join(chromeProfilePath, defaultProfile), userDataDir, { dereference: false });
        log.debug(`Copy Chrome profile complete`);
      }
      catch (e) {
        log.error(e, `Failed to copy Chrome profile`);
      }
    }
    else {
      log.warn('No existing Chrome profile found');
    }

  }
}
