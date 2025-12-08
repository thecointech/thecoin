
import { getReplayEvents } from "@thecointech/scraper-agent/replay/events";
import { findNextEventAfterTwoFA } from "./twofa";
import { getEvents } from "../../events";
import type { NavigationEvent } from "@thecointech/scraper-types";

it('Finds the correct TwoFA continue event for chequing balance', async () => {
  const chequingRoot = await getEvents("chqBalance");
  const balanceEvents = getReplayEvents(chequingRoot, "chqBalance");
  const balanceIdx = findNextEventAfterTwoFA(balanceEvents, chequingRoot);
  expect(balanceIdx).toBeTruthy();
  const event = balanceEvents[balanceIdx] as NavigationEvent;
  expect(event.type).toBe("navigation");
  expect(event.to).toContain("AccountsSummary");
});

it('Finds the correct TwoFA continue event for eTransfer', async () => {
  const chequingRoot = await getEvents("chqBalance");
  const sendEvents = getReplayEvents(chequingRoot, "chqETransfer");
  const sendIdx = findNextEventAfterTwoFA(sendEvents, chequingRoot);
  expect(sendIdx).toBeTruthy();
  const event = sendEvents[sendIdx] as NavigationEvent;
  expect(event.type).toBe("navigation");
  expect(event.to).toContain("SendETransfer");
});

it('Finds the correct TwoFA continue event for credit balance', async () => {
  const creditRoot = await getEvents("visaBalance");
  const creditEvents = getReplayEvents(creditRoot, "visaBalance");
  const creditIdx = findNextEventAfterTwoFA(creditEvents, creditRoot);
  expect(creditIdx).toBeTruthy();
  const event = creditEvents[creditIdx] as NavigationEvent;
  expect(event.type).toBe("navigation");
  expect(event.to).toContain("CreditAccountDetails");
})
