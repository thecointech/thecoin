import { DateTime } from 'luxon';
import currency from 'currency.js';
import { getBalances } from './replay';
import { HarvesterReplayCallbacks } from './replay/replayCallbacks';
import type { ChequeBalanceResult, VisaBalanceResult } from '@thecointech/scraper-agent/types';


type AccountData = { chq: ChequeBalanceResult, visa: VisaBalanceResult };
export async function getAccountData(callback: HarvesterReplayCallbacks, lastTxDate?: DateTime): Promise<AccountData> {
  const chqOverride = process.env.HARVESTER_OVERRIDE_CHQ_BALANCE ? getOverrideChqData() : undefined;
  const visaOverride = process.env.HARVESTER_OVERRIDE_VISA_BALANCE ? getOverrideVisaData() : undefined;

  if (chqOverride && visaOverride) {
    return { chq: chqOverride, visa: visaOverride };
  }

  const [chqResult, visaResult] = await getBalances(callback);

  const chq = chqOverride ?? chqResult;
  const rawVisa = visaOverride ?? visaResult;
  const newTransactions = lastTxDate
    ? rawVisa.history?.filter(row => row.date > lastTxDate)
    : rawVisa.history;
  const visa = { ...rawVisa, history: newTransactions };

  return { chq, visa };
}

function getOverrideChqData(): ChequeBalanceResult {
  if (process.env.HARVESTER_OVERRIDE_CHQ_BALANCE) {
    return { balance: currency(process.env.HARVESTER_OVERRIDE_CHQ_BALANCE) };
  }
  throw new Error('No chequing override set');
}

function getOverrideVisaData(): VisaBalanceResult {
  if (process.env.HARVESTER_OVERRIDE_VISA_BALANCE) {
    const data = JSON.parse(process.env.HARVESTER_OVERRIDE_VISA_BALANCE);
    return {
      balance: currency(data.balance ?? 0),
      dueDate: DateTime.fromISO(data.dueDate),
      dueAmount: currency(data.dueAmount),
    };
  }
  throw new Error('No visa override set');
}
