import { GetWallet } from "./Wallet";
import { ServerStatus } from "./VerifiedSale";
import { GetContract } from "@the-coin/utilities/lib/TheContract";
import { BuildVerifiedXfer } from "@the-coin/utilities/lib/VerifiedTransfer";
import { DoCertifiedTransfer } from "./VerifiedTransfer";

const host = process.env.DATASTORE_EMULATOR_HOST;
const RunningLocal = host == "localhost:8081"

test("Transfer completes sale properly", async () => {
	if (!RunningLocal)
		return;
	
	jest.setTimeout(30000);

	const wallet = await GetWallet();
	expect(wallet).toBeDefined();

	// TODO!  Create a testing account to handle this stuff!
	const status = ServerStatus();
	const tc = await GetContract();
	const myBalance = await tc.balanceOf(wallet.address)
	expect(myBalance.toNumber()).toBeGreaterThan(0);

	const fee = status.certifiedFee;
	const transfer = 100;
	const certTransfer = await BuildVerifiedXfer(wallet, wallet.address, transfer, fee);
	const tx = await DoCertifiedTransfer(certTransfer);

	expect(tx.txHash).toBeTruthy();
	expect(tx.message).toBe("Success");

	// TODO, Wait on hash to check it successfully xfer'ed
})