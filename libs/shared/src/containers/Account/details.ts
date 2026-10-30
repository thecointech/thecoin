import { DateTime } from 'luxon';
import { GetDetailsApi, GetStatusApi } from '@thecointech/apis/broker';
import { GetSignedMessage } from '@thecointech/utilities/SignedMessages';
import { encryptPreferences, decryptPreferences, getEncryptionKey } from '@thecointech/account-details';
import { log } from '@thecointech/logging';
import type { Signer } from 'ethers';
import type { BasicDetails, EncryptedBlob, UserPreferences } from '@thecointech/account-details';

export async function getSignedTimestamp(signer: Signer) {
  const ts = await GetStatusApi().timestamp();
  return GetSignedMessage(ts.data.toString(), signer);
}

async function getRemoteDetails(signer: Signer) {
  const signed = await getSignedTimestamp(signer);
  const r = await GetDetailsApi().getDetails(signed.message, signed.signature);
  return r.data;
}

type RemoteBasic = Awaited<ReturnType<typeof getRemoteDetails>>["basic"];

// Convert from wire format.  No status means the broker doesn't know this user yet.
function toBasicDetails(basic: RemoteBasic): BasicDetails | undefined {
  if (!basic?.status) return undefined;
  return {
    status: basic.status,
    statusUpdated: DateTime.fromMillis(basic.statusUpdated ?? 0),
    referralCode: basic.referralCode,
    referralStatus: basic.referralStatus,
  };
}

export async function fetchBasicDetails(signer: Signer) {
  const { basic } = await getRemoteDetails(signer);
  return toBasicDetails(basic);
}

// Fetch all details.  Preferences are undefined if none are stored,
// or if they could not be decrypted (eg the user declined to sign).
// preferencesLoaded is true if we know the remote state (decrypted, or none stored).
export async function fetchDetails(signer: Signer) {
  const remote = await getRemoteDetails(signer);
  const preferences = await toPreferences(signer, remote.preferences);
  return {
    basic: toBasicDetails(remote.basic),
    preferences,
    preferencesLoaded: !remote.preferences || !!preferences,
  };
}
export type FetchedDetails = Awaited<ReturnType<typeof fetchDetails>>;

async function toPreferences(signer: Signer, preferences: EncryptedBlob | undefined): Promise<UserPreferences | undefined> {
  if (!preferences) return undefined;
  try {
    const key = await getEncryptionKey(signer);
    return await decryptPreferences(preferences, key.privateKey);
  }
  catch (err: any) {
    log.warn(err, "Cannot decrypt preferences");
    return undefined;
  }
}

// Encrypt (to the users own key) and upload preferences.
export async function uploadPreferences(signer: Signer, preferences: UserPreferences): Promise<boolean> {
  try {
    const key = await getEncryptionKey(signer);
    const blob = await encryptPreferences(preferences, key.compressedPublicKey);
    const signed = await getSignedTimestamp(signer);
    const r = await GetDetailsApi().putDetails(signed.message, signed.signature, blob);
    return r.data.success;
  }
  catch (err: any) {
    // 403: not eligible (unknown to broker & unfunded), 429: rate limited
    log.warn({ status: err?.response?.status }, "Failed to store preferences: {status}");
    return false;
  }
}
