import { log } from "@thecointech/logging";
import { clickElement } from "../interactions";
import type { ElementResponse } from "../types";
import { processorFn } from "./types";
import { PhoneNumberElements } from "@thecointech/vqa";
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
      return await selectDestinationAndEnterCode(agent);
    case "InputCode":
      return await enterCode(agent);
    case "ApproveInApp":
      return await approveInApp(agent);
    case "Error":
      await agent.maybeThrow(new Error("2FA Error happened and we can't recover"));
      break;
    default:
      throw new Error("Failed to detect action");
  }
}

export async function selectDestinationAndEnterCode(agent: Agent) {
  await selectDestination(agent);
  await enterCode(agent);
}

export async function selectDestination(agent: Agent) {
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
  const dest = await askUserForDestination(agent, allOptions);
  const clickedOption = await agent.page.completeInteraction(dest,
    (found) => clickElement(agent.page.page, found),
    { hints: { eventName: "destination", tagName: "button" } }
  );
  if (!clickedOption) {
    await agent.maybeThrow(new Error("Failed to click destination"));
  }
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

async function enterCode(agent: Agent) {

  let code = await agent.input.forValue("Enter the 2FA code: ");

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
      code = await agent.input.forValue(error.error_message);
    }
  }
  await agent.maybeThrow(new Error("Failed to enter 2FA code"));
}

async function approveInApp(agent: Agent) {
  log.info("Waiting for 2FA approval");
  // TODO: Query the page for the actual 2FA message
  try {
    const waitTimeout = 300_000;
    const maxTime = Date.now() + waitTimeout;
    // Open a promise on waiting for navigation to complete, give it 5 minutes
    const navigationPromise = agent.page.page.waitForNavigation({ waitUntil: "networkidle2", timeout: waitTimeout });
    // Also open a promise checking the page intent.  If it changes from 2FA then we are done
    const pageIntentPromise = new Promise<void>(resolve => {
      let updateInterval = setInterval(async () => {
        try {
          if (Date.now() > maxTime || await agent.page.getPageIntent() != "Login") {
            clearInterval(updateInterval);
            resolve();
          }
        }
        catch(e) {
          clearInterval(updateInterval);
          throw e;
        }
      }, 5000);
    });
    await Promise.race([navigationPromise, pageIntentPromise]);
  }
  catch (e) {
    log.error(e, "Failed to wait for 2FA approval");
    throw e;
  }
  log.info("2FA approved");
  return agent.input.forValue("Press enter once the code has been approved: ");
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
async function askUserForDestination(agent: Agent, destinations: NamedResponses[]) {
  const queryOptions = destinations.map(d => ({
    name: d.name,
    options: d.options.map(o => o.content)
  }));
  const {name, option} = await agent.input.selectOption("Select where to send the code: ", queryOptions);
  return destinations
    .find(d => d.name === name)!
    .options.find(o => o.content === option)!;
}




