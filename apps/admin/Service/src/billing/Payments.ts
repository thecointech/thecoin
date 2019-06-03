
import { BrokerCAD } from '@the-coin/types'
import fs from 'fs';
import { GetBillPaymentSigner } from '@the-coin/utilities/lib/VerifiedBillPayment'
import { GetTransferSigner } from '@the-coin/utilities/lib/VerifiedTransfer'
import { datastore } from '../exchange/Datastore'

const PublicCertFile = "rsa_2048_pub.pem";
const publicCert = fs.readFileSync(PublicCertFile).toString();
//
// Billpayment works by:
//  User Creates Billpayment which is just VeriXFer 
//	User adds bill payment
export async function ProcessBillPayment(payment: BrokerCAD.CertifiedBillPayment)
{
	// First, check that bill payment & the transfer are signed by the same person
	const paymentSigner = GetBillPaymentSigner(payment);
	const xferSigner = GetTransferSigner(payment.transfer);
	if (paymentSigner != xferSigner)
		throw "Mismatching Signatures";

	// verify that the transfer recipient is the Broker CAD
	if (!ValidDestination(transfer))
				return failure("Invalid Destination");
				
	// Do the CertTransfer, this should transfer Coin to our account
	const res = await DoCertifiedTransferWaitable(transfer);
	// If we have no hash, it's probably an error message
	if (!res.hash)
		throw "Transfer Failed";

	// The request appears valid, or at least it matches the request.  
	// We don't/can't know if the payment request is valid,
	// so we just write it all to the database, assume back-end can figure it out
	
	// Next, create an initial record of the transaction
	const saleKey = await StoreRequest(payment, res.hash);
	datastore.
}