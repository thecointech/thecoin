import { Signer, Wallet } from "ethers";
import type { TheCoin } from "./types/TheCoin";
import { GetContract } from "./contract";

async function ConnectWallet(wallet: Wallet) {
	const contract = await GetContract();
	return wallet.connect(contract.provider);
}

export async function ConnectContract(signer: Signer) : Promise<TheCoin> {
	// First fetch contract
	const contract = await GetContract();
	if (!!(signer as Wallet).connect) {
	  // Ensure wallet is connected to the same network as the contract
		signer = await ConnectWallet(signer as Wallet);
	}
	else {
		// Validate that signer and contract are connected to the same network
		if (!signer.provider)
			throw new Error("Unsupported: cannot have signer without a network")
		const signerNetwork = await signer.provider.getNetwork()
		const contractNetwork = await contract.provider.getNetwork();
		if (signerNetwork.ensAddress !== contractNetwork.ensAddress)
			throw new Error(`Contract network ${contractNetwork.name} does not match signer network ${signerNetwork.name}`)
	}
	return contract.connect(signer);
}
