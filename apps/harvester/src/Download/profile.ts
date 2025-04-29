import { SubTaskProgress } from "@/BackgroundTask";
import { AskUserReact } from "@/Harvester/agent/askUser";
import { log } from "@thecointech/logging";
import { exec } from "node:child_process";
import { maybeCopyProfile } from "@thecointech/scraper/puppeteer";

export async function copyProfile(onProgress: (info: SubTaskProgress) => void, force = false) {

  const timestamp = Date.now().toString();
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
  catch (e) {
    onProgress({
      subTaskId: "profile",
      error: e as any,
      completed: false
    })
    return false;
  }
}


export async function isChromeRunning() {
  let command: string;
  if (process.platform === 'win32') {
    command = 'tasklist';
  } else if (process.platform === 'darwin' || process.platform === 'linux') {
    command = 'ps aux';
  } else {
    log.error("Unsupported platform");
    return false;
  }

  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, _stderr) => {
      if (err) {
        log.error(err, 'Error listing processes');
        return reject(err);
      }
      const chromeProcessRegex = /chrome\.exe|google chrome/i; // Adjust as needed
      const isRunning = chromeProcessRegex.test(stdout);
      resolve(isRunning);
    });
  });
}
