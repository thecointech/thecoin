import hre from 'hardhat';
import { storeContractAddress } from '@thecointech/contract-tools/writeContract';
import { getSigner } from '@thecointech/signers';
import { log } from '@thecointech/logging';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';

async function main() {

  const network = "polygon"; //hre.network.name
  const name = getName(network);
  const owner = await getSigner("Owner");

  const contractArgs = await getArguments(network)
  const TheCoin = await hre.ethers.getContractFactory(name, owner);
  const theCoin = await hre.upgrades.deployProxy(TheCoin, contractArgs, { initializer: 'initialize(address _sender, address depositor)'});
  log.info(`Deployed ${name} at ${theCoin.address}`);

  // Serialize our contract addresses
  storeContractAddress(new URL(import.meta.url), network, theCoin.address, ['cjs', 'mjs']);
}

const getName = (network: string) =>
  network === 'polygon' || process.env.NODE_ENV !== 'production'
  ? "TheCoinL2"
  : "TheCoinL1";

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
