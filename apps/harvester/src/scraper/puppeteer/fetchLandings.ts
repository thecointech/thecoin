import { sleep } from "@thecointech/async";
import path from "path";
import { existsSync, mkdirSync, readFileSync, write, writeFileSync } from "fs";
import { getElementForEvent } from "../elements";
import { Recorder } from "../record";
import { ClickEvent } from "../types";
import { Page } from "puppeteer";

// TODO: Scraping should really be in it's own package
const urls = {
  // TD: "https://www.td.com/ca/en/personal-banking",
  // Scotia: "https://www.scotiabank.com/ca/en/personal.html",
  // BMO: "https://www.bmo.com/en-ca/main/personal/",
  // CIBC: "https://www.cibc.com/en/personal-banking.html",
  Tangerine: "https://www.tangerine.ca/en/personal",
  RBC: "https://www.rbcroyalbank.com/personal.html",
  Random: "https://en.wikipedia.org/"
}

if (!process.env.PRIVATE_TESTING_PAGES) {
  throw new Error("PRIVATE_TESTING_PAGES is not set");
}

const writeEvents = true;

const outputFolder = path.join(process.env.PRIVATE_TESTING_PAGES, "unit-tests", "Login");
mkdirSync(outputFolder, { recursive: true });

async function doEvent(recorder: Recorder, bank: string, intent: string, eventName: string) {
  const jsonFile = path.join(outputFolder, `${bank}-${eventName}.json`);

  if (writeEvents) {
    // Get JSON data for login link
    await recorder.setRequiredValue(eventName);

    // The click is the latest event
    const event = recorder.events[recorder.events.length - 1];
    // Remove variable data
    const {
      timestamp,
      id,
      clickX,
      clickY,
      ...trimmed
    } = event as ClickEvent;
    // Add intent & write to disk
    writeFileSync(jsonFile, JSON.stringify({
      ...trimmed,
      intent,
    }, null, 2));
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

async function takeScreenshot(page: Page, bank: string, step = "") {
  if (!writeEvents) {
    return;
  }
  // Save screenshot
  await page.screenshot({ type: 'png', path: path.join(outputFolder, `${bank}${step}.png`) });
  // Lastly, try for MHTML
  const cdp = await page.createCDPSession();
  const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
  writeFileSync(path.join(outputFolder, `${bank}${step}.mhtml`), data);
}

for (const [bank, url] of Object.entries(urls)) {
  // const page = await browser.newPage();
  const recorder = await Recorder.instance('chqBalance', url);
  const page = recorder.getPage();
  await sleep(7500); // Let page finish loading

  // Navigate to the right page
  debugger;

  await takeScreenshot(page, bank);

  if (bank == "RBC" || bank == "Tangerine") {
    await doEvent(recorder, bank, "Login", "username");
    await doEvent(recorder, bank, "Login", "rememberme1");
    await doEvent(recorder, bank, "Login", "continue");
    debugger; // User manually advances
    await takeScreenshot(page, bank);

    await doEvent(recorder, bank, "Login", "password");
    await doEvent(recorder, bank, "Login", "login");
  }
  else {
    await doEvent(recorder, bank, "Login", "username");
    await doEvent(recorder, bank, "Login", "password");
    await doEvent(recorder, bank, "Login", "rememberme");
    await doEvent(recorder, bank, "Login", "login");
  }
  console.log("Done with " + bank);

  // save out the password failed screen
  // debugger;
  // await takeScreenshot(page, bank);

  await Recorder.release('chqBalance');
}

