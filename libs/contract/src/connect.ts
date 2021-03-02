import { Signer, Wallet } from "ethers";
import { GetContract } from "./contract";

export async function ConnectWallet(wallet: Wallet) {
	const contract = await GetContract();
	return wallet.connect(contract.provider);
}

export async function ConnectContract(signer: Signer) {
	// First fetch contract
	const contract = await GetContract();
	// Ensure wallet is connected to the appropriate signer
	if ((<Wallet>signer).connect != null) {
		signer = await ConnectWallet(signer as Wallet);
	}
	else {
		// Validate that signer and contract can function together
		if (!signer.provider)
			throw new Error("Unsupported: cannot have signer without a network")
		const signerNetwork = await signer.provider.getNetwork()
		const contractNetwork = await contract.provider.getNetwork();
		if (signerNetwork.ensAddress != contractNetwork.ensAddress)
			throw new Error(`Contract network ${contractNetwork.name} does not match signer network ${signerNetwork.name}`)
	}
	return contract.connect(signer);
}
