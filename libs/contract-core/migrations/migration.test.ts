import { accounts, contract, web3, provider } from '@openzeppelin/test-environment';
import { join } from 'path';
import * as initial from './1_initial_migration';
import * as roles from './2_assign_roles';
import { getDeployed } from './deploy';
import { ContractClass, ContractInstance } from '@openzeppelin/truffle-upgrades/dist/utils/truffle';
import { MINTER_ROLE, THECOIN_ROLE } from '../src/constants';
import { toNamedAccounts } from './accounts';
import { log } from '@thecointech/logging';

// Global variables
jest.setTimeout(5 * 60 * 1000);
(globalThis as any).config = require('../truffle-config');
contract.artifactsDir = join(__dirname, "../src/contracts");
const network = "polygon";
log.level(0);

//
// Simple sanity test for a contract
// deployed in development environment
it.skip('Contract has migrated correctly', async () => {

  const named = toNamedAccounts(accounts);
  // deploy contract
  await callStep(initial);
  // Assign roles
  await callStep(roles);

  // Are the roles assigned?
  const deployed = await getDeployed(artifacts, network);
  const tc = await deployed.getRoleMember(THECOIN_ROLE, 0);
  expect(tc).toEqual(named.TheCoin);
  const isMinter = await deployed.hasRole(MINTER_ROLE, named.Minter);
  expect(isMinter).toBeTruthy();

  // try minting
});

// Fake truffle deployment objects
const deployed : Record<string, string> = {}
const deployedAddress = (name: string) => deployed[name.startsWith("TheCoin") ? "TransparentUpgradeableProxy" : name];
var artifacts = {
  require: (name: string) => {
    const r = contract.fromArtifact(name);
    r.contractName = name;
    r.deployed = () => contract.fromArtifact(name, deployedAddress(name))
    return r;
  }
};
var deployer = {
  provider,
  async deploy(Contract: ContractClass, ...args: unknown[]): Promise<ContractInstance> {
    const r = await Contract.new(...args);
    deployed[Contract.contractName] = r.address;
    log.info(`Deployed: ${Contract.contractName} - ${Contract.address}`);
    return r;
  }
}

const callStep = (step: any) => step.default(artifacts, web3)(deployer, network, accounts);
