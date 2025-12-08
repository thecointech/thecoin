
import { getReplayEvents } from "@thecointech/scraper-agent/replay/events";
import { findFirstAccountsSummaryEvent } from "./replayErrorCallback";
import { getEvents } from "../events";


it('Finds the correct TwoFA continue event for chequing balance', async () => {
  const chequingRoot = await getEvents("chqBalance");
  const balanceEvents = getReplayEvents(chequingRoot, "chqBalance");
  const balanceIdx = findFirstAccountsSummaryEvent(balanceEvents, chequingRoot);
  expect(balanceIdx).toBeTruthy();
});

it('Finds the correct TwoFA continue event for eTransfer', async () => {
  const chequingRoot = await getEvents("chqBalance");
  const sendEvents = getReplayEvents(chequingRoot, "chqETransfer");
  const sendIdx = findFirstAccountsSummaryEvent(sendEvents, chequingRoot);
  expect(sendIdx).toBeTruthy();
});

it('Finds the correct TwoFA continue event for credit balance', async () => {
  const creditRoot = await getEvents("visaBalance");
  const creditEvents = getReplayEvents(creditRoot, "visaBalance");
  const creditIdx = findFirstAccountsSummaryEvent(creditEvents, creditRoot);
  expect(creditIdx).toBeTruthy();
})
