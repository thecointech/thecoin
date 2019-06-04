
import { BrokerCAD } from '@the-coin/types'
import { GetBillPaymentSigner } from '@the-coin/utilities/lib/VerifiedBillPayment'
import { GetTransferSigner } from '@the-coin/utilities/lib/VerifiedTransfer'
import status from './status.json';
import { ProcessCertifiedAction } from './VerifiedProcess';
import { NormalizeAddress } from '@the-coin/utilities';

function ValidSignatures(payment: BrokerCAD.CertifiedBillPayment) {
	const paymentSigner = GetBillPaymentSigner(payment);
	const xferSigner = GetTransferSigner(payment.transfer);
	return (paymentSigner != xferSigner);
}

function ValidDestination(payment: BrokerCAD.CertifiedBillPayment) {
	return NormalizeAddress(payment.transfer.to) == NormalizeAddress(status.address);
}


// Billpayment works by:
//  User Creates Billpayment which is just VeriXFer 
//	User adds bill payment
export async function ProcessBillPayment(payment: BrokerCAD.CertifiedBillPayment)
{
	// First, check that bill payment & the transfer are signed by the same person
	if (!ValidSignatures(payment))
		throw "Mismatching Signatures";

	// verify that the transfer recipient is the Broker CAD
	if (!ValidDestination(payment))
		throw "Invalid Destination";
				
	// Do the CertTransfer, this should transfer Coin to our account
	return await ProcessCertifiedAction(payment, "Bill");
}