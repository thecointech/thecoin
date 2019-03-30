import { GetConnected } from '@the-coin/utilities/lib/TheContract';
import {  Wallet, Contract } from 'ethers';
import { createActionCreators, ImmerReducer, createReducerFunction } from 'immer-reducer';
import { call, put } from 'redux-saga/effects';
import { ContainerState, DecryptCallback, IActions, Transaction } from './types';
import { Log } from 'ethers/providers';
import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';
import { CurrencyCodes } from '@the-coin/utilities/lib/CurrencyCodes';
import { ApplicationRootState } from 'types';
import { buildSagas } from './actions';
import { createAccountSelector } from './selector';
import { compose } from 'redux';

import { GetStored, SetStored } from  './storageSync'

const initialState: ContainerState = {
  name: "",
  wallet: null,
  contract: null,
  lastUpdate: 0,
  balance: -1,
  history: [],
  displayCurrency: CurrencyCodes.CAD
}

class AccountReducer extends ImmerReducer<ContainerState>
  implements IActions {

  setName(name: string) : void {
    this.draftState.name = name;
    // TODO: Renaming (once re-synced with website)
    this.draftState.wallet = GetStored(name);
  }

  setWallet(wallet: Wallet) {
    this.draftState.wallet = wallet;
    SetStored(this.state.name, wallet);
  }

  ///////////////////////////////////////////////////////////////////////////////////
  updateWithValues(newState: ContainerState) {
    Object.assign(this.draftState, newState);
  }

  ///////////////////////////////////////////////////////////////////////////////////
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

  ///////////////////////////////////////////////////////////////////////////////////
  // Register a transfer out (even though it might not yet be on the public blockchain)
  registerTransferOut(email: string, brokerAddress: string, value: number, fee: number, timestamp: number)
  {
    // const newTxs : Transaction[] = [
    //   {
    //     change: -value,
    //     date: new Date(timestamp),
    //     logEntry: email
    //   },
    //   {
    //     change: -fee,
    //     date: new Date(timestamp),
    //     logEntry: brokerAddress
    //   }  
    // ]
  }

  ///////////////////////////////////////////////////////////////////////////////////
  // Load account history and merge with local
  static mergeTransactions(history: Transaction[], moreHistory: Transaction[])
  {
    const uniqueItems = moreHistory.filter((tx) => !history.find((htx) => htx.date != tx.date))
    if (uniqueItems.length) {
      history = history.concat(uniqueItems);
      history.sort((tx1, tx2) => tx1.date.valueOf() - tx2.date.valueOf())  
    }
    return history;
  }

  static async toTransaction(to: boolean, ethersLog: Log, contract: Contract): Promise<Transaction> {
    const res = contract.interface.parseLog(ethersLog);
    const block = await contract.provider.getBlock(ethersLog.blockNumber!);
    return {
      date: new Date(block.timestamp * 1000),
      change: to ? res.values[2].toNumber() : -res.values[2].toNumber(),
      logEntry: `Transfer: ${to ? res.values[1] : res.values[0]}`
    }
  }

  static async readAndMergeTransfers(account: string, to: boolean, fromBlock: number, contract: Contract, history: Transaction[])
  {
    // construct filter to get tx either from or to
    const args = to ? [account, null] : [null, account];
    let filter: any = contract.filters.Transfer(...args);
    filter.fromBlock = fromBlock || 0;
    // Retrieve logs
    const txLogs = await contract.provider.getLogs(filter)
    // Convert logs to our transactions
    let txs: Transaction[] = [];
    for (let i = 0; i < txLogs.length; i++) {
      const tx = await AccountReducer.toTransaction(to, txLogs[i], contract);
      txs.push(tx);
    }
    // merge and remove duplicates for complete array
    return AccountReducer.mergeTransactions(history, txs);
  }

  static async loadAndMergeHistory(address: string, fromBlock: number, contract: Contract, history: Transaction[])
  {
    try {
      history = await AccountReducer.readAndMergeTransfers(address, true, fromBlock, contract, history);
      history = await AccountReducer.readAndMergeTransfers(address, false, fromBlock, contract, history);
    }
    catch(err) {
      console.error(err);
    }
    return history;
  }

  *updateHistory(from: Date, until: Date) {
    const { wallet, contract } = this.state;
    if (contract == null || wallet == null)
      return;
    if (this.state.historyStart && this.state.historyEnd)
    {
      if (from >= this.state.historyStart && until <= this.state.historyEnd)
        return;
    }
    
    yield put({
      type: AccountReducer.actions.updateWithValues.type,
      payload: [{
        historyLoading: true
      }]
    })

    // Lets not push ahead too quickly with this saga,
    // allow a 500 ms delay so we don't update too quickly
    //yield delay(250);
    console.log(`Updating from ${from} -> ${until}`);

    const address = wallet.address;
    const origHistory = this.state.history;
    const fromBlock = this.state.historyEndBlock;
    const newHistory = yield call(AccountReducer.loadAndMergeHistory, address, fromBlock, contract, origHistory)
    const currentBlock = yield call(contract.provider.getBlockNumber.bind(contract.provider))

    yield put({
      type: AccountReducer.actions.updateWithValues.type,
      payload: [{
        history: newHistory,
        historyLoading: false,
        historyStart: new Date(0),
        historyStartBlock: 0,
        historyEnd: new Date(),
        historyEndBlock: currentBlock
      }]
    });  
  }

  ///////////////////////////////////////////////////////////////////////////////////
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

  ///////////////////////////////////////////////////////////////////////////////////
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

  static actions: any; //ActionCreators<typeof AccountReducer>;
}

const reducerActions = createActionCreators(AccountReducer);
AccountReducer.actions = reducerActions;

// Optional reducer may be used to fill in any number of reducers
// TODO: Read up about splitting reducer into sub-components.
const reducer = createReducerFunction(AccountReducer, initialState);
function buildReducer<T>(key: keyof ApplicationRootState) {

  const withReducer =injectReducer<T>({
    key: key,
    reducer: reducer
  });

  const withSaga = injectSaga<T>({
    key: key,
    saga: buildSagas(createAccountSelector(key))
  });

  return compose(
    withReducer,
    withSaga,
  )
}

export { buildReducer, AccountReducer, reducerActions as actions, initialState };

