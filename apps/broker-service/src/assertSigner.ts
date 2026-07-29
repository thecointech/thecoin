import { DateTime } from 'luxon';
import { log } from '@thecointech/logging';
import { SignatureError } from './errors';

const FiveMins = 5 * 60 * 1000;
// Small allowance for clock skew between client and server.
// Signatures timestamped further in the future than this are rejected outright.
const ClockSkewTolerance = 30 * 1000;

//
// Verify a signed timestamp is neither too old nor timestamped in the future.
// A signature timestamped in the future would remain "fresh" for longer than
// intended, weakening the replay-protection this check is meant to provide.
export function assertFresh(signedAt: DateTime, action: string, signer: string) {
  const now = DateTime.now();
  const ageMs = now.diff(signedAt).milliseconds; // positive => signedAt is in the past

  if (ageMs > FiveMins) {
    log.error(
      { signedAt, now, signer },
      `Signature too old for ${action}: {signedAt}, now: {now} - {signer}`
    );
    throw new SignatureError('Signature too old');
  }
  if (ageMs < -ClockSkewTolerance) {
    log.error(
      { signedAt, now, signer },
      `Signature timestamped in the future for ${action}: {signedAt}, now: {now} - {signer}`
    );
    throw new SignatureError('Signature timestamp is in the future');
  }
}

//
// Assert that the recovered signer matches the claimed user, and (optionally)
// that the signature was made recently. Throws SignatureError on failure.
export function assertSigner(user: string, signer: string, action: string, signedAt?: DateTime) {
  if (signer !== user) {
    log.error({ user, signer }, `Bad request from {user} to ${action}: signer does not match {signer}`);
    throw new SignatureError('Invalid signature');
  }
  if (signedAt) {
    assertFresh(signedAt, action, signer);
  }
}
