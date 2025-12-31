
import { getReplayEvents } from "@thecointech/scraper-agent/replay/events";
import { findNextEventAfterTwoFA } from "./twofa";
import { getEvents } from "../../events";
import type { AnyEvent, NavigationEvent } from "@thecointech/scraper-types";
import { SectionName } from "@thecointech/scraper-agent/types";

it('Finds the correct TwoFA continue event for chequing balance', async () => {
  const chequingRoot = await getEvents("chqBalance");
  const balanceEvents = getReplayEvents(chequingRoot, "chqBalance");
  const balanceIdx = findNextEventAfterTwoFA(balanceEvents, chequingRoot);
  expectSectionTransition(balanceEvents, balanceIdx, "AccountsSummary");
});

it('Finds the correct TwoFA continue event for eTransfer', async () => {
  const chequingRoot = await getEvents("chqBalance");
  const sendEvents = getReplayEvents(chequingRoot, "chqETransfer");
  const sendIdx = findNextEventAfterTwoFA(sendEvents, chequingRoot);
  expectSectionTransition(sendEvents, sendIdx, "SendETransfer");
});

it('Finds the correct TwoFA continue event for credit balance', async () => {
  const creditRoot = await getEvents("visaBalance");
  const creditEvents = getReplayEvents(creditRoot, "visaBalance");
  const creditIdx = findNextEventAfterTwoFA(creditEvents, creditRoot);
  expectSectionTransition(creditEvents, creditIdx, "CreditAccountDetails");
});

function expectSectionTransition(events: AnyEvent[], idx: number, section: SectionName) {
  expect(idx).toBeGreaterThan(0);
  const prior = events[idx - 1];
  expect(prior.id).toContain("Login");
  const next = events[idx];
  expect(next.id).toContain(section);
}
