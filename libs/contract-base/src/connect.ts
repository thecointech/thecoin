import { Wallet } from "ethers"
import { log } from '@thecointech/logging';
import type { BaseContract } from 'ethers';
import type { Signer } from "ethers"
import type { Network } from 'ethers'

export function connect<T extends BaseContract>(signer: Signer, contract: T, onFailure?: (err: Error) => void): T {

  if (signer instanceof Wallet) {
    // Ensure wallet is connected to the same network as the contract
    signer = signer.connect(contract.provider);
  }
  else {
    // Validate that signer and contract are connected to the same network
    if (!signer.provider)
      throw new Error("Unsupported: cannot have signer without a network")
    let signerNetwork = undefined as Network | undefined;
    signer.provider.getNetwork()
      .then(network => {
        signerNetwork = network;
        return contract.provider.getNetwork()
      })
      .then(network => {
        if (signerNetwork?.ensAddress !== network.ensAddress) {
          // TODO: Graceful failure here
          throw new Error(`Contract network ${network.name} does not match signer network ${signerNetwork?.name}`);
        }
      })
      .catch(err => {
        log.error(err, "Cannot connect");
        onFailure?.(err);
      })
  }
  return contract.connect(signer) as T;
}
