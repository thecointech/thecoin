import { computeAddress } from "ethers";
import { encryptObject, decryptObject } from "./crypto";
import { toSerializable, fromSerializable } from "./serialize";
import type { EncryptedBlob, UserPreferences } from "./types";

// Preferences are encrypted to the user only: the server stores them opaquely.
export function encryptPreferences(prefs: UserPreferences, userPubKey: string): Promise<EncryptedBlob> {
  return encryptObject(toSerializable(prefs), [{
    address: computeAddress(userPubKey),
    pubKey: userPubKey,
  }]);
}

export async function decryptPreferences(blob: EncryptedBlob, userPrivateKey: string): Promise<UserPreferences> {
  return fromSerializable(await decryptObject(blob, userPrivateKey)) as UserPreferences;
}
