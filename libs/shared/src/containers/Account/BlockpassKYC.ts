import { Signer } from '@ethersproject/abstract-signer';
import { AccountState, AccountDetails } from '@thecointech/account';
import { StatusApi, StatusType, UserVerificationApi } from '@thecointech/broker-cad';
import { SagaIterator } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { ActionsType, BaseSagaInterface } from '../../store/immerReducer';
import { IActions } from '../Account/types';
import { GetSignedMessage } from '@thecointech/utilities/SignedMessages';
import { log } from '@thecointech/logging';

const BrokerCADAddress = process.env.URL_SERVICE_BROKER;

type AccountActions = ActionsType<IActions & BaseSagaInterface<AccountState>>;

export async function getSignedTimestamp(signer: Signer) {
  const server = new StatusApi(undefined, BrokerCADAddress);
  const ts = await server.timestamp();
  return GetSignedMessage(ts.data.toString(), signer);
}

async function getCurrentStatus(signer: Signer) {
  const signed = await getSignedTimestamp(signer);
  const api = new UserVerificationApi(undefined, BrokerCADAddress);
  const r = await api.userVerifyStatus(signed.message, signed.signature);
  return r.data;
}

async function clearDetails(signer: Signer) {
  const signed = await getSignedTimestamp(signer);
  const api = new UserVerificationApi(undefined, BrokerCADAddress);
  await api.userDeleteRaw(signed.message, signed.signature);
}

const setDetails = (actions: AccountActions, details: AccountDetails) => put({
  type: actions.setDetails.type,
  payload: details
})

async function getVerifiedDetails(signer: Signer) : Promise<AccountDetails|null> {

  const signed = await getSignedTimestamp(signer);
  const api = new UserVerificationApi(undefined, BrokerCADAddress);
  const r = await api.userPullData(signed.message, signed.signature);
  if (r.data) {
    let data: AccountDetails = {
      statusUpdated: Date.now(),
      status: r.data.status,
      given_name: r.data.identities.given_name.value,
      family_name: r.data.identities.family_name.value,
      DOB: r.data.identities.family_name.value,
    }
    if (r.data.identities.email?.value) data.email = r.data.identities.email?.value;
    if (r.data.identities.phone?.value) data.phone = JSON.parse(r.data.identities.phone.value);
    if (r.data.identities.address?.value) data.phone = JSON.parse(r.data.identities.address.value);
    return data;
  }
  return null;
}

export function* checkCurrentStatus(actions: AccountActions, state: AccountState) : SagaIterator<string> {
  // If completed, there is nothing left to do
  if (state.details.status === "completed")
    return state.details.status;

  let status = yield call(getCurrentStatus, state.signer);

 // No status; bail
  if (!status)
    return status;

  // Now, is the data approved?
  if (status == 'approved') {
    // This is the only place we need to manually iterate our state
    log.info(`KYC approved, pulling data`);
    status = yield call(onApproved, actions, state);
  }
  if (status == 'completed') {
    // Complete means deleting server-side record
    log.info(`KYC completed, removing ss data`);
    yield call(onCompleted, actions, state);
  }
  else if (status != state.details.status) {
    log.trace(`Updating with new status: ${status}`)
    // Just remember what our latest status is
    yield setDetails(actions, {
      status,
      statusUpdated: Date.now(),
    });
  }
  return status;
}


// On approval, our data is sitting on TC servers
function* onApproved(actions: AccountActions, state: AccountState) : SagaIterator<string> {
  const newDetails = yield call(getVerifiedDetails, state.signer)
  if (newDetails) {
    yield setDetails(actions, newDetails);
  }
  return "completed";
}

// On approval, our data is sitting on TC servers
function* onCompleted(actions: AccountActions, state: AccountState) : SagaIterator<void> {
  yield call(clearDetails, state.signer)
  yield setDetails(actions, {status: StatusType.Completed});
}
