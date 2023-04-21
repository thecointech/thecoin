import { DateTime } from 'luxon';
import { replay } from '../scraper/replay';
import { ChequeBalanceResult, VisaBalanceResult } from '../scraper/types';
import currency from 'currency.js';

export async function getChequingData() : Promise<ChequeBalanceResult> {
  switch (process.env.CONFIG_NAME) {
    case 'development':
    case 'devlive':
    case 'prodtest':
      // Mock the values in non-prod environment
      const balance = (500 + Math.random() * 500).toFixed(2);
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
      const balance = (Math.random() * 500).toFixed(2);
      const dueAmount = (Math.random() * 500).toFixed(2);
      // ProdTest emulates a real account, so needs a workable dueDate
      const firstRun = DateTime.fromISO('2023-04-17');
      const weeksBetween = firstRun.diff(DateTime.now()).weeks;
      const periods = Math.ceil(weeksBetween / 4);
      const dueDate = firstRun.plus({ weeks: periods });
      return {
        balance: currency(balance),
        dueDate,
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
