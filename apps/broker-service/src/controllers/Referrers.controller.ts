import { Controller, Get, Route, Query, Body, Post, Response } from 'tsoa';
import { GetReferrerData, CreateReferree } from '@the-coin/utilities/Referrals';
import { BoolResponse, NewAccountReferal } from '@the-coin/types';
import { Timestamp } from '@google-cloud/firestore';

@Route('referrers')
export class ReferrersController extends Controller {

  @Get('')
  async referrerValid(@Query() referrerId: string) : Promise<BoolResponse> {
    try {
      const referrer = await GetReferrerData(referrerId);
      return {
        success: !!referrer
      };
    }
    catch(err) {
      console.error(err);
      throw new Error('Server Error');
    }
  }

  @Response('400', 'Bad request')
  @Post()
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