import type { AnyEvent } from "@thecointech/scraper-types";
import type { EventSection, SectionName } from "../types";


export type ReplayAction = 'visaBalance'|'chqBalance'|'chqETransfer';

export function getReplayEvents(baseNode: EventSection, type: ReplayAction | ReplayAction[]): AnyEvent[] {
  const sectionsToKeep = getSectionsToKeep(type);
  return getTrimmedEvents(baseNode, sectionsToKeep);
}

export function getTrimmedEvents(baseNode: EventSection, sectionsToKeep?: SectionName[]): AnyEvent[] {
  const events = flatten(baseNode, sectionsToKeep);
  return stripDuplicateNavigations(events);
}

export function isSection(event: EventSection|AnyEvent): event is EventSection {
  return 'section' in event;
}

export function flatten(section: EventSection, sectionsToKeep?: SectionName[]): AnyEvent[] {
  const events: AnyEvent[] = [];
  const shouldKeep = sectionsToKeep?.includes(section.section) ?? true;

  for (const event of section.events) {
    if (isSection(event)) {
      // This is another EventSection, recurse into it
      const subEvents = flatten(event, sectionsToKeep);
      events.push(...subEvents);
    }
    else if (shouldKeep) {
      // This is an AnyEvent and we want to keep events from this section
      // Stamp section if not already set (e.g. older recordings)
      const toPush = event.section
        ? event
        : { ...event, section: section.section };
      events.push(toPush);
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

const sessionSections: SectionName[] = ["Initial", "Landing", "Login"];
const sessionEnd: SectionName[] = ["Logout"];

const actionSections: Record<ReplayAction, SectionName[]> = {
  chqBalance:   ["AccountsSummary"],
  visaBalance:  ["CreditAccountDetails"],
  chqETransfer: ["SendETransfer"],
};

export function getSectionsToKeep(actionType: ReplayAction | ReplayAction[]) : SectionName[] {
  const actions = Array.isArray(actionType) ? actionType : [actionType];
  const middle = actions.flatMap(a => actionSections[a]);
  return [...sessionSections, ...middle, ...sessionEnd];
}
