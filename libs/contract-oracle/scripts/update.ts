import hre from 'hardhat';
import { getDeploySigner } from '@thecointech/contract-tools/deploySigner';
import { getContract } from '../src';
import { log } from '@thecointech/logging';

const owner = await getDeploySigner("OracleUpdater")
const existing = await getContract();

const Oracle = await hre.ethers.getContractFactory('SpxCadOracle', owner);
const oracle = await hre.upgrades.upgradeProxy(existing.address, Oracle);
log.info(`Updated ShockAbsorber at ${oracle.address}`);
