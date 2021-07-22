import { Signer, Wallet, providers } from "ethers";
import { TheCoin } from "./types/TheCoin";
import { GetContract } from "./contract";
import { log } from '@thecointech/logging';

function ConnectWallet(wallet: Wallet) {
  const contract = GetContract();
  return wallet.connect(contract.provider);
}

export function ConnectContract(signer: Signer, onFailure?: (err: Error) => void): TheCoin {
  // First fetch contract
  const contract = GetContract();
  if (!!(signer as Wallet).connect) {
    // Ensure wallet is connected to the same network as the contract
    signer = ConnectWallet(signer as Wallet);
  }
  else {
    // Validate that signer and contract are connected to the same network
    if (!signer.provider)
      throw new Error("Unsupported: cannot have signer without a network");

    let signerNetwork = undefined as providers.Network | undefined;
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
