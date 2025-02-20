import { GetIntentApi, GetTwofaApi } from "@thecointech/apis/vqa";
import { log } from "@thecointech/logging";
import { clickElement } from "../vqaResponse";
import type { ElementResponse } from "../types";
import type { PageHandler } from "../pageHandler";
import type { IAskUser } from "./types";
import { processorFn } from "./types";

export const TwoFA = processorFn("TwoFA", async (page: PageHandler, input: IAskUser) => {
  // There should always be a username here
  await complete2FA(page, input);
})

async function complete2FA(page: PageHandler, input: IAskUser) {
  const api = GetTwofaApi();
  const { data: action } = await api.detectActionRequired(await page.getImage());
  page.onProgress(10);
  switch (action.action) {
    case "SelectDestination":
      return await selectDestination(page, input);
    case "InputCode":
      return await enterCode(page, input);
    case "ApproveInApp":
      return await approveInApp(page, input);
    case "Error":
      await page.maybeThrow(new Error("2FA Error happened and we can't recover"));
      break;
    default:
      throw new Error("Failed to detect action");
  }
}

async function selectDestination(page: PageHandler, input: IAskUser) {
  const api = GetTwofaApi();
  const { data: destinations } = await api.detectDestinations(await page.getImage());
  const allOptions = []
  if (destinations) {
    for (const d of destinations.phone_nos) {
      const { data: options } = await api.getDestinationElements(d, await page.getImage());
      allOptions.push({ name: d, options: options.elements });
    }
  }
  const dest = await askUserForDestination(input, allOptions);
  const clickedOption = await page.completeInteraction(dest, (found) => clickElement(page.page, found), {
    name: "destination",
    htmlType: "button",
  });
  if (!clickedOption) {
    await page.maybeThrow(new Error("Failed to click destination"));
  }
  await enterCode(page, input);
}

async function enterCode(page: PageHandler, input: IAskUser) {

  const api = GetTwofaApi();
  let code = await input.forValue("Enter the 2FA code: ");

  for (let i = 0; i < 5; i++) {

    const didEnter = await page.tryEnterText(api, "getAuthInput", {
      text: code,
      name: "input",
      htmlType: "input",
      inputType: "text",
    });
    if (!didEnter) {
      await page.maybeThrow(new Error("Failed to enter code"));
    }
    if (i == 0) {
      // We assume that the remember checkbox remembers
      // it's state on subsequent runs, so don't un-check it
      await clickRemember(page);
    }
    await clickSubmit(page);

    const pageIntent = await page.getPageIntent();
    if (pageIntent != "Login") {
      // Successfully logged in
      return;
    }
    // Is there an error message?
    const { data: error } = await GetIntentApi().pageError(await page.getImage());
    if (error.error_message_detected && error.error_message) {
      code = await input.forValue(error.error_message);
    }
  }
  await page.maybeThrow(new Error("Failed to enter 2FA code"));
}

async function approveInApp(page: PageHandler, input: IAskUser) {
  log.info("Waiting for 2FA approval");
  // TODO: Query the page for the actual 2FA message
  try {
    const waitTimeout = 300_000;
    const maxTime = Date.now() + waitTimeout;
    // Open a promise on waiting for navigation to complete, give it 5 minutes
    const navigationPromise = page.page.waitForNavigation({ waitUntil: "networkidle2", timeout: waitTimeout });
    // Also open a promise checking the page intent.  If it changes from 2FA then we are done
    const pageIntentPromise = new Promise<void>(resolve => {
      let updateInterval = setInterval(async () => {
        try {
          if (Date.now() > maxTime || await page.getPageIntent() != "Login") {
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
  return input.forValue("Press enter once the code has been approved: ");
}

async function clickRemember(page: PageHandler) {
  const api = GetTwofaApi();
  const clickedSkip = await page.tryClick(api, "getRememberInput", {
    name: "remember",
    noNavigate: true,
    htmlType: "input",
    inputType: "checkbox",
    minPixelsChanged: 10, // This is a very low value because checkboxes are small
  });
  if (!clickedSkip) {
    // It's possible that there is no remember checkbox
    log.warn("Failed to click remember");
  }
}

async function clickSubmit(page: PageHandler) {
  const api = GetTwofaApi();
  const clickedSubmit = await page.tryClick(api, "getSubmitInput", { name: "submit", htmlType: "button", inputType: "submit" });
  if (!clickedSubmit) {
    await page.maybeThrow(new Error("Failed to click submit"));
  }
}

type NamedResponses = { name: string; options: ElementResponse[]; };
async function askUserForDestination(input: IAskUser, destinations: NamedResponses[]) {
  const queryOptions = destinations.map(d => ({
    name: d.name,
    options: d.options.map(o => o.content)
  }));
  const {name, option} = await input.selectOption("Select where to send the code: ", queryOptions);
  return destinations
    .find(d => d.name === name)!
    .options.find(o => o.content === option)!;
}




