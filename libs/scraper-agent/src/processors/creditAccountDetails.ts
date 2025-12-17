import { log } from "@thecointech/logging";
import { ElementData, VisaBalanceResult } from "../types";
import { getElementForEvent } from "@thecointech/scraper/elements";
import { clickElement } from "../interactions";
import { processorFn } from "./types";
import { Agent } from "../agent";
import { apis } from "../apis";

export const CreditAccountDetails = processorFn("CreditAccountDetails", async (agent: Agent, navData: ElementData) => {
  log.trace("AccountDetailsWriter: begin processing");

  // First, we have to navigate to the page...
  // they start on their initial page.
  await navigateToAccountDetails(agent, navData);
  agent.onProgress(25);
  await saveCurrentBalance(agent);
  agent.onProgress(50);
  await saveDueDate(agent);
  agent.onProgress(75);
  await saveDueAmount(agent);
  agent.onProgress(100);
  await savePending(agent);
}, true);

async function navigateToAccountDetails(agent: Agent, navData: ElementData) {
  // Refresh the element, it's possible the page has navigated since it was found
  const navElement = await getElementForEvent({
    page: agent.page.page,
    event: { eventName: "navigate", estimated: true, ...navData }
  });

  // First, we have to navigate to the page...
  const navigated = await clickElement(agent.page.page, navElement);
  if (!navigated) {
    log.error("Failed to navigate to account details page");
  }

  // Check that we are on the correct page
  const intent = await agent.page.getPageIntent();
  if (intent != "CreditAccountDetails") {
    log.error(`Navigated to wrong page: ${intent}`);
  }
}

async function saveCurrentBalance(agent: Agent) {
  log.trace("AccountDetailsWriter: saving current balance");
  const api = await apis().getCreditDetailsApi();
  const { data: balance } = await api.currentBalance(await agent.page.getImage());
  const element = await agent.page.toElement(balance, {
    eventName: "balance",
    parsing: {
      type: "currency",
      format: null,
    }
  });
  await agent.events.pushValueEvent<VisaBalanceResult>(element, "balance", "currency");
}

async function savePending(agent: Agent) {
  log.trace("AccountDetailsWriter: saving pending");
  const api = await apis().getCreditDetailsApi();
  const { data: pending } = await api.currentPending(await agent.page.getImage());
  if (pending.pending_exists) {
    const element = await agent.page.toElement(pending.pending_element, {
      eventName: "pending",
      parsing: {
        type: "currency",
        format: null,
      }
    });
    await agent.events.pushValueEvent<VisaBalanceResult>(element, "pending", "currency");
  }
}

async function saveDueDate(agent: Agent) {
  log.trace("AccountDetailsWriter: saving due date");
  const api = await apis().getCreditDetailsApi();
  const { data: dueDate } = await api.currentDueDate(await agent.page.getImage());
  const element = await agent.page.toElement(dueDate, {
    eventName: "dueDate",
    parsing: {
      type: "date",
      format: null,
    }
  });
  await agent.events.pushValueEvent<VisaBalanceResult>(element, "dueDate", "date");
}

async function saveDueAmount(agent: Agent) {
  log.trace("AccountDetailsWriter: saving due amount");
  const api = await apis().getCreditDetailsApi();
  const { data: dueAmount } = await api.currentDueAmount(await agent.page.getImage());
  const element = await agent.page.toElement(dueAmount, {
    eventName: "dueAmount",
    parsing: {
      type: "currency",
      format: null,
    }
  });
  await agent.events.pushValueEvent<VisaBalanceResult>(element, "dueAmount", "currency");
}
