import { EventSection } from "@thecointech/scraper-agent";
import { AnyEvent } from "@thecointech/scraper/types";

const isNavigation = (event: AnyEvent|EventSection) => "type" in event && event.type === 'navigation';
export function stripDuplicateNavigationsArray(events: (AnyEvent|EventSection)[]) {
  // Return early if no events
  if (!events.length) return [];

  // Filter out consecutive navigation events to the same URL
  return events
    // First, recurse into contained sections
    .map(event => {
      if ("section" in event) {
        return stripDuplicateNavigationsSection(event);
      }
      return event;
    })
    // Next, filter out consecutive navigation events
    .filter((event, index) => {
      // Keep non-navigation events
      if (!isNavigation(event)) return true;

      // Get the prior event
      const priorEvent = events[index - 1];
      // Keep this event if there is no prior event
      if (!priorEvent) return true;

      // If prior event is also a navigation event
      if (isNavigation(priorEvent)) {
        // Discard this event
        return false;
      }
      // Keep this event as it's the first navigation event
      return true;
    })
}

export function stripDuplicateNavigationsSection(section: EventSection): EventSection {
  return {
    section: section.section,
    events: stripDuplicateNavigationsArray(section.events)
  }
}
