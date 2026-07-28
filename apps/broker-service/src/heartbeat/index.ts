import { log } from '@thecointech/logging';
import {
  getHarvesterRegistrationSigner,
  getHarvesterRunStartSigner,
  getHarvesterRunCompletionSigner,
} from '@thecointech/harvester-monitoring';
import type {
  HarvesterRegistrationRequest,
  HarvesterRunStartRequest,
  HarvesterRunCompletionRequest,
} from '@thecointech/harvester-monitoring';
import {
  recordHarvesterRegistration as dbRecordHarvesterRegistration,
  startHarvesterRun as dbStartHarvesterRun,
  completeHarvesterRun as dbCompleteHarvesterRun,
} from '@thecointech/broker-db';
import { SignatureError } from '../errors';
import { DateTime } from 'luxon';

const FiveMins = 5 * 60 * 1000;

function assertSigner(user: string, signer: string, action: string, signedAt?: DateTime) {
  if (signer !== user) {
    log.error({ user, signer }, `Bad request from {user} to ${action}: signer does not match {signer}`);
    throw new SignatureError('Invalid signature');
  }
  if (signedAt) {
    const now = DateTime.now();
    if (Math.abs(now.diff(signedAt).milliseconds) > FiveMins) {
      log.error(
        {signedTime: signedAt, now, address: signer},
        'Signature too old or too far in the future: {signedTime}, now: {now} - {address}'
      )
      throw new SignatureError('Signature too old');
    }
  }
}

export async function recordHarvesterRegistration(request: HarvesterRegistrationRequest) {
  const signer = getHarvesterRegistrationSigner(request);
  assertSigner(request.user, signer, 'register harvester', request.observedAt);

  return dbRecordHarvesterRegistration(signer, {
    schemaVersion: 1,
    installationId: request.installationId,
    platform: request.platform,
    architecture: request.architecture,
    action: request.action,
    observedAt: request.observedAt,
  });
}

export async function startHarvesterRun(request: HarvesterRunStartRequest) {
  const signer = getHarvesterRunStartSigner(request);
  assertSigner(request.user, signer, 'start harvester run', request.startedAt);

  return dbStartHarvesterRun(signer, {
    installationId: request.installationId,
    platform: request.platform,
    architecture: request.architecture,
    appVersion: request.appVersion,
    trigger: request.trigger,
    startedAt: request.startedAt,
    startedAtClient: request.startedAtClient,
  });
}

export async function completeHarvesterRun(request: HarvesterRunCompletionRequest) {
  const signer = getHarvesterRunCompletionSigner(request);
  assertSigner(request.user, signer, 'complete harvester run', request.finishedAt);

  return dbCompleteHarvesterRun(signer, request.installationId, request.runId, {
    outcome: request.outcome,
    finishedAt: request.finishedAt,
    finishedAtClient: request.finishedAtClient,
    failureStages: request.failureStages,
    failureCategory: request.failureCategory,
    terminalSource: request.terminalSource,
  });
}
