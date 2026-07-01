import { maybeCloseModal } from "@thecointech/scraper-agent/modal";
import { notify, notifyError } from "@/notify";
import { TimeoutError } from "puppeteer";
import type { ReplayErrorParams } from "@thecointech/scraper";
import type { EventSection } from "@thecointech/scraper-agent/types";
import { ElementNotFoundError } from "@thecointech/scraper";
import { log } from "@thecointech/logging";
import { handleTwoFA } from "./twofa";
import { isPageInSection, findSectionByEvent, findSectionByName } from "./utils";

export async function replayErrorHandling({replay, err, event}: ReplayErrorParams, root: EventSection): Promise<number|undefined> {
  const section = findSectionByEvent(event, root);
  if (!section) {
    // This should never happen
    log.error({event: event, err: err}, `Failed to find section ${event.section} for event`);
    return undefined;
  }

  log.info(`Running replay error callback for section: ${section.section}`);

  // Major issues on replay:
  // - Modal
  // - TwoFA
  // - Unknown redirect
  const { page, events } = replay;

  // 2FA can interrupt login: either an element is not found because we
  // landed on the TwoFA page, or a navigation out of Login times out.
  // The only possible sectins are Login (if the page pops over the current page)
  // or AccountsSummary (it is the only legal next section)
  if (section.section === "Login" || section.section === "AccountsSummary") {
    if (err instanceof ElementNotFoundError || err instanceof TimeoutError) {
      const twoFaSection = findSectionByName("TwoFA", root);
      if (!twoFaSection) {
        notifyError({
          title: "2FA Section Missing",
          message: "A login/navigation error occurred that may be due to 2FA, but the original recording does not include a TwoFA section. Please re-record with 2FA enabled.",
        });
      }
      else {
        log.info("Testing for 2FA page");
        const inTwoFA = await isPageInSection(page, root, "TwoFA");
        if (inTwoFA) {
          log.info("Page is in TwoFA section");
          return await handleTwoFA(page, events, root, replay, inTwoFA.section);
        }
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
      // Re-run this event.  Defensively check by ID, then by reference in case ID's are missing
      const index = events.findIndex(e => e.id === event.id);
      if (index !== -1) {
        return index;
      }
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
