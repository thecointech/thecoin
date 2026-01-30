import { Controller, Get, Route, Response, Tags } from '@tsoa/runtime';
import { updateRates } from '../internals/rates';

@Route('')
@Tags('Updates')
export class UpdateController extends Controller {

  /**
   * Get rates.
   *
   **/
  @Get('doUpdate')
  @Response('204', 'Success')
  @Response('500', 'unknown exception')
  async doUpdate() {
    try {
      return await updateRates();
    } catch (e) {
      console.error("Details fetch failed: " + JSON.stringify(e));
      throw e;
    }
  }

  /**
  * Test exception emailing
  */
  @Get('keepAlive')
  @Response('204', 'Success')
  async keepAlive() {
    return "Ok";
  }
}
