import { getUserBasicData, setUserBasicData, addKycRecord, getUsersWithUniqueIdSig, getCurrentKycRecord, finalizeKyc } from '@thecointech/broker-db';
import { log } from '@thecointech/logging';
import { getSigner } from '@thecointech/signers';
import { sign } from '@thecointech/utilities/SignedMessages';
import { DateTime } from 'luxon';
import type { BlockpassPayload } from '../controllers/types';
import { fetchUser } from '@thecointech/blockpass/fetch';
import { buildUniqueId } from '@thecointech/utilities/Verify';
import { uploadAndStripImages } from './images';
import { getBrokerCADPubKey } from '../details';
import { encryptKyc } from '@thecointech/account-details';
import type { BlockpassData, BlockpassStatus } from '@thecointech/blockpass/types';
import { SendMail } from '@thecointech/email';
import { IsValidAddress, NormalizeAddress } from '@thecointech/utilities';
import { KycStage, BasicDetails } from '@thecointech/account-details/types';

//
// Called for every status update, allows us to pull user data from BP and store it locally
export async function updateUserVerification(payload: BlockpassPayload) {
  const rawAddress = payload.refId;
  if (!IsValidAddress(rawAddress)) {
    log.error({refId: rawAddress, blockPassID: payload.blockPassID}, "Invalid address {refId} received in KYC for {blockPassID}");
    throw new Error(`Invalid address`);
  }
  const address = NormalizeAddress(rawAddress);
  log.info({address}, "Received Blockpass status update for {address}");

  if (payload.status == "approved") {
    try {
      // First, mark the user uploading.  If the uploadProcess
      // completes successfully, this status will be overwritten
      await setUserBasicData(address, {
        kycLock: "updating",
        kycUpdated: DateTime.now(),
      })
      // first, pull the user data from Blockpass
      const data = await fetchUser(address);
      await uploadUserData(address, data);
    }
    catch (e) {
      log.error({ err: e, address }, "Failed to update user verification");
      await setUserBasicData(address, {
        kycLock: "failed",
        kycUpdated: DateTime.now(),
      })
      throw e;
    }
  }
  else {
    // get current to check KYC stage
    const current = await getUserBasicData(payload.refId);
    // Always update local status
    const kycStage = kycStageFromBlockpassStatus(payload.status, current)
    await setUserBasicData(payload.refId, {
      blockpassStatus: payload.status,
      kycStage,
      kycUpdated: DateTime.now(),
    })
  }
}

export async function uploadUserData(address:string, data: BlockpassData) {
  log.trace({user: address}, "Uploading raw data for {user}");

  // We store the selfie/images on google cloud storage, because they
  // are too large to store in the DB.
  await uploadAndStripImages(data);
  log.info({ address }, "Uploaded and stripped images for user {address}");

  // Calculate a fingerprint for the user's identity
  const uniqueIdSig = await getUniqueIdSig(data);
  log.info({ address, uniqueIdSig }, "Calculated unique ID signature for user {address}");

  // Store the raw data before attempting any processing
  const record = await storeKycRecord(address, uniqueIdSig, data);
  log.info({ address }, "Stored KYC record for user {address}");

  // Wrap everything that follows in a transaction:
  // What is the users uniqueID?
  const existing = await getUserBasicData(address);
  const kycStage = await getNextKycStage(address, existing, uniqueIdSig);
  log.info({ address, kycStage }, "Moving user {address} to KYC stage {kycStage}");

  // On complete, update the accepted identity
  const acceptedIdentity = kycStage === "complete" ? {
      uniqueIdSig: uniqueIdSig!,
      ...record,
    } : undefined;

  // On complete, allow referral code to be generated
  const referralStep: BasicDetails = !existing?.referralCode && kycStage === "complete"
    ? { referralStatus: "pending" }
    // If a new update has rendered an existing "pending" status invalid, clear it
    : existing?.referralStatus === "pending"
      ? { referralStatus: undefined }
      : { };

  await finalizeKyc(address, {
      blockpassStatus: data.status,
      kycUpdated: DateTime.now(),
      kycStage,
      kycLock: "complete",
      ...referralStep
    },
    acceptedIdentity
  )

  return true;
}

