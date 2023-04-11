import { DateTime } from 'luxon';
import { replay } from '../scraper/replay';
import { ChequeBalanceResult, VisaBalanceResult } from '../scraper/types';
import currency from 'currency.js';

export async function getChequingData() : Promise<ChequeBalanceResult> {
  switch (process.env.CONFIG_NAME) {
    case 'dev':
    case 'devlive':
    case 'prodtest':
      // Mock the values in non-prod environment
      const balance = (Math.random() * 1000).toFixed(2);
      return {
        balance: currency(balance),
      };
    default:
      return await replay('chqBalance');
  }
}

export async function getVisaData(lastTxDate?: DateTime) : Promise<VisaBalanceResult> {
  switch (process.env.CONFIG_NAME) {
    case 'dev':
    case 'devlive':
    case 'prodtest':
      const balance = (Math.random() * 500).toFixed(2);
      const dueAmount = (Math.random() * 1000).toFixed(2);
      return {
        balance: currency(balance),
        dueDate: DateTime.now().plus({ days: 5 }),
        dueAmount: currency(dueAmount),
        history: []
      };
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
