import { log } from "@thecointech/logging";
import { exec as exec_cp } from "node:child_process";
import { promisify } from 'node:util';
const exec = promisify(exec_cp);

export async function isChromeRunning() {
  try {
    switch (process.platform) {
      case 'win32':
        return await isChromeRunningWin();
      case 'darwin':
        return await isChromeRunningMac();
      case 'linux':
        return await isChromeRunningLinux();
      default:
        log.error("Unsupported platform");
        return false;
    }
  }
  catch (err) {
    log.error({err}, "Failed to check if Chrome is running");
    return false;
  }
}

async function isChromeRunningWin() {
  const r = await exec('tasklist');
  const chromeProcessRegex = /chrome\.exe|google chrome/i;
  const isRunning = chromeProcessRegex.test(r.stdout);
  return isRunning;
}

async function isChromeRunningMac() {
  const r = await exec('ps ux');
  const chromeProcessRegex = /google chrome/i;
  const isRunning = chromeProcessRegex.test(r.stdout);
  return isRunning;
}

async function isChromeRunningLinux() {
  const r = await exec('ps ux');
  const chromeProcessRegex = /google\/chrome\/chrome\s.*--type=renderer/i;
  const isRunning = chromeProcessRegex.test(r.stdout);
  return isRunning;
}
