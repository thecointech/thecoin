import type { Invoker } from './types';
import type { Signer,BlockTag, FeeData, Provider, TransactionRequest, TransactionResponse, BytesLike, TransactionLike, TypedDataDomain, TypedDataField, Authorization, AuthorizationRequest } from "ethers";
import { getProvider } from '@thecointech/ethers-provider';

export class ElectronSigner implements Signer {
  static _ipc: Invoker|null = null;

  provider: Provider | null = null;
  _signerId: string;

  constructor(signerId: string) {
    this._signerId = signerId;
    // Default provider
    getProvider()
      .then(p => this.provider = p)
      .catch(err => console.error('Failed to initialize provider:', err));
  }

  invoke(fn: string, ...args: any[]): Promise<any> {
    if (!ElectronSigner._ipc) {
      throw new Error('ElectronSigner: invoke: ipcSigner not found.  Ensure preload is called');
    }
    return ElectronSigner._ipc.invoke(this._signerId, fn, ...args);
  }

  populateAuthorization(auth: AuthorizationRequest): Promise<AuthorizationRequest> {
    return this.invoke('populateAuthorization', auth);
  }
  authorize(authorization: AuthorizationRequest): Promise<Authorization> {
    return this.invoke('authorize', authorization);
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
  getBalance(): Promise<bigint> {
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
  getGasPrice(): Promise<bigint> {
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
