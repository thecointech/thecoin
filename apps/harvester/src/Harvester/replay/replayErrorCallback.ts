import { maybeCloseModal } from "@thecointech/scraper-agent/modal";
import { notify, notifyError, notifyInput } from "@/notify";
import { TimeoutError, type Page } from "puppeteer";
import type { AnyEvent } from "@thecointech/scraper-types";
import type { Replay, ReplayErrorParams } from "@thecointech/scraper";
import { EventSection, SectionName } from "@thecointech/scraper-agent/types";
import { isSection } from "@thecointech/scraper-agent/replay/events";
import { ElementNotFoundError, processEvent } from "@thecointech/scraper";
import { log } from "@thecointech/logging";
import { getElementForEvent } from "@thecointech/scraper/elements";

export async function replayErrorCallback({replay, err, event}: ReplayErrorParams, root: EventSection): Promise<number|undefined> {
  const section = findSectionByEvent(event, root);
  if (!section) {
    // This should never happen
    log.error({event: event, err: err}, "Failed to find section for event");
    return undefined;
  }

  // Major issues on replay:
  // - Modal
  // - TwoFA
  // - Unknown redirect
  const { page, events } = replay;

  if (err instanceof ElementNotFoundError) {
    // On failed 2FA, we think we're in AccountSummary
    // but we are actually on the TwoFA page.
    const inTwoFA = await isPageInTwoFA(page, root);
    if (inTwoFA) {
      await attemptEnterTwoFA(replay, inTwoFA.twoFaSection);
      notifyError({
        title: 'Bank connection error',
        message: "TwoFA error: please refresh the token in the app",
      })
      return undefined;
    }
  }

  // If we are looking for something, or if we've failed to navigate
  let runThisAnyway = false;
  runThisAnyway = true;
  if (err instanceof TimeoutError || err instanceof ElementNotFoundError || runThisAnyway) {
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
  }

  // If we aren't sure what's gone wrong,
  // but we are in the logout section,
  // We ignore the problem and continue.
  if (section.section === "Logout") {
    // We have failed to logout.  This is bad, but not a deal-breaker.
    log.warn(err, "Failed to logout");
    return events.length;
  }

  // No way to handle this error
  return undefined;
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

async function isPageInTwoFA(page: Page, root: EventSection) {
  const twoFaSection = findSectionByName("TwoFA", root);
  if (twoFaSection) {
    // The easiest way to tell is to search for the first element
    const events = twoFaSection.events.filter(e => !isSection(e)) as AnyEvent[];
    const firstInteraction = events.find(e => (e.type === "input" || e.type === "click"));

    // Search for the first click/input we do in the TwoFA section
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
        return { twoFaSection, matched };
      }
      catch (e) {
        // Ignore - we return false below if element not found
      }
    }
  }
  return null;
}

// NOTE: Counter starts at 1 because processEvent
// will trigger a navigation on i == 0
async function attemptEnterTwoFA(replay: Replay, twoFaSection: EventSection, counter = 1) {
  // We don't want to recurse back into here.  If things go
  // wrong, we want to fail and let the user fix it.
  const { callbacks, ...noCallbacks } = replay;


  // Process all the events until we reach an input
  // If the user was required to click a destination first,
  // the code will be sent to that destination again
  // (unless the account has changed, in which case
  // we'll fail and the user can fix this in the app)
  // for ( event of twoFaSection.events) {
  for (let i = 0; i < twoFaSection.events.length; i++) {
    let event = twoFaSection.events[i];

    if (isSection(event)) {
      // This is a nested section, it should be more 2FA, but
      // if it's not, we should just skip it.
      if (event.section === "TwoFA") {
        counter = await attemptEnterTwoFA(replay, event, counter);
      }
    }
    else {
      if (event.type == "input") {
        // Replace the value with the user's input
        const code = await notifyInput("Your harvester needs a 2FA code to continue.  Please enter it now.");
        if (code) {
          event = {
            ...event,
            value: code,
          }
        }
      }
      const eventNavigates = () => {
        return (
          (event as AnyEvent).type != "navigation" &&
          (twoFaSection.events[i+1] as AnyEvent).type == "navigation"
        );
      }
      await processEvent(noCallbacks, event, eventNavigates);
      counter++;
    }

  }
  return counter;
}
