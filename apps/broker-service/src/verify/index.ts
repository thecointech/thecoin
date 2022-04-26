import { setUserVerified } from '@thecointech/broker-db/user';
import { DateTime } from 'luxon';
import { BlockpassPayload } from '../blockpass';

//
// A very simple web-hook simply records the applicants status
export async function updateUserVerification(payload: BlockpassPayload) {

  // Our webhook does _not_ complete verification.  We simply update our local
  // status.  The verification is -only- complete once the user pulls their data
  // (through this API) into their local data-store.
  setUserVerified(payload.refId, {
    status: payload.status,
    statusUpdated: DateTime.now(),
    externalId: payload.recordId,
  })
}
