import { getUserPreferences, getUserBasicData, setUserPreferences } from '@thecointech/broker-db';
// import { GetContract } from '../signer/Wallet';
import { getSigner } from '@thecointech/signers';
import { getEncryptionKey, type EncryptedBlob } from '@thecointech/account-details';

const MAX_BLOB_SIZE = 10 * 1024; // 10KB - details are a small JSON struct

// Blob failed validation (bad shape, oversized).  Maps to HTTP 400.
export class DetailsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DetailsValidationError";
  }
}

// The BrokerCAD encryption public key is needed to wrap KYC records.
// It is derived from a BrokerCAD signature (see getEncryptionKey), so is
// published via env var (generate with `yarn encKey` in libs/signers).
// If not set, derive it from the signer directly.
export async function getBrokerCADPubKey(): Promise<string> {
  if (process.env.WALLET_BrokerCAD_ENCKEY) {
    return process.env.WALLET_BrokerCAD_ENCKEY;
  }
  const key = await getEncryptionKey(await getSigner('BrokerCAD'));
  return key.compressedPublicKey;
}

// A user may store details if the broker already knows them
// (a User doc exists) or their account is funded.
async function isEligible(_address: string) {
  // This may prove valuable in the future, but for now we'll allow any account to store details.
  // It's necessary to allow an initial account to store it's name.
  return true;
  // const user = await getUserBasicData(address);
  // if (user) return true;
  // const contract = await GetContract();
  // const balance = await contract.balanceOf(address);
  // return balance > 0n;
}

export async function getDetails(address: string) {
  const [preferences, basic] = await Promise.all([
    getUserPreferences(address),
    getUserBasicData(address),
  ]);
  return {
    preferences: preferences?.blob,
    basic,
  };
}

export async function putDetails(address: string, blob: EncryptedBlob) {
  if (!await isEligible(address)) {
    throw new Error("Account is not eligible to store details");
  }
  if (blob.v !== 1 || !blob.cipher || !blob.iv || !blob.wrappedKeys) {
    throw new DetailsValidationError("Malformed details blob");
  }
  if (JSON.stringify(blob).length > MAX_BLOB_SIZE) {
    throw new DetailsValidationError("Details blob too large");
  }
  await setUserPreferences(address, blob);
}
