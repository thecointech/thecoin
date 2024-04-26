import hre from 'hardhat';
import { getDeploySigner } from '@thecointech/contract-tools/deploySigner';
import { getContract } from '../src';
import { log } from '@thecointech/logging';

const owner = await getDeploySigner("OracleOwner");
const existing = await getContract();
const existingAddress = await existing.getAddress();

const address = await owner.getAddress();
const balance = await existing.runner.provider.getBalance(address);
log.debug(`Begin Upgrade: ${address} - ${balance}`);
const Oracle = await hre.ethers.getContractFactory('SpxCadOracle', owner);
const oracle = await hre.upgrades.upgradeProxy(existingAddress, Oracle);
log.info(`Updated Oracle at ${oracle.address}`);
