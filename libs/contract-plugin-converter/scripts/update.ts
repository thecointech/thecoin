import hre from 'hardhat';
import { log } from '@thecointech/logging';
import '@nomicfoundation/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { getContract } from '../src';
import { getSigner } from '@thecointech/signers';

const owner = await getSigner("Owner");
const existing = await getContract();

const UberConverter = await hre.ethers.getContractFactory('UberConverter', owner);
const uberConverter = await hre.upgrades.upgradeProxy(existing, UberConverter);
log.info(`Updated UberConverter at ${uberConverter.address}`);
