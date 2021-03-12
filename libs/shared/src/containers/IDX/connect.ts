import { ThreeIdConnect, EthereumAuthProvider } from '@the-coin/3id-connect'
import { Signer as EthereumSigner } from 'ethers/abstract-signer'
import { EventEmitter } from 'events'
import { fromString, toString } from 'uint8arrays'
import type { DIDProvider } from 'dids'
import { AnySigner } from '../../SignerIdent'

class EthereumProvider extends EventEmitter {
  wallet: EthereumSigner

  constructor(wallet: EthereumSigner) {
    super()
    this.wallet = wallet
  }

  send(
    request: { method: string; params: unknown[] },
    callback: (err: Error | null | undefined, res?: unknown) => void
  ) {
    if (request.method === 'eth_chainId') {
      callback(null, { result: '1' })
    } else if (request.method === 'personal_sign') {
      let message = request.params[0] as string
      if (message.startsWith('0x')) {
        message = toString(fromString(message.slice(2), 'base16'), 'utf8')
      }
      callback(null, { result: this.wallet.signMessage(message) })
    } else {
      callback(new Error(`Unsupported method: ${request.method}`))
    }
  }
}

// Singleton
declare module globalThis {
  let __threeID: ThreeIdConnect;
}
// 3ID Connect uses an iframe to connect.  Does this mean
// we cannot have multiple active accounts simultaneously?
// TODO: Test account switching!
globalThis.__threeID = new ThreeIdConnect()

export async function getProvider(signer: AnySigner): Promise<DIDProvider> {
  const { address } = signer;
  const ethProvider = new EthereumProvider(signer);
  // TODO: how do we connect to multiple accounts at the same time?!?
  await globalThis.__threeID.connect(new EthereumAuthProvider(ethProvider, address))
  return globalThis.__threeID.getDidProvider()
}
