import { Signer } from '@ethersproject/abstract-signer';
import { AccountState, AccountDetails } from '@thecointech/account';
import { GetStatusApi, StatusType, GetUserVerificationApi, UserVerifyData } from '@thecointech/apis/broker';
import { SagaIterator } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { ActionsType, BaseSagaInterface } from '../../store/immerReducer.js';
import { IActions } from '../Account/types.js';
import { GetSignedMessage } from '@thecointech/utilities/SignedMessages';
import { log } from '@thecointech/logging';

type AccountActions = ActionsType<IActions & BaseSagaInterface<AccountState>>;

export async function getSignedTimestamp(signer: Signer) {
  const ts = await GetStatusApi().timestamp();
  return GetSignedMessage(ts.data.toString(), signer);
}

async function getUserData(signer: Signer) {
  const signed = await getSignedTimestamp(signer);
  const api = GetUserVerificationApi();
  const r = await api.userGetData(signed.message, signed.signature);
  return r.data;
}

async function clearDetails(signer: Signer) {
  const signed = await getSignedTimestamp(signer);
  const api = GetUserVerificationApi();
  await api.userDeleteRaw(signed.message, signed.signature);
}

const setDetails = (actions: AccountActions, details: AccountDetails) => put({
  type: actions.setDetails.type,
  payload: details
})

function convertRawDetails(user: UserVerifyData) : AccountDetails|null {
  const { raw, referralCode } = user;
  if (!raw) return null;

  let data: AccountDetails = {
    referralCode,
    statusUpdated: Date.now(),
    status: user.status,
    given_name: raw.identities.given_name.value,
    family_name: raw.identities.family_name.value,
    DOB: raw.identities.family_name.value,
  }
  if (raw.identities.email?.value) data.email = raw.identities.email?.value;
  if (raw.identities.phone?.value) data.phone = JSON.parse(raw.identities.phone.value);
  if (raw.identities.address?.value) data.phone = JSON.parse(raw.identities.address.value);
  return data;
}

export function* checkCurrentStatus(actions: AccountActions, state: AccountState) : SagaIterator<string> {
  // If completed, there is nothing left to do
  if (state.details.status === "completed" && state.details.referralCode)
    return state.details.status;

  let user = yield call(getUserData, state.signer);

 // No status; bail
  if (!user.status)
    return user.status;

  // Now, is the data approved?
  if (user.status == 'approved') {
    // This is the only place we need to manually iterate our state
    log.info(`KYC approved, storing data`);
    const newDetails = convertRawDetails(user);
    if (newDetails) {
      yield setDetails(actions, newDetails);

      if (newDetails.referralCode) {
        user.status = "completed";
      }
    }
  }
  if (user.status == 'completed') {
    // Complete means deleting server-side record
    log.info(`KYC completed, removing ss data`);
    yield call(clearDetails, state.signer)
    yield setDetails(actions, {status: StatusType.Completed});
  }

  else if (user.status != state.details.status) {
    log.trace(`Updating with new status: ${status}`)
    // Just remember what our latest status is
    yield setDetails(actions, {
      status: user.status,
      statusUpdated: Date.now(),
    });
  }
  return user.status;
}
