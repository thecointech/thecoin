import { getBankConfig } from "../events";
import { ScraperCallbacks } from "../scraper/callbacks";
import type { BackgroundTaskCallback } from "@/BackgroundTask";
import { Agent } from "@thecointech/scraper-agent";
import { sections } from '@thecointech/scraper-agent/processors/types';
import { isSection } from "@thecointech/scraper-agent/replay/events";
import { log } from "@thecointech/logging";
import { AskUserLogin } from "./askUserLogin";
import { getErrorMessage } from "@/BackgroundTask/selectors";
import { maybeSerializeRun } from "../scraperLogging";
import type { RendererBankType } from "@/Agent/state/types";

const ProfileTask = "twofaRefresh";

export async function twofaRefresh(type: RendererBankType, callback: BackgroundTaskCallback) {

  log.info({type}, "Running twofa refresh for {type}");

  const toProcess = ["Initial", "CookieBanner", "Landing", "Login", "TwoFA"];
  const toSkip = sections.filter(s => !toProcess.includes(s));

  const logger = new ScraperCallbacks(ProfileTask, callback, toProcess);

  try {
    const config = await getBankConfig(type);
    if (!config) {
      throw new Error("No bank config found");
    }
    const inputBridge = AskUserLogin.newLoginSession({
      username: config.username,
      password: config.password
    });

    using _ = await maybeSerializeRun(logger.logsFolder, type);
    await using agent = await Agent.create(ProfileTask, inputBridge, config.url, logger);
    const result = await agent.process(toSkip);
    const wasSuccess = result.events.events.find(e => isSection(e) && e.section === "TwoFA");
    const error = wasSuccess ? undefined : "TwoFA not found in processed events";
    logger.complete({ result: wasSuccess ? "true" : "false", error });
    return true;
  }
  catch (e) {
    const message = getErrorMessage(e);
    logger.complete({ error: message });
    throw e;
  }
}
