import hre from 'hardhat';
import { log } from '@thecointech/logging';
import '@nomicfoundation/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { ContractShockAbsorber } from '../src';
import { getSigner } from '@thecointech/signers';

const brokerCAD = await getSigner("BrokerCAD");
const existing = await ContractShockAbsorber.get();

const ShockAbsorber = await hre.ethers.getContractFactory('ShockAbsorber', brokerCAD);
const shockAbsorber = await hre.upgrades.upgradeProxy(existing, ShockAbsorber);
const shockAbsorberAddress = await shockAbsorber.getAddress();
log.info(`Updated ShockAbsorber at ${shockAbsorberAddress}`);
