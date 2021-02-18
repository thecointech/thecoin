import { ThreeIdConnect, EthereumAuthProvider } from '3id-connect/src'
import { Wallet as EthereumWallet } from 'ethers/wallet'
import { EventEmitter } from 'events'
import { fromString, toString } from 'uint8arrays'
import type { DIDProvider } from 'dids'

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

// @ts-ignore
export const threeID = new ThreeIdConnect()

export async function getProvider(wallet: EthereumWallet): Promise<DIDProvider> {
  const { address } = wallet;
  const ethProvider = new EthereumProvider(wallet);
  await threeID.connect(new EthereumAuthProvider(ethProvider, address))
  return threeID.getDidProvider()
}
