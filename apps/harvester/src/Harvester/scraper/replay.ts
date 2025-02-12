import { replay } from '@thecointech/scraper/replay';
import { ReplayResult, ReplayCallbacks } from '@thecointech/scraper/types';
import { ChequeBalanceResult, VisaBalanceResult, ETransferResult, ActionTypes } from './types';
import { getEvents } from '../config';

export async function getValues(actionName: 'chqBalance', progress?: ReplayCallbacks): Promise<ChequeBalanceResult>;
export async function getValues(actionName: 'visaBalance', progress?: ReplayCallbacks): Promise<VisaBalanceResult>;
export async function getValues(actionName: 'chqETransfer', progress: ReplayCallbacks|undefined, dynamicValues: { amount: string }): Promise<ETransferResult>;
export async function getValues(actionName: ActionTypes, progress?: ReplayCallbacks, dynamicValues?: Record<string, string>, delay?: number): Promise<ReplayResult>
export async function getValues(actionName: ActionTypes, progress?: ReplayCallbacks, dynamicValues?: Record<string, string>, delay = 1000) {
  const events = await getEvents(actionName);
  if (!events?.length) {
    return { error: `No events found for ${actionName}` }
  }
  return await replay(events, progress, dynamicValues, delay);
}
