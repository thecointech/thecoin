import { log } from "@thecointech/logging";
import { clickElement } from "../interactions";
import { getAllElements } from "@thecointech/scraper/elements";
import { sleep } from "@thecointech/async";
import { Coords, SearchElement } from "@thecointech/scraper/types";
import { enterValueIntoFound } from "@thecointech/scraper/replay";
import { BBox } from "@thecointech/vqa";
// Use regular levenshtein, not the modified version
// in this case insertions are bad
import { distance } from 'fastest-levenshtein';
import { getCoordsWithMargin, mapInputToParent } from "../elementUtils";
import { ETransferInput, ETransferResult } from "../types";
import { processorFn } from "./types";
import { waitPageStable } from "@thecointech/scraper/utilities";
import { Agent } from "../agent";
import { apis } from "../apis";

import { EventBus } from "@thecointech/scraper/events/eventbus";

class CannotFindLinkError extends Error {
  constructor() {
    super("Could not find link");
  }
}

export class NotAnETransferPageError extends Error {
  constructor(s: string) {
    super(`Invalid ETransfer: ${s}`);
  }
}

export const SendETransfer = processorFn("SendETransfer", async (agent: Agent, accountNumber: string) => {
  let attemptedLinks = new Set<string>();
  for (let i = 0; i < 5; i++) {
    const priorLinks = new Set(attemptedLinks);
    await using section = await agent.pushIsolatedSection("SendETransfer");

    try {
      await navigateToSendETransferPage(agent, attemptedLinks);
      agent.onProgress(10);
      await sendETransfer(agent, accountNumber);
      return true;
    }
    catch (e) {
      log.error(e, `Error on ETransfer attempt: ${i}`);
      section.cancel();

      // Is this something that the page handler can handle?
      try {
        await agent.maybeThrow(e);
        // If it didn't throw, we try that one again...
        attemptedLinks = priorLinks;
        continue;
      }
      catch (e) {
        // We don't care about any errors stemming from the auto-handling
        log.warn(e, "Error handling page");
      }

      if (e instanceof NotAnETransferPageError) {
        // This could mean the original link was bad
        // Otherwise, we go back to the start and try again
        continue;
      }
      // Dunno, but probably best to give up
      throw e;
    }
  }
  return false;
});

const stripUnicode = (str: string): string => str.replace(/[^\x00-\x7F]/g, '');

async function navigateToSendETransferPage(agent: Agent, attemptedLinks: Set<string>) {
  log.trace("Attempting navigate to Send ETransfer page");
  const allLinks = await getAllElements(agent.page.page, Number.MAX_SAFE_INTEGER, 'a');

  // Find the most likely link for "Send ETransfer"
  const linkTexts = allLinks
    .map(l => l.data.text)
    .map(stripUnicode)
    .filter(l => !attemptedLinks.has(l));

  const api = await apis().getETransferApi();
  const { data } = await api.bestEtransferLink(linkTexts);


  // These should all point to the same page...
  log.trace(`Best link: ${data.best_link}, attempting to navigate`);
  const matchingLinks = allLinks
    .filter(l => stripUnicode(l.data.text) == data.best_link)
    // Take the top-most one, in case there are multiple
    .sort((a, b) => a.data.coords.top - b.data.coords.top);

  if (matchingLinks.length == 0) {
    log.error(`Could not find link for Send ETransfer: ${data.best_link} not in ${JSON.stringify(linkTexts)}`);
    throw new CannotFindLinkError();
  }
  const bestLink = matchingLinks[0];
  attemptedLinks.add(bestLink.data.text);

  // Go to the page
  const navigated = await clickElement(agent.page.page, bestLink);
  if (!navigated) {
    log.error(`Clicking link for Send ETransfer: ${data.best_link} had no effect?`);
    throw new NotAnETransferPageError("Failed to click link");
  }

  // verify the page is the right one
  const screenshot = await agent.page.getImage(true);
  const title = await agent.page.page.title();
  const {data: hasForm} = await api.detectEtransferForm(title, screenshot);
  log.trace(`Transfer form detected: ${hasForm.form_present}`);
  if (!hasForm.form_present) {
    // no point proceeding then, is there?
    throw new NotAnETransferPageError("Not on the Send ETransfer page");
  }
}

