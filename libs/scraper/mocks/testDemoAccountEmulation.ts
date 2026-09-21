import type { HistoryRow } from "@thecointech/scraper-types";
import currency from "currency.js";
import { DateTime } from "luxon";

// Used by both harvester & initDemoAccount

if (!(process.env.CONFIG_NAME === "prodtest" || process.env.CONFIG_NAME === "devlive" || process.env.RUNTIME_ENV === "test")) {
  throw new Error("This file should only be used in prodtest or devlive");
}

// Our demo account started running on this date.
export const DemoAccountScheduleStart = DateTime.fromObject({
  year: 2023,
  month: 1,
  day: 2,
})

// Date visa billing period ends
const weeksInBillingPeriod = 4;
const weeksInGracePeriod = 3;
const weeklySpending = 350;

// Due amount is constant each period
const dueAmount = weeklySpending * weeksInBillingPeriod;

export type DemoCheckpoint = {
  date: DateTime;
  harvesterBalance: currency;
  visa: ReturnType<typeof getEmulatedVisaData>;
  pendingPayment?: {
    amount: currency;
    date: DateTime;
  };
};

export function getDemoCheckpoint(atDate: DateTime): DemoCheckpoint {
  const visa = getEmulatedVisaData(atDate);
  const pendingPayment = atDate < visa.dueDate
    ? {
        amount: visa.dueAmount,
        date: visa.dueDate,
      }
    : undefined;

  return {
    date: atDate,
    harvesterBalance: visa.balance,
    visa,
    pendingPayment,
  };
}

export function getEmulatedVisaData(atDate: DateTime, lastTxDate?: DateTime) {

  const date = atDate.startOf('day');
  const weeksBetween = date.diff(DemoAccountScheduleStart, 'weeks').weeks;

  const baseDue = dueAmount + Math.floor(weeksBetween) * weeklySpending;
  // Now add weeklySpending / 2 2x each week, Mon & Thur
  const weekRatio = 1 + Math.floor(0.6 + (weeksBetween % 1));
  const thisWeeksSpending = weekRatio * (weeklySpending / 2);
  const repayments = (1 + weeksBetween) / weeksInBillingPeriod
  const balance = baseDue + thisWeeksSpending - (Math.floor(repayments) * dueAmount);

  // Due date is every 4 weeks from first run.
  const periods = Math.floor(weeksBetween / weeksInBillingPeriod);
  const dueDate = DemoAccountScheduleStart.plus({ weeks: weeksInGracePeriod + (periods * weeksInBillingPeriod) });

  return {
    balance: currency(balance),
    dueDate,
    dueAmount: currency(dueAmount),
    history: getEmulatedVisaHistory(repayments, balance, lastTxDate),
  };
}

// If a payment should have happened since lastTxDate, add it to history
export function getEmulatedVisaHistory(repayments: number, balance: number, lastTxDate?: DateTime) : HistoryRow[] {
  const weeksLastChecked = lastTxDate
    ? lastTxDate
      .startOf('day')
      .diff(DemoAccountScheduleStart, 'weeks')
      .weeks
    : 0;
  const priorRepayments = (1 + weeksLastChecked) / weeksInBillingPeriod
  const hasPaymentHappened = Math.floor(repayments) > Math.floor(priorRepayments);
  const clearanceDate = DemoAccountScheduleStart
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
