import { call } from '@redux-saga/core/effects';
import { DefaultAccountValues, type AccountState } from '@thecointech/account';
import type { Signer } from 'ethers';
import { DateTime } from 'luxon';
import { Account } from './reducer';
import { fetchDetails } from './details';
import type { Draft } from 'immer';

const address = '0x0000000000000000000000000000000000000001';
const Reducer = Account(address);

function getState(): AccountState {
  return {
    ...DefaultAccountValues,
    address,
    signer: {} as Signer,
    details: {
      basic: { kycStage: 'started', kycUpdated: DateTime.now() },
      preferences: { ...DefaultAccountValues.details.preferences, accountName: 'Local name' },
      preferencesLoaded: false,
    },
  };
}

it('loadDetails preserves local details and marks preferences unloaded when the broker fails', () => {
  const state = getState();
  state.details.preferencesLoaded = true;
  const reducer = new Reducer(state as unknown as Draft<AccountState>, state);
  const saga = reducer.loadDetails();

  expect(saga.next().value).toEqual(call(fetchDetails, state.signer!));
  expect(saga.throw(new Error('Broker unavailable')).value).toEqual(
    reducer.storeValues({ details: { ...state.details, preferencesLoaded: false } }),
  );
  expect(saga.next().done).toBe(true);
});

it('setPreferences saves local edits without uploading when the broker fetch fails', () => {
  const state = getState();
  const reducer = new Reducer(state as unknown as Draft<AccountState>, state);
  const saga = reducer.setPreferences({ accountName: 'Updated name' });

  expect(saga.next().value).toEqual(call(fetchDetails, state.signer!));
  const sync = saga.throw(new Error('Network unavailable'));
  expect(sync.done).toBe(false);
  expect(saga.next().value).toEqual(reducer.storeValues({
    details: {
      ...state.details,
      preferences: { ...state.details.preferences, accountName: 'Updated name' },
      preferencesLoaded: false,
    },
  }));
  expect(saga.next().done).toBe(true);
});
