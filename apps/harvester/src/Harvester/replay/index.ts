import { replay } from '@thecointech/scraper';
import { getReplayEvents } from '@thecointech/scraper-agent';
import { getScrapingConfig, getBankConfig } from '../events';
import type { HarvesterReplayCallbacks } from './replayCallbacks';
import type { ChequeBalanceResult, ETransferInput, ETransferResult, SectionResultMap, VisaBalanceResult } from '@thecointech/scraper-agent/types';
import type { EventSection } from '@thecointech/scraper-agent/types';

export async function getBalances(callbacks: HarvesterReplayCallbacks, delay = 5000): Promise<[ChequeBalanceResult, VisaBalanceResult]> {
  const config = await getScrapingConfig();
  if (!config) throw new Error('No scraping config found');

  if ('both' in config) {
    callbacks.setSubTaskEvents('getBalances', config.both.events);
    const r = await runReplay(['chqBalance', 'visaBalance'], config.both.events, callbacks, undefined, delay);
    if (!r.AccountsSummary || !r.CreditAccountDetails) {
      throw new Error('Missing required balance data in both config');
    }
    return [r.AccountsSummary, r.CreditAccountDetails];
  }
  else {
    callbacks.setSubTaskEvents('chqBalance', config.chequing!.events);
    const chq = await runReplay('chqBalance', config.chequing!.events, callbacks, undefined, delay);
    if (!chq.AccountsSummary) {
      throw new Error('Missing required balance data in chequing config');
    }
    callbacks.setSubTaskEvents('visaBalance', config.credit!.events);
    const visa = await runReplay('visaBalance', config.credit!.events, callbacks, undefined, delay);
    if (!visa.CreditAccountDetails) {
      throw new Error('Missing required balance data in credit config');
    }
    return [chq.AccountsSummary, visa.CreditAccountDetails];
  }
}

export async function sendETransfer(callbacks: HarvesterReplayCallbacks, dynamicValues: ETransferInput, delay = 5000): Promise<ETransferResult|undefined> {
  const bankEvents = await getBankConfig('chequing');
  if (!bankEvents) throw new Error('No chequing/both config found');
  callbacks.setSubTaskEvents('chqETransfer', bankEvents.events);
  const r = await runReplay('chqETransfer', bankEvents.events, callbacks, dynamicValues, delay);
  return r.SendETransfer;
}

async function runReplay(actionName: Parameters<typeof getReplayEvents>[1], events: EventSection, callbacks: HarvesterReplayCallbacks, dynamicValues?: Record<string, string>, delay = 5000) {
  const replayEvents = getReplayEvents(events, actionName);
  if (!replayEvents?.length) {
    throw new Error(`No events found for ${JSON.stringify(actionName)}`);
  }
  const name = Array.isArray(actionName) ? actionName.join('+') : actionName;
  const r = await replay({ name, events: replayEvents, delay, callbacks, dynamicValues });
  if (!Array.isArray(actionName)) {
    callbacks.subTaskCallback({
      subTaskId: actionName,
      completed: true,
      percent: 100,
      result: JSON.stringify(r),
    });
  }
  return r as SectionResultMap;
}
