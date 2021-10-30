import { Network } from '@ethersproject/networks'
import { Signer } from "@ethersproject/abstract-signer"
import { Wallet } from "@ethersproject/wallet"
import type { TheGreenNFT } from ".";
import { getContract } from "./contract";
import { log } from '@thecointech/logging';

export function connectNFT(signer: Signer, onFailure?: (err: Error) => void): TheGreenNFT {
  const contract = getContract();
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
  return contract.connect(signer);
}
