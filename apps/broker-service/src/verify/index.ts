import { getUserBasicData, setUserBasicData } from '@thecointech/broker-db';
import { log } from '@thecointech/logging';
import { getSigner } from '@thecointech/signers';
import { sign } from '@thecointech/utilities/SignedMessages';
import { DateTime } from 'luxon';
import { BlockpassData, BlockpassPayload } from '../controllers/types';
import { fetchUser } from './blockpass';
import { buildUniqueId } from '@thecointech/utilities/Verify';
import { uploadAndStripImages } from './images';
import { getBrokerCADPubKey } from '../details';
import { encryptKyc } from '@thecointech/account-details';
import { addKycRecord } from '@thecointech/broker-db';

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
  await setUserBasicData(address, {
    uniqueIdSig,
    status: data.status,
    statusUpdated: DateTime.now(),
    referralStatus: existing?.referralCode ? "assigned" : "pending",
  })

  return true;
}

// Called when KYC completes: convert the (about to be deleted) raw
// verification data into an immutable record encrypted to BrokerCAD.
export async function storeKycRecord(address: string, data: BlockpassData) {
  if (!data?.identities) {
    log.warn({ address }, "Cannot store KYC record: no raw data for {address}");
    return false;
  }
  const brokerPub = await getBrokerCADPubKey();
  const blob = await encryptKyc(data, brokerPub);
  await addKycRecord(address, blob);
  log.info({ address }, "Stored KYC record for {address}");
  return true;
}
