import hre from 'hardhat';
import { ContractOracle } from '../src';
import { log } from '@thecointech/logging';
import { getSigner } from '@thecointech/signers';
import { getSecret } from '@thecointech/secrets';
import { writeFileSync } from 'fs';

const owner = await getSigner("OracleUpdater");
const existing = await ContractOracle.get();
const existingAddress = await existing.getAddress();

const INFURA_PROJECT_ID = await getSecret("InfuraProjectId");
const ETHERSCAN_API_KEY = await getSecret("EtherscanApiKey");
writeFileSync(".env", `INFURA_PROJECT_ID=${INFURA_PROJECT_ID}\nETHERSCAN_API_KEY=${ETHERSCAN_API_KEY}`);

const address = await owner.getAddress();
const balance = await existing.runner?.provider?.getBalance(address);
log.debug(`Begin Upgrade: ${address} - ${balance}`);
const OracleNew = await hre.ethers.getContractFactory('SpxCadOracle', owner);
const oracle = await hre.upgrades.upgradeProxy(existingAddress, OracleNew);
const oracleAddress = await oracle.getAddress();
log.info(`Updated Oracle at ${oracleAddress}`);
