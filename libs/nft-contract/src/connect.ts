import { Signer, Wallet } from "ethers";
import type { TheCoinNFT } from "./types/TheCoinNFT";
import { getContract } from "./contract";

export async function connectNFT(signer: Signer) : Promise<TheCoinNFT> {
	const contract = await getContract();
	if ((signer as Wallet).connect) {
	  // Ensure wallet is connected to the same network as the contract
		signer = (signer as Wallet).connect(contract.provider);
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
