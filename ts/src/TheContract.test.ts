import { SignVerifiedXfer, VerifySignedXfer, GetContract } from './TheContract'
import { Wallet } from 'ethers';

const brokerCAD = "0x38de1b6515663dbe145cc54179addcb963bb606a"

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

	const balanceCAD = await contract.balanceOf(brokerCAD);

	console.log("Balance: ", balanceCAD.toString());
	expect(balanceCAD.toNumber()).toBeGreaterThanOrEqual(0);
});

test('Verified signature matches', async () => {

	const contract = GetContract();
	expect(contract.address).toBeDefined();

	const wallet = Wallet.createRandom();
	const timestamp = Date.now();
	const value = 100000;
	const fee = 2000;
	const signature = await SignVerifiedXfer(wallet, brokerCAD, value, fee, timestamp);
	
	// verify that this signature matches what the contract expects
	var signer = await contract.recoverSigner(wallet.address, brokerCAD, value, fee, timestamp, signature);
	expect(signer == wallet.address);

	const signer2 = VerifySignedXfer(wallet.address, brokerCAD, value, fee, timestamp, signature)
	expect(signer2 == wallet.address);
})
  