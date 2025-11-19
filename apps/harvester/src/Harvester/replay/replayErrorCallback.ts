import { maybeCloseModal } from "@thecointech/scraper-agent/modal";
import { notify, notifyError } from "../notify";
import type { Page } from "puppeteer";
import type { AnyEvent } from "@thecointech/scraper-types";
import type { ReplayErrorParams } from "@thecointech/scraper";
import { EventSection, SectionName } from "@thecointech/scraper-agent/types";
import { isSection } from "@thecointech/scraper-agent/replay/events";
import { ElementNotFoundError } from "@thecointech/scraper";
import { log } from "@thecointech/logging";
import { getElementForEvent } from "@thecointech/scraper/elements";

export async function replayErrorCallback({page, err, event, events}: ReplayErrorParams, root: EventSection): Promise<number|undefined> {


  const section = findSectionByEvent(event, root);
  if (!section) {
    // This should never happen
    log.error({event: event, err: err}, "Failed to find section for event");
    return undefined;
  }

  if (err instanceof ElementNotFoundError) {

    // Major issues on replay:
    // - Modal
    // - TwoFA
    // - Unknown redirect

    // On failed 2FA, we think we're in AccountSummary
    // but we are actually on the TwoFA page.
    if (section.section === "AccountsSummary") {
      const inTwoFA = await isPageInTwoFA(page, root);
      if (inTwoFA) {
        notifyError({
          title: 'Bank connection error',
          message: "TwoFA error: please refresh the token in the app",
        })
        return undefined;
      }
    }

    // Our only AI-enabled option is to close any modal
    const didClose = await maybeCloseModal(page);
    if (didClose) {
      // Validation - does this work on live runs?
      // TODO: Remove once confident
      if (process.env.NOTIFY_ON_MODAL_ENCOUNTER) {
        notify({
          title: 'Modal Successfully Closed',
          message: "Closed Modal on page: " + page.url(),
        })
      }
      // Re-run this event.
      return events.indexOf(event);
    }

    // If we aren't sure what's gone wrong,
    // but we are in the logout section,
    // We ignore the problem and continue.
    if (section.section === "Logout") {
      // We have failed to logout.  This is bad, but not a deal-breaker.
      log.warn(err, "Failed to logout");
      return events.length;
    }
  }

  // No way to handle this error
  return undefined;
}


async function isPageInTwoFA(page: Page, root: EventSection) {
  const twoFaSection = findSectionByName("TwoFA", root);
  if (twoFaSection) {
    // The easiest way to tell is to search for the first element
    const events = twoFaSection.events.filter(e => !isSection(e)) as AnyEvent[];
    const firstInteraction = events.find(e => (e.type === "input" || e.type === "click"));

    if (firstInteraction) {
      try {
        const matched = await getElementForEvent({
          page,
          timeout: 1000,
          event: {
            ...firstInteraction,
            eventName: "testInTwoFA",
          }
        }, async () => {});
        return Boolean(matched);
      }
      catch (e) {
      }
    }
  }
  return false;
}

function findSectionByEvent(search: AnyEvent, section: EventSection) : EventSection | null {
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


function findSectionByName(search: SectionName, section: EventSection) : EventSection | null {
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
