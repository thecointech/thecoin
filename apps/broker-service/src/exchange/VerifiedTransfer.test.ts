import { BuildVerifiedXfer } from "@thecointech/utilities/VerifiedTransfer";
import { LocalTimeSource } from "@thecointech/utilities/TimeSource";
import { certifiedTransfer } from "./VerifiedTransfer";
import { Wallet } from "ethers";
import { init } from '@thecointech/firestore';
import { current } from '../status';

beforeEach(async () => {
  init({});
});

test("Transfer checks balance", async () => {
	const wallet = Wallet.createRandom();
  const status = await current();
	const certTransfer = await BuildVerifiedXfer(wallet, status.BrokerCAD, 10000000000, status.certifiedFee, LocalTimeSource);
	await expect(certifiedTransfer(certTransfer)).rejects.toThrow("Transfer validation failed");
})

test("Transfer completes properly", async () => {

  const wallet = Wallet.createRandom();
  const status = await current();
  const certTransfer = await BuildVerifiedXfer(wallet, status.BrokerCAD, 100, status.certifiedFee, LocalTimeSource);
  const hash = await certifiedTransfer(certTransfer);

  expect(hash).toBeTruthy();
})
