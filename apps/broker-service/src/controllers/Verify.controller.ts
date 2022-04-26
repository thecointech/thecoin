import { Controller, Route, Put, Post, Response, Tags, BodyProp, Body } from '@tsoa/runtime';
import { BlockpassPayload } from '../blockpass/types';
import { IsValidAddress } from '@thecointech/utilities';
import { log } from '@thecointech/logging';
import { getUserData, setUserVerified } from '@thecointech/broker-db/user';
import { DateTime } from 'luxon';
import { getSigner } from '../signedTimestamp';
import { StatusType } from '@thecointech/broker-db/user.types';
import { SignedMessage } from '@thecointech/types';

@Route('verify')
@Tags('UserVerification')
export class VerifyController extends Controller {

  /**
  * Returns the current status for address
  * Signature must be
  *
  **/
  @Put()
  @Response('200', 'Verify Status')
  async userVerifyStatus(@Body() signed: SignedMessage) : Promise<StatusType> {
    try {
      const address = getSigner(signed);
      const user = await getUserData(address);
      return user?.status ?? "incomplete";
    }
    catch (err: any) {
      log.warn(`Error encountered: ${err.message}`)
    }
    // Always return incomplete
    return "incomplete"
  }

  /**
  *
  * Webhook called by Blockpass to update verification status
  *
  **/
  @Post()
  @Response('200', 'Verification Webhook')
  @Response('500', 'Server Error')
  async updateStatus(@BodyProp() payload: BlockpassPayload) {
    if (!IsValidAddress(payload.refId)) {
      log.error(`Invalid refId passed: ${payload.refId}`)
      this.setStatus(400);
      return;
    }

    // Our webhook does _not_ complete verification.  We simply update our local
    // status.  The verification is -only- complete once the user pulls their data
    // (through this API) into their local data-store.
    await setUserVerified(payload.refId, {
      status: payload.status,
      statusUpdated: DateTime.now(),
      externalId: payload.recordId,
    })
  }
}
