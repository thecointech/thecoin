import { getEvents } from "../events";
import { ActionType } from "../scraper";
import { ScraperCallbacks } from "../scraper/callbacks";
import { BackgroundTaskCallback } from "@/BackgroundTask";
import { Agent, type EventSection, type SectionName } from "@thecointech/scraper-agent";
import { sections } from '@thecointech/scraper-agent/processors/types';
import { isSection } from "@thecointech/scraper-agent/replay/events";
import { AnyEvent, InputEvent } from "@thecointech/scraper";
import { copyProfile } from "@/Download/profile";
import { log } from "@thecointech/logging";
import { AskUserLogin } from "./askUserLogin";
import { getErrorMessage } from "@/BackgroundTask/selectors";
import { maybeSerializeRun } from "../scraperLogging";

const ProfileTask = "twofaRefresh";

export async function twofaRefresh(type: ActionType, refreshProfile: boolean, callback: BackgroundTaskCallback) {

  log.info({type, refreshProfile}, "Running twofa refresh for {type} and profile {refreshProfile}");

  const toProcess = ["Initial", "CookieBanner", "Landing", "Login", "TwoFA"];
  const toSkip = sections.filter(s => !toProcess.includes(s));
  if (refreshProfile) {
    toProcess.push(ProfileTask);
  }
  const logger = new ScraperCallbacks(ProfileTask, callback, toProcess);

  try {
    const events = await getEvents(type);
    const login = getLoginDetails(events);
    const inputBridge = AskUserLogin.newLoginSession(login);

    if (refreshProfile) {
      const wasRefreshed = await copyProfile(logger.subTaskCallback, true);
      if (!wasRefreshed) {
        throw new Error("Failed to refresh profile - try deleting profile manually");
      }
    }

    using _ = await maybeSerializeRun(logger.logsFolder, type);
    await using agent = await Agent.create(ProfileTask, inputBridge, getUrl(events), logger);
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

function getUrl(node: EventSection): string {
  const navEvent = node.events[0];
  if (isSection(navEvent) || navEvent.type !== "navigation") {
    throw new Error("First event should be a navigation");
  }
  return navEvent.to;
}

const isEvent = (e: EventSection | AnyEvent): e is AnyEvent => !isSection(e);
const isInput = (e: AnyEvent): e is InputEvent => e.type === "input";
function getLoginDetails(events: EventSection) {
  const login = findSection(events, "Login");
  const inputEvents = login?.events
    .filter(isEvent)
    .filter(isInput)
  if (inputEvents?.length !== 2) {
    throw new Error("Login section should have exactly 2 input events");
  }
  return {
    username: inputEvents[0].value,
    password: inputEvents[1].value
  };
}

function findSection(events: EventSection, name: SectionName): EventSection | undefined {
  for (const event of events.events) {
    if (isSection(event)) {
      if (event.section === name) {
        return event;
      }
    }
  }
  return undefined;
}
