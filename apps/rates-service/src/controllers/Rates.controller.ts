import { Controller, Get, Route, Response } from 'tsoa';
//import { Signup, Confirm, Unsubscribe, Details } from '../newsletter/Newsletter'
//import { BoolResponse } from '@the-coin/types';

import { updateRates }  from '../update/UpdateDb';

@Route('doUpdate')
export class RatesController extends Controller {

    /**
     * Get rates.
     *
     **/
    @Get('')
    @Response('200', 'Success')
    @Response('405', 'unknown exception')
    async doUpdate() : Promise<any> {
      try {
          return await updateRates();
      } catch (e) {
          console.error("Details fetch failed: " + JSON.stringify(e));
      }
    }
}
