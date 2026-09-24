import hre from 'hardhat';
import { log } from '@thecointech/logging';
import '@nomicfoundation/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { ContractConverter } from '../src';
import { getSigner } from '@thecointech/signers';

//
// IMPORTANT:
//   This script will fail without INFURA_PROJECT_ID env variable.
//   A proper fix involves upgrading to HHv3 (not a priority now)
//

const owner = await getSigner("Owner");
const existing = await ContractConverter.get();

const UberConverter = await hre.ethers.getContractFactory('UberConverter', owner);
const uberConverter = await hre.upgrades.upgradeProxy(existing, UberConverter);
const uberConverterAddress = await uberConverter.getAddress();
log.info(`Updated UberConverter at ${uberConverterAddress}`);
