import { GetContract, GetWallet } from './Wallet'
import { BuildVerifiedBillPayment, ProcessRecord } from '@the-coin/utilities';
import { ProcessBillPayment } from './VerifiedBillPayments'
import { BillPayeePacket } from '@the-coin/types';
import status from '../status/Status.json';
import * as firestore from './Firestore'

beforeAll(async () => {
  firestore.init();
});

test("Verified bill payments complete properly", async () => {

	jest.setTimeout(900000);
	const wallet = await GetWallet();
	expect(wallet).toBeDefined();

	// TODO!  Create a testing account to handle this stuff!
	const tc = await GetContract();
	const myBalance = await tc.balanceOf(wallet.address)
	expect(myBalance.toNumber()).toBeGreaterThan(0);

	const payee: BillPayeePacket = {
		payee: "VISA - TORONTO DOMINION",
		accountNumber: "123456789123546"
	};

	const amount = 100;
	const billPayment = await BuildVerifiedBillPayment(payee, wallet, status.address, amount, status.certifiedFee);
	const tx = await ProcessBillPayment(billPayment);
	
	expect(tx).toBeTruthy();
	expect(tx.hash).toBeDefined()
	expect(tx.doc).toBeDefined()

	// Wait one more second to make sure the datastore has been updated;
	// Check that the datastore now has the right values
	const r = (await tx.doc.get()).data() as ProcessRecord;
	expect(r.hash).toEqual(tx.hash);
	expect(r.fiatDisbursed).toEqual(0);
	//expect(r.encryptedPayee).toMatch(name);

	// Now check that we have saved the payee info
	//const savedPayee = (await GetNamedPayee(wallet.address, name))!;
	// expect(savedPayee.payee).toEqual(billPayment.encryptedPayee.encryptedPacket);
	// expect(savedPayee.version).toEqual(billPayment.encryptedPayee.version);
})