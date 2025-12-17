import { Controller, Route, Post, Response, Tags, Body, Get, Query, Delete, Request, Header  } from '@tsoa/runtime';
import { IsValidAddress } from '@thecointech/utilities';
import { log } from '@thecointech/logging';
import { getUserData } from '@thecointech/broker-db/user';
import { getSigner } from '../signedTimestamp';
import { deleteRawData, updateUserVerification } from '../verify';
import { checkHeader } from '../verify/checkHeader';
import type { Request as ExpressRequest} from "express";
import type { BlockpassPayload, UserVerifyData } from './types';

@Route('verify')
@Tags('UserVerification')
export class VerifyController extends Controller {

  /**
   * Pull the users data from our local servers
   */
  @Get('/data')
  @Response('200', 'User Data')
  async userGetData(@Query() ts: string, @Query() sig: string) : Promise<UserVerifyData> {
    const address = await getSigner({message: ts, signature: sig});
    const user = await getUserData(address);

    return {
      status: user?.status,
      referralCode: user?.referralCode ?? undefined,
      raw: user?.raw,
      uniqueIdSig: user?.uniqueIdSig,
    }
  }

  /**
   * Delete raw data.  Called by the user once the raw data is safely
   * uploaded to 3DX
   * @param ts Timestamp
   * @param sig User signature of timestamp
   */
  @Delete()
  @Response('200', 'Raw Deleted')
  async userDeleteRaw(@Query() ts: string, @Query() sig: string) {
    const address = await getSigner({message: ts, signature: sig});
    await deleteRawData(address);
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
