import { BackgroundTaskCallback, SubTaskProgress } from "@/BackgroundTask";
import { AskUserReact } from "@/Harvester/agent/askUser";
import { log } from "@thecointech/logging";
import { maybeCopyProfile } from "@thecointech/scraper/puppeteer";
import { getErrorMessage } from "@/BackgroundTask/selectors";
import crypto from "node:crypto";

export async function copyProfile(onProgress: (info: SubTaskProgress) => void, force = false) {
  try {
    await maybeCopyProfile(force, async () => {
      using askUser = AskUserReact.newSession()
      const confirm = await askUser.forConfirm("Please close Chrome before continuing");
      return confirm;
    });
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

export async function profileRefresh(callback: BackgroundTaskCallback) {
  const id = crypto.randomUUID();
  const groupTask = {
    type: "initialize" as const,
    id,
  }
  try {
    callback(groupTask);
    return await copyProfile((info: SubTaskProgress) => {
      callback({
        parentId: id,
        type: "initialize",
        ...info
      })
    }, true);
  }
  finally {
    callback({
      ...groupTask,
      completed: true,
    })
  }
}
