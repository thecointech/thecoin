import { getUserBasicData, setUserBasicData, addKycRecord } from '@thecointech/broker-db';
import { log } from '@thecointech/logging';
import { getSigner } from '@thecointech/signers';
import { sign } from '@thecointech/utilities/SignedMessages';
import { DateTime } from 'luxon';
import { BlockpassPayload } from '../controllers/types';
import { fetchUser } from './blockpass';
import { buildUniqueId } from '@thecointech/utilities/Verify';
import { uploadAndStripImages } from './images';
import { getBrokerCADPubKey } from '../details';
import { encryptKyc, BlockpassData } from '@thecointech/account-details';

//
// Called for every status update, allows us to pull user data from BP and store it locally
export async function updateUserVerification(payload: BlockpassPayload) {
  if (payload.status == "approved") {
    // first, pull the user data from Blockpass
    const data = await fetchUser(payload.refId);
    await uploadUserData(payload.refId, data);
  }
  else {
    // Always update local status
    await setUserBasicData(payload.refId, {
      status: payload.status,
      statusUpdated: DateTime.now(),
    })
  }
}

export async function uploadUserData(address:string, data: BlockpassData) {
  log.trace({user: address}, "Uploading raw data for {user}");

  // Assert we have the right layout (to verify)
  if (!data?.identities?.given_name?.value || !data.identities.family_name?.value || !data.identities.dob?.value) {
    throw new Error(`Incomplete Blockpass data for ${address}`);
  }

  // What is the users uniqueID?
  const signer = await getSigner("BrokerTransferAssistant");
  const uniqueId = buildUniqueId({
    given_name: data.identities.given_name.value,
    family_name: data.identities.family_name.value,
    DOB: data.identities.dob.value,
  });
  const uniqueIdSig = await sign(uniqueId, signer);

  // We store the selfie/images on google cloud storage, because they
  // are too large to store in the DB.
  await uploadAndStripImages(data);

  await storeKycRecord(address, data);

  // what data do we want to have here?
  // Does this user already have a referral code?
  const existing = await getUserBasicData(address);
  const referralStatus = (
    existing?.referralStatus ??
    (existing?.referralCode
      ? "assigned"
      : "pending")
  );
  await setUserBasicData(address, {
    uniqueIdSig,
    status: data.status,
    statusUpdated: DateTime.now(),
    referralStatus,
  })

  return true;
}

// Called when KYC completes: convert the (about to be deleted) raw
// verification data into an immutable record encrypted to BrokerCAD.
export async function storeKycRecord(address: string, data: BlockpassData) {
  if (!data?.identities) {
    log.error({ address }, "Attempted to store KYC record with no raw data for {address}");
    return;
  }
  const brokerPub = await getBrokerCADPubKey();
  const blob = await encryptKyc(data, brokerPub);
  await addKycRecord(address, {
    provider: "blockpass",
    version: 1,
    data: blob,
  });
  log.info({ address }, "Stored KYC record for {address}");
}
