import { Wallet, Signer, Contract, ethers } from 'ethers';

type Network = "ropsten"|"mainnet";
async function BuildContract(network: Network) {
	const deploy = await import(`./deployed/zos.${network}.json`);
	const TheCoinSpec = await import('./deployed/TheCoin.json');
	if (!deploy || !TheCoinSpec)
		throw new Error('Cannot create contract: missing deployment');

	const { address } = deploy.proxies["the-contract/TheCoin"][0];
	const { abi } = TheCoinSpec;
	const provider = new ethers.providers.InfuraProvider(network, "54e16af940e445f4ad38ab9e2cd4cab6");
	return new ethers.Contract(address, abi, provider);
}

//if (!IsDebug)
//	throw new Error("Fix this!");
export const InitialCoinBlock = 4456169;

let _contract: Contract|undefined = undefined;
export async function GetContract() : Promise<Contract> {

	if (!_contract)
	{
		const network = 'ropsten'; //IsDebug ? 'ropsten' : 'mainnet';
		_contract = await BuildContract(network);
	}
	return _contract;
};

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
