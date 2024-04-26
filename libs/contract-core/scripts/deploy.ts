import hre from 'hardhat';
import { storeContractAddress } from '@thecointech/contract-tools/writeContract';
import { getSigner } from '@thecointech/signers';
import { log } from '@thecointech/logging';
import { getArguments } from './arguments';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { getProvider } from '@thecointech/ethers-provider';

async function main() {

  const network = hre.config.defaultNetwork;
  const name = getName(network);
  let owner = await getSigner("Owner");
  // If not devlive, then add a provider
  if (hre.network.config.chainId != 31337) {
    const provider = getProvider();
    owner = owner.connect(provider);
  }
  const contractArgs = await getArguments(network)
  const TheCoin = await hre.ethers.getContractFactory(name, owner);
  const theCoin = await hre.upgrades.deployProxy(TheCoin, contractArgs, { initializer: 'initialize(address _sender, address depositor)'});
  const deployAddress = await theCoin.getAddress();
  log.info(`Deployed ${name} at ${deployAddress}`);

  // Serialize our contract addresses
  storeContractAddress(new URL(import.meta.url), "polygon", deployAddress);
}

const getName = (network: string) =>
  network === 'polygon' || process.env.NODE_ENV !== 'production'
  ? "TheCoinL2"
  : "TheCoinL1";


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
