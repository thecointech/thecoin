import { SignVerifiedXfer, VerifySignedXfer, GetContract, BuildVerifiedSale, GetSaleSigner } from './TheContract'
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

test('Can build verified sale', async () => {

	const contract = GetContract();
	expect(contract.address).toBeDefined();

	const email = "address@email.com";
	const wallet = Wallet.createRandom();
	const value = 100000;
	const fee = 2000;
	const sale = await BuildVerifiedSale(email, wallet, brokerCAD, value, fee);
	
	// verify that the transfer is avlid
	const { transfer } = sale;
	var xferSigner = await contract.recoverSigner(transfer.from, transfer.to, transfer.value, transfer.fee, transfer.timestamp, transfer.signature);
	expect(xferSigner).toMatch(wallet.address);

	// verify that our email signature is valid
	const signer = GetSaleSigner(sale);
	expect(signer).toMatch(wallet.address);
})

test('Catches bad timestamp', async () => {

	const contract = GetContract();
	expect(contract.address).toBeDefined();

	const email = "address@email.com";
	const wallet = Wallet.createRandom();
	const value = 100000;
	const fee = 2000;
	const timestamp = Date.now();
	const buildFn = async () => await BuildVerifiedSale(email, wallet, brokerCAD, value, fee, timestamp);
	await expect(buildFn()).rejects.toThrow(TypeError);
})
  