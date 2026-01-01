import { notifyError, notifyInput } from "@/notify";
import { Replay, AnyEvent, processEvent } from "@thecointech/scraper";
import { getTrimmedEvents, isSection } from "@thecointech/scraper-agent/replay/events";
import { EventSection } from "@thecointech/scraper-agent/types";
import { log } from "@thecointech/logging";
import { isPageInSection } from "./utils";
import { Page } from "puppeteer";


export async function handleTwoFA(page: Page, events: AnyEvent[], root: EventSection, replay: Replay, twoFaSection: EventSection) {

  try {
    await attemptEnterTwoFA(replay, twoFaSection);
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

  const loginEvents = getTrimmedEvents(root, ["Login"]);
  if (loginEvents.length === 0) {
    throw new Error("No login events found in passed EventSection");
  }

  const lastEvent = loginEvents.at(-1)!;
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
