import { Controller, Get, Put, Route, Query, Body, Post, Response } from 'tsoa';
//import { Signup, Confirm, Unsubscribe, Details } from '../newsletter/Newsletter'
import { Status, BoolResponse } from '@the-coin/types';


import { UpdateRates }  from '../update/UpdateDb';

@Route('rates')
export class RatesController extends Controller {

    /**
     * Get rates.
     *
     * id String 
     * returns Status
     **/
    @Get('')
    @Response('200', 'Success')
    @Response('405', 'unknown exception')
    async doUpdate(@Query() req: string) : Promise<Status> {
      UpdateRates()
        .then((success) => {
          res.status(200).end('success: ' + success);
        })
        .catch((err) => {
          res.status(405).end('unknown exception');
        });
    
}
