import { GetConnected, InitialCoinBlock } from '@the-coin/utilities/lib/TheContract';
import { Wallet, Contract } from 'ethers';
import { call, put } from 'redux-saga/effects';
import { AccountState, DecryptCallback, IActions, Transaction, DefaultAccount, ACCOUNTS_KEY } from './types';
import { Log } from 'ethers/providers';
import injectReducer from '../../utils/injectReducer';
import injectSaga from '../../utils/injectSaga';
import { buildSagas } from './actions';
//import { createAccountSelector } from './selector';
import { compose } from 'redux';

import { GetStored, SetStored, ReadAllAccounts } from './storageSync'

import { actions as FxActions } from '../../containers/FxRate/reducer';
import { toHuman } from '@the-coin/utilities';
import { TheCoinReducer, GetNamedReducer, buildNamedDictionaryReducer } from '../../utils/immerReducer';

class AccountReducer extends TheCoinReducer<AccountState>
  implements IActions {

  setName(name: string): void {
    this.draftState.name = name;
    // If we don't yet have a wallet,
    // try and load under the new name
    if (!this.state.wallet)
      this.draftState.wallet = GetStored(name);
  }

  setWallet(name:string, wallet: Wallet) {
    this.draftState.name = name;
    this.draftState.wallet = wallet;
    SetStored(name, wallet);
  }

  ///////////////////////////////////////////////////////////////////////////////////
  updateWithValues(newState: AccountState) {
    Object.assign(this.draftState, newState);
  }

  ///////////////////////////////////////////////////////////////////////////////////
  // Get the balance of the account in Coin
  *updateBalance() {
    const { wallet, contract } = this.state;
    if (!contract || !wallet) {
      return;
    }
    try {
      const balance = yield call(contract.balanceOf, wallet.address);
      yield this.sendValues(this.actions().updateWithValues, { balance: balance.toNumber() });
    } catch (err) {
      console.error(err);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////
  // Load account history and merge with local
  static mergeTransactions(history: Transaction[], moreHistory: Transaction[]) {
    const uniqueItems = moreHistory.filter((tx) => !history.find((htx) => htx.txHash === tx.txHash))
    if (uniqueItems.length) {
      history = history.concat(uniqueItems);
      history.sort((tx1, tx2) => tx1.date.valueOf() - tx2.date.valueOf())
    }
    return history;
  }

  static async addAdditionalInfo(transaction: Transaction, toWallet: boolean, contract: Contract): Promise<boolean> {
    const { txHash } = transaction;
    if (!txHash)
      return false;

    // Parse out additional purchase/redeem info
    const txReceipt = await contract.provider.getTransactionReceipt(txHash);
    if (!txReceipt.logs)
      return false; 

    for (let i = 0; i < txReceipt.logs.length; i++) {
      const extra = contract.interface.parseLog(txReceipt.logs[i]);
      if (extra && extra.name == "Purchase") {
        const {balance, timestamp} = extra.values;
        transaction.date = new Date(timestamp.toNumber() * 1000);
        const change = toHuman(transaction.change, true);
        if (toWallet) {
          transaction.balance = balance.toNumber();
          transaction.logEntry = `Purchase: ${change}`
        }
        else {
          transaction.logEntry = `Sell: ${change}`
        }
        return true;
      }
    }
    return false;
  }

  static async transferToTransaction(toWallet: boolean, ethersLog: Log, contract: Contract): Promise<Transaction> {
    const res = contract.interface.parseLog(ethersLog);
    const {from, to, value} = res.values;
    var r = {
      txHash: ethersLog.transactionHash,
      date: new Date(),
      change: toWallet ? value.toNumber() : -value.toNumber(),
      logEntry: "---",
      balance: -1
    }

    if (!await AccountReducer.addAdditionalInfo(r, toWallet, contract))
    {
      const block = await contract.provider.getBlock(ethersLog.blockNumber!);
      r.date = new Date(block.timestamp * 1000)
      r.logEntry = `Transfer: ${toWallet ? from : to}`
    }
    return r;
  }

  static async readAndMergeTransfers(account: string, to: boolean, fromBlock: number, contract: Contract, history: Transaction[]) {
    // construct filter to get tx either from or to
    const args = to ? [null, account] : [account, null];
    let filter: any = contract.filters.Transfer(...args);
    filter.fromBlock = fromBlock || 0;

    // Retrieve logs
    const txLogs = await contract.provider.getLogs(filter)
    // Convert logs to our transactions
    let txs: Transaction[] = [];
    for (let i = 0; i < txLogs.length; i++) {
      const tx = await AccountReducer.transferToTransaction(to, txLogs[i], contract);
      txs.push(tx);
    }
    // merge and remove duplicates for complete array
    return AccountReducer.mergeTransactions(history, txs);
  }

  // static async purchaseToTransaction(account: string, ethersLog: Log, contract: Contract): Promise<Transaction> {
  //   const res = contract.interface.parseLog(ethersLog);
  //   const {purchaser, amount, balance, timestamp} = res.values;
  //   if (account != purchaser)
  //     return null;
  //   return {
  //     txHash: ethersLog.transactionHash,
  //     date: new Date(timestamp.toNumber() * 1000),
  //     change: amount.toNumber(),
  //     logEntry: `Purchase: ${amount.toNumber()}`,
  //     balance: balance.toNumber()
  //   }
  // }

  // static async readAndMergePurchases(account: string, fromBlock: number, contract: Contract, history: Transaction[]) {
  //   // construct filter to get tx either from or to
  //   let filter: any = contract.filters.Purchase();
  //   filter.fromBlock = fromBlock || 0;
  //   // Retrieve logs
  //   const txLogs = await contract.provider.getLogs(filter)
  //   // Convert logs to our transactions
  //   let txs: Transaction[] = [];
  //   for (let i = 0; i < txLogs.length; i++) {
  //     const tx = await AccountReducer.purchaseToTransaction(account, txLogs[i], contract);
  //     if (tx)
  //       txs.push(tx);
  //   }
  //   // merge and remove duplicates for complete array
  //   return AccountReducer.mergeTransactions(history, txs);
  // }

  static async loadAndMergeHistory(address: string, fromBlock: number, contract: Contract, history: Transaction[]) {
    try {
      //history = await AccountReducer.readAndMergePurchases(address, fromBlock, contract, history);
      history = await AccountReducer.readAndMergeTransfers(address, true, fromBlock, contract, history);
      history = await AccountReducer.readAndMergeTransfers(address, false, fromBlock, contract, history);
    }
    catch (err) {
      console.error(err);
    }
    return history;
  }

  static calculateTxBalances(currentBalance: number, history: Transaction[]) {
    var lastBalance = currentBalance;
    history.reverse().forEach(tx => {
      if (tx.balance >= 0) {
        if (lastBalance != tx.balance)
          console.error('Invalid balance detected: ', lastBalance, history, tx);
        lastBalance = tx.balance;
      }
      else {
        // tx balance records the balance after the action
        // is finished (so the last action records current balance)
        tx.balance = lastBalance;
      }
      lastBalance = lastBalance -= tx.change;
    });
  }

  *updateHistory(from: Date, until: Date) {
    const { wallet, contract } = this.state;
    if (contract == null || wallet == null)
      return;
    if (this.state.historyStart && this.state.historyEnd) {
      if (from >= this.state.historyStart && until <= this.state.historyEnd)
        return;
    }

    // First, fetch the account balance toasty-fresh
    const balance = yield call(contract.balanceOf, wallet.address);

    yield this.sendValues(this.actions().updateWithValues, { balance: balance.toNumber(), historyLoading: true });

    // Lets not push ahead too quickly with this saga,
    // allow a 500 ms delay so we don't update too quickly
    //yield delay(250);
    console.log(`Updating from ${from} -> ${until}`);

    const address = wallet.address;
    const origHistory = this.state.history;
    const fromBlock = this.state.historyEndBlock || InitialCoinBlock;
    // Retrieve transactions for all time
    const newHistory: Transaction[] = yield call(AccountReducer.loadAndMergeHistory, address, fromBlock, contract, origHistory);
    // Take current balance and use it plus Tx to reconstruct historical balances.
    AccountReducer.calculateTxBalances(balance, newHistory);
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
        type: this.actions().updateWithDecrypted.type,
        payload: decrypted
      });
    }
    catch (error) {
      console.error(error);
      if (callback)
        callback(-1);
    }
  }
}

function buildReducer<T>(key: string) {

  // Create the reducer
  GetNamedReducer(AccountReducer, key, DefaultAccount, ACCOUNTS_KEY);

  const withReducer = injectReducer<T>({
    key: ACCOUNTS_KEY,
    reducer: buildNamedDictionaryReducer(ACCOUNTS_KEY, ReadAllAccounts())
  });

  // Note, our saga requires us 
  const withSaga = injectSaga<T>({
    key: key,
    saga: buildSagas(key)
  });

  return compose(
    withReducer,
    withSaga,
  )
}

export { buildReducer, AccountReducer, ACCOUNTS_KEY };

