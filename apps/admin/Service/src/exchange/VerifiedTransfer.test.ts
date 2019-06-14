import { GetWallet } from "./Wallet";
import { GetContract } from "@the-coin/utilities/lib/TheContract";
import { BuildVerifiedXfer } from "@the-coin/utilities/lib/VerifiedTransfer";
import { DoCertifiedTransfer } from "./VerifiedTransfer";
import { Wallet } from "ethers";
import status from './Status';

const host = process.env.DATASTORE_EMULATOR_HOST;
const RunningLocal = host == "localhost:8081"

test("Transfer checks balance", async () => {
	const wallet = Wallet.createRandom();
	const certTransfer = await BuildVerifiedXfer(wallet, wallet.address, 100, status.certifiedFee);
	await expect(DoCertifiedTransfer(certTransfer)).rejects.toThrow("Insufficient funds");
})


test("Transfer checks fee", async () => {
	const wallet = Wallet.createRandom();
	const certTransfer = await BuildVerifiedXfer(wallet, wallet.address, 100, 0);
	await expect(DoCertifiedTransfer(certTransfer)).rejects.toThrow("Invalid fee present");
})


test("Transfer completes sale properly", async () => {
	if (!RunningLocal)
		return;
	
	jest.setTimeout(180000);

	const wallet = await GetWallet();
	const tc = await GetContract();
	expect(wallet).toBeDefined();

	// TODO!  Create a testing account to handle this stuff!
	const myBalance = await tc.balanceOf(wallet.address)
	expect(myBalance.toNumber()).toBeGreaterThan(0);

	const transfer = 100;
	const certTransfer = await BuildVerifiedXfer(wallet, wallet.address, transfer, status.certifiedFee);
	const tx = await DoCertifiedTransfer(certTransfer);

	expect(tx.txHash).toBeTruthy();
	expect(tx.message).toBe("Success");

	// Wait on hash to check it successfully xfer'ed
	const response = await tc.provider.getTransaction(tx.txHash);
	const receipt = await response.wait();
	
	expect(receipt).toBeTruthy();

	//await awaiter;
	console.log("finished");
})