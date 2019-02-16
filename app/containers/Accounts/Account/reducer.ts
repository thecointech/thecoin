import { ImmerReducer, createActionCreators } from 'immer-reducer';
import { Wallet } from 'ethers';
import { call, put } from 'redux-saga/effects'
import { GetConnected } from '@the-coin/utilities/lib/TheContract';

import { ContainerState, IActions, DecryptCallback } from './types';

let updateWithDecryptedTypeString = "";

class AccountReducer extends ImmerReducer<ContainerState>
  implements IActions {

  // Get the balance of the account in Coin
  updateBalance() {

  }

  updateHistory(from: Date, until: Date) {

  }

  updateWithDecrypted(wallet: Wallet) {
    if (!wallet.privateKey) {
      throw ("Giant Hoohoo - encrypted wallet passed to updateWithDecrypted");
    }
    this.draftState.wallet = wallet;
    const contract = GetConnected(wallet);
    if (contract) {
      this.draftState.contract = contract;
    }
  }

  // The below is a saga function
  *decrypt(password: string, callback: DecryptCallback | undefined) {
    const { wallet } = this.state;
    if (!wallet) {
      throw (`Could not decrypt ${name} because it is not in local storage`);
    }
    if (wallet.privateKey) {
      console.error(`Attempting decryption of already-decrypted wallet: ${name}`);
      return;
    }

    try {
      const cb = !callback ?
        undefined :
        (per: number) => {
          const percent = Math.floor(per * 100);
          if (!callback(percent)) {
            throw ("Operation cancelled");
          }
        }
      const decrypted = yield call(Wallet.fromEncryptedJson, JSON.stringify(wallet), password, cb);
      // Ensure callback is called with 100% result so caller knows we are done
      console.log("Account decrypted successfully");
      if (callback) {
        callback(1);
      }
      yield put({
        type: updateWithDecryptedTypeString,
        payload: [decrypted]
      });
    }
    catch (error) {
      console.error(error);
      if (callback)
        callback(-1);
    }
  }
}

const reducerActions = createActionCreators(AccountReducer);
updateWithDecryptedTypeString = reducerActions.updateWithDecrypted.type;

export { AccountReducer, reducerActions as actions }