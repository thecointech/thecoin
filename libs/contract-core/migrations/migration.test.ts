import { accounts, contract, web3 } from '@openzeppelin/test-environment';
import { join } from 'path';
import * as initial from './1_initial_migration';
import { getDeployed } from './deploy';
import config from '../truffle-config';

jest.setTimeout(5 * 60 * 1000);
(globalThis as any).config = config;
contract.artifactsDir = join(__dirname, "../src/contracts");
const network = "polygon";
var artifacts = {
  require: contract.fromArtifact.bind(contract)
};

const callStep = (step: any) => step.default(artifacts, web3)(contract as any, network, accounts);

//
// Simple sanity test for a contract
// deployed in development environment
test('Contract has migrated correctly', async () => {

  // deploy contract
  await callStep(initial);
  const deployed = await getDeployed(artifacts, network);

  expect(deployed).toBeTruthy();
  // // Test to see if this is functional

  // // Note, this test assumes that migrations have occured and truffle develop is running
  // // process.env.SETTINGS = 'live';
  // // const contract = await GetContract();
  // // expect(contract.address).toBeDefined();

  // const minted = await contract.totalSupply();
  // expect(minted.toNumber()).toBeGreaterThan(0);

  // const pluginMgr = await contract.PLUGINMGR_ROLE();
  // expect(pluginMgr).toBeDefined();
});


