import { computeAddress } from "ethers";
import { encryptObject, decryptObject } from "./crypto";
import { toSerializable, fromSerializable } from "./serialize";
import type { EncryptedBlob, UserPreferences } from "./types";

// The payload version lives inside the ciphertext: only the
// user's client ever interprets the shape of their preferences.
const PREFERENCES_VERSION = 1;
type PreferencesPayload = {
  version: typeof PREFERENCES_VERSION;
  preferences: UserPreferences;
}

// Preferences are encrypted to the user only: the server stores them opaquely.
export function encryptPreferences(prefs: UserPreferences, userPubKey: string): Promise<EncryptedBlob> {
  const payload: PreferencesPayload = { version: PREFERENCES_VERSION, preferences: prefs };
  return encryptObject(toSerializable(payload), [{
    address: computeAddress(userPubKey),
    pubKey: userPubKey,
  }]);
}

export async function decryptPreferences(blob: EncryptedBlob, userPrivateKey: string): Promise<UserPreferences> {
  const payload = fromSerializable(await decryptObject(blob, userPrivateKey)) as PreferencesPayload;
  if (payload?.version !== PREFERENCES_VERSION) {
    throw new Error(`Unsupported preferences version: ${payload?.version}`);
  }
  return payload.preferences;
}
