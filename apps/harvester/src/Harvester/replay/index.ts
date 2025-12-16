import { replay } from '@thecointech/scraper';
import type { ReplayResult } from '@thecointech/scraper-types';
import { getReplayEvents } from '@thecointech/scraper-agent';
import type { ActionType } from '@thecointech/store-harvester';
import { getEvents } from '../events';
import type { HarvesterReplayCallbacks } from './replayCallbacks';
import { ChequeBalanceResult, ETransferInput, ETransferResult, VisaBalanceResult } from '@thecointech/scraper-agent/types';

export async function getValues(actionName: 'chqBalance', callbacks: HarvesterReplayCallbacks): Promise<ChequeBalanceResult>;
export async function getValues(actionName: 'visaBalance', callbacks: HarvesterReplayCallbacks): Promise<VisaBalanceResult>;
export async function getValues(actionName: 'chqETransfer', callbacks: HarvesterReplayCallbacks, dynamicValues?: ETransferInput): Promise<ETransferResult>;
export async function getValues(actionName: ActionType, callbacks: HarvesterReplayCallbacks, dynamicValues?: Record<string, string>, delay?: number): Promise<ReplayResult>
export async function getValues(actionName: ActionType, callbacks: HarvesterReplayCallbacks, dynamicValues?: Record<string, string>, delay = 5000) {

  const rootSection = await getEvents(actionName);
  callbacks.setSubTaskEvents(actionName, rootSection);
  const events = getReplayEvents(rootSection, actionName);
  if (!events?.length) {
    throw new Error(`No events found for ${actionName}`);
  }
  const r = await replay({ name: actionName, events, delay, callbacks, dynamicValues});
  callbacks.subTaskCallback({
    subTaskId: actionName,
    completed: true,
    percent: 100,
    result: JSON.stringify(r),
  })
  return r;
}
