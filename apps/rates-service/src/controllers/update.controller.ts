import { Controller, Get, Route, Response, Tags } from '@tsoa/runtime';
import { updateRates } from '../internals/rates';
import { log } from '@thecointech/logging';

@Route('')
@Tags('Updates')
export class UpdateController extends Controller {

  /**
   * Trigger a rates update.
   **/
  @Get('doUpdate')
  @Response('204', 'Success')
  @Response('500', 'unknown exception')
  async doUpdate() {
    return await updateRates();
  }

  /**
  * Test exception emailing
  */
  @Get('keepAlive')
  @Response('204', 'Success')
  async keepAlive() {
    log.info("Keep alive");
    return "Ok";
  }
}
