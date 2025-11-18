import { DateTime } from 'luxon';
import currency from 'currency.js';
import { getValues } from './scraper';
import { ScraperCallbacks } from './scraper/callbacks';
import { ChequeBalanceResult, VisaBalanceResult } from '@thecointech/scraper-agent/types';

export async function getChequingData(callback: ScraperCallbacks) : Promise<ChequeBalanceResult> {
  if (process.env.HARVESTER_OVERRIDE_CHQ_BALANCE) {
    return {
      balance: currency(process.env.HARVESTER_OVERRIDE_CHQ_BALANCE),
    }
  }
  switch (process.env.CONFIG_NAME) {
    // case 'development':
    // case 'devlive':
    // case 'prodtest':
    //   // Mock the values in non-prod environment
    //   const balance = (1000 + Math.random() * 500).toFixed(2);
    //   return {
    //     balance: currency(balance),
    //   };
    default:
      return await getValues('chqBalance', callback);
  }
}

export async function getVisaData(callback: ScraperCallbacks, lastTxDate?: DateTime) : Promise<VisaBalanceResult> {
  if (process.env.HARVESTER_OVERRIDE_VISA_BALANCE) {
    const data = JSON.parse(process.env.HARVESTER_OVERRIDE_VISA_BALANCE);
    return {
      balance: currency(data.balance ?? 0),
      dueDate: DateTime.fromISO(data.dueDate),
      dueAmount: currency(data.dueAmount),
    }
  }

  const data = await getValues('visaBalance', callback);
  // Only keep the new transactions from history
  const newTransactions = lastTxDate
    ? data.history?.filter(row => row.date > lastTxDate)
    : data.history;

  return {
    ...data,
    history: newTransactions,
  }
}
