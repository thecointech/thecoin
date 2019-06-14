
//import {datastore} from './Datastore'
import { GetUser } from './Firestore'

import { GetContract, GetWallet } from './Wallet'
import { BuildVerifiedBillPayment } from '@the-coin/utilities/lib/VerifiedBillPayment';
import { ProcessBillPayment, GetPayee } from './VerifiedBillPayments'
import status from './status.json';
import { BrokerCAD } from '@the-coin/types';
import { ConfirmedRecord } from './VerifiedProcess';

test("Verified bill payments complete properly", async () => {

	//throw "not ready";
	return;

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
	expect(tx.key).toBeDefined()

	// Wait one more second to make sure the datastore has been updated;
	// // Check that the datastore now has the right values
	// const r = await datastore.get(tx.key);
	// const record = r[0] as ConfirmedRecord;
	// expect(record.hash).toEqual(tx.hash);
	// expect(record.fiatDisbursed).toEqual(0);

	// // Now check that we have saved the payee info
	// const fetchPayee = await datastore.get(PayeeKey(wallet.address, name))
	// const savedPayee = fetchPayee[0] as any;
	// expect(savedPayee.payee).toEqual(billPayment.encryptedPayee.encryptedPacket);
	// expect(savedPayee.version).toEqual(billPayment.encryptedPayee.version);
})