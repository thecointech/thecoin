import { InitialCoinBlock, ConnectContract, TheCoin } from '@thecointech/contract-core';
import { Signer, Wallet } from 'ethers';
import { call, StrictEffect } from 'redux-saga/effects';
import { IsValidAddress, NormalizeAddress } from '@thecointech/utilities';
import { DecryptCallback, IActions } from './types';
import { buildSagas } from './actions';
import { FxRateReducer } from '../../containers/FxRate/reducer';
import { SagaReducer } from '../../store/immerReducer';
import { isLocal } from '@thecointech/signers';
import { loadAndMergeHistory, calculateTxBalances, mergeTransactions, Transaction } from '@thecointech/tx-blockchain';
import { connectIDX } from '@thecointech/idx';
import { AccountDetails, AccountState, DefaultAccountValues } from '@thecointech/account';
import { loadDetails, setDetails } from '../AccountDetails';
import { DateTime } from 'luxon';
import { log } from '@thecointech/logging';
import { SagaIterator } from 'redux-saga';
import { Dictionary } from 'lodash';
import { AccountMapStore } from '../AccountMap';


// The reducer for a single account state
function AccountReducer(address: string, initialState: AccountState) {
  const AccountReducer = class AccountReducer extends SagaReducer<IActions, AccountState>(address, initialState, buildSagas)
    implements IActions {

    setName(name: string): void {
      this.draftState.name = name;
    }

    *setSigner(signer: Signer) {
      yield this.storeValues({ signer });
      yield this.sendValues(this.actions.connect);
    }

    *connect(): Generator<StrictEffect, void, TheCoin> {
      // Load details last, so it
      yield this.sendValues(this.actions.loadDetails);

      const { signer } = this.state;
      // Connect to the contract
      const contract = yield call(ConnectContract, signer);
      // store the contract prior to trying update history.
      yield this.storeValues({ contract });
      // Load history info by default
      yield this.sendValues(this.actions.updateHistory, [DateTime.fromMillis(0), DateTime.now()]);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // Save/load private details
    *getIDX() {
      let idx = this.state.idx;
      if (!idx) {
        idx = yield call(connectIDX, this.state.signer);
        yield this.storeValues({ idx, idxIO: true });
      }
      return idx;
    }

    *loadDetails(): SagaIterator {
      // Connect to IDX
      const idx = yield* this.getIDX()
      if (idx) {
        yield this.storeValues({ idx, idxIO: true });
        log.trace("IDX: Restoring account details");
        const payload = yield call(loadDetails, idx);
        const details = payload?.data || DefaultAccountValues.details;
        log.trace("IDX: read complete");
        yield this.storeValues({ details, idxIO: false });
      }
      else {
        log.warn("No IDX connection present, details may not be loaded correctly");
      }
    };

    *setDetails(newDetails: Partial<AccountDetails>) {
      const details = {
        ...this.state.details,
        ...newDetails,
      }
      yield this.storeValues({ details, idxIO: true });
      if (this.state.idx) {
        log.trace("IDX: persisting account details");
        yield call(setDetails, this.state.idx, details);
        log.debug("IDX: account details write complete");
        yield this.storeValues({ idxIO: false });
      }
      else {
        log.error("No IDX connection present, changes will not be preserved");
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
        yield this.storeValues({ balance: balance.toNumber() });
      } catch (err) {
        console.error(err);
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
      yield this.storeValues({ balance: balance.toNumber(), historyLoading: true });

      log.trace(`Updating from ${from} -> ${until}`);
      const oldHistory = this.state.history;
      const fromBlock = this.state.historyEndBlock || InitialCoinBlock;
      // Retrieve transactions for all time
      const newHistory: Transaction[] = yield call(loadAndMergeHistory, address, fromBlock, contract);
      // Take current balance and use it plus Tx to reconstruct historical balances.
      calculateTxBalances(balance, newHistory);
      // Get the current block (save it so we know where we were up to in the future.)
      const currentBlock = yield call(contract.provider.getBlockNumber.bind(contract.provider))

      yield this.storeValues({
        history: mergeTransactions(oldHistory, newHistory),
        historyLoading: false,
        historyStart: from,
        historyStartBlock: 0,
        historyEnd: until,
        historyEndBlock: currentBlock
      });

      // Ensure we have fx value for each tx in this list
      for (var i = 0; i < newHistory.length; i++) {
        yield this.sendValues(FxRateReducer.actions.fetchRateAtDate, newHistory[i].date.toJSDate());
      }
    }

    ///////////////////////////////////////////////////////////////////////////////////
    *decrypt(password: string, callback: DecryptCallback | undefined): SagaIterator {
      const { signer, name } = this.state;
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
        if (callback) {
          callback(1);
        }
        // Store the result
        yield this.sendValues(this.actions.setSigner, [decrypted]);
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
    const reducer = AccountReducer(address, {} as any);
    reducer.initialize();
    reducerCache[address] = reducer;
  }
  return reducerCache[address];
}
