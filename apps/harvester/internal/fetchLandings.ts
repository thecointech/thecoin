import path from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { getElementForEvent } from "../elements";
import { Recorder } from "../record";
import { ClickEvent } from "../types";
import { Page } from "puppeteer";

const sleep = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// TODO: Scraping should really be in it's own package
const urls = {
  TD: "https://www.td.com/ca/en/personal-banking",
  Scotia: "https://www.scotiabank.com/ca/en/personal.html",
  BMO: "https://www.bmo.com/en-ca/main/personal/",
  CIBC: "https://www.cibc.com/en/personal-banking.html",
  Tangerine: "https://www.tangerine.ca/en/personal",
  RBC: "https://www.rbcroyalbank.com/personal.html",
  // Random: "https://en.wikipedia.org/"
} as const;

type Bank = keyof typeof urls;

if (!process.env.PRIVATE_TESTING_PAGES) {
  throw new Error("PRIVATE_TESTING_PAGES is not set");
}

const writeEvents = true;

const baseFolder = path.join(process.env.PRIVATE_TESTING_PAGES, "unit-tests");
mkdirSync(baseFolder, { recursive: true });

async function getEvent(recorder: Recorder, eventName: string) {
  await recorder.setRequiredValue(eventName);

  // The click is the latest event
  const event = recorder.events[recorder.events.length - 1];
  // Remove variable data
  const {
    timestamp,
    id,
    clickX,
    clickY,
    parsing,
    type,
    ...trimmed
  } = event as any;
  return {
    ...trimmed,
  }
}
async function doEvent(recorder: Recorder, page_type: string, bank: Bank, eventName: string) {
  const jsonFile = path.join(baseFolder, page_type, `${bank}-${eventName}.json`);

  if (writeEvents) {
    const event = await getEvent(recorder, eventName);
    // Add intent & write to disk
    writeFileSync(jsonFile, JSON.stringify(event, null, 2));
  }
  else {
    // Check that our existing data matches the current page
    if (existsSync(jsonFile)) {
      // Update login link element data
      const blessedRaw = readFileSync(jsonFile, "utf-8");
      const data = JSON.parse(blessedRaw);
      if (!data.selector) {
        console.error("Missing selector for " + bank);
        return;
      }
      const found = await getElementForEvent(recorder.getPage(), data, 5000, 20);
      if (!found) {
        console.error("Failed to find element data for " + bank);
        return;
      }
      writeFileSync(jsonFile, JSON.stringify({
        intent: data.intent,
        ...found.data
      }, null, 2));
    }
    else {
      // Create empty file
      const el = {};
      writeFileSync(jsonFile, JSON.stringify(el, null, 2));
    }
  }

  console.log("Wrote element data to " + jsonFile);
}

async function doManyEvents(recorder: Recorder, page_type: string, bank: Bank, eventName: string) {
  const events = [];
  while (true) {
    const event: ClickEvent = await getEvent(recorder, eventName);
    // Click at the very top of the page to break the loop
    let shouldBreak = event.type == "click" && event.coords.top < 20;
    console.log("Should break? " + shouldBreak);
    if (shouldBreak) {
      break;
    }
    events.push(event);
  }
  const jsonFile = path.join(baseFolder, page_type, `${bank}-${eventName}.json`);
  writeFileSync(jsonFile, JSON.stringify(events, null, 2));
}

async function takeScreenshot(page: Page, page_type: string, bank: Bank) {
  if (!writeEvents) {
    return;
  }
  const outputFolder = path.join(baseFolder, page_type);
  mkdirSync(outputFolder, { recursive: true });
  // Save screenshot
  await page.screenshot({ type: 'png', path: path.join(outputFolder, `${bank}.png`), fullPage: true });
  // Lastly, try for MHTML
  const cdp = await page.createCDPSession();
  const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
  writeFileSync(path.join(outputFolder, `${bank}.mhtml`), data);
}

for (const [bank, url] of Object.entries(urls) as [Bank, string][]) {
  const recorder = await Recorder.instance('chqBalance', url);
  const page = recorder.getPage();

  // Navigate to the right page
  debugger;
  await sleep(7500); // Let page finish loading
  debugger; // Just to be sure

  // Record AccountDetails page for credit
  {
    await takeScreenshot(page, "details", bank);
    await doEvent(recorder, "details", bank, "due-date");
    await doEvent(recorder, "details", bank, "due-amount");
    await doEvent(recorder, "details", bank, "balance");
    await doEvent(recorder, "details", bank, "pending");
    await doEvent(recorder, "details", bank, "history");
  }
  // Record Overview page (list accounts, get balance, navigate to account)
  {
  // await takeScreenshot(page, "overview", bank);

  // List accounts (?)
  // await doManyEvents(recorder, "overview", bank, "list-accounts");

  // Get balance for a specific account
  // await doEvent(recorder, "overview", bank, "balance");
  // await doEvent(recorder, "overview", bank, "navigate");

  }

  // await takeScreenshot(page, bank, "2fa-select");
  // let pickOption = true;
  // const events = [];
  // while (pickOption) {
  //   const event = await getEvent(recorder, "2fa-select", "2fa-select");
  //   events.push(event);
  // }
  // const json_file = path.join(outputFolder, `${bank}-2fa-select.json`);
  // writeFileSync(json_file, JSON.stringify(events, null, 2));
  // await doEvent(recorder, bank, "Login", "2fa-select");
  // debugger;
  // await takeScreenshot(page, bank, "2fa-input");
  debugger;
  // await doEvent(recorder, bank, "Login", "2fa-input");
  // await doEvent(recorder, bank, "Login", "2fa-skip");
  // await doEvent(recorder, bank, "Login", "2fa-submit");

  // await takeScreenshot(page, bank);

  // if (bank == "RBC" || bank == "Tangerine") {
  //   await doEvent(recorder, bank, "Login", "username");
  //   await doEvent(recorder, bank, "Login", "rememberme1");
  //   await doEvent(recorder, bank, "Login", "continue");
  //   debugger; // User manually advances
  //   await takeScreenshot(page, bank, "1");

  //   await doEvent(recorder, bank, "Login", "password");
  //   await doEvent(recorder, bank, "Login", "login");
  // }
  // else {
  //   await doEvent(recorder, bank, "Login", "username");
  //   await doEvent(recorder, bank, "Login", "password");
  //   await doEvent(recorder, bank, "Login", "rememberme");
  //   await doEvent(recorder, bank, "Login", "login");
  // }
  console.log("Done with " + bank);

  // save out the password failed screen
  // debugger;
  // await takeScreenshot(page, bank);

  await Recorder.release('chqBalance');
}

