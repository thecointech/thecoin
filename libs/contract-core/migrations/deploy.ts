import { getSigner } from '@thecointech/signers';

export const getName = (network: string) =>
  network === 'polygon'
  ? "TheCoinL2" as "TheCoin"
  : "TheCoinL1" as "TheCoin";

export const getDeployed = (artifacts: Truffle.Artifacts, network: string) => {
  const theCoin = artifacts.require(getName(network))
  return theCoin.deployed();
}
// ChildChainManager calls the deposit function on the polygon chain
// See https://static.matic.network/network/testnet/mumbai/index.json
const childChainManager_mumbai = '0xb5505a6d998549090530911180f38aC5130101c6';

// The address of the Goerli bridge contract
// see MintableERC721PredicateProxy https://static.matic.network/network/testnet/mumbai/index.json
const goerliPredicate = '0x37c3bfC05d5ebF9EBb3FF80ce0bd0133Bf221BC8';

export async function getArguments(network: String) {
  const theCoin = await getSigner("TheCoin");
  const theCoinAddress = await theCoin.getAddress();
  return [
    theCoinAddress,
    network === 'polygon'
      // ChildChainManager calls the deposit function on the polygon chain
      // See https://static.matic.network/network/testnet/mumbai/index.json
      ? childChainManager_mumbai
      : goerliPredicate
  ]
}
