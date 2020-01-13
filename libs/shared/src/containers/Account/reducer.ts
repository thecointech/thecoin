import { InitialCoinBlock, ConnectContract } from '@the-coin/utilities/TheContract';
import { Wallet, Contract } from 'ethers';
import { call } from 'redux-saga/effects';
import { AccountState, DecryptCallback, IActions, Transaction, DefaultAccount, ACCOUNTS_KEY } from './types';
import { Log } from 'ethers/providers';
import { injectReducer, injectSaga, useInjectReducer, useInjectSaga } from "redux-injectors";
import { buildSagas, BindActions } from './actions';

import { GetStored, ReadAllAccounts, isWallet, StoreWallet, StoreSigner } from './storageSync'

import { actions as FxActions } from '../../containers/FxRate/reducer';
import { toHuman } from '@the-coin/utilities';
import { TheCoinReducer, GetNamedReducer, buildNamedDictionaryReducer } from '../../utils/immerReducer';
import { TheSigner } from '../../SignerIdent';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';

// The reducer for a single account state
export class AccountReducer extends TheCoinReducer<AccountState>
  implements IActions {

  setName(name: string): void {
    this.draftState.name = name;
    // If we don't yet have a wallet,
    // try and load under the new name
    if (!this.state.signer)
      this.draftState.signer = GetStored(name);
  }

  *setSigner(name:string, signer: TheSigner) {
    // We persist any signers passed here
    let liveWallet = false;
    if (isWallet(signer))
    {
      if(!signer.privateKey)
        StoreWallet(name, signer);
      else
        liveWallet = true
    }
    else 
    {
      StoreSigner(name, signer);
      liveWallet = !!signer.provider;
    }
    // Now the specifics are out of the way, 
    yield this.sendValues(this.actions().updateWithValues, {name, signer});
    if (liveWallet)
    {
      const contract = yield call(ConnectContract, signer);
      yield this.sendValues(this.actions().updateWithValues, {contract});
      // By default, update balance whenever we get a live account
      yield this.sendValues(this.actions().updateBalance, []);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////
  updateWithValues(newState: AccountState) {
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
  *decrypt(password: string, callback: DecryptCallback | undefined) {
    const { signer, name } = this.state;
    if (!signer) {
      throw (`Could not decrypt ${name} because it is not in local storage`);
    }
    if (!isWallet(signer)) {
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
      yield this.sendValues(this.actions().setSigner, [name, decrypted])
    }
    catch (error) {
      console.error(error);
      if (callback)
        callback(-1);
    }
  }
}

export const getAccountReducer = (name: string) =>
  GetNamedReducer(AccountReducer, name, DefaultAccount, ACCOUNTS_KEY);

export const useAccount = (name: string) => {
  
  const { actions } = getAccountReducer(name);
  useInjectSaga({ key: name, saga: buildSagas(name) });
  // Register an on-unload callback to remove the saga
  useEffect(() => {
    console.log("loading reducer for: " + name);
    return () => console.log("I've unloaded")
  });
  const dispatch = useDispatch();
  return BindActions(actions, dispatch);
}


export const createRootReducer = () =>
  buildNamedDictionaryReducer(ACCOUNTS_KEY, ReadAllAccounts())

export const useAccounts = () => {
  useInjectReducer({ key: ACCOUNTS_KEY, reducer: createRootReducer() });
}
  
export function injectRootReducer() {

  // First, create the root-level reducer.  This is a dictionary
  // that redirects all our child
  return injectReducer({
    key: ACCOUNTS_KEY,
    reducer: createRootReducer()
  });
}

export function injectSingleAccountReducer(key: string) {

  // Create a reducer for a single account.  It
  // is required that buildRootReducer is called before
  // attempting to create a single account reducer
  getAccountReducer(key);
  
  const withSaga = injectSaga({
    key: key,
    saga: buildSagas(key)
  });

  return withSaga;
}
