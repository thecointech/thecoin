import { SubTaskProgress } from "@/BackgroundTask";
import { AskUserReact } from "@/Harvester/agent/askUser";
import { log } from "@thecointech/logging";
import { exec as exec_cp } from "node:child_process";
import { promisify } from 'node:util';
import { maybeCopyProfile } from "@thecointech/scraper/puppeteer";
import { getErrorMessage } from "@/BackgroundTask/selectors";

const exec = promisify(exec_cp);

export async function copyProfile(onProgress: (info: SubTaskProgress) => void, force = false) {

  const timestamp = Date.now().toString();
  // TODO: Add firefox support
  if (await isChromeRunning()) {
    using askUser = AskUserReact.newSession("profile" + timestamp)
    const confirm = await askUser.forConfirm("Please close Chrome before continuing");
    if (!confirm) {
      return false;
    }
  }
  try {
    onProgress({
      subTaskId: "profile",
      percent: 0
    })
    await maybeCopyProfile(force);
    onProgress({
      subTaskId: "profile",
      percent: 100,
      completed: true
    })
    return true;
  }
  catch (err) {
    const message = getErrorMessage(err);
    log.error({err}, "Failed to copy profile");
    onProgress({
      subTaskId: "profile",
      error: message,
      completed: true
    })
    return false;
  }
}


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
