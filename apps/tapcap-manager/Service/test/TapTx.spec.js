require = require("esm")(module/*, options*/)

const chai = require('chai')
const should = chai.should()
const expect = chai.expect
const { TapTx } = require('../tapcap/TapTx');
const { GetStatus } = require('../tapcap/TapCapStatus')
const { doTapCapTopUp } = require('../tapcap/DepositWatcher');
const { DeleteTx } = require('../tapcap/DeleteTxBroker.js');
const { DecryptWallet } = require('../tapcap/Wallet')

const ethers = require('ethers');
let SupplierWallet = null;
let ClientWallet = null;

async function GetSigned(obj, wallet) {
	let message = JSON.stringify(obj);
	return {
		message: message,
		signature: await wallet.signMessage(message)
	}
}

async function BuildClientTap(token, amount)
{
	let request = {
		timestamp: new Date().getTime(),
		gpoData: [],
		cryptoData: [],
		token: token,
		supplierAddress: SupplierWallet.address
	}
	signedRequest = await GetSigned(request, ClientWallet);

	var signedPurchase = await GetSigned({
		signedRequest: signedRequest,
		coinCharge: amount,
	}, SupplierWallet);
	var clientFinal = await GetSigned(signedPurchase, ClientWallet);
	return {
		signedPurchase: signedPurchase,
		clientFinal: clientFinal,
		signedRequest: signedRequest
	};
}

async function RollbackTx(tx)
{
	let supplierCancel = {
		signedRequest: tx,
		signature: await SupplierWallet.signMessage(tx.message)
	}
	await DeleteTx(supplierCancel, "Supplier");
}

before(async () => {
	await DecryptWallet();
	SupplierWallet = await ethers.Wallet.createRandom();
	ClientWallet = await ethers.Wallet.createRandom();
});

describe('DeleteTxBroker', function () {
	describe('#AddSomeTx()', function () {
		it('Should add a few test transactions', async function() {
			// Disable timeout
			this.timeout(0);

			let balance = 0;
			let status = null;
			let CheckBalance = async () => {
				let ts = new Date().getTime();
				status = await GetStatus(ClientWallet.address, ts);
				status.balance.should.eq(balance);
				console.log("Checked Balance: ", balance);
			}
			let DoPurchase = async (amount) => {
				let { clientFinal, signedPurchase, signedRequest } = await BuildClientTap(status.token, amount);
				const res = await TapTx(clientFinal, signedPurchase, "Client");
				balance -= amount;
				await CheckBalance();
				return signedRequest;
			}
			await CheckBalance();
			// Init account
			let ts = new Date().getTime();
			balance = 1000000;
			await doTapCapTopUp(ClientWallet.address, balance, "123456", 123456, ts);
			// Ensure we are good to go
			await CheckBalance();

			// Do a few purchases
			console.log("tx1: 10000");
			let tx1 = await DoPurchase(10000);
			console.log("tx2: 5000");
			let tx2 = await DoPurchase(5000);

			// Reverse the first purchase
			console.log("Rolling back tx1");
			await RollbackTx(tx1);
			balance += 10000;
			await CheckBalance();

			console.log("tx3: 20000");
			let tx3 = await DoPurchase(20000);
			console.log("tx4: 750");
			let tx4 = await DoPurchase(750);

			// Reverse the 3rd purchase
			console.log("Rolling back tx3");
			await RollbackTx(tx3);
			balance += 20000;
			await CheckBalance();

			// Attempt to roll back a tx that has not yet been registered
			let { clientFinal, signedPurchase, signedRequest } = await BuildClientTap(status.token, 3000);
			await RollbackTx(signedRequest);
			// This should not change balance
			await CheckBalance();

			// The user notifies after the supplier has already submitted
			console.log("Tx5: 3000 (Already Reverted)");
			await TapTx(clientFinal, signedPurchase, "Client");
			// This should not change balance
			await CheckBalance();
		});
	});
})