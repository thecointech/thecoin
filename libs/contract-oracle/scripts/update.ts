import hre from 'hardhat';
import { getDeploySigner } from '@thecointech/contract-tools/deploySigner';
import { getContract } from '../src';
import { log } from '@thecointech/logging';

const owner = await getDeploySigner("OracleOwner");
const existing = await getContract();

const address = await owner.getAddress();
const balance = await owner.getBalance();
log.debug(`Begin Upgrade: ${address} - ${balance}`);
const Oracle = await hre.ethers.getContractFactory('SpxCadOracle', owner);
const oracle = await hre.upgrades.upgradeProxy(existing.address, Oracle);
log.info(`Updated Oracle at ${oracle.address}`);
