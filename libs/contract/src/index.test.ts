import { GetContract } from './index'

const brokerCAD = "0x38de1b6515663dbe145cc54179addcb963bb606a"

test('Has Contract', async () => {

  jest.setTimeout(60000);

	const contract = await GetContract();
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

	const balanceCAD = await contract.balanceOf(brokerCAD);

	console.log("Balance: ", balanceCAD.toString());
	expect(balanceCAD.toNumber()).toBeGreaterThanOrEqual(0);
});

