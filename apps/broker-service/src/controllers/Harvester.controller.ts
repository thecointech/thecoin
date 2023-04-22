import { Controller, Route, Response, Tags, Post, Body } from '@tsoa/runtime';
import { ValidateErrorJSON, ServerError } from '../types';
import { type Heartbeat, heartbeat } from '../heartbeat';

@Route('harvester')
@Tags('Harvester')
export class HarvesterController extends Controller {


  /**
   * Called on a successful harvester run
   **/
  @Post("heartbeat")
  @Response('200', 'The assign request has been added to the queue')
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Response<ServerError>(500, "Server Error")
  heartbeat(@Body() request: Heartbeat): Promise<boolean> {
    return heartbeat(request);
  }
}
