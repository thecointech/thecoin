import { GetETransferApi, GetIntentApi } from "@thecointech/apis/vqa";
import { _getPageIntent, IntentWriter } from "./testPageWriter";
import { log } from "@thecointech/logging";
import { ProcessConfig } from "./types";
import { clickElement, responseToElement, triggerNavigateAndWait } from "./vqaResponse";
import { getAllElements } from "../../src/elements";
import { getCoordsWithMargin, mapInputToParent } from "../recordSamples/highlighter";
import { sleep } from "@thecointech/async";
import { Coords, ElementData, SearchElement } from "../../src/types";
import { enterValueIntoFound } from "../../src/replay";
import { BBox } from "@thecointech/vqa";
// Use regular levenshtein, not the modified version
// in this case insertions are bad
import levenshtein from 'fastest-levenshtein';


class CannotFindLinkError extends Error {
  constructor() {
    super("Could not find link");
  }
}

class InvalidETransferError extends Error {
  constructor(s: string) {
    super(`Invalid ETransfer: ${s}`);
  }
}

export class SendETransferWriter extends IntentWriter {

  hasSetAmount = false;
  hasSetToRecipient = false;
  hasSetFromAccount = false;

  attemptedLinks = new Set<string>();

  static async process(config: ProcessConfig, accountNumber: string) {
    log.trace("SendETransferWriter: begin processing");

    // So, we assume we are on the main page
    const writer = new SendETransferWriter(config, "SendETransfer");
    await writer.initialize();
    const startingUrl = writer.page.url();
    // If we haven't made it in 5 attempts, this needs human input
    for (let i = 0; i < 5; i++) {
      try {
        await writer.navigateToSendETransferPage();
        await writer.sendETransfer(accountNumber);
        break;
      }
      catch (e) {
        log.error(e);
        // If we couldn't find the link, the whole thing is busted
        // if (e instanceof CannotFindLinkError) {
        //   throw e;
        // }
        if (e instanceof InvalidETransferError) {
          // This could mean the original link was bad
          // Otherwise, we go back to the start and try again
          await triggerNavigateAndWait(writer.page, () => writer.page.goto(startingUrl));
          continue;
        }
        // Dunno, but probably best to give up
        throw e;
      }
    }
  }

  async navigateToSendETransferPage() {
    const allLinks = await getAllElements(this.page, Number.MAX_SAFE_INTEGER, 'a');

    // Find the most likely link for "Send ETransfer"
    const linkTexts = allLinks
      .filter(l => !this.attemptedLinks.has(l.data.text))
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
    this.attemptedLinks.add(bestLink.data.text);

    // Reset all flags
    this.hasSetAmount = this.hasSetFromAccount = this.hasSetToRecipient = false;
    // Go to the page
    const navigated = await clickElement(this.page, bestLink);
    if (!navigated) {
      log.error(`Clicking link for Send ETransfer: ${data.best_link} had no effect?`);
      throw new InvalidETransferError("Failed to click link");
    }

    await this.updatePageName("form-0");

    // verify the page is the right one
    const screenshot = await this.getImage(true);
    const title = await this.page.title();
    const {data: hasForm} = await api.detectEtransferForm(title, screenshot);
    log.trace(`Transfer form detected: ${hasForm}`);
    if (!hasForm.form_present) {
      // no point proceeding then, is there?
      throw new InvalidETransferError("Not on the Send ETransfer page");
    }
  }

  async sendETransfer(accountNumber: string) {

    log.trace("SendETransferWriter: sendETransfer");
    const api = GetETransferApi();
    // We don't know how many pages of steps there are, so we iterate until there is no more 'next' button
    let step = 1;
    while (true) {
      const hasFilledAnyInput = await this.fillETransferDetails(accountNumber, step);
      const anyInputFilled = this.hasSetAmount || this.hasSetFromAccount || this.hasSetToRecipient;
      if (!anyInputFilled && !hasFilledAnyInput) {
        throw new InvalidETransferError("Failed to fill any inputs");
      }

      // Navigate to the next page
      const navigated = await this.gotoNextPage(step);
      if (!navigated) {
        await this.updatePageName(`form-error`);
        throw new InvalidETransferError("Failed to go to next page");
      }

      // Check to see if there are any errors on the page
      const screenshot = await this.getImage(true);
      const { data: hasError } = await GetIntentApi().pageError(screenshot);
      if (hasError.error_message_detected) {
        log.error("Recieved potential error message:", hasError.error_message);
        // update name will trigger storing appropriate data
        await this.updatePageName(`form-error`);
        // Do not throw an error, this could be a false positive
        //throw new InvalidETransferError(hasError.error_message);
      }

      // So far, so successful, let's keep going...
      await this.updatePageName(`form-${++step}`);

      // We should/may have navigated, get details about the new page.
      const image = await this.getImage(true);
      const title = await this.page.title();
      const { data: currentStage } = await GetETransferApi().detectEtransferStage(title, image);
      log.trace(`Sending step: ${step}, Current stage: ${currentStage.stage}`);

      const stepTrace = {
        title,
        stage: currentStage.stage
      }

      switch (currentStage.stage) {
        case "ReviewDetails":
          // Check we've entered what we need to?
          if (!this.hasSetAmount || !this.hasSetToRecipient) {
            log.error("Detected stage 'ReviewDetails', but not all required fields are filled");
            // However, it could be a mis-detection, so we will continue
          }
          break;
        case "TransferComplete":
          if (!this.hasSetAmount || !this.hasSetToRecipient) {
            log.error("Detected stage 'TransferComplete', but not all required fields are filled");
          }
          const image = await this.getImage(true);
          const { data: confirmationCode } = await api.detectConfirmationCode(image);
          log.trace(`Confirmation code: ${confirmationCode.content}`);
          // Lets try and find this in the webpage
          const found = await responseToElement(this.page, confirmationCode);
          if (!found) {
            log.error("Could not find confirmation code in page");
          }
          stepTrace['confirmationElement'] = found.data;
          break;
      }

      this.writeJson(stepTrace, `step-${step}`);

      // If we are complete and have a confirmation code, we are done
      if (stepTrace['confirmationElement']) {
        return true;
      }
    }
  }

