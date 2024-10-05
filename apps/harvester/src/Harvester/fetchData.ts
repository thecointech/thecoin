import { DateTime } from 'luxon';
import { replay } from '../scraper/replay';
import { ChequeBalanceResult, VisaBalanceResult } from '../scraper/types';
import currency from 'currency.js';
import { HistoryRow } from '../scraper/table';

export async function getChequingData() : Promise<ChequeBalanceResult> {
  if (process.env.HARVESTER_OVERRIDE_CHQ_BALANCE) {
    return {
      balance: currency(process.env.HARVESTER_OVERRIDE_CHQ_BALANCE),
    }
  }
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
  if (process.env.HARVESTER_OVERRIDE_VISA_BALANCE) {
    const data = JSON.parse(process.env.HARVESTER_OVERRIDE_VISA_BALANCE);
    return {
      balance: currency(data.balance ?? 0),
      dueDate: DateTime.fromISO(data.dueDate),
      dueAmount: currency(data.dueAmount),
      txs: [],
    }
  }
  switch (process.env.CONFIG_NAME) {
    case 'development':
    case 'devlive':
    case 'prodtest':
      return getEmulatedVisaData(DateTime.now(), lastTxDate);
    default:
      const data = await replay('visaBalance');
      // Only keep the new transactions from history
      const newTransactions = lastTxDate
        ? data.txs?.filter(row => row.date > lastTxDate)
        : data.txs;

      return {
        ...data,
        txs: newTransactions,
      }
  }
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
