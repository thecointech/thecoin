import type { IpcRenderer } from '@thecointech/electron-utils/types/ipc';
import type { Signer,BlockTag, FeeData, Provider, TransactionRequest, TransactionResponse, BytesLike, TransactionLike, TypedDataDomain, TypedDataField } from "ethers";
import type { AccountName } from '../names';
import { SIGNER_CHANNEL } from './types';
import { getProvider } from '@thecointech/ethers-provider';

export class ElectronSigner implements Signer {
  static _ipc: IpcRenderer;

  provider: Provider | null = null;
  _ident: AccountName;

  constructor(ident: AccountName) {
    this._ident = ident;
    // Default provider
    getProvider().then(p => this.provider = p);
  }

  invoke(fn: string, ...args: any[]) : Promise<any> {
    return ElectronSigner._ipc.invoke(SIGNER_CHANNEL, this._ident, fn, args);
  }

  getNonce(blockTag?: BlockTag | undefined): Promise<number> {
    return this.invoke('getNonce', blockTag);
  }
  populateCall(tx: TransactionRequest): Promise<TransactionLike<string>> {
    return this.invoke('populateCall', tx);
  }
  signTypedData(domain: TypedDataDomain, types: Record<string, TypedDataField[]>, value: Record<string, any>): Promise<string> {
    return this.invoke('signTypedData', domain, types, value);
  }
  getAddress(): Promise<string> {
    return this.invoke('getAddress');
  }
  signMessage(message: BytesLike): Promise<string> {
    return this.invoke('signMessage', message);
  }
  signTransaction(transaction: TransactionRequest): Promise<string> {
    return this.invoke('signTransaction', transaction)
  }
  connect(): Signer {
    throw new Error('Cannot re-connect Electron signer.');
  }
  getBalance(): Promise<BigInt> {
    return this.invoke('getBalance');
  }
  getTransactionCount(blockTag?: BlockTag): Promise<number> {
    return this.invoke('getTransactionCount', blockTag);
  }
  estimateGas(transaction: TransactionRequest): Promise<bigint> {
    return this.invoke('estimateGas', transaction);
  }
  call(transaction: TransactionRequest, blockTag?: BlockTag): Promise<string> {
    return this.invoke('call', transaction, blockTag);
  }
  sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse> {
    return this.invoke('sendTransaction', transaction);
  }
  getChainId(): Promise<number> {
    return this.invoke('getChainId');
  }
  getGasPrice(): Promise<BigInt> {
    return this.invoke('getGasPrice');
  }
  getFeeData(): Promise<FeeData> {
    return this.invoke('getFeeData');
  }
  resolveName(name: string): Promise<string> {
    return this.invoke('resolveName', name);
  }
  populateTransaction(transaction: TransactionRequest): Promise<TransactionLike<string>> {
    return this.invoke('populateTransaction', transaction);
  }
}
