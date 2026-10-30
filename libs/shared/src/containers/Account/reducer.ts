import { InitialCoinBlock, ContractCore, type TheCoin } from '@thecointech/contract-core';
import { Signer, Wallet, type Provider } from 'ethers';
import { call, delay, select, StrictEffect } from "@redux-saga/core/effects";
import { IsValidAddress, NormalizeAddress } from '@thecointech/utilities';
import { buildSagas } from './actions';
import { FxRateReducer } from '../../containers/FxRate/reducer';
import { SagaReducer } from '@thecointech/redux/immerReducer';
import { isLocal } from '@thecointech/signers';
import { loadAndMergeHistory, calculateTxBalances, mergeTransactions, Transaction } from '@thecointech/tx-blockchain';
import { AccountState, DefaultAccountValues, getAccountName } from '@thecointech/account';
import { setStoredAccountName } from '@thecointech/account/store';
import { DateTime } from 'luxon';
import { log } from '@thecointech/logging';
import { checkCurrentStatus, isKycComplete } from './BlockpassKYC';
import type { BasicDetails, UserPreferences } from '@thecointech/account-details';
import type { SagaIterator } from '@redux-saga/core';
import type { AccountMapStore } from '@thecointech/redux-accounts';
import type { DecryptCallback, IActions } from './types';
import type { Dictionary } from 'lodash';
import { getPluginDetails } from '@thecointech/contract-plugins';
import { getProvider } from '@thecointech/ethers-provider';
import { fetchDetails, uploadPreferences, type FetchedDetails } from './details';

// The account name is the only preference cached locally (so we can display
// locked accounts).  Keep that cache in sync when the name changes.
function syncStoredName(account: AccountState, preferences: UserPreferences) {
  const { accountName } = preferences;
  if (accountName && accountName !== account.details.preferences.accountName) {
    setStoredAccountName(account.address, accountName);
  }
}

const KycPollingInterval = (process.env.NODE_ENV === 'production')
  ? 5 * 60 * 1000 // 5 minutes
  : 5 * 1000; // 5 seconds

