import { Controller, Route, Post, Response, Tags, BodyProp, Get, Query, Delete } from '@tsoa/runtime';
import { BlockpassData, BlockpassPayload } from './types';
import { IsValidAddress } from '@thecointech/utilities';
import { log } from '@thecointech/logging';
import { getUserData } from '@thecointech/broker-db/user';
import { getSigner } from '../signedTimestamp';
import { StatusType } from '@thecointech/broker-db/user.types';
import { deleteRawData, updateUserVerification } from '../verify';

@Route('verify')
@Tags('UserVerification')
export class VerifyController extends Controller {

  /**
  * Returns the current status for address
  **/
  @Get('/status')
  @Response('200', 'Verify Status')
  async userVerifyStatus(@Query() ts: string, @Query() sig: string) : Promise<StatusType|null> {
    const address = getSigner({message: ts, signature: sig});
    const user = await getUserData(address);
    return user?.status ?? null;
  }

  /**
   * Pull the users data from our local servers
   * @param ts ServerTimestamp
   * @param sig ts signed by user
   * @returns BlockpassData
   */
  @Get('/data')
  @Response('200', 'Verify Data')
  @Response('400', 'Invalid or Not Found')
  async userPullData(@Query() ts: string, @Query() sig: string) : Promise<BlockpassData|null> {
    const address = getSigner({message: ts, signature: sig});
    const user = await getUserData(address);
    return user?.raw ?? null;
  }

  /**
   * Delete raw data.  Called by the user once the raw data is safely
   * uploaded to 3DX
   * @param ts Timestamp
   * @param sig User signature of timestamp
   */
  @Delete()
  @Response('200', 'Raw Deleted')
  @Response('500', 'Server Error')
  async userDeleteRaw(@Query() ts: string, @Query() sig: string) {
    const address = getSigner({message: ts, signature: sig});
    await deleteRawData(address);
  }

  /**
  * Webhook called by Blockpass to update verification status
  **/
  @Post()
  @Response('200', 'Verification Webhook')
  @Response('500', 'Server Error')
  async updateStatus(@BodyProp() payload: BlockpassPayload) {
    log.debug({address: payload.refId, status: payload.status},
      `Recieved KYC status update {status} for address {address}`);

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