async function getUniqueIdSig(data: BlockpassData): Promise<string | null> {
  // Assert we have the right layout in the raw data
  if (!data?.identities?.given_name?.value || !data.identities.family_name?.value || !data.identities.dob?.value) {
    log.error({ address: data.refId }, "Missing required identity fields in KYC for user {address}");
    // Do not log PII in production
    if (process.env.CONFIG_ENV !== "prod") {
      log.info({ data }, "Raw data for debugging");
    }
    return null;
  }

  const signer = await getSigner("BrokerTransferAssistant");
  const uniqueId = buildUniqueId({
    given_name: data.identities.given_name.value,
    family_name: data.identities.family_name.value,
    dob: data.identities.dob.value,
  });
  return await sign(uniqueId, signer);
}

// Once approved, check for any edge cases that might require in-coin review
async function getNextKycStage(address: string, existing: BasicDetails|undefined, uniqueIdSig: string|null): Promise<KycStage> {
  // Never overwrite a rejected or suspended status
  if (existing?.kycStage === "rejected" || existing?.kycStage === "suspended") {
    return existing.kycStage;
  }

  if (!uniqueIdSig) {
    return "reviewDataMissing";
  }

  // Check if the user has changed their identity
  const existingRecord = await getCurrentKycRecord(address);
  if (existingRecord && existingRecord.uniqueIdSig !== uniqueIdSig) {
    return "reviewIdentityChange";
  }

  // If we have a non-BP stage already, don't overwrite it.
  const BlockpassStages: KycStage[] = ["started", "reviewing", "approved"];
  if (existing?.kycStage && !BlockpassStages.includes(existing.kycStage)) {
    log.warn({ address, existingKycStage: existing.kycStage }, "Non-BP stage already set for KYC, not overwriting");
    return existing.kycStage;
  }

  // If the user is valid but there are duplicates, mark as review
  if (await findDuplicates(address, uniqueIdSig)) {
    return "reviewDuplicate";
  }
  // If everything passes, mark complete
  return "complete";
}

async function findDuplicates(address: string, uniqueIdSig: string) {
  const matchingAddresses = await getUsersWithUniqueIdSig(uniqueIdSig);
  const potentialDuplicates = matchingAddresses.filter(ma => ma != address);

  if (potentialDuplicates.length > 0) {
    // Email me!
    const dups = potentialDuplicates.join('\n')
    try {
      log.error({address}, `Duplicate Signatures found with user data for {address}, ${dups}`);
      await SendMail("Duplicate User Found", `Duplicate Signatures found with user data for ${address}, ${dups}`);
    }
    catch (e) {
      log.error({err: e, address}, "Failed to send duplicate user email");
    }
    return true;
  }
  return false;
}

// Called when KYC completes: convert the raw verification data
// into an immutable record encrypted to BrokerCAD.
export async function storeKycRecord(address: string, uniqueIdSig: string|null, data: BlockpassData) {
  const brokerPub = await getBrokerCADPubKey();
  const record = await encryptKyc(data, brokerPub);
  await addKycRecord(address, uniqueIdSig, record);
  log.info({ address }, "Stored KYC record for {address}");
  return record;
}


function kycStageFromBlockpassStatus(status: BlockpassStatus, current?: BasicDetails): KycStage {
  switch (current?.kycStage) {
    // Do not change these stages, they are final
    case "rejected":
    case "suspended":
      // Any review flag must be resolved by the user
    case "reviewDataMissing":
    case "reviewIdentityChange":
    case "reviewDuplicate":
      // A later update cannot undo completion
    case "complete":
      return current.kycStage;
  }
  switch (status) {
    case "started":
    case "incomplete":
      return 'started';
    case "waiting":
    case "inreview":
      return "reviewing";
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    default:
      log.error({ status }, "Unknown Blockpass status: {status}");
      // default to reviewing for safety
      return "reviewing";
  }
}

