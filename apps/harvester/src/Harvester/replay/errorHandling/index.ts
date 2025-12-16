import { maybeCloseModal } from "@thecointech/scraper-agent/modal";
import { notify } from "@/notify";
import { TimeoutError } from "puppeteer";
import type { ReplayErrorParams } from "@thecointech/scraper";
import type { EventSection } from "@thecointech/scraper-agent/types";
import { ElementNotFoundError } from "@thecointech/scraper";
import { log } from "@thecointech/logging";
import { handleTwoFA } from "./twofa";
import { isPageInSection, findSectionByEvent } from "./utils";

export async function replayErrorHandling({replay, err, event}: ReplayErrorParams, root: EventSection): Promise<number|undefined> {
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
      return await handleTwoFA(page, events, root, replay, inTwoFA.section);
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
