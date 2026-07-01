import type { AnyEvent } from "@thecointech/scraper";
import type { EventSection, SectionName } from "@thecointech/scraper-agent/types";
import type { Page } from "puppeteer";
import { getElementForEvent } from "@thecointech/scraper/elements";
import { flatten, isSection } from "@thecointech/scraper-agent/replay/events";
import { log } from "@thecointech/logging";

export function findSectionByEvent(search: AnyEvent, section: EventSection) : EventSection | null {
  if (!search) {
    return null;
  }
  for (const eventOrSection of section.events) {
    if (isSection(eventOrSection)) {
      const r = findSectionByEvent(search, eventOrSection);
      if (r) return r;
    }
    // Match by id or reference (reference in case legacy events which didn't have ID's find their way in here)
    else if (eventOrSection === search || eventOrSection.id === search.id) {
      return section;
    }
  }
  return null;
}


export function findSectionByName(search: SectionName, section: EventSection) : EventSection | null {
  if (section.section === search) {
    return section;
  }
  for (const eventOrSection of section.events) {
    if (isSection(eventOrSection)) {
      const r = findSectionByName(search, eventOrSection);
      if (r) return r;
    }
  }
  return null;
}

export async function isPageInSection(page: Page, root: EventSection, sectionName: SectionName) {
  const section = findSectionByName(sectionName, root);
  if (section) {
    // The easiest way to tell is to search for the first element
    const events = flatten(section, [sectionName]);

    // Search for the first page interaction we do in the section
    const firstElement = events.find(e => (e.type === "input" || e.type === "click" || e.type == "value"));
    if (firstElement) {
      try {
        const matched = await getElementForEvent({
          page,
          timeout: 1000,
          event: {
            ...firstElement,
            eventName: "isIn" + sectionName,
          }
        }, async () => {});
        return { section, matched };
      }
      catch (e) {
        // Ignore - we return false below if element not found
      }
    }
  }
  else {
    log.error(`Section ${sectionName} not found in root section, cannot determine if page is in section`);
  }
  return null;
}
