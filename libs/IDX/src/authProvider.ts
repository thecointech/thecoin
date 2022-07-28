import { EthereumAuthProvider } from '@self.id/web';
import { Signer } from '@ethersproject/abstract-signer'
import { EventEmitter } from 'events'
import { fromString, toString } from 'uint8arrays';
import { sign } from "@thecointech/utilities/SignedMessages";

const chainId = process.env.DEPLOY_POLYGON_NETWORK_ID ?? "1";
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
    switch(request.method) {
      case "eth_chainId":
        // NOTE!  This should not return '1', it should return
        // process.env.DEPLOY_POLYGON_NETWORK_ID
        // Although - why on earth would it matter if we aren't
        // putting information on the chain?
        callback(null, chainId);
        break;
      case "personal_sign":
        let message = request.params[0] as string
        if (message.startsWith('0x')) {
          message = toString(fromString(message.slice(2), 'base16'), 'utf8')
        }
        callback(null, { result: sign(message, this.signer) });
        break;
      case "eth_getCode":
        if (this.signer.provider)
          this.signer.provider.getCode(request.params[0] as string, request.params[1] as number)
            .then(res => callback(null, res))
            .catch(err => callback(err));
        else
          callback(new Error("No provider"));
        break;
      default:
        // Attempt to call the method
        // this.signer.provider?.send(request, callback)
        callback(new Error(`Unsupported method: ${request.method}`));
        break;
    }
  }
}

export async function createAuthProvider(signer: Signer) {
  const address = await signer.getAddress();
  const ethProvider = new EthereumProvider(signer);
  return new EthereumAuthProvider(ethProvider, address);
}
