import hre from 'hardhat';
import { log } from '@thecointech/logging';
import '@nomicfoundation/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { getContract } from '../src';
import { getSigner } from '@thecointech/signers';

const brokerCAD = await getSigner("BrokerCAD");
const existing = await getContract();

const ShockAbsorber = await hre.ethers.getContractFactory('ShockAbsorber', brokerCAD);
const shockAbsorber = await hre.upgrades.upgradeProxy(existing, ShockAbsorber);
log.info(`Updated ShockAbsorber at ${shockAbsorber.address}`);
