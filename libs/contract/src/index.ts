import { Wallet, Signer, Contract, providers } from 'ethers';

const getProvider = () => {
  if (process.env.NODE_ENV === 'production') {
    // Connect through infura
    const key = process.env.INFURA_API_KEY;
    if (!key)
      throw new Error("Missing Infura Key, cannot connect to blockchain");

    // Which network do we connect to?
    // TODO: replace mainnet with
    if (process.env.SETTINGS === 'staging')
      return new providers.InfuraProvider("ropsten", key);
  }
  else {
    if (process.env.SETTINGS == 'live') {
      return new providers.JsonRpcProvider("http://localhost:9545")
    }
  }

  throw new Error(`Unsupported environment: ${process.env.NODE_ENV}:${process.env.SETTINGS}`);
}

const getAbi = async () => {
	const TheCoinSpec = await import('./deployed/TheCoin.json');
	if (!TheCoinSpec)
		throw new Error('Cannot create contract: missing contract spec');

  return TheCoinSpec.abi;
}

type Network = "development"|"ropsten"|"mainnet";
const getNetwork = () : Network =>
  process.env.NODE_ENV === 'production'
    ? process.env.SETTINGS === 'staging'
      ? "ropsten"
      : "mainnet"
    : "development";

const getContractAddress = async () => {
  const network = getNetwork();
  const deployment = await import(`./deployed/${network}.json`);
  if (!deployment) {
    throw new Error('Cannot create contract: missing deployment');
  }
  return deployment.proxy;
}

const buildContract = async () =>
  new Contract(
    await getContractAddress(),
    await getAbi(),
    getProvider()
  )

declare module globalThis {
  let __contract: Contract|undefined;
}

export async function GetContract() : Promise<Contract> {
  if (!globalThis.__contract) {
    globalThis.__contract= await buildContract();
  }
  return globalThis.__contract
}

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
