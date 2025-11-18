import { replay } from '@thecointech/scraper';
import type { ReplayResult } from '@thecointech/scraper-types';
import { getReplayEvents } from '@thecointech/scraper-agent';
import { ActionType } from '@/Harvester/scraper';
import { getEvents } from '../events';
import { ScraperCallbacks } from './callbacks';
import { ChequeBalanceResult, ETransferInput, ETransferResult, VisaBalanceResult } from '@thecointech/scraper-agent/types';
import { maybeSerializeRun } from '../scraperLogging';

export async function getValues(actionName: 'chqBalance', callback: ScraperCallbacks): Promise<ChequeBalanceResult>;
export async function getValues(actionName: 'visaBalance', callback: ScraperCallbacks): Promise<VisaBalanceResult>;
export async function getValues(actionName: 'chqETransfer', callback: ScraperCallbacks, dynamicValues?: ETransferInput): Promise<ETransferResult>;
export async function getValues(actionName: ActionType, callback: ScraperCallbacks, dynamicValues?: Record<string, string>, delay?: number): Promise<ReplayResult>
export async function getValues(actionName: ActionType, callback: ScraperCallbacks, dynamicValues?: Record<string, string>, delay = 5000) {

  const events = await getEvents(actionName);
  callback.setSubTaskEvents(actionName, events);
  const replayEvents = getReplayEvents(events, actionName);
  if (!replayEvents?.length) {
    throw new Error(`No events found for ${actionName}`);
  }
  using _ = await maybeSerializeRun(callback.logsFolder, actionName, true, []);
  const r = await replay({ name: actionName, delay }, replayEvents, callback, dynamicValues);
  // callback.complete({ result: JSON.stringify(r) });
  callback.subTaskCallback({
    subTaskId: actionName,
    completed: true,
    percent: 100,
    result: JSON.stringify(r),
  })
  return r;
}
