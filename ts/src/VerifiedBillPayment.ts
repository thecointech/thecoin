import { BuildVerifiedXfer } from "./VerifiedTransfer";
import { BrokerCAD } from "@the-coin/types/lib/brokerCAD";
import { ethers, Wallet } from "ethers";

function GetHash(payee: BrokerCAD.BillPayeePacket, transfer: BrokerCAD.CertifiedTransferRequest) {
	// First, verify that we have either no optional or all optional values
	if ((payee.accountNumber && payee.payee))
	{
		// If all data is included...
		return ethers.utils.solidityKeccak256(
			["string", "string", "string", "string"],
			[transfer.signature, payee.payee, payee.accountNumber, payee.name]
		);
	}
	if (payee.name && !(payee.accountNumber || payee.payee)) {
		// Name is included, but neither account # or payee
		return ethers.utils.solidityKeccak256(
			["string", "string"],
			[transfer.signature, payee.name]
		);
	}

	return "";
	// We have bad data
	//throw "Invalid data supplied to GetHash";
}

export async function BuildVerifiedBillPayment(payee: BrokerCAD.BillPayeePacket, from: Wallet, to: string, value: number, fee: number) {

	const xfer = await BuildVerifiedXfer(from, to, value, fee);
	const billHash = GetHash(payee, xfer);
	const billSig = await from.signMessage(billHash);

	const r: BrokerCAD.CertifiedBillPayment = {
		transfer: xfer,
		payee: payee,
		signature: billSig
	}
	return r;
}

export function GetBillPaymentSigner(sale: BrokerCAD.CertifiedBillPayment) {
	const { transfer, payee, signature } = sale;
	const hash = GetHash(payee, transfer);
	return ethers.utils.verifyMessage(hash, signature);
}
