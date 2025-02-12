import { Agent, SectionName, EventSection, ProgressInfo } from '@thecointech/scraper-agent';
import { AgentLogger } from "./agentLogger";
import { AskUserReact } from "./askUser";
import { setEvents } from "../config";
import { AnyEvent } from "@thecointech/scraper/types";
import { log } from "@thecointech/logging";
import type { BackgroundTaskCallback } from "@/BackgroundTask/types";
import { initAgent } from "./init";
import { ActionTypes } from '../scraper';

export type AutoConfigParams = {
  doChequing: boolean;
  doCredit: boolean;
  name: string;
  url: string;
  username: string;
  password: string;
}
export async function autoConfigure({ doChequing, doCredit, name, url, username, password }: AutoConfigParams, depositAddress: string, callback: BackgroundTaskCallback) {

  log.info(`Agent: Starting configuration for action: autoConfigure`);
  // This should do nothing, but call it anyway
  await initAgent(callback);

  if (!username || !password) throw new Error("Username and password are required");

  const inputBridge = AskUserReact.newSession(depositAddress);
  inputBridge.setUsername(username);
  inputBridge.setPassword(password);

  const toSkip = getSectionsToSkip(doChequing, doCredit);
  const onProgress = (progress: ProgressInfo) => {
    const totalPercent = progress.sectionPercent + (progress.section * 100) / progress.totalSections;
    callback({
      taskId: "agent",
      stepId: name,
      progress: totalPercent,
      label: `Step ${progress.section + 1} of ${progress.totalSections}`
    })
  }

  try {
    const baseNode = await Agent.process(name, url, inputBridge, AgentLogger.instance, onProgress, toSkip);

    // Store events in the old linear format (for now)
    if (doChequing) {
      await storeEvents(name, baseNode, "chqBalance");
      await storeEvents(name, baseNode, "chqETransfer");
    }

    if (doCredit) {
      await storeEvents(name, baseNode, "visaBalance");
    }

    callback({
      taskId: "agent",
      stepId: name,
      progress: 100,
      completed: true
    })

    log.info(`Agent: Finished configuring for action: ${name}`);
  }
  catch (e) {
    log.error(e, `Error configuring agent for action: ${name}`);
    const msg = e instanceof Error ? e.message : String(e);
    callback({
      taskId: "agent",
      stepId: name,
      completed: false,
      error: msg
    })
    throw e;
  }

  // find all the sections we want to keep, and flatten them
  return true;
}


export function flatten(section: EventSection, sectionsToKeep: SectionName[]): AnyEvent[] {
  const events: AnyEvent[] = [];
  const shouldKeep = sectionsToKeep.includes(section.section);

  for (const event of section.events) {
    if ('section' in event) {
      // This is another EventSection, recurse into it
      const subEvents = flatten(event, sectionsToKeep);
      events.push(...subEvents);
    }
    else if (shouldKeep) {
      // This is an AnyEvent and we want to keep events from this section
      events.push(event);
    }
  }
  return events;
}

export function stripDuplicateNavigations(events: AnyEvent[]) {
  // Return early if no events
  if (!events.length) return events;

  // Filter out consecutive navigation events to the same URL
  return events.filter((event, index) => {
    // Keep non-navigation events
    if (event.type !== 'navigation') return true;

    // Get the prior event
    const priorEvent = events[index - 1];
    // Keep this event if there is no prior event
    if (!priorEvent) return true;

    // If prior event is also a navigation event
    if (priorEvent.type === 'navigation') {
      // Discard this event
      return false;
    }

    // Keep this event as it's the first navigation event
    return true;
  });
}

async function storeEvents(name: string, baseNode: EventSection, type: ActionTypes) {
  const sectionsToKeep = getSectionsToKeep(type);
  log.info(`Agent: Events for ${name} collected`);
  const events = flatten(baseNode, sectionsToKeep);
  const strippedEvents = stripDuplicateNavigations(events);
  // TODO!!!
  await setEvents(type, strippedEvents);
}

function getSectionsToSkip(doChequing: boolean, doCredit: boolean) : SectionName[] {
  const sectionsToSkip: SectionName[] = [];
  if (!doCredit) sectionsToSkip.push("CreditAccountDetails");
  if (!doChequing) sectionsToSkip.push("SendETransfer");
  return sectionsToSkip;
}

function getSectionsToKeep(actionType: ActionTypes) : SectionName[] {
  const sectionsToKeep: SectionName[] = [];
  switch (actionType) {
    case "chqBalance":
      sectionsToKeep.push("Initial", "Landing", "Login", "AccountsSummary");
      break;
    case "visaBalance":
      sectionsToKeep.push("Initial", "Landing", "Login", "CreditAccountDetails");
      break;
    case "chqETransfer":
      sectionsToKeep.push("Initial", "Landing", "Login", "SendETransfer");
      break;
  }
  return sectionsToKeep;
}
