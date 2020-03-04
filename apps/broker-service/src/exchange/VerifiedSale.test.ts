
import { GetContract, GetWallet } from './Wallet'
import { toHuman } from '@the-coin/utilities'
import { BuildVerifiedSale } from '@the-coin/utilities/VerifiedSale';
import { DoCertifiedSale } from './VerifiedSale'
import status from '../status/Status.json';
import * as firestore from './Firestore'
import { ETransferPacket } from '@the-coin/types';
import { TransferRecord } from '@the-coin/utilities/Firestore';

beforeAll(async () => {
  firestore.init();
});

test("Status is valid", () => {
	expect(status.address);
	expect(status.address.length).toBe(42);
	const fee = toHuman(status.certifiedFee);
	expect(fee).toBe(0.005);
})

test("Certified sale completes sale properly", async () => {

	jest.setTimeout(900000);
	const wallet = await GetWallet();
	expect(wallet).toBeDefined();

	// TODO!  Create a testing account to handle this stuff!
	const tc = await GetContract();
	const myBalance = await tc.balanceOf(wallet.address)
	expect(myBalance.toNumber()).toBeGreaterThan(0);

	const eTransfer: ETransferPacket = {
    email: "test@random.com",
    question: "vvv",
    answer: "lskdjf"
  };

	const fee = status.certifiedFee;
	const sellAmount = 100;
	const certSale = await BuildVerifiedSale(eTransfer, wallet, status.address, sellAmount, fee);
	const tx = await DoCertifiedSale(certSale);
	
	expect(tx).toBeTruthy();
	expect(tx.hash).toBeDefined()
	expect(tx.doc).toBeDefined()

	// Wait on the given hash for 2 confirmations
	let receipt = await tc.provider.getTransactionReceipt(tx.hash);
	console.log(`Transfer mined in ${receipt.blockNumber} - ${receipt.blockHash}`);

	// We await 2 confirmations internally
	const delay = (ms: number) => new Promise( resolve => setTimeout(resolve, ms))
	while (!receipt.confirmations || receipt.confirmations < 2)
	{
		await delay(1000);
		receipt = await tc.provider.getTransactionReceipt(tx.hash);
	}

	// Wait one more second to make sure the datastore has been updated;
	// Check that the datastore now has the right values
	await delay(1000);

	// Verify money was subtracted
  const newBalance = await tc.balanceOf(wallet.address)
  // Note, this number can sometimes be messed up if multiple
  // tests are runnin a the same time.  It's an issue
  // with using the same wallet for testing that processed the tx's
	expect(newBalance.toNumber()).toBe(myBalance.toNumber() - sellAmount);
	
	const r = await tx.doc.get();
	const record = r.data() as TransferRecord;
	expect(record.hash).toEqual(tx.hash);
	//expect(record.clientEmail).toEqual(email);
	expect(record.confirmed).toEqual(true);
	expect(record.fiatDisbursed).toEqual(0);
})