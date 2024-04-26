import { log } from '@thecointech/logging';
import { Wallet, type BaseContract, type Signer } from 'ethers';

export function connect<T extends BaseContract>(signer: Signer, contract: T, onFailure?: (err: Error) => void): T {

  if (signer instanceof Wallet) {
    // Ensure wallet is connected to the same network as the contract
    if (contract.runner) {
      signer = signer.connect(contract.runner.provider);
    }
  }
  else {
    // Validate that signer and contract are connected to the same network
    validateNetwork(signer, contract, onFailure);
  }
  return contract.connect(signer) as T;
}
// Validate that signer and contract are connected to the same network
async function validateNetwork(signer: Signer, contract: BaseContract, onFailure?: (err: Error) => void) {
  if (!signer.provider) {
    log.error("Unsupported: cannot have signer without a network");
    onFailure?.(new Error("Unsupported: cannot have signer without a network"));
    return;
  }
  const signerNetwork = await signer.provider.getNetwork()
  const contractNetwork = await contract.runner?.provider?.getNetwork()
  if (signerNetwork?.chainId !== contractNetwork?.chainId) {
    log.error(`Contract network ${contractNetwork?.name} does not match signer network ${signerNetwork?.name}`);
    // TODO: Graceful failure here
    onFailure?.(new Error(`Contract network ${contractNetwork?.name} does not match signer network ${signerNetwork?.name}`));
  }
}
