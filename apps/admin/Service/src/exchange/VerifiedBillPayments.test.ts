import { GetContract, GetWallet } from './Wallet'
import { BuildVerifiedBillPayment } from '@the-coin/utilities/lib/VerifiedBillPayment';
import { ProcessBillPayment, GetNamedPayee, BillPaymentDocument } from './VerifiedBillPayments'
import { BrokerCAD } from '@the-coin/types';
import status from './Status';
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

	const payee: BrokerCAD.BillPayeePacket = {
		payee: "VISA - TORONTO DOMINION",
		accountNumber: "123456789123546"
	};

	const name = "My Visa";
	const amount = 100;
	const billPayment = await BuildVerifiedBillPayment(payee, name, wallet, status.address, amount, status.certifiedFee);
	const tx = await ProcessBillPayment(billPayment);
	
	expect(tx).toBeTruthy();
	expect(tx.hash).toBeDefined()
	expect(tx.doc).toBeDefined()

	// Wait one more second to make sure the datastore has been updated;
	// Check that the datastore now has the right values
	const r = (await tx.doc.get()).data() as BillPaymentDocument;
	expect(r.hash).toEqual(tx.hash);
	expect(r.fiatDisbursed).toEqual(0);
	expect(r.encryptedPayee.name).toMatch(name);

	// Now check that we have saved the payee info
	const savedPayee = (await GetNamedPayee(wallet.address, name))!;
	expect(savedPayee.payee).toEqual(billPayment.encryptedPayee.encryptedPacket);
	expect(savedPayee.version).toEqual(billPayment.encryptedPayee.version);
})