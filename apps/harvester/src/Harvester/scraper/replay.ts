import { replay } from '@thecointech/scraper/replay';
import { maybeCloseModal } from '@thecointech/scraper-agent/modal';
import { ReplayResult, ReplayCallbacks, AnyEvent } from '@thecointech/scraper/types';
import { ChequeBalanceResult, VisaBalanceResult, ETransferResult, ActionTypes } from './types';
import { getEvents } from '../events';
import { log } from '@thecointech/logging';
import type { Page } from 'puppeteer';

export async function getValues(actionName: 'chqBalance', progress?: ReplayCallbacks): Promise<ChequeBalanceResult>;
export async function getValues(actionName: 'visaBalance', progress?: ReplayCallbacks): Promise<VisaBalanceResult>;
export async function getValues(actionName: 'chqETransfer', progress: ReplayCallbacks|undefined, dynamicValues: { amount: string }): Promise<ETransferResult>;
export async function getValues(actionName: ActionTypes, progress?: ReplayCallbacks, dynamicValues?: Record<string, string>, delay?: number): Promise<ReplayResult>
export async function getValues(actionName: ActionTypes, progress?: ReplayCallbacks, dynamicValues?: Record<string, string>, delay = 1000) {
  const events = await getEvents(actionName);
  if (!events?.length) {
    return { error: `No events found for ${actionName}` }
  }
  const cbWithHandling: ReplayCallbacks = {
    errorHandler: errorHandler,
    ...(progress ?? {})
  }
  return await replay(events, cbWithHandling, dynamicValues, delay);
}


async function errorHandler(page: Page, _event: AnyEvent, error: unknown) {
  log.error(error, "Error in replay");

  const didClose = await maybeCloseModal(page);
  if (!didClose) {
    throw error;
  }
  return true;
}
