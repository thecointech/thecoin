import { GetETransferApi, GetIntentApi } from "@thecointech/apis/vqa";
import { log } from "@thecointech/logging";
import { clickElement } from "../vqaResponse";
import { getAllElements } from "@thecointech/scraper/elements";
import { sleep } from "@thecointech/async";
import { Coords, SearchElement } from "@thecointech/scraper/types";
import { enterValueIntoFound } from "@thecointech/scraper/replay";
import { BBox } from "@thecointech/vqa";
// Use regular levenshtein, not the modified version
// in this case insertions are bad
import levenshtein from 'fastest-levenshtein';
import { getCoordsWithMargin, mapInputToParent } from "../elementUtils";
import { PageHandler } from "../pageHandler";
import { IAskUser } from "../types";


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

export async function SendETransfer(page: PageHandler, input: IAskUser, accountNumber: string, attemptedLinks: Set<string>) {
  log.trace("SendETransferWriter: begin processing");
  await navigateToSendETransferPage(page, attemptedLinks);
  await sendETransfer(page, input, accountNumber);
}

async function navigateToSendETransferPage(page: PageHandler, attemptedLinks: Set<string>) {
  const allLinks = await getAllElements(page.page, Number.MAX_SAFE_INTEGER, 'a');

  // Find the most likely link for "Send ETransfer"
  const linkTexts = allLinks
    .filter(l => !attemptedLinks.has(l.data.text))
    .map(l => l.data.text);

  const api = GetETransferApi();
  const { data } = await api.bestEtransferLink(linkTexts);

  // These should all point to the same page...
  log.trace(`Best link: ${data.best_link}, attempting to navigate`);
  const matchingLinks = allLinks
    .filter(l => l.data.text == data.best_link)
    // Take the top-most one, in case there are multiple
    .sort((a, b) => a.data.coords.top - b.data.coords.top);

  if (matchingLinks.length == 0) {
    log.error(`Could not find link for Send ETransfer: ${data.best_link} not in ${JSON.stringify(linkTexts)}`);
    throw new CannotFindLinkError();
  }
  const bestLink = matchingLinks[0];
  attemptedLinks.add(bestLink.data.text);

  // Reset all flags
  // this.hasSetAmount = this.hasSetFromAccount = this.hasSetToRecipient = false;
  // Go to the page
  const navigated = await clickElement(page.page, bestLink);
  if (!navigated) {
    log.error(`Clicking link for Send ETransfer: ${data.best_link} had no effect?`);
    throw new NotAnETransferPageError("Failed to click link");
  }

  // await this.updatePageName("form-0");

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
  let step = 1;

  const tracker: InputTracker = { step };
  while (true) {
    const hasFilledAnyInput = await fillETransferDetails(page, input, tracker, accountNumber);
    const anyInputFilled = tracker.amount || tracker.fromAccount || tracker.toRecipient;
    if (!anyInputFilled && !hasFilledAnyInput) {
      throw new NotAnETransferPageError("Failed to fill any inputs");
    }

    // Navigate to the next page
    const navigated = await gotoNextPage(page, step);
    if (!navigated) {
      // await this.updatePageName(`form-error`);
      throw new NotAnETransferPageError("Failed to go to next page");
    }

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

    // So far, so successful, let's keep going...
    // await this.updatePageName(`form-${++step}`);

    // We should/may have navigated, get details about the new page.
    const image = await page.getImage(true);
    const title = await page.page.title();
    const { data: currentStage } = await GetETransferApi().detectEtransferStage(title, image);
    log.trace(`Sending step: ${step}, Current stage: ${currentStage.stage}`);

    // const stepTrace = {
    //   title,
    //   stage: currentStage.stage
    // }
    let confirmationElement;

    switch (currentStage.stage) {
      case "ReviewDetails":
        // Check we've entered what we need to?
        if (!tracker.amount || !tracker.toRecipient) {
          log.error("Detected stage 'ReviewDetails', but not all required fields are filled");
          // However, it could be a mis-detection, so we will continue
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
        const found = page.pushValueEvent(confirmationCode, "confirmationCode", "text");
        if (!found) {
          log.error("Could not find confirmation code in page");
        }
        confirmationElement = found;
        break;
    }

    // this.writeJson(stepTrace, `step-${step}`);

    // If we are complete and have a confirmation code, we are done
    if (confirmationElement) {
      return true;
    }
  }
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

  let hasFilledInput = false;
  try {
    for (const [element, elementType] of zip(elements, inputTypes)) {
      switch (elementType) {
        case "AmountToSend":
          if (!tracker.amount) {
            await fillAmountToSend(page, element, 5.23);
            tracker.amount = true;
            hasFilledInput = true;
          }
          break;
        case "FromAccount":
          if (!tracker.fromAccount) {
            await selectFromAccount(page, element, accountNumber);
            tracker.fromAccount = true;
            hasFilledInput = true;
          }
          break;
        case "ToRecipient":
          if (!tracker.toRecipient && element.data.inputType != "radio") {
            const recipient = await input.forETransferRecipient();
            await selectToRecipient(page, element, recipient);
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
  await enterValueIntoFound(page.page, input, amount.toString());
  await sleep(500);
  // How can we verify this worked?
}

async function selectFromAccount(page: PageHandler, input: SearchElement, account: string) {
  log.trace("Filling input: FromAccount");
  // First, check if the default is already entered
  if (input.data.tagName == "SELECT") {
    const selectedText = await input.element.evaluate(el => (el as HTMLSelectElement).selectedOptions[0].innerText);
    if (selectedText.includes(account)) return true;

    // Else, find the most likely option
    const options = await input.element.evaluate(el => Array.from((el as HTMLSelectElement).options).map(o => o.innerText));
    const scored = options.map(o => levenshtein.distance(o, account));
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

async function selectToRecipient(page: PageHandler, input: SearchElement, recipient: string) {
  log.trace("Filling input: ToRecipient");
  await enterValueIntoFound(page.page, input, recipient);
  if (input.data.tagName.toUpperCase() == "INPUT" || input.data.role?.toLowerCase() == "combobox") {
    // If this is a dropdown, we have to click the option
    const image = await page.getImage();
    const { data: r } = await GetETransferApi().detectToRecipient(recipient, image);
    const clicked = await page.completeInteraction(
      r,
      (found) => clickElement(page.page, found),
      { name: "select-recipient" }
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
