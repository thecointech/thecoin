import { Controller, Get, Route, Query, Post, Response, Tags, BodyProp } from '@tsoa/runtime';
import { getReferrerData, createReferree } from '@thecointech/broker-db/referrals';
import { BoolResponse } from '../types';
import { DateTime } from 'luxon';

@Route('referrals')
@Tags('Referrals')
export class ReferralsController extends Controller {

  /**
  * Returns a boolean indicating whether the passed referrer is valid
  *
  * Referrers ID: This ID must have been previously registered with the system
  *
  **/
  @Get()
  @Response('200', 'Id Valid')
  @Response('405', 'Server Error')
  async referrerValid(@Query() referrerId: string) : Promise<BoolResponse> {
    try {
      const referrer = await getReferrerData(referrerId);
      return {
        success: !!referrer
      };
    }
    catch(err) {
      console.error(err);
      return {
        success: false
      }
    }
  }

  /**
  * Set referal for new account
  *
  * NewAccountReferal: This referral must have been previously registered with the system
  *
  **/
  @Post()
  @Response('200', 'Referral success')
  @Response('405', 'Server Error')
  async referralCreate(@BodyProp() code: string, @BodyProp() address: string): Promise<BoolResponse> {
    try {
      await createReferree(code, address, DateTime.now());
      return {
        success: true
      };
    } catch(err) {
      console.error(err);
      this.setStatus(500);
      throw new Error('Server Error');
    }
  }
}
