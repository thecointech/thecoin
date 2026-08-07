import { GetHarvesterApi, GetStatusApi } from '@thecointech/apis/broker';
import {
  signHarvesterRegistrationRequest,
  signHarvesterRunStart,
  signHarvesterRunComplete,
  type HarvesterTerminalOutcome,
  type HarvesterRunTrigger,
} from '@thecointech/harvester-monitoring';
import { log } from '@thecointech/logging';
import { DateTime } from 'luxon';
import type { Signer } from 'ethers';

export async function optIntoMonitoring(signer: Signer, installationId: string) {
  try {
    const serverTimestamp = await GetStatusApi().timestamp();
    const request = await signHarvesterRegistrationRequest(
      signer,
      {
        observedAt: DateTime.fromMillis(serverTimestamp.data),
        action: "notifyAll",
        installationId,
        architecture: process.arch,
        platform: process.platform,
      }
    );
    const r = await GetHarvesterApi().register(request);
    log.debug('Monitoring registration successful:', r.data);
  }
  catch (e) {
    log.error(e, 'Failed to register for monitoring');
    // We need to show these errors to the user somehow...
  }
}

//
// Report the start of a harvester run. Returns the server-assigned run ID,
// or undefined if the report failed (in which case the run should proceed
// without a matching completion report).
export async function reportRunStart(signer: Signer, installationId: string, trigger: HarvesterRunTrigger) {
  try {
    const serverTimestamp = await GetStatusApi().timestamp();
    const request = await signHarvesterRunStart(signer, {
      installationId,
      platform: process.platform,
      architecture: process.arch,
      appVersion: process.env.TC_APP_VERSION,
      trigger,
      startedAt: DateTime.fromMillis(serverTimestamp.data),
      startedAtClient: DateTime.now(),
    });
    const r = await GetHarvesterApi().startRun(request);
    return r.data.runId;
  }
  catch (e) {
    log.error(e, 'Failed to report harvester run start');
    return undefined;
  }
}

//
// Report the completion of a previously started harvester run.
export async function reportRunComplete(
  signer: Signer,
  installationId: string,
  runId: string,
  outcome: HarvesterTerminalOutcome,
  details?: { failureStages?: string[], failureCategory?: string },
) {
  try {
    const serverTimestamp = await GetStatusApi().timestamp();
    const request = await signHarvesterRunComplete(signer, {
      installationId,
      runId,
      outcome,
      finishedAt: DateTime.fromMillis(serverTimestamp.data),
      finishedAtClient: DateTime.now(),
      failureStages: details?.failureStages,
      failureCategory: details?.failureCategory,
      terminalSource: "client",
    });
    await GetHarvesterApi().completeRun(request);
  }
  catch (e) {
    log.error(e, 'Failed to report harvester run completion');
  }
}
