
import { BrokerCAD } from '@the-coin/types'
import { NormalizeAddress } from '@the-coin/utilities';
import { GetBillPaymentSigner } from '@the-coin/utilities/lib/VerifiedBillPayment'
import { GetTransferSigner } from '@the-coin/utilities/lib/VerifiedTransfer'
import { GetUserDoc } from '@the-coin/utilities/lib/User';

import { ProcessCertifiedAction, ConfirmedRecord, VerifiedActionResult } from './VerifiedProcess';
import status from './status.json';

const BILL_PAYMENT_TYPE = "Bill"

type PayeeDocument = {
	payee: string,	// encrypted JSON doc
	version: string // version payee was encrypted with
}

type BillPaymentDocument = BrokerCAD.CertifiedBillPayment&ConfirmedRecord

function ValidSignatures(payment: BrokerCAD.CertifiedBillPayment) {
	const paymentSigner = GetBillPaymentSigner(payment);
	const xferSigner = GetTransferSigner(payment.transfer);
	return (paymentSigner == xferSigner);
}

function ValidDestination(payment: BrokerCAD.CertifiedBillPayment) {
	return NormalizeAddress(payment.transfer.to) == NormalizeAddress(status.address);
}

function GetPayeeDoc(user: string, payeeName: string) {
	const userDoc = GetUserDoc(user);
	return userDoc.collection("Payees").doc(payeeName);
}
async function StoreNamedPayee(user: string, payee: BrokerCAD.EncryptedPacket)
{
	if (!payee.name)
		return;

	const payeeDoc = GetPayeeDoc(user, payee.name);
	const data: PayeeDocument = {
		payee: payee.encryptedPacket,
		version: payee.version
	}
	const res = await payeeDoc.set(data);
	console.log(`${user} Set encrypted payee ${payee.name} @ ${res.writeTime}`);
}

async function GetNamedPayee(user: string, payeeName: string)
{
	const payee = await GetPayeeDoc(user, payeeName).get();
	return payee.exists ? 
		payee.data() as PayeeDocument :
		null
}

// Billpayment works by:
//  User Creates Billpayment which is just VeriXFer 
//	User adds bill payment
async function ProcessBillPayment(payment: BrokerCAD.CertifiedBillPayment)
{
	// First, check that bill payment & the transfer are signed by the same person
	if (!ValidSignatures(payment))
		throw new Error("Mismatching Signatures");

	// verify that the transfer recipient is the Broker CAD
	if (!ValidDestination(payment))
		throw new Error("Invalid Destination");

	// Do the CertTransfer, this should transfer Coin to our account
	const res = await ProcessCertifiedAction(payment, BILL_PAYMENT_TYPE);

	if (payment.encryptedPayee.name)
	{
		// If the user has named this bill payment, store that info in here.
		const user = GetBillPaymentSigner(payment);
		await StoreNamedPayee(user, payment.encryptedPayee);
	}
	return res;
}

export { ProcessBillPayment, GetNamedPayee, StoreNamedPayee, BillPaymentDocument }