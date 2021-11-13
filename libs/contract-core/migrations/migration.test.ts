import { describe } from '@thecointech/jestutils';
import { GetContract } from '../src';

//
// Simple sanity test for a contract
// deployed in development environment
describe('Current Migration Tests', () => {
  test('Contract has migrated correctly', async () => {
    // Note, this test assumes that migrations have occured and truffle develop is running
    process.env.SETTINGS = 'live';
    const contract = await GetContract();
    expect(contract.address).toBeDefined();

    const minted = await contract.totalSupply();
    expect(minted.toNumber()).toBeGreaterThan(0);

    const roles = await contract.getRoles();
    expect(roles).toHaveLength(4)
    console.log(roles);

    const theCoin = roles[2];
    const balance = await contract.balanceOf(theCoin);
    expect(balance.toNumber()).toBeGreaterThanOrEqual(0);
  });
}, !!process.env.DEPLOY_NETWORK_PORT)

