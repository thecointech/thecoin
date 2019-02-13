import GetContract from './TheContract'

test('Has Contract', async () => {

	const contract = GetContract();
	expect(contract.address).toBeDefined();

	const minted = await contract.totalSupply();
	console.log("Minted: ", minted.toString());
	expect(minted.toNumber()).toBeGreaterThan(0);

	const roles = await contract.getRoles();
	expect(roles).toHaveLength(4)
	console.log(roles);

	const theCoin = roles[2];
	const balance = await contract.balanceOf(theCoin);

	console.log("Balance: ", balance.toString());
	expect(balance.toNumber()).toBeGreaterThanOrEqual(0);
});
  