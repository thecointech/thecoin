
import { CertifiedTransfer } from '../types'
import { CertifiedActionProcess } from './CertifiedActionProcess';
import { CertifiedActionVerify } from './CertifiedActionVerify';

// type PayeeDocument = {
// 	payee: string,	// encrypted JSON doc
// 	version: string // version payee was encrypted with
// }

// function ValidSignatures(payment: CertifiedTransfer) {
// 	const paymentSigner = GetSigner(payment);
// 	const xferSigner = GetTransferSigner(payment.transfer);
// 	return (paymentSigner == xferSigner);
// }

// function ValidDestination(payment: CertifiedTransfer) {
// 	return NormalizeAddress(payment.transfer.to) == NormalizeAddress(status.address);
// }

// async function GetPayeeDoc(user: string, payeeName: string) {
// 	const userDoc = await GetUserDoc(user);
// 	return userDoc.collection("Payees").doc(payeeName);
// }

// TODO: Get/Set named payee's will be moved to a separate process
// and not made part of the actual bill payment.  This will be done
// so the payee name can be encrypted by the client, and also so
// we do not have any way to tell if the bill being paid is a named
// bill or not (or what it is named).

// async function StoreNamedPayee(user: string, payee: EncryptedPacket)
// {
// 	if (!payee.name)
// 		return;

// 	const data: PayeeDocument = {
// 		payee: payee.encryptedPacket,
// 		version: payee.version
// 	}
// 	const payeeDoc = await GetPayeeDoc(user, payee.name);
// 	await payeeDoc.set(data);
// 	console.log(`${user} Set encrypted payee ${payee.name}`);
// }

// async function GetNamedPayee(user: string, payeeName: string)
// {
// 	const payeeDoc = await GetPayeeDoc(user, payeeName);
// 	const payee = await payeeDoc.get();
// 	return payee.exists ?
// 		payee.data() as PayeeDocument :
// 		null
// }

// Billpayment works by:
//  User Creates Billpayment which is just VeriXFer
//	User adds bill payment
export async function ProcessBillPayment(payment: CertifiedTransfer)
{
  // First, check that bill payment & the transfer are signed by the same person
  CertifiedActionVerify(payment);

	// Do the CertTransfer, this should transfer Coin to our account
	const res = await CertifiedActionProcess(payment, "Bill");

	return res;
}
