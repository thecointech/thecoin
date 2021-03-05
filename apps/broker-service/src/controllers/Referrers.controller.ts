import { Controller, Get, Route, Query, Body, Post, Response, Tags } from 'tsoa';
import { GetReferrerData, CreateReferree } from '@the-coin/utilities/Referrals';
import { Timestamp } from '@the-coin/utilities/firestore';
import { BoolResponse } from '../types';
import { NewAccountReferal } from '@the-coin/types';

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
      const referrer = await GetReferrerData(referrerId);
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
  async referralCreate(@Body() referral: NewAccountReferal): Promise<BoolResponse> {
    try {
      var now = Timestamp.now();
      await CreateReferree(referral, now);
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
