import { Controller, Route, Post, Response, Tags, Body, Get, Query, Delete, Request, Header  } from '@tsoa/runtime';
import { BlockpassData, BlockpassPayload } from './types';
import { IsValidAddress } from '@thecointech/utilities';
import { log } from '@thecointech/logging';
import { getUserData } from '@thecointech/broker-db/user';
import { getSigner } from '../signedTimestamp';
import { StatusType } from '@thecointech/broker-db/user.types';
import { deleteRawData, updateUserVerification } from '../verify';
import * as express from "express";
import { checkHeader } from '../verify/checkHeader';

@Route('verify')
@Tags('UserVerification')
export class VerifyController extends Controller {

  /**
   * Pull the users data from our local servers
   */
  @Get('/data')
  @Response('200', 'User Data')
  async userPullData(@Query() ts: string, @Query() sig: string) {
    const address = await getSigner({message: ts, signature: sig});
    const user = await getUserData(address);
    if (user?.raw) {
      return user.raw as BlockpassData;
    }
    return null;
  }

  /**
  * Returns the current status for address
  **/
  @Get('/status')
  @Response<StatusType|null>('200', 'Verify Status')
  async userVerifyStatus(@Query() ts: string, @Query() sig: string) {
    const address = await getSigner({ message: ts, signature: sig });
    const user = await getUserData(address);
    return user?.status ?? null;
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
  // @Hidden()
  @Response('200', 'Verification Webhook')
  async updateStatus(
    @Body() payload: BlockpassPayload,
    @Header('X-Hub-Signature') signature: string,
    @Request() request: express.Request & { rawBody: Buffer})
  {
    const header = this.getHeader("X-Hub-Signature") as string;
    const r = request.rawBody;

    log.debug({address: payload.refId, status: payload.status},
      `Recieved KYC status update {status} for address {address} with header: ${header}`);

    const headers = this.getHeaders();
    log.debug(`Headers: ${JSON.stringify(headers)} - Body: ${r}`);
    if (!checkHeader(signature, r)) {
      log.error(`HMAC Validation failed: ${header} - ${r}`);
      // this.setStatus(500);
      // return;
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
