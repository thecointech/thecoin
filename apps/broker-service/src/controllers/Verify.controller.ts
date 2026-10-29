import { Controller, Route, Post, Response, Tags, Body, Get, Query, Request, Header  } from '@tsoa/runtime';
import { IsValidAddress } from '@thecointech/utilities';
import { log } from '@thecointech/logging';
import { getUserBasicData, type AllUserData } from '@thecointech/broker-db';
import { getSigner } from '../signedTimestamp';
import { updateUserVerification } from '../verify';
import { checkHeader } from '../verify/checkHeader';
import type { Request as ExpressRequest} from "express";
import type { BlockpassPayload } from './types';

@Route('verify')
@Tags('UserVerification')
export class VerifyController extends Controller {

  /**
   * Pull the users data from our local servers
   */
  @Get('/data')
  @Response('200', 'User Data')
  async userGetData(@Query() ts: string, @Query() sig: string) : Promise<AllUserData|undefined> {
    const address = await getSigner({message: ts, signature: sig});
    const user = await getUserBasicData(address);
    return user;
  }

  /**
  * Webhook called by Blockpass to update verification status
  **/
  @Post()
  // @Hidden() // Allow visibility to make mocking this easier
  @Response('200', 'Verification Webhook')
  async updateStatus(
    @Body() payload: BlockpassPayload,
    @Header('X-Hub-Signature') signature: string,
    @Request() request: ExpressRequest & { rawBody: Buffer})
  {
    const r = request.rawBody;

    log.debug({address: payload.refId, status: payload.status},
      `Recieved KYC status update {status} for address {address} with sginature: ${signature}`);

    if (!await checkHeader(signature, r)) {
      log.error(`HMAC Validation failed: ${signature} - ${r}`);
      this.setStatus(500);
      return;
    }
    if (!IsValidAddress(payload.refId)) {
      log.error({payload}, `Invalid refId passed: ${payload.refId} - {payload}`)
      this.setStatus(400);
      return;
    }

    await updateUserVerification(payload);

    log.debug({address: payload.refId}, `Recieved KYC status update completed for address {address}`);
    this.setStatus(200);
  }
}