type InputTracker = {
  amount?: boolean,
  toRecipient?: boolean,
  fromAccount?: boolean,

  step: number
}

export async function sendETransfer(agent: Agent, accountNumber: string) {

  log.trace("SendETransferWriter: sendETransfer");
  const api = await apis().getETransferApi();
  // We don't know how many pages of steps there are, so we iterate until there is no more 'next' button
  // let step = 1;
  let hasReviewed = false;
  const tracker: InputTracker = { step: 1 };
  while (true) {
    const hasFilledAnyInput = await fillETransferDetails(agent, tracker, accountNumber);
    const anyInputFilled = tracker.amount || tracker.fromAccount || tracker.toRecipient;
    if (!anyInputFilled && !hasFilledAnyInput) {
      throw new NotAnETransferPageError("Failed to fill any inputs");
    }

    // Navigate to the next page
    const navigated = await gotoNextPage(agent, tracker.step);
    if (!navigated) {
      // await this.updatePageName(`form-error`);
      throw new NotAnETransferPageError("Failed to go to next page");
    }

    // We don't know how long to go, so just increment something.  We can assume it'll be less than 10
    agent.onProgress(10 + (++tracker.step) * 10);

    // Check to see if there are any errors on the page
    const screenshot = await agent.page.getImage(true);
    const intentApi = await apis().getIntentApi();
    const { data: hasError } = await intentApi.pageError(screenshot);
    if (hasError.error_message_detected) {
      log.error("Recieved potential error message:", hasError.error_message);
      // update name will trigger storing appropriate data
      // await this.updatePageName(`form-error`);
      // Do not throw an error, this could be a false positive
      //throw new NotAnETransferPageError(hasError.error_message);
    }

    // We should/may have navigated, get details about the new page.
    const currentStage = await getCurrentStage(agent, hasReviewed);
    log.trace(`Sending step: ${tracker.step}, Current stage: ${currentStage}`);
    let confirmationElement;

    switch (currentStage) {
      case "ConfirmDetails":
      case "ReviewDetails":
        // Check we've entered what we need to?
        if (!tracker.amount || !tracker.toRecipient) {
          log.error("Detected stage 'ReviewDetails', but not all required fields are filled");
          // However, it could be a mis-detection, so we will continue
        }
        // This is to check that we do not go into an infinite loop
        hasReviewed = true;
        // MOSTLY FOR TESTING
        if (agent.input.doNotCompleteETransfer()) {
          return true;
        }
        break;

      case "TransferComplete":
        if (!tracker.amount || !tracker.toRecipient) {
          log.error("Detected stage 'TransferComplete', but not all required fields are filled");
        }
        const image = await agent.page.getImage(true);
        const { data: confirmationCode } = await api.detectConfirmationCode(image);
        log.trace(`Confirmation code: ${confirmationCode.content}`);
        // Lets try and find this in the webpage
        const found = await agent.page.toElement(confirmationCode, { eventName: "confirmation", tagName: "input", inputType: "text" });
        await agent.events.pushValueEvent<ETransferResult>(found, "confirmationCode", "text");
        if (!found) {
          log.error("Could not find confirmation code in page");
        }
        confirmationElement = found;
        agent.onProgress(100);
        break;
    }

    // If we are complete and have a confirmation code, we are done
    if (confirmationElement) {
      return true;
    }
  }
}

async function getCurrentStage(agent: Agent, hasReviewed: boolean) {
  const image = await agent.page.getImage(true);
  const title = await agent.page.page.title();
  // The difference between "review" & "complete" can be very small, they have
  // mostly the same details and the LLM might not be able to tell the difference
  // To deal with this, we add an extra check once we've passed review.  This should
  // almost never be false, but we can't assume that.
  const api = await apis().getETransferApi();
  if (hasReviewed) {
    const { data: isComplete } = await api.detectEtransferComplete(title, image);
    if (isComplete.transfer_complete) {
      return "TransferComplete";
    }
  }
  const { data: currentStage } = await api.detectEtransferStage(title, image);
  return currentStage.stage;
}

