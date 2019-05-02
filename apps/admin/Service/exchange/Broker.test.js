
const Broker = require('./Broker');
const ds = require('./Datastore').datastore
const ethers = require('ethers');

const { GetContract, GetWallet } = require('./Wallet')
const { toHuman, TheContract } = require('@the-coin/utilities');
const { BuildVerifiedSale, BuildVerifiedXfer } = TheContract;

const status = Broker.ServerStatus();

test("Status is valid", () => {
	expect(status.address);
	expect(status.address.length).toBe(42);
	//expect(status.address.slice(2)).toEqual(encrypted.address)

	const fee = toHuman(status.certifiedFee);
	expect(fee).toBe(0.02);
})

test("We should be connecting to the local datastore", () => {
	const host = process.env.DATASTORE_EMULATOR_HOST;
	expect(host).toMatch("localhost:8081");
})

test("Certified sale checks balance", async () => {
	const wallet = ethers.Wallet.createRandom();
	var email = "test@random.co";
	var sale = await BuildVerifiedSale(email, wallet, status.address, 10000, status.certifiedFee);
	const results = await Broker.DoCertifiedSale(sale);

	expect(results.txHash).toBeFalsy();
	expect(results.message).toMatch("Insufficient funds");
})

async function GetStoredSale(user, id) {
	const saleKey = Broker.BuildSellKey(user, id);
	const results = await ds.get(saleKey);
	const [entity] = results;
	return entity
}

test("Transfer completes sale properly", async () => {
	return;
	jest.setTimeout(30000);

	const wallet = await GetWallet();
	expect(wallet).toBeDefined();

	// TODO!  Create a testing account to handle this stuff!
	const status = Broker.ServerStatus();
	const tc = await GetContract();
	const myBalance = await tc.balanceOf(wallet.address)
	expect(myBalance.toNumber()).toBeGreaterThan(0);

	const fee = status.certifiedFee;
	const transfer = 100;
	const certTransfer = await BuildVerifiedXfer(wallet, wallet.address, transfer, fee);
	const tx = await Broker.DoCertifiedTransfer(certTransfer);

	expect(tx.txHash).toBeTruthy();
	expect(tx.message).toBe("Success");
})

test("Certified sale completes sale properly", async () => {
	jest.setTimeout(300000);
	const wallet = await GetWallet();
	expect(wallet).toBeDefined();

	// TODO!  Create a testing account to handle this stuff!
	const status = Broker.ServerStatus();
	const tc = await GetContract();
	const myBalance = await tc.balanceOf(wallet.address)
	expect(myBalance.toNumber()).toBeGreaterThan(0);

	const email = "test@random.com";
	const fee = status.certifiedFee;
	const sellAmount = 100;
	const certSale = await BuildVerifiedSale(email, wallet, status.address, sellAmount, fee);
	const tx = await Broker.DoCertifiedSale(certSale);
	
	expect(tx.txHash).toBeTruthy();
	expect(tx.message).toBe("Success");

	// Wait on the given hash
	const receipt = await tc.provider.getTransactionReceipt(tx.txHash);
	console.log(`Transfer mined in ${receipt.blockNumber} - ${receipt.blockHash}`)

	// Verify money was subtracted
	const newBalance = await tc.balanceOf(wallet.address)
	expect(newBalance.toNumber()).toBe(myBalance.toNumber() - sellAmount);

	// Wait for the tx to be mined
	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	for (let i = 0; i < 10; i++) {
		await sleep(2000);
		// TODO: Test for 
	}
})

// const { SendMail } = require('./AutoMailer');

// test("Can send email", async () => {
// 	const [result, body] = await SendMail("Sale Registered", "Can you see this too?");

// 	expect(result).toBeDefined();
	
// })