
export async function getContractL2(deployer: Truffle.Deployer, mintAddress: string) {
  const L2Contract = artifacts.require("TheGreenNFTL2");
  // Create with minter assigned.
  // ChildChainManager calls the deposit function on the polygon chain
  // See https://static.matic.network/network/testnet/mumbai/index.json
  const mumbaiDepositor = '0xb5505a6d998549090530911180f38aC5130101c6';
  await deployer.deploy(L2Contract, mintAddress, mumbaiDepositor);
  return L2Contract.deployed();
}
