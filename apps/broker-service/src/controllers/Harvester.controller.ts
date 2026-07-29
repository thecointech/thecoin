import { Controller, Route, Response, Tags, Post, Body } from '@tsoa/runtime';
import type {
  HarvesterRegistrationRequestSigned,
  HarvesterRunStartSigned,
  HarvesterRunCompleteSigned,
} from '@thecointech/harvester-monitoring/types';
import { ValidateErrorJSON, ServerError } from '../types';
import {
  recordHarvesterRegistration,
  startHarvesterRun,
  completeHarvesterRun,
} from '../heartbeat';

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
  async register(@Body() request: HarvesterRegistrationRequestSigned): Promise<boolean> {
    await recordHarvesterRegistration(request);
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
  async startRun(@Body() request: HarvesterRunStartSigned): Promise<{ runId: string }> {
    const run = await startHarvesterRun(request);
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
  async completeRun(@Body() request: HarvesterRunCompleteSigned): Promise<boolean> {
    await completeHarvesterRun(request);
    return true;
  }
}
