import { log } from "@thecointech/logging";
import { clickElement } from "../interactions";
import { processorFn } from "./types";
import { QuestionCancelError, type ElementResponse } from "../types";
import type { PhoneNumberElements } from "@thecointech/vqa";
import type { Agent } from "../agent";
import { apis } from "../apis";

export const TwoFA = processorFn("TwoFA", async (agent: Agent) => {
  // There should always be a username here
  await complete2FA(agent);
})

async function complete2FA(agent: Agent) {
  const api = await apis().getTwofaApi();
  const { data: action } = await api.detectActionRequired(await agent.page.getImage());
  agent.onProgress(10);
  switch (action.action) {
    case "SelectDestination":
      return await selectDestinationAndEnterCode(agent, action.message);
    case "InputCode":
      return await enterCode(agent, action.message);
    case "ApproveInApp":
      return await approveInApp(agent, action.message);
    case "Error":
      await agent.maybeThrow(new Error("2FA Error happened and we can't recover"));
      break;
    default:
      throw new Error("Failed to detect action");
  }
}

export async function selectDestinationAndEnterCode(agent: Agent, message: string) {
  await selectDestination(agent, message);
  await enterCode(agent, "Enter the 2FA code: ");
}

export async function selectDestination(agent: Agent, message: string) {
  const allOptions = await getDestinationOptions(agent);
  const dest = await askUserForDestination(agent, message, allOptions);
  const clickedOption = await agent.page.completeInteraction(dest,
    (found) => clickElement(agent.page.page, found),
    { hints: { eventName: "destination", tagName: "button" } }
  );
  if (!clickedOption) {
    await agent.maybeThrow(new Error("Failed to click destination"));
  }
}

export async function getDestinationOptions(agent: Agent) {
  const api = await apis().getTwofaApi();
  const image = await agent.page.getImage();
  const { data: destinations } = await api.detectDestinations(image);
  const allOptions = []
  if (destinations) {
    for (const ph of destinations.phones.phone_nos) {
      const found = await updateFromPage(agent, ph);
      const { text, coords } = found.data;
      log.info(`Updated phone number: ${ph.phone_number} -> ${found.data.text}`);
      const { data: options } = await api.getDestinationElements(text, coords.top, coords.left, coords.width, coords.height, await agent.page.getImage());
      allOptions.push({ name: found.data.text, options: options.buttons });
    }
  }
  return allOptions;
}

export async function updateFromPage(agent: Agent, response: PhoneNumberElements) {
  const asResponse = {
    content: response.phone_number,
    position_x: response.position_x,
    position_y: response.position_y,
    neighbour_text: ""
  }
  const element = await agent.page.toElement(asResponse, {
    eventName: "phone",
    parsing: {
      type: "phone",
      format: null
    }
  });
  return element;
}

async function enterCode(agent: Agent, message: string) {

  let code = await agent.input.forValue({ header: "Enter 2FA Code", question: message });

  for (let i = 0; i < 5; i++) {

    const api = await apis().getTwofaApi();
    const didEnter = await agent.page.tryEnterText(api, "getAuthInput", {
      text: code,
      hints: { eventName: "code", tagName: "input", inputType: "text" },
    });
    if (!didEnter) {
      await agent.maybeThrow(new Error("Failed to enter code"));
    }
    if (i == 0) {
      // We assume that the remember checkbox remembers
      // it's state on subsequent runs, so don't un-check it
      await clickRemember(agent);
    }
    await clickSubmit(agent);

    const pageIntent = await agent.page.getPageIntent();
    if (pageIntent != "Login") {
      // Successfully logged in
      return;
    }
    // Is there an error message?
    const intentApi = await apis().getIntentApi();
    const { data: error } = await intentApi.pageError(await agent.page.getImage());
    if (error.error_message_detected && error.error_message) {
      code = await agent.input.forValue({ header: "Error", question: error.error_message });
    }
  }
  await agent.maybeThrow(new Error("Failed to enter 2FA code"));
}