async function fillETransferDetails(agent: Agent, tracker: InputTracker, accountNumber: string) {
  log.trace("Processing Step " + tracker.step);
  // An input can change while being filled
  let subStep = 0;
  let hasFilledAnyInput = false;
  while (true) {
    // If everything is filled, don't add any more
    if (tracker.amount && tracker.toRecipient && tracker.fromAccount) {
      break;
    }
    // await this.updatePageName(`form-${step}-${subStep}`);
    const filledInput = await fillInputs(agent, tracker, accountNumber);
    // If nothing was filled, we are done
    hasFilledAnyInput = filledInput || hasFilledAnyInput;
    if (!filledInput) break;
    subStep++;
  }

  // If nothing was filled, something went wrong
  // Perhaps we are on the wrong page?
  if (!hasFilledAnyInput) {
    log.warn("No input was filled");
  }
  return hasFilledAnyInput;
}

async function gotoNextPage(agent: Agent, step: number) {
  const api = await apis().getETransferApi();
  const { data: nextButton } = await api.detectNextButton(await agent.page.getImage(true));
  if (!nextButton) {
    return false;
  }
  return await agent.page.completeInteraction(nextButton, (found) => clickElement(agent.page.page, found), { hints: { eventName: `step-${step}` } });
}

async function fillInputs(agent: Agent, tracker: InputTracker, accountNumber: string) {
  // There is a list of inputs on this page, we decipher each kind and how to deal with it appropriately
  const elements = await getAllElements(agent.page.page, Number.MAX_SAFE_INTEGER, 'input, select, [role="combobox"], [aria-haspopup="listbox"]');
  // Early exit if no inputs
  if (elements.length == 0) {
    log.warn("No inputs found");
    return false;
  }
  const image = await agent.page.getImage(true);
  const parents = await Promise.all(elements.map(i => agent.page.page.evaluateHandle(mapInputToParent, i.element)));
  const parentCoords = await Promise.all(parents.map(p => agent.page.page.evaluate(getCoordsWithMargin, p)));

  const inputTypes = await callInputTypes(image, elements, parentCoords);
  log.trace("SendETransferWriter: inputTypes: " + JSON.stringify(inputTypes));
  // page.logJson("SendETransfer", "input-types-vqa", inputTypes);
  const shortWaitPageStable = async () => {
    try {
      // A short wait but with a very low threshold should
      // catch most in-page updates but not penalize us for other things
      await waitPageStable(agent.page.page, 5_000, 25);
    } catch (e) {
      // We don't care about any errors here
      log.warn(e, "Error waiting for page to be stable");
    }
  }

  let hasFilledInput = false;
  try {
    for (const [element, elementType] of zip(elements, inputTypes)) {
      switch (elementType) {
        case "AmountToSend":
          if (!tracker.amount) {
            await fillAmountToSend(agent, element, 5.23);
            await shortWaitPageStable();
            tracker.amount = true;
            hasFilledInput = true;
          }
          break;
        case "FromAccount":
          if (!tracker.fromAccount) {
            await selectFromAccount(agent, element, accountNumber);
            await shortWaitPageStable();
            tracker.fromAccount = true;
            hasFilledInput = true;
          }
          break;
        case "ToRecipient":
          if (!tracker.toRecipient && element.data.inputType != "radio") {
            await selectToRecipient(agent, element);
            await shortWaitPageStable();
            tracker.toRecipient = true;
            hasFilledInput = true;
          }
          break;
        default:
          // No action required on the rest of the input types
          log.trace(`Detected input type: ${elementType}`);
          break;
      }
    }
  }
  catch (e) {
    // An exception could occur if the page has changed in some way
    // (eg, if the page reloads after entering a value)
    // This is not a failure, and we can just ignore it
    log.error(`Exception while filling inputs: ${e}`);
  }

  return hasFilledInput;
}

async function logEvent(agent: Agent, input: SearchElement, eventName: string) {
  // This input was not "searched" for, we got it directly from the page
  // This means it won't get automatically picked up by the EventBus
  // The easiest way to get around this is to manually put it on the bus
  EventBus.get().emitElement({
    ...input,
    score: 100,
    components: {},
  }, {
    event: {
      eventName,
    },
    page: agent.page.page,
  })
}

