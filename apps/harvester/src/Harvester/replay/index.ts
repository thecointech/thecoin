import { replay } from '@thecointech/scraper';
import type { ReplayResult } from '@thecointech/scraper-types';
import { getReplayEvents } from '@thecointech/scraper-agent';
import type { ActionType } from '@thecointech/store-harvester';
import { getEvents } from '../events';
import type { HarvesterReplayCallbacks } from './replayCallbacks';
import { ChequeBalanceResult, ETransferInput, ETransferResult, VisaBalanceResult } from '@thecointech/scraper-agent/types';

export async function getValues(actionName: 'chqBalance', callback: HarvesterReplayCallbacks): Promise<ChequeBalanceResult>;
export async function getValues(actionName: 'visaBalance', callback: HarvesterReplayCallbacks): Promise<VisaBalanceResult>;
export async function getValues(actionName: 'chqETransfer', callback: HarvesterReplayCallbacks, dynamicValues?: ETransferInput): Promise<ETransferResult>;
export async function getValues(actionName: ActionType, callback: HarvesterReplayCallbacks, dynamicValues?: Record<string, string>, delay?: number): Promise<ReplayResult>
export async function getValues(actionName: ActionType, callback: HarvesterReplayCallbacks, dynamicValues?: Record<string, string>, delay = 5000) {

  const events = await getEvents(actionName);
  callback.setSubTaskEvents(actionName, events);
  const replayEvents = getReplayEvents(events, actionName);
  if (!replayEvents?.length) {
    throw new Error(`No events found for ${actionName}`);
  }
  const r = await replay({ name: actionName, delay }, replayEvents, callback, dynamicValues);
  callback.subTaskCallback({
    subTaskId: actionName,
    completed: true,
    percent: 100,
    result: JSON.stringify(r),
  })
  return r;
}
