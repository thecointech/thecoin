import { Provider, TransactionRequest } from '@ethersproject/abstract-provider';
import { getAddress } from '@ethersproject/address';
import { Signer } from "@ethersproject/abstract-signer";
import { Bytes } from '@ethersproject/bytes';
import { Deferrable } from '@ethersproject/properties';
import { toUtf8Bytes } from '@ethersproject/strings';
import { BigNumber } from '@ethersproject/bignumber';
import { hexlify, joinSignature } from '@ethersproject/bytes';
import { resolveProperties, defineReadOnly } from '@ethersproject/properties';
import { UnsignedTransaction, serialize } from '@ethersproject/transactions';
import { sleep } from '@thecointech/async';

import Transport from "@ledgerhq/hw-transport-node-hid";
import Eth from "@ledgerhq/hw-app-eth";
const defaultPath = "m/44'/60'/0'/0/0";

export class LedgerSigner extends Signer {

  address?: string;
  //@ts-ignore
  path: string;
  //@ts-ignore
  type: string;
  _eth: Promise<Eth>;

  constructor(provider?: Provider, type?: string, path?: string) {
    super()

    defineReadOnly(this, "path", path ?? defaultPath);
    defineReadOnly(this, "type", type ?? "default");
    defineReadOnly(this, "provider", provider);

    this._eth = Transport
      .create()
      .then(async (transport) => {
        const eth = new Eth(transport);
        //const config = await eth.getAppConfiguration();
        return eth;
      })
      .catch(err => {
        console.error(err);
        throw err;
      })
  }


  _retry<T = any>(callback: (eth: Eth) => Promise<T>, timeout?: number): Promise<T> {
    return new Promise(async (resolve, reject) => {
      if (timeout && timeout > 0) {
        setTimeout(() => { reject(new Error("timeout")); }, timeout);
      }

      const eth = await this._eth;

      // Wait up to 5 seconds
      for (let i = 0; i < 50; i++) {
        try {
          const result = await callback(eth);
          return resolve(result);
        } catch (error: any) {
          if (error.id !== "TransportLocked") {
            return reject(error);
          }
        }
        await sleep(100);
      }

      return reject(new Error("timeout"));
    });
  }

  async getAddress(): Promise<string> {
    if (!this.address) {
      const account = await this._retry((eth) => eth.getAddress(this.path));
      this.address = getAddress(account.address);
    }
    return this.address;
  }

  async signMessage(message: Bytes | string): Promise<string> {
    if (typeof (message) === 'string') {
      message = toUtf8Bytes(message);
    }

    const messageHex = hexlify(message).substring(2);

    const sig = await this._retry((eth) => eth.signPersonalMessage(this.path, messageHex));
    sig.r = '0x' + sig.r;
    sig.s = '0x' + sig.s;
    return joinSignature(sig);
  }

  async signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string> {
    const tx = await resolveProperties(transaction);
    const baseTx: UnsignedTransaction = {
      chainId: (tx.chainId || undefined),
      data: (tx.data || undefined),
      gasLimit: (tx.gasLimit || undefined),
      gasPrice: (tx.gasPrice || undefined),
      maxFeePerGas: (tx.maxFeePerGas || undefined),
      maxPriorityFeePerGas: (tx.maxPriorityFeePerGas || undefined),
      nonce: (tx.nonce ? BigNumber.from(tx.nonce).toNumber() : undefined),
      to: (tx.to || undefined),
      value: (tx.value || undefined),
      type: (tx.type || undefined),
    };

    const unsignedTx = serialize(baseTx).substring(2);
    const sig = await this._retry((eth) => eth.signTransaction(this.path, unsignedTx));

    return serialize(baseTx, {
      v: BigNumber.from("0x" + sig.v).toNumber(),
      r: ("0x" + sig.r),
      s: ("0x" + sig.s),
    });
  }

  connect(provider: Provider): Signer {
    return new LedgerSigner(provider, this.type, this.path);
  }
}