async function fillAmountToSend(agent: Agent, input: SearchElement, amount: number) {
  log.trace("Filling input: AmountToSend");
  logEvent(agent, input, "AmountToSend");
  {
    using _ = agent.events.pause();
    await agent.page.dynamicInputEntry(input, amount.toString());
  }
  agent.events.pushDynamicInputEvent<ETransferInput>(input.data, "amount");
  await sleep(500);
  // How can we verify this worked?
}

async function selectFromAccount(agent: Agent, input: SearchElement, account: string) {
  log.trace("Filling input: FromAccount");
  logEvent(agent, input, "FromAccount");

  // First, check if the default is already entered
  if (input.data.tagName == "SELECT") {
    const selectedText = await input.element.evaluate(el => (el as HTMLSelectElement).selectedOptions[0].innerText);
    if (selectedText.includes(account)) return true;

    // Else, find the most likely option
    const options = input.data.options;
    if (!options) {
      throw new Error("Expected options to be defined");
    }
    const api = await apis().getVqaBaseApi();
    const { data: bestAccordingToLLM} = await api.detectMostSimilarOption(account, options);

    // Now we can safely use Levenstein just in case the LLM changed some letters/punctuation
    const scored = options.map(o => distance(bestAccordingToLLM.most_similar, o));
    const bestMatch = options[scored.indexOf(Math.min(...scored))];
    if (bestMatch) {
      await enterValueIntoFound(agent.page.page, input, bestMatch);
      return true;
    }
  }
  else {
    // For text inputs, we can just check if the value is the same
    if (input.data.text.includes(account)) return true;
  }

  // Otherwise, enter the account number
  await enterValueIntoFound(agent.page.page, input, account);
  return true;
}

async function selectToRecipient(agent: Agent, element: SearchElement) {
  log.trace("Filling input: ToRecipient");
  logEvent(agent, element, "ToRecipient");

  let recipient = await agent.input.expectedETransferRecipient();

  // If this is a select, double-check one of the options matches.
  if (element.data.options?.length) {
    const found = element.data.options.find(o => o == recipient);
    if (!found) {
      recipient = await agent.input.forValue("Select your coin account", element.data.options);
    }
  }

  await enterValueIntoFound(agent.page.page, element, recipient);
  // If it's not a select, then we can assume that expected
  // will find the correct value and return it
  if (element.data.tagName.toUpperCase() == "INPUT" || element.data.role?.toLowerCase() == "combobox") {
    // If this is a dropdown, we have to click the option
    const image = await agent.page.getImage();
    const api = await apis().getETransferApi();
    const { data: r } = await api.detectToRecipient(recipient, image);
    const clicked = await agent.page.completeInteraction(
      r,
      (found) => clickElement(agent.page.page, found),
      { hints: { eventName: "select-recipient", role: "option" } }
    );

    if (!clicked) {
      // We could ask VQA if the recipient has been set(?)
      throw new NotAnETransferPageError("Failed to click recipient");
    }
  }
}


async function callInputTypes(image: File, inputs: SearchElement[], parentCoords: Coords[]) {
  const asBoxes = parentCoords.map<BBox>(c => ({
    left: c.left,
    top: c.top,
    right: c.left + c.width,
    bottom: c.top + c.height
  }));
  const asInputs = inputs.map(i => ({
    tagName: i.data.tagName,
    inputType: i.data.inputType,
    coords: i.data.coords,
    name: i.data.name,
    label: i.data.label,
    options: i.data.options
  }));

  const inputElements = JSON.stringify({
    elements: asInputs,
    parent_coords: asBoxes
  });

  const api = await apis().getETransferApi();
  const { data : inputTypes } = await api.inputTypes(image, inputElements);
  return inputTypes;
}

function zip<T, U>(a: T[], b: U[]) {
  if (a.length != b.length) throw new Error("Arrays must be the same length");
  return a.map((val, i) => [val, b[i]] as const);
}
