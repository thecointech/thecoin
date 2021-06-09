import { ThreeIdConnect, EthereumAuthProvider } from '@3id/connect'
import { Signer } from 'ethers/abstract-signer'
import { EventEmitter } from 'events'
import { fromString, toString } from 'uint8arrays';

class EthereumProvider extends EventEmitter {
  signer: Signer

  constructor(signer: Signer) {
    super()
    this.signer = signer
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
      callback(null, { result: this.signer.signMessage(message) })
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

export async function createAuthProvider(signer: Signer) {
  const address = await signer.getAddress();
  const ethProvider = new EthereumProvider(signer);
  return new EthereumAuthProvider(ethProvider, address);
}

export async function get3idConnect(authProvider: EthereumAuthProvider) {
    // TODO: how do we connect to multiple accounts at the same time?!?
    await globalThis.__threeID.connect(authProvider)
    return globalThis.__threeID;
}
