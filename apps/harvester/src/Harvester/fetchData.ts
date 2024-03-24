import { DateTime } from 'luxon';
import { replay } from '../scraper/replay';
import { ChequeBalanceResult, VisaBalanceResult } from '../scraper/types';
import currency from 'currency.js';
import { HistoryRow } from '../scraper/table';

export async function getChequingData() : Promise<ChequeBalanceResult> {
  switch (process.env.CONFIG_NAME) {
    case 'development':
    case 'devlive':
    case 'prodtest':
      // Mock the values in non-prod environment
      const balance = (1000 + Math.random() * 500).toFixed(2);
      return {
        balance: currency(balance),
      };
    default:
      return await replay('chqBalance');
  }
}

export async function getVisaData(lastTxDate?: DateTime) : Promise<VisaBalanceResult> {
  switch (process.env.CONFIG_NAME) {
    case 'development':
    case 'devlive':
    case 'prodtest':
      return getEmulatedVisaData(DateTime.now(), lastTxDate);
    default:
      const data = await replay('visaBalance');
      // Only keep the new transactions from history
      const newTransactions = lastTxDate
        ? data.history.filter(row => row.date > lastTxDate)
        : data.history;

      return {
        ...data,
        history: newTransactions,
      }
  }
}

// The following is pretty similar to initDemoAccount
// to consider: merging the logic?
// Date visa billing period ends
const firstBillingPeriodStarts = DateTime.fromISO('2024-02-26');
const weeksInBillingPeriod = 4; //Duration.fromObject({week: 4});
const weeksInGracePeriod = 3; //Duration.fromObject({week: 3});
// const firstDueDate = firstBillingPeriodStarts.plus({ weeks: weeksInBillingPeriod + weeksInGracePeriod });

const weeklySpending = 350;
// Due amount is constant each period
const dueAmount = weeklySpending * weeksInBillingPeriod;
// First run is the last tx created by initDemoAccount
// const firstRun = DateTime.fromISO('2024-03-18');

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

  // Current balance climbs from dueAmount to 2x dueAmount
  // This assumes we run 2x each week
  // const increments = Math.round(2 * (weeksBetween % 4))
  // const balance = baseDue + thisWeeksSpending; //dueAmount + increments * (weeklySpending / 2);
  // const weeksLastChecked = lastTxDate ? atDate.diff(lastTxDate, 'weeks').weeks : 0;
  // const priorRepayments = (1 + weeksLastChecked) / weeksInBillingPeriod
  // const hasPaymentHappened = Math.floor(repayments) > Math.floor(priorRepayments);
  // const history: HistoryRow[] = hasPaymentHappened
  //   ? [
  //     {
  //       date: atDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
  //       description: "Payment",
  //       credit: currency(dueAmount),
  //       balance: currency(balance),
  //     }
  //   ]
  //   : []
  return {
    balance: currency(balance),
    dueDate,
    dueAmount: currency(dueAmount),
    history: getEmulatedVisaHistory(repayments, balance, lastTxDate),
  };
}

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
        description: "Payment",
        credit: currency(dueAmount),
        balance: currency(balance),
      }
    ]
    : []
}