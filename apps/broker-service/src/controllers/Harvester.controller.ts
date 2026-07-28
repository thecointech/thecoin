import { Controller, Route, Response, Tags, Post, Body } from '@tsoa/runtime';
import { DateTime } from 'luxon';
import type {
  HarvesterRegistrationAction,
  HarvesterRunTrigger,
  HarvesterTerminalOutcome,
  HarvesterTerminalSource,
} from '@thecointech/harvester-monitoring';
import { ValidateErrorJSON, ServerError } from '../types';
import {
  recordHarvesterRegistration,
  startHarvesterRun,
  completeHarvesterRun,
} from '../heartbeat';

// Wire DTOs (duplicated to ease handling of DateTime, mirrors PluginsController)
type HarvesterRegistrationRequestDTO = {
  user: string;
  installationId: string;
  platform?: string;
  architecture?: string;
  action: HarvesterRegistrationAction;
  observedAt: number;
  signature: string;
}
type HarvesterRunStartRequestDTO = {
  user: string;
  installationId: string;
  platform?: string;
  architecture?: string;
  appVersion?: string;
  trigger: HarvesterRunTrigger;
  startedAt: number;
  startedAtClient?: number;
  signature: string;
}
type HarvesterRunCompletionRequestDTO = {
  user: string;
  installationId: string;
  runId: string;
  outcome: HarvesterTerminalOutcome;
  finishedAt: number;
  finishedAtClient?: number;
  failureStages?: string[];
  failureCategory?: string;
  terminalSource: HarvesterTerminalSource;
  signature: string;
}

@Route('harvester')
@Tags('Harvester')
export class HarvesterController extends Controller {

  /**
   * Registers (or re-registers) an installation for harvester monitoring
   **/
  @Post("registration")
  @Response('200', 'Registration recorded')
  @Response<ServerError>(401, "Invalid or expired signature")
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Response<ServerError>(500, "Server Error")
  async register(@Body() request: HarvesterRegistrationRequestDTO): Promise<boolean> {
    await recordHarvesterRegistration({
      ...request,
      observedAt: DateTime.fromMillis(request.observedAt),
    });
    return true;
  }

  /**
   * Records the start of a harvester run, returning the server-assigned run ID
   **/
  @Post("run/start")
  @Response('200', 'Run started')
  @Response<ServerError>(401, "Invalid or expired signature")
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Response<ServerError>(500, "Server Error")
  async startRun(@Body() request: HarvesterRunStartRequestDTO): Promise<{ runId: string }> {
    const run = await startHarvesterRun({
      ...request,
      startedAt: DateTime.fromMillis(request.startedAt),
      startedAtClient: request.startedAtClient !== undefined ? DateTime.fromMillis(request.startedAtClient) : undefined,
    });
    return { runId: run.runId };
  }

  /**
   * Records the completion (success/failure/etc) of a previously started harvester run
   **/
  @Post("run/complete")
  @Response('200', 'Run completed')
  @Response<ServerError>(401, "Invalid or expired signature")
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Response<ServerError>(500, "Server Error")
  async completeRun(@Body() request: HarvesterRunCompletionRequestDTO): Promise<boolean> {
    await completeHarvesterRun({
      ...request,
      finishedAt: DateTime.fromMillis(request.finishedAt),
      finishedAtClient: request.finishedAtClient !== undefined ? DateTime.fromMillis(request.finishedAtClient) : undefined,
    });
    return true;
  }
}
