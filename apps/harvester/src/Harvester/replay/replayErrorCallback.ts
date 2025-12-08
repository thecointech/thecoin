import { maybeCloseModal } from "@thecointech/scraper-agent/modal";
import { notify, notifyError, notifyInput } from "@/notify";
import { TimeoutError, type Page } from "puppeteer";
import type { AnyEvent } from "@thecointech/scraper-types";
import type { Replay, ReplayErrorParams } from "@thecointech/scraper";
import { EventSection, SectionName } from "@thecointech/scraper-agent/types";
import { flatten, isSection } from "@thecointech/scraper-agent/replay/events";
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

  log.info("Running replay error callback");

  // Major issues on replay:
  // - Modal
  // - TwoFA
  // - Unknown redirect
  const { page, events } = replay;

  if (err instanceof ElementNotFoundError) {
    log.info("Testing for 2FA page");
    // On failed 2FA, we think we're in AccountSummary
    // but we are actually on the TwoFA page.
    const inTwoFA = await isPageInSection(page, root, "TwoFA");
    if (inTwoFA) {
      log.info("Page is in TwoFA section");
      try {
        await attemptEnterTwoFA(replay, inTwoFA.section);
        // Our assumption is that if we do not throw, we should
        // be able to continue with the rest of the replay.
        const success = await isPageInSection(page, root, "AccountsSummary");
        if (!success) {
          throw new Error("Attempted to enter 2FA, but failed to enter AccountsSummary");
        }
        log.info("Page is in AccountsSummary section");
        return findNextEventAfterTwoFA(events, root);
      }
      catch (e) {
        log.error(e, "Failed to enter 2FA");
        notifyError({
          title: 'Bank connection error',
          message: "TwoFA error: please refresh the token in the app",
        })
        return undefined;
      }
    }
  }

  // If we are looking for something, or if we've failed to navigate
  if (err instanceof TimeoutError || err instanceof ElementNotFoundError) {
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

async function isPageInSection(page: Page, root: EventSection, sectionName: SectionName) {
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

async function attemptEnterTwoFA(replay: Replay, twoFaSection: EventSection) {
  // We don't want to recurse back into here.  If things go
  // wrong, we want to fail and let the user fix it.
  const { callbacks, ...noCallbacks } = replay;
  log.info(`Enter refresh TwoFA token attempt with ${twoFaSection.events.length} events`);

  let hasEnteredInput = false;

  // Process all the events until we reach an input
  // If the user was required to click a destination first,
  // the code will be sent to that destination again
  // (unless the account has changed, in which case
  // we'll fail and the user can fix this in the app)
  for (let i = 0; i < twoFaSection.events.length; i++) {
    let event = twoFaSection.events[i];

    if (isSection(event)) {
      // This is a nested section, it should be more 2FA, but
      // if it's not, we should just skip it.
      if (event.section === "TwoFA") {
        await attemptEnterTwoFA(replay, event);
      }
    }
    else {
      // We need to enter a single input.  However, there may be multiple
      // inputs if the checkbox was clicked.  We can't filter on the inputs
      // type as it could be any random thing (eg 'tel'), so try to avoid
      // checkbox, don't do it twice (scraping should always do input first)
      if (event.type == "input" && event.inputType != "checkbox" && !hasEnteredInput) {
        log.info(`Found input event ${i} - ${event.eventName}`);
        // Replace the value with the user's input
        const code = await notifyInput("Your harvester needs a 2FA code to continue.  Please enter it now.");
        if (code) {
          event = {
            ...event,
            value: code,
          }
        }
        else {
          throw new Error("Code not received, or timed out")
        }
        hasEnteredInput = true;
      }
      const eventNavigates = () => {
        const next = twoFaSection.events[i + 1] as AnyEvent | undefined;

        // We only care about actions that trigger a navigation,
        // if already navigating, we don't want to navigate again
        const currentType = (event as AnyEvent).type;
        if (currentType == "navigation") return false;
        return (next?.type == "navigation");
      }
      log.info(`2FA - Processing event ${i} - ${event.type}`);
      await processEvent(noCallbacks, event, eventNavigates);
    }
  }
  log.info("Finished processing 2FA events");
}

// Find the index of the event to continue on after completing 2FA.
// The `events` array does not include 2FA, but we know it always
// comes after a login, so we continue with login + 1.
export function findNextEventAfterTwoFA(events: AnyEvent[], root: EventSection) {
  const lastLoginEvent = findLastLoginEvent(events, root);
  // We want to continue from the next event, so go to login + 1
  return lastLoginEvent + 1;
}

export function findLastLoginEvent(events: AnyEvent[], root: EventSection) {
  const loginSection = findSectionByName("Login", root);
  if (!loginSection) {
    throw new Error("Failed to find Login section");
  }
  const loginEvents = flatten(loginSection, ["Login"]);
  const lastEvent = loginEvents.toReversed().find(e => !isSection(e)) as AnyEvent;
  if (!lastEvent) {
    throw new Error("Failed to find last Login event");
  }
  log.info({
    event: lastEvent,
  }, "Found Login event: {event.id}");
  const idx = events.findIndex(i => i.id == lastEvent.id);
  if (idx === -1) {
    log.error({
      events: events.map(e => e.id),
    }, "Failed to map Login event to replay index");
    throw new Error("Failed to map Login event to replay index");
  }
  log.info("Found Login event index: " + idx);
  return idx;
}