// The reducer for a single account state
function AccountReducer(address: string, initialState: AccountState) {
  const AccountReducer = class AccountReducer extends SagaReducer<IActions, AccountState>(address, initialState, buildSagas)
    implements IActions {

    *setName(name: string): SagaIterator {
      yield this.sendValues(this.actions.setPreferences, { accountName: name });
    }

    *setSigner(signer: Signer): Generator<StrictEffect, void, Provider> {
      const provider = yield call(getProvider);
      const connected = signer.connect(provider);
      yield this.storeValues({ signer: connected });
      yield delay(10);
      yield this.sendValues(this.actions.connect);
    }

    *connect(): Generator<StrictEffect, void, TheCoin&any[]> {
      // Load details last, so it
      yield this.sendValues(this.actions.loadDetails);

      const { signer } = this.state;

      // Connect to the contract
      const contract = yield call(ContractCore.connect, signer);
      const plugins = yield call(getPluginDetails, contract, signer);
      // store the contract prior to trying update history.
      yield this.storeValues({ contract, plugins });
      // Load history info by default
      yield this.sendValues(this.actions.updateHistory, DateTime.fromMillis(0), DateTime.now());
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // Save/load private details

    *loadDetails(): SagaIterator {
      const { signer } = this.state;
      if (!signer) return;
      const remote: FetchedDetails = yield call(fetchDetails, signer);
      const { basic, preferencesLoaded } = remote;
      // Remote preferences are canonical, local values fill any gaps
      const preferences = { ...this.state.details.preferences, ...remote.preferences };
      yield call(syncStoredName, this.state, preferences);
      yield this.storeValues({ details: { basic, preferences, preferencesLoaded } });

      // Nothing stored remotely yet: seed it with our local values (eg, account name)
      if (preferencesLoaded && !remote.preferences) {
        yield call(uploadPreferences, signer, preferences);
      }

      // If our details indicate we have started KYC but not completed it,
      // run a single check to see if it was finishd in our absence
      if (basic && !isKycComplete(basic)) {
        // Give storeValues a little time to complete.
        // Otherwise our check may be run before and overwrite the new status
        yield delay(500);
        // Check to see if we are done
        yield this.sendValues(this.actions.checkKycStatus);
      }
    };

    *setPreferences(newPreferences: Partial<UserPreferences>): SagaIterator {
      const { signer } = this.state;
      let { preferences, preferencesLoaded } = this.state.details;
      // Sync with remote before writing, so we never upload
      // stale/default values over the stored preferences
      if (!preferencesLoaded && signer) {
        const remote: FetchedDetails = yield call(fetchDetails, signer);
        if (remote.preferencesLoaded) {
          preferences = { ...preferences, ...remote.preferences };
          preferencesLoaded = true;
        }
      }
      preferences = { ...preferences, ...newPreferences };
      yield call(syncStoredName, this.state, preferences);
      yield this.storeValues({ details: { ...this.state.details, preferences, preferencesLoaded } });

      if (signer && preferencesLoaded) {
        yield call(uploadPreferences, signer, preferences);
      }
      else {
        log.warn("Remote preferences not loaded (no signer, or locked), changes will not be preserved");
      }
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // KYC processing

    *initKycProcess(): SagaIterator {
      log.info({address: this.state.address}, "Initializing KYC for {address}");
      if (!this.state.details.basic) {
        // Local-only until the broker receives a status from Blockpass
        yield this.storeValues({
          details: {
            ...this.state.details,
            basic: { status: "started", statusUpdated: DateTime.now() },
          }
        });
      }
      while (1) {
        // Trigger Check Saga.  This is an async call
        // and we cannot receive the return value here
        yield this.sendValues(this.actions.checkKycStatus);
        // Delay polling time then trime again
        yield delay(KycPollingInterval);
        const current: AccountState = yield select(AccountReducer.selector);
        log.trace({address: this.state.address}, `{address} polled KYC - current status: ${current.details.basic?.status}`);
        if (isKycComplete(current.details.basic))
          break;
      }
    }

    *checkKycStatus(forceVerify?: boolean): SagaIterator {
      const basic: BasicDetails | undefined = yield call(checkCurrentStatus, this.state, forceVerify);
      if (basic) {
        yield this.storeValues({ details: { ...this.state.details, basic } });
      }
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // Get the balance of the account in Coin
    *updateBalance(): SagaIterator {
      const { signer, address, contract } = this.state;
      if (!contract || !signer) {
        log.warn('Cannot update balance: missing contract or signer');
        return;
      }
      try {
        const balance = yield call(contract.balanceOf, address);
        yield this.storeValues({ balance: Number(balance) });
      } catch (err: any) {
        log.error(err, "Update balance failed")
      }
    }

    *updateHistory(from: DateTime, until: DateTime): SagaIterator {
      const { signer, contract, address } = this.state;
      if (contract === null || signer === null)
        return;

      const { historyStart, historyEnd } = this.state;
      if (historyStart && historyEnd) {
        if (from >= historyStart && until <= historyEnd)
          return;
      }

      // First, fetch the account balance toasty-fresh
      const balance = yield call(contract.balanceOf, address);
      yield this.storeValues({ balance: Number(balance), historyLoading: true });

      log.trace(`Updating from ${historyEnd ?? from} -> ${until}`);
      const oldHistory = this.state.history;
      const fromBlock = this.state.historyEndBlock || InitialCoinBlock;
      // Retrieve transactions for all time
      const newHistory: Transaction[] = yield call(loadAndMergeHistory, fromBlock, contract, address);
      // Take current balance and use it plus Tx to reconstruct historical balances.
      calculateTxBalances(balance, newHistory);
      // Get the current block (save it so we know where we were up to in the future.)
      const provider = contract.runner?.provider;
      const currentBlock = yield call(provider!.getBlockNumber.bind(provider))

      yield this.storeValues({
        history: mergeTransactions(oldHistory, newHistory),
        historyLoading: false,
        historyStart: from,
        historyStartBlock: 0,
        historyEnd: until,
        historyEndBlock: currentBlock
      });

      // Ensure we have fx value for each tx in this list
      log.trace({count: newHistory.length}, "Updating {count} FX values for new history");
      const txDates = newHistory.map(tx => tx.date.toJSDate());
      yield this.sendValues(FxRateReducer.actions.fetchRatesForDates, txDates);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    *decrypt(password: string, callback: DecryptCallback | undefined): SagaIterator {
      const { signer } = this.state;
      const name = getAccountName(this.state);
      if (!signer) {
        throw (`Could not decrypt ${name} because it is not in local storage`);
      }
      if (isLocal(signer)) {
        if (signer.privateKey)
          throw new Error(`Attempting decryption of already-decrypted wallet: ${name}`);
      }
      else {
        throw new Error(`Attempting to decrypt a non-wallet signer: ${name}`)
      }

      try {
        const cb = !callback ?
          undefined :
          (per: number) => {
            const percent = Math.floor(per * 100);
            return !callback(percent);
          }
        const decrypted = yield call(Wallet.fromEncryptedJson, JSON.stringify(signer), password, cb);
        // Ensure callback is called with 100% result so caller knows we are done
        log.trace("Account decrypted successfully");
        // Store the result
        yield this.sendValues(this.actions.setSigner, decrypted);
      }
      catch (error: any) {
        log.warn(error.message);
        if (callback)
          callback(-1);
      }
    }
  }

  AccountReducer.customName = address;
  AccountReducer.selector = (state: AccountMapStore) => state.accounts.map[address];
  return AccountReducer;
}


const reducerCache : Dictionary<ReturnType<typeof AccountReducer>> = {};
export function Account(address: string) {
  // In development mode, ensure we are only called with a legal address
  if (process.env.NODE_ENV !== "production") {
    if (!IsValidAddress(address)) {
      debugger;
      alert('Invalid adddress: Connect debugger and figure this out');
      throw new Error("Invalid Address passed to accountApi");
    }
    if (NormalizeAddress(address) != address) {
      debugger;
      alert('Connect debugger and figure this out');
      throw new Error("Un-normalized address being passed to accountApi");
    }
  }

  if (!reducerCache[address]) {
    const reducer = AccountReducer(address, { ...DefaultAccountValues, address } as any);
    reducer.initialize();
    reducerCache[address] = reducer;
  }
  return reducerCache[address];
}
