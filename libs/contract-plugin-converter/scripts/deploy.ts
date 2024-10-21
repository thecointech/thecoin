import hre from 'hardhat';
import { writePlugin } from '@thecointech/contract-plugins/writePlugin';
import { log } from '@thecointech/logging';
import '@nomicfoundation/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { getArguments } from './arguments';
import { getSigner } from '@thecointech/signers';

// Who owns the converter?  Probably Owner?
const owner = await getSigner("Owner");
const deployArgs = await getArguments();
const UberConverter = await hre.ethers.getContractFactory("UberConverter", owner);
const uberConverter = await hre.upgrades.deployProxy(UberConverter, deployArgs, {
  timeout: 5 * 60 * 1000
});
const contractAddress = await uberConverter.getAddress();
log.info(`Deployed UberConverter at ${contractAddress} with args: ${deployArgs}`);

// Serialize our contract addresses
const contractUrl = new URL('../contracts/UberConverter.sol', import.meta.url);
writePlugin(contractAddress, contractUrl);
