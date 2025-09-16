import { replay } from '@thecointech/scraper';
import { ReplayResult } from '@thecointech/scraper/types';
import { getReplayEvents } from '@thecointech/scraper-agent';
import { ActionType } from './types';
import { getEvents } from '../events';
import { BackgroundTaskCallback } from '@/BackgroundTask';
import { ScraperCallbacks } from './callbacks';
import { ChequeBalanceResult, ETransferInput, ETransferResult, VisaBalanceResult } from '@thecointech/scraper-agent/types';
import { maybeSerializeRun } from '../scraperLogging';

export async function getValues(actionName: 'chqBalance', callback?: BackgroundTaskCallback): Promise<ChequeBalanceResult>;
export async function getValues(actionName: 'visaBalance', callback?: BackgroundTaskCallback): Promise<VisaBalanceResult>;
export async function getValues(actionName: 'chqETransfer', callback?: BackgroundTaskCallback, dynamicValues?: ETransferInput): Promise<ETransferResult>;
export async function getValues(actionName: ActionType, callback?: BackgroundTaskCallback, dynamicValues?: Record<string, string>, delay?: number): Promise<ReplayResult>
export async function getValues(actionName: ActionType, callback?: BackgroundTaskCallback, dynamicValues?: Record<string, string>, delay = 5000) {

  const scraperCallbacks = new ScraperCallbacks("replay", callback, [actionName]);
  const events = await getEvents(actionName);
  const replayEvents = getReplayEvents(events, actionName);
  if (!replayEvents?.length) {
    throw new Error(`No events found for ${actionName}`);
  }
  using _ = await maybeSerializeRun(scraperCallbacks.logsFolder, actionName, true);
  const r = await replay({ name: actionName, delay }, replayEvents, scraperCallbacks, dynamicValues);
  scraperCallbacks.complete(true);
  return r;
}
