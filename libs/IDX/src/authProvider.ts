import { EthereumAuthProvider } from '@self.id/web';
import { Signer } from '@ethersproject/abstract-signer'
import { EventEmitter } from 'events'
import { fromString, toString } from 'uint8arrays';
import { sign } from "@thecointech/utilities/SignedMessages";

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
      // NOTE!  This should not return '1', it should return
      // process.env.DEPLOY_POLYGON_NETWORK_ID
      // Although - why on earth would it matter if we aren't
      // putting information on the chain?
      this.signer.getChainId().then(chainId => {
        callback(null, { result: chainId.toString() })
      })
    } else if (request.method === 'personal_sign') {
      let message = request.params[0] as string
      if (message.startsWith('0x')) {
        message = toString(fromString(message.slice(2), 'base16'), 'utf8')
      }
      callback(null, { result: sign(message, this.signer) })
    } else {
      callback(new Error(`Unsupported method: ${request.method}`))
    }
  }
}

export async function createAuthProvider(signer: Signer) {
  const address = await signer.getAddress();
  const ethProvider = new EthereumProvider(signer);
  return new EthereumAuthProvider(ethProvider, address);
}
