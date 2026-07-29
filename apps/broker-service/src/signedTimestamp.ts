import { DateTime } from 'luxon';
import { SignedMessage } from '@thecointech/types';
import { GetSigner } from '@thecointech/utilities/SignedMessages';
import { assertFresh } from './assertSigner';

//
// Check the packet to ensure it's valid
// Returns address of signer if successful
export async function getSigner(sm: SignedMessage) {
  const signer = await GetSigner(sm);

  // Message should be a timestamp, signed within the last 5 minutes
  const signedAt = DateTime.fromMillis(parseInt(sm.message));
  assertFresh(signedAt, 'verify signed timestamp', signer);

  return signer;
}
