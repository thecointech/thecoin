import hre from 'hardhat';
import { log } from '@thecointech/logging';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { getContractAddress } from '../src';
import { getProvider } from '@thecointech/ethers-provider';
import { getSigner } from '@thecointech/signers';

async function main() {

  const network = hre.config.defaultNetwork;
  const name = getName(network);
  let owner = await getSigner('Owner');
  // If not devlive, then add a provider
  if (process.env.CONFIG_NAME !== 'devlive') {
    const provider = getProvider();
    owner = owner.connect(provider);
  }
  const address = await getContractAddress();

  const TheCoin = await hre.ethers.getContractFactory(name, owner);
  const theCoin = await hre.upgrades.upgradeProxy(address, TheCoin);
  log.info(`Updated ${name} at ${theCoin.address}`);
}

const getName = (network: string) =>
  network === 'polygon' || process.env.NODE_ENV !== 'production'
  ? "TheCoinL2"
  : "TheCoinL1";


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
