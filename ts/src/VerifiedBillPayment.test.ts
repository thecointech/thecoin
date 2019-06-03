import { GetContract } from "./TheContract";
import { Wallet } from "ethers";
import { BuildVerifiedBillPayment, GetBillPaymentSigner } from "./VerifiedBillPayment";
import { BrokerCAD } from "@the-coin/types/lib/brokerCAD";

const wallet = Wallet.createRandom();
const value = 100000;
const fee = 2000;
const contract = GetContract();

// Helper to verify that the transfer is avlid
async function VerifyTransfer(xfer: BrokerCAD.CertifiedTransferRequest)
{
	var xferSigner = await contract.recoverSigner(xfer.from, xfer.to, xfer.value, xfer.fee, xfer.timestamp, xfer.signature);
	expect(xferSigner).toMatch(wallet.address);
}

test('Can build full verified billpayment', async () => {

	const payee : BrokerCAD.BillPayeePacket = {
		payee: "TD Visa or some such",
		accountNumber: "123456789123456789",
		name: "My Visa"
	};

	const sale = await BuildVerifiedBillPayment(payee, wallet, wallet.address, value, fee);
	VerifyTransfer(sale.transfer);

	// verify that our email signature is valid
	const signer = GetBillPaymentSigner(sale);
	expect(signer).toMatch(wallet.address);
})

test('Can build partial verified billpayment', async () => {
	const payee : BrokerCAD.BillPayeePacket = {
		name: "My Visa"
	};

	const sale = await BuildVerifiedBillPayment(payee, wallet, wallet.address, value, fee);
	VerifyTransfer(sale.transfer);

	// verify that our email signature is valid
	const signer = GetBillPaymentSigner(sale);
	expect(signer).toMatch(wallet.address);
})


test('Passes if missing name', async () => {

	const invalidPayee : BrokerCAD.BillPayeePacket = {
		payee: "TD Visa or some such",
		accountNumber: "123456789123456789",
		name: ""
	};

	const sale = await BuildVerifiedBillPayment(invalidPayee, wallet, wallet.address, value, fee);
	// verify that our email signature is valid
	const signer = GetBillPaymentSigner(sale);
	expect(signer).toMatch(wallet.address);
})

test('Fails if missing name & other', async () => {

	const invalidPayee : BrokerCAD.BillPayeePacket = {
		payee: "TD Visa or some such",
		name: ""
	};

	const fn = async () => await BuildVerifiedBillPayment(invalidPayee, wallet, wallet.address, value, fee);
	expect(fn()).rejects.toEqual(new Error("Invalid data supplied to GetHash"))
})