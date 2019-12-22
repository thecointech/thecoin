import { GetWallet } from "./Wallet";
import { GetContract } from "@the-coin/utilities/lib/TheContract";
import { BuildVerifiedXfer } from "@the-coin/utilities/lib/VerifiedTransfer";
import { DoCertifiedTransferWaitable } from "./VerifiedTransfer";
import { Wallet } from "ethers";
import status from './Status';

import * as firestore from './Firestore'
import { IsDebug } from "@the-coin/utilities/lib/IsDebug";

beforeAll(async () => {
  firestore.init();
});

test("Transfer checks balance", async () => {
  jest.setTimeout(180000);
	const wallet = Wallet.createRandom();
	const certTransfer = await BuildVerifiedXfer(wallet, wallet.address, 100, status.certifiedFee);
	await expect(DoCertifiedTransferWaitable(certTransfer)).rejects.toThrow("Insufficient funds");
})


test("Transfer checks fee", async () => {
	const wallet = Wallet.createRandom();
	const certTransfer = await BuildVerifiedXfer(wallet, wallet.address, 100, 0);
	await expect(DoCertifiedTransferWaitable(certTransfer)).rejects.toThrow("Invalid fee present");
})


test("Transfer completes sale properly", async () => {
	if (!IsDebug) // Running locally only
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
	const tx = await DoCertifiedTransferWaitable(certTransfer);

	expect(tx.hash).toBeTruthy();

	// Wait on hash to check it successfully xfer'ed
	const response = await tc.provider.getTransaction(tx.hash!);
	const receipt = await response.wait();
	
	expect(receipt).toBeTruthy();

	//await awaiter;
	console.log("finished");
})