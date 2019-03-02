import { GetConnected } from '@the-coin/utilities/lib/TheContract';
import {  Wallet, Contract } from 'ethers';
import { createActionCreators, ImmerReducer } from 'immer-reducer';
import { call, put } from 'redux-saga/effects';
import { ContainerState, DecryptCallback, IActions, Transaction } from './types';
import { Log } from 'ethers/providers';

class AccountReducer extends ImmerReducer<ContainerState>
  implements IActions {

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

  static async readAndMergeTransfers(account: string, to: boolean, contract: Contract, history: Transaction[])
  {
    // construct filter to get tx either from or to
    const args = to ? [account, null] : [null, account];
    let filter: any = contract.filters.Transfer(...args);
    filter.fromBlock = 0;
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

  static async loadAndMergeHistory(address: string, contract: Contract, history: Transaction[])
  {
    try {
      history = await AccountReducer.readAndMergeTransfers(address, true, contract, history);
      history = await AccountReducer.readAndMergeTransfers(address, false, contract, history);
    }
    catch(err) {
      console.error(err);
    }
    return history;
  }

  *updateHistory(from: Date, until: Date) {
    console.log(`Updating from ${from} -> ${until}`);
    const { wallet, contract } = this.state;
    if (contract == null || wallet == null)
      return;
      
    const address = "0x8B40D01D2bcFFef5CF3441a8197cD33e9eD6e836";
    const origHistory = this.state.history;
    const newHistory = yield call(AccountReducer.loadAndMergeHistory, address, contract, origHistory)
    if (newHistory != origHistory) {
      newHistory.forEach(console.log);
      yield put({
        type: AccountReducer.actions.updateWithValues.type,
        payload: [{
          history: newHistory
        }]
      });  
    }
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

export { AccountReducer, reducerActions as actions };

