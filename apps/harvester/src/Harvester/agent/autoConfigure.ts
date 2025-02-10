import { ActionTypes } from "../scraper/types";
import { Agent, SectionName, EventSection } from '@thecointech/scraper-agent';
import { AgentLogger } from "./agentLogger";
import { AskUserReact } from "./askUser";
import { setEvents } from "../config";
import { AnyEvent } from "@thecointech/scraper/types";
import { onProgress } from "./progress";

export async function autoConfigure(actionName: ActionTypes, url: string) {

  const toSkip = getSectionsToSkip(actionName);
  const baseNode = await Agent.process(actionName, url, AskUserReact.instance, AgentLogger.instance, onProgress, toSkip);

  // find all the sections we want to keep, and flatten them
  const sectionsToKeep: SectionName[]  = ["Initial", "Landing", "Login", "AccountsSummary", "CreditAccountDetails", "SendETransfer"]
  const events = flatten(baseNode, sectionsToKeep);
  await setEvents(actionName, events);
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

function getSectionsToSkip(actionName: ActionTypes) : SectionName[] {
  switch(actionName) {
    case "chqBalance": return ["SendETransfer", "CreditAccountDetails"];
    case "chqETransfer": return ["CreditAccountDetails"];
    case "visaBalance": return ["SendETransfer"];
  }
}