  async fillETransferDetails(accountNumber: string, step: number) {
    log.trace("Processing Step " + step);
    // An input can change while being filled
    let subStep = 0;
    let hasFilledAnyInput = false;
    while (true) {
      // If everything is filled, don't add any more
      if (this.hasSetAmount && this.hasSetToRecipient && this.hasSetFromAccount) {
        break;
      }
      await this.updatePageName(`form-${step}-${subStep}`);
      const filledInput = await this.fillInputs(accountNumber);
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

  async gotoNextPage(step: number) {
    const api = GetETransferApi();
    const { data: nextButton } = await api.detectNextButton(await this.getImage(true));
    if (!nextButton) {
      return false;
    }
    return await this.completeInteraction(nextButton, (found) => clickElement(this.page, found), { name: `step-${step}` });
  }

  async fillInputs(accountNumber: string) {
    // There is a list of inputs on this page, we decipher each kind and how to deal with it appropriately
    const inputs = await getAllElements(this.page, Number.MAX_SAFE_INTEGER, 'input, select, [role="combobox"], [aria-haspopup="listbox"]');
    // Early exit if no inputs
    if (inputs.length == 0) {
      log.warn("No inputs found");
      return false;
    }
    const image = await this.getImage(true);
    const parents = await Promise.all(inputs.map(i => this.page.evaluateHandle(mapInputToParent, i.element)));
    const parentCoords = await Promise.all(parents.map(p => this.page.evaluate(getCoordsWithMargin, p)));

    const inputTypes = await callInputTypes(image, inputs, parentCoords);
    log.trace("SendETransferWriter: inputTypes: " + JSON.stringify(inputTypes));

    let hasFilledInput = false;
    try {
      for (const [input, inputType] of zip(inputs, inputTypes)) {
        switch (inputType) {
          case "AmountToSend":
            if (!this.hasSetAmount) {
              await this.fillAmountToSend(input, 5.23);
              this.hasSetAmount = true;
              hasFilledInput = true;
            }
            break;
          case "FromAccount":
            if (!this.hasSetFromAccount) {
              await this.selectFromAccount(input, accountNumber);
              this.hasSetFromAccount = true;
              hasFilledInput = true;
            }
            break;
          case "ToRecipient":
            if (!this.hasSetToRecipient && input.data.inputType != "radio") {
              const recipient = await this.askUser.forETransferRecipient();
              await this.selectToRecipient(input, recipient);
              this.hasSetToRecipient = true;
              hasFilledInput = true;
            }
            break;
          default:
            // No action required on the rest of the input types
            log.trace(`Detected input type: ${inputType}`);
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

  async fillAmountToSend(input: SearchElement, amount: number) {
    // Do we need to do anything more than this?
    log.trace("Filling input: AmountToSend");
    await enterValueIntoFound(this.page, input, amount.toString());
    await sleep(500);
    // How can we verify this worked?
  }

  async selectFromAccount(input: SearchElement, account: string) {
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
        await enterValueIntoFound(this.page, input, bestMatch);
        return true;
      }
    }
    else {
      // For text inputs, we can just check if the value is the same
      if (input.data.text.includes(account)) return true;
    }

    // Otherwise, enter the account number
    await enterValueIntoFound(this.page, input, account);
    return true;
  }

  async selectToRecipient(input: SearchElement, recipient: string) {
    log.trace("Filling input: ToRecipient");
    await enterValueIntoFound(this.page, input, recipient);
    if (input.data.tagName.toUpperCase() == "INPUT" || input.data.role?.toLowerCase() == "combobox") {
      // If this is a dropdown, we have to click the option
      const image = await this.getImage();
      const { data: r } = await GetETransferApi().detectToRecipient(recipient, image);
      const clicked = await this.completeInteraction(
        r,
        (found) => clickElement(this.page, found),
        { name: "select-recipient" }
      );

      if (!clicked) {
        // We could ask VQA if the recipient has been set(?)
        throw new InvalidETransferError("Failed to click recipient");
      }
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

function arraysEqual(a: any[], b: any[]) {
  if (a.length != b.length) return false;
  return a.every(str => b.includes(str));
}


function zip<T, U>(a: T[], b: U[]) {
  if (a.length != b.length) throw new Error("Arrays must be the same length");
  return a.map((val, i) => [val, b[i]] as const);
}
