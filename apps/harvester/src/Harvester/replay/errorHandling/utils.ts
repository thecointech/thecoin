import type { AnyEvent } from "@thecointech/scraper";
import type { EventSection, SectionName } from "@thecointech/scraper-agent/types";
import type { Page } from "puppeteer";
import { getElementForEvent } from "@thecointech/scraper/elements";
import { flatten, isSection } from "@thecointech/scraper-agent/replay/events";

export function findSectionByEvent(search: AnyEvent, section: EventSection) : EventSection | null {
  if (!search) {
    return null;
  }
  for (const eventOrSection of section.events) {
    if (eventOrSection === search) {
      return section;
    }
    else if (isSection(eventOrSection)) {
      const r = findSectionByEvent(search, eventOrSection);
      if (r) return r;
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
  return null;
}
