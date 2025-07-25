import { GetBaseApi, GetETransferApi, GetIntentApi } from "@thecointech/apis/vqa";
import { log } from "@thecointech/logging";
import { clickElement } from "../vqaResponse";
import { getAllElements } from "@thecointech/scraper/elements";
import { sleep } from "@thecointech/async";
import { Coords, SearchElement } from "@thecointech/scraper/types";
import { enterValueIntoFound } from "@thecointech/scraper/replay";
import { BBox } from "@thecointech/vqa";
// Use regular levenshtein, not the modified version
// in this case insertions are bad
import { distance } from 'fastest-levenshtein';
import { getCoordsWithMargin, mapInputToParent } from "../elementUtils";
import { PageHandler } from "../pageHandler";
import { ETransferInput, ETransferResult, IAskUser } from "../types";
import { processorFn } from "./types";
import { waitPageStable } from "../vqaResponse";

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

export const SendETransfer = processorFn("SendETransfer", async (page: PageHandler, input: IAskUser, accountNumber: string) => {
  let attemptedLinks = new Set<string>();
  for (let i = 0; i < 5; i++) {
    const priorLinks = new Set(attemptedLinks);
    await using section = await page.pushIsolatedSection("SendETransfer");

    try {
      await navigateToSendETransferPage(page, attemptedLinks);
      page.onProgress(10);
      await sendETransfer(page, input, accountNumber);
      return true;
    }
    catch (e) {
      section.cancel();
      log.error(e);

      // Is this something that the page handler can handle?
      try {
        await page.maybeThrow(e);
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

async function navigateToSendETransferPage(page: PageHandler, attemptedLinks: Set<string>) {
  const allLinks = await getAllElements(page.page, Number.MAX_SAFE_INTEGER, 'a');

  // Find the most likely link for "Send ETransfer"
  const linkTexts = allLinks
    .map(l => l.data.text)
    .map(stripUnicode)
    .filter(l => !attemptedLinks.has(l));

  const api = GetETransferApi();
  const { data } = await api.bestEtransferLink(linkTexts);

  page.logJson("SendETransfer", "best-link", {
    links: linkTexts,
    vqa: data
  });

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
  const navigated = await clickElement(page.page, bestLink);
  if (!navigated) {
    log.error(`Clicking link for Send ETransfer: ${data.best_link} had no effect?`);
    throw new NotAnETransferPageError("Failed to click link");
  }

  // verify the page is the right one
  const screenshot = await page.getImage(true);
  const title = await page.page.title();
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

async function sendETransfer(page: PageHandler, input: IAskUser, accountNumber: string) {

  log.trace("SendETransferWriter: sendETransfer");
  const api = GetETransferApi();
  // We don't know how many pages of steps there are, so we iterate until there is no more 'next' button
  // let step = 1;
  let hasReviewed = false;
  const tracker: InputTracker = { step: 1 };
  while (true) {
    const hasFilledAnyInput = await fillETransferDetails(page, input, tracker, accountNumber);
    const anyInputFilled = tracker.amount || tracker.fromAccount || tracker.toRecipient;
    if (!anyInputFilled && !hasFilledAnyInput) {
      throw new NotAnETransferPageError("Failed to fill any inputs");
    }

    // Navigate to the next page
    const navigated = await gotoNextPage(page, tracker.step);
    if (!navigated) {
      // await this.updatePageName(`form-error`);
      throw new NotAnETransferPageError("Failed to go to next page");
    }

    // We don't know how long to go, so just increment something.  We can assume it'll be less than 10
    page.onProgress(10 + (++tracker.step) * 10);

    // Check to see if there are any errors on the page
    const screenshot = await page.getImage(true);
    const { data: hasError } = await GetIntentApi().pageError(screenshot);
    if (hasError.error_message_detected) {
      log.error("Recieved potential error message:", hasError.error_message);
      // update name will trigger storing appropriate data
      // await this.updatePageName(`form-error`);
      // Do not throw an error, this could be a false positive
      //throw new NotAnETransferPageError(hasError.error_message);
    }

    // We should/may have navigated, get details about the new page.
    const currentStage = await getCurrentStage(page, hasReviewed);
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
        if (input.doNotCompleteETransfer()) {
          return true;
        }
        break;

      case "TransferComplete":
        if (!tracker.amount || !tracker.toRecipient) {
          log.error("Detected stage 'TransferComplete', but not all required fields are filled");
        }
        const image = await page.getImage(true);
        const { data: confirmationCode } = await api.detectConfirmationCode(image);
        log.trace(`Confirmation code: ${confirmationCode.content}`);
        // Lets try and find this in the webpage
        const found = await page.pushValueEvent<ETransferResult>(confirmationCode, "confirmationCode", "text");
        if (!found) {
          log.error("Could not find confirmation code in page");
        }
        confirmationElement = found;
        page.onProgress(100);
        break;
    }

    // If we are complete and have a confirmation code, we are done
    if (confirmationElement) {
      return true;
    }
  }
}

async function getCurrentStage(page: PageHandler, hasReviewed: boolean) {
  const image = await page.getImage(true);
  const title = await page.page.title();
  // The difference between "review" & "complete" can be very small, they have
  // mostly the same details and the LLM might not be able to tell the difference
  // To deal with this, we add an extra check once we've passed review.  This should
  // almost never be false, but we can't assume that.
  if (hasReviewed) {
    const { data: isComplete } = await GetETransferApi().detectEtransferComplete(title, image);
    if (isComplete.transfer_complete) {
      return "TransferComplete";
    }
  }
  const { data: currentStage } = await GetETransferApi().detectEtransferStage(title, image);
  return currentStage.stage;
}

async function fillETransferDetails(page: PageHandler, input: IAskUser, tracker: InputTracker, accountNumber: string) {
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
    const filledInput = await fillInputs(page, input, tracker, accountNumber);
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

async function gotoNextPage(page: PageHandler, step: number) {
  const api = GetETransferApi();
  const { data: nextButton } = await api.detectNextButton(await page.getImage(true));
  if (!nextButton) {
    return false;
  }
  return await page.completeInteraction(nextButton, (found) => clickElement(page.page, found), { name: `step-${step}` });
}

async function fillInputs(page: PageHandler, input: IAskUser, tracker: InputTracker, accountNumber: string) {
  // There is a list of inputs on this page, we decipher each kind and how to deal with it appropriately
  const elements = await getAllElements(page.page, Number.MAX_SAFE_INTEGER, 'input, select, [role="combobox"], [aria-haspopup="listbox"]');
  // Early exit if no inputs
  if (elements.length == 0) {
    log.warn("No inputs found");
    return false;
  }
  const image = await page.getImage(true);
  const parents = await Promise.all(elements.map(i => page.page.evaluateHandle(mapInputToParent, i.element)));
  const parentCoords = await Promise.all(parents.map(p => page.page.evaluate(getCoordsWithMargin, p)));

  const inputTypes = await callInputTypes(image, elements, parentCoords);
  log.trace("SendETransferWriter: inputTypes: " + JSON.stringify(inputTypes));
  page.logJson("SendETransfer", "input-types-vqa", inputTypes);
  const shortWaitPageStable = async () => {
    try {
      // A short wait but with a very low threshold should
      // catch most in-page updates but not penalize us for other things
      await waitPageStable(page.page, 5_000, 25);
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
            await fillAmountToSend(page, element, 5.23);
            await shortWaitPageStable();
            tracker.amount = true;
            hasFilledInput = true;
          }
          break;
        case "FromAccount":
          if (!tracker.fromAccount) {
            await selectFromAccount(page, element, accountNumber);
            await shortWaitPageStable();
            tracker.fromAccount = true;
            hasFilledInput = true;
          }
          break;
        case "ToRecipient":
          if (!tracker.toRecipient && element.data.inputType != "radio") {
            await selectToRecipient(page, element, input);
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

async function fillAmountToSend(page: PageHandler, input: SearchElement, amount: number) {
  // Do we need to do anything more than this?
  log.trace("Filling input: AmountToSend");
  await page.pushDynamicInputEvent<ETransferInput>(input, amount.toString(), "amount");
  await sleep(500);
  // How can we verify this worked?
}

async function selectFromAccount(page: PageHandler, input: SearchElement, account: string) {
  log.trace("Filling input: FromAccount");

  page.logJson("SendETransfer", "from-account-elm", input.data);

  // First, check if the default is already entered
  if (input.data.tagName == "SELECT") {
    const selectedText = await input.element.evaluate(el => (el as HTMLSelectElement).selectedOptions[0].innerText);
    if (selectedText.includes(account)) return true;

    // Else, find the most likely option
    const options = input.data.options;
    if (!options) {
      throw new Error("Expected options to be defined");
    }
    const { data: bestAccordingToLLM} = await GetBaseApi().detectMostSimilarOption(account, options);

    // Now we can safely use Levenstein just in case the LLM changed some letters/punctuation
    const scored = options.map(o => distance(bestAccordingToLLM.most_similar, o));
    const bestMatch = options[scored.indexOf(Math.min(...scored))];
    if (bestMatch) {
      await enterValueIntoFound(page.page, input, bestMatch);
      return true;
    }
  }
  else {
    // For text inputs, we can just check if the value is the same
    if (input.data.text.includes(account)) return true;
  }

  // Otherwise, enter the account number
  await enterValueIntoFound(page.page, input, account);
  return true;
}

async function selectToRecipient(page: PageHandler, element: SearchElement, input: IAskUser) {
  log.trace("Filling input: ToRecipient");
  page.logJson("SendETransfer", "to-recipient-elm", element.data);

  let recipient = await input.expectedETransferRecipient();

  // If this is a select, double-check one of the options matches.
  if (element.data.options?.length) {
    const found = element.data.options.find(o => o == recipient);
    if (!found) {
      recipient = await input.forValue("Select your coin account", element.data.options);
    }
  }

  await enterValueIntoFound(page.page, element, recipient);
  // If it's not a select, then we can assume that expected
  // will find the correct value and return it
  if (element.data.tagName.toUpperCase() == "INPUT" || element.data.role?.toLowerCase() == "combobox") {
    // If this is a dropdown, we have to click the option
    const image = await page.getImage();
    const { data: r } = await GetETransferApi().detectToRecipient(recipient, image);
    const clicked = await page.completeInteraction(
      r,
      (found) => clickElement(page.page, found),
      { name: "select-recipient", hints: { role: "option" } }
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

  const { data : inputTypes } = await GetETransferApi().inputTypes(image, inputElements);
  return inputTypes;
}

function zip<T, U>(a: T[], b: U[]) {
  if (a.length != b.length) throw new Error("Arrays must be the same length");
  return a.map((val, i) => [val, b[i]] as const);
}
