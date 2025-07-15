import { AskUserReact } from "./askUser";
import { getEvents } from "../events";
import { ActionType } from "../scraper";
import { ScraperCallbacks } from "../scraper/callbacks";
import { BackgroundTaskCallback } from "@/BackgroundTask";
import { EventSection, SectionName } from "@thecointech/scraper-agent/types";
import { sections } from '@thecointech/scraper-agent/processors/types';
import { isSection } from "@thecointech/scraper-agent/replay/events";
import { Agent } from "@thecointech/scraper-agent/agent";
import { AnyEvent, InputEvent } from "@thecointech/scraper";
import { copyProfile } from "@/Download/profile";
import { log } from "@thecointech/logging";

const ProfileTask = "twofaRefresh";

export async function twofaRefresh(type: ActionType, refreshProfile: boolean, callback: BackgroundTaskCallback) {

  log.info({type, refreshProfile}, "Running twofa refresh for {type} and profile {refreshProfile}");

  const toProcess = ["Initial", "CookieBanner", "Landing", "Login", "TwoFA"];
  const toSkip = sections.filter(s => !toProcess.includes(s));
  if (refreshProfile) {
    toProcess.push(ProfileTask);
  }

  const events = await getEvents(type);
  const inputBridge = AskUserReact.newSession();
  const login = getLoginDetails(events);
  inputBridge.setUsername(login.username);
  inputBridge.setPassword(login.password);
  const logger = new ScraperCallbacks(ProfileTask, callback, toProcess);

  if (refreshProfile) {
    const wasRefreshed = await copyProfile(logger.subTaskCallback, true);
    if (!wasRefreshed) {
      throw new Error("Failed to refresh profile - try deleting profile manually");
    }
  }

  const baseNode = await Agent.process(ProfileTask, getUrl(events), inputBridge, logger, toSkip);
  const wasSuccess = baseNode.events.length > 0; // TODO: baseNode.events[baseNode.events.length - 1]. === "success";
  logger.complete(wasSuccess);
  return true;
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
