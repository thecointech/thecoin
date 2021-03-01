import { GetContract } from './index'

//
// Simple sanity test for a contract
// deployed in development environment
test('Contract has migrated correctly', async () => {

  jest.setTimeout(60000);

  // Note, this
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
