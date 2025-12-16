import hre from 'hardhat';
import { ContractOracle } from '../src';
import { log } from '@thecointech/logging';
import { getSigner } from '@thecointech/signers';

const owner = await getSigner("OracleOwner");
const existing = await ContractOracle.get();
const existingAddress = await existing.getAddress();

const address = await owner.getAddress();
const balance = await existing.runner.provider.getBalance(address);
log.debug(`Begin Upgrade: ${address} - ${balance}`);
const OracleNew = await hre.ethers.getContractFactory('SpxCadOracle', owner);
const oracle = await hre.upgrades.upgradeProxy(existingAddress, OracleNew);
const oracleAddress = await oracle.getAddress();
log.info(`Updated Oracle at ${oracleAddress}`);
