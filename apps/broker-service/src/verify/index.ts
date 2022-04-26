import { keccak256 } from '@ethersproject/solidity';
import { setUserVerified } from '@thecointech/broker-db/user';
import { getSigner } from '@thecointech/signers';
import { DateTime } from 'luxon';
import { BlockpassData, BlockpassPayload } from '../controllers/types';
import { fetchUser } from './blockpass';

//
// Called for every status update, allows us to pull user data from BP and store it locally
export async function updateUserVerification(payload: BlockpassPayload) {

  if (payload.status == "approved") {
    await uploadUserData(payload);
  }
  else {
    // Always update local status
    await setUserVerified(payload.refId, buildStatusUpdate(payload))
  }
}

// Clear cached data from server
export function deleteRawData(address: string) {
  return setUserVerified(address, {raw: null});
}

async function uploadUserData(payload: BlockpassPayload) {
  // first, pull the user data from Blockpass
  const data = await fetchUser(payload.refId);

  // What is the users uniqueID?
  const signer = await getSigner("BrokerTransferAssistant");
  const uniqueId = buildUniqueId(data);
  const signature = await signer.signMessage(uniqueId);

  // what data do we want to have here?
  setUserVerified(payload.refId, {
    raw: data,
    uniqueId,
    uniqueIdSig: signature,
    ...buildStatusUpdate(payload)
  })
  return true;
}


const buildUniqueId = ({identities}: BlockpassData) =>
  keccak256(
    ["string", "string", "string"],
    [identities.given_name, identities.family_name, identities.dob]
  );

const buildStatusUpdate = (payload: BlockpassPayload) => ({
  status: payload.status,
  statusUpdated: DateTime.now(),
  externalId: payload.recordId,
})
