import { Controller, Get, Route, Response } from 'tsoa';
import { updateRates }  from '../rates/UpdateDb';

@Route('doUpdate')
export class RatesController extends Controller {

    /**
     * Get rates.
     *
     **/
    @Get('')
    @Response('200', 'Success')
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
