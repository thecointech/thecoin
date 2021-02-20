import { ThreeIdConnect, EthereumAuthProvider } from '3id-connect'
import { Wallet as EthereumWallet } from 'ethers/wallet'
import { EventEmitter } from 'events'
import { fromString, toString } from 'uint8arrays'
import type { DIDProvider } from 'dids'
import { AnySigner, isWallet } from '../../SignerIdent'

class EthereumProvider extends EventEmitter {
  wallet: EthereumWallet

  constructor(wallet: EthereumWallet) {
    super()
    this.wallet = wallet
  }

  send(
    request: { method: string; params: Array<any> },
    callback: (err: Error | null | undefined, res?: any) => void
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

export async function getProvider(wallet: AnySigner): Promise<DIDProvider> {
  const { address } = wallet;
  const ethProvider = isWallet(wallet)
    ? new EthereumProvider(wallet)
    : null;
  if (!ethProvider) throw new Error('Unsupported wallet type (fix me!!!)');
  // Also - how do we connect to multiple accounts at the same time?!?
  await globalThis.__threeID.connect(new EthereumAuthProvider(ethProvider, address))
  return globalThis.__threeID.getDidProvider()
}
