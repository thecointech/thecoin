
const Broker = require('./Broker');
const ds = require('./Datastore').datastore
const ethers = require('ethers');

const { GetContract, GetWallet } = require('./Wallet')
const { toHuman, TheContract } = require('@the-coin/utilities');
const { BuildVerifiedSale } = TheContract;

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

test("Certified sale completes sale properly", async () => {
	const wallet = await GetWallet();
	expect(wallet).toBeDefined();

	// TODO!  Create a testing account to handle this stuff!
	const status = Broker.ServerStatus();
	const tc = await GetContract();
	const myBalance = await tc.balanceOf(status.address)
	expect(myBalance.toNumber()).toBeGreaterThan(0);

	const email = "test@random.com";
	const fee = status.certifiedFee;
	const sellAmount = Math.min(10000, myBalance.toNumber() - fee);
	const certSale = await BuildVerifiedSale(email, wallet, status.address, sellAmount, status.certifiedFee);

	return
	//const txhash = await Broker.DoCertifiedSale(certSale);
	

	// const stored = await GetStoredSale(wallet.address, saleId);
	// expect(stored.userSellData).toBeDefined()
	// expect(stored.userSellData).toMatchObject(certSale);
	// expect(stored.hash).toMatch("");
	// expect(stored.fiatDisbursed).toEqual(0);
})

// const { SendMail } = require('./AutoMailer');

// test("Can send email", async () => {
// 	const [result, body] = await SendMail("Sale Registered", "Can you see this too?");

// 	expect(result).toBeDefined();
	
// })