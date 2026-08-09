import {
  getHarvesterRegistrationSigner,
  getHarvesterRunStartSigner,
  getHarvesterRunCompletionSigner,
} from '@thecointech/harvester-monitoring';
import type {
  HarvesterRegistrationRequestSigned,
  HarvesterRunStartSigned,
  HarvesterRunCompleteSigned,
} from '@thecointech/harvester-monitoring';
import {
  recordHarvesterRegistration as dbRecordHarvesterRegistration,
  startHarvesterRun as dbStartHarvesterRun,
  completeHarvesterRun as dbCompleteHarvesterRun,
} from '@thecointech/broker-db';
import { assertSigner } from '../assertSigner';
import { DateTime } from 'luxon';

export async function recordHarvesterRegistration(request: HarvesterRegistrationRequestSigned) {
  const signer = getHarvesterRegistrationSigner(request);
  const observedAt = DateTime.fromMillis(request.observedAt);
  assertSigner(request.user, signer, 'register harvester', observedAt);

  return dbRecordHarvesterRegistration(signer, {
    schemaVersion: 1,
    installationId: request.installationId,
    platform: request.platform,
    architecture: request.architecture,
    action: request.action,
    observedAt: observedAt,
  });
}

export async function startHarvesterRun(request: HarvesterRunStartSigned) {
  const signer = getHarvesterRunStartSigner(request);
  const startedAt = DateTime.fromMillis(request.startedAt);

  assertSigner(request.user, signer, 'start harvester run', startedAt);

  const startedAtClient = (request.startedAtClient !== undefined)
    ? DateTime.fromMillis(request.startedAtClient)
    : undefined;

  return dbStartHarvesterRun(signer, {
    installationId: request.installationId,
    platform: request.platform,
    architecture: request.architecture,
    appVersion: request.appVersion,
    trigger: request.trigger,
    startedAt,
    startedAtClient,
  });
}

export async function completeHarvesterRun(request: HarvesterRunCompleteSigned) {
  const signer = getHarvesterRunCompletionSigner(request);

  const finishedAt = DateTime.fromMillis(request.finishedAt);

  assertSigner(request.user, signer, 'complete harvester run', finishedAt);

  const finishedAtClient = (request.finishedAtClient !== undefined)
    ? DateTime.fromMillis(request.finishedAtClient)
    : undefined;

  return dbCompleteHarvesterRun(signer, request.installationId, request.runId, {
    outcome: request.outcome,
    finishedAt,
    finishedAtClient,
    failureStages: request.failureStages,
    failureCategory: request.failureCategory,
    terminalSource: request.terminalSource,
  });
}
