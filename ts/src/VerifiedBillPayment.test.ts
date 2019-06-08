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
	const name = "My Visa";
	const payee : BrokerCAD.BillPayeePacket = {
		payee: "TD Visa or some such",
		accountNumber: "123456789123456789",
	};

	const sale = await BuildVerifiedBillPayment(payee, name, wallet, wallet.address, value, fee);
	VerifyTransfer(sale.transfer);

	// verify that our email signature is valid
	const signer = GetBillPaymentSigner(sale);
	expect(signer).toMatch(wallet.address);
})

test('Can build partial verified billpayment', async () => {
	const name = "My Visa"
	const payee : BrokerCAD.BillPayeePacket = {
	};

	const sale = await BuildVerifiedBillPayment(payee, name, wallet, wallet.address, value, fee);
	VerifyTransfer(sale.transfer);

	// verify that our email signature is valid
	const signer = GetBillPaymentSigner(sale);
	expect(signer).toMatch(wallet.address);
})


test('Passes if missing name', async () => {

	const invalidPayee : BrokerCAD.BillPayeePacket = {
		payee: "TD Visa or some such",
		accountNumber: "123456789123456789",
	};

	const sale = await BuildVerifiedBillPayment(invalidPayee, "", wallet, wallet.address, value, fee);
	// verify that our email signature is valid
	const signer = GetBillPaymentSigner(sale);
	expect(signer).toMatch(wallet.address);
})

test('Fails if missing name & other', async () => {

	const invalidPayee : BrokerCAD.BillPayeePacket = {
		payee: "TD Visa or some such",
	};

	const fn = async () => await BuildVerifiedBillPayment(invalidPayee, "", wallet, wallet.address, value, fee);
	expect(fn()).rejects.toEqual(new Error("Invalid data supplied to GetHash"))
})

test('Fails if XOR accountName/payee', async () => {
	const name = "something";
	const missingAccountNumber : BrokerCAD.BillPayeePacket = {
		payee: "TD Visa or some such",
	};

	const fn1 = async () => await BuildVerifiedBillPayment(missingAccountNumber, name, wallet, wallet.address, value, fee);
	expect(fn1()).rejects.toEqual(new Error("Invalid data supplied to GetHash"))

	const missingPayee : BrokerCAD.BillPayeePacket = {
		accountNumber: "123456789123456789"
	};

	const fn2 = async () => await BuildVerifiedBillPayment(missingPayee, name, wallet, wallet.address, value, fee);
	expect(fn2()).rejects.toEqual(new Error("Invalid data supplied to GetHash"))
})