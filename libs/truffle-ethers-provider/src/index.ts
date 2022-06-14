import ProviderEngine from "web3-provider-engine";
// @ts-ignore - web3-provider-engine doesn't have declaration files for these subproviders
import FiltersSubprovider from "web3-provider-engine/subproviders/filters";
// @ts-ignore
import NonceSubProvider from "web3-provider-engine/subproviders/nonce-tracker";
// @ts-ignore
import HookedSubprovider from "web3-provider-engine/subproviders/hooked-wallet";
// @ts-ignore
import ProviderSubprovider from "web3-provider-engine/subproviders/provider";
// @ts-ignore
import RpcProvider from "web3-provider-engine/subproviders/rpc";
// @ts-ignore
import WebsocketProvider from "web3-provider-engine/subproviders/websocket";

import type {
  JSONRPCRequestPayload,
  JSONRPCResponsePayload
} from "ethereum-protocol";
import { EthersSubprovider, SignerBuilders } from './EthersSubprovider.js';
import type { JsonRpcProvider } from '@ethersproject/providers';

// This line shares nonce state across multiple provider instances. Necessary
// because within truffle the wallet is repeatedly newed if it's declared in the config within a
// function, resetting nonce from tx to tx. An instance can opt out
// of this behavior by passing `shareNonce=false` to the constructor.
// See issue #65 for more
const singletonNonceSubProvider = new NonceSubProvider();

export class TruffleEthersProvider {
  private addresses: string[];
  public engine: ProviderEngine;

  // We make this static to prevent constant re-initalization
  private static ethersProvider: EthersSubprovider;

  constructor(signers: SignerBuilders, provider: JsonRpcProvider) {

    // We require knowing our signers address in advance because
    // we don't want to force creation if they aren't needed
    this.addresses = Object.keys(signers);
    // Create a Web3 Provider Engine
    this.engine = new ProviderEngine({
      pollingInterval: 4000
    });

    if (!TruffleEthersProvider.ethersProvider) {
      TruffleEthersProvider.ethersProvider = new EthersSubprovider(signers, provider);
    }

    this.engine.addProvider(new HookedSubprovider(TruffleEthersProvider.ethersProvider));
    this.engine.addProvider(singletonNonceSubProvider);
    this.engine.addProvider(new FiltersSubprovider());
    this.engine.addProvider(new RpcProvider({ rpcUrl: provider.connection.url }));
    this.engine.start();
  }


  public send(
    payload: JSONRPCRequestPayload,
    // @ts-ignore we patch this method so it doesn't conform to type
    callback: (error: null | Error, response: JSONRPCResponsePayload) => void
  ): void {
    this.engine.sendAsync(payload, callback);
  }

  public sendAsync(
    payload: JSONRPCRequestPayload,
    callback: (error: null | Error, response: JSONRPCResponsePayload) => void
  ): void {
    this.engine.sendAsync(payload, callback);
  }

  public getAddress(idx?: number): string {
    if (!idx) {
      return this.addresses[0];
    } else {
      return this.addresses[idx];
    }
  }

  public getAddresses(): string[] {
    return this.addresses;
  }
}
