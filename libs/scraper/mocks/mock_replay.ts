import { AnyEvent, HistoryRow } from "../src/types";
import { IScraperCallbacks } from "../src/callbacks";
import { sleep } from "@thecointech/async/sleep";
import currency from "currency.js";
import { DateTime } from "luxon";

// TODO:
// Decide where to place mocked implementations for scraping
// This is currently duplicated with the harvester
// THIS DEFINITELY SHOULD BE IN SCRAPER-BANKING specialization library
export async function replay(name: string, events: AnyEvent[], callbacks?: IScraperCallbacks, dynamicValues?: Record<string, string>, delay = 1000) {

  // Progress started
  callbacks?.onProgress?.({ step: 0, total: 1, stage: name, stepPercent: 0 });

  for (let i = 0; i < events.length; i++) {
    await sleep(delay);
    const stepPercent = Math.round(100 * (i + 1) / events.length);
    callbacks?.onProgress?.({ step: 0, total: 1, stage: name, stepPercent });
  }

  // Mock some more-or-less random return values
  if (name == "chqBalance") {
    const balance = (1000 + Math.random() * 500).toFixed(2);
    return {
      balance: currency(balance),
    };
  }
  else if (name == "visaBalance") {
    return getEmulatedVisaData(DateTime.now());
  }
  return {

  };
}



// The following is pretty similar to initDemoAccount
// to consider: merging the logic?
// Date visa billing period ends
const firstBillingPeriodStarts = DateTime.fromISO('2024-02-26');
const weeksInBillingPeriod = 4;
const weeksInGracePeriod = 3;

const weeklySpending = 350;
// Due amount is constant each period
const dueAmount = weeklySpending * weeksInBillingPeriod;

export function getEmulatedVisaData(atDate: DateTime, lastTxDate?: DateTime) {

  const weeksBetween = atDate.diff(firstBillingPeriodStarts, 'weeks').weeks;

  const baseDue = dueAmount + Math.floor(weeksBetween) * weeklySpending;
  // Now add weeklySpending / 2 2x each week, Mon & Thur
  const weekRatio = 1 + Math.floor(0.6 + (weeksBetween % 1));
  const thisWeeksSpending = weekRatio * (weeklySpending / 2);
  const repayments = (1 + weeksBetween) / weeksInBillingPeriod
  const balance = baseDue + thisWeeksSpending - (Math.floor(repayments) * dueAmount);

  // Due date is every 4 weeks from first run.
  const periods = Math.floor(weeksBetween / weeksInBillingPeriod);
  const dueDate = firstBillingPeriodStarts.plus({ weeks: weeksInGracePeriod + (periods * weeksInBillingPeriod) });

  return {
    balance: currency(balance),
    dueDate,
    dueAmount: currency(dueAmount),
    history: getEmulatedVisaHistory(repayments, balance, lastTxDate),
  };
}

// If a payment should have happened since lastTxDate, add it to history
export function getEmulatedVisaHistory(repayments: number, balance: number, lastTxDate?: DateTime) : HistoryRow[] {
  const weeksLastChecked = lastTxDate ? lastTxDate.diff(firstBillingPeriodStarts, 'weeks').weeks : 0;
  const priorRepayments = (1 + weeksLastChecked) / weeksInBillingPeriod
  const hasPaymentHappened = Math.floor(repayments) > Math.floor(priorRepayments);
  const clearanceDate = firstBillingPeriodStarts
    .plus({weeks: weeksInGracePeriod})
    .plus({weeks: weeksInBillingPeriod * (Math.floor(repayments) - 1)});
  return hasPaymentHappened
    ? [
      {
        date: clearanceDate,
        values: [currency(dueAmount), currency(balance)],
        // description: "Payment",
        // credit: currency(dueAmount),
        // balance: currency(balance),
      }
    ]
    : []
}
