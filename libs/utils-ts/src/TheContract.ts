import { Wallet, Signer, Contract, ethers } from 'ethers';
import { BrokerCAD } from "@the-coin/types/lib/BrokerCAD";
//import { IsDebug } from './IsDebug'

type Network = "ropsten"|"mainnet";
async function BuildContract(network: Network) {
	const deploy = await import(`@the-coin/contract/zos.${network}.json`);
	const TheCoinSpec = await import('@the-coin/contract/build/contracts/TheCoin.json');
	if (!deploy || !TheCoinSpec)
		throw new Error('Cannot create contract: missing deployment');

	const { address } = deploy.proxies["the-contract/TheCoin"][0];
	const { abi } = TheCoinSpec;
	const provider = ethers.getDefaultProvider(network);
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

export function ParseSignedMessage(signedMessage: BrokerCAD.SignedMessage) {
	return [
		ethers.utils.verifyMessage(signedMessage.message, signedMessage.signature),
		JSON.parse(signedMessage.message)
	];
}


// ---------------------------------------------------------\\
// Get/Restore bill payment info.




