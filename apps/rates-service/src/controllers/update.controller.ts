import { Controller, Get, Route, Response } from 'tsoa';
import { updateRates }  from '../internals/rates';

@Route('doUpdate')
export class UpdateController extends Controller {

    /**
     * Get rates.
     *
     **/
    @Get('')
    @Response('204', 'Success')
    @Response('405', 'unknown exception')
    async doUpdate() {
      try {
          return await updateRates();
      } catch (e) {
          console.error("Details fetch failed: " + JSON.stringify(e));
          throw e;
      }
    }
}
