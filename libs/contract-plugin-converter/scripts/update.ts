import hre from 'hardhat';
import { log } from '@thecointech/logging';
import '@nomicfoundation/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { getContract } from '../src';
import { getDeploySigner } from '@thecointech/contract-tools/deploySigner';

const owner = await getDeploySigner("Owner");
const existing = await getContract();

const UberConverter = await hre.ethers.getContractFactory('UberConverter', owner);
const uberConverter = await hre.upgrades.upgradeProxy(existing.address, UberConverter);
log.info(`Updated UberConverter at ${uberConverter.address}`);
