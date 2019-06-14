
import { BrokerCAD } from '@the-coin/types'
import { GetBillPaymentSigner } from '@the-coin/utilities/lib/VerifiedBillPayment'
import { GetTransferSigner } from '@the-coin/utilities/lib/VerifiedTransfer'
import status from './status.json';
import { ProcessCertifiedAction } from './VerifiedProcess';
import { NormalizeAddress } from '@the-coin/utilities';
import { GetUserDoc } from './Firestore.js';

function ValidSignatures(payment: BrokerCAD.CertifiedBillPayment) {
	const paymentSigner = GetBillPaymentSigner(payment);
	const xferSigner = GetTransferSigner(payment.transfer);
	return (paymentSigner == xferSigner);
}

function ValidDestination(payment: BrokerCAD.CertifiedBillPayment) {
	return NormalizeAddress(payment.transfer.to) == NormalizeAddress(status.address);
}

export function GetPayee(user: string, payeeName: string) {
	const userDoc = GetUserDoc(user);
	return userDoc.collection("Payees").doc(payeeName);
}
async function StoreNamedPayee(user: string, payee: BrokerCAD.EncryptedPacket)
{
	if (!payee.name)
		return;

	const payeeDoc = GetPayee(user, payee.name);
	const res = payeeDoc.update({
		payee: payee.encryptedPacket,
		version: payee.version
	})

	console.log("Upserted encrypted payee: " + res);
}

// Billpayment works by:
//  User Creates Billpayment which is just VeriXFer 
//	User adds bill payment
export async function ProcessBillPayment(payment: BrokerCAD.CertifiedBillPayment)
{
	// First, check that bill payment & the transfer are signed by the same person
	if (!ValidSignatures(payment))
		throw new Error("Mismatching Signatures");

	// verify that the transfer recipient is the Broker CAD
	if (!ValidDestination(payment))
		throw new Error("Invalid Destination");

	// Do the CertTransfer, this should transfer Coin to our account
	const res = await ProcessCertifiedAction(payment, "Bill");

	if (res.hash)
	{
		// If the user has named this bill payment, store that info in here.
		const user = GetBillPaymentSigner(payment);
		await StoreNamedPayee(user, payment.encryptedPayee);
	}
	return res;
}