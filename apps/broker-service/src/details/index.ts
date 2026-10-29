import { getUserPreferences, getUserBasicData, setUserPreferences } from '@thecointech/broker-db';
import { GetContract } from '../signer/Wallet';
import { getSigner } from '@thecointech/signers';
import type { Wallet } from 'ethers';
import type { EncryptedBlob } from '@thecointech/account-details';

const MAX_BLOB_SIZE = 10 * 1024; // 10KB - details are a small JSON struct

// The broker public key is needed to wrap KYC records.  The address alone
// cannot yield it (hash), so it's published via env var.  In dev we can
// pull it from the local signer.
export async function getBrokerCADPubKey(): Promise<string> {
  if (process.env.WALLET_BrokerCAD_PUBKEY) {
    return process.env.WALLET_BrokerCAD_PUBKEY;
  }
  const brokerCad = await getSigner('BrokerCAD');
  return (brokerCad as Wallet).signingKey.compressedPublicKey;
}

// A user may store details if the broker already knows them
// (a User doc exists) or their account is funded.
async function isEligible(address: string) {
  const user = await getUserBasicData(address);
  if (user) return true;
  const contract = await GetContract();
  const balance = await contract.balanceOf(address);
  return balance > 0n;
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
    throw new Error("Malformed details blob");
  }
  if (JSON.stringify(blob).length > MAX_BLOB_SIZE) {
    throw new Error("Details blob too large");
  }
  await setUserPreferences(address, blob);
}
