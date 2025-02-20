import { replay } from '@thecointech/scraper';
import { ReplayResult } from '@thecointech/scraper/types';
import { ChequeBalanceResult, VisaBalanceResult, ETransferResult, ActionTypes } from './types';
import { getEvents } from '../events';
import { BackgroundTaskCallback } from '@/BackgroundTask';
import { ScraperCallbacks } from './callbacks';

export async function getValues(actionName: 'chqBalance', callback?: BackgroundTaskCallback): Promise<ChequeBalanceResult>;
export async function getValues(actionName: 'visaBalance', callback?: BackgroundTaskCallback): Promise<VisaBalanceResult>;
export async function getValues(actionName: 'chqETransfer', callback?: BackgroundTaskCallback, dynamicValues?: { amount: string }): Promise<ETransferResult>;
export async function getValues(actionName: ActionTypes, callback?: BackgroundTaskCallback, dynamicValues?: Record<string, string>, delay?: number): Promise<ReplayResult>
export async function getValues(actionName: ActionTypes, callback?: BackgroundTaskCallback, dynamicValues?: Record<string, string>, delay = 1000) {

  const scraperCallbacks = new ScraperCallbacks(actionName, callback);
  const events = await getEvents(actionName);
  if (!events?.length) {
    return { error: `No events found for ${actionName}` }
  }
  return await replay(events, scraperCallbacks, dynamicValues, delay);
}
