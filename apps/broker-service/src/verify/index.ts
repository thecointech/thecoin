import { keccak256 } from '@ethersproject/solidity';
import { setUserVerified } from '@thecointech/broker-db/user';
import { getSigner } from '@thecointech/signers';
import { sign } from '@thecointech/utilities/SignedMessages';
import { DateTime } from 'luxon';
import { BlockpassData, BlockpassPayload } from '../controllers/types';
import { fetchUser } from './blockpass';

//
// Called for every status update, allows us to pull user data from BP and store it locally
export async function updateUserVerification(payload: BlockpassPayload) {

  if (payload.status == "approved") {
    // first, pull the user data from Blockpass
    const data = await fetchUser(payload.refId);
    await uploadUserData(data);
  }
  else {
    // Always update local status
    await setUserVerified(payload.refId, {
      status: payload.status,
      statusUpdated: DateTime.now(),
      externalId: payload.recordId,
    })
  }
}

// Clear cached data from server
export function deleteRawData(address: string) {
  return setUserVerified(address, {
    status: "completed",
    raw: null
  });
}

export async function uploadUserData(data: BlockpassData) {
  // What is the users uniqueID?
  const signer = await getSigner("BrokerTransferAssistant");
  const uniqueId = buildUniqueId(data);
  const signature = await sign(uniqueId, signer);

  // what data do we want to have here?
  setUserVerified(data.refId, {
    raw: data,
    uniqueId,
    uniqueIdSig: signature,
    status: data.status,
    statusUpdated: DateTime.now(),
  })
  return true;
}


const buildUniqueId = ({identities}: BlockpassData) =>
  keccak256(
    ["string", "string", "string"],
    [identities.given_name, identities.family_name, identities.dob]
  );
