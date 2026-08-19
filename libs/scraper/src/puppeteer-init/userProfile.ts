

import os from 'node:os';
import path from 'node:path';
import { rootFolder } from './rootFolder';
import { existsSync } from 'node:fs';
import { remove } from 'fs-extra';
import { log } from '@thecointech/logging';
import { getBrowserType } from './type';

export function getUserDataDir() {
  return path.join(rootFolder(), 'userdata', getBrowserType());
}

// Retained for a possible future re-enable of profile copying (see maybeCopyProfile)
export function getSystemChromeProfilePath() {
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

export async function cleanExistingProfile() {
  const type = getBrowserType();
  const userDataDir = getUserDataDir();
  const exists = existsSync(userDataDir);

  if (exists) {
    log.debug({ browser: type }, `Removing existing {browser} profile`);
    await remove(userDataDir);
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
