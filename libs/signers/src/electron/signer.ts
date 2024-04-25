import type { IpcRenderer } from '@thecointech/electron-utils/types/ipc';
import type { BlockTag, FeeData, Provider, TransactionRequest, TransactionResponse } from "ethers";
import type { BigNumber } from "ethers";
import type { Bytes } from "ethers";
import type { Deferrable } from "ethers";
import type { AccountName } from '../names';
import { Signer } from 'ethers'
import { SIGNER_CHANNEL } from './types';
import { getProvider } from '@thecointech/ethers-provider';

export class ElectronSigner extends Signer {
  static _ipc: IpcRenderer;

  provider?: Provider | undefined;
  _ident: AccountName;

  constructor(ident: AccountName) {
    super();
    this._ident = ident;
    // Default provider
    this.provider = getProvider();
  }

  invoke(fn: string, ...args: any[]) : Promise<any> {
    return ElectronSigner._ipc.invoke(SIGNER_CHANNEL, this._ident, fn, args);
  }
  getAddress(): Promise<string> {
    return this.invoke('getAddress');
  }
  signMessage(message: string | Bytes): Promise<string> {
    return this.invoke('signMessage', message);
  }
  signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string> {
    return this.invoke('signTransaction', transaction)
  }
  connect(): Signer {
    throw new Error('Cannot re-connect Electron signer.');
  }
  getBalance(): Promise<BigNumber> {
    return this.invoke('getBalance');
  }
  getTransactionCount(blockTag?: BlockTag): Promise<number> {
    return this.invoke('getTransactionCount', blockTag);
  }
  estimateGas(transaction: Deferrable<TransactionRequest>): Promise<BigNumber> {
    return this.invoke('estimateGas', transaction);
  }
  call(transaction: Deferrable<TransactionRequest>, blockTag?: BlockTag): Promise<string> {
    return this.invoke('call', transaction, blockTag);
  }
  sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
    return this.invoke('sendTransaction', transaction);
  }
  getChainId(): Promise<number> {
    return this.invoke('getChainId');
  }
  getGasPrice(): Promise<BigNumber> {
    return this.invoke('getGasPrice');
  }
  getFeeData(): Promise<FeeData> {
    return this.invoke('getFeeData');
  }
  resolveName(name: string): Promise<string> {
    return this.invoke('resolveName', name);
  }
  populateTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionRequest> {
    return this.invoke('populateTransaction', transaction);
  }
}
