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
import { ToggleShowBrowser } from "./toggleShowBrowser";

const ProfileTask = "twofaRefresh";

export async function twofaRefresh(type: ActionType, refreshProfile: boolean, showBrowser: boolean, callback: BackgroundTaskCallback) {

  const toProcess = ["Initial", "CookieBanner", "Landing", "Login", "TwoFA", "Logout"];
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
    await copyProfile(logger.subTaskCallback, true);
  }

  using _ = new ToggleShowBrowser(showBrowser);

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
