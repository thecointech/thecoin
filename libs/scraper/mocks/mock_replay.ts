import type { ReplayResult } from "@thecointech/scraper-types";
import { sleep } from "@thecointech/async/sleep";
import currency from "currency.js";
import { DateTime } from "luxon";
import type { ReplayOptions } from "../src/replay";
import { replay as SrcReplay } from "../src/replay";
import { getEmulatedVisaData } from "./testDemoAccountEmulation";

// TODO:
// Decide where to place mocked implementations for scraping
// This is currently duplicated with the harvester
// THIS DEFINITELY SHOULD BE IN SCRAPER-BANKING specialization library


export const replay: typeof SrcReplay = async ({name, events, callbacks}: ReplayOptions) : Promise<ReplayResult> => {

  // Progress started
  callbacks?.onProgress?.({ step: 0, total: 1, stage: name, stepPercent: 0 });

  const sleepLength = process.env.RUNTIME_ENV == "test" ? 10 : 500;

  for (let i = 0; i < events.length; i++) {
    await sleep(sleepLength);
    const stepPercent = Math.round(100 * (i + 1) / events.length);
    const continueLoop = callbacks?.onProgress?.({ step: 0, total: 1, stage: name, stepPercent, event: events[i] });
    if (continueLoop === false) {
      break;
    }
  }

  // Mock some more-or-less random return values
  if (name == "chqBalance") {
    const balance = (1000 + Math.random() * 500).toFixed(2);
    return {
      AccountsSummary: { balance: currency(balance) },
    };
  }
  else if (name == "visaBalance") {
    return {
      CreditAccountDetails: getEmulatedVisaData(DateTime.now()),
    };
  }
  else if (name == 'chqETransfer') {
    return {
      SendETransfer: { confirmationCode: "1234" },
    };
  }
  else if (name.includes('+')) {
    return {
      AccountsSummary: { balance: currency((1000 + Math.random() * 500).toFixed(2)) },
      CreditAccountDetails: getEmulatedVisaData(DateTime.now()),
    };
  }
  throw new Error(`Unknown action name: ${name}`);
}

