import { InitialCoinBlock, ConnectContract } from '@the-coin/utilities/TheContract';
import { Wallet } from 'ethers';
import { call } from 'redux-saga/effects';
import { useInjectSaga } from "redux-injectors";
import { IsValidAddress, NormalizeAddress } from '@the-coin/utilities';
import { useDispatch } from 'react-redux';
import { AccountState, DecryptCallback, IActions, Transaction } from './types';
import { buildSagas, bindActions } from './actions';
import { actions as FxActions } from '../../containers/FxRate/reducer';
import { TheCoinReducer, GetNamedReducer } from '../../utils/immerReducer';
import { isSigner, TheSigner } from '../../SignerIdent';
import { ACCOUNTMAP_KEY } from '../AccountMap';
import { loadAndMergeHistory, calculateTxBalances } from './history';


// The reducer for a single account state
export class AccountReducer extends TheCoinReducer<AccountState>
  implements IActions {

  setName(name: string): void {
    this.draftState.name = name;
  }

  *setSigner(signer: TheSigner) {
    // Connect to the contract
    const contract = yield call(ConnectContract, signer);
    yield this.storeValues({
      signer,
      contract
    });
    yield this.sendValues(this.actions().updateBalance, []);
  }

  ///////////////////////////////////////////////////////////////////////////////////
  updateWithValues(newState: Partial<AccountState>) {
    Object.assign(this.draftState, newState);
  }

  ///////////////////////////////////////////////////////////////////////////////////
  // Get the balance of the account in Coin
  *updateBalance() {
    const { signer, contract } = this.state;
    if (!contract || !signer) {
      return;
    }
    try {
      const { address }= signer;
      const balance = yield call(contract.balanceOf, address);
      yield this.sendValues(this.actions().updateWithValues, { balance: balance.toNumber() });
    } catch (err) {
      console.error(err);
    }
  }

  *updateHistory(from: Date, until: Date) {
    const { signer, contract } = this.state;
    if (contract === null || signer === null)
      return;
    if (this.state.historyStart && this.state.historyEnd) {
      if (from >= this.state.historyStart && until <= this.state.historyEnd)
        return;
    }

    // First, fetch the account balance toasty-fresh
    const address = yield call(signer.getAddress.bind(signer));
    const balance = yield call(contract.balanceOf, address);

    yield this.sendValues(this.actions().updateWithValues, { balance: balance.toNumber(), historyLoading: true });

    // Lets not push ahead too quickly with this saga,
    // allow a 500 ms delay so we don't update too quickly
    //yield delay(250);
    console.log(`Updating from ${from} -> ${until}`);

    const origHistory = this.state.history;
    const fromBlock = this.state.historyEndBlock || InitialCoinBlock;
    // Retrieve transactions for all time
    const newHistory: Transaction[] = yield call(loadAndMergeHistory, address, fromBlock, contract, origHistory);
    // Take current balance and use it plus Tx to reconstruct historical balances.
    calculateTxBalances(balance, newHistory);
    // Get the current block (save it so we know where we were up to in the future.)
    const currentBlock = yield call(contract.provider.getBlockNumber.bind(contract.provider))

    yield this.sendValues(this.actions().updateWithValues, {
      history: newHistory,
      historyLoading: false,
      historyStart: new Date(0),
      historyStartBlock: 0,
      historyEnd: new Date(),
      historyEndBlock: currentBlock
    });

    // Ensure we have fx value for each tx in this list
    for (var i = 0; i < newHistory.length; i++)
    {
      yield this.sendValues(FxActions.fetchRateAtDate, newHistory[i].date);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////
  *decrypt(password: string, callback: DecryptCallback | undefined) {
    const { signer, name } = this.state;
    if (!signer) {
      throw (`Could not decrypt ${name} because it is not in local storage`);
    }
    if (isSigner(signer)) {
      throw new Error(`Attempting to decrypt a non-wallet signer: ${name}`)
    }
    if (signer.privateKey) {
      throw new Error(`Attempting decryption of already-decrypted wallet: ${name}`);
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
      const decrypted = yield call(Wallet.fromEncryptedJson, JSON.stringify(signer), password, cb);
      // Ensure callback is called with 100% result so caller knows we are done
      console.log("Account decrypted successfully");
      if (callback) {
        callback(1);
      }

      // Connect to the contract
      //const contract = yield call(ConnectContract, decrypted);
      // Store the live data
      //yield this.storeValues({contract, signer: decrypted})
      // Now, update balance
      yield this.sendValues(this.actions().setSigner, [decrypted]);
    }
    catch (error) {
      console.error(error);
      if (callback)
        callback(-1);
    }
  }
}

export const getAccountReducer = (address: string) => {

  // In development mode, ensure we are only called with a legal address
  if (process.env.NODE_ENV !== "production") {
    if (!IsValidAddress(address)) {
      alert('Connect debugger and figure this out');
      throw new Error("Invalid Address passed to accountApi");
    }
    if (NormalizeAddress(address) != address) {
      alert('Connect debugger and figure this out');
      throw new Error("Un-normalized address being passed to accountApi");
    }
  }

  return GetNamedReducer(AccountReducer, address, {}, ACCOUNTMAP_KEY);
}

export const useAccountApi = (address: string) => {

  const { actions } = getAccountReducer(address);
  useInjectSaga({ key: address, saga: buildSagas(address) });
  const dispatch = useDispatch();
  return bindActions(actions, dispatch);
}
