import { Controller, Get, Put, Route, Query, Body, Post, Response } from 'tsoa';
//import { Signup, Confirm, Unsubscribe, Details } from '../newsletter/Newsletter'
//import { BoolResponse } from '@the-coin/types';

import { UpdateRates }  from '../update/UpdateDb';

@Route('rates')
export class RatesController extends Controller {

    /**
     * Get rates.
     *
     **/
    @Get('doUpdate')
    @Response('200', 'Success')
    @Response('405', 'unknown exception')
    async doUpdate(@Query() req: string) : Promise<any> {
      try {
          return await UpdateRates();
      } catch (e) {
          console.error("Details fetch failed: " + JSON.stringify(e));
      }
    }
}
