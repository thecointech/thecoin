import { getSigner } from '@thecointech/signers';

export const getName = (network: string) =>
  network === 'polygon'
  ? "TheCoinL2" as "TheCoin"
  : "TheCoinL1" as "TheCoin";

export const getDeployed = (artifacts: Truffle.Artifacts, network: string) => {
  const theCoin = artifacts.require(getName(network));
  return theCoin.deployed();
}

// In some environments the address must be set
// statically (to support multiple hardware wallets)
// whereas in devlive the address is dynamically generated
export const getTheCoinAddress = async () => (
  process.env.WALLET_TheCoin_ADDRESS ??
  (await getSigner("TheCoin")).getAddress()
)

export async function getArguments(network: String) {
  return [
    await getTheCoinAddress(),
    network === 'polygon'
      // ChildChainManager calls the deposit function on the polygon chain
      // See https://static.matic.network/network/testnet/mumbai/index.json
      ? process.env.POLYGON_CHILDCHAIN_MANAGER
      : process.env.POLYGON_ROOTNET_PREDICATE
  ]
}