async function approveInApp(agent: Agent, message: string) {
  log.info("Waiting for 2FA approval");
  const result = await waitContinueCondition(agent, message);
  if (result == "error") {
    throw new Error("2FA errored out.");
  }
  log.info("2FA approved");
}

async function waitContinueCondition(agent: Agent, message: string) {
  const finished = new AbortController();

  const continueDialog = agent.input.forConfirm({
    header: "Approve in App",
    question: `${message}\n\nOnce approved, this page should automatically refresh.  If it does not, click Override & Continue`,
    confirmBtn: "Override & Continue"
  });

  const waitTimeout = 300_000;
  // Open a promise on waiting for navigation to complete, give it 5 minutes
  const navigationPromise = agent.page.page.waitForNavigation({ waitUntil: "networkidle2", timeout: waitTimeout, signal: finished.signal });
  // Also open a promise checking the page intent.  If it changes from 2FA then we are done
  const pageIntentPromise = new Promise<void>((resolve, reject) => {
    let updateInterval = setInterval(async () => {
      try {
        if (finished.signal.aborted || await agent.page.getPageIntent() === "AccountsSummary") {
          clearInterval(updateInterval);
          resolve();
        }
      }
      catch(e) {
        clearInterval(updateInterval);
        reject(e);
      }
    }, 5000);
  });
  const error = "error" as const;
  const winner = await Promise.race([
    navigationPromise.then(() => "navigate" as const).catch(e => { log.error(e, "Failed to wait for navigation"); return error }),
    pageIntentPromise.then(() => "intent" as const).catch(e => { log.error(e, "Failed to wait for page intent change"); return error }),
    continueDialog
      .then(v => v ? "continue" as const : "cancelled" as const)
      .catch(e => {
        if (e instanceof QuestionCancelError) {
          return "cancelled" as const;
        }
        log.error(e, "Unknown Error in continueDialog");
        return error;
      })
  ]);

  // Cancel non-finishers.
  finished.abort();

  switch (winner) {
    case "cancelled":
      throw new Error("2FA approval cancelled");
    case "navigate":
    case "intent":
      // Close the dialog.  This triggers a throw, but the race has already finished.
      // The continueDialog catches and returns 'error', but the value is never read
      continueDialog.cancel();
      return "continue";
    case "continue":
      return "continue";
    case "error":
      return "error";
  }
}

async function clickRemember(agent: Agent) {
  try {
    const api = await apis().getTwofaApi();
    const clickedSkip = await agent.page.tryClick(api, "getRememberInput", {
      noNavigate: true,
      hints: { eventName: "remember", tagName: "input", inputType: "checkbox" },
      minPixelsChanged: 10, // This is a very low value because checkboxes are small
    });
    if (!clickedSkip) {
      // It's possible that there is no remember checkbox
      log.warn("Failed to click remember");
    }
  }
  catch (e) {
    // Some pages may not have a remember checkbox,
    // but we don't care, we just want to continue
    log.warn(e, "Exception thrown when clicking remember");
  }
}

async function clickSubmit(agent: Agent) {
  const api = await apis().getTwofaApi();
  const clickedSubmit = await agent.page.tryClick(api, "getSubmitInput", { hints: { eventName: "submit", tagName: "button", inputType: "submit" } });
  if (!clickedSubmit) {
    await agent.maybeThrow(new Error("Failed to click submit"));
  }
}

type NamedResponses = { name: string; options: ElementResponse[]; };
async function askUserForDestination(agent: Agent, message: string, destinations: NamedResponses[]) {
  const queryOptions = destinations.map(d => ({
    name: d.name,
    options: d.options.map(o => o.content)
  }));
  const {name, option} = await agent.input.selectOption2D({
    header: "Select 2FA destination",
    question: message,
    options2d: queryOptions
  });
  return destinations
    .find(d => d.name === name)!
    .options.find(o => o.content === option)!;
}




