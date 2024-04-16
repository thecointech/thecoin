import hre from 'hardhat';
import { log } from '@thecointech/logging';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { getContract } from '../src';
import { getDeploySigner } from '@thecointech/contract-tools/deploySigner';

const brokerCAD = await getDeploySigner("BrokerCAD");
const existing = await getContract();

const ShockAbsorber = await hre.ethers.getContractFactory('ShockAbsorber', brokerCAD);
const shockAbsorber = await hre.upgrades.upgradeProxy(existing.address, ShockAbsorber);
log.info(`Updated ShockAbsorber at ${shockAbsorber.address}`);
