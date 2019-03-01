import { ImmerReducer, createActionCreators } from 'immer-reducer';
import { Wallet } from 'ethers';
import { call, put } from 'redux-saga/effects'
import { GetConnected } from '@the-coin/utilities/lib/TheContract';
import { ContainerState, IActions, DecryptCallback } from './types';

class AccountReducer extends ImmerReducer<ContainerState>
  implements IActions {

  static actions: any; //ActionCreators<typeof AccountReducer>;

  updateWithValues(newState: ContainerState) {
    Object.assign(this.draftState, newState);
  }

  // Get the balance of the account in Coin
  *updateBalance() {
    const { wallet, contract } = this.state;
    if (contract == null) {
      return;
    }
    try {
      const balance = yield call(contract.balanceOf, wallet.address);
      yield put({
        type: AccountReducer.actions.updateWithValues.type,
        payload: [{
          balance: 5000000 + balance.toNumber()
        }],
      });
      
    } catch (err) {
      console.error(err);
    }
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
        type: AccountReducer.actions.updateWithDecrypted.type,
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
AccountReducer.actions = reducerActions;

export { AccountReducer, reducerActions as actions }