import { EventSection, SectionName } from "@thecointech/scraper-agent";
import { getProcessConfig, setProcessConfig } from "./config";
import { ActionType, BankType } from "./scraper";
import { AnyEvent } from "@thecointech/scraper/types";


export async function setEvents(type: BankType, events: EventSection) {
  await setProcessConfig({
    scraping: {
      [type]: events
    }
  })
}

export async function getEvents(type: ActionType) {

  const config = await getProcessConfig();
  if (!config?.scraping)  {
    throw new Error(`No base node found for ${type}`);
  }
  const scrapingSource = type == 'visaBalance' ? 'credit' : 'chequing';
  const baseNode = ('both' in config.scraping)
    ? config.scraping.both
    : config.scraping[scrapingSource];

  if (!baseNode) {
    throw new Error(`No base node found for ${type}`);
  }

  const sectionsToKeep = getSectionsToKeep(type);
  const events = flatten(baseNode, sectionsToKeep);
  const strippedEvents = stripDuplicateNavigations(events);

  return strippedEvents;
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

function getSectionsToKeep(actionType: ActionType) : SectionName[] {
  const sectionsToKeep: SectionName[] = [];
  switch (actionType) {
    case "chqBalance":
      sectionsToKeep.push("Initial", "Landing", "Login", "AccountsSummary", "Logout");
      break;
    case "visaBalance":
      sectionsToKeep.push("Initial", "Landing", "Login", "CreditAccountDetails", "Logout");
      break;
    case "chqETransfer":
      sectionsToKeep.push("Initial", "Landing", "Login", "SendETransfer", "Logout");
      break;
  }
  return sectionsToKeep;
}
