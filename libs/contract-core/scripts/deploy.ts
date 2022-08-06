import hre from 'hardhat';
import { storeContractAddress } from '@thecointech/contract-tools/writeContract';
import { getSigner } from '@thecointech/signers';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';

async function main() {

  const network = "polygon"; //hre.network.name
  const name = getName(network);

  const contractArgs = await getArguments(network)
  console.log(JSON.stringify(contractArgs, null, 2));
  const TheCoin = await hre.ethers.getContractFactory(name);
  const theCoin = await hre.upgrades.deployProxy(TheCoin, contractArgs, { initializer: 'initialize(address _sender, address depositor)'});
  const proxy = await theCoin.deployed();
  // const proxy = await deployProxy(contract, contractArgs, { deployer });
  // Serialize our contract addresses
  storeContractAddress(import.meta.url, network, proxy.address, ['cjs', 'mjs']);
}

const getName = (network: string) =>
  network === 'polygon' || network === 'hardhat'
  ? "TheCoinL2" as "TheCoin"
  : "TheCoinL1" as "TheCoin";

// In some environments the address must be set
// statically (to support multiple hardware wallets)
// whereas in devlive the address is dynamically generated
const getTheCoinAddress = async () => {
  if (process.env.WALLET_TheCoin_ADDRESS !== undefined) {
    return process.env.WALLET_TheCoin_ADDRESS;
  }
  const signer = await getSigner("TheCoin");
  const address = await signer.getAddress();
  console.log(`TheCoin address: ${address}`);
  return address;
}

async function getArguments(network: String) {
  return [
    await getTheCoinAddress(),
    network === 'polygon'
      // ChildChainManager calls the deposit function on the polygon chain
      // See https://static.matic.network/network/testnet/mumbai/index.json
      ? process.env.POLYGON_CHILDCHAIN_MANAGER
      : process.env.POLYGON_ROOTNET_PREDICATE ??
        "0xbaadf00dbaadf00dbaadf00dbaadf00dbaadf00d"
  ]
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
